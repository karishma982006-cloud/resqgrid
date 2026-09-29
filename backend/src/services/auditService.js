import { AuditLog } from '../models/index.js';

export const logAudit = async ({
  caseId = null,
  taskId = null,
  actorId = null,
  actorName = 'System',
  actorRole = 'system',
  action,
  details = '',
  metadata = {}
}) => {
  try {
    const timestamp = new Date().toISOString();
    const entry = await AuditLog.create({
      caseId,
      taskId,
      actorId,
      actorName,
      actorRole,
      action,
      details,
      metadata,
      timestamp
    });
    console.log(`[AUDIT] ${new Date(timestamp).toLocaleTimeString()} - [${actorName} (${actorRole})] ${action}: ${details}`);
    return entry;
  } catch (err) {
    console.error('[AUDIT ERROR]', err);
  }
};

export const getCaseAuditLogs = async (caseId) => {
  const query = caseId ? { caseId } : {};
  const logs = await AuditLog.find(query);
  return logs.sort({ timestamp: -1 });
};

export default { logAudit, getCaseAuditLogs };
