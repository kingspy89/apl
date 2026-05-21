import React, { useState } from 'react';
import { Trophy, Medal, Crown, Star, Flame, Target } from 'lucide-react';
import { motion } from 'motion/react';

const DUMMY_LEADERBOARD = [
  { rank: 1, name: "NeonStriker", xp: 45200, streak: 34, accuracy: 94, isMe: false },
  { rank: 2, name: "CryptoBat", xp: 42100, streak: 28, accuracy: 91, isMe: false },
  { rank: 3, name: "BleedBlue", xp: 39800, streak: 22, accuracy: 89, isMe: false },
  { rank: 4, name: "SpinWizard", xp: 35400, streak: 19, accuracy: 88, isMe: false },
  { rank: 34, name: "Me", xp: 12500, streak: 12, accuracy: 82, isMe: true }, // Me indicator
];

export default function LeaderboardPage() {
  const [tab, setTab] = useState('GLOBAL');

  return (
    <div className="pt-24 px-6 max-w-5xl mx-auto min-h-screen pb-20">
      
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#1C5B48]/20 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="text-center mb-12 relative z-10">
        <h1 className="text-5xl font-black font-display uppercase tracking-tight mb-4">
          Hall of <span className="text-[#D6FF5C]">Legends</span>
        </h1>
        <p className="text-gray-400">Compete globally. Prove your sports intelligence.</p>
      </div>

      <div className="flex justify-center mb-10 relative z-10">
        <div className="glass-panel rounded-full p-1 border border-white/10 flex">
          {['GLOBAL', 'FRIENDS', 'TOURNAMENT'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${tab === t ? 'bg-[#D6FF5C] text-[#0B2E26]' : 'text-gray-400 hover:text-white'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 flex justify-center items-end gap-4 mb-12 h-64 relative z-10">
        {/* Rank 2 */}
        <motion.div 
          initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
          className="w-32 flex flex-col items-center"
        >
          <div className="w-16 h-16 rounded-full bg-slate-400 mb-4 border-2 border-slate-300 flex items-center justify-center text-black font-bold text-xl"><Trophy className="w-8 h-8 text-slate-100 drop-shadow" /></div>
          <div className="w-full h-32 bg-gradient-to-t from-[#103B2F] to-[#1C5B48] rounded-t-xl border-x border-t border-white/10 flex items-start justify-center pt-4">
             <span className="font-display font-bold text-2xl">2</span>
          </div>
        </motion.div>

        {/* Rank 1 */}
        <motion.div 
          initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="w-40 flex flex-col items-center relative z-10"
        >
          <div className="absolute -top-12"><Crown className="w-10 h-10 text-yellow-400 z-20" /></div>
          <div className="w-20 h-20 rounded-full bg-yellow-500 mb-4 border-4 border-yellow-300 flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.5)]"><Trophy className="w-10 h-10 text-yellow-100" /></div>
          <div className="w-full h-40 bg-gradient-to-t from-[#0B2E26] to-[#D6FF5C]/30 rounded-t-xl border-x border-t border-[#D6FF5C]/50 flex items-start justify-center pt-4 shadow-[0_0_40px_rgba(214,255,92,0.15)] glow-text">
             <span className="font-display font-black text-4xl text-[#D6FF5C]">1</span>
          </div>
        </motion.div>

        {/* Rank 3 */}
        <motion.div 
          initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
          className="w-32 flex flex-col items-center"
        >
          <div className="w-16 h-16 rounded-full bg-amber-700 mb-4 border-2 border-amber-600 flex items-center justify-center font-bold text-xl"><Trophy className="w-8 h-8 text-amber-200" /></div>
          <div className="w-full h-24 bg-gradient-to-t from-[#103B2F] to-[#1C5B48] rounded-t-xl border-x border-t border-white/10 flex items-start justify-center pt-4">
             <span className="font-display font-bold text-2xl">3</span>
          </div>
        </motion.div>
      </div>

      <div className="glass-panel-heavy rounded-3xl overflow-hidden relative z-10 border border-white/5">
        <div className="grid grid-cols-12 gap-4 p-4 text-xs font-mono text-gray-500 font-bold uppercase tracking-widest border-b border-white/5">
          <div className="col-span-1 text-center">Rank</div>
          <div className="col-span-5">Player</div>
          <div className="col-span-2 text-center">Streak</div>
          <div className="col-span-2 text-center">Accuracy</div>
          <div className="col-span-2 text-right pr-4">XP</div>
        </div>

        <div className="p-2 space-y-2">
          {DUMMY_LEADERBOARD.map((user, i) => (
             <React.Fragment key={i}>
                {user.rank === 34 && <div className="py-2 text-center text-xs text-gray-600 border-b border-dashed border-white/10 mb-2">...</div>}
                
                <div className={`grid grid-cols-12 gap-4 p-4 items-center rounded-2xl transition-colors ${user.isMe ? 'bg-[#D6FF5C]/10 border border-[#D6FF5C]/30 shadow-[0_0_15px_rgba(214,255,92,0.1)]' : 'hover:bg-white/5 border border-transparent'}`}>
                  <div className={`col-span-1 text-center font-display font-black text-xl ${user.rank <= 3 ? 'text-[#D6FF5C]' : 'text-gray-400'}`}>
                    {user.rank}
                  </div>
                  <div className="col-span-5 font-bold text-lg flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-display text-lg ${user.isMe ? 'bg-[#D6FF5C] text-[#0B2E26]' : 'bg-white/10 text-white'}`}>
                       {user.name.charAt(0)}
                    </div>
                    {user.name} {user.isMe && <span className="text-xs bg-[#D6FF5C] text-black px-2 py-0.5 rounded-sm uppercase tracking-wide ml-2">You</span>}
                  </div>
                  <div className="col-span-2 text-center flex items-center justify-center gap-1 font-mono font-bold text-orange-400">
                    <Flame className="w-4 h-4" /> {user.streak}
                  </div>
                  <div className="col-span-2 text-center flex items-center justify-center gap-1 font-mono font-bold text-blue-400">
                    <Target className="w-4 h-4" /> {user.accuracy}%
                  </div>
                  <div className="col-span-2 text-right pr-4 font-mono font-bold text-[#D6FF5C]">
                    {user.xp.toLocaleString()}
                  </div>
                </div>
             </React.Fragment>
          ))}
        </div>
      </div>

    </div>
  );
}
