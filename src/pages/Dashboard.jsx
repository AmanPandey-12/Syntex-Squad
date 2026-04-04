import {
   Leaf, X, TrendingUp, Scan, CloudRain, Sun,
   MapPin, Send, Bot, ArrowRight, Activity, ChevronRight,
   Droplets, Wind, CloudLightning, CloudSun, ThermometerSun,
   Search, LogOut, Sprout, Bell, Settings, LayoutDashboard,
   PackageSearch, Menu, User, Users, PhoneOff, PhoneCall, Speaker, Calculator, Square,
   RefreshCw, Award, History, Save, Trash2
} from 'lucide-react';

import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc, collection, onSnapshot, query, where, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';


import AppFooter from '../components/AppFooter';
import MicButton from '../components/MicButton';
import FloatingMic from '../components/FloatingMic';
import { useLanguage } from '../context/LanguageContext';

/* ─────────────────────────────────────────────────────────────
   NAVBAR
───────────────────────────────────────────────────────────── */


/* ─────────────────────────────────────────────────────────────
   SHARED MODAL PRIMITIVES
───────────────────────────────────────────────────────────── */
const Overlay = ({ children, onClose }) => (
   <div className="d-overlay">
      <div className="d-overlay-bg" onClick={onClose} />
      {children}
   </div>
);

const Modal = ({ title, subtitle, onClose, children, wide }) => (
   <Overlay onClose={onClose}>
      <div className={`d-modal ${wide ? 'd-modal--wide' : ''}`}>
         <div className="d-modal-head">
            <div>
               <h2 className="d-modal-title">{title}</h2>
               {subtitle && <p className="d-modal-sub">{subtitle}</p>}
            </div>
            <button className="d-modal-close" onClick={onClose}><X size={16} /></button>
         </div>
         {children}
      </div>
   </Overlay>
);

/* ─────────────────────────────────────────────────────────────
   MARKET MODAL  — v2  (data.gov.in dual-endpoint + new design)
───────────────────────────────────────────────────────────── */
const MANDI_FALLBACK = [
   { market: 'Azadpur', commodity: 'Tomato', min_price: '1200', max_price: '2400', modal_price: '1800', state: 'Delhi' },
   { market: 'Vashi', commodity: 'Onion', min_price: '2100', max_price: '3200', modal_price: '2600', state: 'Maharashtra' },
   { market: 'Indore', commodity: 'Soybean', min_price: '4500', max_price: '5200', modal_price: '4850', state: 'Madhya Pradesh' },
   { market: 'Bhopal', commodity: 'Maize', min_price: '1800', max_price: '2200', modal_price: '2000', state: 'Madhya Pradesh' },
   { market: 'Jabalpur', commodity: 'Gram (Chana)', min_price: '3800', max_price: '4500', modal_price: '4150', state: 'Madhya Pradesh' },
   { market: 'Ujjain', commodity: 'Mustard', min_price: '4200', max_price: '5100', modal_price: '4650', state: 'Madhya Pradesh' },
   { market: 'Gwalior', commodity: 'Barley', min_price: '2500', max_price: '3000', modal_price: '2750', state: 'Madhya Pradesh' },
   { market: 'Karnal', commodity: 'Rice (Basmati)', min_price: '3200', max_price: '4500', modal_price: '3800', state: 'Haryana' },
   { market: 'Ghazipur', commodity: 'Wheat', min_price: '2200', max_price: '2600', modal_price: '2400', state: 'Uttar Pradesh' },
   { market: 'Khurja', commodity: 'Potato', min_price: '900', max_price: '1500', modal_price: '1200', state: 'Uttar Pradesh' },
   { market: 'Satna', commodity: 'Lentil (Masoor)', min_price: '5500', max_price: '6200', modal_price: '5850', state: 'Madhya Pradesh' },
   { market: 'Ratlam', commodity: 'Coriander', min_price: '8000', max_price: '9500', modal_price: '8750', state: 'Madhya Pradesh' },
   { market: 'Mandsaur', commodity: 'Garlic', min_price: '6000', max_price: '7500', modal_price: '6750', state: 'Madhya Pradesh' },
   { market: 'Neemuch', commodity: 'Isabgul', min_price: '12000', max_price: '14500', modal_price: '13250', state: 'Madhya Pradesh' },
   { market: 'Dewas', commodity: 'Peas', min_price: '2800', max_price: '3500', modal_price: '3150', state: 'Madhya Pradesh' },
];

const MANDI_BACKUP_KEYS = [
   '579b464db66ec23bdd000001cdd3946e44ce4aab825ef8c6bef0c3d',
   '579b464db66ec23bdd000001859c8789508544e365021e16f39ddc2',
   '579b464db66ec23bdd000001550c82f01f80456f54c9d300b9687e1'
];

const API_KEY = MANDI_BACKUP_KEYS[0];

