import { Request, Response } from 'express';
import { Assignment, TestCase, Submission, ExecutionResult, User } from '../models';
import { codeExecutionService } from '../services/codeExecutionService';

// Helper function to validate teacher access
const validateTeacherAccess = (req: Request, res: Response): boolean => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required'
      }
    });
    return false;
  }

  if (req.user.role !== 'teacher') {
    res.status(403).json({
      success: false,
      error: {
        code: 'ACCESS_DENIED',
        message: 'Only teachers can perform this action'
      }
    });
    return false;
  }

  return true;
};

// Helper function to validate student access
const validateStudentAccess = (req: Request, res: Response): boolean => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required'
      }
    });
    return false;
  }

  if (req.user.role !== 'student') {
    res.status(403).json({
      success: false,
      error: {
        code: 'ACCESS_DENIED',
        message: 'Only students can perform this action'
      }
    });
    return false;
  }

  return true;
};

/**
 * POST /api/classes/:classId/assignments
 * Create a new assignment with test cases
 */
export const createAssignmentWithTestCases = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!validateTeacherAccess(req, res)) return;

    const { classId } = req.params;
    const {
      title,
      problem_description,
      language = 'c',
      time_limit = 5000,
      memory_limit = 128,
      due_date = null,
      allow_late_submission = false,
      late_penalty_per_day = 10,
      max_late_days = 0,
      is_published = true,
      test_cases = []
    } = req.body;

    if (!classId) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Class ID is required'
        }
      });
      return;
    }

    // Validate required fields
    if (!title || !problem_description) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Title and problem description are required'
        }
      });
      return;
    }

    // Validate test cases
    if (!Array.isArray(test_cases) || test_cases.length === 0) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'At least one test case is required'
        }
      });
      return;
    }

    // Calculate total points from test cases
    const total_points = test_cases.reduce((sum, tc) => sum + (tc.points || 1), 0);

    // Create assignment with deadline fields
    const assignment = await Assignment.create({
      class_id: classId,
      title: title.trim(),
      problem_description: problem_description.trim(),
      language,
      time_limit,
      memory_limit,
      total_points,
      due_date: due_date ? new Date(due_date) : null,
      allow_late_submission,
      late_penalty_per_day,
      max_late_days,
      is_published,
      published_at: is_published ? new Date() : null
    });

    // Create test cases
    const createdTestCases = [];
    for (const testCaseData of test_cases) {
      const testCase = await TestCase.create({
        assignment_id: assignment.id,
        input: testCaseData.input || '',
        expected_output: testCaseData.expected_output || '',
        is_hidden: testCaseData.is_hidden || false,
        points: testCaseData.points || 1,
        time_limit: testCaseData.time_limit || time_limit,
        memory_limit: testCaseData.memory_limit || memory_limit
      });
      createdTestCases.push(testCase);
    }

    res.status(201).json({
      success: true,
      data: {
        assignment: {
          ...assignment.toJSON(),
          test_cases: createdTestCases
        }
      }
    });
  } catch (error) {
    console.error('Create assignment with test cases error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create assignment'
      }
    });
  }
};

/**
 * GET /api/classes/:classId/assignments/:assignmentId/test-cases
 * Get test cases for an assignment (visible ones for students, all for teachers)
 */
export const getAssignmentTestCases = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
      return;
    }

    const { assignmentId } = req.params;
    const isTeacher = req.user.role === 'teacher';

    // Build query conditions
    const whereConditions: any = { assignment_id: assignmentId };
    
    // Students can only see visible test cases
    if (!isTeacher) {
      whereConditions.is_hidden = false;
    }

    const testCases = await TestCase.findAll({
      where: whereConditions,
      order: [['created_at', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        test_cases: testCases
      }
    });
  } catch (error) {
    console.error('Get assignment test cases error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch test cases'
      }
    });
  }
};

/**
 * POST /api/classes/:classId/assignments/:assignmentId/submit
 * Submit code for an assignment and execute it
 */
