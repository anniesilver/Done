// Calendar Sync store using Zustand

import { create } from 'zustand';
import { calendarImportService, CalendarInfo, CalendarSyncResult } from '../services/calendarImportService';
import { calendarPermissionService, CalendarPermissionStatus } from '../services/calendarPermissionService';
import { useAuthStore } from './authStore';
import { useTaskStore } from './taskStore';

export interface CalendarSyncState {
  // Permission state
  permissionStatus: CalendarPermissionStatus | null;

  // Available calendars
  availableCalendars: CalendarInfo[];
  selectedCalendarIds: string[];

  // Sync state
  isSyncing: boolean;
  lastSyncTime: Date | null;
  syncError: string | null;

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
  syncError: null,
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
      // Import events as tasks
      const result = await calendarImportService.importEventsAsTasks(
        selectedCalendarIds,
        user.id,
        daysAhead,
        importedEventIds
      );

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
      // Quick sync from default calendars
      const result = await calendarImportService.quickSync(user.id, importedEventIds);

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
}));
