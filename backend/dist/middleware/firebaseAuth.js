"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireEmailVerification = exports.requireRole = exports.requireAuthWithUser = exports.requireAuth = exports.verifyToken = void 0;
const firebase_1 = __importDefault(require("../config/firebase"));
const userService_1 = require("../services/userService");
class FirebaseAuthMiddleware {
    constructor() {
        this.firebaseAdmin = firebase_1.default.getInstance();
    }
    extractToken(req) {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }
        return authHeader.substring(7);
    }
    async verifyToken(req, _res, next) {
        try {
            const token = this.extractToken(req);
            if (!token) {
                return next();
            }
            const decodedToken = await this.firebaseAdmin.verifyIdToken(token);
            req.firebaseUser = {
                uid: decodedToken.uid,
                email: decodedToken.email,
                emailVerified: decodedToken.email_verified || false,
                displayName: decodedToken['name']
            };
            next();
        }
        catch (error) {
            console.error('Token verification failed:', error);
            req.firebaseUser = undefined;
            next();
        }
    }
    async requireAuth(req, res, next) {
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
            req.firebaseUser = {
                uid: decodedToken.uid,
                email: decodedToken.email,
                emailVerified: decodedToken.email_verified || false,
                displayName: decodedToken['name']
            };
            next();
        }
        catch (error) {
            console.error('Authentication failed:', error);
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
    async requireAuthWithUser(req, res, next) {
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
            req.firebaseUser = {
                uid: decodedToken.uid,
                email: decodedToken.email,
                emailVerified: decodedToken.email_verified || false,
                displayName: decodedToken['name']
            };
            try {
                const userProfile = await userService_1.userService.getUserProfile(decodedToken.uid);
                if (userProfile) {
                    req.user = userProfile;
                }
                else {
                    res.status(404).json({
                        success: false,
                        error: {
                            code: 'USER_NOT_FOUND',
                            message: 'User profile not found'
                        }
                    });
                    return;
                }
            }
            catch (dbError) {
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
        }
        catch (error) {
            console.error('Authentication failed:', error);
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
    requireRole(role) {
        return async (req, res, next) => {
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
    async requireEmailVerification(req, res, next) {
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
const authMiddleware = new FirebaseAuthMiddleware();
exports.verifyToken = authMiddleware.verifyToken.bind(authMiddleware);
exports.requireAuth = authMiddleware.requireAuth.bind(authMiddleware);
exports.requireAuthWithUser = authMiddleware.requireAuthWithUser.bind(authMiddleware);
exports.requireRole = authMiddleware.requireRole.bind(authMiddleware);
exports.requireEmailVerification = authMiddleware.requireEmailVerification.bind(authMiddleware);
exports.default = authMiddleware;
//# sourceMappingURL=firebaseAuth.js.map