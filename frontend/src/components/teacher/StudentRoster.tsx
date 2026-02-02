import React, { useState, useEffect } from 'react'
import { ArrowLeft, Users, Mail, Calendar, Trophy, FileText, Search, Download, MoreVertical, UserX, MessageSquare } from 'lucide-react'
import { Class } from '../../types/api'
import { classService } from '../../services/classService'
import Button from '../ui/Button'
import Card from '../ui/Card'
import Input from '../ui/Input'
import Modal from '../ui/Modal'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import toast from 'react-hot-toast'

interface StudentData {
  id: string
  name: string
  email: string
  enrolled_at: string
  status: 'active' | 'pending' | 'suspended' | 'withdrawn'
  assignments_completed: number
  total_assignments: number
  total_points_earned: number
  total_points_possible: number
  completion_rate: number
  average_score: number
  last_submission: string | null
}

interface StudentRosterProps {
  classItem: Class
  onBack: () => void
}

const StudentRoster: React.FC<StudentRosterProps> = ({ classItem, onBack }) => {
  const [students, setStudents] = useState<StudentData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'suspended'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'completion_rate' | 'average_score' | 'enrolled_at' | 'last_submission'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null)
  const [showRemoveModal, setShowRemoveModal] = useState<StudentData | null>(null)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  useEffect(() => {
    loadStudentData()
  }, [classItem.id])

  const loadStudentData = async () => {
    try {
      setIsLoading(true)
      
      // Get enrolled students
      const studentsResponse = await classService.getClassStudents(classItem.id)
      const enrolledStudents = studentsResponse.students

      // Get assignments for this class
      const assignmentsResponse = await classService.getAssignments(classItem.id)
      const assignments = assignmentsResponse.assignments
      const totalAssignments = assignments.length
      const totalPointsPossible = assignments.reduce((sum, assignment) => sum + (assignment.total_points || 100), 0)

      // Get submission data for each student
      const studentDataPromises = enrolledStudents.map(async (student) => {
        let assignmentsCompleted = 0
        let totalPointsEarned = 0
        let lastSubmission: string | null = null

        // Check submissions for each assignment
        for (const assignment of assignments) {
          try {
            const submissionsResponse = await classService.getAssignmentSubmissions(classItem.id, assignment.id)
            const studentSubmissions = submissionsResponse.submissions.filter(
              (sub: any) => sub.student_id === student.id
            )
            
            if (studentSubmissions.length > 0) {
              assignmentsCompleted++
              // Get the best submission (highest points)
              const bestSubmission = studentSubmissions.reduce((best: any, current: any) => 
                (current.points_earned || 0) > (best.points_earned || 0) ? current : best
              )
              totalPointsEarned += bestSubmission.points_earned || 0
              
              // Update last submission date
              const submissionDate = new Date(bestSubmission.submitted_at)
              if (!lastSubmission || submissionDate > new Date(lastSubmission)) {
                lastSubmission = bestSubmission.submitted_at
              }
            }
          } catch (error) {
            // Assignment has no submissions, skip
            console.log(`No submissions for assignment ${assignment.id}`)
          }
        }

        const completionRate = totalAssignments > 0 ? (assignmentsCompleted / totalAssignments) * 100 : 0
        const averageScore = totalPointsPossible > 0 ? (totalPointsEarned / totalPointsPossible) * 100 : 0

        return {
          ...student,
          assignments_completed: assignmentsCompleted,
          total_assignments: totalAssignments,
          total_points_earned: totalPointsEarned,
          total_points_possible: totalPointsPossible,
          completion_rate: completionRate,
          average_score: averageScore,
          last_submission: lastSubmission
        }
      })

      const studentData = await Promise.all(studentDataPromises)
      setStudents(studentData)
    } catch (error: any) {
      console.error('Error loading student data:', error)
      
      // Provide more specific error messages
      if (error?.response?.status === 404) {
        toast.error('Class not found or you do not have permission to view students')
      } else if (error?.response?.status === 403) {
        toast.error('You do not have permission to view students in this class')
      } else {
        toast.error('Failed to load student data. Please try again.')
      }
      
      setStudents([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveStudent = async () => {
    if (!showRemoveModal) return

    try {
      await classService.removeStudentFromClass(classItem.id, showRemoveModal.id)
      setStudents(prev => prev.filter(s => s.id !== showRemoveModal.id))
      setShowRemoveModal(null)
      toast.success('Student removed from class')
    } catch (error) {
      toast.error('Failed to remove student')
    }
  }

  const exportStudentData = () => {
    const csvContent = [
      ['Name', 'Email', 'Status', 'Enrolled Date', 'Assignments Completed', 'Total Assignments', 'Completion Rate', 'Points Earned', 'Total Points', 'Average Score', 'Last Submission'].join(','),
      ...filteredAndSortedStudents.map(student => [
        student.name,
        student.email,
        student.status,
        new Date(student.enrolled_at).toLocaleDateString(),
        student.assignments_completed,
        student.total_assignments,
        `${student.completion_rate.toFixed(1)}%`,
        student.total_points_earned,
        student.total_points_possible,
        `${student.average_score.toFixed(1)}%`,
        student.last_submission ? new Date(student.last_submission).toLocaleDateString() : 'Never'
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${classItem.name}_students.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const filteredAndSortedStudents = students
    .filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || student.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      let aValue: any = a[sortBy]
      let bValue: any = b[sortBy]
      
      if (sortBy === 'enrolled_at' || sortBy === 'last_submission') {
        aValue = new Date(aValue || 0).getTime()
        bValue = new Date(bValue || 0).getTime()
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      active: 'status-success',
      pending: 'status-warning',
      suspended: 'status-error',
      withdrawn: 'status-info'
    }
    return statusClasses[status as keyof typeof statusClasses] || 'status-info'
  }

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-400'
    if (score >= 70) return 'text-yellow-400'
    if (score >= 50) return 'text-orange-400'
    return 'text-red-400'
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
          <Button variant="ghost" onClick={onBack} className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <Users className="h-8 w-8 mr-3" />
              Student Roster
            </h1>
            <p className="text-gray-400">{classItem.name} • {students.length} students</p>
          </div>
        </div>
        <Button onClick={exportStudentData} variant="info" size="md">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="bg-blue-600/10 p-3 rounded-lg">
              <Users className="h-6 w-6 text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-white">{students.filter(s => s.status === 'active').length}</p>
              <p className="text-gray-400 text-sm">Active Students</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center">
            <div className="bg-green-600/10 p-3 rounded-lg">
              <Trophy className="h-6 w-6 text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-white">
                {students.length > 0 ? (students.reduce((sum, s) => sum + s.average_score, 0) / students.length).toFixed(1) : 0}%
              </p>
              <p className="text-gray-400 text-sm">Class Average</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center">
            <div className="bg-purple-600/10 p-3 rounded-lg">
              <FileText className="h-6 w-6 text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-white">
                {students.length > 0 ? (students.reduce((sum, s) => sum + s.completion_rate, 0) / students.length).toFixed(1) : 0}%
              </p>
              <p className="text-gray-400 text-sm">Completion Rate</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="bg-yellow-600/10 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-white">{students.filter(s => s.status === 'pending').length}</p>
              <p className="text-gray-400 text-sm">Pending</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="name">Sort by Name</option>
              <option value="completion_rate">Sort by Completion</option>
              <option value="average_score">Sort by Score</option>
              <option value="enrolled_at">Sort by Join Date</option>
            </select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Student List */}
      <div className="space-y-4">
        {filteredAndSortedStudents.length === 0 ? (
          <Card className="text-center py-12">
            <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No students found</h3>
            <p className="text-gray-400">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters.' 
                : 'Students will appear here once they join your class.'
              }
            </p>
          </Card>
        ) : (
          filteredAndSortedStudents.map((student) => (
            <Card key={student.id} variant="hover" className="hover-lift">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="bg-primary-600/10 p-3 rounded-lg">
                    <Users className="h-6 w-6 text-primary-400" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{student.name}</h3>
                      <span className={`status-badge ${getStatusBadge(student.status)}`}>
                        {student.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-400 mb-3">
                      <Mail className="h-4 w-4" />
                      <span>{student.email}</span>
                      <span>•</span>
                      <Calendar className="h-4 w-4" />
                      <span>Joined {new Date(student.enrolled_at).toLocaleDateString()}</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Assignments</p>
                        <p className="text-white font-medium">
                          {student.assignments_completed}/{student.total_assignments}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Completion</p>
                        <p className={`font-medium ${getPerformanceColor(student.completion_rate)}`}>
                          {student.completion_rate.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Average Score</p>
                        <p className={`font-medium ${getPerformanceColor(student.average_score)}`}>
                          {student.average_score.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Last Submission</p>
                        <p className="text-white font-medium">
                          {student.last_submission 
                            ? new Date(student.last_submission).toLocaleDateString()
                            : 'Never'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setActiveDropdown(activeDropdown === student.id ? null : student.id)
                    }}
                    className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-slate-700/50 transition-colors"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  
                  {activeDropdown === student.id && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setActiveDropdown(null)}
                      />
                      
                      <div className="absolute right-0 top-10 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-20 min-w-[160px]">
                        <button
                          onClick={() => {
                            setSelectedStudent(student)
                            setActiveDropdown(null)
                          }}
                          className="flex items-center w-full px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-slate-700/50 transition-colors first:rounded-t-lg"
                        >
                          <FileText className="h-4 w-4 mr-3" />
                          View Details
                        </button>
                        <button
                          onClick={() => {
                            // TODO: Implement messaging
                            toast('Messaging feature coming soon', { icon: 'ℹ️' })
                            setActiveDropdown(null)
                          }}
                          className="flex items-center w-full px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-slate-700/50 transition-colors"
                        >
                          <MessageSquare className="h-4 w-4 mr-3" />
                          Send Message
                        </button>
                        <button
                          onClick={() => {
                            setShowRemoveModal(student)
                            setActiveDropdown(null)
                          }}
                          className="flex items-center w-full px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors last:rounded-b-lg border-t border-slate-600"
                        >
                          <UserX className="h-4 w-4 mr-3" />
                          Remove Student
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Student Details Modal */}
      <Modal
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
        title="Student Details"
        size="lg"
      >
        {selectedStudent && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="bg-primary-600/10 p-4 rounded-lg">
                <Users className="h-8 w-8 text-primary-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">{selectedStudent.name}</h3>
                <p className="text-gray-400">{selectedStudent.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Performance</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Assignments Completed:</span>
                    <span className="text-white">{selectedStudent.assignments_completed}/{selectedStudent.total_assignments}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Completion Rate:</span>
                    <span className={getPerformanceColor(selectedStudent.completion_rate)}>
                      {selectedStudent.completion_rate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Average Score:</span>
                    <span className={getPerformanceColor(selectedStudent.average_score)}>
                      {selectedStudent.average_score.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Points Earned:</span>
                    <span className="text-white">{selectedStudent.total_points_earned}/{selectedStudent.total_points_possible}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Enrollment Info</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className={`status-badge ${getStatusBadge(selectedStudent.status)}`}>
                      {selectedStudent.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Joined:</span>
                    <span className="text-white">{new Date(selectedStudent.enrolled_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Last Submission:</span>
                    <span className="text-white">
                      {selectedStudent.last_submission 
                        ? new Date(selectedStudent.last_submission).toLocaleDateString()
                        : 'Never'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Remove Student Modal */}
      <Modal
        isOpen={!!showRemoveModal}
        onClose={() => setShowRemoveModal(null)}
        title="Remove Student"
      >
        {showRemoveModal && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="bg-red-500/10 p-3 rounded-full">
                <UserX className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Remove {showRemoveModal.name}?</h3>
                <p className="text-gray-400">This will remove the student from the class and revoke their access.</p>
              </div>
            </div>
            
            <div className="flex space-x-3 justify-end pt-4 border-t border-gray-600">
              <Button variant="outline" onClick={() => setShowRemoveModal(null)}>
                Cancel
              </Button>
              <Button onClick={handleRemoveStudent} variant="danger">
                Remove Student
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default StudentRoster