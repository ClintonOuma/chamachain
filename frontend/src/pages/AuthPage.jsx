import { useState, useCallback, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Loader2, X, CheckCircle2, XCircle } from 'lucide-react'
import api from '../services/api'
import useAuthStore from '../store/authStore'
import usePageTitle from '../hooks/usePageTitle'

const getApiOrigin = () => {
  const fromVite = import.meta.env.VITE_API_URL
  if (fromVite) return fromVite.replace(/\/$/, '')
  if (typeof window !== 'undefined' && window.__RUNTIME_CONFIG__?.VITE_API_URL) {
    return window.__RUNTIME_CONFIG__.VITE_API_URL.replace(/\/$/, '')
  }
  return ''
}

// Reusable SVG for Google Icon
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

// Floating Input Component
function FloatingInput({ label, type = 'text', value, onChange, onBlur, error, rightElement }) {
  const [focused, setFocused] = useState(false)
  const active = focused || value.length > 0

  return (
    <div style={{ position: 'relative', marginBottom: '4px' }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '14px',
        border: `1px solid ${error ? '#EF4444' : active ? '#0EA5E9' : 'rgba(255,255,255,0.12)'}`,
        pointerEvents: 'none',
        transition: 'border-color 0.2s ease'
      }} />

      <label style={{
        position: 'absolute',
        left: '14px',
        top: active ? '0px' : '50%',
        transform: active ? 'translateY(-50%)' : 'translateY(-50%)',
        fontSize: active ? '11px' : '15px',
        color: active ? '#0EA5E9' : '#64748B',
        background: active ? 'rgba(10, 10, 15, 0.95)' : 'transparent',
        padding: active ? '0 6px' : '0',
        transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: 'none',
        zIndex: 2,
        fontFamily: 'DM Sans, sans-serif',
        letterSpacing: active ? '0.05em' : '0',
        textTransform: active ? 'uppercase' : 'none'
      }}>
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={(e) => {
          setFocused(false);
          if (onBlur) onBlur(e);
        }}
        style={{
          width: '100%',
          background: 'transparent',
          border: 'none',
          outline: 'none',
          color: '#F8FAFC',
          fontSize: '15px',
          padding: '16px 16px',
          fontFamily: 'DM Sans, sans-serif',
          paddingRight: rightElement ? '48px' : '16px',
          position: 'relative',
          zIndex: 1,
          boxSizing: 'border-box'
        }}
      />

      {rightElement && (
        <div style={{
          position: 'absolute',
          right: '14px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 3,
          cursor: 'pointer',
          color: '#64748B',
          display: 'flex',
          alignItems: 'center'
        }}>
          {rightElement}
        </div>
      )}

      {error && (
        <p style={{
          color: '#EF4444',
          fontSize: '11px',
          marginTop: '4px',
          paddingLeft: '4px',
          fontFamily: 'DM Sans'
        }}>{error}</p>
      )}
    </div>
  )
}

// Floating Phone Input Component
function FloatingPhoneInput({ value, onChange, onBlur, error }) {
  const [focused, setFocused] = useState(false)
  const active = focused || value.length > 0

  return (
    <div style={{ position: 'relative', marginBottom: '4px' }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '14px',
        border: `1px solid ${error ? '#EF4444' : active ? '#0EA5E9' : 'rgba(255,255,255,0.12)'}`,
        pointerEvents: 'none',
        transition: 'border-color 0.2s ease'
      }} />

      <label style={{
        position: 'absolute',
        left: '14px',
        top: '50%',
        transform: active ? 'translateY(-50%) translateY(-26px)' : 'translateY(-50%)',
        fontSize: active ? '11px' : '15px',
        color: active ? '#0EA5E9' : '#64748B',
        background: active ? 'rgba(10, 10, 15, 0.95)' : 'transparent',
        padding: active ? '0 6px' : '0',
        transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: 'none',
        zIndex: 2,
        fontFamily: 'DM Sans, sans-serif',
        letterSpacing: active ? '0.05em' : '0',
        textTransform: active ? 'uppercase' : 'none'
      }}>
        Phone Number
      </label>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '16px',
        gap: '8px'
      }}>
        {active && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexShrink: 0,
          }}>
            <span style={{
              color: '#F8FAFC',
              fontSize: '15px',
              fontFamily: 'DM Sans',
              fontWeight: 500
            }}>+254</span>
            <div style={{
              width: '1px',
              height: '18px',
              background: 'rgba(255,255,255,0.2)'
            }} />
          </div>
        )}

        <input
          type="tel"
          value={value}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, '').slice(0, 9)
            onChange(val)
          }}
          onFocus={() => setFocused(true)}
          onBlur={(e) => {
            setFocused(false)
            if (onBlur) onBlur(e)
          }}
          placeholder={active ? '7XX XXX XXX' : ''}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#F8FAFC',
            fontSize: '15px',
            fontFamily: 'DM Sans, sans-serif',
            padding: 0,
            zIndex: 1
          }}
        />
      </div>

      {error && (
        <p style={{
          color: '#EF4444',
          fontSize: '11px',
          marginTop: '4px',
          paddingLeft: '4px',
          fontFamily: 'DM Sans'
        }}>{error}</p>
      )}
    </div>
  )
}

