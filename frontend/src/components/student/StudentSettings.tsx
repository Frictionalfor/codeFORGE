import React, { useState, useEffect } from 'react'
import { Bell, Calendar, Save, LogOut, AlertTriangle, User, Lock, Shield } from 'lucide-react'
import { useAuth } from '../../contexts/FirebaseAuthContext'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Modal from '../ui/Modal'
import toast from 'react-hot-toast'

interface SettingsData {
  deadlineReminders: boolean
  reminderDaysBefore: number
  showOverdueAssignments: boolean
  emailNotifications: boolean
}

interface ProfileData {
  name: string
  email: string
  bio: string
  institution: string
  major: string
  year: string
}

interface PasswordChangeData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

const StudentSettings: React.FC = () => {
  const { userProfile, signOut } = useAuth()
  
  // Placeholder functions for profile updates (to be implemented)
  const updateProfile = async (data: any) => {
    console.log('Profile update not implemented yet:', data)
  }
  
  const changePassword = async (oldPassword: string, newPassword: string) => {
    console.log('Password change not implemented yet:', { oldPassword, newPassword })
  }
  const [activeSection, setActiveSection] = useState<'profile' | 'assignments' | 'notifications' | 'security'>('profile')
  
  const [settings, setSettings] = useState<SettingsData>({
    deadlineReminders: true,
    reminderDaysBefore: 3,
    showOverdueAssignments: true,
    emailNotifications: false
  })

  const [profile, setProfile] = useState<ProfileData>({
    name: userProfile?.name || '',
    email: userProfile?.email || '',
    bio: userProfile?.bio || '',
    institution: userProfile?.institution || '',
    major: userProfile?.major || '',
    year: userProfile?.year || ''
  })

  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [isLoading, setIsLoading] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  // Update profile state when user data changes
  useEffect(() => {
    if (userProfile) {
      setProfile({
        name: userProfile.name || '',
        email: userProfile.email || '',
        bio: userProfile.bio || '',
        institution: userProfile.institution || '',
        major: userProfile.major || '',
        year: userProfile.year || ''
      })
    }
  }, [userProfile])

  const handleSettingChange = (key: keyof SettingsData, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleProfileChange = (key: keyof ProfileData, value: string) => {
    setProfile(prev => ({ ...prev, [key]: value }))
  }

  const handlePasswordChange = (key: keyof PasswordChangeData, value: string) => {
    setPasswordData(prev => ({ ...prev, [key]: value }))
  }

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true)
      await updateProfile(profile)
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error('Failed to update profile')
      console.error('Error updating profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    try {
      setIsLoading(true)
      // TODO: Implement API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      toast.success('Settings saved successfully')
    } catch (error) {
      toast.error('Failed to save settings')
      console.error('Error saving settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }

    try {
      setIsLoading(true)
      await changePassword(passwordData.currentPassword, passwordData.newPassword)
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setShowPasswordModal(false)
      toast.success('Password changed successfully')
    } catch (error) {
      toast.error('Failed to change password')
      console.error('Error changing password:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    signOut()
    toast.success('Signed out successfully')
  }

  const renderProfileSection = () => (
    <div className="space-y-6">
      <Card className="hover-lift">
        <div className="space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-gray-600">
            <User className="h-5 w-5 text-primary-400" />
            <h3 className="text-lg font-semibold text-white no-select">Personal Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Full Name"
              type="text"
              value={profile.name}
              onChange={(e) => handleProfileChange('name', e.target.value)}
              placeholder="Enter your full name"
            />

            <Input
              label="Email Address"
              type="email"
              value={profile.email}
              onChange={(e) => handleProfileChange('email', e.target.value)}
              placeholder="Enter your email"
            />

            <Input
              label="Institution"
              type="text"
              value={profile.institution}
              onChange={(e) => handleProfileChange('institution', e.target.value)}
              placeholder="University or School name"
            />

            <Input
              label="Major/Field of Study"
              type="text"
              value={profile.major}
              onChange={(e) => handleProfileChange('major', e.target.value)}
              placeholder="Computer Science, Engineering, etc."
            />

            <Input
              label="Academic Year"
              type="text"
              value={profile.year}
              onChange={(e) => handleProfileChange('year', e.target.value)}
              placeholder="Freshman, Sophomore, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 no-select">
              Bio
            </label>
            <textarea
              value={profile.bio}
              onChange={(e) => handleProfileChange('bio', e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-vertical min-h-[100px]"
              placeholder="Tell others about yourself, your interests, and goals..."
            />
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSaveProfile}
              loading={isLoading}
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Save Profile</span>
            </Button>
          </div>
        </div>
      </Card>

      <Card className="hover-lift">
        <div className="space-y-4">
          <div className="flex items-center space-x-3 pb-4 border-b border-gray-600">
            <Calendar className="h-5 w-5 text-primary-400" />
            <h3 className="text-lg font-semibold text-white no-select">Account Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-gray-400 no-select">Member Since</p>
              <p className="text-white font-medium">
                {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
            <div>
              <p className="text-gray-400 no-select">Account Type</p>
              <p className="text-white font-medium capitalize">{userProfile?.role || 'Student'}</p>
            </div>
            <div>
              <p className="text-gray-400 no-select">User ID</p>
              <p className="text-white font-medium font-mono text-xs">{userProfile?.id || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-400 no-select">Status</p>
              <span className="status-success">Active</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )

  const renderAssignmentsSection = () => (
    <Card className="hover-lift">
      <div className="space-y-6">
        <div className="flex items-center space-x-3 pb-4 border-b border-gray-600">
          <Calendar className="h-5 w-5 text-primary-400" />
          <h3 className="text-lg font-semibold text-white no-select">Assignment & Deadline Settings</h3>
        </div>

        <div className="space-y-4">
          {/* Deadline Reminders */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-white no-select">Deadline Reminders</label>
              <p className="text-xs text-gray-400 text-selectable">Get notified about upcoming assignment deadlines</p>
            </div>
            <input
              type="checkbox"
              checked={settings.deadlineReminders}
              onChange={(e) => handleSettingChange('deadlineReminders', e.target.checked)}
              className="w-4 h-4 text-primary-600 bg-slate-800 border-gray-600 rounded focus:ring-primary-500 focus:ring-2"
            />
          </div>

          {/* Reminder Days Before */}
          {settings.deadlineReminders && (
            <div className="ml-6 animate-slide-down">
              <Input
                label="Remind me (days before deadline)"
                type="number"
                value={settings.reminderDaysBefore}
                onChange={(e) => handleSettingChange('reminderDaysBefore', parseInt(e.target.value) || 1)}
                min={1}
                max={30}
                helperText="How many days before the deadline should you be reminded?"
              />
            </div>
          )}

          {/* Show Overdue Assignments */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-white no-select">Show Overdue Assignments</label>
              <p className="text-xs text-gray-400 text-selectable">Display assignments that are past their deadline</p>
            </div>
            <input
              type="checkbox"
              checked={settings.showOverdueAssignments}
              onChange={(e) => handleSettingChange('showOverdueAssignments', e.target.checked)}
              className="w-4 h-4 text-primary-600 bg-slate-800 border-gray-600 rounded focus:ring-primary-500 focus:ring-2"
            />
          </div>
        </div>

        <div className="bg-slate-800/50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-white mb-3 no-select">Assignment Tips</h4>
          <div className="space-y-3 text-sm text-gray-300">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary-400 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-selectable">
                <strong className="text-white no-select">Plan Ahead:</strong> Start working on assignments as soon as they're published to avoid last-minute stress.
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary-400 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-selectable">
                <strong className="text-white no-select">Late Submissions:</strong> Some assignments allow late submissions with penalty. Check the assignment details for late submission policies.
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary-400 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-selectable">
                <strong className="text-white no-select">Time Zones:</strong> All deadlines are shown in your local time zone automatically.
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary-400 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-selectable">
                <strong className="text-white no-select">Schedule View:</strong> Use the Schedule tab to see all your upcoming deadlines in one place.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleSaveSettings}
            loading={isLoading}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>Save Settings</span>
          </Button>
        </div>
      </div>
    </Card>
  )

  const renderNotificationsSection = () => (
    <Card className="hover-lift">
      <div className="space-y-6">
        <div className="flex items-center space-x-3 pb-4 border-b border-gray-600">
          <Bell className="h-5 w-5 text-primary-400" />
          <h3 className="text-lg font-semibold text-white no-select">Notification Settings</h3>
        </div>

        <div className="space-y-4">
          {/* Email Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-white no-select">Email Notifications</label>
              <p className="text-xs text-gray-400 text-selectable">Receive assignment updates via email</p>
            </div>
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
              className="w-4 h-4 text-primary-600 bg-slate-800 border-gray-600 rounded focus:ring-primary-500 focus:ring-2"
            />
          </div>

          <div className="bg-slate-800/50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-white mb-3 no-select">Email Notification Types</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300 no-select">New assignments</span>
                <input type="checkbox" defaultChecked className="w-4 h-4 text-primary-600 bg-slate-800 border-gray-600 rounded" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300 no-select">Assignment deadlines</span>
                <input type="checkbox" defaultChecked className="w-4 h-4 text-primary-600 bg-slate-800 border-gray-600 rounded" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300 no-select">Grade updates</span>
                <input type="checkbox" className="w-4 h-4 text-primary-600 bg-slate-800 border-gray-600 rounded" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300 no-select">Class announcements</span>
                <input type="checkbox" defaultChecked className="w-4 h-4 text-primary-600 bg-slate-800 border-gray-600 rounded" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleSaveSettings}
            loading={isLoading}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>Save Preferences</span>
          </Button>
        </div>
      </div>
    </Card>
  )

  const renderSecuritySection = () => (
    <div className="space-y-6">
      <Card className="hover-lift">
        <div className="space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-gray-600">
            <Shield className="h-5 w-5 text-primary-400" />
            <h3 className="text-lg font-semibold text-white no-select">Security Settings</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-white no-select">Password</label>
                <p className="text-xs text-gray-400 text-selectable">Change your account password</p>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowPasswordModal(true)}
                className="flex items-center space-x-2"
              >
                <Lock className="h-4 w-4" />
                <span>Change Password</span>
              </Button>
            </div>

            <div className="bg-slate-800/50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-white mb-3 no-select">Security Recommendations</h4>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-selectable">Use a strong, unique password</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-selectable">Keep your account information up to date</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-selectable">Sign out when using shared computers</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="hover-lift border-red-500/20">
        <div className="space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-red-500/20">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <h3 className="text-lg font-semibold text-white no-select">Account Actions</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-white no-select">Sign Out</label>
                <p className="text-xs text-gray-400 text-selectable">Sign out of your CodeForge account</p>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowLogoutModal(true)}
                className="flex items-center space-x-2 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <Card>
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'profile', label: 'Profile', icon: User },
            { key: 'assignments', label: 'Assignments', icon: Calendar },
            { key: 'notifications', label: 'Notifications', icon: Bell },
            { key: 'security', label: 'Security', icon: Shield }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveSection(key as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeSection === key
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Content Sections */}
      {activeSection === 'profile' && renderProfileSection()}
      {activeSection === 'assignments' && renderAssignmentsSection()}
      {activeSection === 'notifications' && renderNotificationsSection()}
      {activeSection === 'security' && renderSecuritySection()}

      {/* Password Change Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Password"
      >
        <div className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            value={passwordData.currentPassword}
            onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
            placeholder="Enter your current password"
          />
          
          <Input
            label="New Password"
            type="password"
            value={passwordData.newPassword}
            onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
            placeholder="Enter your new password"
            helperText="Password must be at least 8 characters long"
          />
          
          <Input
            label="Confirm New Password"
            type="password"
            value={passwordData.confirmPassword}
            onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
            placeholder="Confirm your new password"
          />
          
          <div className="flex space-x-3 justify-end pt-4 border-t border-gray-600">
            <Button
              variant="outline"
              onClick={() => setShowPasswordModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleChangePassword}
              loading={isLoading}
              disabled={isLoading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
            >
              Change Password
            </Button>
          </div>
        </div>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Confirm Sign Out"
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="bg-red-500/10 p-3 rounded-full">
              <LogOut className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white no-select">Sign Out of CodeForge?</h3>
              <p className="text-gray-400 text-selectable">You will need to sign in again to access your account.</p>
            </div>
          </div>
          
          <div className="flex space-x-3 justify-end pt-4 border-t border-gray-600">
            <Button
              variant="outline"
              onClick={() => setShowLogoutModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default StudentSettings