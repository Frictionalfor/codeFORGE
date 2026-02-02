import { Model, Optional } from 'sequelize';
export interface UserAttributes {
    id: string;
    firebaseUid?: string;
    email: string;
    password_hash?: string;
    name: string;
    role: 'teacher' | 'student';
    emailVerified: boolean;
    bio?: string;
    institution?: string;
    major?: string;
    year?: string;
    migratedFrom?: string;
    created_at: Date;
    updated_at: Date;
}
export interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'password_hash' | 'emailVerified' | 'created_at' | 'updated_at'> {
}
export declare class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    id: string;
    firebaseUid?: string;
    email: string;
    password_hash?: string;
    name: string;
    role: 'teacher' | 'student';
    emailVerified: boolean;
    bio?: string;
    institution?: string;
    major?: string;
    year?: string;
    migratedFrom?: string;
    created_at: Date;
    updated_at: Date;
    classes?: any[];
    enrollments?: any[];
    submissions?: any[];
    toJSON(): Omit<UserAttributes, 'password_hash'>;
}
export default User;
//# sourceMappingURL=User.d.ts.map