import { Router } from 'express';
import { getDashboardStats, getRecentActivity, getStudentAssignmentStatus } from '../controllers/dashboardController';
import { requireAuth } from '../middleware/firebaseAuth';

const router = Router();

/**
 * Dashboard Routes
 * Handles dashboard statistics and activity feeds
 */

// All dashboard routes require Firebase authentication
router.use(requireAuth);

// Get dashboard statistics
router.get('/stats', getDashboardStats);

// Get detailed assignment status for students
router.get('/assignment-status', getStudentAssignmentStatus);

// Get recent activity
router.get('/activity', getRecentActivity);

export default router;