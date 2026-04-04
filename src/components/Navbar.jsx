import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Leaf, LayoutDashboard, PackageSearch,
  User, Menu, X, ArrowRight, LogOut, Scan, ChevronRight,
  Bell, Bot, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useLanguage } from '../context/LanguageContext';

const Navbar = ({ dark = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const { t } = useLanguage();

  /* ── scroll-hide behaviour ── */
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y > lastY.current && y > 80) setHidden(true);
      else setHidden(false);
      lastY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── auth & profile ── */
  useEffect(() => {
    const unsub = auth?.onAuthStateChanged?.(async (u) => {
      setUser(u);
      if (u) {
        try {
          const uDoc = await getDoc(doc(db, 'users', u.uid));
          if (uDoc.exists()) setUserProfile(uDoc.data());
        } catch (e) {
          console.error("Error fetching profile:", e);
        }
      } else {
        setUserProfile(null);
      }
    });
    return () => unsub?.();
  }, []);

  /* ── modal detection ── */
  const [modalOpen, setModalOpen] = useState(false);
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const isModal = document.querySelector('.i-overlay, .d-overlay, .modal-backdrop, .nb-drawer, .d-chat-panel, .d-overlay-bg, .d-chat-overlay, .fc-overlay');
      const shouldLock = !!isModal;
      setModalOpen(shouldLock);

      // Global background scroll lock
      if (shouldLock) {
        document.body.style.overflow = 'hidden';
        document.body.style.touchAction = 'none'; // Prevent touch scroll on mobile
      } else if (!open) { // Only unlock if the side drawer is ALSO closed
        document.body.style.overflow = 'unset';
        document.body.style.touchAction = 'unset';
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      document.body.style.overflow = 'unset';
      document.body.style.touchAction = 'unset';
    };
  }, [open]);

  const navLinks = [
    { name: t('nav.dashboard'), path: '/dashboard', Icon: LayoutDashboard },
    { name: t('nav.inventory'), path: '/inventory', Icon: PackageSearch },
    { name: t('nav.schemes'), path: '/schemes', Icon: Award },
  ];

  const handleLogout = async () => {
    if (auth) await signOut(auth);
    navigate('/login');
    setOpen(false);
  };

  const firstName = userProfile?.name?.split(' ')[0] || user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'Farmer';

  /* ── hide on certain pages ── */
  const hiddenPaths = ['/', '/login', '/about', '/team', '/contact', '/privacy', '/terms'];
  if (hiddenPaths.includes(location.pathname)) return null;

  return (
    <>
      <style>{`
        .nb-root {
          position: fixed; top: 0; left: 0; right: 0;
          z-index: 1000;
          padding: 16px 24px;
          pointer-events: none;
        }
        .nb-glass {
          max-width: 1040px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between;
          gap: 12px;
          background: ${dark ? 'rgba(6, 9, 10, 0.8)' : 'rgba(255, 255, 255, 0.75)'};
          backdrop-filter: blur(24px) saturate(2);
          -webkit-backdrop-filter: blur(24px) saturate(2);
          border: 1px solid ${dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.4)'};
          border-top: 1px solid ${dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.7)'};
          border-radius: 100px;
          padding: 8px 10px 8px 22px;
          box-shadow: 
            0 20px 48px -12px ${dark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(20, 35, 18, 0.08)'},
            0 8px 16px -4px ${dark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(20, 35, 18, 0.04)'},
            inset 0 1px 0 ${dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)'};
          pointer-events: auto;
          transition: all 0.5s cubic-bezier(0.2, 1, 0.3, 1);
        }
        .nb-glass:hover {
          background: ${dark ? 'rgba(6, 9, 10, 0.9)' : 'rgba(255, 255, 255, 0.85)'};
          box-shadow: 
            0 30px 60px -15px ${dark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(20, 35, 18, 0.14)'},
            0 12px 24px -6px ${dark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(20, 35, 18, 0.08)'};
          transform: translateY(2px);
        }

        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          transition: transform 0.2s;
        }
        .navbar-brand:hover { transform: scale(1.02); }
        .brand-icon {
          width: 32px; height: 32px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center; overflow: hidden;
          background: #fff;
          padding: 2px;
          box-shadow: 0 4px 12px rgba(21, 128, 61, 0.15);
        }
        .brand-logo-img { width: 100%; height: 100%; object-fit: contain; }
        .brand-name { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 800; color: ${dark ? '#fff' : '#0f172a'}; letter-spacing: -0.01em; }
        .brand-name span { color: ${dark ? '#4ade80' : '#15803d'}; font-style: italic; }

        .navbar-center {
          display: flex;
          align-items: center;
          gap: 2px;
          background: ${dark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'};
          padding: 4px;
          border-radius: 100px;
          border: 1px solid ${dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
          box-shadow: inset 0 2px 4px ${dark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0,0,0,0.02)'};
        }
        .nav-link {
          position: relative;
          padding: 7px 14px;
          font-size: 12px;
          font-weight: 800;
          color: ${dark ? 'rgba(255, 255, 255, 0.7)' : '#64748b'};
          text-decoration: none;
          border-radius: 100px;
          transition: all 0.3s cubic-bezier(0.2, 1, 0.3, 1);
          text-transform: uppercase;
          letter-spacing: 0.03em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 140px;
        }
        .nav-link:hover { color: ${dark ? '#fff' : '#0f172a'}; }
        .nav-link--active { color: ${dark ? '#4ade80' : '#15803d'} !important; }

        .navbar-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .nb-right-mobile { display: none; }
        .nav-icon-btn {
          width: 38px; height: 38px; border-radius: 50%;
          border: 1px solid ${dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)'};
          background: ${dark ? 'rgba(255, 255, 255, 0.05)' : '#fff'};
          display: flex; align-items: center; justify-content: center;
          color: ${dark ? 'rgba(255, 255, 255, 0.7)' : '#64748b'}; cursor: pointer;
          position: relative;
          transition: all 0.2s cubic-bezier(0.2, 1, 0.3, 1);
        }
        .nav-icon-btn:hover {
          color: ${dark ? '#4ade80' : '#0f172a'};
          border-color: ${dark ? 'rgba(74, 222, 128, 0.3)' : '#15803d'};
          background: ${dark ? 'rgba(74, 222, 128, 0.1)' : '#f0fdf4'};
          transform: translateY(-2px);
          box-shadow: 0 4px 12px ${dark ? 'rgba(74, 222, 128, 0.2)' : 'rgba(21, 128, 61, 0.1)'};
        }
        /* Notification Dot */
        .nav-icon-btn[title="Notifications"]::after {
          content: '';
          position: absolute; top: 10px; right: 10px;
          width: 8px; height: 8px;
          background: #ef4444; border: 2px solid #fff;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }

        .nav-avatar {
          width: 38px; height: 38px; border-radius: 50%;
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          border: 2px solid #16a34a;
          display: flex; align-items: center; justify-content: center;
          color: #15803d; cursor: pointer;
          font-size: 13px; font-weight: 800;
          transition: all 0.2s;
          box-shadow: 0 4px 10px rgba(22, 163, 74, 0.1);
        }
        .nav-avatar:hover { transform: scale(1.05); box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.15); }

        .btn-scan-nav {
          display: flex; align-items: center; gap: 8px;
          padding: 8px 22px;
          background: #1e293b;
          color: #fff; border: none;
          border-radius: 100px;
          font-size: 12px; font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          cursor: pointer;
          margin-left: 4px;
          transition: all 0.3s cubic-bezier(0.2, 1, 0.3, 1);
          box-shadow: 0 8px 20px -6px rgba(15, 23, 42, 0.3);
        }
        .btn-scan-nav:hover {
          background: #15803d;
          box-shadow: 0 12px 24px -8px rgba(21, 128, 61, 0.4);
          transform: translateY(-2px);
        }
        .btn-scan-nav:active { transform: scale(0.96); }

        /* ── BOTTOM NAV (Mobile Unchanged) ── */
        .nb-bottom {
          display: none;
          position: fixed; bottom: 0; left: 0; right: 0;
          height: 72px; z-index: 1000;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          border-top: 1px solid rgba(0, 0, 0, 0.05);
          padding-bottom: env(safe-area-inset-bottom);
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.03);
          pointer-events: auto;
        }
        .nb-bottom-grid {
          width: 100%; height: 100%; display: grid; grid-template-columns: repeat(5, 1fr); align-items: center;
        }
        .nb-b-item {
          display: flex; flex-direction: column; align-items: center; gap: 2px;
          text-decoration: none; color: #64748b; font-size: 9px; font-weight: 700;
          transition: color 0.2s;
          overflow: hidden;
          min-width: 0;
        }
        .nb-b-item span {
          display: block;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          text-align: center;
          padding: 0 2px;
        }
        .nb-b-item--active { color: #2e7d4f; }
        
        .nb-scan-wrap { position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
        .nb-scan-fab {
          width: 58px; height: 58px; border-radius: 50%;
          background: #2e7d4f; color: #fff;
          display: flex; align-items: center; justify-content: center;
          margin-top: -40px; border: 5px solid #fff;
          box-shadow: 0 8px 25px rgba(46, 125, 79, 0.35);
          cursor: pointer; transition: transform 0.2s;
        }
        .nb-scan-fab:active { transform: scale(0.9); }

        @media(max-width: 720px) {
          .navbar-center, .btn-scan-nav, .nav-icon-btn[title="Notifications"], .nav-icon-btn[title="Sign out"], .nb-right-desktop { display: none !important; }
          .nb-bottom { display: block; }
          .nb-right-mobile { display: flex !important; align-items: center; }
          .nav-avatar { display: flex !important; width: 34px; height: 34px; border-width: 1.5px; }
          body { padding-bottom: 72px; }
        }

        /* Mobile Link Style (Drawer) */
        .nb-mob-links { display: flex; flex-direction: column; gap: 10px; flex: 1; }
        .nb-mob-link {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 22px; 
          background: ${dark ? 'rgba(255, 255, 255, 0.05)' : '#fff'}; 
          border: 1px solid ${dark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8df'}; 
          border-radius: 22px;
          text-decoration: none; 
          color: ${dark ? '#fff' : '#1a2117'}; 
          transition: all 0.2s cubic-bezier(0.2, 1, 0.3, 1);
          box-shadow: 0 2px 6px ${dark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(20, 35, 18, 0.05)'};
        }
        .nb-mob-link:active { transform: scale(0.98); }
        .nb-mob-link--on { 
          border-left: 5px solid #4ade80; 
          background: ${dark ? 'rgba(74, 222, 128, 0.1)' : '#f0f7f3'}; 
        }
        .nb-mob-ico-box { 
          width: 44px; height: 44px; border-radius: 15px; 
          background: ${dark ? 'rgba(74, 222, 128, 0.1)' : '#eaf4ee'}; 
          color: ${dark ? '#4ade80' : '#2e7d4f'}; 
          display: flex; align-items: center; justify-content: center; 
        }
        .nb-mob-link--on .nb-mob-ico-box { 
          background: #4ade80; 
          color: ${dark ? '#06090a' : '#fff'}; 
        }

        /* ── MOBILE ACTIONS HIDING ── */
        @media(max-width: 720px) {
          .nb-actions--mobile-hidden { display: none !important; }
        }

        /* ── MOBILE DRAWER & OVERLAY ── */
        .nb-overlay {
          position: fixed; inset: 0; background: rgba(15, 23, 18, 0.4);
          backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
          z-index: 1050;
        }
        .nb-drawer {
          position: fixed; top: 0; right: 0; bottom: 0; width: 85%; max-width: 360px;
          background: ${dark ? '#06090a' : '#fff'}; z-index: 1100; padding: 24px;
          display: flex; flex-direction: column; gap: 24px;
          box-shadow: -10px 0 40px ${dark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0,0,0,0.15)'};
          overflow-y: auto;
          border-left: 1px solid ${dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0,0,0,0.05)'};
        }
        .nb-drawer-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
        .nb-drawer-close {
          width: 44px; height: 44px; border-radius: 14px;
          background: ${dark ? 'rgba(255, 255, 255, 0.05)' : '#f8fafc'}; 
          border: 1px solid ${dark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0'};
          display: flex; align-items: center; justify-content: center; 
          color: ${dark ? 'rgba(255, 255, 255, 0.7)' : '#64748b'};
          cursor: pointer; transition: all 0.2s;
        }
        .nb-drawer-close:hover { 
          background: ${dark ? 'rgba(255, 255, 255, 0.1)' : '#f1f5f9'}; 
          color: ${dark ? '#fff' : '#0f172a'}; 
          transform: rotate(90deg); 
        }
        .nb-drawer-foot { 
          margin-top: auto; display: flex; flex-direction: column; gap: 10px; 
          padding-top: 24px; 
          border-top: 1px solid ${dark ? 'rgba(255, 255, 255, 0.1)' : '#f1f5f9'}; 
        }
      `}</style>

      <motion.div
        className="nb-root"
        animate={{ y: (hidden || modalOpen) ? -100 : 0, opacity: (hidden || modalOpen) ? 0 : 1 }}
        transition={{ duration: 0.5, ease: [0.2, 1, 0.3, 1] }}
      >
        <div className="nb-glass">
          {/* Brand */}
          <Link to="/" className="navbar-brand">
            <div className="brand-icon"><img src="/logo.png" className="brand-logo-img" alt="logo" /></div>
            <span className="brand-name">Krishi<span>AI</span></span>
          </Link>

          {/* Center Links (Desktop Only) */}
          <div className="navbar-center">
            {navLinks.map(({ name, path, Icon }) => {
              const active = location.pathname === path;
              return (
                <Link key={path} to={path} className={`nav-link ${active ? 'nav-link--active' : ''}`}>
                  {active && (
                    <motion.div
                      layoutId="nb-active"
                      style={{ position: 'absolute', inset: 0, background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderRadius: '100px', zIndex: -1 }}
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 7 }}>
                    <Icon size={15} strokeWidth={active ? 2.5 : 2} />
                    {name}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="navbar-right">
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* Desktop Icons (Hidden on Mobile via CSS) */}
                <div className="nb-right-desktop" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    className="nav-avatar"
                    title={firstName}
                    onClick={() => navigate('/profile')}
                  >
                    {userProfile?.photoURL ? (
                      <img src={userProfile.photoURL} alt="" style={{ width: '100%', height: '100%', borderRadius: 'inherit', objectFit: 'cover' }} />
                    ) : (
                      firstName.charAt(0).toUpperCase()
                    )}
                  </div>

                  <button
                    className="btn-scan-nav"
                    onClick={() => navigate('/detection')}
                  >
                    <Scan size={14} strokeWidth={2.5} /> Diagnose
                  </button>

                  <button
                    className="nav-icon-btn"
                    title="Sign out"
                    onClick={handleLogout}
                    style={{ marginLeft: 4 }}
                  >
                    <LogOut size={16} strokeWidth={2} />
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="btn-scan-nav"
                style={{ textDecoration: 'none' }}
              >
                Sign in <ArrowRight size={15} strokeWidth={2.5} />
              </Link>
            )}

            {/* Mobile Profile Section (Replaces Menu Toggle) */}
            <div className="nb-right-mobile">
              {user && (
                <div 
                  className="nav-avatar" 
                  onClick={() => navigate('/profile')}
                  style={{ margin: 0, boxShadow: 'none' }}
                >
                  {userProfile?.photoURL ? (
                    <img src={userProfile.photoURL} alt="" style={{ width: '100%', height: '100%', borderRadius: 'inherit', objectFit: 'cover' }} />
                  ) : (
                    firstName.charAt(0).toUpperCase()
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bottom Navbar (Mobile Only) */}
      <AnimatePresence>
        {user && !modalOpen && (
          <motion.nav
            className="nb-bottom"
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="nb-bottom-grid">
              <Link to="/dashboard" className={`nb-b-item ${location.pathname === '/dashboard' ? 'nb-b-item--active' : ''}`}>
                <LayoutDashboard size={22} strokeWidth={2} />
                <span>{t('nav.dashboard')}</span>
              </Link>
              <Link to="/inventory" className={`nb-b-item ${location.pathname === '/inventory' ? 'nb-b-item--active' : ''}`}>
                <PackageSearch size={22} strokeWidth={2} />
                <span>{t('nav.inventory')}</span>
              </Link>

              <div className="nb-scan-wrap">
                <button className="nb-scan-fab" onClick={() => navigate('/detection')}>
                  <Scan size={26} strokeWidth={2.5} />
                </button>
              </div>

               <button className={`nb-b-item ${location.search === '?chat=true' ? 'nb-b-item--active' : ''}`} onClick={() => navigate('/dashboard?chat=true')}>
                <Bot size={22} strokeWidth={2} />
                <span>Chat</span>
              </button>
              <Link to="/schemes" className={`nb-b-item ${location.pathname === '/schemes' ? 'nb-b-item--active' : ''}`}>
                <Award size={22} strokeWidth={2} />
                <span>Schemes</span>
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="nb-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
        )}
        {open && (
          <motion.div
            className="nb-drawer"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
          >
            <div className="nb-drawer-head">
              <div className="navbar-brand">
                <div className="brand-icon" style={{ width: 44, height: 44, borderRadius: 14 }}><img src="/logo.png" className="brand-logo-img" alt="logo" /></div>
                <span className="brand-name" style={{ fontSize: 22 }}>Krishi<span>AI</span></span>
              </div>
              <button className="nb-drawer-close" onClick={() => setOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="nb-mob-links">
              {navLinks.map(({ name, path, Icon }) => {
                const active = location.pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    className={`nb-mob-link ${active ? 'nb-mob-link--on' : ''}`}
                    onClick={() => setOpen(false)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div className="nb-mob-ico-box"><Icon size={22} /></div>
                      <span className="brand-name" style={{ fontSize: 18 }}>{name}</span>
                    </div>
                    <ChevronRight size={20} style={{ color: '#b0bcad' }} />
                  </Link>
                );
              })}

              {user && (
                <Link
                  to="/profile"
                  className={`nb-mob-link ${location.pathname === '/profile' ? 'nb-mob-link--on' : ''}`}
                  onClick={() => setOpen(false)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div className="nb-mob-ico-box"><User size={22} /></div>
                    <span className="brand-name" style={{ fontSize: 18 }}>{t('nav.profile')}</span>
                  </div>
                  <ChevronRight size={20} style={{ color: '#b0bcad' }} />
                </Link>
              )}
            </div>

            <div className="nb-drawer-foot">
              <button
                className="btn-scan-nav"
                style={{ height: 60, width: '100%', justifyContent: 'center', fontSize: 15, borderRadius: 20 }}
                onClick={() => { navigate('/detection'); setOpen(false); }}
              >
                <Scan size={20} /> Open AI Scanner
              </button>
              {user ? (
                <button
                  className="nav-link"
                  style={{ height: 56, width: '100%', justifyContent: 'center', gap: 10, color: '#c0392b', fontSize: 15 }}
                  onClick={handleLogout}
                >
                  <LogOut size={20} /> {t('nav.logout')}
                </button>
              ) : (
                <Link
                  to="/login"
                  className="btn-scan-nav"
                  style={{ textDecoration: 'none', justifyContent: 'center', height: 60, borderRadius: 20 }}
                  onClick={() => setOpen(false)}
                >
                  Sign In <ArrowRight size={20} />
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;