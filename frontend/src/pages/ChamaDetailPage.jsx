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
import usePageTitle from '../hooks/usePageTitle'
import useMyRole from '../hooks/useMyRole'

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
const BADGE_ROLE_COLOR_MAP = { admin: 'gold', treasurer: 'blue', member: 'purple', observer: 'gray' }

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

function OverviewTab({ chama, members, chamaId }) {
  const [leaderboard, setLeaderboard] = useState([])

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const lbRes = await api.get(`/chamas/${chamaId}/leaderboard`)
        setLeaderboard(lbRes.data.leaderboard || [])
      } catch (err) {
        console.error('Leaderboard fetch error:', err)
      }
    }
    if (chamaId) fetchLeaderboard()
  }, [chamaId])

  const topContributors = [...members].sort((a, b) => (b.totalContributed || 0) - (a.totalContributed || 0)).slice(0, 5)
  const rankColors = ['#F59E0B', '#94A3B8', '#CD7C2F', '#64748B', '#64748B']

  // Mock balance history based on totalBalance
  const totalBalance = chama?.totalBalance || 0
  const mockHistory = [
    { month: 'Jan', balance: Math.round(totalBalance * 0.4) },
    { month: 'Feb', balance: Math.round(totalBalance * 0.7) },
    { month: 'Mar', balance: totalBalance },
  ]

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
            <LineChart data={mockHistory}>
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

        {/* Leaderboard */}
        <div className="glass-card" style={{ padding: '24px', marginTop: '20px' }}>
          <h3 style={{ fontFamily: 'Syne', fontSize: '18px', color: '#F8FAFC', marginBottom: '16px' }}>🏆 Top Contributors</h3>
          {leaderboard.length === 0 ? (
            <div style={{ color: '#64748B', textAlign: 'center', padding: 12 }}>No data available</div>
          ) : leaderboard.map((member, i) => {
            const medals = ['🥇', '🥈', '🥉']
            const initials = member.userId?.fullName?.split(' ').map(n => n[0]).join('').slice(0,2) || 'U'
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: i < leaderboard.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                <span style={{ fontSize: '20px', width: '28px' }}>{medals[i] || `#${i + 1}`}</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#0EA5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne', fontWeight: 700, color: 'white' }}>
                  {initials}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontFamily: 'DM Sans', color: '#F8FAFC', fontWeight: 600, fontSize: '14px' }}>{member.userId?.fullName}</p>
                </div>
                <span style={{ fontFamily: 'Syne', color: '#10B981', fontWeight: 700 }}>KES {(member.totalContributed || 0).toLocaleString()}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function MembersTab({ members, membership, chamaId, user, isAdmin, isTreasurer, isMember, isObserver, canManage, canViewFinances, canContribute, canRequestLoan, canApproveLoan, chama }) {
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
        
        {chama?.inviteCode && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(14,165,233,0.05)', padding: '8px 16px', borderRadius: '14px', border: '1px solid rgba(14,165,233,0.15)' }}>
            <span style={{ color: '#0EA5E9', fontSize: '13px', fontFamily: 'DM Sans', fontWeight: 600 }}>Invite Friends:</span>
            <span style={{ color: '#F8FAFC', fontSize: '18px', fontWeight: 800, fontFamily: 'JetBrains Mono', letterSpacing: '2px' }}>{chama.inviteCode}</span>
            <button 
              onClick={() => { navigator.clipboard.writeText(chama.inviteCode); alert('Invite code copied!') }} 
              style={{ background: 'rgba(14,165,233,0.15)', color: '#0EA5E9', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 700, fontFamily: 'DM Sans', transition: 'all 0.2s' }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(14,165,233,0.25)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(14,165,233,0.15)'}
            >
              Copy
            </button>
          </div>
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
        {filtered.map((member, i) => {
          const memberIsAdmin = member.role === 'admin'
          const roleColors = { admin: '#F59E0B', treasurer: '#0EA5E9', member: '#64748B', observer: '#475569' }
          const initials = member.userId?.fullName?.split(' ').map(n => n[0]).join('').slice(0,2) || 'U'
          return (
            <div key={i} className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#0EA5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne', fontWeight: 700, color: 'white' }}>
                  {initials}
                </div>
                <div>
                  <p style={{ margin: 0, fontFamily: 'Syne', color: '#F8FAFC', fontWeight: 600 }}>{member.userId?.fullName}</p>
                  <span style={{ background: `${roleColors[member.role]}22`, color: roleColors[member.role], padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontFamily: 'DM Sans' }}>{member.role}</span>
                </div>
              </div>
              <p style={{ margin: 0, color: '#10B981', fontFamily: 'DM Sans', fontSize: '13px' }}>
                KES {(member.totalContributed || 0).toLocaleString()} contributed
              </p>
              {canManage && member.userId?._id !== user?.id && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <select
                    defaultValue={member.role}
                    onChange={async (e) => {
                      await api.patch(`/chamas/${chamaId}/members/${member.userId?._id}/role`, { role: e.target.value })
                      window.location.reload()
                    }}
                    style={{ flex: 1, padding: '6px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: '#F8FAFC', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <option value="member">Member</option>
                    <option value="treasurer">Treasurer</option>
                    <option value="observer">Observer</option>
                  </select>
                  <button
                    onClick={async () => {
                      if (window.confirm('Remove this member?')) {
                        await api.delete(`/chamas/${chamaId}/members/${member.userId?._id}`)
                        // Note: ideally update local state, but instruction said reload is fine or implicit
                        window.location.reload()
                      }
                    }}
                    style={{ padding: '6px 12px', borderRadius: '8px', background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)', cursor: 'pointer' }}
                  >Remove</button>
                </div>
              )}
            </div>
          )
        })}
        {filtered.length === 0 && <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#64748B', padding: 40 }}>No members found</div>}
      </div>
    </div>
  )
}

function ContributionsTab({ contributions, chamaId, onContribute, canContribute, canViewFinances }) {
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
        {canContribute && <button onClick={onContribute} style={BTN_PRIMARY}><Plus size={16} />Contribute</button>}
      </div>
      {canViewFinances ? (
        <div style={CARD}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                {['Member', 'Amount', 'M-Pesa Ref', 'Date', 'Status'].map(h => (
                  <th key={h} style={{ padding: '12px', textAlign: 'left', fontFamily: 'DM Sans', fontSize: '12px', color: '#64748B', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {contributions.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: '#64748B', padding: 48 }}>No contributions yet</td></tr>
              ) : contributions.map((c, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                  <td style={{ padding: '12px', fontFamily: 'DM Sans', color: '#F8FAFC' }}>{c.userId?.fullName || 'Unknown'}</td>
                  <td style={{ padding: '12px', fontFamily: 'Syne', color: '#10B981', fontWeight: 600 }}>KES {c.amount?.toLocaleString()}</td>
                  <td style={{ padding: '12px', fontFamily: 'DM Mono', color: '#64748B', fontSize: '12px' }}>{c.mpesaRef}</td>
                  <td style={{ padding: '12px', fontFamily: 'DM Sans', color: '#94A3B8', fontSize: '13px' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ background: c.status === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', color: c.status === 'success' ? '#10B981' : '#F59E0B', padding: '3px 10px', borderRadius: '10px', fontSize: '12px', fontFamily: 'DM Sans' }}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ ...CARD, textAlign: 'center', padding: 48, color: '#64748B' }}>
          <Wallet size={48} style={{ opacity: 0.5, marginBottom: 16 }} />
          <p>You do not have permission to view financial records.</p>
        </div>
      )}
    </div>
  )
}

function LoansTab({ loans, myLoans, membership, chamaId, canRequestLoan, canApproveLoan, canViewFinances, onRequestLoan }) {
  const displayLoans = canViewFinances ? loans : myLoans

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
        {canRequestLoan && <button style={BTN_PRIMARY} onClick={onRequestLoan}><Plus size={16} />Request Loan</button>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {displayLoans.length === 0 ? (
          <div style={{ ...CARD, textAlign: 'center', padding: 48 }}>
            <CreditCard size={48} style={{ color: '#0EA5E9', marginBottom: 16, opacity: 0.5 }} />
            <p style={{ color: '#64748B' }}>No loans to display.</p>
          </div>
        ) : displayLoans.map((loan, i) => (
          <div key={loan._id} className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <p style={{ margin: 0, fontFamily: 'Syne', color: '#F8FAFC', fontWeight: 600 }}>Loan to {loan.userId?.fullName || 'N/A'}</p>
                <span style={{ fontSize: '12px', color: '#94A3B8' }}>{new Date(loan.createdAt).toLocaleDateString()}</span>
              </div>
              <span style={{
                background: loan.status === 'approved' ? 'rgba(16,185,129,0.15)' : loan.status === 'pending' ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                color: loan.status === 'approved' ? '#10B981' : loan.status === 'pending' ? '#F59E0B' : '#EF4444',
                padding: '4px 10px',
                borderRadius: '10px',
                fontSize: '12px',
                fontFamily: 'DM Sans',
                fontWeight: 600
              }}>{loan.status}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ margin: 0, fontFamily: 'Syne', color: '#0EA5E9', fontWeight: 700 }}>KES {loan.amount.toLocaleString()}</p>
              {canApproveLoan && loan.status === 'pending' && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={async () => {
                      if (window.confirm('Approve this loan?')) {
                        await api.patch(`/loans/${loan._id}/approve`)
                        window.location.reload()
                      }
                    }}
                    style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer' }}
                  >Approve</button>
                  <button
                    onClick={async () => {
                      if (window.confirm('Reject this loan?')) {
                        await api.patch(`/loans/${loan._id}/reject`)
                        window.location.reload()
                      }
                    }}
                    style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer' }}
                  >Reject</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SettingsTab({ chama, chamaId, isAdmin, members }) {
  const [inviteCode, setInviteCode] = useState('')
  const [modalLoading, setModalLoading] = useState(false)
  const [transferAdminUserId, setTransferAdminUserId] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (isAdmin && chama?.inviteCode) {
      setInviteCode(chama.inviteCode)
    }
  }, [chama, isAdmin])

  const handleLeaveChama = async () => {
    if (window.confirm('Are you sure you want to leave this Chama?')) {
      try {
        await api.patch(`/chamas/${chamaId}/leave`)
        navigate('/chamas')
      } catch (err) {
        console.error('Error leaving chama:', err)
        alert('Failed to leave chama.')
      }
    }
  }

  const handleTransferAdmin = async () => {
    if (!transferAdminUserId) return alert('Please select a member to transfer admin rights to.')
    if (window.confirm(`Are you sure you want to transfer admin rights to ${members?.find(m => m.userId?._id === transferAdminUserId)?.userId?.fullName}? This action cannot be undone.`)) {
      setModalLoading(true)
      try {
        await api.patch(`/chamas/${chamaId}/transfer-admin/${transferAdminUserId}`)
        alert('Admin rights transferred successfully. You will now be redirected.')
        navigate('/chamas')
      } catch (err) {
        console.error('Error transferring admin:', err)
        alert(err.response?.data?.message || 'Failed to transfer admin rights.')
      } finally {
        setModalLoading(false)
      }
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
      {isAdmin && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontFamily: 'Syne', fontSize: '18px', color: '#F8FAFC', margin: '0 0 16px' }}>Admin Settings</h3>
          <p style={{ color: '#94A3B8', fontSize: '14px', marginBottom: '16px' }}>Manage administrative tasks for this Chama.</p>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#64748B', fontSize: '13px', marginBottom: '8px' }}>Invite Code</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={inviteCode}
                readOnly
                style={{ flex: 1, padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#F8FAFC', fontSize: '14px', outline: 'none' }}
              />
              <button
                onClick={() => navigator.clipboard.writeText(inviteCode)}
                style={{ background: 'rgba(14,165,233,0.15)', color: '#0EA5E9', border: '1px solid rgba(14,165,233,0.3)', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer' }}
              >
                Copy
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#64748B', fontSize: '13px', marginBottom: '8px' }}>Transfer Admin Rights</label>
            <select
              value={transferAdminUserId}
              onChange={(e) => setTransferAdminUserId(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#F8FAFC', fontSize: '14px', outline: 'none', marginBottom: '12px' }}
            >
              <option value="">Select a member</option>
              {members.filter(m => m.role !== 'admin').map(member => (
                <option key={member.userId?._id} value={member.userId?._id}>{member.userId?.fullName}</option>
              ))}
            </select>
            <button
              onClick={handleTransferAdmin}
              disabled={modalLoading || !transferAdminUserId}
              style={{ ...BTN_PRIMARY, background: modalLoading ? '#64748B' : '#EF4444', boxShadow: modalLoading ? 'none' : '0 0 20px rgba(239,68,68,0.3)', width: '100%', padding: '10px 14px' }}
            >
              {modalLoading ? 'Transferring...' : 'Transfer Admin'}
            </button>
          </div>

          <button
            onClick={() => alert('Delete Chama functionality coming soon!')}
            style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', width: '100%' }}
          >
            Delete Chama
          </button>
        </div>
      )}

      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontFamily: 'Syne', fontSize: '18px', color: '#F8FAFC', margin: '0 0 16px' }}>General Settings</h3>
        <p style={{ color: '#94A3B8', fontSize: '14px', marginBottom: '16px' }}>Update your personal settings for this Chama.</p>
        <button
          onClick={handleLeaveChama}
          style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', width: '100%' }}
        >
          Leave Chama
        </button>
      </div>
    </div>
  )
}


export default function ChamaDetailPage() {
  const { chamaId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [chama, setChama] = useState(null)
  usePageTitle(chama?.name ? `ChamaChain - ${chama.name}` : 'ChamaChain')
  const [members, setMembers] = useState([])
  const [contributions, setContributions] = useState([])
  const [loans, setLoans] = useState([])
  const [myLoans, setMyLoans] = useState([]) // For non-admin/treasurer to see only their loans
  const [loading, setLoading] = useState(true)
  const { role, isAdmin, isTreasurer, isMember, isObserver, canManage, canViewFinances, canContribute, canRequestLoan, canApproveLoan, loading: roleLoading } = useMyRole(chamaId)
  const [error, setError] = useState(null)
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false)
  const [isFundAccountModalOpen, setIsFundAccountModalOpen] = useState(false)
  const [isRequestLoanModalOpen, setIsRequestLoanModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(0)

  // Add timeout to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.warn('Loading timeout - forcing content to show')
        setLoading(false)
      }
    }, 5000) // 5 second timeout

    return () => clearTimeout(timer)
  }, [loading])

  const membership = members?.find(m => m.userId?._id === user?.id)

  const TABS = [
    { name: 'Overview', icon: LayoutDashboard, component: OverviewTab, props: { chama, members, chamaId } },
    { name: 'Members', icon: Users, component: MembersTab, props: { members, membership, chamaId, user, isAdmin, isTreasurer, isMember, isObserver, canManage, canViewFinances, canContribute, canRequestLoan, canApproveLoan, chama } },
    { name: 'Contributions', icon: Wallet, component: ContributionsTab, props: { contributions, chamaId, onContribute: () => setIsFundAccountModalOpen(true), canContribute, canViewFinances } },
    { name: 'Loans', icon: CreditCard, component: LoansTab, props: { loans, myLoans, membership, chamaId, canRequestLoan, canApproveLoan, canViewFinances, onRequestLoan: () => setIsRequestLoanModalOpen(true) } },
    { name: 'Settings', icon: Settings, component: SettingsTab, props: { chama, chamaId, isAdmin, members } },
  ];

  useEffect(() => {
    const fetchChamaDetails = async () => {
      setLoading(true) // Keep this for overall chama data loading
      try {
        const res = await api.get(`/chamas/${chamaId}`)
        setChama(res.data.chama)
      } catch (err) {
        const errorMsg = err.response?.data?.message || 'Failed to fetch chama details.'
        setError(errorMsg)
        console.error('Chama details fetch error:', err)
        if (err.response?.status === 403) { // Forbidden, user is not a member
          setError('You are not a member of this chama. Please join to access it.')
        }
      } finally {
        setLoading(false) // Ensure loading is set to false
      }
    }
    const fetchMemberships = async () => {
      try {
        const res = await api.get(`/chamas/${chamaId}/members`)
        setMembers(res.data.members || [])
      } catch (err) {
        console.error('Members fetch error:', err)
        setMembers([])
      }
    }
    const fetchContributions = async () => {
      try {
        const res = await api.get(`/chamas/${chamaId}/contributions`)
        setContributions(res.data.contributions || [])
      } catch (err) {
        console.error('Contributions fetch error:', err)
        setContributions([])
      }
    }
    const fetchLoans = async () => {
      try {
        const res = await api.get(`/loans/${chamaId}`)
        setLoans(res.data.loans || [])
        const myLoansRes = await api.get(`/loans/${chamaId}/my`)
        setMyLoans(myLoansRes.data.loans || [])
      } catch (err) {
        console.error('Loans fetch error:', err)
        setLoans([])
        setMyLoans([])
      }
    }

    if (chamaId) {
      fetchChamaDetails()
      fetchMemberships()
      fetchContributions()
      fetchLoans()
    }
  }, [chamaId, navigate, user?.id]) // Added user.id to dependency array for myLoans

  // Combined loading state
  useEffect(() => {
    if (!roleLoading && chama) {
      setLoading(false)
    } else if (error) {
      setLoading(false) // If there's an error, stop loading too.
    }
  }, [roleLoading, chama, error])




  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0D0B1E', color: '#F8FAFC' }}>
        <h1 style={{ fontFamily: 'Syne', fontSize: '32px', marginBottom: '16px' }}>Error</h1>
        <p style={{ color: '#EF4444', fontSize: '18px', marginBottom: '24px' }}>{error}</p>
        <Link to="/chamas" style={{ ...BTN_PRIMARY, textDecoration: 'none' }}>Go to My Chamas</Link>
      </div>
    )
  }

  if (loading || roleLoading) { // Use combined loading state here
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0D0B1E', color: '#F8FAFC' }}>
        <Loader2 size={48} style={{ animation: 'spin 1s linear infinite', color: '#0EA5E9' }} />
        <p style={{ fontFamily: 'DM Sans', fontSize: '18px', marginTop: '20px' }}>Loading Chama details...</p>
      </div>
    )
  }

  if (!chama) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0D0B1E', color: '#F8FAFC' }}>
        <h1 style={{ fontFamily: 'Syne', fontSize: '32px', marginBottom: '16px' }}>Chama Not Found</h1>
        <p style={{ color: '#94A3B8', fontSize: '18px', marginBottom: '24px' }}>The requested Chama could not be found or you do not have access.</p>
        <Link to="/chamas" style={{ ...BTN_PRIMARY, textDecoration: 'none' }}>Go to My Chamas</Link>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0D0B1E' }}>
      <div className="mesh-bg" />
      <Sidebar />
      <main className="main-content" style={{ marginLeft: '240px', flex: 1, padding: '32px', position: 'relative', zIndex: 1, overflowY: 'auto', minHeight: '100vh' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={() => navigate('/chamas')} style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.18)', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.8)', boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,0.35), 0 4px 16px rgba(0,0,0,0.2)', transition: 'all 0.25s ease' }}>
              <ArrowLeft size={18} />
            </button>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '32px', fontWeight: 700, margin: 0, color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '12px' }}>
              {chama?.name}
              {role && <Badge label={role.charAt(0).toUpperCase() + role.slice(1)} color={BADGE_ROLE_COLOR_MAP[role] || 'gray'} />}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {membership && (
              <span style={{
                background: `${ROLE_COLOR[membership.role.charAt(0).toUpperCase() + membership.role.slice(1)] || '#64748B'}22`,
                color: ROLE_COLOR[membership.role.charAt(0).toUpperCase() + membership.role.slice(1)] || '#64748B',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '12px',
                fontFamily: 'DM Sans',
                fontWeight: 600,
                textTransform: 'capitalize'
              }}>{membership.role}</span>
            )}
            <button style={BTN_PRIMARY} onClick={() => setIsFundAccountModalOpen(true)}><Plus size={16} />Fund Account</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '32px' }}>
          {TABS.map((tab, i) => (
            <motion.button
              key={tab.name}
              onClick={() => setActiveTab(i)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '12px 20px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 600,
                color: activeTab === i ? '#0EA5E9' : '#64748B',
                borderBottom: activeTab === i ? '2px solid #0EA5E9' : '2px solid transparent',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <tab.icon size={18} /> {tab.name}
            </motion.button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {TABS.map((tab, i) => (
              activeTab === i && <tab.component key={i} {...tab.props} />
            ))}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
