import { useState, useEffect } from 'react' 
 import { useNavigate } from 'react-router-dom' 
 import { motion, AnimatePresence } from 'framer-motion' 
 import { TrendingUp, CreditCard, Users, Star, ArrowRight, Plus, Bell } from 'lucide-react' 
 import Sidebar from '../components/Sidebar' 
 import NotificationBell from '../components/NotificationBell' 
 import ContributeModal from '../components/ContributeModal' 
 import LoanModal from '../components/LoanModal' 
 import api from '../services/api' 
 import useAuthStore from '../store/authStore' 
 
 function StatCard({ label, value, icon, color, delay }) { 
   return ( 
     <motion.div 
       className="glass-card" 
       initial={{ opacity: 0, y: 20 }} 
       animate={{ opacity: 1, y: 0 }} 
       transition={{ delay }} 
       style={{ padding: '24px' }} 
     > 
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}> 
         <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}> 
           {icon} 
         </div> 
       </div> 
       <p style={{ margin: '0 0 4px', fontFamily: 'Syne', fontSize: '26px', fontWeight: 800, color: '#F8FAFC' }}>{value}</p> 
       <p style={{ margin: 0, fontFamily: 'DM Sans', fontSize: '13px', color: '#64748B' }}>{label}</p> 
     </motion.div> 
   ) 
 } 
 
 function SkeletonCard({ height = 120 }) { 
   return ( 
     <div style={{ height, borderRadius: '20px', background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', border: '1px solid rgba(255,255,255,0.06)' }} /> 
   ) 
 } 
 
 export default function DashboardPage() { 
   const navigate = useNavigate() 
   const { user } = useAuthStore() 
   const [chamas, setChamas] = useState([]) 
   const [notifications, setNotifications] = useState([]) 
   const [unreadCount, setUnreadCount] = useState(0) 
   const [totalSavings, setTotalSavings] = useState(0) 
   const [activeLoansCount, setActiveLoansCount] = useState(0) 
   const [adminAlerts, setAdminAlerts] = useState([]) 
   const [loading, setLoading] = useState(true) 
   const [showContribute, setShowContribute] = useState(false) 
   const [showLoan, setShowLoan] = useState(false) 
   const [showInviteModal, setShowInviteModal] = useState(false) 
   const [selectedChama, setSelectedChama] = useState(null) 
   const [greeting, setGreeting] = useState('Good morning') 
   const [activeFilter, setActiveFilter] = useState('all') 
 
   useEffect(() => { 
     const hour = new Date().getHours() 
     if (hour < 12) setGreeting('Good morning') 
     else if (hour < 17) setGreeting('Good afternoon') 
     else setGreeting('Good evening') 
   }, []) 
 
   useEffect(() => { 
     fetchDashboardData() 
   }, []) 
 
   const fetchDashboardData = async () => { 
     setLoading(true) 
     try { 
       const [chamasRes, notifRes] = await Promise.all([ 
         api.get('/chamas'), 
         api.get('/notifications') 
       ]) 
 
       const chamaList = chamasRes.data.chamas || [] 
       setChamas(chamaList) 
       setNotifications(notifRes.data.notifications || []) 
       setUnreadCount(notifRes.data.unreadCount || 0) 
 
       // Total savings 
       const total = chamaList.reduce((sum, item) => { 
         const chama = item.chamaId || item 
         return sum + (chama.totalBalance || 0) 
       }, 0) 
       setTotalSavings(total) 
 
       // Set first chama as default for actions 
       if (chamaList.length > 0) { 
         const first = chamaList[0] 
         setSelectedChama({ 
           id: first.chamaId?._id || first._id, 
           name: first.chamaId?.name || first.name, 
           membership: first 
         }) 
       } 
 
       // Fetch admin alerts + active loans 
       const alerts = [] 
       let activeLoanTotal = 0 
       for (const item of chamaList) { 
         const chamaId = item.chamaId?._id || item._id 
         const chamaName = item.chamaId?.name || item.name 
 
         try { 
           const myLoansRes = await api.get(`/loans/${chamaId}/my`) 
           const active = (myLoansRes.data.loans || []).filter(l => l.status === 'disbursed') 
           activeLoanTotal += active.length 
         } catch (e) {} 
 
         if (item.role === 'admin') { 
           try { 
             const loansRes = await api.get(`/loans/${chamaId}`) 
             const pending = (loansRes.data.loans || []).filter(l => l.status === 'pending') 
             if (pending.length > 0) { 
               alerts.push({ 
                 chamaId, 
                 message: `${chamaName}: ${pending.length} pending loan${pending.length > 1 ? 's' : ''} need approval` 
               }) 
             } 
           } catch (e) {} 
         } 
       } 
 
       setActiveLoansCount(activeLoanTotal) 
       setAdminAlerts(alerts) 
     } catch (err) { 
       console.error('Dashboard fetch error:', err) 
     } finally { 
       setLoading(false) 
     } 
   } 
 
   const getGreetingTime = () => { 
     return new Date().toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) 
   } 
 
   const typeIcons = { contribution: '💸', loan: '🏛️', vote: '🗳️', reminder: '⏰', badge: '🏆', system: '🔔' } 
 
   const filteredNotifs = activeFilter === 'all' 
     ? notifications 
     : notifications.filter(n => n.type === activeFilter) 
 
   const timeAgo = (date) => { 
     const seconds = Math.floor((new Date() - new Date(date)) / 1000) 
     if (seconds < 60) return 'just now' 
     if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago` 
     if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago` 
     return `${Math.floor(seconds / 86400)}d ago` 
   } 
 
   const quickActions = [ 
     { 
       icon: '💸', label: 'Contribute', color: '#10B981', desc: 'Add funds to chama', 
       onClick: () => { 
         if (!selectedChama) return alert('Join a chama first to contribute') 
         setShowContribute(true) 
       } 
     }, 
     { 
       icon: '🏛️', label: 'Request Loan', color: '#0EA5E9', desc: 'Apply for a loan', 
       onClick: () => { 
         if (!selectedChama) return alert('Join a chama first to request a loan') 
         setShowLoan(true) 
       } 
     }, 
     { 
       icon: '👥', label: 'Invite Member', color: '#8B5CF6', desc: 'Share invite code', 
       onClick: () => { 
         if (!selectedChama) return alert('Create a chama first to invite members') 
         setShowInviteModal(true) 
       } 
     }, 
     { 
       icon: '📊', label: 'My Chamas', color: '#F59E0B', desc: 'View all groups', 
       onClick: () => navigate('/chamas') 
     } 
   ] 
 
   return ( 
     <div style={{ display: 'flex', minHeight: '100vh', background: '#0D0B1E' }}> 
       <div className="mesh-bg" /> 
       <Sidebar unreadCount={unreadCount} /> 
       <main className="main-content" style={{ marginLeft: '240px', flex: 1, padding: '32px', position: 'relative', zIndex: 1 }}> 
 
         {/* Header */} 
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}> 
           <div> 
             <h1 style={{ fontFamily: 'Syne', fontSize: '26px', color: '#F8FAFC', margin: 0 }}> 
               {greeting}, {user?.fullName?.split(' ')[0]} 👋 
             </h1> 
             <p style={{ color: '#64748B', fontFamily: 'DM Sans', marginTop: '4px', fontSize: '14px' }}>{getGreetingTime()}</p> 
           </div> 
           <NotificationBell /> 
         </div> 
 
         {/* Admin Alerts */} 
         <AnimatePresence> 
           {adminAlerts.length > 0 && ( 
             <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} 
               className="glass-card" 
               style={{ padding: '16px 20px', marginBottom: '24px', border: '1px solid rgba(245,158,11,0.2)', background: 'rgba(245,158,11,0.05)' }}> 
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}> 
                 <span style={{ fontSize: '16px' }}>👑</span> 
                 <span style={{ fontFamily: 'Syne', fontSize: '14px', color: '#F59E0B', fontWeight: 700 }}>Admin Alerts</span> 
               </div> 
               <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}> 
                 {adminAlerts.map((alert, i) => ( 
                   <div key={i} onClick={() => navigate(`/chama/${alert.chamaId}`)} 
                     style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '10px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', cursor: 'pointer' }}> 
                     <span style={{ fontFamily: 'DM Sans', color: '#F59E0B', fontSize: '13px' }}>{alert.message}</span> 
                     <ArrowRight size={14} color='#F59E0B' /> 
                   </div> 
                 ))} 
               </div> 
             </motion.div> 
           )} 
         </AnimatePresence> 
 
         {/* Stats Cards */} 
         {loading ? ( 
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}> 
             {[1, 2, 3, 4].map(i => <SkeletonCard key={i} height={130} />)} 
           </div> 
         ) : ( 
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}> 
             <StatCard label="Total Savings" value={`KES ${totalSavings.toLocaleString()}`} icon={<TrendingUp size={20} color="#10B981" />} color="#10B981" delay={0} /> 
             <StatCard label="Active Loans" value={activeLoansCount} icon={<CreditCard size={20} color="#0EA5E9" />} color="#0EA5E9" delay={0.1} /> 
             <StatCard label="My Chamas" value={chamas.length} icon={<Users size={20} color="#8B5CF6" />} color="#8B5CF6" delay={0.2} /> 
             <StatCard label="Notifications" value={unreadCount} icon={<Bell size={20} color="#F59E0B" />} color="#F59E0B" delay={0.3} /> 
           </div> 
         )} 
 
         {/* Quick Actions */} 
         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} style={{ marginBottom: '24px' }}> 
           <h2 style={{ fontFamily: 'Syne', fontSize: '18px', color: '#F8FAFC', marginBottom: '16px' }}>Quick Actions</h2> 
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}> 
             {quickActions.map((action, i) => ( 
               <motion.div key={i} whileHover={{ y: -4, scale: 1.02 }} whileTap={{ scale: 0.98 }} 
                 onClick={action.onClick} className="glass-card" 
                 style={{ padding: '20px', cursor: 'pointer', textAlign: 'center', border: `1px solid ${action.color}22` }}> 
                 <div style={{ fontSize: '28px', marginBottom: '8px' }}>{action.icon}</div> 
                 <p style={{ margin: '0 0 4px', fontFamily: 'Syne', fontSize: '14px', color: '#F8FAFC', fontWeight: 700 }}>{action.label}</p> 
                 <p style={{ margin: 0, fontFamily: 'DM Sans', fontSize: '12px', color: '#64748B' }}>{action.desc}</p> 
               </motion.div> 
             ))} 
           </div> 
         </motion.div> 
 
         {/* Main Grid — Chamas + Activity */} 
         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}> 
 
           {/* My Chamas */} 
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}> 
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}> 
               <h2 style={{ fontFamily: 'Syne', fontSize: '18px', color: '#F8FAFC', margin: 0 }}>My Chamas</h2> 
               <button onClick={() => navigate('/chamas')} 
                 style={{ background: 'none', border: 'none', color: '#0EA5E9', cursor: 'pointer', fontFamily: 'DM Sans', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}> 
                 View all <ArrowRight size={14} /> 
               </button> 
             </div> 
 
             {loading ? ( 
               <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}> 
                 {[1, 2].map(i => <SkeletonCard key={i} height={80} />)} 
               </div> 
             ) : chamas.length === 0 ? ( 
               <div className="glass-card" style={{ padding: '32px', textAlign: 'center' }}> 
                 <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏦</div> 
                 <p style={{ fontFamily: 'DM Sans', color: '#64748B', margin: '0 0 16px' }}>No chamas yet</p> 
                 <button className="btn-primary" onClick={() => navigate('/chamas')}>Create or Join a Chama</button> 
               </div> 
             ) : ( 
               <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}> 
                 {chamas.slice(0, 4).map((item, i) => { 
                   const chama = item.chamaId || item 
                   const role = item.role || 'member' 
                   const roleColors = { admin: '#F59E0B', treasurer: '#0EA5E9', member: '#64748B', observer: '#475569' } 
                   return ( 
                     <motion.div key={i} whileHover={{ x: 4 }} onClick={() => navigate(`/chama/${chama._id}`)} 
                       className="glass-card" 
                       style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}> 
                       <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}> 
                         <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(14,165,233,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🏦</div> 
                         <div> 
                           <p style={{ margin: '0 0 2px', fontFamily: 'Syne', fontSize: '14px', color: '#F8FAFC', fontWeight: 600 }}>{chama.name}</p> 
                           <span style={{ fontFamily: 'DM Sans', fontSize: '11px', color: roleColors[role], fontWeight: 600, textTransform: 'capitalize' }}>{role}</span> 
                         </div> 
                       </div> 
                       <div style={{ textAlign: 'right' }}> 
                         <p style={{ margin: '0 0 2px', fontFamily: 'Syne', fontSize: '14px', color: '#10B981', fontWeight: 700 }}>KES {(chama.totalBalance || 0).toLocaleString()}</p> 
                         <ArrowRight size={14} color='#64748B' /> 
                       </div> 
                     </motion.div> 
                   ) 
                 })} 
                 <button onClick={() => navigate('/chamas')} 
                   className="btn-ghost" 
                   style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}> 
                   <Plus size={16} /> New Chama 
                 </button> 
               </div> 
             )} 
           </motion.div>

