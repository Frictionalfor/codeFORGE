import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import ClassList from '../../components/teacher/ClassList'
import Button from '../../components/ui/Button'

const ClassesPage: React.FC = () => {
  const navigate = useNavigate()
  const [showCreateModal, setShowCreateModal] = useState(false)

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8 no-select">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white text-shadow">My Classes</h2>
            <p className="text-gray-400 text-selectable">Manage your classes and assignments</p>
          </div>
          <div className="flex-shrink-0 ml-6">
            <Button onClick={() => setShowCreateModal(true)} className="hover-lift">
              <Plus className="h-5 w-5 mr-2" />
              Create Class
            </Button>
          </div>
        </div>
        
        <ClassList 
          onClassSelect={(classItem) => {
            // Navigate to class detail page
            navigate(`/teacher/classes/${classItem.id}`)
          }}
          showCreateModal={showCreateModal}
          onShowCreateModal={() => setShowCreateModal(true)}
          onCloseCreateModal={() => setShowCreateModal(false)}
        />
      </div>
    </div>
  )
}

export default ClassesPage