import React, { useState, useEffect } from 'react'
import { Search, Filter, Download, Calendar, User, Code, FileText, BookOpen } from 'lucide-react'
import { submissionService } from '../../services/submissionService'
import Button from '../ui/Button'
import Card from '../ui/Card'
import Input from '../ui/Input'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import toast from 'react-hot-toast'

interface SubmissionWithDetails {
  id: string
  assignment_id: string
  student_id: string
  code: string
  submitted_at: string
  student: {
    id: string
    name: string
    email: string
  }
  assignment: {
    id: string
    title: string
  }
  class: {
    id: string
    name: string
  }
}

interface AllSubmissionsListProps {
  onSubmissionsChange?: (submissions: SubmissionWithDetails[]) => void
}

const AllSubmissionsList: React.FC<AllSubmissionsListProps> = ({ 
  onSubmissionsChange
}) => {
  const [submissions, setSubmissions] = useState<SubmissionWithDetails[]>([])
  const [filteredSubmissions, setFilteredSubmissions] = useState<SubmissionWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClass, setSelectedClass] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'date' | 'student' | 'assignment' | 'class'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    loadSubmissions()
  }, [])

  useEffect(() => {
    filterAndSortSubmissions()
  }, [submissions, searchTerm, selectedClass, sortBy, sortOrder])

  // Notify parent of filtered submissions changes
  useEffect(() => {
    if (onSubmissionsChange) {
      onSubmissionsChange(filteredSubmissions)
    }
  }, [filteredSubmissions, onSubmissionsChange])

  const loadSubmissions = async () => {
    try {
      setIsLoading(true)
      const submissionsData = await submissionService.getAllTeacherSubmissions()
      setSubmissions(submissionsData || [])
    } catch (error) {
      console.error('Error loading submissions:', error)
      toast.error('Failed to load submissions. Please try again.')
      setSubmissions([])
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
        submission.assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.class.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by class
    if (selectedClass !== 'all') {
      filtered = filtered.filter(submission => submission.class.id === selectedClass)
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
        case 'class':
          comparison = a.class.name.localeCompare(b.class.name)
          break
      }

      return sortOrder === 'desc' ? -comparison : comparison
    })

    setFilteredSubmissions(filtered)
  }

  const handleDownloadSubmission = (submission: SubmissionWithDetails) => {
    const content = `Student: ${submission.student.name} (${submission.student.email})
Class: ${submission.class.name}
Assignment: ${submission.assignment.title}
Submitted: ${new Date(submission.submitted_at).toLocaleString()}

Code:
${submission.code}`
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${submission.student.name}_${submission.assignment.title}_${submission.class.name}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getUniqueClasses = () => {
    const classMap = new Map()
    submissions.forEach(submission => {
      if (submission.class) {
        classMap.set(submission.class.id, submission.class)
      }
    })
    return Array.from(classMap.values())
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const uniqueClasses = getUniqueClasses()

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2 no-select">
              Search Students, Assignments, or Classes
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 no-select" />
              <Input
                type="text"
                placeholder="Search by name, email, assignment, or class..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 smooth-transition"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 no-select">
              Class Filter
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="input smooth-transition"
            >
              <option value="all">All Classes</option>
              {uniqueClasses.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 no-select">
              Sort By
            </label>
            <div className="flex space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'student' | 'assignment' | 'class')}
                className="input flex-1 smooth-transition"
              >
                <option value="date">Date</option>
                <option value="student">Student</option>
                <option value="assignment">Assignment</option>
                <option value="class">Class</option>
              </select>
              <Button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                variant="outline"
                size="sm"
                title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                <Filter className={`h-4 w-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Submissions List */}
      {filteredSubmissions.length === 0 ? (
        <Card className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-600 mx-auto mb-4 no-select" />
          <h3 className="text-xl font-semibold text-white mb-2 no-select">
            {submissions.length === 0 ? 'No Submissions Yet' : 'No Matching Submissions'}
          </h3>
          <p className="text-gray-400 text-selectable">
            {submissions.length === 0 
              ? 'Students haven\'t submitted any code yet across your classes.'
              : 'Try adjusting your search or filter criteria.'
            }
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredSubmissions.map((submission) => (
            <Card key={submission.id} variant="hover" className="hover-lift">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary-600/20 p-3 rounded-lg">
                    <User className="h-6 w-6 text-primary-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white no-select">{submission.student.name}</h3>
                    <p className="text-sm text-gray-400 text-selectable">{submission.student.email}</p>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500 no-select">
                      <span className="flex items-center space-x-1">
                        <BookOpen className="h-3 w-3" />
                        <span>{submission.class.name}</span>
                      </span>
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
                  <div className="text-right no-select">
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <Code className="h-4 w-4" />
                      <span>{submission.code.length} chars</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {submission.code.split('\n').length} lines
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => handleDownloadSubmission(submission)}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Summary */}
      {filteredSubmissions.length > 0 && (
        <Card>
          <div className="grid grid-cols-4 gap-4 text-center no-select">
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
            <div>
              <p className="text-2xl font-bold text-warning-400">
                {new Set(filteredSubmissions.map(s => s.class.id)).size}
              </p>
              <p className="text-sm text-gray-400">Classes</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

export default AllSubmissionsList