"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const User_1 = require("../models/User");
class UserService {
    async createUserProfile(data) {
        try {
            const existingUser = await User_1.User.findOne({
                where: { firebaseUid: data.firebaseUid }
            });
            if (existingUser) {
                throw new Error('User profile already exists for this Firebase UID');
            }
            const existingEmailUser = await User_1.User.findOne({
                where: { email: data.email }
            });
            if (existingEmailUser) {
                if (!existingEmailUser.firebaseUid) {
                    throw new Error('User with this email exists but is not migrated to Firebase. Please use migration flow.');
                }
                throw new Error('User with this email already exists');
            }
            const userData = {
                firebaseUid: data.firebaseUid,
                email: data.email,
                name: data.name,
                role: data.role,
                emailVerified: data.emailVerified || false
            };
            if (data.bio)
                userData.bio = data.bio;
            if (data.institution)
                userData.institution = data.institution;
            if (data.major)
                userData.major = data.major;
            if (data.year)
                userData.year = data.year;
            const user = await User_1.User.create(userData);
            return this.formatUserProfile(user);
        }
        catch (error) {
            console.error('Error creating user profile:', error);
            throw error;
        }
    }
    async getUserProfile(firebaseUid) {
        try {
            const user = await User_1.User.findOne({
                where: { firebaseUid }
            });
            if (!user) {
                return null;
            }
            return this.formatUserProfile(user);
        }
        catch (error) {
            console.error('Error fetching user profile:', error);
            throw error;
        }
    }
    async getUserByEmail(email) {
        try {
            const user = await User_1.User.findOne({
                where: { email: email.toLowerCase() }
            });
            if (!user) {
                return null;
            }
            return this.formatUserProfile(user);
        }
        catch (error) {
            console.error('Error fetching user by email:', error);
            throw error;
        }
    }
    async updateUserProfile(firebaseUid, updates) {
        try {
            const user = await User_1.User.findOne({
                where: { firebaseUid }
            });
            if (!user) {
                throw new Error('User profile not found');
            }
            await user.update(updates);
            return this.formatUserProfile(user);
        }
        catch (error) {
            console.error('Error updating user profile:', error);
            throw error;
        }
    }
    async detectLegacyUser(email) {
        try {
            const users = await User_1.User.findAll({
                where: {
                    email: email.toLowerCase()
                }
            });
            const legacyUser = users.find(user => !user.firebaseUid);
            if (!legacyUser) {
                return null;
            }
            return {
                id: legacyUser.id,
                email: legacyUser.email,
                name: legacyUser.name,
                role: legacyUser.role,
                bio: legacyUser.bio || undefined,
                institution: legacyUser.institution || undefined,
                major: legacyUser.major || undefined,
                year: legacyUser.year || undefined,
                created_at: legacyUser.created_at,
                updated_at: legacyUser.updated_at
            };
        }
        catch (error) {
            console.error('Error detecting legacy user:', error);
            throw error;
        }
    }
    async migrateUser(legacyUserId, firebaseUid, emailVerified = false) {
        try {
            const user = await User_1.User.findByPk(legacyUserId);
            if (!user) {
                throw new Error('Legacy user not found');
            }
            if (user.firebaseUid) {
                throw new Error('User is already migrated to Firebase');
            }
            const existingFirebaseUser = await User_1.User.findOne({
                where: { firebaseUid }
            });
            if (existingFirebaseUser) {
                throw new Error('Firebase UID is already in use');
            }
            await user.update({
                firebaseUid,
                emailVerified,
                migratedFrom: user.id
            });
            return this.formatUserProfile(user);
        }
        catch (error) {
            console.error('Error migrating user:', error);
            throw error;
        }
    }
    async deleteUserProfile(firebaseUid) {
        try {
            const user = await User_1.User.findOne({
                where: { firebaseUid }
            });
            if (!user) {
                throw new Error('User profile not found');
            }
            await user.destroy();
        }
        catch (error) {
            console.error('Error deleting user profile:', error);
            throw error;
        }
    }
    async hasRole(firebaseUid, role) {
        try {
            const user = await User_1.User.findOne({
                where: { firebaseUid, role }
            });
            return !!user;
        }
        catch (error) {
            console.error('Error checking user role:', error);
            return false;
        }
    }
    async getUserStats() {
        return {
            totalUsers: 0,
            firebaseUsers: 0,
            legacyUsers: 0,
            teachers: 0,
            students: 0,
            verifiedUsers: 0
        };
    }
    formatUserProfile(user) {
        return {
            id: user.id,
            firebaseUid: user.firebaseUid,
            email: user.email,
            role: user.role,
            name: user.name,
            emailVerified: user.emailVerified,
            bio: user.bio || undefined,
            institution: user.institution || undefined,
            major: user.major || undefined,
            year: user.year || undefined,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
            migratedFrom: user.migratedFrom || undefined
        };
    }
}
exports.userService = new UserService();
exports.default = exports.userService;
//# sourceMappingURL=userService.js.map