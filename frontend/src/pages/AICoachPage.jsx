import { useState, useEffect } from 'react' 
 import { motion } from 'framer-motion' 
 import Sidebar from '../components/Sidebar' 
 import api from '../services/api' 
 import useAuthStore from '../store/authStore' 
 import { getAiServiceUrl } from '../config/apiBase' 
 import usePageTitle from '../hooks/usePageTitle' 
 
 const AI_URL = getAiServiceUrl() 
 
 function ScoreGauge({ score }) { 
   const radius = 80 
   const stroke = 10 
   const normalizedRadius = radius - stroke * 2 
   const circumference = normalizedRadius * 2 * Math.PI 
   const strokeDashoffset = circumference - (score / 100) * circumference 
   const color = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : score >= 40 ? '#EF4444' : '#7F1D1D' 
 
   return ( 
     <div style={{ position: 'relative', width: '180px', height: '180px', margin: '0 auto' }}> 
       <svg height={radius * 2} width={radius * 2} style={{ transform: 'rotate(-90deg)' }}> 
         <circle stroke="rgba(255,255,255,0.08)" fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx={radius} cy={radius} /> 
         <circle 
           stroke={color} 
           fill="transparent" 
           strokeWidth={stroke} 
           strokeDasharray={`${circumference} ${circumference}`} 
           strokeDashoffset={strokeDashoffset} 
           strokeLinecap="round" 
           r={normalizedRadius} 
           cx={radius} 
           cy={radius} 
           style={{ transition: 'stroke-dashoffset 1s ease, stroke 0.5s ease', filter: `drop-shadow(0 0 8px ${color})` }} 
         /> 
       </svg> 
       <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}> 
         <span style={{ fontFamily: 'Syne', fontSize: '42px', fontWeight: 800, color: '#F8FAFC' }}>{score}</span> 
         <span style={{ fontFamily: 'DM Sans', fontSize: '12px', color: '#64748B' }}>Credit Score</span> 
       </div> 
     </div> 
   ) 
 } 
 
 function ScoreBar({ label, value, max, description }) { 
   const pct = Math.min((value / max) * 100, 100) 
   const color = pct >= 70 ? '#10B981' : pct >= 40 ? '#F59E0B' : '#EF4444' 
   return ( 
     <div style={{ marginBottom: '20px' }}> 
       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}> 
         <span style={{ fontFamily: 'DM Sans', fontSize: '14px', color: '#F8FAFC' }}>{label}</span> 
         <span style={{ fontFamily: 'Syne', fontSize: '14px', color, fontWeight: 600 }}>{value} / {max}</span> 
       </div> 
       <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}> 
         <motion.div 
           initial={{ width: 0 }} 
           animate={{ width: `${pct}%` }} 
           transition={{ duration: 1, ease: 'easeOut' }} 
           style={{ height: '100%', borderRadius: '4px', background: color, boxShadow: `0 0 8px ${color}` }} 
         /> 
       </div> 
       {description && <p style={{ margin: '4px 0 0', fontFamily: 'DM Sans', fontSize: '12px', color: '#475569' }}>{description}</p>} 
     </div> 
   ) 
 } 
 
 export default function AICoachPage() { 
   usePageTitle('AI Coach') 
   const { user } = useAuthStore() 
   const [chamas, setChamas] = useState([]) 
   const [selectedChama, setSelectedChama] = useState('') 
   const [creditData, setCreditData] = useState(null) 
   const [healthData, setHealthData] = useState(null) 
   const [loading, setLoading] = useState(false) 
   const [error, setError] = useState(null) 
 
   useEffect(() => { 
     console.log('AICoach: Using AI Service URL:', AI_URL) 
     api.get('/chamas').then(res => { 
       const list = res.data.chamas || [] 
       setChamas(list) 
       if (list.length > 0) { 
         const firstId = list[0].chamaId?._id || list[0]._id 
         setSelectedChama(firstId) 
       } 
     }) 
   }, []) 
 
   useEffect(() => { 
     if (!selectedChama) return 
     const fetchAI = async () => { 
       setLoading(true) 
       setError(null) 
       setCreditData(null) 
       setHealthData(null) 
       try { 
         const userId = user?.id || user?._id 
         if (!userId) { 
           setError('User session not found. Please re-login.') 
           return 
         } 
 
         const scoreUrl = `${AI_URL}/ai/credit-score/${userId}/${selectedChama}` 
         const healthUrl = `${AI_URL}/ai/group-health/${selectedChama}` 
 
         console.log('Fetching AI data from:', { scoreUrl, healthUrl }) 
 
         const [scoreRes, healthRes] = await Promise.all([ 
           fetch(scoreUrl).then(async r => { 
             if (!r.ok) throw new Error(`Score API failed: ${r.status}`) 
             return r.json() 
           }), 
           fetch(healthUrl).then(async r => { 
             if (!r.ok) throw new Error(`Health API failed: ${r.status}`) 
             return r.json() 
           }) 
         ]) 
 
         if (scoreRes.success) setCreditData(scoreRes.data) 
         if (healthRes.success) setHealthData(healthRes.data) 
       } catch (err) { 
         console.error('AI fetch error details:', err) 
         setError(`Connection failed: ${err.message}. Target URL: ${AI_URL}`) 
       } finally { 
         setLoading(false) 
       } 
     } 
     fetchAI() 
   }, [selectedChama, user]) 
 
   const riskColors = { low: '#10B981', medium: '#F59E0B', high: '#EF4444', very_high: '#7F1D1D' } 
   const riskLabels = { low: '✅ Low Risk', medium: '⚠️ Medium Risk', high: '🔴 High Risk', very_high: '🚫 Very High Risk' } 
   const healthColors = { excellent: '#10B981', good: '#0EA5E9', fair: '#F59E0B', poor: '#EF4444' } 
 
   return ( 
     <div style={{ display: 'flex', minHeight: '100vh', background: '#0D0B1E' }}> 
       <div className="mesh-bg" /> 
       <Sidebar /> 
       <main className="main-content" style={{ marginLeft: '240px', flex: 1, padding: '32px', position: 'relative', zIndex: 1, overflowY: 'auto', minHeight: '100vh' }}> 
 
         {/* Header */} 
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}> 
           <div> 
             <h1 style={{ fontFamily: 'Syne', fontSize: '28px', color: '#F8FAFC', margin: 0 }}>🤖 AI Financial Coach</h1> 
             <p style={{ color: '#64748B', fontFamily: 'DM Sans', marginTop: '4px' }}>Personalized insights powered by your financial behavior</p> 
           </div> 
           <select 
             value={selectedChama} 
             onChange={e => setSelectedChama(e.target.value)} 
             style={{ padding: '10px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: '#F8FAFC', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'DM Sans', minWidth: '200px' }} 
           > 
             <option value="">Select a chama</option> 
             {chamas.map((item, i) => { 
               const id = item.chamaId?._id || item._id 
               const name = item.chamaId?.name || item.name 
               return <option key={i} value={id}>{name}</option> 
             })} 
           </select> 
         </div> 
 
         {!selectedChama ? ( 
           <div style={{ textAlign: 'center', padding: '80px 0' }}> 
             <div style={{ fontSize: '64px', marginBottom: '16px' }}>🤖</div> 
             <p style={{ fontFamily: 'Syne', fontSize: '20px', color: '#F8FAFC' }}>Select a chama to see your AI insights</p> 
           </div> 
         ) : loading ? ( 
           <div style={{ textAlign: 'center', padding: '80px 0' }}> 
             <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} 
               style={{ width: '48px', height: '48px', borderRadius: '50%', border: '3px solid rgba(139,92,246,0.2)', borderTop: '3px solid #8B5CF6', margin: '0 auto 16px' }} /> 
             <p style={{ color: '#64748B', fontFamily: 'DM Sans' }}>Analyzing your financial data...</p> 
           </div> 
         ) : creditData ? ( 
           <> 
             {/* Credit Score Hero */} 
             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
               className="glass-card" 
               style={{ padding: '32px', marginBottom: '24px', border: '1px solid rgba(139,92,246,0.2)', display: 'flex', gap: '40px', alignItems: 'center', flexWrap: 'wrap' }}> 
               <ScoreGauge score={creditData.score} /> 
               <div style={{ flex: 1 }}> 
                 <span style={{ background: `${riskColors[creditData.riskLabel]}22`, color: riskColors[creditData.riskLabel], padding: '6px 16px', borderRadius: '20px', fontFamily: 'DM Sans', fontSize: '14px', fontWeight: 600 }}> 
                   {riskLabels[creditData.riskLabel]} 
                 </span> 
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '20px' }}> 
                   {[ 
                     { label: 'Total Contributed', value: `KES ${(creditData.totalContributed || 0).toLocaleString()}`, color: '#10B981' }, 
                     { label: 'Contributions Made', value: creditData.contributionCount || 0, color: '#0EA5E9' }, 
                     { label: 'Max Loan Eligible', value: `KES ${((creditData.totalContributed || 0) * 3).toLocaleString()}`, color: '#8B5CF6' } 
                   ].map((s, i) => ( 
                     <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '16px' }}> 
                       <p style={{ margin: '0 0 4px', fontFamily: 'DM Sans', fontSize: '12px', color: '#64748B' }}>{s.label}</p> 
                       <p style={{ margin: 0, fontFamily: 'Syne', fontSize: '18px', fontWeight: 700, color: s.color }}>{s.value}</p> 
                     </div> 
                   ))} 
                 </div> 
               </div> 
             </motion.div> 
 
             {/* Score Breakdown */} 
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}> 
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card" style={{ padding: '28px' }}> 
                 <h3 style={{ fontFamily: 'Syne', fontSize: '18px', color: '#F8FAFC', marginBottom: '24px' }}>📊 Score Breakdown</h3> 
                 <ScoreBar label="Contribution Consistency" value={creditData.breakdown?.contributionConsistency || 0} max={25} description="Based on number of contributions made" /> 
                 <ScoreBar label="Contribution Amount" value={creditData.breakdown?.contributionAmount || 0} max={20} description="vs minimum required amount" /> 
                 <ScoreBar label="Repayment History" value={creditData.breakdown?.repaymentHistory || 0} max={25} description="Past loan repayment track record" /> 
                 <ScoreBar label="Membership Tenure" value={creditData.breakdown?.membershipTenure || 0} max={15} description="How long you've been a member" /> 
                 <ScoreBar label="Contribution Streak" value={creditData.breakdown?.contributionStreak || 0} max={15} description="Consecutive months contributed" /> 
               </motion.div> 
 
               {/* AI Tips */} 
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card" style={{ padding: '28px' }}> 
                 <h3 style={{ fontFamily: 'Syne', fontSize: '18px', color: '#F8FAFC', marginBottom: '24px' }}>💡 Personalized Insights</h3> 
                 {(creditData.tips || []).map((tip, i) => ( 
                   <div key={i} style={{ padding: '16px', borderRadius: '12px', background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', marginBottom: '12px', borderLeft: '3px solid #8B5CF6' }}> 
                     <p style={{ margin: 0, fontFamily: 'DM Sans', fontSize: '14px', color: '#E2E8F0', lineHeight: 1.6 }}> 
                       {['💡', '⚡', '📈', '🎯', '🔥'][i % 5]} {tip} 
                     </p> 
                   </div> 
                 ))} 
               </motion.div> 
             </div> 
 
             {/* Group Health */} 
             {healthData && ( 
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card" style={{ padding: '28px' }}> 
                 <h3 style={{ fontFamily: 'Syne', fontSize: '18px', color: '#F8FAFC', marginBottom: '20px' }}>🏦 Group Health Score</h3> 
                 <div style={{ display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap' }}> 
                   <div style={{ textAlign: 'center' }}> 
                     <p style={{ fontFamily: 'Syne', fontSize: '56px', fontWeight: 800, color: healthColors[healthData.label] || '#0EA5E9', margin: 0, lineHeight: 1 }}>{healthData.score}</p> 
                     <p style={{ fontFamily: 'DM Sans', color: '#64748B', marginTop: '4px', textTransform: 'capitalize' }}>{healthData.label}</p> 
                   </div> 
                   <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}> 
                     {[ 
                       { label: 'Members', value: healthData.totalMembers, color: '#0EA5E9' }, 
                       { label: 'Active Loans', value: healthData.activeLoans, color: '#F59E0B' }, 
                       { label: 'Defaults', value: healthData.defaultedLoans, color: '#EF4444' }, 
                       { label: 'Balance', value: `KES ${(healthData.totalBalance || 0).toLocaleString()}`, color: '#10B981' } 
                     ].map((s, i) => ( 
                       <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '16px 20px', textAlign: 'center' }}> 
                         <p style={{ margin: '0 0 4px', fontFamily: 'DM Sans', fontSize: '12px', color: '#64748B' }}>{s.label}</p> 
                         <p style={{ margin: 0, fontFamily: 'Syne', fontSize: '18px', fontWeight: 700, color: s.color }}>{s.value}</p> 
                       </div> 
                     ))} 
                   </div> 
                 </div> 
               </motion.div> 
             )} 
           </> 
         ) : error ? ( 
           <div style={{ textAlign: 'center', padding: '60px 0', background: 'rgba(239,68,68,0.05)', borderRadius: '16px', border: '1px dashed rgba(239,68,68,0.2)' }}> 
             <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div> 
             <p style={{ color: '#EF4444', fontFamily: 'Syne', fontSize: '18px', fontWeight: 600 }}>{error}</p> 
             <p style={{ color: '#64748B', fontFamily: 'DM Sans', marginTop: '8px', maxWidth: '500px', margin: '8px auto 0' }}> 
               Please ensure the AI service is live on Render and that the <strong>VITE_AI_URL</strong> environment variable is set correctly in Vercel. 
             </p> 
             <button 
               onClick={() => window.location.reload()} 
               style={{ marginTop: '24px', padding: '10px 24px', borderRadius: '12px', background: '#EF4444', color: 'white', border: 'none', fontFamily: 'DM Sans', fontWeight: 600, cursor: 'pointer' }} 
             > 
               Retry Connection 
             </button> 
           </div> 
         ) : ( 
           <div style={{ textAlign: 'center', padding: '60px 0' }}> 
             <p style={{ color: '#64748B', fontFamily: 'DM Sans' }}>No AI data available for this chama.</p> 
           </div> 
         )} 
       </main> 
     </div> 
   ) 
 } 
