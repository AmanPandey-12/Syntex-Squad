import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  MapPin, Calendar, TrendingUp, Bot, ArrowRight,
  ChevronRight, X, Sprout, Leaf,
  Sun, Cloud, CloudRain, CloudLightning,
  Wind, Droplets, Thermometer,
  Calculator
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

const mockApi = {
  fetchWeather: async () => ({
    current: {
      temp: 28,
      main: { temp: 28, humidity: 65 },
      weather: [{ id: 800, description: 'Clear sky' }]
    }
  }),
  chatWithAI: async (msg) => {
    return `As your KrishiAI Assistant, I can tell you that ${msg} is an important topic for modern farming. Focus on sustainable practices and local market trends.`;
  }
};

const getWeatherIcon = (id, size = 20) => {
  if (id >= 200 && id < 300) return <CloudLightning size={size} />;
  if (id >= 300 && id < 600) return <CloudRain size={size} />;
  if (id >= 800) return <Sun size={size} />;
  return <Cloud size={size} />;
};

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [marketOpen, setMarketOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [weatherOpen, setWeatherOpen] = useState(false);
  const [dashWeather, setDashWeather] = useState(null);
  const [chatMessages, setChatMessages] = useState([
    { role: 'bot', text: 'Hello! I am KrishiAI. How can I help you with your farm today?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);
  const navigate = useNavigate();
  const { search } = useLocation();
  const { t, language } = useLanguage();

  useEffect(() => {
    if (search === '?chat=true') setChatOpen(true);
    if (search === '?weather=true') setWeatherOpen(true);
  }, [search]);

  useEffect(() => {
    mockApi.fetchWeather().then(data => setDashWeather(data.current));
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

  const stats = { health: 85, alerts: 0, temp: '28°C', humidity: '65%' };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;
    const msg = chatInput;
    setChatInput('');
    setChatMessages(p => [...p, { role: 'user', text: msg }]);
    setChatLoading(true);
    try {
      const resp = await mockApi.chatWithAI(msg);
      setChatMessages(p => [...p, { role: 'bot', text: resp }]);
    } catch {
      setChatMessages(p => [...p, { role: 'bot', text: 'Unable to connect. Please try again.' }]);
    } finally { setChatLoading(false); }
  };

  const greeting = "Good Day";
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,700;0,800;1,700&display=swap');
        :root {
          --bg: #f0f4ed; --surface: #ffffff; --border: #e2e8df; --ink: #1a2117;
          --green: #2e7d4f; --green-2: #3fa066; --green-bg: #eaf4ee;
          --r-xl: 28px; --r-lg: 20px; --r-md: 14px;
        }
        .d-page { max-width: 1100px; margin: 0 auto; padding: 124px 28px 80px; }
        .d-hero {
          background: linear-gradient(135deg, #152b1e 0%, #1e4a30 45%, #162f22 100%);
          border-radius: var(--r-xl); padding: 36px 40px; margin-bottom: 20px; color: #fff;
        }
        .d-hero-name { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 800; }
        .d-tiles { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; margin-bottom: 24px; }
        .d-tile {
          background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg);
          padding: 20px 22px; cursor: pointer; transition: transform 0.2s;
        }
        .d-tile:hover { transform: translateY(-2px); }
        .d-tile-icon { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; background: var(--green-bg); color: var(--green); }
        .d-body { display: grid; grid-template-columns: 1fr 300px; gap: 20px; }
        .d-sidebar { display: flex; flex-direction: column; gap: 10px; }
        .d-acard { display: flex; align-items: center; gap: 14px; padding: 14px 16px; background: #fff; border: 1px solid var(--border); border-radius: var(--r-md); cursor: pointer; text-align: left; width: 100%; transition: 0.2s; }
        .d-acard:hover { border-color: var(--green); }
        .d-chat-panel { position: fixed; top: 0; right: 0; width: 400px; height: 100vh; background: #fff; z-index: 2000; display: flex; flex-direction: column; box-shadow: -10px 0 30px rgba(0,0,0,0.1); }
        .d-chat-msgs { flex: 1; overflow-y: auto; padding: 20px; background: #f8faf9; display: flex; flex-direction: column; gap: 12px; }
        .d-cbubble { padding: 12px 16px; border-radius: 16px; font-size: 14px; max-width: 85%; }
        .d-cbubble--user { align-self: flex-end; background: var(--green); color: #fff; }
        .d-cbubble--bot { align-self: flex-start; background: #fff; border: 1px solid var(--border); }
        .d-chat-form { display: flex; gap: 8px; padding: 20px; border-top: 1px solid var(--border); }
        .d-chat-inp { flex: 1; padding: 10px; border: 1px solid var(--border); border-radius: 8px; outline: none; }
        .d-chat-go { background: var(--green); color: #fff; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
        @media(max-width: 900px) { .d-body { grid-template-columns: 1fr; } .d-tiles { grid-template-columns: repeat(2,1fr); } }
      `}</style>

      <div className="d-page">
        <div className="d-hero">
          <p style={{ opacity: 0.6, fontSize: 12 }}>{today}</p>
          <h1 className="d-hero-name">{greeting}, Farmer</h1>
          <p style={{ marginTop: 10, opacity: 0.8 }}>Welcome to your KrishiAI dashboard.</p>
        </div>

        <div className="d-tiles">
          <div className="d-tile" onClick={() => setWeatherOpen(true)}>
            <div className="d-tile-icon"><Sun size={20} /></div>
            <p style={{ fontSize: 10, fontWeight: 800, opacity: 0.5 }}>WEATHER</p>
            <p style={{ fontSize: 24, fontWeight: 700 }}>{dashWeather ? `${Math.round(dashWeather.main.temp)}°C` : '28°C'}</p>
            <p style={{ fontSize: 11, opacity: 0.6 }}>{dashWeather ? dashWeather.weather[0].description : 'Clear sky'}</p>
          </div>
          <div className="d-tile" onClick={() => setCalendarOpen(true)}>
            <div className="d-tile-icon"><Calendar size={20} /></div>
            <p style={{ fontSize: 10, fontWeight: 800, opacity: 0.5 }}>SEASON</p>
            <p style={{ fontSize: 24, fontWeight: 700 }}>Rabi</p>
            <p style={{ fontSize: 11, opacity: 0.6 }}>Planting Guide</p>
          </div>
          <div className="d-tile" onClick={() => setMarketOpen(true)}>
            <div className="d-tile-icon"><TrendingUp size={20} /></div>
            <p style={{ fontSize: 10, fontWeight: 800, opacity: 0.5 }}>MANDI</p>
            <p style={{ fontSize: 24, fontWeight: 700 }}>Live</p>
            <p style={{ fontSize: 11, opacity: 0.6 }}>Market Prices</p>
          </div>
          <div className="d-tile" onClick={() => setChatOpen(true)}>
            <div className="d-tile-icon"><Bot size={20} /></div>
            <p style={{ fontSize: 10, fontWeight: 800, opacity: 0.5 }}>AI ASSISTANT</p>
            <p style={{ fontSize: 24, fontWeight: 700 }}>KrishiAI</p>
            <p style={{ fontSize: 11, opacity: 0.6 }}>Ask Anything</p>
          </div>
        </div>

        <div className="d-body">
          <div>
            <h2 style={{ marginBottom: 20 }}>Farm Status</h2>
            <div style={{ background: '#fff', padding: 40, borderRadius: 20, border: '1px solid #e2e8df', textAlign: 'center' }}>
              <Sprout size={48} color="#2e7d4f" style={{ marginBottom: 15 }} />
              <h3>Your Farm is doing well!</h3>
              <p style={{ color: '#666', marginTop: 10 }}>Use the AI Assistant to get personalized insights for your crops.</p>
            </div>
          </div>

          <div className="d-sidebar">
            <p style={{ fontSize: 11, fontWeight: 800, opacity: 0.5, marginBottom: 5 }}>QUICK ACTIONS</p>
            <button className="d-acard" onClick={() => setChatOpen(true)}>
              <div className="d-tile-icon" style={{ marginBottom: 0, width: 32, height: 32 }}><Bot size={16} /></div>
              <div><p style={{ fontWeight: 700 }}>AI Assistant</p><p style={{ fontSize: 11, opacity: 0.6 }}>Chat with KrishiAI</p></div>
              <ChevronRight size={16} style={{ marginLeft: 'auto', opacity: 0.3 }} />
            </button>
            <button className="d-acard" onClick={() => setWeatherOpen(true)}>
              <div className="d-tile-icon" style={{ marginBottom: 0, width: 32, height: 32 }}><Sun size={16} /></div>
              <div><p style={{ fontWeight: 700 }}>Weather Detail</p><p style={{ fontSize: 11, opacity: 0.6 }}>Local forecast</p></div>
              <ChevronRight size={16} style={{ marginLeft: 'auto', opacity: 0.3 }} />
            </button>
            <button className="d-acard" onClick={() => setMarketOpen(true)}>
              <div className="d-tile-icon" style={{ marginBottom: 0, width: 32, height: 32 }}><TrendingUp size={16} /></div>
              <div><p style={{ fontWeight: 700 }}>Mandi Prices</p><p style={{ fontSize: 11, opacity: 0.6 }}>Live market rates</p></div>
              <ChevronRight size={16} style={{ marginLeft: 'auto', opacity: 0.3 }} />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {chatOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setChatOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 1999, backdropFilter: 'blur(4px)' }} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="d-chat-panel">
              <div style={{ padding: 20, background: '#152b1e', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Bot size={20} />
                  <span style={{ fontWeight: 700 }}>KrishiCopilot</span>
                </div>
                <X size={20} cursor="pointer" onClick={() => setChatOpen(false)} />
              </div>
              <div className="d-chat-msgs">
                {chatMessages.map((m, i) => (
                  <div key={i} className={`d-cbubble d-cbubble--${m.role}`}>{m.text}</div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <form className="d-chat-form" onSubmit={handleSend}>
                <input className="d-chat-inp" placeholder="Type a message..." value={chatInput} onChange={e => setChatInput(e.target.value)} />
                <button type="submit" className="d-chat-go">Send</button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Dashboard;
