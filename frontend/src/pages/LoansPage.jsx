jsximport { useState, useEffect } from 'react'
 import { motion, AnimatePresence } from 'framer-motion'
 import { TrendingDown, Clock, CheckCircle, XCircle } from 'lucide-react'
 import Sidebar from '../components/Sidebar'
 import NotificationBell from '../components/NotificationBell'
 import LoanModal from '../components/LoanModal'
 import api from '../services/api'
 import useAuthStore from '../store/authStore'
 
 export default function LoansPage() {
   const { user } = useAuthStore()
   const [allLoans, setAllLoans] = useState([])
   const [chamas, setChamas] = useState([])
   const [loading, setLoading] = useState(true)
   const [showLoanModal, setShowLoanModal] = useState(false)
   const [selectedChama, setSelectedChama] = useState(null)
   const [showRepayModal, setShowRepayModal] = useState(false)
   const [selectedLoan, setSelectedLoan] = useState(null)
   const [repayAmount, setRepayAmount] = useState('')
   const [repayLoading, setRepayLoading] = useState(false)
   const [repayError, setRepayError] = useState('')
   const [activeTab, setActiveTab] = useState('active')
 
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
         setSelectedChama({
           id: first.chamaId?._id || first._id,
           name: first.chamaId?.name || first.name,
           membership: first
         })
       }
 
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
 
   const handleRepay = async () => {
     if (!repayAmount || Number(repayAmount) < 1) return setRepayError('Enter a valid amount')
     if (!selectedLoan) return
     setRepayLoading(true)
     setRepayError('')
     try {
       await api.post(`/loans/${selectedLoan.chamaId}/loans/${selectedLoan._id}/repay`, {
         amount: Number(repayAmount),
         mpesaRef: 'REPAY' + Date.now()
       })
       setShowRepayModal(false)
       setRepayAmount('')
       setSelectedLoan(null)
       fetchAll()
     } catch (err) {
       setRepayError(err.response?.data?.message || 'Repayment failed')
     } finally {
       setRepayLoading(false)
     }
   }
 
   const statusConfig = {
     pending: { color: '#F59E0B', bg: 'rgba(245,158,11,0.15)', icon: <Clock size={14} />, label: 'Pending Review' },
     approved: { color: '#0EA5E9', bg: 'rgba(14,165,233,0.15)', icon: <CheckCircle size={14} />, label: 'Approved' },
     disbursed: { color: '#10B981', bg: 'rgba(16,185,129,0.15)', icon: <TrendingDown size={14} />, label: 'Active' },
     repaid: { color: '#8B5CF6', bg: 'rgba(139,92,246,0.15)', icon: <CheckCircle size={14} />, label: 'Repaid' },
     rejected: { color: '#EF4444', bg: 'rgba(239,68,68,0.15)', icon: <XCircle size={14} />, label: 'Rejected' },
     defaulted: { color: '#7F1D1D', bg: 'rgba(127,29,29,0.15)', icon: <XCircle size={14} />, label: 'Defaulted' }
   }
 
   const riskColors = { low: '#10B981', medium: '#F59E0B', high: '#EF4444', very_high: '#7F1D1D' }
 
   const activeLoans = allLoans.filter(l => l.status === 'disbursed')
   const pendingLoans = allLoans.filter(l => ['pending', 'approved'].includes(l.status))
   const historyLoans = allLoans.filter(l => ['repaid', 'rejected', 'defaulted'].includes(l.status))
 
   const displayLoans = activeTab === 'active' ? activeLoans : activeTab === 'pending' ? pendingLoans : historyLoans
 
   const totalBorrowed = allLoans.filter(l => ['disbursed', 'repaid'].includes(l.status)).reduce((s, l) => s + (l.amount || 0), 0)
   const totalRepaid = allLoans.reduce((s, l) => s + (l.repayments?.reduce((r, p) => r + p.amount, 0) || 0), 0)
   const totalOutstanding = activeLoans.reduce((s, l) => {
     const repaid = l.repayments?.reduce((r, p) => r + p.amount, 0) || 0
     return s + Math.max(0, (l.totalRepayable || 0) - repaid)
   }, 0)
 
   return (
     <div style={{ display: 'flex', minHeight: '100vh', background: '#0D0B1E' }}>
       <div className="mesh-bg" />
       <Sidebar />
       <main className="main-content" style={{ marginLeft: '240px', flex: 1, padding: '32px', position: 'relative', zIndex: 1 }}>
 
         {/* Header */}
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
           <div>
             <h1 style={{ fontFamily: 'Syne', fontSize: '28px', color: '#F8FAFC', margin: 0 }}>🏛️ My Loans</h1>
             <p style={{ color: '#64748B', fontFamily: 'DM Sans', marginTop: '4px' }}>Track your loans and repayments</p>
           </div>
           <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
             {selectedChama && (
               <button className="btn-primary" onClick={() => setShowLoanModal(true)}>
                 + Request Loan
               </button>
             )}
             <NotificationBell />
           </div>
         </div>
 
         {/* Stats */}
         {!loading && (
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
             {[
               { label: 'Active Loans', value: activeLoans.length, color: '#10B981' },
               { label: 'Total Borrowed', value: `KES ${totalBorrowed.toLocaleString()}`, color: '#0EA5E9' },
               { label: 'Total Repaid', value: `KES ${totalRepaid.toLocaleString()}`, color: '#8B5CF6' },
               { label: 'Outstanding', value: `KES ${totalOutstanding.toLocaleString()}`, color: '#F59E0B' }
             ].map((stat, i) => (
               <motion.div key={i} className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} style={{ padding: '20px' }}>
                 <p style={{ margin: '0 0 6px', fontFamily: 'DM Sans', fontSize: '12px', color: '#64748B' }}>{stat.label}</p>
                 <p style={{ margin: 0, fontFamily: 'Syne', fontSize: '20px', fontWeight: 800, color: stat.color }}>{stat.value}</p>
               </motion.div>
             ))}
           </div>
         )}
 
         {/* Chama selector for loan request */}
         {chamas.length > 1 && (
           <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
             <span style={{ fontFamily: 'DM Sans', fontSize: '13px', color: '#64748B' }}>Request loan from:</span>
             <select
               value={selectedChama?.id || ''}
               onChange={e => {
                 const item = chamas.find(c => (c.chamaId?._id || c._id) === e.target.value)
                 if (item) setSelectedChama({ id: item.chamaId?._id || item._id, name: item.chamaId?.name || item.name, membership: item })
               }}
               style={{ padding: '8px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', color: '#F8FAFC', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'DM Sans', fontSize: '13px' }}>
               {chamas.map((item, i) => {
                 const id = item.chamaId?._id || item._id
                 const name = item.chamaId?.name || item.name
                 return <option key={i} value={id}>{name}</option>
               })}
             </select>
           </div>
         )}
 
         {/* Tabs */}
         <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', background: 'rgba(255,255,255,0.04)', borderRadius: '14px', padding: '6px', width: 'fit-content' }}>
           {[
             { id: 'active', label: `Active (${activeLoans.length})` },
             { id: 'pending', label: `Pending (${pendingLoans.length})` },
             { id: 'history', label: `History (${historyLoans.length})` }
           ].map(tab => (
             <button key={tab.id} onClick={() => setActiveTab(tab.id)}
               style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans', fontWeight: 600, fontSize: '13px', background: activeTab === tab.id ? '#0EA5E9' : 'transparent', color: activeTab === tab.id ? 'white' : '#64748B', transition: 'all 0.2s' }}>
               {tab.label}
             </button>
           ))}
         </div>
 
         {/* Loans List */}
         {loading ? (
           <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
             {[1, 2, 3].map(i => <div key={i} style={{ height: '160px', borderRadius: '20px', background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />)}
           </div>
         ) : displayLoans.length === 0 ? (
           <div style={{ textAlign: 'center', padding: '60px 0' }}>
             <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏛️</div>
             <p style={{ fontFamily: 'Syne', color: '#F8FAFC', fontSize: '18px', margin: '0 0 8px' }}>
               {activeTab === 'active' ? 'No active loans' : activeTab === 'pending' ? 'No pending requests' : 'No loan history'}
             </p>
             <p style={{ color: '#64748B', fontFamily: 'DM Sans', marginBottom: '24px' }}>
               {activeTab === 'active' ? 'Request a loan from any of your chamas' : activeTab === 'pending' ? 'Your pending loan requests will appear here' : 'Your completed loans will appear here'}
             </p>
             {activeTab === 'active' && selectedChama && (
               <button className="btn-primary" onClick={() => setShowLoanModal(true)}>Request a Loan</button>
             )}
           </div>
         ) : (
           <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
             {displayLoans.map((loan, i) => {
               const totalRepaidAmount = loan.repayments?.reduce((s, r) => s + r.amount, 0) || 0
               const progress = loan.totalRepayable ? Math.min((totalRepaidAmount / loan.totalRepayable) * 100, 100) : 0
               const remaining = Math.max(0, (loan.totalRepayable || 0) - totalRepaidAmount)
               const status = statusConfig[loan.status] || statusConfig.pending
               const isOverdue = loan.dueDate && new Date(loan.dueDate) < new Date() && loan.status === 'disbursed'
 
               return (
                 <motion.div key={i} className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                   style={{ padding: '24px', border: isOverdue ? '1px solid rgba(239,68,68,0.3)' : undefined }}>
 
                   {/* Header */}
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                     <div>
                       <p style={{ margin: 0, fontFamily: 'Syne', fontSize: '22px', color: '#F8FAFC', fontWeight: 800 }}>KES {loan.amount?.toLocaleString()}</p>
                       <p style={{ margin: '4px 0 0', color: '#64748B', fontFamily: 'DM Sans', fontSize: '13px' }}>
                         {loan.chamaName} · {loan.purpose} · {loan.repaymentMonths} months
                       </p>
                     </div>
                     <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                       <span style={{ background: `${riskColors[loan.riskLabel]}22`, color: riskColors[loan.riskLabel], padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontFamily: 'DM Sans', fontWeight: 600 }}>
                         Score: {loan.creditScore} · {loan.riskLabel} risk
                       </span>
                       <span style={{ background: status.bg, color: status.color, padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontFamily: 'DM Sans', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                         {status.icon} {status.label}
                       </span>
                       {isOverdue && (
                         <span style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontFamily: 'DM Sans', fontWeight: 600 }}>
                           ⚠️ Overdue
                         </span>
                       )}
                     </div>
                   </div>
 
                   {/* Loan details */}
                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
                     {[
                       { label: 'Monthly Payment', value: `KES ${Math.round(loan.monthlyRepayment || 0).toLocaleString()}` },
                       { label: 'Total Repayable', value: `KES ${Math.round(loan.totalRepayable || 0).toLocaleString()}` },
                       { label: loan.status === 'disbursed' ? 'Remaining' : 'Due Date', value: loan.status === 'disbursed' ? `KES ${remaining.toLocaleString()}` : loan.dueDate ? new Date(loan.dueDate).toLocaleDateString() : 'TBD' }
                     ].map((item, j) => (
                       <div key={j} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '12px' }}>
                         <p style={{ margin: '0 0 2px', fontFamily: 'DM Sans', fontSize: '11px', color: '#64748B' }}>{item.label}</p>
                         <p style={{ margin: 0, fontFamily: 'Syne', fontSize: '14px', color: '#F8FAFC', fontWeight: 700 }}>{item.value}</p>
                       </div>
                     ))}
                   </div>
  {/* Progress bar for active loans */}
                   {loan.status === 'disbursed' && (
                     <div style={{ marginBottom: '16px' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                         <span style={{ fontFamily: 'DM Sans', fontSize: '12px', color: '#64748B' }}>Repayment Progress</span>
                         <span style={{ fontFamily: 'DM Sans', fontSize: '12px', color: '#0EA5E9' }}>
                           KES {totalRepaidAmount.toLocaleString()} / {Math.round(loan.totalRepayable || 0).toLocaleString()}
                         </span>
                       </div>
                       <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                         <motion.div
                           initial={{ width: 0 }}
                           animate={{ width: `${progress}%` }}
                           transition={{ duration: 1, ease: 'easeOut' }}
                           style={{ height: '100%', borderRadius: '4px', background: progress >= 100 ? '#10B981' : 'linear-gradient(90deg, #0EA5E9, #8B5CF6)', boxShadow: '0 0 8px rgba(14,165,233,0.4)' }}
                         />
                       </div>
                       <p style={{ margin: '4px 0 0', fontFamily: 'DM Sans', fontSize: '11px', color: '#64748B' }}>
                         {Math.round(progress)}% repaid
                       </p>
                     </div>
                   )}
 
                   {/* Due date warning */}
                   {loan.dueDate && loan.status === 'disbursed' && (
                     <p style={{ margin: '0 0 12px', fontFamily: 'DM Sans', fontSize: '12px', color: isOverdue ? '#EF4444' : new Date(loan.dueDate) - new Date() < 7 * 24 * 60 * 60 * 1000 ? '#F59E0B' : '#64748B' }}>
                       {isOverdue ? '⚠️' : '📅'} Due: {new Date(loan.dueDate).toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' })}
                     </p>
                   )}
 
                   {/* Repay button */}
                   {loan.status === 'disbursed' && (
                     <button
                       onClick={() => { setSelectedLoan(loan); setShowRepayModal(true) }}
                       className="btn-primary"
                       style={{ width: '100%' }}>
                       💳 Make Repayment
                     </button>
                   )}
 
                   {/* Disbursement ref */}
                   {loan.mpesaDisbursementRef && (
                     <p style={{ margin: '8px 0 0', fontFamily: 'monospace', fontSize: '11px', color: '#475569', textAlign: 'center' }}>
                       Ref: {loan.mpesaDisbursementRef}
                     </p>
                   )}
                 </motion.div>
               )
             })}
           </div>
         )}
       </main>
 
       {/* Repay Modal */}
       <AnimatePresence>
         {showRepayModal && selectedLoan && (
           <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card" style={{ width: '420px', padding: '36px' }}>
               <h3 style={{ fontFamily: 'Syne', fontSize: '20px', color: '#F8FAFC', marginBottom: '8px' }}>💳 Make Repayment</h3>
               <div style={{ background: 'rgba(14,165,233,0.08)', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                   <span style={{ fontFamily: 'DM Sans', fontSize: '13px', color: '#94A3B8' }}>Loan Amount</span>
                   <span style={{ fontFamily: 'Syne', fontWeight: 700, color: '#F8FAFC' }}>KES {selectedLoan.amount?.toLocaleString()}</span>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                   <span style={{ fontFamily: 'DM Sans', fontSize: '13px', color: '#94A3B8' }}>Monthly Payment</span>
                   <span style={{ fontFamily: 'Syne', fontWeight: 700, color: '#0EA5E9' }}>KES {Math.round(selectedLoan.monthlyRepayment || 0).toLocaleString()}</span>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                   <span style={{ fontFamily: 'DM Sans', fontSize: '13px', color: '#94A3B8' }}>Remaining</span>
                   <span style={{ fontFamily: 'Syne', fontWeight: 700, color: '#F59E0B' }}>
                     KES {Math.max(0, (selectedLoan.totalRepayable || 0) - (selectedLoan.repayments?.reduce((s, r) => s + r.amount, 0) || 0)).toLocaleString()}
                   </span>
                 </div>
               </div>
               <div style={{ marginBottom: '16px' }}>
                 <label style={{ fontFamily: 'DM Sans', fontSize: '13px', color: '#64748B', display: 'block', marginBottom: '8px' }}>Repayment Amount (KES)</label>
                 <input type="number" placeholder={`Enter amount (suggested: KES ${Math.round(selectedLoan.monthlyRepayment || 0).toLocaleString()})`} value={repayAmount} onChange={e => setRepayAmount(e.target.value)} min="1" />
               </div>
               {repayError && <p style={{ color: '#EF4444', fontFamily: 'DM Sans', fontSize: '13px', marginBottom: '12px' }}>{repayError}</p>}
               <div style={{ display: 'flex', gap: '12px' }}>
                 <button className="btn-ghost" style={{ flex: 1 }} onClick={() => { setShowRepayModal(false); setRepayAmount(''); setRepayError('') }}>Cancel</button>
                 <button className="btn-primary" style={{ flex: 1 }} onClick={handleRepay} disabled={repayLoading}>
                   {repayLoading ? 'Processing...' : 'Confirm Repayment'}
                 </button>
               </div>
             </motion.div>
           </div>
         )}
 
         {showLoanModal && selectedChama && (
           <LoanModal
             chamaId={selectedChama.id}
             chamaName={selectedChama.name}
             membership={selectedChama.membership}
             onClose={() => setShowLoanModal(false)}
             onSuccess={() => { setShowLoanModal(false); fetchAll() }}
           />
         )}
       </AnimatePresence>
     </div>
   )
 }