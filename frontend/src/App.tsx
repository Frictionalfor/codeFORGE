import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/FirebaseAuthContext'
import { AuthApp } from './components/auth/AuthApp'
import { AuthGuard } from './components/auth/AuthGuard'
import { RoleGuard } from './components/auth/RoleGuard'
import ErrorBoundary from './components/common/ErrorBoundary'
import Layout from './components/layout/Layout'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import TeacherDashboard from './pages/teacher/TeacherDashboard'
import StudentDashboard from './pages/student/StudentDashboard'
import LandingPage from './pages/LandingPage'
import NotFoundPage from './pages/NotFoundPage'

// Teacher Pages
import TeacherClassesPage from './pages/teacher/ClassesPage'
import ClassDetailPage from './pages/teacher/ClassDetailPage'
import StudentRosterPage from './pages/teacher/StudentRosterPage'
import SubmissionReviewPage from './pages/teacher/SubmissionReviewPage'
import AllSubmissionsPage from './pages/teacher/AllSubmissionsPage'
import TeacherSettingsPage from './pages/teacher/TeacherSettingsPage'

// Student Pages
import StudentClassesPage from './pages/student/ClassesPage'
import ClassAssignmentsPage from './pages/student/ClassAssignmentsPage'
import CodeEditorPage from './pages/student/CodeEditorPage'
import StudentSettingsPage from './pages/student/StudentSettingsPage'

// Dashboard Router Component
const DashboardRouter: React.FC = () => {
  const { userProfile } = useAuth()
  
  console.log('🎯 DashboardRouter Debug:', {
    userProfile: !!userProfile,
    userRole: userProfile?.role,
    currentPath: window.location.pathname
  });
  
  if (!userProfile) {
    console.log('⏳ DashboardRouter: No user profile, showing loading');
    return <div>Loading...</div>
  }
  
  if (userProfile.role === 'teacher') {
    console.log('👨‍🏫 DashboardRouter: Rendering TeacherDashboard');
    return <TeacherDashboard />
  }
  
  if (userProfile.role === 'student') {
    console.log('👨‍🎓 DashboardRouter: Rendering StudentDashboard');
    return <StudentDashboard />
  }
  
  console.log('❌ DashboardRouter: Invalid role:', userProfile.role);
  return <div>Invalid role</div>
}

function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-950">
        <AuthProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AuthApp>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected Routes */}
                <Route path="/dashboard" element={
                  <AuthGuard>
                    <RoleGuard allowedRoles={['teacher', 'student']}>
                      <DashboardRouter />
                    </RoleGuard>
                  </AuthGuard>
                } />

                {/* Teacher Routes */}
                <Route path="/teacher/classes" element={
                  <AuthGuard>
                    <RoleGuard allowedRoles={['teacher']}>
                      <Layout>
                        <TeacherClassesPage />
                      </Layout>
                    </RoleGuard>
                  </AuthGuard>
                } />
                <Route path="/teacher/classes/:id" element={
                  <AuthGuard>
                    <RoleGuard allowedRoles={['teacher']}>
                      <Layout>
                        <ClassDetailPage />
                      </Layout>
                    </RoleGuard>
                  </AuthGuard>
                } />
                <Route path="/teacher/classes/:id/roster" element={
                  <AuthGuard>
                    <RoleGuard allowedRoles={['teacher']}>
                      <Layout>
                        <StudentRosterPage />
                      </Layout>
                    </RoleGuard>
                  </AuthGuard>
                } />
                <Route path="/teacher/classes/:classId/assignments/:assignmentId/submissions" element={
                  <AuthGuard>
                    <RoleGuard allowedRoles={['teacher']}>
                      <Layout>
                        <AllSubmissionsPage />
                      </Layout>
                    </RoleGuard>
                  </AuthGuard>
                } />
                <Route path="/teacher/classes/:classId/assignments/:assignmentId/submissions/:submissionId" element={
                  <AuthGuard>
                    <RoleGuard allowedRoles={['teacher']}>
                      <Layout>
                        <SubmissionReviewPage />
                      </Layout>
                    </RoleGuard>
                  </AuthGuard>
                } />
                <Route path="/teacher/settings" element={
                  <AuthGuard>
                    <RoleGuard allowedRoles={['teacher']}>
                      <Layout>
                        <TeacherSettingsPage />
                      </Layout>
                    </RoleGuard>
                  </AuthGuard>
                } />

                {/* Student Routes */}
                <Route path="/student/classes" element={
                  <AuthGuard>
                    <RoleGuard allowedRoles={['student']}>
                      <Layout>
                        <StudentClassesPage />
                      </Layout>
                    </RoleGuard>
                  </AuthGuard>
                } />
                <Route path="/student/classes/:id/assignments" element={
                  <AuthGuard>
                    <RoleGuard allowedRoles={['student']}>
                      <Layout>
                        <ClassAssignmentsPage />
                      </Layout>
                    </RoleGuard>
                  </AuthGuard>
                } />
                <Route path="/student/classes/:classId/assignments/:assignmentId/code" element={
                  <AuthGuard>
                    <RoleGuard allowedRoles={['student']}>
                      <Layout>
                        <CodeEditorPage />
                      </Layout>
                    </RoleGuard>
                  </AuthGuard>
                } />
                <Route path="/student/settings" element={
                  <AuthGuard>
                    <RoleGuard allowedRoles={['student']}>
                      <Layout>
                        <StudentSettingsPage />
                      </Layout>
                    </RoleGuard>
                  </AuthGuard>
                } />

                {/* 404 Route */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </AuthApp>
          </Router>
        </AuthProvider>
        
        {/* Global toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
              color: '#f1f5f9',
              border: '1px solid #475569',
              borderRadius: '12px',
              boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
              backdropFilter: 'blur(8px)',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#f1f5f9',
              },
              style: {
                background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                border: '1px solid #22c55e40',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#f1f5f9',
              },
              style: {
                background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                border: '1px solid #ef444440',
              },
            },
          }}
        />
      </div>
    </ErrorBoundary>
  )
}

export default App