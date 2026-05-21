import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import LandingPage from './pages/LandingPage';
import LiveMatchPage from './pages/LiveMatchPage';
import AiCoachPage from './pages/AiCoachPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';
import DemoPage from './pages/DemoPage';
import ArcadePage from './pages/ArcadePage';
import Navbar from './components/Navbar';
import { useAuthStore } from './store/useAuthStore';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location}>
        <Route path="/" element={<PageTransition path="/"><LandingPage /></PageTransition>} />
        <Route path="/live" element={<PageTransition path="/live"><LiveMatchPage /></PageTransition>} />
        <Route path="/arcade" element={<PageTransition path="/arcade"><ArcadePage /></PageTransition>} />
        <Route path="/coach" element={<PageTransition path="/coach"><AiCoachPage /></PageTransition>} />
        <Route path="/leaderboard" element={<PageTransition path="/leaderboard"><LeaderboardPage /></PageTransition>} />
        <Route path="/profile" element={<PageTransition path="/profile"><ProfilePage /></PageTransition>} />
        <Route path="/demo" element={<PageTransition path="/demo"><DemoPage /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

function PageTransition({ children, path }: { children: React.ReactNode, path: string }) {
  return (
    <motion.div
      key={path}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen pt-24"
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const initAuth = useAuthStore(state => state.init);

  useEffect(() => {
    const cleanup = initAuth();
    return () => {
      if (typeof cleanup === 'function') cleanup();
    };
  }, [initAuth]);

  return (
    <Router>
      <div className="min-h-screen bg-[#0B2E26] text-[#F4F6F5] font-sans overflow-hidden relative flex flex-col selection:bg-[#D6FF5C] selection:text-black">
        {/* Background Decorative Elements */}
        <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-[#1C5B48] opacity-20 rounded-full blur-[120px] fixed pointer-events-none"></div>
        <div className="absolute bottom-[-100px] right-[-100px] w-[600px] h-[600px] bg-[#D6FF5C] opacity-5 rounded-full blur-[150px] fixed pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none fixed bg-pattern z-0" style={{ backgroundImage: 'radial-gradient(#D6FF5C 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
        
        {/* Decorative Giant Text */}
        <div className="absolute top-1/2 -left-20 -translate-y-1/2 opacity-10 pointer-events-none fixed -z-10 hidden xl:block">
           <h1 className="text-[300px] font-black italic leading-none select-none text-[#F4F6F5]">CRIC</h1>
        </div>

        <Navbar />
        <div className="relative z-10 flex-1 overflow-x-hidden">
          <AnimatedRoutes />
        </div>
      </div>
    </Router>
  );
}
