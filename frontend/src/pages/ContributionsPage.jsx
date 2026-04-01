import { useState, useEffect } from 'react' 
 import { motion } from 'framer-motion' 
 import Sidebar from '../components/Sidebar' 
 import api from '../services/api' 
 
 export default function ContributionsPage() { 
   const [allContributions, setAllContributions] = useState([]) 
   const [chamas, setChamas] = useState([]) 
   const [loading, setLoading] = useState(true) 
   const [selectedChama, setSelectedChama] = useState('all') 
   const [totalThisMonth, setTotalThisMonth] = useState(0) 
   const [totalAllTime, setTotalAllTime] = useState(0) 
 
   useEffect(() => { 
     const fetchAll = async () => { 
       setLoading(true) 
       try { 
         const chamasRes = await api.get('/chamas') 
         const chamaList = chamasRes.data.chamas || [] 
         setChamas(chamaList) 
         const allContribs = [] 
         for (const item of chamaList) { 
           const chamaId = item.chamaId?._id || item._id 
           try { 
             const res = await api.get(`/contributions/${chamaId}/my`) 
             const contribs = (res.data.contributions || []).map(c => ({ 
               ...c, 
               chamaName: item.chamaId?.name || item.name 
             })) 
             allContribs.push(...contribs) 
           } catch (e) {} 
         } 
         allContribs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) 
         setAllContributions(allContribs) 
         const now = new Date() 
         const thisMonth = allContribs.filter(c => { 
           const d = new Date(c.createdAt) 
           return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() 
         }) 
         setTotalThisMonth(thisMonth.reduce((s, c) => s + c.amount, 0)) 
         setTotalAllTime(allContribs.reduce((s, c) => s + c.amount, 0)) 
       } catch (err) { 
         console.error(err) 
       } finally { 
         setLoading(false) 
       } 
     } 
     fetchAll() 
   }, []) 
 
   const filtered = selectedChama === 'all' 
     ? allContributions 
     : allContributions.filter(c => c.chamaName === selectedChama) 
 
   return ( 
     <div style={{ display: 'flex', minHeight: '100vh', background: '#0D0B1E' }}> 
       <div className="mesh-bg" /> 
       <Sidebar /> 
       <main className="main-content" style={{ marginLeft: '240px', flex: 1, padding: '32px', position: 'relative', zIndex: 1 }}> 
         <div style={{ marginBottom: '32px' }}> 
           <h1 style={{ fontFamily: 'Syne', fontSize: '28px', color: '#F8FAFC', margin: 0 }}>My Contributions</h1> 
           <p style={{ color: '#64748B', fontFamily: 'DM Sans', marginTop: '4px' }}>Track all your savings across chamas</p> 
         </div> 
 
         {/* Stats Row */} 
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}> 
           {[ 
             { label: 'This Month', value: `KES ${totalThisMonth.toLocaleString()}`, color: '#10B981' }, 
             { label: 'All Time', value: `KES ${totalAllTime.toLocaleString()}`, color: '#0EA5E9' }, 
             { label: 'Total Entries', value: allContributions.length, color: '#8B5CF6' } 
           ].map((stat, i) => ( 
             <motion.div key={i} className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} style={{ padding: '24px' }}> 
               <p style={{ margin: '0 0 8px', fontFamily: 'DM Sans', fontSize: '13px', color: '#64748B' }}>{stat.label}</p> 
               <p style={{ margin: 0, fontFamily: 'Syne', fontSize: '24px', fontWeight: 700, color: stat.color }}>{stat.value}</p> 
             </motion.div> 
           ))} 
         </div> 
 
         {/* Filter */} 
         <div style={{ marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center' }}> 
           <select 
             value={selectedChama} 
             onChange={e => setSelectedChama(e.target.value)} 
             style={{ padding: '10px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: '#F8FAFC', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'DM Sans' }} 
           > 
             <option value="all">All Chamas</option> 
             {chamas.map((item, i) => ( 
               <option key={i} value={item.chamaId?.name || item.name}> 
                 {item.chamaId?.name || item.name} 
               </option> 
             ))} 
           </select> 
           <span style={{ color: '#64748B', fontFamily: 'DM Sans', fontSize: '13px' }}>{filtered.length} records</span> 
         </div> 
 
         {/* Table */} 
         <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}> 
           {loading ? ( 
             <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>Loading...</div> 
           ) : filtered.length === 0 ? ( 
             <div style={{ padding: '60px', textAlign: 'center' }}> 
               <div style={{ fontSize: '48px', marginBottom: '12px' }}>💸</div> 
               <p style={{ fontFamily: 'Syne', color: '#F8FAFC', fontSize: '18px' }}>No contributions yet</p> 
               <p style={{ color: '#64748B', fontFamily: 'DM Sans' }}>Go to a chama and make your first contribution</p> 
             </div> 
           ) : ( 
             <table style={{ width: '100%', borderCollapse: 'collapse' }}> 
               <thead> 
                 <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}> 
                   {['Chama', 'Amount', 'M-Pesa Ref', 'Date', 'Status'].map(h => ( 
                     <th key={h} style={{ padding: '16px', textAlign: 'left', fontFamily: 'DM Sans', fontSize: '12px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th> 
                   ))} 
                 </tr> 
               </thead> 
               <tbody> 
                 {filtered.map((c, i) => ( 
                   <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}> 
                     <td style={{ padding: '14px 16px', fontFamily: 'DM Sans', color: '#F8FAFC' }}>{c.chamaName}</td> 
                     <td style={{ padding: '14px 16px', fontFamily: 'Syne', color: '#10B981', fontWeight: 600 }}>KES {c.amount?.toLocaleString()}</td> 
                     <td style={{ padding: '14px 16px', fontFamily: 'monospace', color: '#64748B', fontSize: '12px' }}>{c.mpesaRef}</td> 
                     <td style={{ padding: '14px 16px', fontFamily: 'DM Sans', color: '#94A3B8', fontSize: '13px' }}>{new Date(c.createdAt).toLocaleDateString()}</td> 
                     <td style={{ padding: '14px 16px' }}> 
                       <span style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981', padding: '3px 10px', borderRadius: '10px', fontSize: '12px' }}>{c.status}</span> 
                     </td> 
                   </tr> 
                 ))} 
               </tbody> 
             </table> 
           )} 
         </div> 
       </main> 
     </div> 
   ) 
 } 
