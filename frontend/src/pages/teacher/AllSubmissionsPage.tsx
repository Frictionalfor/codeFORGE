import React, { useState } from 'react'
import { Download } from 'lucide-react'
import AllSubmissionsList from '../../components/teacher/AllSubmissionsList'
import Button from '../../components/ui/Button'
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

const AllSubmissionsPage: React.FC = () => {
  const [filteredSubmissions, setFilteredSubmissions] = useState<SubmissionWithDetails[]>([])

  const handleDownloadCSV = () => {
    if (filteredSubmissions.length === 0) {
      toast.error('No submissions to download')
      return
    }

    // CSV Headers
    const headers = [
      'Student Name',
      'Student Email', 
      'Class Name',
      'Assignment Title',
      'Submission Date',
      'Code Length (chars)',
      'Code Preview (first 100 chars)'
    ]

    // Helper function to escape CSV values
    const escapeCSV = (value: string | number) => {
      if (typeof value === 'number') return value.toString()
      const stringValue = value.toString()
      // Escape quotes by doubling them and wrap in quotes if contains comma, quote, or newline
      if (stringValue.includes('"') || stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('\r')) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }
      return `"${stringValue}"`
    }

    // Convert submissions to CSV rows
    const csvRows = filteredSubmissions.map(submission => {
      const submissionDate = new Date(submission.submitted_at).toLocaleString()
      const codePreview = submission.code.replace(/[\r\n]+/g, ' ').substring(0, 100)
      
      return [
        escapeCSV(submission.student.name || 'Unknown'),
        escapeCSV(submission.student.email || 'No email'),
        escapeCSV(submission.class.name || 'Unknown Class'),
        escapeCSV(submission.assignment.title || 'Unknown Assignment'),
        escapeCSV(submissionDate),
        submission.code ? submission.code.length : 0,
        escapeCSV(codePreview + (submission.code && submission.code.length > 100 ? '...' : ''))
      ].join(',')
    })

    // Combine headers and rows
    const csvContent = [headers.map(h => escapeCSV(h)).join(','), ...csvRows].join('\n')
    
    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `all_submissions_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success(`Downloaded ${filteredSubmissions.length} submissions as CSV`)
  }

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8 no-select">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white text-shadow">All Submissions</h1>
            <p className="text-gray-400 text-selectable">View submissions from all your classes</p>
          </div>
          <div className="flex-shrink-0 ml-6">
            <Button
              onClick={handleDownloadCSV}
              variant="info"
              size="md"
              disabled={filteredSubmissions.length === 0}
              className="hover-lift"
              title={filteredSubmissions.length === 0 ? "No submissions available to download" : `Download ${filteredSubmissions.length} submissions as CSV`}
            >
              <Download className="h-4 w-4 mr-2" />
              Download CSV ({filteredSubmissions.length})
            </Button>
          </div>
        </div>
        
        <AllSubmissionsList onSubmissionsChange={setFilteredSubmissions} />
      </div>
    </div>
  )
}

export default AllSubmissionsPage