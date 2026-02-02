import React, { useState, useEffect } from 'react'
import { ArrowLeft, FileText, Calendar, CheckCircle, Clock, Code } from 'lucide-react'
import { Class, Assignment } from '../../types/api'
import { studentService } from '../../services/studentService'
import { submissionService } from '../../services/submissionService'
import Button from '../ui/Button'
import Card from '../ui/Card'
import { LoadingSpinner } from '../ui/LoadingSpinner'

interface ClassAssignmentsProps {
  classItem: Class
  onBack: () => void
  onAssignmentSelect: (_assignmentItem: Assignment) => void
}

interface AssignmentWithStatus extends Assignment {
  hasSubmission?: boolean
  submissionDate?: string
}

const ClassAssignments: React.FC<ClassAssignmentsProps> = ({ 
  classItem, 
  onBack, 
  onAssignmentSelect 
}) => {
  const [assignments, setAssignments] = useState<AssignmentWithStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAssignments()
  }, [classItem.id])

  const loadAssignments = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await studentService.getClassAssignments(classItem.id)
      
      if (!response.assignments || response.assignments.length === 0) {
        setAssignments([])
        return
      }
      
      // Check submission status for each assignment
      const assignmentsWithStatus = await Promise.all(
        response.assignments.map(async (assignment) => {
          try {
            const submissionResponse = await submissionService.getSubmission(assignment.id, classItem.id)
            return {
              ...assignment,
              hasSubmission: !!submissionResponse.submission,
              submissionDate: submissionResponse.submission?.submitted_at
            }
          } catch (error) {
            // If there's an error getting submission, assume no submission
            return {
              ...assignment,
              hasSubmission: false
            }
          }
        })
      )
      
      setAssignments(assignmentsWithStatus)
    } catch (error) {
      console.error('Error loading assignments:', error)
      setError('Failed to load assignments. Please try again.')
      setAssignments([])
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusIcon = (assignment: AssignmentWithStatus) => {
    if (assignment.hasSubmission) {
      return <CheckCircle className="h-5 w-5 text-green-400" />
    }
    return <Clock className="h-5 w-5 text-yellow-400" />
  }

  const getStatusText = (assignment: AssignmentWithStatus) => {
    if (assignment.hasSubmission) {
      return `Submitted ${assignment.submissionDate ? formatDate(assignment.submissionDate) : ''}`
    }
    return 'Not submitted'
  }

  const getStatusColor = (assignment: AssignmentWithStatus) => {
    if (assignment.hasSubmission) {
      return 'text-green-400'
    }
    return 'text-yellow-400'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between no-select">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={onBack} className="p-2 hover-lift">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white text-shadow">{classItem.name}</h1>
              <p className="text-gray-400 text-selectable">{classItem.description}</p>
            </div>
          </div>
        </div>

        {/* Error State */}
        <Card className="text-center py-12">
          <FileText className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Unable to Load Assignments</h3>
          <p className="text-gray-400 max-w-md mx-auto mb-6">
            {error}
          </p>
          <Button onClick={loadAssignments} variant="primary" size="lg">
            Try Again
          </Button>
        </Card>
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
            <h1 className="text-3xl font-bold text-white text-shadow">{classItem.name}</h1>
            <p className="text-gray-400 text-selectable">{classItem.description}</p>
          </div>
        </div>
      </div>

      {/* Assignments */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Assignments</h2>
        
        {assignments.length === 0 ? (
          <Card className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No assignments available</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Your teacher hasn't created any assignments for this class yet, or there may be a connection issue. Check back later!
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {assignments.map((assignment) => (
              <Card 
                key={assignment.id} 
                className="group hover:border-primary-500/50 transition-colors cursor-pointer"
                onClick={() => onAssignmentSelect(assignment)}
              >
                <div className="flex items-start space-x-4">
                  <div className="bg-primary-600/10 p-3 rounded-lg">
                    <FileText className="h-6 w-6 text-primary-400" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-white group-hover:text-primary-400 transition-colors">
                        {assignment.title}
                      </h3>
                      <div className="flex items-center space-x-2 ml-4">
                        {getStatusIcon(assignment)}
                        <span className={`text-sm font-medium ${getStatusColor(assignment)}`}>
                          {assignment.hasSubmission ? 'Completed' : 'Not Started'}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {assignment.problem_description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>Created {formatDate(assignment.created_at)}</span>
                        </div>
                        <span className={getStatusColor(assignment)}>
                          {getStatusText(assignment)}
                        </span>
                      </div>
                      
                      <Button 
                        variant={assignment.hasSubmission ? "success" : "primary"} 
                        size="sm" 
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Code className="h-4 w-4 mr-2" />
                        {assignment.hasSubmission ? 'View & Edit' : 'Start Coding'}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ClassAssignments