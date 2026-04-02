import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Plus, Users, ArrowRight, Check } from 'lucide-react';
import useAuthStore from '../store/authStore';
import usePageTitle from '../hooks/usePageTitle';
import api from '../services/api';

const OnboardingPage = () => {
  usePageTitle('Welcome to ChamaChain');
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Step 1: Profile
  const [displayName, setDisplayName] = useState(user?.fullName || '');
  const [avatar, setAvatar] = useState(null);

  // Step 2 & 3: Choice & Join
  const [inviteCode, setInviteCode] = useState('');

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // In real case, upload avatar to Cloudinary
      await api.patch('/users/profile', { fullName: displayName });
      updateUser({ ...user, fullName: displayName });
      setStep(2);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinChama = async (e) => {
    e.preventDefault();
    if (inviteCode.length !== 6) return;
    setLoading(true);
    try {
      await api.post('/chamas/join', { inviteCode });
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Invalid invite code');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0D0B1E', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="mesh-bg" />
      
      {/* Progress Bar */}
      <div style={{ width: '100%', maxWidth: '400px', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', marginBottom: '48px', position: 'relative' }}>
        <motion.div 
          initial={{ width: '33.33%' }}
          animate={{ width: `${(step / 3) * 100}%` }}
          style={{ height: '100%', background: '#0EA5E9', borderRadius: '2px', boxShadow: '0 0 12px #0EA5E9' }}
        />
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="glass-card" style={{ width: '100%', maxWidth: '440px', padding: '40px', textAlign: 'center' }}>
            <h1 style={{ fontFamily: 'Syne', fontSize: '28px', color: '#F8FAFC', marginBottom: '12px' }}>Complete Your Profile</h1>
            <p style={{ fontFamily: 'DM Sans', color: '#64748B', marginBottom: '32px' }}>Let's start with the basics. How should your chama members see you?</p>
            
            <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto 32px' }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '2px dashed rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Camera size={32} color="#475569" />
              </div>
              <button style={{ position: 'absolute', bottom: '0', right: '0', background: '#0EA5E9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(14,165,233,0.3)' }}>
                <Plus size={18} color="#FFF" />
              </button>
            </div>

            <form onSubmit={handleProfileSubmit}>
              <div style={{ marginBottom: '24px', textAlign: 'left' }}>
                <label style={{ display: 'block', fontFamily: 'DM Sans', fontSize: '13px', color: '#64748B', marginBottom: '8px' }}>Full Name</label>
                <input 
                  type="text" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  style={{ width: '100%', padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', outline: 'none' }}
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {loading ? 'Saving...' : 'Continue'} <ArrowRight size={18} />
              </button>
            </form>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" variants={containerVariants} initial="hidden" animate="visible" exit="exit" style={{ width: '100%', maxWidth: '600px', textAlign: 'center' }}>
            <h1 style={{ fontFamily: 'Syne', fontSize: '32px', color: '#F8FAFC', marginBottom: '12px' }}>Welcome, {user?.fullName}!</h1>
            <p style={{ fontFamily: 'DM Sans', color: '#64748B', marginBottom: '40px' }}>How would you like to start your journey on ChamaChain?</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <button 
                onClick={() => navigate('/chamas')}
                className="glass-card" 
                style={{ padding: '40px', cursor: 'pointer', border: 'none', textAlign: 'center' }}
              >
                <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(14,165,233,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <Plus size={32} color="#0EA5E9" />
                </div>
                <h3 style={{ fontFamily: 'Syne', color: '#F8FAFC', marginBottom: '8px' }}>Create New Chama</h3>
                <p style={{ fontFamily: 'DM Sans', color: '#64748B', fontSize: '14px', margin: 0 }}>Start your own savings group and invite others.</p>
              </button>

              <button 
                onClick={() => setStep(3)}
                className="glass-card" 
                style={{ padding: '40px', cursor: 'pointer', border: 'none', textAlign: 'center' }}
              >
                <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <Users size={32} color="#8B5CF6" />
                </div>
                <h3 style={{ fontFamily: 'Syne', color: '#F8FAFC', marginBottom: '8px' }}>Join Existing Chama</h3>
                <p style={{ fontFamily: 'DM Sans', color: '#64748B', fontSize: '14px', margin: 0 }}>Already have a code? Join your friends' group.</p>
              </button>
            </div>
            
            <button onClick={() => navigate('/dashboard')} style={{ marginTop: '40px', background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', fontFamily: 'DM Sans' }}>
              Skip for now, take me to Dashboard
            </button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="glass-card" style={{ width: '100%', maxWidth: '440px', padding: '40px', textAlign: 'center' }}>
            <h1 style={{ fontFamily: 'Syne', fontSize: '28px', color: '#F8FAFC', marginBottom: '12px' }}>Enter Invite Code</h1>
            <p style={{ fontFamily: 'DM Sans', color: '#64748B', marginBottom: '32px' }}>Paste the 6-character code shared by your chama admin.</p>
            
            <form onSubmit={handleJoinChama}>
              <div style={{ marginBottom: '32px' }}>
                <input 
                  type="text" 
                  maxLength={6}
                  placeholder="X X X X X X"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  style={{ width: '100%', padding: '20px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', outline: 'none', textAlign: 'center', fontSize: '24px', letterSpacing: '8px', fontFamily: 'JetBrains Mono' }}
                  required
                />
              </div>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setStep(2)} className="btn-ghost" style={{ flex: 1 }}>Back</button>
                <button type="submit" disabled={loading || inviteCode.length !== 6} className="btn-primary" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  {loading ? 'Joining...' : 'Join Group'} <Check size={18} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OnboardingPage;
