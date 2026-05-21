import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Send, User, ChevronRight, Activity, Zap, RefreshCw } from 'lucide-react';

export default function AiCoachPage() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('Tactical Analyst');
  const [debateMode, setDebateMode] = useState(false);
  const [currentLiveMatch, setCurrentLiveMatch] = useState('Loading live matches...');
  const [geminiEnabled, setGeminiEnabled] = useState<boolean | null>(null);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hey there. I am your AI Cricket Brain. I can analyze match momentum, debate your predictions, or simulate "what if" scenarios. What would you like to know?' }
  ]);

  const agents = ['Tactical Analyst', 'Casual Fan', 'Meme Lord', 'Fantasy Guru'];

  React.useEffect(() => {
    // fetch match list and gemini status in parallel
    Promise.all([
      fetch('/api/matches').then(r => r.json()).catch(() => null),
      fetch('/api/status').then(r => r.json()).catch(() => null)
    ]).then(([matchesData, statusData]) => {
      try {
        if (matchesData && matchesData.data && matchesData.data.length > 0) {
          const live = matchesData.data.find((m: any) => m.matchStarted && !m.matchEnded);
          if (live) setCurrentLiveMatch(live.name);
          else setCurrentLiveMatch(matchesData.data[0].name);
        } else {
          setCurrentLiveMatch('No active matches');
        }
      } catch (e) {
        setCurrentLiveMatch('Match data unavailable');
      }

      try {
        if (statusData && typeof statusData.gemini !== 'undefined') setGeminiEnabled(!!statusData.gemini);
        else setGeminiEnabled(false);
      } catch (e) {
        setGeminiEnabled(false);
      }
    });
  }, []);

  const handleSend = async (e?: React.FormEvent, predefinedMessage?: string) => {
    if (e) e.preventDefault();
    const userMessage = predefinedMessage || input;
    if (!userMessage.trim() || loading) return;
    
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    if (!predefinedMessage) setInput('');
    setLoading(true);
    
    try {
      const res = await fetch('/api/coach', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ message: userMessage, context: { currentMatch: currentLiveMatch, userAccuracy: "Unknown", agentMode: selectedAgent, debateMode } })
      });
      const data = await res.json();
      // Prefer structured response when available
      let assistantText = data.response || "Sorry, I couldn't process that. Could you rephrase?";
      if (data.structured) {
        const s = data.structured;
        // Compose a friendly assistant message combining fields
        const parts = [];
        if (s.text) parts.push(s.text);
        if (s.explanation) parts.push(`Explanation: ${s.explanation}`);
        if (s.coach_tip) parts.push(`Coach Tip: ${s.coach_tip}`);
        if (s.suggested_actions) parts.push(`Suggested: ${Array.isArray(s.suggested_actions) ? s.suggested_actions.join('; ') : s.suggested_actions}`);
        assistantText = parts.join('\n\n');
      }

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: assistantText
      }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: "Network error fetching Coach.AI response." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 px-6 max-w-6xl mx-auto min-h-screen pb-20 flex flex-col md:flex-row gap-8">
      
      {/* Sidebar - Context & Stats */}
      <div className="w-full md:w-80 space-y-6">
        <div className="glass-panel-heavy rounded-3xl p-6 border border-[#D6FF5C]/30 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#D6FF5C]/20 blur-2xl rounded-full"></div>
          
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-[#0B2E26] border border-[#1C5B48] flex items-center justify-center">
              <Brain className="w-6 h-6 text-[#D6FF5C]" />
            </div>
            <div>
              <h2 className="font-display font-black text-xl uppercase tracking-tight">Coach.AI</h2>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs font-mono text-[#A4EBC5] tracking-widest uppercase">
                  <div className="w-2 h-2 rounded-full bg-[#D6FF5C] animate-pulse"></div>
                  Active Analysis
                </div>
                <div className="text-xs font-mono uppercase tracking-widest">
                  <span className={`px-2 py-1 rounded-md ${geminiEnabled ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'}`}>{geminiEnabled ? 'Gemini: Enabled' : 'Demo Mode'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 relative z-10">
            <div className="p-3 rounded-xl bg-black/40 border border-white/5">
               <div className="text-[10px] text-gray-400 font-mono tracking-widest uppercase mb-1">Focus Area</div>
               <div className="text-sm font-bold flex items-center justify-between">
                 Spin Reading <span className="text-red-400 font-mono">-12% acc</span>
               </div>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-white/5">
               <div className="text-[10px] text-gray-400 font-mono tracking-widest uppercase mb-1">Current Match</div>
               <div className="text-sm font-bold flex items-center justify-between">
                 <span className="truncate min-w-0 mr-2">{currentLiveMatch}</span>
                 <span className="text-[#D6FF5C] font-mono flex-shrink-0">LIVE</span>
               </div>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 hidden md:block">
           <h3 className="font-mono text-xs font-bold text-gray-400 tracking-widest uppercase mb-4">Select AI Agent</h3>
           <div className="flex flex-col gap-2 mb-6">
             {agents.map((agent) => (
                <button
                  key={agent}
                  onClick={() => setSelectedAgent(agent)}
                  className={`w-full text-left p-3 rounded-xl border transition-colors text-sm font-bold flex justify-between items-center ${
                    selectedAgent === agent
                      ? 'bg-[#D6FF5C]/10 border-[#D6FF5C] text-[#D6FF5C]'
                      : 'bg-white/5 border-white/5 text-white hover:bg-white/10'
                  }`}
                >
                  {agent}
                  {selectedAgent === agent && <Zap className="w-4 h-4" />}
                </button>
             ))}
           </div>

           <div className="mb-6 p-4 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
             <div>
               <div className="text-sm font-bold text-white">Debate Mode</div>
               <div className="text-xs text-gray-400 mt-1">AI will actively disagree with you</div>
             </div>
             <button 
               onClick={() => setDebateMode(!debateMode)}
               className={`w-12 h-6 rounded-full relative transition-colors ${debateMode ? 'bg-[#D6FF5C]' : 'bg-gray-600'}`}
             >
               <motion.div 
                 animate={{ x: debateMode ? 24 : 2 }}
                 className={`w-5 h-5 rounded-full absolute top-0.5 ${debateMode ? 'bg-[#0B2E26]' : 'bg-white'}`}
               />
             </button>
           </div>

           <h3 className="font-mono text-xs font-bold text-gray-400 tracking-widest uppercase mb-4">Quick Actions</h3>
           <div className="space-y-2">
             {['What if Kohli gets out?', 'Explain the momentum shift', 'Debate my prediction', 'Simulate the final over'].map((btn) => (
               <button 
                 key={btn} 
                 onClick={() => handleSend(undefined, btn)}
                 disabled={loading}
                 className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[#D6FF5C]/30 transition-colors text-sm flex justify-between items-center group"
               >
                 {btn}
                 <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-[#D6FF5C]" />
               </button>
             ))}
           </div>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 glass-panel rounded-3xl flex flex-col h-[calc(100vh-8rem)]">
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar flex flex-col">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border ${msg.role === 'assistant' ? 'bg-[#103B2F] border-[#1C5B48]' : 'bg-[#D6FF5C] border-[#D6FF5C]'}`}>
                  {msg.role === 'assistant' ? <Brain className="w-5 h-5 text-[#A4EBC5]" /> : <User className="w-5 h-5 text-[#0B2E26]" />}
                </div>
                <div className={`max-w-[80%] rounded-2xl p-5 ${msg.role === 'assistant' ? 'bg-black/40 border border-white/5 text-gray-200 shadow-xl' : 'bg-[#1C5B48] text-white shadow-xl'}`}>
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  {msg.role === 'assistant' && i === 0 && (
                    <div className="mt-4 flex gap-2">
                      <button 
                        onClick={() => handleSend(undefined, "Analyze my recent predictions")} 
                        disabled={loading}
                        className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold transition-colors"
                      >
                        Analyze my inputs
                      </button>
                      <button 
                        onClick={() => handleSend(undefined, "Explain defensive field setups")} 
                        className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold transition-colors"
                      >
                        Field Setups
                      </button>
                    </div>
                  )}
                  {msg.role === 'assistant' && i > 0 && (
                    <div className="mt-3 flex items-center gap-1 text-[10px] uppercase tracking-widest font-mono text-[#D6FF5C]">
                       <Zap className="w-3 h-3" /> Tactical Insight Generated
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            {loading && (
               <motion.div 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="flex gap-4"
               >
                <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border bg-[#103B2F] border-[#1C5B48]">
                  <Brain className="w-5 h-5 text-[#A4EBC5]" />
                </div>
                <div className="rounded-2xl p-5 bg-black/40 border border-white/5 text-gray-200 flex items-center gap-3">
                   <RefreshCw className="w-4 h-4 animate-spin text-[#D6FF5C]" />
                   <span className="text-sm font-mono tracking-widest uppercase text-xs text-[#D6FF5C]">Thinking...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input area */}
        <div className="p-4 border-t border-white/5 bg-black/20 rounded-b-3xl">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              placeholder="Ask Coach.AI about tactics, predictions, or stats..."
              className="w-full bg-[#05110E] border border-white/10 focus:border-[#D6FF5C]/50 outline-none rounded-2xl py-4 pl-5 pr-14 text-sm text-[#F4F6F5] placeholder:text-gray-500 transition-colors disabled:opacity-50"
            />
            <button 
              type="submit"
              disabled={loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-[#D6FF5C] flex items-center justify-center text-[#0B2E26] hover:bg-[#c4eb4b] transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4 ml-1" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
