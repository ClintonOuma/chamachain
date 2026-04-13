import { useEffect } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bot, ShieldCheck, Smartphone, Users, TrendingUp, Activity, Star, ArrowRight, Zap } from 'lucide-react'
import useAuthStore from '../store/authStore'
import usePageTitle from '../hooks/usePageTitle'

/* Styles are now in global.css — no dynamic injection needed */

/* ─────────────────────────────────────────────────────────────────
   GLASS HELPERS - Apple Liquid Glass Style
───────────────────────────────────────────────────────────────── */
const glass = {
  background: 'rgba(255,255,255,0.04)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '24px',
  boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,0.15), 0 8px 32px rgba(0,0,0,0.4)',
}

const glassSmall = {
  ...glass,
  borderRadius: '16px',
}

const glassPill = {
  background: 'rgba(255,255,255,0.04)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: '100px',
}

/* ─────────────────────────────────────────────────────────────────
   ANIMATION VARIANTS
───────────────────────────────────────────────────────────────── */
const fadeUp = (delay = 0) => ({
  hidden:  { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] } },
})

const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}

const cardAnim = {
  hidden:  { opacity: 0, y: 40, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

/* ─────────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────────── */
const features = [
  {
    Icon: Bot,
    color: '#4ac3ff',
    title: 'AI Credit Scoring',
    desc: 'Personalized credit scores based on your contribution history. Fair, fast, and data-driven lending decisions.',
  },
  {
    Icon: ShieldCheck,
    color: '#00d4aa',
    title: 'Blockchain Voting',
    desc: 'Every loan approval recorded on-chain. Transparent, tamper-proof governance for your group.',
  },
  {
    Icon: Smartphone,
    color: '#f59e0b',
    title: 'M-Pesa Native',
    desc: 'Contribute and receive loans directly via M-Pesa. One tap, instant confirmation.',
  },
]

const stats = [
  { value: '10K+', label: 'Active Members', Icon: Users },
  { value: 'KES 50M+', label: 'Total Saved', Icon: TrendingUp },
  { value: '99.9%', label: 'Uptime', Icon: Activity },
]

const memberColors = ['#4ac3ff', '#00d4aa', '#f59e0b']
const memberInitials = ['AM', 'JW', 'FO']

/* ─────────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  usePageTitle('AI-Powered Digital Chama Platform')

  // If already logged in, send straight to dashboard
  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="lp-wrapper">

      {/* ══════════════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════════════ */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
          height: '64px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 40px',
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #4ac3ff, #00d4aa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={18} color="#000" strokeWidth={2.5} />
          </div>
          <span style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800, fontSize: '18px', color: '#F8FAFC', letterSpacing: '-0.5px',
          }}>ChamaChain</span>
        </Link>

        {/* Nav actions */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <button style={{
              background: 'transparent',
              color: '#9ca3af', fontFamily: "'DM Sans', sans-serif",
              fontWeight: 500, fontSize: '14px', padding: '10px 20px',
              cursor: 'pointer', transition: 'color 0.2s',
              border: 'none', borderRadius: '10px',
            }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
            >Sign In</button>
          </Link>
          <Link to="/register" style={{ textDecoration: 'none' }}>
            <button style={{
              background: '#fff',
              color: '#000', border: 'none', borderRadius: '10px',
              padding: '10px 20px', fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600, fontSize: '14px', cursor: 'pointer',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#e5e5e5' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}
            >Get Started</button>
          </Link>
        </div>
      </motion.nav>

      {/* ══════════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════════ */}
      <section style={{
        position: 'relative', zIndex: 10,
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center',
        padding: '120px 24px 80px',
      }}>

        {/* Pill badge */}
        <motion.div
          variants={fadeUp(0)}
          initial="hidden" animate="visible"
          style={{ marginBottom: '24px' }}
        >
          <div style={{
            ...glassPill,
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '8px 18px',
            fontSize: '13px', color: '#9ca3af', fontWeight: 500,
          }}>
            <div style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: '#00d4aa',
              animation: 'pulse-dot 2s ease-in-out infinite',
            }} />
            Trusted by 10,000+ members
          </div>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          variants={fadeUp(0.1)}
          initial="hidden" animate="visible"
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(42px, 7vw, 80px)',
            lineHeight: 1.05, letterSpacing: '-3px',
            color: '#F8FAFC', marginBottom: '20px',
            maxWidth: '900px',
          }}
        >
          Your savings group,<br />
          <span className="grad-text">reimagined.</span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          variants={fadeUp(0.2)}
          initial="hidden" animate="visible"
          style={{
            fontSize: '18px', color: '#6b7280',
            letterSpacing: '0.2px', marginBottom: '40px',
            maxWidth: '480px', lineHeight: 1.6,
          }}
        >
          The modern platform for Kenyan chamas. AI-powered credit scoring, blockchain transparency, and instant M-Pesa transactions.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={fadeUp(0.3)}
          initial="hidden" animate="visible"
          style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '60px' }}
        >
          <Link to="/register" style={{ textDecoration: 'none' }}>
            <button style={{
              background: 'linear-gradient(135deg, #4ac3ff 0%, #00d4aa 100%)',
              color: '#000', border: 'none', borderRadius: '12px',
              padding: '16px 32px', fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700, fontSize: '15px', cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.opacity = '0.9' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.opacity = '1' }}
            >
              Start Your Chama
              <ArrowRight size={16} strokeWidth={2.5} />
            </button>
          </Link>
          <button
            onClick={scrollToFeatures}
            style={{
              background: 'rgba(255,255,255,0.06)',
              color: '#9ca3af', fontFamily: "'DM Sans', sans-serif",
              fontWeight: 500, fontSize: '15px', padding: '16px 28px',
              cursor: 'pointer', transition: 'all 0.2s',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
          >Learn More</button>
        </motion.div>

        {/* ── FLOATING HERO VISUAL ── */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: 'relative', width: '100%', maxWidth: '540px', margin: '0 auto' }}
        >
          {/* Main dashboard card */}
          <div style={{
            ...glass,
            padding: '28px 30px 32px',
            animation: 'floatA 5s ease-in-out infinite',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Shimmer line at top */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              overflow: 'hidden',
            }}>
              <div style={{
                width: '40%', height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
                animation: 'shimmer-line 3s ease-in-out infinite',
              }} />
            </div>

            {/* Card header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>Savings Group</div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '17px', color: '#F8FAFC' }}>Maasai Savings Group</div>
              </div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: 'rgba(0,212,170,0.1)',
                border: '1px solid rgba(0,212,170,0.2)',
                borderRadius: '100px', padding: '5px 12px',
                fontSize: '12px', color: '#00d4aa', fontWeight: 600,
              }}>
                <div style={{
                  width: '6px', height: '6px', borderRadius: '50%', background: '#00d4aa',
                }} />
                Active
              </div>
            </div>

            {/* Balance */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px', fontWeight: 500 }}>Group Balance</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '36px', letterSpacing: '-1px' }}>
                <span className="grad-text">KES 127,450</span>
              </div>
            </div>

            {/* Members */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', fontWeight: 500 }}>Members</div>
                <div style={{ display: 'flex' }}>
                  {memberInitials.map((init, i) => (
                    <div key={i} style={{
                      width: '34px', height: '34px', borderRadius: '50%',
                      background: `linear-gradient(135deg, ${memberColors[i]}, ${memberColors[(i+1) % 3]})`,
                      border: '2px solid #000',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', fontWeight: 700, color: '#000',
                      marginLeft: i > 0 ? '-8px' : '0',
                    }}>{init}</div>
                  ))}
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.06)',
                    border: '2px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', fontWeight: 600, color: '#6b7280',
                    marginLeft: '-8px',
                  }}>+9</div>
                </div>
              </div>

              {/* Quick stats */}
              <div style={{ display: 'flex', gap: '20px' }}>
                {[{ label: 'Next Payout', value: '5 days' }, { label: 'This Month', value: '+KES 4,200' }].map(s => (
                  <div key={s.label} style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '2px' }}>{s.label}</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#F8FAFC' }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', color: '#6b7280' }}>Monthly Goal Progress</span>
                <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 600 }}>78%</span>
              </div>
              <div style={{ height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.08)' }}>
                <div style={{
                  height: '100%', width: '78%', borderRadius: '2px',
                  background: 'linear-gradient(90deg, #4ac3ff, #00d4aa)',
                }} />
              </div>
            </div>
          </div>

          {/* Credit score card (floating) */}
          <div style={{
            ...glassSmall,
            position: 'absolute',
            bottom: '-30px',
            right: '-24px',
            width: '200px',
            padding: '16px 18px',
            animation: 'floatB 4s ease-in-out infinite',
            animationDelay: '1s',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Star size={14} color="#f59e0b" fill="#f59e0b" />
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af' }}>Credit Score</span>
            </div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '28px', marginBottom: '4px' }}>
              <span className="grad-text">847</span>
            </div>
            <div style={{ fontSize: '11px', color: '#00d4aa', fontWeight: 600, marginBottom: '8px' }}>Excellent</div>
            {/* Score bar */}
            <div style={{ height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.08)' }}>
              <div style={{
                height: '100%', width: '84%', borderRadius: '2px',
                background: 'linear-gradient(90deg, #4ac3ff, #00d4aa)',
              }} />
            </div>
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════
          FEATURES SECTION
      ══════════════════════════════════════════════ */}
      <section id="features" style={{ position: 'relative', zIndex: 10, padding: '120px 24px 100px', maxWidth: '1100px', margin: '0 auto' }}>
        {/* Heading */}
        <motion.div
          variants={fadeUp(0)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          style={{ textAlign: 'center', marginBottom: '60px' }}
        >
          <div style={{
            display: 'inline-flex', padding: '6px 16px', marginBottom: '16px',
            fontSize: '12px', fontWeight: 600, letterSpacing: '1px',
            color: '#4ac3ff', textTransform: 'uppercase',
            background: 'rgba(74,195,255,0.08)',
            border: '1px solid rgba(74,195,255,0.15)',
            borderRadius: '6px',
          }}>
            Features
          </div>
          <h2 style={{
            fontFamily: "'Syne', sans-serif", fontWeight: 800,
            fontSize: 'clamp(28px, 4vw, 44px)', letterSpacing: '-1.5px',
            color: '#F8FAFC', marginBottom: '16px',
          }}>Everything your chama needs</h2>
          <p style={{ color: '#6b7280', fontSize: '16px', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7 }}>
            Built from the ground up for savings groups. Community trust meets modern technology.
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}
        >
          {features.map(f => {
            const Icon = f.Icon
            return (
              <motion.div
                key={f.title}
                variants={cardAnim}
                style={{
                  ...glass,
                  padding: '32px 28px',
                  cursor: 'default',
                  transition: 'all 0.25s ease',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                whileHover={{ y: -4, borderColor: 'rgba(255,255,255,0.12)' }}
              >
                {/* Top accent line */}
                <div style={{
                  position: 'absolute', top: 0, left: '28px', right: '28px', height: '1px',
                  background: `linear-gradient(90deg, transparent, ${f.color}40, transparent)`,
                }} />

                {/* Icon */}
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  background: `rgba(255,255,255,0.04)`,
                  border: `1px solid rgba(255,255,255,0.08)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '20px',
                }}>
                  <Icon size={22} color={f.color} />
                </div>

                <h3 style={{
                  fontFamily: "'Syne', sans-serif", fontWeight: 700,
                  fontSize: '18px', color: '#F8FAFC', marginBottom: '10px',
                }}>{f.title}</h3>
                <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: 1.7 }}>{f.desc}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════
          STATS SECTION
      ══════════════════════════════════════════════ */}
      <section style={{ position: 'relative', zIndex: 10, padding: '20px 24px 100px', maxWidth: '1100px', margin: '0 auto' }}>
        {/* Divider */}
        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)', marginBottom: '80px' }} />

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}
        >
          {stats.map(s => {
            const Icon = s.Icon
            return (
              <motion.div
                key={s.label}
                variants={cardAnim}
                style={{
                  ...glass,
                  padding: '32px 24px',
                  textAlign: 'center',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                }}
                whileHover={{ y: -2 }}
              >
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px', marginBottom: '4px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={18} color="#4ac3ff" />
                </div>
                <div className="grad-text" style={{
                  fontFamily: "'Syne', sans-serif", fontWeight: 800,
                  fontSize: '36px', letterSpacing: '-1px', lineHeight: 1,
                }}>{s.value}</div>
                <div style={{ color: '#6b7280', fontSize: '14px', fontWeight: 500 }}>{s.label}</div>
              </motion.div>
            )
          })}
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════
          CTA BANNER
      ══════════════════════════════════════════════ */}
      <section style={{ position: 'relative', zIndex: 10, padding: '0 24px 100px', maxWidth: '1100px', margin: '0 auto' }}>
        <motion.div
          variants={fadeUp(0)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          style={{
            ...glass,
            padding: '64px 48px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Top accent */}
          <div style={{
            position: 'absolute', top: 0, left: '48px', right: '48px', height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(74,195,255,0.3), transparent)',
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{
              fontFamily: "'Syne', sans-serif", fontWeight: 800,
              fontSize: 'clamp(26px, 4vw, 40px)', letterSpacing: '-1.5px',
              color: '#F8FAFC', marginBottom: '16px',
            }}>
              Ready to transform your chama?
            </h2>
            <p style={{ color: '#6b7280', fontSize: '16px', maxWidth: '400px', margin: '0 auto 32px', lineHeight: 1.7 }}>
              Join thousands of groups already saving smarter. Free to start, powerful from day one.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" style={{ textDecoration: 'none' }}>
                <button style={{
                  background: 'linear-gradient(135deg, #4ac3ff 0%, #00d4aa 100%)',
                  color: '#000', border: 'none', borderRadius: '12px',
                  padding: '14px 28px', fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 700, fontSize: '15px', cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.opacity = '0.9' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.opacity = '1' }}
                >
                  Create Your Chama
                  <ArrowRight size={16} strokeWidth={2.5} />
                </button>
              </Link>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <button style={{
                  background: 'rgba(255,255,255,0.06)',
                  color: '#9ca3af', fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 500, fontSize: '15px', padding: '14px 24px',
                  cursor: 'pointer', transition: 'all 0.2s',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#fff' }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#9ca3af' }}
                >Sign In</button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════ */}
      <footer style={{
        position: 'relative', zIndex: 10,
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '40px 24px',
        textAlign: 'center',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '24px', height: '24px', borderRadius: '6px',
              background: 'linear-gradient(135deg, #4ac3ff, #00d4aa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Zap size={12} color="#000" strokeWidth={2.5} />
            </div>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '14px', color: '#4b5563' }}>ChamaChain</span>
          </div>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {['Privacy', 'Terms', 'Support', 'Blog'].map(l => (
              <a key={l} href="#" style={{ color: '#4b5563', textDecoration: 'none', fontSize: '13px', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.target.style.color = '#9ca3af')}
                onMouseLeave={e => (e.target.style.color = '#4b5563')}
              >{l}</a>
            ))}
          </div>
          <p style={{ color: '#4b5563', fontSize: '13px' }}>
            © 2026 ChamaChain. Empowering savings groups.
          </p>
        </div>
      </footer>
    </div>
  )
}
