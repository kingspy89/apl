import { useState, useEffect } from 'react';
import { Activity, Star, Crosshair, Zap, Shield, HelpCircle, Trophy, Target, LogIn, Loader2 } from 'lucide-react';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch or create profile in Firestore
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          setProfileData(userSnap.data());
        } else {
          const newProfile = {
            displayName: currentUser.displayName,
            email: currentUser.email,
            photoURL: currentUser.photoURL,
            xp: 0,
            level: 1,
            badges: [],
            accuracy: 0,
            streak: 0,
            joinedAt: new Date().toISOString()
          };
          await setDoc(userRef, newProfile);
          setProfileData(newProfile);
        }
      } else {
        setProfileData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Sign in failed", error);
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
       console.error("Sign out failed", error);
    }
  };

  if (loading) {
    return (
      <div className="pt-24 px-6 min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#D6FF5C]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="pt-24 px-6 max-w-6xl mx-auto min-h-screen flex items-center justify-center">
         <div className="glass-panel-heavy rounded-3xl p-10 max-w-md w-full text-center border-[#D6FF5C]/20 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5">
               <Shield className="w-48 h-48" />
             </div>
             <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-4 relative z-10">Fanatic Profile</h2>
             <p className="text-sm opacity-70 mb-8 relative z-10">Sign in to track your prediction accuracy, level up, and unlock elite badges.</p>
             <button 
               onClick={handleSignIn}
               className="w-full bg-[#D6FF5C] hover:bg-[#c4eb4b] text-[#0B2E26] font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-colors relative z-10"
             >
                <LogIn className="w-5 h-5" />
                Sign in with Google
             </button>
         </div>
      </div>
    );
  }

  const levelProgress = profileData?.xp ? (profileData.xp % 1000) / 1000 * 100 : 0;
  const nextLevelXp = Math.ceil((profileData?.xp || 1) / 1000) * 1000;

  return (
    <div className="pt-24 px-6 max-w-6xl mx-auto min-h-screen pb-20">
      <div className="grid md:grid-cols-12 gap-8">
        
        {/* Left Column - User Info */}
        <div className="md:col-span-4 space-y-6">
          <div className="glass-panel-heavy rounded-3xl p-8 border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] transition-opacity group-hover:opacity-10">
               <Shield className="w-48 h-48" />
            </div>
            
            <button onClick={handleSignOut} className="absolute top-4 left-4 text-[10px] uppercase tracking-widest opacity-50 hover:opacity-100 hover:text-red-400">Sign out</button>

            <div className="flex justify-center mb-6 relative mt-4">
              <div className="w-32 h-32 rounded-full border-4 border-[#D6FF5C] bg-gradient-to-tr from-[#1C5B48] to-[#0B2E26] overflow-hidden flex items-center justify-center text-4xl font-display font-black shadow-[0_0_30px_rgba(214,255,92,0.2)]">
                {user.photoURL ? <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : "ME"}
              </div>
              <div className="absolute -bottom-3 bg-[#D6FF5C] text-[#0B2E26] px-4 py-1 rounded-full text-xs font-bold font-mono border-2 border-[#0B2E26]">LVL {profileData?.level || 1}</div>
            </div>

            <h2 className="text-center text-2xl font-display font-black uppercase tracking-wide mb-1">{profileData?.displayName || "Anonymous Fanatic"}</h2>
            <p className="text-center text-gray-400 text-sm mb-6">Joined Season 1</p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-gray-400">NEXT LEVEL XP</span>
                  <span className="text-[#D6FF5C]">{profileData?.xp || 0} / {nextLevelXp}</span>
                </div>
                <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
                  <div className="h-full bg-[#D6FF5C] rounded-full shadow-[0_0_10px_rgba(214,255,92,0.8)] transition-all" style={{ width: `${levelProgress || 5}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6">
            <h3 className="font-mono text-xs font-bold text-gray-400 tracking-widest uppercase mb-4">Favorite IPL Team</h3>
            <div className="flex flex-wrap gap-2">
               {['CSK', 'DC', 'GT', 'KKR', 'LSG', 'MI', 'PBKS', 'RR', 'RCB', 'SRH'].map((team) => (
                 <button 
                    key={team}
                    onClick={async () => {
                       if (user && profileData) {
                          const updatedData = { ...profileData, favoriteIplTeam: team };
                          setProfileData(updatedData);
                          // Save to Firestore
                          await setDoc(doc(db, 'users', user.uid), { favoriteIplTeam: team }, { merge: true });
                       }
                    }}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-display font-bold transition-all ${
                      profileData?.favoriteIplTeam === team 
                        ? 'bg-[#D6FF5C] text-[#0B2E26] shadow-[0_0_15px_rgba(214,255,92,0.4)]' 
                        : 'bg-white/5 border border-white/10 hover:bg-white/10 text-white'
                    }`}
                  >
                    {team}
                  </button>
               ))}
            </div>
            {profileData?.favoriteIplTeam && (
               <p className="mt-4 text-xs text-gray-400">Match updates and UI will be optimized for your favorite team.</p>
            )}
          </div>
        </div>

        {/* Right Column - Stats & Badges */}
        <div className="md:col-span-8 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Global Rank', value: '#34', icon: Trophy, color: 'text-yellow-400' },
              { label: 'Accuracy', value: `${profileData?.accuracy || 0}%`, icon: Crosshair, color: 'text-blue-400' },
              { label: 'Best Streak', value: `${profileData?.streak || 0}`, icon: Activity, color: 'text-orange-400' },
              { label: 'Total XP', value: `${profileData?.xp || 0}`, icon: Zap, color: 'text-[#D6FF5C]' },
            ].map((stat, i) => (
              <div key={i} className="glass-panel rounded-2xl p-5 relative overflow-hidden group hover:bg-white/5 transition-colors">
                <stat.icon className={`w-8 h-8 ${stat.color} mb-3 opacity-80`} />
                <div className="text-2xl font-black font-display">{stat.value}</div>
                <div className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="glass-panel rounded-2xl p-6">
            <h3 className="font-mono text-xs font-bold text-gray-400 tracking-widest uppercase mb-6 flex justify-between items-center">
              <span>Skill Tree</span>
              <span className="text-[#D6FF5C] bg-[#D6FF5C]/10 px-2 py-1 rounded">+{Math.floor((profileData?.level || 1) / 5)} SP</span>
            </h3>
            
            <div className="grid sm:grid-cols-3 gap-4">
               {/* Skill cards */}
               <div className="p-4 rounded-xl border border-[#D6FF5C]/30 bg-[#D6FF5C]/5">
                 <div className="w-8 h-8 rounded-lg bg-[#D6FF5C] flex items-center justify-center mb-3">
                   <Target className="w-5 h-5 text-black" />
                 </div>
                 <h4 className="font-bold text-sm mb-1">Pace Analyst</h4>
                 <p className="text-xs text-gray-400">10% XP bonus on fast bowler predictions.</p>
                 <div className="mt-3 flex gap-1">
                   <div className="h-1 w-full bg-[#D6FF5C] rounded-full"></div>
                   <div className="h-1 w-full bg-[#D6FF5C] rounded-full"></div>
                   <div className="h-1 w-full bg-black/40 rounded-full"></div>
                 </div>
               </div>

               <div className="p-4 rounded-xl border border-white/10 bg-white/5 opacity-50 grayscale">
                 <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center mb-3">
                   <HelpCircle className="w-5 h-5 text-black" />
                 </div>
                 <h4 className="font-bold text-sm mb-1">Spin Wizard</h4>
                 <p className="text-xs text-gray-400">Unlock advanced spin predictions.</p>
                 <button className="mt-3 w-full py-1 rounded bg-white/10 text-xs font-bold hover:bg-white/20">Unlock (2 SP)</button>
               </div>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6">
            <h3 className="font-mono text-xs font-bold text-gray-400 tracking-widest uppercase mb-6">Recent Badges</h3>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {profileData?.badges && profileData.badges.length > 0 ? (
                 profileData.badges.map((badge: any, i: number) => (
                  <div key={i} className="flex-shrink-0 w-32 glass-panel rounded-xl p-4 flex flex-col items-center text-center">
                    <div className={`w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 mb-3 flex items-center justify-center border-2 border-white/20 shadow-lg`}>
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold text-sm leading-tight mb-1">{badge.name}</h4>
                    <p className="text-[10px] text-gray-400">{badge.desc}</p>
                  </div>
                 ))
              ) : (
                <div className="text-gray-500 text-sm italic py-4 w-full text-center">Play matches and make correct predictions to earn badges!</div>
              )}
              
              <div className="flex-shrink-0 w-32 rounded-xl p-4 border border-dashed border-white/20 flex flex-col items-center justify-center text-center opacity-50">
                 <div className="w-10 h-10 rounded-full bg-black/40 mb-2 flex items-center justify-center">
                   <Shield className="w-5 h-5" />
                 </div>
                 <span className="text-xs font-bold">More Locked</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
