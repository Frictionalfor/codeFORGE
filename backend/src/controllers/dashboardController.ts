/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response } from 'express';
import { User, Class, Assignment, Submission, Enrollment } from '../models';
import { Op } from 'sequelize';
import { userService } from '../services/userService';

/**
 * GET /api/dashboard/stats
 * Get dashboard statistics for the authenticated user
 */
export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
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

    // Get user profile from database using Firebase UID
    const userProfile = await userService.getUserProfile(req.firebaseUser.uid);
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
      // Get student statistics
      
      // Total classes enrolled
      const totalClasses = await Enrollment.count({
        where: { 
          student_id: userProfile.id,
          status: 'active'
        }
      });

      // Get all assignments from enrolled classes with submission status
      const enrolledClasses = await Enrollment.findAll({
        where: { 
          student_id: userProfile.id,
          status: 'active'
        },
        attributes: ['class_id']
      });

      const classIds = enrolledClasses.map(enrollment => enrollment.class_id);

      if (classIds.length === 0) {
        // Student not enrolled in any classes
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

      // Get all published assignments from enrolled classes with their submission status
      const allAssignments = await Assignment.findAll({
        where: {
          class_id: { [Op.in]: classIds },
          is_published: true
        },
        attributes: ['id', 'total_points', 'due_date', 'title'],
        include: [{
          model: Submission,
          as: 'submissions',
          where: { student_id: userProfile.id },
          required: false, // LEFT JOIN to include assignments without submissions
          attributes: ['id', 'status', 'points_earned', 'submitted_at'],
          order: [['submitted_at', 'DESC']], // Get the latest submission
          limit: 1 // Only get the most recent submission per assignment
        }]
      });

      // Categorize assignments based on submission status
      let completedAssignments = 0;
      let pendingAssignments = 0;
      let totalPoints = 0;

      const now = new Date();

      allAssignments.forEach(assignment => {
        const submission = assignment.submissions && assignment.submissions[0];
        
        if (submission) {
          // Student has submitted this assignment
          if (submission.status === 'completed') {
            // Only count as completed if the submission was successfully processed
            completedAssignments++;
            totalPoints += submission.points_earned || 0;
          } else if (submission.status === 'failed') {
            // Failed submissions are still considered "attempted" but count as completed
            completedAssignments++;
            totalPoints += submission.points_earned || 0;
          } else {
            // Pending or running submissions are still being processed
            // Count as completed since student has submitted, but may not have points yet
            completedAssignments++;
            totalPoints += submission.points_earned || 0;
          }
        } else {
          // No submission - this is pending
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

    } else if (userProfile.role === 'teacher') {
      // Get teacher statistics
      
      // Total classes created
      const totalClasses = await Class.count({
        where: { teacher_id: userProfile.id }
      });

      // Total assignments created
      const totalAssignments = await Assignment.count({
        include: [{
          model: Class,
          as: 'class',
          where: { teacher_id: userProfile.id }
        }]
      });

      // Total students across all classes
      const totalStudents = await Enrollment.count({
        where: { status: 'active' },
        include: [{
          model: Class,
          as: 'class',
          where: { teacher_id: userProfile.id }
        }]
      });

      // Pending submissions (not graded yet)
      const pendingSubmissions = await Submission.count({
        where: { 
          status: { [Op.in]: ['submitted', 'pending'] }
        },
        include: [{
          model: Assignment,
          as: 'assignment',
          include: [{
            model: Class,
            as: 'class',
            where: { teacher_id: userProfile.id }
          }]
        }]
      });

      // Calculate average score across all graded submissions
      const gradedSubmissions: any[] = await Submission.findAll({
        where: { 
          status: 'completed'
        },
        include: [{
          model: Assignment,
          as: 'assignment',
          attributes: ['total_points'],
          include: [{
            model: Class,
            as: 'class',
            where: { teacher_id: userProfile.id }
          }]
        }],
        attributes: ['points_earned']
      });

      let averageScore = 0;
      const validSubmissions = gradedSubmissions.filter(s => s.points_earned !== null && s.points_earned !== undefined);
      if (validSubmissions.length > 0) {
        const totalPercentage = validSubmissions.reduce((sum: number, submission: any) => {
          const percentage = (submission.points_earned || 0) / (submission.assignment?.total_points || 1) * 100;
          return sum + percentage;
        }, 0);
        averageScore = Math.round(totalPercentage / validSubmissions.length * 10) / 10;
      }

      // Active students (students who submitted in the last 7 days)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const activeStudents = await Submission.count({
        where: {
          submitted_at: { [Op.gte]: oneWeekAgo }
        },
        include: [{
          model: Assignment,
          as: 'assignment',
          include: [{
            model: Class,
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

  } catch (error) {
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

/**
 * GET /api/dashboard/assignment-status
 * Get detailed assignment status for student dashboard
 */
export const getStudentAssignmentStatus = async (req: Request, res: Response): Promise<void> => {
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

    // Get user profile from database using Firebase UID
    const userProfile = await userService.getUserProfile(req.firebaseUser.uid);
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

    // Get enrolled classes
    const enrolledClasses = await Enrollment.findAll({
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

    // Get all published assignments with submission status
    const assignments = await Assignment.findAll({
      where: {
        class_id: { [Op.in]: classIds },
        is_published: true
      },
      attributes: ['id', 'title', 'due_date', 'total_points', 'class_id'],
      include: [
        {
          model: Class,
          as: 'class',
          attributes: ['id', 'name']
        },
        {
          model: Submission,
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
      } else if (isOverdue) {
        status = 'overdue';
        overdue++;
      } else {
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

  } catch (error) {
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
export const getRecentActivity = async (req: Request, res: Response): Promise<void> => {
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

    // Get user profile from database using Firebase UID
    const userProfile = await userService.getUserProfile(req.firebaseUser.uid);
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

    const activities: any[] = [];

    if (userProfile.role === 'student') {
      // Get recent submissions
      const recentSubmissions = await Submission.findAll({
        where: { student_id: userProfile.id },
        include: [{
          model: Assignment,
          as: 'assignment',
          attributes: ['title', 'total_points'],
          include: [{
            model: Class,
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

      // Get recent enrollments
      const recentEnrollments = await Enrollment.findAll({
        where: { 
          student_id: userProfile.id,
          status: 'active'
        },
        include: [{
          model: Class,
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

      // Get recently published assignments from enrolled classes
      const enrolledClasses = await Enrollment.findAll({
        where: { 
          student_id: userProfile.id,
          status: 'active'
        },
        attributes: ['class_id']
      });

      const classIds = enrolledClasses.map(enrollment => enrollment.class_id);

      const recentAssignments = await Assignment.findAll({
        where: {
          class_id: { [Op.in]: classIds },
          is_published: true,
          published_at: { [Op.not]: null }
        },
        include: [{
          model: Class,
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

    } else if (userProfile.role === 'teacher') {
      // Get recent submissions to teacher's assignments
      const recentSubmissions = await Submission.findAll({
        include: [{
          model: Assignment,
          as: 'assignment',
          attributes: ['title'],
          include: [{
            model: Class,
            as: 'class',
            where: { teacher_id: userProfile.id },
            attributes: ['name']
          }]
        }, {
          model: User,
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

      // Get recent enrollments to teacher's classes
      const recentEnrollments = await Enrollment.findAll({
        where: { 
          status: 'active'
        },
        include: [{
          model: Class,
          as: 'class',
          where: { teacher_id: userProfile.id },
          attributes: ['name']
        }, {
          model: User,
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

      // Get recently created assignments
      const recentAssignments = await Assignment.findAll({
        include: [{
          model: Class,
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

      // Get recently created classes
      const recentClasses = await Class.findAll({
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

    // Sort all activities by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Limit to 10 most recent activities
    const limitedActivities = activities.slice(0, 10);

    res.json({
      success: true,
      data: {
        activities: limitedActivities
      }
    });

  } catch (error) {
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