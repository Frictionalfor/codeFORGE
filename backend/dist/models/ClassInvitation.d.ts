import { Model, Optional } from 'sequelize';
export interface ClassInvitationAttributes {
    id: string;
    class_id: string;
    invited_by: string;
    email: string;
    token: string;
    expires_at: Date;
    used_at: Date | null;
    used_by: string | null;
    created_at: Date;
}
export interface ClassInvitationCreationAttributes extends Optional<ClassInvitationAttributes, 'id' | 'token' | 'used_at' | 'used_by' | 'created_at'> {
}
export declare class ClassInvitation extends Model<ClassInvitationAttributes, ClassInvitationCreationAttributes> implements ClassInvitationAttributes {
    id: string;
    class_id: string;
    invited_by: string;
    email: string;
    token: string;
    expires_at: Date;
    used_at: Date | null;
    used_by: string | null;
    created_at: Date;
    class?: any;
    inviter?: any;
    user?: any;
}
export default ClassInvitation;
//# sourceMappingURL=ClassInvitation.d.ts.map