// Timer store for task timer functionality

import { create } from 'zustand';

interface TimerStore {
  // State
  minutes: number;
  seconds: number;
  isRunning: boolean;
  interval: NodeJS.Timeout | null;

  // Actions
  start: () => void;
  pause: () => void;
  reset: () => void;
  setPreset: (minutes: number) => void;
  tick: () => void;
}

export const useTimerStore = create<TimerStore>((set, get) => ({
  // State
  minutes: 0,
  seconds: 0,
  isRunning: false,
  interval: null,

  // Actions
  start: () => {
    const { isRunning, interval: existingInterval } = get();

    if (isRunning) return;

    // Clear any existing interval
    if (existingInterval) {
      clearInterval(existingInterval);
    }

    const interval = setInterval(() => {
      get().tick();
    }, 1000);

    set({ isRunning: true, interval });
  },

  pause: () => {
    const { interval } = get();

    if (interval) {
      clearInterval(interval);
    }

    set({ isRunning: false, interval: null });
  },

  reset: () => {
    const { interval } = get();

    if (interval) {
      clearInterval(interval);
    }

    set({
      minutes: 0,
      seconds: 0,
      isRunning: false,
      interval: null
    });
  },

  setPreset: (minutes: number) => {
    const { interval } = get();

    if (interval) {
      clearInterval(interval);
    }

    set({
      minutes,
      seconds: 0,
      isRunning: false,
      interval: null
    });
  },

  tick: () => {
    const { minutes, seconds } = get();

    if (seconds > 0) {
      set({ seconds: seconds - 1 });
    } else if (minutes > 0) {
      set({ minutes: minutes - 1, seconds: 59 });
    } else {
      // Timer finished
      get().pause();
      // TODO: Play sound or show notification
    }
  },
}));
