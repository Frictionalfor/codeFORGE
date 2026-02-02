import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Class } from '../../types/api'
import { classService } from '../../services/classService'
import ClassDetail from '../../components/teacher/ClassDetail'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

const ClassDetailPage: React.FC = () => {
  const { classId } = useParams<{ classId: string }>()
  const navigate = useNavigate()
  const [classItem, setClassItem] = useState<Class | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (classId) {
      loadClass()
    }
  }, [classId])

  const loadClass = async () => {
    if (!classId) return

    try {
      setIsLoading(true)
      const response = await classService.getClass(classId)
      setClassItem(response.class)
    } catch (error) {
      toast.error('Failed to load class')
      console.error('Error loading class:', error)
      navigate('/teacher/classes')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    navigate('/teacher/classes')
  }

  const handleViewStudents = () => {
    navigate(`/teacher/classes/${classId}/students`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!classItem) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Class Not Found</h1>
          <button
            onClick={handleBack}
            className="text-primary-400 hover:text-primary-300"
          >
            Back to Classes
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <ClassDetail
          classItem={classItem}
          onBack={handleBack}
          onViewStudents={handleViewStudents}
        />
      </div>
    </div>
  )
}

export default ClassDetailPage