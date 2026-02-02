import React from 'react'
import { Settings } from 'lucide-react'
import TeacherSettings from '../../components/teacher/TeacherSettings'

const TeacherSettingsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8 no-select">
          <div>
            <h2 className="text-2xl font-bold text-white text-shadow flex items-center">
              <Settings className="h-6 w-6 mr-2" />
              Settings
            </h2>
            <p className="text-gray-400 text-selectable">Manage your account and preferences</p>
          </div>
        </div>
        
        <TeacherSettings />
      </div>
    </div>
  )
}

export default TeacherSettingsPage