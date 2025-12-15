import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';

export interface CalendarPermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
  status: Calendar.PermissionStatus;
}

/**
 * Calendar Permission Service
 * Handles requesting and checking calendar permissions
 */
class CalendarPermissionService {
  /**
   * Request calendar read permissions from the user
   * @returns Permission status object
   */
  async requestCalendarPermissions(): Promise<CalendarPermissionStatus> {
    try {
      // Calendar permissions are only needed on iOS and Android
      if (Platform.OS === 'web') {
        return {
          granted: false,
          canAskAgain: false,
          status: Calendar.PermissionStatus.DENIED,
        };
      }

      const { status, canAskAgain } = await Calendar.requestCalendarPermissionsAsync();

      return {
        granted: status === Calendar.PermissionStatus.GRANTED,
        canAskAgain: canAskAgain ?? true,
        status,
      };
    } catch (error) {
      console.error('Error requesting calendar permissions:', error);
      throw new Error('Failed to request calendar permissions');
    }
  }

  /**
   * Check current calendar permission status without requesting
   * @returns Current permission status
   */
  async getCalendarPermissionStatus(): Promise<CalendarPermissionStatus> {
    try {
      if (Platform.OS === 'web') {
        return {
          granted: false,
          canAskAgain: false,
          status: Calendar.PermissionStatus.DENIED,
        };
      }

      const { status, canAskAgain } = await Calendar.getCalendarPermissionsAsync();

      return {
        granted: status === Calendar.PermissionStatus.GRANTED,
        canAskAgain: canAskAgain ?? true,
        status,
      };
    } catch (error) {
      console.error('Error checking calendar permissions:', error);
      throw new Error('Failed to check calendar permissions');
    }
  }

  /**
   * Check if calendar permissions are granted
   * @returns true if permissions are granted
   */
  async hasCalendarPermissions(): Promise<boolean> {
    const { granted } = await this.getCalendarPermissionStatus();
    return granted;
  }

  /**
   * Request permissions if not already granted
   * @returns true if permissions are granted (either already or after request)
   */
  async ensureCalendarPermissions(): Promise<boolean> {
    const currentStatus = await this.getCalendarPermissionStatus();

    if (currentStatus.granted) {
      return true;
    }

    if (!currentStatus.canAskAgain) {
      return false;
    }

    const newStatus = await this.requestCalendarPermissions();
    return newStatus.granted;
  }
}

// Export singleton instance
export const calendarPermissionService = new CalendarPermissionService();
