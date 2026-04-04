import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../services/api'
import useAuthStore from '../store/authStore'

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
    if (step === 'waiting' && contributionId) {
      pollRef.current = setInterval(async () => {
        try {
          const res = await api.get(`/mpesa/status/${contributionId}`)
          if (res.data.status === 'success') {
            clearInterval(pollRef.current)
            setStep('success')
            setTimeout(() => { onSuccess(); onClose() }, 2000)
          } else if (res.data.status === 'failed') {
            clearInterval(pollRef.current)
            setStep('failed')
            setError('Payment was cancelled or failed. Please try again.')
          }
        } catch (e) {}
      }, 3000)
    }
    return () => clearInterval(pollRef.current)
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
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
              style={{ fontSize: '64px', marginBottom: '16px' }}>📱</motion.div>
            <h3 style={{ fontFamily: 'Syne', fontSize: '20px', color: '#F8FAFC', marginBottom: '8px' }}>Check Your Phone!</h3>
            <p style={{ fontFamily: 'DM Sans', color: '#94A3B8', marginBottom: '8px' }}>
              An M-Pesa prompt has been sent to <strong style={{ color: '#0EA5E9' }}>+254{phone}</strong>
            </p>
            <p style={{ fontFamily: 'DM Sans', color: '#64748B', fontSize: '13px', marginBottom: '24px' }}>
              Enter your M-Pesa PIN to complete the payment of <strong style={{ color: '#10B981' }}>KES {Number(amount).toLocaleString()}</strong>
            </p>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{ width: '32px', height: '32px', borderRadius: '50%', border: '3px solid rgba(14,165,233,0.2)', borderTop: '3px solid #0EA5E9', margin: '0 auto 16px' }} />
            <p style={{ fontFamily: 'DM Sans', fontSize: '12px', color: '#475569' }}>Waiting for confirmation...</p>
            <button onClick={onClose} style={{ marginTop: '16px', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontFamily: 'DM Sans', fontSize: '13px' }}>Cancel</button>
          </div>
        )}

        {step === 'success' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
              style={{ fontSize: '64px', marginBottom: '16px' }}>✅</motion.div>
            <h3 style={{ fontFamily: 'Syne', fontSize: '22px', color: '#10B981', marginBottom: '8px' }}>Payment Confirmed!</h3>
            <p style={{ fontFamily: 'DM Sans', color: '#94A3B8' }}>
              KES {Number(amount).toLocaleString()} has been added to <strong style={{ color: '#F8FAFC' }}>{chamaName}</strong>
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