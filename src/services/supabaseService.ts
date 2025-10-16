// Supabase service for all backend operations

import { supabase } from '../config/supabase';
import type { User, SignUpCredentials, SignInCredentials } from '../types/user';

// ==================== AUTH METHODS ====================

export const authService = {
  /**
   * Sign up a new user
   */
  async signUp(credentials: SignUpCredentials): Promise<{ user: User | null; error: string | null }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (!data.user) {
        return { user: null, error: 'Failed to create user' };
      }

      const user: User = {
        id: data.user.id,
        email: data.user.email!,
        createdAt: new Date(data.user.created_at),
      };

      return { user, error: null };
    } catch (error) {
      return { user: null, error: (error as Error).message };
    }
  },

  /**
   * Sign in an existing user
   */
  async signIn(credentials: SignInCredentials): Promise<{ user: User | null; error: string | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (!data.user) {
        return { user: null, error: 'Failed to sign in' };
      }

      const user: User = {
        id: data.user.id,
        email: data.user.email!,
        createdAt: new Date(data.user.created_at),
      };

      return { user, error: null };
    } catch (error) {
      return { user: null, error: (error as Error).message };
    }
  },

  /**
   * Sign out the current user
   */
  async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      return { error: (error as Error).message };
    }
  },

  /**
   * Get the currently authenticated user
   */
  async getCurrentUser(): Promise<{ user: User | null; error: string | null }> {
    try {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        return { user: null, error: error.message };
      }

      if (!data.user) {
        return { user: null, error: null };
      }

      const user: User = {
        id: data.user.id,
        email: data.user.email!,
        createdAt: new Date(data.user.created_at),
      };

      return { user, error: null };
    } catch (error) {
      return { user: null, error: (error as Error).message };
    }
  },

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (user: User | null) => void) {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const user: User = {
          id: session.user.id,
          email: session.user.email!,
          createdAt: new Date(session.user.created_at),
        };
        callback(user);
      } else {
        callback(null);
      }
    });

    return data.subscription;
  },
};

// Task service methods will be added in Phase 1.2
// Category service methods will be added in Phase 1.2
