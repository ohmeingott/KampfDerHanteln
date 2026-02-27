import { create } from 'zustand';
import { signInWithPopup, signOut, onAuthStateChanged, type User } from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../lib/firebase';

interface DemoUser {
  uid: string;
  displayName: string | null;
  email: string | null;
}

type AppUser = User | DemoUser;

interface AuthState {
  user: AppUser | null;
  loading: boolean;
  isDemo: boolean;
  login: () => Promise<void>;
  loginDemo: () => void;
  logout: () => Promise<void>;
  init: () => () => void;
}

const DEMO_USER: DemoUser = {
  uid: 'demo-user',
  displayName: 'Demo User',
  email: 'demo@kampfderhanteln.de',
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  isDemo: false,

  login: async () => {
    if (!isFirebaseConfigured || !auth || !googleProvider) {
      // Fall back to demo mode
      set({ user: DEMO_USER, loading: false, isDemo: true });
      return;
    }
    await signInWithPopup(auth, googleProvider);
  },

  loginDemo: () => {
    set({ user: DEMO_USER, loading: false, isDemo: true });
  },

  logout: async () => {
    if (isFirebaseConfigured && auth) {
      await signOut(auth);
    }
    set({ user: null, isDemo: false });
  },

  init: () => {
    if (!isFirebaseConfigured || !auth) {
      // No Firebase: check if demo session was active
      set({ loading: false });
      return () => {};
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      set({ user, loading: false });
    });
    return unsubscribe;
  },
}));
