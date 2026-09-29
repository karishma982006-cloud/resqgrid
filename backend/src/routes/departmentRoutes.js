import express from 'express';
import { getDepartments, getDepartmentById, updateDepartment } from '../controllers/departmentController.js';
import { getDepartmentTasks } from '../controllers/taskController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getDepartments);
router.get('/:id', getDepartmentById);
router.get('/:id/tasks', (req, res, next) => {
  req.query.departmentCode = req.params.id;
  getDepartmentTasks(req, res, next);
});
router.patch('/:id', updateDepartment);

export default router;
