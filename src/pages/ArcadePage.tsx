import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Timer, Trophy, ChevronRight, RefreshCw, Gamepad2 } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function ArcadePage() {
  const { user, profile } = useAuthStore();
  const [scenario, setScenario] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(15);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [winAnimation, setWinAnimation] = useState<string | null>(null);
  const [sessionStreak, setSessionStreak] = useState(0);

  useEffect(() => {
    fetchNextScenario();
  }, []);

  useEffect(() => {
    if (!scenario || selectedOpt || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [scenario, selectedOpt, timeLeft]);

  const handleTimeOut = () => {
    setSelectedOpt('TIMEOUT');
    setSessionStreak(0);
    setWinAnimation("Time's Up!");
    setTimeout(() => {
      setWinAnimation(null);
      fetchNextScenario();
    }, 2500);
  };

  const fetchNextScenario = async () => {
    setLoading(true);
    setSelectedOpt(null);
    setScenario(null);
    
    try {
      const res = await fetch('/api/generate_arcade', { method: 'POST' });
      const data = await res.json();
      setScenario(data);
      setTimeLeft(15);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (opt: string) => {
    setSelectedOpt(opt);
    let xpGained = scenario.xp || 150;
    
    // Check if correct
    const isCorrect = opt === scenario.correctOption;
    
    if (isCorrect) {
      setSessionStreak((s) => s + 1);
      const streakBonus = sessionStreak * 10;
      xpGained += streakBonus;
      
      if (user && profile) {
        const newXp = (profile.xp || 0) + xpGained;
        const newLevel = Math.floor(newXp / 1000) + 1;
        const newStreak = (profile.streak || 0) + 1;
        await setDoc(doc(db, 'users', user.uid), {
           xp: newXp,
           level: newLevel,
           streak: newStreak
        }, { merge: true });
      }
      
      setWinAnimation(`+${xpGained} XP Earned!`);
    } else {
      setSessionStreak(0);
      setWinAnimation("Incorrect!");
    }
    
    setTimeout(() => { 
      setWinAnimation(null);
      fetchNextScenario(); 
    }, 2500);
  };

  if (loading) {
     return (
      <div className="pt-24 px-6 max-w-4xl mx-auto min-h-screen pb-20 flex flex-col items-center justify-center">
         <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
            <Gamepad2 className="w-12 h-12 text-[#D6FF5C]" />
         </motion.div>
         <p className="mt-4 font-mono text-sm tracking-widest text-[#F4F6F5]/50 uppercase">Loading Scenario...</p>
      </div>
     );
  }

  return (
    <div className="pt-24 px-6 max-w-4xl mx-auto min-h-screen pb-20">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-[#D6FF5C] flex items-center justify-center shadow-[0_0_20px_rgba(214,255,92,0.3)]">
          <Gamepad2 className="w-6 h-6 text-[#0B2E26]" />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-black font-display uppercase tracking-tight">Arcade Mode</h1>
          <p className="text-sm text-green-300/80 uppercase tracking-widest font-mono">Simulated Cricket Scenarios</p>
        </div>
        <div className="text-right glass-panel px-4 py-2 rounded-xl border border-white/10 hidden sm:block">
          <p className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">Current Streak</p>
          <p className="text-2xl font-black text-[#D6FF5C]">{sessionStreak} <span className="text-sm text-white/50">🔥</span></p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {scenario && (
           <motion.div 
             key={scenario.question}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -20 }}
             className="glass-panel-heavy rounded-3xl p-8 border-[#D6FF5C]/30 shadow-2xl relative overflow-hidden"
           >
              {/* Question Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D6FF5C] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#D6FF5C]"></span>
                  </span>
                  <span className="font-mono text-sm text-[#D6FF5C] uppercase tracking-widest font-bold">Fast Quiz</span>
                </div>
                
                <div className="flex items-center gap-3 glass-panel px-4 py-2 rounded-full border border-white/10">
                  <Timer className={`w-4 h-4 ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-[#D6FF5C]'}`} />
                  <span className="font-mono text-sm font-bold w-6 text-center">{timeLeft}s</span>
                </div>
              </div>

              {/* Scenario Context */}
              <div className="mb-6 p-4 rounded-xl bg-black/30 border border-white/5">
                 <p className="font-mono text-[10px] uppercase tracking-widest text-[#D6FF5C] mb-2 opacity-80">Scenario</p>
                 <p className="text-lg font-medium leading-relaxed">{scenario.scenario}</p>
                 {selectedOpt && scenario.insight && (
                    <motion.p 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="text-sm text-[#D6FF5C] mt-4 italic bg-[#D6FF5C]/10 p-3 flex border-l-2 border-[#D6FF5C] inline-block"
                    >
                      &ldquo;{scenario.insight}&rdquo;
                    </motion.p>
                 )}
              </div>

              <h2 className="text-2xl md:text-3xl font-display font-black leading-tight mb-8">
                {scenario.question}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scenario.options && scenario.options.map((opt: string) => {
                  const isSelected = selectedOpt === opt;
                  const isCorrect = opt === scenario.correctOption;
                  const showCorrect = selectedOpt !== null && isCorrect;
                  const showIncorrect = isSelected && !isCorrect;

                  let btnClass = "border-white/10 bg-white/5 hover:border-[#D6FF5C]/50 hover:bg-white/10 text-[#F4F6F5]/80";
                  
                  if (showCorrect) {
                     btnClass = "border-green-500 bg-green-500/20 text-white";
                  } else if (showIncorrect) {
                     btnClass = "border-red-500 bg-red-500/20 text-white";
                  } else if (selectedOpt !== null) {
                     btnClass = "border-white/5 bg-white/5 text-white/30";
                  }

                  return (
                    <button 
                      key={opt}
                      onClick={() => handleSelect(opt)}
                      disabled={timeLeft <= 0 || selectedOpt !== null}
                      className={`
                        p-5 rounded-2xl border-2 text-left transition-all relative overflow-hidden group
                        ${btnClass}
                        ${(timeLeft <= 0 && selectedOpt !== opt && selectedOpt === null) ? 'opacity-50 grayscale' : ''}
                      `}
                    >
                      <span className="font-bold text-lg relative z-10">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {winAnimation && (
                 <motion.div 
                   initial={{ opacity: 0, y: 10, scale: 0.9 }}
                   animate={{ opacity: 1, y: 0, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.8 }}
                   className={`absolute inset-0 flex items-center justify-center z-20 backdrop-blur-sm rounded-3xl ${
                     winAnimation === 'Incorrect!' || winAnimation === "Time's Up!" 
                       ? 'bg-red-500/10 border border-red-500/50' 
                       : 'bg-green-500/20 border border-green-500/50'
                   }`}
                 >
                   <div className="text-center">
                     <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-2 shadow-[0_0_30px_rgba(214,255,92,0.5)] ${
                       winAnimation === 'Incorrect!' || winAnimation === "Time's Up!"
                         ? 'bg-red-500 text-white shadow-red-500/50'
                         : 'bg-green-500 text-[#0B2E26] shadow-green-500/50'
                     }`}>
                       {winAnimation === 'Incorrect!' || winAnimation === "Time's Up!" 
                         ? <span className="font-black text-2xl">X</span> 
                         : <Zap className="w-8 h-8 fill-current" />
                       }
                     </div>
                     <div className="font-display font-black text-2xl text-white uppercase tracking-tight">{winAnimation}</div>
                     <div className={`text-sm mt-1 mb-8 ${winAnimation === 'Incorrect!' || winAnimation === "Time's Up!" ? 'text-red-300' : 'text-green-300'}`}>
                       {winAnimation === 'Incorrect!' ? 'Better luck next time!' : winAnimation === "Time's Up!" ? 'Too slow!' : 'Great Call!'}
                     </div>
                   </div>
                 </motion.div>
              )}
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
