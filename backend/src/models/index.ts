import { User } from './User';
import { Class } from './Class';
import { Assignment } from './Assignment';
import { Enrollment } from './Enrollment';
import { Submission } from './Submission';
import { ClassInvitation } from './ClassInvitation';
import { EnrollmentAudit } from './EnrollmentAudit';
import { TestCase } from './TestCase';
import { ExecutionResult } from './ExecutionResult';

// Define model associations
export const initializeAssociations = (): void => {
  // User associations
  User.hasMany(Class, {
    foreignKey: 'teacher_id',
    as: 'classes'
  });

  User.hasMany(Enrollment, {
    foreignKey: 'student_id',
    as: 'enrollments'
  });

  User.hasMany(Submission, {
    foreignKey: 'student_id',
    as: 'submissions'
  });

  User.hasMany(ClassInvitation, {
    foreignKey: 'invited_by',
    as: 'sentInvitations'
  });

  User.hasMany(ClassInvitation, {
    foreignKey: 'used_by',
    as: 'usedInvitations'
  });

  User.hasMany(EnrollmentAudit, {
    foreignKey: 'performed_by',
    as: 'auditActions'
  });

  // Class associations
  Class.belongsTo(User, {
    foreignKey: 'teacher_id',
    as: 'teacher'
  });

  Class.hasMany(Assignment, {
    foreignKey: 'class_id',
    as: 'assignments'
  });

  Class.hasMany(Enrollment, {
    foreignKey: 'class_id',
    as: 'enrollments'
  });

  Class.belongsToMany(User, {
    through: Enrollment,
    foreignKey: 'class_id',
    otherKey: 'student_id',
    as: 'students'
  });

  Class.hasMany(ClassInvitation, {
    foreignKey: 'class_id',
    as: 'invitations'
  });

  // Assignment associations
  Assignment.belongsTo(Class, {
    foreignKey: 'class_id',
    as: 'class'
  });

  Assignment.hasMany(Submission, {
    foreignKey: 'assignment_id',
    as: 'submissions'
  });

  Assignment.hasMany(TestCase, {
    foreignKey: 'assignment_id',
    as: 'testCases'
  });

  // Enrollment associations
  Enrollment.belongsTo(User, {
    foreignKey: 'student_id',
    as: 'student'
  });

  Enrollment.belongsTo(Class, {
    foreignKey: 'class_id',
    as: 'class'
  });

  Enrollment.belongsTo(User, {
    foreignKey: 'enrolled_by',
    as: 'enrolledByUser'
  });

  Enrollment.belongsTo(User, {
    foreignKey: 'withdrawn_by',
    as: 'withdrawnByUser'
  });

  Enrollment.hasMany(EnrollmentAudit, {
    foreignKey: 'enrollment_id',
    as: 'auditLog'
  });

  // Submission associations
  Submission.belongsTo(Assignment, {
    foreignKey: 'assignment_id',
    as: 'assignment'
  });

  Submission.belongsTo(User, {
    foreignKey: 'student_id',
    as: 'student'
  });

  Submission.hasMany(ExecutionResult, {
    foreignKey: 'submission_id',
    as: 'executionResults'
  });

  // TestCase associations
  TestCase.belongsTo(Assignment, {
    foreignKey: 'assignment_id',
    as: 'assignment'
  });

  TestCase.hasMany(ExecutionResult, {
    foreignKey: 'test_case_id',
    as: 'executionResults'
  });

  // ExecutionResult associations
  ExecutionResult.belongsTo(Submission, {
    foreignKey: 'submission_id',
    as: 'submission'
  });

  ExecutionResult.belongsTo(TestCase, {
    foreignKey: 'test_case_id',
    as: 'testCase'
  });

  // Many-to-many association for User and Class through Enrollment
  User.belongsToMany(Class, {
    through: Enrollment,
    foreignKey: 'student_id',
    otherKey: 'class_id',
    as: 'enrolledClasses'
  });

  // ClassInvitation associations
  ClassInvitation.belongsTo(Class, {
    foreignKey: 'class_id',
    as: 'class'
  });

  ClassInvitation.belongsTo(User, {
    foreignKey: 'invited_by',
    as: 'inviter'
  });

  ClassInvitation.belongsTo(User, {
    foreignKey: 'used_by',
    as: 'user'
  });

  // EnrollmentAudit associations
  EnrollmentAudit.belongsTo(Enrollment, {
    foreignKey: 'enrollment_id',
    as: 'enrollment'
  });

  EnrollmentAudit.belongsTo(User, {
    foreignKey: 'performed_by',
    as: 'performer'
  });
};

// Export all models
export {
  User,
  Class,
  Assignment,
  Enrollment,
  Submission,
  ClassInvitation,
  EnrollmentAudit,
  TestCase,
  ExecutionResult
};

// Initialize associations when this module is imported
initializeAssociations();