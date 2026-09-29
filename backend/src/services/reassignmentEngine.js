import { Resource, Task, Escalation, Case } from '../models/index.js';
import { logAudit } from './auditService.js';
import { createNotification } from './notificationService.js';
import { triggerEscalation } from './escalationEngine.js';

export const findAlternativeResources = async (task, currentRejectedResourceId = null) => {
  // Find resources matching capability or department
  const allResources = await Resource.find({});
  
  const candidates = allResources.filter(r => {
    // Avoid the currently rejected resource
    if (currentRejectedResourceId && (r._id === currentRejectedResourceId || r.name === currentRejectedResourceId)) {
      return false;
    }
    // Match department or capability
    const matchDept = r.departmentCode === task.departmentCode;
    const matchCap = task.requiredCapability && r.capabilities && r.capabilities.some(c => 
      c.toLowerCase().includes(task.requiredCapability.toLowerCase()) || 
      task.requiredCapability.toLowerCase().includes(c.toLowerCase())
    );
    return matchDept || matchCap;
  });

  if (candidates.length === 0) {
    return {
      hasMatch: false,
      recommended: null,
      candidates: [],
      reason: 'No teams registered with matching capability.'
    };
  }

  // Score candidates
  const scored = candidates.map(res => {
    let score = 0;
    const reasons = [];

    // 1. Availability check
    if (res.status === 'AVAILABLE') {
      score += 40;
      reasons.push('Resource is currently AVAILABLE');
    } else if (res.status === 'BUSY') {
      score += 10;
      reasons.push('Resource is currently BUSY on another incident');
    } else {
      reasons.push('Resource is OFFLINE or under maintenance');
    }

    // 2. Capability match
    score += 30;
    reasons.push('Verified capability match');

    // 3. Distance / Jurisdiction
    const distanceKm = res.distanceKm || (res.location && res.location.distanceKm) || 5;
    if (distanceKm <= 5) {
      score += 20;
      reasons.push(`Optimal proximity (${distanceKm} km)`);
    } else if (distanceKm <= 15) {
      score += 10;
      reasons.push(`Medium proximity (${distanceKm} km)`);
    } else {
      reasons.push(`Extended travel distance (${distanceKm} km)`);
    }

    // 4. Workload
    const activeTasks = res.activeTaskCount || 0;
    if (activeTasks === 0) {
      score += 10;
      reasons.push('Zero active task backlog');
    } else if (activeTasks < 3) {
      score += 5;
      reasons.push(`Low workload (${activeTasks} active tasks)`);
    } else {
      reasons.push(`High workload (${activeTasks} active tasks)`);
    }

    return {
      resource: res,
      score,
      distanceKm,
      reasons,
      isAvailable: res.status === 'AVAILABLE'
    };
  });

  scored.sort((a, b) => b.score - a.score);

  // Best available candidate
  const bestAvailable = scored.find(s => s.isAvailable);

  if (!bestAvailable) {
    return {
      hasMatch: false,
      recommended: null,
      candidates: scored,
      reason: 'All capable teams are currently BUSY or OFFLINE.'
    };
  }

  return {
    hasMatch: true,
    recommended: bestAvailable.resource,
    candidates: scored,
    matchReasons: bestAvailable.reasons
  };
};

export const handleTaskRejection = async ({
  taskId,
  departmentCode,
  departmentName,
  rejectedBy,
  rejectionReason,
  actorRole = 'department'
}) => {
  const task = await Task.findById(taskId);
  if (!task) throw new Error('Task not found');

  await logAudit({
    caseId: task.caseId,
    taskId: task._id,
    actorName: departmentName || departmentCode,
    actorRole,
    action: 'TASK_REJECTED_CANNOT_HANDLE',
    details: `Department reported cannot handle task. Reason: ${rejectionReason}`
  });

  // Search alternative teams
  const searchResult = await findAlternativeResources(task, task.assignedTeamId);

  if (searchResult.hasMatch && searchResult.recommended) {
    const alternativeTeam = searchResult.recommended;

    // Record handoff in task history
    const handoffEntry = {
      fromTeam: task.assignedTeamName || departmentName,
      toTeam: alternativeTeam.name,
      reason: rejectionReason,
      timestamp: new Date().toISOString(),
      matchReasons: searchResult.matchReasons
    };

    const updatedHandoffs = [...(task.handoffHistory || []), handoffEntry];

    await Task.findByIdAndUpdate(taskId, {
      assignedTeamId: alternativeTeam._id,
      assignedTeamName: alternativeTeam.name,
      status: 'ASSIGNED',
      handoffHistory: updatedHandoffs,
      reassignmentPending: false
    });

    await logAudit({
      caseId: task.caseId,
      taskId: task._id,
      actorName: 'Reassignment Engine',
      actorRole: 'system',
      action: 'TASK_REASSIGNED',
      details: `Reassigned from ${task.assignedTeamName || departmentName} to ${alternativeTeam.name}. Match reasons: ${searchResult.matchReasons.join(', ')}`
    });

    await createNotification({
      departmentCode: alternativeTeam.departmentCode || task.departmentCode,
      role: 'department',
      title: 'Task Reassigned to Your Team',
      message: `Task '${task.title}' has been reassigned to ${alternativeTeam.name}.`,
      caseId: task.caseId,
      taskId: task._id,
      type: 'warning'
    });

    // Notify citizen about reassignment
    const masterCase = await Case.findOne({ caseId: task.caseId });
    if (masterCase && masterCase.userId) {
      await createNotification({
        userId: masterCase.userId,
        role: 'citizen',
        title: `Unit Reassigned: ${task.title}`,
        message: `Task reassigned from ${task.assignedTeamName || departmentName} to ${alternativeTeam.name} (${rejectionReason}).`,
        caseId: task.caseId,
        taskId: task._id,
        type: 'info'
      });
    }

    return {
      reassigned: true,
      alternativeTeam,
      matchReasons: searchResult.matchReasons,
      isGap: false
    };
  } else {
    // RESPONSIBILITY GAP DETECTED!
    await Task.findByIdAndUpdate(taskId, {
      status: 'ESCALATED',
      responsibilityGap: true,
      gapReason: searchResult.reason || 'No capable available resource found'
    });

    await logAudit({
      caseId: task.caseId,
      taskId: task._id,
      actorName: 'Reassignment Engine',
      actorRole: 'system',
      action: 'RESPONSIBILITY_GAP_DETECTED',
      details: `RESPONSIBILITY GAP: ${searchResult.reason}. Initiating automatic escalation.`
    });

    // Automatically trigger Escalation
    const escalation = await triggerEscalation({
      task,
      reason: `Responsibility Gap: Rejected by ${departmentName} (${rejectionReason}). No capable alternative resources available.`,
      escalationLevel: 2 // Escalate directly to District/Command Center
    });

    // Notify citizen about escalation
    const masterCase = await Case.findOne({ caseId: task.caseId });
    if (masterCase && masterCase.userId) {
      await createNotification({
        userId: masterCase.userId,
        role: 'citizen',
        title: `Task Escalated: ${task.title}`,
        message: `Local unit reported operational constraint (${rejectionReason}). Task escalated to Command Center for priority dispatch.`,
        caseId: task.caseId,
        taskId: task._id,
        type: 'warning'
      });
    }

    return {
      reassigned: false,
      isGap: true,
      gapReason: searchResult.reason,
      escalation
    };
  }
};

export default { findAlternativeResources, handleTaskRejection };