export const submitAssignmentCode = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!validateStudentAccess(req, res)) return;

    const { classId, assignmentId } = req.params;
    const { code, language } = req.body;

    if (!classId || !assignmentId) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Class ID and Assignment ID are required'
        }
      });
      return;
    }

    if (!code || !code.trim()) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Code is required'
        }
      });
      return;
    }

    // Get assignment with test cases
    const assignment = await Assignment.findByPk(assignmentId, {
      include: [{
        model: TestCase,
        as: 'testCases'
      }]
    });

    if (!assignment) {
      res.status(404).json({
        success: false,
        error: {
          code: 'ASSIGNMENT_NOT_FOUND',
          message: 'Assignment not found'
        }
      });
      return;
    }

    // Use assignment language if not provided
    const submissionLanguage = language || assignment.language;

    // Create new submission (for history tracking)
    const submission = await Submission.create({
      assignment_id: assignmentId,
      student_id: req.user!.id,
      code: code.trim(),
      language: submissionLanguage,
      status: 'pending',
      total_points: assignment.total_points,
      points_earned: 0
    });

    // Delete existing execution results for this submission
    await ExecutionResult.destroy({
      where: { submission_id: submission.id }
    });

    // Execute code asynchronously
    setImmediate(async () => {
      try {
        // Update status to running
        await submission.update({ status: 'running' });

        // Execute code against test cases
        const results = await codeExecutionService.executeCode(
          code.trim(),
          assignment.testCases || [],
          {
            language: submissionLanguage,
            timeLimit: assignment.time_limit,
            memoryLimit: assignment.memory_limit
          }
        );

        // Save execution results
        await codeExecutionService.saveExecutionResults(
          submission.id,
          assignment.testCases || [],
          results
        );

        // Calculate total points earned
        const totalPointsEarned = results.reduce((sum, result) => sum + result.pointsEarned, 0);
        
        // Check if there were any compilation errors
        const hasCompilationError = results.some(result => result.status === 'compilation_error');
        const compilationError = hasCompilationError 
          ? results.find(result => result.status === 'compilation_error')?.errorMessage || null
          : null;

        // Update submission with final results
        await submission.update({
          status: hasCompilationError ? 'failed' : 'completed',
          points_earned: totalPointsEarned,
          compilation_error: compilationError
        });
      } catch (error) {
        console.error('Code execution error:', error);
        await submission.update({
          status: 'failed',
          compilation_error: 'Internal execution error'
        });
      }
    });

    res.status(201).json({
      success: true,
      data: {
        submission: {
          id: submission.id,
          status: 'pending',
          message: 'Code submitted successfully. Execution in progress...'
        }
      }
    });
  } catch (error) {
    console.error('Submit assignment code error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to submit code'
      }
    });
  }
};

/**
 * GET /api/classes/:classId/assignments/:assignmentId/submissions
 * Get all submissions for an assignment (teachers) or student's own submission
 */
export const getAssignmentSubmissions = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
      return;
    }

    const { assignmentId } = req.params;
    const isTeacher = req.user.role === 'teacher';

    const whereConditions: any = { assignment_id: assignmentId };
    
    // Students can only see their own submissions
    if (!isTeacher) {
      whereConditions.student_id = req.user.id;
    }

    const submissions = await Submission.findAll({
      where: whereConditions,
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'email']
        },
        {
          model: ExecutionResult,
          as: 'executionResults',
          include: [{
            model: TestCase,
            as: 'testCase',
            attributes: ['id', 'is_hidden', 'points']
          }]
        }
      ],
      order: [['submitted_at', 'DESC']]
    });

    // For students, filter out hidden test case results
    const filteredSubmissions = submissions.map(submission => {
      if (isTeacher) {
        return submission;
      }

      // Filter execution results to only show visible test cases for students
      const filteredResults = submission.executionResults?.filter(
        result => !result.testCase?.is_hidden
      ) || [];

      return {
        ...submission.toJSON(),
        executionResults: filteredResults
      };
    });

    res.json({
      success: true,
      data: {
        submissions: filteredSubmissions
      }
    });
  } catch (error) {
    console.error('Get assignment submissions error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch submissions'
      }
    });
  }
};

/**
 * GET /api/classes/:classId/assignments/:assignmentId/submissions/:submissionId
 * Get detailed submission with execution results
 */
