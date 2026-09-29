import express from 'express';
import { analyzeAndCreateCase, getCases, getCaseById, verifyCase, updateRecovery } from '../controllers/caseController.js';
import { authenticate } from '../middleware/auth.js';
import { Problem, Task, Dependency } from '../models/index.js';

const router = express.Router();

router.use(authenticate);

router.post('/analyze', analyzeAndCreateCase);
router.get('/', getCases);
router.get('/:id', getCaseById);
router.post('/:id/verify', verifyCase);
router.post('/:id/recovery', updateRecovery);

router.get('/:id/problems', async (req, res, next) => {
  try {
    const problems = await Problem.find({ caseId: req.params.id });
    res.json({ success: true, count: problems.length, problems });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/dependencies', async (req, res, next) => {
  try {
    const deps = await Dependency.find({ caseId: req.params.id });
    res.json({ success: true, count: deps.length, dependencies: deps });
  } catch (err) {
    next(err);
  }
});

export default router;
