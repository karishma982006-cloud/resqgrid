import express from 'express';
import { getDisasters, getActiveDisaster, activateDisaster, deactivateDisaster } from '../controllers/disasterController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getDisasters);
router.get('/active', getActiveDisaster);
router.post('/activate', activateDisaster);
router.post('/:id/activate', activateDisaster);
router.post('/:id/close', deactivateDisaster);
router.post('/deactivate', deactivateDisaster);

export default router;
