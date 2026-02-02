import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Assignment } from '../../types/api'
import { classService } from '../../services/classService'
import CodeEditor from '../../components/student/CodeEditor'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

const CodeEditorPage: React.FC = () => {
  const { classId, assignmentId } = useParams<{ classId: string; assignmentId: string }>()
  const navigate = useNavigate()
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (classId && assignmentId) {
      loadAssignment()
    }
  }, [classId, assignmentId])

  const loadAssignment = async () => {
    if (!classId || !assignmentId) return

    try {
      setIsLoading(true)
      const response = await classService.getAssignment(classId, assignmentId)
      setAssignment(response.assignment)
    } catch (error) {
      toast.error('Failed to load assignment')
      console.error('Error loading assignment:', error)
      navigate(`/student/classes/${classId}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    navigate(`/student/classes/${classId}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Assignment Not Found</h1>
          <button
            onClick={handleBack}
            className="text-primary-400 hover:text-primary-300"
          >
            Back to Class
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <CodeEditor
          assignment={assignment}
          classId={classId!}
          onBack={handleBack}
        />
      </div>
    </div>
  )
}

export default CodeEditorPage