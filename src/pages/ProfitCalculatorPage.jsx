import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Calculator, TrendingUp, TrendingDown,
  Leaf, RefreshCw, IndianRupee, BarChart3,
  CheckCircle2, AlertTriangle, Info, Save, Download,
  History, X, Trash2, Sprout, Droplets, User,
  Coins, Sun, CloudRain, CloudLightning, ChevronRight
} from 'lucide-react';
import { collection, addDoc, getDocs, query, where, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import AppFooter from '../components/AppFooter';

import { useLanguage } from '../context/LanguageContext';

const ProfitCalculatorPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [form, setForm] = useState({
    cropName: '',
    landSize: '',
    seedCost: '',
    fertilizerCost: '',
    pesticideCost: '',
    irrigationCost: '',
    laborCost: '',
    expectedYield: '',
    sellingPrice: '',
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const resultsRef = useRef(null);

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const land = parseFloat(form.landSize) || 0;
      const yield_per_acre = parseFloat(form.expectedYield) || 0;
      const price = parseFloat(form.sellingPrice) || 0;
      const seed = parseFloat(form.seedCost) || 0;
      const fertilizer = parseFloat(form.fertilizerCost) || 0;
      const pesticide = parseFloat(form.pesticideCost) || 0;
      const irrigation = parseFloat(form.irrigationCost) || 0;
      const labor = parseFloat(form.laborCost) || 0;

      const totalCostPerAcre = seed + fertilizer + pesticide + irrigation + labor;
      const totalCost = totalCostPerAcre * land;
      const totalYield = yield_per_acre * land;
      const grossRevenue = totalYield * price;
      const netProfit = grossRevenue - totalCost;
      const roi = totalCost > 0 ? ((netProfit / totalCost) * 100).toFixed(1) : '0.0';
      const breakEvenYield = price > 0 ? (totalCostPerAcre / price).toFixed(2) : '0.00';
      const profitPerAcre = land > 0 ? (netProfit / land).toFixed(0) : '0';

      setResults({
        totalCost,
        totalCostPerAcre,
        grossRevenue,
        netProfit,
        profitPerAcre,
        roi,
        breakEvenYield,
        totalYield,
        isProfit: netProfit >= 0,
        scenarios: {
          conservative: { yield: totalYield * 0.8, revenue: grossRevenue * 0.8, profit: netProfit * 0.8 - totalCost * 0.05 },
          moderate: { yield: totalYield, revenue: grossRevenue, profit: netProfit },
          optimistic: { yield: totalYield * 1.2, revenue: grossRevenue * 1.2, profit: netProfit * 1.2 }
        },
        cropName: form.cropName || 'Crop',
        costs: { seed: seed * land, fertilizer: fertilizer * land, pesticide: pesticide * land, irrigation: irrigation * land, labor: labor * land }
      });
      setLoading(false);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }, 800);
  };

  const handleSave = async () => {
    if (!auth.currentUser || !results) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'calculations'), {
        userId: auth.currentUser.uid,
        type: 'profit',
        cropName: results.cropName,
        inputs: { ...form },
        results: {
          netProfit: results.netProfit,
          roi: results.roi,
          isProfit: results.isProfit,
          cropName: results.cropName
        },
        savedAt: new Date().toISOString(),
      });
      setSaved(true);
      // Refresh history if shown
      if (showHistory) loadHistory();
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Save failed:", err);
      alert("Saving failed. Please check your internet.");
    } finally { setSaving(false); }
  };

  const loadHistory = async () => {
    if (!auth.currentUser) return;
    setHistoryLoading(true);
    setShowHistory(true);
    try {
      // Removing orderBy to avoid complex index requirements; sort client-side instead
      const q = query(collection(db, 'calculations'),
        where('userId', '==', auth.currentUser.uid),
        where('type', '==', 'profit'));

      const snap = await getDocs(q);
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sort manually to ensure it works without custom firestore indexes
      items.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
      setHistory(items);
    } catch (err) {
      console.error("History load failed:", err);
    } finally { setHistoryLoading(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Playfair+Display:ital,wght@0,700;0,800;1,700&display=swap');
        :root {
          --pc-green: #2e7d4f; --pc-green-bg: #eaf4ee;
          --pc-amber: #b8651a; --pc-amber-bg: #fef3e7;
          --pc-rose: #c0392b; --pc-rose-bg: #fdecea;
          --pc-sky: #1e6ea6; --pc-sky-bg: #e8f3fb;
          --pc-ink: #1a2117; --pc-ink-3: #7a8c77;
          --pc-border: #e2e8df; --pc-surface: #ffffff;
        }
        .pc-page { background: #f0f4ed; min-height: 100vh; font-family: 'Nunito', sans-serif; padding-top: 100px; padding-bottom: 120px; }
        .pc-container { max-width: 1000px; margin: 0 auto; padding: 0 16px; }
        
        .pc-header { margin-bottom: 32px; display: flex; justify-content: space-between; align-items: flex-end; gap: 20px; flex-wrap: wrap; }
        @media (max-width: 640px) { .pc-header { flex-direction: column; align-items: flex-start; margin-bottom: 24px; } }
        
        .pc-title { font-family: 'Playfair Display', serif; font-size: 38px; font-weight: 800; color: var(--pc-ink); line-height: 1.1; }
        @media (max-width: 640px) { .pc-title { font-size: 30px; } }
        
        .pc-eyebrow { font-size: 11px; font-weight: 900; color: var(--pc-green); text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 8px; display: block; }

        .pc-card { background: var(--pc-surface); border: 1px solid var(--pc-border); border-radius: 28px; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.04); }
        @media (max-width: 640px) { .pc-card { padding: 20px; border-radius: 20px; } }
        
        .pc-section-title { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 800; color: var(--pc-ink); margin-bottom: 24px; display: flex; align-items: center; gap: 12px; }
        .pc-section-title span { font-size: 13px; color: var(--pc-ink-3); font-weight: 600; font-family: 'Nunito', sans-serif; }
        @media (max-width: 640px) { 
          .pc-section-title { font-size: 18px; flex-direction: column; align-items: flex-start; gap: 6px; } 
          .pc-section-title span { margin-left: 0; }
        }
        
        .pc-section-icon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: var(--pc-green-bg); color: var(--pc-green); flex-shrink: 0; }

        .pc-input-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
        @media (max-width: 640px) { .pc-input-grid { grid-template-columns: 1fr; gap: 16px; } }
        
        .pc-field { display: flex; flex-direction: column; gap: 8px; }
        .pc-label { font-size: 13px; font-weight: 800; color: var(--pc-ink); display: flex; justify-content: space-between; }
        .pc-label span { font-weight: 600; color: var(--pc-ink-3); font-size: 11px; }
        .pc-input-wrap { position: relative; }
        .pc-input-ico { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: var(--pc-ink-3); pointer-events: none; }
        .pc-input { width: 100%; height: 52px; background: #f8faf9; border: 1px solid var(--pc-border); border-radius: 16px; padding: 0 16px 0 48px; font-size: 15px; font-weight: 700; color: var(--pc-ink); transition: all 0.2s; outline: none; }
        .pc-input:focus { border-color: var(--pc-green); background: #fff; box-shadow: 0 0 0 4px var(--pc-green-bg); }

        .pc-calc-btn { width: 100%; height: 56px; background: linear-gradient(135deg, #2e7d4f, #3fa066); color: #ffffff; border: none; border-radius: 18px; font-size: 16px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 32px; box-shadow: 0 4px 12px rgba(46,125,79,0.3); transition: all 0.2s; text-shadow: 0 1px 2px rgba(0,0,0,0.1); border: 2px solid rgba(255,255,255,0.1); }
        .pc-calc-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(46,125,79,0.35); }
        .pc-calc-btn:active { transform: scale(0.98); }

        .pc-res-hero { background: var(--pc-surface); border: 1px solid var(--pc-border); border-radius: 32px; padding: 40px; text-align: center; position: relative; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.03); }
        @media (max-width: 640px) { .pc-res-hero { padding: 30px 20px; border-radius: 24px; } }
        
        .pc-res-hero--profit { border-top: 6px solid #2e7d4f; }
        .pc-res-hero--loss { border-top: 6px solid var(--pc-rose); }
        .pc-res-val { font-family: 'Playfair Display', serif; font-size: 52px; font-weight: 800; line-height: 1; margin: 12px 0; }
        @media (max-width: 640px) { .pc-res-val { font-size: 38px; } }
        
        .pc-res-label { font-size: 11px; font-weight: 900; color: var(--pc-ink-3); text-transform: uppercase; letter-spacing: 0.1em; }

        .pc-res-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-top: 24px; }
        @media (max-width: 640px) { .pc-res-grid { gap: 12px; } }
        
        .pc-res-item { background: #fff; border: 1px solid var(--pc-border); border-radius: 20px; padding: 20px; transition: all 0.2s; box-shadow: 0 4px 12px rgba(0,0,0,0.02); }
        @media (max-width: 640px) { .pc-res-item { padding: 14px; } }
        .pc-res-item:hover { border-color: var(--pc-green); transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.04); }

        .pc-scenarios { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 24px; }
        @media (max-width: 768px) { .pc-scenarios { grid-template-columns: 1fr; } }
        .pc-sc-card { padding: 20px; border-radius: 20px; border: 1px solid var(--pc-border); font-size: 13px; font-weight: 700; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.01); }
        .pc-sc-card--bad { background: var(--pc-rose-bg); color: var(--pc-rose); border-color: rgba(192,57,43,0.1); }
        .pc-sc-card--norm { background: var(--pc-sky-bg); color: var(--pc-sky); border-color: rgba(30,110,166,0.1); }
        .pc-sc-card--good { background: var(--pc-green-bg); color: var(--pc-green); border-color: rgba(46,125,79,0.1); }

        .pc-cost-bar { height: 8px; background: #f0f4ed; border-radius: 10px; margin-top: 8px; overflow: hidden; }
        .pc-cost-fill { height: 100%; background: var(--pc-green); border-radius: 10px; }

        .pc-history-item { display: flex; align-items: center; justify-content: space-between; padding: 16px; background: #fff; border: 1px solid var(--pc-border); border-radius: 16px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.03); }
        @media (max-width: 640px) { 
          .pc-history-item { flex-direction: column; align-items: flex-start; gap: 12px; } 
          .pc-history-item .flex { width: 100%; justify-content: space-between; }
        }

        .pc-action-btns { display: flex; gap: 12px; margin-top: 24px; }
        @media (max-width: 640px) { .pc-action-btns { flex-direction: column; } }
        .pc-save-btn { background: #1a4a2e; color: #fff; border: none; box-shadow: 0 4px 12px rgba(46,125,79,0.2); }
        .pc-dl-btn { background: #1a2117; color: #ffffff; border: none; box-shadow: 0 4px 12px rgba(26,33,23,0.2); }
      `}</style>

      <div className="pc-page">
        <div className="pc-container">

          <div className="pc-header">
            <div>
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 mb-6 text-sm font-bold text-pc-ink-3 hover:text-pc-green transition-colors"
                style={{ background: '#fff', padding: '8px 16px', borderRadius: '12px', border: '1px solid var(--pc-border)', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}
              >
                <ArrowLeft size={16} /> Dashboard
              </button>
              <span className="pc-eyebrow">{t('nav.profitCalc')}</span>
              <h1 className="pc-title">{t('pc.title')}</h1>
              <p style={{ color: 'var(--pc-ink-3)', fontWeight: 600, fontSize: 13, marginTop: 4 }}>
                {t('pc.calculate')}
              </p>
            </div>
            <button
              onClick={loadHistory}
              className="flex items-center gap-2 text-sm font-bold"
              style={{ background: 'var(--pc-green)', color: '#fff', padding: '12px 20px', borderRadius: '14px', boxShadow: '0 4px 12px rgba(46,125,79,0.2)' }}
            >
              <History size={16} /> {t('pc.history')}
            </button>
          </div>

          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-8"
              >
                <div className="pc-card">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="pc-section-title mb-0"><History size={20} /> {t('pc.history')}</h3>
                    <button onClick={() => setShowHistory(false)}><X size={20} /></button>
                  </div>
                  {historyLoading ? (
                    <div className="p-10 text-center text-pc-ink-3 font-bold">Loading history...</div>
                  ) : history.length === 0 ? (
                    <div className="p-10 text-center text-pc-ink-3">No saved calculations yet.</div>
                  ) : (
                    <div className="max-h-80 overflow-y-auto">
                      {history.map(item => (
                        <div key={item.id} className="pc-history-item">
                          <div>
                            <p style={{ fontWeight: 800, fontSize: 14 }}>{item.results.cropName}</p>
                            <p style={{ fontSize: 11, color: 'var(--pc-ink-3)', fontWeight: 600 }}>
                              {new Date(item.savedAt).toLocaleDateString()} · ROI: {item.results.roi}%
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span style={{ fontWeight: 800, color: item.results.isProfit ? 'var(--pc-green)' : 'var(--pc-rose)' }}>
                              {formatCurrency(item.results.netProfit)}
                            </span>
                            <button onClick={() => deleteDoc(doc(db, 'calculations', item.id)).then(loadHistory)} className="text-pc-rose p-2 hover:bg-pc-rose-bg rounded-lg">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="pc-card">
            <form onSubmit={handleSubmit}>
              {/* PRIMARY INFO */}
              <div className="pc-section-title">
                <div className="pc-section-icon"><Sprout size={20} /></div>
                Crop & Land Info <span>(Fasal ki Jaankari)</span>
              </div>

              <div className="pc-input-grid mb-10">
                <div className="pc-field">
                  <label className="pc-label">Fasal ka Naam <span>Crop Name</span></label>
                  <div className="pc-input-wrap">
                    <Leaf className="pc-input-ico" size={18} />
                    <input name="cropName" value={form.cropName} onChange={handleChange} required placeholder="e.g. Gehun, Tamatar" className="pc-input" />
                  </div>
                </div>
                <div className="pc-field">
                  <label className="pc-label">Zameen (Acres) <span>Total Land</span></label>
                  <div className="pc-input-wrap">
                    <BarChart3 className="pc-input-ico" size={18} />
                    <input name="landSize" type="number" step="0.1" value={form.landSize} onChange={handleChange} required placeholder="e.g. 2.5" className="pc-input" />
                  </div>
                </div>
                <div className="pc-field">
                  <label className="pc-label">Yield (Quintal/Acre) <span>Expected Harvest</span></label>
                  <div className="pc-input-wrap">
                    <TrendingUp className="pc-input-ico" size={18} />
                    <input name="expectedYield" type="number" value={form.expectedYield} onChange={handleChange} required placeholder="e.g. 18" className="pc-input" />
                  </div>
                </div>
                <div className="pc-field">
                  <label className="pc-label">Price (₹/Quintal) <span>Market Selling Rate</span></label>
                  <div className="pc-input-wrap">
                    <Coins className="pc-input-ico" size={18} />
                    <input name="sellingPrice" type="number" value={form.sellingPrice} onChange={handleChange} required placeholder="e.g. 2100" className="pc-input" />
                  </div>
                </div>
              </div>

              {/* EXPENSES */}
              <div className="pc-section-title">
                <div className="pc-section-icon" style={{ background: 'var(--pc-amber-bg)', color: 'var(--pc-amber)' }}><Calculator size={20} /></div>
                Expense Details <span>(Khurach/Laagat - ₹/per Acre)</span>
              </div>

              <div className="pc-input-grid">
                <div className="pc-field">
                  <label className="pc-label">Seed Cost <span>Beej ka Kharcha</span></label>
                  <div className="pc-input-wrap">
                    <RefreshCw className="pc-input-ico" size={18} />
                    <input name="seedCost" type="number" value={form.seedCost} onChange={handleChange} required placeholder="e.g. 2200" className="pc-input" />
                  </div>
                </div>
                <div className="pc-field">
                  <label className="pc-label">Fertilizer <span>Khaad ka Kharcha</span></label>
                  <div className="pc-input-wrap">
                    <CloudRain className="pc-input-ico" size={18} />
                    <input name="fertilizerCost" type="number" value={form.fertilizerCost} onChange={handleChange} required placeholder="e.g. 3500" className="pc-input" />
                  </div>
                </div>
                <div className="pc-field">
                  <label className="pc-label">Protection <span>Dawaai ka Kharcha</span></label>
                  <div className="pc-input-wrap">
                    <CloudLightning className="pc-input-ico" size={18} />
                    <input name="pesticideCost" type="number" value={form.pesticideCost} onChange={handleChange} required placeholder="e.g. 1200" className="pc-input" />
                  </div>
                </div>
                <div className="pc-field">
                  <label className="pc-label">Irrigation <span>Paani ka Kharcha</span></label>
                  <div className="pc-input-wrap">
                    <Droplets className="pc-input-ico" size={18} />
                    <input name="irrigationCost" type="number" value={form.irrigationCost} onChange={handleChange} required placeholder="e.g. 2000" className="pc-input" />
                  </div>
                </div>
                <div className="pc-field">
                  <label className="pc-label">Labor <span>Majdoori</span></label>
                  <div className="pc-input-wrap">
                    <User className="pc-input-ico" size={18} />
                    <input name="laborCost" type="number" value={form.laborCost} onChange={handleChange} required placeholder="e.g. 3000" className="pc-input" />
                  </div>
                </div>
              </div>

              <button type="submit" className="pc-calc-btn">
                {loading ? <RefreshCw className="animate-spin" size={18} /> : <Calculator size={18} />}
                {loading ? 'Hisaab Ho raha hai...' : 'Munafa Nikalo (Calculate Profit)'}
              </button>
            </form>
          </div>

          <AnimatePresence>
            {results && (
              <motion.div
                ref={resultsRef}
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 space-y-6"
              >
                <div className={`pc-res-hero ${results.isProfit ? 'pc-res-hero--profit' : 'pc-res-hero--loss'}`}>
                  <div className="flex flex-col items-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${results.isProfit ? 'bg-pc-green-bg text-pc-green' : 'bg-pc-rose-bg text-pc-rose'}`}>
                      {results.isProfit ? <TrendingUp size={32} /> : <TrendingDown size={32} />}
                    </div>
                    <p className="pc-res-label">Net Profit / Loss Estimation</p>
                    <h2 className="pc-res-val" style={{ color: results.isProfit ? 'var(--pc-green)' : 'var(--pc-rose)' }}>
                      {formatCurrency(results.netProfit)}
                    </h2>
                    <div className="flex gap-4">
                      <span className="flex items-center gap-1 text-sm font-bold bg-[#f8faf9] px-4 py-1 rounded-full border border-pc-border">
                        ROI: {results.roi}%
                      </span>
                      <span className="flex items-center gap-1 text-sm font-bold bg-[#f8faf9] px-4 py-1 rounded-full border border-pc-border">
                        {results.cropName}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pc-res-grid">
                  <div className="pc-res-item">
                    <p className="pc-res-label">Total Expense</p>
                    <p className="text-2xl font-extrabold text-[#dc2626] mt-1">{formatCurrency(results.totalCost)}</p>
                    <p className="text-xs font-semibold text-pc-ink-3 mt-1">₹{results.totalCostPerAcre} / per acre</p>
                  </div>
                  <div className="pc-res-item">
                    <p className="pc-res-label">Total Revenue</p>
                    <p className="text-2xl font-extrabold text-pc-green mt-1">{formatCurrency(results.grossRevenue)}</p>
                    <p className="text-xs font-semibold text-pc-ink-3 mt-1">{results.totalYield} Quintal Total</p>
                  </div>
                  <div className="pc-res-item">
                    <p className="pc-res-label">Break-even Yield</p>
                    <p className="text-2xl font-extrabold text-pc-amber mt-1">{results.breakEvenYield} Q/Acre</p>
                    <p className="text-xs font-semibold text-pc-ink-3 mt-1">Min yield needed to avoid loss</p>
                  </div>
                  <div className="pc-res-item">
                    <p className="pc-res-label">Profit per Acre</p>
                    <p className="text-2xl font-extrabold text-pc-green mt-1">{formatCurrency(results.profitPerAcre)}</p>
                    <p className="text-xs font-semibold text-pc-ink-3 mt-1">Earnings for 1 acre</p>
                  </div>
                </div>

                <div className="pc-card">
                  <h3 className="pc-section-title"><Sun size={20} /> Scenario Analysis <span>(Mausam ke mutabik badlav)</span></h3>
                  <div className="pc-scenarios">
                    <div className="pc-sc-card pc-sc-card--bad">
                      <CloudLightning className="mx-auto mb-2" />
                      <p className="text-xs opacity-80 uppercase mb-1">Bad Weather</p>
                      <p className="text-lg font-bold">{formatCurrency(results.scenarios.conservative.profit)}</p>
                      <p className="text-[10px] opacity-70 mt-1">80% Yield Potential</p>
                    </div>
                    <div className="pc-sc-card pc-sc-card--norm">
                      <Sun className="mx-auto mb-2" />
                      <p className="text-xs opacity-80 uppercase mb-1">Normal Weather</p>
                      <p className="text-lg font-bold">{formatCurrency(results.scenarios.moderate.profit)}</p>
                      <p className="text-[10px] opacity-70 mt-1">100% Yield Potential</p>
                    </div>
                    <div className="pc-sc-card pc-sc-card--good">
                      <CloudRain className="mx-auto mb-2" />
                      <p className="text-xs opacity-80 uppercase mb-1">Great Weather</p>
                      <p className="text-lg font-bold">{formatCurrency(results.scenarios.optimistic.profit)}</p>
                      <p className="text-[10px] opacity-70 mt-1">120% Yield Potential</p>
                    </div>
                  </div>
                </div>

                <div className="pc-card">
                  <h3 className="pc-section-title"><Coins size={20} /> Expense Breakdown <span>(Laagat ka Vivran)</span></h3>
                  <div className="space-y-4">
                    {Object.entries(results.costs).map(([key, val]) => {
                      const perc = (val / results.totalCost) * 100;
                      const labels = { seed: 'Seeds', fertilizer: 'Fertilizer', pesticide: 'Pesticide', irrigation: 'Irrigation', labor: 'Labor' };
                      return (
                        <div key={key}>
                          <div className="flex justify-between text-sm font-bold">
                            <span>{labels[key]}</span>
                            <span>{formatCurrency(val)} ({perc.toFixed(0)}%)</span>
                          </div>
                          <div className="pc-cost-bar">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${perc}%` }} className="pc-cost-fill" />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="pc-action-btns">
                  <button
                    onClick={handleSave}
                    disabled={saving || saved}
                    className={`flex-1 flex items-center justify-center gap-2 h-14 rounded-2xl font-extrabold shadow-lg disabled:opacity-50 pc-save-btn`}
                  >
                    {saving ? <RefreshCw className="animate-spin" /> : saved ? <CheckCircle2 /> : <Save />}
                    {saved ? 'Saved Successfully' : 'Save to Profile'}
                  </button>
                  <button
                    className="flex-1 flex items-center justify-center gap-2 h-14 rounded-2xl font-extrabold shadow-lg pc-dl-btn"
                  >
                    <Download size={18} /> Download Summary
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>


    </>
  );
};

export default ProfitCalculatorPage;
