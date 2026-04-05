import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useSocket from '../hooks/useSocket'
import api from '../services/api'

export default function NotificationBell() {
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(0)
  const [recentNotifs, setRecentNotifs] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [newNotif, setNewNotif] = useState(null)

  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch initial unread count
  useEffect(() => {
    api.get('/notifications').then(res => {
      setUnreadCount(res.data.unreadCount || 0)
      setRecentNotifs((res.data.notifications || []).slice(0, 5))
    }).catch(() => {})
  }, [])

  // Handle real-time notifications
  useSocket((notification) => {
    setUnreadCount(prev => prev + 1)
    setRecentNotifs(prev => [notification, ...prev].slice(0, 5))
    // Show toast notification
    setNewNotif(notification)
    setTimeout(() => setNewNotif(null), 4000)
  })

  const typeIcons = {
    contribution: '💸',
    loan: '🏛️',
    vote: '🗳️',
    reminder: '⏰',
    badge: '🏆',
    system: '🔔'
  }

  return (
    <>
      {/* Bell Icon */}
      <div style={{ position: 'relative' }} ref={dropdownRef}>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowDropdown(!showDropdown)}
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
        >
          <Bell size={18} color="#94A3B8" />
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#EF4444', color: 'white', borderRadius: '10px', padding: '2px 6px', fontSize: '10px', fontFamily: 'DM Sans', fontWeight: 700, minWidth: '18px', textAlign: 'center' }}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.div>
          )}
        </motion.button>

        {/* Dropdown */}
        <AnimatePresence>
          {showDropdown && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              style={{ position: 'absolute', top: '48px', right: 0, width: '360px', background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', boxShadow: '0 16px 48px rgba(0,0,0,0.4)', zIndex: 1000, overflow: 'hidden' }}>

              <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'Syne', fontSize: '16px', color: '#F8FAFC', fontWeight: 700 }}>Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={async () => {
                    await api.patch('/notifications/read-all')
                    setUnreadCount(0)
                    setRecentNotifs(prev => prev.map(n => ({ ...n, isRead: true })))
                  }} style={{ background: 'none', border: 'none', color: '#0EA5E9', cursor: 'pointer', fontFamily: 'DM Sans', fontSize: '13px' }}>
                    Mark all read
                  </button>
                )}
              </div>

              {recentNotifs.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔔</div>
                  <p style={{ fontFamily: 'DM Sans', color: '#64748B', margin: 0 }}>No notifications yet</p>
                </div>
              ) : (
                recentNotifs.map((notif, i) => (
                  <div key={i}
                    onClick={() => {
                      setShowDropdown(false)
                      if (notif.actionUrl) navigate(notif.actionUrl)
                    }}
                    style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: '12px', alignItems: 'flex-start', cursor: 'pointer', background: notif.isRead ? 'transparent' : 'rgba(14,165,233,0.05)', transition: 'background 0.2s' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
                      {typeIcons[notif.type] || '🔔'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: '0 0 2px', fontFamily: 'DM Sans', fontSize: '13px', color: '#F8FAFC', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{notif.title}</p>
                      <p style={{ margin: '0 0 4px', fontFamily: 'DM Sans', fontSize: '12px', color: '#94A3B8', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{notif.body}</p>
                      <p style={{ margin: 0, fontFamily: 'DM Sans', fontSize: '11px', color: '#475569' }}>{new Date(notif.createdAt).toLocaleDateString()}</p>
                    </div>
                    {!notif.isRead && (
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0EA5E9', flexShrink: 0, marginTop: '4px' }} />
                    )}
                  </div>
                ))
              )}

              <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button onClick={() => { setShowDropdown(false); navigate('/notifications') }}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8', cursor: 'pointer', fontFamily: 'DM Sans', fontSize: '13px' }}>
                  View All Notifications
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Real-time toast popup */}
      <AnimatePresence>
        {newNotif && (
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, background: '#1E293B', border: '1px solid rgba(14,165,233,0.3)', borderLeft: '4px solid #0EA5E9', borderRadius: '14px', padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: '12px', minWidth: '300px', maxWidth: '380px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', cursor: 'pointer' }}
            onClick={() => { setNewNotif(null); if (newNotif.actionUrl) navigate(newNotif.actionUrl) }}
          >
            <div style={{ fontSize: '24px', flexShrink: 0 }}>{typeIcons[newNotif.type] || '🔔'}</div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: '0 0 4px', fontFamily: 'DM Sans', fontSize: '14px', color: '#F8FAFC', fontWeight: 600 }}>{newNotif.title}</p>
              <p style={{ margin: 0, fontFamily: 'DM Sans', fontSize: '13px', color: '#94A3B8', lineHeight: 1.4 }}>{newNotif.body}</p>
            </div>
            <button onClick={(e) => { e.stopPropagation(); setNewNotif(null) }}
              style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '16px', flexShrink: 0 }}>✕</button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}