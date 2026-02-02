"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const firebaseAuth_1 = require("../middleware/firebaseAuth");
const userService_1 = require("../services/userService");
const router = express_1.default.Router();
router.get('/profile', firebaseAuth_1.requireAuth, async (req, res) => {
    try {
        console.log('🔍 Backend: profile fetch called for UID:', req.firebaseUser?.uid);
        if (!req.firebaseUser?.uid) {
            console.log('❌ Missing user ID in token');
            res.status(401).json({
                success: false,
                error: {
                    code: 'MISSING_USER_ID',
                    message: 'User ID not found in token'
                }
            });
            return;
        }
        const userProfile = await userService_1.userService.getUserProfile(req.firebaseUser.uid);
        if (!userProfile) {
            console.log('👤 User profile not found for UID:', req.firebaseUser.uid);
            if (req.firebaseUser.email) {
                console.log('🔍 Checking for legacy user with email:', req.firebaseUser.email);
                const legacyUser = await userService_1.userService.detectLegacyUser(req.firebaseUser.email);
                if (legacyUser) {
                    console.log('🔄 Found legacy user, auto-migrating...');
                    const migratedProfile = await userService_1.userService.migrateUser(legacyUser.id, req.firebaseUser.uid, req.firebaseUser.emailVerified);
                    console.log('✅ Legacy user auto-migrated:', migratedProfile.id, migratedProfile.role);
                    req.firebaseUser.role = migratedProfile.role;
                    req.firebaseUser.profile = migratedProfile;
                    res.json({
                        success: true,
                        user: migratedProfile
                    });
                    return;
                }
            }
            res.status(404).json({
                success: false,
                error: {
                    code: 'PROFILE_NOT_FOUND',
                    message: 'User profile not found'
                }
            });
            return;
        }
        console.log('✅ User profile found:', userProfile.id, userProfile.role);
        req.firebaseUser.role = userProfile.role;
        req.firebaseUser.profile = userProfile;
        res.json({
            success: true,
            user: userProfile
        });
    }
    catch (error) {
        console.error('❌ Error fetching user profile:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'PROFILE_FETCH_ERROR',
                message: 'Failed to fetch user profile'
            }
        });
    }
});
router.post('/select-role', firebaseAuth_1.requireAuth, async (req, res) => {
    try {
        const { role } = req.body;
        console.log('🔥 Backend: select-role called');
        console.log('👤 Firebase user:', req.firebaseUser?.uid, req.firebaseUser?.email);
        console.log('🎭 Requested role:', role);
        if (!req.firebaseUser?.uid || !req.firebaseUser?.email) {
            console.log('❌ Missing user data in token');
            res.status(401).json({
                success: false,
                error: {
                    code: 'MISSING_USER_DATA',
                    message: 'User data not found in token'
                }
            });
            return;
        }
        if (!role || !['teacher', 'student'].includes(role)) {
            console.log('❌ Invalid role:', role);
            res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_ROLE',
                    message: 'Role must be either "teacher" or "student"'
                }
            });
            return;
        }
        console.log('🔍 Checking for existing profile by Firebase UID...');
        const existingProfile = await userService_1.userService.getUserProfile(req.firebaseUser.uid);
        if (existingProfile) {
            console.log('⚠️ Profile already exists with role:', existingProfile.role);
            console.log('🚫 BLOCKING duplicate role creation attempt');
            res.status(409).json({
                success: false,
                error: {
                    code: 'PROFILE_EXISTS',
                    message: `User profile already exists with role: ${existingProfile.role}. Cannot change roles.`
                },
                existingProfile: {
                    id: existingProfile.id,
                    role: existingProfile.role,
                    email: existingProfile.email,
                    name: existingProfile.name
                }
            });
            return;
        }
        console.log('🔍 Double-checking for existing user by email...');
        const existingEmailUser = await userService_1.userService.getUserByEmail(req.firebaseUser.email);
        if (existingEmailUser && existingEmailUser.firebaseUid) {
            console.log('⚠️ User with this email already has Firebase profile:', existingEmailUser.role);
            console.log('🚫 BLOCKING duplicate email-based role creation');
            res.status(409).json({
                success: false,
                error: {
                    code: 'EMAIL_ALREADY_HAS_PROFILE',
                    message: `This email already has a profile with role: ${existingEmailUser.role}. Cannot create duplicate.`
                },
                existingProfile: {
                    id: existingEmailUser.id,
                    role: existingEmailUser.role,
                    email: existingEmailUser.email,
                    name: existingEmailUser.name
                }
            });
            return;
        }
        console.log('🔍 Checking for legacy user with email:', req.firebaseUser.email);
        const legacyUser = await userService_1.userService.detectLegacyUser(req.firebaseUser.email);
        if (legacyUser) {
            console.log('🔄 Found legacy user, performing migration...');
            const migratedProfile = await userService_1.userService.migrateUser(legacyUser.id, req.firebaseUser.uid, req.firebaseUser.emailVerified);
            console.log('✅ Legacy user migrated successfully:', migratedProfile.id, migratedProfile.role);
            req.firebaseUser.role = migratedProfile.role;
            req.firebaseUser.profile = migratedProfile;
            res.status(200).json({
                success: true,
                user: migratedProfile,
                message: `Legacy account migrated successfully as ${migratedProfile.role}`
            });
            return;
        }
        let name = 'User';
        if (req.firebaseUser.displayName && req.firebaseUser.displayName.trim()) {
            name = req.firebaseUser.displayName.trim();
            console.log('📝 Using Firebase displayName:', name);
        }
        else if (req.firebaseUser.email) {
            const emailName = req.firebaseUser.email.split('@')[0];
            if (emailName) {
                name = emailName
                    .replace(/[._]/g, ' ')
                    .split(' ')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    .join(' ');
                console.log('📝 Using email-based name:', name);
            }
        }
        console.log('📝 Creating new user profile...');
        const userProfile = await userService_1.userService.createUserProfile({
            firebaseUid: req.firebaseUser.uid,
            email: req.firebaseUser.email,
            role,
            name,
            emailVerified: req.firebaseUser.emailVerified
        });
        console.log('✅ User profile created successfully:', userProfile.id, userProfile.role);
        req.firebaseUser.role = userProfile.role;
        req.firebaseUser.profile = userProfile;
        res.status(201).json({
            success: true,
            user: userProfile,
            message: `Profile created successfully as ${role}`
        });
    }
    catch (error) {
        console.error('❌ Error creating user profile:', error);
        if (error instanceof Error) {
            if (error.message.includes('already exists')) {
                console.log('🚫 Database constraint prevented duplicate user creation');
                res.status(409).json({
                    success: false,
                    error: {
                        code: 'PROFILE_EXISTS',
                        message: 'User profile already exists. Cannot create duplicate.'
                    }
                });
                return;
            }
            if (error.message.includes('migration')) {
                res.status(409).json({
                    success: false,
                    error: {
                        code: 'MIGRATION_REQUIRED',
                        message: error.message
                    }
                });
                return;
            }
            if (error.message.includes('unique constraint') || error.message.includes('UNIQUE constraint')) {
                console.log('🚫 Database unique constraint violation prevented duplicate');
                res.status(409).json({
                    success: false,
                    error: {
                        code: 'DUPLICATE_USER',
                        message: 'User with this email or Firebase UID already exists'
                    }
                });
                return;
            }
        }
        res.status(500).json({
            success: false,
            error: {
                code: 'PROFILE_CREATION_ERROR',
                message: 'Failed to create user profile'
            }
        });
    }
});
router.put('/profile', firebaseAuth_1.requireAuth, async (req, res) => {
    try {
        if (!req.firebaseUser?.uid) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'MISSING_USER_ID',
                    message: 'User ID not found in token'
                }
            });
            return;
        }
        const { name, bio, institution, major, year } = req.body;
        const updates = {};
        if (name !== undefined)
            updates.name = name;
        if (bio !== undefined)
            updates.bio = bio;
        if (institution !== undefined)
            updates.institution = institution;
        if (major !== undefined)
            updates.major = major;
        if (year !== undefined)
            updates.year = year;
        if (Object.keys(updates).length === 0) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'NO_UPDATES',
                    message: 'No valid fields to update'
                }
            });
            return;
        }
        const userProfile = await userService_1.userService.updateUserProfile(req.firebaseUser.uid, updates);
        res.json({
            success: true,
            user: userProfile,
            message: 'Profile updated successfully'
        });
    }
    catch (error) {
        console.error('Error updating user profile:', error);
        if (error instanceof Error && error.message.includes('not found')) {
            res.status(404).json({
                success: false,
                error: {
                    code: 'PROFILE_NOT_FOUND',
                    message: 'User profile not found'
                }
            });
            return;
        }
        res.status(500).json({
            success: false,
            error: {
                code: 'PROFILE_UPDATE_ERROR',
                message: 'Failed to update user profile'
            }
        });
    }
});
router.post('/detect-legacy', firebaseAuth_1.verifyToken, async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'MISSING_EMAIL',
                    message: 'Email is required'
                }
            });
            return;
        }
        const legacyUser = await userService_1.userService.detectLegacyUser(email);
        res.json({
            success: true,
            hasLegacyAccount: !!legacyUser,
            legacyUser: legacyUser ? {
                id: legacyUser.id,
                name: legacyUser.name,
                role: legacyUser.role,
                createdAt: legacyUser.created_at
            } : null
        });
    }
    catch (error) {
        console.error('Error detecting legacy user:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'LEGACY_DETECTION_ERROR',
                message: 'Failed to detect legacy account'
            }
        });
    }
});
router.delete('/account', firebaseAuth_1.requireAuth, async (req, res) => {
    try {
        if (!req.firebaseUser?.uid) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'MISSING_USER_ID',
                    message: 'User ID not found in token'
                }
            });
            return;
        }
        await userService_1.userService.deleteUserProfile(req.firebaseUser.uid);
        res.json({
            success: true,
            message: 'Account deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting user account:', error);
        if (error instanceof Error && error.message.includes('not found')) {
            res.status(404).json({
                success: false,
                error: {
                    code: 'PROFILE_NOT_FOUND',
                    message: 'User profile not found'
                }
            });
            return;
        }
        res.status(500).json({
            success: false,
            error: {
                code: 'ACCOUNT_DELETION_ERROR',
                message: 'Failed to delete account'
            }
        });
    }
});
router.get('/stats', firebaseAuth_1.requireAuth, async (_req, res) => {
    try {
        const stats = await userService_1.userService.getUserStats();
        res.json({
            success: true,
            stats
        });
    }
    catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'STATS_ERROR',
                message: 'Failed to fetch user statistics'
            }
        });
    }
});
exports.default = router;
//# sourceMappingURL=firebaseAuthRoutes.js.map