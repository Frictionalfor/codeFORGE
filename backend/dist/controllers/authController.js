"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.changePassword = exports.updateProfile = exports.getProfile = exports.refreshToken = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_1 = require("../models/User");
const auth_1 = require("../middleware/auth");
const register = async (req, res) => {
    try {
        const { email, password, name, role } = req.body;
        if (email === undefined || password === undefined || name === undefined || role === undefined ||
            email === null || password === null || name === null || role === null) {
            res.status(400).json({
                error: 'Missing required fields',
                message: 'Email, password, name, and role are required'
            });
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email.trim())) {
            res.status(400).json({
                error: 'Invalid email format',
                message: 'Please provide a valid email address'
            });
            return;
        }
        if (!password || password.trim().length < 8) {
            res.status(400).json({
                error: 'Weak password',
                message: 'Password must be at least 8 characters long'
            });
            return;
        }
        if (!name || name.trim().length < 2) {
            res.status(400).json({
                error: 'Invalid name',
                message: 'Name must be at least 2 characters long'
            });
            return;
        }
        if (!['teacher', 'student'].includes(role)) {
            res.status(400).json({
                error: 'Invalid role',
                message: 'Role must be either "teacher" or "student"'
            });
            return;
        }
        const existingUser = await User_1.User.findOne({ where: { email: email.toLowerCase().trim() } });
        if (existingUser) {
            res.status(409).json({
                error: 'User already exists',
                message: 'An account with this email address already exists'
            });
            return;
        }
        const saltRounds = parseInt(process.env['BCRYPT_ROUNDS'] || '12');
        const passwordHash = await bcrypt_1.default.hash(password, saltRounds);
        const user = await User_1.User.create({
            email: email.toLowerCase().trim(),
            password_hash: passwordHash,
            name: name.trim(),
            role
        });
        const { accessToken, refreshToken } = (0, auth_1.generateTokens)(user);
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
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            error: 'Registration failed',
            message: 'An error occurred during user registration'
        });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({
                error: 'Missing credentials',
                message: 'Email and password are required'
            });
            return;
        }
        const user = await User_1.User.findOne({ where: { email: email.toLowerCase().trim() } });
        if (!user) {
            res.status(401).json({
                error: 'Invalid credentials',
                message: 'Invalid email or password'
            });
            return;
        }
        if (!user.password_hash) {
            res.status(400).json({
                error: 'Migration required',
                message: 'This account needs to be migrated to Firebase authentication'
            });
            return;
        }
        const isPasswordValid = await bcrypt_1.default.compare(password, user.password_hash);
        if (!isPasswordValid) {
            res.status(401).json({
                error: 'Invalid credentials',
                message: 'Invalid email or password'
            });
            return;
        }
        const { accessToken, refreshToken } = (0, auth_1.generateTokens)(user);
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
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: 'Login failed',
            message: 'An error occurred during login'
        });
    }
};
exports.login = login;
const refreshToken = async (req, res) => {
    try {
        const { refreshToken: token } = req.body;
        if (!token) {
            res.status(400).json({
                error: 'Missing refresh token',
                message: 'Refresh token is required'
            });
            return;
        }
        const { validateRefreshToken } = await Promise.resolve().then(() => __importStar(require('../middleware/auth')));
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
    }
    catch (error) {
        console.error('Token refresh error:', error);
        res.status(500).json({
            error: 'Token refresh failed',
            message: 'An error occurred during token refresh'
        });
    }
};
exports.refreshToken = refreshToken;
const getProfile = async (req, res) => {
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
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            error: 'Profile retrieval failed',
            message: 'An error occurred while retrieving your profile'
        });
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                error: 'Authentication required',
                message: 'Please authenticate to update your profile'
            });
            return;
        }
        const { name, bio, institution, major, year } = req.body;
        if (name !== undefined && (!name || name.trim().length < 2)) {
            res.status(400).json({
                error: 'Invalid name',
                message: 'Name must be at least 2 characters long'
            });
            return;
        }
        const updateData = {};
        if (name !== undefined)
            updateData.name = name.trim();
        if (bio !== undefined)
            updateData.bio = bio.trim();
        if (institution !== undefined)
            updateData.institution = institution.trim();
        if (major !== undefined)
            updateData.major = major.trim();
        if (year !== undefined)
            updateData.year = year.trim();
        await User_1.User.update(updateData, {
            where: { id: req.user.id }
        });
        const updatedUser = await User_1.User.findByPk(req.user.id);
        res.status(200).json({
            message: 'Profile updated successfully',
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                name: updatedUser.name,
                role: updatedUser.role,
                bio: updatedUser.bio,
                institution: updatedUser.institution,
                major: updatedUser.major,
                year: updatedUser.year,
                created_at: updatedUser.created_at
            }
        });
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            error: 'Profile update failed',
            message: 'An error occurred while updating your profile'
        });
    }
};
exports.updateProfile = updateProfile;
const changePassword = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                error: 'Authentication required',
                message: 'Please authenticate to change your password'
            });
            return;
        }
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            res.status(400).json({
                error: 'Missing required fields',
                message: 'Current password and new password are required'
            });
            return;
        }
        if (newPassword.length < 8) {
            res.status(400).json({
                error: 'Weak password',
                message: 'New password must be at least 8 characters long'
            });
            return;
        }
        const user = await User_1.User.findByPk(req.user.id);
        if (!user) {
            res.status(404).json({
                error: 'User not found',
                message: 'User account not found'
            });
            return;
        }
        if (!user.password_hash) {
            res.status(400).json({
                error: 'Migration required',
                message: 'This account uses Firebase authentication and cannot change password here'
            });
            return;
        }
        const isCurrentPasswordValid = await bcrypt_1.default.compare(currentPassword, user.password_hash);
        if (!isCurrentPasswordValid) {
            res.status(401).json({
                error: 'Invalid current password',
                message: 'The current password you entered is incorrect'
            });
            return;
        }
        const saltRounds = parseInt(process.env['BCRYPT_ROUNDS'] || '12');
        const newPasswordHash = await bcrypt_1.default.hash(newPassword, saltRounds);
        await user.update({ password_hash: newPasswordHash });
        res.status(200).json({
            message: 'Password changed successfully'
        });
    }
    catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            error: 'Password change failed',
            message: 'An error occurred while changing your password'
        });
    }
};
exports.changePassword = changePassword;
const logout = async (_req, res) => {
    try {
        res.status(200).json({
            message: 'Logout successful',
            instructions: 'Please remove tokens from client storage'
        });
    }
    catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            error: 'Logout failed',
            message: 'An error occurred during logout'
        });
    }
};
exports.logout = logout;
//# sourceMappingURL=authController.js.map