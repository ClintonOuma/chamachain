import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Lock, Bell, Shield, LogOut, Camera, Check, X, AlertTriangle, Monitor, Smartphone, Mail, MessageCircle, FileText, CheckCheck, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import api from '../services/api'
import useAuthStore from '../store/authStore'
import usePageTitle from '../hooks/usePageTitle'



function FloatingInput({ label, type = 'text', value, onChange, error, rightElement, disabled }) {
  const [focused, setFocused] = useState(false)
  const active = focused || (value !== undefined && value.toString().length > 0)

  return (
    <div style={{ position: 'relative', marginBottom: '20px', opacity: disabled ? 0.6 : 1 }}>
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '14px',
        border: `1px solid ${error ? '#EF4444' : active ? '#0EA5E9' : 'rgba(255,255,255,0.12)'}`,
        pointerEvents: 'none', transition: 'border-color 0.2s ease',
        background: disabled ? 'rgba(0,0,0,0.2)' : 'transparent'
      }} />
      <label style={{
        position: 'absolute', left: '14px',
        top: active ? '0px' : '50%',
        transform: active ? 'translateY(-50%)' : 'translateY(-50%)',
        fontSize: active ? '11px' : '15px',
        color: active ? '#0EA5E9' : '#64748B',
        background: active ? '#1a1625' : 'transparent',
        padding: active ? '0 6px' : '0',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: 'none', zIndex: 2,
        fontFamily: "'DM Sans', sans-serif",
        letterSpacing: active ? '0.05em' : '0',
        textTransform: active ? 'uppercase' : 'none'
      }}>
        {label}
      </label>
      <div style={{ display: 'flex', alignItems: 'center', height: '100%', paddingRight: '16px' }}>
        <input
          type={type} value={value} onChange={onChange} disabled={disabled}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: '#F8FAFC', fontSize: '15px', padding: '16px',
            fontFamily: "'DM Sans', sans-serif", position: 'relative', zIndex: 1
          }}
        />
        {rightElement && <div style={{ zIndex: 2 }}>{rightElement}</div>}
      </div>
      {error && (
        <p style={{ color: '#EF4444', fontSize: '11px', marginTop: '4px', paddingLeft: '4px', position: 'absolute', bottom: '-18px' }}>
          {error}
        </p>
      )}
    </div>
  )
}

function FloatingPhoneInput({ value, onChange, error }) {
  const [focused, setFocused] = useState(false)
  const active = focused || value.length > 0

  return (
    <div style={{ position: 'relative', marginBottom: '20px' }}>
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '14px',
        border: `1px solid ${error ? '#EF4444' : active ? '#0EA5E9' : 'rgba(255,255,255,0.12)'}`,
        pointerEvents: 'none', transition: 'border-color 0.2s ease'
      }} />
      <label style={{
        position: 'absolute', left: '14px',
        top: active ? '0px' : '50%',
        transform: active ? 'translateY(-50%) translateY(-26px)' : 'translateY(-50%)',
        fontSize: active ? '11px' : '15px',
        color: active ? '#0EA5E9' : '#64748B',
        background: active ? '#1a1625' : 'transparent',
        padding: active ? '0 6px' : '0',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: 'none', zIndex: 2, fontFamily: "'DM Sans', sans-serif",
        letterSpacing: active ? '0.05em' : '0', textTransform: active ? 'uppercase' : 'none'
      }}>
        Phone Number
      </label>
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px', gap: '8px' }}>
        {active && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, animation: 'fadeIn 0.2s ease' }}>
            <span style={{ color: '#F8FAFC', fontSize: '15px', fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>🇰🇪 +254</span>
            <div style={{ width: '1px', height: '18px', background: 'rgba(255,255,255,0.2)' }} />
          </div>
        )}
        <input
          type="tel" value={value}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, '').slice(0, 9)
            onChange(val)
          }}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          placeholder={active ? '7XX XXX XXX' : ''}
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: '#F8FAFC', fontSize: '15px', fontFamily: "'DM Sans', sans-serif",
            padding: 0, zIndex: 1
          }}
        />
      </div>
      {error && (
        <p style={{ color: '#EF4444', fontSize: '11px', marginTop: '4px', paddingLeft: '4px', position: 'absolute', bottom: '-18px' }}>{error}</p>
      )}
    </div>
  )
}

