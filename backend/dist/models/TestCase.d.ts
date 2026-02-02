import { Model, Optional } from 'sequelize';
export interface TestCaseAttributes {
    id: string;
    assignment_id: string;
    input: string;
    expected_output: string;
    is_hidden: boolean;
    points: number;
    time_limit: number;
    memory_limit: number;
    created_at: Date;
    updated_at: Date;
}
export interface TestCaseCreationAttributes extends Optional<TestCaseAttributes, 'id' | 'is_hidden' | 'points' | 'time_limit' | 'memory_limit' | 'created_at' | 'updated_at'> {
}
export declare class TestCase extends Model<TestCaseAttributes, TestCaseCreationAttributes> implements TestCaseAttributes {
    id: string;
    assignment_id: string;
    input: string;
    expected_output: string;
    is_hidden: boolean;
    points: number;
    time_limit: number;
    memory_limit: number;
    created_at: Date;
    updated_at: Date;
    assignment?: any;
}
export default TestCase;
//# sourceMappingURL=TestCase.d.ts.map