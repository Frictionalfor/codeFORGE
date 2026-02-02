import React, { useState, useEffect } from 'react'
import { Search, Filter, Download, Calendar, User, Code, FileText } from 'lucide-react'
import { Class, Assignment, Submission } from '../../types/api'
import { classService } from '../../services/classService'
import { submissionService } from '../../services/submissionService'
import Card from '../ui/Card'
import Input from '../ui/Input'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import toast from 'react-hot-toast'

interface StudentSubmissionListProps {
  classItem: Class
}

interface SubmissionWithDetails extends Omit<Submission, 'assignment'> {
  student: {
    id: string
    name: string
    email: string
  }
  assignment: {
    id: string
    title: string
  }
}

const StudentSubmissionList: React.FC<StudentSubmissionListProps> = ({ classItem }) => {
  const [submissions, setSubmissions] = useState<SubmissionWithDetails[]>([])
  const [filteredSubmissions, setFilteredSubmissions] = useState<SubmissionWithDetails[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAssignment, setSelectedAssignment] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'date' | 'student' | 'assignment'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    loadData()
  }, [classItem.id])

  useEffect(() => {
    filterAndSortSubmissions()
  }, [submissions, searchTerm, selectedAssignment, sortBy, sortOrder])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [assignmentsResponse, submissionsData] = await Promise.all([
        classService.getAssignments(classItem.id),
        submissionService.getClassSubmissions(classItem.id)
      ])
      setAssignments(assignmentsResponse.assignments)
      setSubmissions(submissionsData)
    } catch (error) {
      console.error('Failed to load data:', error)
      toast.error('Failed to load submissions')
    } finally {
      setIsLoading(false)
    }
  }

  const filterAndSortSubmissions = () => {
    let filtered = [...submissions]

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(submission =>
        submission.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.assignment.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by assignment
    if (selectedAssignment !== 'all') {
      filtered = filtered.filter(submission => submission.assignment_id === selectedAssignment)
    }

    // Sort submissions
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime()
          break
        case 'student':
          comparison = a.student.name.localeCompare(b.student.name)
          break
        case 'assignment':
          comparison = a.assignment.title.localeCompare(b.assignment.title)
          break
      }

      return sortOrder === 'desc' ? -comparison : comparison
    })

    setFilteredSubmissions(filtered)
  }

  const handleDownloadAll = () => {
    if (filteredSubmissions.length === 0) {
      toast.error('No submissions to download')
      return
    }

    const zip = filteredSubmissions.map(submission => {
      const filename = `${submission.student.name}_${submission.assignment.title}.txt`
      const content = `Student: ${submission.student.name} (${submission.student.email})
Assignment: ${submission.assignment.title}
Submitted: ${new Date(submission.submitted_at).toLocaleString()}

Code:
${submission.code}`
      return { filename, content }
    })

    // Create a simple text file with all submissions
    const allContent = zip.map(file => `=== ${file.filename} ===\n${file.content}\n\n`).join('')
    const blob = new Blob([allContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${classItem.name}_all_submissions.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success(`Downloaded ${filteredSubmissions.length} submissions`)
  }

  const handleDownloadSubmission = (submission: SubmissionWithDetails) => {
    const content = `Student: ${submission.student.name} (${submission.student.email})
Assignment: ${submission.assignment.title}
Submitted: ${new Date(submission.submitted_at).toLocaleString()}

Code:
${submission.code}`
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${submission.student.name}_${submission.assignment.title}.txt`
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
        <div>
          <h1 className="text-2xl font-bold text-white">All Submissions</h1>
          <p className="text-gray-400">{classItem.name}</p>
        </div>
        <button
          onClick={handleDownloadAll}
          className="btn-primary"
          disabled={filteredSubmissions.length === 0}
        >
          <Download className="h-4 w-4 mr-2" />
          Download All ({filteredSubmissions.length})
        </button>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Search Students or Assignments
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by name, email, or assignment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Assignment Filter
            </label>
            <select
              value={selectedAssignment}
              onChange={(e) => setSelectedAssignment(e.target.value)}
              className="input"
            >
              <option value="all">All Assignments</option>
              {assignments.map(assignment => (
                <option key={assignment.id} value={assignment.id}>
                  {assignment.title}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Sort By
            </label>
            <div className="flex space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'student' | 'assignment')}
                className="input flex-1"
              >
                <option value="date">Date</option>
                <option value="student">Student</option>
                <option value="assignment">Assignment</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="btn-outline px-3"
                title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                <Filter className={`h-4 w-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Submissions List */}
      {filteredSubmissions.length === 0 ? (
        <Card className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            {submissions.length === 0 ? 'No Submissions Yet' : 'No Matching Submissions'}
          </h3>
          <p className="text-gray-400">
            {submissions.length === 0 
              ? 'Students haven\'t submitted any code yet.'
              : 'Try adjusting your search or filter criteria.'
            }
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredSubmissions.map((submission) => (
            <Card key={submission.id} variant="hover">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary-600/20 p-3 rounded-lg">
                    <User className="h-6 w-6 text-primary-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{submission.student.name}</h3>
                    <p className="text-sm text-gray-400">{submission.student.email}</p>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <FileText className="h-3 w-3" />
                        <span>{submission.assignment.title}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(submission.submitted_at)}</span>
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <Code className="h-4 w-4" />
                      <span>{submission.code.length} chars</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {submission.code.split('\n').length} lines
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDownloadSubmission(submission)}
                    className="btn-outline"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Summary */}
      {filteredSubmissions.length > 0 && (
        <Card>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary-400">{filteredSubmissions.length}</p>
              <p className="text-sm text-gray-400">Total Submissions</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-accent-400">
                {new Set(filteredSubmissions.map(s => s.student.id)).size}
              </p>
              <p className="text-sm text-gray-400">Unique Students</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-success-400">
                {new Set(filteredSubmissions.map(s => s.assignment_id)).size}
              </p>
              <p className="text-sm text-gray-400">Assignments</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

export default StudentSubmissionList