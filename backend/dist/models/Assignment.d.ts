import { Model, Optional } from 'sequelize';
export interface AssignmentAttributes {
    id: string;
    class_id: string;
    title: string;
    problem_description: string;
    language: 'c' | 'cpp' | 'java' | 'python' | 'javascript';
    time_limit: number;
    memory_limit: number;
    total_points: number;
    due_date: Date | null;
    allow_late_submission: boolean;
    late_penalty_per_day: number;
    max_late_days: number;
    is_published: boolean;
    published_at: Date | null;
    created_at: Date;
    updated_at: Date;
}
export interface AssignmentCreationAttributes extends Optional<AssignmentAttributes, 'id' | 'language' | 'time_limit' | 'memory_limit' | 'total_points' | 'due_date' | 'allow_late_submission' | 'late_penalty_per_day' | 'max_late_days' | 'is_published' | 'published_at' | 'created_at' | 'updated_at'> {
}
export declare class Assignment extends Model<AssignmentAttributes, AssignmentCreationAttributes> implements AssignmentAttributes {
    id: string;
    class_id: string;
    title: string;
    problem_description: string;
    language: 'c' | 'cpp' | 'java' | 'python' | 'javascript';
    time_limit: number;
    memory_limit: number;
    total_points: number;
    due_date: Date | null;
    allow_late_submission: boolean;
    late_penalty_per_day: number;
    max_late_days: number;
    is_published: boolean;
    published_at: Date | null;
    created_at: Date;
    updated_at: Date;
    class?: any;
    submissions?: any[];
    testCases?: any[];
    isOverdue(): boolean;
    getDaysLate(): number;
    canSubmit(): boolean;
    getLatePenalty(): number;
}
export default Assignment;
//# sourceMappingURL=Assignment.d.ts.map