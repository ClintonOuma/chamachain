import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Lock, Bell, AlertTriangle, Camera, Eye, EyeOff, Check, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import NotificationBell from '../components/NotificationBell'
import api from '../services/api'
import useAuthStore from '../store/authStore'

function Toast({ message, type, onClose }) {
  const colors = {
    success: { border: '#10B981', icon: '✓', bg: 'rgba(16,185,129,0.1)' },
    error: { border: '#EF4444', icon: '✗', bg: 'rgba(239,68,68,0.1)' }
  }
  const c = colors[type] || colors.success
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, background: '#1E293B', border: `1px solid ${c.border}`, borderLeft: `4px solid ${c.border}`, borderRadius: '14px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px', minWidth: '300px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.border, fontWeight: 700, flexShrink: 0 }}>{c.icon}</div>
      <p style={{ fontFamily: 'DM Sans', fontSize: '14px', color: '#F8FAFC', margin: 0, flex: 1 }}>{message}</p>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '16px' }}>✕</button>
    </motion.div>
  )
}

function FloatingInput({ label, type = 'text', value, onChange, disabled = false, rightElement }) {
  const [focused, setFocused] = useState(false)
  const active = focused || (value && value.length > 0)
  return (
    <div style={{ position: 'relative', marginBottom: '20px' }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: '14px', border: `1px solid ${disabled ? 'rgba(255,255,255,0.05)' : active ? '#0EA5E9' : 'rgba(255,255,255,0.12)'}`, pointerEvents: 'none', transition: 'border-color 0.2s ease' }} />
      <label style={{ position: 'absolute', left: '14px', top: '50%', transform: active ? 'translateY(-26px)' : 'translateY(-50%)', fontSize: active ? '11px' : '15px', color: disabled ? '#334155' : active ? '#0EA5E9' : '#64748B', background: active ? '#12101f' : 'transparent', padding: active ? '0 6px' : '0', transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)', pointerEvents: 'none', zIndex: 2, fontFamily: 'DM Sans', textTransform: active ? 'uppercase' : 'none', letterSpacing: active ? '0.05em' : '0' }}>{label}</label>
      <input type={type} value={value} onChange={onChange} disabled={disabled} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ width: '100%', background: disabled ? 'rgba(255,255,255,0.02)' : 'transparent', border: 'none', outline: 'none', color: disabled ? '#475569' : '#F8FAFC', fontSize: '15px', padding: '16px 16px', paddingRight: rightElement ? '48px' : '16px', fontFamily: 'DM Sans', position: 'relative', zIndex: 1, cursor: disabled ? 'not-allowed' : 'text' }} />
      {rightElement && <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', zIndex: 3 }}>{rightElement}</div>} 
    </div>
  )
}

function PasswordStrengthBar({ password }) {
  const getStrength = () => {
    let score = 0
    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++
    return score
  }
  const strength = getStrength()
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const colors = ['', '#EF4444', '#F59E0B', '#F59E0B', '#10B981']
  if (!password) return null
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ flex: 1, height: '4px', borderRadius: '2px', background: i <= strength ? colors[strength] : 'rgba(255,255,255,0.1)', transition: 'background 0.3s ease' }} />
        ))}
      </div>
      <p style={{ margin: 0, fontFamily: 'DM Sans', fontSize: '12px', color: colors[strength] }}>{labels[strength]}</p>
    </div>
  )
}