function ToggleSwitch({ isOn, onToggle }) {
  return (
    <div 
      onClick={onToggle}
      style={{
        width: 44, height: 24, borderRadius: 12, 
        background: isOn ? '#0EA5E9' : '#334155',
        position: 'relative', cursor: 'pointer', transition: 'background 0.3s'
      }}
    >
      <motion.div 
        initial={false}
        animate={{ x: isOn ? 20 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{
          width: 20, height: 20, borderRadius: '50%', background: '#FFF',
          position: 'absolute', top: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}
      />
    </div>
  )
}

export default function ProfilePage() {
  usePageTitle('My Profile')
  const navigate = useNavigate()
  const { user, logout, updateUser } = useAuthStore()

  const [activeTab, setActiveTab] = useState('Profile')
  const [toast, setToast] = useState(null)
  
  // Profile State
  const [fullName, setFullName] = useState(user?.fullName || '')
  const [phone, setPhone] = useState(user?.phone?.replace('+254', '') || '')
  const [profileLoading, setProfileLoading] = useState(false)

  // Security State
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [securityLoading, setSecurityLoading] = useState(false)

  // Notifications State
  const [prefs, setPrefs] = useState({
    inApp: true, sms: false, whatsapp: true, email: true,
    contributions: true, loans: true, votes: true, reminders: true
  })
  const [prefsLoading, setPrefsLoading] = useState(false)

  // Danger Zone State
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleProfileSave = async () => {
    setProfileLoading(true)
    try {
      const res = await api.patch('/users/profile', { fullName, phone: '+254' + phone })
      updateUser(res.data.user)
      showToast('Profile updated successfully ✓')
    } catch (err) {
      showToast(err.response?.data?.message || 'Update failed', 'error')
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error')
      return
    }
    setSecurityLoading(true)
    try {
      await api.patch('/users/password', { currentPassword, newPassword })
      showToast('Password updated successfully ✓')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      showToast(err.response?.data?.message || 'Update failed', 'error')
    } finally {
      setSecurityLoading(false)
    }
  }

  const handlePrefsSave = async () => {
    setPrefsLoading(true)
    try {
      await api.patch('/users/notifications', { prefs })
      showToast('Preferences updated successfully ✓')
    } catch (err) {
      showToast('Error updating preferences ✗', 'error')
    } finally {
      setPrefsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'CONFIRM') return
    try {
      await api.delete('/users/account')
      logout()
      navigate('/')
    } catch (err) {
      showToast('Failed to delete account', 'error')
    }
  }

  const TABS = [
    { id: 'Profile', icon: User },
    { id: 'Security', icon: Shield },
    { id: 'Notifications', icon: Bell },
    { id: 'Danger Zone', icon: AlertTriangle }
  ]

  const getStrength = (pw) => {
    let score = 0;
    if (pw.length > 7) score += 25;
    if (/[A-Z]/.test(pw)) score += 25;
    if (/[0-9]/.test(pw)) score += 25;
    if (/[^A-Za-z0-9]/.test(pw)) score += 25;
    return score;
  }
  const pwStrength = getStrength(newPassword)
  const pwColor = pwStrength <= 25 ? '#EF4444' : pwStrength <= 50 ? '#F59E0B' : pwStrength <= 75 ? '#3B82F6' : '#10B981'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0D0B1E', fontFamily: "'DM Sans', sans-serif" }}>
      <div className="mesh-bg" />
      <Sidebar />
      <main className="main-content" style={{ marginLeft: '240px', flex: 1, padding: '40px', display: 'flex', gap: '40px', position: 'relative', zIndex: 1, overflowY: 'auto' }}>
        
        {/* LEFT COLUMN — Profile Card */}
        <div style={{ width: '35%', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 120, background: 'linear-gradient(to bottom, rgba(14,165,233,0.1), transparent)' }} />
            
            {/* Avatar */}
            <div className="avatar-hover" style={{ width: 100, height: 100, borderRadius: '50%', background: 'linear-gradient(135deg, #0EA5E9, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: '#FFF', marginBottom: 20, position: 'relative', cursor: 'pointer', overflow: 'hidden', zIndex: 1 }} onClick={() => showToast('Photo upload coming soon', 'info')}>
              {user?.fullName?.charAt(0) || 'U'}
              <div className="avatar-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s', gap: 4 }}>
                <Camera size={24} color="#FFF" />
                <span style={{ fontSize: 10, color: '#FFF', fontWeight: 600 }}>CHANGE</span>
              </div>
            </div>

            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, color: '#FFF', fontWeight: 700, margin: '0 0 4px 0', zIndex: 1 }}>{user?.fullName || 'User'}</h2>
            <div style={{ color: '#94A3B8', fontSize: 14, marginBottom: 8, zIndex: 1 }}>{user?.email || 'user@example.com'}</div>
            <div style={{ color: '#94A3B8', fontSize: 14, marginBottom: 24, zIndex: 1 }}>{user?.phone || '+254 ••• ••• •••'}</div>

            <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 24 }} />

            <div style={{ alignSelf: 'stretch', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748B', fontSize: 13 }}>Member Since</span>
                <span style={{ color: '#E2E8F0', fontSize: 14, fontWeight: 500 }}>Oct 2023</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748B', fontSize: 13 }}>Active Chamas</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  <span style={{ background: 'rgba(14,165,233,0.1)', color: '#0EA5E9', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 700 }}>3</span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748B', fontSize: 13 }}>Status</span>
                <span style={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600 }}><Check size={14} /> Verified</span>
              </div>
            </div>

            <button onClick={() => { logout(); navigate('/') }} style={{ width: '100%', marginTop: 32, padding: '12px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', borderRadius: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 600, transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(239,68,68,0.05)'}>
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN — Settings */}
        <div style={{ width: '65%', display: 'flex', flexDirection: 'column' }}>
          
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 32, borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 32 }}>
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{ background: 'none', border: 'none', padding: '0 0 16px 0', color: activeTab === tab.id ? '#0EA5E9' : '#94A3B8', fontSize: 15, fontWeight: activeTab === tab.id ? 600 : 500, cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', gap: 8, transition: 'color 0.2s' }}>
                <tab.icon size={18} /> {tab.id}
                {activeTab === tab.id && (
                  <motion.div layoutId="tab-underline" style={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: 2, background: '#0EA5E9' }} />
                )}
              </button>
            ))}
          </div>

          {/* TAB 1: Profile */}
          <AnimatePresence mode="wait">
            {activeTab === 'Profile' && (
              <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, color: '#FFF', margin: '0 0 24px 0' }}>Personal Information</h3>
                <div style={{ background: '#1a1625', borderRadius: 20, padding: 32, border: '1px solid rgba(255,255,255,0.04)' }}>
                  <FloatingInput label="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} />
                  <FloatingInput label="Email Address" value={user?.email || ''} onChange={() => {}} disabled={true} rightElement={<Lock size={16} color="#64748B" />} />
                  <div style={{ color: '#64748B', fontSize: 12, marginTop: -12, marginBottom: 20, marginLeft: 4 }}>Contact support to change email</div>
                  <FloatingPhoneInput value={phone} onChange={setPhone} />
                  
                  <button onClick={handleProfileSave} disabled={profileLoading} className="btn-primary" style={{ width: '100%', height: 52, background: '#0EA5E9', color: '#FFF', border: 'none', borderRadius: 14, fontWeight: 700, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 16 }}>
                    {profileLoading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : 'Save Changes'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* TAB 2: Security */}
            {activeTab === 'Security' && (
              <motion.div key="security" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, color: '#FFF', margin: '0 0 24px 0' }}>Change Password</h3>
                <div style={{ background: '#1a1625', borderRadius: 20, padding: 32, border: '1px solid rgba(255,255,255,0.04)', marginBottom: 32 }}>
                  <FloatingInput label="Current Password" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                  
                  <div style={{ position: 'relative' }}>
                    <FloatingInput label="New Password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                    {newPassword && (
                      <div style={{ position: 'absolute', bottom: -12, left: 4, right: 4, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                        <div style={{ height: '100%', background: pwColor, borderRadius: 2, width: `${pwStrength}%`, transition: 'all 0.3s' }} />
                      </div>
                    )}
                  </div>
                  <div style={{ height: 24 }} />
                  
                  <FloatingInput label="Confirm New Password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                  
                  <button onClick={handlePasswordUpdate} disabled={securityLoading || !currentPassword || !newPassword} className="btn-primary" style={{ width: '100%', height: 52, background: '#0EA5E9', color: '#FFF', border: 'none', borderRadius: 14, fontWeight: 700, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 16 }}>
                    {securityLoading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : 'Update Password'}
                  </button>
                </div>

                <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, color: '#FFF', margin: '0 0 24px 0' }}>Active Sessions</h3>
                <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 20, padding: 24, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(14,165,233,0.1)', color: '#0EA5E9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Monitor size={24} />
                      </div>
                      <div>
                        <div style={{ color: '#FFF', fontWeight: 600, fontSize: 16 }}>Chrome on Windows</div>
                        <div style={{ color: '#64748B', fontSize: 13, marginTop: 4 }}>Nairobi, KE • IP 105.163.x.x</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <span style={{ padding: '4px 10px', background: 'rgba(16,185,129,0.1)', color: '#10B981', borderRadius: 12, fontSize: 11, fontWeight: 700 }}>Active Now</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 3: Notifications */}
            {activeTab === 'Notifications' && (
              <motion.div key="notifications" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, color: '#FFF', margin: '0 0 24px 0' }}>Delivery Channels</h3>
                <div style={{ background: '#1a1625', borderRadius: 20, padding: 32, border: '1px solid rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 32 }}>
                  {[
                    { key: 'inApp', label: 'In-App Notifications', desc: 'Receive pushes inside the ChamaChain app', icon: Bell },
                    { key: 'sms', label: 'SMS Messages', desc: 'Receive important alerts directly on your phone', icon: Smartphone },
                    { key: 'whatsapp', label: 'WhatsApp', desc: 'Get updates on your WhatsApp number', icon: MessageCircle },
                    { key: 'email', label: 'Email Reports', desc: 'Receive monthly statements and summaries', icon: Mail }
                  ].map(chan => (
                    <div key={chan.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.05)', color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <chan.icon size={20} />
                        </div>
                        <div>
                          <div style={{ color: '#F8FAFC', fontWeight: 600, fontSize: 15 }}>{chan.label}</div>
                          <div style={{ color: '#64748B', fontSize: 13 }}>{chan.desc}</div>
                        </div>
                      </div>
                      <ToggleSwitch isOn={prefs[chan.key]} onToggle={() => setPrefs(p => ({ ...p, [chan.key]: !p[chan.key] }))} />
                    </div>
                  ))}
                </div>

                <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, color: '#FFF', margin: '0 0 24px 0' }}>Notification Types</h3>
                <div style={{ background: '#1a1625', borderRadius: 20, padding: 32, border: '1px solid rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 32 }}>
                  {[
                    { key: 'contributions', label: 'Contributions', desc: 'When payments are received or missed' },
                    { key: 'loans', label: 'Loans', desc: 'Updates on loan requests and approvals' },
                    { key: 'votes', label: 'Votes Required', desc: 'When your vote is needed for group actions' },
                    { key: 'reminders', label: 'Reminders', desc: 'Upcoming due dates and deadlines' }
                  ].map(type => (
                    <div key={type.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ color: '#F8FAFC', fontWeight: 600, fontSize: 15 }}>{type.label}</div>
                        <div style={{ color: '#64748B', fontSize: 13 }}>{type.desc}</div>
                      </div>
                      <ToggleSwitch isOn={prefs[type.key]} onToggle={() => setPrefs(p => ({ ...p, [type.key]: !p[type.key] }))} />
                    </div>
                  ))}
                  
                  <button onClick={handlePrefsSave} disabled={prefsLoading} className="btn-primary" style={{ width: '100%', height: 52, background: '#0EA5E9', color: '#FFF', border: 'none', borderRadius: 14, fontWeight: 700, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 8 }}>
                    {prefsLoading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : 'Save Preferences'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* TAB 4: Danger Zone */}
            {activeTab === 'Danger Zone' && (
              <motion.div key="danger" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div style={{ background: 'rgba(239,68,68,0.05)', borderRadius: 20, padding: 32, border: '1px solid rgba(239,68,68,0.3)' }}>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(239,68,68,0.1)', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <AlertTriangle size={24} />
                    </div>
                    <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, color: '#EF4444', margin: 0 }}>Danger Zone</h3>
                  </div>
                  <p style={{ color: '#FCA5A5', lineHeight: 1.6, marginBottom: 24 }}>Once you delete your account, there is no going back. Please be certain. All your data, active subscriptions, and history will be permanently erased from our servers.</p>
                  
                  <button onClick={() => setShowDeleteModal(true)} style={{ padding: '12px 24px', background: 'transparent', border: '1px solid #EF4444', color: '#EF4444', borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                    Delete My Account
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDeleteModal(false)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(13, 11, 30, 0.8)', backdropFilter: 'blur(8px)' }} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              style={{ position: 'relative', width: 440, background: '#12101f', borderRadius: 24, padding: 32, border: '1px solid rgba(239,68,68,0.3)', boxShadow: '0 24px 48px rgba(0,0,0,0.5)' }}>
              
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, color: '#FFF', margin: '0 0 16px 0', fontWeight: 700 }}>Are you sure?</h2>
              <p style={{ color: '#94A3B8', marginBottom: 24 }}>This action cannot be undone. To proceed, type <strong>CONFIRM</strong> in the box below.</p>
              
              <div style={{ position: 'relative', marginBottom: 24 }}>
                <input 
                  type="text" value={deleteConfirmText} onChange={e => setDeleteConfirmText(e.target.value)}
                  placeholder="CONFIRM"
                  style={{ width: '100%', height: 48, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '0 16px', color: '#FFF', fontSize: 16, outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 16 }}>
                <button onClick={() => setShowDeleteModal(false)} style={{ flex: 1, height: 48, background: 'rgba(255,255,255,0.05)', border: 'none', color: '#FFF', borderRadius: 12, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button 
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'CONFIRM'}
                  style={{ flex: 1, height: 48, background: '#EF4444', border: 'none', color: '#FFF', borderRadius: 12, fontWeight: 600, cursor: deleteConfirmText === 'CONFIRM' ? 'pointer' : 'not-allowed', opacity: deleteConfirmText === 'CONFIRM' ? 1 : 0.5 }}
                >
                  Yes, Delete Forever
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}
            style={{ position: 'fixed', bottom: 32, right: 32, background: 'rgba(13,11,20,0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.08)', borderLeft: `4px solid ${toast.type === 'error' ? '#EF4444' : toast.type === 'info' ? '#0EA5E9' : '#10B981'}`, borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, zIndex: 1000, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            {toast.type === 'error' ? <X size={20} color="#EF4444" /> : toast.type === 'info' ? <Bell size={20} color="#0EA5E9" /> : <Check size={20} color="#10B981" />}
            <span style={{ color: '#FFF', fontSize: 14, fontWeight: 500 }}>{toast.message}</span>
            <button onClick={() => setToast(null)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', marginLeft: 16 }}><X size={16} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .avatar-hover:hover .avatar-overlay { opacity: 1 !important; }
      `}</style>
    </div>
  )
}
