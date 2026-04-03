import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, Building2, TrendingUp, Shield, AlertTriangle } from 'lucide-react'
import api from '../services/api'
import useAuthStore from '../store/authStore'

export default function SuperAdminPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [chamas, setChamas] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [suspendReason, setSuspendReason] = useState('')
  const [showSuspendModal, setShowSuspendModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  // Redirect if not super admin
  useEffect(() => {
    if (user && !user.isSuperAdmin) {
      navigate('/dashboard')
    }
  }, [user])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [statsRes, usersRes, chamasRes] = await Promise.all([
        api.get('/super-admin/stats'),
        api.get('/super-admin/users'),
        api.get('/super-admin/chamas')
      ])
      setStats(statsRes.data.stats)
      setUsers(usersRes.data.users || [])
      setChamas(chamasRes.data.chamas || [])
    } catch (err) {
      console.error(err)
      if (err.response?.status === 403) navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleSuspend = async () => {
    if (!selectedUser) return
    try {
      await api.patch(`/super-admin/users/${selectedUser._id}/suspend`, { reason: suspendReason })
      setShowSuspendModal(false)
      setSuspendReason('')
      fetchData()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to suspend user')
    }
  }

  const handleUnsuspend = async (userId) => {
    if (!window.confirm('Unsuspend this user?')) return
    try {
      await api.patch(`/super-admin/users/${userId}/unsuspend`)
      fetchData()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed')
    }
  }

  const handleDeleteUser = async (userId, name) => {
    if (!window.confirm(`Permanently delete ${name}? This cannot be undone.`)) return
    try {
      await api.delete(`/super-admin/users/${userId}`)
      fetchData()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed')
    }
  }

  const handleFreezeChama = async (chamaId, currentStatus) => {
    if (!window.confirm(`${currentStatus === 'frozen' ? 'Unfreeze' : 'Freeze'} this chama?`)) return
    try {
      await api.patch(`/super-admin/chamas/${chamaId}/freeze`)
      fetchData()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed')
    }
  }

  const handlePromoteSuperAdmin = async (userId, name) => {
    if (!window.confirm(`Promote ${name} to Super Admin? They will have full platform control.`)) return
    try {
      await api.patch(`/super-admin/users/${userId}/promote-super-admin`)
      alert(`${name} is now a Super Admin!`)
      fetchData()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed')
    }
  }

  const handleRevokeSuperAdmin = async (userId, name) => {
    if (!window.confirm(`Revoke Super Admin access from ${name}?`)) return
    try {
      await api.patch(`/super-admin/users/${userId}/revoke-super-admin`)
      fetchData()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed')
    }
  }

  const filteredUsers = users.filter(u =>
    u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  const filteredChamas = chamas.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  )

  const tabs = ['overview', 'users', 'chamas']

  return (
    <div style={{ minHeight: '100vh', background: '#0D0B1E' }}>
      <div className="mesh-bg" />

      {/* Top Bar */}
      <div style={{ background: 'rgba(13,11,30,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(245,158,11,0.2)', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Shield size={24} color="#F59E0B" />
          <span style={{ fontFamily: 'Syne', fontSize: '20px', fontWeight: 700, color: '#F59E0B' }}>ChamaChain Super Admin</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontFamily: 'DM Sans', color: '#94A3B8', fontSize: '14px' }}>
            Logged in as <strong style={{ color: '#F8FAFC' }}>{user?.fullName}</strong>
          </span>
          <button className="btn-ghost" onClick={() => navigate('/dashboard')} style={{ padding: '8px 16px', fontSize: '13px' }}>
            ← Back to App
          </button>
        </div>
      </div>

      <div style={{ padding: '32px', position: 'relative', zIndex: 1 }}>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', background: 'rgba(255,255,255,0.04)', borderRadius: '14px', padding: '6px', width: 'fit-content' }}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => { setActiveTab(tab); setSearch('') }}
              style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans', fontWeight: 600, fontSize: '14px', textTransform: 'capitalize', background: activeTab === tab ? '#F59E0B' : 'transparent', color: activeTab === tab ? '#0D0B1E' : '#64748B', transition: 'all 0.2s ease' }}>
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{ width: '48px', height: '48px', borderRadius: '50%', border: '3px solid rgba(245,158,11,0.2)', borderTop: '3px solid #F59E0B', margin: '0 auto' }} />
          </div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && stats && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
                  {[
                    { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: '#0EA5E9' },
                    { label: 'Total Chamas', value: stats.totalChamas, icon: '🏦', color: '#8B5CF6' },
                    { label: 'Total Contributions', value: stats.totalContributions, icon: '💸', color: '#10B981' },
                    { label: 'Money Moved', value: `KES ${(stats.totalMoneyMoved || 0).toLocaleString()}`, icon: '💰', color: '#F59E0B' },
                  ].map((s, i) => (
                    <motion.div key={i} className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} style={{ padding: '24px' }}>
                      <div style={{ fontSize: '32px', marginBottom: '8px' }}>{s.icon}</div>
                      <p style={{ margin: '0 0 4px', fontFamily: 'DM Sans', fontSize: '13px', color: '#64748B' }}>{s.label}</p>
                      <p style={{ margin: 0, fontFamily: 'Syne', fontSize: '24px', fontWeight: 700, color: s.color }}>{s.value}</p>
                    </motion.div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                  {[
                    { label: 'Active Loans', value: stats.activeLoans, color: '#F59E0B', icon: '🏛️' },
                    { label: 'Total Loans', value: stats.totalLoans, color: '#0EA5E9', icon: '📋' },
                    { label: 'Suspended Users', value: stats.suspendedUsers, color: '#EF4444', icon: '🚫' },
                    { label: 'Frozen Chamas', value: stats.frozenChamas, color: '#EF4444', icon: '❄️' },
                  ].map((s, i) => (
                    <motion.div key={i} className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.1 }} style={{ padding: '24px' }}>
                      <div style={{ fontSize: '32px', marginBottom: '8px' }}>{s.icon}</div>
                      <p style={{ margin: '0 0 4px', fontFamily: 'DM Sans', fontSize: '13px', color: '#64748B' }}>{s.label}</p>
                      <p style={{ margin: 0, fontFamily: 'Syne', fontSize: '24px', fontWeight: 700, color: s.color }}>{s.value}</p>
                    </motion.div>
                  ))}
                </div>
              </>
            )}

            {/* USERS TAB */}
            {activeTab === 'users' && (
              <>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                  <input
                    placeholder="Search users by name or email..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <span style={{ fontFamily: 'DM Sans', color: '#64748B', fontSize: '14px', display: 'flex', alignItems: 'center' }}>
                    {filteredUsers.length} users
                  </span>
                </div>

                <div className="glass-card" style={{ overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        {['User', 'Email', 'Phone', 'Joined', 'Status', 'Role', 'Actions'].map(h => (
                          <th key={h} style={{ padding: '16px', textAlign: 'left', fontFamily: 'DM Sans', fontSize: '12px', color: '#64748B', textTransform: 'uppercase' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#0EA5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne', fontSize: '12px', fontWeight: 700, color: 'white', flexShrink: 0 }}>
                                {u.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </div>
                              <span style={{ fontFamily: 'DM Sans', color: '#F8FAFC', fontWeight: 600, fontSize: '14px' }}>{u.fullName}</span>
                            </div>
                          </td>
                          <td style={{ padding: '14px 16px', fontFamily: 'DM Sans', color: '#94A3B8', fontSize: '13px' }}>{u.email}</td>
                          <td style={{ padding: '14px 16px', fontFamily: 'DM Sans', color: '#94A3B8', fontSize: '13px' }}>{u.phone}</td>
                          <td style={{ padding: '14px 16px', fontFamily: 'DM Sans', color: '#64748B', fontSize: '13px' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{
                              padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontFamily: 'DM Sans',
                              background: u.isSuspended ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
                              color: u.isSuspended ? '#EF4444' : '#10B981'
                            }}>
                              {u.isSuspended ? '🚫 Suspended' : '✅ Active'}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            {u.isSuperAdmin && (
                              <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontFamily: 'DM Sans', background: 'rgba(245,158,11,0.15)', color: '#F59E0B' }}>
                                👑 Super Admin
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              {!u.isSuperAdmin && (
                                <>
                                  {u.isSuspended ? (
                                    <button onClick={() => handleUnsuspend(u._id)}
                                      style={{ padding: '4px 10px', borderRadius: '8px', background: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)', cursor: 'pointer', fontSize: '12px', fontFamily: 'DM Sans' }}>
                                      Unsuspend
                                    </button>
                                  ) : (
                                    <button onClick={() => { setSelectedUser(u); setShowSuspendModal(true) }}
                                      style={{ padding: '4px 10px', borderRadius: '8px', background: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)', cursor: 'pointer', fontSize: '12px', fontFamily: 'DM Sans' }}>
                                      Suspend
                                    </button>
                                  )}
                                  <button onClick={() => handlePromoteSuperAdmin(u._id, u.fullName)}
                                    style={{ padding: '4px 10px', borderRadius: '8px', background: 'rgba(139,92,246,0.15)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.3)', cursor: 'pointer', fontSize: '12px', fontFamily: 'DM Sans' }}>
                                    Make SA
                                  </button>
                                  <button onClick={() => handleDeleteUser(u._id, u.fullName)}
                                    style={{ padding: '4px 10px', borderRadius: '8px', background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)', cursor: 'pointer', fontSize: '12px', fontFamily: 'DM Sans' }}>
                                    Delete
                                  </button>
                                </>
                              )}
                              {u.isSuperAdmin && u._id !== user?.id && (
                                <button onClick={() => handleRevokeSuperAdmin(u._id, u.fullName)}
                                  style={{ padding: '4px 10px', borderRadius: '8px', background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)', cursor: 'pointer', fontSize: '12px', fontFamily: 'DM Sans' }}>
                                  Revoke SA
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* CHAMAS TAB */}
            {activeTab === 'chamas' && (
              <>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                  <input placeholder="Search chamas..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1 }} />
                  <span style={{ fontFamily: 'DM Sans', color: '#64748B', fontSize: '14px', display: 'flex', alignItems: 'center' }}>
                    {filteredChamas.length} chamas
                  </span>
                </div>

                <div className="glass-card" style={{ overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        {['Chama Name', 'Created By', 'Members', 'Balance', 'Status', 'Created', 'Actions'].map(h => (
                          <th key={h} style={{ padding: '16px', textAlign: 'left', fontFamily: 'DM Sans', fontSize: '12px', color: '#64748B', textTransform: 'uppercase' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredChamas.map((chama, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                          <td style={{ padding: '14px 16px', fontFamily: 'Syne', color: '#F8FAFC', fontWeight: 600 }}>{chama.name}</td>
                          <td style={{ padding: '14px 16px', fontFamily: 'DM Sans', color: '#94A3B8', fontSize: '13px' }}>{chama.createdBy?.fullName}</td>
                          <td style={{ padding: '14px 16px', fontFamily: 'DM Sans', color: '#94A3B8' }}>{chama.memberCount}</td>
                          <td style={{ padding: '14px 16px', fontFamily: 'Syne', color: '#10B981', fontWeight: 600 }}>KES {(chama.totalBalance || 0).toLocaleString()}</td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{
                              padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontFamily: 'DM Sans',
                              background: chama.status === 'frozen' ? 'rgba(239,68,68,0.15)' : chama.status === 'archived' ? 'rgba(100,116,139,0.15)' : 'rgba(16,185,129,0.15)',
                              color: chama.status === 'frozen' ? '#EF4444' : chama.status === 'archived' ? '#64748B' : '#10B981'
                            }}>
                              {chama.status === 'frozen' ? '❄️ Frozen' : chama.status === 'archived' ? '📦 Archived' : '✅ Active'}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px', fontFamily: 'DM Sans', color: '#64748B', fontSize: '13px' }}>{new Date(chama.createdAt).toLocaleDateString()}</td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button onClick={() => handleFreezeChama(chama._id, chama.status)}
                                style={{ padding: '4px 10px', borderRadius: '8px', background: chama.status === 'frozen' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', color: chama.status === 'frozen' ? '#10B981' : '#F59E0B', border: `1px solid ${chama.status === 'frozen' ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`, cursor: 'pointer', fontSize: '12px', fontFamily: 'DM Sans' }}>
                                {chama.status === 'frozen' ? 'Unfreeze' : 'Freeze'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Suspend Modal */}
      {showSuspendModal && selectedUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card" style={{ width: '440px', padding: '36px' }}>
            <h3 style={{ fontFamily: 'Syne', fontSize: '20px', color: '#EF4444', marginBottom: '8px' }}>🚫 Suspend User</h3>
            <p style={{ fontFamily: 'DM Sans', color: '#94A3B8', marginBottom: '20px', fontSize: '14px' }}>
              Suspending <strong style={{ color: '#F8FAFC' }}>{selectedUser.fullName}</strong>. They will not be able to login until unsuspended.
            </p>
            <textarea
              placeholder="Reason for suspension (required)"
              value={suspendReason}
              onChange={e => setSuspendReason(e.target.value)}
              rows={3}
              style={{ marginBottom: '20px', resize: 'vertical' }}
            />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn-ghost" style={{ flex: 1 }} onClick={() => { setShowSuspendModal(false); setSuspendReason('') }}>Cancel</button>
              <button
                onClick={handleSuspend}
                disabled={!suspendReason.trim()}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', background: suspendReason.trim() ? 'rgba(239,68,68,0.9)' : 'rgba(239,68,68,0.3)', color: 'white', border: 'none', cursor: suspendReason.trim() ? 'pointer' : 'not-allowed', fontFamily: 'DM Sans', fontWeight: 600 }}
              >
                Confirm Suspend
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}