import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { TestCase } from '../models/TestCase';
import { ExecutionResult } from '../models/ExecutionResult';

export interface ExecutionConfig {
  language: 'c' | 'cpp' | 'java' | 'python' | 'javascript';
  timeLimit: number; // milliseconds
  memoryLimit: number; // MB
}

export interface TestResult {
  status: 'passed' | 'failed' | 'timeout' | 'memory_exceeded' | 'runtime_error' | 'compilation_error';
  actualOutput: string;
  errorMessage: string;
  executionTime: number;
  memoryUsed: number;
  pointsEarned: number;
}

export class CodeExecutionService {
  private readonly tempDir = path.join(process.cwd(), 'temp');
  private readonly maxConcurrentExecutions = 5;
  private currentExecutions = 0;

  constructor() {
    this.ensureTempDir();
  }

  private async ensureTempDir(): Promise<void> {
    try {
      await fs.access(this.tempDir);
    } catch {
      await fs.mkdir(this.tempDir, { recursive: true });
    }
  }

  async executeCode(
    code: string,
    testCases: TestCase[],
    config: ExecutionConfig
  ): Promise<TestResult[]> {
    if (this.currentExecutions >= this.maxConcurrentExecutions) {
      throw new Error('Maximum concurrent executions reached. Please try again later.');
    }

    this.currentExecutions++;
    
    try {
      const executionId = uuidv4();

      // Handle different languages
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
    } finally {
      this.currentExecutions--;
    }
  }

  private async compileC(sourceFile: string, executableFile: string): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      const compiler = spawn('gcc', [
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
        } else {
          resolve({ success: false, error: errorOutput });
        }
      });

      compiler.on('error', (error) => {
        resolve({ success: false, error: error.message });
      });
    });
  }

  private async compileCpp(sourceFile: string, executableFile: string): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      const compiler = spawn('g++', [
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
        } else {
          resolve({ success: false, error: errorOutput });
        }
      });

      compiler.on('error', (error) => {
        resolve({ success: false, error: error.message });
      });
    });
  }

  // C Language Execution
  private async executeCCode(code: string, testCases: TestCase[], config: ExecutionConfig, executionId: string): Promise<TestResult[]> {
    const sourceFile = path.join(this.tempDir, `${executionId}.c`);
    const executableFile = path.join(this.tempDir, `${executionId}`);

    // Write source code to file
    await fs.writeFile(sourceFile, code);

    // Compile the code
    const compilationResult = await this.compileC(sourceFile, executableFile);
    
    if (!compilationResult.success) {
      await this.cleanup([sourceFile]);
      return testCases.map((_testCase) => ({
        status: 'compilation_error' as const,
        actualOutput: '',
        errorMessage: compilationResult.error || 'Compilation failed',
        executionTime: 0,
        memoryUsed: 0,
        pointsEarned: 0
      }));
    }

    // Execute against each test case
    const results: TestResult[] = [];
    for (const testCase of testCases) {
      const result = await this.runExecutable(executableFile, testCase, config.timeLimit);
      results.push(result);
    }

    // Cleanup
    await this.cleanup([sourceFile, executableFile]);
    return results;
  }

  // C++ Language Execution
  private async executeCppCode(code: string, testCases: TestCase[], config: ExecutionConfig, executionId: string): Promise<TestResult[]> {
    const sourceFile = path.join(this.tempDir, `${executionId}.cpp`);
    const executableFile = path.join(this.tempDir, `${executionId}`);

    // Write source code to file
    await fs.writeFile(sourceFile, code);

    // Compile the code
    const compilationResult = await this.compileCpp(sourceFile, executableFile);
    
    if (!compilationResult.success) {
      await this.cleanup([sourceFile]);
      return testCases.map((_testCase) => ({
        status: 'compilation_error' as const,
        actualOutput: '',
        errorMessage: compilationResult.error || 'Compilation failed',
        executionTime: 0,
        memoryUsed: 0,
        pointsEarned: 0
      }));
    }

    // Execute against each test case
    const results: TestResult[] = [];
    for (const testCase of testCases) {
      const result = await this.runExecutable(executableFile, testCase, config.timeLimit);
      results.push(result);
    }

    // Cleanup
    await this.cleanup([sourceFile, executableFile]);
    return results;
  }

  // Python Language Execution
  private async executePythonCode(code: string, testCases: TestCase[], config: ExecutionConfig, executionId: string): Promise<TestResult[]> {
    const sourceFile = path.join(this.tempDir, `${executionId}.py`);

    // Write source code to file
    await fs.writeFile(sourceFile, code);

    // Execute against each test case
    const results: TestResult[] = [];
    for (const testCase of testCases) {
      const result = await this.runPython(sourceFile, testCase, config.timeLimit);
      results.push(result);
    }

    // Cleanup
    await this.cleanup([sourceFile]);
    return results;
  }

  // JavaScript Language Execution
  private async executeJavaScriptCode(code: string, testCases: TestCase[], config: ExecutionConfig, executionId: string): Promise<TestResult[]> {
    const sourceFile = path.join(this.tempDir, `${executionId}.js`);

    // Write source code to file
    await fs.writeFile(sourceFile, code);

    // Execute against each test case
    const results: TestResult[] = [];
    for (const testCase of testCases) {
      const result = await this.runJavaScript(sourceFile, testCase, config.timeLimit);
      results.push(result);
    }

    // Cleanup
    await this.cleanup([sourceFile]);
    return results;
  }

  private async runExecutable(
    executableFile: string,
    testCase: TestCase,
    timeLimit: number
  ): Promise<TestResult> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      let timedOut = false;
      
      const child = spawn(executableFile, [], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      // Set up timeout
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

      // Send input to the program
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
        if (timedOut) return;
        
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

        // Compare output
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
        if (timedOut) return;
        
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

  private async runPython(
    sourceFile: string,
    testCase: TestCase,
    timeLimit: number
  ): Promise<TestResult> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      let timedOut = false;
      
      const child = spawn('python3', [sourceFile], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      // Set up timeout
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

      // Send input to the program
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
        if (timedOut) return;
        
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

        // Compare output
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
        if (timedOut) return;
        
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

  private async runJavaScript(
    sourceFile: string,
    testCase: TestCase,
    timeLimit: number
  ): Promise<TestResult> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      let timedOut = false;
      
      const child = spawn('node', [sourceFile], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      // Set up timeout
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

      // Send input to the program
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
        if (timedOut) return;
        
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

        // Compare output
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
        if (timedOut) return;
        
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

  private async cleanup(files: string[]): Promise<void> {
    for (const file of files) {
      try {
        await fs.unlink(file);
      } catch (error) {
        // Ignore cleanup errors
        console.warn(`Failed to cleanup file ${file}:`, error);
      }
    }
  }

  async saveExecutionResults(
    submissionId: string,
    testCases: TestCase[],
    results: TestResult[]
  ): Promise<void> {
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      const result = results[i];

      if (testCase && result) {
        await ExecutionResult.create({
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

export const codeExecutionService = new CodeExecutionService();