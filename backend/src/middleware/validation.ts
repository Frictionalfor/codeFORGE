import { Request, Response, NextFunction } from 'express';
import { createValidationError } from './errorHandler';

// Validation schema interface
export interface ValidationSchema {
  [key: string]: {
    required?: boolean;
    type?: 'string' | 'number' | 'boolean' | 'array' | 'object';
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: RegExp;
    custom?: (_value: any) => boolean | string;
  };
}

// Validate request body against schema
export const validateBody = (schema: ValidationSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const errors: Array<{ field: string; message: string }> = [];
      const body = req.body || {};

      // Check each field in schema
      for (const [fieldName, rules] of Object.entries(schema)) {
        const value = body[fieldName];

        // Check required fields
        if (rules.required && (value === undefined || value === null)) {
          errors.push({
            field: fieldName,
            message: `${fieldName} is required`
          });
          continue;
        }

        // Skip validation if field is not provided and not required
        if (value === undefined || value === null) {
          continue;
        }

        // Type validation
        if (rules.type) {
          const actualType = Array.isArray(value) ? 'array' : typeof value;
          if (actualType !== rules.type) {
            errors.push({
              field: fieldName,
              message: `${fieldName} must be of type ${rules.type}`
            });
            continue;
          }
        }

        // String validations
        if (typeof value === 'string') {
          if (rules.minLength !== undefined && value.length < rules.minLength) {
            errors.push({
              field: fieldName,
              message: `${fieldName} must be at least ${rules.minLength} characters long`
            });
          }

          if (rules.maxLength !== undefined && value.length > rules.maxLength) {
            errors.push({
              field: fieldName,
              message: `${fieldName} must be no more than ${rules.maxLength} characters long`
            });
          }

          if (rules.pattern && !rules.pattern.test(value)) {
            errors.push({
              field: fieldName,
              message: `${fieldName} format is invalid`
            });
          }
        }

        // Number validations
        if (typeof value === 'number') {
          if (rules.min !== undefined && value < rules.min) {
            errors.push({
              field: fieldName,
              message: `${fieldName} must be at least ${rules.min}`
            });
          }

          if (rules.max !== undefined && value > rules.max) {
            errors.push({
              field: fieldName,
              message: `${fieldName} must be no more than ${rules.max}`
            });
          }
        }

        // Custom validation
        if (rules.custom) {
          const customResult = rules.custom(value);
          if (customResult !== true) {
            errors.push({
              field: fieldName,
              message: typeof customResult === 'string' ? customResult : `${fieldName} is invalid`
            });
          }
        }
      }

      // If there are validation errors, throw them
      if (errors.length > 0) {
        throw createValidationError('Request validation failed', errors);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Validate request parameters
export const validateParams = (schema: ValidationSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const errors: Array<{ field: string; message: string }> = [];
      const params = req.params || {};

      for (const [fieldName, rules] of Object.entries(schema)) {
        const value = params[fieldName];

        if (rules.required && !value) {
          errors.push({
            field: fieldName,
            message: `${fieldName} parameter is required`
          });
          continue;
        }

        if (value && rules.pattern && !rules.pattern.test(value)) {
          errors.push({
            field: fieldName,
            message: `${fieldName} parameter format is invalid`
          });
        }
      }

      if (errors.length > 0) {
        throw createValidationError('Parameter validation failed', errors);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Common validation schemas
export const commonSchemas = {
  // UUID validation
  uuid: {
    pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  },

  // Email validation
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },

  // User registration schema
  userRegistration: {
    email: {
      required: true,
      type: 'string' as const,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      maxLength: 255
    },
    password: {
      required: true,
      type: 'string' as const,
      minLength: 8,
      maxLength: 128
    },
    name: {
      required: true,
      type: 'string' as const,
      minLength: 2,
      maxLength: 255,
      custom: (value: string) => value.trim().length >= 2 || 'Name must contain at least 2 non-whitespace characters'
    },
    role: {
      required: true,
      type: 'string' as const,
      custom: (value: string) => ['teacher', 'student'].includes(value) || 'Role must be either teacher or student'
    }
  },

  // User login schema
  userLogin: {
    email: {
      required: true,
      type: 'string' as const,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    password: {
      required: true,
      type: 'string' as const,
      minLength: 1
    }
  },

  // Class creation schema
  classCreation: {
    name: {
      required: true,
      type: 'string' as const,
      minLength: 1,
      maxLength: 255,
      custom: (value: string) => value.trim().length >= 1 || 'Class name cannot be empty'
    },
    description: {
      required: true,
      type: 'string' as const,
      minLength: 1,
      maxLength: 5000,
      custom: (value: string) => value.trim().length >= 1 || 'Description cannot be empty'
    }
  },

  // Assignment creation schema
  assignmentCreation: {
    title: {
      required: true,
      type: 'string' as const,
      minLength: 1,
      maxLength: 255,
      custom: (value: string) => value.trim().length >= 1 || 'Title cannot be empty'
    },
    description: {
      required: true,
      type: 'string' as const,
      minLength: 1,
      maxLength: 10000,
      custom: (value: string) => value.trim().length >= 1 || 'Description cannot be empty'
    }
  },

  // Code submission schema
  codeSubmission: {
    code: {
      required: false, // Code can be empty
      type: 'string' as const,
      maxLength: 50000
    }
  }
};