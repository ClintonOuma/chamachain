import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Wallet, Check, Users, ChevronRight, Activity, Bell, ArrowRight, Home, CreditCard, LayoutDashboard, Bot, Settings, Loader2, TrendingUp, Star, X, ChevronDown } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import api from '../services/api'
import useAuthStore from '../store/authStore'
import SkeletonCard from '../components/SkeletonCard'
import usePageTitle from '../hooks/usePageTitle'
import useMyRole from '../hooks/useMyRole'
import ContributeModal from '../components/ContributeModal'
import LoanModal from '../components/LoanModal'
import NotificationBell from '../components/NotificationBell'

// ═══════════════════════════════════════════════════════════════════════════
// FLOATING INPUT - Liquid Glass Style
// ═══════════════════════════════════════════════════════════════════════════
function FloatingInput({ label, type = 'text', value, onChange, error }) {
  const [focused, setFocused] = useState(false)
  const active = focused || value.toString().length > 0

  return (
    <div style={{ position: 'relative', marginBottom: '24px' }}>
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '14px',
        border: `1px solid ${error ? 'rgba(255,69,58,0.5)' : active ? 'rgba(74,195,255,0.45)' : 'rgba(255,255,255,0.15)'}`,
        pointerEvents: 'none', transition: 'all 0.25s ease',
        background: active ? 'rgba(74,195,255,0.05)' : 'rgba(255,255,255,0.06)',
        boxShadow: active 
          ? 'inset 0 0.5px 0 rgba(255,255,255,0.2), 0 0 0 3px rgba(74,195,255,0.12)' 
          : 'inset 0 0.5px 0 rgba(255,255,255,0.12)',
        backdropFilter: 'blur(14px)',
      }} />
      <label style={{
        position: 'absolute', left: '16px',
        top: active ? '0px' : '50%',
        transform: active ? 'translateY(-50%)' : 'translateY(-50%)',
        fontSize: active ? '10px' : '14px',
        color: active ? 'rgba(74,195,255,0.9)' : 'rgba(255,255,255,0.35)',
        background: active ? '#0a1628' : 'transparent',
        padding: active ? '0 6px' : '0',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: 'none', zIndex: 2,
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
          position: 'relative', zIndex: 1, boxSizing: 'border-box',
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

// ═══════════════════════════════════════════════════════════════════════════
// FLOATING PHONE INPUT
// ═══════════════════════════════════════════════════════════════════════════
function FloatingPhoneInput({ value, onChange, error }) {
  const [focused, setFocused] = useState(false)
  const active = focused || value.length > 0

  return (
    <div style={{ position: 'relative', marginBottom: '24px' }}>
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '14px',
        border: `1px solid ${error ? 'rgba(255,69,58,0.5)' : active ? 'rgba(74,195,255,0.45)' : 'rgba(255,255,255,0.15)'}`,
        pointerEvents: 'none', transition: 'all 0.25s ease',
        background: active ? 'rgba(74,195,255,0.05)' : 'rgba(255,255,255,0.06)',
        boxShadow: active 
          ? 'inset 0 0.5px 0 rgba(255,255,255,0.2), 0 0 0 3px rgba(74,195,255,0.12)' 
          : 'inset 0 0.5px 0 rgba(255,255,255,0.12)',
        backdropFilter: 'blur(14px)',
      }} />
      <label style={{
        position: 'absolute', left: '16px',
        top: active ? '0px' : '50%',
        transform: active ? 'translateY(-50%) translateY(-28px)' : 'translateY(-50%)',
        fontSize: active ? '10px' : '14px',
        color: active ? 'rgba(74,195,255,0.9)' : 'rgba(255,255,255,0.35)',
        background: active ? '#0a1628' : 'transparent',
        padding: active ? '0 6px' : '0',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: 'none', zIndex: 2,
        letterSpacing: active ? '0.06em' : '0', textTransform: active ? 'uppercase' : 'none',
        fontWeight: active ? 600 : 400,
      }}>
        Phone Number
      </label>
      <div style={{ display: 'flex', alignItems: 'center', padding: '18px 16px', gap: '10px' }}>
        {active && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, animation: 'fadeIn 0.2s ease' }}>
            <span style={{ color: 'rgba(255,255,255,0.88)', fontSize: '14px', fontWeight: 500 }}>+254</span>
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
            color: 'rgba(255,255,255,0.92)', fontSize: '15px', padding: 0, zIndex: 1,
          }}
        />
      </div>
      {error && (
        <p style={{ color: 'rgba(255,69,58,0.9)', fontSize: '11px', marginTop: '4px', paddingLeft: '4px', position: 'absolute', bottom: '-18px' }}>{error}</p>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATED NUMBER
// ═══════════════════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════════════════
// BOTTOM NAV ITEMS
// ═══════════════════════════════════════════════════════════════════════════
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'chamas', label: 'Chamas', icon: Home },
  { id: 'contributions', label: 'Contrib', icon: Wallet },
  { id: 'loans', label: 'Loans', icon: CreditCard },
  { id: 'ai', label: 'AI', icon: Bot },
  { id: 'settings', label: 'Profile', icon: Settings },
]

