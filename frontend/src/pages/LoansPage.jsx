import { useState, useEffect } from 'react' 
 import { motion } from 'framer-motion' 
 import Sidebar from '../components/Sidebar' 
 import api from '../services/api' 
 
 export default function LoansPage() { 
   const [allLoans, setAllLoans] = useState([]) 
   const [chamas, setChamas] = useState([]) 
   const [loading, setLoading] = useState(true) 
   const [showRepayModal, setShowRepayModal] = useState(false) 
   const [selectedLoan, setSelectedLoan] = useState(null) 
   const [repayAmount, setRepayAmount] = useState('') 
 
   useEffect(() => { 
     const fetchAll = async () => { 
       setLoading(true) 
       try { 
         const chamasRes = await api.get('/chamas') 
         const chamaList = chamasRes.data.chamas || [] 
         setChamas(chamaList) 
         const allL = [] 
         for (const item of chamaList) { 
           const chamaId = item.chamaId?._id || item._id 
           const chamaName = item.chamaId?.name || item.name 
           try { 
             const res = await api.get(`/loans/${chamaId}/my`) 
             const loans = (res.data.loans || []).map(l => ({ ...l, chamaName, chamaId })) 
             allL.push(...loans) 
           } catch (e) {} 
         } 
         allL.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) 
         setAllLoans(allL) 
       } catch (err) { 
         console.error(err) 
       } finally { 
         setLoading(false) 
       } 
     } 
     fetchAll() 
   }, []) 
 
   const handleRepay = async () => { 
     if (!repayAmount || !selectedLoan) return 
     try { 
       await api.post(`/loans/${selectedLoan.chamaId}/loans/${selectedLoan._id}/repay`, { 
         amount: Number(repayAmount), 
         mpesaRef: 'REPAY' + Date.now() 
       }) 
       setShowRepayModal(false) 
       setRepayAmount('') 
       window.location.reload() 
     } catch (err) { 
       alert(err.response?.data?.message || 'Repayment failed') 
     } 
   } 
 
   const activeLoans = allLoans.filter(l => l.status === 'disbursed') 
   const otherLoans = allLoans.filter(l => l.status !== 'disbursed') 
 
   return ( 
     <div style={{ display: 'flex', minHeight: '100vh', background: '#0D0B1E' }}> 
       <div className="mesh-bg" /> 
       <Sidebar /> 
       <main className="main-content" style={{ marginLeft: '240px', flex: 1, padding: '32px', position: 'relative', zIndex: 1 }}> 
         <div style={{ marginBottom: '32px' }}> 
           <h1 style={{ fontFamily: 'Syne', fontSize: '28px', color: '#F8FAFC', margin: 0 }}>My Loans</h1> 
           <p style={{ color: '#64748B', fontFamily: 'DM Sans', marginTop: '4px' }}>Track your loans and repayments</p> 
         </div> 
 
         {/* Stats */} 
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}> 
           {[ 
             { label: 'Active Loans', value: activeLoans.length, color: '#0EA5E9' }, 
             { label: 'Total Borrowed', value: `KES ${allLoans.reduce((s, l) => s + (l.amount || 0), 0).toLocaleString()}`, color: '#8B5CF6' }, 
             { label: 'Total Repaid', value: `KES ${allLoans.reduce((s, l) => s + (l.repayments?.reduce((r, p) => r + p.amount, 0) || 0), 0).toLocaleString()}`, color: '#10B981' } 
           ].map((stat, i) => ( 
             <motion.div key={i} className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} style={{ padding: '24px' }}> 
               <p style={{ margin: '0 0 8px', fontFamily: 'DM Sans', fontSize: '13px', color: '#64748B' }}>{stat.label}</p> 
               <p style={{ margin: 0, fontFamily: 'Syne', fontSize: '24px', fontWeight: 700, color: stat.color }}>{stat.value}</p> 
             </motion.div> 
           ))} 
         </div> 
 
         {/* Active Loans */} 
         {activeLoans.length > 0 && ( 
           <> 
             <h2 style={{ fontFamily: 'Syne', fontSize: '18px', color: '#F8FAFC', marginBottom: '16px' }}>Active Loans</h2> 
             {activeLoans.map((loan, i) => { 
               const totalRepaid = loan.repayments?.reduce((s, r) => s + r.amount, 0) || 0 
               const progress = Math.min((totalRepaid / loan.totalRepayable) * 100, 100) 
               return ( 
                 <motion.div key={i} className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '24px', marginBottom: '12px' }}> 
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}> 
                     <div> 
                       <p style={{ margin: 0, fontFamily: 'Syne', fontSize: '20px', color: '#F8FAFC', fontWeight: 700 }}>KES {loan.amount?.toLocaleString()}</p> 
                       <p style={{ margin: '4px 0 0', color: '#64748B', fontFamily: 'DM Sans', fontSize: '13px' }}>{loan.chamaName} · {loan.purpose}</p> 
                     </div> 
                     <button 
                       onClick={() => { setSelectedLoan(loan); setShowRepayModal(true) }} 
                       className="btn-primary" 
                       style={{ height: '40px', padding: '0 20px' }} 
                     >Make Repayment</button> 
                   </div> 
                   <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}> 
                     <span style={{ fontSize: '13px', color: '#64748B', fontFamily: 'DM Sans' }}>Repayment Progress</span> 
                     <span style={{ fontSize: '13px', color: '#0EA5E9', fontFamily: 'DM Sans' }}>KES {totalRepaid.toLocaleString()} / {loan.totalRepayable?.toLocaleString()}</span> 
                   </div> 
                   <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)' }}> 
                     <div style={{ height: '100%', borderRadius: '4px', background: 'linear-gradient(90deg, #0EA5E9, #8B5CF6)', width: `${progress}%`, transition: 'width 0.5s ease' }} /> 
                   </div> 
                   {loan.dueDate && ( 
                     <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#F59E0B', fontFamily: 'DM Sans' }}> 
                       Due: {new Date(loan.dueDate).toLocaleDateString()} 
                     </p> 
                   )} 
                 </motion.div> 
               ) 
             })} 
           </> 
         )} 
 
         {/* Loan History */} 
         {otherLoans.length > 0 && ( 
           <> 
             <h2 style={{ fontFamily: 'Syne', fontSize: '18px', color: '#F8FAFC', margin: '32px 0 16px' }}>Loan History</h2> 
             {otherLoans.map((loan, i) => ( 
               <div key={i} className="glass-card" style={{ padding: '20px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}> 
                 <div> 
                   <p style={{ margin: 0, fontFamily: 'Syne', color: '#F8FAFC', fontWeight: 600 }}>KES {loan.amount?.toLocaleString()}</p> 
                   <p style={{ margin: '4px 0 0', color: '#64748B', fontFamily: 'DM Sans', fontSize: '13px' }}>{loan.chamaName} · {loan.purpose}</p> 
                 </div> 
                 <span style={{ 
                   padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontFamily: 'DM Sans', 
                   background: loan.status === 'repaid' ? 'rgba(16,185,129,0.15)' : loan.status === 'rejected' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)', 
                   color: loan.status === 'repaid' ? '#10B981' : loan.status === 'rejected' ? '#EF4444' : '#F59E0B' 
                 }}>{loan.status}</span> 
               </div> 
             ))} 
           </> 
         )} 
 
         {allLoans.length === 0 && !loading && ( 
           <div style={{ textAlign: 'center', padding: '80px 0' }}> 
             <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏛️</div> 
             <p style={{ fontFamily: 'Syne', color: '#F8FAFC', fontSize: '18px' }}>No loans yet</p> 
             <p style={{ color: '#64748B', fontFamily: 'DM Sans' }}>Request a loan from any of your chamas</p> 
           </div> 
         )} 
 
         {/* Repay Modal */} 
         {showRepayModal && selectedLoan && ( 
           <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}> 
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card" style={{ width: '400px', padding: '36px' }}> 
               <h3 style={{ fontFamily: 'Syne', fontSize: '20px', color: '#F8FAFC', marginBottom: '8px' }}>Make Repayment</h3> 
               <p style={{ color: '#64748B', fontFamily: 'DM Sans', marginBottom: '24px', fontSize: '14px' }}> 
                 Loan: KES {selectedLoan.amount?.toLocaleString()} · Monthly: KES {selectedLoan.monthlyRepayment?.toLocaleString()} 
               </p> 
               <input 
                 type="number" 
                 placeholder="Repayment Amount (KES)" 
                 value={repayAmount} 
                 onChange={e => setRepayAmount(e.target.value)} 
                 style={{ 
                   width: '100%', 
                   padding: '12px', 
                   borderRadius: '8px', 
                   background: 'rgba(255,255,255,0.05)', 
                   border: '1px solid rgba(255,255,255,0.1)', 
                   color: '#FFF', 
                   marginBottom: '20px', 
                   outline: 'none' 
                 }} 
               /> 
               <div style={{ display: 'flex', gap: '12px' }}> 
                 <button 
                   style={{ 
                     flex: 1, 
                     padding: '12px', 
                     borderRadius: '8px', 
                     background: 'transparent', 
                     border: '1px solid rgba(255,255,255,0.1)', 
                     color: '#FFF', 
                     cursor: 'pointer' 
                   }} 
                   onClick={() => setShowRepayModal(false)} 
                 >Cancel</button> 
                 <button 
                   className="btn-primary" 
                   style={{ flex: 1, padding: '12px', borderRadius: '8px', cursor: 'pointer' }} 
                   onClick={handleRepay} 
                 >Confirm Repayment</button> 
               </div> 
             </motion.div> 
           </div> 
         )} 
       </main> 
     </div> 
   ) 
 } 