export const getSubmissionDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
      return;
    }

    const { submissionId } = req.params;
    const isTeacher = req.user.role === 'teacher';

    const whereConditions: any = { id: submissionId };
    
    // Students can only see their own submissions
    if (!isTeacher) {
      whereConditions.student_id = req.user.id;
    }

    const submission = await Submission.findOne({
      where: whereConditions,
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Assignment,
          as: 'assignment',
          attributes: ['id', 'title', 'language', 'total_points']
        },
        {
          model: ExecutionResult,
          as: 'executionResults',
          include: [{
            model: TestCase,
            as: 'testCase'
          }]
        }
      ]
    });

    if (!submission) {
      res.status(404).json({
        success: false,
        error: {
          code: 'SUBMISSION_NOT_FOUND',
          message: 'Submission not found'
        }
      });
      return;
    }

    // For students, filter out hidden test case results
    const filteredSubmission = submission.toJSON() as any;
    if (!isTeacher && submission.executionResults) {
      filteredSubmission.executionResults = submission.executionResults.filter(
        result => !result.testCase?.is_hidden
      ) || [];
    }

    res.json({
      success: true,
      data: {
        submission: filteredSubmission
      }
    });
  } catch (error) {
    console.error('Get submission details error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch submission details'
      }
    });
  }
};

/**
 * GET /api/classes/:classId/assignments
 * Get assignments for a class (both teachers and students can access)
 */
export const getClassAssignments = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
      return;
    }

    const { classId } = req.params;

    if (!classId) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Class ID is required'
        }
      });
      return;
    }

    // Get assignments for the class
    const whereConditions: any = { class_id: classId };
    
    // Students can only see published assignments
    if (req.user.role === 'student') {
      whereConditions.is_published = true;
    }

    const assignments = await Assignment.findAll({
      where: whereConditions,
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        assignments
      }
    });
  } catch (error) {
    console.error('Get class assignments error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch assignments'
      }
    });
  }
};
/**
 * GET /api/classes/:classId/assignments/:assignmentId/submission
 * Get student's own submission for an assignment
 */
export const getStudentSubmission = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
      return;
    }

    const { classId, assignmentId } = req.params;

    if (!classId || !assignmentId) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Class ID and Assignment ID are required'
        }
      });
      return;
    }

    // Find the student's latest submission for this assignment
    const submission = await Submission.findOne({
      where: { 
        assignment_id: assignmentId,
        student_id: req.user.id
      },
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Assignment,
          as: 'assignment',
          attributes: ['id', 'title', 'language', 'total_points']
        },
        {
          model: ExecutionResult,
          as: 'executionResults',
          include: [{
            model: TestCase,
            as: 'testCase',
            where: { is_hidden: false }, // Only show visible test cases to students
            required: false
          }]
        }
      ],
      order: [['submitted_at', 'DESC']] // Get the latest submission
    });

    if (!submission) {
      res.status(404).json({
        success: false,
        error: {
          code: 'SUBMISSION_NOT_FOUND',
          message: 'No submission found for this assignment'
        }
      });
      return;
    }

    res.json({
      success: true,
      data: {
        submission
      }
    });
  } catch (error) {
    console.error('Get student submission error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch submission'
      }
    });
  }
};

/**
 * GET /api/assignments/:assignmentId/submission-status
 * Check if student has submitted for an assignment (lightweight endpoint for schedule)
 */
export const getAssignmentSubmissionStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
      return;
    }

    const { assignmentId } = req.params;

    if (!assignmentId) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Assignment ID is required'
        }
      });
      return;
    }

    // Find the student's submission for this assignment (lightweight query)
    const submission = await Submission.findOne({
      where: { 
        assignment_id: assignmentId,
        student_id: req.user.id
      },
      attributes: ['id', 'status', 'points_earned', 'submitted_at']
    });

    res.json({
      success: true,
      data: {
        hasSubmission: !!submission,
        submission: submission || null
      }
    });
  } catch (error) {
    console.error('Get assignment submission status error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch submission status'
      }
    });
  }
};

/**
 * PUT /api/classes/:classId/assignments/:assignmentId
 * Update an assignment (teachers only)
 */
