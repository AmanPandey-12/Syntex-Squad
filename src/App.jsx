import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';

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
              <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
              <Route path="*" element={<DarkPageWrapper><LandingPage /></DarkPageWrapper>} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </>
  );
}

export default App;
