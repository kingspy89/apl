import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlayCircle, Trophy, Brain, Activity, Target, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

const DEMO_STEPS = [
  'Waiting for live feed...',
  'AI analyzing match context...',
  'Generating micro-prediction...',
  'Adapting difficulty based on your 82% accuracy...',
  'Challenge Ready.'
];

export default function DemoPage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const startDemo = () => {
    setLoading(true);
    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      setStep(current);
      if (current >= DEMO_STEPS.length) {
        clearInterval(interval);
        setTimeout(() => navigate('/live'), 1000);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-20 px-6 relative overflow-hidden bg-[#05110E]">
      <div className="absolute inset-0 flex justify-center items-center opacity-10">
        <div className="w-[100vw] h-[100vw] border-[100px] border-[#1C5B48] rounded-full blur-[150px]"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-2xl text-center glass-panel-heavy rounded-3xl p-12 overflow-hidden shadow-[0_0_80px_rgba(28,91,72,0.4)]">
        
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Zap className="w-48 h-48" />
        </div>

        <div className="mb-8 mx-auto w-24 h-24 rounded-full bg-[#1C5B48]/30 flex items-center justify-center border border-[#D6FF5C]/20 shadow-[0_0_30px_rgba(214,255,92,0.1)]">
           <Trophy className="w-10 h-10 text-[#D6FF5C]" />
        </div>

        <h1 className="text-4xl sm:text-5xl font-black font-display uppercase tracking-tight text-white mb-4">
          Demo <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D6FF5C] to-[#3AA981]">Experience</span>
        </h1>
        <p className="text-gray-400 mb-12 max-w-md mx-auto text-lg leading-relaxed">
          Simulate a real-time sporting event. Experience adaptive AI polling, live streaks, and instantaneous ML-driven feedback.
        </p>

        {!loading ? (
          <button 
            onClick={startDemo}
            className="group relative inline-flex items-center justify-center gap-3 rounded-full bg-[#D6FF5C] px-10 py-5 text-lg font-bold text-[#0B2E26] shadow-xl hover:bg-[#c4eb4b] transition-all hover:scale-105 active:scale-95"
          >
            <span className="absolute inset-0 bg-white/20 rounded-full blur group-hover:scale-110 transition-transform opacity-0 group-hover:opacity-100"></span>
            Initialize Live Sync
            <PlayCircle className="w-6 h-6" />
          </button>
        ) : (
          <div className="h-32 flex flex-col items-center justify-center space-y-6">
             <div className="flex justify-center gap-2">
                {[...Array(3)].map((_, i) => (
                   <motion.div
                     key={i}
                     className="w-3 h-3 rounded-full bg-[#D6FF5C]"
                     animate={{ y: ["0%", "-100%", "0%"] }}
                     transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1, ease: 'easeOut' }}
                   />
                ))}
             </div>
             
             <div className="h-8 overflow-hidden relative w-full flex justify-center">
               <AnimatePresence mode="popLayout">
                 {step < DEMO_STEPS.length && (
                   <motion.div
                     key={step}
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -20 }}
                     className="absolute font-mono text-sm font-bold text-[#A4EBC5] tracking-widest uppercase"
                   >
                     {DEMO_STEPS[step]}
                   </motion.div>
                 )}
               </AnimatePresence>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
