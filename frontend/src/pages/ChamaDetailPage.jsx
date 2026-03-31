import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import {
  LayoutDashboard, Users, Wallet, CreditCard, Bot, Bell, Settings, LogOut,
  ArrowLeft, TrendingUp, Star, Plus, X, CheckCircle2, XCircle, ChevronDown,
  Download, Search, Loader2, Flame
} from 'lucide-react'
import Sidebar from '../components/Sidebar'
import api from '../services/api'
import useAuthStore from '../store/authStore'

// ─── Shared helpers ───────────────────────────────────────────────────────────

const CARD = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '20px',
  padding: '24px',
}

const BTN_PRIMARY = {
  background: '#0EA5E9', color: '#FFF', border: 'none', borderRadius: '12px',
  fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '15px',
  padding: '10px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
  boxShadow: '0 0 20px rgba(14,165,233,0.3)',
}

const ROLE_COLOR = { Admin: '#F59E0B', Treasurer: '#0EA5E9', Member: '#8B5CF6', Observer: '#64748B' }

function avatarBg(name = '') {
  const colors = ['#0EA5E9','#8B5CF6','#10B981','#F59E0B','#EF4444','#EC4899']
  return colors[name.charCodeAt(0) % colors.length]
}

function Avatar({ name = '', size = 40 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: avatarBg(name), color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: size * 0.35, flexShrink: 0 }}>
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

function Badge({ label, color }) {
  const map = { gold: ['#F59E0B','rgba(245,158,11,0.12)'], blue: ['#0EA5E9','rgba(14,165,233,0.12)'], purple: ['#8B5CF6','rgba(139,92,246,0.12)'], gray: ['#94A3B8','rgba(148,163,184,0.1)'], green: ['#10B981','rgba(16,185,129,0.12)'], red: ['#EF4444','rgba(239,68,68,0.12)'], amber: ['#F59E0B','rgba(245,158,11,0.12)'] }
  const [fg, bg] = map[color] || map.gray
  return <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '3px 10px', borderRadius: '8px', color: fg, background: bg }}>{label}</span>
}

function FloatingInput({ label, type = 'text', value, onChange, error }) {
  const [focused, setFocused] = useState(false)
  const active = focused || String(value).length > 0
  return (
    <div style={{ position: 'relative', marginBottom: '24px' }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: '14px', border: `1px solid ${error ? '#EF4444' : active ? '#0EA5E9' : 'rgba(255,255,255,0.12)'}`, pointerEvents: 'none', transition: 'border-color 0.2s' }} />
      <label style={{ position: 'absolute', left: '14px', top: active ? '0' : '50%', transform: active ? 'translateY(-50%)' : 'translateY(-50%)', fontSize: active ? '11px' : '15px', color: active ? '#0EA5E9' : '#64748B', background: active ? '#12101f' : 'transparent', padding: active ? '0 6px' : '0', transition: 'all 0.2s cubic-bezier(.4,0,.2,1)', pointerEvents: 'none', zIndex: 2, fontFamily: 'DM Sans,sans-serif', letterSpacing: active ? '0.05em' : '0', textTransform: active ? 'uppercase' : 'none' }}>{label}</label>
      <input type={type} value={value} onChange={onChange} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: '#F8FAFC', fontSize: '15px', padding: '16px', fontFamily: 'DM Sans,sans-serif', zIndex: 1, position: 'relative', boxSizing: 'border-box' }} />
      {error && <p style={{ color: '#EF4444', fontSize: '11px', marginTop: '4px', paddingLeft: '4px' }}>{error}</p>}
    </div>
  )
}



// ─── Mock data ────────────────────────────────────────────────────────────────

const BALANCE_HISTORY = [
  { month: 'Oct', balance: 45000 }, { month: 'Nov', balance: 62000 },
  { month: 'Dec', balance: 80000 }, { month: 'Jan', balance: 94000 },
  { month: 'Feb', balance: 110000 }, { month: 'Mar', balance: 125000 },
]

const MONTHLY_CONTRIBS = [
  { month: 'Oct', amount: 15000 }, { month: 'Nov', amount: 18000 },
  { month: 'Dec', amount: 22000 }, { month: 'Jan', amount: 19000 },
  { month: 'Feb', amount: 24000 }, { month: 'Mar', amount: 20000 },
]

// ─── TABS ─────────────────────────────────────────────────────────────────────

