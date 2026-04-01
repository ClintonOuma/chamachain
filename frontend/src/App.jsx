import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/authStore'
import LoadingScreen from './components/LoadingScreen'
import ToastContainer from './components/ToastContainer'

// Pages (we will create these next)
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ChamaDetailPage from './pages/ChamaDetailPage'
import AICoachPage from './pages/AICoachPage'
import NotificationsPage from './pages/NotificationsPage'
import ProfilePage from './pages/ProfilePage'
import ChamasPage from './pages/ChamasPage'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? children : <Navigate to="/login" />
}

export default function App() {
  const [appLoading, setAppLoading] = useState(true)

  useEffect(() => {
    requestAnimationFrame(() => setAppLoading(false))
  }, [])

  if (appLoading) return <LoadingScreen />

  return (
    <BrowserRouter>
      <div className="mesh-bg" />
      <ToastContainer />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={
          <ProtectedRoute><DashboardPage /></ProtectedRoute>
        } />
        <Route path="/chamas" element={
          <ProtectedRoute><ChamasPage /></ProtectedRoute>
        } />
        <Route path="/chama/:chamaId" element={
          <ProtectedRoute><ChamaDetailPage /></ProtectedRoute>
        } />
        <Route path="/ai-coach" element={
          <ProtectedRoute><AICoachPage /></ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute><NotificationsPage /></ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute><ProfilePage /></ProtectedRoute>
        } />
        <Route path="*" element={
          <div style={{
            minHeight: '100vh',
            background: '#0D0B1E',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div className="mesh-bg" />
            <p style={{ fontFamily: 'Syne', fontSize: '80px', margin: 0 }}>404</p>
            <p style={{ fontFamily: 'Syne', fontSize: '24px', color: '#F8FAFC', margin: '8px 0' }}>Page not found</p>
            <p style={{ color: '#64748B', fontFamily: 'DM Sans', marginBottom: '32px' }}>The page you're looking for doesn't exist</p>
            <a href="/dashboard" className="btn-primary">Go to Dashboard</a>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  )
}

