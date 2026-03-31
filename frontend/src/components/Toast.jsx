import { motion, AnimatePresence } from 'framer-motion'

export default function Toast({ message, type = 'success', onClose }) {
  const colors = {
    success: { border: '#10B981', icon: '✓', bg: 'rgba(16,185,129,0.1)' },
    error: { border: '#EF4444', icon: '✗', bg: 'rgba(239,68,68,0.1)' },
    info: { border: '#0EA5E9', icon: 'ℹ', bg: 'rgba(14,165,233,0.1)' },
    warning: { border: '#F59E0B', icon: '⚠', bg: 'rgba(245,158,11,0.1)' }
  }
  const c = colors[type] || colors.success

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        background: '#1E293B',
        border: `1px solid ${c.border}`,
        borderLeft: `4px solid ${c.border}`,
        borderRadius: '14px',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        minWidth: '300px',
        maxWidth: '400px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
      }}
    >
      <div style={{
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        background: c.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: c.border,
        fontWeight: 700,
        flexShrink: 0
      }}>
        {c.icon}
      </div>
      <p style={{
        fontFamily: 'DM Sans',
        fontSize: '14px',
        color: '#F8FAFC',
        margin: 0,
        flex: 1
      }}>
        {message}
      </p>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: '#64748B',
          cursor: 'pointer',
          fontSize: '16px',
          padding: '0',
          flexShrink: 0
        }}
      >✕</button>
    </motion.div>
  )
}
