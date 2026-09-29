import express from 'express';
import {
  getAdminOverview,
  updatePriorityWeights,
  createDepartment,
  toggleDepartmentActive,
  createResource
} from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('admin', 'command_center'));

router.get('/overview', getAdminOverview);
router.post('/priority-weights', updatePriorityWeights);
router.post('/departments', createDepartment);
router.patch('/departments/:id/toggle', toggleDepartmentActive);
router.post('/resources', createResource);

export default router;
