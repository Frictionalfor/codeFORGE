"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubmissionHistory = exports.deleteAssignment = exports.updateAssignment = exports.getAssignmentSubmissionStatus = exports.getStudentSubmission = exports.getClassAssignments = exports.getSubmissionDetails = exports.getAssignmentSubmissions = exports.submitAssignmentCode = exports.getAssignmentTestCases = exports.createAssignmentWithTestCases = void 0;
const models_1 = require("../models");
const codeExecutionService_1 = require("../services/codeExecutionService");
const validateTeacherAccess = (req, res) => {
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
const validateStudentAccess = (req, res) => {
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
const createAssignmentWithTestCases = async (req, res) => {
    try {
        if (!validateTeacherAccess(req, res))
            return;
        const { classId } = req.params;
        const { title, problem_description, language = 'c', time_limit = 5000, memory_limit = 128, due_date = null, allow_late_submission = false, late_penalty_per_day = 10, max_late_days = 0, is_published = true, test_cases = [] } = req.body;
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
        const total_points = test_cases.reduce((sum, tc) => sum + (tc.points || 1), 0);
        const assignment = await models_1.Assignment.create({
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
        const createdTestCases = [];
        for (const testCaseData of test_cases) {
            const testCase = await models_1.TestCase.create({
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
    }
    catch (error) {
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
exports.createAssignmentWithTestCases = createAssignmentWithTestCases;
const getAssignmentTestCases = async (req, res) => {
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
        const whereConditions = { assignment_id: assignmentId };
        if (!isTeacher) {
            whereConditions.is_hidden = false;
        }
        const testCases = await models_1.TestCase.findAll({
            where: whereConditions,
            order: [['created_at', 'ASC']]
        });
        res.json({
            success: true,
            data: {
                test_cases: testCases
            }
        });
    }
    catch (error) {
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
exports.getAssignmentTestCases = getAssignmentTestCases;
const submitAssignmentCode = async (req, res) => {
    try {
        if (!validateStudentAccess(req, res))
            return;
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
        const assignment = await models_1.Assignment.findByPk(assignmentId, {
            include: [{
                    model: models_1.TestCase,
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
        const submissionLanguage = language || assignment.language;
        const submission = await models_1.Submission.create({
            assignment_id: assignmentId,
            student_id: req.user.id,
            code: code.trim(),
            language: submissionLanguage,
            status: 'pending',
            total_points: assignment.total_points,
            points_earned: 0
        });
        await models_1.ExecutionResult.destroy({
            where: { submission_id: submission.id }
        });
        setImmediate(async () => {
            try {
                await submission.update({ status: 'running' });
                const results = await codeExecutionService_1.codeExecutionService.executeCode(code.trim(), assignment.testCases || [], {
                    language: submissionLanguage,
                    timeLimit: assignment.time_limit,
                    memoryLimit: assignment.memory_limit
                });
                await codeExecutionService_1.codeExecutionService.saveExecutionResults(submission.id, assignment.testCases || [], results);
                const totalPointsEarned = results.reduce((sum, result) => sum + result.pointsEarned, 0);
                const hasCompilationError = results.some(result => result.status === 'compilation_error');
                const compilationError = hasCompilationError
                    ? results.find(result => result.status === 'compilation_error')?.errorMessage || null
                    : null;
                await submission.update({
                    status: hasCompilationError ? 'failed' : 'completed',
                    points_earned: totalPointsEarned,
                    compilation_error: compilationError
                });
            }
            catch (error) {
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
    }
    catch (error) {
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
exports.submitAssignmentCode = submitAssignmentCode;
const getAssignmentSubmissions = async (req, res) => {
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
        const whereConditions = { assignment_id: assignmentId };
        if (!isTeacher) {
            whereConditions.student_id = req.user.id;
        }
        const submissions = await models_1.Submission.findAll({
            where: whereConditions,
            include: [
                {
                    model: models_1.User,
                    as: 'student',
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: models_1.ExecutionResult,
                    as: 'executionResults',
                    include: [{
                            model: models_1.TestCase,
                            as: 'testCase',
                            attributes: ['id', 'is_hidden', 'points']
                        }]
                }
            ],
            order: [['submitted_at', 'DESC']]
        });
        const filteredSubmissions = submissions.map(submission => {
            if (isTeacher) {
                return submission;
            }
            const filteredResults = submission.executionResults?.filter(result => !result.testCase?.is_hidden) || [];
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
    }
    catch (error) {
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
exports.getAssignmentSubmissions = getAssignmentSubmissions;
const getSubmissionDetails = async (req, res) => {
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
        const whereConditions = { id: submissionId };
        if (!isTeacher) {
            whereConditions.student_id = req.user.id;
        }
        const submission = await models_1.Submission.findOne({
            where: whereConditions,
            include: [
                {
                    model: models_1.User,
                    as: 'student',
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: models_1.Assignment,
                    as: 'assignment',
                    attributes: ['id', 'title', 'language', 'total_points']
                },
                {
                    model: models_1.ExecutionResult,
                    as: 'executionResults',
                    include: [{
                            model: models_1.TestCase,
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
        const filteredSubmission = submission.toJSON();
        if (!isTeacher && submission.executionResults) {
            filteredSubmission.executionResults = submission.executionResults.filter(result => !result.testCase?.is_hidden) || [];
        }
        res.json({
            success: true,
            data: {
                submission: filteredSubmission
            }
        });
    }
    catch (error) {
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
exports.getSubmissionDetails = getSubmissionDetails;
const getClassAssignments = async (req, res) => {
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
        const whereConditions = { class_id: classId };
        if (req.user.role === 'student') {
            whereConditions.is_published = true;
        }
        const assignments = await models_1.Assignment.findAll({
            where: whereConditions,
            order: [['created_at', 'DESC']]
        });
        res.json({
            success: true,
            data: {
                assignments
            }
        });
    }
    catch (error) {
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
exports.getClassAssignments = getClassAssignments;
const getStudentSubmission = async (req, res) => {
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
        const submission = await models_1.Submission.findOne({
            where: {
                assignment_id: assignmentId,
                student_id: req.user.id
            },
            include: [
                {
                    model: models_1.User,
                    as: 'student',
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: models_1.Assignment,
                    as: 'assignment',
                    attributes: ['id', 'title', 'language', 'total_points']
                },
                {
                    model: models_1.ExecutionResult,
                    as: 'executionResults',
                    include: [{
                            model: models_1.TestCase,
                            as: 'testCase',
                            where: { is_hidden: false },
                            required: false
                        }]
                }
            ],
            order: [['submitted_at', 'DESC']]
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
    }
    catch (error) {
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
exports.getStudentSubmission = getStudentSubmission;
const getAssignmentSubmissionStatus = async (req, res) => {
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
        const submission = await models_1.Submission.findOne({
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
    }
    catch (error) {
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
exports.getAssignmentSubmissionStatus = getAssignmentSubmissionStatus;
const updateAssignment = async (req, res) => {
    try {
        if (!validateTeacherAccess(req, res))
            return;
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
        const assignment = await models_1.Assignment.findOne({
            where: {
                id: assignmentId,
                class_id: classId
            },
            include: [{
                    model: require('../models/Class').Class,
                    as: 'class',
                    where: { teacher_id: req.user.id }
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
        const updateData = {};
        if (title !== undefined)
            updateData.title = title;
        if (problem_description !== undefined)
            updateData.problem_description = problem_description;
        if (language !== undefined)
            updateData.language = language;
        if (total_points !== undefined)
            updateData.total_points = total_points;
        if (due_date !== undefined)
            updateData.due_date = due_date;
        if (allow_late_submission !== undefined)
            updateData.allow_late_submission = allow_late_submission;
        if (late_penalty_per_day !== undefined)
            updateData.late_penalty_per_day = late_penalty_per_day;
        if (max_late_days !== undefined)
            updateData.max_late_days = max_late_days;
        if (is_published !== undefined)
            updateData.is_published = is_published;
        await assignment.update(updateData);
        res.json({
            success: true,
            data: {
                assignment: await assignment.reload()
            }
        });
    }
    catch (error) {
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
exports.updateAssignment = updateAssignment;
const deleteAssignment = async (req, res) => {
    try {
        if (!validateTeacherAccess(req, res))
            return;
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
        const assignment = await models_1.Assignment.findOne({
            where: {
                id: assignmentId,
                class_id: classId
            },
            include: [{
                    model: require('../models/Class').Class,
                    as: 'class',
                    where: { teacher_id: req.user.id }
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
        await models_1.ExecutionResult.destroy({
            where: {
                submission_id: {
                    [require('sequelize').Op.in]: await models_1.Submission.findAll({
                        where: { assignment_id: assignmentId },
                        attributes: ['id']
                    }).then(submissions => submissions.map(s => s.id))
                }
            }
        });
        await models_1.Submission.destroy({
            where: { assignment_id: assignmentId }
        });
        await models_1.TestCase.destroy({
            where: { assignment_id: assignmentId }
        });
        await assignment.destroy();
        res.json({
            success: true,
            data: {
                message: 'Assignment deleted successfully'
            }
        });
    }
    catch (error) {
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
exports.deleteAssignment = deleteAssignment;
const getSubmissionHistory = async (req, res) => {
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
        const submissions = await models_1.Submission.findAll({
            where: {
                assignment_id: assignmentId,
                student_id: req.user.id
            },
            include: [
                {
                    model: models_1.User,
                    as: 'student',
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: models_1.Assignment,
                    as: 'assignment',
                    attributes: ['id', 'title', 'language', 'total_points']
                },
                {
                    model: models_1.ExecutionResult,
                    as: 'executionResults',
                    include: [{
                            model: models_1.TestCase,
                            as: 'testCase',
                            where: { is_hidden: false },
                            required: false
                        }]
                }
            ],
            order: [['submitted_at', 'DESC']]
        });
        res.json({
            success: true,
            data: {
                submissions,
                total: submissions.length
            }
        });
    }
    catch (error) {
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
exports.getSubmissionHistory = getSubmissionHistory;
//# sourceMappingURL=enhancedAssignmentController.js.map