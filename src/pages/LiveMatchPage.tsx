import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, ShieldAlert, Zap, Timer, Trophy, ChevronRight, RefreshCw } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { useAuthStore } from '../store/useAuthStore';
import { useLive } from '../hooks/useLive';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const dummyGraphData = Array.from({ length: 20 }, (_, i) => ({ value: 40 + Math.random() * 40 + (i * 2) }));

export default function LiveMatchPage() {
  const [timeLeft, setTimeLeft] = useState(15);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  
  // Real-time states
  const [matchData, setMatchData] = useState<any>(null);
  const [scoreData, setScoreData] = useState<any>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [narrative, setNarrative] = useState<string | null>(null);
  const [aiMessages, setAiMessages] = useState<any[]>([]);
  const [winAnimation, setWinAnimation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const prevScoreRef = useRef<string>("");
  const { user, profile } = useAuthStore();

  useEffect(() => {
    let interval: any;
    
    const fetchLiveMatch = async () => {
      try {
        setIsRefreshing(true);
        // Fetch matches
        const matchesRes = await fetch('/api/matches');
        const matchesData = await matchesRes.json();
        
        console.log("matchesData:", matchesData);

        if (matchesData.status === "failure" || matchesData.error) {
           console.log("Mocking match data due to API failure:", matchesData.reason || matchesData.error);
           // Mock a live CSK vs GT match for testing
           const mockMatch = {
             id: "mock_ipl_match",
             name: "Chennai Super Kings vs Gujarat Titans, Match 1, Indian Premier League 2026",
             matchType: "t20",
             status: "CSK needs 42 runs in 24 balls.",
             venue: "MA Chidambaram Stadium, Chennai",
             date: new Date().toISOString(),
             matchStarted: true,
             matchEnded: false,
             teamInfo: [
               { name: "Chennai Super Kings", shortname: "CSK" },
               { name: "Gujarat Titans", shortname: "GT" }
             ],
             score: [
               { r: 182, w: 4, o: 16.0, inning: "Chennai Super Kings Inning 1" }
             ]
           };
           setMatchData(mockMatch);
           setScoreData({ score: mockMatch.score });
           setLoading(false);
           setIsRefreshing(false);
           return;
        }

        if (matchesData.data && matchesData.data.length > 0) {
           const iplKeywords = ["ipl", "indian premier league", "csk", "gt", "mi", "rcb", "lsg", "rr", "kkr", "pbks", "srh", "dc", "chennai super", "gujarat titan", "mumbai indian", "royal challenger", "super giant", "rajasthan", "kolkata knight", "punjab king", "sunriser", "delhi capital"];
           
           const liveIPL = matchesData.data.find((m: any) => {
               if (!m.matchStarted || m.matchEnded) return false;
               
               const nameMatch = iplKeywords.some(kw => m.name?.toLowerCase().includes(kw) || m.series_name?.toLowerCase().includes(kw));
               
               let shortnameMatch = false;
               if (m.teamInfo && Array.isArray(m.teamInfo)) {
                  shortnameMatch = m.teamInfo.some((t: any) => 
                     ['csk', 'gt', 'mi', 'rcb', 'lsg', 'rr', 'kkr', 'pbks', 'srh', 'dc'].includes(t?.shortname?.toLowerCase()) || 
                     (t?.name && iplKeywords.some(kw => t.name.toLowerCase().includes(kw)))
                  );
               }
               
               return nameMatch || shortnameMatch;
           });
           
           
           const live = liveIPL;
           setMatchData(live || null);
           
           // Fetch scorecard
           if (live?.id) {
              const scoreRes = await fetch(`/api/match_scorecard?id=${live.id}`);
              const sData = await scoreRes.json();
              setScoreData(sData.data);
              
              // EVENT DETECTION logic (Example: Over change or score jump) 
              const currentScoreStr = JSON.stringify(sData.data?.score || "");
              if (prevScoreRef.current && prevScoreRef.current !== currentScoreStr) {
                 // The score changed - we could trigger animations here
                 console.log("Score update detected! Triggering UI refresh.");
              }
              prevScoreRef.current = currentScoreStr;
           }
        }
      } catch (err) {
        console.error("Live match fetch error:", err);
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    };
    
    fetchLiveMatch();
    interval = setInterval(fetchLiveMatch, 60000); // 1 min poll
    
    return () => clearInterval(interval);
  }, []);

  // Real-time socket subscription (if available)
  const liveMatchId = matchData?.id || 'mock_ipl_match';
  useLive(liveMatchId, (event: any) => {
    try {
      // normalize common shapes
      if (event?.type === 'scoreUpdate' || event?.eventType === 'score') {
        setScoreData(event.payload || event.score || event.data || event);
      } else if (event?.type === 'matchUpdate' || event?.eventType === 'match') {
        setMatchData((prev: any) => ({ ...prev, ...(event.payload || event) }));
      } else if (event?.type === 'aiMessage' || event?.type === 'ai:message' || event?.eventType === 'aiMessage') {
        const payload = event.payload || event.data || event;
        setAiMessages((s) => [payload, ...s].slice(0, 20));
        if (payload.storyline) setNarrative(payload.storyline as string);
      } else if (event?.type === 'demo:event' || event?.type === 'match:event' ) {
        // demo raw event
        const payload = event.payload || event;
        // if payload contains score, update
        if (payload?.payload?.event) {
          // ignore for now
        }
      } else {
        // fallback: merge into matchData
        setMatchData((prev: any) => ({ ...prev, ...(event.payload || event) }));
      }
    } catch (e) {
      console.error('Failed to handle live event', e);
    }
  });

  // Poll for new prediction every time timeLeft runs out, plus a small delay
  const generateNewPrediction = async () => {
    try {
      // 1. First, explicitly fetch the absolutely freshest match data
      let freshMatch = matchData;
      let freshScore = scoreData;
      
      const matchesRes = await fetch('/api/matches');
      const latestMatchesInfo = await matchesRes.json();

      if (latestMatchesInfo.status === "failure" || latestMatchesInfo.error) {
           freshMatch = {
             id: "mock_ipl_match",
             name: "Chennai Super Kings vs Gujarat Titans, Match 1, Indian Premier League 2026",
             matchType: "t20",
             status: "CSK needs 42 runs in 24 balls.",
             matchStarted: true,
             matchEnded: false,
             teamInfo: [
               { name: "Chennai Super Kings", shortname: "CSK" },
               { name: "Gujarat Titans", shortname: "GT" }
             ]
           };
           freshScore = {
             score: [{ r: 184 + Math.floor(Math.random() * 6), w: 4, o: 16.1, inning: "Chennai Super Kings Inning 1" }] // slightly advance score
           };
      } else if (latestMatchesInfo.data && latestMatchesInfo.data.length > 0) {
         const iplKeywords = ["ipl", "indian premier league", "csk", "gt", "mi", "rcb", "lsg", "rr", "kkr", "pbks", "srh", "dc", "chennai", "gujarat", "mumbai", "bangalore", "rajasthan", "kolkata", "punjab", "hyderabad", "delhi"];
         const liveIPL = latestMatchesInfo.data.find((m: any) => {
             if (!m.matchStarted || m.matchEnded) return false;
             
             const nameMatch = iplKeywords.some(kw => m.name?.toLowerCase().includes(kw) || m.series_name?.toLowerCase().includes(kw));
             
             let shortnameMatch = false;
             if (m.teamInfo && Array.isArray(m.teamInfo)) {
                shortnameMatch = m.teamInfo.some((t: any) => 
                   ['csk', 'gt', 'mi', 'rcb', 'lsg', 'rr', 'kkr', 'pbks', 'srh', 'dc'].includes(t?.shortname?.toLowerCase()) || 
                   (t?.name && iplKeywords.some(kw => t.name.toLowerCase().includes(kw)))
                );
             }
             
             return nameMatch || shortnameMatch;
         });
         const live = liveIPL;
         freshMatch = live;
         
         if (freshMatch?.id) {
            const scoreRes = await fetch(`/api/match_scorecard?id=${freshMatch.id}`);
            const sData = await scoreRes.json();
            freshScore = sData.data;
         }
      }

      // 2. Generate prediction based on this fresh live context
      const res = await fetch('/api/generate_prediction', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ matchData: { match: freshMatch, score: freshScore }, userAccuracy: profile?.accuracy || 0 })
      });
      const data = await res.json();
      if (data.question) {
        setPrediction(data);
        setTimeLeft(15);
        setSelectedOpt(null);
      }

      // 3. Generate narrative
      try {
        const narrativeRes = await fetch('/api/narrative', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ matchData: freshMatch })
        });
        const narrativeData = await narrativeRes.json();
        if (narrativeData.narrative) {
           setNarrative(narrativeData.narrative);
        }
      } catch (err) {
        console.error("Failed to fetch narrative", err);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!loading && matchData && !prediction && timeLeft === 15) {
      generateNewPrediction();
    }
  }, [loading, matchData, prediction]);

  useEffect(() => {
    if (timeLeft > 0 && prediction && !selectedOpt) {
      const t = setTimeout(() => setTimeLeft(l => l - 1), 1000);
      return () => clearTimeout(t);
    } else if (timeLeft <= 0 && prediction) {
       // Time ran out, wait a bit and fetch new prediction
       const t = setTimeout(() => {
         generateNewPrediction();
       }, 3000);
       return () => clearTimeout(t);
    }
  }, [timeLeft, prediction, selectedOpt]);

  // Derived mock data for rendering if API fails or is empty
  const team1 = matchData?.teamInfo?.[0]?.shortname || matchData?.teamInfo?.[0]?.name?.substring(0, 3)?.toUpperCase() || "TBA";
  const team2 = matchData?.teamInfo?.[1]?.shortname || matchData?.teamInfo?.[1]?.name?.substring(0, 3)?.toUpperCase() || "TBA";
  const currentScoreInfo = scoreData?.score && scoreData.score.length > 0 ? scoreData.score[0] : matchData?.score?.[0];
  const currentScore = currentScoreInfo ? `${currentScoreInfo.r}/${currentScoreInfo.w}` : "0/0";
  const currentOvers = currentScoreInfo ? `${currentScoreInfo.o}` : "0.0";
  const matchStatus = matchData?.status || "Waiting for match data...";

  if (loading) {
     return (
      <div className="pt-24 px-6 max-w-7xl mx-auto min-h-screen pb-20 flex flex-col items-center justify-center">
        <RefreshCw className="w-12 h-12 text-[#D6FF5C] animate-spin" />
      </div>
     );
  }

  if (!loading && !matchData) {
    return (
      <div className="pt-24 px-6 max-w-7xl mx-auto min-h-screen pb-20 flex flex-col items-center justify-center">
         <div className="glass-panel-heavy rounded-3xl p-12 text-center max-w-xl w-full border-[#D6FF5C]/20 relative overflow-hidden flex flex-col items-center">
            <Trophy className="w-16 h-16 text-[#1C5B48] mb-6" />
            <h2 className="text-3xl font-display font-black uppercase tracking-tight mb-4">No Live IPL Matches</h2>
            <p className="text-[#F4F6F5]/60 mb-8">There are currently no live Indian Premier League matches taking place. Come back during match hours to predict over-by-over and earn XP.</p>
            <button onClick={() => window.location.reload()} className="border-2 border-[#D6FF5C]/30 text-[#D6FF5C] px-8 py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[#D6FF5C] hover:text-[#0B2E26] transition-all">
              Refresh Status
            </button>
         </div>
      </div>
    );
  }

  return (
    <div className="pt-24 px-6 max-w-7xl mx-auto min-h-screen pb-20">
      
      {/* Top Header Bar */}
      <header className="glass-panel rounded-2xl p-4 mb-8 flex flex-col md:flex-row justify-between md:items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-[#1C5B48]/20 to-transparent pointer-events-none"></div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1C5B48] to-[#0B2E26] flex items-center justify-center font-display font-black text-xl border border-white/10 shadow-[0_0_15px_rgba(28,91,72,0.8)]">
              {team1}
            </div>
            <div>
              <div className="text-2xl font-bold font-display uppercase tabular-nums">
                {currentScore}
              </div>
              <div className="flex items-center gap-2 text-xs text-indicator font-mono">
                <span className="text-[#A4EBC5]">OVERS: {currentOvers}</span>
                {isRefreshing && <RefreshCw className="w-3 h-3 animate-spin text-[#D6FF5C]" />}
              </div>
            </div>
          </div>
          <div className="h-10 w-px bg-white/10"></div>
          <div className="flex items-center gap-3 opacity-50">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center font-display font-black text-xl border border-white/10">
              {team2}
            </div>
          </div>
          <div className="hidden lg:block ml-4 flex-1">
             <p className="text-xs font-medium text-gray-400 capitalize truncate max-w-sm">{matchStatus}</p>
          </div>
        </div>

        <div className="flex-1 max-w-xs md:ml-auto">
          <div className="flex justify-between text-xs font-bold mb-2">
            <span className="text-gray-400">WIN PROBABILITY</span>
            <span className="text-[#D6FF5C]">{team1} 68%</span>
          </div>
          <div className="h-8 w-full bg-black/40 rounded-lg overflow-hidden relative">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dummyGraphData}>
                <YAxis domain={[0, 100]} hide />
                <Line type="monotone" dataKey="value" stroke="#D6FF5C" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </header>

      {/* AI Narrative Section */}
      <AnimatePresence>
        {narrative && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <div className="glass-panel p-6 border-l-4 border-l-[#D6FF5C] rounded-r-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                 <Zap className="w-16 h-16" />
               </div>
               <div className="flex items-center gap-2 mb-2">
                 <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D6FF5C] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D6FF5C]"></span>
                 </span>
                 <span className="text-[10px] font-mono tracking-widest uppercase text-[#D6FF5C]">AI Match Storyline</span>
               </div>
               <p className="text-lg font-medium leading-relaxed max-w-4xl relative z-10">{narrative}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Main Center Challenge */}
        <div className="lg:col-span-2">
          <div className="glass-panel-heavy rounded-3xl p-8 relative overflow-hidden border-[#D6FF5C]/20 shadow-[0_0_50px_rgba(214,255,92,0.05)] min-h-[400px] flex flex-col">
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#D6FF5C]/10 blur-[100px] rounded-full"></div>
            
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-[#D6FF5C]/20 text-[#D6FF5C] border border-[#D6FF5C]/30 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                  <Activity className="w-3 h-3" /> Live Challenge
                </span>
                <span className="px-3 py-1 bg-[#1C5B48]/50 text-white border border-white/10 rounded-full text-xs font-bold uppercase tracking-wider">
                  {prediction?.difficulty || "Intermediate"}
                </span>
              </div>
              
              <div className="text-center">
                <span className="block text-[10px] text-gray-400 font-mono mb-1 uppercase tracking-widest">Potential</span>
                <span className="flex items-center gap-1 text-lg font-bold text-[#D6FF5C]">
                  <Zap className="w-4 h-4 fill-current" /> +{prediction?.xp || 120} XP
                </span>
              </div>
            </div>

            {loading || !prediction ? (
               <div className="flex-1 flex flex-col items-center justify-center opacity-50 relative z-10">
                 <RefreshCw className="w-10 h-10 animate-spin text-[#A4EBC5] mb-4" />
                 <p className="font-mono text-sm uppercase tracking-widest text-center">Syncing live context...<br/>Generating Challenge</p>
               </div>
            ) : (
               <AnimatePresence mode="wait">
                 <motion.div 
                   key={prediction.question}
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, y: -20 }}
                   className="flex-1 flex flex-col justify-center relative z-10"
                 >
                    <div className="text-center mb-10">
                      <h2 className="text-3xl sm:text-4xl font-display font-black uppercase tracking-tight">{prediction.question}</h2>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 mb-8">
                      {prediction.options && prediction.options.map((opt: string) => (
                        <button 
                          key={opt}
                          onClick={async () => {
                             setSelectedOpt(opt);
                             // Pseudo-evaluation: automatically win for demo UX
                             let xpGained = prediction.xp || 120;
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
                             
                             // wait a bit, then fetch new prediction
                             setTimeout(() => { 
                               setWinAnimation(null);
                               generateNewPrediction(); 
                             }, 3000);
                          }}
                          disabled={timeLeft <= 0 || selectedOpt !== null}
                          className={`
                            group relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 transform
                            ${selectedOpt === opt ? 'border-[#D6FF5C] bg-[#D6FF5C]/10 scale-105' : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'}
                            ${timeLeft <= 0 ? 'opacity-50 cursor-not-allowed' : ''}
                          `}
                        >
                          {selectedOpt === opt && (
                            <motion.div layoutId="selection-glow" className="absolute inset-0 bg-[#D6FF5C]/20 blur-xl" />
                          )}
                          <span className={`relative z-10 text-2xl font-display font-black uppercase ${selectedOpt === opt ? 'text-[#D6FF5C]' : 'text-white'}`}>
                            {opt}
                          </span>
                        </button>
                      ))}
                    </div>
                    
                    {winAnimation && (
                       <motion.div 
                         initial={{ opacity: 0, y: 10, scale: 0.9 }}
                         animate={{ opacity: 1, y: 0, scale: 1 }}
                         exit={{ opacity: 0, scale: 0.8 }}
                         className="absolute inset-0 bg-green-500/20 backdrop-blur-sm rounded-3xl flex items-center justify-center border border-green-500/50 z-20"
                       >
                         <div className="text-center">
                           <div className="w-16 h-16 bg-green-500 text-[#0B2E26] rounded-full mx-auto flex items-center justify-center mb-2 shadow-[0_0_30px_rgba(34,197,94,0.5)]">
                             <Zap className="w-8 h-8 fill-current" />
                           </div>
                           <div className="font-display font-black text-2xl text-white uppercase tracking-tight">{winAnimation}</div>
                           <div className="text-green-300 text-sm mt-1 mb-8">Excellent Call!</div>
                         </div>
                       </motion.div>
                    )}
                 </motion.div>
               </AnimatePresence>
            )}

            <div className="flex items-center justify-center gap-3 relative z-10 mt-auto pt-4">
               <Timer className={`w-6 h-6 ${timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-gray-400'}`} />
               <div className="w-48 h-2 bg-black/40 rounded-full overflow-hidden">
                 <motion.div 
                   className={`h-full rounded-full ${timeLeft <= 5 ? 'bg-red-500' : 'bg-[#D6FF5C]'}`}
                   initial={{ width: '100%' }}
                   animate={{ width: `${(timeLeft / 15) * 100}%` }}
                   transition={{ duration: 1, ease: 'linear' }}
                 />
               </div>
               <span className={`font-mono text-xl font-bold tabular-nums ${timeLeft <= 5 ? 'text-red-400' : 'text-white'}`}>
                 00:{Math.max(0, timeLeft).toString().padStart(2, '0')}
               </span>
            </div>
          </div>

          {/* Timeline */}
          <div className="mt-8 glass-panel rounded-2xl p-6">
            <h3 className="text-xs font-mono text-gray-400 font-bold mb-6 tracking-widest uppercase">History</h3>
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 -mx-2 px-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm bg-[#0B2E26]
                    ${i === 5 ? 'border-[#D6FF5C] text-[#D6FF5C] shadow-[0_0_15px_rgba(214,255,92,0.3)]' : 'border-[#1C5B48] text-gray-500'}
                  `}>
                    0.{i}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-6 relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#1C5B48] to-black border-2 border-[#D6FF5C] flex items-center justify-center overflow-hidden relative">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span className="font-display font-bold text-2xl absolute">Me</span>
                )}
              </div>
              <div>
                <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Rank #{profile?.rank || "---"}</div>
                <div className="text-2xl font-black font-display text-white">{profile?.accuracy || 0}% <span className="text-xs font-sans text-gray-500 font-normal">ACCURACY</span></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/30 rounded-xl p-4 border border-white/5 flex flex-col items-center justify-center">
                <span className="text-3xl mb-1">🔥</span>
                <span className="text-2xl font-black font-display text-white mb-0">{profile?.streak || 0}</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-widest">Streak</span>
              </div>
              <div className="bg-black/30 rounded-xl p-4 border border-white/5 flex flex-col items-center justify-center">
                <Trophy className="w-8 h-8 text-[#D6FF5C] mb-2" />
                <span className="text-2xl font-black font-display text-white mb-0">{profile?.xp || 0}</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-widest">Total XP</span>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {prediction?.insight && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel rounded-xl p-6 border-l-4 border-l-[#A4EBC5] relative overflow-hidden group hover:bg-white/5 transition-colors cursor-pointer"
              >
                 <div className="absolute top-0 right-0 p-4 opacity-5 bg-white mix-blend-overlay">
                   <ShieldAlert className="w-16 h-16" />
                 </div>
                 <h3 className="font-bold text-sm text-[#A4EBC5] flex items-center gap-2 uppercase tracking-wider mb-2">
                   <div className="w-2 h-2 rounded-full bg-[#A4EBC5] animate-pulse"></div>
                   AI Match Insight
                 </h3>
                 <p className="text-gray-300 text-sm leading-relaxed mb-4">
                   {prediction.insight}
                 </p>
                 <div className="text-xs font-bold text-white flex items-center gap-1 group-hover:text-[#D6FF5C] transition-colors">
                   Read Full Analysis <ChevronRight className="w-3 h-3" />
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {(!prediction || !prediction.insight) && (
             <div className="glass-panel rounded-xl p-6 border-l-4 border-l-[#A4EBC5] relative overflow-hidden group hover:bg-white/5 transition-colors cursor-pointer opacity-50">
               <h3 className="font-bold text-sm text-[#A4EBC5] flex items-center gap-2 uppercase tracking-wider mb-2">
                 <div className="w-2 h-2 rounded-full bg-[#A4EBC5] animate-pulse"></div>
                 AI Match Insight
               </h3>
               <p className="text-gray-300 text-sm leading-relaxed mb-4">
                 The current batsman struggles against slower bouncers under pressure. The bowler has increased variations by 40% in the last two overs.
               </p>
             </div>
          )}

        </div>

      </div>
    </div>
  );
}
