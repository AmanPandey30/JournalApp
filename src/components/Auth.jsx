import React, { useState, useRef, useCallback, useEffect } from 'react';
import api from '../api/api';

/* ── SVG Icons ─────────────────────────────────────────────────────── */
const IconUser  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconLock  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const IconArrow = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>;
const IconCheck = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;

/* ── Fake journal preview cards on left panel ──────────────────────── */
const PREVIEW_ENTRIES = [
  { title: 'Morning Reflections', date: 'Today · 3 min read', words: '420 words', color: '#7c3aed' },
  { title: 'A Week of Growth',    date: 'Yesterday · 5 min',  words: '680 words', color: '#6d28d9' },
  { title: 'What I Learned',      date: 'Mon, Apr 14 · 2 min', words: '310 words', color: '#5b21b6' },
];

function PreviewCard({ entry, style, delay }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 16, padding: '16px 18px',
      animation: `previewFloat 4s ease-in-out ${delay}s infinite alternate`,
      ...style,
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
        <div style={{ width:8, height:8, borderRadius:'50%', background: entry.color,
                      boxShadow:`0 0 8px ${entry.color}` }} />
        <span style={{ fontSize:11, color:'#6b7280', fontWeight:500 }}>{entry.date}</span>
      </div>
      <p style={{ fontSize:14, fontWeight:600, color:'#e2e8f0', marginBottom:8 }}>{entry.title}</p>
      <div style={{ height:2, background:`linear-gradient(90deg, ${entry.color}, transparent)`,
                    borderRadius:2, marginBottom:10 }} />
      <div style={{ display:'flex', gap:4, flexDirection:'column' }}>
        {[100, 80, 60].map((w,i) => (
          <div key={i} style={{ height:3, width:`${w}%`, background:'rgba(255,255,255,0.06)', borderRadius:2 }} />
        ))}
      </div>
      <div style={{ marginTop:10, fontSize:11, color:'#4b5563', fontWeight:500 }}>{entry.words}</div>
    </div>
  );
}

/* ── Stat badge ────────────────────────────────────────────────────── */
function StatBadge({ icon, label, val, style }) {
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:10,
      background:'rgba(255,255,255,0.04)',
      border:'1px solid rgba(255,255,255,0.07)',
      borderRadius:12, padding:'10px 14px',
      ...style,
    }}>
      <span style={{ fontSize:18 }}>{icon}</span>
      <div>
        <p style={{ fontSize:16, fontWeight:700, color:'#f9fafb', lineHeight:1 }}>{val}</p>
        <p style={{ fontSize:11, color:'#6b7280', marginTop:2, fontWeight:500 }}>{label}</p>
      </div>
    </div>
  );
}

