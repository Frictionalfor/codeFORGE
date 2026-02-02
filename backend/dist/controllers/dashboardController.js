"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecentActivity = exports.getStudentAssignmentStatus = exports.getDashboardStats = void 0;
const models_1 = require("../models");
const sequelize_1 = require("sequelize");
const userService_1 = require("../services/userService");
const getDashboardStats = async (req, res) => {
    try {
        if (!req.firebaseUser?.uid) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
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
        if (userProfile.role === 'student') {
            const totalClasses = await models_1.Enrollment.count({
                where: {
                    student_id: userProfile.id,
                    status: 'active'
                }
            });
            const enrolledClasses = await models_1.Enrollment.findAll({
                where: {
                    student_id: userProfile.id,
                    status: 'active'
                },
                attributes: ['class_id']
            });
            const classIds = enrolledClasses.map(enrollment => enrollment.class_id);
            if (classIds.length === 0) {
                res.json({
                    success: true,
                    data: {
                        totalClasses: 0,
                        completedAssignments: 0,
                        pendingAssignments: 0,
                        totalPoints: 0
                    }
                });
                return;
            }
            const allAssignments = await models_1.Assignment.findAll({
                where: {
                    class_id: { [sequelize_1.Op.in]: classIds },
                    is_published: true
                },
                attributes: ['id', 'total_points', 'due_date', 'title'],
                include: [{
                        model: models_1.Submission,
                        as: 'submissions',
                        where: { student_id: userProfile.id },
                        required: false,
                        attributes: ['id', 'status', 'points_earned', 'submitted_at'],
                        order: [['submitted_at', 'DESC']],
                        limit: 1
                    }]
            });
            let completedAssignments = 0;
            let pendingAssignments = 0;
            let totalPoints = 0;
            const now = new Date();
            allAssignments.forEach(assignment => {
                const submission = assignment.submissions && assignment.submissions[0];
                if (submission) {
                    if (submission.status === 'completed') {
                        completedAssignments++;
                        totalPoints += submission.points_earned || 0;
                    }
                    else if (submission.status === 'failed') {
                        completedAssignments++;
                        totalPoints += submission.points_earned || 0;
                    }
                    else {
                        completedAssignments++;
                        totalPoints += submission.points_earned || 0;
                    }
                }
                else {
                    pendingAssignments++;
                }
            });
            const totalAssignments = allAssignments.length;
            res.json({
                success: true,
                data: {
                    totalClasses,
                    totalAssignments,
                    completedAssignments,
                    pendingAssignments,
                    totalPoints
                }
            });
        }
        else if (userProfile.role === 'teacher') {
            const totalClasses = await models_1.Class.count({
                where: { teacher_id: userProfile.id }
            });
            const totalAssignments = await models_1.Assignment.count({
                include: [{
                        model: models_1.Class,
                        as: 'class',
                        where: { teacher_id: userProfile.id }
                    }]
            });
            const totalStudents = await models_1.Enrollment.count({
                where: { status: 'active' },
                include: [{
                        model: models_1.Class,
                        as: 'class',
                        where: { teacher_id: userProfile.id }
                    }]
            });
            const pendingSubmissions = await models_1.Submission.count({
                where: {
                    status: { [sequelize_1.Op.in]: ['submitted', 'pending'] }
                },
                include: [{
                        model: models_1.Assignment,
                        as: 'assignment',
                        include: [{
                                model: models_1.Class,
                                as: 'class',
                                where: { teacher_id: userProfile.id }
                            }]
                    }]
            });
            const gradedSubmissions = await models_1.Submission.findAll({
                where: {
                    status: 'completed'
                },
                include: [{
                        model: models_1.Assignment,
                        as: 'assignment',
                        attributes: ['total_points'],
                        include: [{
                                model: models_1.Class,
                                as: 'class',
                                where: { teacher_id: userProfile.id }
                            }]
                    }],
                attributes: ['points_earned']
            });
            let averageScore = 0;
            const validSubmissions = gradedSubmissions.filter(s => s.points_earned !== null && s.points_earned !== undefined);
            if (validSubmissions.length > 0) {
                const totalPercentage = validSubmissions.reduce((sum, submission) => {
                    const percentage = (submission.points_earned || 0) / (submission.assignment?.total_points || 1) * 100;
                    return sum + percentage;
                }, 0);
                averageScore = Math.round(totalPercentage / validSubmissions.length * 10) / 10;
            }
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            const activeStudents = await models_1.Submission.count({
                where: {
                    submitted_at: { [sequelize_1.Op.gte]: oneWeekAgo }
                },
                include: [{
                        model: models_1.Assignment,
                        as: 'assignment',
                        include: [{
                                model: models_1.Class,
                                as: 'class',
                                where: { teacher_id: userProfile.id }
                            }]
                    }],
                distinct: true,
                col: 'student_id'
            });
            res.json({
                success: true,
                data: {
                    totalClasses,
                    totalStudents,
                    totalAssignments,
                    pendingSubmissions,
                    averageScore,
                    activeStudents
                }
            });
        }
    }
    catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to fetch dashboard statistics'
            }
        });
    }
};
exports.getDashboardStats = getDashboardStats;
const getStudentAssignmentStatus = async (req, res) => {
    try {
        if (!req.firebaseUser?.uid) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
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
        if (userProfile.role !== 'student') {
            res.status(403).json({
                success: false,
                error: {
                    code: 'ACCESS_DENIED',
                    message: 'Only students can access this endpoint'
                }
            });
            return;
        }
        const enrolledClasses = await models_1.Enrollment.findAll({
            where: {
                student_id: userProfile.id,
                status: 'active'
            },
            attributes: ['class_id']
        });
        const classIds = enrolledClasses.map(enrollment => enrollment.class_id);
        if (classIds.length === 0) {
            res.json({
                success: true,
                data: {
                    assignments: [],
                    summary: {
                        total: 0,
                        completed: 0,
                        pending: 0,
                        overdue: 0
                    }
                }
            });
            return;
        }
        const assignments = await models_1.Assignment.findAll({
            where: {
                class_id: { [sequelize_1.Op.in]: classIds },
                is_published: true
            },
            attributes: ['id', 'title', 'due_date', 'total_points', 'class_id'],
            include: [
                {
                    model: models_1.Class,
                    as: 'class',
                    attributes: ['id', 'name']
                },
                {
                    model: models_1.Submission,
                    as: 'submissions',
                    where: { student_id: userProfile.id },
                    required: false,
                    attributes: ['id', 'status', 'points_earned', 'submitted_at'],
                    order: [['submitted_at', 'DESC']],
                    limit: 1
                }
            ],
            order: [['created_at', 'DESC']]
        });
        const now = new Date();
        let completed = 0;
        let pending = 0;
        let overdue = 0;
        const assignmentStatus = assignments.map(assignment => {
            const submission = assignment.submissions && assignment.submissions[0];
            const dueDate = assignment.due_date ? new Date(assignment.due_date) : null;
            const isOverdue = dueDate && now > dueDate;
            let status = 'pending';
            if (submission) {
                status = 'completed';
                completed++;
            }
            else if (isOverdue) {
                status = 'overdue';
                overdue++;
            }
            else {
                pending++;
            }
            return {
                id: assignment.id,
                title: assignment.title,
                className: assignment.class?.name,
                dueDate: assignment.due_date,
                totalPoints: assignment.total_points,
                status,
                submission: submission ? {
                    id: submission.id,
                    status: submission.status,
                    pointsEarned: submission.points_earned,
                    submittedAt: submission.submitted_at
                } : null
            };
        });
        res.json({
            success: true,
            data: {
                assignments: assignmentStatus,
                summary: {
                    total: assignments.length,
                    completed,
                    pending,
                    overdue
                }
            }
        });
    }
    catch (error) {
        console.error('Get student assignment status error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to fetch assignment status'
            }
        });
    }
};
exports.getStudentAssignmentStatus = getStudentAssignmentStatus;
const getRecentActivity = async (req, res) => {
    try {
        if (!req.firebaseUser?.uid) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
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
        const activities = [];
        if (userProfile.role === 'student') {
            const recentSubmissions = await models_1.Submission.findAll({
                where: { student_id: userProfile.id },
                include: [{
                        model: models_1.Assignment,
                        as: 'assignment',
                        attributes: ['title', 'total_points'],
                        include: [{
                                model: models_1.Class,
                                as: 'class',
                                attributes: ['name']
                            }]
                    }],
                order: [['submitted_at', 'DESC']],
                limit: 5
            });
            recentSubmissions.forEach(submission => {
                activities.push({
                    id: `submission-${submission.id}`,
                    type: 'submission',
                    title: `Submitted "${submission.assignment?.title}"`,
                    description: `in ${submission.assignment?.class?.name}`,
                    timestamp: submission.submitted_at,
                    status: submission.status
                });
            });
            const recentEnrollments = await models_1.Enrollment.findAll({
                where: {
                    student_id: userProfile.id,
                    status: 'active'
                },
                include: [{
                        model: models_1.Class,
                        as: 'class',
                        attributes: ['name']
                    }],
                order: [['enrolled_at', 'DESC']],
                limit: 3
            });
            recentEnrollments.forEach(enrollment => {
                activities.push({
                    id: `enrollment-${enrollment.id}`,
                    type: 'enrollment',
                    title: `Joined "${enrollment.class?.name}"`,
                    description: 'Successfully enrolled in class',
                    timestamp: enrollment.enrolled_at,
                    status: 'completed'
                });
            });
            const enrolledClasses = await models_1.Enrollment.findAll({
                where: {
                    student_id: userProfile.id,
                    status: 'active'
                },
                attributes: ['class_id']
            });
            const classIds = enrolledClasses.map(enrollment => enrollment.class_id);
            const recentAssignments = await models_1.Assignment.findAll({
                where: {
                    class_id: { [sequelize_1.Op.in]: classIds },
                    is_published: true,
                    published_at: { [sequelize_1.Op.not]: null }
                },
                include: [{
                        model: models_1.Class,
                        as: 'class',
                        attributes: ['name']
                    }],
                order: [['published_at', 'DESC']],
                limit: 3
            });
            recentAssignments.forEach(assignment => {
                activities.push({
                    id: `assignment-${assignment.id}`,
                    type: 'assignment_published',
                    title: `New assignment: "${assignment.title}"`,
                    description: `in ${assignment.class?.name}`,
                    timestamp: assignment.published_at,
                    status: 'pending'
                });
            });
        }
        else if (userProfile.role === 'teacher') {
            const recentSubmissions = await models_1.Submission.findAll({
                include: [{
                        model: models_1.Assignment,
                        as: 'assignment',
                        attributes: ['title'],
                        include: [{
                                model: models_1.Class,
                                as: 'class',
                                where: { teacher_id: userProfile.id },
                                attributes: ['name']
                            }]
                    }, {
                        model: models_1.User,
                        as: 'student',
                        attributes: ['name']
                    }],
                order: [['submitted_at', 'DESC']],
                limit: 5
            });
            recentSubmissions.forEach(submission => {
                activities.push({
                    id: `submission-${submission.id}`,
                    type: 'submission_received',
                    title: 'New Submission',
                    description: `${submission.student?.name} submitted "${submission.assignment?.title}"`,
                    timestamp: submission.submitted_at,
                    status: submission.status === 'completed' ? 'graded' : 'new',
                    studentName: submission.student?.name,
                    className: submission.assignment?.class?.name
                });
            });
            const recentEnrollments = await models_1.Enrollment.findAll({
                where: {
                    status: 'active'
                },
                include: [{
                        model: models_1.Class,
                        as: 'class',
                        where: { teacher_id: userProfile.id },
                        attributes: ['name']
                    }, {
                        model: models_1.User,
                        as: 'student',
                        attributes: ['name']
                    }],
                order: [['enrolled_at', 'DESC']],
                limit: 3
            });
            recentEnrollments.forEach(enrollment => {
                activities.push({
                    id: `enrollment-${enrollment.id}`,
                    type: 'student_enrolled',
                    title: 'Student Enrolled',
                    description: `${enrollment.student?.name} joined "${enrollment.class?.name}"`,
                    timestamp: enrollment.enrolled_at,
                    studentName: enrollment.student?.name,
                    className: enrollment.class?.name
                });
            });
            const recentAssignments = await models_1.Assignment.findAll({
                include: [{
                        model: models_1.Class,
                        as: 'class',
                        where: { teacher_id: userProfile.id },
                        attributes: ['name']
                    }],
                order: [['created_at', 'DESC']],
                limit: 3
            });
            recentAssignments.forEach(assignment => {
                activities.push({
                    id: `assignment-created-${assignment.id}`,
                    type: 'assignment_created',
                    title: 'Assignment Published',
                    description: `Created "${assignment.title}"`,
                    timestamp: assignment.created_at,
                    className: assignment.class?.name
                });
            });
            const recentClasses = await models_1.Class.findAll({
                where: { teacher_id: userProfile.id },
                order: [['created_at', 'DESC']],
                limit: 2
            });
            recentClasses.forEach(classItem => {
                activities.push({
                    id: `class-created-${classItem.id}`,
                    type: 'class_created',
                    title: 'Class Created',
                    description: `Created new class "${classItem.name}"`,
                    timestamp: classItem.created_at,
                    className: classItem.name
                });
            });
        }
        activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        const limitedActivities = activities.slice(0, 10);
        res.json({
            success: true,
            data: {
                activities: limitedActivities
            }
        });
    }
    catch (error) {
        console.error('Get recent activity error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to fetch recent activity'
            }
        });
    }
};
exports.getRecentActivity = getRecentActivity;
//# sourceMappingURL=dashboardController.js.map