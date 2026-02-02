"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.codeExecutionService = exports.CodeExecutionService = void 0;
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const ExecutionResult_1 = require("../models/ExecutionResult");
class CodeExecutionService {
    constructor() {
        this.tempDir = path_1.default.join(process.cwd(), 'temp');
        this.maxConcurrentExecutions = 5;
        this.currentExecutions = 0;
        this.ensureTempDir();
    }
    async ensureTempDir() {
        try {
            await fs_1.promises.access(this.tempDir);
        }
        catch {
            await fs_1.promises.mkdir(this.tempDir, { recursive: true });
        }
    }
    async executeCode(code, testCases, config) {
        if (this.currentExecutions >= this.maxConcurrentExecutions) {
            throw new Error('Maximum concurrent executions reached. Please try again later.');
        }
        this.currentExecutions++;
        try {
            const executionId = (0, uuid_1.v4)();
            switch (config.language) {
                case 'c':
                    return await this.executeCCode(code, testCases, config, executionId);
                case 'cpp':
                    return await this.executeCppCode(code, testCases, config, executionId);
                case 'python':
                    return await this.executePythonCode(code, testCases, config, executionId);
                case 'javascript':
                    return await this.executeJavaScriptCode(code, testCases, config, executionId);
                default:
                    throw new Error(`Unsupported language: ${config.language}`);
            }
        }
        finally {
            this.currentExecutions--;
        }
    }
    async compileC(sourceFile, executableFile) {
        return new Promise((resolve) => {
            const compiler = (0, child_process_1.spawn)('gcc', [
                '-o', executableFile,
                sourceFile,
                '-std=c99',
                '-Wall',
                '-Wextra',
                '-O2'
            ]);
            let errorOutput = '';
            compiler.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });
            compiler.on('close', (code) => {
                if (code === 0) {
                    resolve({ success: true });
                }
                else {
                    resolve({ success: false, error: errorOutput });
                }
            });
            compiler.on('error', (error) => {
                resolve({ success: false, error: error.message });
            });
        });
    }
    async compileCpp(sourceFile, executableFile) {
        return new Promise((resolve) => {
            const compiler = (0, child_process_1.spawn)('g++', [
                '-o', executableFile,
                sourceFile,
                '-std=c++17',
                '-Wall',
                '-Wextra',
                '-O2'
            ]);
            let errorOutput = '';
            compiler.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });
            compiler.on('close', (code) => {
                if (code === 0) {
                    resolve({ success: true });
                }
                else {
                    resolve({ success: false, error: errorOutput });
                }
            });
            compiler.on('error', (error) => {
                resolve({ success: false, error: error.message });
            });
        });
    }
    async executeCCode(code, testCases, config, executionId) {
        const sourceFile = path_1.default.join(this.tempDir, `${executionId}.c`);
        const executableFile = path_1.default.join(this.tempDir, `${executionId}`);
        await fs_1.promises.writeFile(sourceFile, code);
        const compilationResult = await this.compileC(sourceFile, executableFile);
        if (!compilationResult.success) {
            await this.cleanup([sourceFile]);
            return testCases.map((_testCase) => ({
                status: 'compilation_error',
                actualOutput: '',
                errorMessage: compilationResult.error || 'Compilation failed',
                executionTime: 0,
                memoryUsed: 0,
                pointsEarned: 0
            }));
        }
        const results = [];
        for (const testCase of testCases) {
            const result = await this.runExecutable(executableFile, testCase, config.timeLimit);
            results.push(result);
        }
        await this.cleanup([sourceFile, executableFile]);
        return results;
    }
    async executeCppCode(code, testCases, config, executionId) {
        const sourceFile = path_1.default.join(this.tempDir, `${executionId}.cpp`);
        const executableFile = path_1.default.join(this.tempDir, `${executionId}`);
        await fs_1.promises.writeFile(sourceFile, code);
        const compilationResult = await this.compileCpp(sourceFile, executableFile);
        if (!compilationResult.success) {
            await this.cleanup([sourceFile]);
            return testCases.map((_testCase) => ({
                status: 'compilation_error',
                actualOutput: '',
                errorMessage: compilationResult.error || 'Compilation failed',
                executionTime: 0,
                memoryUsed: 0,
                pointsEarned: 0
            }));
        }
        const results = [];
        for (const testCase of testCases) {
            const result = await this.runExecutable(executableFile, testCase, config.timeLimit);
            results.push(result);
        }
        await this.cleanup([sourceFile, executableFile]);
        return results;
    }
    async executePythonCode(code, testCases, config, executionId) {
        const sourceFile = path_1.default.join(this.tempDir, `${executionId}.py`);
        await fs_1.promises.writeFile(sourceFile, code);
        const results = [];
        for (const testCase of testCases) {
            const result = await this.runPython(sourceFile, testCase, config.timeLimit);
            results.push(result);
        }
        await this.cleanup([sourceFile]);
        return results;
    }
    async executeJavaScriptCode(code, testCases, config, executionId) {
        const sourceFile = path_1.default.join(this.tempDir, `${executionId}.js`);
        await fs_1.promises.writeFile(sourceFile, code);
        const results = [];
        for (const testCase of testCases) {
            const result = await this.runJavaScript(sourceFile, testCase, config.timeLimit);
            results.push(result);
        }
        await this.cleanup([sourceFile]);
        return results;
    }
    async runExecutable(executableFile, testCase, timeLimit) {
        return new Promise((resolve) => {
            const startTime = Date.now();
            let timedOut = false;
            const child = (0, child_process_1.spawn)(executableFile, [], {
                stdio: ['pipe', 'pipe', 'pipe']
            });
            let stdout = '';
            let stderr = '';
            const timeout = setTimeout(() => {
                timedOut = true;
                child.kill('SIGKILL');
                resolve({
                    status: 'timeout',
                    actualOutput: stdout,
                    errorMessage: 'Time limit exceeded',
                    executionTime: timeLimit,
                    memoryUsed: 0,
                    pointsEarned: 0
                });
            }, timeLimit);
            if (testCase.input) {
                child.stdin.write(testCase.input);
            }
            child.stdin.end();
            child.stdout.on('data', (data) => {
                stdout += data.toString();
            });
            child.stderr.on('data', (data) => {
                stderr += data.toString();
            });
            child.on('close', (code) => {
                if (timedOut)
                    return;
                clearTimeout(timeout);
                const executionTime = Date.now() - startTime;
                if (code !== 0) {
                    resolve({
                        status: 'runtime_error',
                        actualOutput: stdout,
                        errorMessage: stderr || `Program exited with code ${code}`,
                        executionTime,
                        memoryUsed: 0,
                        pointsEarned: 0
                    });
                    return;
                }
                const actualOutput = stdout.trim();
                const expectedOutput = testCase.expected_output.trim();
                const passed = actualOutput === expectedOutput;
                resolve({
                    status: passed ? 'passed' : 'failed',
                    actualOutput: stdout,
                    errorMessage: passed ? 'Test passed' : 'Output does not match expected result',
                    executionTime,
                    memoryUsed: 0,
                    pointsEarned: passed ? testCase.points : 0
                });
            });
            child.on('error', (error) => {
                if (timedOut)
                    return;
                clearTimeout(timeout);
                resolve({
                    status: 'runtime_error',
                    actualOutput: stdout,
                    errorMessage: error.message,
                    executionTime: Date.now() - startTime,
                    memoryUsed: 0,
                    pointsEarned: 0
                });
            });
        });
    }
    async runPython(sourceFile, testCase, timeLimit) {
        return new Promise((resolve) => {
            const startTime = Date.now();
            let timedOut = false;
            const child = (0, child_process_1.spawn)('python3', [sourceFile], {
                stdio: ['pipe', 'pipe', 'pipe']
            });
            let stdout = '';
            let stderr = '';
            const timeout = setTimeout(() => {
                timedOut = true;
                child.kill('SIGKILL');
                resolve({
                    status: 'timeout',
                    actualOutput: stdout,
                    errorMessage: 'Time limit exceeded',
                    executionTime: timeLimit,
                    memoryUsed: 0,
                    pointsEarned: 0
                });
            }, timeLimit);
            if (testCase.input) {
                child.stdin.write(testCase.input);
            }
            child.stdin.end();
            child.stdout.on('data', (data) => {
                stdout += data.toString();
            });
            child.stderr.on('data', (data) => {
                stderr += data.toString();
            });
            child.on('close', (code) => {
                if (timedOut)
                    return;
                clearTimeout(timeout);
                const executionTime = Date.now() - startTime;
                if (code !== 0) {
                    resolve({
                        status: 'runtime_error',
                        actualOutput: stdout,
                        errorMessage: stderr || `Program exited with code ${code}`,
                        executionTime,
                        memoryUsed: 0,
                        pointsEarned: 0
                    });
                    return;
                }
                const actualOutput = stdout.trim();
                const expectedOutput = testCase.expected_output.trim();
                const passed = actualOutput === expectedOutput;
                resolve({
                    status: passed ? 'passed' : 'failed',
                    actualOutput: stdout,
                    errorMessage: passed ? 'Test passed' : 'Output does not match expected result',
                    executionTime,
                    memoryUsed: 0,
                    pointsEarned: passed ? testCase.points : 0
                });
            });
            child.on('error', (error) => {
                if (timedOut)
                    return;
                clearTimeout(timeout);
                resolve({
                    status: 'runtime_error',
                    actualOutput: stdout,
                    errorMessage: error.message,
                    executionTime: Date.now() - startTime,
                    memoryUsed: 0,
                    pointsEarned: 0
                });
            });
        });
    }
    async runJavaScript(sourceFile, testCase, timeLimit) {
        return new Promise((resolve) => {
            const startTime = Date.now();
            let timedOut = false;
            const child = (0, child_process_1.spawn)('node', [sourceFile], {
                stdio: ['pipe', 'pipe', 'pipe']
            });
            let stdout = '';
            let stderr = '';
            const timeout = setTimeout(() => {
                timedOut = true;
                child.kill('SIGKILL');
                resolve({
                    status: 'timeout',
                    actualOutput: stdout,
                    errorMessage: 'Time limit exceeded',
                    executionTime: timeLimit,
                    memoryUsed: 0,
                    pointsEarned: 0
                });
            }, timeLimit);
            if (testCase.input) {
                child.stdin.write(testCase.input);
            }
            child.stdin.end();
            child.stdout.on('data', (data) => {
                stdout += data.toString();
            });
            child.stderr.on('data', (data) => {
                stderr += data.toString();
            });
            child.on('close', (code) => {
                if (timedOut)
                    return;
                clearTimeout(timeout);
                const executionTime = Date.now() - startTime;
                if (code !== 0) {
                    resolve({
                        status: 'runtime_error',
                        actualOutput: stdout,
                        errorMessage: stderr || `Program exited with code ${code}`,
                        executionTime,
                        memoryUsed: 0,
                        pointsEarned: 0
                    });
                    return;
                }
                const actualOutput = stdout.trim();
                const expectedOutput = testCase.expected_output.trim();
                const passed = actualOutput === expectedOutput;
                resolve({
                    status: passed ? 'passed' : 'failed',
                    actualOutput: stdout,
                    errorMessage: passed ? 'Test passed' : 'Output does not match expected result',
                    executionTime,
                    memoryUsed: 0,
                    pointsEarned: passed ? testCase.points : 0
                });
            });
            child.on('error', (error) => {
                if (timedOut)
                    return;
                clearTimeout(timeout);
                resolve({
                    status: 'runtime_error',
                    actualOutput: stdout,
                    errorMessage: error.message,
                    executionTime: Date.now() - startTime,
                    memoryUsed: 0,
                    pointsEarned: 0
                });
            });
        });
    }
    async cleanup(files) {
        for (const file of files) {
            try {
                await fs_1.promises.unlink(file);
            }
            catch (error) {
                console.warn(`Failed to cleanup file ${file}:`, error);
            }
        }
    }
    async saveExecutionResults(submissionId, testCases, results) {
        for (let i = 0; i < testCases.length; i++) {
            const testCase = testCases[i];
            const result = results[i];
            if (testCase && result) {
                await ExecutionResult_1.ExecutionResult.create({
                    submission_id: submissionId,
                    test_case_id: testCase.id,
                    status: result.status,
                    actual_output: result.actualOutput,
                    error_message: result.errorMessage,
                    execution_time: result.executionTime,
                    memory_used: result.memoryUsed,
                    points_earned: result.pointsEarned
                });
            }
        }
    }
}
exports.CodeExecutionService = CodeExecutionService;
exports.codeExecutionService = new CodeExecutionService();
//# sourceMappingURL=codeExecutionService.js.map