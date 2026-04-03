import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Camera, RefreshCw, CheckCircle2, AlertCircle, AlertTriangle,
  Save, Sparkles, ShieldCheck, Zap, Scan, Activity, FileText, ArrowRight, X, TrendingUp
} from 'lucide-react';
import { mockApi } from '../services/api';
import { db, auth } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import AppFooter from '../components/AppFooter';

import { compressImage } from '../utils/imageUtils';
import { useLanguage } from '../context/LanguageContext';

const DetectionPage = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [nickname, setNickname] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [stageIdx, setStageIdx] = useState(0);
  const [scanTime, setScanTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const stages = [t('inv.stage1'), t('det.analyzingLeaf'), t('det.comparingDatabase'), t('det.generatingReport')];

  useEffect(() => {
    if (!loading) { setStageIdx(0); return; }
    const timer = setInterval(() => setStageIdx(p => Math.min(p + 1, stages.length - 1)), 250);
    return () => clearInterval(timer);
  }, [loading]);

  useEffect(() => {
    let interval;
    if (timerActive) {
      interval = setInterval(() => {
        setScanTime(prev => +(prev + 0.1).toFixed(1));
      }, 100);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  const currentContent = result ? (result[language] || result.en || {}) : {};

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
      setError(null);
      setSavedSuccess(false);
    }
  };

  const analyzeImage = async () => {
    if (!image) return;
    setLoading(true);
    setResult(null);
    setError(null);
    setScanTime(0);
    setTimerActive(true);
    
    const localPreview = preview || URL.createObjectURL(image);

    try {
      const b64 = await compressImage(image, { maxWidth: 640, maxHeight: 640, quality: 0.6 });
      
      const detectionPromise = mockApi.predictDisease(b64, language);
      const uploadPromise = mockApi.uploadToImgBB(b64).catch(e => null);

      const data = await Promise.race([
        detectionPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error("DETECTION_TIMEOUT")), 60000))
      ]);

      setTimerActive(false); // Stop timer immediately on data

      const imgUrl = await Promise.race([
        uploadPromise,
        new Promise(resolve => setTimeout(() => resolve(null), 2500))
      ]) || localPreview;

      data.imgUrl = imgUrl;
      setResult(data);
    } catch (err) {
      setTimerActive(false);
      console.error("Scanning error:", err);
      setError(err.message === "DETECTION_TIMEOUT" ? "Scan took too long. Please try again." : t('det.errGeneric'));
    } finally {
      setLoading(false);
    }
  };

  const saveToDashboard = async () => {
    if (!auth || !db) {
      setError(t('det.errOffline'));
      return;
    }
    if (!result || !auth.currentUser) {
      setError(t('det.errSignIn'));
      return;
    }
    setSaving(true);
    try {
      const scanTimestamp = new Date().toISOString();
      await addDoc(collection(db, "crops"), {
        name: nickname || result.cropName,
        problem: result.diagnosis,
        type: "Scan",
        status: result.status,
        diagnosis: result.diagnosis,
        summary: result.en?.summary || '',
        solve: result.en?.solution?.map(s => s.detail).join('. ') || '',
        prevent: result.en?.prevention?.map(p => p.detail).join('. ') || '',
        healthScore: result.healthScore || 0,
        severity: result.severity,
        confidence: result.confidence,
        imageUrl: result.imgUrl,
        lastScanned: scanTimestamp,
        lastScanFull: {
          en: result.en || result.lastScanFull?.en || {},
          hi: result.hi || result.en || {},
          te: result.te || result.en || {},
          ta: result.ta || result.en || {},
          bn: result.bn || result.en || {},
          mr: result.mr || result.en || {},
          cropName: result.cropName,
          diagnosis: result.diagnosis,
          severity: result.severity,
          confidence: result.confidence,
          healthScore: result.healthScore,
          status: result.status,
          imgUrl: result.imgUrl,
        },
        scanHistory: [
          { score: result.healthScore || 0, date: scanTimestamp, status: result.status, diagnosis: result.diagnosis }
        ],
        userId: auth.currentUser.uid,
        createdAt: scanTimestamp,
      });
      setSavedSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setError(t('det.errSave'));
    } finally {
      setSaving(false);
    }
  };

  const severityColor = (s) => {
    const sev = String(s).toLowerCase();
    if (sev === 'critical') return { bg: '#2d1414', border: '#7f1d1d', text: '#fca5a5', dot: '#ef4444' };
    if (sev === 'high') return { bg: '#2d1f0e', border: '#78350f', text: '#fcd34d', dot: '#f59e0b' };
    return { bg: '#0e2118', border: '#14532d', text: '#6ee7b7', dot: '#10b981' };
  };

  return (
    <div className="dp-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=JetBrains+Mono:wght@400;500;700&family=Outfit:wght@400;500;600;700;800&display=swap');

        .dp-root {
          min-height: 100vh;
          background: #f4f7f2;
          color: #1a2e14;
          font-family: 'Outfit', sans-serif;
          padding-top: 88px;
          padding-bottom: 80px;
          position: relative;
          overflow-x: hidden;
        }

        /* ── grid texture bg ── */
        .dp-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(46,160,80,.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(46,160,80,.06) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
          z-index: 0;
        }

        /* ── glows ── */
        .dp-glow-tl {
          position: fixed; top: -120px; left: -120px;
          width: 500px; height: 500px; border-radius: 50%;
          background: radial-gradient(circle, rgba(34,197,94,.13) 0%, transparent 70%);
          pointer-events: none; z-index: 0;
        }
        .dp-glow-br {
          position: fixed; bottom: -100px; right: -100px;
          width: 420px; height: 420px; border-radius: 50%;
          background: radial-gradient(circle, rgba(234,179,8,.10) 0%, transparent 70%);
          pointer-events: none; z-index: 0;
        }

        .dp-wrap {
          max-width: 1140px;
          margin: 0 auto;
          padding: 0 24px;
          position: relative;
          z-index: 1;
        }

        /* ── HEADER ── */
        .dp-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 48px;
          gap: 16px;
        }
        .dp-header-eyebrow {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .18em;
          color: #4ade80;
          text-transform: uppercase;
          margin-bottom: 10px;
        }
        .dp-header-eyebrow-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #4ade80;
          animation: dp-pulse 2s ease-in-out infinite;
        }
        @keyframes dp-pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
        .dp-title {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(36px, 6vw, 64px);
          font-style: italic;
          line-height: 1;
          color: #14281a;
          margin: 0;
        }
        .dp-title-accent {
          font-style: normal;
          background: linear-gradient(120deg, #4ade80 0%, #eab308 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .dp-close-btn {
          width: 44px; height: 44px; border-radius: 12px;
          background: #ffffff; border: 1px solid #d4e4cc;
          color: #5a7850; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all .18s; flex-shrink: 0;
        }
        .dp-close-btn:hover { background: #1e2419; color: #1a2e14; border-color: #3d4f35; }

        /* ── MAIN GRID ── */
        .dp-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          align-items: start;
        }
        @media (max-width: 900px) {
          .dp-grid { grid-template-columns: 1fr; }
        }

        /* ── UPLOAD PANEL ── */
        .dp-upload-panel {
          background: #ffffff;
          border: 1px solid #dcebd6;
          border-radius: 24px;
          overflow: hidden;
        }
        .dp-panel-label {
          padding: 16px 20px 14px;
          border-bottom: 1px solid #e8f0e4;
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .16em;
          color: #4a7a40;
          text-transform: uppercase;
        }
        .dp-panel-label-num {
          width: 20px; height: 20px; border-radius: 6px;
          background: #e8f5e2; border: 1px solid #b8ddb0;
          display: flex; align-items: center; justify-content: center;
          font-size: 9px; color: #16a34a; font-weight: 700;
        }

        /* image frame */
        .dp-img-frame {
          position: relative;
          aspect-ratio: 1;
          margin: 16px;
          border-radius: 16px;
          overflow: hidden;
          background: #f8faf6;
          border: 1px dashed #c8ddc0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: border-color .2s;
        }
        .dp-img-frame.has-image {
          border-style: solid;
          border-color: #6ab860;
        }
        .dp-img-frame img {
          width: 100%; height: 100%; object-fit: cover;
          border-radius: 14px;
        }
        .dp-img-overlay {
          position: absolute; inset: 0;
          background: rgba(0,0,0,.55);
          display: flex; align-items: center; justify-content: center;
          opacity: 0; transition: opacity .2s;
          border-radius: 14px;
        }
        .dp-img-frame.has-image:hover .dp-img-overlay { opacity: 1; }
        .dp-img-refresh {
          width: 44px; height: 44px; border-radius: 50%;
          background: rgba(255,255,255,.15);
          border: none; color: #fff; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background .15s;
        }
        .dp-img-refresh:hover { background: rgba(255,255,255,.28); }

        /* upload label */
        .dp-upload-label {
          display: flex; flex-direction: column;
          align-items: center; gap: 16px;
          cursor: pointer; padding: 32px;
          width: 100%;
        }
        .dp-upload-icon {
          width: 64px; height: 64px; border-radius: 18px;
          background: #f0f8ec; border: 1px solid #d0e8c8;
          display: flex; align-items: center; justify-content: center;
          color: #6a9060; transition: all .18s;
        }
        .dp-upload-label:hover .dp-upload-icon {
          background: #e2f5dc; border-color: #4ade80; color: #16a34a;
        }
        .dp-upload-text-main {
          font-size: 12px; font-weight: 700;
          color: #2a4a22; letter-spacing: .06em;
          text-transform: uppercase;
        }
        .dp-upload-text-sub {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; color: #6a9060;
          letter-spacing: .1em; text-transform: uppercase;
          margin-top: 4px;
        }

        /* scan line animation */
        .dp-scanline {
          position: absolute; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #4ade80, transparent);
          box-shadow: 0 0 12px #4ade8066;
          z-index: 10;
        }

        /* scan button */
        .dp-scan-btn {
          margin: 0 16px 16px;
          width: calc(100% - 32px);
          padding: 16px;
          border-radius: 14px;
          border: none;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px; font-weight: 700;
          letter-spacing: .14em; text-transform: uppercase;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          transition: all .18s;
        }
        .dp-scan-btn.ready {
          background: linear-gradient(135deg, #1a3d18, #2d6b28);
          color: #a7f3d0;
          box-shadow: 0 4px 24px rgba(74,222,128,.18);
        }
        .dp-scan-btn.ready:hover {
          background: linear-gradient(135deg, #1f4d1c, #347a2e);
          box-shadow: 0 6px 32px rgba(74,222,128,.26);
        }
        .dp-scan-btn.disabled {
          background: #f0f2ee;
          color: #b8c8b0;
          cursor: not-allowed;
        }

        /* ── RESULT PANEL ── */
        .dp-result-panel {
          background: #ffffff;
          border: 1px solid #dcebd6;
          border-radius: 24px;
          overflow: hidden;
        }

        /* result header */
        .dp-result-header {
          padding: 20px 24px;
          border-bottom: 1px solid #e8f0e4;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .dp-result-crop {
          font-family: 'DM Serif Display', serif;
          font-size: 28px;
          font-style: italic;
          color: #14281a;
          line-height: 1;
        }
        .dp-result-crop-accent {
          background: linear-gradient(120deg, #4ade80, #eab308);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-style: normal;
        }
        .dp-result-meta {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px; color: #4a7a40;
          letter-spacing: .1em; text-transform: uppercase;
          margin-top: 4px;
        }
        .dp-severity-badge {
          padding: 6px 14px;
          border-radius: 100px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px; font-weight: 700;
          letter-spacing: .12em; text-transform: uppercase;
          border: 1px solid;
          white-space: nowrap;
        }

        /* health bar */
        .dp-health-bar-wrap {
          padding: 16px 24px;
          border-bottom: 1px solid #e8f0e4;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .dp-health-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px; color: #4a7a40;
          letter-spacing: .12em; text-transform: uppercase;
          white-space: nowrap;
        }
        .dp-health-track {
          flex: 1; height: 6px; background: #e0ead8;
          border-radius: 100px; overflow: hidden;
        }
        .dp-health-fill {
          height: 100%; border-radius: 100px;
          background: linear-gradient(90deg, #16a34a, #4ade80);
          transition: width .8s cubic-bezier(.4,0,.2,1);
        }
        .dp-health-score {
          font-family: 'DM Serif Display', serif;
          font-size: 22px; color: #4ade80;
          line-height: 1;
        }

        /* summary */
        .dp-summary {
          margin: 16px 24px;
          padding: 16px 18px;
          background: #f8faf6;
          border-radius: 14px;
          border-left: 3px solid #7ac870;
        }
        .dp-summary-text {
          font-size: 13px; font-weight: 500;
          color: #4a6844; line-height: 1.65;
          font-style: italic;
        }

        /* sections */
        .dp-section {
          padding: 0 24px 16px;
        }
        .dp-section-title {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px; font-weight: 700;
          color: #4a7a40; letter-spacing: .16em;
          text-transform: uppercase;
          padding-bottom: 10px;
          border-bottom: 1px solid #e8f0e4;
          margin-bottom: 12px;
          display: flex; align-items: center; gap: 8px;
        }
        .dp-section-num {
          width: 18px; height: 18px; border-radius: 5px;
          background: #f0f2ee; border: 1px solid #2a4020;
          display: flex; align-items: center; justify-content: center;
          font-size: 8px; color: #4ade80;
        }

        /* solution steps */
        .dp-step {
          display: flex; gap: 12px;
          padding: 10px 12px;
          border-radius: 10px;
          background: #f8faf6;
          margin-bottom: 6px;
          border: 1px solid #e4eed8;
          transition: border-color .15s;
        }
        .dp-step:hover { border-color: #b0d4a8; }
        .dp-step-num {
          width: 22px; height: 22px; border-radius: 7px;
          background: #e4f5de; border: 1px solid #b8ddb0;
          display: flex; align-items: center; justify-content: center;
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px; color: #16a34a; font-weight: 700;
          flex-shrink: 0; margin-top: 1px;
        }
        .dp-step-title {
          font-size: 11px; font-weight: 700;
          color: #1a3a14; letter-spacing: .04em;
          text-transform: uppercase;
          margin-bottom: 3px;
        }
        .dp-step-detail {
          font-size: 11px; font-weight: 400;
          color: #5a7850; line-height: 1.5;
        }
        .dp-step-urgency {
          display: inline-block;
          margin-top: 4px;
          padding: 2px 8px;
          background: #f0f2ee;
          border-radius: 4px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 8px; color: #4a6040;
          letter-spacing: .08em; text-transform: uppercase;
          font-style: italic;
        }

        /* two col inside result */
        .dp-two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          padding: 0 24px 16px;
        }
        @media (max-width: 600px) {
          .dp-two-col { grid-template-columns: 1fr; }
        }

        /* material cards */
        .dp-material-card {
          padding: 14px 16px;
          border-radius: 12px;
          border: 1px solid;
        }
        .dp-material-card.nutrient {
          background: #f0faf4;
          border-color: #b0d8bc;
        }
        .dp-material-card.protection {
          background: #fff4f4;
          border-color: #f0b8b8;
        }
        .dp-material-tag {
          font-family: 'JetBrains Mono', monospace;
          font-size: 8px; font-weight: 700;
          letter-spacing: .14em; text-transform: uppercase;
          margin-bottom: 6px;
          display: flex; align-items: center; gap: 6px;
        }
        .dp-material-tag.nutrient { color: #4ade80; }
        .dp-material-tag.protection { color: #dc2626; }
        .dp-material-tag-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: currentColor;
        }
        .dp-material-text {
          font-size: 11px; font-weight: 500; line-height: 1.5;
        }
        .dp-material-card.nutrient .dp-material-text { color: #166534; }
        .dp-material-card.protection .dp-material-text { color: #991b1b; }

        /* prevention */
        .dp-prevention-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 8px;
          padding: 0 24px 20px;
        }
        .dp-prev-card {
          padding: 12px 14px;
          background: #f0f8ff;
          border: 1px solid #c8dff0;
          border-radius: 12px;
          display: flex; gap: 10px;
        }
        .dp-prev-num {
          width: 20px; height: 20px; border-radius: 6px;
          background: #dbeafe; border: 1px solid #93c5fd;
          display: flex; align-items: center; justify-content: center;
          font-family: 'JetBrains Mono', monospace;
          font-size: 8px; color: #38bdf8; font-weight: 700;
          flex-shrink: 0;
        }
        .dp-prev-title {
          font-size: 10px; font-weight: 700;
          color: #1e3a5a; letter-spacing: .04em;
          text-transform: uppercase; margin-bottom: 3px;
        }
        .dp-prev-detail {
          font-size: 10px; color: #4a6880; line-height: 1.5;
        }

        /* save area */
        .dp-save-area {
          padding: 20px 24px 24px;
          border-top: 1px solid #e4eed8;
          display: flex; flex-direction: column; gap: 12px;
        }
        .dp-nickname-wrap {
          position: relative;
        }
        .dp-nickname-icon {
          position: absolute; left: 14px; top: 50%;
          transform: translateY(-50%); color: #6a9060;
          pointer-events: none;
        }
        .dp-nickname-input {
          width: 100%;
          background: #f8faf6;
          border: 1px solid #dcebd6;
          border-radius: 12px;
          padding: 13px 14px 13px 40px;
          font-family: 'Outfit', sans-serif;
          font-size: 13px; font-weight: 500;
          color: #1a3a14;
          outline: none;
          transition: border-color .15s;
        }
        .dp-nickname-input::placeholder { color: #6a9060; }
        .dp-nickname-input:focus { border-color: #6ab860; }
        .dp-save-btn {
          width: 100%;
          padding: 15px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #14401a, #1f6b28);
          color: #fff;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px; font-weight: 700;
          letter-spacing: .14em; text-transform: uppercase;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          transition: all .18s;
          box-shadow: 0 4px 20px rgba(74,222,128,.20);
        }
        .dp-save-btn:hover {
          background: linear-gradient(135deg, #155e1a, #1f8028);
          box-shadow: 0 6px 28px rgba(74,222,128,.3);
        }
        .dp-save-btn:disabled { opacity: .4; cursor: not-allowed; }

        /* success */
        .dp-success {
          margin: 20px 24px 24px;
          padding: 24px;
          background: linear-gradient(135deg, #f0faf4, #e4f7ec);
          border: 1px solid #b0d8bc;
          border-radius: 16px;
          text-align: center;
          display: flex; flex-direction: column;
          align-items: center; gap: 10px;
        }
        .dp-success-icon {
          width: 48px; height: 48px; border-radius: 50%;
          background: #d1fae5; border: 1px solid #6ee7b7;
          display: flex; align-items: center; justify-content: center;
          color: #4ade80;
        }
        .dp-success-title {
          font-family: 'DM Serif Display', serif;
          font-size: 20px; font-style: italic; color: #065f46;
        }
        .dp-success-sub {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px; color: #4a7a40;
          letter-spacing: .12em; text-transform: uppercase;
        }

        /* error */
        .dp-error {
          padding: 48px 32px;
          text-align: center;
          display: flex; flex-direction: column;
          align-items: center; gap: 16px;
        }
        .dp-error-icon {
          width: 56px; height: 56px; border-radius: 16px;
          background: #fff4f4; border: 1px solid #f0b8b8;
          display: flex; align-items: center; justify-content: center;
          color: #dc2626;
        }
        .dp-error-text {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; color: #dc2626;
          letter-spacing: .1em; text-transform: uppercase;
          line-height: 1.6;
        }

        /* idle state */
        .dp-idle {
          padding: 64px 32px;
          text-align: center;
          display: flex; flex-direction: column;
          align-items: center; gap: 16px;
        }
        .dp-idle-icon {
          width: 64px; height: 64px; border-radius: 20px;
          background: #f8faf6; border: 1px dashed #c8d8c0;
          display: flex; align-items: center; justify-content: center;
          color: #c0d0b8;
        }
        .dp-idle-text {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; color: #a8c0a0;
          letter-spacing: .14em; text-transform: uppercase;
        }
      `}</style>

      <div className="dp-glow-tl" />
      <div className="dp-glow-br" />

      <div className="dp-wrap">
        {/* ── HEADER ── */}
        <motion.header
          className="dp-header"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div>
            <div className="dp-header-eyebrow">
              <span className="dp-header-eyebrow-dot" />
              {t('det.fieldHealthScanner')}
            </div>
            <h1 className="dp-title">
              {t('det.title')} <span className="dp-title-accent"></span>
            </h1>
          </div>
          <button className="dp-close-btn" onClick={() => navigate('/dashboard')}>
            <X size={20} />
          </button>
        </motion.header>

        {/* ── MAIN GRID ── */}
        <div className="dp-grid">

          {/* ── LEFT: Upload Panel ── */}
          <motion.div
            className="dp-upload-panel"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="dp-panel-label">
              <span className="dp-panel-label-num">01</span>
              {t('det.selectBioImagery')}
            </div>

            <div className={`dp-img-frame ${preview ? 'has-image' : ''}`}>
              {preview ? (
                <>
                  <motion.img
                    initial={{ scale: 1.08 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                    src={preview}
                    alt="preview"
                  />
                  <div className="dp-img-overlay">
                    <button
                      className="dp-img-refresh"
                      onClick={() => { setImage(null); setPreview(null); setResult(null); }}
                    >
                      <RefreshCw size={20} />
                    </button>
                  </div>
                </>
              ) : (
                <label className="dp-upload-label">
                  <div className="dp-upload-icon">
                    <Upload size={28} />
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p className="dp-upload-text-main">{t('det.upload')}</p>
                    <p className="dp-upload-text-sub">{t('det.subtitle')}</p>
                  </div>
                  <input type="file" style={{ display: 'none' }} accept="image/*" onChange={handleImageChange} />
                </label>
              )}

              <AnimatePresence>
                {loading && (
                  <motion.div
                    className="dp-scanline"
                    initial={{ top: '0%' }}
                    animate={{ top: '100%' }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  />
                )}
              </AnimatePresence>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={analyzeImage}
              disabled={!image || loading}
              className={`dp-scan-btn ${!image || loading ? 'disabled' : 'ready'}`}
            >
              {loading
                ? <><RefreshCw size={16} style={{ animation: 'spin 1.5s linear infinite' }} /> {stages[stageIdx]} ({scanTime}s)</>
                : result
                  ? <><RefreshCw size={16} /> Scan Again (Last: {scanTime}s)</>
                  : <><Scan size={16} /> {t('det.analyze')} <ArrowRight size={14} /></>
              }
            </motion.button>
          </motion.div>

          {/* ── RIGHT: Result Panel ── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="dp-result-panel"
                >
                  {/* scan speed info badge */}
                  <div className="mx-4 mt-4 p-3 bg-[#f0faf4] border border-[#d1fae5] rounded-[18px] flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded-full bg-[#34d399] flex items-center justify-center">
                         <Zap size={12} className="text-white fill-white" />
                       </div>
                       <div>
                         <span className="block text-[8px] font-bold text-[#065f46] uppercase tracking-[0.15em]">AI SCAN SPEED</span>
                         <span className="block text-[10px] font-bold text-[#10b981]">Ultra Fast Diagnosis</span>
                       </div>
                    </div>
                    <div className="text-right">
                       <span className="block font-mono text-[14px] font-black text-[#065f46] leading-none">{scanTime}s</span>
                       <span className="block text-[8px] text-[#059669] font-medium uppercase mt-1">Total Time</span>
                    </div>
                  </div>

                  {/* Uploaded Image Preview */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Camera size={14} className="text-gray-400" />
                      <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{t('det.scannedLeaf')}</span>
                    </div>
                    <div className="w-full h-32 bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                      {preview && (
                        <img
                          src={preview}
                          alt="Scanned leaf"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  </div>

                  {/* result header */}
                  <div className="dp-result-header">
                    <div>
                      <div className="dp-result-crop">
                        <span className="dp-result-crop-accent">{currentContent.cropName || result.cropName}</span>
                      </div>
                      <div className="text-sm font-bold text-gray-700 mt-1">
                        {currentContent.diagnosis || result.diagnosis}
                      </div>
                      <div className="dp-result-meta">
                        {t('det.confidence')}: {result.confidence}% · {result.status} · {scanTime}s
                      </div>
                    </div>
                    <div
                      className="dp-severity-badge"
                      style={{
                        background: severityColor(result.severity).bg,
                        borderColor: severityColor(result.severity).border,
                        color: severityColor(result.severity).text,
                      }}
                    >
                      <span style={{ color: severityColor(result.severity).dot, marginRight: 6 }}>●</span>
                      {t(`common.${String(result.severity).toLowerCase()}`)}
                    </div>
                  </div>

                  {/* health bar */}
                  <div className="dp-health-bar-wrap">
                    <span className="dp-health-label">{t('det.trueHealth')}</span>
                    <div className="dp-health-track">
                      <motion.div
                        className="dp-health-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${result.healthScore}%` }}
                        transition={{ duration: 0.9, ease: 'easeOut' }}
                      />
                    </div>
                    <span className="dp-health-score">{result.healthScore}%</span>
                  </div>

                  {/* summary */}
                  {/* deep analysis / summary */}
                  {currentContent.summary && (
                    <div className="dp-summary">
                      <div className="flex items-center gap-2 mb-2 text-[10px] font-bold text-[#16a34a] uppercase tracking-widest">
                        <Activity size={12} /> {t('det.deepAnalysis')}
                      </div>
                      <p className="dp-summary-text">"{currentContent.summary}"</p>
                    </div>
                  )}

                  <div className="dp-section">
                    <div className="dp-section-title">
                      <span className="dp-section-num">02</span>
                      {t('det.solution')}
                    </div>
                    {currentContent.solution?.map((s, idx) => (
                      <div key={idx} className="dp-step">
                        <span className="dp-step-num">{s.step}</span>
                        <div>
                          <p className="dp-step-title">{s.title}</p>
                          <p className="dp-step-detail">{s.detail}</p>
                          <span className="dp-step-urgency">{s.urgency}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 03 material */}
                  {(currentContent.fertilizer || currentContent.pesticide) && (
                    <div className="dp-two-col">
                      {currentContent.fertilizer && (
                        <div className="dp-material-card nutrient">
                          <div className="dp-material-tag nutrient">
                            <span className="dp-material-tag-dot" />
                            {t('det.nutrientProtocol')}
                          </div>
                          <p className="dp-material-text">{currentContent.fertilizer}</p>
                        </div>
                      )}
                      {currentContent.pesticide && (
                        <div className="dp-material-card protection">
                          <div className="dp-material-tag protection">
                            <span className="dp-material-tag-dot" />
                            {t('det.medicine')}
                          </div>
                          <p className="dp-material-text">{currentContent.pesticide}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 04 prevention */}
                  {currentContent.prevention?.length > 0 && (
                    <>
                      <div className="dp-section" style={{ paddingBottom: 8 }}>
                        <div className="dp-section-title">
                          <span className="dp-section-num" style={{ background: '#0a1828', borderColor: '#1a3550', color: '#38bdf8' }}>04</span>
                          {t('det.prevention')}
                        </div>
                      </div>
                      <div className="dp-prevention-grid">
                        {currentContent.prevention.map((prev, idx) => {
                          const isObj = typeof prev === 'object' && prev !== null;
                          return (
                            <div key={idx} className="dp-prev-card">
                              <span className="dp-prev-num">{isObj ? prev.step : idx + 1}</span>
                              <div>
                                <p className="dp-prev-title">{isObj ? prev.title : t('det.defenseStrategy')}</p>
                                <p className="dp-prev-detail">{isObj ? prev.detail : prev}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {/* save / success */}
                  {!savedSuccess ? (
                    <div className="dp-save-area">
                      <div className="dp-nickname-wrap">
                        <FileText size={15} className="dp-nickname-icon" />
                        <input
                          type="text"
                          placeholder={t('det.researchLabel')}
                          className="dp-nickname-input"
                          value={nickname}
                          onChange={e => setNickname(e.target.value)}
                        />
                      </div>
                      <button
                        className="dp-save-btn"
                        onClick={saveToDashboard}
                        disabled={saving}
                      >
                        {saving
                          ? <><RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} /> {t('common.saving')}</>
                          : <><Save size={15} /> {t('det.saveFieldLog')}</>
                        }
                      </button>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="dp-success"
                    >
                      <div className="dp-success-icon">
                        <CheckCircle2 size={24} />
                      </div>
                      <p className="dp-success-title">{t('det.successfullyIntegrated')}</p>
                      <p className="dp-success-sub">{t('det.redirecting')}</p>
                    </motion.div>
                  )}
                </motion.div>

              ) : error ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="dp-result-panel"
                >
                  <div className="dp-error">
                    <div className="dp-error-icon">
                      <AlertCircle size={28} />
                    </div>
                    <p className="dp-error-text">{error}</p>
                  </div>
                </motion.div>

              ) : (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="dp-result-panel"
                >
                  <div className="dp-idle">
                    <div className="dp-idle-icon">
                      <Camera size={28} />
                    </div>
                    <p className="dp-idle-text">{t('det.neuralSensorIdle')}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Loading Progress Bar */}
      <AnimatePresence>
        {loading && (
          <motion.div
            className="fixed top-0 left-0 right-0 h-1 bg-krishi-600 z-50"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ scaleX: 0 }}
            transition={{ duration: 2, ease: "linear" }}
            style={{ transformOrigin: "left" }}
          />
        )}
      </AnimatePresence>

      {/* Error Card */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            style={{
              background: '#fdecea',
              border: '1px solid rgba(192,57,43,0.2)',
              borderRadius: 16,
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              marginTop: 16,
            }}
          >
            <AlertTriangle size={18} style={{ color: '#c0392b', flexShrink: 0, marginTop: 1 }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#c0392b', marginBottom: 4 }}>
                {t('det.scanFailed')}
              </p>
              <p style={{ fontSize: 12, color: 'rgba(192,57,43,0.7)', marginBottom: 10 }}>
                {error}
              </p>
              <button
                onClick={() => setError(null)}
                style={{
                  fontSize: 12, fontWeight: 700,
                  color: '#c0392b',
                  background: 'transparent',
                  border: '1px solid rgba(192,57,43,0.3)',
                  borderRadius: 8, padding: '5px 14px',
                  cursor: 'pointer',
                }}
              >
                {t('common.retry')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default DetectionPage;