{/* Activity Feed */} 
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}> 
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}> 
               <h2 style={{ fontFamily: 'Syne', fontSize: '18px', color: '#F8FAFC', margin: 0 }}>Recent Activity</h2> 
               <button onClick={() => navigate('/notifications')} 
                 style={{ background: 'none', border: 'none', color: '#0EA5E9', cursor: 'pointer', fontFamily: 'DM Sans', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}> 
                 View all <ArrowRight size={14} /> 
               </button> 
             </div> 
 
             {/* Filter tabs */} 
             <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', overflow: 'hidden' }}> 
               {['all', 'contribution', 'loan', 'vote', 'badge'].map(filter => ( 
                 <button key={filter} onClick={() => setActiveFilter(filter)} 
                   style={{ padding: '6px 12px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans', fontSize: '12px', fontWeight: 600, background: activeFilter === filter ? '#0EA5E9' : 'rgba(255,255,255,0.06)', color: activeFilter === filter ? 'white' : '#64748B', textTransform: 'capitalize', transition: 'all 0.2s', flexShrink: 0 }}> 
                   {filter} 
                 </button> 
               ))} 
             </div> 
 
             <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}> 
               {loading ? ( 
                 <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}> 
                   {[1, 2, 3].map(i => <SkeletonCard key={i} height={60} />)} 
                 </div> 
               ) : filteredNotifs.length === 0 ? ( 
                 <div style={{ padding: '40px', textAlign: 'center' }}> 
                   <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔔</div> 
                   <p style={{ fontFamily: 'DM Sans', color: '#64748B', margin: 0, fontSize: '14px' }}>No activity yet</p> 
                 </div> 
               ) : ( 
                 filteredNotifs.slice(0, 6).map((notif, i) => ( 
                   <div key={i} onClick={() => { if (notif.actionUrl) navigate(notif.actionUrl) }} 
                     style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 20px', borderBottom: i < filteredNotifs.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', cursor: notif.actionUrl ? 'pointer' : 'default', background: notif.isRead ? 'transparent' : 'rgba(14,165,233,0.03)', transition: 'background 0.2s' }}> 
                     <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}> 
                       {typeIcons[notif.type] || '🔔'} 
                     </div> 
                     <div style={{ flex: 1, minWidth: 0 }}> 
                       <p style={{ margin: '0 0 2px', fontFamily: 'DM Sans', fontSize: '13px', color: '#F8FAFC', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{notif.title}</p> 
                       <p style={{ margin: 0, fontFamily: 'DM Sans', fontSize: '12px', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{notif.body}</p> 
                     </div> 
                     <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}> 
                       <span style={{ fontFamily: 'DM Sans', fontSize: '11px', color: '#475569' }}>{timeAgo(notif.createdAt)}</span> 
                       {!notif.isRead && <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#0EA5E9' }} />} 
                     </div> 
                   </div> 
                 )) 
               )} 
             </div> 
           </motion.div> 
         </div> 
       </main> 
 
       {/* Modals */} 
       <AnimatePresence> 
         {showContribute && selectedChama && ( 
           <ContributeModal 
             chamaId={selectedChama.id} 
             chamaName={selectedChama.name} 
             onClose={() => setShowContribute(false)} 
             onSuccess={() => { setShowContribute(false); fetchDashboardData() }} 
           /> 
         )} 
         {showLoan && selectedChama && ( 
           <LoanModal 
             chamaId={selectedChama.id} 
             chamaName={selectedChama.name} 
             membership={selectedChama.membership} 
             onClose={() => setShowLoan(false)} 
             onSuccess={() => { setShowLoan(false); fetchDashboardData() }} 
           /> 
         )} 
         {showInviteModal && selectedChama && ( 
           <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}> 
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card" style={{ width: '440px', padding: '36px', textAlign: 'center' }}> 
               <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔗</div> 
               <h3 style={{ fontFamily: 'Syne', fontSize: '22px', color: '#F8FAFC', marginBottom: '8px' }}>Invite to {selectedChama.name}</h3> 
               <p style={{ fontFamily: 'DM Sans', color: '#64748B', marginBottom: '20px' }}>Share this link or code with anyone you want to invite</p> 
               <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '16px', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.1)' }}> 
                 <p style={{ fontFamily: 'DM Sans', fontSize: '12px', color: '#64748B', margin: '0 0 8px' }}>Invite Link</p> 
                 <p style={{ fontFamily: 'monospace', fontSize: '13px', color: '#0EA5E9', margin: 0, wordBreak: 'break-all' }}> 
                   {window.location.origin}/join/{chamas.find(c => (c.chamaId?._id || c._id) === selectedChama.id)?.chamaId?.inviteCode || '------'} 
                 </p> 
               </div> 
               <div style={{ display: 'flex', gap: '12px' }}> 
                 <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setShowInviteModal(false)}>Close</button> 
                 <button className="btn-primary" style={{ flex: 1 }} onClick={() => { 
                   const code = chamas.find(c => (c.chamaId?._id || c._id) === selectedChama.id)?.chamaId?.inviteCode 
                   navigator.clipboard.writeText(`${window.location.origin}/join/${code}`) 
                   alert('Link copied to clipboard!') 
                 }}> 
                   📋 Copy Link 
                 </button> 
               </div> 
             </motion.div> 
           </div> 
         )} 
       </AnimatePresence> 
     </div> 
   ) 
 }