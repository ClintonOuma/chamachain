import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Building2, CreditCard,
  Landmark, Bot, Bell, Settings, LogOut, ChevronRight
} from 'lucide-react'
import useAuthStore from '../store/authStore'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'chamas', label: 'My Chamas', icon: Building2, path: '/chamas' },
  { id: 'contributions', label: 'Contributions', icon: CreditCard, path: '/chamas' },
  { id: 'loans', label: 'Loans', icon: Landmark, path: '/chamas' },
  { id: 'ai-coach', label: 'AI Coach', icon: Bot, path: '/ai-coach' },
  { id: 'notifications', label: 'Notifications', icon: Bell, path: '/notifications' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/profile' },
]

export default function Sidebar({ unreadCount = 0 }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const getInitials = (name) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const avatarColors = ['#0EA5E9', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444']
  const avatarColor = avatarColors[(user?.fullName?.charCodeAt(0) || 0) % avatarColors.length]

  return (
    <div style={{
      width: '240px',
      minHeight: '100vh',
      background: '#0D0B14',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 100,
      padding: '24px 0'
    }}>

      {/* Logo */}
      <div style={{ padding: '0 24px 32px' }}>
        <span style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: '20px',
          fontWeight: 700,
          color: '#0EA5E9',
          cursor: 'pointer'
        }} onClick={() => navigate('/dashboard')}>
          ◈ ChamaChain
        </span>
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, padding: '0 12px' }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path))
          const Icon = item.icon

          return (
            <motion.div
              key={item.id}
              whileHover={{ x: 4 }}
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                cursor: 'pointer',
                marginBottom: '4px',
                background: isActive ? 'rgba(14,165,233,0.1)' : 'transparent',
                borderLeft: isActive ? '3px solid #0EA5E9' : '3px solid transparent',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              <Icon
                size={18}
                color={isActive ? '#0EA5E9' : '#64748B'}
              />
              <span style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '14px',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#F8FAFC' : '#64748B'
              }}>
                {item.label}
              </span>

              {/* Unread badge on notifications */}
              {item.id === 'notifications' && unreadCount > 0 && (
                <div style={{
                  position: 'absolute',
                  right: '12px',
                  background: '#EF4444',
                  color: 'white',
                  borderRadius: '10px',
                  padding: '2px 6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  fontFamily: "'DM Sans', sans-serif"
                }}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </div>
              )}
            </motion.div>
          )
        })}
      </nav>

      {/* User section at bottom */}
      <div style={{
        padding: '16px 12px 0',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        marginTop: '16px'
      }}>
        {/* User info */}
        <motion.div
          whileHover={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
          onClick={() => navigate('/profile')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: '12px',
            cursor: 'pointer',
            marginBottom: '8px'
          }}
        >
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: avatarColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Syne', sans-serif",
            fontSize: '14px',
            fontWeight: 700,
            color: 'white',
            flexShrink: 0
          }}>
            {getInitials(user?.fullName)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '13px',
              fontWeight: 600,
              color: '#F8FAFC',
              margin: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {user?.fullName || 'User'}
            </p>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '11px',
              color: '#64748B',
              margin: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {user?.email || ''}
            </p>
          </div>
          <ChevronRight size={14} color="#64748B" />
        </motion.div>

        {/* Sign out */}
        <motion.div
          whileHover={{ backgroundColor: 'rgba(239,68,68,0.08)' }}
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 16px',
            borderRadius: '12px',
            cursor: 'pointer',
          }}
        >
          <LogOut size={16} color="#EF4444" />
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '13px',
            color: '#EF4444'
          }}>Sign Out</span>
        </motion.div>
      </div>
    </div>
  )
}