function getPwStrength(pw) {
  if (!pw) return { level: 0, text: '', color: '#334155' }
  const hasLen = pw.length >= 8
  const hasUpper = /[A-Z]/.test(pw)
  const hasNum = /[0-9]/.test(pw)
  const hasSpec = /[^a-zA-Z0-9]/.test(pw)
  const score = Number(hasLen) + Number(hasUpper) + Number(hasNum) + Number(hasSpec)

  if (score === 1) return { level: 1, text: 'Weak', color: '#EF4444' }
  if (score === 2) return { level: 2, text: 'Fair', color: '#F97316' }
  if (score === 3) return { level: 3, text: 'Good', color: '#EAB308' }
  if (score === 4) return { level: 4, text: 'Strong', color: '#10B981' }
  return { level: 0, text: '', color: '#334155' }
}

// Login Form Component
function LoginForm({ onSuccess, setError, error }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [emailError, setEmailError] = useState('')

  const validateEmail = (val) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (val.length > 0 && !re.test(val)) {
      setEmailError('Please enter a valid email address')
      return false
    }
    setEmailError('')
    return true
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/login', { email, password })
      const { accessToken, refreshToken, user } = res.data
      onSuccess(user, accessToken, refreshToken)
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
        <FloatingInput
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => validateEmail(email)}
          error={emailError}
        />

        <FloatingInput
          label="Password"
          type={showPw ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: 0 }}
            >
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%', height: '52px',
          background: '#0EA5E9', color: '#FFF',
          border: 'none', borderRadius: '14px',
          fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '16px',
          cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          boxShadow: '0 0 24px rgba(14,165,233,0.4)',
          opacity: loading ? 0.7 : 1,
          transition: 'opacity 0.2s ease, transform 0.2s ease',
        }}
      >
        {loading ? <Loader2 size={18} className="spin" /> : 'Sign In'}
      </button>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: '16px', padding: '10px 16px',
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '10px', color: '#FCA5A5', fontSize: '13px', textAlign: 'center'
          }}
        >
          {error}
        </motion.div>
      )}
    </form>
  )
}

// Register Form Component
function RegisterForm({ onSuccess, setError, error }) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [showCf, setShowCf] = useState(false)
  const [loading, setLoading] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [phoneError, setPhoneError] = useState('')

  const validateEmail = (val) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (val.length > 0 && !re.test(val)) {
      setEmailError('Please enter a valid email address')
      return false
    }
    setEmailError('')
    return true
  }

  const validatePhone = (val) => {
    if (val.length > 0 && !/^\d{9}$/.test(val)) {
      setPhoneError('Please enter 9 digits')
      return false
    }
    setPhoneError('')
    return true
  }

  const strength = getPwStrength(password)
  const pwMatch = confirm && confirm === password
  const pwMismatch = confirm && confirm !== password

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!fullName || !email || !phone || !password || !confirm) {
      setError('Please fill in all fields')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/register', {
        fullName,
        email,
        phone: '+254' + phone,
        password
      })
      const { accessToken, refreshToken, user } = res.data
      onSuccess(user, accessToken, refreshToken)
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleRegister}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
        <FloatingInput
          label="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <FloatingInput
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => validateEmail(email)}
          error={emailError}
        />

        <FloatingPhoneInput
          value={phone}
          onChange={(val) => setPhone(val)}
          onBlur={() => validatePhone(phone)}
          error={phoneError}
        />

        <div>
          <FloatingInput
            label="Password"
            type={showPw ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: 0 }}
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
          />
          
          {password && (
            <div style={{ marginTop: '8px', padding: '0 4px' }}>
              <div style={{ display: 'flex', gap: '6px', height: '4px', marginBottom: '4px' }}>
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      borderRadius: '2px',
                      background: i < strength.level ? strength.color : 'rgba(255,255,255,0.08)',
                      transition: 'background 0.2s ease'
                    }}
                  />
                ))}
              </div>
              <div style={{ fontSize: '11px', color: strength.color, fontWeight: 500 }}>
                {strength.text}
              </div>
            </div>
          )}
        </div>

        <FloatingInput
          label="Confirm Password"
          type={showCf ? 'text' : 'password'}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          rightElement={
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {pwMatch && <CheckCircle2 size={16} color="#10B981" />}
              {pwMismatch && <XCircle size={16} color="#EF4444" />}
              <button
                type="button"
                onClick={() => setShowCf(!showCf)}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: 0 }}
              >
                {showCf ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          }
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%', height: '52px',
          background: '#0EA5E9', color: '#FFF',
          border: 'none', borderRadius: '14px',
          fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '16px',
          cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          boxShadow: '0 0 24px rgba(14,165,233,0.4)',
          opacity: loading ? 0.7 : 1,
          transition: 'opacity 0.2s ease, transform 0.2s ease',
        }}
      >
        {loading ? <Loader2 size={18} className="spin" /> : 'Create Account'}
      </button>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: '16px', padding: '10px 16px',
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '10px', color: '#FCA5A5', fontSize: '13px', textAlign: 'center'
          }}
        >
          {error}
        </motion.div>
      )}
    </form>
  )
}

