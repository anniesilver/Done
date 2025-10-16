// App Constants

export const APP_NAME = 'Done';
export const APP_VERSION = '1.0.0';

// Time intervals for tasks (in minutes)
export const TIME_INTERVALS = [
  15, 30, 45, 60, 90, 120, 180, 240, 300, 360, 420, 480
];

// Task durations (in minutes)
export const TASK_DURATIONS = [
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '1 hour', value: 60 },
  { label: '1.5 hours', value: 90 },
  { label: '2 hours', value: 120 },
  { label: '3 hours', value: 180 },
  { label: '4 hours', value: 240 },
];

// Recurrence options
export const RECURRENCE_OPTIONS = [
  { label: 'None', value: 'none' },
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
] as const;

// Reminder options (offset in minutes before due time)
export const REMINDER_OPTIONS = [
  { label: 'No reminder', value: null },
  { label: 'At due time', value: 0 },
  { label: '5 minutes before', value: 5 },
  { label: '15 minutes before', value: 15 },
  { label: '30 minutes before', value: 30 },
  { label: '1 hour before', value: 60 },
  { label: '1 day before', value: 1440 },
  { label: 'Custom', value: -1 }, // -1 indicates custom time picker
];

// Timer presets (in minutes)
export const TIMER_PRESETS = [30, 60, 120];

// Default categories for new users
export const DEFAULT_CATEGORIES = [
  { name: 'Work', icon: '💼' },
  { name: 'Personal', icon: '🏠' },
  { name: 'Health', icon: '💪' },
  { name: 'Learning', icon: '📚' },
  { name: 'Shopping', icon: '🛒' },
];

// Sync settings (for Phase 2)
export const SYNC_RETRY_DELAY = 5000; // 5 seconds
export const SYNC_MAX_RETRIES = 3;
export const SYNC_BATCH_SIZE = 50;

// Storage keys (for Phase 2)
export const STORAGE_KEYS = {
  TASKS: (userId: string) => `done_${userId}_tasks`,
  CATEGORIES: (userId: string) => `done_${userId}_categories`,
  SYNC_QUEUE: (userId: string) => `done_${userId}_sync_queue`,
  LAST_SYNC: (userId: string) => `done_${userId}_last_sync`,
  USER_SESSION: 'done_user_session',
};
