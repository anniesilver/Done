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
    if (!user) return;

    set({ isLoading: true, error: null });

    const { categories, error } = await categoryService.getCategories(user.id);

    if (error) {
      set({ isLoading: false, error });
      return;
    }

    set({ categories: categories || [], isLoading: false });
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
