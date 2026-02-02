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
declare class UserService {
    createUserProfile(data: CreateUserProfileData): Promise<UserProfile>;
    getUserProfile(firebaseUid: string): Promise<UserProfile | null>;
    getUserByEmail(email: string): Promise<UserProfile | null>;
    updateUserProfile(firebaseUid: string, updates: UpdateUserProfileData): Promise<UserProfile>;
    detectLegacyUser(email: string): Promise<LegacyUser | null>;
    migrateUser(legacyUserId: string, firebaseUid: string, emailVerified?: boolean): Promise<UserProfile>;
    deleteUserProfile(firebaseUid: string): Promise<void>;
    hasRole(firebaseUid: string, role: 'teacher' | 'student'): Promise<boolean>;
    getUserStats(): Promise<{
        totalUsers: number;
        firebaseUsers: number;
        legacyUsers: number;
        teachers: number;
        students: number;
        verifiedUsers: number;
    }>;
    private formatUserProfile;
}
export declare const userService: UserService;
export default userService;
//# sourceMappingURL=userService.d.ts.map