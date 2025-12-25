// Category store using Zustand

import { create } from 'zustand';
import { Category, CreateCategoryInput } from '../types/category';
import { categoryService } from '../services/supabaseService';
import { useAuthStore } from './authStore';
import { DEFAULT_CATEGORIES } from '../config/constants';

interface CategoryStore {
  // State
  categories: Category[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchCategories: () => Promise<void>;
  addCategory: (input: CreateCategoryInput) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  createDefaultCategories: () => Promise<void>;

  // Utilities
  setCategories: (categories: Category[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useCategoryStore = create<CategoryStore>((set) => ({
  // State
  categories: [],
  isLoading: false,
  error: null,

  // Actions
  fetchCategories: async () => {
    const user = useAuthStore.getState().user;
    if (!user) {
      console.log('[CategoryStore] No user found, skipping fetch');
      return;
    }

    console.log('[CategoryStore] Fetching categories for user:', user.id);
    set({ isLoading: true, error: null });

    try {
      const { categories, error } = await categoryService.getCategories(user.id);

      if (error) {
        console.error('[CategoryStore] Error fetching categories:', error);
        set({ isLoading: false, error });
        return;
      }

      console.log('[CategoryStore] Successfully fetched', categories?.length || 0, 'categories');
      set({ categories: categories || [], isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error fetching categories';
      console.error('[CategoryStore] Network error fetching categories:', errorMessage);
      set({ isLoading: false, error: errorMessage });
    }
  },

  addCategory: async (input: CreateCategoryInput) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    set({ isLoading: true, error: null });

    const { category, error } = await categoryService.createCategory(user.id, input);

    if (error) {
      set({ isLoading: false, error });
      return;
    }

    if (category) {
      set((state) => ({
        categories: [...state.categories, category],
        isLoading: false,
      }));
    }
  },

  deleteCategory: async (id: number) => {
    set({ isLoading: true, error: null });

    const { error } = await categoryService.deleteCategory(id);

    if (error) {
      set({ isLoading: false, error });
      return;
    }

    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
      isLoading: false,
    }));
  },

  createDefaultCategories: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    set({ isLoading: true, error: null });

    // Create all default categories
    for (const defaultCategory of DEFAULT_CATEGORIES) {
      await categoryService.createCategory(user.id, defaultCategory);
    }

    // Fetch all categories after creation
    const { categories, error } = await categoryService.getCategories(user.id);

    if (error) {
      set({ isLoading: false, error });
      return;
    }

    set({ categories: categories || [], isLoading: false });
  },

  // Utilities
  setCategories: (categories: Category[]) => set({ categories }),
  setLoading: (isLoading: boolean) => set({ isLoading }),
  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),
}));
