import React, { useState, useEffect } from 'react'
import { ArrowLeft, Plus, Users, Calendar, Eye } from 'lucide-react'
import { Class, Assignment } from '../../types/api'
import { classService } from '../../services/classService'
import Button from '../ui/Button'
import Card from '../ui/Card'
import Modal from '../ui/Modal'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import EnhancedAssignmentForm from './EnhancedAssignmentForm'
import SubmissionResults from './SubmissionResults'
import toast from 'react-hot-toast'

interface ClassDetailProps {
  classItem: Class
  onBack: () => void
  onViewStudents?: (_classItem: Class) => void
}

const ClassDetail: React.FC<ClassDetailProps> = ({ classItem, onBack, onViewStudents }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [submissionCounts, setSubmissionCounts] = useState<Record<string, number>>({})
  const [viewingSubmissions, setViewingSubmissions] = useState<Assignment | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  // Function to refresh data
  const refreshData = () => {
    setRefreshKey(prev => prev + 1)
  }

  useEffect(() => {
    loadAssignments()
  }, [classItem.id, refreshKey])

  const loadAssignments = async () => {
    try {
      setIsLoading(true)
      const response = await classService.getAssignments(classItem.id)
      setAssignments(response.assignments)
      
      // Load submission counts for each assignment
      const counts: Record<string, number> = {}
      for (const assignment of response.assignments) {
        try {
          const submissionResponse = await classService.getAssignmentSubmissions(classItem.id, assignment.id)
          counts[assignment.id] = submissionResponse.submissions.length
        } catch (error) {
          // If no submissions exist, count is 0
          counts[assignment.id] = 0
        }
      }
      setSubmissionCounts(counts)
    } catch (error) {
      toast.error('Failed to load assignments')
      console.error('Error loading assignments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateAssignment = async (data: any) => {
    try {
      const response = await classService.createAssignmentWithTestCases(classItem.id, data)
      setAssignments(prev => [response.assignment, ...prev])
      // Initialize submission count for new assignment
      setSubmissionCounts(prev => ({ ...prev, [response.assignment.id]: 0 }))
      setShowCreateModal(false)
      toast.success('Assignment created successfully!')
      refreshData() // Refresh to get updated data
    } catch (error) {
      toast.error('Failed to create assignment')
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

  // Show submission results view
  if (viewingSubmissions) {
    return (
      <SubmissionResults
        assignment={viewingSubmissions}
        classId={classItem.id}
        onBack={() => setViewingSubmissions(null)}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack} className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">{classItem.name}</h1>
            <p className="text-gray-400">{classItem.description}</p>
          </div>
        </div>
        <Button onClick={() => setShowCreateModal(true)} variant="primary" size="lg">
          <Plus className="h-5 w-5 mr-2" />
          Create Assignment
        </Button>
      </div>

      {/* Enhanced Class Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="group hover:border-primary-500/50 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-primary-600/10 p-3 rounded-lg group-hover:bg-primary-600/20 transition-colors">
                <Calendar className="h-6 w-6 text-primary-400" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-white">{assignments.length}</p>
                <p className="text-gray-400 text-sm">Assignments</p>
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="group hover:border-green-500/50 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-green-600/10 p-3 rounded-lg group-hover:bg-green-600/20 transition-colors">
                <Users className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-2xl font-bold text-white">{classItem.current_students || 0}</p>
                <p className="text-gray-400 text-sm">Students</p>
              </div>
            </div>
            <Button
              variant="success"
              size="sm"
              onClick={() => onViewStudents?.(classItem)}
              className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Users className="h-4 w-4 mr-1" />
              View
            </Button>
          </div>
        </Card>
        
        <Card className="group hover:border-blue-500/50 transition-all duration-300">
          <div className="flex items-center">
            <div className="bg-blue-600/10 p-3 rounded-lg group-hover:bg-blue-600/20 transition-colors">
              <Calendar className="h-6 w-6 text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-lg font-bold text-white">{formatDate(classItem.created_at)}</p>
              <p className="text-gray-400 text-sm">Created</p>
            </div>
          </div>
        </Card>

        {/* Enhanced Join Code Card */}
        {classItem.join_code && (
          <Card className="group hover:border-purple-500/50 transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2 flex items-center justify-center">
                  <Eye className="h-4 w-4 mr-1" />
                  Join Code
                </p>
                <div className="flex items-center justify-center space-x-2 mb-3">
                  <code className="bg-slate-800/80 px-4 py-2 rounded-lg text-lg font-mono text-primary-400 tracking-wider border border-slate-600/50 group-hover:border-primary-500/50 transition-colors">
                    {classItem.join_code}
                  </code>
                </div>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => {
                    navigator.clipboard.writeText(classItem.join_code!)
                    toast.success('Join code copied!')
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Copy Code
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Assignments */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Assignments</h2>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : assignments.length === 0 ? (
          <Card className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No assignments yet</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Create your first assignment to get students started with coding problems.
            </p>
            <Button onClick={() => setShowCreateModal(true)} variant="primary" size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Create First Assignment
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {assignments.map((assignment) => (
              <Card key={assignment.id} className="relative group hover:border-primary-500/50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex items-start space-x-4 flex-1 min-w-0">
                    <div className="bg-primary-600/10 p-3 rounded-lg flex-shrink-0">
                      <Calendar className="h-6 w-6 text-primary-400" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-primary-400 transition-colors">
                        {assignment.title}
                      </h3>
                      
                      <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                        {assignment.problem_description}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {submissionCounts[assignment.id] || 0} submissions
                        </span>
                        <span>Language: {assignment.language?.toUpperCase() || 'C'}</span>
                        <span>Points: {assignment.total_points || 100}</span>
                        <span>Created {formatDate(assignment.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end ml-4">
                    {/* View Submissions Button */}
                    <Button
                      variant="info"
                      size="sm"
                      onClick={() => setViewingSubmissions(assignment)}
                      className="flex items-center justify-center space-x-2 whitespace-nowrap"
                    >
                      <Eye className="h-4 w-4" />
                      <span className="hidden sm:inline">View Submissions</span>
                      <span className="sm:hidden">Submissions</span>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Assignment Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Assignment"
        size="lg"
      >
        <EnhancedAssignmentForm
          onSubmit={handleCreateAssignment}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>
    </div>
  )
}

export default ClassDetail