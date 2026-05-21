import { create } from 'zustand';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';

interface AuthState {
  user: User | null;
  profile: any | null;
  loading: boolean;
  // init returns a cleanup function to unsubscribe listeners
  init: () => () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: true,
  init: () => {
    let unsubSnapshot: (() => void) | null = null;
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        set({ user });
        const userRef = doc(db, 'users', user.uid);
        if (unsubSnapshot) {
          try { unsubSnapshot(); } catch (e) { /* ignore */ }
          unsubSnapshot = null;
        }
        unsubSnapshot = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            set({ profile: docSnap.data(), loading: false });
          } else {
            set({ profile: null, loading: false });
          }
        });
      } else {
        set({ user: null, profile: null, loading: false });
        if (unsubSnapshot) {
          try { unsubSnapshot(); } catch (e) { /* ignore */ }
          unsubSnapshot = null;
        }
      }
    });

    // return cleanup function
    return () => {
      try { unsubAuth(); } catch (e) { /* ignore */ }
      if (unsubSnapshot) {
        try { unsubSnapshot(); } catch (e) { /* ignore */ }
      }
    };
  }
}));
