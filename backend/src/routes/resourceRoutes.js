import express from 'express';
import { getResources, matchResource, updateResourceStatus } from '../controllers/resourceController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getResources);
router.post('/match', matchResource);
router.patch('/:id', updateResourceStatus);

export default router;
