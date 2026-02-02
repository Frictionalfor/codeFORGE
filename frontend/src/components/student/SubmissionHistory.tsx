import React, { useState, useEffect } from 'react'
import { 
  History as HistoryIcon, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Play, 
  Trophy, 
  Code2,
  Eye,
  X,
  FileText
} from 'lucide-react'
import { Submission } from '../../types/api'
import { submissionService } from '../../services/submissionService'
import { LoadingSpinner } from '../ui/LoadingSpinner'

interface SubmissionHistoryProps {
  assignmentId: string
  classId: string
  isOpen: boolean
  onClose: () => void
}

const SubmissionHistory: React.FC<SubmissionHistoryProps> = ({
  assignmentId,
  classId,
  isOpen,
  onClose
}) => {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadSubmissionHistory()
    }
  }, [isOpen, assignmentId, classId])

  const loadSubmissionHistory = async () => {
    try {
      setIsLoading(true)
      const response = await submissionService.getSubmissionHistory(assignmentId, classId)
      setSubmissions(response.submissions)
    } catch (error) {
      console.error('Error loading submission history:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-400" />
      case 'running':
        return <Play className="h-4 w-4 text-blue-400" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-400" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending'
      case 'running':
        return 'Running'
      case 'completed':
        return 'Completed'
      case 'failed':
        return 'Failed'
      default:
        return 'Unknown'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
      case 'running':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20'
      case 'completed':
        return 'text-green-400 bg-green-400/10 border-green-400/20'
      case 'failed':
        return 'text-red-400 bg-red-400/10 border-red-400/20'
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <HistoryIcon className="h-6 w-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Submission History</h2>
            {!isLoading && (
              <span className="text-sm text-gray-400">
                ({submissions.length} submission{submissions.length !== 1 ? 's' : ''})
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex h-[calc(90vh-80px)]">
          {/* Submissions List */}
          <div className="w-1/2 border-r border-gray-700 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : submissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-gray-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-400 mb-2">No Submissions Yet</h3>
                <p className="text-gray-500 text-sm">
                  Your submission history will appear here once you submit code for this assignment.
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {submissions.map((submission, index) => (
                  <div
                    key={submission.id}
                    onClick={() => setSelectedSubmission(submission)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                      selectedSubmission?.id === submission.id
                        ? 'bg-blue-500/20 border-blue-500/30'
                        : 'bg-gray-800/30 border-gray-700 hover:bg-gray-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-white">
                          Submission #{submissions.length - index}
                        </span>
                        {index === 0 && (
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-lg font-medium">
                            Latest
                          </span>
                        )}
                      </div>
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg border text-xs font-medium ${getStatusColor(submission.status)}`}>
                        {getStatusIcon(submission.status)}
                        <span>{getStatusText(submission.status)}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(submission.submitted_at)}</span>
                      </div>
                      {submission.status === 'completed' && (
                        <div className="flex items-center space-x-1">
                          <Trophy className="h-4 w-4 text-yellow-400" />
                          <span className="text-yellow-400">
                            {submission.points_earned}/{submission.assignment?.total_points} pts
                          </span>
                        </div>
                      )}
                    </div>

                    {submission.status === 'completed' && submission.executionResults && (
                      <div className="mt-3 flex items-center space-x-2">
                        <span className="text-xs text-gray-500">Test Cases:</span>
                        <div className="flex space-x-1">
                          {submission.executionResults.map((result: any, idx: number) => (
                            <div
                              key={idx}
                              className={`w-3 h-3 rounded-full ${
                                result.status === 'passed' ? 'bg-green-400' : 'bg-red-400'
                              }`}
                              title={`Test Case ${idx + 1}: ${result.status}`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submission Details */}
          <div className="w-1/2 overflow-y-auto">
            {selectedSubmission ? (
              <div className="p-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">
                      Submission Details
                    </h3>
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg border ${getStatusColor(selectedSubmission.status)}`}>
                      {getStatusIcon(selectedSubmission.status)}
                      <span className="text-sm font-medium">{getStatusText(selectedSubmission.status)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Submitted:</span>
                      <p className="text-white font-medium">{formatDate(selectedSubmission.submitted_at)}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Language:</span>
                      <p className="text-white font-medium uppercase">{selectedSubmission.assignment?.language}</p>
                    </div>
                    {selectedSubmission.status === 'completed' && (
                      <>
                        <div>
                          <span className="text-gray-400">Score:</span>
                          <p className="text-white font-medium">
                            {selectedSubmission.points_earned}/{selectedSubmission.assignment?.total_points} points
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-400">Percentage:</span>
                          <p className="text-white font-medium">
                            {selectedSubmission.assignment?.total_points 
                              ? Math.round((selectedSubmission.points_earned || 0) / selectedSubmission.assignment.total_points * 100)
                              : 0}%
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Code Display */}
                <div className="mb-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <Code2 className="h-5 w-5 text-green-400" />
                    <h4 className="text-white font-medium">Submitted Code</h4>
                  </div>
                  <div className="bg-gray-950 border border-gray-700 rounded-lg overflow-hidden">
                    <div className="p-3 border-b border-gray-700 bg-gray-800/50">
                      <span className="text-xs text-gray-400 font-mono">
                        {selectedSubmission.assignment?.language === 'c' ? 'main.c' :
                         selectedSubmission.assignment?.language === 'cpp' ? 'main.cpp' :
                         selectedSubmission.assignment?.language === 'python' ? 'main.py' :
                         'main.js'}
                      </span>
                    </div>
                    <pre className="p-4 text-sm text-gray-300 font-mono overflow-x-auto whitespace-pre-wrap">
                      {selectedSubmission.code || 'No code available'}
                    </pre>
                  </div>
                </div>

                {/* Execution Results */}
                {selectedSubmission.status === 'completed' && selectedSubmission.executionResults && (
                  <div className="mb-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <Trophy className="h-5 w-5 text-yellow-400" />
                      <h4 className="text-white font-medium">Test Results</h4>
                    </div>
                    <div className="space-y-3">
                      {selectedSubmission.executionResults.map((result: any, index: number) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border ${
                            result.status === 'passed'
                              ? 'bg-green-600/10 border-green-600/20'
                              : 'bg-red-600/10 border-red-600/20'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-white">
                              Test Case {index + 1}
                            </span>
                            <span className={`text-sm font-medium ${
                              result.status === 'passed' ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {result.status === 'passed' ? 'PASSED' : 'FAILED'}
                            </span>
                          </div>
                          {result.points_earned !== undefined && (
                            <p className="text-xs text-gray-400">
                              Points: {result.points_earned}/{result.testCase?.points || 0}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Compilation Error */}
                {selectedSubmission.status === 'failed' && selectedSubmission.compilation_error && (
                  <div className="mb-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <AlertCircle className="h-5 w-5 text-red-400" />
                      <h4 className="text-white font-medium">Compilation Error</h4>
                    </div>
                    <div className="bg-red-600/10 border border-red-600/20 rounded-lg p-4">
                      <pre className="text-red-300 text-sm font-mono whitespace-pre-wrap">
                        {selectedSubmission.compilation_error}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <Eye className="h-12 w-12 text-gray-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-400 mb-2">Select a Submission</h3>
                <p className="text-gray-500 text-sm">
                  Click on a submission from the list to view its details and code.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubmissionHistory