import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../services/api'
import useAuthStore from '../store/authStore'
import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

function CountdownBar({ duration, onComplete }) { 
  const [timeLeft, setTimeLeft] = useState(duration) 

  useEffect(() => { 
    const timer = setInterval(() => { 
      setTimeLeft(prev => { 
        if (prev <= 1) { 
          clearInterval(timer) 
          return 0 
        } 
        return prev - 1 
      }) 
    }, 1000) 
    return () => clearInterval(timer) 
  }, []) 

  const pct = (timeLeft / duration) * 100 

  return ( 
    <div style={{ marginBottom: '8px' }}> 
      <div style={{ height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: '6px' }}> 
        <motion.div 
          animate={{ width: `${pct}%` }} 
          style={{ height: '100%', background: timeLeft > 10 ? '#10B981' : '#F59E0B', borderRadius: '2px', transition: 'width 1s linear' }} 
        /> 
      </div> 
      <p style={{ fontFamily: 'DM Sans', fontSize: '11px', color: '#475569' }}> 
        Auto-confirms in {timeLeft} s 
      </p> 
    </div> 
  ) 
} 

export default function ContributeModal({ chamaId, chamaName, onClose, onSuccess }) {
  const { user } = useAuthStore()
  const [method, setMethod] = useState('mpesa')
  const [amount, setAmount] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState('form') // form | waiting | success | failed
  const [contributionId, setContributionId] = useState(null)
  const pollRef = useRef(null)

  // Pre-fill phone from user profile
  useEffect(() => {
    if (user?.phone) {
      const p = user.phone.replace('+254', '').replace('254', '')
      setPhone(p)
    }
  }, [user])

  // Poll for payment status
  useEffect(() => {
    if (step !== 'waiting' || !contributionId) return

    // Socket listener for instant update
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] })
    const userId = JSON.parse(localStorage.getItem('user') || '{}')
    const uid = userId?.id || userId?._id
    if (uid) socket.emit('join', uid)

    socket.on('contribution_confirmed', (data) => {
      if (data.contributionId?.toString() === contributionId?.toString()) {
        clearInterval(pollRef.current)
        setStep('success')
        socket.disconnect()
        setTimeout(() => { onSuccess(); onClose() }, 2500)
      }
    })

    // Also poll as backup every 3 seconds
    pollRef.current = setInterval(async () => {
      try {
        const res = await api.get(`/mpesa/status/${contributionId}`)
        if (res.data.status === 'success') {
          clearInterval(pollRef.current)
          setStep('success')
          socket.disconnect()
          setTimeout(() => { onSuccess(); onClose() }, 2500)
        } else if (res.data.status === 'failed') {
          clearInterval(pollRef.current)
          setStep('failed')
          socket.disconnect()
          setError('Payment was cancelled or failed. Please try again.')
        }
      } catch (e) {}
    }, 3000)

    return () => {
      clearInterval(pollRef.current)
      socket.disconnect()
    }
  }, [step, contributionId])

  const handleMpesaContribute = async () => {
    if (!amount || Number(amount) < 1) return setError('Enter a valid amount')
    if (!phone || phone.length < 9) return setError('Enter a valid phone number')
    setLoading(true)
    setError('')
    try {
      const fullPhone = '+254' + phone.replace(/^0/, '')
      const res = await api.post('/mpesa/stk-push', {
        chamaId,
        amount: Number(amount),
        phone: fullPhone
      })
      setContributionId(res.data.contributionId)
      setStep('waiting')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate payment')
    } finally {
      setLoading(false)
    }
  }

  const handleManualContribute = async () => {
    if (!amount || Number(amount) < 1) return setError('Enter a valid amount')
    setLoading(true)
    setError('')
    try {
      await api.post('/contributions/initiate', {
        chamaId,
        amount: Number(amount),
        mpesaPhone: phone ? '+254' + phone.replace(/^0/, '') : user?.phone || ''
      })
      setStep('success')
      setTimeout(() => { onSuccess(); onClose() }, 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record contribution')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card" style={{ width: '440px', padding: '36px', position: 'relative' }}>

        {/* Close button */}
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '20px' }}>✕</button>

        {step === 'form' && (
          <>
            <h3 style={{ fontFamily: 'Syne', fontSize: '22px', color: '#F8FAFC', marginBottom: '4px' }}>💸 Contribute</h3>
            <div style={{ display: 'inline-block', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '20px', padding: '3px 10px', marginBottom: '16px' }}>
              <span style={{ fontFamily: 'DM Sans', fontSize: '11px', color: '#F59E0B', fontWeight: 600 }}>
                🧪 Sandbox Mode — No real money
              </span>
            </div>
            <p style={{ fontFamily: 'DM Sans', color: '#64748B', fontSize: '14px', marginBottom: '24px' }}>{chamaName}</p>

            {/* Method selector */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '4px' }}>
              {[
                { id: 'mpesa', label: '📱 M-Pesa STK Push' },
                { id: 'manual', label: '🏦 Manual/Bank' }
              ].map(m => (
                <button key={m.id} onClick={() => setMethod(m.id)}
                  style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans', fontSize: '13px', fontWeight: 600, background: method === m.id ? '#0EA5E9' : 'transparent', color: method === m.id ? 'white' : '#64748B', transition: 'all 0.2s' }}>
                  {m.label}
                </button>
              ))}
            </div>

            {/* Amount */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontFamily: 'DM Sans', fontSize: '13px', color: '#64748B', display: 'block', marginBottom: '8px' }}>Amount (KES)</label>
              <input type="number" placeholder="Enter amount e.g. 1000" value={amount} onChange={e => setAmount(e.target.value)} min="1" />
            </div>

            {method === 'mpesa' && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontFamily: 'DM Sans', fontSize: '13px', color: '#64748B', display: 'block', marginBottom: '8px' }}>M-Pesa Phone</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 16px' }}>
                  <span style={{ color: '#F8FAFC', fontFamily: 'DM Sans', flexShrink: 0 }}>🇰🇪 +254</span>
                  <input type="tel" placeholder="7XXXXXXXX" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                    style={{ background: 'transparent', border: 'none', outline: 'none', color: '#F8FAFC', fontFamily: 'DM Sans', flex: 1, padding: 0 }} />
                </div>
                <p style={{ fontFamily: 'DM Sans', fontSize: '12px', color: '#64748B', marginTop: '6px' }}>
                  📲 You will receive a prompt on this number to enter your M-Pesa PIN
                </p>
              </div>
            )}

            {method === 'manual' && (
              <div style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                <p style={{ fontFamily: 'DM Sans', fontSize: '13px', color: '#94A3B8', margin: '0 0 8px', fontWeight: 600 }}>Bank Transfer Details:</p>
                <p style={{ fontFamily: 'DM Sans', fontSize: '13px', color: '#F8FAFC', margin: '0 0 4px' }}>Bank: <strong>Equity Bank Kenya</strong></p>
                <p style={{ fontFamily: 'DM Sans', fontSize: '13px', color: '#F8FAFC', margin: '0 0 4px' }}>Account: <strong>0123456789</strong></p>
                <p style={{ fontFamily: 'DM Sans', fontSize: '13px', color: '#F8FAFC', margin: '0 0 4px' }}>Name: <strong>ChamaChain Limited</strong></p>
                <p style={{ fontFamily: 'DM Sans', fontSize: '12px', color: '#F59E0B', margin: '8px 0 0' }}>⚠️ Use your name as reference. Treasurer will confirm your payment.</p>
              </div>
            )}

            {error && <p style={{ color: '#EF4444', fontFamily: 'DM Sans', fontSize: '13px', marginBottom: '16px' }}>{error}</p>}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
              <button className="btn-primary" style={{ flex: 1 }} disabled={loading}
                onClick={method === 'mpesa' ? handleMpesaContribute : handleManualContribute}>
                {loading ? 'Processing...' : method === 'mpesa' ? '📱 Send STK Push' : '✅ Record Payment'}
              </button>
            </div>
          </>
        )}

        {step === 'waiting' && ( 
  <div style={{ textAlign: 'center', padding: '20px 0' }}> 

    {/* Animated phone */} 
    <motion.div 
      animate={{ scale: [1, 1.05, 1] }} 
      transition={{ duration: 1.5, repeat: Infinity }} 
      style={{ fontSize: '64px', marginBottom: '16px' }} 
    >📱</motion.div> 

    <h3 style={{ fontFamily: 'Syne', fontSize: '20px', color: '#F8FAFC', marginBottom: '8px' }}> 
      M-Pesa Payment Initiated 
    </h3> 

    <p style={{ fontFamily: 'DM Sans', color: '#94A3B8', marginBottom: '20px', fontSize: '14px', lineHeight: 1.6 }}> 
      A payment prompt of <strong style={{ color: '#10B981' }}>KES {Number(amount).toLocaleString()}</strong>  has been sent 
    </p> 

    {/* Simulated M-Pesa prompt card */} 
    <div style={{ 
      background: 'rgba(16,185,129,0.08)', 
      border: '1px solid rgba(16,185,129,0.2)', 
      borderRadius: '16px', 
      padding: '20px', 
      marginBottom: '20px', 
      textAlign: 'left' 
    }}> 
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}> 
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>M</div> 
        <div> 
          <p style={{ margin: 0, fontFamily: 'DM Sans', fontSize: '13px', color: '#F8FAFC', fontWeight: 700 }}>M-PESA</p> 
          <p style={{ margin: 0, fontFamily: 'DM Sans', fontSize: '11px', color: '#64748B' }}>Lipa na M-Pesa</p> 
        </div> 
      </div> 
      <p style={{ fontFamily: 'DM Sans', fontSize: '13px', color: '#94A3B8', margin: '0 0 6px' }}> 
        Pay <strong style={{ color: '#F8FAFC' }}>KES {Number(amount).toLocaleString()}</strong>  to 
      </p> 
      <p style={{ fontFamily: 'DM Sans', fontSize: '13px', color: '#94A3B8', margin: '0 0 6px' }}> 
        <strong style={{ color: '#F8FAFC' }}>ChamaChain - {chamaName}</strong> 
      </p> 
      <p style={{ fontFamily: 'DM Sans', fontSize: '13px', color: '#94A3B8', margin: '0 0 12px' }}> 
        Ref: <strong style={{ color: '#F8FAFC' }}>CC-{chamaId?.toString().slice(-6).toUpperCase()}</strong> 
      </p> 
      <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}> 
        <span style={{ fontFamily: 'DM Sans', fontSize: '12px', color: '#64748B' }}>Enter M-Pesa PIN:</span> 
        <span style={{ fontFamily: 'monospace', fontSize: '16px', color: '#F8FAFC', letterSpacing: '4px' }}>● ● ● ●</span> 
      </div> 
    </div> 

    {/* Progress indicator */} 
    <div style={{ marginBottom: '16px' }}> 
      <motion.div 
        animate={{ rotate: 360 }} 
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} 
        style={{ width: '28px', height: '28px', borderRadius: '50%', border: '3px solid rgba(16,185,129,0.2)', borderTop: '3px solid #10B981', margin: '0 auto 10px' }} 
      /> 
      <p style={{ fontFamily: 'DM Sans', fontSize: '13px', color: '#64748B' }}> 
        Waiting for PIN confirmation... 
      </p> 
    </div> 

    {/* Countdown */} 
    <CountdownBar duration={30} onComplete={() => {}} /> 

    <button 
      onClick={() => { clearInterval(pollRef.current); onClose() }} 
      style={{ marginTop: '12px', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontFamily: 'DM Sans', fontSize: '13px' }}> 
      Cancel 
    </button> 
  </div> 
)}

        {step === 'success' && ( 
  <div style={{ textAlign: 'center', padding: '10px 0' }}> 
    <motion.div 
      initial={{ scale: 0 }} 
      animate={{ scale: 1 }} 
      transition={{ type: 'spring', stiffness: 200 }} 
      style={{ fontSize: '56px', marginBottom: '12px' }} 
    >✅</motion.div> 

    <h3 style={{ fontFamily: 'Syne', fontSize: '22px', color: '#10B981', marginBottom: '8px' }}> 
      Payment Confirmed! 
    </h3> 

    {/* Receipt */} 
    <div style={{ 
      background: 'rgba(16,185,129,0.08)', 
      border: '1px solid rgba(16,185,129,0.2)', 
      borderRadius: '16px', 
      padding: '20px', 
      textAlign: 'left', 
      marginBottom: '20px' 
    }}> 
      <p style={{ fontFamily: 'DM Sans', fontSize: '12px', color: '#64748B', margin: '0 0 12px', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.1em' }}>M-Pesa Receipt</p> 
      {[ 
        { label: 'Amount', value: `KES ${Number(amount).toLocaleString()}` }, 
        { label: 'To', value: chamaName }, 
        { label: 'Status', value: '✅ Confirmed' }, 
        { label: 'Date', value: new Date().toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) } 
      ].map((item, i) => ( 
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}> 
          <span style={{ fontFamily: 'DM Sans', fontSize: '13px', color: '#64748B' }}>{item.label}</span> 
          <span style={{ fontFamily: 'DM Sans', fontSize: '13px', color: '#F8FAFC', fontWeight: 600 }}>{item.value}</span> 
        </div> 
      ))} 
    </div> 

    <p style={{ fontFamily: 'DM Sans', color: '#64748B', fontSize: '13px' }}> 
      Closing automatically... 
    </p> 
  </div> 
)}

        {step === 'failed' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>❌</div>
            <h3 style={{ fontFamily: 'Syne', fontSize: '20px', color: '#EF4444', marginBottom: '8px' }}>Payment Failed</h3>
            <p style={{ fontFamily: 'DM Sans', color: '#94A3B8', marginBottom: '24px' }}>{error}</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn-ghost" style={{ flex: 1 }} onClick={onClose}>Close</button>
              <button className="btn-primary" style={{ flex: 1 }} onClick={() => { setStep('form'); setError('') }}>Try Again</button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}