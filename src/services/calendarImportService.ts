import * as Calendar from 'expo-calendar';
import { calendarPermissionService } from './calendarPermissionService';
import { mapEventsToTasks, filterEventsByDateRange } from '../utils/eventToTaskMapper';
import { CreateTaskInput } from '../types/task';

export interface CalendarInfo {
  id: string;
  title: string;
  color: string;
  source: string;
  allowsModifications: boolean;
}

export interface CalendarSyncResult {
  success: boolean;
  eventsImported: number;
  tasksCreated: CreateTaskInput[];
  errors: string[];
}

/**
 * Calendar Import Service
 * Handles fetching and importing events from device calendars
 */
class CalendarImportService {
  /**
   * Get all available calendars on the device
   * @returns Array of calendar information
   */
  async getAvailableCalendars(): Promise<CalendarInfo[]> {
    try {
      // Ensure we have permissions
      const hasPermission = await calendarPermissionService.ensureCalendarPermissions();
      if (!hasPermission) {
        throw new Error('Calendar permissions not granted');
      }

      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);

      return calendars.map((cal) => ({
        id: cal.id,
        title: cal.title || 'Untitled Calendar',
        color: cal.color || '#000000',
        source: cal.source.name || 'Unknown',
        allowsModifications: cal.allowsModifications,
      }));
    } catch (error) {
      console.error('Error getting calendars:', error);
      throw new Error('Failed to fetch calendars');
    }
  }

  /**
   * Get events from specific calendars within a date range
   * @param calendarIds Array of calendar IDs to fetch from
   * @param startDate Start of date range
   * @param endDate End of date range
   * @returns Array of calendar events
   */
  async getEventsFromCalendars(
    calendarIds: string[],
    startDate: Date,
    endDate: Date
  ): Promise<Calendar.Event[]> {
    try {
      // Ensure we have permissions
      const hasPermission = await calendarPermissionService.hasCalendarPermissions();
      if (!hasPermission) {
        throw new Error('Calendar permissions not granted');
      }

      const events = await Calendar.getEventsAsync(calendarIds, startDate, endDate);

      return events;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw new Error('Failed to fetch calendar events');
    }
  }

  /**
   * Import events from calendars and convert to tasks
   * @param calendarIds Array of calendar IDs to import from
   * @param userId User ID to associate tasks with
   * @param daysAhead Number of days ahead to import (default: 30)
   * @param existingEventIds Set of already-imported event IDs for deduplication
   * @returns Sync result with tasks ready to create
   */
  async importEventsAsTasks(
    calendarIds: string[],
    userId: string,
    daysAhead: number = 30,
    existingEventIds: Set<string> = new Set()
  ): Promise<CalendarSyncResult> {
    const errors: string[] = [];
    const tasksCreated: CreateTaskInput[] = [];

    try {
      // Define date range
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + daysAhead);

      // Fetch events from selected calendars
      const events = await this.getEventsFromCalendars(calendarIds, startDate, endDate);

      // For recurring events, getEventsAsync returns multiple instances (one per occurrence)
      // We need to deduplicate by originalId (parent recurring event ID) to avoid importing
      // the same recurring event multiple times
      const uniqueEvents = new Map<string, Calendar.Event>();

      for (const event of events) {
        // Use originalId for recurring events, fallback to id for non-recurring
        const eventKey = event.originalId || event.id;

        // Skip if already imported
        if (existingEventIds.has(eventKey)) {
          continue;
        }

        // If we haven't seen this event yet, or if this is an earlier instance, keep it
        if (!uniqueEvents.has(eventKey)) {
          uniqueEvents.set(eventKey, event);
        }
      }

      const newEvents = Array.from(uniqueEvents.values());

      if (newEvents.length === 0) {
        return {
          success: true,
          eventsImported: 0,
          tasksCreated: [],
          errors: [],
        };
      }

      // Filter events within date range (extra safety)
      const filteredEvents = filterEventsByDateRange(newEvents, startDate, endDate);

      // Map events to tasks
      const tasks = mapEventsToTasks(filteredEvents, userId);

      return {
        success: true,
        eventsImported: filteredEvents.length,
        tasksCreated: tasks,
        errors,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      errors.push(errorMessage);

      return {
        success: false,
        eventsImported: 0,
        tasksCreated,
        errors,
      };
    }
  }

  /**
   * Get default calendars (usually the primary calendar for each source)
   * @returns Array of default calendar IDs
   */
  async getDefaultCalendarIds(): Promise<string[]> {
    try {
      const calendars = await this.getAvailableCalendars();

      // Filter to get primary calendars (usually have "Calendar" in the title or are the first per source)
      const sourceMap = new Map<string, CalendarInfo>();

      for (const cal of calendars) {
        if (!sourceMap.has(cal.source)) {
          sourceMap.set(cal.source, cal);
        }
      }

      return Array.from(sourceMap.values()).map((cal) => cal.id);
    } catch (error) {
      console.error('Error getting default calendars:', error);
      return [];
    }
  }

  /**
   * Quick sync: Import from default calendars
   * @param userId User ID
   * @param existingEventIds Set of already-imported event IDs
   * @returns Sync result
   */
  async quickSync(
    userId: string,
    existingEventIds: Set<string> = new Set()
  ): Promise<CalendarSyncResult> {
    try {
      const defaultCalendarIds = await this.getDefaultCalendarIds();

      if (defaultCalendarIds.length === 0) {
        return {
          success: false,
          eventsImported: 0,
          tasksCreated: [],
          errors: ['No calendars found on device'],
        };
      }

      return await this.importEventsAsTasks(defaultCalendarIds, userId, 30, existingEventIds);
    } catch (error) {
      return {
        success: false,
        eventsImported: 0,
        tasksCreated: [],
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }
}

// Export singleton instance
export const calendarImportService = new CalendarImportService();
