import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { calendarImportService } from './calendarImportService';

// Background task name
export const CALENDAR_SYNC_TASK = 'CALENDAR_SYNC_BACKGROUND_TASK';

// AsyncStorage keys
const STORAGE_KEYS = {
  USER_ID: '@calendar_sync/user_id',
  CALENDAR_IDS: '@calendar_sync/calendar_ids',
  SYNC_INTERVAL: '@calendar_sync/sync_interval',
  LAST_BACKGROUND_SYNC: '@calendar_sync/last_background_sync',
};

// Sync interval type
export type SyncInterval = 'manual' | 'hourly' | 'daily';

// Background sync result
export interface BackgroundSyncResult {
  success: boolean;
  eventsImported: number;
  error?: string;
}

// Background sync settings
export interface BackgroundSyncSettings {
  userId: string;
  calendarIds: string[];
  syncInterval: SyncInterval;
}

/**
 * Define the background fetch task
 * This task will be executed by the system at the specified interval
 */
TaskManager.defineTask(CALENDAR_SYNC_TASK, async () => {
  try {
    console.log('[BackgroundSync] Starting background calendar sync...');

    // Load sync settings from AsyncStorage
    const userIdStr = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
    const calendarIdsStr = await AsyncStorage.getItem(STORAGE_KEYS.CALENDAR_IDS);

    if (!userIdStr || !calendarIdsStr) {
      console.log('[BackgroundSync] No sync settings found, skipping sync');
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    const userId = userIdStr;
    const calendarIds: string[] = JSON.parse(calendarIdsStr);

    if (calendarIds.length === 0) {
      console.log('[BackgroundSync] No calendars selected, skipping sync');
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    console.log(`[BackgroundSync] Syncing ${calendarIds.length} calendars for user ${userId}`);

    // Load already-imported event IDs from database
    const { taskService } = await import('./supabaseService');
    const { eventIds: dbEventIds } = await taskService.getImportedEventIds(userId, 'iphone_calendar');
    const existingEventIds = new Set(dbEventIds);

    // Import events as tasks
    const result = await calendarImportService.importEventsAsTasks(
      calendarIds,
      userId,
      30, // 30 days ahead
      existingEventIds
    );

    if (!result.success) {
      console.error('[BackgroundSync] Sync failed:', result.errors);
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }

    // Create tasks in database
    // Note: We can't use useTaskStore directly in background tasks
    // We need to import and use the taskService directly
    let tasksCreated = 0;
    for (const taskInput of result.tasksCreated) {
      try {
        await taskService.createTask(taskInput);
        tasksCreated++;
      } catch (error) {
        console.error('[BackgroundSync] Error creating task:', error);
      }
    }

    console.log(`[BackgroundSync] Sync completed: ${tasksCreated} tasks created from ${result.eventsImported} events`);

    // Save last background sync timestamp
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_BACKGROUND_SYNC, new Date().toISOString());

    return tasksCreated > 0
      ? BackgroundFetch.BackgroundFetchResult.NewData
      : BackgroundFetch.BackgroundFetchResult.NoData;
  } catch (error) {
    console.error('[BackgroundSync] Background sync failed:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

/**
 * Background Sync Service
 * Manages background calendar synchronization
 */
class BackgroundSyncService {
  /**
   * Save sync settings to AsyncStorage
   */
  async saveSyncSettings(settings: BackgroundSyncSettings): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.USER_ID, settings.userId],
        [STORAGE_KEYS.CALENDAR_IDS, JSON.stringify(settings.calendarIds)],
        [STORAGE_KEYS.SYNC_INTERVAL, settings.syncInterval],
      ]);
      console.log('[BackgroundSync] Sync settings saved to AsyncStorage');
    } catch (error) {
      console.error('[BackgroundSync] Error saving sync settings:', error);
      throw error;
    }
  }

  /**
   * Load sync settings from AsyncStorage
   */
  async loadSyncSettings(): Promise<BackgroundSyncSettings | null> {
    try {
      const values = await AsyncStorage.multiGet([
        STORAGE_KEYS.USER_ID,
        STORAGE_KEYS.CALENDAR_IDS,
        STORAGE_KEYS.SYNC_INTERVAL,
      ]);

      const userId = values[0][1];
      const calendarIdsStr = values[1][1];
      const syncInterval = values[2][1] as SyncInterval;

      if (!userId || !calendarIdsStr || !syncInterval) {
        return null;
      }

      return {
        userId,
        calendarIds: JSON.parse(calendarIdsStr),
        syncInterval,
      };
    } catch (error) {
      console.error('[BackgroundSync] Error loading sync settings:', error);
      return null;
    }
  }

  /**
   * Clear sync settings from AsyncStorage
   */
  async clearSyncSettings(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_ID,
        STORAGE_KEYS.CALENDAR_IDS,
        STORAGE_KEYS.SYNC_INTERVAL,
        STORAGE_KEYS.LAST_BACKGROUND_SYNC,
      ]);
      console.log('[BackgroundSync] Sync settings cleared from AsyncStorage');
    } catch (error) {
      console.error('[BackgroundSync] Error clearing sync settings:', error);
    }
  }

  /**
   * Get the last background sync timestamp
   */
  async getLastBackgroundSyncTime(): Promise<Date | null> {
    try {
      const timestamp = await AsyncStorage.getItem(STORAGE_KEYS.LAST_BACKGROUND_SYNC);
      if (!timestamp) {
        return null;
      }
      return new Date(timestamp);
    } catch (error) {
      console.error('[BackgroundSync] Error getting last background sync time:', error);
      return null;
    }
  }

  /**
   * Check if the background task is registered
   */
  async isTaskRegistered(): Promise<boolean> {
    try {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(CALENDAR_SYNC_TASK);
      return isRegistered;
    } catch (error) {
      console.error('Error checking task registration:', error);
      return false;
    }
  }

  /**
   * Register the background sync task
   * @param interval Sync interval (hourly or daily)
   * @param userId User ID to sync for
   * @param calendarIds Calendar IDs to sync
   */
  async registerBackgroundSync(
    interval: SyncInterval,
    userId?: string,
    calendarIds?: string[]
  ): Promise<boolean> {
    try {
      // Background fetch is not supported on web
      if (Platform.OS === 'web') {
        console.log('[BackgroundSync] Background fetch not supported on web');
        return false;
      }

      // Manual sync - unregister background task
      if (interval === 'manual') {
        await this.unregisterBackgroundSync();
        return true;
      }

      // Validate required parameters for non-manual sync
      if (!userId || !calendarIds || calendarIds.length === 0) {
        console.error('[BackgroundSync] userId and calendarIds required for background sync');
        return false;
      }

      // Save sync settings to AsyncStorage
      await this.saveSyncSettings({
        userId,
        calendarIds,
        syncInterval: interval,
      });

      // Check if already registered
      const isRegistered = await this.isTaskRegistered();

      // If already registered, unregister first to update interval
      if (isRegistered) {
        await BackgroundFetch.unregisterTaskAsync(CALENDAR_SYNC_TASK);
      }

      // Calculate minimum interval in seconds
      const minimumInterval = interval === 'hourly' ? 60 * 60 : 60 * 60 * 24; // 1 hour or 24 hours

      // Register the background fetch task
      await BackgroundFetch.registerTaskAsync(CALENDAR_SYNC_TASK, {
        minimumInterval, // Minimum time between background fetches in seconds
        stopOnTerminate: false, // Continue running after app is terminated (Android)
        startOnBoot: true, // Start task on device boot (Android)
      });

      console.log(`[BackgroundSync] Background sync registered with ${interval} interval`);
      return true;
    } catch (error) {
      console.error('Error registering background sync:', error);
      return false;
    }
  }

  /**
   * Unregister the background sync task
   */
  async unregisterBackgroundSync(): Promise<boolean> {
    try {
      const isRegistered = await this.isTaskRegistered();

      if (isRegistered) {
        await BackgroundFetch.unregisterTaskAsync(CALENDAR_SYNC_TASK);
        console.log('[BackgroundSync] Background sync unregistered');
      } else {
        console.log('[BackgroundSync] Task not registered, nothing to unregister');
      }

      // Clear sync settings from AsyncStorage
      await this.clearSyncSettings();

      return true;
    } catch (error) {
      console.error('Error unregistering background sync:', error);
      return false;
    }
  }

  /**
   * Get the status of the background fetch task
   */
  async getBackgroundFetchStatus(): Promise<BackgroundFetch.BackgroundFetchStatus | null> {
    try {
      if (Platform.OS === 'web') {
        return null;
      }

      const status = await BackgroundFetch.getStatusAsync();
      return status;
    } catch (error) {
      console.error('Error getting background fetch status:', error);
      return null;
    }
  }

  /**
   * Check if background fetch is available on this device
   */
  async isBackgroundFetchAvailable(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        return false;
      }

      const status = await BackgroundFetch.getStatusAsync();
      return status === BackgroundFetch.BackgroundFetchStatus.Available;
    } catch (error) {
      console.error('Error checking background fetch availability:', error);
      return false;
    }
  }

  /**
   * Convert interval to human-readable string
   */
  getIntervalDescription(interval: SyncInterval): string {
    switch (interval) {
      case 'hourly':
        return 'Every hour';
      case 'daily':
        return 'Once per day';
      case 'manual':
        return 'Manual only';
      default:
        return 'Manual only';
    }
  }
}

// Export singleton instance
export const backgroundSyncService = new BackgroundSyncService();
