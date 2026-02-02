import React, { useState, useEffect } from 'react'
import { BookOpen, Plus, Users, Calendar, FileText } from 'lucide-react'
import { Class } from '../../types/api'
import { classService } from '../../services/classService'
import Button from '../ui/Button'
import Card from '../ui/Card'
import Modal from '../ui/Modal'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import ClassForm from './ClassForm'
import toast from 'react-hot-toast'

interface ClassListProps {
  onClassSelect?: (_selectedClass: Class) => void
  showStudentView?: boolean
  showCreateModal?: boolean
  onShowCreateModal?: () => void
  onCloseCreateModal?: () => void
}

const ClassList: React.FC<ClassListProps> = ({ 
  onClassSelect, 
  showStudentView = false, 
  showCreateModal = false,
  onShowCreateModal,
  onCloseCreateModal
}) => {
  const [classes, setClasses] = useState<Class[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadClasses()
  }, [])

  const loadClasses = async () => {
    try {
      setIsLoading(true)
      const response = await classService.getClasses()
      setClasses(response?.classes || [])
    } catch (error: any) {
      console.error('Error loading classes:', error)
      
      if (error?.statusCode === 401) {
        toast.error('Authentication failed. Please log in again.')
      } else if (error?.statusCode === 403) {
        toast.error('You do not have permission to view classes')
      } else if (error?.statusCode === 404) {
        toast.error('Classes endpoint not found. Please check if the backend is running.')
      } else if (error?.message?.includes('Network Error') || error?.code === 'ECONNREFUSED') {
        toast.error('Cannot connect to server. Please check if the backend is running.')
      } else {
        toast.error('Failed to load classes')
      }
      
      setClasses([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateClass = async (data: { name: string; description: string }) => {
    try {
      const response = await classService.createClass(data)
      setClasses(prev => [response.class, ...prev])
      onCloseCreateModal?.()
      toast.success('Class created successfully!')
    } catch (error) {
      toast.error('Failed to create class')
      throw error
    }
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
      {/* Classes Grid */}
      {!classes || classes.length === 0 ? (
        <Card className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-600 mx-auto mb-4 no-select" />
          <h3 className="text-xl font-semibold text-white mb-2 no-select">
            {showStudentView ? 'No classes with students' : 'No classes yet'}
          </h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto text-selectable">
            {showStudentView 
              ? 'Create classes and invite students to see them here.'
              : 'Get started by creating your first class. You can add assignments and manage students once your class is set up.'
            }
          </p>
          {!showStudentView && (
            <Button onClick={onShowCreateModal} className="hover-lift">
              <Plus className="h-5 w-5 mr-2" />
              Create Your First Class
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(classes || []).map((classItem) => (
            <Card key={classItem.id} className="relative group hover:border-primary-500/50 transition-colors hover-lift">
              {/* Class Content */}
              <div 
                className="cursor-pointer"
                onClick={() => onClassSelect?.(classItem)}
              >
                <div className="flex items-center mb-4">
                  <div className={`p-3 rounded-lg ${showStudentView ? 'bg-blue-600/10' : 'bg-primary-600/10'}`}>
                    {showStudentView ? (
                      <Users className="h-6 w-6 text-blue-400" />
                    ) : (
                      <BookOpen className="h-6 w-6 text-primary-400" />
                    )}
                  </div>
                </div>

                <h3 className={`text-lg font-semibold text-white mb-2 transition-colors no-select ${
                  showStudentView ? 'group-hover:text-blue-400' : 'group-hover:text-primary-400'
                }`}>
                  {classItem.name}
                </h3>
                
                <p className="text-gray-400 text-sm mb-4 line-clamp-2 text-selectable">
                  {classItem.description}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500 no-select">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-1" />
                    <span>{classItem.assignment_count || 0} assignments</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{classItem.current_students || 0} students</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{formatDate(classItem.created_at)}</span>
                  </div>
                </div>

                {/* Join Code Display - Only show for regular class view */}
                {!showStudentView && classItem.join_code && (
                  <div className="mt-3 pt-3 border-t border-gray-600">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400 no-select">Join Code:</span>
                      <div className="flex items-center space-x-2">
                        <code className="bg-dark-700 px-2 py-1 rounded text-sm code-font text-primary-400 text-selectable">
                          {classItem.join_code}
                        </code>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            navigator.clipboard.writeText(classItem.join_code!)
                            toast.success('Join code copied!')
                          }}
                          className="text-gray-400 hover:text-white text-xs no-select hover-lift focus-ring"
                          title="Copy join code"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Student View Action */}
                {showStudentView && (
                  <div className="mt-4 pt-3 border-t border-gray-600">
                    <div className="flex items-center justify-center">
                      <span className="text-sm text-blue-400 font-medium">Click to view students</span>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Class Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={onCloseCreateModal || (() => {})}
        title="Create New Class"
      >
        <ClassForm
          onSubmit={handleCreateClass}
          onCancel={onCloseCreateModal || (() => {})}
        />
      </Modal>
    </div>
  )
}

export default ClassList