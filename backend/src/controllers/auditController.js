import { AuditLog } from '../models/index.js';

export const getAuditLogs = async (req, res, next) => {
  try {
    const { caseId, taskId, actorRole, action, limit = 100 } = req.query;
    let query = {};
    if (caseId) query.caseId = caseId;
    if (taskId) query.taskId = taskId;
    if (actorRole && actorRole !== 'ALL') query.actorRole = actorRole;
    if (action) query.action = action;

    const logs = await AuditLog.find(query);
    logs.sort({ timestamp: -1 });

    const sliced = logs.slice(0, parseInt(limit));
    res.json({ success: true, count: sliced.length, total: logs.length, logs: sliced });
  } catch (err) {
    next(err);
  }
};

export const getCaseAudit = async (req, res, next) => {
  try {
    const { id } = req.params;
    const logs = await AuditLog.find({ caseId: id });
    logs.sort({ timestamp: -1 });
    res.json({ success: true, count: logs.length, logs });
  } catch (err) {
    next(err);
  }
};

export default { getAuditLogs, getCaseAudit };