// ═══════════════════════════════════════════════════════════════════════════
// LIQUID GLASS MODAL
// Apple-style modal with exact blur/translucency specs
// ═══════════════════════════════════════════════════════════════════════════
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
          background: 'rgba(10, 22, 40, 0.6)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
        }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        style={{
          position: 'relative',
          width: '420px',
          maxWidth: '92%',
          // Translucency 50%, Dark 42%
          background: 'rgba(15, 30, 55, 0.78)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderRadius: '24px',
          padding: '36px',
          border: '1px solid rgba(255,255,255,0.18)',
          boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,0.35), 0 32px 80px rgba(0,0,0,0.45), 0 8px 24px rgba(0,0,0,0.25)',
        }}
      >
        {/* Specular top highlight */}
        <div style={{
          position: 'absolute', top: 0, left: '15%', right: '15%', height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
          borderRadius: '24px 24px 0 0',
        }} />
        {children}
      </motion.div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════
export default function DashboardPage() {
  usePageTitle('Dashboard')
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { isAdmin } = useMyRole()

  const [chamas, setChamas] = useState([])
  const [notifications, setNotifications] = useState([])
  const [totalSavings, setTotalSavings] = useState(0)
  const [activeLoansCount, setActiveLoansCount] = useState(0)
  const [activeNav, setActiveNav] = useState('dashboard')
  const [showCreateChama, setShowCreateChama] = useState(false)
  const [showContribute, setShowContribute] = useState(false)
  const [showLoan, setShowLoan] = useState(false)
  const [membership, setMembership] = useState(null)
  const [selectedChamaForAction, setSelectedChamaForAction] = useState(null)
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
      setLoading(true)
      try {
        const [chamasRes, notifRes] = await Promise.all([
          api.get('/chamas'),
          api.get('/notifications')
        ])
        const chamaList = chamasRes.data.chamas || []
        setChamas(chamaList)
        setNotifications(notifRes.data.notifications || [])
        setUnreadCount(notifRes.data.unreadCount || 0)

        // Calculate total savings across all chamas
        const total = chamaList.reduce((sum, item) => {
          const chama = item.chamaId || item
          return sum + (chama.totalBalance || 0)
        }, 0)
        setTotalSavings(total)

        // Fetch loans and membership if chamas exist
        if (chamaList.length > 0) {
          const firstChama = chamaList[0]
          const firstChamaId = firstChama.chamaId?._id || firstChama._id
          try {
            const [loansRes, membershipRes] = await Promise.all([
              api.get(`/loans/${firstChamaId}/my`),
              api.get(`/chamas/${firstChamaId}/membership`) // Assuming this endpoint exists
            ])
            const activeLoans = (loansRes.data.loans || []).filter(l => l.status === 'disbursed')
            setActiveLoansCount(activeLoans.length)
            setMembership(membershipRes.data)
          } catch (e) {
            setActiveLoansCount(0)
            console.error('Error fetching loans or membership:', e)
          }
        }
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

  const todayStr = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date())

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const creditScore = 'N/A'

  // Stats - clean design without glow
  const statsData = [
    { label: 'Total Savings', val: totalSavings, pre: 'KES ', icon: TrendingUp, accentColor: '#32d74b' },
    { label: 'Active Loans', val: activeLoansCount, pre: '', icon: CreditCard, accentColor: '#4ac3ff' },
    { label: 'My Chamas', val: chamas.length, pre: '', icon: Users, accentColor: '#5e5ce6' },
    { label: 'Credit Score', val: creditScore, pre: '', icon: Star, accentColor: '#ffd60a' },
  ]

  const quickActions = [
    { label: 'Contribute', icon: Wallet, accentColor: '#32d74b', glowColor: 'rgba(50,215,75,0.20)', action: () => {
      if (chamas.length === 0) return alert('Join a chama first')
      const firstChama = chamas[0]
      setSelectedChamaForAction({
        id: firstChama.chamaId?._id || firstChama._id,
        name: firstChama.chamaId?.name || firstChama.name
      })
      setShowContribute(true)
    } },
    { label: 'Request Loan', icon: CreditCard, accentColor: '#4ac3ff', glowColor: 'rgba(74,195,255,0.20)', action: () => {
      if (chamas.length === 0) return alert('Join a chama first')
      const firstChama = chamas[0]
      setSelectedChamaForAction({
        id: firstChama.chamaId?._id || firstChama._id,
        name: firstChama.chamaId?.name || firstChama.name
      })
      setShowLoan(true)
    } },
    { label: 'Invite Member', icon: Users, accentColor: '#5e5ce6', glowColor: 'rgba(94,92,230,0.20)', action: () => alert('Invites coming soon') },
    { label: 'View Reports', icon: TrendingUp, accentColor: '#ffd60a', glowColor: 'rgba(255,214,10,0.15)', action: () => alert('Reports coming soon') },
  ]

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
    }}>
      <div className="mesh-bg" />
      <Sidebar unreadCount={unreadCount} />

      <main
        className="main-content"
        style={{
          marginLeft: '240px',
          flex: 1,
          padding: '32px',
          paddingBottom: '100px', // Added space for mobile bottom nav
          position: 'relative',
          zIndex: 1,
          overflowY: 'auto',
          minHeight: '100vh',
          boxSizing: 'border-box', // Ensure padding doesn't affect layout
        }}
      >
        {/* Header */}
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
              {getGreeting()}, {user?.fullName?.split(' ')[0] || 'User'}
            </motion.h1>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              style={{ color: 'rgba(255,255,255,0.40)', fontSize: '14px', letterSpacing: '-0.01em' }}
            >
              {todayStr}
            </motion.div>
          </div>

          {/* Notification button - Liquid glass circle */}
          <NotificationBell />
        </header>

        {/* Stats Grid */}
        {loading ? ( 
          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '44px' }}> 
            {[1,2,3,4].map(i => <SkeletonCard key={i} height={160} />)} 
          </div> 
        ) : (
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
                    boxShadow: `inset 0 0.5px 0 rgba(255,255,255,0.35), 0 8px 32px ${stat.glowColor}, 0 4px 12px rgba(0,0,0,0.2)`,
                    cursor: 'default',
                  }}
                >
                  {/* Icon badge with liquid glass */}
                  <div
                    className="stat-icon-ring"
                    style={{
                      width: '48px',
                      height: '48px',
                      background: stat.iconBg,
                      border: `1px solid ${stat.borderColor}`,
                      marginBottom: '22px',
                      boxShadow: `inset 0 0.5px 0 rgba(255,255,255,0.25), 0 4px 12px ${stat.glowColor}`,
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
                    {stat.label === 'Total Savings' ? `KES ${totalSavings.toLocaleString()}` : 
                     stat.label === 'Active Loans' ? `${activeLoansCount}` : 
                     stat.label === 'My Chamas' ? `${chamas.length}` : 
                     stat.label === 'Credit Score' ? 'N/A' : 
                     <AnimatedNumber value={stat.val} prefix={stat.pre} />}
                  </div>

                  {/* Label */}
                  <div style={{
                    color: 'rgba(255,255,255,0.42)',
                    fontSize: '13px',
                    fontWeight: 500,
                    letterSpacing: '0.02em',
                    textTransform: 'uppercase',
                  }}>
                    {stat.label}
                  </div>

                  {/* Bottom accent glow line */}
                  <div style={{
                    position: 'absolute',
                    bottom: 0, left: '20%', right: '20%',
                    height: '1px',
                    background: `linear-gradient(90deg, transparent, ${stat.accentColor}55, transparent)`,
                    borderRadius: '0 0 24px 24px',
                  }} />
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Content Grid */}
        <div
          className="content-grid"
          style={{ display: 'grid', gridTemplateColumns: '7fr 4fr', gap: '28px', marginBottom: '44px' }}
        >
          {/* My Chamas */}
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
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowCreateChama(true)}
                style={{
                  background: 'rgba(74,195,255,0.12)',
                  color: 'rgba(74,195,255,0.90)',
                  border: '1px solid rgba(74,195,255,0.25)',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backdropFilter: 'blur(14px)',
                  WebkitBackdropFilter: 'blur(14px)',
                  boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,0.18), 0 2px 8px rgba(74,195,255,0.12)',
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
                    border: '1px dashed rgba(255,255,255,0.15)',
                    background: 'rgba(255,255,255,0.03)',
                  }}
                >
                  <div style={{
                    width: '64px', height: '64px',
                    borderRadius: '18px',
                    background: 'rgba(74,195,255,0.10)',
                    border: '1px solid rgba(74,195,255,0.22)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 20px',
                    boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,0.25), 0 4px 16px rgba(74,195,255,0.12)',
                  }}>
                    <Users size={30} color="rgba(74,195,255,0.85)" strokeWidth={1.6} />
                  </div>
                  <h3 style={{
                    color: 'rgba(255,255,255,0.85)', fontSize: '17px',
                    margin: '0 0 8px 0', fontWeight: 700, letterSpacing: '-0.02em',
                  }}>
                    No chamas yet
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,0.40)', fontSize: '14px', margin: '0 0 24px 0', lineHeight: 1.5 }}>
                    Create or join a group to start saving together.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowCreateChama(true)}
                    className="btn-primary"
                    style={{ padding: '11px 28px', borderRadius: '22px', fontSize: '14px' }}
                  >
                    Create your first chama
                  </motion.button>
                </motion.div>
              ) : (
                chamas.map((item, i) => {
                  const chamaId = item.chamaId?._id || item._id
                  const chamaData = item.chamaId || item
                  return (
                    <motion.div
                      key={chamaId || i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08, type: 'spring', damping: 22, stiffness: 250 }}
                      className="glass-card"
                      style={{ minWidth: '260px', padding: '26px', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
                      onClick={() => navigate(`/chama/${chamaId}`)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
                        <h3 style={{
                          fontSize: '16px', color: 'rgba(255,255,255,0.92)',
                          margin: 0, fontWeight: 700, letterSpacing: '-0.02em',
                        }}>
                          {chamaData.name}
                        </h3>
                        <span
                          className="pill-badge"
                          style={{
                            background: 'rgba(94,92,230,0.12)',
                            color: 'rgba(94,92,230,0.90)',
                            border: '1px solid rgba(94,92,230,0.25)',
                          }}
                        >
                          {item.role || 'Member'}
                        </span>
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: '12px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>
                        Group Balance
                      </div>
                      <div style={{
                        color: 'rgba(74,195,255,0.92)', fontSize: '24px',
                        fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '22px',
                      }}>
                        KES {(chamaData.totalBalance || 0).toLocaleString()}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.40)', fontSize: '13px' }}>
                          <Users size={14} strokeWidth={1.8} /> {chamaData.members?.length || 1} members
                        </div>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: '4px',
                          color: 'rgba(255,255,255,0.60)', fontSize: '13px', fontWeight: 600,
                        }}>
                          View <ArrowRight size={13} />
                        </div>
                      </div>
                    </motion.div>
                  )
                })
              )}
            </div>
          </section>

          {/* Recent Activity */}
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
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                paddingBottom: '16px', marginBottom: '18px',
              }}>
                {['All', 'Contributions', 'Loans'].map((tab, i) => (
                  <button
                    key={tab}
                    style={{
                      background: i === 0 ? 'rgba(255,255,255,0.10)' : 'transparent',
                      border: i === 0 ? '1px solid rgba(255,255,255,0.15)' : '1px solid transparent',
                      borderRadius: '20px',
                      padding: '5px 14px',
                      fontSize: '12px',
                      fontWeight: i === 0 ? 600 : 400,
                      color: i === 0 ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.38)',
                      cursor: 'pointer',
                      letterSpacing: '-0.01em',
                      transition: 'all 0.2s ease',
                      backdropFilter: 'blur(12px)',
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {notifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔔</div>
                  <p style={{ fontFamily: 'DM Sans' }}>No activity yet</p>
                </div>
              ) : (
                notifications.slice(0, 10).map((notif, i) => (
                  <div key={notif._id} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '14px 0',
                    borderBottom: i < notifications.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none'
                  }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                      background: notif.type === 'contribution' ? 'rgba(16,185,129,0.15)' : 
                                  notif.type === 'loan' ? 'rgba(14,165,233,0.15)' : 'rgba(139,92,246,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px'
                    }}>
                      {notif.type === 'contribution' ? '💸' : notif.type === 'loan' ? '🏛️' : '🔔'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontFamily: 'DM Sans', fontSize: '14px', color: '#F8FAFC', fontWeight: 600 }}>
                        {notif.title}
                      </p>
                      <p style={{ margin: '2px 0 0', fontFamily: 'DM Sans', fontSize: '13px', color: '#94A3B8' }}>
                        {notif.body}
                      </p>
                    </div>
                    <span style={{ fontFamily: 'DM Sans', fontSize: '11px', color: '#475569', flexShrink: 0 }}>
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="glass-card"
            style={{
              padding: '24px',
              marginBottom: '44px',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '20px',
              background: 'rgba(255,255,255,0.05)',
            }}
          >
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#F8FAFC', margin: '0 0 16px 0' }}>Admin Panel</h2>
            <p style={{ color: '#94A3B8', marginBottom: '20px' }}>
              Welcome, Admin! Here you can manage global settings and view system-wide alerts.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                style={{
                  background: 'rgba(74,195,255,0.1)',
                  color: '#4ac3ff',
                  border: '1px solid rgba(74,195,255,0.3)',
                  padding: '10px 18px',
                  borderRadius: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
                onClick={() => alert('View all users functionality coming soon!')}
              >
                <Users size={18} /> All Users
              </button>
              <button
                style={{
                  background: 'rgba(255,214,10,0.1)',
                  color: '#ffd60a',
                  border: '1px solid rgba(255,214,10,0.3)',
                  padding: '10px 18px',
                  borderRadius: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
                onClick={() => alert('System health report coming soon!')}
              >
                <Activity size={18} /> System Health
              </button>
              <button
                style={{
                  background: 'rgba(255,69,58,0.1)',
                  color: '#ff453a',
                  border: '1px solid rgba(255,69,58,0.3)',
                  padding: '10px 18px',
                  borderRadius: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
                onClick={() => alert('Review flagged content coming soon!')}
              >
                <Bell size={18} /> Flagged Content
              </button>
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
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
                    y: -4,
                    boxShadow: `inset 0 0.5px 0 rgba(255,255,255,0.35), 0 16px 40px ${action.glowColor}, 0 4px 16px rgba(0,0,0,0.25)`,
                    borderColor: `${action.accentColor}40`,
                  }}
                  whileTap={{ scale: 0.98 }}
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
                    borderRadius: '16px',
                    background: `${action.accentColor}14`,
                    border: `1px solid ${action.accentColor}28`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `inset 0 0.5px 0 rgba(255,255,255,0.22), 0 4px 16px ${action.glowColor}`,
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

      {/* Mobile Bottom Nav */}
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
                color: isActive ? '#4ac3ff' : 'rgba(255,255,255,0.32)',
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

      {/* Modals */}
      <AnimatePresence>
        {showCreateChama && (
          <GlassModal onClose={() => setShowCreateChama(false)}>
            <button
              onClick={() => setShowCreateChama(false)}
              style={{
                position: 'absolute', top: '20px', right: '20px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                width: '32px', height: '32px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'rgba(255,255,255,0.55)',
                backdropFilter: 'blur(14px)',
                boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,0.22)',
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
                borderRadius: '14px',
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

        {showContribute && selectedChamaForAction && (
          <ContributeModal
            chamaId={selectedChamaForAction.id}
            chamaName={selectedChamaForAction.name}
            onClose={() => setShowContribute(false)}
            onSuccess={() => { setShowContribute(false); window.location.reload() }}
          />
        )}

        {showLoan && selectedChamaForAction && membership && (
          <LoanModal
            chamaId={selectedChamaForAction.id}
            chamaName={selectedChamaForAction.name}
            membership={membership}
            onClose={() => setShowLoan(false)}
            onSuccess={() => { setShowLoan(false); window.location.reload() }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
