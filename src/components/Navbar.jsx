import { Link, useLocation } from 'react-router-dom';
import { Leaf, LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

const Navbar = ({ dark = false }) => {
  const location = useLocation();
  const { t } = useLanguage();

  const navLinks = [
    { name: t('nav.dashboard'), path: '/dashboard', Icon: LayoutDashboard },
  ];

  /* ── hide on certain pages ── */
  const hiddenPaths = ['/'];
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
          background: #16a34a;
          padding: 2px;
          box-shadow: 0 4px 12px rgba(21, 128, 61, 0.15);
        }
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
        }
        .nav-link:hover { color: ${dark ? '#fff' : '#0f172a'}; }
        .nav-link--active { color: ${dark ? '#4ade80' : '#15803d'} !important; }
      `}</style>

      <motion.div
        className="nb-root"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.2, 1, 0.3, 1] }}
      >
        <div className="nb-glass">
          {/* Brand */}
          <Link to="/" className="navbar-brand">
            <div className="brand-icon"><Leaf size={20} color="#fff" /></div>
            <span className="brand-name">Krishi<span>AI</span></span>
          </Link>

          {/* Center Links */}
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
        </div>
      </motion.div>
    </>
  );
};

export default Navbar;