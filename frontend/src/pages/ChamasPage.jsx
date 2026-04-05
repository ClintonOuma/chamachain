
import { useState, useEffect } from 'react' 
 import { useNavigate } from 'react-router-dom' 
 import { motion, AnimatePresence } from 'framer-motion' 
 import { Plus, Users, Wallet, ArrowRight, Copy, Check } from 'lucide-react' 
 import Sidebar from '../components/Sidebar' 
 import NotificationBell from '../components/NotificationBell' 
 import ContributeModal from '../components/ContributeModal' 
 import LoanModal from '../components/LoanModal' 
 import api from '../services/api' 
 import useAuthStore from '../store/authStore' 
 
 export default function ChamasPage() { 
   const [chamas, setChamas] = useState([]) 
   const [loading, setLoading] = useState(true) 
   const [showCreate, setShowCreate] = useState(false) 
   const [showJoin, setShowJoin] = useState(false) 
   const [showContribute, setShowContribute] = useState(false) 
   const [showLoan, setShowLoan] = useState(false) 
   const [selectedChama, setSelectedChama] = useState(null) 
   const [copiedCode, setCopiedCode] = useState(null) 
   const navigate = useNavigate() 
   const { user } = useAuthStore() 
 
   useEffect(() => { 
     fetchChamas() 
   }, []) 
 
   const fetchChamas = () => { 
     api.get('/chamas').then(res => { 
       setChamas(res.data.chamas || []) 
       setLoading(false) 
     }).catch(() => setLoading(false)) 
   } 
 
   const handleCopyCode = (e, code) => { 
     e.stopPropagation() 
     navigator.clipboard.writeText(`${window.location.origin}/join/${code}`) 
     setCopiedCode(code) 
     setTimeout(() => setCopiedCode(null), 2000) 
   } 
 
   const roleBadge = { admin: { color: '#F59E0B', label: '👑 Admin' }, treasurer: { color: '#0EA5E9', label: '💼 Treasurer' }, member: { color: '#94A3B8', label: '👤 Member' }, observer: { color: '#64748B', label: '👁 Observer' } } 
 
   return ( 
     <div style={{ display: 'flex', minHeight: '100vh', background: '#0D0B1E' }}> 
       <div className="mesh-bg" /> 
       <Sidebar /> 
       <main className="main-content" style={{ marginLeft: '240px', flex: 1, padding: '32px', position: 'relative', zIndex: 1 }}> 
 
         {/* Header */} 
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}> 
           <div> 
             <h1 style={{ fontFamily: 'Syne', fontSize: '28px', color: '#F8FAFC', margin: 0 }}>My Chamas</h1> 
             <p style={{ color: '#64748B', fontFamily: 'DM Sans', marginTop: '4px' }}>{chamas.length} group{chamas.length !== 1 ? 's' : ''}</p> 
           </div> 
           <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}> 
             <button className="btn-ghost" onClick={() => setShowJoin(true)}>Join Chama</button> 
             <button className="btn-primary" onClick={() => setShowCreate(true)}>＋ New Chama</button> 
             <NotificationBell /> 
           </div> 
         </div> 
 
         {/* Loading */} 
         {loading ? ( 
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}> 
             {[1, 2, 3].map(i => ( 
               <div key={i} style={{ height: '200px', borderRadius: '20px', background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} /> 
             ))} 
           </div> 
         ) : chamas.length === 0 ? ( 
           <div style={{ textAlign: 'center', padding: '80px 0' }}> 
             <div style={{ fontSize: '64px', marginBottom: '16px' }}>🏦</div> 
             <p style={{ fontFamily: 'Syne', fontSize: '22px', color: '#F8FAFC', margin: '0 0 8px' }}>No chamas yet</p> 
             <p style={{ color: '#64748B', fontFamily: 'DM Sans', marginBottom: '32px' }}>Create your first savings group or join an existing one</p> 
             <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}> 
               <button className="btn-ghost" onClick={() => setShowJoin(true)}>Join with Code</button> 
               <button className="btn-primary" onClick={() => setShowCreate(true)}>Create Chama</button> 
             </div> 
           </div> 
         ) : ( 
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}> 
             {chamas.map((item, i) => { 
               const chama = item.chamaId || item 
               const role = item.role || 'member' 
               const badge = roleBadge[role] || roleBadge.member 
               const isAdmin = role === 'admin' 
 
               return ( 
                 <motion.div key={i} className="glass-card" 
                   initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} 
                   style={{ padding: '24px', cursor: 'pointer', position: 'relative', overflow: 'hidden' }} 
                   onClick={() => navigate(`/chama/${chama._id}`)}> 
 
                   {/* Status indicator */} 
                   {chama.status === 'frozen' && ( 
                     <div style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(239,68,68,0.9)', padding: '4px 12px', borderBottomLeftRadius: '12px', fontFamily: 'DM Sans', fontSize: '11px', color: 'white', fontWeight: 600 }}>❄️ Frozen</div> 
                   )} 
 
                   {/* Top row */} 
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}> 
                     <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(14,165,233,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px' }}>🏦</div> 
                     <span style={{ background: `${badge.color}22`, color: badge.color, padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontFamily: 'DM Sans', fontWeight: 600 }}>{badge.label}</span> 
                   </div> 
 
                   {/* Name & desc */} 
                   <h3 style={{ fontFamily: 'Syne', fontSize: '18px', color: '#F8FAFC', margin: '0 0 6px' }}>{chama.name}</h3> 
                   <p style={{ color: '#64748B', fontFamily: 'DM Sans', fontSize: '13px', margin: '0 0 16px', minHeight: '20px' }}>{chama.description || 'No description'}</p> 
 
                   {/* Balance */} 
                   <div style={{ marginBottom: '16px' }}> 
                     <p style={{ margin: '0 0 2px', fontFamily: 'DM Sans', fontSize: '12px', color: '#64748B' }}>Group Balance</p> 
                     <p style={{ margin: 0, fontFamily: 'Syne', fontSize: '22px', fontWeight: 800, color: '#10B981' }}>KES {(chama.totalBalance || 0).toLocaleString()}</p> 
                   </div> 
 
                   {/* Actions row */} 
                   <div style={{ display: 'flex', gap: '8px' }} onClick={e => e.stopPropagation()}> 
                     <button 
                       onClick={() => { setSelectedChama({ id: chama._id, name: chama.name, membership: item }); setShowContribute(true) }} 
                       style={{ flex: 1, padding: '8px', borderRadius: '10px', background: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)', cursor: 'pointer', fontFamily: 'DM Sans', fontSize: '12px', fontWeight: 600 }}> 
                       💸 Contribute 
                     </button> 
                     <button 
                       onClick={() => { setSelectedChama({ id: chama._id, name: chama.name, membership: item }); setShowLoan(true) }} 
                       style={{ flex: 1, padding: '8px', borderRadius: '10px', background: 'rgba(14,165,233,0.15)', color: '#0EA5E9', border: '1px solid rgba(14,165,233,0.2)', cursor: 'pointer', fontFamily: 'DM Sans', fontSize: '12px', fontWeight: 600 }}> 
                       🏛️ Loan 
                     </button> 
                     {isAdmin && ( 
                       <button 
                         onClick={(e) => handleCopyCode(e, chama.inviteCode)} 
                         style={{ padding: '8px 12px', borderRadius: '10px', background: 'rgba(139,92,246,0.15)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}> 
                         {copiedCode === chama.inviteCode ? <Check size={14} /> : <Copy size={14} />} 
                       </button> 
                     )} 
                     <button 
                       onClick={() => navigate(`/chama/${chama._id}`)} 
                       style={{ padding: '8px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}> 
                       <ArrowRight size={14} /> 
                     </button> 
                   </div> 
 
                   {/* Invite code for admin */} 
                   {isAdmin && chama.inviteCode && ( 
                     <div style={{ marginTop: '12px', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}> 
                       <span style={{ fontFamily: 'DM Sans', fontSize: '11px', color: '#475569' }}>Invite Code:</span> 
                       <span style={{ fontFamily: 'monospace', fontSize: '14px', color: '#8B5CF6', fontWeight: 700, letterSpacing: '0.15em' }}>{chama.inviteCode}</span> 
                     </div> 
                   )} 
                 </motion.div> 
               ) 
             })} 
           </div> 
         )} 
 
         {/* Modals */} 
         <AnimatePresence> 
           {showCreate && <CreateChamaModal onClose={() => setShowCreate(false)} onCreated={() => { fetchChamas(); setShowCreate(false) }} />} 
           {showJoin && <JoinChamaModal onClose={() => setShowJoin(false)} onJoined={() => { fetchChamas(); setShowJoin(false) }} />} 
           {showContribute && selectedChama && ( 
             <ContributeModal chamaId={selectedChama.id} chamaName={selectedChama.name} onClose={() => setShowContribute(false)} onSuccess={() => { fetchChamas(); setShowContribute(false) }} /> 
           )} 
           {showLoan && selectedChama && ( 
             <LoanModal chamaId={selectedChama.id} chamaName={selectedChama.name} membership={selectedChama.membership} onClose={() => setShowLoan(false)} onSuccess={() => { fetchChamas(); setShowLoan(false) }} /> 
           )} 
         </AnimatePresence> 
       </main> 
     </div> 
   ) 
 } 
 
 function CreateChamaModal({ onClose, onCreated }) { 
   const [name, setName] = useState('') 
   const [description, setDescription] = useState('') 
   const [minContribution, setMinContribution] = useState(500) 
   const [frequency, setFrequency] = useState('monthly') 
   const [loading, setLoading] = useState(false) 
   const [error, setError] = useState('') 
 
   const handleCreate = async () => { 
     if (!name.trim()) return setError('Chama name is required') 
     setLoading(true) 
     try { 
       await api.post('/chamas', { 
         name: name.trim(), 
         description: description.trim(), 
         settings: { minContribution: Number(minContribution), contributionFrequency: frequency } 
       }) 
       onCreated() 
     } catch (err) { 
       setError(err.response?.data?.message || 'Failed to create chama') 
     } finally { 
       setLoading(false) 
     } 
   } 
 
   return ( 
     <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}> 
       <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card" style={{ width: '480px', padding: '36px' }}> 
         <h3 style={{ fontFamily: 'Syne', fontSize: '22px', color: '#F8FAFC', marginBottom: '24px' }}>🏦 Create New Chama</h3> 
         <div style={{ marginBottom: '16px' }}> 
           <label style={{ fontFamily: 'DM Sans', fontSize: '13px', color: '#64748B', display: 'block', marginBottom: '8px' }}>Chama Name *</label> 
           <input placeholder="e.g. Maasai Savings Group" value={name} onChange={e => setName(e.target.value)} /> 
         </div> 
         <div style={{ marginBottom: '16px' }}> 
           <label style={{ fontFamily: 'DM Sans', fontSize: '13px', color: '#64748B', display: 'block', marginBottom: '8px' }}>Description (optional)</label> 
           <input placeholder="What is this chama for?" value={description} onChange={e => setDescription(e.target.value)} /> 
         </div> 
         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px'}}> 
           <div> 
             <label style={{ fontFamily: 'DM Sans', fontSize: '13px', color: '#64748B', display: 'block', marginBottom: '8px' }}>Min Contribution (KES)</label> 
             <input type="number" value={minContribution} onChange={e => setMinContribution(e.target.value)} min="100" /> 
           </div> 
           <div> 
             <label style={{ fontFamily: 'DM Sans', fontSize: '13px', color: '#64748B', display: 'block', marginBottom: '8px' }}>Frequency</label> 
             <select value={frequency} onChange={e => setFrequency(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: '#F8FAFC', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'DM Sans' }}> 
               <option value="monthly">Monthly</option> 
               <option value="weekly">Weekly</option> 
             </select> 
           </div> 
         </div> 
         {error && <p style={{ color: '#EF4444', fontFamily: 'DM Sans', fontSize: '13px', marginBottom: '16px' }}>{error}</p>} 
         <div style={{ display: 'flex', gap: '12px' }}> 
           <button className="btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button> 
           <button className="btn-primary" style={{ flex: 1 }} onClick={handleCreate} disabled={loading}> 
             {loading ? 'Creating...' : 'Create Chama'} 
           </button> 
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
     if (!code.trim() || code.length < 6) return setError('Enter a valid 6-character invite code') 
     setLoading(true) 
     try { 
       await api.post('/chamas/join', { inviteCode: code.toUpperCase().trim() }) 
       onJoined() 
     } catch (err) { 
       setError(err.response?.data?.message || 'Invalid invite code') 
     } finally { 
       setLoading(false) 
     } 
   } 
 
   return ( 
     <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}> 
       <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card" style={{ width: '420px', padding: '36px', textAlign: 'center' }}> 
         <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔑</div> 
         <h3 style={{ fontFamily: 'Syne', fontSize: '22px', color: '#F8FAFC', marginBottom: '8px' }}>Join a Chama</h3> 
         <p style={{ fontFamily: 'DM Sans', color: '#64748B', marginBottom: '24px', fontSize: '14px' }}>Enter the 6-character invite code shared by the chama admin</p> 
         <input 
           placeholder="Enter code e.g. AB1C2D" 
           value={code} 
           onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))} 
           style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '0.3em', fontFamily: 'monospace', marginBottom: '8px' }} 
           maxLength={6} 
         /> 
         {error && <p style={{ color: '#EF4444', fontFamily: 'DM Sans', fontSize: '13px', marginBottom: '12px' }}>{error}</p>} 
         <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}> 
           <button className="btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button> 
           <button className="btn-primary" style={{ flex: 1 }} onClick={handleJoin} disabled={loading || code.length < 6}> 
             {loading ? 'Joining...' : 'Join Chama'} 
           </button> 
         </div> 
       </motion.div> 
     </div> 
   ) 
 }
