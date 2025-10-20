// App Constants

export const APP_NAME = 'Done';
export const APP_VERSION = '1.0.0';

// Time intervals for tasks (in minutes)
export const TIME_INTERVALS = [
  15, 30, 45, 60, 90, 120, 180, 240, 300, 360, 420, 480
];

// Task durations (in minutes) - simple array of numbers
export const TASK_DURATIONS = [0, 15, 30, 45, 60, 90, 120, 180, 240];

// Recurrence options - simple array of strings
export const RECURRENCE_OPTIONS = ['none', 'daily', 'weekly', 'monthly', 'yearly'];

// Reminder options - simple array of string labels
export const REMINDER_OPTIONS = [
  'No reminder',
  'At time of event',
  '5 minutes before',
  '15 minutes before',
  '30 minutes before',
  '1 hour before',
  '2 hours before',
  '1 day before',
  '2 days before',
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
