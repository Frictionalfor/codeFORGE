"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClassSubmissions = exports.removeStudentFromClass = exports.getClassStudents = exports.getAllTeacherSubmissions = exports.regenerateJoinCode = exports.getStudentSubmission = exports.submitAssignmentCode = exports.getAssignmentById = exports.getClassAssignments = exports.createAssignmentInClass = exports.getAvailableClasses = exports.getUserClasses = exports.joinClassByCode = exports.getClassByJoinCode = exports.createClass = void 0;
const sequelize_1 = require("sequelize");
const Class_1 = require("../models/Class");
const User_1 = require("../models/User");
const Enrollment_1 = require("../models/Enrollment");
const Assignment_1 = require("../models/Assignment");
const Submission_1 = require("../models/Submission");
const userService_1 = require("../services/userService");
const generateUniqueJoinCode = async () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let attempts = 0;
    const maxAttempts = 10;
    while (attempts < maxAttempts) {
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        const existing = await Class_1.Class.findOne({ where: { join_code: code } });
        if (!existing) {
            return code;
        }
        attempts++;
    }
    throw new Error('Failed to generate unique join code after multiple attempts');
};
const validateTeacherAccess = async (req, res) => {
    if (!req.firebaseUser?.uid) {
        res.status(401).json({
            success: false,
            error: {
                code: 'AUTHENTICATION_REQUIRED',
                message: 'Authentication required'
            }
        });
        return { isValid: false };
    }
    const userProfile = await userService_1.userService.getUserProfile(req.firebaseUser.uid);
    if (!userProfile) {
        res.status(404).json({
            success: false,
            error: {
                code: 'USER_NOT_FOUND',
                message: 'User profile not found'
            }
        });
        return { isValid: false };
    }
    if (userProfile.role !== 'teacher') {
        res.status(403).json({
            success: false,
            error: {
                code: 'INSUFFICIENT_PERMISSIONS',
                message: 'Only teachers can perform this action'
            }
        });
        return { isValid: false };
    }
    return { isValid: true, userProfile };
};
const validateStudentAccess = async (req, res) => {
    if (!req.firebaseUser?.uid) {
        res.status(401).json({
            success: false,
            error: {
                code: 'AUTHENTICATION_REQUIRED',
                message: 'Authentication required'
            }
        });
        return { isValid: false };
    }
    const userProfile = await userService_1.userService.getUserProfile(req.firebaseUser.uid);
    if (!userProfile) {
        res.status(404).json({
            success: false,
            error: {
                code: 'USER_NOT_FOUND',
                message: 'User profile not found'
            }
        });
        return { isValid: false };
    }
    if (userProfile.role !== 'student') {
        res.status(403).json({
            success: false,
            error: {
                code: 'INSUFFICIENT_PERMISSIONS',
                message: 'Only students can perform this action'
            }
        });
        return { isValid: false };
    }
    return { isValid: true, userProfile };
};
const createClass = async (req, res) => {
    try {
        const validation = await validateTeacherAccess(req, res);
        if (!validation.isValid || !validation.userProfile)
            return;
        const { name, description, visibility = 'private', max_students = 50, join_method = 'code' } = req.body;
        if (!name || !description) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'MISSING_REQUIRED_FIELDS',
                    message: 'Name and description are required'
                }
            });
            return;
        }
        const joinCode = await generateUniqueJoinCode();
        const newClass = await Class_1.Class.create({
            teacher_id: validation.userProfile.id,
            name: name.trim(),
            description: description.trim(),
            visibility,
            join_code: joinCode,
            max_students,
            join_method,
            is_active: true
        });
        res.status(201).json({
            success: true,
            data: {
                class: newClass
            },
            message: 'Class created successfully'
        });
    }
    catch (error) {
        console.error('Create class error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to create class'
            }
        });
    }
};
exports.createClass = createClass;
const getClassByJoinCode = async (req, res) => {
    try {
        const validation = await validateStudentAccess(req, res);
        if (!validation.isValid || !validation.userProfile)
            return;
        const joinCode = req.params['code']?.toUpperCase();
        if (!joinCode) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_PARAMETERS',
                    message: 'Join code is required'
                }
            });
            return;
        }
        const classInstance = await Class_1.Class.findOne({
            where: {
                join_code: joinCode,
                is_active: true
            },
            include: [
                {
                    model: User_1.User,
                    as: 'teacher',
                    attributes: ['id', 'name', 'email']
                }
            ]
        });
        if (!classInstance) {
            res.status(404).json({
                success: false,
                error: {
                    code: 'CLASS_NOT_FOUND',
                    message: 'Invalid join code or class is no longer active'
                }
            });
            return;
        }
        const existingEnrollment = await Enrollment_1.Enrollment.findOne({
            where: {
                student_id: validation.userProfile.id,
                class_id: classInstance.id,
                status: { [sequelize_1.Op.in]: ['active', 'pending'] }
            }
        });
        const currentStudents = await Enrollment_1.Enrollment.count({
            where: {
                class_id: classInstance.id,
                status: 'active'
            }
        });
        const canJoin = !existingEnrollment &&
            (!classInstance.max_students || currentStudents < classInstance.max_students);
        res.json({
            success: true,
            data: {
                id: classInstance.id,
                name: classInstance.name,
                description: classInstance.description,
                teacher_name: classInstance.teacher?.name || 'Unknown',
                current_students: currentStudents,
                max_students: classInstance.max_students,
                can_join: canJoin,
                already_enrolled: !!existingEnrollment,
                at_capacity: classInstance.max_students ? currentStudents >= classInstance.max_students : false,
                created_at: classInstance.created_at
            }
        });
    }
    catch (error) {
        console.error('Get class by join code error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to retrieve class information'
            }
        });
    }
};
exports.getClassByJoinCode = getClassByJoinCode;
const joinClassByCode = async (req, res) => {
    try {
        if (!validateStudentAccess(req, res))
            return;
        const { join_code } = req.body;
        if (!join_code?.trim()) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Join code is required'
                }
            });
            return;
        }
        const joinCodeUpper = join_code.trim().toUpperCase();
        const classInstance = await Class_1.Class.findOne({
            where: {
                join_code: joinCodeUpper,
                is_active: true
            },
            include: [
                {
                    model: User_1.User,
                    as: 'teacher',
                    attributes: ['id', 'name', 'email']
                }
            ]
        });
        if (!classInstance) {
            res.status(404).json({
                success: false,
                error: {
                    code: 'INVALID_JOIN_CODE',
                    message: 'Invalid join code or class is no longer active'
                }
            });
            return;
        }
        const existingEnrollment = await Enrollment_1.Enrollment.findOne({
            where: {
                student_id: req.user.id,
                class_id: classInstance.id,
                status: { [sequelize_1.Op.in]: ['active', 'pending'] }
            }
        });
        if (existingEnrollment) {
            res.status(409).json({
                success: false,
                error: {
                    code: 'ALREADY_ENROLLED',
                    message: 'You are already enrolled in this class'
                }
            });
            return;
        }
        if (classInstance.max_students) {
            const currentStudents = await Enrollment_1.Enrollment.count({
                where: {
                    class_id: classInstance.id,
                    status: 'active'
                }
            });
            if (currentStudents >= classInstance.max_students) {
                res.status(409).json({
                    success: false,
                    error: {
                        code: 'CLASS_FULL',
                        message: 'This class has reached its maximum capacity'
                    }
                });
                return;
            }
        }
        const enrollment = await Enrollment_1.Enrollment.create({
            student_id: req.user.id,
            class_id: classInstance.id,
            enrolled_by: req.user.id,
            status: 'active'
        });
        res.status(201).json({
            success: true,
            data: {
                enrollment_id: enrollment.id,
                status: enrollment.status,
                enrolled_at: enrollment.enrolled_at,
                class: {
                    id: classInstance.id,
                    name: classInstance.name,
                    teacher_name: classInstance.teacher?.name || 'Unknown'
                }
            }
        });
    }
    catch (error) {
        console.error('Join class error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'ENROLLMENT_FAILED',
                message: 'Failed to join class'
            }
        });
    }
};
exports.joinClassByCode = joinClassByCode;
const getUserClasses = async (req, res) => {
    try {
        if (!req.firebaseUser?.uid) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'AUTHENTICATION_REQUIRED',
                    message: 'Authentication required'
                }
            });
            return;
        }
        const userProfile = await userService_1.userService.getUserProfile(req.firebaseUser.uid);
        if (!userProfile) {
            res.status(404).json({
                success: false,
                error: {
                    code: 'USER_NOT_FOUND',
                    message: 'User profile not found'
                }
            });
            return;
        }
        let classes;
        if (userProfile.role === 'teacher') {
            const teacherClasses = await Class_1.Class.findAll({
                where: { teacher_id: userProfile.id },
                include: [
                    {
                        model: User_1.User,
                        as: 'teacher',
                        attributes: ['id', 'name', 'email']
                    }
                ],
                order: [['created_at', 'DESC']]
            });
            classes = await Promise.all(teacherClasses.map(async (cls) => {
                const currentStudents = await Enrollment_1.Enrollment.count({
                    where: {
                        class_id: cls.id,
                        status: 'active'
                    }
                });
                const assignmentCount = await Assignment_1.Assignment.count({
                    where: { class_id: cls.id }
                });
                return {
                    id: cls.id,
                    name: cls.name,
                    description: cls.description,
                    visibility: cls.visibility,
                    join_code: cls.join_code,
                    max_students: cls.max_students,
                    current_students: currentStudents,
                    assignment_count: assignmentCount,
                    join_method: cls.join_method,
                    is_active: cls.is_active,
                    created_at: cls.created_at
                };
            }));
        }
        else {
            const enrollments = await Enrollment_1.Enrollment.findAll({
                where: {
                    student_id: userProfile.id,
                    status: 'active'
                },
                include: [
                    {
                        model: Class_1.Class,
                        as: 'class',
                        where: { is_active: true },
                        include: [
                            {
                                model: User_1.User,
                                as: 'teacher',
                                attributes: ['id', 'name', 'email']
                            }
                        ]
                    }
                ],
                order: [['enrolled_at', 'DESC']]
            });
            classes = await Promise.all(enrollments.map(async (enrollment) => {
                const cls = enrollment.class;
                const currentStudents = await Enrollment_1.Enrollment.count({
                    where: {
                        class_id: cls.id,
                        status: 'active'
                    }
                });
                const assignmentCount = await Assignment_1.Assignment.count({
                    where: { class_id: cls.id }
                });
                return {
                    id: cls.id,
                    name: cls.name,
                    description: cls.description,
                    teacher: cls.teacher ? {
                        id: cls.teacher.id,
                        name: cls.teacher.name,
                        email: cls.teacher.email
                    } : null,
                    current_students: currentStudents,
                    max_students: cls.max_students,
                    assignment_count: assignmentCount,
                    enrolled_at: enrollment.enrolled_at,
                    created_at: cls.created_at
                };
            }));
        }
        res.json({
            success: true,
            data: {
                classes,
                total: classes.length
            }
        });
    }
    catch (error) {
        console.error('Get user classes error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to retrieve classes'
            }
        });
    }
};
exports.getUserClasses = getUserClasses;
const getAvailableClasses = async (req, res) => {
    try {
        if (!validateStudentAccess(req, res))
            return;
        const search = req.query['search'] || '';
        const page = parseInt(req.query['page']) || 1;
        const limit = Math.min(parseInt(req.query['limit']) || 20, 100);
        const offset = (page - 1) * limit;
        const enrolledClassIds = await Enrollment_1.Enrollment.findAll({
            where: {
                student_id: req.user.id,
                status: { [sequelize_1.Op.in]: ['active', 'pending'] }
            },
            attributes: ['class_id']
        }).then(enrollments => enrollments.map(e => e.class_id));
        const whereClause = {
            visibility: 'public',
            is_active: true
        };
        if (enrolledClassIds.length > 0) {
            whereClause.id = { [sequelize_1.Op.notIn]: enrolledClassIds };
        }
        if (search) {
            whereClause[sequelize_1.Op.or] = [
                { name: { [sequelize_1.Op.iLike]: `%${search}%` } },
                { description: { [sequelize_1.Op.iLike]: `%${search}%` } }
            ];
        }
        const { count, rows: availableClasses } = await Class_1.Class.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: User_1.User,
                    as: 'teacher',
                    attributes: ['id', 'name', 'email']
                }
            ],
            order: [['created_at', 'DESC']],
            limit,
            offset
        });
        const classesWithStats = await Promise.all(availableClasses.map(async (cls) => {
            const currentStudents = await Enrollment_1.Enrollment.count({
                where: {
                    class_id: cls.id,
                    status: 'active'
                }
            });
            return {
                id: cls.id,
                name: cls.name,
                description: cls.description,
                teacher_name: cls.teacher?.name || 'Unknown',
                current_students: currentStudents,
                max_students: cls.max_students,
                can_join: !cls.max_students || currentStudents < cls.max_students,
                created_at: cls.created_at
            };
        }));
        res.json({
            success: true,
            data: {
                classes: classesWithStats,
                pagination: {
                    page,
                    limit,
                    total: count,
                    pages: Math.ceil(count / limit)
                }
            }
        });
    }
    catch (error) {
        console.error('Get available classes error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to retrieve available classes'
            }
        });
    }
};
exports.getAvailableClasses = getAvailableClasses;
const createAssignmentInClass = async (req, res) => {
    try {
        if (!validateTeacherAccess(req, res))
            return;
        const classId = req.params['id'];
        const { title, problem_description } = req.body;
        if (!classId) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_PARAMETERS',
                    message: 'Class ID is required'
                }
            });
            return;
        }
        if (!title?.trim() || !problem_description?.trim()) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Assignment title and description are required'
                }
            });
            return;
        }
        const classInstance = await Class_1.Class.findByPk(classId);
        if (!classInstance) {
            res.status(404).json({
                success: false,
                error: {
                    code: 'CLASS_NOT_FOUND',
                    message: 'Class not found'
                }
            });
            return;
        }
        if (classInstance.teacher_id !== req.user.id) {
            res.status(403).json({
                success: false,
                error: {
                    code: 'ACCESS_DENIED',
                    message: 'You can only create assignments in your own classes'
                }
            });
            return;
        }
        const assignment = await Assignment_1.Assignment.create({
            class_id: classId,
            title: title.trim(),
            problem_description: problem_description.trim()
        });
        res.status(201).json({
            success: true,
            data: {
                id: assignment.id,
                class_id: assignment.class_id,
                title: assignment.title,
                problem_description: assignment.problem_description,
                created_at: assignment.created_at
            }
        });
    }
    catch (error) {
        console.error('Create assignment error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'ASSIGNMENT_CREATION_FAILED',
                message: 'Failed to create assignment'
            }
        });
    }
};
exports.createAssignmentInClass = createAssignmentInClass;
const getClassAssignments = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'AUTHENTICATION_REQUIRED',
                    message: 'Authentication required'
                }
            });
            return;
        }
        const classId = req.params['id'];
        if (!classId) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_PARAMETERS',
                    message: 'Class ID is required'
                }
            });
            return;
        }
        const classInstance = await Class_1.Class.findByPk(classId);
        if (!classInstance) {
            res.status(404).json({
                success: false,
                error: {
                    code: 'CLASS_NOT_FOUND',
                    message: 'Class not found'
                }
            });
            return;
        }
        let hasAccess = false;
        if (req.user.role === 'teacher' && classInstance.teacher_id === req.user.id) {
            hasAccess = true;
        }
        else if (req.user.role === 'student') {
            const enrollment = await Enrollment_1.Enrollment.findOne({
                where: {
                    student_id: req.user.id,
                    class_id: classId,
                    status: 'active'
                }
            });
            hasAccess = !!enrollment;
        }
        if (!hasAccess) {
            res.status(403).json({
                success: false,
                error: {
                    code: 'ACCESS_DENIED',
                    message: 'You do not have access to this class'
                }
            });
            return;
        }
        const assignments = await Assignment_1.Assignment.findAll({
            where: { class_id: classId },
            order: [['created_at', 'DESC']]
        });
        res.json({
            success: true,
            data: {
                assignments: assignments.map(assignment => ({
                    id: assignment.id,
                    class_id: assignment.class_id,
                    title: assignment.title,
                    problem_description: assignment.problem_description,
                    created_at: assignment.created_at
                })),
                total: assignments.length
            }
        });
    }
    catch (error) {
        console.error('Get class assignments error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to retrieve assignments'
            }
        });
    }
};
exports.getClassAssignments = getClassAssignments;
const getAssignmentById = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'AUTHENTICATION_REQUIRED',
                    message: 'Authentication required'
                }
            });
            return;
        }
        const classId = req.params['classId'];
        const assignmentId = req.params['assignmentId'];
        if (!classId || !assignmentId) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_PARAMETERS',
                    message: 'Class ID and Assignment ID are required'
                }
            });
            return;
        }
        const classInstance = await Class_1.Class.findByPk(classId);
        if (!classInstance) {
            res.status(404).json({
                success: false,
                error: {
                    code: 'CLASS_NOT_FOUND',
                    message: 'Class not found'
                }
            });
            return;
        }
        let hasAccess = false;
        if (req.user.role === 'teacher' && classInstance.teacher_id === req.user.id) {
            hasAccess = true;
        }
        else if (req.user.role === 'student') {
            const enrollment = await Enrollment_1.Enrollment.findOne({
                where: {
                    student_id: req.user.id,
                    class_id: classId,
                    status: 'active'
                }
            });
            hasAccess = !!enrollment;
        }
        if (!hasAccess) {
            res.status(403).json({
                success: false,
                error: {
                    code: 'ACCESS_DENIED',
                    message: 'You do not have access to this class'
                }
            });
            return;
        }
        const assignment = await Assignment_1.Assignment.findOne({
            where: {
                id: assignmentId,
                class_id: classId
            }
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
        res.json({
            success: true,
            data: {
                id: assignment.id,
                class_id: assignment.class_id,
                title: assignment.title,
                problem_description: assignment.problem_description,
                created_at: assignment.created_at
            }
        });
    }
    catch (error) {
        console.error('Get assignment by ID error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to retrieve assignment'
            }
        });
    }
};
exports.getAssignmentById = getAssignmentById;
const submitAssignmentCode = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'AUTHENTICATION_REQUIRED',
                    message: 'Authentication required'
                }
            });
            return;
        }
        if (req.user.role !== 'student') {
            res.status(403).json({
                success: false,
                error: {
                    code: 'INSUFFICIENT_PERMISSIONS',
                    message: 'Only students can submit code'
                }
            });
            return;
        }
        const classId = req.params['classId'];
        const assignmentId = req.params['assignmentId'];
        const { code } = req.body;
        if (!classId || !assignmentId) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_PARAMETERS',
                    message: 'Class ID and Assignment ID are required'
                }
            });
            return;
        }
        if (!code || typeof code !== 'string' || !code.trim()) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Code is required and cannot be empty'
                }
            });
            return;
        }
        const enrollment = await Enrollment_1.Enrollment.findOne({
            where: {
                student_id: req.user.id,
                class_id: classId,
                status: 'active'
            }
        });
        if (!enrollment) {
            res.status(403).json({
                success: false,
                error: {
                    code: 'NOT_ENROLLED',
                    message: 'You are not enrolled in this class'
                }
            });
            return;
        }
        const assignment = await Assignment_1.Assignment.findOne({
            where: {
                id: assignmentId,
                class_id: classId
            }
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
        const [submission, created] = await Submission_1.Submission.upsert({
            assignment_id: assignmentId,
            student_id: req.user.id,
            code: code.trim(),
            language: 'c'
        }, {
            returning: true
        });
        res.status(created ? 201 : 200).json({
            success: true,
            data: {
                id: submission.id,
                assignment_id: submission.assignment_id,
                student_id: submission.student_id,
                code: submission.code,
                submitted_at: submission.submitted_at,
                is_new: created
            }
        });
    }
    catch (error) {
        console.error('Submit assignment code error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SUBMISSION_FAILED',
                message: 'Failed to submit code'
            }
        });
    }
};
exports.submitAssignmentCode = submitAssignmentCode;
const getStudentSubmission = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'AUTHENTICATION_REQUIRED',
                    message: 'Authentication required'
                }
            });
            return;
        }
        const classId = req.params['classId'];
        const assignmentId = req.params['assignmentId'];
        if (!classId || !assignmentId) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_PARAMETERS',
                    message: 'Class ID and Assignment ID are required'
                }
            });
            return;
        }
        let submission = null;
        if (req.user.role === 'student') {
            const enrollment = await Enrollment_1.Enrollment.findOne({
                where: {
                    student_id: req.user.id,
                    class_id: classId,
                    status: 'active'
                }
            });
            if (!enrollment) {
                res.status(403).json({
                    success: false,
                    error: {
                        code: 'NOT_ENROLLED',
                        message: 'You are not enrolled in this class'
                    }
                });
                return;
            }
            submission = await Submission_1.Submission.findOne({
                where: {
                    assignment_id: assignmentId,
                    student_id: req.user.id
                }
            });
        }
        else if (req.user.role === 'teacher') {
            const classInstance = await Class_1.Class.findByPk(classId);
            if (!classInstance || classInstance.teacher_id !== req.user.id) {
                res.status(403).json({
                    success: false,
                    error: {
                        code: 'ACCESS_DENIED',
                        message: 'You can only view submissions for your own classes'
                    }
                });
                return;
            }
            const submissions = await Submission_1.Submission.findAll({
                where: {
                    assignment_id: assignmentId
                },
                include: [
                    {
                        model: User_1.User,
                        as: 'student',
                        attributes: ['id', 'name', 'email']
                    }
                ],
                order: [['submitted_at', 'DESC']]
            });
            res.json({
                success: true,
                data: {
                    submissions: submissions.map(sub => ({
                        id: sub.id,
                        assignment_id: sub.assignment_id,
                        student_id: sub.student_id,
                        code: sub.code,
                        submitted_at: sub.submitted_at,
                        student: sub.student
                    }))
                }
            });
            return;
        }
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
                id: submission.id,
                assignment_id: submission.assignment_id,
                student_id: submission.student_id,
                code: submission.code,
                submitted_at: submission.submitted_at
            }
        });
    }
    catch (error) {
        console.error('Get student submission error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to retrieve submission'
            }
        });
    }
};
exports.getStudentSubmission = getStudentSubmission;
const regenerateJoinCode = async (req, res) => {
    try {
        if (!validateTeacherAccess(req, res))
            return;
        const classId = req.params['id'];
        if (!classId) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_PARAMETERS',
                    message: 'Class ID is required'
                }
            });
            return;
        }
        const classInstance = await Class_1.Class.findByPk(classId);
        if (!classInstance) {
            res.status(404).json({
                success: false,
                error: {
                    code: 'CLASS_NOT_FOUND',
                    message: 'Class not found'
                }
            });
            return;
        }
        if (classInstance.teacher_id !== req.user.id) {
            res.status(403).json({
                success: false,
                error: {
                    code: 'ACCESS_DENIED',
                    message: 'You can only regenerate join codes for your own classes'
                }
            });
            return;
        }
        const newJoinCode = await generateUniqueJoinCode();
        await classInstance.update({ join_code: newJoinCode });
        res.json({
            success: true,
            data: {
                join_code: newJoinCode,
                message: 'Join code regenerated successfully'
            }
        });
    }
    catch (error) {
        console.error('Regenerate join code error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to regenerate join code'
            }
        });
    }
};
exports.regenerateJoinCode = regenerateJoinCode;
const getAllTeacherSubmissions = async (req, res) => {
    try {
        if (!validateTeacherAccess(req, res))
            return;
        const teacherClasses = await Class_1.Class.findAll({
            where: {
                teacher_id: req.user.id,
                is_active: true
            },
            attributes: ['id', 'name']
        });
        if (teacherClasses.length === 0) {
            res.json({
                success: true,
                data: {
                    submissions: []
                }
            });
            return;
        }
        const classIds = teacherClasses.map(cls => cls.id);
        const assignments = await Assignment_1.Assignment.findAll({
            where: {
                class_id: { [sequelize_1.Op.in]: classIds }
            },
            attributes: ['id', 'title', 'class_id']
        });
        if (assignments.length === 0) {
            res.json({
                success: true,
                data: {
                    submissions: []
                }
            });
            return;
        }
        const assignmentIds = assignments.map(assignment => assignment.id);
        const submissions = await Submission_1.Submission.findAll({
            where: {
                assignment_id: { [sequelize_1.Op.in]: assignmentIds }
            },
            include: [
                {
                    model: User_1.User,
                    as: 'student',
                    attributes: ['id', 'name', 'email']
                }
            ],
            order: [['submitted_at', 'DESC']]
        });
        const assignmentMap = new Map(assignments.map(a => [a.id, a]));
        const classMap = new Map(teacherClasses.map(c => [c.id, c]));
        const formattedSubmissions = submissions.map(submission => {
            const assignment = assignmentMap.get(submission.assignment_id);
            const classInfo = assignment ? classMap.get(assignment.class_id) : null;
            return {
                id: submission.id,
                assignment_id: submission.assignment_id,
                student_id: submission.student_id,
                code: submission.code,
                submitted_at: submission.submitted_at,
                student: submission.student,
                assignment: assignment ? {
                    id: assignment.id,
                    title: assignment.title
                } : null,
                class: classInfo ? {
                    id: classInfo.id,
                    name: classInfo.name
                } : null
            };
        });
        res.json({
            success: true,
            data: {
                submissions: formattedSubmissions
            }
        });
    }
    catch (error) {
        console.error('Get all teacher submissions error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to retrieve submissions'
            }
        });
    }
};
exports.getAllTeacherSubmissions = getAllTeacherSubmissions;
const getClassStudents = async (req, res) => {
    try {
        if (!validateTeacherAccess(req, res))
            return;
        const classId = req.params['id'];
        if (!classId) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_PARAMETERS',
                    message: 'Class ID is required'
                }
            });
            return;
        }
        const classInstance = await Class_1.Class.findByPk(classId);
        if (!classInstance) {
            res.status(404).json({
                success: false,
                error: {
                    code: 'CLASS_NOT_FOUND',
                    message: 'Class not found'
                }
            });
            return;
        }
        if (classInstance.teacher_id !== req.user.id) {
            res.status(403).json({
                success: false,
                error: {
                    code: 'ACCESS_DENIED',
                    message: 'You can only view students for your own classes'
                }
            });
            return;
        }
        const enrollments = await Enrollment_1.Enrollment.findAll({
            where: {
                class_id: classId,
                status: { [sequelize_1.Op.in]: ['active', 'pending', 'suspended'] }
            },
            include: [
                {
                    model: User_1.User,
                    as: 'student',
                    attributes: ['id', 'name', 'email']
                }
            ],
            order: [['enrolled_at', 'DESC']]
        });
        const students = enrollments.map(enrollment => ({
            id: enrollment.student.id,
            name: enrollment.student.name,
            email: enrollment.student.email,
            enrolled_at: enrollment.enrolled_at,
            status: enrollment.status
        }));
        const statistics = {
            total: enrollments.length,
            active: enrollments.filter(e => e.status === 'active').length,
            pending: enrollments.filter(e => e.status === 'pending').length,
            suspended: enrollments.filter(e => e.status === 'suspended').length,
            withdrawn: 0
        };
        res.json({
            success: true,
            data: {
                students,
                statistics
            }
        });
    }
    catch (error) {
        console.error('Get class students error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to retrieve class students'
            }
        });
    }
};
exports.getClassStudents = getClassStudents;
const removeStudentFromClass = async (req, res) => {
    try {
        if (!validateTeacherAccess(req, res))
            return;
        const classId = req.params['classId'];
        const studentId = req.params['studentId'];
        if (!classId || !studentId) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_PARAMETERS',
                    message: 'Class ID and Student ID are required'
                }
            });
            return;
        }
        const classInstance = await Class_1.Class.findByPk(classId);
        if (!classInstance) {
            res.status(404).json({
                success: false,
                error: {
                    code: 'CLASS_NOT_FOUND',
                    message: 'Class not found'
                }
            });
            return;
        }
        if (classInstance.teacher_id !== req.user.id) {
            res.status(403).json({
                success: false,
                error: {
                    code: 'ACCESS_DENIED',
                    message: 'You can only remove students from your own classes'
                }
            });
            return;
        }
        const enrollment = await Enrollment_1.Enrollment.findOne({
            where: {
                class_id: classId,
                student_id: studentId,
                status: { [sequelize_1.Op.in]: ['active', 'pending', 'suspended'] }
            }
        });
        if (!enrollment) {
            res.status(404).json({
                success: false,
                error: {
                    code: 'ENROLLMENT_NOT_FOUND',
                    message: 'Student is not enrolled in this class'
                }
            });
            return;
        }
        await enrollment.update({ status: 'withdrawn' });
        res.json({
            success: true,
            data: {
                message: 'Student removed from class successfully'
            }
        });
    }
    catch (error) {
        console.error('Remove student from class error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to remove student from class'
            }
        });
    }
};
exports.removeStudentFromClass = removeStudentFromClass;
const getClassSubmissions = async (req, res) => {
    try {
        if (!validateTeacherAccess(req, res))
            return;
        const classId = req.params['id'];
        if (!classId) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_PARAMETERS',
                    message: 'Class ID is required'
                }
            });
            return;
        }
        const classInstance = await Class_1.Class.findByPk(classId);
        if (!classInstance) {
            res.status(404).json({
                success: false,
                error: {
                    code: 'CLASS_NOT_FOUND',
                    message: 'Class not found'
                }
            });
            return;
        }
        if (classInstance.teacher_id !== req.user.id) {
            res.status(403).json({
                success: false,
                error: {
                    code: 'ACCESS_DENIED',
                    message: 'You can only view submissions for your own classes'
                }
            });
            return;
        }
        const assignments = await Assignment_1.Assignment.findAll({
            where: { class_id: classId },
            attributes: ['id', 'title']
        });
        if (assignments.length === 0) {
            res.json({
                success: true,
                data: {
                    submissions: []
                }
            });
            return;
        }
        const assignmentIds = assignments.map(assignment => assignment.id);
        const submissions = await Submission_1.Submission.findAll({
            where: {
                assignment_id: { [sequelize_1.Op.in]: assignmentIds }
            },
            include: [
                {
                    model: User_1.User,
                    as: 'student',
                    attributes: ['id', 'name', 'email']
                }
            ],
            order: [['submitted_at', 'DESC']]
        });
        const assignmentMap = new Map(assignments.map(a => [a.id, a]));
        const formattedSubmissions = submissions.map(submission => {
            const assignment = assignmentMap.get(submission.assignment_id);
            return {
                id: submission.id,
                assignment_id: submission.assignment_id,
                student_id: submission.student_id,
                code: submission.code,
                submitted_at: submission.submitted_at,
                student: submission.student,
                assignment: assignment ? {
                    id: assignment.id,
                    title: assignment.title
                } : null
            };
        });
        res.json({
            success: true,
            data: {
                submissions: formattedSubmissions
            }
        });
    }
    catch (error) {
        console.error('Get class submissions error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to retrieve class submissions'
            }
        });
    }
};
exports.getClassSubmissions = getClassSubmissions;
//# sourceMappingURL=productionClassController.js.map