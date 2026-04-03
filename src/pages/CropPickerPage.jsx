import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sprout, Leaf, Droplets, Sun, TrendingUp, RefreshCw, ChevronRight, MapPin, Wind, ThermometerSun, Save, Download, History, X, Trash2, CheckCircle2 } from 'lucide-react';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import AppFooter from '../components/AppFooter';
import { useLanguage } from '../context/LanguageContext';

const CropPickerPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [form, setForm] = useState({
    soilType: '',
    soilColor: '',
    soilPH: 'Unknown',
    season: '',
    irrigation: '',
    landSize: '',
    state: 'Madhya Pradesh',
    district: ''
  });
  const resultsRef = useRef(null);
  const [results, setResults] = useState(null);
  const [estimatedPH, setEstimatedPH] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);
    setEstimatedPH(null);

    const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
    if (!OPENROUTER_API_KEY) {
      setError('OpenRouter API key missing. Set VITE_OPENROUTER_API_KEY in .env');
      setLoading(false);
      return;
    }

    const prompt = `You are an expert Indian agricultural advisor. 
A farmer has provided the following details:
- State: ${form.state}
- District: ${form.district || 'Not specified'}
- Soil Type: ${form.soilType}
- Soil Color: ${form.soilColor}
- Soil pH: ${form.soilPH === 'Unknown' ? 'Farmer does not know' : form.soilPH}
- Season: ${form.season}
- Irrigation: ${form.irrigation}
- Land Size: ${form.landSize} acres

Based on the region (${form.state}, ${form.district}) and soil characteristics (${form.soilColor}, ${form.soilType}), recommend the TOP 5 best crops. If pH is unknown, estimate it based on the typical soil profile for this region.

Recommend the TOP 5 best crops for this farmer. 
Respond ONLY in this exact JSON format, no extra text:
{
  "estimatedPH": "e.g. 6.5 - 7.2 (Neutral)",
  "crops": [
    {
      "name": "Crop name in English",
      "hindiName": "Fasal ka naam Hindi mein",
      "matchScore": 92,
      "expectedYield": "18-22 quintal/acre",
      "waterNeed": "Low/Medium/High",
      "growthDays": "90-120 days",
      "estimatedProfit": "₹25,000-35,000/acre",
      "whyGood": "One line reason in simple Hindi why this crop suits the farmer",
      "tips": "One practical tip in Hindi for this specific soil/season combo"
    }
  ]
}`;

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'X-Title': 'KrishiAI Crop Picker'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-001',
          messages: [{ role: 'user', content: prompt }]
        })
      });
      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;
      if (!content) throw new Error('Invalid response from AI');
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Invalid response format');
      const parsed = JSON.parse(jsonMatch[0]);
      if (!parsed?.crops?.length) throw new Error('No crops in response');
      setResults(parsed.crops);
      setEstimatedPH(parsed.estimatedPH);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      console.error(err);
      setError('Kuch gadbad ho gayi. Dobara try karein.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (specificCrop = null) => {
    if (!auth.currentUser || !results) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'calculations'), {
        userId: auth.currentUser.uid,
        type: 'cropPicker',
        inputs: { ...form },
        results: results,
        topCrop: specificCrop ? specificCrop.name : (results[0]?.name || ''),
        selectedCrop: specificCrop || results[0],
        savedAt: new Date().toISOString(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const loadHistory = async () => {
    if (!auth.currentUser) return;
    setHistoryLoading(true);
    setShowHistory(true);
    try {
      const snap = await getDocs(
        query(
          collection(db, 'calculations'),
          where('userId', '==', auth.currentUser.uid),
          where('type', '==', 'cropPicker')
        )
      );
      const items = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
      setHistory(items);
    } catch (err) {
      console.error('History error:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleDownload = () => {
    if (!results) return;
    const html = `
      <html>
      <head>
        <meta charset="UTF-8"/>
        <style>
          body { font-family: Arial, sans-serif; padding: 32px; color: #1a2117; }
          h1 { font-size: 24px; color: #2e7d4f; margin-bottom: 4px; }
          .subtitle { font-size: 13px; color: #7a8c77; margin-bottom: 24px; }
          .stamp { display: inline-block; border: 2px solid #2e7d4f; color: #2e7d4f; padding: 4px 14px; border-radius: 4px; font-weight: bold; font-size: 12px; margin-bottom: 20px; }
          .crop-card { border: 1px solid #e2e8df; border-radius: 12px; padding: 16px; margin-bottom: 12px; }
          .rank { display: inline-block; width: 28px; height: 28px; background: #2e7d4f; color: #fff; border-radius: 50%; text-align: center; line-height: 28px; font-weight: bold; font-size: 13px; margin-right: 10px; }
          .crop-name { font-size: 18px; font-weight: bold; display: inline; }
          .match { display: inline-block; float: right; font-weight: bold; color: #2e7d4f; }
          .pills { margin-top: 8px; }
          .pill { display: inline-block; background: #f7f9f6; border: 1px solid #e2e8df; border-radius: 20px; padding: 3px 10px; font-size: 11px; margin-right: 6px; margin-top: 4px; }
          .tip { background: #eaf4ee; border: 1px solid #c8e6d0; border-radius: 8px; padding: 8px 12px; margin-top: 8px; font-size: 12px; color: #2e7d4f; }
          .footer { margin-top: 32px; font-size: 11px; color: #b0bcad; border-top: 1px solid #e2e8df; padding-top: 12px; }
        </style>
      </head>
      <body>
        <div class="stamp">KrishiAI</div>
        <h1>Smart Crop Picker Report</h1>
        <p class="subtitle">
          ${form.state} · ${form.season} · ${form.soilType} soil · Generated ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        ${results.map((crop, i) => `
          <div class="crop-card">
            <span class="rank">${i + 1}</span>
            <span class="crop-name">${crop.name} (${crop.hindiName})</span>
            <span class="match">${crop.matchScore}% Match</span>
            <p style="margin-top:8px;font-size:13px;color:#475569;font-style:italic">${crop.whyGood}</p>
            <div class="pills">
              <span class="pill">Yield: ${crop.expectedYield}</span>
              <span class="pill">Water: ${crop.waterNeed}</span>
              <span class="pill">Days: ${crop.growthDays}</span>
              <span class="pill">Profit: ${crop.estimatedProfit}</span>
            </div>
            <div class="tip">💡 ${crop.tips}</div>
          </div>
        `).join('')}
        <div class="footer">KrishiAI — Smart Farming Assistant · Crafted by Jatin &amp; Jitendra · Technocrats Institute of Technology, Bhopal</div>
      </body>
      </html>
    `;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KrishiAI_CropPicker_${form.state}_${form.season}_${new Date().toLocaleDateString('en-IN').replace(/\//g, '-')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isFormValid = form.soilType && form.season && form.irrigation && form.landSize && form.state;

  return (
    <div className="min-h-screen" style={{ background: '#f0f4ed', fontFamily: 'Nunito, sans-serif' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '28px 16px 48px' }}>
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 text-sm text-[#2e7d4f] font-bold"
          style={{ border: '1px solid #d4dcd0', background: '#ffffff', padding: '8px 12px', borderRadius: 10 }}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="mt-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#1a2117' }}>
                {t('cp.title')}
              </h1>
              <p className="text-sm" style={{ color: '#7a8c77', marginTop: 6 }}>
                {t('cp.findBest')}
              </p>
              <div className="mt-3" style={{ width: 64, height: 4, background: '#2e7d4f', borderRadius: 999 }}></div>
            </div>
            <button
              onClick={loadHistory}
              className="flex items-center gap-2 text-sm font-semibold"
              style={{ color: '#2e7d4f', background: '#eaf4ee', border: '1px solid #a8d4b5', borderRadius: 10, padding: '6px 14px' }}
            >
              <History size={14} /> Purani Searches
            </button>
          </div>
        </div>

        {showHistory && (
          <div className="bg-white border border-[#e2e8df] rounded-2xl p-5 shadow-sm mb-6">
            <div className="flex justify-between items-center mb-4">
              <p className="text-lg font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
                Purani Searches
              </p>
              <button onClick={() => setShowHistory(false)} style={{ color: '#7a8c77' }}>
                <X size={18} />
              </button>
            </div>

            {historyLoading ? (
              <p className="text-sm text-[#7a8c77]">Loading...</p>
            ) : history.length === 0 ? (
              <p className="text-sm text-[#7a8c77] text-center py-6">Koi saved search nahi mili.</p>
            ) : (
              <div className="space-y-3">
                {history.map((item) => {
                   const cropToDisplay = item.selectedCrop || (item.results ? item.results[0] : null);
                   const match = cropToDisplay?.matchScore || 0;
                   return (
                     <div key={item.id}
                       className="group relative flex items-center justify-between gap-4 p-4 rounded-2xl transition-all hover:bg-white hover:shadow-md"
                       style={{ background: '#f7f9f6', border: '1px solid #e2e8df' }}
                     >
                       <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-xl bg-white border border-[#e2e8df] flex items-center justify-center text-[#2e7d4f] shadow-sm">
                           <Sprout size={22} />
                         </div>
                         <div>
                           <div className="flex items-center gap-2">
                             <p className="font-black text-sm text-[#1a2117]">{cropToDisplay?.name || item.topCrop}</p>
                             {cropToDisplay?.hindiName && (
                               <span className="text-[10px] text-[#7a8c77] border-l border-[#e2e8df] pl-2">{cropToDisplay.hindiName}</span>
                             )}
                           </div>
                           <p className="text-[10px] uppercase font-bold tracking-wider text-[#7a8c77] mt-1 space-x-2">
                             <span>{item.inputs.state}</span>
                             <span>•</span>
                             <span>{item.inputs.soilColor} {item.inputs.soilType} Soil</span>
                             <span>•</span>
                             <span className="text-[#2e7d4f]">{item.inputs.season}</span>
                           </p>
                           <p className="text-[9px] text-[#b0bcad] mt-1 italic">
                             {new Date(item.savedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} at {new Date(item.savedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                           </p>
                         </div>
                       </div>
                       <div className="flex items-center gap-4">
                         <div className="text-right">
                           <div className="text-xl font-black text-[#2e7d4f] leading-none mb-1">{match}%</div>
                           <div className="text-[8px] uppercase font-black text-[#b0bcad] tracking-widest">Match Score</div>
                         </div>
                         <button
                           onClick={() => {
                             if (window.confirm('Delete this history item?')) {
                               deleteDoc(doc(db, 'calculations', item.id)).then(loadHistory);
                             }
                           }}
                           className="w-8 h-8 rounded-lg flex items-center justify-center text-[#c0392b] hover:bg-[#c0392b]/10 transition-colors"
                         >
                           <Trash2 size={16} />
                         </button>
                       </div>
                     </div>
                   );
                 })}
              </div>
            )}
          </div>
        )}

        <div className="mt-6" style={{ background: '#ffffff', border: '1px solid #e2e8df', borderRadius: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', padding: 28 }}>
          <h2 className="text-xl font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#1a2117' }}>
            Apni Khet ki Jaankari Dijiye
          </h2>

          <form className="mt-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/** Soil Color */}
              <div>
                <label className="text-sm font-semibold text-[#1a2117]">Mitti ka Rang (Soil Color)</label>
                <select
                  name="soilColor"
                  value={form.soilColor}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full bg-[#f7f9f6] border border-[#e2e8df] rounded-xl px-4 py-3 focus:ring-2 focus:ring-krishi-300 focus:outline-none font-nunito text-sm"
                >
                  <option value="">Choose</option>
                  <option value="Black">Kaali (Black)</option>
                  <option value="Red">Laal (Red)</option>
                  <option value="Yellow">Peeli (Yellow)</option>
                  <option value="Brown">Bhuri (Brown/Alluvial)</option>
                  <option value="Laterite">Pathreeli (Laterite)</option>
                </select>
              </div>

              {/** Soil Type */}
              <div>
                <label className="text-sm font-semibold text-[#1a2117]">Mitti ki Banawat (Soil Type)</label>
                <select
                  name="soilType"
                  value={form.soilType}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full bg-[#f7f9f6] border border-[#e2e8df] rounded-xl px-4 py-3 focus:ring-2 focus:ring-krishi-300 focus:outline-none font-nunito text-sm"
                >
                  <option value="">Choose</option>
                  <option value="Sandy">Baluyi (Sandy)</option>
                  <option value="Loam">Domat (Loam)</option>
                  <option value="Clay">Chikni (Clay)</option>
                  <option value="Silty">Gad wali (Silty)</option>
                  <option value="Gravelly">Kankar wali (Gravelly)</option>
                </select>
              </div>

              {/** Soil pH */}
              <div>
                <label className="text-sm font-semibold text-[#1a2117]">Mitti ka pH (Optional)</label>
                <select
                  name="soilPH"
                  value={form.soilPH}
                  onChange={handleChange}
                  className="mt-1 w-full bg-[#f7f9f6] border border-[#e2e8df] rounded-xl px-4 py-3 focus:ring-2 focus:ring-krishi-300 focus:outline-none font-nunito text-sm"
                >
                  <option value="Unknown">Pata nahi (Estimate by AI)</option>
                  <option value="Acidic">Acidic (4.0-5.5)</option>
                  <option value="Slightly Acidic">Slightly Acidic (5.5-6.5)</option>
                  <option value="Neutral">Neutral (6.5-7.5)</option>
                  <option value="Slightly Alkaline">Slightly Alkaline (7.5-8.5)</option>
                  <option value="Alkaline">Alkaline (8.5+)</option>
                </select>
              </div>

              {/** Season */}
              <div>
                <label className="text-sm font-semibold text-[#1a2117]">Mausam / Season</label>
                <select
                  name="season"
                  value={form.season}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full bg-[#f7f9f6] border border-[#e2e8df] rounded-xl px-4 py-3 focus:ring-2 focus:ring-krishi-300 focus:outline-none font-nunito text-sm"
                >
                  <option value="">Choose</option>
                  <option value="Kharif">Kharif (June-October)</option>
                  <option value="Rabi">Rabi (October-March)</option>
                  <option value="Zaid">Zaid (March-June)</option>
                </select>
              </div>

              {/** Irrigation */}
              <div>
                <label className="text-sm font-semibold text-[#1a2117]">Sinchai ka Sadhan</label>
                <select
                  name="irrigation"
                  value={form.irrigation}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full bg-[#f7f9f6] border border-[#e2e8df] rounded-xl px-4 py-3 focus:ring-2 focus:ring-krishi-300 focus:outline-none font-nunito text-sm"
                >
                  <option value="">Choose</option>
                  <option value="Rainfed">Rainfed (Baarish par Nirbhar)</option>
                  <option value="Canal">Canal (Nahar)</option>
                  <option value="Borewell">Borewell (Boring)</option>
                  <option value="Drip">Drip (Tanka)</option>
                  <option value="Limited Water">Limited Water (Kam Paani)</option>
                </select>
              </div>

              {/** District */}
              <div>
                <label className="text-sm font-semibold text-[#1a2117]">Zila (District)</label>
                <input
                  type="text"
                  name="district"
                  value={form.district}
                  onChange={handleChange}
                  placeholder="Apna zila likhein"
                  className="mt-1 w-full bg-[#f7f9f6] border border-[#e2e8df] rounded-xl px-4 py-3 focus:ring-2 focus:ring-krishi-300 focus:outline-none font-nunito text-sm"
                />
              </div>

              {/** Land Size */}
              <div>
                <label className="text-sm font-semibold text-[#1a2117]">Zameen ka Rukba (Acres)</label>
                <input
                  type="number"
                  name="landSize"
                  value={form.landSize}
                  onChange={handleChange}
                  required
                  min={0.1}
                  step={0.1}
                  placeholder="e.g. 2.5"
                  className="mt-1 w-full bg-[#f7f9f6] border border-[#e2e8df] rounded-xl px-4 py-3 focus:ring-2 focus:ring-krishi-300 focus:outline-none font-nunito text-sm"
                />
              </div>

              {/** State */}
              <div>
                <label className="text-sm font-semibold text-[#1a2117]">Rajya (State)</label>
                <select
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full bg-[#f7f9f6] border border-[#e2e8df] rounded-xl px-4 py-3 focus:ring-2 focus:ring-krishi-300 focus:outline-none font-nunito text-sm"
                >
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Haryana">Haryana</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Bihar">Bihar</option>
                  <option value="Odisha">Odisha</option>
                  <option value="West Bengal">West Bengal</option>
                </select>
              </div>
            </div>

            <div className="mt-5">
              <button
                type="submit"
                disabled={!isFormValid || loading}
                className="w-full inline-flex items-center justify-center gap-2 font-bold font-nunito rounded-xl px-6 py-3 transition-all"
                style={{
                  background: '#2e7d4f',
                  color: '#ffffff',
                  opacity: loading ? 0.5 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? (
                  <>
                    <RefreshCw className="animate-spin" size={16} /> AI Soch Raha Hai...
                  </>
                ) : (
                  <>
                    <Sprout size={16} /> Best Fasal Dhundho
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {error && (
          <div className="mt-5" style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 16, padding: 16, color: '#991b1b' }}>
            {error}
          </div>
        )}

        <AnimatePresence>
          {results && (
            <motion.div
              ref={resultsRef}
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6"
            >
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#1a2117' }}>
                AI ki Recommendation
              </h2>
               <div className="flex items-center justify-between mt-1">
                 <p className="text-sm text-[#7a8c77]">Aapki khet ke liye top 5 fasalein</p>
                 {estimatedPH && (
                   <span className="text-[10px] uppercase tracking-widest font-black px-2 py-0.5 rounded bg-krishi-100 text-krishi-700 border border-krishi-200">
                     Est. pH: {estimatedPH}
                   </span>
                 )}
               </div>

              <div className="mt-4 space-y-4">
                {results.map((crop, idx) => {
                  const match = Number(crop.matchScore || 0);
                  const scoreStyle = match >= 85
                    ? { background: '#ecfdf5', color: '#166534', border: '1px solid #a7f3d0' }
                    : match >= 70
                      ? { background: '#fffbeb', color: '#92400e', border: '1px solid #fcd34d' }
                      : { background: '#f8fafc', color: '#475569', border: '1px solid #cbd5e1' };

                  return (
                    <motion.div
                      key={crop.name + idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.08 }}
                    >
                      <div className="rounded-2xl border border-[#e2e8df] bg-white p-5 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <div style={{ width: 32, height: 32, borderRadius: 999, background: '#2e7d4f', color: '#fff', fontWeight: 700, display: 'grid', placeItems: 'center' }}>{idx + 1}</div>
                          <div>
                            <p className="text-lg font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>{crop.name}</p>
                            <p className="text-sm text-[#3a4a37]">{crop.hindiName}</p>
                          </div>
                        </div>
                      </div>
                      <span className="text-sm font-bold px-3 py-1 rounded-full" style={scoreStyle}>{match}% Match</span>
                    </div>
                    <p className="mt-3 italic text-[#475569]">{crop.whyGood}</p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="flex items-center gap-1 bg-[#f7f9f6] border border-[#e2e8df] rounded-full px-3 py-1 text-xs font-semibold text-[#3a4a37]"><Leaf size={12} /> {crop.expectedYield}</span>
                      <span className="flex items-center gap-1 bg-[#f7f9f6] border border-[#e2e8df] rounded-full px-3 py-1 text-xs font-semibold text-[#3a4a37]"><Droplets size={12} /> {crop.waterNeed}</span>
                      <span className="flex items-center gap-1 bg-[#f7f9f6] border border-[#e2e8df] rounded-full px-3 py-1 text-xs font-semibold text-[#3a4a37]"><Sun size={12} /> {crop.growthDays}</span>
                      <span className="flex items-center gap-1 bg-[#f7f9f6] border border-[#e2e8df] rounded-full px-3 py-1 text-xs font-semibold text-[#3a4a37]"><TrendingUp size={12} /> {crop.estimatedProfit}</span>
                    </div>

                    <div className="mt-3 bg-[#eaf4ee] border border-[#c8e6d0] rounded-xl px-4 py-3 text-sm text-[#2e7d4f] font-medium flex items-center justify-between gap-4">
                       <span>💡 {crop.tips}</span>
                       <button 
                         onClick={() => handleSave(crop)}
                         disabled={saving || saved}
                         className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all"
                         style={{
                           background: '#2e7d4f',
                           color: '#fff',
                           opacity: saving ? 0.5 : 1
                         }}
                       >
                         Choose Fasal
                       </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="flex gap-3 flex-wrap mt-4">
            <button
              onClick={() => handleSave()}
              disabled={saving || saved}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all"
              style={{
                background: saved ? '#eaf4ee' : '#2e7d4f',
                color: saved ? '#2e7d4f' : '#fff',
                border: saved ? '1px solid #a8d4b5' : 'none',
                cursor: saving ? 'not-allowed' : 'pointer'
              }}
            >
              {saving ? (
                <><RefreshCw size={15} className="animate-spin" /> Saving...</>
              ) : saved ? (
                <><CheckCircle2 size={15} /> Saved!</>
              ) : (
                <><Save size={15} /> Save All Results</>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all"
              style={{ background: '#f7f9f6', color: '#1a2117', border: '1px solid #e2e8df', cursor: 'pointer' }}
            >
              <Download size={15} /> Download Report
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

      <AppFooter />
    </div>
  </div>
  );
};

export default CropPickerPage;
