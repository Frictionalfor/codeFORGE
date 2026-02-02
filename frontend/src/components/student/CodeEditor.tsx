import React, { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Save, RotateCcw, CheckCircle, AlertCircle, Play, Clock, Trophy, FileText, Code2, Languages, Info, X, History as HistoryIcon, Eye } from 'lucide-react'
import { Assignment } from '../../types/api'
import { submissionService } from '../../services/submissionService'
import Button from '../ui/Button'
import Card from '../ui/Card'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import MonacoCodeEditor from '../editor/MonacoCodeEditor'
import SubmissionHistory from './SubmissionHistory'
import Modal from '../ui/Modal'
import toast from 'react-hot-toast'

interface CodeEditorProps {
  assignment: Assignment
  classId: string
  onBack: () => void
  onSubmissionComplete?: () => void // Add callback for when submission is completed
}

interface SubmissionStatus {
  status: 'pending' | 'running' | 'completed' | 'failed'
  points_earned?: number
  total_points?: number
  compilation_error?: string
  execution_results?: any[]
}

const CodeEditor: React.FC<CodeEditorProps> = ({ assignment, classId, onBack, onSubmissionComplete }) => {
  const [code, setCode] = useState('')
  const [originalCode, setOriginalCode] = useState('')
  const [submittedCode, setSubmittedCode] = useState('')
  const [showSubmittedCodeModal, setShowSubmittedCodeModal] = useState(false)
  const [selectedLanguage] = useState<'c' | 'cpp' | 'python' | 'javascript'>(
    assignment.language === 'c' ? 'c' :
    assignment.language === 'cpp' ? 'cpp' : 
    assignment.language === 'python' ? 'python' : 'javascript'
  )
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasSubmission, setHasSubmission] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus | null>(null)
  const [, setIsPolling] = useState(false)
  const [showProblemPanel, setShowProblemPanel] = useState(false)
  const [showSubmissionHistory, setShowSubmissionHistory] = useState(false)
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const SUPPORTED_LANGUAGES = [
    { key: 'c' as const, label: 'C', extension: '.c' },
    { key: 'cpp' as const, label: 'C++', extension: '.cpp' },
    { key: 'python' as const, label: 'Python', extension: '.py' },
    { key: 'javascript' as const, label: 'JavaScript', extension: '.js' }
  ]

  useEffect(() => {
    loadExistingSubmission()
    
    // Add keyboard shortcut for problem panel
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'i') {
        e.preventDefault()
        setShowProblemPanel(prev => !prev)
      }
    }
    
    document.addEventListener('keydown', handleKeyPress)
    
    return () => {
      document.removeEventListener('keydown', handleKeyPress)
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
  }, [assignment.id])

  useEffect(() => {
    setHasUnsavedChanges(code !== originalCode)
  }, [code, originalCode])

  const loadExistingSubmission = async () => {
    try {
      setIsLoading(true)
      const response = await submissionService.getSubmission(assignment.id, classId)
      
      if (response.submission) {
        setCode(response.submission.code || '')
        setOriginalCode(response.submission.code || '')
        setSubmittedCode(response.submission.code || '')
        setHasSubmission(true)
        setLastSaved(new Date(response.submission.submitted_at))
        setSubmissionStatus({
          status: response.submission.status,
          points_earned: response.submission.points_earned,
          total_points: response.submission.total_points,
          compilation_error: response.submission.compilation_error || undefined,
          execution_results: response.submission.executionResults
        })
      } else {
        // No existing submission, start with empty code
        setCode('')
        setOriginalCode('')
        setSubmittedCode('')
        setHasSubmission(false)
        setSubmissionStatus(null)
      }
    } catch (error) {
      toast.error('Failed to load existing submission')
      console.error('Error loading submission:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const pollSubmissionStatus = async () => {
    try {
      const response = await submissionService.getSubmission(assignment.id, classId)
      if (response.submission) {
        const newStatus = {
          status: response.submission.status,
          points_earned: response.submission.points_earned,
          total_points: response.submission.total_points,
          compilation_error: response.submission.compilation_error || undefined,
          execution_results: response.submission.executionResults
        }
        
        setSubmissionStatus(newStatus)

        // Stop polling if submission is completed or failed
        if (response.submission.status === 'completed' || response.submission.status === 'failed') {
          setIsPolling(false)
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current)
          }
          
          // Trigger callback to refresh dashboard
          if (onSubmissionComplete) {
            onSubmissionComplete()
          }
        }
      }
    } catch (error) {
      console.error('Error polling submission status:', error)
    }
  }

  const startPolling = () => {
    setIsPolling(true)
    pollIntervalRef.current = setInterval(pollSubmissionStatus, 2000) // Poll every 2 seconds
  }

  const handleSave = async () => {
    if (!hasUnsavedChanges) {
      toast.success('No changes to save')
      return
    }

    if (!code.trim()) {
      toast.error('Please write some code before submitting')
      return
    }

    setIsSaving(true)
    try {
      await submissionService.submitCode(assignment.id, { 
        code: code.trim()
      }, classId)
      setOriginalCode(code)
      setSubmittedCode(code.trim())
      setHasSubmission(true)
      setLastSaved(new Date())
      setSubmissionStatus({ status: 'pending' })
      toast.success('Code submitted successfully!')
      
      // Start polling for status updates
      startPolling()
    } catch (error) {
      toast.error('Failed to submit code')
      console.error('Error submitting code:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('Are you sure you want to discard your changes?')) {
        setCode(originalCode)
      }
    }
  }

  const handleRun = () => {
    if (!code.trim()) {
      toast.error('Please write some code before running')
      return
    }
    handleSave()
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusIcon = () => {
    if (!submissionStatus) return null
    
    switch (submissionStatus.status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-400 animate-pulse" />
      case 'running':
        return <Play className="h-4 w-4 text-blue-400 animate-pulse" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-400" />
      default:
        return null
    }
  }

  const getStatusText = () => {
    if (!submissionStatus) return null
    
    switch (submissionStatus.status) {
      case 'pending':
        return 'Submission pending...'
      case 'running':
        return 'Code executing...'
      case 'completed':
        return `Completed (${submissionStatus.points_earned}/${submissionStatus.total_points} points)`
      case 'failed':
        return 'Execution failed'
      default:
        return null
    }
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
      <div className="flex items-center justify-between no-select">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack} className="p-2 hover-lift">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">{assignment.title}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              {hasSubmission && (
                <div className="flex items-center space-x-1 text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  <span>Submitted</span>
                </div>
              )}
              {submissionStatus && (
                <div className="flex items-center space-x-1">
                  {getStatusIcon()}
                  <span>{getStatusText()}</span>
                </div>
              )}
              {lastSaved && (
                <span>Last saved: {formatDate(lastSaved)}</span>
              )}
              {hasUnsavedChanges && (
                <div className="flex items-center space-x-1 text-yellow-400 animate-pulse">
                  <AlertCircle className="h-4 w-4" />
                  <span>Unsaved changes</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Submission History Button */}
          <Button
            variant="outline"
            onClick={() => setShowSubmissionHistory(true)}
            className="hover-lift"
          >
            <HistoryIcon className="h-4 w-4 mr-2" />
            History
          </Button>

          {/* Problem Info Button */}
          <Button
            variant="outline"
            onClick={() => setShowProblemPanel(true)}
            className="hover-lift"
          >
            <Info className="h-4 w-4 mr-2" />
            Problem Info
          </Button>

          {/* Language Display (Read-only) */}
          <div className="flex items-center space-x-2 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg">
            <Languages className="h-4 w-4 text-gray-400" />
            <span className="text-white text-sm font-medium">
              {SUPPORTED_LANGUAGES.find(l => l.key === selectedLanguage)?.label}
            </span>
            <span className="text-xs text-gray-500">(Assigned Language)</span>
          </div>

          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!hasUnsavedChanges || isSaving}
            className="hover-lift"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button
            onClick={handleSave}
            loading={isSaving}
            disabled={!hasUnsavedChanges}
            className="hover-lift"
          >
            <Save className="h-4 w-4 mr-2" />
            Submit Code
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Full Width Code Editor */}
        <Card className="hover-lift p-0 overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center space-x-2">
              <Code2 className="h-5 w-5 text-green-400" />
              <h2 className="text-lg font-semibold text-white no-select">Code Editor</h2>
              <span className="text-xs text-gray-500 uppercase font-semibold ml-auto">
                {SUPPORTED_LANGUAGES.find(l => l.key === selectedLanguage)?.label}
              </span>
            </div>
          </div>
          
          <MonacoCodeEditor
            value={code}
            onChange={setCode}
            language={selectedLanguage}
            onRun={handleRun}
            onSave={handleSave}
            onReset={handleReset}
            isLoading={isSaving}
            className="border-0 rounded-none"
          />
        </Card>
      </div>

      {/* Submission Results */}
      {submissionStatus && (
        <Card className="hover-lift">
          <div className="flex items-center space-x-2 mb-4">
            <Trophy className="h-5 w-5 text-yellow-400" />
            <h2 className="text-lg font-semibold text-white no-select">Submission Results</h2>
          </div>
          
          {submissionStatus.status === 'completed' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-600/10 border border-green-600/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                  <div>
                    <p className="text-green-400 font-semibold">Execution Completed</p>
                    <p className="text-gray-300 text-sm">Your code ran successfully</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-400">{submissionStatus.points_earned}/{submissionStatus.total_points}</p>
                    <p className="text-gray-400 text-sm">Points Earned</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSubmittedCodeModal(true)}
                    className="flex items-center space-x-2"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View Code</span>
                  </Button>
                </div>
              </div>
              
              {submissionStatus.execution_results && submissionStatus.execution_results.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-white font-medium">Test Case Results:</h3>
                  {submissionStatus.execution_results.map((result: any, index: number) => (
                    <div key={index} className={`p-3 rounded-lg border ${
                      result.status === 'passed' 
                        ? 'bg-green-600/10 border-green-600/20' 
                        : 'bg-red-600/10 border-red-600/20'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white">Test Case {index + 1}</span>
                        <span className={`text-sm font-medium ${
                          result.status === 'passed' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {result.status === 'passed' ? 'PASSED' : 'FAILED'}
                        </span>
                      </div>
                      {result.points_earned !== undefined && (
                        <p className="text-xs text-gray-400 mt-1">
                          Points: {result.points_earned}/{result.testCase?.points || 0}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {submissionStatus.status === 'failed' && submissionStatus.compilation_error && (
            <div className="space-y-4">
              <div className="p-4 bg-red-600/10 border border-red-600/20 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <p className="text-red-400 font-semibold">Compilation Error</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSubmittedCodeModal(true)}
                    className="flex items-center space-x-2"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View Code</span>
                  </Button>
                </div>
                <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono bg-gray-900 p-3 rounded border">
                  {submissionStatus.compilation_error}
                </pre>
              </div>
            </div>
          )}
          
          {(submissionStatus.status === 'pending' || submissionStatus.status === 'running') && (
            <div className="p-4 bg-blue-600/10 border border-blue-600/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {submissionStatus.status === 'pending' ? (
                    <Clock className="h-5 w-5 text-blue-400 animate-pulse" />
                  ) : (
                    <Play className="h-5 w-5 text-blue-400 animate-pulse" />
                  )}
                  <div>
                    <p className="text-blue-400 font-semibold">
                      {submissionStatus.status === 'pending' ? 'Submission Queued' : 'Code Executing'}
                    </p>
                    <p className="text-gray-300 text-sm">
                      {submissionStatus.status === 'pending' 
                        ? 'Your code is in the execution queue...' 
                        : 'Running your code against test cases...'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSubmittedCodeModal(true)}
                  className="flex items-center space-x-2"
                >
                  <Eye className="h-4 w-4" />
                  <span>View Code</span>
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Problem Panel Sidebar */}
      {showProblemPanel && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowProblemPanel(false)}
          />
          
          {/* Sidebar */}
          <div className="relative w-full max-w-md sm:max-w-lg bg-gray-900 border-r border-gray-700 shadow-2xl overflow-y-auto ml-auto">
            <div className="p-4 sm:p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-blue-400" />
                  <h2 className="text-lg font-semibold text-white">Problem Description</h2>
                </div>
                <button
                  onClick={() => setShowProblemPanel(false)}
                  className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Problem Description */}
              <div className="prose prose-invert max-w-none mb-6">
                <div className="text-gray-300 whitespace-pre-wrap text-selectable leading-relaxed text-sm">
                  {assignment.problem_description}
                </div>
              </div>
              
              {/* Assignment Info */}
              <div className="pt-4 border-t border-gray-700">
                <h3 className="text-white font-medium mb-4">Assignment Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Language:</span>
                    <span className="text-white font-medium uppercase">{selectedLanguage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Points:</span>
                    <span className="text-white font-medium">{assignment.total_points}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Time Limit:</span>
                    <span className="text-white font-medium">{assignment.time_limit}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Memory Limit:</span>
                    <span className="text-white font-medium">{assignment.memory_limit}MB</span>
                  </div>
                  {assignment.due_date && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Due Date:</span>
                      <span className="text-white font-medium">
                        {new Date(assignment.due_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Coding Tips */}
              <div className="mt-6 pt-4 border-t border-gray-700">
                <h3 className="text-white font-medium mb-3">💡 Coding Tips</h3>
                <ul className="text-gray-300 text-sm space-y-2">
                  <li>• Test your code with different inputs mentally</li>
                  <li>• Check for edge cases and boundary conditions</li>
                  <li>• Use meaningful variable names</li>
                  <li>• Add comments to explain complex logic</li>
                  <li>• Consider time and space complexity</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submission History Modal */}
      <SubmissionHistory
        assignmentId={assignment.id}
        classId={classId}
        isOpen={showSubmissionHistory}
        onClose={() => setShowSubmissionHistory(false)}
      />

      {/* Submitted Code View Modal */}
      <Modal
        isOpen={showSubmittedCodeModal}
        onClose={() => setShowSubmittedCodeModal(false)}
        title="Submitted Code"
        size="xl"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>Language: {selectedLanguage.toUpperCase()}</span>
            {lastSaved && <span>Submitted: {formatDate(lastSaved)}</span>}
          </div>
          
          {submittedCode ? (
            <div className="bg-gray-950 border border-gray-700 rounded-lg overflow-hidden">
              <div className="p-3 border-b border-gray-700 bg-gray-800/50">
                <span className="text-xs text-gray-400 font-mono">
                  {selectedLanguage === 'c' ? 'main.c' :
                   selectedLanguage === 'cpp' ? 'main.cpp' :
                   selectedLanguage === 'python' ? 'main.py' :
                   'main.js'}
                </span>
              </div>
              <pre className="p-4 text-sm text-gray-300 whitespace-pre-wrap font-mono overflow-x-auto">
                {submittedCode}
              </pre>
            </div>
          ) : (
            <div className="bg-gray-800/50 p-8 rounded-lg border border-gray-600 text-center">
              <Code2 className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No code has been submitted yet</p>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-400">
              {submittedCode && (
                <>
                  <span>{submittedCode.split('\n').length} lines</span>
                  <span className="mx-2">•</span>
                  <span>{submittedCode.length} characters</span>
                </>
              )}
            </div>
            <Button variant="outline" onClick={() => setShowSubmittedCodeModal(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Quick Tips Card - Now at bottom */}
      <Card className="bg-blue-600/5 border-blue-600/20 hover-lift">
        <div className="flex items-start space-x-3 no-select">
          <div className="bg-blue-600/10 p-2 rounded-lg">
            <AlertCircle className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-blue-400 font-semibold mb-2">Quick Tips</h3>
            <div className="text-gray-300 text-sm space-y-1 text-selectable">
              <p>• Press <kbd className="px-1 py-0.5 bg-gray-700 rounded text-xs">Ctrl+Enter</kbd> to run your code</p>
              <p>• Press <kbd className="px-1 py-0.5 bg-gray-700 rounded text-xs">Ctrl+S</kbd> to save/submit</p>
              <p>• Press <kbd className="px-1 py-0.5 bg-gray-700 rounded text-xs">Ctrl+I</kbd> to toggle problem info</p>
              <p>• Click "Problem Info" button to view the full problem description</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default CodeEditor