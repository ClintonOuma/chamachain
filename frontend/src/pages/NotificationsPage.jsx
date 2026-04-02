import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, CheckCheck, Trash2, LayoutDashboard, Users, Wallet, CreditCard, Bot, Settings, LogOut } from 'lucide-react'
import { io } from 'socket.io-client'
import Sidebar from '../components/Sidebar'
import api from '../services/api'
import useAuthStore from '../store/authStore'
import { getSocketUrl } from '../config/apiBase'
import usePageTitle from '../hooks/usePageTitle'


const isToday = (date) => {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}
const isYesterday = (date) => {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return date.toDateString() === yesterday.toDateString()
}
const isThisWeek = (date) => {
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  return date > weekAgo && !isToday(date) && !isYesterday(date)
}

const TYPE_STYLES = {
  contribution: { color: '#10B981', bg: 'rgba(16,185,129,0.1)', icon: '💸' },
  loan: { color: '#0EA5E9', bg: 'rgba(14,165,233,0.1)', icon: '🏛️' },
  vote: { color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)', icon: '🗳️' },
  reminder: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', icon: '⏰' },
  system: { color: '#94A3B8', bg: 'rgba(148,163,184,0.1)', icon: '⚙️' },
  badge: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', icon: '🏆' },
}

const MOCK_NOTIFICATIONS = [
  { _id: '1', type: 'contribution', title: 'Payment Received', message: 'Your contribution of KES 5,000 has been verified.', createdAt: new Date().toISOString(), isRead: false },
  { _id: '2', type: 'loan', title: 'Loan Approved', message: 'Your business loan request for KES 20,000 was approved.', createdAt: new Date(Date.now() - 86400000).toISOString(), isRead: true },
  { _id: '3', type: 'vote', title: 'New Vote Required', message: 'John Doe requested a loan. Please cast your vote.', createdAt: new Date(Date.now() - 86400000*2).toISOString(), isRead: false },
  { _id: '4', type: 'reminder', title: 'Upcoming Contribution', message: 'Your monthly contribution is due in 3 days.', createdAt: new Date(Date.now() - 86400000*6).toISOString(), isRead: true },
  { _id: '5', type: 'system', title: 'Terms Updated', message: 'We have updated our terms of service.', createdAt: new Date(Date.now() - 86400000*14).toISOString(), isRead: true },
]

