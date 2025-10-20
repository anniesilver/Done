// Recurring tasks utility functions

import { Task, RecurrenceType } from '../types/task';
import { addDays, addWeeks, addMonths, addYears } from 'date-fns';

/**
 * Calculate the next due date based on recurrence pattern
 */
export const calculateNextDueDate = (
  currentDueDate: Date | null,
  recurrence: RecurrenceType
): Date | null => {
  if (!currentDueDate || recurrence === 'none') {
    return null;
  }

  const current = new Date(currentDueDate);

  switch (recurrence) {
    case 'daily':
      return addDays(current, 1);
    case 'weekly':
      return addWeeks(current, 1);
    case 'monthly':
      return addMonths(current, 1);
    case 'yearly':
      return addYears(current, 1);
    default:
      return null;
  }
};

/**
 * Create a new recurring instance from a completed task
 */
export const createRecurringInstance = (task: Task): Partial<Task> => {
  const nextDueDate = calculateNextDueDate(task.dueDate, task.recurrence);

  return {
    text: task.text,
    completed: false,
    dueDate: nextDueDate,
    reminderTime: nextDueDate ? calculateReminderTime(nextDueDate, task) : null,
    recurrence: task.recurrence,
    categoryId: task.categoryId,
    duration: task.duration,
    userId: task.userId,
  };
};

/**
 * Calculate reminder time for the new instance
 * Maintains the same time offset from due date as original
 */
const calculateReminderTime = (newDueDate: Date, originalTask: Task): Date | null => {
  if (!originalTask.reminderTime || !originalTask.dueDate) {
    return null;
  }

  // Calculate the offset in milliseconds
  const offset = originalTask.dueDate.getTime() - originalTask.reminderTime.getTime();

  // Apply same offset to new due date
  return new Date(newDueDate.getTime() - offset);
};
