import { Escalation, Task } from '../models/index.js';
import { triggerEscalation, resolveEscalation } from '../services/escalationEngine.js';

export const getEscalations = async (req, res, next) => {
  try {
    const { status, level } = req.query;
    let query = {};
    if (status && status !== 'ALL') query.status = status;
    if (level && level !== 'ALL') query.escalationLevel = parseInt(level);

    const escalations = await Escalation.find(query);
    escalations.sort({ createdAt: -1 });

    res.json({ success: true, count: escalations.length, escalations });
  } catch (err) {
    next(err);
  }
};

export const manualEscalateTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { reason, escalationLevel = 3 } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const escalation = await triggerEscalation({
      task,
      reason: reason || 'Manual escalation requested due to operational bottleneck',
      escalationLevel: parseInt(escalationLevel),
      escalatedBy: req.user.name,
      escalatedByRole: req.user.role
    });

    res.status(201).json({ success: true, message: 'Task escalated successfully.', escalation });
  } catch (err) {
    next(err);
  }
};

export const resolveEscalationEndpoint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { resolutionNotes, newAssignedTeam } = req.body;

    const escalation = await resolveEscalation({
      escalationId: id,
      resolvedBy: req.user.name,
      resolutionNotes: resolutionNotes || 'Command Center intervention complete. Resource allocated.',
      newAssignedTeam
    });

    res.json({ success: true, message: 'Escalation resolved.', escalation });
  } catch (err) {
    next(err);
  }
};

export default { getEscalations, manualEscalateTask, resolveEscalationEndpoint };
