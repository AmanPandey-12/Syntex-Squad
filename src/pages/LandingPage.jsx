import { Link } from 'react-router-dom';
import { useRef, useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  motion, useScroll, useSpring, useTransform,
  AnimatePresence, useMotionValue, useInView
} from 'framer-motion';
import {
  ArrowRight, Leaf, ChevronDown, Heart, Cloud, BarChart3,
  MessageSquare, ShoppingCart, User, Package, FileText,
  Sprout, Scan, ArrowUpRight, Shield, Zap, MapPin,
  Calendar, Mail, Phone, Github, Linkedin, Globe, Check, Star
} from 'lucide-react';

import { Hero3D, Features3D, CTA3D } from '../components/Effects3D';

/* ─── LANGUAGE DATA ─── */
const LANGS = {
  hi: { code: 'HI', label: 'हिंदी', flag: '🇮🇳', hero1: 'स्मार्ट खेती,', hero2: 'बेहतर जीवन।', heroSub: 'AI रोग पहचान, हाइपर-लोकल मौसम, मंडी भाव और स्मार्ट सहायक — एक आधुनिक भारतीय किसान की सभी जरूरतें।', launch: 'शुरू करें', seeFeatures: 'और जानें', tagline: 'AI-संचालित कृषि मंच', statsLabels: ['रोग पहचाने', 'AI सटीकता', 'सुविधाएं'], featTitle: 'सब कुछ जो किसानों को चाहिए', ctaTitle: 'KrishiAI के साथ खेती बदलें', ctaSub: 'पत्ती स्कैन से लेकर मंडी भाव तक — सब एक जगह।', ctaBtn: 'मुफ्त में शुरू करें', allRights: 'सर्वाधिकार सुरक्षित', madeWith: 'भारतीय किसानों के लिए', footerDesc: 'भारतीय किसानों के लिए AI कृषि सहायक।', quickLinks: 'लिंक', company: 'कंपनी', contact: 'संपर्क' },
  en: { code: 'EN', label: 'English', flag: '🇬🇧', hero1: 'Smarter farming,', hero2: 'better lives.', heroSub: 'AI disease detection, hyper-local weather, live Mandi prices, and a smart copilot — everything a modern Indian farmer needs.', launch: 'Launch KrishiAI', seeFeatures: 'See how it works', tagline: 'AI-Powered Agriculture Platform', statsLabels: ['Diseases Detected', 'AI Accuracy', 'Core Features'], featTitle: 'Everything farmers need', ctaTitle: 'Transform your farm with AI', ctaSub: 'From leaf scanning to market intelligence — everything a modern farmer needs.', ctaBtn: 'Get started free', allRights: 'All rights reserved', madeWith: 'Made for Indian Farmers', footerDesc: 'AI-powered farming assistant built for Indian farmers.', quickLinks: 'Quick Links', company: 'Company', contact: 'Contact' },
  ta: { code: 'TA', label: 'தமிழ்', flag: '🌴', hero1: 'சிறந்த விவசாயம்,', hero2: 'நல்ல வாழ்க்கை.', heroSub: 'AI நோய் கண்டறிதல், உள்ளூர் வானிலை, மண்டி விலை.', launch: 'தொடங்கவும்', seeFeatures: 'மேலும்', tagline: 'AI விவசாய தளம்', statsLabels: ['நோய்கள்', 'துல்லியம்', 'அம்சங்கள்'], featTitle: 'விவசாயிகளுக்கு அனைத்தும்', ctaTitle: 'AI உடன் விவசாயம் மாற்றவும்', ctaSub: 'நவீன விவசாயிக்கு தேவையான அனைத்தும்.', ctaBtn: 'இலவசமாக தொடங்கவும்', allRights: 'உரிமைகள் பாதுகாக்கப்பட்டவை', madeWith: 'விவசாயிகளுக்காக', footerDesc: 'இந்திய விவசாயிகளுக்காக AI உதவியாளர்.', quickLinks: 'இணைப்புகள்', company: 'நிறுவனம்', contact: 'தொடர்பு' },
  te: { code: 'TE', label: 'తెలుగు', flag: '🌾', hero1: 'మెరుగైన వ్యవసాయం,', hero2: 'మంచి జీవితం.', heroSub: 'AI వ్యాధి నిర్ధారణ, స్థానిక వాతావరణం, మండి ధరలు.', launch: 'ప్రారంభించు', seeFeatures: 'మరిన్ని', tagline: 'AI వ్యవసాయ వేదిక', statsLabels: ['వ్యాధులు', 'AI ఖచ్చితత్వం', 'లక్షణాలు'], featTitle: 'రైతులకు అవసరమైనవన్నీ', ctaTitle: 'AI తో వ్యవసాయం మార్చండి', ctaSub: 'ఆధునిక రైతుకు అన్నీ ఇక్కడే.', ctaBtn: 'ఉచితంగా ప్రారంభించు', allRights: 'హక్కులు రక్షించబడ్డాయి', madeWith: 'రైతులకోసం', footerDesc: 'భారతీయ రైతులకు AI సహాయకుడు.', quickLinks: 'లింక్‌లు', company: 'కంపెనీ', contact: 'సంప్రదించండి' },
  bn: { code: 'BN', label: 'বাংলা', flag: '🌿', hero1: 'স্মার্ট চাষ,', hero2: 'ভালো জীবন।', heroSub: 'AI রোগ শনাক্তকরণ, স্থানীয় আবহাওয়া, মান্ডি দাম।', launch: 'শুরু করুন', seeFeatures: 'আরও দেখুন', tagline: 'AI কৃষি প্ল্যাটফর্ম', statsLabels: ['রোগ শনাক্ত', 'AI নির্ভুলতা', 'বৈশিষ্ট্য'], featTitle: 'কৃষকদের জন্য সবকিছু', ctaTitle: 'AI দিয়ে চাষ বদলান', ctaSub: 'সব এখানে।', ctaBtn: 'বিনামূল্যে শুরু করুন', allRights: 'সর্বস্বত্ব সংরক্ষিত', madeWith: 'কৃষকদের জন্য', footerDesc: 'ভারতীয় কৃষকদের জন্য AI সহকারী।', quickLinks: 'লিঙ্ক', company: 'কোম্পানি', contact: 'যোগাযোগ' },
  mr: { code: 'MR', label: 'मराठी', flag: '🏵️', hero1: 'हुशार शेती,', hero2: 'चांगलं आयुष्य।', heroSub: 'AI रोग ओळख, स्थानिक हवामान, मंडी भाव.', launch: 'सुरू करा', seeFeatures: 'अधिक', tagline: 'AI कृषी व्यासपीठ', statsLabels: ['रोग ओळखले', 'AI अचूकता', 'वैशिष्ट्ये'], featTitle: 'शेतकऱ्यांसाठी सर्व काही', ctaTitle: 'AI सह शेती बदला', ctaSub: 'सर्व काही येथे.', ctaBtn: 'मोफत सुरू करा', allRights: 'सर्व हक्क राखीव', madeWith: 'शेतकऱ्यांसाठी', footerDesc: 'भारतीय शेतकऱ्यांसाठी AI सहाय्यक.', quickLinks: 'दुवे', company: 'कंपनी', contact: 'संपर्क' },
};

