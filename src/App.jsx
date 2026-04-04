import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { lazy, Suspense, useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';

// Lazy load pages to reduce initial bundle size
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const DetectionPage = lazy(() => import('./pages/DetectionPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const InventoryPage = lazy(() => import('./pages/InventoryPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const CropPickerPage = lazy(() => import('./pages/CropPickerPage'));
const ProfitCalculatorPage = lazy(() => import('./pages/ProfitCalculatorPage'));
const TeamPage = lazy(() => import('./pages/TeamPage'));
const SchemesPage = lazy(() => import('./pages/SchemesPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));

import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

// Premium Loading Fallback
const LoadingFallback = () => (
  <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#f0f4ed] z-[9999]">
    <div className="relative w-24 h-24">
      <div className="absolute inset-0 border-4 border-lime-200 rounded-full animate-pulse"></div>
      <div className="absolute inset-0 border-t-4 border-lime-600 rounded-full animate-spin"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <svg className="w-10 h-10 text-lime-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
          <path d="M2 21c0-3 1.85-5.36 5.08-6C10 14.5 10.5 13 10.5 13" />
        </svg>
      </div>
    </div>
    <p className="mt-6 font-bold text-slate-900 tracking-widest text-xs uppercase animate-bounce">
      KrishiAI Loading...
    </p>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) return null; // Or a spinner
  if (!user) return <Navigate to="/login" replace />;
  
  return children;
};

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -6 }}
    transition={{ duration: 0.22, ease: 'easeOut' }}
    style={{ background: '#f0f4ed', minHeight: '100vh' }}
  >
    {children}
  </motion.div>
);

const DarkPageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -6 }}
    transition={{ duration: 0.22, ease: 'easeOut' }}
    style={{ background: '#06090a', minHeight: '100vh' }}
  >
    {children}
  </motion.div>
);

function App() {
  const location = useLocation();
  return (
    <>
      <ScrollToTop />
      <div className="min-h-screen bg-slate-50 text-slate-800">
        {!location.pathname.startsWith('/admin') && <Navbar />}
        <main className="">
          <Suspense fallback={<LoadingFallback />}>
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<DarkPageWrapper><LandingPage /></DarkPageWrapper>} />
                <Route path="/login" element={<DarkPageWrapper><LoginPage /></DarkPageWrapper>} />
                <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
                <Route path="/detection" element={<PageWrapper><DetectionPage /></PageWrapper>} />
                <Route path="/inventory" element={<PageWrapper><InventoryPage /></PageWrapper>} />
                <Route path="/profile" element={<PageWrapper><ProfilePage /></PageWrapper>} />
                <Route path="/crop-picker" element={<PageWrapper><CropPickerPage /></PageWrapper>} />
                <Route path="/profit-calculator" element={<PageWrapper><ProfitCalculatorPage /></PageWrapper>} />
                <Route path="/schemes" element={<PageWrapper><SchemesPage /></PageWrapper>} />
                <Route path="/about" element={<DarkPageWrapper><AboutPage /></DarkPageWrapper>} />
                <Route path="/contact" element={<DarkPageWrapper><ContactPage /></DarkPageWrapper>} />
                <Route path="/privacy" element={<DarkPageWrapper><PrivacyPolicyPage /></DarkPageWrapper>} />
                <Route path="/terms" element={<DarkPageWrapper><TermsPage /></DarkPageWrapper>} />
                <Route path="/team" element={<DarkPageWrapper><TeamPage /></DarkPageWrapper>} />
                <Route path="/admin" element={<ProtectedRoute><PageWrapper><AdminPage /></PageWrapper></ProtectedRoute>} />
                <Route path="*" element={<DarkPageWrapper><NotFoundPage /></DarkPageWrapper>} />
              </Routes>
            </AnimatePresence>
          </Suspense>
        </main>
      </div>
    </>
  );
}

export default App;
