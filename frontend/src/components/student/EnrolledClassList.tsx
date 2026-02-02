import React, { useState, useEffect } from 'react'
import { BookOpen, FileText, Calendar, Users, ChevronRight, Plus } from 'lucide-react'
import { Class } from '../../types/api'
import { studentService } from '../../services/studentService'
import { useAuth } from '../../contexts/FirebaseAuthContext'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import JoinClassForm from './JoinClassForm'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import toast from 'react-hot-toast'

interface EnrolledClassListProps {
  onClassSelect?: (_selectedClass: Class) => void
  showJoinModal?: boolean
  onShowJoinModal?: () => void
  onCloseJoinModal?: () => void
}

const EnrolledClassList: React.FC<EnrolledClassListProps> = ({ 
  onClassSelect,
  showJoinModal = false,
  onShowJoinModal,
  onCloseJoinModal
}) => {
  const { userProfile } = useAuth()
  const [classes, setClasses] = useState<Class[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [joinStep, setJoinStep] = useState<'enter-code' | 'confirm-join'>('enter-code')

  useEffect(() => {
    loadEnrolledClasses()
  }, [])

  const loadEnrolledClasses = async () => {
    try {
      setIsLoading(true)
      const response = await studentService.getEnrolledClasses()
      setClasses(response?.classes || [])
    } catch (error: any) {
      console.error('Error loading enrolled classes:', error)
      
      if (error?.statusCode === 401) {
        toast.error('Authentication failed. Please log in again.')
      } else if (error?.statusCode === 403) {
        toast.error('You do not have permission to view classes')
      } else if (error?.statusCode === 404) {
        toast.error('Classes endpoint not found. Please check if the backend is running.')
      } else if (error?.message?.includes('Network Error') || error?.code === 'ECONNREFUSED') {
        toast.error('Cannot connect to server. Please check if the backend is running.')
      } else {
        toast.error('Failed to load enrolled classes')
      }
      
      setClasses([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoinSuccess = (classInfo: any) => {
    toast.success(`Successfully joined ${classInfo.name}!`)
    onCloseJoinModal?.()
    setJoinStep('enter-code') // Reset step
    // Reload the enrolled classes to show the newly joined class
    loadEnrolledClasses()
  }

  const handleModalClose = () => {
    onCloseJoinModal?.()
    setJoinStep('enter-code') // Reset step when closing
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
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
      {/* Classes */}
      {!classes || classes.length === 0 ? (
        <Card className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-600 mx-auto mb-4 no-select" />
          <h3 className="text-xl font-semibold text-white mb-2 no-select">No classes enrolled</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto text-selectable">
            You haven't enrolled in any classes yet. {userProfile?.role === 'student' ? 'Use the "Join Class" button above to enter a class code and get started.' : 'Contact your administrator to get enrolled in classes.'}
          </p>
          {userProfile?.role === 'student' && (
            <Button onClick={onShowJoinModal} className="hover-lift">
              <Plus className="h-5 w-5 mr-2" />
              Join Your First Class
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(classes || []).map((classItem) => (
            <Card 
              key={classItem.id} 
              className="group hover:border-primary-500/50 transition-colors cursor-pointer hover-lift"
              onClick={() => onClassSelect?.(classItem)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="bg-primary-600/10 p-3 rounded-lg">
                  <BookOpen className="h-6 w-6 text-primary-400" />
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-primary-400 transition-colors no-select" />
              </div>

              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-primary-400 transition-colors no-select">
                {classItem.name}
              </h3>
              
              <p className="text-gray-400 text-sm mb-4 line-clamp-2 text-selectable">
                {classItem.description}
              </p>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-500 no-select">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-1" />
                    <span>{classItem.assignment_count || 0} assignments</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{classItem.current_students || 0} students</span>
                  </div>
                </div>
                
                <div className="flex items-center text-xs text-gray-500 no-select">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Enrolled {formatDate(classItem.created_at)}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Join Class Modal */}
      {userProfile?.role === 'student' && (
        <Modal
          isOpen={showJoinModal}
          onClose={handleModalClose}
          title={joinStep === 'confirm-join' ? 'Confirm Join Class' : 'Join a Class'}
          size="md"
        >
          <JoinClassForm
            onSuccess={handleJoinSuccess}
            onCancel={handleModalClose}
            onStepChange={setJoinStep}
          />
        </Modal>
      )}
    </div>
  )
}

export default EnrolledClassList