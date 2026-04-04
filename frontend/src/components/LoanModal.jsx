import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import api from '../services/api'
import useAuthStore from '../store/authStore'

const AI_URL = import.meta.env.VITE_AI_URL || 'http://127.0.0.1:8000'

export default function LoanModal({ chamaId, chamaName, membership, onClose, onSuccess }) {
  const { user } = useAuthStore()
  const [amount, setAmount] = useState('')
  const [purpose, setPurpose] = useState('business')
  const [repaymentMonths, setRepaymentMonths] = useState(3)
  const [creditScore, setCreditScore] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null) // null | approved | rejected | pending
  const [loan, setLoan] = useState(null)
  const [disburseMethod, setDisburseMethod] = useState('mpesa')
  const [disbursePhone, setDisbursePhone] = useState('')
  const [disburseLoading, setDisburseLoading] = useState(false)

  const maxAmount = (membership?.totalContributed || 0) * 3
  const interestRate = 0.10
  const totalRepayable = amount ? Number(amount) * (1 + interestRate * repaymentMonths / 12) : 0
  const monthlyRepayment = totalRepayable /  repaymentMonths

  useEffect(() => {
    if (user?.phone) {
      const p = user.phone.replace('+254', '').replace('254', '')
      setDisbursePhone(p)
    }
  }, [user])

  // Fetch credit score
  useEffect(() => {
    const fetchScore = async () => {
      try {
        const userId = user?.id || user?. _id
        const res = await fetch(`${AI_URL}/ai/credit-score/${userId}/${chamaId}`)
        const data = await res.json()
        if (data.success) setCreditScore(data.data.score)
      } catch (e) {}
    }
    fetchScore()
  }, [chamaId])

  const handleRequestLoan = async () => {
    if (!amount || Number(amount) < 500) return setError('Minimum loan amount is KES 500')
    if (Number(amount) > maxAmount) return setError(`Maximum loan is KES ${maxAmount.toLocaleString()} (3x your contributions)`)
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/loans/request', {
        chamaId,
        amount: Number(amount),
        purpose,
        repaymentMonths: Number(repaymentMonths)
      })
      setLoan(res.data.loan)
      setResult(res.data.autoDecision)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit loan request')
    } finally {
      setLoading(false)
    }
  }

  const handleDisburse = async () => {
    if (!loan) return
    setDisburseLoading(true)
    try {
      if (disburseMethod === 'mpesa') {
        const fullPhone = '+254' + disbursePhone.replace(/^0/, '')
        await api.post('/mpesa/disburse', { loanId: loan._id, phone: fullPhone })
      } else {
        await api.patch(`/loans/loans/${loan._id}/manual-disburse`, { reference: 'MANUAL-' + Date.now() })
      }
      onSuccess()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Disbursement failed')
    } finally {
      setDisburseLoading(false)
    }
  }

  const scoreColor = creditScore >= 80 ? '#10B981' : creditScore >= 60 ? '#F59E0B' : '#EF4444'

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, overflowY: 'auto', padding: '20px' }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card" style={{ width: '480px', padding: '36px', position: 'relative' }}>

        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '20px' }}>✕</button>

        {/* LOAN FORM */}
        {!result && (
          <>
            <h3 style={{ fontFamily: 'Syne', fontSize: '22px', color: '#F8FAFC', marginBottom: '4px' }}>🏛️ Request Loan</h3>
            <p style={{ fontFamily: 'DM Sans', color: '#64748B', fontSize: '14px', marginBottom: '20px' }}>{chamaName}</p>

            {/* Credit Score */}
            {creditScore !== null && (
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: 0, fontFamily: 'DM Sans', fontSize: '12px', color: '#64748B' }}>Your Credit Score</p>
                  <p style={{ margin: '4px 0 0', fontFamily: 'Syne', fontSize: '28px', fontWeight: 800, color: scoreColor }}>{creditScore}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontFamily: 'DM Sans', fontSize: '12px', color: '#64748B' }}>Auto-approval if score</p>
                  <p style={{ margin: '4px 0 0', fontFamily: 'DM Sans', fontSize: '13px', color: '#F8FAFC' }}>≥ 60 ✅ · 40-59 ⚠️ Review · &lt; 40 ❌</p>
                </div>
              </div>
            )}

            {/* Amount */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontFamily: 'DM Sans', fontSize: '13px', color: '#64748B' }}>Loan Amount (KES)</label>
                <span style={{ fontFamily: 'DM Sans', fontSize: '12px', color: '#64748B' }}>Max: KES {maxAmount.toLocaleString()}</span>
              </div>
              <input type="number" placeholder="Enter amount" value={amount} onChange={e => setAmount(e.target.value)} min="500" max={maxAmount} />
            </div>

            {/* Purpose */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontFamily: 'DM Sans', fontSize: '13px', color: '#64748B', display: 'block', marginBottom: '8px' }}>Purpose</label>
              <select value={purpose} onChange={e => setPurpose(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: '#F8FAFC', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'DM Sans' }}>
                <option value="business">🏢 Business</option>
                <option value="medical">🏥 Medical</option>
                <option value="education">📚 Education</option>
                <option value="emergency">🚨 Emergency</option>
                <option value="other">📋 Other</option>
              </select>
            </div>

            {/* Repayment period */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontFamily: 'DM Sans', fontSize: '13px', color: '#64748B', display: 'block', marginBottom: '8px' }}>Repayment Period</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[1, 2, 3, 6].map(m => (
                  <button key={m} onClick={() => setRepaymentMonths(m)}
                    style={{ flex: 1, padding: '10px', borderRadius: '10px', border: `1px solid ${repaymentMonths === m ? '#0EA5E9' : 'rgba(255,255,255,0.1)'}`, background: repaymentMonths === m ? 'rgba(14,165,233,0.15)' : 'rgba(255,255,255,0.04)', color: repaymentMonths === m ? '#0EA5E9' : '#94A3B8', cursor: 'pointer', fontFamily: 'DM Sans', fontSize: '13px', fontWeight: 600 }}>
                    {m} mo
                  </button>
                ))}
              </div>
            </div>

            {/* Loan summary */}
            {amount && Number(amount) > 0 && (
              <div style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontFamily: 'DM Sans', fontSize: '13px', color: '#94A3B8' }}>Monthly Repayment</span>
                  <span style={{ fontFamily: 'Syne', fontSize: '15px', color: '#0EA5E9', fontWeight: 700 }}>KES {monthlyRepayment.toLocaleString('en', { maximumFractionDigits: 0 })}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontFamily: 'DM Sans', fontSize: '13px', color: '#94A3B8' }}>Total Repayable</span>
                  <span style={{ fontFamily: 'Syne', fontSize: '15px', color: '#F8FAFC', fontWeight: 700 }}>KES {totalRepayable.toLocaleString('en', { maximumFractionDigits: 0 })}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'DM Sans', fontSize: '13px', color: '#94A3B8' }}>Interest (10% p.a.)</span>
                  <span style={{ fontFamily: 'DM Sans', fontSize: '13px', color: '#F59E0B' }}>KES {(totalRepayable - Number(amount)).toLocaleString('en', { maximumFractionDigits: 0 })}</span>
                </div>
              </div>
            )}

            {error && <p style={{ color: '#EF4444', fontFamily: 'DM Sans', fontSize: '13px', marginBottom: '16px' }}>{error}</p>}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
              <button className="btn-primary" style={{ flex: 1 }} disabled={loading || !amount}
                onClick={handleRequestLoan}>
                {loading ? 'Processing...' : '🤖 Submit & Get AI Decision'}
              </button>
            </div>
          </>
        )}

        {/* RESULT SCREENS */}
        {result === 'auto_approved' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
                style={{ fontSize: '56px', marginBottom: '12px' }}>🎉</motion.div>
              <h3 style={{ fontFamily: 'Syne', fontSize: '22px', color: '#10B981', marginBottom: '8px' }}>Loan Approved!</h3>
              <p style={{ fontFamily: 'DM Sans', color: '#94A3B8', fontSize: '14px' }}>
                KES {loan?.amount?.toLocaleString()} approved based on your credit score of <strong style={{ color: '#10B981' }}>{creditScore}</strong>
              </p>
            </div>

            <h4 style={{ fontFamily: 'Syne', fontSize: '16px', color: '#F8FAFC', marginBottom: '16px' }}>Choose Disbursement Method:</h4>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '4px' }}>
              {[{ id: 'mpesa', label: '📱 M-Pesa' }, { id: 'manual', label: '🏦 Bank Transfer' }].map(m => (
                <button key={m.id} onClick={() => setDisburseMethod(m.id)}
                  style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans', fontSize: '13px', fontWeight: 600, background: disburseMethod === m.id ? '#10B981' : 'transparent', color: disburseMethod === m.id ? 'white' : '#64748B', transition: 'all 0.2s' }}>
                  {m.label}
                </button>
              ))}
            </div>

            {disburseMethod === 'mpesa' && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontFamily: 'DM Sans', fontSize: '13px', color: '#64748B', display: 'block', marginBottom: '8px' }}>Receive on Phone:</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 16px' }}>
                  <span style={{ color: '#F8FAFC', fontFamily: 'DM Sans', flexShrink: 0 }}>🇰🇪 +254</span>
                  <input type="tel" value={disbursePhone} onChange={e => setDisbursePhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                    style={{ background: 'transparent', border: 'none', outline: 'none', color: '#F8FAFC', fontFamily: 'DM Sans', flex: 1, padding: 0 }} />
                </div>
              </div>
            )}

            {disburseMethod === 'manual' && (
              <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                <p style={{ fontFamily: 'DM Sans', fontSize: '13px', color: '#94A3B8', margin: '0 0 8px' }}>The admin will manually transfer to your bank account.</p>
                <p style={{ fontFamily: 'DM Sans', fontSize: '13px', color: '#F8FAFC', margin: 0 }>Share your bank details with your chama admin.</p>
              </div>
            )}

            {error && <p style={{ color: '#EF4444', fontFamily: 'DM Sans', fontSize: '13px', marginBottom: '16px' }}>{error}</p>}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn-ghost" style={{ flex: 1 }} onClick={onClose}>Later</button>
              <button
                onClick={handleDisburse}
                disabled={disburseLoading}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'rgba(16,185,129,0.9)', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans', fontWeight: 600 }}>
                {disburseLoading ? 'Sending...' : disburseMethod === 'mpesa' ? '📱 Send to M-Pesa' : '✅ Confirm Manual'}
              </button>
            </div>
          </>
        )}

        {result === 'needs_review' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '56px', marginBottom: '12px' }}>⏳</div>
            <h3 style={{ fontFamily: 'Syne', fontSize: '22px', color: '#F59E0B', marginBottom: '8px' }}>Under Review</h3>
            <p style={{ fontFamily: 'DM Sans', color: '#94A3B8', marginBottom: '8px' }}>
              Your credit score of <strong style={{ color: '#F59E0B' }}>{creditScore}</strong>  requires admin review.
            </p>
            <p style={{ fontFamily: 'DM Sans', color: '#64748B', fontSize: '13px', marginBottom: '24px' }}>
              Your admin has been notified and will review your loan request of KES {loan?.amount?.toLocaleString()} .
            </p>
            <button className="btn-primary" onClick={() => { onSuccess(); onClose() }}>OK, I'll Wait</button>
          </div>
        )}

        {result === 'auto_rejected' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '56px', marginBottom: '12px' }}>❌</div>
            <h3 style={{ fontFamily: 'Syne', fontSize: '22px', color: '#EF4444', marginBottom: '8px' }}>Application Declined</h3>
            <p style={{ fontFamily: 'DM Sans', color: '#94A3B8', marginBottom: '8px' }}>
              Your credit score of <strong style={{ color: '#EF4444' }}>{creditScore}</strong>  is too low for auto-approval.
            </p>
            <p style={{ fontFamily: 'DM Sans', color: '#64748B', fontSize: '13px', marginBottom: '24px' }}>
              Make consistent contributions to improve your score above 60 for auto-approval.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="btn-ghost" onClick={onClose}>Close</button>
              <button className="btn-primary" onClick={() => window.location.href = '/ai-coach'}>Visit AI Coach</button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}