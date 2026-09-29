import express from 'express';
import { getAuditLogs, getCaseAudit } from '../controllers/auditController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getAuditLogs);
router.get('/cases/:id', getCaseAudit);
router.get('/case/:id', getCaseAudit);

export default router;
