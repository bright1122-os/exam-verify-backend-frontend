import express from 'express';
import { approveEntry, denyEntry, getExaminerStats, getScanHistory } from '../controllers/examiner.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('examiner', 'admin'));

router.post('/approve', approveEntry);
router.post('/deny', denyEntry);
router.get('/stats', getExaminerStats);
router.get('/history', getScanHistory);

export default router;
