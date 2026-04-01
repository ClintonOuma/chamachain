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

  // Gradient colors matching Apple's liquid glass blue tints
  const avatarColors = [
    'linear-gradient(135deg, rgba(74,195,255,0.75), rgba(94,92,230,0.75))',
    'linear-gradient(135deg, rgba(94,92,230,0.75), rgba(74,195,255,0.75))',
    'linear-gradient(135deg, rgba(50,215,75,0.75), rgba(74,195,255,0.75))',
    'linear-gradient(135deg, rgba(255,214,10,0.75), rgba(255,149,0,0.75))',
    'linear-gradient(135deg, rgba(255,69,58,0.75), rgba(255,149,0,0.75))',
  ]
  const avatarGradient = avatarColors[(user?.fullName?.charCodeAt(0) || 0) % avatarColors.length]

  return (
    <div
      className="sidebar glass-sidebar"
      style={{
        width: '240px',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 100,
        padding: '28px 0',
      }}
    >
      {/* Logo */}
      <div style={{ padding: '0 24px 36px' }}>
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/dashboard')}
          style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '10px' }}
        >
          {/* Liquid glass logo mark */}
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(74,195,255,0.7) 0%, rgba(94,92,230,0.7) 100%)',
            border: '1px solid rgba(255,255,255,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(14px)',
            boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,0.5), 0 4px 16px rgba(74,195,255,0.25)',
            fontSize: '16px',
            fontWeight: 800,
            color: 'rgba(255,255,255,0.95)',
          }}>
            ◈
          </div>
          <span style={{
            fontSize: '17px',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'rgba(255,255,255,0.92)',
          }}>
            ChamaChain
          </span>
        </motion.div>
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, padding: '0 12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path))
          const Icon = item.icon

          return (
            <motion.div
              key={item.id}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(item.path)}
              className={isActive ? 'nav-item-active' : ''}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '11px',
                padding: '10px 14px',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                border: isActive ? undefined : '1px solid transparent',
                background: isActive ? undefined : 'transparent',
              }}
            >
              {/* Active indicator - glowing bar */}
              {isActive && (
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '3px',
                  height: '55%',
                  borderRadius: '0 3px 3px 0',
                  background: 'linear-gradient(180deg, rgba(74,195,255,0.9), rgba(94,92,230,0.9))',
                  boxShadow: '0 0 10px rgba(74,195,255,0.5)',
                }} />
              )}

              {/* Icon container with liquid glass effect */}
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: isActive
                  ? 'rgba(74,195,255,0.15)'
                  : 'transparent',
                border: isActive ? '1px solid rgba(74,195,255,0.22)' : '1px solid transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.2s ease',
                boxShadow: isActive ? 'inset 0 0.5px 0 rgba(255,255,255,0.25)' : 'none',
              }}>
                <Icon
                  size={16}
                  color={isActive ? '#4ac3ff' : 'rgba(255,255,255,0.38)'}
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
              </div>

              <span style={{
                fontSize: '13.5px',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.45)',
                letterSpacing: '-0.01em',
                transition: 'color 0.2s ease',
              }}>
                {item.label}
              </span>

              {/* Notification badge */}
              {item.id === 'notifications' && unreadCount > 0 && (
                <div style={{
                  position: 'absolute',
                  right: '12px',
                  background: 'linear-gradient(135deg, #ff453a, #ff6b6b)',
                  color: 'white',
                  borderRadius: '10px',
                  padding: '2px 7px',
                  fontSize: '10px',
                  fontWeight: 700,
                  boxShadow: '0 0 8px rgba(255,69,58,0.5)',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </div>
              )}
            </motion.div>
          )
        })}
      </nav>

      {/* Divider */}
      <div style={{
        margin: '12px 20px',
        height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
      }} />

      {/* User section */}
      <div style={{ padding: '0 12px 8px' }}>
        {/* User card with liquid glass */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/profile')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '11px',
            padding: '11px 14px',
            borderRadius: '14px',
            cursor: 'pointer',
            marginBottom: '6px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.10)',
            backdropFilter: 'blur(14px)',
            transition: 'all 0.2s ease',
            boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,0.12)',
          }}
        >
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            background: avatarGradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 700,
            color: 'rgba(255,255,255,0.95)',
            flexShrink: 0,
            border: '1px solid rgba(255,255,255,0.25)',
            boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,0.35)',
          }}>
            {getInitials(user?.fullName)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.90)',
              margin: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              letterSpacing: '-0.01em',
            }}>
              {user?.fullName || 'User'}
            </p>
            <p style={{
              fontSize: '11px',
              color: 'rgba(255,255,255,0.35)',
              margin: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {user?.email || ''}
            </p>
          </div>
          <ChevronRight size={13} color="rgba(255,255,255,0.28)" />
        </motion.div>

        {/* Sign out */}
        <motion.div
          whileHover={{ scale: 1.01, background: 'rgba(255,69,58,0.08)' }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '11px',
            padding: '9px 14px',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(255, 69, 58, 0.10)',
            border: '1px solid rgba(255, 69, 58, 0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,0.1)',
          }}>
            <LogOut size={15} color="rgba(255,69,58,0.85)" />
          </div>
          <span style={{
            fontSize: '13px',
            fontWeight: 500,
            color: 'rgba(255,69,58,0.75)',
            letterSpacing: '-0.01em',
          }}>
            Sign Out
          </span>
        </motion.div>
      </div>
    </div>
  )
}
