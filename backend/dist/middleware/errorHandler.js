"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.notFoundHandler = exports.errorHandler = exports.createInternalError = exports.createConflictError = exports.createNotFoundError = exports.createForbiddenError = exports.createAuthError = exports.createValidationError = exports.ApiError = void 0;
const sequelize_1 = require("sequelize");
class ApiError extends Error {
    constructor(statusCode, message, details) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        this.name = 'ApiError';
    }
}
exports.ApiError = ApiError;
const createValidationError = (message, details) => {
    return new ApiError(400, message, details);
};
exports.createValidationError = createValidationError;
const createAuthError = (message = 'Authentication required') => {
    return new ApiError(401, message);
};
exports.createAuthError = createAuthError;
const createForbiddenError = (message = 'Access denied') => {
    return new ApiError(403, message);
};
exports.createForbiddenError = createForbiddenError;
const createNotFoundError = (resource = 'Resource') => {
    return new ApiError(404, `${resource} not found`);
};
exports.createNotFoundError = createNotFoundError;
const createConflictError = (message) => {
    return new ApiError(409, message);
};
exports.createConflictError = createConflictError;
const createInternalError = (message = 'Internal server error') => {
    return new ApiError(500, message);
};
exports.createInternalError = createInternalError;
const formatErrorResponse = (error, req, statusCode = 500, message = 'Internal server error') => {
    return {
        error: error.name || 'Error',
        message,
        details: error.details || undefined,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
        statusCode
    };
};
const errorHandler = (error, req, res, _next) => {
    console.error('Error Handler:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        path: req.originalUrl,
        method: req.method
    });
    if (error instanceof ApiError) {
        const errorResponse = formatErrorResponse(error, req, error.statusCode, error.message);
        res.status(error.statusCode).json(errorResponse);
        return;
    }
    if (error instanceof sequelize_1.ValidationError) {
        const validationDetails = error.errors.map(err => ({
            field: err.path,
            message: err.message,
            value: err.value
        }));
        const errorResponse = formatErrorResponse(error, req, 400, 'Validation failed');
        errorResponse.details = validationDetails;
        res.status(400).json(errorResponse);
        return;
    }
    if (error.name === 'JsonWebTokenError') {
        const errorResponse = formatErrorResponse(error, req, 401, 'Invalid authentication token');
        res.status(401).json(errorResponse);
        return;
    }
    if (error.name === 'TokenExpiredError') {
        const errorResponse = formatErrorResponse(error, req, 401, 'Authentication token has expired');
        res.status(401).json(errorResponse);
        return;
    }
    if (error.name === 'SequelizeUniqueConstraintError') {
        const errorResponse = formatErrorResponse(error, req, 409, 'Resource already exists');
        errorResponse.details = error.errors?.map((err) => ({
            field: err.path,
            message: err.message
        }));
        res.status(409).json(errorResponse);
        return;
    }
    if (error.name === 'SequelizeForeignKeyConstraintError') {
        const errorResponse = formatErrorResponse(error, req, 400, 'Invalid reference to related resource');
        res.status(400).json(errorResponse);
        return;
    }
    if (error.name && error.name.startsWith('Sequelize')) {
        const errorResponse = formatErrorResponse(error, req, 500, 'Database operation failed');
        res.status(500).json(errorResponse);
        return;
    }
    const isDevelopment = process.env['NODE_ENV'] === 'development';
    const errorResponse = formatErrorResponse(error, req, 500, isDevelopment ? error.message : 'Internal server error');
    if (isDevelopment && error.stack) {
        errorResponse.details = { stack: error.stack };
    }
    res.status(500).json(errorResponse);
};
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res) => {
    const errorResponse = {
        error: 'NotFound',
        message: `Route ${req.method} ${req.originalUrl} not found`,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
        statusCode: 404
    };
    res.status(404).json(errorResponse);
};
exports.notFoundHandler = notFoundHandler;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
//# sourceMappingURL=errorHandler.js.map