export const updateAssignment = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!validateTeacherAccess(req, res)) return;

    const { classId, assignmentId } = req.params;
    const { title, problem_description, language, total_points, due_date, allow_late_submission, late_penalty_per_day, max_late_days, is_published } = req.body;

    if (!classId || !assignmentId) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Class ID and Assignment ID are required'
        }
      });
      return;
    }

    // Find the assignment and verify ownership
    const assignment = await Assignment.findOne({
      where: { 
        id: assignmentId,
        class_id: classId
      },
      include: [{
        model: require('../models/Class').Class,
        as: 'class',
        where: { teacher_id: req.user!.id }
      }]
    });

    if (!assignment) {
      res.status(404).json({
        success: false,
        error: {
          code: 'ASSIGNMENT_NOT_FOUND',
          message: 'Assignment not found or you do not have permission to update it'
        }
      });
      return;
    }

    // Update the assignment
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (problem_description !== undefined) updateData.problem_description = problem_description;
    if (language !== undefined) updateData.language = language;
    if (total_points !== undefined) updateData.total_points = total_points;
    if (due_date !== undefined) updateData.due_date = due_date;
    if (allow_late_submission !== undefined) updateData.allow_late_submission = allow_late_submission;
    if (late_penalty_per_day !== undefined) updateData.late_penalty_per_day = late_penalty_per_day;
    if (max_late_days !== undefined) updateData.max_late_days = max_late_days;
    if (is_published !== undefined) updateData.is_published = is_published;

    await assignment.update(updateData);

    res.json({
      success: true,
      data: {
        assignment: await assignment.reload()
      }
    });
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update assignment'
      }
    });
  }
};

/**
 * DELETE /api/classes/:classId/assignments/:assignmentId
 * Delete an assignment (teachers only)
 */
export const deleteAssignment = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!validateTeacherAccess(req, res)) return;

    const { classId, assignmentId } = req.params;

    if (!classId || !assignmentId) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Class ID and Assignment ID are required'
        }
      });
      return;
    }

    // Find the assignment and verify ownership
    const assignment = await Assignment.findOne({
      where: { 
        id: assignmentId,
        class_id: classId
      },
      include: [{
        model: require('../models/Class').Class,
        as: 'class',
        where: { teacher_id: req.user!.id }
      }]
    });

    if (!assignment) {
      res.status(404).json({
        success: false,
        error: {
          code: 'ASSIGNMENT_NOT_FOUND',
          message: 'Assignment not found or you do not have permission to delete it'
        }
      });
      return;
    }

    // Delete related data first (cascade delete)
    await ExecutionResult.destroy({
      where: {
        submission_id: {
          [require('sequelize').Op.in]: await Submission.findAll({
            where: { assignment_id: assignmentId },
            attributes: ['id']
          }).then(submissions => submissions.map(s => s.id))
        }
      }
    });

    await Submission.destroy({
      where: { assignment_id: assignmentId }
    });

    await TestCase.destroy({
      where: { assignment_id: assignmentId }
    });

    // Finally delete the assignment
    await assignment.destroy();

    res.json({
      success: true,
      data: {
        message: 'Assignment deleted successfully'
      }
    });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete assignment'
      }
    });
  }
};
/**
 * GET /api/classes/:classId/assignments/:assignmentId/submission-history
 * Get all submissions history for a student for a specific assignment
 */
export const getSubmissionHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
      return;
    }

    const { classId, assignmentId } = req.params;

    if (!classId || !assignmentId) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Class ID and Assignment ID are required'
        }
      });
      return;
    }

    // Find all submissions for this student and assignment, ordered by submission time
    const submissions = await Submission.findAll({
      where: { 
        assignment_id: assignmentId,
        student_id: req.user.id
      },
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Assignment,
          as: 'assignment',
          attributes: ['id', 'title', 'language', 'total_points']
        },
        {
          model: ExecutionResult,
          as: 'executionResults',
          include: [{
            model: TestCase,
            as: 'testCase',
            where: { is_hidden: false }, // Only show visible test cases to students
            required: false
          }]
        }
      ],
      order: [['submitted_at', 'DESC']] // Most recent first
    });

    res.json({
      success: true,
      data: {
        submissions,
        total: submissions.length
      }
    });
  } catch (error) {
    console.error('Get submission history error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch submission history'
      }
    });
  }
};