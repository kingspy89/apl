import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Trophy, Activity, MessageSquare, User, Play, ChevronRight, LogIn, Gamepad2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuthStore } from '../store/useAuthStore';

export default function Navbar() {
  const location = useLocation();
  const { user, profile } = useAuthStore();

  const links = [
    { name: 'Live Prediction', path: '/live', icon: Activity },
    { name: 'Arcade', path: '/arcade', icon: Gamepad2 },
    { name: 'AI Coach', path: '/coach', icon: MessageSquare },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 lg:px-12 py-6 lg:py-8 bg-[#0B2E26]/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-[#D6FF5C] flex items-center justify-center rounded-sm rotate-45 group-hover:scale-110 transition-transform relative z-10">
            <div className="w-6 h-6 border-2 border-[#103B2F] -rotate-45"></div>
          </div>
          <span className="text-2xl font-black tracking-tighter uppercase italic text-[#F4F6F5]">
            PredictPlay<span className="text-[#D6FF5C]">AI</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            const Icon = link.icon;
            
            return (
              <Link 
                key={link.path} 
                to={link.path}
                className={cn(
                  "relative flex items-center gap-2 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.2em] transition-colors",
                  isActive ? "text-[#D6FF5C]" : "text-[#F4F6F5]/70 hover:text-[#D6FF5C]"
                )}
              >
                <Icon className="w-4 h-4" />
                {link.name}
                {isActive && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute -bottom-[18px] left-0 right-0 h-0.5 bg-[#D6FF5C]"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="hidden lg:block text-right mr-2">
                <p className="text-[10px] opacity-50 uppercase tracking-widest text-[#F4F6F5]">Rank #34</p>
                <p className="text-sm font-bold tracking-tight text-[#D6FF5C] capitalize">Level {profile?.level || 1} Fanatic</p>
              </div>
              <Link 
                to="/demo"
                className="hidden sm:flex items-center gap-2 px-6 py-2 rounded-full border-2 border-[#D6FF5C]/30 text-[#D6FF5C] text-xs font-bold uppercase tracking-widest hover:bg-[#D6FF5C] hover:text-[#0B2E26] transition-all"
              >
                Demo Mode
              </Link>
              <Link to="/profile" className="w-12 h-12 rounded-full border-2 border-[#D6FF5C] p-1 cursor-pointer hover:scale-105 transition-transform overflow-hidden">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full rounded-full bg-[#1C5B48] flex items-center justify-center font-bold text-[#F4F6F5]">
                    {user.displayName?.charAt(0) || "U"}
                  </div>
                )}
              </Link>
            </>
          ) : (
             <Link 
               to="/profile"
               className="flex items-center gap-2 px-6 py-2 rounded-full border-2 border-[#D6FF5C] text-[#0B2E26] bg-[#D6FF5C] text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all font-mono"
             >
               <LogIn className="w-4 h-4" /> Sign In
             </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
