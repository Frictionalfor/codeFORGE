import React, { useState, useEffect } from 'react'
import { Calendar, Clock, AlertTriangle, CheckCircle, FileText, BookOpen } from 'lucide-react'
import { Assignment } from '../../types/api'
import { studentService } from '../../services/studentService'
import Card from '../ui/Card'
import toast from 'react-hot-toast'

interface AssignmentWithClass extends Assignment {
  class: {
    id: string
    name: string
  }
  hasSubmission?: boolean
  submissionDate?: string
  isOverdue?: boolean
  daysUntilDue?: number
  daysLate?: number
}

const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }
  
  return (
    <div className={`animate-spin rounded-full border-2 border-gray-600 border-t-primary-500 ${sizeClasses[size]}`} />
  )
}

const AssignmentSchedule: React.FC = () => {
  const [assignments, setAssignments] = useState<AssignmentWithClass[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'overdue' | 'completed'>('all')

  useEffect(() => {
    loadAssignments()
  }, [])

  const loadAssignments = async () => {
    try {
      setIsLoading(true)
      // Get all enrolled classes
      const classesResponse = await studentService.getEnrolledClasses()
      const classes = classesResponse.classes || []

      // Get assignments from all classes
      const allAssignments: AssignmentWithClass[] = []
      
      for (const classItem of classes) {
        try {
          const assignmentsResponse = await studentService.getClassAssignments(classItem.id)
          const classAssignments = assignmentsResponse.assignments || []
          
          for (const assignment of classAssignments) {
            // Check if assignment has a due date and is published
            if (assignment.is_published) {
              const assignmentWithClass: AssignmentWithClass = {
                ...assignment,
                class: {
                  id: classItem.id,
                  name: classItem.name
                }
              }

              // Calculate deadline info
              if (assignment.due_date) {
                const dueDate = new Date(assignment.due_date)
                const now = new Date()
                const diffTime = dueDate.getTime() - now.getTime()
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                
                assignmentWithClass.isOverdue = diffTime < 0
                assignmentWithClass.daysUntilDue = diffDays > 0 ? diffDays : 0
                assignmentWithClass.daysLate = diffDays < 0 ? Math.abs(diffDays) : 0
              }

              // Check submission status
              try {
                const submissionResponse = await fetch(`/api/classes/assignments/${assignment.id}/submission-status`, {
                  headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                  }
                })
                
                if (submissionResponse.ok) {
                  const submissionData = await submissionResponse.json()
                  assignmentWithClass.hasSubmission = submissionData.data.hasSubmission
                  if (submissionData.data.submission) {
                    assignmentWithClass.submissionDate = submissionData.data.submission.submitted_at
                  }
                }
              } catch (error) {
                console.error(`Error checking submission status for assignment ${assignment.id}:`, error)
                // Continue without submission status
              }
              
              allAssignments.push(assignmentWithClass)
            }
          }
        } catch (error) {
          console.error(`Error loading assignments for class ${classItem.id}:`, error)
        }
      }

      // Sort by due date (assignments without due dates go to the end)
      allAssignments.sort((a, b) => {
        if (!a.due_date && !b.due_date) return 0
        if (!a.due_date) return 1
        if (!b.due_date) return -1
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      })

      setAssignments(allAssignments)
    } catch (error) {
      toast.error('Failed to load assignment schedule')
      console.error('Error loading assignments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getFilteredAssignments = () => {
    switch (filter) {
      case 'upcoming':
        return assignments.filter(a => a.due_date && !a.isOverdue && !a.hasSubmission)
      case 'overdue':
        return assignments.filter(a => a.isOverdue && !a.hasSubmission)
      case 'completed':
        return assignments.filter(a => a.hasSubmission)
      default:
        return assignments
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusIcon = (assignment: AssignmentWithClass) => {
    if (assignment.hasSubmission) {
      return <CheckCircle className="h-5 w-5 text-green-400" />
    }
    if (assignment.isOverdue) {
      return <AlertTriangle className="h-5 w-5 text-red-400" />
    }
    if (assignment.due_date) {
      return <Clock className="h-5 w-5 text-yellow-400" />
    }
    return <FileText className="h-5 w-5 text-gray-400" />
  }

  const getStatusText = (assignment: AssignmentWithClass) => {
    if (assignment.hasSubmission) {
      return 'Completed'
    }
    if (assignment.isOverdue) {
      return `Overdue by ${assignment.daysLate} day${assignment.daysLate !== 1 ? 's' : ''}`
    }
    if (assignment.due_date) {
      if (assignment.daysUntilDue === 0) {
        return 'Due today'
      }
      return `Due in ${assignment.daysUntilDue} day${assignment.daysUntilDue !== 1 ? 's' : ''}`
    }
    return 'No deadline'
  }

  const getStatusColor = (assignment: AssignmentWithClass) => {
    if (assignment.hasSubmission) return 'text-green-400'
    if (assignment.isOverdue) return 'text-red-400'
    if (assignment.daysUntilDue && assignment.daysUntilDue <= 3) return 'text-yellow-400'
    return 'text-gray-400'
  }

  const filteredAssignments = getFilteredAssignments()

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
        <div>
          <h2 className="text-2xl font-bold text-white text-shadow flex items-center">
            <Calendar className="h-6 w-6 mr-2" />
            Assignment Schedule
          </h2>
          <p className="text-gray-400 text-selectable">Track deadlines and manage your assignments</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-dark-700 p-1 rounded-lg no-select">
        {[
          { key: 'all', label: 'All', count: assignments.length },
          { key: 'upcoming', label: 'Upcoming', count: assignments.filter(a => a.due_date && !a.isOverdue && !a.hasSubmission).length },
          { key: 'overdue', label: 'Overdue', count: assignments.filter(a => a.isOverdue && !a.hasSubmission).length },
          { key: 'completed', label: 'Completed', count: assignments.filter(a => a.hasSubmission).length }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === tab.key
                ? 'bg-primary-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-dark-600'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Assignment List */}
      {filteredAssignments.length === 0 ? (
        <Card className="text-center py-12">
          <Calendar className="h-16 w-16 text-gray-600 mx-auto mb-4 no-select" />
          <h3 className="text-xl font-semibold text-white mb-2 no-select">
            {filter === 'all' ? 'No assignments found' : `No ${filter} assignments`}
          </h3>
          <p className="text-gray-400 text-selectable">
            {filter === 'all' 
              ? 'Your teachers haven\'t published any assignments yet.'
              : `You don't have any ${filter} assignments at the moment.`
            }
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAssignments.map((assignment) => (
            <Card key={assignment.id} variant="hover" className="hover-lift">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="bg-primary-600/10 p-3 rounded-lg">
                    {getStatusIcon(assignment)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-white no-select">
                          {assignment.title}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-400 no-select">
                          <BookOpen className="h-4 w-4" />
                          <span>{assignment.class.name}</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`text-sm font-medium ${getStatusColor(assignment)} no-select`}>
                          {getStatusText(assignment)}
                        </div>
                        {assignment.due_date && (
                          <div className="text-xs text-gray-500 no-select">
                            {formatDate(assignment.due_date)}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-gray-400 text-sm line-clamp-2 text-selectable">
                      {assignment.problem_description}
                    </p>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-4 text-xs text-gray-500 no-select">
                        <span>Language: {assignment.language.toUpperCase()}</span>
                        <span>Points: {assignment.total_points || 100}</span>
                        {assignment.time_limit && (
                          <span>Time: {assignment.time_limit}ms</span>
                        )}
                      </div>
                      
                      {assignment.isOverdue && assignment.allow_late_submission && (
                        <div className="text-xs text-yellow-400 no-select">
                          Late penalty: {assignment.late_penalty_per_day}%/day
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {assignments.length > 0 && (
        <Card>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center no-select">
            <div>
              <p className="text-2xl font-bold text-primary-400">{assignments.length}</p>
              <p className="text-sm text-gray-400">Total Assignments</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-400">
                {assignments.filter(a => a.due_date && !a.isOverdue && !a.hasSubmission).length}
              </p>
              <p className="text-sm text-gray-400">Upcoming</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-400">
                {assignments.filter(a => a.isOverdue && !a.hasSubmission).length}
              </p>
              <p className="text-sm text-gray-400">Overdue</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">
                {assignments.filter(a => a.hasSubmission).length}
              </p>
              <p className="text-sm text-gray-400">Completed</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

export default AssignmentSchedule