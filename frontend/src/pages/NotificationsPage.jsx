import { useState, useEffect } from 'react' 
 import { motion, AnimatePresence } from 'framer-motion' 
 import { CheckCheck, Trash2, Bell } from 'lucide-react' 
 import { useNavigate } from 'react-router-dom' 
 import Sidebar from '../components/Sidebar' 
 import NotificationBell from '../components/NotificationBell' 
 import api from '../services/api' 
 
 export default function NotificationsPage() { 
   const navigate = useNavigate() 
   const [notifications, setNotifications] = useState([]) 
   const [unreadCount, setUnreadCount] = useState(0) 
   const [loading, setLoading] = useState(true) 
   const [activeFilter, setActiveFilter] = useState('all') 
 
   const typeConfig = { 
     contribution: { icon: '💸', color: '#10B981', bg: 'rgba(16,185,129,0.15)' }, 
     loan: { icon: '🏛️', color: '#0EA5E9', bg: 'rgba(14,165,233,0.15)' }, 
     vote: { icon: '🗳️', color: '#8B5CF6', bg: 'rgba(139,92,246,0.15)' }, 
     reminder: { icon: '⏰', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' }, 
     badge: { icon: '🏆', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' }, 
     system: { icon: '🔔', color: '#64748B', bg: 'rgba(100,116,139,0.15)' } 
   } 
 
   const filters = [ 
     { id: 'all', label: 'All' }, 
     { id: 'contribution', label: '💸 Contributions' }, 
     { id: 'loan', label: '🏛️ Loans' }, 
     { id: 'vote', label: '🗳️ Votes' }, 
     { id: 'reminder', label: '⏰ Reminders' }, 
     { id: 'badge', label: '🏆 Badges' }, 
   ] 
 
   useEffect(() => { 
     fetchNotifications() 
   }, []) 
 
   const fetchNotifications = async () => { 
     setLoading(true) 
     try { 
       const res = await api.get('/notifications') 
       setNotifications(res.data.notifications || []) 
       setUnreadCount(res.data.unreadCount || 0) 
     } catch (err) { 
       console.error(err) 
     } finally { 
       setLoading(false) 
     } 
   } 
 
   const markAsRead = async (id) => { 
     try { 
       await api.patch(`/notifications/${id}/read`) 
       setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n)) 
       setUnreadCount(prev => Math.max(0, prev - 1)) 
     } catch (err) { 
       console.error(err) 
     } 
   } 
 
   const markAllRead = async () => { 
     try { 
       await api.patch('/notifications/read-all') 
       setNotifications(prev => prev.map(n => ({ ...n, isRead: true }))) 
       setUnreadCount(0) 
     } catch (err) { 
       console.error(err) 
     } 
   } 
 
   const deleteNotification = async (id, e) => { 
     e.stopPropagation() 
     try { 
       await api.delete(`/notifications/${id}`) 
       setNotifications(prev => prev.filter(n => n._id !== id)) 
     } catch (err) { 
       console.error(err) 
     } 
   } 
 
   const handleClick = (notif) => { 
     if (!notif.isRead) markAsRead(notif._id) 
     if (notif.actionUrl) navigate(notif.actionUrl) 
   } 
 
   const isToday = (date) => new Date(date).toDateString() === new Date().toDateString() 
   const isYesterday = (date) => { 
     const y = new Date() 
     y.setDate(y.getDate() - 1) 
     return new Date(date).toDateString() === y.toDateString() 
   } 
   const isThisWeek = (date) => { 
     const w = new Date() 
     w.setDate(w.getDate() - 7) 
     return new Date(date) > w 
   } 
 
   const filtered = activeFilter === 'all' 
     ? notifications 
     : notifications.filter(n => n.type === activeFilter) 
 
   const grouped = { 
     Today: filtered.filter(n => isToday(n.createdAt)), 
     Yesterday: filtered.filter(n => !isToday(n.createdAt) && isYesterday(n.createdAt)), 
     'This Week': filtered.filter(n => !isToday(n.createdAt) && !isYesterday(n.createdAt) && isThisWeek(n.createdAt)), 
     Earlier: filtered.filter(n => !isThisWeek(n.createdAt)) 
   } 
 
   const timeAgo = (date) => { 
     const s = Math.floor((new Date() - new Date(date)) / 1000) 
     if (s < 60) return 'just now' 
     if (s < 3600) return `${Math.floor(s / 60)}m ago` 
     if (s < 86400) return `${Math.floor(s / 3600)}h ago` 
     return new Date(date).toLocaleDateString() 
   } 
 
   return ( 
     <div style={{ display: 'flex', minHeight: '100vh', background: '#0D0B1E' }}> 
       <div className="mesh-bg" /> 
       <Sidebar unreadCount={unreadCount} /> 
       <main className="main-content" style={{ marginLeft: '240px', flex: 1, padding: '32px', position: 'relative', zIndex: 1 }}> 
 
         {/* Header */} 
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}> 
           <div> 
             <h1 style={{ fontFamily: 'Syne', fontSize: '28px', color: '#F8FAFC', margin: 0 }}>🔔 Notifications</h1> 
             <p style={{ color: '#64748B', fontFamily: 'DM Sans', marginTop: '4px' }}> 
               {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'} 
             </p> 
           </div> 
           <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}> 
             {unreadCount > 0 && ( 
               <button onClick={markAllRead} 
                 style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94A3B8', cursor: 'pointer', fontFamily: 'DM Sans', fontSize: '13px' }}> 
                 <CheckCheck size={16} /> Mark all read 
               </button> 
             )} 
             <NotificationBell /> 
           </div> 
         </div> 
 
         {/* Filter Tabs */} 
         <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px' }} className="scroll-x"> 
           {filters.map(f => ( 
             <button key={f.id} onClick={() => setActiveFilter(f.id)} 
               style={{ padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans', fontSize: '13px', fontWeight: 600, background: activeFilter === f.id ? '#0EA5E9' : 'rgba(255,255,255,0.06)', color: activeFilter === f.id ? 'white' : '#64748B', transition: 'all 0.2s', flexShrink: 0 }}> 
               {f.label} 
               {f.id !== 'all' && notifications.filter(n => n.type === f.id && !n.isRead).length > 0 && ( 
                 <span style={{ marginLeft: '6px', background: '#EF4444', color: 'white', borderRadius: '10px', padding: '1px 6px', fontSize: '10px' }}> 
                   {notifications.filter(n => n.type === f.id && !n.isRead).length} 
                 </span> 
               )} 
             </button> 
           ))} 
         </div> 
 
         {/* Loading */} 
         {loading ? ( 
           <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}> 
             {[1, 2, 3, 4, 5].map(i => ( 
               <div key={i} style={{ height: '80px', borderRadius: '16px', background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} /> 
             ))} 
           </div> 
         ) : filtered.length === 0 ? ( 
           <div style={{ textAlign: 'center', padding: '80px 0' }}> 
             <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}> 
               <Bell size={64} color="#334155" style={{ marginBottom: '16px' }} /> 
             </motion.div> 
             <p style={{ fontFamily: 'Syne', fontSize: '20px', color: '#F8FAFC', margin: '0 0 8px' }}>All caught up!</p> 
             <p style={{ fontFamily: 'DM Sans', color: '#64748B' }}>No notifications in this category</p> 
           </div> 
         ) : ( 
           Object.entries(grouped).map(([group, items]) => { 
             if (items.length === 0) return null 
             return ( 
               <div key={group} style={{ marginBottom: '24px' }}> 
                 <p style={{ fontFamily: 'DM Sans', fontSize: '12px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px', fontWeight: 600 }}>{group}</p> 
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}> 
                   <AnimatePresence> 
                     {items.map((notif, i) => { 
                       const config = typeConfig[notif.type] || typeConfig.system 
                       return ( 
                         <motion.div 
                           key={notif._id} 
                           initial={{ opacity: 0, x: -20 }} 
                           animate={{ opacity: 1, x: 0 }} 
                           exit={{ opacity: 0, x: 100, height: 0 }} 
                           transition={{ delay: i * 0.04 }} 
                           onClick={() => handleClick(notif)} 
                           style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '16px 20px', borderRadius: '16px', background: notif.isRead ? 'rgba(255,255,255,0.03)' : 'rgba(14,165,233,0.05)', border: `1px solid ${notif.isRead ? 'rgba(255,255,255,0.06)' : 'rgba(14,165,233,0.15)'}`, cursor: 'pointer', position: 'relative', transition: 'all 0.2s', borderLeft: notif.isRead ? undefined : `4px solid ${config.color}` }} 
                           onMouseEnter={e => e.currentTarget.style.background = notif.isRead ? 'rgba(255,255,255,0.06)' : 'rgba(14,165,233,0.08)'} 
                           onMouseLeave={e => e.currentTarget.style.background = notif.isRead ? 'rgba(255,255,255,0.03)' : 'rgba(14,165,233,0.05)'} 
                         > 
                           {/* Icon */} 
                           <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: config.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}> 
                             {config.icon} 
                           </div> 
 
                           {/* Content */} 
                           <div style={{ flex: 1, minWidth: 0 }}> 
                             <p style={{ margin: '0 0 4px', fontFamily: 'DM Sans', fontSize: '14px', color: '#F8FAFC', fontWeight: notif.isRead ? 400 : 700 }}>{notif.title}</p> 
                             <p style={{ margin: '0 0 6px', fontFamily: 'DM Sans', fontSize: '13px', color: '#94A3B8', lineHeight: 1.5 }}>{notif.body}</p> 
                             <span style={{ fontFamily: 'DM Sans', fontSize: '11px', color: '#475569' }}>{timeAgo(notif.createdAt)}</span> 
                           </div> 
 
                           {/* Right side */} 
                           <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', flexShrink: 0 }}> 
                             {!notif.isRead && ( 
                               <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0EA5E9' }} /> 
                             )} 
                             <button 
                               onClick={(e) => deleteNotification(notif._id, e)} 
                               style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#334155', padding: '4px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.2s' }} 
                               onMouseEnter={e => e.currentTarget.style.color = '#EF4444'} 
                               onMouseLeave={e => e.currentTarget.style.color = '#334155'} 
                             > 
                               <Trash2 size={14} /> 
                             </button> 
                           </div> 
                         </motion.div> 
                       ) 
                     })} 
                   </AnimatePresence> 
                 </div> 
               </div> 
             ) 
           }) 
         )} 
       </main> 
     </div> 
   ) 
 }