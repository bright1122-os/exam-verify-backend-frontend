import express from 'express';
import {
  getDashboardStats,
  getAllStudents,
  getStudentDetails,
  updateStudentStatus,
  getAllPayments,
  getAllVerifications,
  getAllUsers,
  updateUserRole,
  exportStudentsCSV,
  exportVerificationsCSV,
  exportPaymentsCSV,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require admin role
router.use(protect);
router.use(authorize('admin'));

// Dashboard
router.get('/stats', getDashboardStats);

// Students
router.get('/students', getAllStudents);
router.get('/students/:id', getStudentDetails);
router.put('/students/:id/status', updateStudentStatus);

// Payments
router.get('/payments', getAllPayments);

// Verifications
router.get('/verifications', getAllVerifications);

// Users
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);

// CSV Exports
router.get('/export/students', exportStudentsCSV);
router.get('/export/verifications', exportVerificationsCSV);
router.get('/export/payments', exportPaymentsCSV);

export default router;