export default function NotificationsPage() {
  usePageTitle('Notifications')
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [activeFilter, setActiveFilter] = useState('all')

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const res = await api.get('/notifications')
      setNotifications(res.data.notifications || MOCK_NOTIFICATIONS)
      setUnreadCount(res.data.unreadCount || MOCK_NOTIFICATIONS.filter(n => !n.isRead).length)
    } catch (err) {
      console.error(err)
      setNotifications(MOCK_NOTIFICATIONS)
      setUnreadCount(MOCK_NOTIFICATIONS.filter(n => !n.isRead).length)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  useEffect(() => {
    let socket;
    try {
      socket = io(getSocketUrl(), { transports: ['websocket', 'polling'] })
      socket.on('notification', (newNotif) => {
        setNotifications(prev => [newNotif, ...prev])
        setUnreadCount(prev => prev + 1)
      })
    } catch (err) {
      console.log('Socket connection error', err)
    }
    return () => {
      if (socket) socket.disconnect()
    }
  }, [])

  const markAsRead = async (id, actionUrl) => {
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
    try { await api.patch(`/notifications/${id}/read`) } catch (err) { console.error(err) }
    if (actionUrl) navigate(actionUrl)
  }

  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    setUnreadCount(0)
    try { await api.patch('/notifications/read-all') } catch (err) { console.error(err) }
  }

  const deleteNotification = async (id, e) => {
    e.stopPropagation()
    setNotifications(prev => {
      const target = prev.find(n => n._id === id)
      if (target && !target.isRead) setUnreadCount(count => Math.max(0, count - 1))
      return prev.filter(n => n._id !== id)
    })
    try { await api.delete(`/notifications/${id}`) } catch (err) { console.error(err) }
  }

  const notificationRows = useMemo(
    () => notifications.map(n => ({ ...n, createdDate: new Date(n.createdAt) })),
    [notifications]
  )

  const filtered = useMemo(
    () => (activeFilter === 'all'
      ? notificationRows
      : notificationRows.filter(n => n.type === activeFilter)),
    [activeFilter, notificationRows]
  )

  const grouped = useMemo(() => ({
    Today: filtered.filter(n => isToday(n.createdDate)),
    Yesterday: filtered.filter(n => isYesterday(n.createdDate)),
    'This Week': filtered.filter(n => isThisWeek(n.createdDate)),
    Earlier: filtered.filter(n => !isToday(n.createdDate) && !isYesterday(n.createdDate) && !isThisWeek(n.createdDate))
  }), [filtered])

  const TABS = ['all', 'contribution', 'loan', 'vote', 'reminder', 'system']

  const unreadCountsByTab = useMemo(() => {
    const counts = { all: unreadCount }
    for (const tab of TABS) {
      if (tab === 'all') continue
      counts[tab] = notificationRows.reduce((acc, n) => acc + (n.type === tab && !n.isRead ? 1 : 0), 0)
    }
    return counts
  }, [notificationRows, unreadCount])

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0D0B1E', fontFamily: "'DM Sans', sans-serif" }}>
      <div className="mesh-bg" />
      <Sidebar unreadCount={unreadCount} />
       <main className="main-content" style={{ marginLeft: '240px', flex: 1, padding: '32px', position: 'relative', zIndex: 1, overflowY: 'auto' }}>
        
        {/* SECTION 1 — Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, color: '#FFF', fontWeight: 700, margin: 0 }}>🔔 Notifications</h1>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={markAllRead} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#F8FAFC', padding: '10px 16px', borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
              <CheckCheck size={16} /> Mark all read
            </button>
            <button onClick={() => setNotifications([])} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', padding: '10px 16px', borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, transition: 'background 0.2s' }}>
              <Trash2 size={16} /> Clear all
            </button>
          </div>
        </header>

        {/* SECTION 2 — Filter Tabs */}
        <div style={{ display: 'flex', gap: 8, background: 'rgba(255,255,255,0.04)', padding: 6, borderRadius: 16, width: 'fit-content', marginBottom: 32 }}>
          {TABS.map(tab => {
            const count = unreadCountsByTab[tab] || 0
            return (
              <button key={tab} onClick={() => setActiveFilter(tab)}
                style={{
                  background: activeFilter === tab ? '#0EA5E9' : 'transparent',
                  color: activeFilter === tab ? '#FFF' : '#94A3B8',
                  border: 'none', padding: '8px 16px', borderRadius: 12, fontSize: 14, fontWeight: activeFilter === tab ? 600 : 500,
                  cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6
                }}
              >
                {tab}s
                {count > 0 && <span style={{ background: activeFilter === tab ? 'rgba(255,255,255,0.2)' : 'rgba(14,165,233,0.15)', color: activeFilter === tab ? '#FFF' : '#0EA5E9', padding: '2px 6px', borderRadius: 10, fontSize: 11, fontWeight: 'bold' }}>{count}</span>}
              </button>
            )
          })}
        </div>

        {/* SECTION 3 & 4 — Notifications List */}
        <AnimatePresence mode="wait">
          <motion.div key={activeFilter} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔔</div>
                <p style={{ fontFamily: "'Syne', sans-serif", fontSize: '20px', color: '#F8FAFC', fontWeight: 700, margin: '0 0 8px 0' }}>All caught up!</p>
                <p style={{ color: '#94A3B8', margin: 0 }}>No notifications in this category</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                {Object.entries(grouped).filter(([_, items]) => items.length > 0).map(([groupName, items]) => (
                  <div key={groupName}>
                    <div style={{ color: '#64748B', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>{groupName}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <AnimatePresence>
                        {items.map((n, i) => {
                          const style = TYPE_STYLES[n.type] || TYPE_STYLES.system
                          return (
                            <motion.div key={n._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 100, height: 0, overflow: 'hidden' }} transition={{ delay: i * 0.05 }}
                              onClick={() => markAsRead(n._id, n.actionUrl)}
                              style={{
                                background: n.isRead ? 'rgba(255,255,255,0.02)' : 'rgba(14,165,233,0.05)',
                                border: '1px solid',
                                borderColor: n.isRead ? 'rgba(255,255,255,0.06)' : 'rgba(14,165,233,0.2)',
                                borderLeft: n.isRead ? '1px solid rgba(255,255,255,0.06)' : '3px solid #0EA5E9',
                                borderRadius: 16, padding: 20, cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 16, position: 'relative',
                                className: 'notification-card'
                              }}
                            >
                              <div style={{ width: 48, height: 48, borderRadius: 14, background: style.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                                {style.icon}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, color: '#FFF', marginBottom: 4 }}>{n.title}</div>
                                <div style={{ color: '#94A3B8', fontSize: 14, lineHeight: 1.5 }}>{n.message}</div>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                                <div style={{ color: '#64748B', fontSize: 12 }}>
                                  {n.createdDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <AnimatePresence>
                                  {!n.isRead && (
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} style={{ width: 10, height: 10, borderRadius: '50%', background: '#0EA5E9', boxShadow: '0 0 10px rgba(14,165,233,0.5)' }} />
                                  )}
                                </AnimatePresence>
                              </div>
                              <button onClick={(e) => deleteNotification(n._id, e)} className="delete-btn" style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: 'none', width: 36, height: 36, borderRadius: '50%', display: 'none', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                <Trash2 size={16} />
                              </button>
                            </motion.div>
                          )
                        })}
                      </AnimatePresence>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Hover styles for the delete button */}
      <style>{`
        div[style*="cursor: pointer"]:hover .delete-btn {
          display: flex !important;
        }
      `}</style>
    </div>
  )
}