function OverviewTab({ chama, members }) {
  const topContributors = [...members].sort((a, b) => (b.totalContributed || 0) - (a.totalContributed || 0)).slice(0, 5)
  const rankColors = ['#F59E0B', '#94A3B8', '#CD7C2F', '#64748B', '#64748B']

  const score = 78
  const scoreColor = score > 80 ? '#10B981' : score > 60 ? '#F59E0B' : '#EF4444'
  const scoreLabel = score > 80 ? 'Excellent' : score > 60 ? 'Good' : score > 40 ? 'Fair' : 'Poor'

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '7fr 4fr', gap: 24 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Balance Chart */}
        <div style={CARD}>
          <h3 style={{ fontFamily: "'Syne',sans-serif", color: '#FFF', margin: '0 0 24px 0', fontSize: 18 }}>Balance History</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={BALANCE_HISTORY}>
              <XAxis dataKey="month" stroke="#475569" tick={{ fill: '#94A3B8', fontSize: 12 }} />
              <YAxis stroke="#475569" tick={{ fill: '#94A3B8', fontSize: 12 }} tickFormatter={v => `${v/1000}k`} />
              <Tooltip contentStyle={{ background: '#1a1625', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#FFF' }} formatter={v => [`KES ${v.toLocaleString()}`, 'Balance']} />
              <Line type="monotone" dataKey="balance" stroke="#0EA5E9" strokeWidth={2.5} dot={{ fill: '#0EA5E9', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Contributors */}
        <div style={CARD}>
          <h3 style={{ fontFamily: "'Syne',sans-serif", color: '#FFF', margin: '0 0 20px 0', fontSize: 18 }}>Top Contributors</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {topContributors.length === 0 ? (
              <div style={{ color: '#64748B', textAlign: 'center', padding: 24 }}>No contributions yet</div>
            ) : topContributors.map((m, i) => {
              const pct = topContributors[0].totalContributed ? ((m.totalContributed || 0) / topContributors[0].totalContributed) * 100 : 0
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ width: 24, textAlign: 'center', fontWeight: 700, color: rankColors[i], fontSize: 16 }}>{i + 1}</span>
                  <Avatar name={m.userId?.fullName || m.userId?.name || '?'} size={36} />
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#F8FAFC', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{m.userId?.fullName || 'Member'}</div>
                    <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 4 }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: rankColors[i], borderRadius: 4, transition: 'width 1s ease' }} />
                    </div>
                  </div>
                  <span style={{ color: '#0EA5E9', fontWeight: 700, fontSize: 14, minWidth: 80, textAlign: 'right' }}>KES {(m.totalContributed || 0).toLocaleString()}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Health Score */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ ...CARD, textAlign: 'center' }}>
          <h3 style={{ fontFamily: "'Syne',sans-serif", color: '#FFF', margin: '0 0 24px 0', fontSize: 18 }}>Group Health</h3>
          <div style={{ position: 'relative', width: 140, height: 140, margin: '0 auto 20px' }}>
            <svg width="140" height="140" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r="54" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
              <circle cx="70" cy="70" r="54" fill="none" stroke={scoreColor} strokeWidth="12"
                strokeDasharray={`${2 * Math.PI * 54}`}
                strokeDashoffset={`${2 * Math.PI * 54 * (1 - score / 100)}`}
                strokeLinecap="round" transform="rotate(-90 70 70)"
                style={{ transition: 'stroke-dashoffset 1.5s ease, stroke 0.5s' }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 32, fontWeight: 700, color: scoreColor }}>{score}</span>
              <span style={{ fontSize: 12, color: '#94A3B8' }}>/ 100</span>
            </div>
          </div>
          <Badge label={scoreLabel} color={score > 80 ? 'green' : score > 60 ? 'amber' : 'red'} />
          <p style={{ color: '#64748B', fontSize: 13, marginTop: 16 }}>Based on payment regularity, loan repayment & member growth.</p>
        </div>

        {/* Quick Stats */}
        {[
          { label: 'Total In', val: `KES ${(125000).toLocaleString()}`, color: '#10B981' },
          { label: 'Active Loans', val: '2', color: '#0EA5E9' },
          { label: 'Avg Contribution', val: 'KES 5,000', color: '#8B5CF6' },
        ].map((s, i) => (
          <div key={i} style={{ ...CARD, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px' }}>
            <span style={{ color: '#94A3B8', fontSize: 14 }}>{s.label}</span>
            <span style={{ color: s.color, fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 18 }}>{s.val}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function MembersTab({ members, isAdmin, chamaId }) {
  const [query, setQuery] = useState('')
  const filtered = members.filter(m => (m.userId?.fullName || '').toLowerCase().includes(query.toLowerCase()))

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ position: 'relative', width: 280 }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search members…"
            style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#F8FAFC', padding: '10px 12px 10px 40px', fontFamily: 'DM Sans,sans-serif', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
        {filtered.map((m, i) => {
          const name = m.userId?.fullName || 'Member'
          const role = m.role || 'Member'
          const roleColorKey = role === 'Admin' ? 'gold' : role === 'Treasurer' ? 'blue' : 'purple'
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              style={{ ...CARD, textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <div style={{ position: 'relative' }}>
                  <Avatar name={name} size={56} />
                  {(m.streak || 0) > 3 && <span style={{ position: 'absolute', bottom: -4, right: -4, fontSize: 16 }}>🔥</span>}
                </div>
              </div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, color: '#FFF', marginBottom: 8 }}>{name}</div>
              <div style={{ marginBottom: 12 }}><Badge label={role} color={roleColorKey} /></div>
              <div style={{ color: '#10B981', fontSize: 13, fontWeight: 600 }}>KES {(m.totalContributed || 0).toLocaleString()} contributed</div>
              {isAdmin && (
                <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'center' }}>
                  <button style={{ fontSize: 12, padding: '6px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: 'none', cursor: 'pointer' }}>Remove</button>
                </div>
              )}
            </motion.div>
          )
        })}
        {filtered.length === 0 && <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#64748B', padding: 40 }}>No members found</div>}
      </div>
    </div>
  )
}

function ContributionsTab({ contributions, chamaId, onContribute }) {
  const totalMonth = contributions.filter(c => {
    const d = new Date(c.createdAt)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).reduce((s, c) => s + (c.amount || 0), 0)

  const STATUS_COLOR = { completed: 'green', pending: 'amber', failed: 'red', success: 'green' }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <div style={{ color: '#94A3B8', fontSize: 13, marginBottom: 4 }}>Contributed this month</div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 28, fontWeight: 700, color: '#0EA5E9' }}>KES {totalMonth.toLocaleString()}</div>
        </div>
        <button onClick={onContribute} style={BTN_PRIMARY}><Plus size={16} />Contribute</button>
      </div>
      <div style={CARD}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Member', 'Amount', 'M-Pesa Ref', 'Date', 'Status'].map(h => (
                <th key={h} style={{ textAlign: 'left', color: '#64748B', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 0 16px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {contributions.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: '#64748B', padding: 48 }}>No contributions yet</td></tr>
            ) : contributions.map((c, i) => (
              <motion.tr key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
                <td style={{ padding: '14px 0', color: '#F8FAFC', fontSize: 14 }}>{c.userId?.fullName || 'Member'}</td>
                <td style={{ padding: '14px 0', color: '#0EA5E9', fontWeight: 700, fontSize: 14 }}>KES {(c.amount || 0).toLocaleString()}</td>
                <td style={{ padding: '14px 0', color: '#94A3B8', fontSize: 13, fontFamily: 'monospace' }}>{c.mpesaRef || '—'}</td>
                <td style={{ padding: '14px 0', color: '#94A3B8', fontSize: 13 }}>{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}</td>
                <td style={{ padding: '14px 0' }}><Badge label={c.status || 'Pending'} color={STATUS_COLOR[c.status] || 'amber'} /></td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function LoansTab({ loans, isAdmin, chamaId }) {
  const riskColor = r => r === 'Low' ? 'green' : r === 'Medium' ? 'amber' : 'red'
  const statusColor = s => ({ approved: 'green', pending: 'amber', rejected: 'red', active: 'blue' })[s] || 'gray'
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
        <button style={BTN_PRIMARY}><Plus size={16} />Request Loan</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {loans.length === 0 ? (
          <div style={{ ...CARD, textAlign: 'center', padding: 48 }}>
            <CreditCard size={48} style={{ color: '#0EA5E9', marginBottom: 16, opacity: 0.5 }} />
            <div style={{ color: '#FFF', fontFamily: "'Syne',sans-serif", marginBottom: 8 }}>No loans yet</div>
            <div style={{ color: '#64748B', fontSize: 14 }}>Request a loan to get started</div>
          </div>
        ) : loans.map((loan, i) => {
          const pct = loan.totalRepayable ? ((loan.amountRepaid || 0) / loan.totalRepayable * 100) : 0
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} style={CARD}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <div style={{ fontFamily: "'Syne',sans-serif", color: '#FFF', fontWeight: 700, fontSize: 18, marginBottom: 6 }}>{loan.userId?.fullName || 'Member'}</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Badge label={loan.purpose || 'General'} color="purple" />
                    <Badge label={loan.status || 'Pending'} color={statusColor(loan.status)} />
                    <Badge label={`${loan.riskLevel || 'Low'} Risk`} color={riskColor(loan.riskLevel)} />
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 700, color: '#0EA5E9' }}>KES {(loan.amount || 0).toLocaleString()}</div>
                  <div style={{ color: '#64748B', fontSize: 12 }}>Total repayable: KES {(loan.totalRepayable || 0).toLocaleString()}</div>
                </div>
              </div>
              <div style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8', fontSize: 12, marginBottom: 6 }}>
                  <span>Repayment progress</span><span>{Math.round(pct)}%</span>
                </div>
                <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4 }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: '#10B981', borderRadius: 4, transition: 'width 1s ease' }} />
                </div>
              </div>
              {isAdmin && loan.status === 'pending' && (
                <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                  <button style={{ ...BTN_PRIMARY, background: '#10B981', boxShadow: '0 0 20px rgba(16,185,129,0.3)', flex: 1, justifyContent: 'center' }}><CheckCircle2 size={16} /> Approve</button>
                  <button style={{ ...BTN_PRIMARY, background: '#EF4444', boxShadow: '0 0 20px rgba(239,68,68,0.3)', flex: 1, justifyContent: 'center' }}><XCircle size={16} /> Reject</button>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

function VotesTab({ votes, userId }) {
  const fakeHash = () => '0x' + Math.random().toString(16).slice(2, 18)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {votes.length === 0 ? (
        <div style={{ ...CARD, textAlign: 'center', padding: 64 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🗳️</div>
          <div style={{ fontFamily: "'Syne',sans-serif", color: '#FFF', fontSize: 20, marginBottom: 8 }}>No Active Votes</div>
          <div style={{ color: '#64748B' }}>Loan vote requests will appear here</div>
        </div>
      ) : votes.map((v, i) => {
        const yesCount = v.votes?.filter(x => x.vote === 'yes').length || 0
        const noCount = v.votes?.filter(x => x.vote === 'no').length || 0
        const total = yesCount + noCount || 1
        const yesPct = Math.round(yesCount / total * 100)
        const hasVoted = v.votes?.some(x => String(x.userId) === String(userId))
        const isDone = v.status !== 'pending'
        return (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} style={CARD}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ fontFamily: "'Syne',sans-serif", color: '#FFF', fontWeight: 700, fontSize: 18, marginBottom: 6 }}>{v.userId?.fullName || 'Member'} — KES {(v.amount || 0).toLocaleString()}</div>
                <div style={{ display: 'flex', gap: 8 }}><Badge label={v.purpose || 'General'} color="purple" /><Badge label={isDone ? (v.status === 'approved' ? 'Approved ✓' : 'Rejected ✗') : 'Voting open'} color={isDone ? (v.status === 'approved' ? 'green' : 'red') : 'blue'} /></div>
              </div>
              {isDone && <span style={{ color: '#475569', fontSize: 11, fontFamily: 'monospace' }}>{fakeHash()}</span>}
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8', fontSize: 13, marginBottom: 8 }}>
                <span>✓ Yes — {yesPct}%</span><span>✗ No — {100 - yesPct}%</span>
              </div>
              <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${yesPct}%`, background: 'linear-gradient(90deg,#10B981,#0EA5E9)', borderRadius: 4 }} />
              </div>
            </div>
            {!hasVoted && !isDone && (
              <div style={{ display: 'flex', gap: 10 }}>
                <button style={{ ...BTN_PRIMARY, background: '#10B981', flex: 1, justifyContent: 'center' }}>Vote Yes ✓</button>
                <button style={{ ...BTN_PRIMARY, background: '#EF4444', flex: 1, justifyContent: 'center' }}>Vote No ✗</button>
              </div>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}

function ReportsTab() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginBottom: 24 }}>
        <button onClick={() => alert('CSV export coming soon')} style={{ ...BTN_PRIMARY, background: 'rgba(255,255,255,0.05)', color: '#F8FAFC', boxShadow: 'none', border: '1px solid rgba(255,255,255,0.1)' }}><Download size={16} /> Export CSV</button>
        <button onClick={() => alert('PDF export coming soon')} style={{ ...BTN_PRIMARY, background: 'rgba(255,255,255,0.05)', color: '#F8FAFC', boxShadow: 'none', border: '1px solid rgba(255,255,255,0.1)' }}><Download size={16} /> Export PDF</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, marginBottom: 32 }}>
        {[
          { label: 'Total In', val: 'KES 125,000', color: '#10B981' },
          { label: 'Total Out', val: 'KES 48,000', color: '#EF4444' },
          { label: 'Net Balance', val: 'KES 77,000', color: '#0EA5E9' },
          { label: 'Loan Book', val: 'KES 48,000', color: '#F59E0B' },
        ].map((s, i) => (
          <div key={i} style={CARD}>
            <div style={{ color: '#94A3B8', fontSize: 13, marginBottom: 12 }}>{s.label}</div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 700, color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>
      <div style={CARD}>
        <h3 style={{ fontFamily: "'Syne',sans-serif", color: '#FFF', margin: '0 0 24px 0', fontSize: 18 }}>Monthly Contributions</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={MONTHLY_CONTRIBS}>
            <XAxis dataKey="month" stroke="#475569" tick={{ fill: '#94A3B8', fontSize: 12 }} />
            <YAxis stroke="#475569" tick={{ fill: '#94A3B8', fontSize: 12 }} tickFormatter={v => `${v/1000}k`} />
            <Tooltip contentStyle={{ background: '#1a1625', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#FFF' }} formatter={v => [`KES ${v.toLocaleString()}`, 'Contributions']} />
            <Bar dataKey="amount" fill="#0EA5E9" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ─── Modals ───────────────────────────────────────────────────────────────────

function ContributeModal({ onClose, chamaId, user }) {
  const [amount, setAmount] = useState('')
  const [phone, setPhone] = useState(user?.phone?.replace('+254', '') || '')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async () => {
    if (!amount || !phone) return
    setLoading(true)
    try {
      await api.post('/contributions/initiate', { chamaId, amount: Number(amount), mpesaPhone: '+254' + phone })
      setSuccess(true)
      setTimeout(onClose, 3000)
    } catch (err) {
      alert(err.response?.data?.message || 'Error initiating contribution')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalWrap onClose={onClose} title="💸 Contribute to Chama">
      {success ? (
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
          <div style={{ fontFamily: "'Syne',sans-serif", color: '#10B981', fontSize: 20, fontWeight: 700 }}>KES {Number(amount).toLocaleString()} contributed!</div>
          <div style={{ color: '#94A3B8', marginTop: 8 }}>Check your phone to complete M-Pesa payment.</div>
        </div>
      ) : (
        <>
          <FloatingInput label="Amount (KES)" type="number" value={amount} onChange={e => setAmount(e.target.value)} />
          <FloatingInput label="M-Pesa Phone (e.g. 0712345678)" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g,'').slice(0,9))} />
          <button onClick={handleSubmit} disabled={loading} style={{ ...BTN_PRIMARY, width: '100%', justifyContent: 'center', height: 52, marginTop: 8 }}>
            {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : 'Contribute Now'}
          </button>
        </>
      )}
    </ModalWrap>
  )
}

function ModalWrap({ onClose, title, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(13,11,30,0.8)', backdropFilter: 'blur(8px)' }} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ position: 'relative', width: 420, maxWidth: '90%', background: '#12101f', borderRadius: 24, padding: 36, border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 24px 48px rgba(0,0,0,0.5)' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}><X size={20} /></button>
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, color: '#FFF', margin: '0 0 28px 0', fontWeight: 700 }}>{title}</h2>
        {children}
      </motion.div>
    </div>
  )
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

const TABS = ['Overview', 'Members', 'Contributions', 'Loans', 'Votes', 'Reports']

export default function ChamaDetailPage() {
  const { chamaId } = useParams()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const [chama, setChama] = useState(null)
  const [members, setMembers] = useState([])
  const [contributions, setContributions] = useState([])
  const [loans, setLoans] = useState([])
  const [votes, setVotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(0)
  const [showContribute, setShowContribute] = useState(false)

  const myMembership = members.find(m => String(m.userId?._id || m.userId) === String(user?._id))
  const isAdmin = myMembership?.role === 'Admin' || myMembership?.role === 'Treasurer'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [chamaRes, membersRes] = await Promise.all([
          api.get(`/chamas/${chamaId}`).catch(() => ({ data: { chama: null } })),
          api.get(`/chamas/${chamaId}/members`).catch(() => ({ data: { members: [] } })),
        ])
        setChama(chamaRes.data.chama)
        setMembers(membersRes.data.members || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [chamaId])

  useEffect(() => {
    if (activeTab === 2) {
      api.get(`/contributions/${chamaId}`).then(r => setContributions(r.data.contributions || [])).catch(() => {})
    }
    if (activeTab === 3) {
      api.get(`/loans/${chamaId}`).then(r => setLoans(r.data.loans || [])).catch(() => {})
    }
    if (activeTab === 4) {
      api.get(`/loans/${chamaId}`).then(r => setVotes((r.data.loans || []).filter(l => l.status === 'pending'))).catch(() => {})
    }
  }, [activeTab, chamaId])

  const balance = chama?.balance || 0

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0D0B1E', fontFamily: "'DM Sans',sans-serif" }}>
      <div className="mesh-bg" />
      <Sidebar />
      <main style={{ marginLeft: '240px', flex: 1, padding: '32px', position: 'relative', zIndex: 1, overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#64748B', textDecoration: 'none', fontSize: 14, marginBottom: 20, transition: 'color 0.2s' }}>
            <ArrowLeft size={16} /> My Chamas
          </Link>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 32, color: '#FFF', fontWeight: 700, margin: '0 0 8px 0' }}>{loading ? '…' : chama?.name || 'Chama'}</h1>
              <p style={{ color: '#94A3B8', margin: '0 0 16px 0', fontSize: 15 }}>{chama?.description || 'Loading details…'}</p>
              <div style={{ display: 'flex', gap: 20 }}>
                {[
                  { label: `${members.length} members`, color: '#64748B' },
                  { label: `Est. ${chama ? new Date(chama.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}`, color: '#64748B' },
                  { label: 'Monthly', color: '#8B5CF6' },
                  { label: chama?.status === 'inactive' ? 'Inactive' : 'Active', color: '#10B981' },
                ].map((s, i) => (
                  <span key={i} style={{ fontSize: 13, color: s.color, display: 'flex', alignItems: 'center', gap: 4 }}>
                    {i > 0 && <span style={{ color: '#1E293B' }}>·</span>} {s.label}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#64748B', fontSize: 13, marginBottom: 4 }}>Group Balance</div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 36, fontWeight: 700, color: '#0EA5E9' }}>KES {balance.toLocaleString()}</div>
              {myMembership && <Badge label={myMembership.role || 'Member'} color={myMembership.role === 'Admin' ? 'gold' : myMembership.role === 'Treasurer' ? 'blue' : 'purple'} />}
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 4, marginBottom: 36, width: 'fit-content' }}>
          {TABS.map((tab, i) => (
            <button key={i} onClick={() => setActiveTab(i)} style={{
              padding: '10px 22px', borderRadius: 10, border: 'none', cursor: 'pointer',
              fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: activeTab === i ? 700 : 500,
              background: activeTab === i ? '#0EA5E9' : 'transparent',
              color: activeTab === i ? '#FFF' : '#94A3B8',
              transition: 'all 0.2s ease'
            }}>{tab}</button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            {activeTab === 0 && <OverviewTab chama={chama} members={members} />}
            {activeTab === 1 && <MembersTab members={members} isAdmin={isAdmin} chamaId={chamaId} />}
            {activeTab === 2 && <ContributionsTab contributions={contributions} chamaId={chamaId} onContribute={() => setShowContribute(true)} />}
            {activeTab === 3 && <LoansTab loans={loans} isAdmin={isAdmin} chamaId={chamaId} />}
            {activeTab === 4 && <VotesTab votes={votes} userId={user?._id} />}
            {activeTab === 5 && <ReportsTab />}
          </motion.div>
        </AnimatePresence>

      </main>

      {/* Modals */}
      <AnimatePresence>
        {showContribute && <ContributeModal onClose={() => setShowContribute(false)} chamaId={chamaId} user={user} />}
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
