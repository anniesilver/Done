// Calendar Sync store using Zustand

import { create } from 'zustand';
import { calendarImportService, CalendarInfo, CalendarSyncResult } from '../services/calendarImportService';
import { calendarPermissionService, CalendarPermissionStatus } from '../services/calendarPermissionService';
// Background sync disabled - using manual sync only
// import { backgroundSyncService, SyncInterval } from '../services/backgroundSyncService';
import { useAuthStore } from './authStore';
import { useTaskStore } from './taskStore';
import { useCategoryStore } from './categoryStore';
import { PHONE_CALENDAR_CATEGORY } from '../config/constants';

// Type for sync interval (kept for store state compatibility)
export type SyncInterval = 'manual' | 'hourly' | 'daily';

export interface CalendarSyncState {
  // Permission state
  permissionStatus: CalendarPermissionStatus | null;

  // Available calendars
  availableCalendars: CalendarInfo[];
  selectedCalendarIds: string[];

  // Sync state
  isSyncing: boolean;
  lastSyncTime: Date | null;
  lastBackgroundSyncTime: Date | null;
  syncError: string | null;

  // Background sync settings
  syncInterval: SyncInterval;
  isBackgroundSyncEnabled: boolean;

  // Sync tracking (for deduplication)
  importedEventIds: Set<string>;

  // Statistics
  totalEventsImported: number;
}

interface CalendarSyncStore extends CalendarSyncState {
  // Permission actions
  checkPermissions: () => Promise<void>;
  requestPermissions: () => Promise<boolean>;

  // Calendar management
  loadAvailableCalendars: () => Promise<void>;
  setSelectedCalendarIds: (calendarIds: string[]) => void;
  toggleCalendarSelection: (calendarId: string) => void;
  selectAllCalendars: () => void;
  deselectAllCalendars: () => void;

  // Sync actions
  syncCalendars: (daysAhead?: number) => Promise<CalendarSyncResult>;
  quickSync: () => Promise<CalendarSyncResult>;

  // Background sync actions
  setSyncInterval: (interval: SyncInterval) => Promise<boolean>;
  enableBackgroundSync: (interval: SyncInterval) => Promise<boolean>;
  disableBackgroundSync: () => Promise<boolean>;
  checkBackgroundSyncStatus: () => Promise<void>;
  loadLastBackgroundSyncTime: () => Promise<void>;

  // Utilities
  clearSyncError: () => void;
  resetSyncState: () => void;
  addImportedEventId: (eventId: string) => void;
  addImportedEventIds: (eventIds: string[]) => void;
}

