import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Wallet, Shield, Check, Users, ShieldCheck, ChevronRight, Activity, Bell, FileText, ArrowRight, Home, CreditCard, LayoutDashboard, Bot, Settings, Loader2, TrendingUp, Star, X, ChevronDown } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import api from '../services/api'
import useAuthStore from '../store/authStore'

// ─── Floating Label Input ───────────────────────────────────────────────────
function FloatingInput({ label, type = 'text', value, onChange, error }) {
  const [focused, setFocused] = useState(false)
  const active = focused || value.toString().length > 0

  return (
    <div style={{ position: 'relative', marginBottom: '24px' }}>
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '16px',
        border: `1px solid ${error ? 'rgba(255,69,58,0.6)' : active ? 'rgba(62,173,255,0.50)' : 'rgba(255,255,255,0.12)'}`,
        pointerEvents: 'none', transition: 'border-color 0.2s ease',
        background: active ? 'rgba(62,173,255,0.04)' : 'transparent',
        boxShadow: active ? '0 0 0 3px rgba(62,173,255,0.10)' : 'none',
      }} />
      <label style={{
        position: 'absolute', left: '16px',
        top: active ? '0px' : '50%',
        transform: active ? 'translateY(-50%)' : 'translateY(-50%)',
        fontSize: active ? '10px' : '14px',
        color: active ? 'rgba(62,173,255,0.9)' : 'rgba(255,255,255,0.35)',
        background: active ? '#0a0d16' : 'transparent',
        padding: active ? '0 6px' : '0',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: 'none', zIndex: 2,
        fontFamily: 'inherit',
        letterSpacing: active ? '0.06em' : '0',
        textTransform: active ? 'uppercase' : 'none',
        fontWeight: active ? 600 : 400,
      }}>
        {label}
      </label>
      <input
        type={type} value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width: '100%', background: 'transparent', border: 'none', outline: 'none',
          color: 'rgba(255,255,255,0.92)', fontSize: '15px', padding: '18px 16px',
          fontFamily: 'inherit', position: 'relative', zIndex: 1, boxSizing: 'border-box',
          letterSpacing: '-0.01em',
        }}
      />
      {error && (
        <p style={{ color: 'rgba(255,69,58,0.9)', fontSize: '11px', marginTop: '6px', paddingLeft: '4px', position: 'absolute', bottom: '-18px' }}>
          {error}
        </p>
      )}
    </div>
  )
}

// ─── Floating Phone Input ────────────────────────────────────────────────────
function FloatingPhoneInput({ value, onChange, error }) {
  const [focused, setFocused] = useState(false)
  const active = focused || value.length > 0

  return (
    <div style={{ position: 'relative', marginBottom: '24px' }}>
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '16px',
        border: `1px solid ${error ? 'rgba(255,69,58,0.6)' : active ? 'rgba(62,173,255,0.50)' : 'rgba(255,255,255,0.12)'}`,
        pointerEvents: 'none', transition: 'border-color 0.2s ease',
        background: active ? 'rgba(62,173,255,0.04)' : 'transparent',
        boxShadow: active ? '0 0 0 3px rgba(62,173,255,0.10)' : 'none',
      }} />
      <label style={{
        position: 'absolute', left: '16px',
        top: active ? '0px' : '50%',
        transform: active ? 'translateY(-50%) translateY(-28px)' : 'translateY(-50%)',
        fontSize: active ? '10px' : '14px',
        color: active ? 'rgba(62,173,255,0.9)' : 'rgba(255,255,255,0.35)',
        background: active ? '#0a0d16' : 'transparent',
        padding: active ? '0 6px' : '0',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: 'none', zIndex: 2, fontFamily: 'inherit',
        letterSpacing: active ? '0.06em' : '0', textTransform: active ? 'uppercase' : 'none',
        fontWeight: active ? 600 : 400,
      }}>
        Phone Number
      </label>
      <div style={{ display: 'flex', alignItems: 'center', padding: '18px 16px', gap: '10px' }}>
        {active && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, animation: 'fadeIn 0.2s ease' }}>
            <span style={{ color: 'rgba(255,255,255,0.88)', fontSize: '14px', fontFamily: 'inherit', fontWeight: 500 }}>🇰🇪 +254</span>
            <div style={{ width: '1px', height: '18px', background: 'rgba(255,255,255,0.15)' }} />
          </div>
        )}
        <input
          type="tel" value={value}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, '').slice(0, 9)
            onChange(val)
          }}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          placeholder={active ? '7XX XXX XXX' : ''}
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: 'rgba(255,255,255,0.92)', fontSize: '15px', fontFamily: 'inherit', padding: 0, zIndex: 1,
          }}
        />
      </div>
      {error && (
        <p style={{ color: 'rgba(255,69,58,0.9)', fontSize: '11px', marginTop: '4px', paddingLeft: '4px', position: 'absolute', bottom: '-18px' }}>{error}</p>
      )}
    </div>
  )
}

