import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, Users, Building2, TrendingUp, AlertTriangle,
  Search, ChevronLeft, ChevronRight, X, CheckCircle,
  XCircle, RefreshCw, ArrowLeft, Snowflake, Trash2,
  Crown, UserX, UserCheck, Lock, Unlock, Filter
} from 'lucide-react'
import api from '../services/api'
import useAuthStore from '../store/authStore'

// Toast notification system
function Toast({ toasts, remove }) {
  return (
    <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div key={t.id}
            initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 60 }}
            style={{
              minWidth: '300px', padding: '14px 18px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px',
              background: t.type === 'success' ? 'rgba(16,185,129,0.15)' : t.type === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
              border: `1px solid ${t.type === 'success' ? 'rgba(16,185,129,0.4)' : t.type === 'error' ? 'rgba(239,68,68,0.4)' : 'rgba(245,158,11,0.4)'}`,
              backdropFilter: 'blur(20px)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
            }}>
            {t.type === 'success' ? <CheckCircle size={16} color="#10B981" /> : t.type === 'error' ? <XCircle size={16} color="#EF4444" /> : <AlertTriangle size={16} color="#F59E0B" />}
            <span style={{ fontFamily: 'DM Sans', fontSize: '14px', color: '#F8FAFC', flex: 1 }}>{t.message}</span>
            <button onClick={() => remove(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', display: 'flex' }}><X size={14} /></button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

function useToast() {
  const [toasts, setToasts] = useState([])
  const add = (message, type = 'success') => {
    const id = Date.now()
    setToasts(p => [...p, { id, message, type }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000)
  }
  const remove = (id) => setToasts(p => p.filter(t => t.id !== id))
  return { toasts, toast: add, removeToast: remove }
}

// Confirm Modal
function ConfirmModal({ open, title, message, confirmLabel = 'Confirm', confirmColor = '#EF4444', onConfirm, onCancel, children }) {
  if (!open) return null
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="glass-card" style={{ width: '440px', padding: '32px', border: '1px solid rgba(255,255,255,0.12)' }}>
        <h3 style={{ fontFamily: 'Syne', fontSize: '20px', color: '#F8FAFC', margin: '0 0 12px' }}>{title}</h3>
        <p style={{ fontFamily: 'DM Sans', fontSize: '14px', color: '#94A3B8', margin: '0 0 20px', lineHeight: 1.6 }}>{message}</p>
        {children}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px' }}>
          <button onClick={onCancel} style={{ padding: '10px 20px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontFamily: 'DM Sans', fontSize: '14px' }}>
            Cancel
          </button>
          <button onClick={onConfirm} style={{ padding: '10px 20px', borderRadius: '10px', background: `${confirmColor}22`, color: confirmColor, border: `1px solid ${confirmColor}44`, cursor: 'pointer', fontFamily: 'DM Sans', fontSize: '14px', fontWeight: 600 }}>
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// Pagination bar
function Pagination({ page, pages, total, onPage }) {
  if (pages <= 1) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <span style={{ fontFamily: 'DM Sans', fontSize: '13px', color: '#64748B' }}>
        Page {page} of {pages} · {total} total
      </span>
      <div style={{ display: 'flex', gap: '6px' }}>
        <button onClick={() => onPage(page - 1)} disabled={page <= 1}
          style={{ padding: '6px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: page <= 1 ? '#475569' : '#F8FAFC', cursor: page <= 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center' }}>
          <ChevronLeft size={14} />
        </button>
        {Array.from({ length: Math.min(pages, 5) }, (_, i) => {
          const p = page <= 3 ? i + 1 : page + i - 2
          if (p < 1 || p > pages) return null
          return (
            <button key={p} onClick={() => onPage(p)}
              style={{ padding: '6px 12px', borderRadius: '8px', fontFamily: 'DM Sans', fontSize: '13px', background: p === page ? '#F59E0B' : 'rgba(255,255,255,0.06)', color: p === page ? '#0D0B1E' : '#F8FAFC', border: `1px solid ${p === page ? '#F59E0B' : 'rgba(255,255,255,0.1)'}`, cursor: 'pointer', fontWeight: p === page ? 700 : 400 }}>
              {p}
            </button>
          )
        })}
        <button onClick={() => onPage(page + 1)} disabled={page >= pages}
          style={{ padding: '6px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: page >= pages ? '#475569' : '#F8FAFC', cursor: page >= pages ? 'default' : 'pointer', display: 'flex', alignItems: 'center' }}>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}

const statCard = (label, value, icon, color, delay = 0) => (
  <motion.div key={label} className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    style={{ padding: '24px' }}>
    <div style={{ fontSize: '28px', marginBottom: '10px' }}>{icon}</div>
    <p style={{ margin: '0 0 4px', fontFamily: 'DM Sans', fontSize: '12px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
    <p style={{ margin: 0, fontFamily: 'Syne', fontSize: '26px', fontWeight: 700, color }}>{value}</p>
  </motion.div>
)

export default function SuperAdminPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const { toasts, toast, removeToast } = useToast()

  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [chamas, setChamas] = useState([])
  const [transactions, setTransactions] = useState([])
  const [logs, setLogs] = useState([])

  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [txFilter, setTxFilter] = useState('all')

  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Suspend modal
  const [suspendModal, setSuspendModal] = useState({ open: false, user: null, reason: '' })
  // Freeze modal
  const [freezeModal, setFreezeModal] = useState({ open: false, chama: null, reason: '' })
  // Delete confirm
  const [deleteModal, setDeleteModal] = useState({ open: false, user: null })
  // Promote confirm
  const [promoteModal, setPromoteModal] = useState({ open: false, user: null })
  // Revoke confirm
  const [revokeModal, setRevokeModal] = useState({ open: false, user: null })

  const searchTimer = useRef(null)

  useEffect(() => {
    if (user && !user.isSuperAdmin) navigate('/dashboard')
  }, [user])

  const fetchData = useCallback(async (pg = 1, srch = search, flt = filter) => {
    setLoading(true)
    try {
      if (activeTab === 'overview') {
        const res = await api.get('/super-admin/stats')
        setStats(res.data.stats)
      } else if (activeTab === 'users') {
        const res = await api.get('/super-admin/users', { params: { page: pg, search: srch, filter: flt } })
        setUsers(res.data.users || [])
        setPages(res.data.pages || 1)
        setTotal(res.data.total || 0)
        setPage(pg)
      } else if (activeTab === 'chamas') {
        const res = await api.get('/super-admin/chamas', { params: { page: pg, search: srch, filter: flt } })
        setChamas(res.data.chamas || [])
        setPages(res.data.pages || 1)
        setTotal(res.data.total || 0)
        setPage(pg)
      } else if (activeTab === 'transactions') {
        const res = await api.get('/super-admin/transactions', { params: { page: pg, type: txFilter } })
        setTransactions(res.data.transactions || [])
        setPages(res.data.pages || 1)
        setTotal(res.data.total || 0)
        setPage(pg)
      } else if (activeTab === 'logs') {
        const res = await api.get('/super-admin/logs', { params: { page: pg, search: srch } })
        setLogs(res.data.logs || [])
        setPages(res.data.pages || 1)
        setTotal(res.data.total || 0)
        setPage(pg)
      }
    } catch (err) {
      console.error(err)
      if (err.response?.status === 403) navigate('/dashboard')
      else toast(err.response?.data?.message || 'Failed to load data', 'error')
    } finally {
      setLoading(false)
    }
  }, [activeTab, txFilter])

  useEffect(() => {
    setSearch('')
    setFilter('all')
    setPage(1)
    fetchData(1, '', 'all')
  }, [activeTab])

  useEffect(() => {
    if (activeTab === 'transactions') fetchData(1, search, filter)
  }, [txFilter])

  const handleSearchChange = (val) => {
    setSearch(val)
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      setPage(1)
      fetchData(1, val, filter)
    }, 400)
  }

  const handleFilterChange = (val) => {
    setFilter(val)
    setPage(1)
    fetchData(1, search, val)
  }

  const handlePage = (pg) => fetchData(pg, search, filter)

  // --- ACTIONS ---

  const doSuspend = async () => {
    try {
      await api.patch(`/super-admin/users/${suspendModal.user._id}/suspend`, { reason: suspendModal.reason })
      toast(`${suspendModal.user.fullName} suspended`, 'success')
      setSuspendModal({ open: false, user: null, reason: '' })
      fetchData(page, search, filter)
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to suspend', 'error')
    }
  }

  const doUnsuspend = async (u) => {
    try {
      await api.patch(`/super-admin/users/${u._id}/unsuspend`)
      toast(`${u.fullName} unsuspended`, 'success')
      fetchData(page, search, filter)
    } catch (err) {
      toast(err.response?.data?.message || 'Failed', 'error')
    }
  }

  const doDelete = async () => {
    try {
      await api.delete(`/super-admin/users/${deleteModal.user._id}`)
      toast(`${deleteModal.user.fullName} deleted`, 'success')
      setDeleteModal({ open: false, user: null })
      fetchData(page, search, filter)
    } catch (err) {
      toast(err.response?.data?.message || 'Failed', 'error')
    }
  }

  const doFreeze = async () => {
    try {
      await api.patch(`/super-admin/chamas/${freezeModal.chama._id}/freeze`, { reason: freezeModal.reason })
      const action = freezeModal.chama.status === 'frozen' ? 'unfrozen' : 'frozen'
      toast(`${freezeModal.chama.name} ${action}`, 'success')
      setFreezeModal({ open: false, chama: null, reason: '' })
      fetchData(page, search, filter)
    } catch (err) {
      toast(err.response?.data?.message || 'Failed', 'error')
    }
  }

  const doPromote = async () => {
    try {
      await api.patch(`/super-admin/users/${promoteModal.user._id}/promote-super-admin`)
      toast(`${promoteModal.user.fullName} is now a Super Admin`, 'success')
      setPromoteModal({ open: false, user: null })
      fetchData(page, search, filter)
    } catch (err) {
      toast(err.response?.data?.message || 'Failed', 'error')
    }
  }

  const doRevoke = async () => {
    try {
      await api.patch(`/super-admin/users/${revokeModal.user._id}/revoke-super-admin`)
      toast(`Super Admin access revoked from ${revokeModal.user.fullName}`, 'success')
      setRevokeModal({ open: false, user: null })
      fetchData(page, search, filter)
    } catch (err) {
      toast(err.response?.data?.message || 'Failed', 'error')
    }
  }

  const tabs = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'users', label: '👥 Users' },
    { id: 'chamas', label: '🏦 Chamas' },
    { id: 'transactions', label: '💸 Transactions' },
    { id: 'logs', label: '📋 Audit Logs' }
  ]

  const thStyle = { padding: '14px 16px', textAlign: 'left', fontFamily: 'DM Sans', fontSize: '11px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }
  const tdStyle = { padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }

  return (
    <div style={{ minHeight: '100vh', background: '#0D0B1E' }}>
      <div className="mesh-bg" />
      <Toast toasts={toasts} remove={removeToast} />

      {/* Modals */}
      <ConfirmModal
        open={suspendModal.open}
        title="Suspend User"
        message={`Suspending ${suspendModal.user?.fullName} will block them from logging in.`}
        confirmLabel="Suspend User"
        confirmColor="#F59E0B"
        onConfirm={doSuspend}
        onCancel={() => setSuspendModal({ open: false, user: null, reason: '' })}>
        <textarea
          placeholder="Reason for suspension..."
          value={suspendModal.reason}
          onChange={e => setSuspendModal(p => ({ ...p, reason: e.target.value }))}
          rows={3}
          style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 14px', color: '#F8FAFC', fontFamily: 'DM Sans', fontSize: '14px', resize: 'vertical', boxSizing: 'border-box' }}
        />
      </ConfirmModal>

      <ConfirmModal
        open={deleteModal.open}
        title="Delete User Permanently"
        message={`This will permanently delete ${deleteModal.user?.fullName} and all their data (memberships, contributions, loans). This cannot be undone.`}
        confirmLabel="Delete Forever"
        confirmColor="#EF4444"
        onConfirm={doDelete}
        onCancel={() => setDeleteModal({ open: false, user: null })}
      />

      <ConfirmModal
        open={freezeModal.open}
        title={freezeModal.chama?.status === 'frozen' ? 'Unfreeze Chama' : 'Freeze Chama'}
        message={freezeModal.chama?.status === 'frozen'
          ? `Unfreeze "${freezeModal.chama?.name}"? Members will be able to contribute and request loans again.`
          : `Freeze "${freezeModal.chama?.name}"? This will block all financial operations for the group.`}
        confirmLabel={freezeModal.chama?.status === 'frozen' ? 'Unfreeze' : 'Freeze Chama'}
        confirmColor={freezeModal.chama?.status === 'frozen' ? '#10B981' : '#EF4444'}
        onConfirm={doFreeze}
        onCancel={() => setFreezeModal({ open: false, chama: null, reason: '' })}>
        {freezeModal.chama?.status !== 'frozen' && (
          <input
            placeholder="Reason for freezing..."
            value={freezeModal.reason}
            onChange={e => setFreezeModal(p => ({ ...p, reason: e.target.value }))}
            style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 14px', color: '#F8FAFC', fontFamily: 'DM Sans', fontSize: '14px', boxSizing: 'border-box' }}
          />
        )}
      </ConfirmModal>

      <ConfirmModal
        open={promoteModal.open}
        title="Promote to Super Admin"
        message={`Grant ${promoteModal.user?.fullName} full platform control? They will be able to suspend users, freeze chamas, and manage all data.`}
        confirmLabel="Promote to Super Admin"
        confirmColor="#8B5CF6"
        onConfirm={doPromote}
        onCancel={() => setPromoteModal({ open: false, user: null })}
      />

      <ConfirmModal
        open={revokeModal.open}
        title="Revoke Super Admin Access"
        message={`Remove Super Admin privileges from ${revokeModal.user?.fullName}? They will lose all platform-level controls.`}
        confirmLabel="Revoke Access"
        confirmColor="#EF4444"
        onConfirm={doRevoke}
        onCancel={() => setRevokeModal({ open: false, user: null })}
      />

      {/* Top Bar */}
      <div style={{ background: 'rgba(13,11,30,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(245,158,11,0.2)', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={20} color="#F59E0B" />
          </div>
          <div>
            <span style={{ fontFamily: 'Syne', fontSize: '18px', fontWeight: 700, color: '#F59E0B', display: 'block' }}>Super Admin Console</span>
            <span style={{ fontFamily: 'DM Sans', fontSize: '12px', color: '#475569' }}>ChamaChain Platform Control</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => fetchData(page, search, filter)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#94A3B8' }}>
            <RefreshCw size={14} />
          </button>
          <span style={{ fontFamily: 'DM Sans', color: '#94A3B8', fontSize: '13px' }}>
            <span style={{ color: '#F59E0B' }}>👑</span> {user?.fullName}
          </span>
          <button className="btn-ghost" onClick={() => navigate('/dashboard')} style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ArrowLeft size={14} /> Back to App
          </button>
        </div>
      </div>

      <div style={{ padding: '32px', position: 'relative', zIndex: 1 }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '28px', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', padding: '6px', width: 'fit-content', border: '1px solid rgba(255,255,255,0.06)' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                fontFamily: 'DM Sans', fontWeight: 600, fontSize: '13px',
                background: activeTab === tab.id ? '#F59E0B' : 'transparent',
                color: activeTab === tab.id ? '#0D0B1E' : '#64748B',
                transition: 'all 0.2s ease'
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{ width: '48px', height: '48px', borderRadius: '50%', border: '3px solid rgba(245,158,11,0.15)', borderTop: '3px solid #F59E0B', margin: '0 auto 16px' }} />
            <p style={{ fontFamily: 'DM Sans', color: '#64748B' }}>Loading...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

              {/* ── OVERVIEW ── */}
              {activeTab === 'overview' && stats && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
                    {statCard('Total Users', stats.totalUsers, '👥', '#0EA5E9', 0)}
                    {statCard('Total Chamas', stats.totalChamas, '🏦', '#8B5CF6', 0.07)}
                    {statCard('Money Moved', `KES ${(stats.totalMoneyMoved || 0).toLocaleString()}`, '💰', '#10B981', 0.14)}
                    {statCard('Contributions', stats.totalContributions, '💸', '#F59E0B', 0.21)}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
                    {statCard('Active Loans', stats.activeLoans, '🏛️', '#F59E0B', 0.28)}
                    {statCard('Total Loans', stats.totalLoans, '📋', '#0EA5E9', 0.35)}
                    {statCard('Suspended Users', stats.suspendedUsers, '🚫', '#EF4444', 0.42)}
                    {statCard('Frozen Chamas', stats.frozenChamas, '❄️', '#EF4444', 0.49)}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.56 }} style={{ padding: '24px' }}>
                      <h3 style={{ fontFamily: 'Syne', fontSize: '16px', color: '#F8FAFC', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Crown size={16} color="#F59E0B" /> Platform Admins
                      </h3>
                      <p style={{ fontFamily: 'Syne', fontSize: '36px', fontWeight: 700, color: '#F59E0B', margin: 0 }}>{stats.superAdmins}</p>
                      <p style={{ fontFamily: 'DM Sans', fontSize: '13px', color: '#64748B', margin: '4px 0 0' }}>Super Admin accounts</p>
                    </motion.div>
                    <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.63 }} style={{ padding: '24px' }}>
                      <h3 style={{ fontFamily: 'Syne', fontSize: '16px', color: '#F8FAFC', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Users size={16} color="#0EA5E9" /> Recent Activity
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {(stats.recentLogins || []).slice(0, 3).map((u, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontFamily: 'DM Sans', fontSize: '13px', color: '#F8FAFC' }}>{u.fullName}</span>
                            <span style={{ fontFamily: 'DM Sans', fontSize: '11px', color: '#475569' }}>
                              {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'Never'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </div>
              )}

              {/* ── USERS ── */}
              {activeTab === 'users' && (
                <>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                      <Search size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                      <input
                        placeholder="Search by name, email or phone..."
                        value={search}
                        onChange={e => handleSearchChange(e.target.value)}
                        style={{ paddingLeft: '38px', width: '100%', boxSizing: 'border-box' }}
                      />
                    </div>
                    <select value={filter} onChange={e => handleFilterChange(e.target.value)}
                      style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#F8FAFC', fontFamily: 'DM Sans', fontSize: '14px', minWidth: '140px' }}>
                      <option value="all">All Users</option>
                      <option value="suspended">Suspended</option>
                      <option value="superadmin">Super Admins</option>
                    </select>
                    <span style={{ fontFamily: 'DM Sans', color: '#64748B', fontSize: '13px', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
                      {total} users
                    </span>
                  </div>

                  <div className="glass-card" style={{ overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                            {['User', 'Email', 'Phone', 'Joined', 'Status', 'Role', 'Actions'].map(h => (
                              <th key={h} style={thStyle}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {users.length === 0 ? (
                            <tr><td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#475569', fontFamily: 'DM Sans' }}>No users found</td></tr>
                          ) : users.map((u, i) => (
                            <tr key={u._id} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                              <td style={tdStyle}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: u.isSuperAdmin ? 'rgba(245,158,11,0.2)' : '#0EA5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne', fontSize: '12px', fontWeight: 700, color: u.isSuperAdmin ? '#F59E0B' : 'white', flexShrink: 0, border: u.isSuperAdmin ? '1px solid rgba(245,158,11,0.4)' : 'none' }}>
                                    {u.isSuperAdmin ? '👑' : u.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                  </div>
                                  <span style={{ fontFamily: 'DM Sans', color: '#F8FAFC', fontWeight: 600, fontSize: '14px' }}>{u.fullName}</span>
                                </div>
                              </td>
                              <td style={{ ...tdStyle, fontFamily: 'DM Sans', color: '#94A3B8', fontSize: '13px' }}>{u.email}</td>
                              <td style={{ ...tdStyle, fontFamily: 'DM Sans', color: '#94A3B8', fontSize: '13px' }}>{u.phone || '-'}</td>
                              <td style={{ ...tdStyle, fontFamily: 'DM Sans', color: '#64748B', fontSize: '12px' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                              <td style={tdStyle}>
                                <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontFamily: 'DM Sans', background: u.isSuspended ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)', color: u.isSuspended ? '#EF4444' : '#10B981' }}>
                                  {u.isSuspended ? '🚫 Suspended' : '✅ Active'}
                                </span>
                                {u.isSuspended && u.suspendedReason && (
                                  <p style={{ margin: '4px 0 0', fontFamily: 'DM Sans', fontSize: '11px', color: '#475569' }}>
                                    {u.suspendedReason.slice(0, 30)}{u.suspendedReason.length > 30 ? '…' : ''}
                                  </p>
                                )}
                              </td>
                              <td style={tdStyle}>
                                {u.isSuperAdmin && (
                                  <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontFamily: 'DM Sans', background: 'rgba(245,158,11,0.15)', color: '#F59E0B' }}>
                                    👑 Super Admin
                                  </span>
                                )}
                              </td>
                              <td style={tdStyle}>
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                  {!u.isSuperAdmin && (
                                    <>
                                      {u.isSuspended ? (
                                        <button onClick={() => doUnsuspend(u)} title="Unsuspend"
                                          style={{ padding: '5px 10px', borderRadius: '8px', background: 'rgba(16,185,129,0.12)', color: '#10B981', border: '1px solid rgba(16,185,129,0.25)', cursor: 'pointer', fontSize: '12px', fontFamily: 'DM Sans', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                          <UserCheck size={12} /> Unsuspend
                                        </button>
                                      ) : (
                                        <button onClick={() => setSuspendModal({ open: true, user: u, reason: '' })} title="Suspend"
                                          style={{ padding: '5px 10px', borderRadius: '8px', background: 'rgba(245,158,11,0.12)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.25)', cursor: 'pointer', fontSize: '12px', fontFamily: 'DM Sans', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                          <UserX size={12} /> Suspend
                                        </button>
                                      )}
                                      <button onClick={() => setPromoteModal({ open: true, user: u })} title="Make Super Admin"
                                        style={{ padding: '5px 10px', borderRadius: '8px', background: 'rgba(139,92,246,0.12)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.25)', cursor: 'pointer', fontSize: '12px', fontFamily: 'DM Sans', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Crown size={12} /> Promote
                                      </button>
                                      <button onClick={() => setDeleteModal({ open: true, user: u })} title="Delete User"
                                        style={{ padding: '5px 10px', borderRadius: '8px', background: 'rgba(239,68,68,0.12)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.25)', cursor: 'pointer', fontSize: '12px', fontFamily: 'DM Sans', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Trash2 size={12} /> Delete
                                      </button>
                                    </>
                                  )}
                                  {u.isSuperAdmin && u._id !== user?.id && u._id !== user?._id && (
                                    <button onClick={() => setRevokeModal({ open: true, user: u })} title="Revoke Super Admin"
                                      style={{ padding: '5px 10px', borderRadius: '8px', background: 'rgba(239,68,68,0.12)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.25)', cursor: 'pointer', fontSize: '12px', fontFamily: 'DM Sans', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                      <Lock size={12} /> Revoke SA
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <Pagination page={page} pages={pages} total={total} onPage={handlePage} />
                  </div>
                </>
              )}

              {/* ── CHAMAS ── */}
              {activeTab === 'chamas' && (
                <>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                      <Search size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                      <input placeholder="Search chamas..." value={search} onChange={e => handleSearchChange(e.target.value)}
                        style={{ paddingLeft: '38px', width: '100%', boxSizing: 'border-box' }} />
                    </div>
                    <select value={filter} onChange={e => handleFilterChange(e.target.value)}
                      style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#F8FAFC', fontFamily: 'DM Sans', fontSize: '14px' }}>
                      <option value="all">All Chamas</option>
                      <option value="active">Active</option>
                      <option value="frozen">Frozen</option>
                    </select>
                    <span style={{ fontFamily: 'DM Sans', color: '#64748B', fontSize: '13px', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
                      {total} chamas
                    </span>
                  </div>

                  <div className="glass-card" style={{ overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                            {['Chama', 'Created By', 'Members', 'Balance', 'Status', 'Created', 'Actions'].map(h => (
                              <th key={h} style={thStyle}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {chamas.length === 0 ? (
                            <tr><td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#475569', fontFamily: 'DM Sans' }}>No chamas found</td></tr>
                          ) : chamas.map((chama, i) => (
                            <tr key={chama._id} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                              <td style={tdStyle}>
                                <div>
                                  <span style={{ fontFamily: 'Syne', color: '#F8FAFC', fontWeight: 600, fontSize: '14px' }}>{chama.name}</span>
                                  <p style={{ margin: '2px 0 0', fontFamily: 'DM Sans', fontSize: '11px', color: '#475569' }}>#{chama.inviteCode}</p>
                                </div>
                              </td>
                              <td style={{ ...tdStyle, fontFamily: 'DM Sans', color: '#94A3B8', fontSize: '13px' }}>{chama.createdBy?.fullName || '-'}</td>
                              <td style={{ ...tdStyle, fontFamily: 'DM Sans', color: '#94A3B8' }}>{chama.memberCount}</td>
                              <td style={{ ...tdStyle, fontFamily: 'Syne', color: '#10B981', fontWeight: 600, fontSize: '14px' }}>KES {(chama.totalBalance || 0).toLocaleString()}</td>
                              <td style={tdStyle}>
                                <div>
                                  <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontFamily: 'DM Sans', background: chama.status === 'frozen' ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)', color: chama.status === 'frozen' ? '#EF4444' : '#10B981' }}>
                                    {chama.status === 'frozen' ? '❄️ Frozen' : '✅ Active'}
                                  </span>
                                  {chama.frozenReason && <p style={{ margin: '4px 0 0', fontFamily: 'DM Sans', fontSize: '11px', color: '#475569' }}>{chama.frozenReason.slice(0, 30)}{chama.frozenReason.length > 30 ? '…' : ''}</p>}
                                </div>
                              </td>
                              <td style={{ ...tdStyle, fontFamily: 'DM Sans', color: '#64748B', fontSize: '12px' }}>{new Date(chama.createdAt).toLocaleDateString()}</td>
                              <td style={tdStyle}>
                                <button onClick={() => setFreezeModal({ open: true, chama, reason: '' })}
                                  style={{ padding: '5px 12px', borderRadius: '8px', background: chama.status === 'frozen' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)', color: chama.status === 'frozen' ? '#10B981' : '#F59E0B', border: `1px solid ${chama.status === 'frozen' ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.25)'}`, cursor: 'pointer', fontSize: '12px', fontFamily: 'DM Sans', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  {chama.status === 'frozen' ? <><Unlock size={12} /> Unfreeze</> : <><Snowflake size={12} /> Freeze</>}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <Pagination page={page} pages={pages} total={total} onPage={handlePage} />
                  </div>
                </>
              )}

              {/* ── TRANSACTIONS ── */}
              {activeTab === 'transactions' && (
                <>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                    <select value={txFilter} onChange={e => setTxFilter(e.target.value)}
                      style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#F8FAFC', fontFamily: 'DM Sans', fontSize: '14px' }}>
                      <option value="all">All Transactions</option>
                      <option value="contribution">Contributions</option>
                      <option value="loan">Loans</option>
                    </select>
                    <span style={{ fontFamily: 'DM Sans', color: '#64748B', fontSize: '13px', display: 'flex', alignItems: 'center' }}>
                      {total} transactions
                    </span>
                  </div>
                  <div className="glass-card" style={{ overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                            {['Type', 'User', 'Chama', 'Amount', 'Status', 'Date'].map(h => (
                              <th key={h} style={thStyle}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {transactions.length === 0 ? (
                            <tr><td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#475569', fontFamily: 'DM Sans' }}>No transactions found</td></tr>
                          ) : transactions.map((tx, i) => (
                            <tr key={tx._id || i} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                              <td style={tdStyle}>
                                <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontFamily: 'DM Sans', background: tx.txType === 'contribution' ? 'rgba(16,185,129,0.12)' : 'rgba(14,165,233,0.12)', color: tx.txType === 'contribution' ? '#10B981' : '#0EA5E9', textTransform: 'capitalize' }}>
                                  {tx.txType === 'contribution' ? '💸 Contribution' : '🏛️ Loan'}
                                </span>
                              </td>
                              <td style={{ ...tdStyle, fontFamily: 'DM Sans', color: '#F8FAFC', fontSize: '13px' }}>{tx.userId?.fullName || '-'}</td>
                              <td style={{ ...tdStyle, fontFamily: 'DM Sans', color: '#94A3B8', fontSize: '13px' }}>{tx.chamaId?.name || '-'}</td>
                              <td style={{ ...tdStyle, fontFamily: 'Syne', color: '#F8FAFC', fontWeight: 600 }}>KES {(tx.amount || 0).toLocaleString()}</td>
                              <td style={tdStyle}>
                                <span style={{ fontSize: '12px', fontFamily: 'DM Sans', color: ['success', 'disbursed', 'approved'].includes(tx.status) ? '#10B981' : tx.status === 'failed' || tx.status === 'rejected' ? '#EF4444' : '#F59E0B' }}>
                                  {tx.status}
                                </span>
                              </td>
                              <td style={{ ...tdStyle, fontFamily: 'DM Sans', color: '#64748B', fontSize: '12px' }}>{new Date(tx.createdAt).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <Pagination page={page} pages={pages} total={total} onPage={handlePage} />
                  </div>
                </>
              )}

              {/* ── AUDIT LOGS ── */}
              {activeTab === 'logs' && (
                <>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                      <Search size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                      <input placeholder="Filter by action (e.g. SUSPENDED, FROZEN)..." value={search} onChange={e => handleSearchChange(e.target.value)}
                        style={{ paddingLeft: '38px', width: '100%', boxSizing: 'border-box' }} />
                    </div>
                    <span style={{ fontFamily: 'DM Sans', color: '#64748B', fontSize: '13px', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
                      {total} entries
                    </span>
                  </div>
                  <div className="glass-card" style={{ overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                            {['Action', 'Performed By', 'Target', 'Chama', 'Date', 'Details'].map(h => (
                              <th key={h} style={thStyle}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {logs.length === 0 ? (
                            <tr><td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#475569', fontFamily: 'DM Sans' }}>No audit logs yet. Actions like suspend, freeze, and promote will appear here.</td></tr>
                          ) : logs.map((log, i) => {
                            const actionColor = log.action?.includes('DELETE') || log.action?.includes('SUSPEND') || log.action?.includes('FROZEN') ? '#EF4444'
                              : log.action?.includes('UNSUSPEND') || log.action?.includes('UNFROZEN') || log.action?.includes('PROMOTE') ? '#10B981'
                                : '#F59E0B'
                            return (
                              <tr key={log._id || i} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                                <td style={tdStyle}>
                                  <span style={{ fontFamily: 'DM Sans', color: actionColor, fontWeight: 700, fontSize: '12px', letterSpacing: '0.04em' }}>{log.action}</span>
                                </td>
                                <td style={{ ...tdStyle, fontFamily: 'DM Sans', color: '#F8FAFC', fontSize: '13px' }}>{log.performedBy?.fullName || '-'}</td>
                                <td style={{ ...tdStyle, fontFamily: 'DM Sans', color: '#94A3B8', fontSize: '13px' }}>{log.targetUserId?.fullName || '-'}</td>
                                <td style={{ ...tdStyle, fontFamily: 'DM Sans', color: '#94A3B8', fontSize: '13px' }}>{log.chamaId?.name || '-'}</td>
                                <td style={{ ...tdStyle, fontFamily: 'DM Sans', color: '#64748B', fontSize: '12px' }}>{new Date(log.createdAt).toLocaleString()}</td>
                                <td style={{ ...tdStyle, fontFamily: 'DM Sans', color: '#475569', fontSize: '12px' }}>
                                  {Object.entries(log.metadata || {}).filter(([k]) => !['timestamp'].includes(k)).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                    <Pagination page={page} pages={pages} total={total} onPage={handlePage} />
                  </div>
                </>
              )}

            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
