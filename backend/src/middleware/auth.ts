import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

// Extend Express Request interface to include user
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Request {
      user?: User;
    }
  }
}

interface JWTPayload {
  userId: string;
  email: string;
  role: 'teacher' | 'student';
  iat?: number;
  exp?: number;
}

/**
 * JWT Authentication Middleware
 * Validates JWT tokens and attaches user information to request
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        error: 'Access token required',
        message: 'Please provide a valid authentication token'
      });
      return;
    }

    const jwtSecret = process.env['JWT_SECRET'];
    if (!jwtSecret) {
      console.error('JWT_SECRET environment variable is not set');
      res.status(500).json({
        error: 'Server configuration error',
        message: 'Authentication service is not properly configured'
      });
      return;
    }

    // Verify the token
    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;

    // Find the user in the database
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      res.status(401).json({
        error: 'Invalid token',
        message: 'User associated with token no longer exists'
      });
      return;
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        error: 'Invalid token',
        message: 'The provided token is invalid or malformed'
      });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        error: 'Token expired',
        message: 'The provided token has expired. Please login again'
      });
      return;
    }

    console.error('Authentication middleware error:', error);
    res.status(500).json({
      error: 'Authentication error',
      message: 'An error occurred during authentication'
    });
  }
};

/**
 * Role-based authorization middleware
 * Ensures user has required role to access resource
 */
export const requireRole = (allowedRoles: ('teacher' | 'student')[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'Please authenticate before accessing this resource'
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: 'Insufficient permissions',
        message: `This resource requires one of the following roles: ${allowedRoles.join(', ')}`
      });
      return;
    }

    next();
  };
};

/**
 * Resource ownership validation middleware
 * Ensures user can only access their own resources or resources they have permission to access
 */
export const requireOwnership = (resourceType: 'class' | 'assignment' | 'submission') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Authentication required',
          message: 'Please authenticate before accessing this resource'
        });
        return;
      }

      const resourceId = req.params['id'];
      if (!resourceId) {
        res.status(400).json({
          error: 'Invalid request',
          message: 'Resource ID is required'
        });
        return;
      }

      // Resource ownership validation will be implemented when we create the controllers
      // For now, just pass through - this will be expanded in the controller implementation
      // The resourceType parameter will be used to determine which model to check
      console.log(`Validating ownership for ${resourceType} with ID ${resourceId}`);
      next();
    } catch (error) {
      console.error('Ownership validation error:', error);
      res.status(500).json({
        error: 'Authorization error',
        message: 'An error occurred during authorization'
      });
    }
  };
};

/**
 * JWT Token Generation Utility
 * Creates JWT tokens for authenticated users
 */
export const generateTokens = (user: User): { accessToken: string; refreshToken: string } => {
  const jwtSecret = process.env['JWT_SECRET'];
  const jwtRefreshSecret = process.env['JWT_REFRESH_SECRET'];
  const jwtExpiresIn = process.env['JWT_EXPIRES_IN'] || '24h';
  const jwtRefreshExpiresIn = process.env['JWT_REFRESH_EXPIRES_IN'] || '7d';

  if (!jwtSecret || !jwtRefreshSecret) {
    throw new Error('JWT secrets are not configured');
  }

  const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
    userId: user.id,
    email: user.email,
    role: user.role
  };

  const accessToken = jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn } as jwt.SignOptions);
  const refreshToken = jwt.sign(payload, jwtRefreshSecret, { expiresIn: jwtRefreshExpiresIn } as jwt.SignOptions);

  return { accessToken, refreshToken };
};

/**
 * Refresh Token Validation Utility
 * Validates refresh tokens and generates new access tokens
 */
export const validateRefreshToken = async (refreshToken: string): Promise<{ user: User; accessToken: string } | null> => {
  try {
    const jwtRefreshSecret = process.env['JWT_REFRESH_SECRET'];
    if (!jwtRefreshSecret) {
      throw new Error('JWT refresh secret is not configured');
    }

    const decoded = jwt.verify(refreshToken, jwtRefreshSecret) as JWTPayload;
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return null;
    }

    const { accessToken } = generateTokens(user);
    return { user, accessToken };
  } catch (error) {
    return null;
  }
};