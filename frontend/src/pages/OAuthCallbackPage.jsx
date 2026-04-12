import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Loader2, AlertCircle } from 'lucide-react'
import useAuthStore from '../store/authStore'

export default function OAuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setAuth } = useAuthStore()
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(true)

  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      setProcessing(false)
      const errorMessages = {
        no_code: 'Authentication code missing. Please try again.',
        no_email: 'Could not get your email from Google. Please try again.',
        suspended: 'Your account has been suspended. Please contact support.',
        auth_failed: 'Authentication failed. Please try again.'
      }
      setError(errorMessages[errorParam] || 'Authentication failed. Please try again.')
      return
    }

    const accessToken = searchParams.get('accessToken')
    const refreshToken = searchParams.get('refreshToken')
    const userJson = searchParams.get('user')

    if (!accessToken || !refreshToken || !userJson) {
      setProcessing(false)
      setError('Missing authentication data. Please try again.')
      return
    }

    try {
      const user = JSON.parse(userJson)
      setAuth(user, accessToken, refreshToken)
      navigate('/dashboard', { replace: true })
    } catch (e) {
      console.error('OAuth callback error:', e)
      setProcessing(false)
      setError('Failed to process login. Please try again.')
    }
  }, [searchParams, setAuth, navigate])

  const handleRetry = () => {
    navigate('/login', { replace: true })
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #000000 0%, #0a0a0f 40%, #08080c 70%, #000000 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          width: '400px',
          maxWidth: '90%',
          background: 'rgba(15, 15, 20, 0.85)',
          backdropFilter: 'blur(14px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '24px',
          padding: '40px',
          textAlign: 'center',
        }}
      >
        {processing ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                border: '3px solid rgba(14,165,233,0.2)',
                borderTop: '3px solid #0EA5E9',
                margin: '0 auto 24px'
              }}
            />
            <h2 style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: '22px',
              color: '#F8FAFC',
              margin: '0 0 8px'
            }}>
              Completing Sign In
            </h2>
            <p style={{ color: '#64748B', margin: 0, fontSize: '14px' }}>
              Just a moment...
            </p>
          </>
        ) : error ? (
          <>
            <AlertCircle size={48} color="#EF4444" style={{ margin: '0 auto 24px' }} />
            <h2 style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: '22px',
              color: '#F8FAFC',
              margin: '0 0 8px'
            }}>
              Sign In Failed
            </h2>
            <p style={{ color: '#FCA5A5', margin: '0 0 24px', fontSize: '14px' }}>
              {error}
            </p>
            <button
              onClick={handleRetry}
              style={{
                width: '100%',
                height: '48px',
                background: '#0EA5E9',
                color: '#FFF',
                border: 'none',
                borderRadius: '12px',
                fontFamily: "'Syne', sans-serif",
                fontWeight: 600,
                fontSize: '15px',
                cursor: 'pointer',
              }}
            >
              Back to Login
            </button>
          </>
        ) : null}
      </motion.div>
    </div>
  )
}
