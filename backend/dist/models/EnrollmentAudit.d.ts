import { Model, Optional } from 'sequelize';
export interface EnrollmentAuditAttributes {
    id: string;
    enrollment_id: string;
    action: string;
    performed_by: string;
    reason: string | null;
    created_at: Date;
}
export interface EnrollmentAuditCreationAttributes extends Optional<EnrollmentAuditAttributes, 'id' | 'reason' | 'created_at'> {
}
export declare class EnrollmentAudit extends Model<EnrollmentAuditAttributes, EnrollmentAuditCreationAttributes> implements EnrollmentAuditAttributes {
    id: string;
    enrollment_id: string;
    action: string;
    performed_by: string;
    reason: string | null;
    created_at: Date;
    enrollment?: any;
    performer?: any;
}
export default EnrollmentAudit;
//# sourceMappingURL=EnrollmentAudit.d.ts.map