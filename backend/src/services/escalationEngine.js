import { Escalation, Task } from '../models/index.js';
import { logAudit } from './auditService.js';
import { createNotification } from './notificationService.js';

export const triggerEscalation = async ({
  task,
  reason,
  escalationLevel = 1,
  escalatedBy = 'System Reassignment Engine',
  escalatedByRole = 'system'
}) => {
  const levelNames = {
    1: 'Level 1: Department Coordinator',
    2: 'Level 2: District Coordinator',
    3: 'Level 3: Command Center'
  };

  const levelName = levelNames[escalationLevel] || `Level ${escalationLevel}`;

  const escalation = await Escalation.create({
    caseId: task.caseId,
    taskId: task._id,
    taskTitle: task.title,
    departmentCode: task.departmentCode,
    departmentName: task.departmentName,
    escalationLevel,
    levelName,
    reason,
    status: 'ACTIVE', // 'ACTIVE', 'RESOLVED', 'DISMISSED'
    escalatedBy,
    escalatedByRole,
    createdAt: new Date().toISOString(),
    history: [
      {
        level: escalationLevel,
        action: 'ESCALATION_TRIGGERED',
        actor: escalatedBy,
        reason,
        timestamp: new Date().toISOString()
      }
    ]
  });

  await Task.findByIdAndUpdate(task._id, {
    status: 'ESCALATED',
    escalationId: escalation._id,
    escalationLevel
  });

  await logAudit({
    caseId: task.caseId,
    taskId: task._id,
    actorName: escalatedBy,
    actorRole: escalatedByRole,
    action: 'TASK_ESCALATED',
    details: `Task escalated to ${levelName}. Reason: ${reason}`
  });

  // Notify Command Center
  await createNotification({
    role: 'command_center',
    title: `URGENT: ${levelName} Escalation`,
    message: `Case ${task.caseId} - Task '${task.title}' requires intervention. Reason: ${reason}`,
    caseId: task.caseId,
    taskId: task._id,
    type: 'urgent'
  });

  return escalation;
};

export const resolveEscalation = async ({
  escalationId,
  resolvedBy,
  resolutionNotes,
  newAssignedTeam = null
}) => {
  const escalation = await Escalation.findById(escalationId);
  if (!escalation) throw new Error('Escalation record not found');

  const history = escalation.history || [];
  history.push({
    level: escalation.escalationLevel,
    action: 'ESCALATION_RESOLVED',
    actor: resolvedBy,
    reason: resolutionNotes,
    timestamp: new Date().toISOString()
  });

  await Escalation.findByIdAndUpdate(escalationId, {
    status: 'RESOLVED',
    resolvedBy,
    resolutionNotes,
    resolvedAt: new Date().toISOString(),
    history
  });

  const taskUpdate = {
    status: 'ASSIGNED',
    responsibilityGap: false
  };

  if (newAssignedTeam) {
    taskUpdate.assignedTeamName = newAssignedTeam.name || newAssignedTeam;
    taskUpdate.assignedTeamId = newAssignedTeam._id || null;
  }

  await Task.findByIdAndUpdate(escalation.taskId, taskUpdate);

  await logAudit({
    caseId: escalation.caseId,
    taskId: escalation.taskId,
    actorName: resolvedBy,
    actorRole: 'command_center',
    action: 'ESCALATION_INTERVENTION_RESOLVED',
    details: `Command Center resolved escalation. Notes: ${resolutionNotes}`
  });

  return escalation;
};

export default { triggerEscalation, resolveEscalation };
