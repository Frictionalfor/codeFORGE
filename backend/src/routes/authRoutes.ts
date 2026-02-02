import { Router } from 'express';
import { register, login, refreshToken, getProfile, logout, updateProfile, changePassword } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * Authentication Routes
 * Handles user registration, login, token management, and profile access
 */

// Public routes (no authentication required)
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);

// Protected routes (authentication required)
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.post('/change-password', authenticateToken, changePassword);
router.post('/logout', authenticateToken, logout);

export default router;