export const useCalendarSyncStore = create<CalendarSyncStore>((set, get) => ({
  // Initial state
  permissionStatus: null,
  availableCalendars: [],
  selectedCalendarIds: [],
  isSyncing: false,
  lastSyncTime: null,
  lastBackgroundSyncTime: null,
  syncError: null,
  syncInterval: 'manual',
  isBackgroundSyncEnabled: false,
  importedEventIds: new Set<string>(),
  totalEventsImported: 0,

  // Permission actions
  checkPermissions: async () => {
    try {
      const status = await calendarPermissionService.getCalendarPermissionStatus();
      set({ permissionStatus: status });
    } catch (error) {
      console.error('Error checking permissions:', error);
      set({
        permissionStatus: {
          granted: false,
          canAskAgain: false,
          status: 'denied' as any
        }
      });
    }
  },

  requestPermissions: async () => {
    try {
      const status = await calendarPermissionService.requestCalendarPermissions();
      set({ permissionStatus: status });
      return status.granted;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      set({
        permissionStatus: {
          granted: false,
          canAskAgain: false,
          status: 'denied' as any
        }
      });
      return false;
    }
  },

  // Calendar management
  loadAvailableCalendars: async () => {
    try {
      const calendars = await calendarImportService.getAvailableCalendars();
      set({ availableCalendars: calendars });

      // Auto-select default calendars if none selected
      const { selectedCalendarIds } = get();
      if (selectedCalendarIds.length === 0 && calendars.length > 0) {
        const defaultIds = await calendarImportService.getDefaultCalendarIds();
        set({ selectedCalendarIds: defaultIds });
      }
    } catch (error) {
      console.error('Error loading calendars:', error);
      set({ syncError: 'Failed to load available calendars' });
    }
  },

  setSelectedCalendarIds: (calendarIds: string[]) => {
    set({ selectedCalendarIds: calendarIds });
  },

  toggleCalendarSelection: (calendarId: string) => {
    const { selectedCalendarIds } = get();
    const isSelected = selectedCalendarIds.includes(calendarId);

    if (isSelected) {
      set({ selectedCalendarIds: selectedCalendarIds.filter((id) => id !== calendarId) });
    } else {
      set({ selectedCalendarIds: [...selectedCalendarIds, calendarId] });
    }
  },

  selectAllCalendars: () => {
    const { availableCalendars } = get();
    set({ selectedCalendarIds: availableCalendars.map((cal) => cal.id) });
  },

  deselectAllCalendars: () => {
    set({ selectedCalendarIds: [] });
  },

  // Helper to get or create the phone calendar category
  getOrCreatePhoneCalendarCategory: async (): Promise<number | null> => {
    const categoryStore = useCategoryStore.getState();
    const user = useAuthStore.getState().user;

    console.log('[CalendarSync] Getting or creating phone calendar category...');

    if (!user) {
      console.error('[CalendarSync] User not authenticated');
      return null;
    }

    // Ensure categories are loaded
    if (categoryStore.categories.length === 0) {
      console.log('[CalendarSync] Categories not loaded, fetching...');
      await categoryStore.fetchCategories();
    }

    // Check if phone calendar category already exists
    const existingCategory = categoryStore.categories.find(
      (cat) => cat.name === PHONE_CALENDAR_CATEGORY.name
    );

    if (existingCategory) {
      console.log('[CalendarSync] Phone calendar category already exists with ID:', existingCategory.id);
      return existingCategory.id;
    }

    // Create the phone calendar category
    console.log('[CalendarSync] Creating phone calendar category...');
    try {
      const { categoryService } = await import('../services/supabaseService');
      const { category, error } = await categoryService.createCategory(user.id, PHONE_CALENDAR_CATEGORY);

      if (error || !category) {
        console.error('[CalendarSync] Failed to create category:', error);
        return null;
      }

      console.log('[CalendarSync] Phone calendar category created with ID:', category.id);

      // Update the category store with the new category
      categoryStore.setCategories([...categoryStore.categories, category]);

      return category.id;
    } catch (error) {
      console.error('[CalendarSync] Error creating phone calendar category:', error);
      return null;
    }
  },

  // Sync actions
  syncCalendars: async (daysAhead: number = 30) => {
    const { selectedCalendarIds, importedEventIds } = get();
    const user = useAuthStore.getState().user;

    if (!user) {
      const error = 'User not authenticated';
      set({ syncError: error });
      return {
        success: false,
        eventsImported: 0,
        tasksCreated: [],
        errors: [error],
      };
    }

    if (selectedCalendarIds.length === 0) {
      const error = 'No calendars selected';
      set({ syncError: error });
      return {
        success: false,
        eventsImported: 0,
        tasksCreated: [],
        errors: [error],
      };
    }

    set({ isSyncing: true, syncError: null });

    try {
      // Get or create the phone calendar category
      const phoneCalendarCategoryId = await get().getOrCreatePhoneCalendarCategory();

      if (!phoneCalendarCategoryId) {
        const error = 'Failed to create phone calendar category';
        set({ isSyncing: false, syncError: error });
        return {
          success: false,
          eventsImported: 0,
          tasksCreated: [],
          errors: [error],
        };
      }

      // Load already-imported event IDs from database
      const { taskService } = await import('../services/supabaseService');
      const { eventIds: dbEventIds } = await taskService.getImportedEventIds(user.id, 'iphone_calendar');

      // Merge database IDs with in-memory IDs
      const allImportedEventIds = new Set([...importedEventIds, ...dbEventIds]);

      // Import events as tasks
      const result = await calendarImportService.importEventsAsTasks(
        selectedCalendarIds,
        user.id,
        daysAhead,
        allImportedEventIds
      );

      // Assign phone calendar category to all imported tasks
      result.tasksCreated.forEach((task) => {
        task.categoryId = phoneCalendarCategoryId;
      });

      if (!result.success) {
        set({
          isSyncing: false,
          syncError: result.errors.join(', '),
        });
        return result;
      }

      // Create tasks in database
      const taskStore = useTaskStore.getState();
      const newEventIds: string[] = [];

      for (const taskInput of result.tasksCreated) {
        try {
          await taskStore.addTask(taskInput);
          if (taskInput.sourceEventId) {
            newEventIds.push(taskInput.sourceEventId);
          }
        } catch (error) {
          console.error('Error creating task from event:', error);
          result.errors.push(`Failed to create task: ${taskInput.text}`);
        }
      }

      // Update imported event IDs
      get().addImportedEventIds(newEventIds);

      set({
        isSyncing: false,
        lastSyncTime: new Date(),
        totalEventsImported: get().totalEventsImported + result.eventsImported,
        syncError: result.errors.length > 0 ? result.errors.join(', ') : null,
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during sync';
      set({
        isSyncing: false,
        syncError: errorMessage,
      });

      return {
        success: false,
        eventsImported: 0,
        tasksCreated: [],
        errors: [errorMessage],
      };
    }
  },

  quickSync: async () => {
    const { importedEventIds } = get();
    const user = useAuthStore.getState().user;

    if (!user) {
      const error = 'User not authenticated';
      set({ syncError: error });
      return {
        success: false,
        eventsImported: 0,
        tasksCreated: [],
        errors: [error],
      };
    }

    set({ isSyncing: true, syncError: null });

    try {
      // Get or create the phone calendar category
      const phoneCalendarCategoryId = await get().getOrCreatePhoneCalendarCategory();

      if (!phoneCalendarCategoryId) {
        const error = 'Failed to create phone calendar category';
        set({ isSyncing: false, syncError: error });
        return {
          success: false,
          eventsImported: 0,
          tasksCreated: [],
          errors: [error],
        };
      }

      // Load already-imported event IDs from database
      const { taskService } = await import('../services/supabaseService');
      const { eventIds: dbEventIds } = await taskService.getImportedEventIds(user.id, 'iphone_calendar');

      // Merge database IDs with in-memory IDs
      const allImportedEventIds = new Set([...importedEventIds, ...dbEventIds]);

      // Quick sync from default calendars
      const result = await calendarImportService.quickSync(user.id, allImportedEventIds);

      // Assign phone calendar category to all imported tasks
      result.tasksCreated.forEach((task) => {
        task.categoryId = phoneCalendarCategoryId;
      });

      if (!result.success) {
        set({
          isSyncing: false,
          syncError: result.errors.join(', '),
        });
        return result;
      }

      // Create tasks in database
      const taskStore = useTaskStore.getState();
      const newEventIds: string[] = [];

      for (const taskInput of result.tasksCreated) {
        try {
          await taskStore.addTask(taskInput);
          if (taskInput.sourceEventId) {
            newEventIds.push(taskInput.sourceEventId);
          }
        } catch (error) {
          console.error('Error creating task from event:', error);
          result.errors.push(`Failed to create task: ${taskInput.text}`);
        }
      }

      // Update imported event IDs
      get().addImportedEventIds(newEventIds);

      set({
        isSyncing: false,
        lastSyncTime: new Date(),
        totalEventsImported: get().totalEventsImported + result.eventsImported,
        syncError: result.errors.length > 0 ? result.errors.join(', ') : null,
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during sync';
      set({
        isSyncing: false,
        syncError: errorMessage,
      });

      return {
        success: false,
        eventsImported: 0,
        tasksCreated: [],
        errors: [errorMessage],
      };
    }
  },

  // Utilities
  clearSyncError: () => {
    set({ syncError: null });
  },

  resetSyncState: () => {
    set({
      selectedCalendarIds: [],
      lastSyncTime: null,
      syncError: null,
      importedEventIds: new Set<string>(),
      totalEventsImported: 0,
    });
  },

  addImportedEventId: (eventId: string) => {
    const { importedEventIds } = get();
    const newSet = new Set(importedEventIds);
    newSet.add(eventId);
    set({ importedEventIds: newSet });
  },

  addImportedEventIds: (eventIds: string[]) => {
    const { importedEventIds } = get();
    const newSet = new Set(importedEventIds);
    eventIds.forEach((id) => newSet.add(id));
    set({ importedEventIds: newSet });
  },

  // Background sync actions - DISABLED (using manual sync only)
  // These methods are kept as stubs to avoid breaking any potential callers
  setSyncInterval: async (interval: SyncInterval) => {
    console.log('[CalendarSync] Background sync disabled - using manual sync only');
    set({
      syncInterval: 'manual',
      isBackgroundSyncEnabled: false,
    });
    return false;
  },

  enableBackgroundSync: async (interval: SyncInterval) => {
    console.log('[CalendarSync] Background sync disabled - using manual sync only');
    set({
      syncInterval: 'manual',
      isBackgroundSyncEnabled: false,
    });
    return false;
  },

  disableBackgroundSync: async () => {
    console.log('[CalendarSync] Background sync disabled - using manual sync only');
    set({
      syncInterval: 'manual',
      isBackgroundSyncEnabled: false,
    });
    return true;
  },

  checkBackgroundSyncStatus: async () => {
    console.log('[CalendarSync] Background sync disabled - using manual sync only');
    set({ isBackgroundSyncEnabled: false });
  },

  loadLastBackgroundSyncTime: async () => {
    console.log('[CalendarSync] Background sync disabled - using manual sync only');
    set({ lastBackgroundSyncTime: null });
  },
}));
