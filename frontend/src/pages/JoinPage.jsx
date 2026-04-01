import { useState, useEffect } from 'react' 
 import { useParams, useNavigate } from 'react-router-dom' 
 import { motion } from 'framer-motion' 
 import api from '../services/api' 
 import useAuthStore from '../store/authStore' 
 
 export default function JoinPage() { 
   const { code } = useParams() 
   const navigate = useNavigate() 
   const { isAuthenticated } = useAuthStore() 
   const [loading, setLoading] = useState(false) 
   const [error, setError] = useState('') 
   const [success, setSuccess] = useState(false) 
 
   const handleJoin = async () => { 
     if (!isAuthenticated) { 
       localStorage.setItem('pendingJoinCode', code) 
       navigate('/register') 
       return 
     } 
     setLoading(true) 
     try { 
       await api.post('/chamas/join', { inviteCode: code.toUpperCase() }) 
       setSuccess(true) 
       setTimeout(() => navigate('/chamas'), 2000) 
     } catch (err) { 
       setError(err.response?.data?.message || 'Failed to join chama') 
     } finally { 
       setLoading(false) 
     } 
   } 
 
   // Auto-join after login if came from invite link 
   useEffect(() => { 
     const pendingCode = localStorage.getItem('pendingJoinCode') 
     if (isAuthenticated && pendingCode) { 
       localStorage.removeItem('pendingJoinCode') 
       api.post('/chamas/join', { inviteCode: pendingCode.toUpperCase() }) 
         .then(() => navigate('/chamas')) 
         .catch(() => {}) 
     } 
   }, [isAuthenticated, navigate]) 
 
   return ( 
     <div style={{ minHeight: '100vh', background: '#0D0B1E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}> 
       <div className="mesh-bg" /> 
       <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ width: '440px', padding: '48px', textAlign: 'center', position: 'relative', zIndex: 1 }}> 
         <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏦</div> 
         <h1 style={{ fontFamily: 'Syne', fontSize: '26px', color: '#F8FAFC', marginBottom: '8px' }}> 
           {success ? 'Joined Successfully! 🎉' : 'You\'ve been invited!'} 
         </h1> 
         <p style={{ color: '#94A3B8', fontFamily: 'DM Sans', marginBottom: '8px' }}> 
           Invite code: <span style={{ color: '#0EA5E9', fontFamily: 'monospace', fontSize: '18px', letterSpacing: '0.2em' }}>{code?.toUpperCase()}</span> 
         </p> 
         {!success && ( 
           <> 
             <p style={{ color: '#64748B', fontFamily: 'DM Sans', fontSize: '14px', marginBottom: '32px' }}> 
               {isAuthenticated ? 'Click below to join this chama' : 'Create an account or sign in to join this chama'} 
             </p> 
             {error && <p style={{ color: '#EF4444', fontFamily: 'DM Sans', fontSize: '13px', marginBottom: '16px' }}>{error}</p>} 
             <button className="btn-primary" style={{ width: '100%', marginBottom: '12px' }} onClick={handleJoin} disabled={loading}> 
               {loading ? 'Joining...' : isAuthenticated ? 'Join This Chama' : 'Sign Up to Join'} 
             </button> 
             {!isAuthenticated && ( 
               <button className="btn-ghost" style={{ width: '100%' }} onClick={() => { localStorage.setItem('pendingJoinCode', code); navigate('/login') }}> 
                 I already have an account 
               </button> 
             )} 
           </> 
         )} 
         {success && <p style={{ color: '#10B981', fontFamily: 'DM Sans' }}>Redirecting to your chamas...</p>} 
       </motion.div> 
     </div> 
   ) 
 } 