// Main Auth Page Component
export default function AuthPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setAuth } = useAuthStore()
  
  // Determine active tab from URL
  const isLogin = location.pathname === '/login'
   usePageTitle(isLogin ? 'Sign In' : 'Create Account')
   const [activeTab, setActiveTab] = useState(isLogin ? 'login' : 'register')
   const [error, setError] = useState('')
 
   // Sync tab with URL changes (e.g. browser back button)
   useEffect(() => {
     const tab = location.pathname === '/login' ? 'login' : 'register'
     setActiveTab(tab)
     setError('')
   }, [location.pathname])
 
   // Sync tab with URL changes
   const switchTab = useCallback((tab) => {
     setActiveTab(tab)
     setError('')
     // Update URL without full page navigation
     navigate(tab === 'login' ? '/login' : '/register', { replace: true })
   }, [navigate])

  const handleSuccess = useCallback((user, accessToken, refreshToken) => {
    setAuth(user, accessToken, refreshToken)
    navigate('/dashboard')
  }, [setAuth, navigate])

  // Direction for slide animation
  const direction = activeTab === 'login' ? -1 : 1

  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir) => ({
      x: dir > 0 ? -300 : 300,
      opacity: 0,
    }),
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #000000 0%, #0a0a0f 40%, #08080c 70%, #000000 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif",
      position: 'relative',
      padding: '40px 20px',
    }}>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          position: 'relative', zIndex: 10,
          width: '440px', maxWidth: '100%',
          background: 'rgba(15, 15, 20, 0.85)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '28px',
          padding: '48px 40px',
          boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
          overflow: 'hidden',
        }}
      >
        {/* Close Button */}
        <button
          onClick={() => navigate('/')}
          style={{ 
            position: 'absolute', top: '24px', right: '24px', 
            background: 'none', border: 'none', color: '#64748B', 
            cursor: 'pointer', zIndex: 20,
            padding: '4px',
            borderRadius: '8px',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
        >
          <X size={20} />
        </button>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#0EA5E9', fontSize: '18px' }}>&#9672;</span>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '18px', color: '#F8FAFC' }}>ChamaChain</span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ 
          display: 'flex', 
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          marginBottom: '32px',
          position: 'relative',
        }}>
          <button
            onClick={() => switchTab('login')}
            style={{
              flex: 1, padding: '12px 0', textAlign: 'center',
              background: 'none', border: 'none',
              color: activeTab === 'login' ? '#FFF' : '#64748B', 
              fontWeight: activeTab === 'login' ? 600 : 500, 
              fontSize: '15px',
              cursor: 'pointer',
              transition: 'color 0.2s',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => switchTab('register')}
            style={{
              flex: 1, padding: '12px 0', textAlign: 'center',
              background: 'none', border: 'none',
              color: activeTab === 'register' ? '#FFF' : '#64748B', 
              fontWeight: activeTab === 'register' ? 600 : 500, 
              fontSize: '15px',
              cursor: 'pointer',
              transition: 'color 0.2s',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Join
          </button>
          
          {/* Animated underline */}
          <motion.div
            layoutId="tab-underline"
            style={{
              position: 'absolute',
              bottom: '-1px',
              left: activeTab === 'login' ? '0%' : '50%',
              width: '50%',
              height: '2px',
              background: '#0EA5E9',
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
          />
        </div>

        {/* Form Container with slide animation */}
        <div style={{ position: 'relative', minHeight: activeTab === 'login' ? '220px' : '420px', transition: 'min-height 0.3s ease' }}>
          <AnimatePresence mode="wait" custom={direction}>
            {activeTab === 'login' ? (
              <motion.div
                key="login"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 400, damping: 35, mass: 0.8 }}
                style={{ position: 'absolute', width: '100%' }}
              >
                <LoginForm onSuccess={handleSuccess} setError={setError} error={error} />
              </motion.div>
            ) : (
              <motion.div
                key="register"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 400, damping: 35, mass: 0.8 }}
                style={{ position: 'absolute', width: '100%' }}
              >
                <RegisterForm onSuccess={handleSuccess} setError={setError} error={error} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '32px 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
          <span style={{ padding: '0 16px', color: '#64748B', fontSize: '13px' }}>or continue with</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
        </div>

        {/* Google Button */}
        <button
          onClick={() => {
            const apiOrigin = getApiOrigin() || window.location.origin
            window.location.href = `${apiOrigin}/api/v1/auth/google`
          }}
          style={{
            width: '100%', height: '52px',
            background: '#1e1c2e', border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '14px', color: '#F8FAFC',
            fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: '15px',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#252238'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#1e1c2e'}
        >
          <GoogleIcon />
          Continue with Google
        </button>
      </motion.div>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