function Toggle({ value, onChange }) {
  return (
    <div onClick={() => onChange(!value)} style={{ width: '48px', height: '26px', borderRadius: '13px', background: value ? '#0EA5E9' : '#334155', cursor: 'pointer', position: 'relative', transition: 'background 0.2s ease', boxShadow: value ? '0 0 12px rgba(14,165,233,0.4)' : 'none', flexShrink: 0 }}>
      <motion.div animate={{ x: value ? 22 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} 
        style={{ position: 'absolute', top: '3px', width: '20px', height: '20px', borderRadius: '50%', background: 'white' }} />
    </div>
  )
}

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuthStore()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('profile')
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(false)

  // Profile state
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')

  // Password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // Notification prefs
  const [prefs, setPrefs] = useState({
    sms: true, whatsapp: true, email: true, inApp: true
  })

  // Danger zone
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  // Load user data
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '')
      const p = (user.phone || '').replace('+254', '').replace('254', '')
      setPhone(p)
      if (user.notificationPrefs) setPrefs(user.notificationPrefs)
    }
    // Fetch fresh profile
    api.get('/users/profile').then(res => {
      const u = res.data.user
      setFullName(u.fullName || '')
      const p = (u.phone || '').replace('+254', '').replace('254', '')
      setPhone(p)
      if (u.notificationPrefs) setPrefs(u.notificationPrefs)
    }).catch(() => {})
  }, [])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  const getInitials = (name) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const avatarColors = ['#0EA5E9', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444']
  const avatarColor = avatarColors[(user?.fullName?.charCodeAt(0) || 0) % avatarColors.length]

  const handleUpdateProfile = async () => {
    if (!fullName.trim()) return showToast('Full name is required', 'error')
    setLoading(true)
    try {
      const res = await api.patch('/users/profile', {
        fullName: fullName.trim(),
        phone: phone ? '+254' + phone.replace(/^0/, '') : user.phone
      })
      if (updateUser) updateUser(res.data.user)
      showToast('Profile updated successfully ✓')
    } catch (err) {
      showToast(err.response?.data?.message || 'Update failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePassword = async () => {
    if (!currentPassword) return showToast('Enter your current password', 'error')
    if (newPassword.length < 8) return showToast('New password must be at least 8 characters', 'error')
    if (newPassword !== confirmNewPassword) return showToast('Passwords do not match', 'error')
    setLoading(true)
    try {
      await api.patch('/users/password', { currentPassword, newPassword })
      showToast('Password updated successfully ✓')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
    } catch (err) {
      showToast(err.response?.data?.message || 'Password update failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateNotifs = async () => {
    setLoading(true)
    try {
      await api.patch('/users/notifications', { prefs })
      showToast('Notification preferences saved ✓')
    } catch (err) {
      showToast('Failed to save preferences', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (confirmText !== 'CONFIRM') return
    try {
      await api.delete('/users/account')
      logout()
      navigate('/')
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete account', 'error')
    }
  }

  const tabs = [
    { id: 'profile', label: '👤 Profile', icon: User },
    { id: 'security', label: '🔒 Security', icon: Lock },
    { id: 'notifications', label: '🔔 Notifications', icon: Bell },
    { id: 'danger', label: '⚠️ Danger Zone', icon: AlertTriangle },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0D0B1E' }}>
      <div className="mesh-bg" />
      <Sidebar />
      <main className="main-content" style={{ marginLeft: '240px', flex: 1, padding: '32px', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontFamily: 'Syne', fontSize: '28px', color: '#F8FAFC', margin: 0 }}>Profile & Settings</h1>
            <p style={{ color: '#64748B', fontFamily: 'DM Sans', marginTop: '4px' }}>Manage your account and preferences</p>
          </div>
          <NotificationBell />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px', alignItems: 'start' }}>

          {/* LEFT — Profile Card */}
          <div>
            <div className="glass-card" style={{ padding: '28px', textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 16px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: `linear-gradient(135deg, ${avatarColor}, ${avatarColor}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne', fontSize: '28px', fontWeight: 800, color: 'white', boxShadow: `0 0 24px ${avatarColor}44` }}>
                  {getInitials(user?.fullName)}
                </div>
                <button onClick={() => showToast('Avatar upload coming soon!', 'error')}
                  style={{ position: 'absolute', bottom: 0, right: 0, width: '26px', height: '26px', borderRadius: '50%', background: '#0EA5E9', border: '2px solid #0D0B1E', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <Camera size={12} color="white" />
                </button>
              </div>
              <h3 style={{ fontFamily: 'Syne', fontSize: '18px', color: '#F8FAFC', margin: '0 0 4px' }}>{user?.fullName}</h3>
              <p style={{ fontFamily: 'DM Sans', color: '#64748B', fontSize: '13px', margin: '0 0 4px' }}>{user?.email}</p>
              <p style={{ fontFamily: 'DM Sans', color: '#64748B', fontSize: '13px', margin: 0 }}>{user?.phone}</p>
              {user?.isSuperAdmin && (
                <div style={{ marginTop: '12px', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '20px', padding: '4px 12px', display: 'inline-block' }}>
                  <span style={{ fontFamily: 'DM Sans', fontSize: '12px', color: '#F59E0B', fontWeight: 600 }}>👑 Super Admin</span>
                </div>
              )}
            </div>

            {/* Nav tabs */}
            <div className="glass-card" style={{ padding: '8px' }}>
              {tabs.map(tab => (
                <div key={tab.id} onClick={() => setActiveTab(tab.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '10px', cursor: 'pointer', background: activeTab === tab.id ? 'rgba(14,165,233,0.1)' : 'transparent', borderLeft: activeTab === tab.id ? '3px solid #0EA5E9' : '3px solid transparent', marginBottom: '4px', transition: 'all 0.2s' }}>
                  <span style={{ fontSize: '16px' }}>{tab.label.split(' ')[0]}</span>
                  <span style={{ fontFamily: 'DM Sans', fontSize: '14px', color: activeTab === tab.id ? '#F8FAFC' : '#64748B', fontWeight: activeTab === tab.id ? 600 : 400 }}>{tab.label.split(' ').slice(1).join(' ')}</span>
                </div>
              ))}
            </div>

            {/* Sign out */}
            <button onClick={() => { logout(); navigate('/') }}
              style={{ width: '100%', marginTop: '12px', padding: '12px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', cursor: 'pointer', fontFamily: 'DM Sans', fontWeight: 600, fontSize: '14px' }}>
              Sign Out
            </button>
          </div>

          {/* RIGHT — Settings Content */}
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>

              {/* PROFILE TAB */}
              {activeTab === 'profile' && (
                <div className="glass-card" style={{ padding: '32px' }}>
                  <h3 style={{ fontFamily: 'Syne', fontSize: '20px', color: '#F8FAFC', marginBottom: '24px' }}>Personal Information</h3>
                  <FloatingInput label="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} />
                  <FloatingInput label="Email Address" value={user?.email || ''} onChange={() => {}} disabled={true} />
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontFamily: 'DM Sans', fontSize: '12px', color: '#64748B', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone Number</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '14px', padding: '14px 16px' }}>
                      <span style={{ color: '#F8FAFC', fontFamily: 'DM Sans', flexShrink: 0 }}>🇰🇪 +254</span>
                      <div style={{ width: '1px', height: '18px', background: 'rgba(255,255,255,0.1)' }} />
                      <input type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                        placeholder="7XXXXXXXX"
                        style={{ background: 'transparent', border: 'none', outline: 'none', color: '#F8FAFC', fontFamily: 'DM Sans', flex: 1, padding: 0 }} />
                    </div>
                  </div>
                  <button className="btn-primary" onClick={handleUpdateProfile} disabled={loading} style={{ width: '100%' }}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}

              {/* SECURITY TAB */}
              {activeTab === 'security' && (
                <div className="glass-card" style={{ padding: '32px' }}>
                  <h3 style={{ fontFamily: 'Syne', fontSize: '20px', color: '#F8FAFC', marginBottom: '24px' }}>Change Password</h3>
                  <FloatingInput label="Current Password" type={showCurrent ? 'text' : 'password'} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                    rightElement={<button onClick={() => setShowCurrent(!showCurrent)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>{showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}</button>} />
                  <FloatingInput label="New Password" type={showNew ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)}
                    rightElement={<button onClick={() => setShowNew(!showNew)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>{showNew ? <EyeOff size={16} /> : <Eye size={16} />}</button>} />
                  <PasswordStrengthBar password={newPassword} />
                  <div style={{ position: 'relative', marginBottom: '20px' }}>
                    <FloatingInput label="Confirm New Password" type={showConfirm ? 'text' : 'password'} value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)}
                      rightElement={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {confirmNewPassword && (
                            newPassword === confirmNewPassword
                              ? <Check size={16} color="#10B981" />
                              : <X size={16} color="#EF4444" />
                          )}
                          <button onClick={() => setShowConfirm(!showConfirm)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>{showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                        </div>
                      } />
                  </div>
                  <button className="btn-primary" onClick={handleUpdatePassword} disabled={loading} style={{ width: '100%' }}>
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              )}

              {/* NOTIFICATIONS TAB */}
              {activeTab === 'notifications' && (
                <div className="glass-card" style={{ padding: '32px' }}>
                  <h3 style={{ fontFamily: 'Syne', fontSize: '20px', color: '#F8FAFC', marginBottom: '8px' }}>Notification Preferences</h3>
                  <p style={{ fontFamily: 'DM Sans', color: '#64748B', fontSize: '14px', marginBottom: '28px' }}>Choose how you want to be notified</p>

                  {[
                    { key: 'inApp', label: 'In-App Notifications', desc: 'Real-time notifications inside the app', icon: '📱' },
                    { key: 'sms', label: 'SMS Notifications', desc: 'Text messages to your phone', icon: '💬' },
                    { key: 'whatsapp', label: 'WhatsApp Messages', desc: 'Messages via WhatsApp', icon: '📲' },
                    { key: 'email', label: 'Email Reports', desc: 'Monthly summaries and important alerts', icon: '📧' },
                  ].map(item => (
                    <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '20px' }}>{item.icon}</span>
                        <div>
                          <p style={{ margin: '0 0 4px', fontFamily: 'DM Sans', fontSize: '14px', color: '#F8FAFC', fontWeight: 600 }}>{item.label}</p>
                          <p style={{ margin: '2px 0 0', fontFamily: 'DM Sans', fontSize: '12px', color: '#64748B' }}>{item.desc}</p>
                        </div>
                      </div>
                      <Toggle value={prefs[item.key]} onChange={v => setPrefs(p => ({ ...p, [item.key]: v }))} />
                    </div>
                  ))}

                  <button className="btn-primary" onClick={handleUpdateNotifs} disabled={loading} style={{ width: '100%', marginTop: '24px' }}>
                    {loading ? 'Saving...' : 'Save Preferences'}
                  </button>
                </div>
              )}

              {/* DANGER ZONE TAB */}
              {activeTab === 'danger' && (
                <div className="glass-card" style={{ padding: '32px', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <h3 style={{ fontFamily: 'Syne', fontSize: '20px', color: '#EF4444', marginBottom: '8px' }}>⚠️ Danger Zone</h3>
                  <p style={{ fontFamily: 'DM Sans', color: '#64748B', fontSize: '14px', marginBottom: '28px' }}>These actions are permanent and cannot be undone</p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: 'rgba(239,68,68,0.05)', borderRadius: '12px', border: '1px solid rgba(239,68,68,0.15)' }}>
                    <div>
                      <p style={{ margin: '0 0 4px', fontFamily: 'DM Sans', color: '#F8FAFC', fontWeight: 600 }}>Delete Account</p>
                      <p style={{ margin: 0, fontFamily: 'DM Sans', color: '#64748B', fontSize: '13px' }}>Permanently remove your account and all data</p>
                    </div>
                    <button onClick={() => setShowDeleteModal(true)}
                      style={{ padding: '10px 20px', borderRadius: '10px', background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)', cursor: 'pointer', fontFamily: 'DM Sans', fontWeight: 600, flexShrink: 0 }}>
                      Delete Account
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="glass-card" style={{ width: '440px', padding: '36px' }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>⚠️</div>
                <h3 style={{ fontFamily: 'Syne', fontSize: '20px', color: '#EF4444', marginBottom: '8px' }}>Delete Account</h3>
                <p style={{ fontFamily: 'DM Sans', color: '#94A3B8', fontSize: '14px', lineHeight: 1.6 }}>
                  This will permanently delete your account, all your contributions, and remove you from all chamas. This cannot be undone.
                </p>
              </div>
              <p style={{ fontFamily: 'DM Sans', fontSize: '13px', color: '#64748B', marginBottom: '8px' }}>Type <strong style={{ color: '#EF4444' }}>CONFIRM</strong> to proceed:</p>
              <input value={confirmText} onChange={e => setConfirmText(e.target.value)} placeholder="Type CONFIRM" style={{ marginBottom: '20px', borderColor: confirmText === 'CONFIRM' ? '#EF4444' : 'rgba(255,255,255,0.1)' }} />
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn-ghost" style={{ flex: 1 }} onClick={() => { setShowDeleteModal(false); setConfirmText('') }}>Cancel</button>
                <button disabled={confirmText !== 'CONFIRM'} onClick={handleDeleteAccount}
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', background: confirmText === 'CONFIRM' ? '#EF4444' : 'rgba(239,68,68,0.3)', color: 'white', border: 'none', cursor: confirmText === 'CONFIRM' ? 'pointer' : 'not-allowed', fontFamily: 'DM Sans', fontWeight: 600 }}>
                  Delete Forever
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  )
}