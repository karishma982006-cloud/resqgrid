import express from 'express';
import { createReport, previewAnalysis, getReports, getReportById } from '../controllers/reportController.js';
import { analyzeAndCreateCase } from '../controllers/caseController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.post('/', createReport);
router.post('/preview-analysis', previewAnalysis);
router.get('/', getReports);
router.get('/:id', getReportById);
router.post('/:id/analyze', (req, res, next) => {
  req.body.reportId = req.params.id;
  analyzeAndCreateCase(req, res, next);
});

export default router;
