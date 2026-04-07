import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import api from '../services/api'
import useAuthStore from '../store/authStore'

const AI_URL = import.meta.env.VITE_AI_URL || 'http://127.0.0.1:8000'

function CountdownBar({ duration, onComplete }) { 
  const [timeLeft, setTimeLeft] = useState(duration) 

  useEffect(() => { 
    const timer = setInterval(() => { 
      setTimeLeft(prev => { 
        if (prev <= 1) { 
          clearInterval(timer) 
          onComplete()
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
        Auto-closes in {timeLeft} s 
      </p> 
    </div> 
  ) 
}

function LoanDisbursementStatus({ step, amount, phone, chamaName, loanId, onClose, onSuccess }) {
  if (step === 'waiting') {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ fontSize: '64px', marginBottom: '16px' }}
        >💸</motion.div>
        <h3 style={{ fontFamily: 'Syne', fontSize: '20px', color: '#F8FAFC', marginBottom: '8px' }}>
          Disbursing Loan
        </h3>
        <p style={{ fontFamily: 'DM Sans', color: '#94A3B8', marginBottom: '20px', fontSize: '14px', lineHeight: 1.6 }}>
          <strong style={{ color: '#10B981' }}>KES {Number(amount).toLocaleString()}</strong> is being sent to your M-Pesa.
        </p>
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
              <p style={{ margin: 0, fontFamily: 'DM Sans', fontSize: '11px', color: '#64748B' }}>Sending money</p>
            </div>
          </div>
          <p style={{ fontFamily: 'DM Sans', fontSize: '13px', color: '#94A3B8', margin: '0 0 6px' }}>
            Sending <strong style={{ color: '#F8FAFC' }}>KES {Number(amount).toLocaleString()}</strong> to
          </p>
          <p style={{ fontFamily: 'DM Sans', fontSize: '13px', color: '#94A3B8', margin: '0 0 12px' }}>
            <strong style={{ color: '#F8FAFC' }}>+254{phone}</strong>
          </p>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'DM Sans', fontSize: '12px', color: '#64748B' }}>Status:</span>
            <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <span style={{ fontFamily: 'monospace', fontSize: '14px', color: '#F59E0B'}}>PROCESSING...</span>
            </motion.div>
          </div>
        </div>
        <CountdownBar duration={15} onComplete={() => { onSuccess(); onClose(); }} />
      </div>
    )
  }

  if (step === 'success') {
    return (
      <div style={{ textAlign: 'center', padding: '10px 0' }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          style={{ fontSize: '56px', marginBottom: '12px' }}
        >✅</motion.div>
        <h3 style={{ fontFamily: 'Syne', fontSize: '22px', color: '#10B981', marginBottom: '8px' }}>
          Loan Disbursed!
        </h3>
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
            { label: 'To', value: `+254${phone}` },
            { label: 'From', value: chamaName },
            { label: 'Status', value: '✅ Confirmed' },
            { label: 'Date', value: new Date().toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
              <span style={{ fontFamily: 'DM Sans', fontSize: '13px', color: '#64748B' }}>{item.label}</span>
              <span style={{ fontFamily: 'DM Sans', fontSize: '13px', color: '#F8FAFC', fontWeight: 600 }}>{item.value}</span>
            </div>
          ))}
        </div>
        <p style={{ fontFamily: 'DM Sans', color: '#64748B', fontSize: '13px' }}>
          Closing automatically...
        </p>
      </div>
    )
  }

  return null
}

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
  const [disbursementStep, setDisbursementStep] = useState('options') // options | waiting | success

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

  useEffect(() => {
    if (disbursementStep === 'success') {
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 2000)
    }
  }, [disbursementStep])

  const handleDisburse = async () => {
    if (!loan) return
    setDisburseLoading(true)
    setError('')
    setDisbursementStep('waiting')
    try {
      if (disburseMethod === 'mpesa') {
        const fullPhone = '+254' + disbursePhone.replace(/^0/, '')
        // Simulate delay for demo
        await new Promise(resolve => setTimeout(resolve, 5000));
        await api.post('/mpesa/disburse', { loanId: loan._id, phone: fullPhone })
      } else {
        await api.patch(`/loans/loans/${loan._id}/manual-disburse`, { reference: 'MANUAL-' + Date.now() })
      }
      setDisbursementStep('success')
    } catch (err) {
      setError(err.response?.data?.message || 'Disbursement failed')
      setDisbursementStep('options') // Go back to options on failure
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
            {disbursementStep === 'options' && (
              <>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
                    style={{ fontSize: '56px', marginBottom: '12px' }}>🎉</motion.div>
                  <h3 style={{ fontFamily: 'Syne', fontSize: '22px', color: '#10B981', marginBottom: '8px' }}>Loan Approved!</h3>
                  <p style={{ fontFamily: 'DM Sans', color: '#94A3B8', fontSize: '14px', marginBottom: '4px' }}>
                    KES {loan?.amount?.toLocaleString()} approved
                  </p>
                  <p style={{ fontFamily: 'DM Sans', color: '#64748B', fontSize: '13px' }}>
                    Credit Score: <strong style={{ color: scoreColor }}>{creditScore}/100</strong>
                  </p>
                </div>

                <h4 style={{ fontFamily: 'Syne', fontSize: '16px', color: '#F8FAFC', marginBottom: '16px' }}>
                  Choose how to receive your loan:
                </h4>

                {/* Method selector */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '4px' }}>
                  {[
                    { id: 'mpesa', label: '📱 M-Pesa' },
                    { id: 'manual', label: '🏦 Bank Transfer' }
                  ].map(m => (
                    <button key={m.id} onClick={() => setDisburseMethod(m.id)}
                      style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans', fontSize: '13px', fontWeight: 600, background: disburseMethod === m.id ? '#10B981' : 'transparent', color: disburseMethod === m.id ? 'white' : '#64748B', transition: 'all 0.2s' }}>
                      {m.label}
                    </button>
                  ))}
                </div>

                {disburseMethod === 'mpesa' && (
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontFamily: 'DM Sans', fontSize: '13px', color: '#64748B', display: 'block', marginBottom: '8px' }}>
                      Receive on M-Pesa number:
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 16px' }}>
                      <span style={{ color: '#F8FAFC', fontFamily: 'DM Sans', flexShrink: 0 }}>🇰🇪 +254</span>
                      <div style={{ width: '1px', height: '18px', background: 'rgba(255,255,255,0.1)' }} />
                      <input type="tel" value={disbursePhone}
                        onChange={e => setDisbursePhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                        placeholder="7XXXXXXXX"
                        style={{ background: 'transparent', border: 'none', outline: 'none', color: '#F8FAFC', fontFamily: 'DM Sans', flex: 1, padding: 0, fontSize: '15px' }} />
                    </div>
                    <p style={{ fontFamily: 'DM Sans', fontSize: '11px', color: '#64748B', marginTop: '6px' }}>
                      💡 Sandbox mode: Disbursement is simulated. No real money sent.
                    </p>
                  </div>
                )}

                {disburseMethod === 'manual' && (
                  <div style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                    <p style={{ fontFamily: 'DM Sans', fontSize: '13px', color: '#0EA5E9', margin: '0 0 8px', fontWeight: 600 }}>Bank Transfer Details:</p>
                    <p style={{ fontFamily: 'DM Sans', fontSize: '13px', color: '#F8FAFC', margin: '0 0 4px' }}>Bank: <strong>Equity Bank Kenya</strong></p>
                    <p style={{ fontFamily: 'DM Sans', fontSize: '13px', color: '#F8FAFC', margin: '0 0 4px' }}>Account: <strong>0123456789</strong></p>
                    <p style={{ fontFamily: 'DM Sans', fontSize: '13px', color: '#F8FAFC', margin: 0 }}>Name: <strong>ChamaChain Limited</strong></p>
                  </div>
                )}

                {error && <p style={{ color: '#EF4444', fontFamily: 'DM Sans', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn-ghost" style={{ flex: 1 }} onClick={onClose}>Later</button>
                  <button
                    onClick={handleDisburse}
                    disabled={disburseLoading || (disburseMethod === 'mpesa' && disbursePhone.length < 9)}
                    style={{ flex: 1, padding: '12px', borderRadius: '12px', background: disburseLoading ? 'rgba(16,185,129,0.5)' : 'rgba(16,185,129,0.9)', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans', fontWeight: 600 }}>
                    {disburseLoading ? '⏳ Processing...' : disburseMethod === 'mpesa' ? '📱 Receive via M-Pesa' : '✅ Confirm Bank Transfer'}
                  </button>
                </div>
              </>
            )}

            {disbursementStep !== 'options' && (
              <LoanDisbursementStatus
                step={disbursementStep}
                amount={loan?.amount}
                phone={disbursePhone}
                chamaName={chamaName}
                loanId={loan?._id}
                onClose={onClose}
                onSuccess={onSuccess}
              />
            )}
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