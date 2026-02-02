import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import EnrolledClassList from '../../components/student/EnrolledClassList'
import Button from '../../components/ui/Button'

const ClassesPage: React.FC = () => {
  const navigate = useNavigate()
  const [showJoinModal, setShowJoinModal] = useState(false)

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8 no-select">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white text-shadow">My Classes</h2>
            <p className="text-gray-400 text-selectable">View your enrolled classes and assignments</p>
          </div>
          <div className="flex-shrink-0 ml-6">
            <Button onClick={() => setShowJoinModal(true)} className="hover-lift">
              <Plus className="h-5 w-5 mr-2" />
              Join Class
            </Button>
          </div>
        </div>
        
        <EnrolledClassList 
          onClassSelect={(classItem) => {
            // Navigate to class assignments page
            navigate(`/student/classes/${classItem.id}`)
          }}
          showJoinModal={showJoinModal}
          onShowJoinModal={() => setShowJoinModal(true)}
          onCloseJoinModal={() => setShowJoinModal(false)}
        />
      </div>
    </div>
  )
}

export default ClassesPage