import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { LayoutDashboard, Users, Wallet, CreditCard, Bot, Bell, Settings, LogOut, ChevronDown, TrendingUp } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import api from '../services/api'
import useAuthStore from '../store/authStore'
import { getAiServiceUrl } from '../config/apiBase'



// ─── Shimmer skeleton ─────────────────────────────────────────────────────────
function Shimmer({ h = 120, br = 20 }) {
  return <div style={{ height: h, borderRadius: br, background: 'rgba(255,255,255,0.04)', animation: 'shimmer 1.5s ease infinite' }} />
}

// ─── Animated score arc ───────────────────────────────────────────────────────
function ScoreGauge({ score = 0 }) {
  const R = 70, C = 2 * Math.PI * R
  const color = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444'
  const offset = C * (1 - score / 100)
  return (
    <svg width="180" height="180" viewBox="0 0 180 180">
      <circle cx="90" cy="90" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" />
      <circle cx="90" cy="90" r={R} fill="none" stroke={color} strokeWidth="14"
        strokeDasharray={C} strokeDashoffset={offset}
        strokeLinecap="round" transform="rotate(-90 90 90)"
        style={{ transition: 'stroke-dashoffset 1.5s ease, stroke 0.5s' }} />
      <text x="90" y="85" textAnchor="middle" fill="#FFF" fontSize="42" fontWeight="700" fontFamily="Syne,sans-serif">{score}</text>
      <text x="90" y="108" textAnchor="middle" fill="#94A3B8" fontSize="13" fontFamily="DM Sans,sans-serif">Credit Score</text>
    </svg>
  )
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
function ScoreBar({ label, value, max, desc, delay = 0 }) {
  const pct = max ? (value / max) * 100 : 0
  const color = pct >= 70 ? '#10B981' : pct >= 40 ? '#F59E0B' : '#EF4444'
  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay }}
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '16px 20px', marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ color: '#F8FAFC', fontSize: 15, fontWeight: 600 }}>{label}</span>
        <span style={{ color, fontSize: 14, fontWeight: 700 }}>{value} / {max}</span>
      </div>
      <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, marginBottom: 8 }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1.2, delay, ease: 'easeOut' }}
          style={{ height: '100%', background: color, borderRadius: 4 }} />
      </div>
      <div style={{ color: '#64748B', fontSize: 12 }}>{desc}</div>
    </motion.div>
  )
}