const FEATURES = [
  { id: 'diagnose', icon: <Scan size={20} />, color: '#4ade80', label: 'AI Disease Detection', headline: 'Diagnose any crop disease instantly', desc: 'Upload a photo of a plant leaf. TensorFlow deep learning identifies 38+ diseases in under 3 seconds with precise treatment recommendations.', tag: 'TensorFlow · 98% accuracy' },
  { id: 'weather', icon: <Cloud size={20} />, color: '#60a5fa', label: 'Weather & Mandi Prices', headline: 'Real-time data you can act on', desc: 'Hyper-local multi-day forecasts and live Mandi commodity prices across local markets, updated in real-time — no manual refresh needed.', tag: 'Hyper-local · Live rates' },
  { id: 'copilot', icon: <MessageSquare size={20} />, color: '#c084fc', label: 'AI Copilot', headline: 'Your personal farming advisor', desc: 'Ask about crop schedules, fertilizers, pest control, or market strategy. Context-aware AI retains your full conversation for personalized advice.', tag: 'Context-aware · Agricultural AI' },
  { id: 'dashboard', icon: <BarChart3 size={20} />, color: '#fbbf24', label: 'Farmer Dashboard', headline: 'Your entire farm at a glance', desc: "Weather, Mandi prices, crop health scores, and disease alerts in one unified real-time view. Everything you need to make today's decisions.", tag: 'Real-time · Live sync' },
  { id: 'inventory', icon: <Package size={20} />, color: '#fb923c', label: 'Inventory & Reports', headline: 'Track, report, and share', desc: 'All scanned crops with detailed health reports. Download official PDF disease reports with the KrishiAI stamp — shareable with agricultural authorities.', tag: 'PDF export · Official stamp' },
];

