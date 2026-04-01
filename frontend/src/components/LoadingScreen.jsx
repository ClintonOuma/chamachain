import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

export default function LoadingScreen() {
  const [pulse, setPulse] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setPulse(p => p + 1), 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#0D0B1E',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      overflow: 'hidden'
    }}>
      {/* Dynamic Mesh Background Elements */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 100, 0],
          y: [0, -50, 0],
          rotate: [0, 45, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute',
          top: '-10%',
          right: '-10%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none'
        }}
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -80, 0],
          y: [0, 60, 0],
          rotate: [0, -30, 0]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute',
          bottom: '-15%',
          left: '-10%',
          width: '700px',
          height: '700px',
          background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
          filter: 'blur(100px)',
          pointerEvents: 'none'
        }}
      />

      {/* Center Logo and Loader */}
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <motion.div
          animate={{ 
            rotate: 360,
            scale: pulse % 2 === 0 ? 1 : 1.05
          }}
          transition={{ 
            rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
            scale: { duration: 1 }
          }}
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '24px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            marginBottom: '32px'
          }}
        >
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#0EA5E9',
              boxShadow: '0 0 15px #0EA5E9'
            }}
          />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: '32px',
            fontWeight: 800,
            color: '#FFF',
            margin: 0,
            letterSpacing: '-0.02em',
            background: 'linear-gradient(to bottom, #FFF, #94A3B8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          ChamaChain
        </motion.h1>

        <div style={{ display: 'flex', gap: '4px', marginTop: '12px' }}>
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              animate={{ 
                opacity: [0.2, 1, 0.2],
                y: [0, -3, 0]
              }}
              transition={{ 
                duration: 1, 
                repeat: Infinity, 
                delay: i * 0.2 
              }}
              style={{
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: '#0EA5E9'
              }}
            />
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '14px',
            color: '#64748B',
            marginTop: '24px',
            fontWeight: 500,
            letterSpacing: '0.05em',
            textTransform: 'uppercase'
          }}
        >
          Initializing Secure Environment
        </motion.p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;700&display=swap');
      `}</style>
    </div>
  )
}