// ─── Risk badge ───────────────────────────────────────────────────────────────
function RiskBadge({ score }) {
  if (score >= 80) return <span style={{ fontSize: 16, padding: '6px 16px', borderRadius: 20, background: 'rgba(16,185,129,0.15)', color: '#10B981', fontWeight: 700 }}>✅ Low Risk</span>
  if (score >= 60) return <span style={{ fontSize: 16, padding: '6px 16px', borderRadius: 20, background: 'rgba(245,158,11,0.15)', color: '#F59E0B', fontWeight: 700 }}>⚠️ Medium Risk</span>
  if (score >= 40) return <span style={{ fontSize: 16, padding: '6px 16px', borderRadius: 20, background: 'rgba(239,68,68,0.15)', color: '#EF4444', fontWeight: 700 }}>🔴 High Risk</span>
  return <span style={{ fontSize: 16, padding: '6px 16px', borderRadius: 20, background: 'rgba(239,68,68,0.2)', color: '#EF4444', fontWeight: 700 }}>🚫 Very High Risk</span>
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AICoachPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const [chamas, setChamas] = useState([])
  const [selectedChama, setSelectedChama] = useState('')
  const [creditData, setCreditData] = useState(null)
  const [healthData, setHealthData] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchAIData = async (chamaId) => {
    setLoading(true)
    try {
      const chamasRes = await api.get('/chamas').catch(() => ({ data: { chamas: [] } }))
      setChamas(chamasRes.data.chamas || [])

      if (chamaId && user) {
        const userId = user._id || user.id
        const aiBase = getAiServiceUrl()

        let scoreRes = null
        let healthRes = null

        if (aiBase) {
          ;[scoreRes, healthRes] = await Promise.all([
            fetch(`${aiBase}/ai/credit-score/${userId}/${chamaId}`).then(r => r.json()).catch(() => null),
            fetch(`${aiBase}/ai/group-health/${chamaId}`).then(r => r.json()).catch(() => null),
          ])
        }

        if (scoreRes?.data) setCreditData(scoreRes.data)
        else setCreditData(MOCK_CREDIT)
        if (healthRes?.data) setHealthData(healthRes.data)
        else setHealthData(MOCK_HEALTH)
      }
    } catch (err) {
      console.error('AI fetch error:', err)
      if (chamaId) { setCreditData(MOCK_CREDIT); setHealthData(MOCK_HEALTH) }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAIData(selectedChama) }, [selectedChama])

  // ── Mock fallback data ─────────────────────────────────────────────────────
  const MOCK_CREDIT = {
    creditScore: 74, totalContributed: 45000, contributionCount: 9, riskLevel: 'Medium',
    breakdown: { contributionConsistency: 18, contributionAmount: 14, repaymentHistory: 20, membershipTenure: 12, contributionStreak: 10 },
    tips: [
      { text: 'Contribute consistently every month to boost your consistency score by up to 7 points.', impact: 'High' },
      { text: 'Increase your monthly contribution amount to qualify for larger loans.', impact: 'High' },
      { text: 'Avoid missing contributions — each missed month drops your score by 5 points.', impact: 'Medium' },
      { text: 'Keep your loan repayments on time to maintain your repayment history score.', impact: 'Medium' },
    ]
  }
  const MOCK_HEALTH = { groupHealthScore: 78, totalMembers: 12, activeLoans: 3, defaultedLoans: 0, totalBalance: 125000 }

  const cd = creditData
  const hd = healthData

  // ── Savings projection ────────────────────────────────────────────────────
  const monthlyRate = cd ? (cd.totalContributed / Math.max(cd.contributionCount, 1)) : 5000
  const projectionData = Array.from({ length: 13 }, (_, i) => ({
    month: i === 0 ? 'Now' : `M${i}`,
    projected: Math.round((cd?.totalContributed || 0) + monthlyRate * i),
  }))

  const TIPS_ICONS = ['💡', '⚡', '📈', '🎯']

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0D0B1E', fontFamily: "'DM Sans',sans-serif" }}>
      <div className="mesh-bg" />
      <Sidebar />
      <main style={{ marginLeft: '240px', flex: 1, padding: '32px', position: 'relative', zIndex: 1, overflowY: 'auto' }}>

        {/* Section 1 — Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
          <div>
            <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 28, color: '#FFF', fontWeight: 700, margin: '0 0 8px 0' }}>🤖 AI Financial Coach</h1>
            <p style={{ color: '#94A3B8', fontSize: 15, margin: 0 }}>Personalized insights powered by your financial behavior</p>
          </div>
          <div style={{ position: 'relative', minWidth: 240 }}>
            <select value={selectedChama} onChange={e => setSelectedChama(e.target.value)}
              style={{ width: '100%', height: 48, background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 14, color: '#F8FAFC', padding: '0 40px 0 16px', fontSize: 15, outline: 'none', appearance: 'none', fontFamily: 'inherit', cursor: 'pointer' }}>
              <option value="" style={{ background: '#12101f' }}>Select a chama…</option>
              {chamas.map(c => <option key={c._id} value={c.chamaId?._id || c._id} style={{ background: '#12101f' }}>{c.chamaId?.name || c.name}</option>)}
            </select>
            <ChevronDown size={18} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#8B5CF6', pointerEvents: 'none' }} />
          </div>
        </div>

        {/* Empty state */}
        {!selectedChama && !loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{ fontSize: 96, marginBottom: 24 }}>🤖</motion.div>
            <h2 style={{ fontFamily: "'Syne',sans-serif", color: '#FFF', fontSize: 24, margin: '0 0 12px 0' }}>Select a chama to see your AI insights</h2>
            <p style={{ color: '#64748B', fontSize: 16 }}>Your personalized credit score and financial insights will appear here.</p>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && selectedChama && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <Shimmer h={200} /><Shimmer h={320} /><Shimmer h={240} />
          </div>
        )}

        {/* Content — only when chama selected and not loading */}
        {selectedChama && !loading && cd && (
          <>
            {/* Section 2 — Credit Score Hero */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 24, padding: '32px 40px', marginBottom: 32, border: '1px solid rgba(139,92,246,0.2)', boxShadow: '0 0 0 1px rgba(14,165,233,0.1), inset 0 0 60px rgba(139,92,246,0.05)' }}>
              <div style={{ display: 'flex', gap: 48, alignItems: 'center' }}>
                <ScoreGauge score={cd.creditScore} />
                <div style={{ flex: 1 }}>
                  <div style={{ marginBottom: 20 }}><RiskBadge score={cd.creditScore} /></div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
                    {[
                      { label: 'Total Contributed', val: `KES ${(cd.totalContributed || 0).toLocaleString()}`, color: '#10B981' },
                      { label: 'Contributions Made', val: `${cd.contributionCount || 0} payments`, color: '#0EA5E9' },
                      { label: 'Max Loan Eligible', val: `Up to KES ${((cd.totalContributed || 0) * 3).toLocaleString()}`, color: '#8B5CF6' },
                    ].map((s, i) => (
                      <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: '16px 20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ color: '#64748B', fontSize: 12, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 700, color: s.color }}>{s.val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Two column layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '5fr 4fr', gap: 32, marginBottom: 32 }}>

              {/* Section 3 — Score Breakdown */}
              <div>
                <h2 style={{ fontFamily: "'Syne',sans-serif", color: '#FFF', fontSize: 20, fontWeight: 700, margin: '0 0 20px 0' }}>Score Breakdown</h2>
                {cd.breakdown && [
                  { label: 'Contribution Consistency', key: 'contributionConsistency', max: 25, desc: 'How regularly you contribute each cycle' },
                  { label: 'Contribution Amount', key: 'contributionAmount', max: 20, desc: 'How much you contribute relative to group average' },
                  { label: 'Repayment History', key: 'repaymentHistory', max: 25, desc: 'Track record of repaying loans on time' },
                  { label: 'Membership Tenure', key: 'membershipTenure', max: 15, desc: 'How long you have been a member' },
                  { label: 'Contribution Streak', key: 'contributionStreak', max: 15, desc: 'Consecutive months without missing a payment' },
                ].map((bar, i) => (
                  <ScoreBar key={bar.key} label={bar.label} value={cd.breakdown[bar.key] || 0} max={bar.max} desc={bar.desc} delay={i * 0.1} />
                ))}
              </div>

              {/* Section 4 — AI Tips */}
              <div>
                <h2 style={{ fontFamily: "'Syne',sans-serif", color: '#FFF', fontSize: 20, fontWeight: 700, margin: '0 0 20px 0' }}>💡 Personalized Insights</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {(cd.tips || []).map((tip, i) => {
                    const impactColor = tip.impact === 'High' ? '#EF4444' : tip.impact === 'Medium' ? '#F59E0B' : '#10B981'
                    return (
                      <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        style={{ background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.15)', borderLeft: '3px solid #8B5CF6', borderRadius: 16, padding: '18px 20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                            <span style={{ fontSize: 20, flexShrink: 0 }}>{TIPS_ICONS[i % TIPS_ICONS.length]}</span>
                            <p style={{ color: '#CBD5E1', fontSize: 14, margin: 0, lineHeight: 1.6 }}>{tip.text}</p>
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: `${impactColor}18`, color: impactColor, whiteSpace: 'nowrap', flexShrink: 0 }}>
                            {tip.impact} Impact
                          </span>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Section 5 — Group Health */}
            {hd && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 24, padding: '28px 32px', marginBottom: 32 }}>
                <h2 style={{ fontFamily: "'Syne',sans-serif", color: '#FFF', fontSize: 20, fontWeight: 700, margin: '0 0 20px 0' }}>🏦 Group Health Score</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 48 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 56, fontWeight: 700, color: hd.groupHealthScore >= 80 ? '#10B981' : hd.groupHealthScore >= 60 ? '#F59E0B' : '#EF4444', lineHeight: 1 }}>{hd.groupHealthScore}</div>
                    <div style={{ color: '#64748B', fontSize: 14, marginTop: 4 }}>{hd.groupHealthScore >= 80 ? 'Excellent' : hd.groupHealthScore >= 60 ? 'Good' : hd.groupHealthScore >= 40 ? 'Fair' : 'Poor'}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 16, flex: 1 }}>
                    {[
                      { label: 'Total Members', val: hd.totalMembers, color: '#0EA5E9' },
                      { label: 'Active Loans', val: hd.activeLoans, color: '#F59E0B' },
                      { label: 'Defaulted Loans', val: hd.defaultedLoans, color: hd.defaultedLoans > 0 ? '#EF4444' : '#10B981' },
                      { label: 'Group Balance', val: `KES ${(hd.totalBalance || 0).toLocaleString()}`, color: '#10B981' },
                    ].map((s, i) => (
                      <div key={i} style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '16px', textAlign: 'center' }}>
                        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 700, color: s.color, marginBottom: 6 }}>{s.val}</div>
                        <div style={{ color: '#64748B', fontSize: 12 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Section 6 — Savings Projection */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 24, padding: '28px 32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontFamily: "'Syne',sans-serif", color: '#FFF', fontSize: 20, fontWeight: 700, margin: 0 }}>📈 Savings Projection</h2>
                <div style={{ display: 'flex', gap: 16 }}>
                  {[50000, 100000, 500000].map(m => (
                    <span key={m} style={{ fontSize: 12, color: '#64748B' }}>
                      <span style={{ display: 'inline-block', width: 16, borderTop: '2px dashed #475569', verticalAlign: 'middle', marginRight: 4 }} />
                      KES {(m/1000).toFixed(0)}K
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ color: '#64748B', fontSize: 13, marginBottom: 16 }}>
                Based on your current average contribution of KES {Math.round(monthlyRate).toLocaleString()}/month
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={projectionData}>
                  <XAxis dataKey="month" stroke="#475569" tick={{ fill: '#94A3B8', fontSize: 12 }} />
                  <YAxis stroke="#475569" tick={{ fill: '#94A3B8', fontSize: 12 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ background: '#1a1625', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#FFF' }} formatter={v => [`KES ${v.toLocaleString()}`, 'Projected']} />
                  <ReferenceLine y={50000}  stroke="#475569" strokeDasharray="4 4" />
                  <ReferenceLine y={100000} stroke="#475569" strokeDasharray="4 4" />
                  <ReferenceLine y={500000} stroke="#475569" strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="projected" stroke="#8B5CF6" strokeWidth={2.5} dot={{ fill: '#8B5CF6', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          </>
        )}
      </main>

      <style>{`
        @keyframes shimmer { 0%,100% { opacity: 0.4; } 50% { opacity: 0.8; } }
        @media (max-width: 900px) { main { margin-left: 0 !important; padding: 20px !important; } aside { display: none !important; } }
      `}</style>
    </div>
  )
}
