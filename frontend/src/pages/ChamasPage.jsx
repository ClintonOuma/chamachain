import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Users, Wallet, ArrowRight } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import api from '../services/api'
import usePageTitle from '../hooks/usePageTitle'

export default function ChamasPage() {
  usePageTitle('My Chamas')
  const [chamas, setChamas] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/chamas').then(res => {
      setChamas(res.data.chamas || [])
      setLoading(false)
    }).catch(err => {
      console.error(err)
      setLoading(false)
    })
  }, [])

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0D0B1E' }}>
      <div className="mesh-bg" />
      <Sidebar />
      <main className="main-content" style={{ marginLeft: '240px', flex: 1, padding: '32px', position: 'relative', zIndex: 1, overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontFamily: 'Syne', fontSize: '28px', color: '#F8FAFC', margin: 0 }}>My Chamas</h1>
            <p style={{ color: '#64748B', marginTop: '4px', fontFamily: 'DM Sans' }}>Manage your savings groups</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-ghost" onClick={() => setShowJoin(true)}>Join Chama</button>
            <button className="btn-primary" onClick={() => setShowCreate(true)}>＋ New Chama</button>
          </div>
        </div>

        {/* Chamas Grid */}
        {loading ? (
          <div style={{ color: '#64748B', fontFamily: 'DM Sans' }}>Loading...</div>
        ) : chamas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: '64px' }}>🏦</div>
            <p style={{ fontFamily: 'Syne', fontSize: '20px', color: '#F8FAFC', marginTop: '16px' }}>No chamas yet</p>
            <p style={{ color: '#64748B', fontFamily: 'DM Sans', marginTop: '8px' }}>Create or join a chama to get started</p>
            <button className="btn-primary" style={{ marginTop: '24px' }} onClick={() => setShowCreate(true)}>Create Your First Chama</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {chamas.map((item, i) => {
              const chama = item.chamaId || item
              const role = item.role || 'member'
              const roleColors = { admin: '#F59E0B', treasurer: '#0EA5E9', member: '#64748B', observer: '#475569' }
              return (
                <motion.div
                  key={chama._id}
                  className="glass-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  style={{ padding: '24px', cursor: 'pointer' }}
                  onClick={() => navigate(`/chama/${chama._id}`)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '14px',
                      background: 'rgba(14,165,233,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '24px'
                    }}>🏦</div>
                    <span style={{
                      background: `${roleColors[role] || '#64748B'}22`,
                      color: roleColors[role] || '#64748B',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontFamily: 'DM Sans',
                      fontWeight: 600,
                      textTransform: 'capitalize'
                    }}>{role}</span>
                  </div>
                  <h3 style={{ fontFamily: 'Syne', fontSize: '18px', color: '#F8FAFC', margin: '0 0 8px' }}>{chama.name}</h3>
                  <p style={{ color: '#64748B', fontSize: '13px', fontFamily: 'DM Sans', margin: '0 0 16px' }}>{chama.description || 'No description'}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#0EA5E9', fontFamily: 'Syne', fontWeight: 700 }}>
                      KES {(chama.totalBalance || chama.balance || 0).toLocaleString()}
                    </span>
                    <ArrowRight size={16} color="#64748B" />
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Create Chama Modal */}
        {showCreate && <CreateChamaModal onClose={() => setShowCreate(false)} onCreated={(c) => { setChamas(prev => [...prev, c]); setShowCreate(false) }} />}
        {showJoin && <JoinChamaModal onClose={() => setShowJoin(false)} onJoined={() => { api.get('/chamas').then(r => setChamas(r.data.chamas || [])); setShowJoin(false) }} />}
      </main>
    </div>
  )
}

function CreateChamaModal({ onClose, onCreated }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  
  const handleCreate = async () => {
    if (!name.trim()) return
    setLoading(true)
    try {
      const res = await api.post('/chamas', { name, description })
      onCreated(res.data.chama)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card" style={{ width: '440px', padding: '40px' }}>
        <h2 style={{ fontFamily: 'Syne', fontSize: '22px', color: '#F8FAFC', marginBottom: '24px' }}>Create New Chama</h2>
        <input 
          placeholder="Chama Name" 
          value={name} 
          onChange={e => setName(e.target.value)} 
          style={{ width: '100%', padding: '16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', borderRadius: '12px', marginBottom: '16px', outline: 'none' }} 
        />
        <input 
          placeholder="Description (optional)" 
          value={description} 
          onChange={e => setDescription(e.target.value)} 
          style={{ width: '100%', padding: '16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', borderRadius: '12px', marginBottom: '24px', outline: 'none' }} 
        />
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-ghost" style={{ flex: 1, padding: '12px', borderRadius: '12px' }} onClick={onClose}>Cancel</button>
          <button className="btn-primary" style={{ flex: 1, padding: '12px', borderRadius: '12px', background: '#0EA5E9', color: '#FFF', border: 'none' }} onClick={handleCreate} disabled={loading}>{loading ? 'Creating...' : 'Create Chama'}</button>
        </div>
      </motion.div>
    </div>
  )
}

function JoinChamaModal({ onClose, onJoined }) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const handleJoin = async () => {
    if (!code.trim()) return
    setLoading(true)
    try {
      await api.post('/chamas/join', { inviteCode: code.toUpperCase() })
      onJoined()
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid invite code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card" style={{ width: '440px', padding: '40px' }}>
        <h2 style={{ fontFamily: 'Syne', fontSize: '22px', color: '#F8FAFC', marginBottom: '8px' }}>Join a Chama</h2>
        <p style={{ color: '#64748B', fontFamily: 'DM Sans', marginBottom: '24px' }}>Enter the 6-digit invite code</p>
        <input 
          placeholder="Invite Code (e.g. 4YICWH)" 
          value={code} 
          onChange={e => setCode(e.target.value.toUpperCase())} 
          style={{ width: '100%', padding: '16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', borderRadius: '12px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.2em', textAlign: 'center', fontSize: '20px', outline: 'none' }} 
          maxLength={6} 
        />
        {error && <p style={{ color: '#EF4444', fontSize: '12px', marginBottom: '16px' }}>{error}</p>}
        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
          <button className="btn-ghost" style={{ flex: 1, padding: '12px', borderRadius: '12px' }} onClick={onClose}>Cancel</button>
          <button className="btn-primary" style={{ flex: 1, padding: '12px', borderRadius: '12px', background: '#0EA5E9', color: '#FFF', border: 'none' }} onClick={handleJoin} disabled={loading}>{loading ? 'Joining...' : 'Join Chama'}</button>
        </div>
      </motion.div>
    </div>
  )
}
