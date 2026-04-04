import { compressImage } from '../utils/imageUtils';
import { motion, AnimatePresence } from 'framer-motion';
import {
   Search, Leaf, Plus, Trash2, Scan, X, ShieldCheck, Zap,
   RefreshCw, Camera, Upload, ArrowUpRight, ArrowDownRight,
   ArrowRight, FlaskConical, Microscope, Cpu,
   FileDown, TrendingUp, TrendingDown, Minus, AlertTriangle,
   CheckCircle2, Clock, BarChart3, Activity, Droplets, ArrowLeft,
   History, Calculator, Sprout, Languages
} from 'lucide-react';
import { useState, useEffect, useMemo, useRef } from 'react';
import {
   collection, query, where, onSnapshot,
   deleteDoc, doc, updateDoc, getDocs
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import {
   ResponsiveContainer, AreaChart, Area,
   XAxis, CartesianGrid, Tooltip
} from 'recharts';
import { mockApi } from '../services/api';
import AppFooter from '../components/AppFooter';

import { useLanguage, translations } from '../context/LanguageContext';
import { generateHTMLReport } from '../utils/reportGenerator';

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
const statusOk = s => s === 'Healthy';
const fmt = d => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';
const fmtTime = d => d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '';

const urgencyColor = u => {
   if (!u) return 'var(--ink-3)';
   const l = (u || '').toLowerCase();
   if (l.includes('immediate') || l.includes('turant')) return 'var(--rose)';
   if (l.includes('3') || l.includes('teen')) return 'var(--amber)';
   return 'var(--green)';
};

const Badge = ({ ok, t }) => (
   <span className={`ibadge ${ok ? 'ibadge--ok' : 'ibadge--err'}`}>
      {ok ? (t ? t('inv.healthy') : 'Healthy') : (t ? t('inv.atRisk') : 'At Risk')}
   </span>
);

/* ─────────────────────────────────────────────────────────────
   PDF GENERATOR
───────────────────────────────────────────────────────────── */
const generatePDF = (crop, t, language, now = new Date()) => {
   const reportHtml = generateHTMLReport(crop, t, now, language);
   const blob = new Blob([reportHtml], { type: 'text/html' });
   const url = URL.createObjectURL(blob);
   const a = document.createElement('a');
   a.href = url;
   a.download = `KrishiAI_${(crop.name || 'Report').replace(/\s+/g, '_')}_${now.toISOString().slice(0, 10)}.html`;
   a.click();
   URL.revokeObjectURL(url);
};

/* ─────────────────────────────────────────────────────────────
   STEP CARD
───────────────────────────────────────────────────────────── */
const StepCard = ({ step, type, index }) => {
   const isObj = typeof step === 'object' && step !== null;
   const title = isObj ? step.title : (type === 'prevention' ? 'Defense Protocol' : 'Action Step');
   const detail = isObj ? step.detail : step;
   const num = isObj ? step.step : (index + 1);
   const urgency = isObj ? step.urgency : null;

   return (
      <div className={`step-card step-card--${type}`}>
         <div className="step-num">{num}</div>
         <div className="step-body">
            <p className="step-title">{title}</p>
            <p className="step-detail">{detail}</p>
            {urgency && (
               <span className="step-urgency" style={{ color: urgencyColor(urgency) }}>
                  {(() => {
                     const l = (urgency || '').toLowerCase();
                     if (l.includes('immediate') || l.includes('turant')) return '🔴 ';
                     if (l.includes('3') || l.includes('teen')) return '🟡 ';
                     return '🟢 ';
                  })()}{urgency}
               </span>
            )}
         </div>
      </div>
   );
};

/* ─────────────────────────────────────────────────────────────
   DETAIL MODAL
───────────────────────────────────────────────────────────── */
const DetailModal = ({ crop, onClose, onRescan, trendData }) => {
   const { t, language } = useLanguage();
   if (!crop) return null;

   // Content language follows the global app language
   const contentLang = language;

   const historyArr = Array.isArray(crop.scanHistory) ? crop.scanHistory : [];
   const history = historyArr.length > 0
      ? historyArr
      : [{ score: crop.healthScore || 0, date: crop.lastScanned || crop.createdAt || new Date(), status: crop.status || 'Healthy' }];
   const hasHistory = history.length > 1;
   const full = crop.lastScanFull;
   const content = full?.[contentLang] || full?.en || {};

   const hasCur = history.length >= 2;
   const cur = hasCur ? history[history.length - 1].score : null;
   const prev = hasCur ? history[history.length - 2].score : null;
   const d = hasCur ? cur - prev : 0;

   return (
      <div className="i-overlay">
         <div className="i-overlay-bg" onClick={onClose} />
         <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="i-modal"
         >
            <div className="i-modal-bar" />
            <div className="i-modal-head">
               <div className="i-modal-head-l">
                  <div className={`i-modal-icon ${statusOk(crop.status) ? 'i-modal-icon--ok' : 'i-modal-icon--err'}`}>
                     <FlaskConical size={20} />
                  </div>
                  <div>
                     <p className="i-modal-id">ID: #{crop.id?.substring(0, 8).toUpperCase()}</p>
                     <h2 className="i-modal-name">{content.cropName || crop.name}</h2>
                  </div>
               </div>
               <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button className="i-modal-close" onClick={onClose}><X size={18} /></button>
               </div>
            </div>

            <div className="i-modal-body">
               <div className="i-modal-grid">
                  {/* LEFT */}
                  <div className="i-modal-left">
                     <div className="i-img-wrap">
                        <img src={crop.imageUrl || 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&q=80'} className="i-img" alt={crop.name} />
                        <Badge ok={statusOk(crop.status)} />
                        <div className="i-img-score">
                           <span className={statusOk(crop.status) ? 'score-ok' : 'score-err'}>{crop.healthScore}%</span>
                           <span className="score-label">{t('inv.health')}</span>
                        </div>
                     </div>

                     <div className="i-chart-card">
                        <div className="i-chart-head">
                           <div className="i-chart-ico"><BarChart3 size={14} /></div>
                           <p className="i-chart-title">{t('inv.vitalityTrend')}</p>
                           {hasHistory && <span className="i-chart-count">{history.length} {t('inv.reScan').split(' ')[1] || 'scans'}</span>}
                        </div>
                        <div style={{ height: 90 }}>
                           <ResponsiveContainer width="100%" height="100%">
                              <AreaChart
                                 data={hasHistory ? history.slice(-7).map((s, i) => ({ t: `S${i + 1}`, v: s.score })) : (trendData || [])}
                                 margin={{ top: 4, right: 4, bottom: 0, left: 4 }}
                              >
                                 <defs>
                                    <linearGradient id="vg2" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#2e7d4f" stopOpacity={0.18} />
                                       <stop offset="95%" stopColor="#2e7d4f" stopOpacity={0} />
                                    </linearGradient>
                                 </defs>
                                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f4ed" />
                                 <XAxis dataKey="t" hide />
                                 <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8df', borderRadius: 8, fontSize: 11, fontFamily: 'Nunito' }} formatter={v => [`${v}%`, t('inv.health')]} />
                                 <Area type="monotone" dataKey="v" stroke="#2e7d4f" strokeWidth={2.5} fill="url(#vg2)" dot={false} />
                              </AreaChart>
                           </ResponsiveContainer>
                        </div>
                     </div>

                     {hasHistory && (
                        <div className="i-history-card">
                           <p className="i-history-title"><Clock size={13} /> {t('inv.scanHistory')}</p>
                           {history.slice(-4).reverse().map((s, i) => (
                              <div key={i} className="i-history-row">
                                 <div>
                                    <p className="i-history-date">{fmt(s.date)}</p>
                                    <p className="i-history-time">{fmtTime(s.date)}</p>
                                 </div>
                                 <span className={`i-history-score ${s.score >= 70 ? 'i-history-score--g' : 'i-history-score--r'}`}>{s.score}%</span>
                              </div>
                           ))}
                        </div>
                     )}
                  </div>

                  {/* RIGHT */}
                  <div className="i-modal-right">
                     <div className="i-diag-block">
                        <div className="i-diag-tag"><Microscope size={13} /> {t('inv.diagnosis')}</div>
                        <h3 className="i-diag-title">{content.diagnosis || crop.diagnosis || (t('cp.detecting') + '...')}</h3>
                        {crop.lastScanned && (
                           <p className="i-diag-meta"><Clock size={11} /> {t('inv.lastScanned')} {fmt(crop.lastScanned)} {fmtTime(crop.lastScanned)}</p>
                        )}
                     </div>

                     {content.summary && (
                        <div className="i-summary-card">
                           <p className="i-summary-text">{content.summary}</p>
                        </div>
                     )}

                     {hasCur && (
                        <div className={`i-compare-card ${d > 0 ? 'i-compare-card--ok' : d < 0 ? 'i-compare-card--err' : 'i-compare-card--neutral'}`}>
                           <div className="i-compare-ico">
                              {d > 0 ? <TrendingUp size={18} /> : d < 0 ? <TrendingDown size={18} /> : <Minus size={18} />}
                           </div>
                           <div>
                              <p className="i-compare-val">{d === 0 ? t('inv.stable') : `${d > 0 ? '+' : ''}${d}% ${t('inv.fromLastScan')}`}</p>
                              <p className="i-compare-sub">{t('inv.previous')} {prev}% → {cur}%</p>
                           </div>
                        </div>
                     )}

                     {content.solution?.length > 0 && (
                        <div className="i-steps-section">
                           <p className="i-steps-label"><Zap size={13} style={{ color: 'var(--amber)' }} />{t('inv.solutionSteps')}</p>
                           {content.solution.map((s, i) => <StepCard key={i} index={i} step={s} type="solution" />)}
                        </div>
                     )}

                     {content.prevention?.length > 0 && (
                        <div className="i-steps-section">
                           <p className="i-steps-label"><ShieldCheck size={13} style={{ color: 'var(--sky)' }} />{t('inv.preventionSteps')}</p>
                           {content.prevention.map((s, i) => <StepCard key={i} index={i} step={s} type="prevention" />)}
                        </div>
                     )}

                     {!full && (
                        <>
                           <div className="i-info-card i-info-card--green">
                              <div className="i-info-card-head"><div className="i-info-ico i-info-ico--green"><Zap size={15} /></div><p className="i-info-label">{t('inv.recommendedAction')}</p></div>
                              <p className="i-info-text">{crop.solve || 'Continue baseline optimisation protocol.'}</p>
                           </div>
                           <div className="i-info-card i-info-card--sky">
                              <div className="i-info-card-head"><div className="i-info-ico i-info-ico--sky"><ShieldCheck size={15} /></div><p className="i-info-label">{t('inv.preventionProtocol')}</p></div>
                              <p className="i-info-text">{crop.prevent || 'Monitor ambient humidity for early stress markers.'}</p>
                           </div>
                        </>
                     )}

                     {full && (content.fertilizer || content.nextScanIn) && (
                        <div className="i-extra-row">
                           {content.fertilizer && <div className="i-extra-pill"><Droplets size={11} style={{ color: 'var(--sky)' }} /><span>{content.fertilizer}</span></div>}
                           {content.nextScanIn && <div className="i-extra-pill"><Clock size={11} style={{ color: 'var(--green)' }} /><span>{t('inv.nextScan')} {content.nextScanIn}</span></div>}
                        </div>
                     )}

                     <div className="i-modal-actions">
                        <button className="i-btn-primary" onClick={() => { onRescan(crop); onClose(); }}><Scan size={15} /> {t('inv.reScan')}</button>
                        <button className="i-btn-secondary" onClick={() => generatePDF(crop, t, language)}><FileDown size={14} /> {t('inv.downloadReport') || 'PDF'}</button>
                        <button className="i-btn-ghost" onClick={onClose}>{t('inv.close')}</button>
                     </div>
                  </div>
               </div>
            </div>
         </motion.div>
      </div>
   );
};

/* ─────────────────────────────────────────────────────────────
   RESCAN MODAL
───────────────────────────────────────────────────────────── */
const RescanModal = ({ crop, onClose }) => {
   const { t, language } = useLanguage();
   const [preview, setPreview] = useState(null);
   const [selectedFile, setSelectedFile] = useState(null);
   const [scanning, setScanning] = useState(false);
   const [result, setResult] = useState(null);
   const [comparison, setComparison] = useState(null);
   const [saved, setSaved] = useState(false);
   const [step, setStep] = useState('upload');
   const [error, setError] = useState(null);
   const [stageIdx, setStageIdx] = useState(0);
   const scanDate = useRef(new Date());

   if (!crop) return null;

   const prevScore = crop.healthScore || 0;
   const prevStatus = crop.status || 'Unknown';
   const history = Array.isArray(crop.scanHistory) && crop.scanHistory.length > 0
      ? crop.scanHistory
      : [{ score: prevScore, date: crop.lastScanned || crop.createdAt, status: prevStatus }];

   const stages = [t('inv.stage1'), t('inv.stage2'), t('inv.stage3'), t('inv.stage4')];

   useEffect(() => {
      if (!scanning) { setStageIdx(0); return; }
      const timer = setInterval(() => setStageIdx(p => Math.min(p + 1, stages.length - 1)), 800);
      return () => clearInterval(timer);
   }, [scanning]);

   const handleFile = e => {
      const f = e.target.files[0];
      if (!f) return;
      setSelectedFile(f);
      setError(null);
      const r = new FileReader();
      r.onloadend = () => setPreview(r.result);
      r.readAsDataURL(f);
   };

   const makeFallback = (score) => {
      const ns = score;
      const newStatus = ns >= 75 ? 'Healthy' : ns >= 50 ? 'Needs Attention' : 'Danger';
      return {
         cropName: crop.name, diagnosis: ns >= 75 ? 'Healthy' : ns >= 50 ? 'Small Problem' : 'Big Problem Found',
         severity: ns >= 75 ? 'Low' : ns >= 50 ? 'Moderate' : 'High', confidence: Math.floor(Math.random() * 15) + 82,
         healthScore: ns, status: newStatus,
         en: {
            summary: ns >= 75 ? 'The crop appears healthy with good leaf structure.' : 'Signs of stress detected. Immediate attention recommended.',
            solution: [
               { step: 1, title: 'Inspect affected areas', detail: 'Examine leaves for discoloration, spots, or wilting.', urgency: 'Immediate' },
               { step: 2, title: 'Apply treatment', detail: 'Use recommended fungicide or fertilizer based on diagnosis.', urgency: 'Within 3 days' },
               { step: 3, title: 'Monitor recovery', detail: 'Check plant daily and document changes.', urgency: 'Within a week' }
            ],
            prevention: [
               { step: 1, title: 'Regular monitoring', detail: 'Scan crops weekly to catch issues early.' },
               { step: 2, title: 'Proper irrigation', detail: 'Maintain consistent watering, avoid overwatering.' },
               { step: 3, title: 'Soil health', detail: 'Test soil pH monthly and adjust fertilization.' }
            ],
            fertilizer: 'NPK 19-19-19 @ 5g/litre, every 15 days',
            pesticide: ns < 70 ? 'Mancozeb 75% WP @ 2g/litre' : null,
            nextScanIn: ns >= 75 ? '14 days' : '7 days'
         },
         hi: {
            summary: ns >= 75 ? 'फसल स्वस्थ दिख रही है। पत्तियों की संरचना और रंग अच्छा है।' : 'तनाव के लक्षण पाए गए हैं। तुरंत ध्यान दें।',
            solution: [
               { step: 1, title: 'प्रभावित क्षेत्रों की जांच करें', detail: 'पत्तियों पर धब्बे या मुरझाने के लक्षण देखें।', urgency: 'तुरंत' },
               { step: 2, title: 'उपचार लागू करें', detail: 'अनुशंसित फफूंदनाशक या उर्वरक का उपयोग करें।', urgency: '3 दिन में' },
               { step: 3, title: 'ठीक होने की निगरानी करें', detail: 'प्रतिदिन पौधे की जांच करें।', urgency: 'एक हफ्ते में' }
            ],
            prevention: [
               { step: 1, title: 'नियमित निगरानी', detail: 'फसल को साप्ताहिक स्कैन करें।' },
               { step: 2, title: 'उचित सिंचाई', detail: 'नियमित पानी देने का समय बनाए रखें।' },
               { step: 3, title: 'मिट्टी का स्वास्थ्य', detail: 'मासिक मिट्टी की pH जांच करें।' }
            ],
            fertilizer: 'NPK 19-19-19 @ 5 ग्राम/लीटर, हर 15 दिन',
            pesticide: ns < 70 ? 'मैनकोज़ेब 75% WP @ 2 ग्राम/लीटर' : null,
            nextScanIn: ns >= 75 ? '14 दिन' : '7 दिन'
         },
         te: {
            summary: ns >= 75 ? 'పంట ఆరోగ్యంగా కనిపిస్తోంది.' : 'ఒత్తిడి సంకేతాలు ఉన్నాయి. వెంటనే శ్రద్ధ వహించండి.',
            solution: [{ step: 1, title: 'నివారణ చర్య', detail: 'ఆకులను తనిఖీ చేయండి.', urgency: 'వెంటనే' }],
            prevention: [{ step: 1, title: 'జాగ్రత్త', detail: 'ప్రతి వారం స్కాన్ చేయండి.' }],
         },
         ta: {
            summary: ns >= 75 ? 'பயிர் ஆரோக்கியமாக உள்ளது.' : 'அறிகுறிகள் உள்ளன. உடனடியாக கவனிப்பு தேவை.',
            solution: [{ step: 1, title: 'தடுப்பு நடவடிக்கை', detail: 'இலைகளைச் சோதிக்கவும்.', urgency: 'உடனடியாக' }],
            prevention: [{ step: 1, title: 'கவனிப்பு', detail: 'வாரந்தோறும் ஸ்கேன் செய்யவும்.' }],
         },
         bn: {
            summary: ns >= 75 ? 'ফসল সুস্থ দেখাচ্ছে।' : 'চাপের লক্ষণ দেখা দিয়েছে। অবিলম্বে মনোযোগ দিন।',
            solution: [{ step: 1, title: 'প্রতিকার পদক্ষেপ', detail: 'পাতা পরীক্ষা করুন।', urgency: 'অবিলম্বে' }],
            prevention: [{ step: 1, title: 'সতর্কতা', detail: 'সাপ্তাহিক স্ক্যান করুন।' }],
         },
         mr: {
            summary: ns >= 75 ? 'पीक निरोगी दिसत आहे.' : 'ताणाचे संकेत आहेत. त्वरित लक्ष द्या.',
            solution: [{ step: 1, title: 'प्रतिबंधात्मक उपाय', detail: 'पाने तपासा.', urgency: 'त्वरित' }],
            prevention: [{ step: 1, title: 'काळजी', detail: 'आठवड्यातून एकदा स्कॅन करा.' }],
         }
      };
   };

   const runScan = async () => {
      if (!selectedFile) return;
      setStep('scanning'); setScanning(true);
      scanDate.current = new Date();
      try {
         // Compress and resize image before API call
         const b64 = await compressImage(selectedFile, { maxWidth: 800, maxHeight: 800, quality: 0.7 });
         let res;
         try { res = await mockApi.predictDisease(b64); }
         catch { res = makeFallback(Math.min(100, Math.max(10, prevScore + Math.floor((Math.random() - 0.4) * 28)))); }
         
         if (res.isAgri === false) {
            setScanning(false);
            setError("Wrong image type. Please upload a crop photo.");
            setStep('upload');
            return;
         }

         const originalCrop = crop.name.toLowerCase();
         const detectedCrop = res.cropName.toLowerCase();
         if (!detectedCrop.includes(originalCrop) && !originalCrop.includes(detectedCrop)) {
            setScanning(false);
            setError(`Different crop detected (${res.cropName}). Expected ${crop.name}.`);
            setStep('upload');
            return;
         }

         const newScore = res.healthScore;
         const diff = newScore - prevScore;

         // constructing localized comparison text
         const compText = diff === 0
            ? t('inv.stable')
            : `${Math.abs(diff)}% ${diff > 0 ? t('inv.improvement') : t('inv.decline')} ${t('inv.fromLastScan')}`;

         setResult({ score: newScore, status: res.status, diff, diagnosis: res.diagnosis, full: res });
         setComparison({ improved: diff >= 0, neutral: diff === 0, text: compText, diff });
         setStep('result');
      } catch (err) { console.error('Scan failed:', err); setStep('upload'); }
      finally { setScanning(false); }
   };

   const saveAndClose = async () => {
      if (!result || saved) return;
      try {
         const newHistory = [...history, { score: result.score, date: scanDate.current.toISOString(), status: result.status, diagnosis: result.diagnosis }];
         await updateDoc(doc(db, 'crops', crop.id), {
            healthScore: result.score, status: result.status, diagnosis: result.diagnosis,
            lastScanned: scanDate.current.toISOString(), scanHistory: newHistory,
            lastScanFull: result.full || null,
            solve: result.full?.en?.solution?.[0]?.detail || crop.solve || null,
            prevent: result.full?.en?.prevention?.[0]?.detail || crop.prevent || null,
         });
         setSaved(true);
      } catch (e) { console.error(e); }
      onClose();
   };

   const downloadReport = () => {
      if (!result) return;
      generatePDF({ ...crop, lastScanFull: result.full, healthScore: result.score, status: result.status, diagnosis: result.diagnosis }, t, language);
   };

   const contentLang = language;
   const content = result?.full?.[contentLang] || {};

   return (
      <div className="i-overlay">
         <div className="i-overlay-bg" onClick={!scanning ? onClose : undefined} />
         <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="i-modal i-modal--rescan"
         >
            <div className="i-modal-bar i-modal-bar--green" />
            {!scanning && <button className="i-modal-close i-modal-close--abs" onClick={onClose}><X size={18} /></button>}

            <div className="rs-wrap">
               {/* LEFT */}
               <div className="rs-left">
                  <div>
                     <div className="rs-tag"><Cpu size={13} /> {t('inv.reScan')}</div>
                     <h2 className="rs-title">{t('cp.detecting')}<br /><span className="rs-title-name">{crop.name}</span></h2>
                     {history.length > 0 && <p className="rs-prev-info"><Clock size={11} /> {t('inv.previous')} {fmt(history[history.length - 1].date)} · {history[history.length - 1].score}%</p>}
                  </div>

                  <div className={`rs-upload ${preview ? 'rs-upload--filled' : ''}`}>
                     {preview ? (
                        <>
                           <img src={preview} className="rs-upload-img" alt="preview" />
                           {scanning && (<><div className="rs-scan-bar" /><div className="rs-scan-overlay"><div className="rs-scan-label">{stages[stageIdx]}</div></div></>)}
                           {!scanning && step !== 'result' && <button className="rs-clear" onClick={() => { setPreview(null); setResult(null); setError(null); setStep('upload'); }}><RefreshCw size={15} /></button>}
                        </>
                     ) : error ? (
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                           <AlertTriangle size={32} color="var(--rose)" />
                           <p style={{ color: 'var(--rose)', fontWeight: 700, marginTop: '10px' }}>{error}</p>
                           <button onClick={() => { setError(null); setSelectedFile(null); }} style={{ marginTop: '10px', padding: '8px 16px', background: '#f1f5f9', borderRadius: '8px' }}>Retry</button>
                        </div>
                     ) : (
                        <label className="rs-upload-label">
                           <div className="rs-upload-ico"><Upload size={24} /></div>
                           <p className="rs-upload-text">{t('inv.uploadPhoto')}</p>
                           <p className="rs-upload-sub">JPG, PNG, WEBP · Max 10MB</p>
                           <input type="file" style={{ display: 'none' }} accept="image/*" onChange={handleFile} />
                        </label>
                     )}
                  </div>

                  {step !== 'upload' && result && (
                     <div className="rs-bar-compare">
                        <div className="rs-bar-row"><span className="rs-bar-label">{t('inv.before')}</span><div className="rs-bar-track"><div className="rs-bar-fill rs-bar-fill--prev" style={{ width: `${prevScore}%` }} /></div><span className="rs-bar-val">{prevScore}%</span></div>
                        <div className="rs-bar-row"><span className="rs-bar-label">{t('inv.after')}</span><div className="rs-bar-track"><div className={`rs-bar-fill ${result.score >= 70 ? 'rs-bar-fill--ok' : 'rs-bar-fill--err'}`} style={{ width: `${result.score}%` }} /></div><span className="rs-bar-val">{result.score}%</span></div>
                     </div>
                  )}

                  <button onClick={runScan} disabled={!preview || scanning || step === 'result'} className={`rs-scan-btn ${!preview || scanning || step === 'result' ? 'rs-scan-btn--off' : 'rs-scan-btn--on'}`}>
                     <Scan size={16} />
                     {scanning ? stages[stageIdx] : step === 'result' ? (t('inv.scanComplete')) : (t('common.runDiagnosis'))}
                  </button>
               </div>

               {/* RIGHT */}
               <div className="rs-right">
                  <AnimatePresence mode="wait">
                     {step === 'upload' && (
                        <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} className="rs-empty">
                           <div className="rs-empty-ico"><Camera size={30} /></div>
                           <p className="rs-empty-title">{t('inv.readyToScan')}</p>
                           <p className="rs-empty-text">{t('common.detectInfo') || 'Upload a crop photo for bilingual step-by-step diagnosis.'}</p>
                        </motion.div>
                     )}

                     {step === 'scanning' && (
                        <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rs-scanning">
                           <div className="rs-scanning-spinner" />
                           <p className="rs-scanning-stage">{stages[stageIdx]}</p>
                           <p className="rs-scanning-sub">{t('inv.previous')} {fmt(history[history.length - 1].date)}</p>
                           <div className="rs-progress-steps">
                              {stages.map((s, i) => (
                                 <div key={i} className={`rs-step ${i <= stageIdx ? 'rs-step--done' : ''} ${i === stageIdx ? 'rs-step--active' : ''}`}>
                                    <div className="rs-step-dot" /><span className="rs-step-label">{s}</span>
                                 </div>
                              ))}
                           </div>
                        </motion.div>
                     )}

                     {step === 'result' && result && comparison && (
                        <motion.div key="result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rs-result">

                           <div className={`rs-delta ${comparison.neutral ? 'rs-delta--neutral' : comparison.improved ? 'rs-delta--ok' : 'rs-delta--err'}`}>
                              <div className="rs-delta-ico">{comparison.neutral ? <Minus size={22} /> : comparison.improved ? <ArrowUpRight size={22} /> : <ArrowDownRight size={22} />}</div>
                              <div><p className="rs-delta-val">{comparison.text}</p><p className="rs-delta-sub">{prevStatus} → {result.status}</p></div>
                           </div>

                           <div className="rs-score-pair">
                              <div className="rs-score-card rs-score-card--prev">
                                 <p className="rs-score-label">{t('inv.previous')}</p>
                                 <p className="rs-score-val rs-score-val--muted">{prevScore}%</p>
                                 <p className="rs-score-status">{prevStatus}</p>
                              </div>
                              <div className={`rs-score-card ${result.score >= 70 ? 'rs-score-card--ok' : 'rs-score-card--err'}`}>
                                 <p className="rs-score-label">{t('inv.newScore')}</p>
                                 <p className={`rs-score-val ${result.score >= 70 ? 'rs-score-val--ok' : 'rs-score-val--warn'}`}>{result.score}%</p>
                                 <p className="rs-score-status">{result.status}</p>
                              </div>
                           </div>

                           {content.summary && <div className="rs-summary"><p className="rs-summary-text">{content.summary}</p></div>}

                           {content.solution?.length > 0 && (
                              <div className="rs-steps-section">
                                 <p className="rs-steps-label"><Zap size={12} style={{ color: 'var(--amber)' }} />{t('inv.solutionSteps')}</p>
                                 {content.solution.map((s, i) => <StepCard key={i} index={i} step={s} type="solution" />)}
                              </div>
                           )}

                           {content.prevention?.length > 0 && (
                              <div className="rs-steps-section">
                                 <p className="rs-steps-label"><ShieldCheck size={12} style={{ color: 'var(--sky)' }} />{t('inv.preventionSteps')}</p>
                                 {content.prevention.map((s, i) => <StepCard key={i} index={i} step={s} type="prevention" />)}
                              </div>
                           )}

                           {(content.fertilizer || content.nextScanIn) && (
                              <div className="i-extra-row">
                                 {content.fertilizer && <div className="i-extra-pill"><Droplets size={11} style={{ color: 'var(--sky)' }} /><span>{content.fertilizer}</span></div>}
                                 {content.nextScanIn && <div className="i-extra-pill"><Clock size={11} style={{ color: 'var(--green)' }} /><span>{t('inv.nextScan')} {content.nextScanIn}</span></div>}
                              </div>
                           )}

                           <div className="rs-actions">
                              <button className="rs-btn-save" onClick={saveAndClose}><CheckCircle2 size={15} /> {t('inv.saveUpdate')}</button>
                              <button className="rs-btn-pdf" onClick={downloadReport}><FileDown size={14} /> {t('inv.downloadReport')}</button>
                              <button className="rs-btn-discard" onClick={onClose}>{t('inv.discard')}</button>
                           </div>
                        </motion.div>
                     )}
                  </AnimatePresence>
               </div>
            </div>
         </motion.div>
      </div>
   );
};

/* ─────────────────────────────────────────────────────────────
   CALCULATIONS HISTORY MODAL
───────────────────────────────────────────────────────────── */
const CalcHistoryModal = ({ isOpen, onClose, history, loading, onDelete }) => {
   const { t } = useLanguage();
   if (!isOpen) return null;
   return (
      <div className="i-overlay">
         <div className="i-overlay-bg" onClick={onClose} />
         <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="i-modal"
            style={{ maxWidth: 600 }}
         >
            <div className="i-modal-bar" />
            <div className="i-modal-head">
               <div className="i-modal-head-l">
                  <div className="i-modal-icon i-modal-icon--ok" style={{ background: 'var(--amber-bg)', color: 'var(--amber)' }}>
                     <History size={20} />
                  </div>
                  <div>
                     <p className="i-modal-id">Archive</p>
                     <h2 className="i-modal-name">{t('inv.calcHistory')}</h2>
                  </div>
               </div>
               <button className="i-modal-close" onClick={onClose}><X size={18} /></button>
            </div>

            <div className="i-modal-body">
               {loading ? (
                  <div className="inv-loading">{t('inv.loading')}</div>
               ) : history.length === 0 ? (
                  <div className="inv-empty" style={{ padding: '40px 20px' }}>
                     <History size={32} />
                     <p className="inv-empty-title">{t('inv.noCalcFound')}</p>
                     <p className="inv-empty-sub">Your saved crop and profit calculations will appear here.</p>
                  </div>
               ) : (
                  <div className="space-y-4">
                     {history.map(item => (
                        <div key={item.id}
                           style={{
                              background: 'var(--surface-2)',
                              border: '1px solid var(--border)',
                              borderRadius: 'var(--r-md)',
                              padding: '16px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 16,
                              flexWrap: 'wrap'
                           }}
                        >
                           <div style={{
                              width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              background: item.type === 'profit' ? 'var(--amber-bg)' : 'var(--green-bg)',
                              color: item.type === 'profit' ? 'var(--amber)' : 'var(--green)',
                              border: '1px solid rgba(0,0,0,0.05)'
                           }}>
                              {item.type === 'profit' ? <Calculator size={20} /> : <Sprout size={20} />}
                           </div>

                           <div style={{ flex: 1, minWidth: 200 }}>
                              <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--ink)' }}>
                                 {item.type === 'profit' ? `Munafa: ${item.results?.cropName}` : `Crop Picker: ${item.topCrop}`}
                              </p>
                              <p style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600, marginTop: 3 }}>
                                 {new Date(item.savedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                 {item.type === 'profit' && ` · ROI: ${item.results?.roi}% · ${item.inputs?.landSize} acres`}
                                 {item.type === 'cropPicker' && ` · ${item.inputs?.state} · ${item.inputs?.season}`}
                              </p>
                           </div>

                           <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto' }}>
                              {item.type === 'profit' ? (
                                 <p style={{
                                    fontSize: 18, fontWeight: 800,
                                    color: item.results?.isProfit ? 'var(--green)' : 'var(--rose)',
                                    fontFamily: 'Playfair Display, serif'
                                 }}>
                                    ₹{Number(item.results?.netProfit || 0).toLocaleString('en-IN')}
                                 </p>
                              ) : (
                                 <span style={{
                                    fontSize: 11, fontWeight: 800, padding: '4px 12px',
                                    borderRadius: 100, background: 'var(--green-bg)',
                                    color: 'var(--green)', border: '1px solid var(--green-mid)'
                                 }}>
                                    {item.selectedCrop?.matchScore || item.results?.[0]?.matchScore || 0}% match
                                 </span>
                              )}
                              <button
                                 onClick={() => onDelete(item.id)}
                                 style={{
                                    width: 32, height: 32, borderRadius: 8,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'var(--rose)', background: 'var(--rose-bg)',
                                    border: '1px solid rgba(192,57,43,0.1)', cursor: 'pointer'
                                 }}
                              >
                                 <Trash2 size={14} />
                              </button>
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>
            <div className="i-modal-actions" style={{ padding: '0 24px 24px' }}>
               <button className="i-btn-ghost" style={{ flex: 1 }} onClick={onClose}>{t('inv.closeArchive')}</button>
            </div>
         </motion.div>
      </div>
   );
};

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
const InventoryPage = () => {
   const [crops, setCrops] = useState([]);
   const [loading, setLoading] = useState(true);
   const [search, setSearch] = useState('');
   const [filter, setFilter] = useState('all');
   const [sortBy, setSortBy] = useState('newest');
   const [detailCrop, setDetailCrop] = useState(null);
   const [rescanCrop, setRescanCrop] = useState(null);
   const [showCalcHistory, setShowCalcHistory] = useState(false);
   const [calcHistory, setCalcHistory] = useState([]);
   const [calcLoading, setCalcLoading] = useState(false);
   const navigate = useNavigate();
   const { t } = useLanguage();

   const trendData = useMemo(() => [
      { t: 'W1', v: 72 }, { t: 'W2', v: 85 }, { t: 'W3', v: 82 },
      { t: 'W4', v: 88 }, { t: 'W5', v: 91 }, { t: 'W6', v: 89 }, { t: 'W7', v: 94 }
   ], []);

   useEffect(() => {
      if (!showCalcHistory || !auth.currentUser) return;
      setCalcLoading(true);
      getDocs(
         query(
            collection(db, 'calculations'),
            where('userId', '==', auth.currentUser.uid)
         )
      ).then(snap => {
         const items = snap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
         setCalcHistory(items);
         setCalcLoading(false);
      }).catch(() => setCalcLoading(false));
   }, [showCalcHistory]);

   useEffect(() => {
      if (!auth) { navigate('/login'); return; }
      const unsub = auth.onAuthStateChanged(user => {
         if (!user) { navigate('/login'); return; }
         const q = query(collection(db, 'crops'), where('userId', '==', user.uid));
         return onSnapshot(q, snap => {
            setCrops(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)));
            setLoading(false);
         });
      });
      return unsub;
   }, [navigate]);

   const stats = useMemo(() => {
      const total = crops.length;
      const healthy = crops.filter(c => statusOk(c.status)).length;
      const avgHealth = total ? Math.round(crops.reduce((s, c) => s + (c.healthScore || 0), 0) / total) : 0;
      return { total, healthy, sick: total - healthy, avgHealth };
   }, [crops]);

   const filtered = useMemo(() => {
      let res = crops.filter(c => {
         const q = search.toLowerCase();
         const matchQ = (c.name || '').toLowerCase().includes(q) || (c.type || '').toLowerCase().includes(q);
         const matchF = filter === 'all' || (filter === 'healthy' && statusOk(c.status)) || (filter === 'sick' && !statusOk(c.status));
         return matchQ && matchF;
      });
      if (sortBy === 'health-high') res = [...res].sort((a, b) => (b.healthScore || 0) - (a.healthScore || 0));
      if (sortBy === 'health-low') res = [...res].sort((a, b) => (a.healthScore || 0) - (b.healthScore || 0));
      if (sortBy === 'oldest') res = [...res].sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
      return res;
   }, [crops, search, filter, sortBy]);

   return (
      <>
         <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,700;0,800;1,700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
                :root{--bg:#f0f4ed;--surface:#fff;--surface-2:#f7f9f6;--border:#e2e8df;--border-2:#d4dcd0;--ink:#1a2117;--ink-2:#3a4a37;--ink-3:#7a8c77;--ink-4:#b0bcad;--green:#1a4a2e;--green-2:#2e7d4f;--green-bg:#f1f8f3;--green-mid:#a8d4b5;--amber:#b8651a;--amber-bg:#fef3e7;--rose:#8e2319;--rose-bg:#fff5f4;--sky:#1a5b8a;--sky-bg:#e8f3fb;--r-sm:10px;--r-md:14px;--r-lg:20px;--r-xl:28px;--sh-1:0 1px 4px rgba(20,35,18,.07),0 0 1px rgba(20,35,18,.04);--sh-2:0 4px 20px rgba(20,35,18,.09),0 1px 4px rgba(20,35,18,.05);--sh-3:0 16px 56px rgba(20,35,18,.13),0 4px 14px rgba(20,35,18,.06);--sh-4:0 32px 80px rgba(20,35,18,.18),0 8px 24px rgba(20,35,18,.08)}
        body{background:var(--bg);font-family:'Nunito',sans-serif;color:var(--ink);-webkit-font-smoothing:antialiased}
        .inv-page{min-height:100vh;padding:110px 24px 80px}
         .i-page { max-width: 1100px; margin: 0 auto; padding: 110px 28px 80px; }
        @media(max-width:640px){.inv-page{padding:90px 16px 80px}}
        .inv-wrap{max-width:1200px;margin:0 auto}
        .inv-header{margin-bottom:36px}
        .inv-header-top{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;flex-wrap:wrap;margin-bottom:28px}
        .inv-eyebrow{font-size:11px;font-weight:800;color:var(--green);letter-spacing:.15em;text-transform:uppercase;margin-bottom:8px;display:flex;align-items:center;gap:8px}
        .inv-eyebrow-dot{width:8px;height:8px;border-radius:50%;background:var(--green)}
        .inv-title{font-family:'Playfair Display',serif;font-size:32px;font-weight:800;color:var(--ink);line-height:1.1;letter-spacing:-.02em;word-break:break-word}
        .inv-title em{font-style:italic;color:var(--green)}
        .inv-sub{font-size:13px;color:var(--ink-3);margin-top:8px;font-weight:500}
        .btn-new{display:flex;align-items:center;gap:8px;padding:11px 22px;background:linear-gradient(135deg,#1a4a2e,#3fa066);color:#fff;border:none;border-radius:var(--r-md);font-size:13px;font-weight:800;font-family:'Nunito',sans-serif;cursor:pointer;box-shadow:0 6px 20px -4px rgba(46,125,79,.35);transition:all .2s}
        .btn-new:hover{filter:brightness(1.08);transform:translateY(-2px)}
        .btn-history{display:flex;align-items:center;gap:8px;padding:11px 20px;background:var(--surface);color:var(--ink-2);border:1px solid var(--border);border-radius:var(--r-md);font-size:13px;font-weight:700;font-family:'Nunito',sans-serif;cursor:pointer;transition:all .2s;box-shadow:var(--sh-1)}
        .btn-history:hover{background:var(--surface-2);border-color:var(--green-mid);color:var(--green);transform:translateY(-2px)}
        .inv-stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:24px}
        .stat-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);padding:18px;box-shadow:var(--sh-1);display:flex;align-items:center;gap:14px;transition:all .2s}
        .stat-card:hover{transform:translateY(-3px);box-shadow:var(--sh-2);border-color:var(--green-mid)}
        .stat-icon{width:44px;height:44px;border-radius:var(--r-md);background:var(--surface-2);display:flex;align-items:center;justify-content:center;color:var(--green);flex-shrink:0;transition:all .2s}
        .stat-card:hover .stat-icon{background:var(--green);color:#fff}
        .stat-label{font-size:10.5px;font-weight:800;color:var(--ink-4);text-transform:uppercase;letter-spacing:.08em;margin-bottom:2px}
        .stat-value{font-family:'Playfair Display',serif;font-size:26px;font-weight:800;color:var(--ink);line-height:1.1}
        .stat-sub{font-size:11px;font-weight:700;margin-top:3px;display:flex;align-items:center;gap:4px}
        .stat-sub--g{color:var(--green)}.stat-sub--r{color:var(--rose)}.stat-sub--s{color:var(--sky)}
        .inv-toolbar{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;padding:10px 14px;background:rgba(255,255,255,.7);backdrop-filter:blur(12px);border:1px solid var(--border);border-radius:var(--r-xl);box-shadow:var(--sh-1);margin-bottom:24px}
        .toolbar-l{display:flex;align-items:center;gap:10px;flex:1;min-width:0;flex-wrap:wrap}
        .search-wrap{position:relative;flex:1}
        .search-ico{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--ink-4);pointer-events:none}
        .search-inp{width:100%;background:var(--surface);border:1px solid var(--border);border-radius:100px;padding:10px 14px 10px 40px;font-size:13.5px;font-family:'Nunito',sans-serif;font-weight:600;color:var(--ink);outline:none;transition:all .2s}
        .search-inp:focus{border-color:var(--green-mid);box-shadow:0 0 0 3px var(--green-bg)}
        .filter-group{display:flex;background:var(--bg);padding:3px;border-radius:100px;gap:2px;flex-shrink:0}
        .filter-btn{padding:7px 12px;font-size:11px;font-weight:700;border:none;background:none;cursor:pointer;color:var(--ink-3);border-radius:100px;transition:all .15s;font-family:'Nunito',sans-serif;white-space:nowrap}
        .filter-btn--active{background:var(--surface);color:var(--green);box-shadow:var(--sh-1)}
        .filter-btn:hover:not(.filter-btn--active){color:var(--ink)}
        .sort-select{padding:8px 14px;background:var(--surface);border:1px solid var(--border);border-radius:100px;font-size:11px;font-weight:700;color:var(--ink-2);outline:none;cursor:pointer;font-family:'Nunito',sans-serif;max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
                .inv-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:16px}
        .crop-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-xl);overflow:hidden;box-shadow:var(--sh-1);display:flex;flex-direction:column;cursor:pointer;transition:all .3s cubic-bezier(.165,.84,.44,1);position:relative}
        .crop-card--ok{border-color:var(--green-mid);background:linear-gradient(to bottom,var(--surface),var(--green-bg))}
        .crop-card--err{border-color:rgba(192,57,43,.25);background:linear-gradient(to bottom,var(--surface),var(--rose-bg))}
        .crop-card:hover{box-shadow:var(--sh-3);transform:translateY(-6px)}
        .crop-card-img-wrap{position:relative;aspect-ratio:1.25;overflow:hidden;background:var(--surface-2)}
        .crop-card-img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s ease}
        .crop-card:hover .crop-card-img{transform:scale(1.06)}
        .crop-card-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.35) 0%,transparent 55%);opacity:0;transition:opacity .3s}
        .crop-card:hover .crop-card-overlay{opacity:1}
        .crop-card-badge{position:absolute;top:10px;right:10px;z-index:5}
        .crop-card-scans{position:absolute;bottom:10px;left:10px;background:rgba(255,255,255,.9);backdrop-filter:blur(8px);border-radius:100px;padding:4px 10px;font-size:10.5px;font-weight:800;color:var(--ink);display:flex;align-items:center;gap:5px;box-shadow:var(--sh-1)}
        .crop-card-body{padding:18px;flex:1;display:flex;flex-direction:column}
        .crop-card-type{font-size:10px;font-weight:800;color:var(--green);text-transform:uppercase;letter-spacing:.1em;margin-bottom:3px}
        .crop-card-name{font-family:'Playfair Display',serif;font-size:21px;font-weight:800;color:var(--ink);margin-bottom:3px;line-height:1.2}
        .crop-card-id{font-size:10.5px;color:var(--ink-4);font-weight:600;margin-bottom:14px}
        .crop-card-trend{display:flex;align-items:center;gap:6px;margin-bottom:14px;font-size:11px;font-weight:700;padding:5px 12px;border-radius:100px;width:fit-content}
        .crop-card-trend--up{color:var(--green);background:var(--green-bg)}
        .crop-card-trend--dn{color:var(--rose);background:var(--rose-bg)}
        .crop-card-trend--nc{color:var(--ink-4);background:var(--surface-2)}
        .crop-card-metrics{display:flex;gap:8px;margin-bottom:16px}
        .crop-metric{flex:1;background:var(--surface-2);border:1px solid var(--border);border-radius:var(--r-md);padding:10px;text-align:center;transition:all .2s}
        .crop-card:hover .crop-metric{background:var(--surface);border-color:var(--green-bg)}
        .crop-metric-val{font-family:'Playfair Display',serif;font-size:18px;font-weight:800;color:var(--ink);line-height:1}
        .crop-metric-val--g{color:var(--green)}.crop-metric-val--r{color:var(--rose)}
        .crop-metric-label{font-size:10px;font-weight:700;color:var(--ink-4);text-transform:uppercase;letter-spacing:.06em;margin-top:3px}
        .crop-card-actions{display:flex;gap:7px;margin-top:auto;padding-top:14px;border-top:1px solid var(--surface-2)}
        .crop-card-view{flex:1;display:flex;align-items:center;justify-content:center;gap:7px;padding:10px;background:var(--ink);color:#fff;border:none;border-radius:var(--r-md);font-size:12.5px;font-weight:700;font-family:'Nunito',sans-serif;cursor:pointer;transition:all .15s}
        .crop-card-view:hover{background:var(--green)}
        .crop-card-rescan{width:40px;height:40px;display:flex;align-items:center;justify-content:center;background:var(--green-bg);color:var(--green);border:1px solid var(--green-mid);border-radius:var(--r-md);cursor:pointer;transition:all .15s}
        .crop-card-rescan:hover{background:var(--green);color:#fff}
        .crop-card-del{width:40px;height:40px;border:1px solid var(--border);background:var(--surface-2);border-radius:var(--r-md);color:var(--ink-4);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s}
        .crop-card-del:hover{color:var(--rose);background:var(--rose-bg);border-color:#f5c6c4}
        .ibadge{display:inline-flex;align-items:center;padding:4px 11px;border-radius:100px;font-size:10.5px;font-weight:800;letter-spacing:.04em;box-shadow:0 2px 8px rgba(0,0,0,.1)}
        .ibadge--ok{background:#fff;color:var(--green);border:1px solid var(--green-mid)}
        .ibadge--err{background:#fff;color:var(--rose);border:1px solid #f5c6c4}
        .inv-empty{padding:72px 20px;text-align:center;background:var(--surface);border:1px dashed var(--border-2);border-radius:var(--r-xl)}
        .inv-empty svg{color:var(--green-mid);margin:0 auto 14px;display:block}
        .inv-empty-title{font-family:'Playfair Display',serif;font-size:20px;color:var(--ink-3);margin-bottom:8px}
        .inv-empty-sub{font-size:13px;color:var(--ink-4);margin-bottom:20px;font-weight:500}
        .inv-loading{padding:80px;text-align:center;color:var(--ink-3);font-size:13px;font-weight:600}
        .i-overlay{position:fixed;inset:0;z-index:700;display:flex;align-items:center;justify-content:center;padding:16px}
        .i-overlay-bg{position:absolute;inset:0;background:rgba(20,35,18,.52);backdrop-filter:blur(10px)}
        .i-modal{position:relative;background:var(--surface);border:1px solid var(--border);border-radius:var(--r-xl);width:100%;max-width:880px;max-height:92vh;overflow-y:auto;box-shadow:var(--sh-4);z-index:1}
        .i-modal::-webkit-scrollbar{width:4px}
        .i-modal::-webkit-scrollbar-track{background:transparent}
        .i-modal::-webkit-scrollbar-thumb{background:var(--border-2);border-radius:4px}
        .i-modal--rescan{max-width:840px;max-height:96vh}
        .i-modal-bar{height:3px;background:linear-gradient(90deg,var(--green),var(--green-2),#7dd9a3);border-radius:var(--r-xl) var(--r-xl) 0 0}
        .i-modal-bar--green{background:linear-gradient(90deg,#1a4a2e,var(--green-2))}
        .i-modal-head{display:flex;align-items:center;justify-content:space-between;padding:18px 24px;border-bottom:1px solid var(--border);position:sticky;top:0;background:rgba(255,255,255,.96);backdrop-filter:blur(16px);z-index:2}
        .i-modal-head-l{display:flex;align-items:center;gap:12px}
        .i-modal-icon{width:40px;height:40px;border-radius:var(--r-sm);display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .i-modal-icon--ok{background:var(--green-bg);color:var(--green)}.i-modal-icon--err{background:var(--rose-bg);color:var(--rose)}
        .i-modal-id{font-size:10px;font-weight:700;color:var(--ink-4);letter-spacing:.08em;text-transform:uppercase;margin-bottom:2px}
        .i-modal-name{font-family:'Playfair Display',serif;font-size:22px;font-weight:800;color:var(--ink);line-height:1}
        .i-modal-close{width:36px;height:36px;background:var(--surface-2);border:1px solid var(--border);border-radius:var(--r-sm);cursor:pointer;color:var(--ink-3);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:'Nunito',sans-serif}
        .i-modal-close:hover{color:var(--ink);background:var(--border)}
        .i-modal-close--abs{position:absolute;top:18px;right:18px;z-index:3}
        .i-modal-body{padding:22px 24px 26px}
        .i-modal-grid{display:grid;grid-template-columns:1fr 1.6fr;gap:22px}
        @media(max-width:680px){
          .i-modal-body{padding:16px 18px 20px}
          .i-modal-grid{grid-template-columns:1fr;gap:18px}
          .i-modal-name{font-size:18px}
          .i-diag-title{font-size:20px}
        }
        .i-modal-left{display:flex;flex-direction:column;gap:12px}
        .i-modal-right{display:flex;flex-direction:column;gap:12px}
        .i-img-wrap{position:relative;border-radius:var(--r-lg);overflow:hidden;aspect-ratio:1;background:var(--surface-2)}
        .i-img{width:100%;height:100%;object-fit:cover;display:block}
        .i-img-wrap .ibadge{position:absolute;top:10px;left:10px}
        .i-img-score{position:absolute;bottom:10px;right:10px;background:rgba(255,255,255,.92);backdrop-filter:blur(8px);border-radius:var(--r-sm);padding:6px 12px;text-align:center;border:1px solid var(--border)}
        .score-ok{font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:var(--green);display:block;line-height:1}
        .score-err{font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:var(--rose);display:block;line-height:1}
        .score-label{font-size:10px;font-weight:700;color:var(--ink-3);text-transform:uppercase;letter-spacing:.06em}
        .i-chart-card{background:var(--surface-2);border:1px solid var(--border);border-radius:var(--r-lg);padding:14px}
        .i-chart-head{display:flex;align-items:center;gap:10px;margin-bottom:10px}
        .i-chart-ico{width:26px;height:26px;background:var(--green-bg);color:var(--green);border-radius:8px;display:flex;align-items:center;justify-content:center}
        .i-chart-title{font-size:12px;font-weight:700;color:var(--ink-2);flex:1}
        .i-chart-count{font-size:11px;color:var(--ink-4);font-weight:600}
        .i-history-card{background:var(--surface-2);border:1px solid var(--border);border-radius:var(--r-lg);padding:12px 14px}
        .i-history-title{font-size:10.5px;font-weight:800;color:var(--ink-3);display:flex;align-items:center;gap:6px;margin-bottom:8px;text-transform:uppercase;letter-spacing:.06em}
        .i-history-row{display:flex;align-items:center;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border)}
        .i-history-row:last-child{border-bottom:none;padding-bottom:0}
        .i-history-date{font-size:12px;font-weight:600;color:var(--ink-2)}
        .i-history-time{font-size:10px;color:var(--ink-4);font-weight:500}
        .i-history-score{font-family:'Playfair Display',serif;font-size:16px;font-weight:700}
        .i-history-score--g{color:var(--green)}.i-history-score--r{color:var(--rose)}
        .i-diag-tag{display:inline-flex;align-items:center;gap:6px;padding:5px 12px;background:var(--rose-bg);border:1px solid rgba(192,57,43,.15);border-radius:100px;font-size:11px;font-weight:700;color:var(--rose);margin-bottom:8px}
        .i-diag-title{font-family:'Playfair Display',serif;font-size:24px;font-weight:800;color:var(--ink);line-height:1.1;margin-bottom:5px}
        .i-diag-meta{font-size:11px;color:var(--ink-4);font-weight:600;display:flex;align-items:center;gap:5px}
        .i-summary-card{background:var(--surface-2);border:1px solid var(--border);border-left:3px solid var(--green);border-radius:var(--r-md);padding:12px 14px}
        .i-summary-text{font-size:13px;color:var(--ink-2);line-height:1.6;font-weight:500}
        .i-compare-card{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:var(--r-md);border:1px solid}
        .i-compare-card--ok{background:var(--green-bg);border-color:var(--green-mid);color:var(--green)}
        .i-compare-card--err{background:var(--rose-bg);border-color:rgba(192,57,43,.2);color:var(--rose)}
        .i-compare-card--neutral{background:var(--surface-2);border-color:var(--border);color:var(--ink-3)}
        .i-compare-ico{flex-shrink:0}
        .i-compare-val{font-family:'Playfair Display',serif;font-size:15px;font-weight:700;color:var(--ink)}
        .i-compare-sub{font-size:11px;color:var(--ink-3);font-weight:600;margin-top:2px}
        .i-steps-section{display:flex;flex-direction:column;gap:8px}
        .i-steps-label{font-size:10.5px;font-weight:800;color:var(--ink-4);text-transform:uppercase;letter-spacing:.1em;margin-bottom:4px;display:flex;align-items:center;gap:6px}
        .step-card{display:flex;align-items:flex-start;gap:12px;padding:12px 14px;border-radius:var(--r-md);border:1px solid var(--border);background:var(--surface-2)}
        .step-card--solution{border-left:3px solid var(--amber)}
        .step-card--prevention{border-left:3px solid var(--sky)}
        .step-num{width:26px;height:26px;border-radius:50%;background:var(--ink);color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;flex-shrink:0;margin-top:1px}
        .step-body{flex:1}
        .step-title{font-size:13px;font-weight:800;color:var(--ink);margin-bottom:3px}
        .step-detail{font-size:12.5px;color:var(--ink-3);line-height:1.55;font-weight:500}
        .step-urgency{display:inline-block;font-size:10px;font-weight:800;margin-top:5px;letter-spacing:.05em}
        .i-info-card{background:var(--surface-2);border:1px solid var(--border);border-radius:var(--r-lg);padding:12px 14px;border-left:3px solid transparent}
        .i-info-card--green{border-left-color:var(--green)}.i-info-card--sky{border-left-color:var(--sky)}
        .i-info-card-head{display:flex;align-items:center;gap:10px;margin-bottom:7px}
        .i-info-ico{width:26px;height:26px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .i-info-ico--green{background:var(--green-bg);color:var(--green)}.i-info-ico--sky{background:var(--sky-bg);color:var(--sky)}
        .i-info-label{font-size:12px;font-weight:700;color:var(--ink-2)}
        .i-info-text{font-size:12.5px;color:var(--ink-3);line-height:1.6;font-weight:500;font-style:italic}
        .i-extra-row{display:flex;flex-wrap:wrap;gap:8px}
        .i-extra-pill{display:flex;align-items:center;gap:6px;padding:6px 12px;background:var(--surface-2);border:1px solid var(--border);border-radius:100px;font-size:11.5px;font-weight:600;color:var(--ink-2)}
        .i-modal-actions{display:flex;gap:8px;padding-top:4px;margin-top:auto;flex-wrap:wrap}
        .i-btn-primary{flex:2;display:flex;align-items:center;justify-content:center;gap:7px;padding:11px;background:linear-gradient(135deg,#1a4a2e,var(--green-2));color:#fff;border:none;border-radius:var(--r-md);font-size:13px;font-weight:700;font-family:'Nunito',sans-serif;cursor:pointer;box-shadow:0 3px 10px rgba(46,125,79,.22)}
        .i-btn-primary:hover{filter:brightness(1.08)}
        .i-btn-secondary{flex:1;display:flex;align-items:center;justify-content:center;gap:7px;padding:11px;background:var(--green-bg);border:1px solid var(--green-mid);border-radius:var(--r-md);font-size:13px;font-weight:700;font-family:'Nunito',sans-serif;cursor:pointer;color:var(--green)}
        .i-btn-secondary:hover{background:var(--green-mid);color:#fff}
        .i-btn-ghost{flex:1;padding:11px;background:var(--surface-2);border:1px solid var(--border);border-radius:var(--r-md);font-size:13px;font-weight:700;font-family:'Nunito',sans-serif;cursor:pointer;color:var(--ink-3)}
        .i-btn-ghost:hover{color:var(--ink);background:var(--border)}
        .lang-toggle{display:flex;background:var(--surface-2);border:1px solid var(--border);border-radius:var(--r-sm);overflow:hidden}
        .lang-btn{padding:7px 14px;font-size:12px;font-weight:800;border:none;background:none;cursor:pointer;color:var(--ink-3);font-family:'Nunito',sans-serif;transition:all .15s}
        .lang-btn--on{background:var(--ink);color:#fff}
        .lang-btn:hover:not(.lang-btn--on){color:var(--ink)}
        .rs-wrap{display:grid;grid-template-columns:1fr 1fr;gap:0;align-items:start}
        @media(max-width:640px){.rs-wrap{grid-template-columns:1fr}}
        .rs-left{display:flex;flex-direction:column;gap:14px;padding:24px;border-right:1px solid var(--border)}
        @media(max-width:640px){.rs-left{border-right:none;border-bottom:1px solid var(--border)}}
        .rs-right{display:flex;flex-direction:column;justify-content:flex-start;padding:24px;overflow-y:auto}
        .rs-right::-webkit-scrollbar{width:4px}
        .rs-right::-webkit-scrollbar-track{background:transparent}
        .rs-right::-webkit-scrollbar-thumb{background:var(--border-2);border-radius:4px}
        .rs-tag{display:inline-flex;align-items:center;gap:6px;padding:5px 12px;background:var(--green-bg);border:1px solid var(--green-mid);border-radius:100px;font-size:11px;font-weight:700;color:var(--green);margin-bottom:7px}
        .rs-title{font-family:'Playfair Display',serif;font-size:22px;font-weight:800;color:var(--ink);line-height:1.2;margin-bottom:5px}
        .rs-title-name{color:var(--green);font-style:italic}
        .rs-prev-info{font-size:11px;color:var(--ink-4);font-weight:600;display:flex;align-items:center;gap:5px}
        .rs-upload{aspect-ratio:1;border-radius:var(--r-xl);border:2px dashed var(--border-2);background:var(--surface-2);display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative}
        .rs-upload--filled{border-style:solid;border-color:var(--green-mid);background:var(--surface)}
        .rs-upload-img{width:100%;height:100%;object-fit:cover}
        .rs-clear{position:absolute;top:10px;right:10px;width:30px;height:30px;background:rgba(255,255,255,.9);border:1px solid var(--border);border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--ink-3);box-shadow:var(--sh-1)}
        .rs-clear:hover{color:var(--rose)}
        .rs-scan-bar{position:absolute;left:10px;right:10px;height:2px;background:var(--green);box-shadow:0 0 18px rgba(46,125,79,.6);border-radius:2px;animation:scanDown 1.8s linear infinite}
        @keyframes scanDown{0%{top:5%}100%{top:95%}}
        .rs-scan-overlay{position:absolute;bottom:0;left:0;right:0;padding:10px 14px;background:linear-gradient(to top,rgba(20,35,18,.7),transparent)}
        .rs-scan-label{font-size:11px;font-weight:700;color:#fff;letter-spacing:.05em}
        .rs-upload-label{display:flex;flex-direction:column;align-items:center;gap:10px;cursor:pointer;padding:20px;text-align:center}
        .rs-upload-ico{width:50px;height:50px;border-radius:var(--r-lg);background:var(--surface);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;color:var(--ink-4);box-shadow:var(--sh-1)}
        .rs-upload-label:hover .rs-upload-ico{background:var(--green-bg);color:var(--green);border-color:var(--green-mid)}
        .rs-upload-text{font-size:13px;font-weight:700;color:var(--ink-2)}
        .rs-upload-sub{font-size:11px;color:var(--ink-4);font-weight:500}
        .rs-bar-compare{background:var(--surface-2);border:1px solid var(--border);border-radius:var(--r-md);padding:12px;display:flex;flex-direction:column;gap:9px}
        .rs-bar-row{display:flex;align-items:center;gap:10px}
        .rs-bar-label{font-size:11px;font-weight:700;color:var(--ink-3);width:50px;flex-shrink:0}
        .rs-bar-track{flex:1;height:7px;background:var(--border);border-radius:100px;overflow:hidden}
        .rs-bar-fill{height:100%;border-radius:100px;transition:width .6s ease}
        .rs-bar-fill--prev{background:var(--ink-4)}.rs-bar-fill--ok{background:var(--green)}.rs-bar-fill--err{background:var(--rose)}
        .rs-bar-val{font-family:'Playfair Display',serif;font-size:13px;font-weight:700;color:var(--ink);width:34px;text-align:right;flex-shrink:0}
        .rs-scan-btn{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:12px;border:none;border-radius:var(--r-md);font-size:13.5px;font-weight:700;font-family:'Nunito',sans-serif;cursor:pointer}
        .rs-scan-btn--on{background:linear-gradient(135deg,#1a4a2e,var(--green-2));color:#fff;box-shadow:0 4px 14px rgba(46,125,79,.28)}
        .rs-scan-btn--on:hover{filter:brightness(1.08)}
        .rs-scan-btn--off{background:var(--surface-2);color:var(--ink-4);cursor:not-allowed}
        .rs-scanning{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px 16px;gap:14px;text-align:center}
        .rs-scanning-spinner{width:44px;height:44px;border-radius:50%;border:3px solid var(--border);border-top-color:var(--green);animation:spin .8s linear infinite}
        @keyframes spin{to{transform:rotate(360deg)}}
        .rs-scanning-stage{font-family:'Playfair Display',serif;font-size:17px;font-weight:700;color:var(--ink)}
        .rs-scanning-sub{font-size:12px;color:var(--ink-3);font-weight:500}
        .rs-progress-steps{display:flex;flex-direction:column;gap:7px;width:100%;margin-top:6px}
        .rs-step{display:flex;align-items:center;gap:10px;opacity:.3;transition:opacity .2s}
        .rs-step--done,.rs-step--active{opacity:1}
        .rs-step-dot{width:7px;height:7px;border-radius:50%;background:var(--border);flex-shrink:0}
        .rs-step--done .rs-step-dot{background:var(--green)}
        .rs-step--active .rs-step-dot{background:var(--green-2);box-shadow:0 0 8px rgba(63,160,102,.5)}
        .rs-step-label{font-size:12px;font-weight:600;color:var(--ink-3)}
        .rs-step--active .rs-step-label{color:var(--ink);font-weight:700}
        .rs-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:28px 16px;background:var(--surface-2);border:1px dashed var(--border-2);border-radius:var(--r-xl);gap:10px}
        .rs-empty-ico{width:52px;height:52px;border-radius:var(--r-lg);background:var(--surface);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;color:var(--ink-4)}
        .rs-empty-title{font-family:'Playfair Display',serif;font-size:16px;font-weight:700;color:var(--ink-3)}
        .rs-empty-text{font-size:12px;color:var(--ink-4);font-weight:500;line-height:1.5;max-width:200px}
        .rs-result{display:flex;flex-direction:column;gap:12px}
        .rs-delta{display:flex;align-items:center;gap:12px;padding:14px 16px;border-radius:var(--r-lg);border:1px solid}
        .rs-delta--ok{background:var(--green-bg);border-color:var(--green-mid);color:var(--green)}
        .rs-delta--err{background:var(--rose-bg);border-color:rgba(192,57,43,.2);color:var(--rose)}
        .rs-delta--neutral{background:var(--surface-2);border-color:var(--border);color:var(--ink-3)}
        .rs-delta-ico{flex-shrink:0}
        .rs-delta-val{font-family:'Playfair Display',serif;font-size:16px;font-weight:700;color:var(--ink)}
        .rs-delta-sub{font-size:11px;color:var(--ink-3);font-weight:600;margin-top:2px}
        .rs-score-pair{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .rs-score-card{background:var(--surface-2);border:1px solid var(--border);border-radius:var(--r-lg);padding:14px;text-align:center}
        .rs-score-card--ok{border-color:var(--green-mid);background:var(--green-bg)}
        .rs-score-card--err{border-color:rgba(192,57,43,.2);background:var(--rose-bg)}
        .rs-score-card--prev{}
        .rs-score-label{font-size:10px;font-weight:800;color:var(--ink-4);text-transform:uppercase;letter-spacing:.08em;margin-bottom:5px}
        .rs-score-val{font-family:'Playfair Display',serif;font-size:32px;font-weight:800;line-height:1;margin-bottom:3px}
        .rs-score-val--ok{color:var(--green)}.rs-score-val--warn{color:var(--amber)}.rs-score-val--muted{color:var(--ink-3)}
        .rs-score-status{font-size:11px;color:var(--ink-3);font-weight:600}
        .rs-summary{background:var(--surface-2);border:1px solid var(--border);border-left:3px solid var(--green);border-radius:var(--r-md);padding:12px 14px}
        .rs-summary-text{font-size:13px;color:var(--ink-2);line-height:1.6;font-weight:500}
        .rs-steps-section{display:flex;flex-direction:column;gap:8px}
        .rs-steps-label{font-size:10.5px;font-weight:800;color:var(--ink-4);text-transform:uppercase;letter-spacing:.1em;margin-bottom:2px;display:flex;align-items:center;gap:6px}
        .rs-actions{display:flex;flex-direction:column;gap:8px;padding-top:4px}
        .rs-btn-save{display:flex;align-items:center;justify-content:center;gap:8px;padding:12px;background:linear-gradient(135deg,#1a4a2e,var(--green-2));color:#fff;border:none;border-radius:var(--r-md);font-size:13.5px;font-weight:700;font-family:'Nunito',sans-serif;cursor:pointer;box-shadow:0 3px 12px rgba(46,125,79,.26)}
        .rs-btn-save:hover{filter:brightness(1.08)}
        .rs-btn-pdf{display:flex;align-items:center;justify-content:center;gap:8px;padding:11px;background:var(--surface-2);border:1px solid var(--border);border-radius:var(--r-md);font-size:13px;font-weight:700;font-family:'Nunito',sans-serif;cursor:pointer;color:var(--ink-2)}
        .rs-btn-pdf:hover{background:var(--border)}
        .rs-btn-discard{display:flex;align-items:center;justify-content:center;padding:9px;background:none;border:none;font-size:12px;font-weight:700;font-family:'Nunito',sans-serif;cursor:pointer;color:var(--ink-4)}
        .rs-btn-discard:hover{color:var(--rose)}
      `}</style>

         <div className="inv-page">
            <div className="inv-wrap">
               <div className="inv-header">
                  <div className="inv-header-top">
                     <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <button
                           onClick={() => navigate(-1)}
                           className="flex items-center gap-2 sm:gap-3 text-gray-400 hover:text-white transition-all duration-200 text-xs sm:text-sm font-medium group mb-4"
                           style={{ color: 'var(--ink-3)' }}
                        >
                           <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center group-hover:border-krishi-400/60 group-hover:text-krishi-400 transition-all duration-200 group-hover:scale-105 backdrop-blur-sm" style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}>
                              <ArrowLeft size={14} className="sm:size-16" />
                           </span>
                           <span className="hidden sm:inline">{t('inv.goBack')}</span>
                           <span className="sm:hidden">← {t('common.back')}</span>
                        </button>
                        <div className="inv-eyebrow"><span className="inv-eyebrow-dot" /> {t('inv.title')}</div>
                        <h1 className="inv-title">{t('nav.inventory')}</h1>
                        <p className="inv-sub">{t('dash.subtitle')}</p>
                     </motion.div>
                     <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <button className="btn-history" onClick={() => setShowCalcHistory(true)}>
                           <History size={16} />
                           <span className="hidden sm:inline">{t('inv.calcHistory')}</span>
                           <span className="sm:hidden">{t('pc.history')}</span>
                        </button>
                        <button className="btn-new" onClick={() => navigate('/detection')}><Plus size={15} /> {t('det.newScan')}</button>
                     </div>
                  </div>

                  <div className="inv-stats-grid">
                     {[
                        { label: t('dash.totalCrops'), value: stats.total, sub: 'Active', subClass: 'stat-sub--s', icon: <Leaf size={18} /> },
                        { label: t('dash.healthyCrops'), value: stats.healthy, sub: 'Optimal', subClass: 'stat-sub--g', icon: <CheckCircle2 size={18} style={{ color: 'var(--green)' }} /> },
                        { label: t('dash.diseasedCrops'), value: stats.sick, sub: '', subClass: 'stat-sub--r', icon: <AlertTriangle size={18} style={{ color: 'var(--rose)' }} /> },
                        { label: t('dash.avgHealth'), value: `${stats.avgHealth}%`, sub: '', subClass: 'stat-sub--s', icon: <Activity size={18} style={{ color: 'var(--sky)' }} /> },
                     ].map((s, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .07 }} className="stat-card">
                           <div className="stat-icon">{s.icon}</div>
                           <div><p className="stat-label">{s.label}</p><p className="stat-value">{s.value}</p><p className={`stat-sub ${s.subClass}`}>{s.sub}</p></div>
                        </motion.div>
                     ))}
                  </div>

                  <div className="inv-toolbar">
                     <div className="toolbar-l">
                        <div className="search-wrap">
                           <Search size={15} className="search-ico" />
                           <input className="search-inp" placeholder={t('inv.searchPlaceholder')} value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <div className="filter-group">
                           {['all', 'healthy', 'sick'].map(f => (
                              <button key={f} className={`filter-btn ${filter === f ? 'filter-btn--active' : ''}`} onClick={() => setFilter(f)}>
                                 {f === 'all' ? t('inv.all') : f === 'healthy' ? t('inv.healthy') : t('inv.atRisk')}
                              </button>
                           ))}
                        </div>
                     </div>
                     <select className="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                        <option value="newest">{t('inv.latestFirst')}</option>
                        <option value="health-high">{t('inv.healthHigh')}</option>
                        <option value="health-low">{t('inv.healthLow')}</option>
                        <option value="oldest">{t('inv.oldestFirst')}</option>
                     </select>
                  </div>
               </div>

               {/* Removed raw history rendering - now in CalcHistoryModal */}

               {loading ? (
                  <div className="inv-loading">{t('inv.loading')}</div>
               ) : filtered.length === 0 ? (
                  <div className="inv-empty">
                     <Leaf size={32} />
                     <p className="inv-empty-title">{t('inv.noCropsTitle')}</p>
                     <p className="inv-empty-sub">{search || filter !== 'all' ? t('inv.searchPlaceholder') : t('inv.noCropsSub')}</p>
                     {!search && filter === 'all' && <button className="btn-new" style={{ margin: '0 auto' }} onClick={() => navigate('/detection')}><Scan size={14} /> {t('inv.runDiagnosis')}</button>}
                  </div>
               ) : (
                  <div className="inv-grid">
                     {filtered.map((crop, i) => {
                        const ok = statusOk(crop.status);
                        const ch = Array.isArray(crop.scanHistory) ? crop.scanHistory : [];
                        const hasTrend = ch.length >= 2;
                        const trendDiff = hasTrend ? ch[ch.length - 1].score - ch[ch.length - 2].score : 0;
                        return (
                           <motion.div key={crop.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .05, duration: .3, ease: [.22, 1, .36, 1] }} className={`crop-card ${ok ? 'crop-card--ok' : 'crop-card--err'}`}>
                              <div className="crop-card-img-wrap">
                                 <img className="crop-card-img" src={crop.imageUrl || 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&q=80'} alt={crop.name} />
                                 <div className="crop-card-overlay" />
                                 <div className="crop-card-badge"><Badge ok={ok} t={t} /></div>
                                 {ch.length > 0 && <div className="crop-card-scans"><Activity size={11} /> {ch.length} {t('inv.reScan').split(' ')[1] || 'scan'}{ch.length !== 1 ? 's' : ''}</div>}
                              </div>
                              <div className="crop-card-body">
                                 <p className="crop-card-type">{crop.type || 'Field Crop'}</p>
                                 <p className="crop-card-name">{crop.name}</p>
                                 <p className="crop-card-id">#{crop.id?.substring(0, 8).toUpperCase()}</p>
                                 {hasTrend && (
                                    <div className={`crop-card-trend ${trendDiff > 0 ? 'crop-card-trend--up' : trendDiff < 0 ? 'crop-card-trend--dn' : 'crop-card-trend--nc'}`}>
                                       {trendDiff > 0 ? <TrendingUp size={12} /> : trendDiff < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
                                       {trendDiff > 0 ? t('inv.better') : trendDiff < 0 ? t('inv.worse') : t('inv.stable')}
                                    </div>
                                 )}
                                 <div className="crop-card-metrics">
                                    <div className="crop-metric"><p className={`crop-metric-val ${ok ? 'crop-metric-val--g' : 'crop-metric-val--r'}`}>{crop.healthScore}%</p><p className="crop-metric-label">{t('inv.health')}</p></div>
                                    <div className="crop-metric"><p className="crop-metric-val">{crop.temp || '24°'}</p><p className="crop-metric-label">Temp</p></div>
                                 </div>
                                 <div className="crop-card-actions">
                                    <button className="crop-card-view" onClick={() => setDetailCrop(crop)}>{t('inv.details')} <ArrowRight size={13} /></button>
                                    <button className="crop-card-rescan" title={t('inv.reScan')} onClick={e => { e.stopPropagation(); setRescanCrop(crop); }}><Scan size={15} /></button>
                                    <button className="crop-card-del" title={t('common.delete')} onClick={e => { e.stopPropagation(); if (window.confirm(t('inv.delete'))) deleteDoc(doc(db, 'crops', crop.id)); }}><Trash2 size={15} /></button>
                                 </div>
                              </div>
                           </motion.div>
                        );
                     })}
                  </div>
               )}
            </div>
         </div>

         <AnimatePresence>
            {detailCrop && <DetailModal crop={detailCrop} onClose={() => setDetailCrop(null)} onRescan={c => { setDetailCrop(null); setRescanCrop(c); }} trendData={trendData} />}
         </AnimatePresence>
         <AnimatePresence>
            {rescanCrop && <RescanModal crop={rescanCrop} onClose={() => setRescanCrop(null)} />}
         </AnimatePresence>
         <AnimatePresence>
            <CalcHistoryModal
               isOpen={showCalcHistory}
               onClose={() => setShowCalcHistory(false)}
               history={calcHistory}
               loading={calcLoading}
               onDelete={(id) => deleteDoc(doc(db, 'calculations', id)).then(() => setCalcHistory(h => h.filter(i => i.id !== id)))}
            />
         </AnimatePresence>



      </>
   );
};
export default InventoryPage;
