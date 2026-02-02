"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commonSchemas = exports.validateParams = exports.validateBody = void 0;
const errorHandler_1 = require("./errorHandler");
const validateBody = (schema) => {
    return (req, _res, next) => {
        try {
            const errors = [];
            const body = req.body || {};
            for (const [fieldName, rules] of Object.entries(schema)) {
                const value = body[fieldName];
                if (rules.required && (value === undefined || value === null)) {
                    errors.push({
                        field: fieldName,
                        message: `${fieldName} is required`
                    });
                    continue;
                }
                if (value === undefined || value === null) {
                    continue;
                }
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
            if (errors.length > 0) {
                throw (0, errorHandler_1.createValidationError)('Request validation failed', errors);
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.validateBody = validateBody;
const validateParams = (schema) => {
    return (req, _res, next) => {
        try {
            const errors = [];
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
                throw (0, errorHandler_1.createValidationError)('Parameter validation failed', errors);
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.validateParams = validateParams;
exports.commonSchemas = {
    uuid: {
        pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    },
    email: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    userRegistration: {
        email: {
            required: true,
            type: 'string',
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            maxLength: 255
        },
        password: {
            required: true,
            type: 'string',
            minLength: 8,
            maxLength: 128
        },
        name: {
            required: true,
            type: 'string',
            minLength: 2,
            maxLength: 255,
            custom: (value) => value.trim().length >= 2 || 'Name must contain at least 2 non-whitespace characters'
        },
        role: {
            required: true,
            type: 'string',
            custom: (value) => ['teacher', 'student'].includes(value) || 'Role must be either teacher or student'
        }
    },
    userLogin: {
        email: {
            required: true,
            type: 'string',
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        },
        password: {
            required: true,
            type: 'string',
            minLength: 1
        }
    },
    classCreation: {
        name: {
            required: true,
            type: 'string',
            minLength: 1,
            maxLength: 255,
            custom: (value) => value.trim().length >= 1 || 'Class name cannot be empty'
        },
        description: {
            required: true,
            type: 'string',
            minLength: 1,
            maxLength: 5000,
            custom: (value) => value.trim().length >= 1 || 'Description cannot be empty'
        }
    },
    assignmentCreation: {
        title: {
            required: true,
            type: 'string',
            minLength: 1,
            maxLength: 255,
            custom: (value) => value.trim().length >= 1 || 'Title cannot be empty'
        },
        description: {
            required: true,
            type: 'string',
            minLength: 1,
            maxLength: 10000,
            custom: (value) => value.trim().length >= 1 || 'Description cannot be empty'
        }
    },
    codeSubmission: {
        code: {
            required: false,
            type: 'string',
            maxLength: 50000
        }
    }
};
//# sourceMappingURL=validation.js.map