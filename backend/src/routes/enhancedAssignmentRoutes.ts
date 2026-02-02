import { Router } from 'express';
import { requireAuthWithUser } from '../middleware/firebaseAuth';
import {
  createAssignmentWithTestCases,
  getAssignmentTestCases,
  submitAssignmentCode,
  getAssignmentSubmissions,
  getSubmissionDetails,
  getClassAssignments,
  getStudentSubmission,
  getAssignmentSubmissionStatus,
  updateAssignment,
  deleteAssignment,
  getSubmissionHistory
} from '../controllers/enhancedAssignmentController';

const router = Router();

// All routes require Firebase authentication with user profile
router.use(requireAuthWithUser);

// Assignment submission status (lightweight endpoint for schedule)
router.get('/assignments/:assignmentId/submission-status', getAssignmentSubmissionStatus);

// Assignment management with test cases
router.get('/:classId/assignments', getClassAssignments);
router.post('/:classId/assignments', createAssignmentWithTestCases);
router.put('/:classId/assignments/:assignmentId', updateAssignment);
router.delete('/:classId/assignments/:assignmentId', deleteAssignment);
router.get('/:classId/assignments/:assignmentId/test-cases', getAssignmentTestCases);

// Code submission and execution
router.post('/:classId/assignments/:assignmentId/submit', submitAssignmentCode);
router.get('/:classId/assignments/:assignmentId/submission', getStudentSubmission);
router.get('/:classId/assignments/:assignmentId/submission-history', getSubmissionHistory);

// Submission viewing
router.get('/:classId/assignments/:assignmentId/submissions', getAssignmentSubmissions);
router.get('/:classId/assignments/:assignmentId/submissions/:submissionId', getSubmissionDetails);

export default router;