const MarketModal = ({ onClose }) => {
   const { t } = useLanguage();
   const [data, setData] = useState([]);
   const [q, setQ] = useState('');
   const [loading, setLoading] = useState(true);
   const [lastUpdated, setLastUpdated] = useState(null);
   const [isLive, setIsLive] = useState(false);
   const [sortKey, setSortKey] = useState('modal_price'); // modal_price | commodity | market
   const [sortDir, setSortDir] = useState('asc');
   const [activeState, setActiveState] = useState('All');

   const fetchMandi = useCallback(async () => {
      setLoading(true);
      try {
         let success = false;
         for (const currentKey of MANDI_BACKUP_KEYS) {
            try {
               const endpoints = [
                  `https://api.data.gov.in/resource/35985678-0d79-46b4-9ed6-6f13308a1d24?api-key=${currentKey}&format=json&limit=100`,
                  `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${currentKey}&format=json&limit=100`,
               ];
               for (const url of endpoints) {
                  const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
                  if (!res.ok) continue;
                  const json = await res.json();
                  const rc = json.records || json.data || [];
                  if (rc.length > 0) {
                     setData(rc.map(r => ({
                        commodity: r.commodity || r.Commodity || '—',
                        market: r.market || r.Market || '—',
                        state: r.state || r.State || '',
                        min_price: (r.min_price || r.Min_Price || '0').toString().replace(/,/g, ''),
                        max_price: (r.max_price || r.Max_Price || '0').toString().replace(/,/g, ''),
                        modal_price: (r.modal_price || r.Modal_Price || '0').toString().replace(/,/g, ''),
                     })));
                     setIsLive(true); success = true; break;
                  }
               }
               if (success) break;
            } catch (e) { }
         }
         if (!success) throw new Error();
      } catch (e) {
         setIsLive(false);
         setData(MANDI_FALLBACK.map(item => ({
            ...item,
            modal_price: (parseInt(item.modal_price) + (Math.floor(Math.random() * 200) - 100)).toString()
         })));
      } finally {
         setLoading(false);
         setLastUpdated(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
      }
   }, []);

   useEffect(() => {
      fetchMandi();
   }, [fetchMandi]);

   /* states for tab filter */
   const states = useMemo(() => {
      const s = ['All', ...new Set(data.map(r => r.state).filter(Boolean))];
      return s;
   }, [data]);

   /* filter + sort */
   const displayed = useMemo(() => {
      let rows = data.filter(r =>
         (activeState === 'All' || r.state === activeState) &&
         (r.commodity?.toLowerCase().includes(q.toLowerCase()) ||
            r.market?.toLowerCase().includes(q.toLowerCase()))
      );
      rows = [...rows].sort((a, b) => {
         const av = sortKey === 'modal_price' ? parseFloat(a[sortKey]) : (a[sortKey] || '');
         const bv = sortKey === 'modal_price' ? parseFloat(b[sortKey]) : (b[sortKey] || '');
         if (av < bv) return sortDir === 'asc' ? -1 : 1;
         if (av > bv) return sortDir === 'asc' ? 1 : -1;
         return 0;
      });
      return rows;
   }, [data, q, activeState, sortKey, sortDir]);

   const toggleSort = (key) => {
      if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
      else { setSortKey(key); setSortDir('asc'); }
   };

   const priceColor = (modal) => {
      const v = parseFloat(modal);
      if (!v) return 'var(--ink-3)';
      if (v >= 8000) return '#b8651a';
      if (v >= 4000) return '#2e7d4f';
      return 'var(--sky)';
   };

   return (
      <Overlay onClose={onClose}>
         <div className="mm-panel">
            {/* ── Header ── */}
            <div className="mm-head">
               <div className="mm-head-bg" />
               <div className="mm-head-content">
                  <div className="mm-head-l">
                     <div className="mm-head-info">
                        <div className="mm-title-row">
                           <h2 className="mm-title">{t('dash.mandiPrices')}</h2>
                           <div className={`mm-pulse-badge ${isLive ? 'is-live' : 'is-sample'}`}>
                              <span className="mm-pulse-dot" />
                              {isLive ? t('dash.live') : t('dash.sample')}
                           </div>
                        </div>
                        <p className="mm-sub">
                           {isLive ? 'Real-time rates from OGD India' : 'Sample rates — API restricted'}
                           {lastUpdated && <span className="mm-time"> · Updated {lastUpdated}</span>}
                        </p>
                     </div>
                  </div>
                  <div className="mm-head-r">
                     <button className="mm-icon-btn" onClick={() => fetchMandi()} title="Refresh data">
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                     </button>
                     <button className="mm-close-btn" onClick={onClose} aria-label="Close">
                        <X size={18} />
                     </button>
                  </div>
               </div>
            </div>

            {/* ── Filters & Tabs ── */}
            <div className="mm-filters">
               <div className="mm-search-box">
                  <Search size={14} className="mm-search-icon" />
                  <input
                     className="mm-search-input"
                     placeholder={t('dash.searchMarket')}
                     value={q}
                     onChange={e => setQ(e.target.value)}
                  />
                  {q && <button className="mm-search-clear" onClick={() => setQ('')}><X size={12} /></button>}
               </div>

               {states.length > 1 && (
                  <div className="mm-tab-strip">
                     {states.slice(0, 8).map(s => (
                        <button
                           key={s}
                           className={`mm-tab-pill ${activeState === s ? 'is-active' : ''}`}
                           onClick={() => setActiveState(s)}
                        >
                           {s}
                        </button>
                     ))}
                  </div>
               )}

               <div className="mm-sort-row">
                  <span className="mm-sort-hint">Sort results by:</span>
                  <div className="mm-sort-group">
                     {[
                        ['commodity', 'Commodity'],
                        ['market', 'Market'],
                        ['modal_price', 'Market Rate']
                     ].map(([key, label]) => (
                        <button
                           key={key}
                           className={`mm-sort-tab ${sortKey === key ? 'is-active' : ''}`}
                           onClick={() => toggleSort(key)}
                        >
                           {label}
                           {sortKey === key && <span className="mm-dir">{sortDir === 'asc' ? '↑' : '↓'}</span>}
                        </button>
                     ))}
                  </div>
               </div>
            </div>

            {/* ── List ── */}
            <div className="mm-content">
               {loading ? (
                  <div className="mm-loader">
                     <div className="mm-loader-spinner" />
                     <p className="mm-loader-text">Aggregating national mandi data...</p>
                  </div>
               ) : displayed.length === 0 ? (
                  <div className="mm-not-found">
                     <Search size={40} className="mm-nf-icon" />
                     <p className="mm-nf-text">No market matches your search</p>
                     <p className="mm-nf-sub">Try searching for a state or common crop name like "Wheat"</p>
                  </div>
               ) : (
                  <div className="mm-card-grid">
                     {displayed.map((item, i) => {
                        const price = parseFloat(item.modal_price);
                        const isHigh = price >= 8000;
                        const isMid = price >= 3000;
                        return (
                           <div key={i} className="mm-card">
                              <div className="mm-card-main">
                                 <div className="mm-card-l">
                                    <div className={`mm-card-icon ${isHigh ? 'is-gold' : isMid ? 'is-emerald' : 'is-indigo'}`}>
                                       <Leaf size={16} />
                                    </div>
                                    <div className="mm-card-info">
                                       <h4 className="mm-card-commodity">{item.commodity}</h4>
                                       <p className="mm-card-location">
                                          <MapPin size={10} /> {item.market}, {item.state}
                                       </p>
                                    </div>
                                 </div>
                                 <div className="mm-card-r">
                                    <div className="mm-card-price-stack">
                                       <span className="mm-card-currency">₹</span>
                                       <span className={`mm-card-price ${isHigh ? 'is-high' : isMid ? 'is-mid' : ''}`}>{item.modal_price}</span>
                                       <span className="mm-card-unit">/ quintal</span>
                                    </div>
                                    <div className={`mm-card-rank ${isHigh ? 'is-premium' : isMid ? 'is-good' : 'is-fair'}`}>
                                       {isHigh ? 'Premium' : isMid ? 'Good Rate' : 'Market Rate'}
                                    </div>
                                 </div>
                              </div>
                              <div className="mm-card-footer">
                                 <div className="mm-range-bar">
                                    <span className="mm-range-label">Range:</span>
                                    <span className="mm-range-val">₹{item.min_price} — ₹{item.max_price}</span>
                                 </div>
                              </div>
                           </div>
                        );
                     })}
                  </div>
               )}
            </div>

            {/* ── Footer ── */}
            {!loading && (
               <div className="mm-footer">
                  {isLive
                     ? `✓ Live data from data.gov.in · ${displayed.length} mandis shown`
                     : `Sample data · data.gov.in API unavailable`}
               </div>
            )}
         </div>
      </Overlay>
   );
};

/* ─────────────────────────────────────────────────────────────
   CALENDAR MODAL
───────────────────────────────────────────────────────────── */


/* ─────────────────────────────────────────────────────────────
   Weather helpers
───────────────────────────────────────────────────────────── */
const getWeatherIcon = (weatherCode, size = 40) => {
   if (!weatherCode) return <CloudSun size={size} strokeWidth={1} />;
   const code = String(weatherCode);
   if (code.startsWith('2')) return <CloudLightning size={size} strokeWidth={1} />;
   if (code.startsWith('3') || code.startsWith('5')) return <CloudRain size={size} strokeWidth={1} />;
   if (code.startsWith('6')) return <CloudRain size={size} strokeWidth={1} />;
   if (code === '800') return <Sun size={size} strokeWidth={1} />;
   if (code.startsWith('8')) return <CloudSun size={size} strokeWidth={1} />;
   return <CloudSun size={size} strokeWidth={1} />;
};

const getWeatherEmoji = (weatherCode) => {
   if (!weatherCode) return '⛅';
   const code = String(weatherCode);
   if (code.startsWith('2')) return '⛈️';
   if (code.startsWith('3')) return '🌦️';
   if (code.startsWith('5')) return '🌧️';
   if (code.startsWith('6')) return '❄️';
   if (code === '800') return '☀️';
   if (code.startsWith('8')) return '⛅';
   return '⛅';
};

const getCropAlerts = (weatherData) => {
   if (!weatherData) return [];
   const alerts = [];
   const temp = weatherData.main?.temp;
   const humidity = weatherData.main?.humidity;
   const windSpeed = weatherData.wind?.speed;
   const weatherCode = weatherData.weather?.[0]?.id;

   if (humidity > 85 && temp >= 18 && temp <= 30) {
      alerts.push({
         type: 'warning',
         icon: '⚠️',
         text: 'Fungal disease risk high — spray preventive fungicide today',
         hindi: 'Fungal rog ka khatra — aaj fungicide spray karein'
      });
   }
   if (temp < 4) {
      alerts.push({
         type: 'danger',
         icon: '🥶',
         text: 'Frost warning — cover sensitive crops immediately',
         hindi: 'Pala padne ka khatra — fasal dhakein'
      });
   }
   if (temp > 42) {
      alerts.push({
         type: 'danger',
         icon: '🔥',
         text: 'Heat stress alert — irrigate crops at dawn',
         hindi: 'Garmi alert — subah savayre sinchai karein'
      });
   }
   if (String(weatherCode).startsWith('5')) {
      alerts.push({
         type: 'info',
         icon: '🌧️',
         text: 'Rain expected — delay pesticide spraying',
         hindi: 'Baarish aa rahi hai — pesticide spray rokein'
      });
   }
   if (windSpeed < 3 && !String(weatherCode).startsWith('5')) {
      alerts.push({
         type: 'success',
         icon: '✅',
         text: 'Good spray window — low wind, no rain expected',
         hindi: 'Spray ke liye sahi samay — hawa kam hai'
      });
   }
   return alerts;
};

/* ─────────────────────────────────────────────────────────────
   WEATHER MODAL
───────────────────────────────────────────────────────────── */
const WeatherModal = ({ onClose }) => {
   const [weather, setWeather] = useState(null);
   const [forecast, setForecast] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   useEffect(() => {
      (async () => {
         setLoading(true);
         try {
            // Try to get user location
            if (navigator.geolocation) {
               navigator.geolocation.getCurrentPosition(
                  async (position) => {
                     const data = await mockApi.fetchWeather(position.coords.latitude, position.coords.longitude);
                     if (data && data.current && data.current.main) {
                        setWeather(data.current);
                        setForecast(data.forecast);
                     } else {
                        setError('Weather API not configured or invalid response');
                        setWeather(null);
                        setForecast(null);
                     }
                     setLoading(false);
                  },
                  async () => {
                     // Location denied, use fallback
                     setError('Location denied');
                     setLoading(false);
                  }
               );
            } else {
               setError('Geolocation not supported');
               setLoading(false);
            }
         } catch (err) {
            setError('Failed to fetch weather');
            setLoading(false);
         }
      })();
   }, []);

   if (loading) {
      return (
         <Modal title="Weather" subtitle="Current conditions at your location" onClose={onClose}>
            <div className="space-y-4">
               <div className="bg-gray-100 animate-pulse rounded-lg h-32 w-full" />
               <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map(i => (
                     <div key={i} className="bg-gray-100 animate-pulse rounded-lg h-16" />
                  ))}
               </div>
            </div>
         </Modal>
      );
   }

   if (error || !weather) {
      return (
         <Modal title="Weather" subtitle="Current conditions at your location" onClose={onClose}>
            <div className="d-wx-hero">
               <div className="d-wx-main">
                  <CloudSun size={40} strokeWidth={1} className="d-wx-main-icon" />
                  <div>
                     <p className="d-wx-temp">—</p>
                     <p className="d-wx-cond">{error ? error : 'Location not available'}</p>
                     <p className="d-wx-loc"><MapPin size={11} /> {weather?.name || 'Location unavailable'}</p>
                     <p className="text-xs text-gray-400 italic mt-2">Enable location and valid API key for live weather</p>
                  </div>
               </div>
               <div className="d-wx-metrics">
                  {[
                     { label: 'Humidity', value: '64%', Icon: Droplets },
                     { label: 'Wind', value: '12 km/h', Icon: Wind },
                     { label: 'Pressure', value: '1012 hPa', Icon: Activity },
                     { label: 'Rain', value: '15%', Icon: CloudRain },
                  ].map(({ label, value, Icon }) => (
                     <div key={label} className="d-wx-tile">
                        <Icon size={14} strokeWidth={1.5} className="d-wx-tile-icon" />
                        <p className="d-wx-tile-val">{value}</p>
                        <p className="d-wx-tile-label">{label}</p>
                     </div>
                  ))}
               </div>
            </div>
         </Modal>
      );
   }

   return (
      <Modal title="Weather" subtitle="Live conditions at your location" onClose={onClose}>
         <div className="d-wx-hero">
            <div className="d-wx-main">
               {getWeatherIcon(weather.weather?.[0]?.id, 40)}
               <div>
                  <p className="d-wx-temp">{Math.round(weather.main.temp)}°C</p>
                  <p className="d-wx-cond" style={{ textTransform: 'capitalize' }}>{weather.weather[0].description}</p>
                  <p className="d-wx-loc"><MapPin size={11} /> {weather.name}, India</p>
               </div>
            </div>
            <div className="d-wx-metrics">
               {[
                  { label: 'Humidity', value: `${weather.main.humidity}%`, Icon: Droplets },
                  { label: 'Wind', value: `${Math.round(weather.wind.speed * 3.6)} km/h`, Icon: Wind },
                  { label: 'Feels like', value: `${Math.round(weather.main.feels_like)}°`, Icon: ThermometerSun },
                  { label: 'Pressure', value: `${weather.main.pressure} hPa`, Icon: Activity },
               ].map(({ label, value, Icon }) => (
                  <div key={label} className="d-wx-tile">
                     <Icon size={14} strokeWidth={1.5} className="d-wx-tile-icon" />
                     <p className="d-wx-tile-val">{value}</p>
                     <p className="d-wx-tile-label">{label}</p>
                  </div>
               ))}
            </div>
         </div>

         {getCropAlerts(weather).length > 0 && (
            <div className="space-y-2">
               <p style={{ fontSize: 11, fontWeight: 700, color: '#7a8c77', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Fasal Alerts</p>
               {getCropAlerts(weather).map((alert, i) => (
                  <div key={i} style={{
                     display: 'flex', alignItems: 'flex-start', gap: 10,
                     padding: '10px 14px', borderRadius: 10,
                     background: alert.type === 'danger' ? '#fdecea' : alert.type === 'warning' ? '#fef3e7' : alert.type === 'success' ? '#eaf4ee' : '#e8f3fb',
                     border: `1px solid ${alert.type === 'danger' ? 'rgba(192,57,43,0.15)' : alert.type === 'warning' ? 'rgba(184,101,26,0.15)' : alert.type === 'success' ? 'rgba(46,125,79,0.15)' : 'rgba(30,110,166,0.15)'}`
                  }}>
                     <span style={{ fontSize: 16 }}>{alert.icon}</span>
                     <div>
                        <p style={{ fontSize: 12, fontWeight: 600, color: '#1a2117' }}>{alert.text}</p>
                        <p style={{ fontSize: 11, color: '#7a8c77', marginTop: 2 }}>{alert.hindi}</p>
                     </div>
                  </div>
               ))}
            </div>
         )}

         {forecast?.list && (
            <div className="d-wx-forecast">
               <p className="d-wx-fc-label">Agle 5 Din</p>
               <div className="d-wx-fc-days">
                  {forecast.list.filter((_, i) => i % 4 === 0).slice(0, 5).map((item, i) => {
                     const date = new Date(item.dt * 1000);
                     const day = date.toLocaleDateString('hi-IN', { weekday: 'short' });
                     return (
                        <div key={i} className="d-wx-fc-day">
                           <p className="d-wx-fc-name">{i === 0 ? 'Aaj' : day}</p>
                           <span className="d-wx-fc-icon" style={{ fontSize: 20 }}>{getWeatherEmoji(item.weather[0]?.id)}</span>
                           <p className="d-wx-fc-temp">{Math.round(item.main.temp_max)}°</p>
                           <p style={{ fontSize: 10, color: '#b0bcad' }}>{Math.round(item.main.temp_min)}°</p>
                        </div>
                     );
                  })}
               </div>
            </div>
         )}

      </Modal>
   );
};

/* ─────────────────────────────────────────────────────────────
   DASHBOARD
───────────────────────────────────────────────────────────── */
const Dashboard = () => {
   const [crops, setCrops] = useState([]);
   const [loading, setLoading] = useState(true);
   const [authLoading, setAuthLoading] = useState(true);
   const [userProfile, setUserProfile] = useState(null);
   const [chatOpen, setChatOpen] = useState(false);
   const [savedChats, setSavedChats] = useState([]);
   const [showingHistory, setShowingHistory] = useState(false);
   const [savingChat, setSavingChat] = useState(false);
   const [marketOpen, setMarketOpen] = useState(false);
   const [calendarOpen, setCalendarOpen] = useState(false);
   const [weatherOpen, setWeatherOpen] = useState(false);
   const [communityOpen, setCommunityOpen] = useState(false);
   const [dashWeather, setDashWeather] = useState(null);
   const [chatMessages, setChatMessages] = useState([
      { role: 'bot', text: 'Hello! I can help analyse your crop health, explain seasonal schedules, or answer questions about your farm.' }
   ]);
   const [chatInput, setChatInput] = useState('');
   const [chatLoading, setChatLoading] = useState(false);
   const [speakingIdx, setSpeakingIdx] = useState(null);
   const [isPaused, setIsPaused] = useState(false);
   const [incomingCall, setIncomingCall] = useState(null);
   const chatEndRef = useRef(null);
   const navigate = useNavigate();
   const { search } = useLocation();
   const { t, language } = useLanguage();

   useEffect(() => {
      if (search === '?chat=true') setChatOpen(true);
      if (search === '?weather=true') setWeatherOpen(true);
      if (search.startsWith('?chat=true&message=')) {
         setChatOpen(true);
         const message = decodeURIComponent(search.split('message=')[1]);
         setTimeout(() => handleSend(null, message), 500); // wait for chat to open
         navigate('/dashboard?chat=true', { replace: true });
      }
   }, [search]);

   useEffect(() => {
      const supported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
      if (!supported) {
         console.info('Voice search not supported in this browser. Use Chrome for best experience.');
      }
   }, []);

   useEffect(() => {
      if (navigator.geolocation) {
         navigator.geolocation.getCurrentPosition(async (position) => {
            const data = await mockApi.fetchWeather(position.coords.latitude, position.coords.longitude);
            if (data?.current) setDashWeather(data.current);
         }, () => {
            // geolocation denied / fail: no dashboard weather update
         });
      }
   }, []);

   useEffect(() => {
      let unsubCrops = () => { };
      let unsubSchemes = () => { };
      let unsubChats = () => { };
      if (!auth) { navigate('/login'); return; }
      const unsubAuth = auth.onAuthStateChanged(async user => {
         if (user) {
            try {
               const uDoc = await getDoc(doc(db, 'users', user.uid));
               if (uDoc.exists()) setUserProfile(uDoc.data());
               const cq = query(collection(db, 'crops'), where('userId', '==', user.uid));
               unsubCrops = onSnapshot(cq, snap => {
                  const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                  setCrops(list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)));
                  setLoading(false); setAuthLoading(false);
               }, (error) => {
                  console.error("Crops listener error:", error);
                  if (error.code === 'permission-denied') {
                     console.warn("Permission denied for crops.");
                     navigate('/login');
                  }
                  setLoading(false); setAuthLoading(false);
               });
               const chatQ = query(collection(db, 'chats'), where('userId', '==', user.uid));
               unsubChats = onSnapshot(chatQ, snap => {
                  const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                  setSavedChats(list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)));
               }, (error) => {});

            } catch { setLoading(false); setAuthLoading(false); }
         } else { setAuthLoading(false); navigate('/login'); }
      });
      return () => { unsubAuth(); unsubCrops(); unsubChats(); unsubSchemes(); };
   }, [navigate]);

   useEffect(() => {
      let unsubCalls = () => { };
      const startCallsListener = (uid) => {
         if (!uid) return;
         const q = query(
            collection(db, 'calls'),
            where('receiverId', '==', uid),
            where('status', '==', 'ringing')
         );
         unsubCalls = onSnapshot(q, snap => {
            if (!snap.empty) setIncomingCall({ id: snap.docs[0].id, ...snap.docs[0].data() });
            else setIncomingCall(null);
         }, (error) => {
            console.error("Calls listener error:", error);
            if (error.code === 'permission-denied') {
               console.warn("Permission denied for calls. User may not be authenticated yet.");
            }
         });
      };

      const unsubAuth = auth.onAuthStateChanged(user => {
         if (user) {
            startCallsListener(user.uid);
         } else {
            setIncomingCall(null);
            unsubCalls();
         }
      });

      return () => {
         unsubAuth();
         unsubCalls();
      };
   }, []);

   const answerCall = async () => {
      if (!incomingCall) return;
      await updateDoc(doc(db, 'calls', incomingCall.id), { status: 'active' });
      setIncomingCall(null); // FarmerCommunity handles the 'active' state if user is there
   };

   const rejectCall = async () => {
      if (!incomingCall) return;
      await updateDoc(doc(db, 'calls', incomingCall.id), { status: 'rejected' });
      setIncomingCall(null);
   };

   useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

   // Manual TTS only on user button click (auto-play disabled for browser policy compliance).

   const stats = useMemo(() => {
      if (!crops.length) return { health: 0, alerts: 0, temp: '24°C', humidity: '64%' };
      const avg = crops.reduce((a, c) => a + (c.healthScore || 0), 0) / crops.length;
      return {
         health: Math.round(avg),
         alerts: crops.filter(c => c.status !== 'Healthy').length,
         temp: '24°C',
         humidity: '64%',
      };
   }, [crops]);

   const quickQA = {
      'What is KrishiAI?': 'KrishiAI is an AI-powered farm management platform combining crop diagnostics, market pricing, and weather into one dashboard.',
      'How do I scan?': "Tap 'Diagnose', upload a leaf or field photo, and the AI will identify issues with treatment recommendations.",
      'Is my data safe?': 'Yes — all your farm data is encrypted and stored privately under your account.',
      'How to use voice search?': 'Click the microphone button and speak in Hindi or English. Say "mandi bhav" for prices or "mausam batao" for weather.',
      'What crops can I scan?': 'You can scan major Indian crops like wheat, rice, maize, cotton, tomato, potato, and many more.',
      'How accurate is the AI?': 'Our AI achieves over 93% accuracy in disease detection, trained on thousands of Indian crop images.',
      'Can I get market prices?': 'Yes, check the Mandi section for live commodity prices from major Indian markets.',
      'What is crop calendar?': 'Crop calendar shows optimal planting and harvesting times for different seasons in India.',
      'How to improve crop health?': 'Regular scanning, proper irrigation, balanced fertilizers, and timely pest control improve health scores.',
      'What languages supported?': 'The app supports Hindi and English. Voice search works in both languages.'
   };

   const handleSend = async (e, forced = null) => {
      if (e) e.preventDefault();
      const msg = forced || chatInput;
      if (!msg.trim() || chatLoading) return;
      setChatInput('');
      setChatMessages(p => [...p, { role: 'user', text: msg }]);
      if (quickQA[msg]) {
         setTimeout(() => setChatMessages(p => [...p, { role: 'bot', text: quickQA[msg] }]), 280);
         return;
      }
      setChatLoading(true);
      try {
         const resp = await mockApi.chatWithAI(msg, crops, language);
         setChatMessages(p => [...p, { role: 'bot', text: resp }]);
      } catch {
         setChatMessages(p => [...p, { role: 'bot', text: 'Unable to connect. Please try again.' }]);
      } finally { setChatLoading(false); }
   };

   const handleSaveChat = async () => {
      if (chatMessages.length <= 1) return; // Only bot greeting or empty
      if (!auth.currentUser) return;
      setSavingChat(true);
      try {
         const firstUserMsg = chatMessages.find(m => m.role === 'user')?.text || 'Farm Chat';
         let generatedTitle = firstUserMsg.length > 28 ? firstUserMsg.substring(0, 28) + '...' : firstUserMsg;
         
         await addDoc(collection(db, 'chats'), {
            userId: auth.currentUser.uid,
            title: generatedTitle,
            messages: chatMessages,
            createdAt: new Date().toISOString()
         });
         alert('Chat history saved successfully!');
      } catch (e) {
         console.error('Error saving chat:', e);
         alert('Failed to save chat.');
      }
      setSavingChat(false);
   };

   if (authLoading) return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4ed' }}>
         <p style={{ fontFamily: 'Nunito, sans-serif', color: '#6b7a6a', fontSize: 14 }}>Loading your farm…</p>
      </div>
   );

   const firstName = userProfile?.name?.split(' ')[0] || 'Farmer';
   const hour = new Date().getHours();
   const greeting = hour < 12 ? t('dash.goodMorning') : hour < 17 ? t('dash.goodAfternoon') : t('dash.goodEvening');
   const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

   /* ── RENDERER ── */
   const renderFormattedText = (text) => {
      if (!text) return null;
      const sections = text.split('\n');
      return sections.map((line, i) => {
         if (!line.trim()) return <div key={i} style={{ height: '8px' }} />;
         return (
            <div key={i}>
               {line.split(/(\*\*.*?\*\*)/).map((part, j) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                     return <strong key={j}>{part.slice(2, -2)}</strong>;
                  }
                  return part;
               })}
            </div>
         );
      });
   };

   return (
      <>
         <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,700;0,800;1,700&family=Outfit:wght@300;400;500;600;700;800;900&family=Dancing+Script:wght@700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg:        #f0f4ed;
          --surface:   #ffffff;
          --surface-2: #f7f9f6;
          --border:    #e2e8df;
          --border-2:  #d4dcd0;
          --ink:       #1a2117;
          --ink-2:     #3a4a37;
          --ink-3:     #7a8c77;
          --ink-4:     #b0bcad;
          --green:     #2e7d4f;
          --green-2:   #3fa066;
          --green-bg:  #eaf4ee;
          --green-mid: #a3e635;
          --amber:     #b8651a;
          --amber-bg:  #fef3e7;
          --rose:      #c0392b;
          --rose-bg:   #fdecea;
          --sky:       #1e6ea6;
          --sky-bg:    #e8f3fb;
          --r-xs: 6px; --r-sm: 10px; --r-md: 14px; --r-lg: 20px; --r-xl: 28px;
          --sh-1: 0 1px 4px rgba(20,35,18,.07), 0 0 1px rgba(20,35,18,.04);
          --sh-2: 0 4px 20px rgba(20,35,18,.09), 0 1px 4px rgba(20,35,18,.05);
          --sh-3: 0 16px 56px rgba(20,35,18,.13), 0 4px 14px rgba(20,35,18,.06);
          --sh-4: 0 32px 80px rgba(20,35,18,.18), 0 8px 24px rgba(20,35,18,.08);
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        @media(min-width:1024px) {
          .d-tiles { grid-template-columns: repeat(4,1fr) !important; }
        }

        body { background: var(--bg); font-family: 'Outfit', 'Nunito', sans-serif; color: var(--ink); -webkit-font-smoothing: antialiased; }


        /* ══════════════════════════════════════════
           PAGE
        ══════════════════════════════════════════ */
        .d-page {
          max-width: 1100px; margin: 0 auto;
          /* Increased padding to avoid collision with floating navbar */
          padding: 124px 28px 80px;
        }
        @media(max-width:640px) { .d-page { padding: 80px 16px 80px; } }

        /* ── HERO BANNER ── */
        .d-hero {
          background: linear-gradient(rgba(21,43,30,0.8), rgba(30,74,48,0.6)), url('/hero_bg.png');
          background-size: cover; background-position: center;
          border-radius: var(--r-xl); padding: 36px 40px; margin-bottom: 20px;
          position: relative; overflow: hidden;
          box-shadow: 0 10px 48px rgba(18,40,26,.22), 0 2px 8px rgba(18,40,26,.12);
        }
        .d-hero::before {
          content: ''; position: absolute; inset: 0; pointer-events: none;
          background-image: radial-gradient(circle, rgba(255,255,255,.07) 1px, transparent 1px);
          background-size: 28px 28px;
        }
        .d-hero::after {
          content: ''; position: absolute; top: -100px; right: -100px;
          width: 360px; height: 360px; border-radius: 50%;
          background: radial-gradient(circle, rgba(90,210,130,.11) 0%, transparent 68%);
          pointer-events: none;
        }
        .d-hero-inner {
          position: relative; z-index: 1;
          display: flex; justify-content: space-between; align-items: flex-end;
          flex-wrap: wrap; gap: 24px;
        }
        .d-hero-meta {
          font-size: 11.5px; font-weight: 600; color: rgba(255,255,255,.38);
          letter-spacing: .06em; margin-bottom: 8px;
          display: flex; align-items: center; gap: 6px;
        }
        .d-hero-name {
          font-family: 'Outfit', sans-serif;
          font-size: 36px; font-weight: 800; color: #fff; line-height: 1.15; margin-bottom: 12px;
          word-break: break-word; text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        @media(max-width:560px) { .d-hero-name { font-size: 24px; } }
        .d-hero-name em { font-family: 'Dancing Script', cursive; font-style: normal; color: var(--green-mid); font-size: 1.15em; filter: drop-shadow(0 2px 6px rgba(0,0,0,0.4)); }
        .d-hero-badge {
          display: inline-flex; align-items: center; gap: 7px; padding: 5px 14px;
          background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.1);
          border-radius: 100px; font-size: 12px; color: rgba(255,255,255,.48); font-weight: 600;
        }
        .d-hero-bdot { width: 7px; height: 7px; border-radius: 50%; background: var(--green-mid); box-shadow: 0 0 8px var(--green-mid); }
        .d-hero-kpis { display: flex; gap: 32px; }
        @media(max-width:560px) { .d-hero-kpis { display: none; } }
        .d-kpi { text-align: right; }
        .d-kpi-val { font-family: 'Outfit', sans-serif; font-size: 32px; font-weight: 800; color: #fff; line-height: 1; }
        .d-kpi-val--g { color: var(--green-mid); }
        .d-kpi-val--a { color: #f5c07a; }
        .d-kpi-val--r { color: #f5a09a; }
        .d-kpi-label { font-size: 10px; color: rgba(255,255,255,.35); font-weight: 700; margin-top: 5px; letter-spacing: .1em; text-transform: uppercase; }

        /* ── TILES ── */
        .d-tiles { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; margin-bottom: 24px; }
        @media(max-width:840px) { .d-tiles { grid-template-columns: repeat(2,1fr); } }
        .d-tile {
          background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg);
          padding: 20px 22px; box-shadow: var(--sh-1); cursor: pointer; text-align: left;
          position: relative; overflow: hidden;
          transition: box-shadow .18s, border-color .18s, translate .18s;
        }
        .d-tile:hover { box-shadow: var(--sh-2); border-color: var(--border-2); translate: 0 -2px; }
        .d-tile::before { content: ''; position: absolute; inset-y: 0; left: 0; width: 4px; background: var(--tc,var(--green)); border-radius: var(--r-lg) 0 0 var(--r-lg); }
        .d-tile-icon { width: 38px; height: 38px; border-radius: var(--r-sm); display: flex; align-items: center; justify-content: center; margin-bottom: 16px; background: var(--tb,var(--green-bg)); color: var(--tc,var(--green)); }
        .d-tile-label { font-size: 10.5px; font-weight: 700; color: var(--ink-3); letter-spacing: .07em; text-transform: uppercase; margin-bottom: 5px; }
        .d-tile-value { font-family: 'Outfit', sans-serif; font-size: 26px; font-weight: 700; color: var(--ink); line-height: 1; }
        .d-tile-sub { font-size: 11px; color: var(--ink-4); font-weight: 500; margin-top: 6px; line-height: 1.45; }

        /* ── BODY GRID ── */
        .d-body { display: grid; grid-template-columns: 1fr 300px; gap: 20px; }
        @media(max-width:960px) { .d-body { grid-template-columns: 1fr; } }

        .d-sec-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
        .d-sec-title { font-family: 'Outfit', sans-serif; font-size: 20px; font-weight: 700; color: var(--ink); }
        .d-sec-link { font-size: 12.5px; font-weight: 700; color: var(--green); text-decoration: none; display: flex; align-items: center; gap: 4px; }
        .d-sec-link:hover { color: var(--green-2); }

        /* ── CROP LIST (Unified Premium Redesign) ── */
        .d-crop-list { display: flex; flex-direction: column; gap: 12px; }
        .d-crop-row {
          display: flex; align-items: center; justify-content: space-between; padding: 16px 20px;
          background: var(--surface); border: 1px solid var(--border);
          border-radius: var(--r-lg); cursor: pointer;
          box-shadow: 0 4px 12px rgba(20,35,18,0.03);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative; overflow: hidden;
        }
        .d-crop-row:hover { box-shadow: var(--sh-2); border-color: var(--green-mid); transform: scale(1.01); }
        .d-crop-row::after { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: var(--green); opacity: 0.8; }
        
        .d-crop-l { display: flex; align-items: center; gap: 18px; }
        .d-crop-ico {
          width: 48px; height: 48px; border-radius: var(--r-md);
          background: var(--surface-2); border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
        }
        .d-crop-ico img { width: 100%; height: 100%; object-fit: cover; }
        .d-crop-ico svg { color: var(--green); }
        
        .d-crop-name { font-size: 15px; font-weight: 700; color: var(--ink); margin-bottom: 4px; }
        .d-crop-meta { font-size: 11px; font-weight: 600; color: var(--ink-3); text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 6px; }
        .d-crop-meta span { color: var(--green); font-weight: 800; }
        
        .d-crop-r { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
        .d-crop-health-label { font-size: 10px; font-weight: 800; color: var(--ink-4); letter-spacing: 0.1em; text-transform: uppercase; }
        .d-crop-score { font-family: 'Outfit', sans-serif; font-size: 24px; font-weight: 800; color: var(--ink); line-height: 1; }
        
        .d-scans-box {
          border: 2px dotted var(--border-2);
          border-radius: var(--r-xl);
          padding: 24px;
          min-height: 480px;
          display: flex;
          flex-direction: column;
          background: rgba(255,255,255,0.3);
        }

        .d-empty { padding: 40px 20px; text-align: center; flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .d-empty svg { color: var(--green-mid); margin: 0 auto 16px; opacity: 0.5; }
        .d-empty p { font-size: 14px; color: var(--ink-3); font-weight: 600; }

        /* ── SIDEBAR ── */
        .d-sidebar { display: flex; flex-direction: column; gap: 8px; }
        .d-sb-label { font-size: 10px; font-weight: 800; color: var(--ink-4); letter-spacing: .14em; text-transform: uppercase; padding: 0 4px; margin-bottom: 4px; }
        .d-acard { display: flex; align-items: center; gap: 14px; padding: 14px 16px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-md); cursor: pointer; box-shadow: var(--sh-1); text-align: left; width: 100%; transition: box-shadow .18s, border-color .18s; }
        .d-acard:hover { box-shadow: var(--sh-2); border-color: var(--border-2); }
        .d-aico { width: 38px; height: 38px; border-radius: var(--r-sm); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .d-aico--g { background: var(--green-bg); color: var(--green); }
        .d-aico--a { background: var(--amber-bg); color: var(--amber); }
        .d-aico--s { background: var(--sky-bg); color: var(--sky); }
        .d-aico--p { background: #f0eef9; color: #5b4fa0; }
        .d-aname { font-size: 13.5px; font-weight: 700; color: var(--ink); }
        .d-asub { font-size: 11px; color: var(--ink-3); margin-top: 2px; font-weight: 500; }
        .d-aarr { margin-left: auto; color: var(--ink-4); flex-shrink: 0; }
        .d-divider { border: none; border-top: 1px solid var(--border); margin: 4px 0; }
        .d-pstrip { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-md); cursor: pointer; box-shadow: var(--sh-1); transition: box-shadow .18s, border-color .18s; }
        .d-pstrip:hover { box-shadow: var(--sh-2); border-color: var(--border-2); }
        .d-pstrip-l { display: flex; align-items: center; gap: 10px; }
        .d-pav { width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg, var(--green-bg), var(--green-mid)); border: 2px solid var(--green-mid); display: flex; align-items: center; justify-content: center; color: var(--green); font-size: 13px; font-weight: 800; }
        .d-pname { font-size: 13px; font-weight: 700; color: var(--ink); }
        .d-prole { font-size: 11px; color: var(--ink-3); font-weight: 500; }
        .d-btn-logout { background: none; border: none; cursor: pointer; color: var(--ink-4); padding: 6px; border-radius: var(--r-xs); display: flex; align-items: center; }
        .d-btn-logout:hover { color: var(--rose); background: var(--rose-bg); }

        /* ── OVERLAY / MODALS ── */
        .d-overlay { position: fixed; inset: 0; z-index: 700; display: flex; align-items: center; justify-content: center; padding: 16px; }
        .d-overlay-bg { position: fixed; inset: 0; background: rgba(20,35,18,.50); backdrop-filter: blur(9px); z-index: 750; pointer-events: auto; }
        .d-modal { position: relative; background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-xl); padding: 28px; width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; box-shadow: var(--sh-4); z-index: 800; }
        .d-chat-overlay { position: fixed; inset: 0; z-index: 10000; pointer-events: none; }
        .d-chat-panel { position: fixed; top: 0; right: 0; width: 400px; height: 100dvh; background: var(--surface); border-left: 1px solid var(--border); z-index: 10001; display: flex; flex-direction: column; box-shadow: var(--sh-4); pointer-events: auto; }
        .d-modal::-webkit-scrollbar { display: none; }
        .d-modal--wide { max-width: 680px; }
        .d-modal-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 22px; }
        .d-modal-title { font-family: 'Outfit', sans-serif; font-size: 22px; font-weight: 800; color: var(--ink); }
        .d-modal-sub { font-size: 12px; color: var(--ink-3); margin-top: 3px; font-weight: 500; }
        .d-modal-close { background: var(--surface-2); border: 1px solid var(--border); border-radius: var(--r-sm); cursor: pointer; color: var(--ink-3); padding: 7px; display: flex; align-items: center; }
        .d-modal-close:hover { color: var(--ink); background: var(--border); }

        /* ══════════════════════════════════════════
           LIVE MARKET REDESIGN — mm-
        ══════════════════════════════════════════ */
        .mm-panel {
          position: relative; background: #fff; border-radius: 28px;
          width: 100%; max-width: 600px; height: 85vh;
          display: flex; flex-direction: column; box-shadow: var(--sh-4);
          z-index: 1000; overflow: hidden; border: 1px solid rgba(0,0,0,.05);
        }
        
        .mm-head { position: relative; padding: 28px 24px; overflow: hidden; flex-shrink: 0; }
        .mm-head-bg {
          position: absolute; inset: 0;
          background: linear-gradient(135deg, #163622 0%, #2e7d4f 100%);
          z-index: 0;
        }
        .mm-head-bg::after {
          content: ''; position: absolute; inset: 0;
          background-image: radial-gradient(circle at 10% 20%, rgba(255,255,255,.08) 0%, transparent 60%);
        }
        .mm-head-content { position: relative; z-index: 1; display: flex; justify-content: space-between; align-items: center; }
        .mm-title { font-family: 'Outfit', sans-serif; font-size: 26px; font-weight: 800; color: #fff; margin-bottom: 4px; }
        .mm-title-row { display: flex; align-items: center; gap: 12px; margin-bottom: 2px; }
        
        .mm-pulse-badge {
          display: flex; align-items: center; gap: 6px; padding: 4px 10px;
          background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.15);
          border-radius: 100px; font-size: 10px; font-weight: 800; color: rgba(255,255,255,.9);
          text-transform: uppercase; letter-spacing: .06em;
        }
        .mm-pulse-dot { width: 6px; height: 6px; border-radius: 50%; background: #4ade80; box-shadow: 0 0 8px #4ade80; animation: mm-blink 2s infinite; }
        @keyframes mm-blink { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: .4; transform: scale(0.85); } }
        
        .mm-sub { font-size: 11.5px; color: rgba(255,255,255,.6); font-weight: 500; display: flex; align-items: center; gap: 5px; }
        .mm-time { opacity: .75; font-weight: 400; }
        
        .mm-head-r { display: flex; align-items: center; gap: 10px; }
        .mm-icon-btn, .mm-close-btn {
          width: 38px; height: 38px; border-radius: 12px; border: none;
          background: rgba(255,255,255,.1); color: #fff; cursor: pointer;
          display: flex; align-items: center; justify-content: center; transition: all .2s;
        }
        .mm-icon-btn:hover, .mm-close-btn:hover { background: rgba(255,255,255,.2); }
        
        .mm-filters { padding: 20px 24px 16px; background: #fff; border-bottom: 1px solid #f0f3ef; flex-shrink: 0; }
        .mm-search-box { position: relative; margin-bottom: 16px; }
        .mm-search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #8ba58b; pointer-events: none; }
        .mm-search-input {
          width: 100%; height: 46px; background: #f7f9f6; border: 1px solid #e1e8e0;
          border-radius: 16px; padding: 0 44px; font-size: 14px; font-family: 'Nunito', sans-serif;
          color: #1a2e14; transition: all .2s; font-weight: 600;
        }
        .mm-search-input:focus { background: #fff; border-color: #2e7d4f; box-shadow: 0 0 0 4px rgba(46,125,79,.08); }
        .mm-search-clear { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); width: 22px; height: 22px; border-radius: 50%; border: none; background: #e0e6df; color: #5a705a; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        
        .mm-tab-strip { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 14px; margin-bottom: 14px; border-bottom: 1px dashed #e1e8e0; margin: 0 -4px 14px; }
        .mm-tab-strip::-webkit-scrollbar { display: none; }
        .mm-tab-pill {
          padding: 8px 16px; border-radius: 100px; border: 1px solid #e1e8e0;
          background: #fff; font-size: 12px; font-weight: 700; color: #5a705a;
          cursor: pointer; transition: all .22s cubic-bezier(.175,.885,.32,1.275); white-space: nowrap;
        }
        .mm-tab-pill.is-active { background: #2e7d4f; color: #fff; border-color: #2e7d4f; box-shadow: 0 4px 12px rgba(46,125,79,.25); transform: translateY(-2px); }
        .mm-tab-pill:hover:not(.is-active) { border-color: #2e7d4f; color: #2e7d4f; background: #f0f7f1; }
        
        .mm-sort-row { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
        .mm-sort-hint { font-size: 10px; font-weight: 800; color: #a0b8a0; text-transform: uppercase; letter-spacing: .08em; }
        .mm-sort-group { display: flex; gap: 4px; background: #f7f9f6; padding: 3px; border-radius: 10px; }
        .mm-sort-tab {
          padding: 5px 12px; border: none; background: transparent; border-radius: 7px;
          font-size: 11px; font-weight: 700; color: #7a8c77; cursor: pointer; transition: all .2s;
        }
        .mm-sort-tab.is-active { background: #fff; color: #2e7d4f; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
        
        .mm-content { flex: 1; overflow-y: auto; padding: 12px 24px 24px; background: #fdfefd; }
        .mm-loader { padding: 60px 0; text-align: center; color: #7a8c77; }
        .mm-loader-spinner { width: 32px; height: 32px; border: 3px solid #eaf4ee; border-top-color: #2e7d4f; border-radius: 50%; margin: 0 auto 16px; animation: mm-spin .8s linear infinite; }
        @keyframes mm-spin { to { transform: rotate(360deg); } }
        .mm-loader-text { font-size: 13px; font-weight: 500; }
        
        .mm-card-grid { display: flex; flex-direction: column; gap: 10px; }
        .mm-card {
          background: #fff; border: 1px solid #edf2ec; border-radius: 18px;
          padding: 16px; transition: all .25s cubic-bezier(.165,.84,.44,1);
          box-shadow: 0 2px 6px rgba(0,0,0,.02);
        }
        .mm-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(46,125,79,.08); border-color: #dcebd6; }
        .mm-card-main { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 12px; }
        .mm-card-l { display: flex; gap: 14px; min-width: 0; }
        .mm-card-icon {
          width: 44px; height: 44px; border-radius: 14px; display: flex;
          align-items: center; justify-content: center; flex-shrink: 0;
        }
        .mm-card-icon.is-gold { background: #fff4e6; color: #d97706; }
        .mm-card-icon.is-emerald { background: #eafef1; color: #10b981; }
        .mm-card-icon.is-indigo { background: #f0f4ff; color: #4f46e5; }
        
        .mm-card-info { min-width: 0; }
        .mm-card-commodity { font-family: 'Outfit', sans-serif; font-size: 18px; font-weight: 800; color: #1a2e14; margin-bottom: 2px; }
        .mm-card-location { font-size: 11px; font-weight: 600; color: #8ba58b; display: flex; align-items: center; gap: 5px; }
        
        .mm-card-price-stack { text-align: right; }
        .mm-card-currency { font-size: 13px; font-weight: 800; color: #94a3b8; margin-right: 2px; }
        .mm-card-price { font-family: 'Outfit', sans-serif; font-size: 24px; font-weight: 800; color: #1e293b; }
        .mm-card-price.is-high { color: #b45309; }
        .mm-card-price.is-mid { color: #059669; }
        .mm-card-unit { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; display: block; margin-top: -2px; }
        
        .mm-card-rank {
          margin-top: 6px; padding: 3px 8px; border-radius: 6px; font-size: 9px;
          font-weight: 800; text-transform: uppercase; letter-spacing: .04em;
          display: inline-block; width: fit-content; float: right;
        }
        .mm-card-rank.is-premium { background: rgba(217,119,6,.1); color: #d97706; }
        .mm-card-rank.is-good { background: rgba(16,185,129,.1); color: #059669; }
        .mm-card-rank.is-fair { background: #f1f5f9; color: #64748b; }
        
        .mm-card-footer { border-top: 1px dashed #edf2ec; padding-top: 10px; display: flex; justify-content: space-between; }
        .mm-range-bar { display: flex; gap: 8px; align-items: center; }
        .mm-range-label { font-size: 10px; font-weight: 700; color: #a0b8a0; text-transform: uppercase; }
        .mm-range-val { font-size: 11px; font-weight: 700; color: #4a6844; }
        
        .mm-not-found { padding: 80px 32px; text-align: center; }
        .mm-nf-icon { color: #e1e8e0; margin-bottom: 16px; }
        .mm-nf-text { font-size: 16px; font-weight: 700; color: #5a705a; margin-bottom: 4px; }
        .mm-nf-sub { font-size: 12px; color: #a0b8a0; max-width: 220px; margin: 0 auto; line-height: 1.5; }
        
        .animate-spin { animation: mm-spin 1.5s linear infinite; }
        .mm-row-modal { font-family: 'Outfit', sans-serif; font-size: 18px; font-weight: 700; white-space: nowrap; text-align: right; min-width: 72px; }
        .mm-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 20px; gap: 8px; color: var(--ink-3); font-size: 13px; font-weight: 600; }
        .mm-spinner { width: 28px; height: 28px; border: 3px solid var(--border); border-top-color: var(--green); border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 8px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .mm-footer { padding: 10px 16px; border-top: 1px solid var(--border); font-size: 11px; color: var(--ink-4); font-weight: 600; flex-shrink: 0; text-align: center; background: var(--surface-2); }

                 /* Schemes section */
         .d-schemes-row { margin-bottom: 28px; }
         .d-schemes-scroll { display: flex; gap: 14px; overflow-x: auto; padding: 4px 4px 20px; margin: 0 -4px; scroll-snap-type: x mandatory; }
         .d-schemes-scroll::-webkit-scrollbar { display: none; }
         .d-scheme-card {
           flex: 0 0 280px; scroll-snap-align: start; background: #fff;
           border: 1px solid var(--border); border-radius: 20px; padding: 18px;
           box-shadow: var(--sh-1); cursor: pointer; transition: all .2s;
         }
         .d-scheme-card:hover { transform: translateY(-3px); box-shadow: var(--sh-2); border-color: var(--green-mid); }
         .d-scheme-icon { width: 40px; height: 40px; border-radius: 12px; background: #fff5e6; color: #d97706; display: flex; align-items: center; justify-content: center; margin-bottom: 14px; }
         .d-scheme-name { font-family: 'Outfit', sans-serif; font-size: 16px; font-weight: 800; color: var(--ink); margin-bottom: 4px; }
         .d-scheme-cat { font-size: 11px; font-weight: 700; color: var(--ink-3); text-transform: uppercase; letter-spacing: .04em; }
         .d-scheme-badge { font-size: 9px; font-weight: 900; background: #eaf4ee; color: #2e7d4f; padding: 3px 8px; border-radius: 6px; float: right; }

         /* All Schemes Catalog Modal */
         .d-cat-modal { background: #fdfefd; border-radius: 28px; width: 100%; max-width: 800px; height: 85dvh; display: flex; flex-direction: column; overflow: hidden; box-shadow: var(--sh-4); }
         .d-cat-top { padding: 32px; background: linear-gradient(135deg, #152b1e, #1e4a30); color: #fff; flex-shrink: 0; }
         .d-cat-title { font-family: 'Outfit', sans-serif; font-size: 32px; font-weight: 800; margin-bottom: 4px; }
         .d-cat-sub { font-size: 14px; opacity: .7; }
         .d-cat-body { flex: 1; overflow-y: auto; padding: 32px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
         @media(max-width:600px) { .d-cat-body { grid-template-columns: 1fr; padding: 20px; } .d-cat-top { padding: 24px; } }
         .d-cat-item { background: #fff; border: 1px solid var(--border); border-radius: 24px; padding: 24px; transition: all .2s; cursor: pointer; display: flex; flex-direction: column; gap: 12px; }
         .d-cat-item:hover { transform: translateY(-3px); box-shadow: var(--sh-2); border-color: var(--amber); }
         .d-cat-name { font-family: 'Outfit', sans-serif; font-size: 18px; font-weight: 800; color: var(--ink); line-height: 1.2; }
         .d-cat-stats { display: flex; gap: 12px; }
         .d-cat-pill { font-size: 10px; font-weight: 800; padding: 4px 10px; background: #f1f5f9; color: #64748b; border-radius: 6px; text-transform: uppercase; }

         .d-sd-modal { background: #fff; border-radius: 28px; padding: 0; overflow: hidden; width: 100%; max-width: 520px; box-shadow: var(--sh-3); position: relative; }
         .d-sd-head { background: linear-gradient(135deg, #b8651a, #d97706); padding: 40px 32px 32px; color: #fff; position: relative; }
         .d-sd-head::before { content: ''; position: absolute; inset: 0; background: url('https://www.transparenttextures.com/patterns/cubes.png'); opacity: .1; }
         .d-sd-close { position: absolute; top: 16px; right: 16px; width: 34px; height: 34px; border-radius: 10px; border: none; background: rgba(255,255,255,.15); color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; }
         .d-sd-body { padding: 32px; }
         .d-sd-title { font-family: 'Outfit', sans-serif; font-size: 28px; font-weight: 800; margin-bottom: 8px; line-height: 1.1; }
         .d-sd-cat { font-size: 12px; font-weight: 700; opacity: .8; text-transform: uppercase; letter-spacing: .06em; }
         .d-sd-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
         .d-sd-tile { background: #f7f9f6; padding: 16px; border-radius: 20px; border: 1px solid #edf2ec; }
         .d-sd-label { font-size: 11px; font-weight: 800; color: #7a8c77; text-transform: uppercase; margin-bottom: 4px; }
         .d-sd-val { font-family: 'Outfit', sans-serif; font-size: 19px; font-weight: 800; color: #1a2e14; }
         .d-sd-desc { font-size: 14px; line-height: 1.6; color: #4a6844; margin-bottom: 24px; }
         .d-sd-btn { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; height: 54px; background: #1a2e14; color: #fff; border-radius: 18px; border: none; font-size: 15px; font-weight: 800; cursor: pointer; transition: all .2s; }
         .d-sd-btn:hover { background: #000; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,.15); }
        .d-cal-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px,1fr)); gap: 14px; }
        .d-cal-card { border-radius: var(--r-lg); border: 1px solid var(--border); padding: 18px; background: var(--surface-2); border-top: 3px solid var(--acc,var(--green)); }
        .d-cal-top { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 14px; }
        .d-cal-season { font-family: 'Outfit', sans-serif; font-size: 17px; font-weight: 700; color: var(--ink); }
        .d-cal-period { font-size: 11px; color: var(--ink-3); font-weight: 500; }
        .d-cal-crops { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
        .d-cal-pill { font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 100px; color: var(--acc,var(--green)); background: rgba(46,125,79,.07); border: 1px solid rgba(46,125,79,.14); }
        .d-cal-desc { font-size: 11px; color: var(--ink-3); font-style: italic; line-height: 1.5; }

        /* Weather */
        .d-wx-hero { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px; }
        @media(max-width:480px) { .d-wx-hero { grid-template-columns: 1fr; } }
        .d-wx-main { background: linear-gradient(145deg, #1e4a30, var(--green-2)); border-radius: var(--r-lg); padding: 24px 20px; display: flex; flex-direction: column; justify-content: flex-end; gap: 10px; min-height: 180px; }
        .d-wx-main-icon { color: rgba(255,255,255,.7); margin-bottom: 4px; }
        .d-wx-temp { font-family: 'Outfit', sans-serif; font-size: 54px; font-weight: 700; color: #fff; line-height: 1; }
        .d-wx-cond { font-size: 13px; color: rgba(255,255,255,.72); font-weight: 600; }
        .d-wx-loc { font-size: 11px; color: rgba(255,255,255,.45); display: flex; align-items: center; gap: 4px; margin-top: 2px; }
        .d-wx-metrics { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .d-wx-tile { background: var(--surface-2); border: 1px solid var(--border); border-radius: var(--r-md); padding: 14px 12px; }
        .d-wx-tile-icon { color: var(--ink-3); margin-bottom: 6px; }
        .d-wx-tile-val { font-family: 'Outfit', sans-serif; font-size: 17px; font-weight: 700; color: var(--ink); }
        .d-wx-tile-label { font-size: 10px; color: var(--ink-3); text-transform: uppercase; letter-spacing: .06em; margin-top: 2px; font-weight: 700; }
        .d-wx-forecast { background: var(--surface-2); border: 1px solid var(--border); border-radius: var(--r-lg); padding: 18px 20px; }
        .d-wx-fc-label { font-size: 11px; color: var(--ink-3); text-transform: uppercase; letter-spacing: .08em; font-weight: 700; margin-bottom: 16px; }
        .d-wx-fc-days { display: flex; justify-content: space-around; }
        .d-wx-fc-day { display: flex; flex-direction: column; align-items: center; gap: 8px; }
        .d-wx-fc-name { font-size: 12px; font-weight: 700; color: var(--ink-3); }
        .d-wx-fc-icon { color: var(--ink-3); }
        .d-wx-fc-temp { font-family: 'Outfit', sans-serif; font-size: 19px; font-weight: 700; color: var(--ink); }

        /* ── CHAT PANEL ── */
        .d-chat-panel { position: fixed; top: 0; right: 0; width: 400px; height: 100dvh; background: var(--surface); border-left: 1px solid var(--border); z-index: 800; display: flex; flex-direction: column; box-shadow: var(--sh-4); }
        @media(max-width:460px) { .d-chat-panel { width: 100%; } }
        .d-chat-bar { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; background: linear-gradient(135deg, #152b1e, #1e4a30); border-bottom: 1px solid rgba(255,255,255,.06); }
        .d-chat-bar-l { display: flex; align-items: center; gap: 12px; }
        .d-chat-av { width: 38px; height: 38px; border-radius: var(--r-sm); background: rgba(255,255,255,.1); display: flex; align-items: center; justify-content: center; color: #a0e0bc; }
        .d-chat-name { font-family: 'Outfit', sans-serif; font-size: 16px; color: #fff; }
        .d-chat-ready { font-size: 11px; color: rgba(255,255,255,.45); display: flex; align-items: center; gap: 6px; margin-top: 2px; }
        .d-chat-rdot { width: 6px; height: 6px; border-radius: 50%; background: #7dd9a3; }
        .d-btn-cx { background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.12); border-radius: var(--r-sm); cursor: pointer; color: rgba(255,255,255,.55); padding: 7px; display: flex; }
        .d-btn-cx:hover { background: rgba(255,255,255,.14); color: #fff; }
        .d-chat-msgs { flex: 1; overflow-y: auto; padding: 18px 20px; display: flex; flex-direction: column; gap: 12px; background: var(--bg); }
        .d-chat-msgs::-webkit-scrollbar { display: none; }
        .d-cmsg { max-width: 86%; }
        .d-cmsg--user { align-self: flex-end; }
        .d-cmsg--bot { align-self: flex-start; }
        .d-cbubble { padding: 11px 15px; border-radius: var(--r-md); font-size: 13.5px; line-height: 1.55; font-weight: 500; }
        .d-cbubble--user { background: linear-gradient(135deg, #152b1e, #1e5035); color: #fff; border-bottom-right-radius: 4px; }
        .d-cbubble--bot {
          background: var(--surface); border: 1px solid var(--border);
          color: var(--ink-2); border-bottom-left-radius: 4px;
          box-shadow: var(--sh-1); width: 100%;
          line-height: 1.6;
          position: relative;
          padding-right: 48px !important; /* Fixed padding for audio button */
        }
        .d-btn-audio-wrapper {
          position: absolute;
          top: 8px;
          right: 8px;
          z-index: 100;
        }
        .d-cbubble--bot strong { display: block; margin-top: 10px; margin-bottom: 4px; color: var(--ink); font-size: 14px; }
        .d-cbubble--bot div { margin-bottom: 4px; }
        .d-cbubble--bot h1, .d-cbubble--bot h2, .d-cbubble--bot h3, .d-cbubble--bot h4, .d-cbubble--bot h5, .d-cbubble--bot h6 { padding-bottom: 8px; }
        .d-chat-typing { display: flex; gap: 5px; align-items: center; padding: 11px 16px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-md); border-bottom-left-radius: 4px; width: fit-content; box-shadow: var(--sh-1); }
        .d-tdot { width: 6px; height: 6px; border-radius: 50%; background: var(--green-mid); }
        .d-chat-chips { display: flex; gap: 7px; overflow-x: auto; padding: 10px 20px; border-top: 1px solid var(--border); background: var(--surface); }
        .d-chat-chips::-webkit-scrollbar { display: none; }
        .d-chip { white-space: nowrap; padding: 6px 14px; background: var(--green-bg); border: 1px solid var(--green-mid); border-radius: 100px; font-size: 11.5px; font-weight: 700; color: var(--green); cursor: pointer; flex-shrink: 0; }
        .d-chip:hover { background: var(--green-mid); color: #fff; }
        .d-chat-form { display: flex; gap: 8px; padding: 14px 20px calc(22px + env(safe-area-inset-bottom)); border-top: 1px solid var(--border); background: var(--surface); }
        .d-chat-inp { flex: 1; background: var(--surface-2); border: 1px solid var(--border); border-radius: var(--r-md); padding: 11px 14px; font-size: 13px; font-family: 'Nunito', sans-serif; color: var(--ink); outline: none; font-weight: 600; }
        .d-chat-inp:focus { border-color: var(--green-mid); box-shadow: 0 0 0 3px rgba(168,212,181,.22); }
        .d-chat-go { background: linear-gradient(135deg, #1a4a2e, var(--green-2)); color: #fff; border: none; border-radius: var(--r-md); padding: 11px 15px; cursor: pointer; display: flex; align-items: center; box-shadow: 0 2px 8px rgba(46,125,79,.25); }
        .d-chat-go:hover { filter: brightness(1.1); }
      `}</style>


         {/* ── PAGE ── */}
         <div className="d-page">

            {/* Hero */}
            <div className="d-hero">
               <div className="d-hero-inner">
                  <div>
                     <p className="d-hero-meta"><MapPin size={11} />{today}</p>
                     <h1 className="d-hero-name">{greeting},<br /><em>{firstName}</em></h1>
                     <div className="d-hero-badge">
                        <span className="d-hero-bdot" />
                        {crops.length} crop{crops.length !== 1 ? 's' : ''} being tracked
                     </div>
                  </div>
                  <div className="d-hero-kpis">
                     <div className="d-kpi">
                        <p className={`d-kpi-val ${stats.health >= 70 ? 'd-kpi-val--g' : 'd-kpi-val--r'}`}>{stats.health}%</p>
                        <p className="d-kpi-label">{t('dash.avgHealth')}</p>
                     </div>
                     <div className="d-kpi">
                        <p className={`d-kpi-val ${stats.alerts > 0 ? 'd-kpi-val--a' : 'd-kpi-val--g'}`}>{stats.alerts}</p>
                        <p className="d-kpi-label">{t('dash.alerts')}</p>
                     </div>
                     <div className="d-kpi">
                        <p className="d-kpi-val">{stats.temp}</p>
                        <p className="d-kpi-label">{t('dash.temp')}</p>
                     </div>
                  </div>
               </div>
            </div>

            {/* Tiles */}
            <div className="d-tiles">
               <div className="d-tile" style={{ '--tc': 'var(--amber)', '--tb': 'var(--amber-bg)' }} onClick={() => navigate('/profit-calculator')}>
                  <div className="d-tile-icon"><Calculator size={17} /></div>
                  <p className="d-tile-label">{t('nav.profitCalc')}</p>
                  <p className="d-tile-value">Calculator</p>
                  <p className="d-tile-sub">Calculate your expenses & earnings</p>
               </div>
               <div id="mandi-section" className="d-tile" style={{ '--tc': 'var(--amber)', '--tb': 'var(--amber-bg)' }} onClick={() => setMarketOpen(true)}>
                  <div className="d-tile-icon"><TrendingUp size={17} /></div>
                  <p className="d-tile-label">{t('dash.mandiPrices')}</p>
                  <p className="d-tile-value">{t('dash.live')}</p>
                  <p className="d-tile-sub">{t('dash.searchMarket')}</p>
               </div>
               <div className="d-tile" style={{ '--tc': 'var(--sky)', '--tb': 'var(--sky-bg)' }} onClick={() => setWeatherOpen(true)}>
                  <div className="d-tile-icon">{getWeatherIcon(dashWeather?.weather?.[0]?.id, 17)}</div>
                  <p className="d-tile-label">{t('dash.weather')}</p>
                  <p className="d-tile-value">{dashWeather ? `${Math.round(dashWeather.main.temp)}°C` : '—°C'}</p>
                  <p className="d-tile-sub">{dashWeather ? `${dashWeather.weather[0].description} · ${dashWeather.main.humidity}%` : 'Loading...'}</p>
               </div>
               <div className="d-tile" style={{ '--tc': '#5b4fa0', '--tb': '#f0eef9' }} onClick={() => setChatOpen(true)}>
                  <div className="d-tile-icon"><Bot size={17} /></div>
                  <p className="d-tile-label">{t('dash.aiAssistant')}</p>
                  <p className="d-tile-value">KrishiAI</p>
                  <p className="d-tile-sub">{t('dash.askAnything')}</p>
               </div>
            </div>

            {/* Body */}
            <div className="d-body">
               <div>
                  <div className="d-sec-head">
                     <h2 className="d-sec-title">{t('dash.recentScans')}</h2>
                     <Link to="/inventory" className="d-sec-link">{t('prof.viewAll')} <ArrowRight size={13} /></Link>
                  </div>
                  <div className="d-scans-box">
                     {loading ? (
                        <div className="d-empty"><p>Loading your crops…</p></div>
                     ) : crops.length === 0 ? (
                        <div className="d-empty">
                           <Sprout size={28} />
                           <p>No crops yet. Run a diagnosis to get started.</p>
                        </div>
                     ) : (
                        <div className="d-crop-list">
                           {crops.slice(0, 7).map(crop => (
                              <div key={crop.id} className="d-crop-row" onClick={() => navigate('/inventory')}>
                                 <div className="d-crop-l">
                                    <div className="d-crop-ico">
                                       {crop.imageUrl ? <img src={crop.imageUrl} alt={crop.name} /> : <Leaf size={22} />}
                                    </div>
                                    <div>
                                       <p className="d-crop-name">{crop.name}</p>
                                       <div className="d-crop-meta">
                                          STATUS: <span>{crop.status}</span>
                                       </div>
                                    </div>
                                 </div>
                                 <div className="d-crop-r">
                                    <p className="d-crop-health-label">HEALTH SCORE</p>
                                    <p className="d-crop-score">{crop.healthScore}%</p>
                                 </div>
                              </div>
                           )
                           )}
                        </div>
                     )}
                  </div>
               </div>

               {/* Sidebar */}
               <div className="d-sidebar">
                  <p className="d-sb-label">{t('dash.quickActions')}</p>
                  
                  <button className="d-acard" onClick={() => navigate('/profit-calculator')}>
                     <div className="d-aico" style={{ background: '#fff5e6', color: '#d97706' }}><Calculator size={16} /></div>
                     <div><p className="d-aname">{t('nav.profitCalc')}</p><p className="d-asub">Kamai aur nuksan ka hisaab</p></div>
                     <ChevronRight size={14} className="d-aarr" />
                  </button>

                  <button id="live-market-action" className="d-acard" onClick={() => setMarketOpen(true)}>
                     <div className="d-aico d-aico--a"><TrendingUp size={16} /></div>
                     <div><p className="d-aname">{t('dash.mandiPrices')}</p><p className="d-asub">{t('dash.searchMarket')}</p></div>
                     <ChevronRight size={14} className="d-aarr" />
                  </button>

                  <button className="d-acard" onClick={() => setWeatherOpen(true)}>
                     <div className="d-aico d-aico--s">{getWeatherIcon(dashWeather?.weather?.[0]?.id, 16)}</div>
                     <div>
                        <p className="d-aname">{t('dash.weather')}</p>
                        <p className="d-asub">{dashWeather ? `${Math.round(dashWeather.main.temp)}°C · ${dashWeather.weather[0].description}` : 'Loading...'} </p>
                     </div>
                     <ChevronRight size={14} className="d-aarr" />
                  </button>

                  <button className="d-acard" onClick={() => setChatOpen(true)}>
                     <div className="d-aico d-aico--p"><Bot size={16} /></div>
                     <div><p className="d-aname">{t('dash.aiAssistant')}</p><p className="d-asub">{t('dash.askAnything')}</p></div>
                     <ChevronRight size={14} className="d-aarr" />
                  </button>
                  
                  <button className="d-acard" onClick={() => navigate('/crop-picker')}>
                     <div className="d-aico" style={{ background: '#eaf4ee', color: '#2e7d4f' }}><Sprout size={16} /></div>
                     <div><p className="d-aname">{t('nav.cropPicker')}</p><p className="d-asub">AI fasal recommendation</p></div>
                     <ChevronRight size={14} className="d-aarr" />
                  </button>

                  <button className="d-acard" onClick={() => setCommunityOpen(true)}>
                     <div className="d-aico" style={{ background: '#f5f5f5', color: '#666' }}><Users size={16} /></div>
                     <div><p className="d-aname">{t('dash.community')}</p><p className="d-asub">Kisan Bhai-yara network</p></div>
                     <ChevronRight size={14} className="d-aarr" />
                  </button>

                  <hr className="d-divider" />
                  <div className="d-pstrip" onClick={() => navigate('/profile')}>
                     <div className="d-pstrip-l">
                        <div className="d-pav">{firstName.charAt(0).toUpperCase()}</div>
                        <div>
                           <p className="d-pname">{firstName}</p>
                           <p className="d-prole">Farm Manager</p>
                        </div>
                     </div>
                     <button className="d-btn-logout" onClick={e => { e.stopPropagation(); signOut(auth); }} title="Sign out">
                        <LogOut size={15} />
                     </button>
                  </div>
               </div>
            </div>
         </div>

         {/* Chat panel */}
         <AnimatePresence>
            {chatOpen && (
               <div className="d-chat-overlay">
                  <motion.div
                     className="d-overlay-bg"
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     onClick={() => setChatOpen(false)}
                  />
                  <motion.div
                     className="d-chat-panel"
                     initial={{ x: '100%' }}
                     animate={{ x: 0 }}
                     exit={{ x: '100%' }}
                     transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  >
                     <div className="d-chat-bar">
                        <div className="d-chat-bar-l">
                           <div className="d-chat-av"><Bot size={18} /></div>
                           <div>
                              <p className="d-chat-name">KrishiCopilot</p>
                              <p className="d-chat-ready"><span className="d-chat-rdot" /> Ready</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-2">
                           <button className="d-btn-cx" onClick={() => setShowingHistory(!showingHistory)} title="History">
                              <History size={15} color={showingHistory ? '#7dd9a3' : 'currentColor'} />
                           </button>
                           <button className="d-btn-cx" onClick={handleSaveChat} disabled={savingChat} title="Save current chat">
                              <Save size={15} className={savingChat ? "animate-pulse" : ""} />
                           </button>
                           <button className="d-btn-cx" onClick={() => setChatOpen(false)}><X size={15} /></button>
                        </div>
                     </div>
                     
                     {showingHistory ? (
                        <div className="d-chat-msgs bg-gray-50 flex-1 p-5">
                           <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-3">
                              <h3 className="font-bold text-gray-800 text-lg">Saved Conversations</h3>
                              <button onClick={() => setShowingHistory(false)} className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200 hover:bg-green-100 transition">Back to Chat</button>
                           </div>
                           {savedChats.length === 0 ? (
                              <div className="text-center py-10 text-gray-500 text-sm bg-white rounded-xl border border-gray-100">
                                 <History className="mx-auto mb-2 opacity-50" size={32} />
                                 <p>No saved chats yet.</p>
                                 <p className="text-xs mt-1 opacity-70">Save your conversation to see it here.</p>
                              </div>
                           ) : (
                              <div className="flex flex-col gap-3">
                                 {savedChats.map(sc => (
                                    <div key={sc.id} className="p-4 bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-green-400 hover:shadow-md transition shadow-sm relative group"
                                         onClick={() => { setChatMessages(sc.messages); setShowingHistory(false); }}>
                                       <div className="flex justify-between items-start gap-2">
                                          <p className="font-bold text-gray-800 text-sm leading-tight flex-1">{sc.title}</p>
                                          <button onClick={(e) => { e.stopPropagation(); deleteDoc(doc(db, 'chats', sc.id)); }} className="text-gray-300 hover:text-red-500 bg-red-50/0 hover:bg-red-50 p-1.5 rounded-lg transition opacity-0 group-hover:opacity-100"><Trash2 size={15}/></button>
                                       </div>
                                       <div className="flex justify-between items-center mt-3">
                                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{new Date(sc.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                          <p className="text-[10px] text-green-700 bg-green-50 font-bold px-2 py-0.5 rounded-md border border-green-100">{sc.messages.length} msgs</p>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           )}
                        </div>
                     ) : (
                        <>
                           <div className="d-chat-msgs">
                        {chatMessages.map((msg, i) => (
                           <div key={i} className={`d-cmsg d-cmsg--${msg.role}`}>
                              <div className={`d-cbubble d-cbubble--${msg.role} ${msg.role === 'bot' ? 'pr-10' : ''}`}>
                                 <div className={msg.role === 'bot' ? 'flex-1 text-left' : ''}>
                                    {renderFormattedText(msg.text)}
                                 </div>
                                 {msg.role === 'bot' && (
                                    <div className="d-btn-audio-wrapper" style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 20 }}>
                                       <button
                                          className={`p-2 rounded-full shadow-sm transition-all ${speakingIdx === i ? 'text-red-500 bg-red-50 ring-2 ring-red-200' : 'text-gray-400 bg-white hover:bg-gray-50 border border-gray-100'}`}
                                          style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                          onClick={(e) => {
                                             e.preventDefault();
                                             e.stopPropagation();
                                             if (!window.speechSynthesis) return;

                                             // If we are currently on the SAME message
                                             if (speakingIdx === i) {
                                                if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
                                                   window.speechSynthesis.pause();
                                                   setIsPaused(true);
                                                } else if (window.speechSynthesis.paused) {
                                                   window.speechSynthesis.resume();
                                                   setIsPaused(false);
                                                } else {
                                                   // Already finished or something went wrong? Reset.
                                                   window.speechSynthesis.cancel();
                                                   setSpeakingIdx(null);
                                                   setIsPaused(false);
                                                }
                                                return;
                                             }

                                             // New message or restarting
                                             window.speechSynthesis.cancel();
                                             setIsPaused(false);
                                             
                                             // Use a small timeout to let the browser clear the queue
                                             setTimeout(() => {
                                                const textToSpeak = msg.text.replace(/\*\*/g, ''); // Clear markdown bold
                                                const utterance = new SpeechSynthesisUtterance(textToSpeak);
                                                utterance.lang = 'hi-IN';
                                                utterance.rate = 0.9; // Adjusted for better clarity
                                                utterance.pitch = 1.0;
                                                utterance.volume = 1.0;

                                                const voices = window.speechSynthesis.getVoices();
                                                const hindiVoice = voices.find(v => v.lang.includes('hi') || v.lang.includes('HI'));
                                                if (hindiVoice) utterance.voice = hindiVoice;

                                                utterance.onstart = () => {
                                                   setSpeakingIdx(i);
                                                   setIsPaused(false);
                                                };
                                                utterance.onend = () => {
                                                   setSpeakingIdx(null);
                                                   setIsPaused(false);
                                                };
                                                utterance.onerror = (err) => {
                                                   console.error('Speech error:', err);
                                                   setSpeakingIdx(null);
                                                   setIsPaused(false);
                                                };

                                                window.speechSynthesis.speak(utterance);
                                             }, 100);
                                          }}
                                          title={speakingIdx === i ? (isPaused ? "Resume" : "Pause") : "Suniye (Listen)"}
                                       >
                                          {speakingIdx === i ? (
                                             isPaused ? <Speaker size={16} className="text-amber-500 animate-pulse" /> : <Square size={16} fill="currentColor" className="text-red-500" />
                                          ) : <Speaker size={16} />}
                                       </button>
                                    </div>
                                 )}
                              </div>
                           </div>
                        ))}
                        {chatLoading && (
                           <div className="d-chat-typing">
                              <div className="d-tdot" /><div className="d-tdot" /><div className="d-tdot" />
                           </div>
                        )}
                        <div ref={chatEndRef} />
                           </div>
                           <div className="d-chat-chips">
                              {Object.keys(quickQA).map(q => (
                                 <button key={q} className="d-chip" onClick={() => handleSend(null, q)}>{q}</button>
                              ))}
                           </div>
                           <form className="d-chat-form" onSubmit={handleSend}>
                              <div className="flex items-center gap-2 flex-1">
                                 <input className="d-chat-inp flex-1" placeholder="Hindi ya English mein poochiye..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} />
                                 <MicButton
                                    size="sm"
                                    variant="light"
                                    tooltip="Bolke poochiye"
                                    onResult={(transcript) => {
                                       setChatInput(transcript);
                                       setTimeout(() => handleSend(null, transcript), 300);
                                    }}
                                 />
                              </div>
                              <button type="submit" className="d-chat-go"><Send size={15} /></button>
                           </form>
                        </>
                     )}
                  </motion.div>
               </div>
            )}
         </AnimatePresence>

         {/* Modals */}
         {weatherOpen && <WeatherModal onClose={() => setWeatherOpen(false)} />}
         
         {communityOpen && (
            <Modal title={t('dash.community') || 'Community'} subtitle="Farmer Network" onClose={() => setCommunityOpen(false)}>
               <div style={{ textAlign: 'center', padding: '20px 0' }}>
                   <img src="/community_coming_soon_1775315413770.png" alt="Community Coming Soon" 
                      style={{ 
                         width: '280px', 
                         margin: '0 auto 24px',
                         display: 'block',
                         filter: 'drop-shadow(0 4px 12px rgba(74, 222, 128, 0.15))'
                      }} 
                   />
                  <h3 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--ink)', marginBottom: '10px' }}>Coming Soon</h3>
                  <p style={{ fontSize: '14px', color: 'var(--ink-3)', lineHeight: 1.6, maxWidth: '300px', margin: '0 auto 24px' }}>
                     We are building a powerful network for Indian farmers to connect, share knowledge, and grow together.
                  </p>
                  <button 
                     onClick={() => setCommunityOpen(false)}
                     style={{ 
                        padding: '12px 32px', 
                        background: 'linear-gradient(135deg, #4ade80, #16a34a)', 
                        color: '#fff', 
                        border: 'none', 
                        borderRadius: '12px', 
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        boxShadow: '0 8px 16px rgba(74, 222, 128, 0.25)'
                     }}
                     onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                     onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                     Got it!
                  </button>
               </div>
            </Modal>
         )}

         <FloatingMic />
      </>
   );
};

export default Dashboard;
