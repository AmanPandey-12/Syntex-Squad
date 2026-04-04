import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
   Award, X, ExternalLink, ChevronRight, Search, 
   ShieldCheck, Landmark, HeartPulse
} from 'lucide-react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useLanguage } from '../context/LanguageContext';

const SchemesPage = () => {
   const [schemes, setSchemes] = useState([]);
   const [selectedScheme, setSelectedScheme] = useState(null);
   const [loading, setLoading] = useState(true);
   const [searchTerm, setSearchTerm] = useState('');
   const navigate = useNavigate();
   const { t, language } = useLanguage();

   useEffect(() => {
      let unsubSchemes = () => { };
      const unsubAuth = auth.onAuthStateChanged(user => {
         if (user) {
            // REMOVED SAMPLE DATA: Now strictly fetching from Firebase production database
            const sq = query(collection(db, 'schemes'), where('status', '!=', 'Expired'));
            
            unsubSchemes = onSnapshot(sq, snap => {
               const fetched = snap.docs.map(doc => {
                  const data = doc.data();
                  // Check for AI-localized content
                  if (data.localizations && data.localizations[language]) {
                     const l = data.localizations[language];
                     return { 
                        id: doc.id, 
                        ...data,
                        name: l.name || data.name,
                        category: l.category || data.category,
                        description: l.description || data.description,
                        budget: l.budget || data.budget,
                        beneficiaries: l.beneficiaries || data.beneficiaries
                     };
                  }
                  return { id: doc.id, ...data };
               });
               
               setSchemes(fetched);
               setLoading(false);
            }, (error) => {
               console.error("Firebase Sync Error:", error);
               setLoading(false);
            });
         } else {
            navigate('/login');
         }
      });
      return () => { unsubAuth(); unsubSchemes(); };
   }, [navigate, language]);

   const filteredSchemes = schemes.filter(s => 
      (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (s.description || '').toLowerCase().includes(searchTerm.toLowerCase())
   );

   const getIcon = (cat) => {
      const c = (cat || '').toLowerCase();
      if (c.includes('insur') || c.includes('बीमा')) return <ShieldCheck size={24} />;
      if (c.includes('aid') || c.includes('सहायता')) return <Landmark size={24} />;
      if (c.includes('soil') || c.includes('मिट्टी')) return <HeartPulse size={24} />;
      return <Award size={24} />;
   };

   return (
      <div className="min-scheme-page">
         <style>{`
            .min-scheme-page { min-height: 100vh; background: #f9fbf9; color: #333; font-family: 'Inter', sans-serif; padding: 110px 20px 80px; }
            .min-container { max-width: 800px; margin: 0 auto; }
            .min-header { text-align: left; margin-bottom: 40px; }
            .min-title { font-size: 32px; font-weight: 810; color: #1a2e14; margin-bottom: 12px; font-family: 'Outfit', sans-serif; letter-spacing: -0.01em; }
            .min-subtitle { font-size: 16px; color: #666; font-weight: 500; }
            .min-search-box { background: #fff; border-radius: 16px; border: 1px solid #ddd; display: flex; align-items: center; padding: 12px 20px; margin-bottom: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
            .min-search-box input { border: none; outline: none; flex: 1; font-size: 16px; margin-left: 12px; }
            .min-list { display: flex; flex-direction: column; gap: 16px; }
            .min-card { background: #fff; padding: 24px; border-radius: 20px; border: 1px solid #eee; display: flex; align-items: center; gap: 20px; cursor: pointer; transition: all 0.2s ease; }
            .min-card:hover { transform: translateY(-3px); border-color: #2e7d4f; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
            .min-card-icon { width: 56px; height: 56px; border-radius: 14px; background: #f0f7f0; color: #2e7d4f; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
            .min-card-content { flex: 1; min-width: 0; }
            .min-card-name { font-size: 18px; font-weight: 700; color: #1a2e14; margin-bottom: 4px; }
            .min-card-cat { font-size: 13px; font-weight: 600; color: #2e7d4f; background: #eef7ee; padding: 3px 10px; border-radius: 100px; display: inline-block; margin-bottom: 6px; }
            .min-card-desc { font-size: 14px; color: #666; line-height: 1.5; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .min-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 16px; }
            .min-modal { background: #fff; border-radius: 24px; width: 100%; max-width: 520px; max-height: 90vh; overflow-y: auto; display: flex; flex-direction: column; }
            .min-modal-header { padding: 36px 32px 20px; position: relative; border-bottom: 1px solid #f0f0f0; }
            .min-modal-close { position: absolute; top: 16px; right: 16px; background: #f5f5f5; border: none; width: 36px; height: 36px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
            .min-modal-body { padding: 32px; flex: 1; }
            .min-modal-name { font-size: 26px; font-weight: 800; color: #1a2e14; margin-bottom: 8px; line-height: 1.2; font-family: 'Outfit', sans-serif; }
            .min-modal-p { font-size: 15px; line-height: 1.7; color: #555; margin-bottom: 24px; }
            .min-modal-info { display: grid; grid-template-columns: 1fr; gap: 12px; margin-bottom: 32px; }
            .min-info-row { display: flex; justify-content: space-between; padding: 16px; background: #f9fbf9; border-radius: 14px; border: 1px solid #f0f2f0; }
            .min-info-label { font-size: 14px; font-weight: 600; color: #666; }
            .min-info-val { font-size: 14px; font-weight: 700; color: #1a2e14; }
            .min-apply-btn { background: #2e7d4f; color: #fff; width: 100%; padding: 18px; border: none; border-radius: 16px; font-size: 16px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer; }
            @media (max-width: 600px) {
               .min-scheme-page { padding: 90px 16px 40px; }
               .min-card { padding: 20px; gap: 16px; }
               .min-modal { border-radius: 24px 24px 0 0; position: fixed; bottom: 0; max-height: 85vh; }
            }
         `}</style>

         <div className="min-container">
            <header className="min-header">
               <h1 className="min-title">{t('schemes.title')}</h1>
               <p className="min-subtitle">{t('schemes.subtitle')}</p>
            </header>

            <div className="min-search-box">
               <Search size={20} color="#999" />
               <input 
                  type="text" 
                  placeholder={t('schemes.search')} 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>

            {loading ? (
               <div style={{ textAlign: 'center', padding: '100px 0', color: '#999' }}>
                  <p>{t('schemes.loading')}</p>
               </div>
            ) : (
               <div className="min-list">
                  {filteredSchemes.length === 0 ? (
                     <div style={{ textAlign: 'center', padding: '100px 0', color: '#999' }}>
                        <Award size={48} style={{ opacity: 0.2, marginBottom: '20px' }} />
                        <p>No active schemes found.</p>
                     </div>
                  ) : (
                     filteredSchemes.map((s, i) => (
                        <motion.div 
                           key={s.id} 
                           className="min-card"
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ delay: i * 0.03 }}
                           onClick={() => setSelectedScheme(s)}
                        >
                           <div className="min-card-icon">{getIcon(s.category)}</div>
                           <div className="min-card-content">
                              <span className="min-card-cat">{s.category}</span>
                              <h3 className="min-card-name">{s.name}</h3>
                              <p className="min-card-desc">{s.description}</p>
                           </div>
                           <ChevronRight size={18} color="#ccc" />
                        </motion.div>
                     ))
                  )}
               </div>
            )}
         </div>

         <AnimatePresence>
            {selectedScheme && (
               <div className="min-modal-overlay">
                  <motion.div 
                     className="min-modal"
                     initial={{ opacity: 0, y: 50 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: 50 }}
                  >
                     <div className="min-modal-header">
                        <button className="min-modal-close" onClick={() => setSelectedScheme(null)}><X size={18} /></button>
                        <h2 className="min-modal-name">{selectedScheme.name}</h2>
                        <span className="min-card-cat">{selectedScheme.category}</span>
                     </div>
                     
                     <div className="min-modal-body">
                        <p className="min-modal-p">{selectedScheme.description}</p>

                        <div className="min-modal-info">
                           <div className="min-info-row">
                              <span className="min-info-label">{t('schemes.who')}</span>
                              <span className="min-info-val">{selectedScheme.beneficiaries || 'Farmers'}</span>
                           </div>
                           <div className="min-info-row">
                              <span className="min-info-label">{t('schemes.aid')}</span>
                              <span className="min-info-val">{selectedScheme.budget || 'Government'}</span>
                           </div>
                        </div>

                        <button className="min-apply-btn" onClick={() => window.open(selectedScheme.link, '_blank')}>
                           {t('schemes.applyNow')} <ExternalLink size={18} />
                        </button>
                     </div>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>
      </div>
   );
};

export default SchemesPage;
