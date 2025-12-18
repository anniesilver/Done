import * as Calendar from 'expo-calendar';
import { CreateTaskInput, RecurrenceType } from '../types/task';

/**
 * Event to Task Mapper Utility
 * Converts calendar events to task objects
 */

/**
 * Calculate duration in minutes between start and end dates
 */
function calculateDuration(startDate: Date, endDate: Date): number {
  const durationMs = endDate.getTime() - startDate.getTime();
  const durationMinutes = Math.round(durationMs / (1000 * 60));

  // Return duration, max 240 minutes (4 hours) as per app constants
  return Math.min(Math.max(durationMinutes, 0), 240);
}

/**
 * Parse recurrence rule to simple recurrence type
 * For Phase 1, we'll only support simple recurrence patterns
 * Complex RRULE patterns will be imported as one-time events
 *
 * Note: On iOS, recurrenceRule is an object with a 'frequency' property
 * On Android, it might be an RRULE string
 */
function parseRecurrenceRule(recurrenceRule: any): RecurrenceType {
  if (!recurrenceRule) {
    return 'none';
  }

  // iOS: recurrenceRule is an object with frequency property
  if (typeof recurrenceRule === 'object' && recurrenceRule.frequency !== undefined) {
    const frequency = recurrenceRule.frequency;

    // iOS Calendar.Frequency enum values
    switch (frequency) {
      case Calendar.Frequency.DAILY:
      case 'daily':
        return 'daily';
      case Calendar.Frequency.WEEKLY:
      case 'weekly':
        return 'weekly';
      case Calendar.Frequency.MONTHLY:
      case 'monthly':
        return 'monthly';
      case Calendar.Frequency.YEARLY:
      case 'yearly':
        return 'yearly';
      default:
        return 'none';
    }
  }

  // Android/String format: RRULE string
  if (typeof recurrenceRule === 'string') {
    const rule = recurrenceRule.toUpperCase();

    if (rule.includes('FREQ=DAILY')) {
      return 'daily';
    }
    if (rule.includes('FREQ=WEEKLY')) {
      return 'weekly';
    }
    if (rule.includes('FREQ=MONTHLY')) {
      return 'monthly';
    }
    if (rule.includes('FREQ=YEARLY')) {
      return 'yearly';
    }
  }

  // For complex patterns or unknown formats, import as one-time event
  return 'none';
}

/**
 * Get the earliest alarm time from event alarms
 * Returns null if no alarms exist
 */
function getEarliestAlarmTime(
  event: Calendar.Event,
  startDate: Date
): Date | null {
  if (!event.alarms || event.alarms.length === 0) {
    return null;
  }

  let earliestMinutes = Infinity;

  for (const alarm of event.alarms) {
    // relativeOffset is in minutes, negative means before the event
    if (alarm.relativeOffset !== undefined && alarm.relativeOffset !== null) {
      const minutesBefore = Math.abs(alarm.relativeOffset);
      if (minutesBefore < earliestMinutes) {
        earliestMinutes = minutesBefore;
      }
    }
  }

  if (earliestMinutes === Infinity) {
    return null;
  }

  // Calculate reminder time
  const reminderTime = new Date(startDate.getTime() - earliestMinutes * 60 * 1000);
  return reminderTime;
}

/**
 * Map calendar event to task input
 * @param event Calendar event from expo-calendar
 * @param userId User ID to associate the task with
 * @param categoryId Optional category ID to assign (can be mapped from calendar)
 * @returns Task creation input
 */
export function mapEventToTask(
  event: Calendar.Event,
  userId: string,
  categoryId: number | null = null
): CreateTaskInput {
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);

  // Calculate duration
  const duration = calculateDuration(startDate, endDate);

  // Parse recurrence
  const recurrence = parseRecurrenceRule(event.recurrenceRule);

  // Get earliest reminder time
  const reminderTime = getEarliestAlarmTime(event, startDate);

  // Create task input
  const taskInput: CreateTaskInput = {
    text: event.title || 'Untitled Event',
    completed: false, // Imported events are not completed by default
    dueDate: startDate,
    reminderTime,
    recurrence,
    categoryId,
    duration,
    sourceType: 'iphone_calendar',
    // Use originalId for recurring events (parent event ID), fallback to id for non-recurring
    // This ensures we track the parent recurring event, not individual instances
    sourceEventId: event.originalId || event.id,
    syncedAt: new Date(),
  };

  return taskInput;
}

/**
 * Map multiple calendar events to task inputs
 * @param events Array of calendar events
 * @param userId User ID
 * @param categoryId Optional category ID
 * @returns Array of task creation inputs
 */
export function mapEventsToTasks(
  events: Calendar.Event[],
  userId: string,
  categoryId: number | null = null
): CreateTaskInput[] {
  return events.map((event) => mapEventToTask(event, userId, categoryId));
}

/**
 * Filter out all-day events (optional helper)
 * All-day events might not make sense as tasks with specific times
 */
export function filterAllDayEvents(events: Calendar.Event[]): Calendar.Event[] {
  return events.filter((event) => !event.allDay);
}

/**
 * Filter events by date range
 * @param events Array of events
 * @param startDate Start of date range
 * @param endDate End of date range
 */
export function filterEventsByDateRange(
  events: Calendar.Event[],
  startDate: Date,
  endDate: Date
): Calendar.Event[] {
  return events.filter((event) => {
    const eventStart = new Date(event.startDate);
    return eventStart >= startDate && eventStart <= endDate;
  });
}
