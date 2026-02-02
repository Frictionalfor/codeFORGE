"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionResult = exports.TestCase = exports.EnrollmentAudit = exports.ClassInvitation = exports.Submission = exports.Enrollment = exports.Assignment = exports.Class = exports.User = exports.initializeAssociations = void 0;
const User_1 = require("./User");
Object.defineProperty(exports, "User", { enumerable: true, get: function () { return User_1.User; } });
const Class_1 = require("./Class");
Object.defineProperty(exports, "Class", { enumerable: true, get: function () { return Class_1.Class; } });
const Assignment_1 = require("./Assignment");
Object.defineProperty(exports, "Assignment", { enumerable: true, get: function () { return Assignment_1.Assignment; } });
const Enrollment_1 = require("./Enrollment");
Object.defineProperty(exports, "Enrollment", { enumerable: true, get: function () { return Enrollment_1.Enrollment; } });
const Submission_1 = require("./Submission");
Object.defineProperty(exports, "Submission", { enumerable: true, get: function () { return Submission_1.Submission; } });
const ClassInvitation_1 = require("./ClassInvitation");
Object.defineProperty(exports, "ClassInvitation", { enumerable: true, get: function () { return ClassInvitation_1.ClassInvitation; } });
const EnrollmentAudit_1 = require("./EnrollmentAudit");
Object.defineProperty(exports, "EnrollmentAudit", { enumerable: true, get: function () { return EnrollmentAudit_1.EnrollmentAudit; } });
const TestCase_1 = require("./TestCase");
Object.defineProperty(exports, "TestCase", { enumerable: true, get: function () { return TestCase_1.TestCase; } });
const ExecutionResult_1 = require("./ExecutionResult");
Object.defineProperty(exports, "ExecutionResult", { enumerable: true, get: function () { return ExecutionResult_1.ExecutionResult; } });
const initializeAssociations = () => {
    User_1.User.hasMany(Class_1.Class, {
        foreignKey: 'teacher_id',
        as: 'classes'
    });
    User_1.User.hasMany(Enrollment_1.Enrollment, {
        foreignKey: 'student_id',
        as: 'enrollments'
    });
    User_1.User.hasMany(Submission_1.Submission, {
        foreignKey: 'student_id',
        as: 'submissions'
    });
    User_1.User.hasMany(ClassInvitation_1.ClassInvitation, {
        foreignKey: 'invited_by',
        as: 'sentInvitations'
    });
    User_1.User.hasMany(ClassInvitation_1.ClassInvitation, {
        foreignKey: 'used_by',
        as: 'usedInvitations'
    });
    User_1.User.hasMany(EnrollmentAudit_1.EnrollmentAudit, {
        foreignKey: 'performed_by',
        as: 'auditActions'
    });
    Class_1.Class.belongsTo(User_1.User, {
        foreignKey: 'teacher_id',
        as: 'teacher'
    });
    Class_1.Class.hasMany(Assignment_1.Assignment, {
        foreignKey: 'class_id',
        as: 'assignments'
    });
    Class_1.Class.hasMany(Enrollment_1.Enrollment, {
        foreignKey: 'class_id',
        as: 'enrollments'
    });
    Class_1.Class.belongsToMany(User_1.User, {
        through: Enrollment_1.Enrollment,
        foreignKey: 'class_id',
        otherKey: 'student_id',
        as: 'students'
    });
    Class_1.Class.hasMany(ClassInvitation_1.ClassInvitation, {
        foreignKey: 'class_id',
        as: 'invitations'
    });
    Assignment_1.Assignment.belongsTo(Class_1.Class, {
        foreignKey: 'class_id',
        as: 'class'
    });
    Assignment_1.Assignment.hasMany(Submission_1.Submission, {
        foreignKey: 'assignment_id',
        as: 'submissions'
    });
    Assignment_1.Assignment.hasMany(TestCase_1.TestCase, {
        foreignKey: 'assignment_id',
        as: 'testCases'
    });
    Enrollment_1.Enrollment.belongsTo(User_1.User, {
        foreignKey: 'student_id',
        as: 'student'
    });
    Enrollment_1.Enrollment.belongsTo(Class_1.Class, {
        foreignKey: 'class_id',
        as: 'class'
    });
    Enrollment_1.Enrollment.belongsTo(User_1.User, {
        foreignKey: 'enrolled_by',
        as: 'enrolledByUser'
    });
    Enrollment_1.Enrollment.belongsTo(User_1.User, {
        foreignKey: 'withdrawn_by',
        as: 'withdrawnByUser'
    });
    Enrollment_1.Enrollment.hasMany(EnrollmentAudit_1.EnrollmentAudit, {
        foreignKey: 'enrollment_id',
        as: 'auditLog'
    });
    Submission_1.Submission.belongsTo(Assignment_1.Assignment, {
        foreignKey: 'assignment_id',
        as: 'assignment'
    });
    Submission_1.Submission.belongsTo(User_1.User, {
        foreignKey: 'student_id',
        as: 'student'
    });
    Submission_1.Submission.hasMany(ExecutionResult_1.ExecutionResult, {
        foreignKey: 'submission_id',
        as: 'executionResults'
    });
    TestCase_1.TestCase.belongsTo(Assignment_1.Assignment, {
        foreignKey: 'assignment_id',
        as: 'assignment'
    });
    TestCase_1.TestCase.hasMany(ExecutionResult_1.ExecutionResult, {
        foreignKey: 'test_case_id',
        as: 'executionResults'
    });
    ExecutionResult_1.ExecutionResult.belongsTo(Submission_1.Submission, {
        foreignKey: 'submission_id',
        as: 'submission'
    });
    ExecutionResult_1.ExecutionResult.belongsTo(TestCase_1.TestCase, {
        foreignKey: 'test_case_id',
        as: 'testCase'
    });
    User_1.User.belongsToMany(Class_1.Class, {
        through: Enrollment_1.Enrollment,
        foreignKey: 'student_id',
        otherKey: 'class_id',
        as: 'enrolledClasses'
    });
    ClassInvitation_1.ClassInvitation.belongsTo(Class_1.Class, {
        foreignKey: 'class_id',
        as: 'class'
    });
    ClassInvitation_1.ClassInvitation.belongsTo(User_1.User, {
        foreignKey: 'invited_by',
        as: 'inviter'
    });
    ClassInvitation_1.ClassInvitation.belongsTo(User_1.User, {
        foreignKey: 'used_by',
        as: 'user'
    });
    EnrollmentAudit_1.EnrollmentAudit.belongsTo(Enrollment_1.Enrollment, {
        foreignKey: 'enrollment_id',
        as: 'enrollment'
    });
    EnrollmentAudit_1.EnrollmentAudit.belongsTo(User_1.User, {
        foreignKey: 'performed_by',
        as: 'performer'
    });
};
exports.initializeAssociations = initializeAssociations;
(0, exports.initializeAssociations)();
//# sourceMappingURL=index.js.map