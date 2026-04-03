import React, { useState, useEffect } from 'react' 
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom' 
import useAuthStore from './store/authStore' 
import LoadingScreen from './components/LoadingScreen' 
import useSocket from './hooks/useSocket'

import LandingPage from './pages/LandingPage' 
import LoginPage from './pages/LoginPage' 
import RegisterPage from './pages/RegisterPage' 
import VerifyOTPPage from './pages/VerifyOTPPage'
import DashboardPage from './pages/DashboardPage' 
import ChamasPage from './pages/ChamasPage' 
import ChamaDetailPage from './pages/ChamaDetailPage' 
import ContributionsPage from './pages/ContributionsPage' 
import LoansPage from './pages/LoansPage' 
import AICoachPage from './pages/AICoachPage' 
import NotificationsPage from './pages/NotificationsPage' 
import ProfilePage from './pages/ProfilePage' 
import JoinPage from './pages/JoinPage' 
import OnboardingPage from './pages/OnboardingPage' 
import SuperAdminPage from './pages/SuperAdminPage' 

const ProtectedRoute = ({ children }) => { 
  const { isAuthenticated } = useAuthStore() 
  return isAuthenticated ? children : <Navigate to="/login" replace /> 
} 

const PublicRoute = ({ children }) => { 
  const { isAuthenticated } = useAuthStore() 
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace /> 
} 

export default function App() { 
  const [appLoading, setAppLoading] = useState(true) 
  useSocket()
  useEffect(() => { setTimeout(() => setAppLoading(false), 1200) }, []) 
  if (appLoading) return <LoadingScreen /> 

  return ( 
    <BrowserRouter> 
      <div className="mesh-bg" /> 
      <Routes> 
        <Route path="/" element={<LandingPage />} /> 
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} /> 
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} /> 
        <Route path="/verify-otp" element={<PublicRoute><VerifyOTPPage /></PublicRoute>} /> 
        <Route path="/join/:code" element={<JoinPage />} /> 
        <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} /> 
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} /> 
        <Route path="/chamas" element={<ProtectedRoute><ChamasPage /></ProtectedRoute>} /> 
        <Route path="/chama/:chamaId" element={<ProtectedRoute><ChamaDetailPage /></ProtectedRoute>} /> 
        <Route path="/contributions" element={<ProtectedRoute><ContributionsPage /></ProtectedRoute>} /> 
        <Route path="/loans" element={<ProtectedRoute><LoansPage /></ProtectedRoute>} /> 
        <Route path="/ai-coach" element={<ProtectedRoute><AICoachPage /></ProtectedRoute>} /> 
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} /> 
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} /> 
        <Route path="/admin" element={<ProtectedRoute><SuperAdminPage /></ProtectedRoute>} /> 
        <Route path="*" element={ 
          <div style={{ minHeight: '100vh', background: '#0D0B1E', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}> 
            <div className="mesh-bg" /> 
            <p style={{ fontFamily: 'Syne', fontSize: '80px', color: '#F8FAFC', margin: 0, position: 'relative', zIndex: 1 }}>404</p> 
            <p style={{ fontFamily: 'Syne', fontSize: '24px', color: '#F8FAFC', margin: 0, position: 'relative', zIndex: 1 }}>Page not found</p> 
            <a href="/dashboard" className="btn-primary" style={{ position: 'relative', zIndex: 1 }}>Go to Dashboard</a> 
          </div> 
        } /> 
      </Routes> 
    </BrowserRouter> 
  ) 
} 
