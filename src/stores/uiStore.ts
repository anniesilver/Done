// UI store for app-wide UI state

import { create } from 'zustand';

type ViewType = 'today' | 'tasks' | 'calendar';
type CalendarViewMode = 'month' | 'week';

interface UIStore {
  // State
  currentView: ViewType;
  selectedDate: Date;
  selectedCategory: number | null;
  calendarViewMode: CalendarViewMode;

  // Actions
  setCurrentView: (view: ViewType) => void;
  setSelectedDate: (date: Date) => void;
  setSelectedCategory: (categoryId: number | null) => void;
  setCalendarViewMode: (mode: CalendarViewMode) => void;
  resetFilters: () => void;
}

export const useUiStore = create<UIStore>((set) => ({
  // State
  currentView: 'today',
  selectedDate: new Date(),
  selectedCategory: null,
  calendarViewMode: 'month',

  // Actions
  setCurrentView: (view: ViewType) => set({ currentView: view }),

  setSelectedDate: (date: Date) => set({ selectedDate: date }),

  setSelectedCategory: (categoryId: number | null) =>
    set({ selectedCategory: categoryId }),

  setCalendarViewMode: (mode: CalendarViewMode) =>
    set({ calendarViewMode: mode }),

  resetFilters: () =>
    set({
      selectedCategory: null,
      selectedDate: new Date(),
    }),
}));
