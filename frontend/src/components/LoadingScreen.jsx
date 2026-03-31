import { motion } from 'framer-motion'

export default function LoadingScreen() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#0D0B1E',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          border: '3px solid rgba(14,165,233,0.2)',
          borderTop: '3px solid #0EA5E9',
          marginBottom: '24px'
        }}
      />
      <p style={{
        fontFamily: 'Syne',
        fontSize: '20px',
        color: '#0EA5E9',
        margin: 0
      }}>◈ ChamaChain</p>
      <p style={{
        fontFamily: 'DM Sans',
        fontSize: '13px',
        color: '#64748B',
        marginTop: '8px'
      }}>Loading your financial world...</p>
    </div>
  )
}