// ─── Animated Counter ────────────────────────────────────────────────────────
function AnimatedNumber({ value, prefix = '' }) {
  const [displayVal, setDisplayVal] = useState(0)
  useEffect(() => {
    let start = performance.now()
    const duration = 1200
    const numValue = Number(value) || 0
    if (numValue === 0) return setDisplayVal(0)
    const animate = (currentTime) => {
      const elapsed = currentTime - start
      const progress = Math.min(elapsed / duration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      setDisplayVal(Math.floor(easeOut * numValue))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [value])
  return <span>{prefix}{displayVal.toLocaleString()}</span>
}

// ─── Bottom Nav Items ─────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'chamas', label: 'Chamas', icon: Home },
  { id: 'contributions', label: 'Contrib', icon: Wallet },
  { id: 'loans', label: 'Loans', icon: CreditCard },
  { id: 'ai', label: 'AI', icon: Bot },
  { id: 'settings', label: 'Profile', icon: Settings },
]

// ─── Glass Modal Container ───────────────────────────────────────────────────
function GlassModal({ children, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(6, 9, 18, 0.65)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: 'spring', damping: 22, stiffness: 280 }}
        style={{
          position: 'relative',
          width: '420px',
          maxWidth: '92%',
          background: 'rgba(14, 18, 36, 0.82)',
          backdropFilter: 'blur(60px)',
          WebkitBackdropFilter: 'blur(60px)',
          borderRadius: '28px',
          padding: '36px',
          border: '1px solid rgba(255,255,255,0.14)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22), 0 32px 80px rgba(0,0,0,0.6), 0 8px 24px rgba(0,0,0,0.3)',
        }}
      >
        {/* Shimmer top line */}
        <div style={{
          position: 'absolute', top: 0, left: '20%', right: '20%', height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
          borderRadius: '28px 28px 0 0',
        }} />
        {children}
      </motion.div>
    </div>
  )
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────
export default function DashboardPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const [chamas, setChamas] = useState([])
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [activeNav, setActiveNav] = useState('dashboard')
  const [showCreateChama, setShowCreateChama] = useState(false)
  const [showContribute, setShowContribute] = useState(false)
  const [loading, setLoading] = useState(true)

  const [newChama, setNewChama] = useState({ name: '', description: '' })
  const [modalLoading, setModalLoading] = useState(false)
  const [contribData, setContribData] = useState({
    chamaId: '',
    amount: '',
    mpesaPhone: user?.phone?.replace('+254', '') || ''
  })
  const [contribSuccess, setContribSuccess] = useState('')

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [chamasRes, notifRes] = await Promise.all([
          api.get('/chamas').catch(() => ({ data: { chamas: [] } })),
          api.get('/notifications').catch(() => ({ data: { notifications: [], unreadCount: 0 } }))
        ])
        setChamas(chamasRes.data.chamas || [])
        setNotifications(notifRes.data.notifications || [])
        setUnreadCount(notifRes.data.unreadCount || 0)
      } catch (err) {
        console.error('Dashboard fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  const handleCreateChama = async () => {
    if (!newChama.name) return
    setModalLoading(true)
    try {
      await api.post('/chamas', newChama)
      const res = await api.get('/chamas')
      setChamas(res.data.chamas || [])
      setShowCreateChama(false)
      setNewChama({ name: '', description: '' })
    } catch (err) {
      console.error(err)
      alert('Error creating chama')
    } finally {
      setModalLoading(false)
    }
  }

  const handleContribute = async () => {
    if (!contribData.chamaId || !contribData.amount || !contribData.mpesaPhone) return
    setModalLoading(true)
    try {
      await api.post('/contributions/initiate', {
        chamaId: contribData.chamaId,
        amount: Number(contribData.amount),
        mpesaPhone: '+254' + contribData.mpesaPhone
      })
      setContribSuccess('Contribution initiated via M-Pesa. Please check your phone.')
      setTimeout(() => {
        setShowContribute(false)
        setContribSuccess('')
        setContribData({ ...contribData, amount: '' })
      }, 3000)
    } catch (err) {
      console.error(err)
      alert('Error initiating contribution')
    } finally {
      setModalLoading(false)
    }
  }

  const handleSignOut = () => {
    logout()
    navigate('/')
  }

  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  const totalSavings = chamas.reduce((acc, c) => acc + (c.balance || 0), 0) + 125000
  const activeLoansCount = 2
  const creditScore = 740

  const statsData = [
    {
      label: 'Total Savings',
      val: totalSavings,
      pre: 'KES ',
      icon: TrendingUp,
      accentColor: '#30D158',
      glowColor: 'rgba(48,209,88,0.18)',
      borderColor: 'rgba(48,209,88,0.22)',
      iconBg: 'rgba(48,209,88,0.12)',
    },
    {
      label: 'Active Loans',
      val: activeLoansCount,
      pre: '',
      icon: CreditCard,
      accentColor: '#3EADFF',
      glowColor: 'rgba(62,173,255,0.18)',
      borderColor: 'rgba(62,173,255,0.22)',
      iconBg: 'rgba(62,173,255,0.12)',
    },
    {
      label: 'My Chamas',
      val: chamas.length,
      pre: '',
      icon: Users,
      accentColor: '#6E6AFF',
      glowColor: 'rgba(110,106,255,0.18)',
      borderColor: 'rgba(110,106,255,0.22)',
      iconBg: 'rgba(110,106,255,0.12)',
    },
    {
      label: 'Credit Score',
      val: creditScore,
      pre: '',
      icon: Star,
      accentColor: '#FFD60A',
      glowColor: 'rgba(255,214,10,0.15)',
      borderColor: 'rgba(255,214,10,0.22)',
      iconBg: 'rgba(255,214,10,0.10)',
    },
  ]

  const quickActions = [
    { label: 'Contribute', icon: Wallet, accentColor: '#30D158', glowColor: 'rgba(48,209,88,0.25)', action: () => setShowContribute(true) },
    { label: 'Request Loan', icon: CreditCard, accentColor: '#3EADFF', glowColor: 'rgba(62,173,255,0.25)', action: () => alert('Loans coming soon') },
    { label: 'Invite Member', icon: Users, accentColor: '#6E6AFF', glowColor: 'rgba(110,106,255,0.25)', action: () => alert('Invites coming soon') },
    { label: 'View Reports', icon: TrendingUp, accentColor: '#FFD60A', glowColor: 'rgba(255,214,10,0.20)', action: () => alert('Reports coming soon') },
  ]

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: 'var(--bg-base)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "DM Sans", sans-serif',
    }}>
      <div className="mesh-bg" />
      <Sidebar unreadCount={unreadCount} />

      <main
        className="main-content"
        style={{
          marginLeft: '240px',
          flex: 1,
          padding: '36px 40px',
          position: 'relative',
          zIndex: 1,
          overflowY: 'auto',
          minHeight: '100vh',
        }}
      >
        {/* ── Header ── */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '44px' }}>
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontSize: '30px',
                fontWeight: 700,
                color: 'rgba(255,255,255,0.95)',
                margin: '0 0 6px 0',
                letterSpacing: '-0.03em',
                lineHeight: 1.2,
              }}
            >
              Good morning, {user?.fullName?.split(' ')[0] || 'User'} 👋
            </motion.h1>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              style={{ color: 'rgba(255,255,255,0.38)', fontSize: '14px', letterSpacing: '-0.01em' }}
            >
              {todayStr}
            </motion.div>
          </div>

          {/* Notification button */}
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => navigate('/notifications')}
            style={{
              background: 'rgba(255,255,255,0.07)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              border: '1px solid rgba(255,255,255,0.14)',
              width: '46px', height: '46px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(255,255,255,0.8)',
              position: 'relative',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22), 0 4px 16px rgba(0,0,0,0.25)',
              transition: 'all 0.25s ease',
            }}
          >
            <Bell size={18} strokeWidth={1.8} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: '10px', right: '11px',
                width: '8px', height: '8px',
                background: '#FF453A',
                borderRadius: '50%',
                border: '2px solid var(--bg-base)',
                boxShadow: '0 0 8px rgba(255,69,58,0.7)',
              }} />
            )}
          </motion.button>
        </header>

        {/* ── Stats Grid ── */}
        <div
          className="stats-grid"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '44px' }}
        >
          {statsData.map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="glass-card"
                style={{
                  padding: '28px 24px',
                  borderColor: stat.borderColor,
                  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.22), 0 8px 32px ${stat.glowColor}, 0 4px 12px rgba(0,0,0,0.25)`,
                  cursor: 'default',
                }}
              >
                {/* Icon badge */}
                <div
                  className="stat-icon-ring"
                  style={{
                    width: '48px',
                    height: '48px',
                    background: stat.iconBg,
                    border: `1px solid ${stat.borderColor}`,
                    marginBottom: '22px',
                    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.18), 0 4px 12px ${stat.glowColor}`,
                  }}
                >
                  <Icon size={22} color={stat.accentColor} strokeWidth={2} />
                </div>

                {/* Value */}
                <div style={{
                  fontSize: '30px',
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.95)',
                  marginBottom: '5px',
                  letterSpacing: '-0.03em',
                  lineHeight: 1,
                }}>
                  <AnimatedNumber value={stat.val} prefix={stat.pre} />
                </div>

                {/* Label */}
                <div style={{
                  color: 'rgba(255,255,255,0.40)',
                  fontSize: '13px',
                  fontWeight: 500,
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase',
                }}>
                  {stat.label}
                </div>

                {/* Bottom accent line */}
                <div style={{
                  position: 'absolute',
                  bottom: 0, left: '20%', right: '20%',
                  height: '1px',
                  background: `linear-gradient(90deg, transparent, ${stat.accentColor}55, transparent)`,
                  borderRadius: '0 0 28px 28px',
                }} />
              </motion.div>
            )
          })}
        </div>

        {/* ── Content Grid: Chamas + Activity ── */}
        <div
          className="content-grid"
          style={{ display: 'grid', gridTemplateColumns: '7fr 4fr', gap: '28px', marginBottom: '44px' }}
        >
          {/* ── My Chamas ── */}
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{
                fontSize: '18px', fontWeight: 700,
                color: 'rgba(255,255,255,0.90)', margin: 0,
                letterSpacing: '-0.02em',
              }}>
                My Chamas
              </h2>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setShowCreateChama(true)}
                style={{
                  background: 'rgba(62,173,255,0.10)',
                  color: 'rgba(62,173,255,0.90)',
                  border: '1px solid rgba(62,173,255,0.25)',
                  padding: '8px 16px',
                  borderRadius: '22px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.14), 0 2px 8px rgba(62,173,255,0.12)',
                  letterSpacing: '-0.01em',
                }}
              >
                <Plus size={14} strokeWidth={2.5} /> New Chama
              </motion.button>
            </div>

            <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px', scrollbarWidth: 'none' }}>
              {chamas.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-card"
                  style={{
                    width: '100%',
                    padding: '52px 40px',
                    textAlign: 'center',
                    border: '1px dashed rgba(255,255,255,0.12)',
                    background: 'rgba(255,255,255,0.02)',
                  }}
                >
                  <div style={{
                    width: '64px', height: '64px',
                    borderRadius: '20px',
                    background: 'rgba(62,173,255,0.10)',
                    border: '1px solid rgba(62,173,255,0.20)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 20px',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 4px 16px rgba(62,173,255,0.15)',
                  }}>
                    <Users size={30} color="rgba(62,173,255,0.85)" strokeWidth={1.6} />
                  </div>
                  <h3 style={{
                    color: 'rgba(255,255,255,0.85)', fontSize: '17px',
                    margin: '0 0 8px 0', fontWeight: 700, letterSpacing: '-0.02em',
                  }}>
                    No chamas yet
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '14px', margin: '0 0 24px 0', lineHeight: 1.5 }}>
                    Create or join a group to start saving together.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setShowCreateChama(true)}
                    className="btn-primary"
                    style={{ padding: '11px 28px', borderRadius: '22px', fontSize: '14px' }}
                  >
                    Create your first chama
                  </motion.button>
                </motion.div>
              ) : (
                chamas.map((c, i) => (
                  <motion.div
                    key={c._id || i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08, type: 'spring', damping: 22, stiffness: 250 }}
                    className="glass-card"
                    style={{ minWidth: '260px', padding: '26px', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
                    onClick={() => navigate(`/chama/${c.chamaId?._id || c._id}`)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
                      <h3 style={{
                        fontSize: '16px', color: 'rgba(255,255,255,0.92)',
                        margin: 0, fontWeight: 700, letterSpacing: '-0.02em',
                      }}>
                        {c.name}
                      </h3>
                      <span
                        className="pill-badge"
                        style={{
                          background: 'rgba(110,106,255,0.12)',
                          color: 'rgba(110,106,255,0.90)',
                          border: '1px solid rgba(110,106,255,0.22)',
                        }}
                      >
                        Member
                      </span>
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>
                      Group Balance
                    </div>
                    <div style={{
                      color: 'rgba(62,173,255,0.92)', fontSize: '24px',
                      fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '22px',
                    }}>
                      KES {(c.balance || 0).toLocaleString()}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.38)', fontSize: '13px' }}>
                        <Users size={14} strokeWidth={1.8} /> {c.members?.length || 1} members
                      </div>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        color: 'rgba(255,255,255,0.60)', fontSize: '13px', fontWeight: 600,
                      }}>
                        View <ArrowRight size={13} />
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </section>

          {/* ── Recent Activity ── */}
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{
                fontSize: '18px', fontWeight: 700,
                color: 'rgba(255,255,255,0.90)', margin: 0,
                letterSpacing: '-0.02em',
              }}>
                Recent Activity
              </h2>
            </div>

            <div
              className="glass-card"
              style={{ padding: '22px', height: '340px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}
            >
              {/* Filter tabs */}
              <div style={{
                display: 'flex', gap: '4px',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
                paddingBottom: '16px', marginBottom: '18px',
              }}>
                {['All', 'Contributions', 'Loans'].map((tab, i) => (
                  <button
                    key={tab}
                    style={{
                      background: i === 0 ? 'rgba(255,255,255,0.08)' : 'transparent',
                      border: i === 0 ? '1px solid rgba(255,255,255,0.12)' : '1px solid transparent',
                      borderRadius: '20px',
                      padding: '4px 12px',
                      fontSize: '12px',
                      fontWeight: i === 0 ? 600 : 400,
                      color: i === 0 ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.35)',
                      cursor: 'pointer',
                      letterSpacing: '-0.01em',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {notifications.length === 0 ? (
                <div style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  flex: 1, gap: '14px',
                }}>
                  <div style={{
                    width: '52px', height: '52px', borderRadius: '16px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Activity size={24} color="rgba(255,255,255,0.20)" strokeWidth={1.5} />
                  </div>
                  <span style={{ color: 'rgba(255,255,255,0.28)', fontSize: '13px' }}>No recent activity</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {notifications.map((n, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}
                    >
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '12px',
                        background: 'rgba(48,209,88,0.10)',
                        border: '1px solid rgba(48,209,88,0.18)',
                        color: '#30D158',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)',
                      }}>
                        <Wallet size={16} strokeWidth={2} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: 'rgba(255,255,255,0.88)', fontSize: '13.5px', fontWeight: 600, marginBottom: '2px', letterSpacing: '-0.01em' }}>{n.title}</div>
                        <div style={{ color: 'rgba(255,255,255,0.40)', fontSize: '12.5px', marginBottom: '4px', lineHeight: 1.4 }}>{n.message}</div>
                        <div style={{ color: 'rgba(255,255,255,0.22)', fontSize: '11px' }}>2 hours ago</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* ── Quick Actions ── */}
        <section>
          <h2 style={{
            fontSize: '18px', fontWeight: 700,
            color: 'rgba(255,255,255,0.90)', margin: '0 0 20px 0',
            letterSpacing: '-0.02em',
          }}>
            Quick Actions
          </h2>
          <div
            className="quick-actions-grid"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}
          >
            {quickActions.map((action, i) => {
              const Icon = action.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.07, type: 'spring', damping: 20, stiffness: 260 }}
                  whileHover={{
                    y: -5,
                    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.25), 0 16px 40px ${action.glowColor}, 0 4px 16px rgba(0,0,0,0.3)`,
                    borderColor: `${action.accentColor}44`,
                  }}
                  whileTap={{ scale: 0.97 }}
                  onClick={action.action}
                  className="glass-card"
                  style={{
                    padding: '28px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    textAlign: 'center',
                    gap: '14px',
                  }}
                >
                  <div style={{
                    width: '52px', height: '52px',
                    borderRadius: '18px',
                    background: `${action.accentColor}14`,
                    border: `1px solid ${action.accentColor}28`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.18), 0 4px 16px ${action.glowColor}`,
                  }}>
                    <Icon size={24} color={action.accentColor} strokeWidth={1.8} />
                  </div>
                  <div style={{
                    color: 'rgba(255,255,255,0.82)',
                    fontSize: '14px',
                    fontWeight: 600,
                    letterSpacing: '-0.01em',
                  }}>
                    {action.label}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </section>
      </main>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="bottom-nav">
        {NAV_ITEMS.map((item) => {
          const isActive = activeNav === item.id
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              style={{
                background: 'transparent', border: 'none',
                color: isActive ? '#3EADFF' : 'rgba(255,255,255,0.30)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                padding: '10px', flex: 1, cursor: 'pointer',
                transition: 'color 0.2s ease',
              }}
            >
              <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
              <span style={{ fontSize: '10px', fontWeight: isActive ? 600 : 400, letterSpacing: '0.02em' }}>{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* ── Modals ── */}
      <AnimatePresence>
        {showCreateChama && (
          <GlassModal onClose={() => setShowCreateChama(false)}>
            <button
              onClick={() => setShowCreateChama(false)}
              style={{
                position: 'absolute', top: '20px', right: '20px',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                width: '32px', height: '32px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'rgba(255,255,255,0.55)',
                backdropFilter: 'blur(20px)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.16)',
                transition: 'all 0.2s ease',
              }}
            >
              <X size={15} />
            </button>
            <h2 style={{
              fontSize: '22px', color: 'rgba(255,255,255,0.95)',
              margin: '0 0 28px 0', fontWeight: 700, letterSpacing: '-0.02em',
            }}>
              Create New Chama
            </h2>
            <FloatingInput
              label="Chama Name"
              value={newChama.name}
              onChange={(e) => setNewChama({ ...newChama, name: e.target.value })}
            />
            <FloatingInput
              label="Description"
              value={newChama.description}
              onChange={(e) => setNewChama({ ...newChama, description: e.target.value })}
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              disabled={modalLoading}
              onClick={handleCreateChama}
              className="btn-primary"
              style={{
                width: '100%', height: '54px',
                borderRadius: '16px',
                fontSize: '15px', fontWeight: 700,
                marginTop: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {modalLoading
                ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                : 'Create Chama'}
            </motion.button>
          </GlassModal>
        )}

        {showContribute && (
          <GlassModal onClose={() => setShowContribute(false)}>
            <button
              onClick={() => setShowContribute(false)}
              style={{
                position: 'absolute', top: '20px', right: '20px',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                width: '32px', height: '32px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'rgba(255,255,255,0.55)',
                backdropFilter: 'blur(20px)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.16)',
                transition: 'all 0.2s ease',
              }}
            >
              <X size={15} />
            </button>
            <h2 style={{
              fontSize: '22px', color: 'rgba(255,255,255,0.95)',
              margin: '0 0 28px 0', fontWeight: 700, letterSpacing: '-0.02em',
            }}>
              Make Contribution
            </h2>

            <div style={{ position: 'relative', marginBottom: '24px' }}>
              <select
                value={contribData.chamaId}
                onChange={(e) => setContribData({ ...contribData, chamaId: e.target.value })}
                style={{
                  width: '100%', height: '58px',
                  background: 'rgba(255,255,255,0.06)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.14)',
                  borderRadius: '16px',
                  color: contribData.chamaId ? 'rgba(255,255,255,0.90)' : 'rgba(255,255,255,0.35)',
                  padding: '0 44px 0 16px',
                  fontSize: '15px', outline: 'none', appearance: 'none',
                  fontFamily: 'inherit',
                  letterSpacing: '-0.01em',
                }}
              >
                <option value="" disabled style={{ background: '#0a0d16' }}>Select Chama...</option>
                {chamas.map(c => (
                  <option key={c._id} value={c._id} style={{ background: '#0a0d16' }}>{c.name}</option>
                ))}
              </select>
              <ChevronDown size={16} style={{ position: 'absolute', right: '16px', top: '21px', color: 'rgba(255,255,255,0.35)', pointerEvents: 'none' }} />
            </div>

            <FloatingInput
              label="Amount (KES)"
              type="number"
              value={contribData.amount}
              onChange={(e) => setContribData({ ...contribData, amount: e.target.value })}
            />
            <FloatingPhoneInput
              value={contribData.mpesaPhone}
              onChange={(val) => setContribData({ ...contribData, mpesaPhone: val })}
            />

            {contribSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  padding: '14px 16px',
                  background: 'rgba(48,209,88,0.10)',
                  border: '1px solid rgba(48,209,88,0.25)',
                  borderRadius: '14px',
                  color: '#30D158',
                  fontSize: '13.5px',
                  textAlign: 'center',
                  marginBottom: '16px',
                  boxShadow: 'inset 0 1px 0 rgba(48,209,88,0.15)',
                }}
              >
                {contribSuccess}
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              disabled={modalLoading || !!contribSuccess}
              onClick={handleContribute}
              style={{
                width: '100%', height: '54px',
                background: 'linear-gradient(160deg, rgba(48,209,88,0.82) 0%, rgba(48,209,88,0.62) 100%)',
                color: 'rgba(255,255,255,0.95)',
                border: '1px solid rgba(48,209,88,0.40)',
                borderRadius: '16px',
                fontFamily: 'inherit',
                fontSize: '15px', fontWeight: 700,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(20px)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 0 24px rgba(48,209,88,0.20)',
                letterSpacing: '-0.01em',
                transition: 'all 0.25s ease',
              }}
            >
              {modalLoading
                ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                : 'Contribute KES'}
            </motion.button>
          </GlassModal>
        )}
      </AnimatePresence>
    </div>
  )
}
