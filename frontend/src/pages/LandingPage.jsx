import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bot, ShieldCheck, Smartphone, Users, TrendingUp, Activity, Star } from 'lucide-react'

/* ─────────────────────────────────────────────────────────────────
   INJECT KEYFRAMES + FONTS
───────────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600&display=swap');

  @keyframes floatA {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    33%       { transform: translateY(-14px) rotate(1deg); }
    66%       { transform: translateY(-6px) rotate(-0.5deg); }
  }
  @keyframes floatB {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50%       { transform: translateY(-10px) rotate(-1deg); }
  }
  @keyframes orb1 {
    0%, 100% { transform: scale(1) translate(0, 0); opacity: 0.7; }
    50%       { transform: scale(1.18) translate(20px, -30px); opacity: 1; }
  }
  @keyframes orb2 {
    0%, 100% { transform: scale(1) translate(0, 0); opacity: 0.6; }
    50%       { transform: scale(1.12) translate(-25px, 20px); opacity: 0.9; }
  }
  @keyframes orb3 {
    0%, 100% { transform: scale(1); opacity: 0.4; }
    50%       { transform: scale(1.2); opacity: 0.6; }
  }
  @keyframes pulse-dot {
    0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.6); }
    50%       { box-shadow: 0 0 0 6px rgba(16,185,129,0); }
  }
  @keyframes shimmer-bar {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #0D0B1E;
    color: #F8FAFC;
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
    overflow-x: hidden;
  }

  .lp-wrapper {
    min-height: 100vh;
    background: #0D0B1E;
    color: #F8FAFC;
    font-family: 'DM Sans', sans-serif;
    position: relative;
    overflow-x: hidden;
  }

  /* Gradient text utility */
  .grad-text {
    background: linear-gradient(135deg, #0EA5E9 0%, #8B5CF6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`

/* ─────────────────────────────────────────────────────────────────
   GLASS HELPERS
───────────────────────────────────────────────────────────────── */
const glass = {
  background: 'rgba(255,255,255,0.06)',
  backdropFilter: 'blur(40px) saturate(180%)',
  WebkitBackdropFilter: 'blur(40px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '24px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
}

const glassSmall = {
  ...glass,
  borderRadius: '16px',
}

const glassPill = {
  background: 'rgba(255,255,255,0.06)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: '100px',
}

/* ─────────────────────────────────────────────────────────────────
   ANIMATION VARIANTS
───────────────────────────────────────────────────────────────── */
const fadeUp = (delay = 0) => ({
  hidden:  { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] } },
})

const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
}

