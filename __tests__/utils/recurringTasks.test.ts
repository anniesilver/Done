// Tests for recurring tasks utility functions

import {
  calculateNextDueDate,
  createRecurringInstance,
} from '../../src/utils/recurringTasks';
import { createMockTask } from '../utils/testHelpers';
import { RecurrenceType } from '../../src/types/task';

describe('recurringTasks', () => {
  describe('calculateNextDueDate', () => {
    it('should return null for non-recurring tasks', () => {
      // Arrange
      const dueDate = new Date('2024-10-19T10:00:00Z');

      // Act
      const result = calculateNextDueDate(dueDate, 'none');

      // Assert
      expect(result).toBeNull();
    });

    it('should return null if dueDate is null', () => {
      // Arrange & Act
      const result = calculateNextDueDate(null, 'daily');

      // Assert
      expect(result).toBeNull();
    });

    it('should calculate next due date for daily recurrence', () => {
      // Arrange
      const dueDate = new Date('2024-10-19T10:00:00Z');

      // Act
      const result = calculateNextDueDate(dueDate, 'daily');

      // Assert
      expect(result).toEqual(new Date('2024-10-20T10:00:00Z'));
    });

    it('should calculate next due date for weekly recurrence', () => {
      // Arrange
      const dueDate = new Date('2024-10-19T10:00:00Z'); // Saturday

      // Act
      const result = calculateNextDueDate(dueDate, 'weekly');

      // Assert
      expect(result).toEqual(new Date('2024-10-26T10:00:00Z')); // Next Saturday
    });

    it('should calculate next due date for monthly recurrence', () => {
      // Arrange
      const dueDate = new Date('2024-10-19T10:00:00Z');

      // Act
      const result = calculateNextDueDate(dueDate, 'monthly');

      // Assert
      expect(result).toEqual(new Date('2024-11-19T10:00:00Z'));
    });

    it('should calculate next due date for yearly recurrence', () => {
      // Arrange
      const dueDate = new Date('2024-10-19T10:00:00Z');

      // Act
      const result = calculateNextDueDate(dueDate, 'yearly');

      // Assert
      expect(result).toEqual(new Date('2025-10-19T10:00:00Z'));
    });

    it('should handle month-end dates correctly for monthly recurrence', () => {
      // Arrange - January 31st
      const dueDate = new Date('2024-01-31T10:00:00Z');

      // Act
      const result = calculateNextDueDate(dueDate, 'monthly');

      // Assert
      // February has 29 days in 2024 (leap year)
      // date-fns addMonths will handle this correctly
      expect(result?.getMonth()).toBe(1); // February (0-indexed)
    });

    it('should preserve time when calculating next due date', () => {
      // Arrange
      const dueDate = new Date('2024-10-19T14:30:00Z');

      // Act
      const resultDaily = calculateNextDueDate(dueDate, 'daily');
      const resultWeekly = calculateNextDueDate(dueDate, 'weekly');
      const resultMonthly = calculateNextDueDate(dueDate, 'monthly');

      // Assert - use UTC methods since dates are in UTC
      expect(resultDaily?.getUTCHours()).toBe(14);
      expect(resultDaily?.getUTCMinutes()).toBe(30);
      expect(resultWeekly?.getUTCHours()).toBe(14);
      expect(resultWeekly?.getUTCMinutes()).toBe(30);
      expect(resultMonthly?.getUTCHours()).toBe(14);
      expect(resultMonthly?.getUTCMinutes()).toBe(30);
    });
  });

  describe('createRecurringInstance', () => {
    it('should create a new task instance with next due date', () => {
      // Arrange
      const originalTask = createMockTask({
        id: 1,
        text: 'Daily Exercise',
        completed: true,
        dueDate: new Date('2024-10-19T07:00:00Z'),
        reminderTime: new Date('2024-10-19T06:30:00Z'), // 30 min before
        recurrence: 'daily',
        categoryId: 1,
        duration: 60,
        userId: 'user-123',
      });

      // Act
      const newInstance = createRecurringInstance(originalTask);

      // Assert
      expect(newInstance.text).toBe('Daily Exercise');
      expect(newInstance.completed).toBe(false);
      expect(newInstance.dueDate).toEqual(new Date('2024-10-20T07:00:00Z'));
      expect(newInstance.recurrence).toBe('daily');
      expect(newInstance.categoryId).toBe(1);
      expect(newInstance.duration).toBe(60);
      expect(newInstance.userId).toBe('user-123');
    });

    it('should maintain reminder time offset in new instance', () => {
      // Arrange
      const originalTask = createMockTask({
        id: 1,
        text: 'Weekly Meeting',
        dueDate: new Date('2024-10-19T10:00:00Z'),
        reminderTime: new Date('2024-10-19T09:00:00Z'), // 1 hour before
        recurrence: 'weekly',
      });

      // Act
      const newInstance = createRecurringInstance(originalTask);

      // Assert
      // Next due date should be 1 week later
      expect(newInstance.dueDate).toEqual(new Date('2024-10-26T10:00:00Z'));
      // Reminder should also be 1 hour before the new due date
      expect(newInstance.reminderTime).toEqual(new Date('2024-10-26T09:00:00Z'));
    });

    it('should preserve reminder offset for different reminder times', () => {
      // Arrange
      const originalTask = createMockTask({
        id: 1,
        text: 'Task with 1 day reminder',
        dueDate: new Date('2024-10-19T12:00:00Z'),
        reminderTime: new Date('2024-10-18T12:00:00Z'), // 1 day before
        recurrence: 'monthly',
      });

      // Act
      const newInstance = createRecurringInstance(originalTask);

      // Assert
      const newDueDate = newInstance.dueDate!;
      const newReminderTime = newInstance.reminderTime!;

      // Reminder should be 1 day (24 hours) before new due date
      const offset = newDueDate.getTime() - newReminderTime.getTime();
      expect(offset).toBe(24 * 60 * 60 * 1000); // 24 hours in milliseconds
    });

    it('should set reminderTime to null if original task has no reminder', () => {
      // Arrange
      const originalTask = createMockTask({
        id: 1,
        text: 'No reminder task',
        dueDate: new Date('2024-10-19T10:00:00Z'),
        reminderTime: null,
        recurrence: 'daily',
      });

      // Act
      const newInstance = createRecurringInstance(originalTask);

      // Assert
      expect(newInstance.reminderTime).toBeNull();
    });

    it('should handle tasks with no due date', () => {
      // Arrange
      const originalTask = createMockTask({
        id: 1,
        text: 'No due date task',
        dueDate: null,
        reminderTime: null,
        recurrence: 'daily',
      });

      // Act
      const newInstance = createRecurringInstance(originalTask);

      // Assert
      expect(newInstance.dueDate).toBeNull();
      expect(newInstance.reminderTime).toBeNull();
    });

    it('should create instance for weekly recurring task', () => {
      // Arrange
      const originalTask = createMockTask({
        id: 1,
        text: 'Weekly Review',
        dueDate: new Date('2024-10-19T14:00:00Z'), // Saturday
        recurrence: 'weekly',
        categoryId: 2,
        duration: 30,
      });

      // Act
      const newInstance = createRecurringInstance(originalTask);

      // Assert
      expect(newInstance.dueDate).toEqual(new Date('2024-10-26T14:00:00Z')); // Next Saturday
      expect(newInstance.recurrence).toBe('weekly');
    });

    it('should create instance for monthly recurring task', () => {
      // Arrange
      const originalTask = createMockTask({
        id: 1,
        text: 'Monthly Report',
        dueDate: new Date('2024-10-19T12:00:00Z'),
        recurrence: 'monthly',
      });

      // Act
      const newInstance = createRecurringInstance(originalTask);

      // Assert
      expect(newInstance.dueDate).toEqual(new Date('2024-11-19T12:00:00Z'));
      expect(newInstance.recurrence).toBe('monthly');
    });

    it('should create instance for yearly recurring task', () => {
      // Arrange
      const originalTask = createMockTask({
        id: 1,
        text: 'Birthday',
        dueDate: new Date('2024-10-19T00:00:00Z'),
        recurrence: 'yearly',
      });

      // Act
      const newInstance = createRecurringInstance(originalTask);

      // Assert
      expect(newInstance.dueDate).toEqual(new Date('2025-10-19T00:00:00Z'));
      expect(newInstance.recurrence).toBe('yearly');
    });

    it('should not include id in new instance', () => {
      // Arrange
      const originalTask = createMockTask({
        id: 123,
        text: 'Daily Task',
        recurrence: 'daily',
      });

      // Act
      const newInstance = createRecurringInstance(originalTask);

      // Assert
      expect(newInstance.id).toBeUndefined();
    });

    it('should preserve all task properties except completed and id', () => {
      // Arrange
      const originalTask = createMockTask({
        id: 1,
        text: 'Complete Task',
        completed: true,
        dueDate: new Date('2024-10-19T10:00:00Z'),
        reminderTime: new Date('2024-10-19T09:30:00Z'),
        recurrence: 'daily',
        categoryId: 5,
        duration: 90,
        userId: 'user-abc',
      });

      // Act
      const newInstance = createRecurringInstance(originalTask);

      // Assert
      expect(newInstance.text).toBe('Complete Task');
      expect(newInstance.completed).toBe(false); // Should always be false
      expect(newInstance.recurrence).toBe('daily');
      expect(newInstance.categoryId).toBe(5);
      expect(newInstance.duration).toBe(90);
      expect(newInstance.userId).toBe('user-abc');
    });
  });
});
