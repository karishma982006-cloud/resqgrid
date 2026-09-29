import express from 'express';
import { getEscalations, manualEscalateTask, resolveEscalationEndpoint } from '../controllers/escalationController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getEscalations);
router.post('/task/:taskId', manualEscalateTask);
router.post('/:id/resolve', resolveEscalationEndpoint);

export default router;
