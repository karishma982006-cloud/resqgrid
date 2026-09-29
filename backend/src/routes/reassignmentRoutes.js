import express from 'express';
import { getReassignmentCandidates, reassignTask } from '../controllers/reassignmentController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/:taskId/candidates', getReassignmentCandidates);
router.post('/:taskId', reassignTask);

export default router;
