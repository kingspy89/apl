import { motion } from 'motion/react';
import { ArrowRight, Activity, Brain, Trophy, Zap, PlayCircle, BarChart3, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="relative isolate overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/2 -z-10 -translate-x-1/2 blur-3xl xl:-top-6" aria-hidden="true">
        <div className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-[#1C5B48] to-[#103B2F] opacity-30" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
      </div>

      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <DemoCTASection />
    </div>
  );
}

function HeroSection() {
  return (
    <div className="relative px-6 pt-14 lg:px-8 max-w-7xl mx-auto min-h-[90vh] flex items-center">
      <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
        {/* Left Content */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <div className="mb-6 inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold text-[#D6FF5C] ring-1 ring-[#D6FF5C]/30 bg-[#D6FF5C]/10 backdrop-blur-md">
            <span>v2.0 AI Engine Live</span>
            <ChevronRight className="ml-2 h-4 w-4" />
          </div>
          
          <h1 className="text-[60px] sm:text-[90px] lg:text-[110px] font-black italic leading-[0.85] uppercase tracking-tighter mb-4 drop-shadow-2xl">
            Predict <br/>
            <span className="text-[#D6FF5C]">
              Like A
            </span><br/>Pro
          </h1>
          
          <p className="mt-6 text-lg leading-8 text-gray-300 max-w-lg">
            Real-time AI-powered match predictions, adaptive coaching, streaks, and gamified rewards. The ultimate second-screen companion.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-6">
            <Link
              to="/live"
              className="bg-[#D6FF5C] text-[#0B2E26] px-10 py-5 rounded-tr-3xl rounded-bl-3xl font-black uppercase text-sm tracking-widest hover:brightness-110 transition-all w-full sm:w-auto text-center"
            >
              Start Predicting
            </Link>
            <Link to="/arcade" className="border-2 border-[#D6FF5C]/50 text-[#D6FF5C] px-10 py-5 rounded-tl-3xl rounded-br-3xl font-black uppercase text-sm tracking-widest hover:bg-[#D6FF5C] hover:text-[#0B2E26] transition-all w-full sm:w-auto text-center">
              Play Arcade Mode
            </Link>
          </div>
        </motion.div>

        {/* Right Content - Floating UI Cards */}
        <div className="relative w-full h-[600px] hidden lg:block">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#1C5B48]/20 to-transparent rounded-full filter blur-3xl"></div>
          
          {/* Main Prediction Card */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[420px] aspect-[4/5] bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] p-8 flex flex-col shadow-2xl z-20"
          >
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-[10px] font-bold text-[#D6FF5C] uppercase tracking-[0.2em] mb-1">Live Momentum</p>
                <h3 className="text-2xl font-black tracking-tight">LIVE <span className="opacity-40 font-medium">MATCH</span></h3>
              </div>
              <div className="bg-white/10 px-3 py-2 rounded-xl text-center">
                <p className="text-[8px] uppercase font-bold opacity-50">Current Streak</p>
                <p className="text-xl font-black text-[#D6FF5C]">🔥 12</p>
              </div>
            </div>
            
            <div className="flex-1 flex flex-col justify-center">
              <p className="text-sm italic opacity-70 mb-4">Next Over Challenge</p>
              <h4 className="text-3xl font-bold leading-tight mb-8">
                Will the batting team score more than 10 runs in this over?
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <button className="group relative p-6 bg-[#103B2F] border border-white/5 rounded-2xl text-left hover:bg-[#1C5B48] transition-all overflow-hidden">
                  <div className="relative z-10">
                    <p className="text-xs font-bold opacity-50 uppercase mb-1">Choice A</p>
                    <p className="text-xl font-bold">YES</p>
                    <p className="text-[10px] mt-2 text-[#D6FF5C]">+120 XP Reward</p>
                  </div>
                  <div className="absolute right-[-10px] bottom-[-10px] text-4xl opacity-5 group-hover:opacity-10 transition-opacity font-black">A</div>
                </button>
                <button className="group relative p-6 bg-[#103B2F] border border-white/5 rounded-2xl text-left hover:bg-[#1C5B48] transition-all overflow-hidden">
                  <div className="relative z-10">
                    <p className="text-xs font-bold opacity-50 uppercase mb-1">Choice B</p>
                    <p className="text-xl font-bold">NO</p>
                    <p className="text-[10px] mt-2 text-[#D6FF5C]">+85 XP Reward</p>
                  </div>
                  <div className="absolute right-[-10px] bottom-[-10px] text-4xl opacity-5 group-hover:opacity-10 transition-opacity font-black">B</div>
                </button>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="flex items-center gap-3 bg-[#D6FF5C]/5 p-3 rounded-2xl">
                <div className="w-8 h-8 rounded-lg bg-[#D6FF5C] flex items-center justify-center shrink-0">
                  <Brain className="w-5 h-5 text-[#0B2E26]" />
                </div>
                <p className="text-[11px] leading-snug font-medium italic">
                  <span className="text-[#D6FF5C] font-bold not-italic tracking-tighter">AI COACH: </span> 
                  Zampa is bowling wide lines. Kohli's boundary rate drops 22% against leg-spin outside off-stump.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Floating Elements */}
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute top-20 right-10 glass-panel rounded-xl p-4 w-48 z-10"
          >
            <div className="flex items-center gap-3 mb-2">
              <Brain className="w-5 h-5 text-[#A4EBC5]" />
              <span className="text-xs font-bold text-gray-300">AI TIP</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">Fast bowlers are pitching short 60% of the time in this over.</p>
          </motion.div>

          <motion.div
            animate={{ y: [0, 20, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-20 left-10 glass-panel rounded-xl p-4 w-56 z-30"
          >
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs font-bold text-gray-300">WIN PROBABILITY</span>
              <span className="text-sm font-bold text-[#D6FF5C]">68%</span>
            </div>
            <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden">
              <div className="h-full bg-[#D6FF5C] w-[68%] rounded-full"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function HowItWorksSection() {
  const steps = [
    { title: 'Watch Live', desc: 'Sync up with any major live sports broadcast.', icon: PlayCircle },
    { title: 'Predict', desc: 'Answer micro-predictions powered by live match data.', icon: Activity },
    { title: 'AI Adapts', desc: 'Our engine adjusts difficulty based on your skill level.', icon: Brain }
  ];

  return (
    <div className="py-24 sm:py-32 bg-[#05110E] relative border-t border-white/5">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-base font-semibold leading-7 text-[#A4EBC5] uppercase tracking-widest font-mono">Process</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight font-display sm:text-5xl uppercase">How It Works</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting Line */}
          <div className="hidden md:block absolute top-[45px] left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

          {steps.map((step, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="relative flex flex-col items-center text-center p-6 glass-panel rounded-2xl group hover:-translate-y-2 transition-transform duration-300"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#103B2F] border border-white/10 flex items-center justify-center mb-6 relative z-10 group-hover:bg-[#1C5B48] group-hover:border-[#D6FF5C]/30 transition-colors">
                <step.icon className="w-8 h-8 text-[#A4EBC5]" />
              </div>
              <h3 className="text-xl font-bold mb-3 font-display">{step.title}</h3>
              <p className="text-sm text-gray-400">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FeaturesSection() {
  const features = [
    { name: 'Real-Time Predictions', icon: Zap },
    { name: 'AI Match Coach', icon: Brain },
    { name: 'Adaptive Difficulty', icon: Activity },
    { name: 'XP & Rewards', icon: Trophy },
    { name: 'Global Leaderboards', icon: BarChart3 },
    { name: 'Second Screen Companion', icon: PlayCircle },
  ];

  return (
    <div className="py-24 sm:py-32 relative">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-black font-display uppercase tracking-tight mb-6">Unfair Advantage <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D6FF5C] to-[#3AA981]">For Smart Fans</span></h2>
            <p className="text-gray-400 mb-10 text-lg">We don't just show you stats. We gamify your sports knowledge, testing your intuition against our real-time AI engine.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((feature, i) => (
                <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-[#D6FF5C]/20 transition-colors group cursor-default">
                  <div className="p-2 rounded-lg bg-[#103B2F] group-hover:bg-[#1C5B48]">
                    <feature.icon className="w-5 h-5 text-[#A4EBC5]" />
                  </div>
                  <span className="font-semibold text-sm">{feature.name}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative">
            <div className="aspect-square rounded-full bg-[#1C5B48]/20 absolute blur-3xl -inset-4"></div>
            <div className="relative glass-panel-heavy rounded-3xl p-8 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#D6FF5C]/10 blur-2xl"></div>
              <h3 className="font-mono text-[#D6FF5C] text-xs font-bold tracking-widest mb-4 uppercase">System Architecture</h3>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="h-16 rounded-xl bg-[#0B2E26] border border-[#1C5B48] flex items-center px-4 gap-4"
                  >
                    <div className="w-8 h-8 rounded bg-[#1C5B48] animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-2 w-1/3 bg-white/20 rounded"></div>
                      <div className="h-2 w-1/2 bg-white/10 rounded"></div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DemoCTASection() {
  return (
    <div className="py-24 relative overflow-hidden bg-[#05110E] border-t border-white/5">
      <div className="absolute inset-0 flex justify-center items-center opacity-10">
        <div className="w-[800px] h-[800px] border-[100px] border-[#D6FF5C] rounded-full blur-[100px]"></div>
      </div>
      
      <div className="relative mx-auto max-w-4xl px-6 text-center z-10">
        <h2 className="text-4xl sm:text-6xl font-black font-display uppercase tracking-tight text-white mb-8">
          Ready to become a <br/>
          <span className="glow-text text-[#D6FF5C]">smarter fan?</span>
        </h2>
        <Link
          to="/arcade"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#D6FF5C] px-10 py-5 text-lg font-bold text-[#0B2E26] shadow-xl hover:bg-[#c4eb4b] transition-all hover:scale-105"
        >
          Play Arcade Mode
          <PlayCircle className="w-6 h-6" />
        </Link>
      </div>
    </div>
  );
}
