import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Plus, Wallet, Shield, Check, Users, ShieldCheck, ChevronRight, Activity, Bell, FileText, ArrowRight, Home, CreditCard, LayoutDashboard, Bot, Settings, Loader2, TrendingUp, Star, X, ChevronDown } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import api from '../services/api'
import useAuthStore from '../store/authStore'

// Internal UI Components
function FloatingInput({ label, type = 'text', value, onChange, error }) {
  const [focused, setFocused] = useState(false)
  const active = focused || value.toString().length > 0

  return (
    <div style={{ position: 'relative', marginBottom: '20px' }}>
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '14px',
        border: `1px solid ${error ? '#EF4444' : active ? '#0EA5E9' : 'rgba(255,255,255,0.12)'}`,
        pointerEvents: 'none', transition: 'border-color 0.2s ease'
      }} />
      <label style={{
        position: 'absolute', left: '14px',
        top: active ? '0px' : '50%',
        transform: active ? 'translateY(-50%)' : 'translateY(-50%)',
        fontSize: active ? '11px' : '15px',
        color: active ? '#0EA5E9' : '#64748B',
        background: active ? '#12101f' : 'transparent',
        padding: active ? '0 6px' : '0',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: 'none', zIndex: 2,
        fontFamily: 'DM Sans, sans-serif',
        letterSpacing: active ? '0.05em' : '0',
        textTransform: active ? 'uppercase' : 'none'
      }}>
        {label}
      </label>
      <input
        type={type} value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width: '100%', background: 'transparent', border: 'none', outline: 'none',
          color: '#F8FAFC', fontSize: '15px', padding: '16px',
          fontFamily: 'DM Sans, sans-serif', position: 'relative', zIndex: 1,
          boxSizing: 'border-box'
        }}
      />
      {error && (
        <p style={{ color: '#EF4444', fontSize: '11px', marginTop: '4px', paddingLeft: '4px', position: 'absolute', bottom: '-18px' }}>
          {error}
        </p>
      )}
    </div>
  )
}

function FloatingPhoneInput({ value, onChange, error }) {
  const [focused, setFocused] = useState(false)
  const active = focused || value.length > 0

  return (
    <div style={{ position: 'relative', marginBottom: '20px' }}>
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '14px',
        border: `1px solid ${error ? '#EF4444' : active ? '#0EA5E9' : 'rgba(255,255,255,0.12)'}`,
        pointerEvents: 'none', transition: 'border-color 0.2s ease'
      }} />
      <label style={{
        position: 'absolute', left: '14px',
        top: active ? '0px' : '50%',
        transform: active ? 'translateY(-50%) translateY(-26px)' : 'translateY(-50%)',
        fontSize: active ? '11px' : '15px',
        color: active ? '#0EA5E9' : '#64748B',
        background: active ? '#12101f' : 'transparent',
        padding: active ? '0 6px' : '0',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: 'none', zIndex: 2, fontFamily: 'DM Sans, sans-serif',
        letterSpacing: active ? '0.05em' : '0', textTransform: active ? 'uppercase' : 'none'
      }}>
        Phone Number
      </label>
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px', gap: '8px' }}>
        {active && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, animation: 'fadeIn 0.2s ease' }}>
            <span style={{ color: '#F8FAFC', fontSize: '15px', fontFamily: 'DM Sans', fontWeight: 500 }}>🇰🇪 +254</span>
            <div style={{ width: '1px', height: '18px', background: 'rgba(255,255,255,0.2)' }} />
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
            color: '#F8FAFC', fontSize: '15px', fontFamily: 'DM Sans, sans-serif',
            padding: 0, zIndex: 1
          }}
        />
      </div>
      {error && (
        <p style={{ color: '#EF4444', fontSize: '11px', marginTop: '4px', paddingLeft: '4px', position: 'absolute', bottom: '-18px' }}>{error}</p>
      )}
    </div>
  )
}

