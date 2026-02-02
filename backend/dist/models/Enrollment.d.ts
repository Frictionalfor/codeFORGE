import { Model, Optional } from 'sequelize';
export interface EnrollmentAttributes {
    id: string;
    student_id: string;
    class_id: string;
    status: 'active' | 'pending' | 'suspended' | 'withdrawn';
    enrolled_at: Date;
    enrolled_by: string | null;
    withdrawn_at: Date | null;
    withdrawn_by: string | null;
}
export interface EnrollmentCreationAttributes extends Optional<EnrollmentAttributes, 'id' | 'status' | 'enrolled_at' | 'enrolled_by' | 'withdrawn_at' | 'withdrawn_by'> {
}
export declare class Enrollment extends Model<EnrollmentAttributes, EnrollmentCreationAttributes> implements EnrollmentAttributes {
    id: string;
    student_id: string;
    class_id: string;
    status: 'active' | 'pending' | 'suspended' | 'withdrawn';
    enrolled_at: Date;
    enrolled_by: string | null;
    withdrawn_at: Date | null;
    withdrawn_by: string | null;
    student?: any;
    class?: any;
}
export default Enrollment;
//# sourceMappingURL=Enrollment.d.ts.map