import { Task, Resource } from '../models/index.js';
import { findAlternativeResources } from '../services/reassignmentEngine.js';
import { logAudit } from '../services/auditService.js';
import { createNotification } from '../services/notificationService.js';

export const getReassignmentCandidates = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const searchResult = await findAlternativeResources(task, task.assignedTeamId);
    res.json({
      success: true,
      task,
      ...searchResult
    });
  } catch (err) {
    next(err);
  }
};

export const reassignTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { targetResourceId, reason } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const resource = await Resource.findById(targetResourceId);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Target resource team not found.' });
    }

    const previousTeam = task.assignedTeamName;
    const handoff = {
      fromTeam: previousTeam,
      toTeam: resource.name,
      reason: reason || 'Manual reassignment by Command Center',
      timestamp: new Date().toISOString()
    };

    const handoffs = [...(task.handoffHistory || []), handoff];

    const updated = await Task.findByIdAndUpdate(taskId, {
      assignedTeamId: resource._id,
      assignedTeamName: resource.name,
      departmentCode: resource.departmentCode || task.departmentCode,
      departmentName: resource.departmentName || task.departmentName,
      status: 'ASSIGNED',
      handoffHistory: handoffs,
      responsibilityGap: false,
      gapReason: null
    });

    await logAudit({
      caseId: task.caseId,
      taskId: task._id,
      actorId: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'TASK_REASSIGNED_MANUAL',
      details: `Reassigned task '${task.title}' from ${previousTeam} to ${resource.name}. Reason: ${reason || 'Command override'}`
    });

    await createNotification({
      departmentCode: resource.departmentCode,
      role: 'department',
      title: 'Task Reassigned to Your Unit',
      message: `Task '${task.title}' has been reassigned to ${resource.name}.`,
      caseId: task.caseId,
      taskId: task._id,
      type: 'warning'
    });

    res.json({ success: true, message: `Task reassigned to ${resource.name}`, task: updated });
  } catch (err) {
    next(err);
  }
};

export default { getReassignmentCandidates, reassignTask };
