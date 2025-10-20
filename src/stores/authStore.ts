// Auth store using Zustand

import { create } from 'zustand';
import { authService } from '../services/supabaseService';
import type { User, SignUpCredentials, SignInCredentials, AuthState } from '../types/user';

interface AuthStore extends AuthState {
  // Actions
  signUp: (credentials: SignUpCredentials) => Promise<void>;
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  setUser: (user: User | null) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  // State
  user: null,
  isLoading: false,
  error: null,

  // Actions
  signUp: async (credentials: SignUpCredentials) => {
    set({ isLoading: true, error: null });

    const { user, error } = await authService.signUp(credentials);

    if (error) {
      set({ isLoading: false, error });
      return;
    }

    set({ user, isLoading: false, error: null });
  },

  signIn: async (credentials: SignInCredentials) => {
    set({ isLoading: true, error: null });

    const { user, error } = await authService.signIn(credentials);

    if (error) {
      set({ isLoading: false, error });
      return;
    }

    set({ user, isLoading: false, error: null });
  },

  signOut: async () => {
    set({ isLoading: true, error: null });

    const { error } = await authService.signOut();

    if (error) {
      set({ isLoading: false, error });
      return;
    }

    set({ user: null, isLoading: false, error: null });
  },

  getCurrentUser: async () => {
    set({ isLoading: true, error: null });

    const { user, error } = await authService.getCurrentUser();

    if (error) {
      set({ isLoading: false, error });
      return;
    }

    set({ user, isLoading: false, error: null });
  },

  setUser: (user: User | null) => {
    set({ user });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },
}));

// Initialize auth state on app start
authService.onAuthStateChange((user) => {
  useAuthStore.getState().setUser(user);
});