export default function Auth({ onLoginSuccess }) {
  const [isLogin, setIsLogin]   = useState(true);
  const [userName, setUserName] = useState('');
  const [passWord, setPassWord] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [activeInput, setActiveInput] = useState('');

  /* ── 3D tilt ── */
  const cardRef = useRef(null);
  const raf     = useRef(null);

  const onMouseMove = useCallback((e) => {
    if (!cardRef.current) return;
    const r  = cardRef.current.getBoundingClientRect();
    const rx = -((e.clientY - r.top  - r.height/2) / (r.height/2)) * 6;
    const ry =  ((e.clientX - r.left - r.width/2)  / (r.width/2))  * 6;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      if (cardRef.current)
        cardRef.current.style.transform =
          `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(4px)`;
    });
  }, []);

  const onMouseLeave = useCallback(() => {
    cancelAnimationFrame(raf.current);
    if (cardRef.current)
      cardRef.current.style.transform =
        'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
  }, []);

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (isLogin) {
        const res = await api.post('/public/login', { userName, passWord });
        localStorage.setItem('token', res.data);
        localStorage.setItem('username', userName);
        setSuccess(true);
        setTimeout(() => onLoginSuccess(userName), 750);
      } else {
        await api.post('/public/signup', { userName, passWord });
        setSuccess(true);
        setTimeout(() => {
          setIsLogin(true); setSuccess(false); setUserName(''); setPassWord('');
        }, 900);
      }
    } catch (err) {
      setError(err.response?.data || 'Something went wrong. Is the backend running?');
    } finally { setLoading(false); }
  };

  const switchTab = (login) => { setIsLogin(login); setError(''); setSuccess(false); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .au-root {
          min-height: 100vh; display: flex;
          font-family: 'Inter', sans-serif; background: #080b12; color: #fff;
        }

        /* ══ LEFT ══ */
        .au-left {
          width: 52%; position: relative; overflow: hidden;
          display: flex; flex-direction: column;
          justify-content: space-between; padding: 52px 56px;
        }

        /* layered gradient bg */
        .au-left-bg {
          position: absolute; inset: 0; z-index: 0;
          background:
            radial-gradient(ellipse 90% 70% at 10% 0%, rgba(109,40,217,0.35) 0%, transparent 55%),
            radial-gradient(ellipse 70% 60% at 90% 90%, rgba(79,70,229,0.25) 0%, transparent 55%),
            radial-gradient(ellipse 60% 50% at 50% 50%, rgba(124,58,237,0.08) 0%, transparent 60%),
            #0d0f1a;
        }

        /* subtle grid */
        .au-left-grid {
          position: absolute; inset: 0; z-index: 1; pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 80%);
        }

        .au-left-content { position: relative; z-index: 2; }
        .au-left-footer  { position: relative; z-index: 2; }

        .au-logo {
          display: inline-flex; align-items:center; gap: 10px; margin-bottom: 48px;
        }
        .au-logo-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: linear-gradient(135deg, #7c3aed, #a78bfa);
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; font-weight: 900;
          box-shadow: 0 4px 20px rgba(124,58,237,0.4);
        }
        .au-logo-name {
          font-size: 18px; font-weight: 700; letter-spacing: -0.3px; color: #f9fafb;
        }

        .au-headline {
          font-size: 38px; font-weight: 800; line-height: 1.2;
          letter-spacing: -1px; color: #f9fafb; margin-bottom: 16px;
        }
        .au-headline em {
          font-style: normal;
          background: linear-gradient(135deg, #a78bfa 0%, #c084fc 50%, #818cf8 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .au-desc {
          font-size: 15px; color: #6b7280; line-height: 1.7; max-width: 360px;
          margin-bottom: 40px;
        }

        /* stat row */
        .au-stats { display: flex; gap: 10px; margin-bottom: 48px; flex-wrap: wrap; }

        /* preview cards stack */
        .au-preview {
          position: relative; height: 260px;
        }

        @keyframes previewFloat {
          from { transform: translateY(0px); }
          to   { transform: translateY(-8px); }
        }

        .au-left-footer-text {
          font-size: 12px; color: #374151; font-weight: 500;
        }
        .au-left-footer-text span { color: #6b7280; }

        /* ══ RIGHT ══ */
        .au-right {
          flex: 1; display: flex; align-items: center; justify-content: center;
          padding: 40px 48px; background: #080b12; position: relative; overflow: hidden;
        }
        /* ambient bg glow */
        .au-right::before {
          content: ''; position: absolute; inset: 0; pointer-events: none;
          background:
            radial-gradient(ellipse 55% 45% at 75% 25%, rgba(109,40,217,0.1) 0%, transparent 60%),
            radial-gradient(ellipse 40% 35% at 30% 80%, rgba(79,70,229,0.07) 0%, transparent 55%);
        }

        /* halo glow ring behind card */
        .au-card-wrap::before {
          content: ''; position: absolute; inset: -40px; border-radius: 40px; z-index: 0;
          background: radial-gradient(ellipse 70% 55% at 50% 50%, rgba(109,40,217,0.18) 0%, transparent 70%);
          filter: blur(24px); pointer-events: none;
          animation: haloBreath 4s ease-in-out infinite alternate;
        }
        @keyframes haloBreath {
          from { opacity: 0.6; transform: scale(0.96); }
          to   { opacity: 1;   transform: scale(1.04); }
        }

        /* 3-D wrapper */
        .au-card-wrap {
          width: 100%; max-width: 400px; position: relative; z-index: 1;
          transition: transform 0.12s ease; will-change: transform;
        }

        /* card */
        .au-card {
          background: linear-gradient(160deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 24px; padding: 38px 34px 30px;
          box-shadow:
            0 0 0 1px rgba(109,40,217,0.08),
            0 32px 96px rgba(0,0,0,0.75),
            inset 0 1px 0 rgba(255,255,255,0.08),
            inset 0 -1px 0 rgba(0,0,0,0.2);
          animation: cardSlide 0.55s cubic-bezier(0.16,1,0.3,1) both;
          position: relative; overflow: hidden; z-index: 1;
        }
        @keyframes cardSlide {
          from { opacity:0; transform: translateY(24px) scale(0.98); }
          to   { opacity:1; transform: translateY(0)   scale(1); }
        }

        /* animated gradient border top */
        .au-card::before {
          content: ''; position: absolute; top:0; left:0; right:0; height:1px;
          background: linear-gradient(90deg, transparent 5%, rgba(139,92,246,0.7) 35%,
                      rgba(192,132,252,0.5) 65%, transparent 95%);
          animation: borderShift 3.5s ease-in-out infinite alternate;
        }
        @keyframes borderShift {
          from { opacity: 0.6; background-position: 0% 50%; }
          to   { opacity: 1;   background-position: 100% 50%; }
        }

        /* inner top-left corner shine */
        .au-card::after {
          content: ''; position: absolute; top: 0; left: 0;
          width: 160px; height: 160px; border-radius: 24px; pointer-events: none;
          background: radial-gradient(circle at 0% 0%, rgba(167,139,250,0.08) 0%, transparent 65%);
        }

        /* heading */
        .au-card-h {
          font-size: 23px; font-weight: 800; color: #f1f5f9;
          letter-spacing: -0.5px; margin-bottom: 5px;
        }
        .au-card-sub { font-size: 13px; color: #6b7280; margin-bottom: 28px; line-height: 1.5; }

        /* sliding tab indicator */
        .au-tabs {
          position: relative; display: grid; grid-template-columns: 1fr 1fr;
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px; padding: 4px; margin-bottom: 26px; gap: 3px;
        }
        .au-tab-indicator {
          position: absolute; top: 4px; bottom: 4px;
          width: calc(50% - 5.5px);
          background: linear-gradient(135deg, #6d28d9, #8b5cf6);
          border-radius: 10px;
          transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1);
          box-shadow: 0 2px 12px rgba(109,40,217,0.45), 0 1px 0 rgba(255,255,255,0.1) inset;
          left: 4px;
        }
        .au-tab-indicator.right { transform: translateX(calc(100% + 3px)); }
        .au-tab {
          position: relative; z-index: 1; padding: 10px 0;
          font-size: 13px; font-weight: 600; border: none;
          border-radius: 10px; cursor: pointer;
          transition: color 0.2s; background: transparent;
          font-family: inherit; color: #6b7280;
        }
        .au-tab.active { color: #ede9fe; }
        .au-tab:not(.active):hover { color: #d1d5db; }

        /* field */
        .au-field { margin-bottom: 16px; }
        .au-label {
          display: flex; align-items: center; gap: 6px;
          font-size: 11.5px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.06em; color: #6b7280; margin-bottom: 8px;
          transition: color 0.15s;
        }
        .au-field.focused .au-label { color: #a78bfa; }
        .au-input-wrap { position: relative; }
        .au-icon {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          color: #4b5563; pointer-events: none; display: flex;
          transition: color 0.2s;
        }
        .au-field.focused .au-icon { color: #8b5cf6; }
        .au-input {
          width: 100%; padding: 13px 14px 13px 42px;
          background: rgba(0,0,0,0.35);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 12px; color: #f1f5f9; font-size: 14px;
          font-family: inherit; outline: none;
          transition: all 0.2s ease;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);
        }
        .au-input::placeholder { color: #374151; }
        .au-input:hover { border-color: rgba(255,255,255,0.15); background: rgba(0,0,0,0.4); }
        .au-input:focus {
          border-color: rgba(139,92,246,0.6);
          background: rgba(109,40,217,0.06);
          box-shadow: 0 0 0 3px rgba(109,40,217,0.15), inset 0 2px 4px rgba(0,0,0,0.2);
        }

        /* error */
        .au-error {
          display: flex; align-items: flex-start; gap: 9px;
          background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2);
          border-radius: 12px; padding: 12px 14px;
          color: #fca5a5; font-size: 13px; margin-top: 14px;
          animation: errIn 0.2s ease both;
        }
        @keyframes errIn {
          from { opacity:0; transform:translateY(-4px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .au-err-icon { color:#f87171; flex-shrink:0; margin-top:1px; }

        /* button */
        .au-btn {
          width: 100%; padding: 14px; margin-top: 22px;
          border: none; border-radius: 13px; cursor: pointer;
          font-size: 14.5px; font-weight: 700; font-family: inherit;
          display: flex; align-items: center; justify-content: center; gap: 9px;
          transition: all 0.2s ease; position: relative; overflow: hidden;
          background: linear-gradient(135deg, #5b21b6 0%, #7c3aed 50%, #8b5cf6 100%);
          color: #fff; letter-spacing: 0.01em;
          box-shadow:
            0 1px 0 rgba(255,255,255,0.15) inset,
            0 -1px 0 rgba(0,0,0,0.2) inset,
            0 8px 28px rgba(109,40,217,0.4);
        }
        /* shimmer sweep on hover */
        .au-btn::after {
          content: ''; position: absolute;
          top: 0; left: -100%; width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
          transition: left 0.4s ease;
        }
        .au-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow:
            0 1px 0 rgba(255,255,255,0.15) inset,
            0 -1px 0 rgba(0,0,0,0.2) inset,
            0 14px 36px rgba(109,40,217,0.55);
        }
        .au-btn:hover:not(:disabled)::after { left: 140%; }
        .au-btn:active:not(:disabled) { transform: translateY(0); }
        .au-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .au-btn.success {
          background: linear-gradient(135deg,#047857,#10b981) !important;
          box-shadow: 0 8px 24px rgba(16,185,129,0.35) !important;
        }

        /* spinner */
        .au-spin {
          width: 16px; height: 16px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.25); border-top-color: #fff;
          animation: spn 0.65s linear infinite; flex-shrink: 0;
        }
        @keyframes spn { to { transform: rotate(360deg); } }

        /* divider */
        .au-divider {
          display: flex; align-items: center; gap: 12px; margin: 20px 0 16px;
        }
        .au-divider hr { flex: 1; border: none; height: 1px; background: rgba(255,255,255,0.07); }
        .au-divider span {
          font-size: 11px; color: #374151; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.08em;
        }

        /* footer */
        .au-footer { text-align: center; font-size: 13px; color: #6b7280; }
        .au-footer button {
          background: none; border: none; cursor: pointer; color: #a78bfa;
          font-weight: 600; font-size: 13px; font-family: inherit; padding: 0;
          transition: color 0.15s; text-decoration: underline; text-decoration-color: rgba(167,139,250,0.3);
          text-underline-offset: 2px;
        }
        .au-footer button:hover { color: #c4b5fd; text-decoration-color: rgba(196,181,253,0.5); }
      `}</style>

      <div className="au-root">

        {/* ══ LEFT PANEL ══ */}
        <div className="au-left">
          <div className="au-left-bg" />
          <div className="au-left-grid" />

          <div className="au-left-content">
            {/* Logo */}
            <div className="au-logo">
              <div className="au-logo-icon">✦</div>
              <span className="au-logo-name">JournalAI</span>
            </div>

            {/* Headline */}
            <h1 className="au-headline">
              Your mind.<br />
              <em>Beautifully</em><br />
              organized.
            </h1>
            <p className="au-desc">
              A private space for your thoughts — with smart writing prompts, activity tracking, and live weather context.
            </p>

            {/* Stats */}
            <div className="au-stats">
              {[
                { icon:'📓', val:'∞',    label:'Entries'      },
                { icon:'🔥', val:'Streak',label:'Daily Tracker' },
                { icon:'📊', val:'Live',  label:'Analytics'    },
              ].map((s, i) => (
                <StatBadge key={i} {...s} style={{ animationDelay:`${i*0.12}s` }} />
              ))}
            </div>

            {/* Floating preview cards */}
            <div className="au-preview">
              {PREVIEW_ENTRIES.map((e, i) => (
                <PreviewCard key={i} entry={e}
                  delay={i * 1.2}
                  style={{
                    position: 'absolute',
                    width: i === 0 ? 280 : i === 1 ? 250 : 220,
                    left: i === 0 ? 0 : i === 1 ? 40 : 80,
                    top:  i === 0 ? 0 : i === 1 ? 70 : 148,
                    opacity: 1 - i * 0.18,
                    zIndex: 3 - i,
                    backdropFilter: 'blur(8px)',
                  }}
                />
              ))}
            </div>
          </div>

          <div className="au-left-footer">
            <p className="au-left-footer-text">
              <span>Personal journaling — private & secure.</span>
            </p>
          </div>
        </div>

        {/* ══ RIGHT PANEL ══ */}
        <div className="au-right"
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}>

          <div className="au-card-wrap" ref={cardRef}>
            <div className="au-card">

              <h2 className="au-card-h">
                {isLogin ? 'Sign in' : 'Create account'}
              </h2>
              <p className="au-card-sub">
                {isLogin
                  ? 'Enter your credentials to access your journal.'
                  : 'Choose a username and password to get started.'}
              </p>

              {/* Sliding tabs */}
              <div className="au-tabs">
                <div className={`au-tab-indicator ${isLogin ? '' : 'right'}`} />
                <button className={`au-tab ${isLogin  ? 'active':''}`} onClick={() => switchTab(true)}>Sign In</button>
                <button className={`au-tab ${!isLogin ? 'active':''}`} onClick={() => switchTab(false)}>Sign Up</button>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Username */}
                <div className={`au-field ${activeInput==='user'?'focused':''}`}>
                  <label className="au-label">Username</label>
                  <div className="au-input-wrap">
                    <span className="au-icon"><IconUser /></span>
                    <input className="au-input" type="text" placeholder="Your username"
                      value={userName} onChange={e => setUserName(e.target.value)}
                      onFocus={() => setActiveInput('user')}
                      onBlur={() => setActiveInput('')}
                      autoComplete="username" required />
                  </div>
                </div>

                {/* Password */}
                <div className={`au-field ${activeInput==='pass'?'focused':''}`}>
                  <label className="au-label">Password</label>
                  <div className="au-input-wrap">
                    <span className="au-icon"><IconLock /></span>
                    <input className="au-input" type="password" placeholder="Your password"
                      value={passWord} onChange={e => setPassWord(e.target.value)}
                      onFocus={() => setActiveInput('pass')}
                      onBlur={() => setActiveInput('')}
                      autoComplete={isLogin ? 'current-password' : 'new-password'} required />
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="au-error">
                    <span className="au-err-icon">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                    </span>
                    {error}
                  </div>
                )}

                {/* Button */}
                <button type="submit" disabled={loading || success}
                  className={`au-btn${success?' success':''}`}>
                  {loading
                    ? <><div className="au-spin" />{isLogin ? 'Signing in…' : 'Creating account…'}</>
                    : success
                    ? <><IconCheck />{isLogin ? 'Welcome back!' : 'Account created!'}</>
                    : <>{isLogin ? 'Sign in' : 'Create account'}<IconArrow /></>
                  }
                </button>
              </form>

              <div className="au-divider">
                <hr /><span>or</span><hr />
              </div>

              <div className="au-footer">
                {isLogin
                  ? <>No account yet? <button onClick={() => switchTab(false)}>Create one free →</button></>
                  : <>Already registered? <button onClick={() => switchTab(true)}>Sign in →</button></>}
              </div>

            </div>
          </div>
        </div>

      </div>
    </>
  );
}
