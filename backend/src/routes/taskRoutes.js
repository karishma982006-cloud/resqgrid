import express from 'express';
import {
  getDepartmentTasks,
  getDepartmentPriorityQueue,
  getTaskById,
  acceptTask,
  startTask,
  updateTaskProgress,
  completeTask,
  rejectTask
} from '../controllers/taskController.js';
import { reassignTask } from '../controllers/reassignmentController.js';
import { manualEscalateTask } from '../controllers/escalationController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getDepartmentTasks);
router.get('/queue', getDepartmentPriorityQueue);
router.get('/:id', getTaskById);
router.post('/:id/accept', acceptTask);
router.post('/:id/start', startTask);
router.post('/:id/update', updateTaskProgress);
router.post('/:id/complete', completeTask);
router.post('/:id/reject', rejectTask);
router.post('/:id/reassign', reassignTask);
router.post('/:id/escalate', manualEscalateTask);

export default router;
