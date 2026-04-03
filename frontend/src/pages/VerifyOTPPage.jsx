import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Smartphone, Loader2, ArrowLeft } from 'lucide-react'
import api from '../services/api'
import useAuthStore from '../store/authStore'
import usePageTitle from '../hooks/usePageTitle'

export default function VerifyOTPPage() {
  usePageTitle('Verify Phone')
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const inputRefs = useRef([])
  const [focusedIndex, setFocusedIndex] = useState(-1)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [resendSuccess, setResendSuccess] = useState(false)

  // Get stored data
  const userId = localStorage.getItem('pendingUserId') || ''
  const phone = localStorage.getItem('pendingPhone') || ''

  useEffect(() => {
    // Focus first box on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [])

  useEffect(() => {
    let timer
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [countdown])

  const handleChange = (index, value) => {
    // Only allow numeric input
    if (!/^\d*$/.test(value)) return

    // Take only the last character entered
    const val = value.slice(-1)
    
    const newDigits = [...digits]
    newDigits[index] = val
    setDigits(newDigits)
    setError('')

    // Move focus to next input if filled
    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
      // Optional: actually clear the previous box too
      const newDigits = [...digits]
      newDigits[index - 1] = ''
      setDigits(newDigits)
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pastedData) return

    const newDigits = [...digits]
    for (let i = 0; i < pastedData.length; i++) {
      newDigits[i] = pastedData[i]
    }
    setDigits(newDigits)
    
    // Focus the next empty box, or the last box if full
    const nextIndex = Math.min(pastedData.length, 5)
    inputRefs.current[nextIndex]?.focus()
    setError('')
  }

  const handleVerify = async () => {
    const otp = digits.join('')
    if (otp.length < 6) return setError('Please enter all 6 digits')
    
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/verify-otp', { userId, otp })
      const { accessToken, refreshToken, user } = res.data
      
      setSuccess(true)
      
      // Brief delay to show success flash before navigating
      setTimeout(() => {
        setAuth(user, accessToken, refreshToken)
        // Clear temp storage
        localStorage.removeItem('pendingUserId')
        localStorage.removeItem('pendingPhone')
        localStorage.removeItem('pendingEmail')
        navigate('/onboarding')
      }, 1500)
      
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.')
      setDigits(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      if (!success) setLoading(false)
    }
  }

  const handleResend = async () => {
    const userId = localStorage.getItem('pendingUserId')
    try {
      await api.post('/auth/resend-otp', { userId })
      setCountdown(60)
      setError('')
      // Show success message
      setResendSuccess(true)
      setTimeout(() => setResendSuccess(false), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0D0B1E',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif",
      position: 'relative',
      padding: '40px 0'
    }}>
      {/* Background orbs */}
      <div style={{
        position: 'fixed', top: '-10%', right: '-10%',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(139,92,246,0.18) 0%, transparent 70%)',
        filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'fixed', bottom: '-10%', left: '-10%',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(14,165,233,0.15) 0%, transparent 70%)',
        filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'relative', zIndex: 10,
          width: '440px', maxWidth: '90%',
          background: '#12101f',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '28px',
          padding: '48px 40px',
          boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
        }}
      >
        {!userId ? (
          <div style={{ textAlign: 'center' }}>
            <h2 style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700,
              fontSize: '22px',
              color: '#F8FAFC',
              margin: '0 0 12px 0'
            }}>
              Session expired. Please register again.
            </h2>
            <Link to="/register" style={{
              color: '#0EA5E9',
              fontWeight: 600,
              fontSize: '14px',
              textDecoration: 'none'
            }}>
              Go to Register
            </Link>
          </div>
        ) : (
          <>
            {/* Top Section */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              
              <div style={{
                width: '64px',
                height: '64px',
                margin: '0 auto 24px auto',
                borderRadius: '50%',
                background: 'rgba(14, 165, 233, 0.1)',
                border: '2px solid rgba(14, 165, 233, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0EA5E9',
                animation: 'pulse-glow 2s infinite ease-in-out'
              }}>
                <Smartphone size={28} />
              </div>

              <h2 style={{ 
                fontFamily: "'Syne', sans-serif", 
                fontWeight: 700, 
                fontSize: '26px', 
                color: '#F8FAFC',
                margin: '0 0 12px 0'
              }}>
                Verify your phone
              </h2>
              <p style={{ color: '#94A3B8', fontSize: '14px', textAlign: 'center', marginBottom: '32px', lineHeight: 1.6 }}>
                We sent a 6-digit verification code to
                <br />
                <span style={{ color: '#0EA5E9', fontWeight: 600 }}>
                  {localStorage.getItem('pendingEmail') || 'your email'}
                </span>
                <br />
                <span style={{ fontSize: '12px', color: '#475569' }}>
                  Check your inbox and spam folder
                </span>
              </p>
            </div>

            {/* OTP Input Boxes */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
              {digits.map((digit, i) => {
                const isFocused = focusedIndex === i
                const isFilled = digit.length > 0

                return (
                  <motion.input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    onFocus={() => setFocusedIndex(i)}
                    onBlur={() => setFocusedIndex(-1)}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    style={{
                      width: '52px',
                      height: '60px',
                      borderRadius: '14px',
                      background: success 
                        ? 'rgba(16, 185, 129, 0.1)' 
                        : isFilled ? 'rgba(14,165,233,0.05)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${
                        success ? '#10B981' 
                        : isFocused ? '#0EA5E9' 
                        : isFilled ? 'rgba(14,165,233,0.5)' 
                        : 'rgba(255,255,255,0.12)'
                      }`,
                      fontSize: '24px',
                      textAlign: 'center',
                      fontFamily: "'Syne', sans-serif",
                      fontWeight: 600,
                      color: success ? '#10B981' : '#F8FAFC',
                      outline: 'none',
                      transition: 'all 0.2s',
                      boxShadow: success 
                        ? '0 0 16px rgba(16, 185, 129, 0.4)' 
                        : isFocused ? '0 0 16px rgba(14, 165, 233, 0.3)' : 'none',
                    }}
                  />
                )
              })}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleVerify}
              disabled={loading || success}
              style={{
                width: '100%', height: '52px',
                background: success ? '#10B981' : '#0EA5E9', 
                color: '#FFF',
                border: 'none', borderRadius: '14px',
                fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '16px',
                cursor: loading || success ? 'default' : 'pointer', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: success ? '0 0 24px rgba(16, 185, 129, 0.4)' : '0 0 24px rgba(14,165,233,0.4)',
                transition: 'all 0.3s ease',
                marginBottom: '24px'
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  Verifying...
                </>
              ) : success ? (
                'Verified!'
              ) : (
                'Verify Code'
              )}
            </button>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    marginBottom: '24px', padding: '12px 16px',
                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: '10px', color: '#FCA5A5', fontSize: '13px', textAlign: 'center'
                  }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {resendSuccess && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    marginBottom: '24px', padding: '12px 16px',
                    background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
                    borderRadius: '10px', color: '#86EFAC', fontSize: '13px', textAlign: 'center'
                  }}
                >
                  New OTP sent! Check your server console.
                </motion.div>
              )}
            </AnimatePresence>

            {/* Resend Section */}
            <div style={{ textAlign: 'center', fontSize: '14px', color: '#94A3B8', marginBottom: '32px' }}>
              Didn't receive a code? <br />
              <div style={{ marginTop: '8px' }}>
                {countdown > 0 ? (
                  <span>Resend in <strong style={{ color: '#F8FAFC' }}>{countdown}s</strong></span>
                ) : (
                  <button
                    onClick={handleResend}
                    style={{
                      background: 'none', border: 'none',
                      color: '#0EA5E9', fontWeight: 600, fontSize: '14px',
                      cursor: 'pointer', padding: 0, fontFamily: 'inherit'
                    }}
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </div>

            {/* Back Link */}
            <div style={{ textAlign: 'center' }}>
              <Link to="/register" style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                color: '#64748B', fontSize: '14px', textDecoration: 'none',
                transition: 'color 0.2s'
              }}>
                <ArrowLeft size={16} /> Back to register
              </Link>
            </div>
          </>
        )}
      </motion.div>

      {/* Style Animations */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(14,165,233,0.4); }
          50% { box-shadow: 0 0 40px rgba(14,165,233,0.8); }
        }
      `}</style>
    </div>
  )
}
