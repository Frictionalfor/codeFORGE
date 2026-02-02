import { Model, Optional } from 'sequelize';
export interface ExecutionResultAttributes {
    id: string;
    submission_id: string;
    test_case_id: string;
    status: 'pending' | 'running' | 'passed' | 'failed' | 'timeout' | 'memory_exceeded' | 'runtime_error' | 'compilation_error';
    actual_output: string | null;
    error_message: string | null;
    execution_time: number | null;
    memory_used: number | null;
    points_earned: number;
    created_at: Date;
    updated_at: Date;
}
export interface ExecutionResultCreationAttributes extends Optional<ExecutionResultAttributes, 'id' | 'actual_output' | 'error_message' | 'execution_time' | 'memory_used' | 'points_earned' | 'created_at' | 'updated_at'> {
}
export declare class ExecutionResult extends Model<ExecutionResultAttributes, ExecutionResultCreationAttributes> implements ExecutionResultAttributes {
    id: string;
    submission_id: string;
    test_case_id: string;
    status: 'pending' | 'running' | 'passed' | 'failed' | 'timeout' | 'memory_exceeded' | 'runtime_error' | 'compilation_error';
    actual_output: string | null;
    error_message: string | null;
    execution_time: number | null;
    memory_used: number | null;
    points_earned: number;
    created_at: Date;
    updated_at: Date;
    submission?: any;
    testCase?: any;
}
export default ExecutionResult;
//# sourceMappingURL=ExecutionResult.d.ts.map