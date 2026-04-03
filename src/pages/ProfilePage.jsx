import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Mail, Phone, MapPin, Edit2, X,
    LogOut, Camera, ArrowLeft, RefreshCw,
    Leaf, CheckCircle2, BarChart3, Clock,
    ChevronRight, Globe, Check, Award, LocateFixed
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import {
    doc, getDoc, updateDoc, setDoc,
    collection, query, where, getDocs
} from 'firebase/firestore';
import { signOut, updateProfile } from 'firebase/auth';
import { mockApi } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import AppFooter from '../components/AppFooter';


const fmt = d => d
    ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'N/A';

const ProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState({ total: 0, healthy: 0, avgHealth: 0 });
    const [crops, setCrops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ name: '', phone: '', location: '' });
    const [toast, setToast] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();
    const { language, setLanguage, t, languages, currentLanguage } = useLanguage();

    useEffect(() => {
        if (!auth) { navigate('/login'); return; }
        const unsub = auth.onAuthStateChanged(async user => {
            if (!user) { navigate('/login'); return; }
            try {
                const uDoc = await getDoc(doc(db, 'users', user.uid));
                if (uDoc.exists()) {
                    const d = uDoc.data();
                    setProfile(d);
                    setForm({ name: d.name || '', phone: d.phone || '', location: d.location || '' });
                }
                const snap = await getDocs(query(collection(db, 'crops'), where('userId', '==', user.uid)));
                const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                if (list.length) {
                    const healthy = list.filter(c => c.status === 'Healthy').length;
                    const avg = Math.round(list.reduce((s, c) => s + (c.healthScore || 0), 0) / list.length);
                    setStats({ total: list.length, healthy, avgHealth: avg });
                    setCrops(list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 4));
                }
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        });
        return unsub;
    }, [navigate]);

    const handleFetchLocation = () => {
        if (!navigator.geolocation) {
            setToast({ type: 'error', message: 'Geolocation is not supported.' });
            setTimeout(() => setToast(null), 3000);
            return;
        }

        setToast({ type: 'success', message: 'Fetching live location...' });
        
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY || '4607498ec4105d2bf387da14d6c09708';
                    const res = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${apiKey}`);
                    const data = await res.json();
                    if (data && data.length > 0) {
                        const { name, state } = data[0];
                        setForm(f => ({ ...f, location: [name, state].filter(Boolean).join(', ') }));
                        setToast({ type: 'success', message: 'Live location fetched successfully!' });
                    } else {
                        setForm(f => ({ ...f, location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }));
                        setToast({ type: 'success', message: 'Live coordinates obtained!' });
                    }
                } catch (err) {
                    setForm(f => ({ ...f, location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }));
                    setToast({ type: 'success', message: 'Live coordinates obtained!' });
                }
                setTimeout(() => setToast(null), 3000);
            },
            () => {
                setToast({ type: 'error', message: 'Location permission denied by user.' });
                setTimeout(() => setToast(null), 3000);
            }
        );
    };

    const handleSave = async e => {
        e.preventDefault();
        setSaving(true);
        try {
            await setDoc(
                doc(db, 'users', auth.currentUser.uid),
                { ...form, updatedAt: new Date().toISOString() },
                { merge: true }
            );
            setProfile(p => ({ ...p, ...form }));
            setEditing(false);
            setToast({ type: 'success', message: 'Profile updated successfully.' });
            setTimeout(() => setToast(null), 3000);
        } catch (error) {
            setToast({ type: 'error', message: 'Failed to save. Please try again.' });
            setTimeout(() => setToast(null), 3000);
        } finally { setSaving(false); }
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = reader.result.split(',')[1];
                try {
                    const imageUrl = await mockApi.uploadToImgBB(base64);
                    if (auth.currentUser) await updateProfile(auth.currentUser, { photoURL: imageUrl });
                    await setDoc(doc(db, 'users', auth.currentUser.uid), { photoURL: imageUrl, updatedAt: new Date().toISOString() }, { merge: true });
                    setProfile(p => ({ ...p, photoURL: imageUrl }));
                    setToast({ type: 'success', message: 'Photo updated.' });
                    setTimeout(() => setToast(null), 3000);
                } catch { setToast({ type: 'error', message: 'Upload failed.' }); setTimeout(() => setToast(null), 3000); }
                finally { setUploading(false); }
            };
            reader.readAsDataURL(file);
        } catch { setUploading(false); }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafaf9' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 32, height: 32, border: '2px solid #e5e5e3', borderTop: '2px solid #1a1a1a', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <p style={{ fontFamily: "'DM Sans', sans-serif", color: '#a3a3a0', fontSize: 13, fontWeight: 500, letterSpacing: '0.02em' }}>Loading profile</p>
            </div>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );

    let tier, nextTier, scansToNext, tierPct;
    if (stats.total >= 30) { tier = 'Master Farmer'; nextTier = null; scansToNext = 0; tierPct = 100; }
    else if (stats.total >= 15) { tier = 'Senior Grower'; nextTier = 'Master Farmer'; scansToNext = 30 - stats.total; tierPct = ((stats.total - 15) / 15) * 100; }
    else if (stats.total >= 5) { tier = 'Pioneer'; nextTier = 'Senior Grower'; scansToNext = 15 - stats.total; tierPct = ((stats.total - 5) / 10) * 100; }
    else { tier = 'Beginner'; nextTier = 'Pioneer'; scansToNext = 5 - stats.total; tierPct = (stats.total / 5) * 100; }

    const memberSince = profile?.createdAt ? fmt(profile.createdAt) : 'N/A';

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Serif+Display:ital@0;1&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #fafaf9;
          --surface: #ffffff;
          --surface-raised: #f5f5f3;
          --border: #e8e8e5;
          --border-subtle: #f0f0ee;
          --ink: #111110;
          --ink-2: #3d3d3a;
          --ink-3: #8a8a85;
          --ink-4: #c4c4be;
          --accent: #1a6b3c;
          --accent-light: #f0f7f3;
          --accent-mid: #a8d4b8;
          --accent-dim: rgba(26,107,60,0.08);
          --danger: #c0392b;
          --danger-bg: #fef5f4;
          --r: 12px;
          --r-lg: 18px;
          --r-xl: 24px;
          --sh: 0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04);
          --sh-md: 0 4px 16px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.04);
        }

        body { background: var(--bg); font-family: 'DM Sans', sans-serif; color: var(--ink); -webkit-font-smoothing: antialiased; }

        /* PAGE */
        .p-page { min-height: 100vh; padding: 88px 24px 100px; }
        @media (max-width: 640px) { .p-page { padding: 72px 16px 100px; } }
        .p-wrap { max-width: 1020px; margin: 0 auto; }

        /* NAV */
        .p-nav { display: flex; align-items: center; justify-content: space-between; margin-bottom: 40px; }
        .p-back { display: flex; align-items: center; gap: 8px; background: none; border: none; cursor: pointer; color: var(--ink-3); font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; transition: color 0.15s; padding: 0; }
        .p-back:hover { color: var(--ink); }
        .p-back-ico { width: 32px; height: 32px; border-radius: var(--r); background: var(--surface); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; }
        .p-badge { display: flex; align-items: center; gap: 6px; padding: 6px 12px; background: var(--accent-light); border: 1px solid var(--accent-mid); border-radius: 100px; font-size: 11.5px; font-weight: 600; color: var(--accent); letter-spacing: 0.01em; }
        .p-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); }

        /* LAYOUT */
        .p-grid { display: grid; grid-template-columns: 280px 1fr; gap: 20px; align-items: start; }
        @media (max-width: 900px) { .p-grid { grid-template-columns: 1fr; } }
        .p-col { display: flex; flex-direction: column; gap: 16px; }

        /* CARD BASE */
        .p-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-xl); box-shadow: var(--sh); overflow: hidden; }

        /* IDENTITY CARD */
        .p-id-hero { padding: 32px 24px 28px; display: flex; flex-direction: column; align-items: center; text-align: center; background: var(--ink); position: relative; }
        .p-id-hero::before { content: ''; position: absolute; inset: 0; background: repeating-linear-gradient(45deg, transparent, transparent 24px, rgba(255,255,255,0.02) 24px, rgba(255,255,255,0.02) 25px); pointer-events: none; }
        .p-avatar-ring { width: 84px; height: 84px; border-radius: 50%; background: rgba(255,255,255,0.06); border: 1.5px solid rgba(255,255,255,0.12); display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; margin-bottom: 16px; flex-shrink: 0; cursor: pointer; transition: border-color 0.2s; }
        .p-avatar-ring:hover { border-color: rgba(255,255,255,0.3); }
        .p-avatar-ring img { width: 100%; height: 100%; object-fit: cover; }
        .p-avatar-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s; }
        .p-avatar-ring:hover .p-avatar-overlay { opacity: 1; }
        .p-id-name { font-family: 'DM Serif Display', serif; font-size: 22px; color: #fff; margin-bottom: 6px; line-height: 1.15; }
        .p-id-tier { font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.4); letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 4px; display: flex; align-items: center; gap: 6px; }
        .p-id-email { font-size: 12px; color: rgba(255,255,255,0.3); font-weight: 400; }

        /* INFO LIST */
        .p-info-list { padding: 8px; display: flex; flex-direction: column; gap: 2px; }
        .p-info-item { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 10px; transition: background 0.12s; }
        .p-info-item:hover { background: var(--surface-raised); }
        .p-info-ico { width: 28px; height: 28px; border-radius: 8px; background: var(--surface-raised); border: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: center; color: var(--ink-3); flex-shrink: 0; }
        .p-info-lbl { font-size: 10px; font-weight: 600; color: var(--ink-4); text-transform: uppercase; letter-spacing: 0.07em; }
        .p-info-val { font-size: 13px; font-weight: 500; color: var(--ink-2); margin-top: 1px; }

        /* HEALTH CARD */
        .p-health-card { padding: 22px; }
        .p-health-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
        .p-health-lbl { font-size: 11px; font-weight: 700; color: var(--ink-4); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px; }
        .p-health-val { font-family: 'DM Serif Display', serif; font-size: 36px; color: var(--accent); line-height: 1; }
        .p-health-sub { font-size: 11.5px; color: var(--ink-3); font-weight: 500; }
        .p-track { height: 4px; background: var(--surface-raised); border-radius: 100px; overflow: hidden; margin-bottom: 6px; }
        .p-fill { height: 100%; border-radius: 100px; background: var(--accent); }
        .p-track-label { font-size: 10.5px; color: var(--ink-4); font-weight: 500; }

        /* STATS ROW */
        .p-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        @media (max-width: 500px) { .p-stats { grid-template-columns: 1fr 1fr; } }
        .p-stat { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); padding: 20px 16px; text-align: center; transition: all 0.2s; cursor: default; }
        .p-stat:hover { border-color: var(--accent-mid); background: var(--accent-light); }
        .p-stat-ico { width: 34px; height: 34px; border-radius: 9px; background: var(--surface-raised); display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; color: var(--ink-3); transition: all 0.2s; }
        .p-stat:hover .p-stat-ico { background: var(--accent-dim); color: var(--accent); }
        .p-stat-val { font-family: 'DM Serif Display', serif; font-size: 26px; color: var(--ink); line-height: 1; margin-bottom: 4px; }
        .p-stat-lbl { font-size: 10px; font-weight: 600; color: var(--ink-4); text-transform: uppercase; letter-spacing: 0.06em; }

        /* FORM CARD */
        .p-form-card { padding: 26px; }
        .p-section-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
        .p-section-title { font-family: 'DM Serif Display', serif; font-size: 20px; color: var(--ink); }
        .p-section-sub { font-size: 12px; color: var(--ink-3); margin-top: 3px; font-weight: 400; }
        .p-icon-btn { width: 32px; height: 32px; border-radius: var(--r); background: var(--surface-raised); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--ink-3); transition: all 0.15s; }
        .p-icon-btn:hover { background: var(--ink); color: #fff; border-color: var(--ink); }
        .p-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media (max-width: 600px) { .p-form-grid { grid-template-columns: 1fr; } }
        .p-field { display: flex; flex-direction: column; gap: 7px; }
        .p-field--full { grid-column: span 2; }
        @media (max-width: 600px) { .p-field--full { grid-column: span 1; } }
        .p-label { font-size: 11px; font-weight: 600; color: var(--ink-3); text-transform: uppercase; letter-spacing: 0.07em; }
        .p-input-wrap { position: relative; }
        .p-input-ico { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--ink-4); pointer-events: none; }
        .p-input { width: 100%; padding: 11px 14px 11px 38px; background: var(--surface-raised); border: 1px solid var(--border); border-radius: var(--r); font-size: 14px; font-family: 'DM Sans', sans-serif; font-weight: 400; color: var(--ink); outline: none; transition: all 0.15s; -webkit-appearance: none; }
        .p-input--with-btn { padding-right: 46px; }
        .p-location-btn { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); width: 30px; height: 30px; border-radius: 8px; border: none; background: var(--accent-light); color: var(--accent); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s; }
        .p-location-btn:hover { background: var(--accent); color: #fff; }
        .p-location-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .p-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-dim); background: var(--surface); }
        .p-input:disabled { opacity: 0.5; cursor: default; }
        .p-save-btn { grid-column: span 2; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 20px; background: var(--ink); color: #fff; border: none; border-radius: var(--r); font-size: 13.5px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.15s; letter-spacing: 0.01em; }
        .p-save-btn:hover { background: var(--accent); }
        .p-save-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        @media (max-width: 600px) { .p-save-btn { grid-column: span 1; } }

        /* LANGUAGE */
        .p-lang-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 8px; }
        .p-lang-btn { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 12px 14px; background: var(--surface-raised); border: 1px solid var(--border); border-radius: var(--r); cursor: pointer; transition: all 0.15s; font-family: 'DM Sans', sans-serif; }
        .p-lang-btn:hover { border-color: var(--accent-mid); background: var(--accent-light); }
        .p-lang-btn--active { background: var(--accent-light); border-color: var(--accent); }
        .p-lang-name { font-size: 13px; font-weight: 600; color: var(--ink); line-height: 1.2; }
        .p-lang-btn--active .p-lang-name { color: var(--accent); }
        .p-lang-sub { font-size: 10px; color: var(--ink-3); font-weight: 400; }

        /* CROPS */
        .p-crops-card { padding: 22px; }
        .p-crops-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .p-crops-link { display: flex; align-items: center; gap: 3px; font-size: 12px; font-weight: 600; color: var(--accent); cursor: pointer; transition: opacity 0.15s; text-decoration: none; }
        .p-crops-link:hover { opacity: 0.7; }
        .p-crop-row { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: var(--r); cursor: pointer; transition: background 0.12s; }
        .p-crop-row:hover { background: var(--surface-raised); }
        .p-crop-ico { width: 36px; height: 36px; border-radius: 9px; background: var(--surface-raised); border: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: center; color: var(--ink-4); flex-shrink: 0; overflow: hidden; }
        .p-crop-ico img { width: 100%; height: 100%; object-fit: cover; }
        .p-crop-name { font-size: 13px; font-weight: 600; color: var(--ink); }
        .p-crop-meta { font-size: 11px; color: var(--ink-3); margin-top: 1px; }
        .p-crop-score { font-size: 13px; font-weight: 700; margin-left: auto; flex-shrink: 0; font-variant-numeric: tabular-nums; }
        .p-crop-score--ok { color: var(--accent); }
        .p-crop-score--warn { color: var(--danger); }
        .p-divider { height: 1px; background: var(--border-subtle); margin: 2px 0; }

        /* SIGNOUT */
        .p-signout-card { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; padding: 22px 24px; border-radius: var(--r-xl); border: 1px solid var(--border); background: var(--surface); }
        .p-signout-title { font-size: 14px; font-weight: 600; color: var(--ink); }
        .p-signout-sub { font-size: 12px; color: var(--ink-4); margin-top: 2px; }
        .p-signout-btn { display: flex; align-items: center; gap: 7px; padding: 10px 20px; background: var(--danger-bg); color: var(--danger); border: 1px solid rgba(192,57,43,0.18); border-radius: var(--r); font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; white-space: nowrap; transition: all 0.15s; }
        .p-signout-btn:hover { background: var(--danger); color: #fff; border-color: var(--danger); }

        /* TOAST */
        .p-toast { position: fixed; bottom: 28px; right: 24px; z-index: 1000; }
        .p-toast-inner { padding: 12px 18px; border-radius: var(--r); font-size: 13px; font-weight: 500; box-shadow: var(--sh-md); display: flex; align-items: center; gap: 8px; }
        .p-toast-inner--success { background: var(--surface); border: 1px solid var(--border); color: var(--ink); }
        .p-toast-inner--error { background: var(--surface); border: 1px solid rgba(192,57,43,0.25); color: var(--danger); }
        .p-toast-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
        .p-toast-dot--success { background: var(--accent); }
        .p-toast-dot--error { background: var(--danger); }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; }
      `}</style>

            <div className="p-page">
                <div className="p-wrap">

                    {/* Nav */}
                    <div className="p-nav">
                        <button className="p-back" onClick={() => navigate('/dashboard')}>
                            <div className="p-back-ico"><ArrowLeft size={14} /></div>
                            Dashboard
                        </button>
                        <div className="p-badge">
                            <span className="p-dot" />
                            {t('prof.accountActive') || 'Account active'}
                        </div>
                    </div>

                    <div className="p-grid">

                        {/* ── LEFT ── */}
                        <div className="p-col">

                            {/* Identity card */}
                            <motion.div
                                className="p-card"
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="p-id-hero">
                                    <div
                                        className="p-avatar-ring"
                                        onClick={() => fileInputRef.current?.click()}
                                        title="Change photo"
                                    >
                                        {profile?.photoURL
                                            ? <img src={profile.photoURL} alt="avatar" />
                                            : <User size={30} color="rgba(255,255,255,0.3)" />}
                                        <div className="p-avatar-overlay">
                                            {uploading
                                                ? <RefreshCw size={14} color="#fff" className="spin" />
                                                : <Camera size={14} color="#fff" />}
                                        </div>
                                    </div>
                                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                                    <h2 className="p-id-name">{profile?.name || 'Farmer'}</h2>
                                    <div className="p-id-tier"><Award size={10} /> {tier}</div>
                                    <p className="p-id-email">{profile?.email}</p>
                                </div>

                                <div className="p-info-list">
                                    {[
                                        { ico: <Mail size={13} />, label: t('prof.email') || 'Email', value: profile?.email || '—' },
                                        { ico: <Phone size={13} />, label: t('prof.phone') || 'Phone', value: profile?.phone || 'Not set' },
                                        { ico: <MapPin size={13} />, label: t('prof.location') || 'Location', value: profile?.location || 'Not set' },
                                        { ico: <Clock size={13} />, label: t('prof.member') || 'Member since', value: memberSince },
                                    ].map((r, i) => (
                                        <div key={i} className="p-info-item">
                                            <div className="p-info-ico">{r.ico}</div>
                                            <div>
                                                <p className="p-info-lbl">{r.label}</p>
                                                <p className="p-info-val">{r.value}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Health card */}
                            <motion.div
                                className="p-card"
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.06 }}
                            >
                                <div className="p-health-card">
                                    <div className="p-health-top">
                                        <div>
                                            <p className="p-health-lbl">{t('prof.portfolioHealth') || 'Portfolio Health'}</p>
                                            <p className="p-health-sub">{stats.total} crop{stats.total !== 1 ? 's' : ''} tracked</p>
                                        </div>
                                        <p className="p-health-val">{stats.avgHealth}%</p>
                                    </div>

                                    <div className="p-track">
                                        <motion.div
                                            className="p-fill"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${stats.avgHealth}%` }}
                                            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                                        />
                                    </div>
                                    <p className="p-track-label" style={{ marginBottom: 16 }}>Avg health score</p>

                                    <div className="p-track">
                                        <motion.div
                                            className="p-fill"
                                            style={{ background: '#8a8a85' }}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${tierPct}%` }}
                                            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                                        />
                                    </div>
                                    <p className="p-track-label">
                                        {tier}{nextTier ? ` → ${nextTier} (${scansToNext} scans)` : ' — Max tier'}
                                    </p>
                                </div>
                            </motion.div>
                        </div>

                        {/* ── RIGHT ── */}
                        <div className="p-col">

                            {/* Stats */}
                            <motion.div
                                className="p-stats"
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                {[
                                    { ico: <Leaf size={15} />, val: stats.total, label: t('prof.cropsTracked') || 'Crops' },
                                    { ico: <CheckCircle2 size={15} />, val: stats.healthy, label: t('dash.healthyCrops') || 'Healthy' },
                                    { ico: <BarChart3 size={15} />, val: `${stats.avgHealth}%`, label: t('dash.avgHealth') || 'Avg Health' },
                                ].map((s, i) => (
                                    <div key={i} className="p-stat">
                                        <div className="p-stat-ico">{s.ico}</div>
                                        <p className="p-stat-val">{s.val}</p>
                                        <p className="p-stat-lbl">{s.label}</p>
                                    </div>
                                ))}
                            </motion.div>

                            {/* Edit form */}
                            <motion.div
                                className="p-card"
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.05 }}
                            >
                                <div className="p-form-card">
                                    <div className="p-section-head">
                                        <div>
                                            <h3 className="p-section-title">{t('prof.title') || 'Profile Settings'}</h3>
                                            <p className="p-section-sub">{t('prof.update') || 'Update your personal information'}</p>
                                        </div>
                                        <button
                                            className="p-icon-btn"
                                            onClick={() => setEditing(e => !e)}
                                            title={editing ? 'Cancel' : 'Edit'}
                                        >
                                            {editing ? <X size={14} /> : <Edit2 size={14} />}
                                        </button>
                                    </div>

                                    <form onSubmit={handleSave}>
                                        <div className="p-form-grid">
                                            <div className="p-field">
                                                <label className="p-label">{t('prof.name') || 'Name'}</label>
                                                <div className="p-input-wrap">
                                                    <User size={13} className="p-input-ico" />
                                                    <input className="p-input" type="text" placeholder="Your name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} disabled={!editing} />
                                                </div>
                                            </div>

                                            <div className="p-field">
                                                <label className="p-label">{t('prof.phone') || 'Phone'}</label>
                                                <div className="p-input-wrap">
                                                    <Phone size={13} className="p-input-ico" />
                                                    <input className="p-input" type="tel" placeholder="+91 00000 00000" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} disabled={!editing} />
                                                </div>
                                            </div>

                                            <div className="p-field p-field--full">
                                                <label className="p-label">{t('prof.location') || 'Location'}</label>
                                                <div className="p-input-wrap">
                                                    <MapPin size={13} className="p-input-ico" />
                                                    <input className={`p-input ${editing ? 'p-input--with-btn' : ''}`} type="text" placeholder="Village, District, State" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} disabled={!editing} />
                                                    {editing && (
                                                        <button 
                                                            type="button" 
                                                            className="p-location-btn" 
                                                            onClick={handleFetchLocation}
                                                            title="Use Live Location"
                                                        >
                                                            <LocateFixed size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            <AnimatePresence>
                                                {editing && (
                                                    <motion.button
                                                        type="submit"
                                                        className="p-save-btn"
                                                        disabled={saving}
                                                        initial={{ opacity: 0, y: 6 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: 6 }}
                                                        transition={{ duration: 0.15 }}
                                                    >
                                                        {saving
                                                            ? <><RefreshCw size={13} className="spin" /> {t('prof.saving') || 'Saving...'}</>
                                                            : <><Check size={13} /> {t('prof.saveChanges') || 'Save changes'}</>}
                                                    </motion.button>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </form>
                                </div>
                            </motion.div>

                            {/* Language */}
                            <motion.div
                                className="p-card"
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.08 }}
                            >
                                <div className="p-form-card">
                                    <div className="p-lang-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                                        <div>
                                            <h3 className="p-section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <Globe size={18} style={{ color: 'var(--accent)' }} />
                                                {t('prof.language') || 'Language'}
                                            </h3>
                                            <p className="p-section-sub">{t('prof.langDesc') || 'Choose your preferred language'}</p>
                                        </div>
                                    </div>

                                    <div className="p-lang-dropdown-wrap" style={{ position: 'relative' }}>
                                        <select
                                            value={language}
                                            onChange={(e) => setLanguage(e.target.value)}
                                            className="p-lang-select"
                                            style={{
                                                width: '100%',
                                                padding: '14px 44px 14px 16px',
                                                fontSize: 15,
                                                fontWeight: 700,
                                                fontFamily: 'Nunito, sans-serif',
                                                color: 'var(--ink)',
                                                background: 'var(--surface-2, #f7f9f6)',
                                                border: '2px solid var(--accent, #2e7d4f)',
                                                borderRadius: 14,
                                                outline: 'none',
                                                cursor: 'pointer',
                                                appearance: 'none',
                                                WebkitAppearance: 'none',
                                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%232e7d4f' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                                                backgroundRepeat: 'no-repeat',
                                                backgroundPosition: 'right 14px center',
                                                backgroundSize: '18px',
                                                boxShadow: '0 2px 8px rgba(46,125,79,0.10)',
                                                transition: 'border-color 0.2s, box-shadow 0.2s',
                                            }}
                                        >
                                            {languages.map(lang => (
                                                <option key={lang.code} value={lang.code}>
                                                    {lang.flag} {lang.nativeName} — {lang.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Recent crops */}
                            {crops.length > 0 && (
                                <motion.div
                                    className="p-card"
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: 0.1 }}
                                >
                                    <div className="p-crops-card">
                                        <div className="p-crops-head">
                                            <h3 className="p-section-title" style={{ fontSize: 18 }}>{t('prof.recentCrops') || 'Recent Crops'}</h3>
                                            <span className="p-crops-link" onClick={() => navigate('/inventory')}>
                                                {t('prof.viewAll') || 'View all'} <ChevronRight size={12} />
                                            </span>
                                        </div>
                                        {crops.map((c, i) => {
                                            const ok = c.status === 'Healthy';
                                            return (
                                                <div key={c.id}>
                                                    {i > 0 && <div className="p-divider" />}
                                                    <div className="p-crop-row" onClick={() => navigate('/inventory')}>
                                                        <div className="p-crop-ico">
                                                            {c.imageUrl ? <img src={c.imageUrl} alt={c.name} /> : <Leaf size={14} />}
                                                        </div>
                                                        <div>
                                                            <p className="p-crop-name">{c.name}</p>
                                                            <p className="p-crop-meta">{fmt(c.createdAt)} · {c.status}</p>
                                                        </div>
                                                        <p className={`p-crop-score ${ok ? 'p-crop-score--ok' : 'p-crop-score--warn'}`}>{c.healthScore}%</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}

                            {/* Sign out */}
                            <motion.div
                                className="p-signout-card"
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.14 }}
                            >
                                <div>
                                    <p className="p-signout-title">Sign out</p>
                                    <p className="p-signout-sub">{t('prof.signoutMsg') || 'You can sign back in at any time'}</p>
                                </div>
                                <button className="p-signout-btn" onClick={() => { signOut(auth); navigate('/login'); }}>
                                    <LogOut size={13} /> {t('prof.signout') || 'Sign out'}
                                </button>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>


            <AppFooter />

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        className="p-toast"
                        initial={{ opacity: 0, y: 12, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className={`p-toast-inner p-toast-inner--${toast.type}`}>
                            <span className={`p-toast-dot p-toast-dot--${toast.type}`} />
                            {toast.message}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ProfilePage;