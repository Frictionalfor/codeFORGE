/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from 'express';
import FirebaseAdmin from '../config/firebase';
import { userService } from '../services/userService';

// Extend Request interface to include Firebase user information
declare global {
  namespace Express {
    interface Request {
      firebaseUser?: {
        uid: string;
        email?: string | undefined;
        emailVerified: boolean;
        displayName?: string | undefined;
        role?: 'teacher' | 'student';
        profile?: any;
      } | undefined;
    }
  }
}

class FirebaseAuthMiddleware {
  private firebaseAdmin: FirebaseAdmin;

  constructor() {
    this.firebaseAdmin = FirebaseAdmin.getInstance();
  }

  // Extract token from Authorization header
  private extractToken(req: Request): string | null {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }

  // Verify Firebase token and extract user information
  async verifyToken(req: Request, _res: Response, next: NextFunction): Promise<void> {
    try {
      const token = this.extractToken(req);
      
      if (!token) {
        return next(); // Continue without user info
      }

      const decodedToken = await this.firebaseAdmin.verifyIdToken(token);
      
      // Set basic user information from Firebase token
      req.firebaseUser = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified || false,
        displayName: decodedToken['name'] // Extract displayName from token
      };

      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      // Clear any partial user data
      req.firebaseUser = undefined;
      next(); // Continue without user info
    }
  }

  // Require valid authentication
  async requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = this.extractToken(req);
      
      if (!token) {
        res.status(401).json({
          success: false,
          error: {
            code: 'MISSING_TOKEN',
            message: 'Authentication token is required'
          }
        });
        return;
      }

      const decodedToken = await this.firebaseAdmin.verifyIdToken(token);
      
      // Set user information from Firebase token
      req.firebaseUser = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified || false,
        displayName: decodedToken['name'] // Extract displayName from token
      };

      next();
    } catch (error) {
      console.error('Authentication failed:', error);
      
      // Determine error type and respond appropriately
      if (error instanceof Error) {
        if (error.message.includes('expired')) {
          res.status(401).json({
            success: false,
            error: {
              code: 'TOKEN_EXPIRED',
              message: 'Authentication token has expired'
            }
          });
          return;
        }
        
        if (error.message.includes('invalid')) {
          res.status(401).json({
            success: false,
            error: {
              code: 'INVALID_TOKEN',
              message: 'Invalid authentication token'
            }
          });
          return;
        }
      }

      res.status(401).json({
        success: false,
        error: {
          code: 'AUTHENTICATION_FAILED',
          message: 'Authentication failed'
        }
      });
    }
  }

  // Require valid authentication and set req.user for legacy compatibility
  async requireAuthWithUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = this.extractToken(req);
      
      if (!token) {
        res.status(401).json({
          success: false,
          error: {
            code: 'MISSING_TOKEN',
            message: 'Authentication token is required'
          }
        });
        return;
      }

      const decodedToken = await this.firebaseAdmin.verifyIdToken(token);
      
      // Set user information from Firebase token
      req.firebaseUser = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified || false,
        displayName: decodedToken['name'] // Extract displayName from token
      };

      // Get user profile from database for legacy compatibility
      try {
        const userProfile = await userService.getUserProfile(decodedToken.uid);
        if (userProfile) {
          req.user = userProfile as any; // Cast to any for legacy compatibility
        } else {
          res.status(404).json({
            success: false,
            error: {
              code: 'USER_NOT_FOUND',
              message: 'User profile not found'
            }
          });
          return;
        }
      } catch (dbError) {
        console.error('Failed to fetch user profile:', dbError);
        res.status(500).json({
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to fetch user profile'
          }
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Authentication failed:', error);
      
      // Determine error type and respond appropriately
      if (error instanceof Error) {
        if (error.message.includes('expired')) {
          res.status(401).json({
            success: false,
            error: {
              code: 'TOKEN_EXPIRED',
              message: 'Authentication token has expired'
            }
          });
          return;
        }
        
        if (error.message.includes('invalid')) {
          res.status(401).json({
            success: false,
            error: {
              code: 'INVALID_TOKEN',
              message: 'Invalid authentication token'
            }
          });
          return;
        }
      }

      res.status(401).json({
        success: false,
        error: {
          code: 'AUTHENTICATION_FAILED',
          message: 'Authentication failed'
        }
      });
    }
  }

  // Require specific role
  requireRole(role: string) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      // First ensure user is authenticated
      if (!req.firebaseUser) {
        res.status(401).json({
          success: false,
          error: {
            code: 'AUTHENTICATION_REQUIRED',
            message: 'Authentication is required'
          }
        });
        return;
      }

      // Check if user has the required role
      if (!req.firebaseUser.role) {
        res.status(403).json({
          success: false,
          error: {
            code: 'ROLE_NOT_SET',
            message: 'User role has not been set'
          }
        });
        return;
      }

      if (req.firebaseUser.role !== role) {
        res.status(403).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: `This action requires ${role} role`
          }
        });
        return;
      }

      next();
    };
  }

  // Require email verification
  async requireEmailVerification(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (!req.firebaseUser) {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          message: 'Authentication is required'
        }
      });
      return;
    }

    if (!req.firebaseUser.emailVerified) {
      res.status(403).json({
        success: false,
        error: {
          code: 'EMAIL_NOT_VERIFIED',
          message: 'Email verification is required to access this feature'
        }
      });
      return;
    }

    next();
  }
}

// Create singleton instance
const authMiddleware = new FirebaseAuthMiddleware();

// Export middleware functions
export const verifyToken = authMiddleware.verifyToken.bind(authMiddleware);
export const requireAuth = authMiddleware.requireAuth.bind(authMiddleware);
export const requireAuthWithUser = authMiddleware.requireAuthWithUser.bind(authMiddleware);
export const requireRole = authMiddleware.requireRole.bind(authMiddleware);
export const requireEmailVerification = authMiddleware.requireEmailVerification.bind(authMiddleware);

export default authMiddleware;