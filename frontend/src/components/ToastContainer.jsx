import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Bell, Info, AlertCircle } from 'lucide-react'
import useToastStore from '../store/toastStore'

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  return (
    <div style={{
      position: 'fixed',
      bottom: '32px',
      right: '32px',
      zIndex: 10000,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      pointerEvents: 'none'
    }}>
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            layout
            style={{
              pointerEvents: 'auto',
              background: 'rgba(13, 11, 30, 0.9)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '16px 20px',
              minWidth: '300px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
              borderLeft: `4px solid ${
                toast.type === 'error' ? '#EF4444' : 
                toast.type === 'info' ? '#0EA5E9' : 
                toast.type === 'warning' ? '#F59E0B' : '#10B981'
              }`
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: toast.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 
                         toast.type === 'info' ? 'rgba(14, 165, 233, 0.1)' : 
                         toast.type === 'warning' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: toast.type === 'error' ? '#EF4444' : 
                     toast.type === 'info' ? '#0EA5E9' : 
                     toast.type === 'warning' ? '#F59E0B' : '#10B981'
            }}>
              {toast.type === 'error' ? <AlertCircle size={18} /> : 
               toast.type === 'info' ? <Info size={18} /> : 
               toast.type === 'warning' ? <Bell size={18} /> : <Check size={18} />}
            </div>

            <div style={{ flex: 1 }}>
              <p style={{
                margin: 0,
                color: '#FFF',
                fontSize: '14px',
                fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif"
              }}>
                {toast.type === 'error' ? 'Error' : 
                 toast.type === 'info' ? 'Update' : 
                 toast.type === 'warning' ? 'Attention' : 'Success'}
              </p>
              <p style={{
                margin: '2px 0 0 0',
                color: '#94A3B8',
                fontSize: '13px',
                fontFamily: "'DM Sans', sans-serif"
              }}>
                {toast.message}
              </p>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'none',
                border: 'none',
                color: '#475569',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = '#FFF'}
              onMouseOut={(e) => e.currentTarget.style.color = '#475569'}
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
