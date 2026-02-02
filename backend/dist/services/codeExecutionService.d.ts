import { TestCase } from '../models/TestCase';
export interface ExecutionConfig {
    language: 'c' | 'cpp' | 'java' | 'python' | 'javascript';
    timeLimit: number;
    memoryLimit: number;
}
export interface TestResult {
    status: 'passed' | 'failed' | 'timeout' | 'memory_exceeded' | 'runtime_error' | 'compilation_error';
    actualOutput: string;
    errorMessage: string;
    executionTime: number;
    memoryUsed: number;
    pointsEarned: number;
}
export declare class CodeExecutionService {
    private readonly tempDir;
    private readonly maxConcurrentExecutions;
    private currentExecutions;
    constructor();
    private ensureTempDir;
    executeCode(code: string, testCases: TestCase[], config: ExecutionConfig): Promise<TestResult[]>;
    private compileC;
    private compileCpp;
    private executeCCode;
    private executeCppCode;
    private executePythonCode;
    private executeJavaScriptCode;
    private runExecutable;
    private runPython;
    private runJavaScript;
    private cleanup;
    saveExecutionResults(submissionId: string, testCases: TestCase[], results: TestResult[]): Promise<void>;
}
export declare const codeExecutionService: CodeExecutionService;
//# sourceMappingURL=codeExecutionService.d.ts.map