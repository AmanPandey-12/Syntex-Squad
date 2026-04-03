import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Leaf, Mail, Lock, ArrowRight, User, Phone,
  Eye, EyeOff, CheckCircle2, ChevronLeft
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db, googleProvider } from '../firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // States: 'login' | 'register' | 'phone'
  const [authMode, setAuthMode] = useState('login');
  const [showPass, setShowPass] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Initialize invisible reCAPTCHA for Phone Auth
  useEffect(() => {
    if (!checkingAuth && auth && !window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => { }
        });
        window.recaptchaVerifier.render();
      } catch (err) {
        console.error("Recaptcha init error:", err);
      }
    }
  }, [checkingAuth]);

  useEffect(() => {
    if (!auth) {
      setCheckingAuth(false);
      setError('Firebase configuration is missing. Please check your environment variables (.env).');
      return;
    }
    const unsub = auth.onAuthStateChanged(user => {
      if (user) window.location.href = '/dashboard';
      else setCheckingAuth(false);
    });
    return unsub;
  }, []);

  if (checkingAuth) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="lp-spinner" style={{ margin: '0 auto 16px' }} />
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#16a34a', fontWeight: 600 }}>Verifying session…</p>
      </div>
      <style>{`
        .lp-spinner { width:36px; height:36px; border-radius:50%; border:3px solid #e5e7eb; border-top-color:#16a34a; animation:lp-spin .7s linear infinite; }
        @keyframes lp-spin { to { transform:rotate(360deg); } }
      `}</style>
    </div>
  );

  const syncUserToDb = async (user, extraData = {}) => {
    const userDocRef = doc(db, 'users', user.uid);
    const userDocSnap = await getDoc(userDocRef);
    if (!userDocSnap.exists()) {
      await setDoc(userDocRef, {
        uid: user.uid,
        name: extraData.name || user.displayName || 'Farmer',
        email: user.email || '',
        phone: user.phoneNumber || extraData.phone || '',
        location: '',
        photoURL: user.photoURL || '',
        role: 'Farm Manager',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }
  };

  const handleEmailAuth = async e => {
    e.preventDefault();
    if (!auth || !db) { setError('Firebase is not configured.'); return; }
    setLoading(true); setError('');
    try {
      if (authMode === 'register') {
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        await syncUserToDb(user, { name: name.trim() });
      } else {
        const { user } = await signInWithEmailAndPassword(auth, email, password);
        await syncUserToDb(user);
      }
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.message.replace('Firebase: ', '').replace(/\(auth\/.*?\)\.?/, '').trim());
    } finally { setLoading(false); }
  };

  const handleSendOtp = async e => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);
      setConfirmationResult(confirmation);
    } catch (err) {
      setError('Failed to send OTP. Ensure phone format is correct (e.g. +91XXXXXXXXXX) and Firebase Phone Auth is enabled.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async e => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { user } = await confirmationResult.confirm(otp);
      await syncUserToDb(user, { phone });
      window.location.href = '/dashboard';
    } catch (err) {
      setError('Invalid OTP code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true); setError('');
    try {
      const { user } = await signInWithPopup(auth, googleProvider);

      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        uid: user.uid,
        name: user.displayName || 'Farmer',
        email: user.email || '',
        photoURL: user.photoURL || '',
        updatedAt: new Date().toISOString()
      }, { merge: true });

      await syncUserToDb(user);
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.message.replace('Firebase: ', '').replace(/\(auth\/.*?\)\.?/, '').trim());
    } finally { setLoading(false); }
  };

  const switchAuthMode = (mode) => {
    setAuthMode(mode);
    setError('');
    setConfirmationResult(null);
    setOtp('');
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; background: #ffffff; color: #0f172a; overflow-x: hidden; }

        /* ── layout ── */
        .lp-container { display: flex; flex-direction: row-reverse; min-height: 100vh; }
        
        /* ── left section (form) ── */
        .lp-left { flex: 1; display: flex; flex-direction: column; justify-content: center; position: relative; padding: 40px 24px; background: #f8fafc; overflow: hidden; }
        
        /* 3D Floating Glassmorphism Orbs */
        .lp-left::before { content: ''; position: absolute; top: -10%; left: -10%; width: 50vw; height: 50vw; max-width: 600px; max-height: 600px; background: radial-gradient(circle, rgba(74, 222, 128, 0.35) 0%, transparent 60%); border-radius: 50%; filter: blur(60px); animation: floatOrb 12s infinite ease-in-out; pointer-events: none; z-index: 1; }
        .lp-left::after { content: ''; position: absolute; bottom: -10%; right: -10%; width: 40vw; height: 40vw; max-width: 500px; max-height: 500px; background: radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 60%); border-radius: 50%; filter: blur(60px); animation: floatOrb 15s infinite reverse ease-in-out; pointer-events: none; z-index: 1; }
        @keyframes floatOrb {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(30px) scale(1.05); }
        }

        .lp-form-wrapper {
          width: 100%; max-width: 440px; margin: 0 auto; position: relative; z-index: 10;
          background: rgba(255, 255, 255, 0.55);
          backdrop-filter: blur(32px);
          -webkit-backdrop-filter: blur(32px);
          border: 1px solid rgba(255, 255, 255, 0.9);
          border-radius: 28px;
          padding: 32px;
          box-shadow: 0 30px 60px -12px rgba(22, 163, 74, 0.15), 0 0 0 1px rgba(255,255,255,1) inset;
        }
        @media(max-width: 640px) {
          .lp-form-wrapper { padding: 32px 24px; border-radius: 24px; }
          .lp-left { padding: 20px 16px; }
        }
        
        /* ── right section (visual) ── */
        .lp-right { flex: 1; display: none; position: relative; overflow: hidden; background: linear-gradient(135deg, #064e3b 0%, #022c22 100%); }
        @media(min-width: 1024px) {
          .lp-right { display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 60px; }
        }
        
        /* Geometric Pattern Overlay */
        .lp-right::before {
          content: ''; position: absolute; inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.06) 1.5px, transparent 1.5px), radial-gradient(rgba(255,255,255,0.06) 1.5px, transparent 1.5px);
          background-size: 32px 32px; background-position: 0 0, 16px 16px; pointer-events: none; opacity: 0.8;
        }

        .lp-right-content {
          position: relative; z-index: 2; width: 100%; max-width: 520px; color: #ffffff;
        }

        .lp-right-badge { 
          display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; 
          background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); 
          border-radius: 100px; font-size: 13px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 32px; backdrop-filter: blur(8px);
        }

        .lp-right-title { font-family: 'Playfair Display', serif; font-size: clamp(2.5rem, 4vw, 3.5rem); font-weight: 800; line-height: 1.1; margin-bottom: 24px; }
        .lp-right-title span { color: #4ade80; font-style: italic; }
        .lp-right-desc { font-size: 1.125rem; line-height: 1.6; color: #a7f3d0; font-weight: 400; max-width: 440px; margin-bottom: 48px; }
        
        .lp-stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .lp-stat { padding-left: 20px; border-left: 2px solid rgba(74,222,128,0.4); }
        .lp-stat-val { font-size: 1.5rem; font-weight: 700; color: #ffffff; margin-bottom: 4px; font-family: 'Playfair Display', serif; }
        .lp-stat-lbl { font-size: 0.875rem; color: #a7f3d0; font-weight: 500; }

        /* ── branding ── */
        .lp-brand-mobile { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; justify-content: center; }
        @media(min-width: 1024px) {
          .lp-brand-mobile { justify-content: flex-start; margin-bottom: 24px; }
        }
        .lp-brand-icon { width: 36px; height: 36px; background: #16a34a; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 4px 12px rgba(22,163,74,0.3); }
        .lp-brand-name { font-size: 20px; font-weight: 800; letter-spacing: -0.02em; color: #022c22; }

        /* ── form typography ── */
        .lp-heading { font-size: 28px; font-weight: 800; color: #0f172a; margin-bottom: 4px; letter-spacing: -0.03em; }
        .lp-subheading { font-size: 14px; color: #64748b; font-weight: 400; margin-bottom: 20px; line-height: 1.5; }

        /* ── tabs ── */
        .lp-tabs { display: flex; background: #f1f5f9; padding: 4px; border-radius: 12px; margin-bottom: 20px; }
        .lp-tab { flex: 1; padding: 10px; text-align: center; font-size: 13px; font-weight: 600; color: #64748b; background: transparent; border: none; border-radius: 8px; cursor: pointer; transition: all 0.2s ease; }
        .lp-tab:hover:not(.active) { color: #0f172a; }
        .lp-tab.active { background: #ffffff; color: #0f172a; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }

        /* ── inputs ── */
        .lp-field { margin-bottom: 14px; }
        .lp-label { display: block; font-size: 12.5px; font-weight: 600; color: #334155; margin-bottom: 6px; }
        .lp-input-wrap { position: relative; }
        .lp-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #94a3b8; pointer-events: none; transition: color 0.2s; }
        .lp-input {
          width: 100%; padding: 12px 14px 12px 42px;
          background: #ffffff; border: 1px solid #cbd5e1;
          border-radius: 12px; font-size: 14.5px; font-family: inherit;
          color: #0f172a; outline: none; font-weight: 500;
          transition: all 0.2s ease;
          box-shadow: 0 1px 2px rgba(0,0,0,0.03);
        }
        .lp-input:hover { border-color: #94a3b8; }
        .lp-input:focus { border-color: #16a34a; box-shadow: 0 0 0 4px rgba(22,163,74,0.1); }
        .lp-input:focus + .lp-icon, .lp-input-wrap:focus-within .lp-icon { color: #16a34a; }
        .lp-input::placeholder { color: #94a3b8; font-weight: 400; }
        
        .lp-pass-toggle { position: absolute; right: 16px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #94a3b8; transition: color 0.2s; }
        .lp-pass-toggle:hover { color: #475569; }

        /* ── buttons ── */
        .lp-btn-primary {
          width: 100%; padding: 12px; background: #16a34a; color: #ffffff;
          border: none; border-radius: 12px; font-size: 14.5px; font-weight: 600;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: all 0.2s ease; box-shadow: 0 4px 12px rgba(22,163,74,0.2);
        }
        .lp-btn-primary:hover:not(:disabled) { background: #15803d; transform: translateY(-1px); box-shadow: 0 6px 16px rgba(22,163,74,0.3); }
        .lp-btn-primary:disabled { background: #94a3b8; cursor: not-allowed; transform: none; box-shadow: none; }

        .lp-btn-social {
          width: 100%; padding: 12px; background: #ffffff; color: #334155;
          border: 1px solid #cbd5e1; border-radius: 12px; font-size: 13.5px; font-weight: 600;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: all 0.2s ease; box-shadow: 0 1px 2px rgba(0,0,0,0.03);
        }
        .lp-btn-social:hover { background: #f8fafc; border-color: #94a3b8; }
        .lp-btn-social img { width: 18px; height: 18px; object-fit: contain; }

        /* ── helpers ── */
        .lp-divider { display: flex; align-items: center; margin: 20px 0; }
        .lp-divider::before, .lp-divider::after { content: ''; flex: 1; height: 1px; background: #e2e8f0; }
        .lp-divider span { padding: 0 16px; font-size: 12px; font-weight: 500; color: #64748b; }

        .lp-error { display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; margin-bottom: 20px; }
        .lp-error-text { font-size: 13px; color: #b91c1c; font-weight: 500; line-height: 1.4; }

        .lp-footer-link { margin-top: 24px; text-align: center; font-size: 14px; color: #64748b; }
        .lp-footer-link button { background: none; border: none; color: #16a34a; font-weight: 600; font-size: inherit; cursor: pointer; margin-left: 6px; }
        .lp-footer-link button:hover { color: #15803d; text-decoration: underline; }

        .lp-nav-back { position: absolute; top: 32px; left: 32px; display: inline-flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.7); text-decoration: none; transition: color 0.2s; z-index: 50; }
        .lp-nav-back:hover { color: #ffffff; }
        .lp-nav-back-mobile { display: inline-flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 600; color: #64748b; text-decoration: none; margin-bottom: 32px; }
        @media(min-width: 1024px) { .lp-nav-back-mobile { display: none; } }
      `}</style>

      {/* Invisible Recaptcha target for Phone Auth */}
      <div id="recaptcha-container"></div>

      <div className="lp-container">

        {/* ── LEFT: FORM ── */}
        <div className="lp-left">
          <motion.div
            className="lp-form-wrapper"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Link to="/" className="lp-nav-back-mobile">
              <ChevronLeft size={18} /> Back to home
            </Link>

            <div className="lp-brand-mobile">
              <img src="/logo.png" alt="KrishiAI Logo" style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'cover', boxShadow: '0 4px 12px rgba(22,163,74,0.3)' }} />
              <span className="lp-brand-name" style={{ fontSize: 22, marginLeft: 2 }}>KrishiAI</span>
            </div>

            <h1 className="lp-heading">
              {authMode === 'register' ? 'Create an account' : 'Welcome back'}
            </h1>
            <p className="lp-subheading">
              {authMode === 'register'
                ? 'Join thousands of farmers tracking crops with AI.'
                : 'Enter your credentials to access your dashboard.'}
            </p>

            <AnimatePresence>
              {error && (
                <motion.div className="lp-error" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  <div style={{ background: '#ef4444', height: 6, width: 6, borderRadius: '50%', marginTop: 7, flexShrink: 0 }} />
                  <p className="lp-error-text">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {authMode !== 'register' && (
              <div className="lp-tabs">
                <button
                  className={`lp-tab ${authMode === 'login' ? 'active' : ''}`}
                  onClick={() => switchAuthMode('login')}
                  type="button"
                >
                  Email
                </button>
                <button
                  className={`lp-tab ${authMode === 'phone' ? 'active' : ''}`}
                  onClick={() => switchAuthMode('phone')}
                  type="button"
                >
                  Phone Number
                </button>
              </div>
            )}

            <AnimatePresence mode="wait">
              {/* EMAIL / REGISTER */}
              {(authMode === 'login' || authMode === 'register') && (
                <motion.form
                  key="email-form"
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}
                  onSubmit={handleEmailAuth}
                >
                  {authMode === 'register' && (
                    <div className="lp-field">
                      <label className="lp-label">Full Name</label>
                      <div className="lp-input-wrap">
                        <User size={18} className="lp-icon" />
                        <input className="lp-input" type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required />
                      </div>
                    </div>
                  )}

                  <div className="lp-field">
                    <label className="lp-label">Email Address</label>
                    <div className="lp-input-wrap">
                      <Mail size={18} className="lp-icon" />
                      <input className="lp-input" type="email" placeholder="you@domain.com" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                  </div>

                  <div className="lp-field">
                    <label className="lp-label">Password</label>
                    <div className="lp-input-wrap">
                      <Lock size={18} className="lp-icon" />
                      <input className="lp-input" type={showPass ? 'text' : 'password'} placeholder="Min. 8 characters" value={password} onChange={e => setPassword(e.target.value)} required style={{ paddingRight: 46 }} />
                      <button type="button" className="lp-pass-toggle" onClick={() => setShowPass(p => !p)}>
                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {authMode === 'login' && (
                      <div style={{ textAlign: 'right', marginTop: 8 }}>
                        <a href="#" style={{ fontSize: 13, color: '#16a34a', fontWeight: 600, textDecoration: 'none' }}>Forgot password?</a>
                      </div>
                    )}
                  </div>

                  <button type="submit" className="lp-btn-primary" disabled={loading}>
                    {loading ? 'Processing...' : (authMode === 'register' ? 'Create Account' : 'Sign In')}
                  </button>
                </motion.form>
              )}

              {/* PHONE FORM */}
              {authMode === 'phone' && !confirmationResult && (
                <motion.form
                  key="phone-form"
                  initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}
                  onSubmit={handleSendOtp}
                >
                  <div className="lp-field">
                    <label className="lp-label">Mobile Number</label>
                    <div className="lp-input-wrap">
                      <Phone size={18} className="lp-icon" />
                      <input className="lp-input" type="tel" placeholder="+91 98765 43210" value={phone} onChange={e => setPhone(e.target.value)} required />
                    </div>
                  </div>

                  <button type="submit" className="lp-btn-primary" disabled={loading}>
                    {loading ? 'Sending OTP...' : 'Continue with Phone'}
                  </button>
                </motion.form>
              )}

              {/* VERIFY OTP */}
              {authMode === 'phone' && confirmationResult && (
                <motion.form
                  key="otp-form"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
                  onSubmit={handleVerifyOtp}
                >
                  <div className="lp-field">
                    <label className="lp-label">Enter 6-Digit Code</label>
                    <div className="lp-input-wrap">
                      <Lock size={18} className="lp-icon" />
                      <input className="lp-input" type="text" placeholder="------" value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} required style={{ letterSpacing: '0.2em', fontSize: 18 }} />
                    </div>
                  </div>

                  <button type="submit" className="lp-btn-primary" disabled={loading}>
                    {loading ? 'Verifying...' : <><CheckCircle2 size={18} /> Verify Code</>}
                  </button>
                  <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <button type="button" onClick={() => { setConfirmationResult(null); setOtp(''); }} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 13, cursor: 'pointer', fontWeight: 500, textDecoration: 'underline' }}>
                      Change phone number
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="lp-divider">
              <span>Or continue with</span>
            </div>

            <button className="lp-btn-social" onClick={handleGoogle} disabled={loading} type="button">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
              Google
            </button>

            <p className="lp-footer-link">
              {authMode === 'register' ? 'Already have an account?' : "Don't have an account?"}
              <button type="button" onClick={() => switchAuthMode(authMode === 'register' ? 'login' : 'register')}>
                {authMode === 'register' ? 'Sign in' : 'Create an account'}
              </button>
            </p>

          </motion.div>
        </div>

        {/* ── RIGHT: VISUAL ── */}
        <div className="lp-right">
          <Link to="/" className="lp-nav-back">
            <ChevronLeft size={18} /> Back to home
          </Link>

          <motion.div
            className="lp-right-content"
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="lp-right-badge">
              <Leaf size={14} color="#4ade80" /> The Future of Farming
            </div>
            <h1 className="lp-right-title">
              Cultivate success.<br /><span>Empower your yield.</span>
            </h1>
            <p className="lp-right-desc">
              Join India's most advanced agricultural platform. Get real-time weather analytics, AI disease detection, and live mandi insights in one unified dashboard.
            </p>

            <div className="lp-stat-grid">
              <div className="lp-stat">
                <div className="lp-stat-val">99.8%</div>
                <div className="lp-stat-lbl">AI Diagnostic Accuracy</div>
              </div>
              <div className="lp-stat">
                <div className="lp-stat-val">100+</div>
                <div className="lp-stat-lbl">Connected Mandis</div>
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </>
  );
};

export default LoginPage;