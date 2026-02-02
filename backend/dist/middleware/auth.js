"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRefreshToken = exports.generateTokens = exports.requireOwnership = exports.requireRole = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
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
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        const user = await User_1.User.findByPk(decoded.userId);
        if (!user) {
            res.status(401).json({
                error: 'Invalid token',
                message: 'User associated with token no longer exists'
            });
            return;
        }
        req.user = user;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res.status(401).json({
                error: 'Invalid token',
                message: 'The provided token is invalid or malformed'
            });
            return;
        }
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
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
exports.authenticateToken = authenticateToken;
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
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
exports.requireRole = requireRole;
const requireOwnership = (resourceType) => {
    return async (req, res, next) => {
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
            console.log(`Validating ownership for ${resourceType} with ID ${resourceId}`);
            next();
        }
        catch (error) {
            console.error('Ownership validation error:', error);
            res.status(500).json({
                error: 'Authorization error',
                message: 'An error occurred during authorization'
            });
        }
    };
};
exports.requireOwnership = requireOwnership;
const generateTokens = (user) => {
    const jwtSecret = process.env['JWT_SECRET'];
    const jwtRefreshSecret = process.env['JWT_REFRESH_SECRET'];
    const jwtExpiresIn = process.env['JWT_EXPIRES_IN'] || '24h';
    const jwtRefreshExpiresIn = process.env['JWT_REFRESH_EXPIRES_IN'] || '7d';
    if (!jwtSecret || !jwtRefreshSecret) {
        throw new Error('JWT secrets are not configured');
    }
    const payload = {
        userId: user.id,
        email: user.email,
        role: user.role
    };
    const accessToken = jsonwebtoken_1.default.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });
    const refreshToken = jsonwebtoken_1.default.sign(payload, jwtRefreshSecret, { expiresIn: jwtRefreshExpiresIn });
    return { accessToken, refreshToken };
};
exports.generateTokens = generateTokens;
const validateRefreshToken = async (refreshToken) => {
    try {
        const jwtRefreshSecret = process.env['JWT_REFRESH_SECRET'];
        if (!jwtRefreshSecret) {
            throw new Error('JWT refresh secret is not configured');
        }
        const decoded = jsonwebtoken_1.default.verify(refreshToken, jwtRefreshSecret);
        const user = await User_1.User.findByPk(decoded.userId);
        if (!user) {
            return null;
        }
        const { accessToken } = (0, exports.generateTokens)(user);
        return { user, accessToken };
    }
    catch (error) {
        return null;
    }
};
exports.validateRefreshToken = validateRefreshToken;
//# sourceMappingURL=auth.js.map