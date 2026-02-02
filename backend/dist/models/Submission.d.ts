import { Model, Optional } from 'sequelize';
export interface SubmissionAttributes {
    id: string;
    assignment_id: string;
    student_id: string;
    code: string;
    language: 'c' | 'cpp' | 'java' | 'python' | 'javascript';
    status: 'pending' | 'running' | 'completed' | 'failed';
    total_points: number;
    points_earned: number;
    compilation_error: string | null;
    submitted_at: Date;
    updated_at: Date;
}
export interface SubmissionCreationAttributes extends Optional<SubmissionAttributes, 'id' | 'language' | 'status' | 'total_points' | 'points_earned' | 'compilation_error' | 'submitted_at' | 'updated_at'> {
}
export declare class Submission extends Model<SubmissionAttributes, SubmissionCreationAttributes> implements SubmissionAttributes {
    id: string;
    assignment_id: string;
    student_id: string;
    code: string;
    language: 'c' | 'cpp' | 'java' | 'python' | 'javascript';
    status: 'pending' | 'running' | 'completed' | 'failed';
    total_points: number;
    points_earned: number;
    compilation_error: string | null;
    submitted_at: Date;
    updated_at: Date;
    assignment?: any;
    student?: any;
    executionResults?: any[];
}
export default Submission;
//# sourceMappingURL=Submission.d.ts.map