const cardAnim = {
  hidden:  { opacity: 0, y: 48, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
}

/* ─────────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────────── */
const features = [
  {
    emoji: '🤖',
    Icon: Bot,
    color: '#8B5CF6',
    glow: 'rgba(139,92,246,0.25)',
    title: 'AI Credit Scoring',
    desc: 'Get a personalized credit score based on your contribution history. Fair, fast, and data-driven.',
  },
  {
    emoji: '🔐',
    Icon: ShieldCheck,
    color: '#0EA5E9',
    glow: 'rgba(14,165,233,0.25)',
    title: 'Blockchain Voting',
    desc: 'Every loan approval is recorded on-chain. Transparent, tamper-proof, and trustless.',
  },
  {
    emoji: '📱',
    Icon: Smartphone,
    color: '#10B981',
    glow: 'rgba(16,185,129,0.20)',
    title: 'M-Pesa Native',
    desc: 'Contribute and receive loans directly to your M-Pesa. One tap, instant confirmation.',
  },
]

const stats = [
  { value: '10,000+', label: 'Active Members',  Icon: Users },
  { value: 'KES 50M+', label: 'Total Saved',    Icon: TrendingUp },
  { value: '99.9%',   label: 'Platform Uptime', Icon: Activity },
]

const trustBadges = [
  { icon: '🔒', label: 'Blockchain Secured' },
  { icon: '🤖', label: 'AI Powered' },
  { icon: '📱', label: 'M-Pesa Native' },
]

const memberColors = ['#8B5CF6', '#0EA5E9', '#10B981']
const memberInitials = ['AM', 'JW', 'FO']

/* ─────────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  // Inject styles once
  useEffect(() => {
    const el = document.createElement('style')
    el.id = '__lp_styles'
    el.textContent = GLOBAL_CSS
    if (!document.getElementById('__lp_styles')) document.head.appendChild(el)
    return () => el.remove()
  }, [])

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="lp-wrapper">

      {/* ══════════════════════════════════════════════
          ANIMATED BACKGROUND ORBS
      ══════════════════════════════════════════════ */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        {/* Orb 1 — Purple top-left */}
        <div style={{
          position: 'absolute', top: '-10%', left: '-5%',
          width: '680px', height: '680px', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(139,92,246,0.22) 0%, transparent 65%)',
          animation: 'orb1 12s ease-in-out infinite',
        }} />
        {/* Orb 2 — Blue bottom-right */}
        <div style={{
          position: 'absolute', bottom: '-15%', right: '-10%',
          width: '800px', height: '800px', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(14,165,233,0.18) 0%, transparent 65%)',
          animation: 'orb2 15s ease-in-out infinite',
        }} />
        {/* Orb 3 — Subtle teal center */}
        <div style={{
          position: 'absolute', top: '45%', left: '40%',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(16,185,129,0.08) 0%, transparent 70%)',
          animation: 'orb3 18s ease-in-out infinite',
        }} />
      </div>

      {/* ══════════════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════════════ */}
      <motion.nav
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
          height: '70px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 48px',
          background: 'rgba(13,11,30,0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#0EA5E9', fontSize: '22px', lineHeight: 1 }}>◈</span>
          <span style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800, fontSize: '20px', color: '#F8FAFC', letterSpacing: '-0.3px',
          }}>ChamaChain</span>
        </Link>

        {/* Nav actions */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <button style={{
              ...glassPill,
              color: '#94A3B8', fontFamily: "'DM Sans', sans-serif",
              fontWeight: 500, fontSize: '14px', padding: '10px 22px',
              cursor: 'pointer', transition: 'all 0.2s',
              border: '1px solid rgba(255,255,255,0.10)',
            }}
              onMouseEnter={e => { e.currentTarget.style.color = '#F8FAFC'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)' }}
            >Sign In</button>
          </Link>
          <Link to="/register" style={{ textDecoration: 'none' }}>
            <button style={{
              background: 'linear-gradient(135deg, #0EA5E9, #0284C7)',
              color: '#fff', border: 'none', borderRadius: '100px',
              padding: '10px 24px', fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600, fontSize: '14px', cursor: 'pointer',
              boxShadow: '0 0 24px rgba(14,165,233,0.4)',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 36px rgba(14,165,233,0.65)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 24px rgba(14,165,233,0.4)'; e.currentTarget.style.transform = 'translateY(0)' }}
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
        padding: '130px 24px 80px',
      }}>

        {/* Badge */}
        <motion.div
          variants={fadeUp(0)}
          initial="hidden" animate="visible"
          style={{ marginBottom: '28px' }}
        >
          <div style={{
            ...glassPill,
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '8px 20px',
            fontSize: '13px', color: '#94A3B8', fontWeight: 500,
          }}>
            <span>🇰🇪</span> Built for Kenya
          </div>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          variants={fadeUp(0.1)}
          initial="hidden" animate="visible"
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(44px, 6.5vw, 72px)',
            lineHeight: 1.06, letterSpacing: '-2.5px',
            color: '#F8FAFC', marginBottom: '20px',
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
            fontSize: '18px', color: '#64748B',
            letterSpacing: '0.5px', marginBottom: '44px',
          }}
        >
          AI-powered · Blockchain-secured · M-Pesa native
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={fadeUp(0.3)}
          initial="hidden" animate="visible"
          style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '36px' }}
        >
          <Link to="/register" style={{ textDecoration: 'none' }}>
            <button style={{
              background: 'linear-gradient(135deg, #0EA5E9, #7C3AED)',
              color: '#fff', border: 'none', borderRadius: '100px',
              padding: '14px 34px', fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700, fontSize: '15px', cursor: 'pointer',
              boxShadow: '0 0 32px rgba(14,165,233,0.45), 0 0 60px rgba(139,92,246,0.2)',
              transition: 'all 0.25s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 0 48px rgba(14,165,233,0.6), 0 0 80px rgba(139,92,246,0.3)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 32px rgba(14,165,233,0.45), 0 0 60px rgba(139,92,246,0.2)' }}
            >Start Your Chama →</button>
          </Link>
          <button
            onClick={scrollToFeatures}
            style={{
              ...glassPill,
              color: '#94A3B8', fontFamily: "'DM Sans', sans-serif",
              fontWeight: 500, fontSize: '15px', padding: '14px 30px',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#F8FAFC'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)' }}
          >Watch Demo</button>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          variants={fadeUp(0.4)}
          initial="hidden" animate="visible"
          style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '80px' }}
        >
          {trustBadges.map(b => (
            <div key={b.label} style={{
              ...glassPill,
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '6px 14px', fontSize: '12px', color: '#64748B', fontWeight: 500,
            }}>
              <span>{b.icon}</span> {b.label}
            </div>
          ))}
        </motion.div>

        {/* ── FLOATING HERO VISUAL ── */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.93 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: 'relative', width: '100%', maxWidth: '520px', margin: '0 auto' }}
        >
          {/* Main dashboard card */}
          <div style={{
            ...glass,
            padding: '28px 30px 32px',
            animation: 'floatA 6s ease-in-out infinite',
            position: 'relative',
          }}>
            {/* Card header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#475569', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>Savings Group</div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '18px', color: '#F8FAFC' }}>Maasai Savings Group</div>
              </div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: 'rgba(16,185,129,0.15)',
                border: '1px solid rgba(16,185,129,0.25)',
                borderRadius: '100px', padding: '4px 12px',
                fontSize: '12px', color: '#10B981', fontWeight: 600,
              }}>
                <div style={{
                  width: '6px', height: '6px', borderRadius: '50%', background: '#10B981',
                  animation: 'pulse-dot 1.8s ease-in-out infinite',
                }} />
                Active
              </div>
            </div>

            {/* Balance */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '12px', color: '#475569', marginBottom: '6px', fontWeight: 500 }}>Group Balance</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '36px', letterSpacing: '-1px' }}>
                <span className="grad-text">KES 127,450</span>
              </div>
            </div>

            {/* Members */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#475569', marginBottom: '8px', fontWeight: 500 }}>Members</div>
                <div style={{ display: 'flex', gap: '-4px' }}>
                  {memberInitials.map((init, i) => (
                    <div key={i} style={{
                      width: '34px', height: '34px', borderRadius: '50%',
                      background: memberColors[i],
                      border: '2px solid #0D0B1E',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', fontWeight: 700, color: '#fff',
                      marginLeft: i > 0 ? '-8px' : '0',
                      boxShadow: `0 0 10px ${memberColors[i]}50`,
                    }}>{init}</div>
                  ))}
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.06)',
                    border: '2px solid rgba(255,255,255,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', fontWeight: 600, color: '#64748B',
                    marginLeft: '-8px',
                  }}>+9</div>
                </div>
              </div>

              {/* Quick stats */}
              <div style={{ display: 'flex', gap: '16px' }}>
                {[{ label: 'Next Payout', value: '5 days' }, { label: 'This Month', value: '+KES 4,200' }].map(s => (
                  <div key={s.label} style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: '#475569', marginBottom: '2px' }}>{s.label}</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#F8FAFC' }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Thin shimmer bar at bottom */}
            <div style={{ marginTop: '20px', height: '3px', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: '100%',
                background: 'linear-gradient(90deg, transparent 0%, #0EA5E9 30%, #8B5CF6 60%, transparent 100%)',
                backgroundSize: '200% auto',
                animation: 'shimmer-bar 2.5s linear infinite',
              }} />
            </div>
          </div>

          {/* Credit score card (overlapping, floating) */}
          <div style={{
            ...glassSmall,
            position: 'absolute',
            bottom: '-36px',
            right: '-32px',
            width: '220px',
            padding: '18px 20px',
            animation: 'floatB 5s ease-in-out infinite',
            animationDelay: '1.5s',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Star size={14} color="#F59E0B" fill="#F59E0B" />
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8' }}>Your Credit Score</span>
            </div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '30px', marginBottom: '4px' }}>
              <span className="grad-text">847</span>
            </div>
            <div style={{ fontSize: '11px', color: '#10B981', fontWeight: 600, marginBottom: '10px' }}>Low Risk · Excellent</div>
            {/* Score bar */}
            <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: '84%', borderRadius: '3px',
                background: 'linear-gradient(90deg, #0EA5E9, #8B5CF6)',
                boxShadow: '0 0 10px rgba(14,165,233,0.5)',
              }} />
            </div>
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════
          FEATURES SECTION
      ══════════════════════════════════════════════ */}
      <section id="features" style={{ position: 'relative', zIndex: 10, padding: '160px 24px 100px', maxWidth: '1140px', margin: '0 auto' }}>
        {/* Heading */}
        <motion.div
          variants={fadeUp(0)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          style={{ textAlign: 'center', marginBottom: '64px' }}
        >
          <div style={{
            ...glassPill,
            display: 'inline-flex', padding: '6px 18px', marginBottom: '20px',
            fontSize: '11px', fontWeight: 700, letterSpacing: '2.5px',
            color: '#0EA5E9', textTransform: 'uppercase',
          }}>
            Why ChamaChain
          </div>
          <h2 style={{
            fontFamily: "'Syne', sans-serif", fontWeight: 800,
            fontSize: 'clamp(30px, 4vw, 48px)', letterSpacing: '-1.5px',
            color: '#F8FAFC', marginBottom: '16px',
          }}>Everything your chama needs</h2>
          <p style={{ color: '#475569', fontSize: '17px', maxWidth: '500px', margin: '0 auto', lineHeight: 1.7 }}>
            Built from the ground up for Kenyan savings groups — where community trust meets blockchain transparency.
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}
        >
          {features.map(f => (
            <motion.div
              key={f.title}
              variants={cardAnim}
              style={{
                ...glass,
                padding: '36px 32px',
                cursor: 'default',
                transition: 'all 0.3s ease',
              }}
              whileHover={{ y: -6, boxShadow: `0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1), 0 0 40px ${f.glow}` }}
            >
              {/* Icon */}
              <div style={{
                width: '64px', height: '64px', borderRadius: '20px',
                background: `${f.glow}`,
                border: `1px solid ${f.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '28px', marginBottom: '24px',
                boxShadow: `0 0 30px ${f.glow}`,
              }}>
                {f.emoji}
              </div>

              {/* Colored accent bar */}
              <div style={{
                width: '36px', height: '3px', borderRadius: '2px',
                background: `linear-gradient(90deg, ${f.color}, transparent)`,
                marginBottom: '16px',
                boxShadow: `0 0 12px ${f.color}`,
              }} />

              <h3 style={{
                fontFamily: "'Syne', sans-serif", fontWeight: 700,
                fontSize: '20px', color: '#F8FAFC', marginBottom: '10px',
              }}>{f.title}</h3>
              <p style={{ color: '#64748B', fontSize: '15px', lineHeight: 1.75 }}>{f.desc}</p>

              <div style={{
                marginTop: '28px', display: 'inline-flex', alignItems: 'center', gap: '6px',
                color: f.color, fontSize: '13px', fontWeight: 600,
                background: `${f.glow}`,
                padding: '6px 14px', borderRadius: '100px',
                border: `1px solid ${f.color}30`,
              }}>
                Explore <span>→</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════
          STATS SECTION
      ══════════════════════════════════════════════ */}
      <section style={{ position: 'relative', zIndex: 10, padding: '20px 24px 100px', maxWidth: '1140px', margin: '0 auto' }}>
        {/* Divider */}
        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)', marginBottom: '80px' }} />

        <motion.div
          variants={fadeUp(0)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          style={{ textAlign: 'center', marginBottom: '48px' }}
        >
          <div style={{
            ...glassPill,
            display: 'inline-flex', padding: '6px 18px', marginBottom: '16px',
            fontSize: '11px', fontWeight: 700, letterSpacing: '2.5px',
            color: '#8B5CF6', textTransform: 'uppercase',
          }}>
            By the numbers
          </div>
          <h2 style={{
            fontFamily: "'Syne', sans-serif", fontWeight: 800,
            fontSize: 'clamp(28px, 4vw, 44px)', letterSpacing: '-1px', color: '#F8FAFC',
          }}>Trusted across Kenya</h2>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}
        >
          {stats.map(s => {
            const Icon = s.Icon
            return (
              <motion.div
                key={s.label}
                variants={cardAnim}
                style={{
                  ...glass,
                  padding: '40px 32px',
                  textAlign: 'center',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
                }}
                whileHover={{ y: -4, boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(14,165,233,0.1), inset 0 1px 0 rgba(255,255,255,0.1)' }}
              >
                <div style={{
                  width: '48px', height: '48px', borderRadius: '14px', marginBottom: '4px',
                  background: 'rgba(14,165,233,0.12)',
                  border: '1px solid rgba(14,165,233,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={20} color="#0EA5E9" />
                </div>
                <div className="grad-text" style={{
                  fontFamily: "'Syne', sans-serif", fontWeight: 800,
                  fontSize: '44px', letterSpacing: '-1.5px', lineHeight: 1,
                }}>{s.value}</div>
                <div style={{ color: '#475569', fontSize: '15px', fontWeight: 500 }}>{s.label}</div>
              </motion.div>
            )
          })}
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════
          CTA BANNER
      ══════════════════════════════════════════════ */}
      <section style={{ position: 'relative', zIndex: 10, padding: '0 24px 100px', maxWidth: '1140px', margin: '0 auto' }}>
        <motion.div
          variants={fadeUp(0)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          style={{
            ...glass,
            padding: '80px 48px',
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(14,165,233,0.10) 0%, rgba(139,92,246,0.10) 100%)',
            border: '1px solid rgba(14,165,233,0.18)',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Decorative glow blob */}
          <div style={{
            position: 'absolute', top: '-60%', left: '50%', transform: 'translateX(-50%)',
            width: '500px', height: '400px', borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(14,165,233,0.18) 0%, rgba(139,92,246,0.12) 40%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              ...glassPill,
              display: 'inline-flex', padding: '6px 18px', marginBottom: '24px',
              fontSize: '11px', fontWeight: 700, letterSpacing: '2.5px',
              color: '#0EA5E9', textTransform: 'uppercase',
            }}>
              Get started today
            </div>
            <h2 style={{
              fontFamily: "'Syne', sans-serif", fontWeight: 800,
              fontSize: 'clamp(28px, 4vw, 48px)', letterSpacing: '-1.5px',
              color: '#F8FAFC', marginBottom: '18px',
            }}>
              Your chama deserves better.
            </h2>
            <p style={{ color: '#475569', fontSize: '17px', maxWidth: '440px', margin: '0 auto 44px', lineHeight: 1.75 }}>
              Join thousands of groups already saving smarter. Free to start, powerful from day one.
            </p>
            <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" style={{ textDecoration: 'none' }}>
                <button style={{
                  background: 'linear-gradient(135deg, #0EA5E9, #7C3AED)',
                  color: '#fff', border: 'none', borderRadius: '100px',
                  padding: '14px 36px', fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 700, fontSize: '15px', cursor: 'pointer',
                  boxShadow: '0 0 32px rgba(14,165,233,0.4)',
                  transition: 'all 0.25s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 0 48px rgba(14,165,233,0.6)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 32px rgba(14,165,233,0.4)' }}
                >Create Your Chama</button>
              </Link>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <button style={{
                  ...glassPill,
                  color: '#94A3B8', fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 500, fontSize: '15px', padding: '14px 32px',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#F8FAFC' }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#94A3B8' }}
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
            <span style={{ color: '#0EA5E9', fontSize: '18px' }}>◈</span>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '16px', color: '#334155' }}>ChamaChain</span>
          </div>
          <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {['Privacy', 'Terms', 'Support', 'Blog'].map(l => (
              <a key={l} href="#" style={{ color: '#334155', textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.target.style.color = '#94A3B8')}
                onMouseLeave={e => (e.target.style.color = '#334155')}
              >{l}</a>
            ))}
          </div>
          <p style={{ color: '#334155', fontSize: '14px' }}>
            © 2026 ChamaChain — Empowering Kenyan savings groups. 🇰🇪
          </p>
        </div>
      </footer>
    </div>
  )
}
