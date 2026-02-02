import { Model, Optional } from 'sequelize';
export interface ClassAttributes {
    id: string;
    teacher_id: string;
    name: string;
    description: string;
    visibility: 'public' | 'private';
    join_code: string;
    max_students: number | null;
    is_active: boolean;
    join_method: 'code' | 'approval' | 'invitation';
    created_at: Date;
    updated_at: Date;
}
export interface ClassCreationAttributes extends Optional<ClassAttributes, 'id' | 'visibility' | 'join_code' | 'max_students' | 'is_active' | 'join_method' | 'created_at' | 'updated_at'> {
}
export declare class Class extends Model<ClassAttributes, ClassCreationAttributes> implements ClassAttributes {
    id: string;
    teacher_id: string;
    name: string;
    description: string;
    visibility: 'public' | 'private';
    join_code: string;
    max_students: number | null;
    is_active: boolean;
    join_method: 'code' | 'approval' | 'invitation';
    created_at: Date;
    updated_at: Date;
    teacher?: any;
    assignments?: any[];
    enrollments?: any[];
    students?: any[];
}
export default Class;
//# sourceMappingURL=Class.d.ts.map