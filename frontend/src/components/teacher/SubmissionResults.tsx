import React, { useState, useEffect } from 'react'
import { ArrowLeft, User, Clock, CheckCircle, XCircle, AlertCircle, Code } from 'lucide-react'
import { Assignment, Submission } from '../../types/api'
import { classService } from '../../services/classService'
import Button from '../ui/Button'
import Card from '../ui/Card'
import Modal from '../ui/Modal'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import toast from 'react-hot-toast'

interface SubmissionResultsProps {
  assignment: Assignment
  classId: string
  onBack: () => void
}

const SubmissionResults: React.FC<SubmissionResultsProps> = ({ assignment, classId, onBack }) => {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [showCodeModal, setShowCodeModal] = useState(false)

  useEffect(() => {
    loadSubmissions()
  }, [assignment.id])

  const loadSubmissions = async () => {
    try {
      setIsLoading(true)
      const response = await classService.getAssignmentSubmissions(classId, assignment.id)
      setSubmissions(response.submissions)
    } catch (error) {
      toast.error('Failed to load submissions')
      console.error('Error loading submissions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-400" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-400" />
      case 'running':
        return <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-400 border-t-transparent" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-400" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400'
      case 'failed':
        return 'text-red-400'
      case 'running':
        return 'text-blue-400'
      case 'pending':
        return 'text-yellow-400'
      default:
        return 'text-gray-400'
    }
  }

  const getTestCaseStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-400" />
      case 'timeout':
        return <Clock className="h-4 w-4 text-yellow-400" />
      case 'runtime_error':
      case 'memory_exceeded':
        return <AlertCircle className="h-4 w-4 text-red-400" />
      case 'compilation_error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'running':
        return <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-400 border-t-transparent" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const formatTime = (ms: number | null) => {
    if (ms === null) return 'N/A'
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  const formatMemory = (mb: number | null) => {
    if (mb === null) return 'N/A'
    return `${mb.toFixed(2)} MB`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const viewSubmissionCode = (submission: Submission) => {
    setSelectedSubmission(submission)
    setShowCodeModal(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack} className="p-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">{assignment.title}</h1>
          <p className="text-gray-400">Submission Results ({submissions.length} submissions)</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{submissions.length}</p>
            <p className="text-gray-400 text-sm">Total Submissions</p>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">
              {submissions.filter(s => s.status === 'completed').length}
            </p>
            <p className="text-gray-400 text-sm">Completed</p>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-400">
              {submissions.filter(s => s.status === 'failed').length}
            </p>
            <p className="text-gray-400 text-sm">Failed</p>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-400">
              {submissions.filter(s => s.status === 'pending' || s.status === 'running').length}
            </p>
            <p className="text-gray-400 text-sm">In Progress</p>
          </div>
        </Card>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {submissions.length === 0 ? (
          <Card className="text-center py-12">
            <User className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No submissions yet</h3>
            <p className="text-gray-400">Students haven't submitted any code for this assignment.</p>
          </Card>
        ) : (
          submissions.map((submission) => (
            <Card key={submission.id} className="hover:border-primary-500/50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="bg-primary-600/10 p-3 rounded-lg">
                    <User className="h-6 w-6 text-primary-400" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-white">{submission.student?.name}</h3>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(submission.status)}
                        <span className={`text-sm font-medium ${getStatusColor(submission.status)}`}>
                          {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-3">{submission.student?.email}</p>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-400 mb-4">
                      <span>Submitted: {formatDate(submission.submitted_at)}</span>
                      <span>Language: {submission.language.toUpperCase()}</span>
                      <span>
                        Score: {submission.points_earned}/{submission.total_points} points
                      </span>
                    </div>

                    {/* Test Case Results */}
                    {submission.executionResults && submission.executionResults.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-300">Test Case Results:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {submission.executionResults.map((result, index) => (
                            <div
                              key={result.id}
                              className="bg-dark-700 p-3 rounded border border-gray-600"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-gray-300">
                                  Test {index + 1} {result.testCase?.is_hidden && '(Hidden)'}
                                </span>
                                {getTestCaseStatusIcon(result.status)}
                              </div>
                              
                              <div className="text-xs text-gray-400 space-y-1">
                                <div>Time: {formatTime(result.execution_time)}</div>
                                <div>Memory: {formatMemory(result.memory_used)}</div>
                                <div>Points: {result.points_earned}/{result.testCase?.points || 0}</div>
                              </div>
                              
                              {result.error_message && (
                                <div className="mt-2 text-xs text-red-400 truncate" title={result.error_message}>
                                  {result.error_message}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Compilation Error */}
                    {submission.compilation_error && (
                      <div className="mt-3 p-3 bg-red-900/20 border border-red-500/30 rounded">
                        <h4 className="text-sm font-medium text-red-400 mb-2">Compilation Error:</h4>
                        <pre className="text-xs text-red-300 whitespace-pre-wrap font-mono">
                          {submission.compilation_error}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => viewSubmissionCode(submission)}
                    className="flex items-center space-x-2"
                  >
                    <Code className="h-4 w-4" />
                    <span>View Code</span>
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Code View Modal */}
      <Modal
        isOpen={showCodeModal}
        onClose={() => setShowCodeModal(false)}
        title={`Code Submission - ${selectedSubmission?.student?.name}`}
        size="xl"
      >
        {selectedSubmission && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>Language: {selectedSubmission.language.toUpperCase()}</span>
              <span>Submitted: {formatDate(selectedSubmission.submitted_at)}</span>
            </div>
            
            {selectedSubmission.code ? (
              <div className="bg-gray-950 border border-gray-700 rounded-lg overflow-hidden">
                <div className="p-3 border-b border-gray-700 bg-gray-800/50">
                  <span className="text-xs text-gray-400 font-mono">
                    {selectedSubmission.language === 'c' ? 'main.c' :
                     selectedSubmission.language === 'cpp' ? 'main.cpp' :
                     selectedSubmission.language === 'python' ? 'main.py' :
                     'main.js'}
                  </span>
                </div>
                <pre className="p-4 text-sm text-gray-300 whitespace-pre-wrap font-mono overflow-x-auto">
                  {selectedSubmission.code}
                </pre>
              </div>
            ) : (
              <div className="bg-gray-800/50 p-8 rounded-lg border border-gray-600 text-center">
                <Code className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No code available for this submission</p>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-400">
                {selectedSubmission.code && (
                  <>
                    <span>{selectedSubmission.code.split('\n').length} lines</span>
                    <span className="mx-2">•</span>
                    <span>{selectedSubmission.code.length} characters</span>
                  </>
                )}
              </div>
              <Button variant="outline" onClick={() => setShowCodeModal(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default SubmissionResults