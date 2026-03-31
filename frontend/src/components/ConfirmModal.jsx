import { motion } from 'framer-motion'

export default function ConfirmModal({ title, message, onConfirm, onCancel, confirmText = 'Confirm', dangerous = false }) {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 1000
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card"
        style={{ width: '400px', padding: '36px' }}
      >
        <h3 style={{ fontFamily: 'Syne', fontSize: '20px', color: '#F8FAFC', marginBottom: '12px' }}>
          {title}
        </h3>
        <p style={{ fontFamily: 'DM Sans', color: '#94A3B8', marginBottom: '28px', lineHeight: 1.6 }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-ghost" style={{ flex: 1 }} onClick={onCancel}>
            Cancel
          </button>
          <button
            className="btn-primary"
            style={{
              flex: 1,
              background: dangerous ? '#EF4444' : '#0EA5E9',
              boxShadow: dangerous ? '0 0 20px rgba(239,68,68,0.3)' : '0 0 20px rgba(14,165,233,0.3)',
              border: 'none'
            }}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
