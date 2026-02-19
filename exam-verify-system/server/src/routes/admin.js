import express from 'express';
import { getAdminStats, getStudents, updateStudentStatus, getUsers } from '../controllers/admin.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/students', getStudents);
router.put('/students/:id/status', updateStudentStatus);
router.get('/users', getUsers);

export default router;
