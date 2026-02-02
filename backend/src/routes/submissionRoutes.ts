import { Router } from 'express';
import { requireAuthWithUser } from '../middleware/firebaseAuth';
import { getAllTeacherSubmissions } from '../controllers/productionClassController';

const router = Router();

// All routes require Firebase authentication with user profile
router.use(requireAuthWithUser);

// Get all submissions for a teacher across all their classes
// Note: Role checking is handled within the controller function
router.get('/all', getAllTeacherSubmissions);

export default router;