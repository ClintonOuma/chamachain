
jsximport { useState, useEffect } from 'react' 
 import { motion } from 'framer-motion' 
 import Sidebar from '../components/Sidebar' 
 import NotificationBell from '../components/NotificationBell' 
 import ContributeModal from '../components/ContributeModal' 
 import api from '../services/api' 
 
 export default function ContributionsPage() { 
   const [allContributions, setAllContributions] = useState([]) 
   const [chamas, setChamas] = useState([]) 
   const [loading, setLoading] = useState(true) 
   const [selectedChama, setSelectedChama] = useState('all') 
   const [selectedMonth, setSelectedMonth] = useState('all') 
   const [showContribute, setShowContribute] = useState(false) 
   const [activeChama, setActiveChama] = useState(null) 
   const [totalThisMonth, setTotalThisMonth] = useState(0) 
   const [totalAllTime, setTotalAllTime] = useState(0) 
 
   useEffect(() => { 
     fetchAll() 
   }, []) 
 
   const fetchAll = async () => { 
     setLoading(true) 
     try { 
       const chamasRes = await api.get('/chamas') 
       const chamaList = chamasRes.data.chamas || [] 
       setChamas(chamaList) 
 
       if (chamaList.length > 0) { 
         const first = chamaList[0] 
         setActiveChama({ id: first.chamaId?._id || first._id, name: first.chamaId?.name || first.name }) 
       } 
 
       const allContribs = [] 
       for (const item of chamaList) { 
         const chamaId = item.chamaId?._id || item._id 
         const chamaName = item.chamaId?.name || item.name 
         try { 
           const res = await api.get(`/contributions/${chamaId}/my`) 
           const contribs = (res.data.contributions || []).map(c => ({ ...c, chamaName, chamaId })) 
           allContribs.push(...contribs) 
         } catch (e) {} 
       } 
       allContribs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) 
       setAllContributions(allContribs) 
 
       const now = new Date() 
       const thisMonth = allContribs.filter(c => { 
         const d = new Date(c.createdAt) 
         return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && c.status === 'success' 
       }) 
       setTotalThisMonth(thisMonth.reduce((s, c) => s + c.amount, 0)) 
       setTotalAllTime(allContribs.filter(c => c.status === 'success').reduce((s, c) => s + c.amount, 0)) 
     } catch (err) { 
       console.error(err) 
     } finally { 
       setLoading(false) 
     } 
   } 
 
   // Get unique months for filter 
   const months = [...new Set(allContributions.map(c => c.periodMonth).filter(Boolean))].sort().reverse() 
 
   const filtered = allContributions.filter(c => { 
     const chamaMatch = selectedChama === 'all' || c.chamaName === selectedChama 
     const monthMatch = selectedMonth === 'all' || c.periodMonth === selectedMonth 
     return chamaMatch && monthMatch 
   }) 
 
   const successContribs = filtered.filter(c => c.status === 'success') 
   const filteredTotal = successContribs.reduce((s, c) => s + c.amount, 0) 
 
   return ( 
     <div style={{ display: 'flex', minHeight: '100vh', background: '#0D0B1E' }}> 
       <div className="mesh-bg" /> 
       <Sidebar /> 
       <main className="main-content" style={{ marginLeft: '240px', flex: 1, padding: '32px', position: 'relative', zIndex: 1 }}> 
 
         {/* Header */} 
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}> 
           <div> 
             <h1 style={{ fontFamily: 'Syne', fontSize: '28px', color: '#F8FAFC', margin: 0 }}>💸 My Contributions</h1> 
             <p style={{ color: '#64748B', fontFamily: 'DM Sans', marginTop: '4px' }}>Track all your savings across chamas</p> 
           </div> 
           <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}> 
             {activeChama && ( 
               <button className="btn-primary" onClick={() => setShowContribute(true)}>+ Contribute</button> 
             )} 
             <NotificationBell /> 
           </div> 
         </div> 
 
         {/* Stats */} 
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}> 
           {[ 
             { label: 'This Month', value: `KES ${totalThisMonth.toLocaleString()}`, color: '#10B981' }, 
             { label: 'All Time', value: `KES ${totalAllTime.toLocaleString()}`, color: '#0EA5E9' }, 
             { label: 'Total Entries', value: allContributions.length, color: '#8B5CF6' }, 
             { label: 'Filtered Total', value: `KES ${filteredTotal.toLocaleString()}`, color: '#F59E0B' } 
           ].map((stat, i) => ( 
             <motion.div key={i} className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} style={{ padding: '20px' }}> 
               <p style={{ margin: '0 0 6px', fontFamily: 'DM Sans', fontSize: '12px', color: '#64748B' }}>{stat.label}</p> 
               <p style={{ margin: 0, fontFamily: 'Syne', fontSize: '20px', fontWeight: 800, color: stat.color }}>{stat.value}</p> 
             </motion.div> 
           ))} 
         </div> 
 
         {/* Filters */} 
         <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}> 
           <select value={selectedChama} onChange={e => setSelectedChama(e.target.value)} 
             style={{ padding: '10px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: '#F8FAFC', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'DM Sans', fontSize: '13px' }}> 
             <option value="all">All Chamas</option> 
             {chamas.map((item, i) => ( 
               <option key={i} value={item.chamaId?.name || item.name}>{item.chamaId?.name || item.name}</option> 
             ))} 
           </select> 
 
           <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} 
             style={{ padding: '10px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: '#F8FAFC', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'DM Sans', fontSize: '13px' }}> 
             <option value="all">All Months</option> 
             {months.map((month, i) => ( 
               <option key={i} value={month}>{month}</option> 
             ))} 
           </select> 
 
           {/* Chama selector for contribute */} 
           {chamas.length > 1 && ( 
             <select 
               value={activeChama?.id || ''} 
               onChange={e => { 
                 const item = chamas.find(c => (c.chamaId?._id || c._id) === e.target.value) 
                 if (item) setActiveChama({ id: item.chamaId?._id || item._id, name: item.chamaId?.name || item.name }) 
               }} 
               style={{ padding: '10px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: '#F8FAFC', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'DM Sans', fontSize: '13px' }}> 
               {chamas.map((item, i) => { 
                 const id = item.chamaId?._id || item._id 
                 const name = item.chamaId?.name || item.name 
                 return <option key={i} value={id}>Contribute to: {name}</option> 
               })} 
             </select> 
           )} 
 
           <span style={{ fontFamily: 'DM Sans', color: '#64748B', fontSize: '13px' }}>{filtered.length} records</span> 
         </div> 
 
         {/* Table */} 
         <div className="glass-card" style={{ overflow: 'hidden' }}> 
           {loading ? ( 
             <div style={{ padding: '40px', textAlign: 'center', color: '#64748B', fontFamily: 'DM Sans' }}>Loading contributions...</div> 
           ) : filtered.length === 0 ? ( 
             <div style={{ padding: '60px', textAlign: 'center' }}> 
               <div style={{ fontSize: '48px', marginBottom: '12px' }}>💸</div> 
               <p style={{ fontFamily: 'Syne', color: '#F8FAFC', fontSize: '18px', margin: '0 0 8px' }}>No contributions found</p> 
               <p style={{ color: '#64748B', fontFamily: 'DM Sans', marginBottom: '24px' }}> 
                 {allContributions.length === 0 ? 'Make your first contribution to get started' : 'Try changing the filters above'} 
               </p> 
               {activeChama && allContributions.length === 0 && ( 
                 <button className="btn-primary" onClick={() => setShowContribute(true)}>Make First Contribution</button> 
               )} 
             </div> 
           ) : ( 
             <> 
               {/* Table header */} 
               <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1fr 0.8fr', gap: '0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}> 
                 {'Chama', 'Amount', 'M-Pesa Ref', 'Date', 'Status'].map(h => ( 
                   <div key={h} style={{ padding: '14px 20px', fontFamily: 'DM Sans', fontSize: '11px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{h}</div> 
                 ))} 
               </div> 
 
               {/* Table rows */} 
               {filtered.map((c, i) => ( 
                 <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} 
                   style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1fr 0.8fr', borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)', transition: 'background 0.2s' }} 
                   onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'} 
                   onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)'} 
                 > 
                   <div style={{ padding: '14px 20px' }}> 
                     <p style={{ margin: 0, fontFamily: 'DM Sans', fontSize: '14px', color: '#F8FAFC', fontWeight: 500 }}>{c.chamaName}</p> 
                     {c.periodMonth && <p style={{ margin: '2px 0 0', fontFamily: 'DM Sans', fontSize: '11px', color: '#475569' }}>{c.periodMonth}</p>} 
                   </div> 
                   <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center' }}> 
                     <span style={{ fontFamily: 'Syne', fontSize: '15px', color: '#10B981', fontWeight: 700 }}>KES {c.amount?.toLocaleString()}</span> 
                   </div> 
                   <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center' }}> 
                     <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.mpesaRef || '—'}</span> 
                   </div> 
                   <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center' }}> 
                     <span style={{ fontFamily: 'DM Sans', fontSize: '13px', color: '#94A3B8' }}>{new Date(c.createdAt).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' })}</span> 
                   </div> 
                   <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center' }}> 
                     <span style={{ 
                       padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontFamily: 'DM Sans', fontWeight: 600, 
                       background: c.status === 'success' ? 'rgba(16,185,129,0.15)' : c.status === 'pending' ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)', 
                       color: c.status === 'success' ? '#10B981' : c.status === 'pending' ? '#F59E0B' : '#EF4444' 
                     }}> 
                       {c.status} 
                     </span> 
                   </div> 
                 </motion.div> 
               ))} 
             </> 
           )} 
         </div> 
       </main> 
 
       {/* Contribute Modal */} 
       {showContribute && activeChama && ( 
         <ContributeModal 
           chamaId={activeChama.id} 
           chamaName={activeChama.name} 
           onClose={() => setShowContribute(false)} 
           onSuccess={() => { setShowContribute(false); fetchAll() }} 
         /> 
       )} 
     </div> 
   ) 
 }