import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Class } from '../models/Class';
import { User } from '../models/User';
import { Enrollment } from '../models/Enrollment';
import { Assignment } from '../models/Assignment';
import { Submission } from '../models/Submission';
import { userService } from '../services/userService';

// Types for request bodies
interface CreateClassRequest {
  name: string;
  description: string;
  visibility?: 'public' | 'private';
  max_students?: number;
  join_method?: 'code' | 'approval' | 'invitation';
}

interface JoinClassRequest {
  join_code: string;
}

// Utility functions
const generateUniqueJoinCode = async (): Promise<string> => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    const existing = await Class.findOne({ where: { join_code: code } });
    if (!existing) {
      return code;
    }
    attempts++;
  }
  
  throw new Error('Failed to generate unique join code after multiple attempts');
};

const validateTeacherAccess = async (req: Request, res: Response): Promise<{ isValid: boolean; userProfile?: any }> => {
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

const validateStudentAccess = async (req: Request, res: Response): Promise<{ isValid: boolean; userProfile?: any }> => {
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

/**
 * Create a new class (teachers only)
 * POST /api/classes
 */
export const createClass = async (req: Request, res: Response): Promise<void> => {
  try {
    const validation = await validateTeacherAccess(req, res);
    if (!validation.isValid || !validation.userProfile) return;

    const { name, description, visibility = 'private', max_students = 50, join_method = 'code' }: CreateClassRequest = req.body;

    // Validate required fields
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

    // Generate unique join code
    const joinCode = await generateUniqueJoinCode();

    // Create the class
    const newClass = await Class.create({
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

  } catch (error) {
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

/**
 * Get class information by join code (students only)
 * GET /api/classes/join/:code
 */
export const getClassByJoinCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const validation = await validateStudentAccess(req, res);
    if (!validation.isValid || !validation.userProfile) return;

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

    // Find class by join code
    const classInstance = await Class.findOne({
      where: { 
        join_code: joinCode,
        is_active: true 
      },
      include: [
        {
          model: User,
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

    // Check if student is already enrolled
    const existingEnrollment = await Enrollment.findOne({
      where: {
        student_id: validation.userProfile.id,
        class_id: classInstance.id,
        status: { [Op.in]: ['active', 'pending'] }
      }
    });

    // Get current enrollment count
    const currentStudents = await Enrollment.count({
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
  } catch (error) {
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

/**
 * Join a class using join code (students only)
 * POST /api/classes/join
 */
export const joinClassByCode = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!validateStudentAccess(req, res)) return;

    const { join_code }: JoinClassRequest = req.body;

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

    // Find the class
    const classInstance = await Class.findOne({
      where: { 
        join_code: joinCodeUpper,
        is_active: true 
      },
      include: [
        {
          model: User,
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

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      where: {
        student_id: req.user!.id,
        class_id: classInstance.id,
        status: { [Op.in]: ['active', 'pending'] }
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

    // Check capacity
    if (classInstance.max_students) {
      const currentStudents = await Enrollment.count({
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

    // Create enrollment
    const enrollment = await Enrollment.create({
      student_id: req.user!.id,
      class_id: classInstance.id,
      enrolled_by: req.user!.id,
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
  } catch (error) {
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

/**
 * Get user's classes
 * GET /api/classes
 */
export const getUserClasses = async (req: Request, res: Response): Promise<void> => {
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

    let classes;

    if (userProfile.role === 'teacher') {
      // Get teacher's classes with enrollment statistics
      const teacherClasses = await Class.findAll({
        where: { teacher_id: userProfile.id },
        include: [
          {
            model: User,
            as: 'teacher',
            attributes: ['id', 'name', 'email']
          }
        ],
        order: [['created_at', 'DESC']]
      });

      classes = await Promise.all(
        teacherClasses.map(async (cls) => {
          const currentStudents = await Enrollment.count({
            where: { 
              class_id: cls.id, 
              status: 'active' 
            }
          });

          const assignmentCount = await Assignment.count({
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
        })
      );
    } else {
      // Get student's enrolled classes
      const enrollments = await Enrollment.findAll({
        where: { 
          student_id: userProfile.id,
          status: 'active'
        },
        include: [
          {
            model: Class,
            as: 'class',
            where: { is_active: true },
            include: [
              {
                model: User,
                as: 'teacher',
                attributes: ['id', 'name', 'email']
              }
            ]
          }
        ],
        order: [['enrolled_at', 'DESC']]
      });

      classes = await Promise.all(
        enrollments.map(async (enrollment) => {
          const cls = enrollment.class;
          const currentStudents = await Enrollment.count({
            where: { 
              class_id: cls.id, 
              status: 'active' 
            }
          });

          const assignmentCount = await Assignment.count({
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
        })
      );
    }

    res.json({
      success: true,
      data: {
        classes,
        total: classes.length
      }
    });
  } catch (error) {
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

/**
 * Get available classes for students to browse
 * GET /api/classes/available
 */
export const getAvailableClasses = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!validateStudentAccess(req, res)) return;

    const search = req.query['search'] as string || '';
    const page = parseInt(req.query['page'] as string) || 1;
    const limit = Math.min(parseInt(req.query['limit'] as string) || 20, 100);
    const offset = (page - 1) * limit;

    // Get enrolled class IDs
    const enrolledClassIds = await Enrollment.findAll({
      where: { 
        student_id: req.user!.id,
        status: { [Op.in]: ['active', 'pending'] }
      },
      attributes: ['class_id']
    }).then(enrollments => enrollments.map(e => e.class_id));

    const whereClause: any = {
      visibility: 'public',
      is_active: true
    };

    if (enrolledClassIds.length > 0) {
      whereClause.id = { [Op.notIn]: enrolledClassIds };
    }

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: availableClasses } = await Class.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'teacher',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    const classesWithStats = await Promise.all(
      availableClasses.map(async (cls) => {
        const currentStudents = await Enrollment.count({
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
      })
    );

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
  } catch (error) {
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

/**
 * Create assignment in a class (teachers only)
 * POST /api/classes/:id/assignments
 */
export const createAssignmentInClass = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!validateTeacherAccess(req, res)) return;

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

    // Verify class exists and teacher owns it
    const classInstance = await Class.findByPk(classId);
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

    if (classInstance.teacher_id !== req.user!.id) {
      res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'You can only create assignments in your own classes'
        }
      });
      return;
    }

    // Create assignment
    const assignment = await Assignment.create({
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
  } catch (error) {
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

/**
 * Get assignments for a class
 * GET /api/classes/:id/assignments
 */
export const getClassAssignments = async (req: Request, res: Response): Promise<void> => {
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

    // Verify class exists
    const classInstance = await Class.findByPk(classId);
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

    // Check access permissions
    let hasAccess = false;
    if (req.user.role === 'teacher' && classInstance.teacher_id === req.user.id) {
      hasAccess = true;
    } else if (req.user.role === 'student') {
      const enrollment = await Enrollment.findOne({
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

    // Get assignments
    const assignments = await Assignment.findAll({
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
  } catch (error) {
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

/**
 * Get specific assignment by ID
 * GET /api/classes/:classId/assignments/:assignmentId
 */
export const getAssignmentById = async (req: Request, res: Response): Promise<void> => {
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

    // Verify class exists
    const classInstance = await Class.findByPk(classId);
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

    // Check access permissions
    let hasAccess = false;
    if (req.user.role === 'teacher' && classInstance.teacher_id === req.user.id) {
      hasAccess = true;
    } else if (req.user.role === 'student') {
      const enrollment = await Enrollment.findOne({
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

    // Get assignment
    const assignment = await Assignment.findOne({
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
  } catch (error) {
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

/**
 * Submit code for an assignment
 * POST /api/classes/:classId/assignments/:assignmentId/submit
 */
export const submitAssignmentCode = async (req: Request, res: Response): Promise<void> => {
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

    // Verify student is enrolled in the class
    const enrollment = await Enrollment.findOne({
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

    // Verify assignment exists and belongs to the class
    const assignment = await Assignment.findOne({
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

    // Create or update submission
    const [submission, created] = await Submission.upsert({
      assignment_id: assignmentId,
      student_id: req.user.id,
      code: code.trim(),
      language: 'c' // Default to C for now
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
  } catch (error) {
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

/**
 * Get student's submission for an assignment
 * GET /api/classes/:classId/assignments/:assignmentId/submission
 */
export const getStudentSubmission = async (req: Request, res: Response): Promise<void> => {
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

    // For students, get their own submission
    // For teachers, get all submissions (or specific student if provided)
    let submission = null;

    if (req.user.role === 'student') {
      // Verify student is enrolled
      const enrollment = await Enrollment.findOne({
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

      submission = await Submission.findOne({
        where: {
          assignment_id: assignmentId,
          student_id: req.user.id
        }
      });
    } else if (req.user.role === 'teacher') {
      // Verify teacher owns the class
      const classInstance = await Class.findByPk(classId);
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

      // Get all submissions for this assignment
      const submissions = await Submission.findAll({
        where: {
          assignment_id: assignmentId
        },
        include: [
          {
            model: User,
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
  } catch (error) {
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

/**
 * Regenerate join code for a class
 * POST /api/classes/:id/regenerate-code
 */
export const regenerateJoinCode = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!validateTeacherAccess(req, res)) return;

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

    // Verify class exists and teacher owns it
    const classInstance = await Class.findByPk(classId);
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

    if (classInstance.teacher_id !== req.user!.id) {
      res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'You can only regenerate join codes for your own classes'
        }
      });
      return;
    }

    // Generate new unique join code
    const newJoinCode = await generateUniqueJoinCode();
    
    // Update the class
    await classInstance.update({ join_code: newJoinCode });

    res.json({
      success: true,
      data: {
        join_code: newJoinCode,
        message: 'Join code regenerated successfully'
      }
    });
  } catch (error) {
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
/**
 * Get all submissions across all teacher's classes
 * GET /api/submissions/all
 */
export const getAllTeacherSubmissions = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!validateTeacherAccess(req, res)) return;

    // Get all classes for this teacher
    const teacherClasses = await Class.findAll({
      where: { 
        teacher_id: req.user!.id,
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

    // Get all assignments for these classes
    const assignments = await Assignment.findAll({
      where: { 
        class_id: { [Op.in]: classIds }
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

    // Get all submissions for these assignments
    const submissions = await Submission.findAll({
      where: {
        assignment_id: { [Op.in]: assignmentIds }
      },
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['submitted_at', 'DESC']]
    });

    // Create lookup maps for efficiency
    const assignmentMap = new Map(assignments.map(a => [a.id, a]));
    const classMap = new Map(teacherClasses.map(c => [c.id, c]));

    // Format submissions with class and assignment info
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
  } catch (error) {
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

/**
 * Get all students enrolled in a class (teachers only)
 * GET /api/classes/:id/students
 */
export const getClassStudents = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!validateTeacherAccess(req, res)) return;

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

    // Verify class exists and teacher owns it
    const classInstance = await Class.findByPk(classId);
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

    if (classInstance.teacher_id !== req.user!.id) {
      res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'You can only view students for your own classes'
        }
      });
      return;
    }

    // Get all enrollments for this class
    const enrollments = await Enrollment.findAll({
      where: { 
        class_id: classId,
        status: { [Op.in]: ['active', 'pending', 'suspended'] }
      },
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['enrolled_at', 'DESC']]
    });

    // Format student data
    const students = enrollments.map(enrollment => ({
      id: enrollment.student.id,
      name: enrollment.student.name,
      email: enrollment.student.email,
      enrolled_at: enrollment.enrolled_at,
      status: enrollment.status
    }));

    // Get enrollment statistics
    const statistics = {
      total: enrollments.length,
      active: enrollments.filter(e => e.status === 'active').length,
      pending: enrollments.filter(e => e.status === 'pending').length,
      suspended: enrollments.filter(e => e.status === 'suspended').length,
      withdrawn: 0 // We don't include withdrawn in the query above
    };

    res.json({
      success: true,
      data: {
        students,
        statistics
      }
    });
  } catch (error) {
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

/**
 * Remove a student from a class (teachers only)
 * DELETE /api/classes/:classId/students/:studentId
 */
export const removeStudentFromClass = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!validateTeacherAccess(req, res)) return;

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

    // Verify class exists and teacher owns it
    const classInstance = await Class.findByPk(classId);
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

    if (classInstance.teacher_id !== req.user!.id) {
      res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'You can only remove students from your own classes'
        }
      });
      return;
    }

    // Find the enrollment
    const enrollment = await Enrollment.findOne({
      where: {
        class_id: classId,
        student_id: studentId,
        status: { [Op.in]: ['active', 'pending', 'suspended'] }
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

    // Update enrollment status to withdrawn
    await enrollment.update({ status: 'withdrawn' });

    res.json({
      success: true,
      data: {
        message: 'Student removed from class successfully'
      }
    });
  } catch (error) {
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
export const getClassSubmissions = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!validateTeacherAccess(req, res)) return;

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

    // Verify class exists and teacher owns it
    const classInstance = await Class.findByPk(classId);
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

    if (classInstance.teacher_id !== req.user!.id) {
      res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'You can only view submissions for your own classes'
        }
      });
      return;
    }

    // Get all assignments for this class
    const assignments = await Assignment.findAll({
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

    // Get all submissions for these assignments
    const submissions = await Submission.findAll({
      where: {
        assignment_id: { [Op.in]: assignmentIds }
      },
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['submitted_at', 'DESC']]
    });

    // Create assignment lookup map
    const assignmentMap = new Map(assignments.map(a => [a.id, a]));

    // Format submissions with assignment info
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
  } catch (error) {
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