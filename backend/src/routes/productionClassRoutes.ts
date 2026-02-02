import { Router } from 'express';
import { requireAuthWithUser } from '../middleware/firebaseAuth';
import {
  createClass,
  getClassByJoinCode,
  joinClassByCode,
  getUserClasses,
  getAvailableClasses,
  regenerateJoinCode,
  getClassSubmissions,
  getClassStudents,
  removeStudentFromClass
} from '../controllers/productionClassController';

const router = Router();

// All routes require Firebase authentication with user profile
router.use(requireAuthWithUser);

// Class management routes
router.post('/', createClass);                           // POST /api/classes - Create class (teachers)
router.get('/', getUserClasses);                         // GET /api/classes - Get user's classes
router.get('/available', getAvailableClasses);           // GET /api/classes/available - Browse classes (students)
router.get('/join/:code', getClassByJoinCode);           // GET /api/classes/join/:code - Get class info by code (students)
router.post('/join', joinClassByCode);                   // POST /api/classes/join - Join class by code (students)
router.post('/:id/regenerate-code', regenerateJoinCode); // POST /api/classes/:id/regenerate-code - Regenerate join code (teachers)

// Submission routes
router.get('/:id/submissions', getClassSubmissions);     // GET /api/classes/:id/submissions - Get class submissions (teachers)

// Student management routes
router.get('/:id/students', getClassStudents);           // GET /api/classes/:id/students - Get class students (teachers)
router.delete('/:classId/students/:studentId', removeStudentFromClass); // DELETE /api/classes/:classId/students/:studentId - Remove student (teachers)

// Assignment routes within classes - REMOVED: Using enhanced assignment routes instead

// Submission routes - REMOVED: Using enhanced assignment routes instead

export default router;