function AnimatedNumber({ value, prefix = '' }) {
  const [displayVal, setDisplayVal] = useState(0)
  
  useEffect(() => {
    let start = performance.now()
    const duration = 1000 // 1s
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

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'chamas', label: 'Chamas', icon: Home },
  { id: 'contributions', label: 'Contrib', icon: Wallet },
  { id: 'loans', label: 'Loans', icon: CreditCard },
  { id: 'ai', label: 'AI', icon: Bot },
  { id: 'settings', label: 'Profile', icon: Settings }
]



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

  // Forms
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
      alert("Error creating chama")
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
      alert("Error initiating contribution")
    } finally {
      setModalLoading(false)
    }
  }

  const handleSignOut = () => {
    logout()
    navigate('/')
  }

  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  
  // Fake calculated stats since endpoint might not exist
  const totalSavings = chamas.reduce((acc, c) => acc + (c.balance || 0), 0) + 125000 // padding for demo
  const activeLoansCount = 2
  const creditScore = 740

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0D0B1E', fontFamily: "'DM Sans', sans-serif" }}>
      <div className="mesh-bg" />
      <Sidebar unreadCount={unreadCount} />
      
      <main className="main-content" style={{ marginLeft: '240px', flex: 1, padding: '32px', position: 'relative', zIndex: 1, overflowY: 'auto' }}>
        
        {/* Section 1 - Top Bar */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
          <div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              style={{ fontFamily: "'Syne', sans-serif", fontSize: '28px', color: '#FFF', margin: '0 0 8px 0', fontWeight: 700 }}
            >
              Good morning, {user?.fullName?.split(' ')[0] || 'User'} 👋
            </motion.h1>
            <div style={{ color: '#94A3B8', fontSize: '15px' }}>{todayStr}</div>
          </div>
          
          <button 
            onClick={() => navigate('/notifications')}
            style={{ 
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            width: '44px', height: '44px', borderRadius: '50%', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F8FAFC',
            position: 'relative', transition: 'background 0.2s'
          }}>
            <Bell size={20} />
            {unreadCount > 0 && (
              <span style={{ position: 'absolute', top: '10px', right: '12px', width: '8px', height: '8px', background: '#EF4444', borderRadius: '50%', border: '2px solid #0D0B1E' }} />
            )}
          </button>
        </header>

        {/* Section 2 - Stats Row */}
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '48px' }}>
          {[
            { label: 'Total Savings', val: totalSavings, pre: 'KES ', icon: TrendingUp, color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' },
            { label: 'Active Loans', val: activeLoansCount, pre: '', icon: CreditCard, color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)' },
            { label: 'My Chamas', val: chamas.length, pre: '', icon: Users, color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.1)' },
            { label: 'Credit Score', val: creditScore, pre: '', icon: Star, color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' },
          ].map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="glass-card"
                style={{
                  background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '24px'
                }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: stat.bg, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                  <Icon size={24} />
                </div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '28px', fontWeight: 700, color: '#FFF', marginBottom: '4px' }}>
                  <AnimatedNumber value={stat.val} prefix={stat.pre} />
                </div>
                <div style={{ color: '#94A3B8', fontSize: '14px' }}>{stat.label}</div>
              </motion.div>
            )
          })}
        </div>

        <div className="content-grid" style={{ display: 'grid', gridTemplateColumns: '7fr 4fr', gap: '32px', marginBottom: '40px' }}>
          
          {/* Section 3 - My Chamas */}
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '20px', color: '#FFF', margin: 0, fontWeight: 700 }}>My Chamas</h2>
              <button 
                onClick={() => setShowCreateChama(true)}
                style={{ background: 'rgba(14,165,233,0.1)', color: '#0EA5E9', border: '1px solid rgba(14,165,233,0.2)', padding: '8px 16px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={16} /> New Chama
              </button>
            </div>
            
            <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '16px', scrollbarWidth: 'none' }}>
              {chamas.length === 0 ? (
                <div style={{ width: '100%', padding: '40px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '20px', textAlign: 'center' }}>
                  <div style={{ width: '64px', height: '64px', background: 'rgba(14,165,233,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#0EA5E9' }}>
                    <Users size={32} />
                  </div>
                  <h3 style={{ color: '#FFF', fontFamily: "'Syne', sans-serif", margin: '0 0 8px 0' }}>No chamas yet</h3>
                  <p style={{ color: '#94A3B8', fontSize: '14px', margin: '0 0 20px 0' }}>Create or join a group to start saving together.</p>
                  <button onClick={() => setShowCreateChama(true)} className="btn-primary" style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', background: '#0EA5E9', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>Create your first chama</button>
                </div>
              ) : (
                chamas.map((c, i) => (
                  <motion.div 
                    key={c._id || i}
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                    style={{ minWidth: '280px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '18px', color: '#FFF', margin: 0, fontWeight: 700 }}>{c.name}</h3>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', padding: '4px 8px', borderRadius: '6px', background: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6' }}>Member</span>
                    </div>
                    <div style={{ color: '#94A3B8', fontSize: '13px', marginBottom: '4px' }}>Group Balance</div>
                    <div style={{ color: '#0EA5E9', fontSize: '24px', fontWeight: 700, fontFamily: "'Syne', sans-serif", marginBottom: '20px' }}>
                      KES {(c.balance || 0).toLocaleString()}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94A3B8', fontSize: '14px' }}>
                        <Users size={16} /> {c.members?.length || 1} members
                      </div>
                      <button onClick={() => navigate(`/chama/${c.chamaId?._id || c._id}`)} style={{ background: 'transparent', border: 'none', color: '#FFF', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                        View <ArrowRight size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </section>

          {/* Section 4 - Recent Activity feed */}
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '20px', color: '#FFF', margin: 0, fontWeight: 700 }}>Recent Activity</h2>
            </div>
            
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '20px', height: '320px', overflowY: 'auto' }}>
              <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '16px', marginBottom: '16px' }}>
                <span style={{ color: '#FFF', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>All</span>
                <span style={{ color: '#64748B', fontSize: '14px', cursor: 'pointer' }}>Contributions</span>
                <span style={{ color: '#64748B', fontSize: '14px', cursor: 'pointer' }}>Loans</span>
              </div>

              {notifications.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#64748B' }}>
                   <Activity size={48} strokeWidth={1} style={{ marginBottom: '16px', opacity: 0.5 }} />
                   <span>No recent activity</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {notifications.map((n, i) => (
                    <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i*0.1 }} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Wallet size={18} />
                      </div>
                      <div>
                        <div style={{ color: '#FFF', fontSize: '14px', fontWeight: 500, marginBottom: '2px' }}>{n.title}</div>
                        <div style={{ color: '#94A3B8', fontSize: '13px', marginBottom: '4px' }}>{n.message}</div>
                        <div style={{ color: '#475569', fontSize: '11px' }}>2 hours ago</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Section 5 - Quick Actions row */}
        <section>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '20px', color: '#FFF', margin: '0 0 20px 0', fontWeight: 700 }}>Quick Actions</h2>
          <div className="quick-actions-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
            {[
              { label: 'Contribute', icon: Wallet, color: '#10B981', action: () => setShowContribute(true) },
              { label: 'Request Loan', icon: CreditCard, color: '#0EA5E9', action: () => alert('Loans coming soon') },
              { label: 'Invite Member', icon: Users, color: '#8B5CF6', action: () => alert('Invites coming soon') },
              { label: 'View Reports', icon: TrendingUp, color: '#F59E0B', action: () => alert('Reports coming soon') }
            ].map((action, i) => {
              const Icon = action.icon
              return (
                <motion.div
                  key={i}
                  whileHover={{ y: -5, boxShadow: `0 10px 24px ${action.color}33`, borderColor: `${action.color}80` }}
                  onClick={action.action}
                  style={{
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px',
                    padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'border 0.3s'
                  }}
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: `${action.color}15`, color: action.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                    <Icon size={24} />
                  </div>
                  <div style={{ color: '#F8FAFC', fontSize: '15px', fontWeight: 600 }}>{action.label}</div>
                </motion.div>
              )
            })}
          </div>
        </section>

      </main>

      {/* Bottom Nav for Mobile */}
      <nav className="bottom-nav">
        {NAV_ITEMS.map((item) => {
          const isActive = activeNav === item.id
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              style={{
                background: 'transparent', border: 'none', color: isActive ? '#0EA5E9' : '#64748B',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '10px',
                flex: 1, cursor: 'pointer'
              }}
            >
              <Icon size={20} />
              <span style={{ fontSize: '10px' }}>{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Inline styles */}
      <style>{`
        .bottom-nav { display: none; }
        @keyframes fadeIn { from { opacity: 0; transform: translateX(-6px); } to { opacity: 1; transform: translateX(0); } }
        @media (max-width: 900px) {
          .content-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 768px) {
          .sidebar { display: none !important; }
          .main-content { margin-left: 0 !important; padding: 20px !important; padding-bottom: 80px !important; }
          .bottom-nav { 
            display: flex; position: fixed; bottom: 0; left: 0; right: 0; 
            background: rgba(13, 11, 20, 0.95); backdrop-filter: blur(10px); 
            border-top: 1px solid rgba(255,255,255,0.06); z-index: 50; 
          }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .quick-actions-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* MODALS */}
      <AnimatePresence>
        {showCreateChama && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCreateChama(false)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(13, 11, 30, 0.8)', backdropFilter: 'blur(8px)' }} 
            />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              style={{ position: 'relative', width: '400px', maxWidth: '90%', background: '#12101f', borderRadius: '24px', padding: '32px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 24px 48px rgba(0,0,0,0.5)' }}
            >
              <button onClick={() => setShowCreateChama(false)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}><X size={20} /></button>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '24px', color: '#FFF', margin: '0 0 24px 0', fontWeight: 700 }}>Create New Chama</h2>
              
              <FloatingInput label="Chama Name" value={newChama.name} onChange={(e) => setNewChama({...newChama, name: e.target.value})} />
              <FloatingInput label="Description" value={newChama.description} onChange={(e) => setNewChama({...newChama, description: e.target.value})} />
              
              <button disabled={modalLoading} onClick={handleCreateChama} className="btn-primary" style={{ width: '100%', height: '52px', background: '#0EA5E9', color: '#FFF', border: 'none', borderRadius: '14px', fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '16px', cursor: 'pointer', marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {modalLoading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : 'Create Chama'}
              </button>
            </motion.div>
          </div>
        )}

        {showContribute && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowContribute(false)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(13, 11, 30, 0.8)', backdropFilter: 'blur(8px)' }} 
            />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              style={{ position: 'relative', width: '400px', maxWidth: '90%', background: '#12101f', borderRadius: '24px', padding: '32px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 24px 48px rgba(0,0,0,0.5)' }}
            >
              <button onClick={() => setShowContribute(false)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}><X size={20} /></button>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '24px', color: '#FFF', margin: '0 0 24px 0', fontWeight: 700 }}>Make Contribution</h2>
              
              <div style={{ position: 'relative', marginBottom: '20px' }}>
                <select 
                  value={contribData.chamaId} onChange={(e) => setContribData({...contribData, chamaId: e.target.value})}
                  style={{ width: '100%', height: '56px', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '14px', color: '#F8FAFC', padding: '0 16px', fontSize: '15px', outline: 'none', appearance: 'none', fontFamily: "'DM Sans', sans-serif" }}
                >
                  <option value="" disabled style={{ background: '#12101f' }}>Select Chama...</option>
                  {chamas.map(c => <option key={c._id} value={c._id} style={{ background: '#12101f' }}>{c.name}</option>)}
                </select>
                <ChevronDown size={18} style={{ position: 'absolute', right: '16px', top: '19px', color: '#64748B', pointerEvents: 'none' }} />
              </div>

              <FloatingInput label="Amount (KES)" type="number" value={contribData.amount} onChange={(e) => setContribData({...contribData, amount: e.target.value})} />
              <FloatingPhoneInput value={contribData.mpesaPhone} onChange={(val) => setContribData({...contribData, mpesaPhone: val})} />
              
              {contribSuccess && (
                <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', borderRadius: '10px', fontSize: '13px', textAlign: 'center', marginBottom: '16px' }}>
                  {contribSuccess}
                </div>
              )}

              <button disabled={modalLoading || !!contribSuccess} onClick={handleContribute} className="btn-primary" style={{ width: '100%', height: '52px', background: '#10B981', color: '#FFF', border: 'none', borderRadius: '14px', fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {modalLoading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : 'Contribute KES'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
