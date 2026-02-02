import { Request, Response, NextFunction } from 'express';
import { ValidationError } from 'sequelize';

// Standard error response interface
export interface ErrorResponse {
  error: string;
  message: string;
  details?: any;
  timestamp: string;
  path: string;
  statusCode: number;
}

// Custom error class for API errors
export class ApiError extends Error {
  public statusCode: number;
  public details?: any;

  constructor(statusCode: number, message: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'ApiError';
  }
}

// Validation error helper
export const createValidationError = (message: string, details?: any): ApiError => {
  return new ApiError(400, message, details);
};

// Authorization error helper
export const createAuthError = (message: string = 'Authentication required'): ApiError => {
  return new ApiError(401, message);
};

// Forbidden error helper
export const createForbiddenError = (message: string = 'Access denied'): ApiError => {
  return new ApiError(403, message);
};

// Not found error helper
export const createNotFoundError = (resource: string = 'Resource'): ApiError => {
  return new ApiError(404, `${resource} not found`);
};

// Conflict error helper
export const createConflictError = (message: string): ApiError => {
  return new ApiError(409, message);
};

// Internal server error helper
export const createInternalError = (message: string = 'Internal server error'): ApiError => {
  return new ApiError(500, message);
};

// Format error response
const formatErrorResponse = (
  error: any,
  req: Request,
  statusCode: number = 500,
  message: string = 'Internal server error'
): ErrorResponse => {
  return {
    error: error.name || 'Error',
    message,
    details: error.details || undefined,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    statusCode
  };
};

// Global error handler middleware
export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error Handler:', {
    name: error.name,
    message: error.message,
    stack: error.stack,
    path: req.originalUrl,
    method: req.method
  });

  // Handle ApiError (custom errors)
  if (error instanceof ApiError) {
    const errorResponse = formatErrorResponse(error, req, error.statusCode, error.message);
    res.status(error.statusCode).json(errorResponse);
    return;
  }

  // Handle Sequelize validation errors
  if (error instanceof ValidationError) {
    const validationDetails = error.errors.map(err => ({
      field: err.path,
      message: err.message,
      value: err.value
    }));

    const errorResponse = formatErrorResponse(
      error,
      req,
      400,
      'Validation failed'
    );
    errorResponse.details = validationDetails;

    res.status(400).json(errorResponse);
    return;
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    const errorResponse = formatErrorResponse(
      error,
      req,
      401,
      'Invalid authentication token'
    );
    res.status(401).json(errorResponse);
    return;
  }

  if (error.name === 'TokenExpiredError') {
    const errorResponse = formatErrorResponse(
      error,
      req,
      401,
      'Authentication token has expired'
    );
    res.status(401).json(errorResponse);
    return;
  }

  // Handle Sequelize database errors
  if (error.name === 'SequelizeUniqueConstraintError') {
    const errorResponse = formatErrorResponse(
      error,
      req,
      409,
      'Resource already exists'
    );
    errorResponse.details = error.errors?.map((err: any) => ({
      field: err.path,
      message: err.message
    }));
    res.status(409).json(errorResponse);
    return;
  }

  if (error.name === 'SequelizeForeignKeyConstraintError') {
    const errorResponse = formatErrorResponse(
      error,
      req,
      400,
      'Invalid reference to related resource'
    );
    res.status(400).json(errorResponse);
    return;
  }

  // Handle other Sequelize errors
  if (error.name && error.name.startsWith('Sequelize')) {
    const errorResponse = formatErrorResponse(
      error,
      req,
      500,
      'Database operation failed'
    );
    res.status(500).json(errorResponse);
    return;
  }

  // Handle generic errors
  const isDevelopment = process.env['NODE_ENV'] === 'development';
  const errorResponse = formatErrorResponse(
    error,
    req,
    500,
    isDevelopment ? error.message : 'Internal server error'
  );

  // Only include stack trace in development
  if (isDevelopment && error.stack) {
    errorResponse.details = { stack: error.stack };
  }

  res.status(500).json(errorResponse);
};

// 404 handler for unmatched routes
export const notFoundHandler = (req: Request, res: Response): void => {
  const errorResponse: ErrorResponse = {
    error: 'NotFound',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    statusCode: 404
  };

  res.status(404).json(errorResponse);
};

// Async error wrapper for controllers
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};