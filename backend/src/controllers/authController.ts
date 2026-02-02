import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { User } from '../models/User';
import { generateTokens } from '../middleware/auth';

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: 'teacher' | 'student';
}

interface LoginRequest {
  email: string;
  password: string;
}

/**
 * User Registration Controller
 * Handles new user account creation with validation
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, role }: RegisterRequest = req.body;

    // Validate required fields (but allow empty strings to be caught by specific validators)
    if (email === undefined || password === undefined || name === undefined || role === undefined ||
        email === null || password === null || name === null || role === null) {
      res.status(400).json({
        error: 'Missing required fields',
        message: 'Email, password, name, and role are required'
      });
      return;
    }

    // Validate email format (basic validation) - this will catch empty strings
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      res.status(400).json({
        error: 'Invalid email format',
        message: 'Please provide a valid email address'
      });
      return;
    }

    // Validate password strength - this will catch empty strings
    if (!password || password.trim().length < 8) {
      res.status(400).json({
        error: 'Weak password',
        message: 'Password must be at least 8 characters long'
      });
      return;
    }

    // Validate name - this will catch empty strings
    if (!name || name.trim().length < 2) {
      res.status(400).json({
        error: 'Invalid name',
        message: 'Name must be at least 2 characters long'
      });
      return;
    }

    // Validate role
    if (!['teacher', 'student'].includes(role)) {
      res.status(400).json({
        error: 'Invalid role',
        message: 'Role must be either "teacher" or "student"'
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (existingUser) {
      res.status(409).json({
        error: 'User already exists',
        message: 'An account with this email address already exists'
      });
      return;
    }

    // Hash password
    const saltRounds = parseInt(process.env['BCRYPT_ROUNDS'] || '12');
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await User.create({
      email: email.toLowerCase().trim(),
      password_hash: passwordHash,
      name: name.trim(),
      role
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Return success response (exclude password hash)
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        bio: user.bio,
        institution: user.institution,
        major: user.major,
        year: user.year,
        created_at: user.created_at
      },
      tokens: {
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: 'An error occurred during user registration'
    });
  }
};

/**
 * User Login Controller
 * Handles user authentication and token generation
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginRequest = req.body;

    // Validate required fields
    if (!email || !password) {
      res.status(400).json({
        error: 'Missing credentials',
        message: 'Email and password are required'
      });
      return;
    }

    // Find user by email
    const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      res.status(401).json({
        error: 'Invalid credentials',
        message: 'Invalid email or password'
      });
      return;
    }

    // Check if user has password hash (legacy users)
    if (!user.password_hash) {
      res.status(400).json({
        error: 'Migration required',
        message: 'This account needs to be migrated to Firebase authentication'
      });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      res.status(401).json({
        error: 'Invalid credentials',
        message: 'Invalid email or password'
      });
      return;
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Return success response (exclude password hash)
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        bio: user.bio,
        institution: user.institution,
        major: user.major,
        year: user.year,
        created_at: user.created_at
      },
      tokens: {
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: 'An error occurred during login'
    });
  }
};

/**
 * Token Refresh Controller
 * Handles access token refresh using refresh tokens
 */
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      res.status(400).json({
        error: 'Missing refresh token',
        message: 'Refresh token is required'
      });
      return;
    }

    // Import validateRefreshToken here to avoid circular dependency
    const { validateRefreshToken } = await import('../middleware/auth');
    const result = await validateRefreshToken(token);

    if (!result) {
      res.status(401).json({
        error: 'Invalid refresh token',
        message: 'The provided refresh token is invalid or expired'
      });
      return;
    }

    res.status(200).json({
      message: 'Token refreshed successfully',
      tokens: {
        accessToken: result.accessToken
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      error: 'Token refresh failed',
      message: 'An error occurred during token refresh'
    });
  }
};

/**
 * User Profile Controller
 * Returns current user information (requires authentication)
 */
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'Please authenticate to access your profile'
      });
      return;
    }

    res.status(200).json({
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role,
        bio: req.user.bio,
        institution: req.user.institution,
        major: req.user.major,
        year: req.user.year,
        created_at: req.user.created_at
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Profile retrieval failed',
      message: 'An error occurred while retrieving your profile'
    });
  }
};

/**
 * Update User Profile Controller
 * Updates user profile information (requires authentication)
 */
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'Please authenticate to update your profile'
      });
      return;
    }

    const { name, bio, institution, major, year } = req.body;

    // Validate name if provided
    if (name !== undefined && (!name || name.trim().length < 2)) {
      res.status(400).json({
        error: 'Invalid name',
        message: 'Name must be at least 2 characters long'
      });
      return;
    }

    // Update user profile
    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (bio !== undefined) updateData.bio = bio.trim();
    if (institution !== undefined) updateData.institution = institution.trim();
    if (major !== undefined) updateData.major = major.trim();
    if (year !== undefined) updateData.year = year.trim();

    await User.update(updateData, {
      where: { id: req.user.id }
    });

    // Get updated user
    const updatedUser = await User.findByPk(req.user.id);

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser!.id,
        email: updatedUser!.email,
        name: updatedUser!.name,
        role: updatedUser!.role,
        bio: updatedUser!.bio,
        institution: updatedUser!.institution,
        major: updatedUser!.major,
        year: updatedUser!.year,
        created_at: updatedUser!.created_at
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Profile update failed',
      message: 'An error occurred while updating your profile'
    });
  }
};

/**
 * Change Password Controller
 * Changes user password (requires authentication and current password)
 */
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'Please authenticate to change your password'
      });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    // Validate required fields
    if (!currentPassword || !newPassword) {
      res.status(400).json({
        error: 'Missing required fields',
        message: 'Current password and new password are required'
      });
      return;
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      res.status(400).json({
        error: 'Weak password',
        message: 'New password must be at least 8 characters long'
      });
      return;
    }

    // Get user with password hash
    const user = await User.findByPk(req.user.id);
    if (!user) {
      res.status(404).json({
        error: 'User not found',
        message: 'User account not found'
      });
      return;
    }

    // Check if user has password hash (legacy users)
    if (!user.password_hash) {
      res.status(400).json({
        error: 'Migration required',
        message: 'This account uses Firebase authentication and cannot change password here'
      });
      return;
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isCurrentPasswordValid) {
      res.status(401).json({
        error: 'Invalid current password',
        message: 'The current password you entered is incorrect'
      });
      return;
    }

    // Hash new password
    const saltRounds = parseInt(process.env['BCRYPT_ROUNDS'] || '12');
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await user.update({ password_hash: newPasswordHash });

    res.status(200).json({
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      error: 'Password change failed',
      message: 'An error occurred while changing your password'
    });
  }
};
export const logout = async (_req: Request, res: Response): Promise<void> => {
  try {
    // In a JWT-based system, logout is primarily handled client-side by removing tokens
    // This endpoint serves as a confirmation and could be extended to maintain a token blacklist
    res.status(200).json({
      message: 'Logout successful',
      instructions: 'Please remove tokens from client storage'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout failed',
      message: 'An error occurred during logout'
    });
  }
};