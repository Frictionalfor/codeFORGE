import React, { useState, useEffect } from 'react'
import { ArrowLeft, User, Calendar, Code, FileText, Download } from 'lucide-react'
import { Assignment, Submission } from '../../types/api'
import { submissionService } from '../../services/submissionService'
import Card from '../ui/Card'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import toast from 'react-hot-toast'

interface SubmissionReviewProps {
  assignment: Assignment
  onBack: () => void
}

interface SubmissionWithUser extends Submission {
  student: {
    id: string
    name: string
    email: string
  }
}

const SubmissionReview: React.FC<SubmissionReviewProps> = ({ assignment, onBack }) => {
  const [submissions, setSubmissions] = useState<SubmissionWithUser[]>([])
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionWithUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadSubmissions()
  }, [assignment.id])

  const loadSubmissions = async () => {
    try {
      setIsLoading(true)
      const response = await submissionService.getAssignmentSubmissions(assignment.id)
      setSubmissions(response)
    } catch (error) {
      console.error('Failed to load submissions:', error)
      toast.error('Failed to load submissions')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadCode = (submission: SubmissionWithUser) => {
    const blob = new Blob([submission.code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${submission.student.name}_${assignment.title}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="btn-ghost p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Code Review</h1>
            <p className="text-gray-400">{assignment.title}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Total Submissions</p>
          <p className="text-2xl font-bold text-primary-400">{submissions.length}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Submissions List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-semibold text-white mb-4">Student Submissions</h2>
          
          {submissions.length === 0 ? (
            <Card className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No Submissions Yet</h3>
              <p className="text-gray-400">Students haven't submitted code for this assignment.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {submissions.map((submission) => (
                <Card
                  key={submission.id}
                  variant={selectedSubmission?.id === submission.id ? 'glow' : 'hover'}
                  className="cursor-pointer"
                  onClick={() => setSelectedSubmission(submission)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-primary-600/20 p-2 rounded-lg">
                        <User className="h-4 w-4 text-primary-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{submission.student.name}</p>
                        <p className="text-sm text-gray-400">{submission.student.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1 text-xs text-gray-400">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(submission.submitted_at)}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Code Review Panel */}
        <div className="lg:col-span-2">
          {selectedSubmission ? (
            <div className="space-y-6">
              {/* Student Info */}
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary-600/20 p-3 rounded-lg">
                      <User className="h-6 w-6 text-primary-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{selectedSubmission.student.name}</h3>
                      <p className="text-gray-400">{selectedSubmission.student.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownloadCode(selectedSubmission)}
                    className="btn-outline"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Code
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Submitted At</p>
                    <p className="text-white font-medium">{formatDate(selectedSubmission.submitted_at)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Code Length</p>
                    <p className="text-white font-medium">{selectedSubmission.code.length} characters</p>
                  </div>
                </div>
              </Card>

              {/* Assignment Problem */}
              <Card>
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-accent-400" />
                  Problem Description
                </h4>
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                  <p className="text-gray-300 whitespace-pre-wrap">{assignment.problem_description}</p>
                </div>
              </Card>

              {/* Code Submission */}
              <Card>
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <Code className="h-5 w-5 mr-2 text-success-400" />
                  Student Solution
                </h4>
                <div className="bg-slate-950 rounded-lg p-4 border border-slate-700/50 font-mono text-sm overflow-x-auto">
                  <pre className="text-gray-300 whitespace-pre-wrap">{selectedSubmission.code}</pre>
                </div>
                
                <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
                  <span>{selectedSubmission.code.split('\n').length} lines</span>
                  <span>{selectedSubmission.code.split(/\s+/).length} words</span>
                </div>
              </Card>
            </div>
          ) : (
            <Card className="text-center py-12">
              <Code className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Select a Submission</h3>
              <p className="text-gray-400">Choose a student submission from the list to review their code.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default SubmissionReview