const Counter = ({ target, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let v = 0; const step = target / 60;
    const ti = setInterval(() => { v += step; if (v >= target) { setCount(target); clearInterval(ti); } else setCount(Math.floor(v)); }, 18);
    return () => clearInterval(ti);
  }, [inView, target]);
  return <span ref={ref}>{count}{suffix}</span>;
};

export default function LandingPage() {
  const { language, setLanguage } = useLanguage();
  const [lang, setLang] = useState(language || 'en');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const t = LANGS[lang];

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 700], [0, 120]);
  const heroOp = useTransform(scrollY, [0, 500], [1, 0]);

  const switchLang = (k) => { setLang(k); setLanguage(k); setShowLangMenu(false); };
  const fadeUp = { hidden: { opacity: 0, y: 32 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } } };
  const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.11, delayChildren: 0.1 } } };

  return (
    <div style={{ fontFamily: "'Clash Display','Noto Sans Devanagari',sans-serif", background: '#070b08', color: '#f0f4f1', minHeight: '100vh', overflowX: 'hidden' }}>

      <style>{`
        @import url('https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&f[]=cabinet-grotesk@300,400,500,700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:rgba(74,222,128,0.25);border-radius:2px;}
        .cab{font-family:'Cabinet Grotesk','Noto Sans Devanagari',sans-serif;}
        .mono{font-family:'JetBrains Mono',monospace;}
        .nav-a{color:rgba(240,244,241,0.4);font-size:13px;font-weight:500;text-decoration:none;letter-spacing:0.01em;transition:color 0.2s;font-family:'Cabinet Grotesk',sans-serif;}
        .nav-a:hover{color:#4ade80;}
        .btn-g{display:inline-flex;align-items:center;gap:8px;padding:12px 26px;background:#4ade80;color:#070b08;border-radius:100px;font-size:14px;font-weight:700;text-decoration:none;letter-spacing:-0.01em;transition:all 0.2s;font-family:'Cabinet Grotesk',sans-serif;border:none;cursor:pointer;}
        .btn-g:hover{background:#86efac;transform:translateY(-1px);}
        .btn-o{display:inline-flex;align-items:center;gap:8px;padding:12px 22px;background:rgba(255,255,255,0.04);color:rgba(240,244,241,0.55);border-radius:100px;font-size:14px;font-weight:500;text-decoration:none;border:1px solid rgba(255,255,255,0.08);transition:all 0.2s;font-family:'Cabinet Grotesk',sans-serif;}
        .btn-o:hover{background:rgba(255,255,255,0.07);color:rgba(240,244,241,0.85);}
        .glass{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:20px;backdrop-filter:blur(16px);}
        .glass:hover{background:rgba(255,255,255,0.05);border-color:rgba(74,222,128,0.18);}
        .feat-btn{background:rgba(255,255,255,0.025);border:1px solid rgba(255,255,255,0.06);border-radius:14px;transition:all 0.22s;cursor:pointer;display:flex;align-items:center;gap:14px;padding:15px 17px;text-align:left;width:100%;font-family:inherit;}
        .feat-btn:hover{background:rgba(255,255,255,0.05);}
        .feat-btn.on{background:rgba(74,222,128,0.05);border-color:rgba(74,222,128,0.18);}
        .eyebrow{font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:500;letter-spacing:0.2em;text-transform:uppercase;color:rgba(74,222,128,0.55);margin-bottom:14px;display:block;}
        .sh{font-size:clamp(2rem,4.5vw,3.8rem);font-weight:700;letter-spacing:-0.04em;line-height:1.06;color:#f0f4f1;}
        .footer-a{color:rgba(240,244,241,0.32);font-size:13px;text-decoration:none;display:block;padding:3px 0;transition:color 0.18s;font-family:'Cabinet Grotesk',sans-serif;}
        .footer-a:hover{color:#4ade80;}
        .lang-p{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:6px 11px;font-size:11px;font-weight:600;color:rgba(240,244,241,0.45);cursor:pointer;font-family:'JetBrains Mono',monospace;display:flex;align-items:center;gap:6px;transition:all 0.15s;}
        .lang-p:hover{border-color:rgba(74,222,128,0.28);color:#4ade80;}
        .lang-p.on{background:rgba(74,222,128,0.07);border-color:rgba(74,222,128,0.22);color:#4ade80;}
        .lang-d{position:absolute;top:calc(100% + 8px);right:0;background:#0c1a0e;border:1px solid rgba(74,222,128,0.14);border-radius:14px;overflow:hidden;min-width:165px;z-index:999;box-shadow:0 20px 60px rgba(0,0,0,0.5);}
        .lang-i{width:100%;text-align:left;background:none;border:none;padding:10px 15px;font-size:13px;font-weight:500;color:rgba(240,244,241,0.45);cursor:pointer;display:flex;align-items:center;gap:10px;font-family:'Cabinet Grotesk',sans-serif;transition:background 0.14s;}
        .lang-i:hover{background:rgba(74,222,128,0.06);color:#4ade80;}
        .lang-i.on{color:#4ade80;}
        .grid-bg{background-image:linear-gradient(rgba(74,222,128,0.028) 1px,transparent 1px),linear-gradient(90deg,rgba(74,222,128,0.028) 1px,transparent 1px);background-size:64px 64px;}
        .check-r{display:flex;align-items:flex-start;gap:9px;font-family:'Cabinet Grotesk',sans-serif;font-size:13.5px;color:rgba(240,244,241,0.42);line-height:1.5;}
        .stat-n{font-size:clamp(2rem,4vw,3rem);font-weight:700;letter-spacing:-0.05em;color:#f0f4f1;line-height:1;}
        .stat-l{font-family:'Cabinet Grotesk',sans-serif;font-size:11.5px;color:rgba(240,244,241,0.3);margin-top:5px;}
        .divider{height:1px;background:rgba(255,255,255,0.05);}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
        @keyframes pulse-ring{0%{transform:scale(1);opacity:0.4}100%{transform:scale(1.5);opacity:0}}
        .float-1{animation:float 7s ease-in-out infinite;}
        .float-2{animation:float 9s ease-in-out infinite 1.5s;}
        .float-3{animation:float 8s ease-in-out infinite 3s;}
        @media(max-width:768px){.hide-md{display:none!important;}.grid-3{grid-template-columns:1fr!important;}.grid-2{grid-template-columns:1fr!important;}.feat-grid{grid-template-columns:1fr!important;}}
      `}</style>

      {/* PROGRESS BAR */}
      <motion.div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 2, scaleX, background: 'linear-gradient(90deg,#16a34a,#4ade80)', transformOrigin: 'left', zIndex: 600 }} />

      {/* ═══════ NAVBAR ═══════ */}
      <motion.nav initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 500, padding: '0 28px', height: 62, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(7,11,8,0.82)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>

        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <motion.div whileHover={{ rotate: 180, scale: 1.1 }} transition={{ duration: 0.5 }}
            style={{ width: 33, height: 33, background: 'linear-gradient(135deg,#4ade80,#16a34a)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Leaf size={16} color="#070b08" />
          </motion.div>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#f0f4f1', letterSpacing: '-0.04em' }}>
            Krishi<span style={{ color: '#4ade80' }}>AI</span>
          </span>
        </Link>

        <div className="hide-md" style={{ display: 'flex', gap: 28 }}>
          {[['Story', '#story'], ['Features', '#features'], ['How it works', '#how-it-works'], ['Inventory', '#inventory']].map(([l, h]) => (
            <a key={l} href={h} className="nav-a">{l}</a>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ position: 'relative' }}>
            <button className="lang-p" onClick={() => setShowLangMenu(p => !p)}>
              <span style={{ fontSize: 14 }}>{LANGS[lang].flag}</span>
              <span>{LANGS[lang].code}</span>
              <ChevronDown size={10} style={{ transform: showLangMenu ? 'rotate(180deg)' : '', transition: '0.2s' }} />
            </button>
            <AnimatePresence>
              {showLangMenu && (
                <motion.div className="lang-d" initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }} transition={{ duration: 0.18 }}>
                  {Object.entries(LANGS).map(([k, v]) => (
                    <button key={k} className={`lang-i ${lang === k ? 'on' : ''}`} onClick={() => switchLang(k)}>
                      <span>{v.flag}</span><span>{v.label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <Link to="/dashboard" className="btn-g" style={{ padding: '8px 18px', fontSize: 13 }}>
            {t.launch} <ArrowUpRight size={13} />
          </Link>
        </div>
      </motion.nav>

      {/* ═══════ HERO — SPLINE GLOBE ═══════ */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden', padding: '0 28px' }}>

        {/* SPLINE FULL BG */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <Hero3D style={{ width: '100%', height: '100%' }} />
          {/* Left-to-right fade so text stays readable */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(100deg, rgba(7,11,8,0.95) 0%, rgba(7,11,8,0.7) 42%, rgba(7,11,8,0.15) 75%, transparent 100%)' }} />
          {/* Bottom fade */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%', background: 'linear-gradient(to top,#070b08,transparent)' }} />
        </div>

        {/* Grid overlay */}
        <div className="grid-bg" style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', opacity: 0.6 }} />

        {/* Ambient orbs */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', overflow: 'hidden' }}>
          {[{ color: 'rgba(74,222,128,0.06)', s: 560, x: '52%', y: '-8%', cls: 'float-1' }, { color: 'rgba(96,165,250,0.04)', s: 380, x: '78%', y: '42%', cls: 'float-2' }].map((o, i) => (
            <div key={i} className={o.cls} style={{ position: 'absolute', width: o.s, height: o.s, borderRadius: '50%', background: o.color, left: o.x, top: o.y, transform: 'translate(-50%,-50%)' }} />
          ))}
        </div>

        {/* HERO TEXT */}
        <motion.div variants={stagger} initial="hidden" animate="show"
          style={{ position: 'relative', zIndex: 5, maxWidth: 680, paddingTop: 70 }}>

          <motion.div variants={fadeUp} style={{ marginBottom: 22 }}>
            <span className="eyebrow">◆ {t.tagline}</span>
          </motion.div>

          <motion.h1 variants={fadeUp}
            style={{ fontSize: 'clamp(3rem,7.5vw,7rem)', fontWeight: 700, lineHeight: 0.98, letterSpacing: '-0.055em', color: '#f0f4f1', marginBottom: 28 }}>
            {t.hero1}<br />
            <span style={{ color: '#4ade80' }}>{t.hero2}</span>
          </motion.h1>

          <motion.p variants={fadeUp} className="cab"
            style={{ fontSize: 'clamp(1rem,1.7vw,1.12rem)', color: 'rgba(240,244,241,0.48)', lineHeight: 1.78, maxWidth: 460, marginBottom: 40 }}>
            {t.heroSub}
          </motion.p>

          <motion.div variants={fadeUp} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 60 }}>
            <Link to="/dashboard" className="btn-g">{t.launch} <ArrowRight size={15} /></Link>
            <a href="#features" className="btn-o">{t.seeFeatures} <ChevronDown size={14} /></a>
          </motion.div>

          {/* Stats */}
          <motion.div variants={fadeUp} style={{ display: 'flex', gap: 48, flexWrap: 'wrap', paddingTop: 28, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {[{ v: 38, s: '+', l: t.statsLabels[0] }, { v: 98, s: '%', l: t.statsLabels[1] }, { v: 6, s: '', l: t.statsLabels[2] }].map((s, i) => (
              <div key={i}><div className="stat-n"><Counter target={s.v} suffix={s.s} /></div><div className="stat-l">{s.l}</div></div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, zIndex: 5 }}>
          <div className="mono" style={{ fontSize: 8, letterSpacing: '0.22em', color: 'rgba(240,244,241,0.18)' }}>SCROLL</div>
          <motion.div animate={{ y: [0, 7, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
            <ChevronDown size={16} color="rgba(240,244,241,0.2)" />
          </motion.div>
        </div>
      </section>

      {/* ═══════ STORY — A Farmer's Day ═══════ */}
      <section id="story" className="grid-bg" style={{ padding: '110px 28px', position: 'relative' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 64 }}>
            <span className="eyebrow">◆ A Farmer's Day</span>
            <h2 className="sh">From dawn <span style={{ color: '#4ade80' }}>to dusk.</span></h2>
          </motion.div>

          <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { time: '5:00 AM', emoji: '🌅', title: 'Morning check', desc: "Opens KrishiAI. Today's weather and Mandi prices at a glance. AI spots a rain advisory — plans the day accordingly.", c: '#fbbf24' },
              { time: '7:00 AM', emoji: '🌿', title: 'Crop scanning', desc: 'Photos a spotted wheat leaf. 3 seconds later — AI: "Leaf blight. Treatment: neem oil." Report saved to inventory.', c: '#4ade80' },
              { time: '11:00 AM', emoji: '⛈️', title: 'Rain alert', desc: 'AI dashboard push: heavy rain at 3 PM. Moves harvested crops under shelter in time. Losses avoided.', c: '#60a5fa' },
              { time: '3:00 PM', emoji: '🤖', title: 'AI Copilot chat', desc: 'Asks Copilot: "What to sow next?" AI analyzes soil, weather, and market demand — recommends mustard.', c: '#c084fc' },
              { time: '7:00 PM', emoji: '📄', title: 'Report & rest', desc: 'All scan reports exported as official PDFs with KrishiAI stamp. Sent to the agriculture officer. Done.', c: '#fb923c' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                style={{ gridColumn: i === 4 ? '1 / -1' : 'auto' }}>
                <motion.div className="glass" style={{ padding: '26px 28px', height: '100%', transition: 'all 0.3s' }}
                  whileHover={{ y: -4, borderColor: `${item.c}25` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <span style={{ fontSize: 22 }}>{item.emoji}</span>
                    <div>
                      <div className="mono" style={{ fontSize: 9.5, color: item.c, letterSpacing: '0.1em', marginBottom: 2 }}>{item.time}</div>
                      <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.03em', color: '#f0f4f1' }}>{item.title}</div>
                    </div>
                  </div>
                  <p className="cab" style={{ fontSize: 13.5, color: 'rgba(240,244,241,0.42)', lineHeight: 1.7 }}>{item.desc}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ FEATURES — Spline BG ═══════ */}
      <section id="features" style={{ padding: '110px 0', position: 'relative', background: '#050709', overflow: 'hidden' }}>

        {/* Spline scene as immersive background */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.85, pointerEvents: 'none' }}>
          <Features3D style={{ width: '100%', height: '100%' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg,#050709 0%,rgba(5,7,9,0.1) 50%,#050709 100%)' }} />
        </div>

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 28px', position: 'relative', zIndex: 2 }}>
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 52 }}>
            <span className="eyebrow">◆ Core Features</span>
            <h2 className="sh">{t.featTitle}</h2>
          </motion.div>

          <div className="feat-grid" style={{ display: 'grid', gridTemplateColumns: '270px 1fr', gap: 16 }}>
            {/* Tabs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {FEATURES.map((f, i) => (
                <motion.button key={f.id} className={`feat-btn ${activeFeature === i ? 'on' : ''}`}
                  onClick={() => setActiveFeature(i)} whileHover={{ x: 3 }} transition={{ duration: 0.14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: activeFeature === i ? `${f.color}15` : 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: activeFeature === i ? f.color : 'rgba(240,244,241,0.28)', flexShrink: 0, transition: 'all 0.2s' }}>
                    {f.icon}
                  </div>
                  <span style={{ fontSize: 13.5, fontWeight: 600, letterSpacing: '-0.02em', color: activeFeature === i ? '#f0f4f1' : 'rgba(240,244,241,0.38)', transition: 'color 0.2s', fontFamily: 'inherit' }}>{f.label}</span>
                  {activeFeature === i && (
                    <motion.div layoutId="feat-dot" style={{ width: 5, height: 5, borderRadius: '50%', background: f.color, marginLeft: 'auto', flexShrink: 0 }} />
                  )}
                </motion.button>
              ))}
            </div>

            {/* Detail panel */}
            <AnimatePresence mode="wait">
              <motion.div key={activeFeature}
                initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="glass" style={{ padding: '40px', position: 'relative', overflow: 'hidden', minHeight: 300 }}>
                <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: `${FEATURES[activeFeature].color}06`, pointerEvents: 'none' }} />
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 24 }}>
                  <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
                    style={{ width: 54, height: 54, borderRadius: 15, background: `${FEATURES[activeFeature].color}10`, border: `1px solid ${FEATURES[activeFeature].color}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: FEATURES[activeFeature].color, flexShrink: 0 }}>
                    {FEATURES[activeFeature].icon}
                  </motion.div>
                  <div>
                    <h3 style={{ fontSize: 21, fontWeight: 700, letterSpacing: '-0.03em', color: '#f0f4f1', marginBottom: 10 }}>
                      {FEATURES[activeFeature].headline}
                    </h3>
                    <p className="cab" style={{ fontSize: 14.5, color: 'rgba(240,244,241,0.42)', lineHeight: 1.72 }}>
                      {FEATURES[activeFeature].desc}
                    </p>
                  </div>
                </div>
                <div style={{ paddingTop: 22, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span className="mono" style={{ fontSize: 9.5, padding: '5px 12px', background: `${FEATURES[activeFeature].color}08`, color: FEATURES[activeFeature].color, borderRadius: 100, border: `1px solid ${FEATURES[activeFeature].color}18`, letterSpacing: '0.05em' }}>
                    {FEATURES[activeFeature].tag}
                  </span>
                  <Link to="/dashboard" className="btn-o" style={{ padding: '6px 16px', fontSize: 12.5, borderRadius: 100 }}>Try it <ArrowRight size={12} /></Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ═══════ HOW IT WORKS ═══════ */}
      <section id="how-it-works" className="grid-bg" style={{ padding: '110px 28px', position: 'relative' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 64 }}>
            <span className="eyebrow">◆ Getting Started</span>
            <h2 className="sh">Up and running<br /><span style={{ color: '#4ade80' }}>in 3 steps.</span></h2>
          </motion.div>

          <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
            {[
              { n: '01', icon: <User size={22} />, color: '#4ade80', title: 'Connect instantly', desc: 'No complex signup. Your personalized farmer dashboard is ready in seconds, in your language.', checks: ['Works on any device', 'Available in 6 languages', 'Instant access'] },
              { n: '02', icon: <Scan size={22} />, color: '#60a5fa', title: 'Diagnose your crops', desc: 'Identify 38+ diseases in under 3 seconds with a complete treatment plan.', checks: ['Results in under 3 seconds', 'Identifies 38+ diseases', 'Expert recommendations'] },
              { n: '03', icon: <BarChart3 size={22} />, color: '#fbbf24', title: 'Monitor & decide', desc: "Track crop health, check live Mandi prices, and chat with the AI Copilot — all from one beautiful dashboard.", checks: ['Live Mandi price tracking', 'Hyper-local weather data', 'AI Copilot on demand'] },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
                <motion.div className="glass" style={{ padding: '34px', height: '100%' }}
                  whileHover={{ y: -5, rotateX: -2, rotateY: i === 0 ? 2 : i === 2 ? -2 : 0 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 28 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 22 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 13, background: `${s.color}0e`, border: `1px solid ${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
                      {s.icon}
                    </div>
                    <span className="mono" style={{ fontSize: 22, fontWeight: 700, color: 'rgba(255,255,255,0.06)', letterSpacing: '-0.04em' }}>{s.n}</span>
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.03em', color: '#f0f4f1', marginBottom: 10 }}>{s.title}</h3>
                  <p className="cab" style={{ fontSize: 13.5, color: 'rgba(240,244,241,0.4)', lineHeight: 1.72, marginBottom: 22 }}>{s.desc}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {s.checks.map((c, j) => (
                      <div key={j} className="check-r">
                        <div style={{ width: 16, height: 16, borderRadius: '50%', background: `${s.color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                          <Check size={9} color={s.color} />
                        </div>
                        {c}
                      </div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ CTA — SPLINE FULL BLEED ═══════ */}
      <section style={{ position: 'relative', padding: '140px 28px', overflow: 'hidden', textAlign: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <CTA3D style={{ width: '100%', height: '100%' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 90% 90% at 50% 50%, rgba(7,11,8,0.65) 0%, rgba(7,11,8,0.95) 100%)' }} />
          <div className="grid-bg" style={{ position: 'absolute', inset: 0 }} />
        </div>

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 660, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
            <span className="eyebrow">◆ Free to get started</span>
            <h2 style={{ fontSize: 'clamp(2.5rem,6vw,5rem)', fontWeight: 700, letterSpacing: '-0.055em', color: '#f0f4f1', lineHeight: 1.04, marginBottom: 22 }}>
              {t.ctaTitle}
            </h2>
            <p className="cab" style={{ fontSize: 16, color: 'rgba(240,244,241,0.42)', lineHeight: 1.75, marginBottom: 44 }}>{t.ctaSub}</p>

            {/* Language switcher */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 36 }}>
              {Object.entries(LANGS).map(([k, v]) => (
                <button key={k} className={`lang-p ${lang === k ? 'on' : ''}`} onClick={() => switchLang(k)}>
                  {v.flag} {v.code}
                </button>
              ))}
            </div>

            <Link to="/dashboard" className="btn-g" style={{ fontSize: 15, padding: '15px 34px' }}>
              {t.ctaBtn} <ArrowRight size={16} />
            </Link>

            <div className="cab" style={{ marginTop: 28, fontSize: 12, color: 'rgba(240,244,241,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Star size={11} color="rgba(251,191,36,0.45)" />
              Trusted by farmers across India
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer style={{ background: '#040608', borderTop: '1px solid rgba(255,255,255,0.04)', padding: '60px 28px 30px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 44, marginBottom: 52 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#4ade80,#16a34a)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Leaf size={15} color="#070b08" />
                </div>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#f0f4f1', letterSpacing: '-0.04em' }}>
                  Krishi<span style={{ color: '#4ade80' }}>AI</span>
                </span>
              </div>
              <p className="cab" style={{ fontSize: 13, color: 'rgba(240,244,241,0.28)', lineHeight: 1.72, marginBottom: 22 }}>{t.footerDesc}</p>
              <div style={{ display: 'flex', gap: 7 }}>
                {[{ icon: <Mail size={13} />, h: 'mailto:support@krishiai.online' }].map((s, i) => (
                  <a key={i} href={s.h} target={s.h.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
                    style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(240,244,241,0.28)', textDecoration: 'none', transition: 'all 0.15s' }}>
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <div className="mono" style={{ fontSize: 9, letterSpacing: '0.18em', color: 'rgba(240,244,241,0.22)', textTransform: 'uppercase', marginBottom: 18 }}>{t.quickLinks}</div>
              {[['/', 'Home'], ['/dashboard', 'Dashboard']].map(([to, l]) => (
                <Link key={to} to={to} className="footer-a">{l}</Link>
              ))}
            </div>
          </div>

          <div className="divider" style={{ marginBottom: 24 }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <span className="mono" style={{ fontSize: 10, color: 'rgba(240,244,241,0.18)' }}>© 2026 KrishiAI. {t.allRights}.</span>
            <span className="cab" style={{ fontSize: 11.5, color: 'rgba(240,244,241,0.18)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Heart size={10} color="rgba(248,113,113,0.4)" /> {t.madeWith}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}