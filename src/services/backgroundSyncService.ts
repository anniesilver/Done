import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';
import { calendarImportService } from './calendarImportService';

// Background task name
export const CALENDAR_SYNC_TASK = 'CALENDAR_SYNC_BACKGROUND_TASK';

// Sync interval type
export type SyncInterval = 'manual' | 'hourly' | 'daily';

// Background sync result
export interface BackgroundSyncResult {
  success: boolean;
  eventsImported: number;
  error?: string;
}

/**
 * Define the background fetch task
 * This task will be executed by the system at the specified interval
 */
TaskManager.defineTask(CALENDAR_SYNC_TASK, async () => {
  try {
    console.log('[BackgroundSync] Starting background calendar sync...');

    // Get sync settings from AsyncStorage
    // Note: We can't access Zustand store directly in background tasks
    // In a real implementation, you'd need to load settings from AsyncStorage

    // For now, we'll return a placeholder
    // In production, implement full sync logic here
    console.log('[BackgroundSync] Background sync completed');

    return BackgroundFetch.BackgroundFetchResult.NewData;
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
   */
  async registerBackgroundSync(interval: SyncInterval): Promise<boolean> {
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

      // Check if already registered
      const isRegistered = await this.isTaskRegistered();

      // If already registered, unregister first to update interval
      if (isRegistered) {
        await this.unregisterBackgroundSync();
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

      if (!isRegistered) {
        console.log('[BackgroundSync] Task not registered, nothing to unregister');
        return true;
      }

      await BackgroundFetch.unregisterTaskAsync(CALENDAR_SYNC_TASK);
      console.log('[BackgroundSync] Background sync unregistered');
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
