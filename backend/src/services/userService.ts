import { User, UserCreationAttributes } from '../models/User';

export interface UserProfile {
  id: string;
  firebaseUid: string;
  email: string;
  role: 'teacher' | 'student';
  name: string;
  emailVerified: boolean;
  bio?: string | undefined;
  institution?: string | undefined;
  major?: string | undefined;
  year?: string | undefined;
  createdAt: Date;
  updatedAt: Date;
  migratedFrom?: string | undefined;
}

export interface CreateUserProfileData {
  firebaseUid: string;
  email: string;
  role: 'teacher' | 'student';
  name: string;
  emailVerified?: boolean;
  bio?: string;
  institution?: string;
  major?: string;
  year?: string;
}

export interface UpdateUserProfileData {
  name?: string;
  bio?: string;
  institution?: string;
  major?: string;
  year?: string;
  emailVerified?: boolean;
}

export interface LegacyUser {
  id: string;
  email: string;
  name: string;
  role: 'teacher' | 'student';
  bio?: string | undefined;
  institution?: string | undefined;
  major?: string | undefined;
  year?: string | undefined;
  created_at: Date;
  updated_at: Date;
}

class UserService {
  /**
   * Create a new user profile for Firebase authenticated user
   */
  async createUserProfile(data: CreateUserProfileData): Promise<UserProfile> {
    try {
      // Check if user with this Firebase UID already exists
      const existingUser = await User.findOne({
        where: { firebaseUid: data.firebaseUid }
      });

      if (existingUser) {
        throw new Error('User profile already exists for this Firebase UID');
      }

      // Check if user with this email already exists
      const existingEmailUser = await User.findOne({
        where: { email: data.email }
      });

      if (existingEmailUser) {
        // If user exists with email but no Firebase UID, this might be a migration case
        if (!existingEmailUser.firebaseUid) {
          throw new Error('User with this email exists but is not migrated to Firebase. Please use migration flow.');
        }
        throw new Error('User with this email already exists');
      }

      const userData: Partial<UserCreationAttributes> = {
        firebaseUid: data.firebaseUid,
        email: data.email,
        name: data.name,
        role: data.role,
        emailVerified: data.emailVerified || false
      };

      // Only add optional fields if they have values
      if (data.bio) userData.bio = data.bio;
      if (data.institution) userData.institution = data.institution;
      if (data.major) userData.major = data.major;
      if (data.year) userData.year = data.year;

      const user = await User.create(userData as UserCreationAttributes);
      return this.formatUserProfile(user);
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  /**
   * Get user profile by Firebase UID
   */
  async getUserProfile(firebaseUid: string): Promise<UserProfile | null> {
    try {
      const user = await User.findOne({
        where: { firebaseUid }
      });

      if (!user) {
        return null;
      }

      return this.formatUserProfile(user);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  /**
   * Get user profile by email (for migration detection)
   */
  async getUserByEmail(email: string): Promise<UserProfile | null> {
    try {
      const user = await User.findOne({
        where: { email: email.toLowerCase() }
      });

      if (!user) {
        return null;
      }

      return this.formatUserProfile(user);
    } catch (error) {
      console.error('Error fetching user by email:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(firebaseUid: string, updates: UpdateUserProfileData): Promise<UserProfile> {
    try {
      const user = await User.findOne({
        where: { firebaseUid }
      });

      if (!user) {
        throw new Error('User profile not found');
      }

      await user.update(updates);
      return this.formatUserProfile(user);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  /**
   * Detect legacy user by email (user without Firebase UID)
   */
  async detectLegacyUser(email: string): Promise<LegacyUser | null> {
    try {
      // Use raw query to avoid TypeScript issues with null checks
      const users = await User.findAll({
        where: {
          email: email.toLowerCase()
        }
      });

      // Filter for users without Firebase UID
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
    } catch (error) {
      console.error('Error detecting legacy user:', error);
      throw error;
    }
  }

  /**
   * Migrate legacy user to Firebase authentication
   */
  async migrateUser(legacyUserId: string, firebaseUid: string, emailVerified: boolean = false): Promise<UserProfile> {
    try {
      const user = await User.findByPk(legacyUserId);

      if (!user) {
        throw new Error('Legacy user not found');
      }

      if (user.firebaseUid) {
        throw new Error('User is already migrated to Firebase');
      }

      // Check if Firebase UID is already in use
      const existingFirebaseUser = await User.findOne({
        where: { firebaseUid }
      });

      if (existingFirebaseUser) {
        throw new Error('Firebase UID is already in use');
      }

      // Update user with Firebase UID and mark as migrated
      await user.update({
        firebaseUid,
        emailVerified,
        migratedFrom: user.id // Store original ID for audit trail
      });

      return this.formatUserProfile(user);
    } catch (error) {
      console.error('Error migrating user:', error);
      throw error;
    }
  }

  /**
   * Delete user profile and all associated data
   */
  async deleteUserProfile(firebaseUid: string): Promise<void> {
    try {
      const user = await User.findOne({
        where: { firebaseUid }
      });

      if (!user) {
        throw new Error('User profile not found');
      }

      // TODO: Add cascade deletion for related data (classes, assignments, submissions)
      // This should be implemented when we add the deletion endpoints

      await user.destroy();
    } catch (error) {
      console.error('Error deleting user profile:', error);
      throw error;
    }
  }

  /**
   * Check if user has specific role
   */
  async hasRole(firebaseUid: string, role: 'teacher' | 'student'): Promise<boolean> {
    try {
      const user = await User.findOne({
        where: { firebaseUid, role }
      });

      return !!user;
    } catch (error) {
      console.error('Error checking user role:', error);
      return false;
    }
  }

  /**
   * Get user statistics (for admin purposes)
   */
  async getUserStats(): Promise<{
    totalUsers: number;
    firebaseUsers: number;
    legacyUsers: number;
    teachers: number;
    students: number;
    verifiedUsers: number;
  }> {
    // Temporarily simplified to get backend running
    return {
      totalUsers: 0,
      firebaseUsers: 0,
      legacyUsers: 0,
      teachers: 0,
      students: 0,
      verifiedUsers: 0
    };
  }

  /**
   * Format user model to UserProfile interface
   */
  private formatUserProfile(user: User): UserProfile {
    return {
      id: user.id,
      firebaseUid: user.firebaseUid!,
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

// Export singleton instance
export const userService = new UserService();
export default userService;