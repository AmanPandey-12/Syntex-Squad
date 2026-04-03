import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import DetectionPage from './pages/DetectionPage';
import LoginPage from './pages/LoginPage';
import InventoryPage from './pages/InventoryPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import CropPickerPage from './pages/CropPickerPage';
import ProfitCalculatorPage from './pages/ProfitCalculatorPage';
import TeamPage from './pages/TeamPage';

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
        <Navbar />
        <main className="">
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
              <Route path="/about" element={<DarkPageWrapper><AboutPage /></DarkPageWrapper>} />
              <Route path="/contact" element={<DarkPageWrapper><ContactPage /></DarkPageWrapper>} />
              <Route path="/privacy" element={<DarkPageWrapper><PrivacyPolicyPage /></DarkPageWrapper>} />
              <Route path="/terms" element={<DarkPageWrapper><TermsPage /></DarkPageWrapper>} />
              <Route path="/team" element={<DarkPageWrapper><TeamPage /></DarkPageWrapper>} />
              <Route path="*" element={<DarkPageWrapper><NotFoundPage /></DarkPageWrapper>} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </>
  );
}

export default App;
