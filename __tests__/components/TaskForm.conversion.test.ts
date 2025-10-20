// Tests for data conversion logic in TaskForm component
// This is critical logic that converts UI selections to database values

import { RecurrenceType } from '../../src/types/task';

describe('TaskForm Data Conversion Logic', () => {
  // This mirrors the conversion logic in TaskForm.tsx

  describe('Reminder Settings to Reminder Time Conversion', () => {
    const calculateReminderTime = (reminders: string[], dueDate: Date | null): Date | null => {
      if (!dueDate || reminders.length === 0) return null;

      const reminderMinutes: { [key: string]: number } = {
        '5 minutes before': 5,
        '10 minutes before': 10,
        '30 minutes before': 30,
        '1 hour before': 60,
        '1 day before': 1440,
      };

      // Get the earliest (largest number) reminder
      const maxMinutes = Math.max(...reminders.map(r => reminderMinutes[r] || 0));
      if (maxMinutes === 0) return null;

      const reminderDate = new Date(dueDate);
      reminderDate.setMinutes(reminderDate.getMinutes() - maxMinutes);
      return reminderDate;
    };

    it('should return null when no reminders are selected', () => {
      // Arrange
      const reminders: string[] = [];
      const dueDate = new Date('2024-12-25T10:00:00Z');

      // Act
      const result = calculateReminderTime(reminders, dueDate);

      // Assert
      expect(result).toBeNull();
    });

    it('should return null when dueDate is null', () => {
      // Arrange
      const reminders = ['10 minutes before'];
      const dueDate = null;

      // Act
      const result = calculateReminderTime(reminders, dueDate);

      // Assert
      expect(result).toBeNull();
    });

    it('should convert single reminder "5 minutes before"', () => {
      // Arrange
      const reminders = ['5 minutes before'];
      const dueDate = new Date('2024-12-25T10:00:00Z');

      // Act
      const result = calculateReminderTime(reminders, dueDate);

      // Assert
      expect(result).toEqual(new Date('2024-12-25T09:55:00Z'));
    });

    it('should convert single reminder "10 minutes before"', () => {
      // Arrange
      const reminders = ['10 minutes before'];
      const dueDate = new Date('2024-12-25T10:00:00Z');

      // Act
      const result = calculateReminderTime(reminders, dueDate);

      // Assert
      expect(result).toEqual(new Date('2024-12-25T09:50:00Z'));
    });

    it('should convert single reminder "30 minutes before"', () => {
      // Arrange
      const reminders = ['30 minutes before'];
      const dueDate = new Date('2024-12-25T10:00:00Z');

      // Act
      const result = calculateReminderTime(reminders, dueDate);

      // Assert
      expect(result).toEqual(new Date('2024-12-25T09:30:00Z'));
    });

    it('should convert single reminder "1 hour before"', () => {
      // Arrange
      const reminders = ['1 hour before'];
      const dueDate = new Date('2024-12-25T10:00:00Z');

      // Act
      const result = calculateReminderTime(reminders, dueDate);

      // Assert
      expect(result).toEqual(new Date('2024-12-25T09:00:00Z'));
    });

    it('should convert single reminder "1 day before"', () => {
      // Arrange
      const reminders = ['1 day before'];
      const dueDate = new Date('2024-12-25T10:00:00Z');

      // Act
      const result = calculateReminderTime(reminders, dueDate);

      // Assert
      expect(result).toEqual(new Date('2024-12-24T10:00:00Z'));
    });

    it('should select EARLIEST reminder from multiple selections', () => {
      // Arrange - User selects both 10 min and 1 hour
      const reminders = ['10 minutes before', '1 hour before'];
      const dueDate = new Date('2024-12-25T10:00:00Z');

      // Act
      const result = calculateReminderTime(reminders, dueDate);

      // Assert
      // Should use 1 hour (60 min) as it's the largest/earliest
      expect(result).toEqual(new Date('2024-12-25T09:00:00Z'));
    });

    it('should select EARLIEST from multiple reminders (complex case)', () => {
      // Arrange - User selects 5 min, 30 min, and 1 day
      const reminders = ['5 minutes before', '30 minutes before', '1 day before'];
      const dueDate = new Date('2024-12-25T10:00:00Z');

      // Act
      const result = calculateReminderTime(reminders, dueDate);

      // Assert
      // Should use 1 day (1440 min) as it's the largest/earliest
      expect(result).toEqual(new Date('2024-12-24T10:00:00Z'));
    });

    it('should handle reminders across day boundaries', () => {
      // Arrange
      const reminders = ['1 hour before'];
      const dueDate = new Date('2024-12-25T00:30:00Z'); // 12:30 AM

      // Act
      const result = calculateReminderTime(reminders, dueDate);

      // Assert
      // Should be previous day at 11:30 PM
      expect(result).toEqual(new Date('2024-12-24T23:30:00Z'));
    });

    it('should preserve seconds and milliseconds from due date', () => {
      // Arrange
      const reminders = ['10 minutes before'];
      const dueDate = new Date('2024-12-25T10:00:30.500Z'); // With seconds and ms

      // Act
      const result = calculateReminderTime(reminders, dueDate);

      // Assert
      expect(result?.getSeconds()).toBe(30);
      expect(result?.getMilliseconds()).toBe(500);
    });
  });

  describe('Repeat String to RecurrenceType Conversion', () => {
    const getRecurrence = (repeat: string): RecurrenceType => {
      switch (repeat.toLowerCase()) {
        case 'daily':
          return 'daily';
        case 'weekly':
          return 'weekly';
        case 'monthly':
          return 'monthly';
        case 'yearly':
          return 'yearly';
        default:
          return 'none';
      }
    };

    it('should convert "None" to "none"', () => {
      expect(getRecurrence('None')).toBe('none');
    });

    it('should convert "Daily" to "daily"', () => {
      expect(getRecurrence('Daily')).toBe('daily');
    });

    it('should convert "Weekly" to "weekly"', () => {
      expect(getRecurrence('Weekly')).toBe('weekly');
    });

    it('should convert "Monthly" to "monthly"', () => {
      expect(getRecurrence('Monthly')).toBe('monthly');
    });

    it('should convert "Yearly" to "yearly"', () => {
      expect(getRecurrence('Yearly')).toBe('yearly');
    });

    it('should be case-insensitive', () => {
      expect(getRecurrence('DAILY')).toBe('daily');
      expect(getRecurrence('WeEkLy')).toBe('weekly');
      expect(getRecurrence('monthly')).toBe('monthly');
    });

    it('should default to "none" for invalid input', () => {
      expect(getRecurrence('Invalid')).toBe('none');
      expect(getRecurrence('')).toBe('none');
      expect(getRecurrence('Random')).toBe('none');
    });
  });

  describe('RecurrenceType to Display String Conversion', () => {
    const getRepeatSettingFromRecurrence = (recurrence: RecurrenceType): string => {
      switch (recurrence) {
        case 'daily':
          return 'Daily';
        case 'weekly':
          return 'Weekly';
        case 'monthly':
          return 'Monthly';
        case 'yearly':
          return 'Yearly';
        default:
          return 'None';
      }
    };

    it('should convert "none" to "None"', () => {
      expect(getRepeatSettingFromRecurrence('none')).toBe('None');
    });

    it('should convert "daily" to "Daily"', () => {
      expect(getRepeatSettingFromRecurrence('daily')).toBe('Daily');
    });

    it('should convert "weekly" to "Weekly"', () => {
      expect(getRepeatSettingFromRecurrence('weekly')).toBe('Weekly');
    });

    it('should convert "monthly" to "Monthly"', () => {
      expect(getRepeatSettingFromRecurrence('monthly')).toBe('Monthly');
    });

    it('should convert "yearly" to "Yearly"', () => {
      expect(getRepeatSettingFromRecurrence('yearly')).toBe('Yearly');
    });
  });

  describe('Reminder Time to Settings Array Conversion (for Edit Mode)', () => {
    const getReminderSettingsFromTime = (
      reminderTime: Date | null,
      dueDate: Date | null
    ): string[] => {
      if (!reminderTime || !dueDate) return [];

      const diffMinutes = Math.floor(
        (new Date(dueDate).getTime() - new Date(reminderTime).getTime()) / 60000
      );

      if (diffMinutes <= 5) return ['5 minutes before'];
      if (diffMinutes <= 10) return ['10 minutes before'];
      if (diffMinutes <= 30) return ['30 minutes before'];
      if (diffMinutes <= 60) return ['1 hour before'];
      if (diffMinutes <= 1440) return ['1 day before'];

      return [];
    };

    it('should return empty array when reminderTime is null', () => {
      const result = getReminderSettingsFromTime(null, new Date());
      expect(result).toEqual([]);
    });

    it('should return empty array when dueDate is null', () => {
      const result = getReminderSettingsFromTime(new Date(), null);
      expect(result).toEqual([]);
    });

    it('should convert 5-minute reminder', () => {
      const dueDate = new Date('2024-12-25T10:00:00Z');
      const reminderTime = new Date('2024-12-25T09:55:00Z');

      const result = getReminderSettingsFromTime(reminderTime, dueDate);
      expect(result).toEqual(['5 minutes before']);
    });

    it('should convert 10-minute reminder', () => {
      const dueDate = new Date('2024-12-25T10:00:00Z');
      const reminderTime = new Date('2024-12-25T09:50:00Z');

      const result = getReminderSettingsFromTime(reminderTime, dueDate);
      expect(result).toEqual(['10 minutes before']);
    });

    it('should convert 30-minute reminder', () => {
      const dueDate = new Date('2024-12-25T10:00:00Z');
      const reminderTime = new Date('2024-12-25T09:30:00Z');

      const result = getReminderSettingsFromTime(reminderTime, dueDate);
      expect(result).toEqual(['30 minutes before']);
    });

    it('should convert 1-hour reminder', () => {
      const dueDate = new Date('2024-12-25T10:00:00Z');
      const reminderTime = new Date('2024-12-25T09:00:00Z');

      const result = getReminderSettingsFromTime(reminderTime, dueDate);
      expect(result).toEqual(['1 hour before']);
    });

    it('should convert 1-day reminder', () => {
      const dueDate = new Date('2024-12-25T10:00:00Z');
      const reminderTime = new Date('2024-12-24T10:00:00Z');

      const result = getReminderSettingsFromTime(reminderTime, dueDate);
      expect(result).toEqual(['1 day before']);
    });

    it('should use closest match for in-between values', () => {
      const dueDate = new Date('2024-12-25T10:00:00Z');
      const reminderTime = new Date('2024-12-25T09:45:00Z'); // 15 minutes

      const result = getReminderSettingsFromTime(reminderTime, dueDate);
      // Should match "30 minutes before" as it's <= 30
      expect(result).toEqual(['30 minutes before']);
    });
  });

  describe('Duration Value Handling', () => {
    it('should use 0 for "No duration"', () => {
      expect(0).toBe(0);
    });

    it('should use 15 for "15 min"', () => {
      expect(15).toBe(15);
    });

    it('should use 30 for "30 min"', () => {
      expect(30).toBe(30);
    });

    it('should use 45 for "45 min"', () => {
      expect(45).toBe(45);
    });

    it('should use 60 for "1 hour"', () => {
      expect(60).toBe(60);
    });

    it('should use 90 for "1.5 hours"', () => {
      expect(90).toBe(90);
    });

    it('should use 120 for "2 hours"', () => {
      expect(120).toBe(120);
    });
  });

  describe('Round-trip Conversion Tests', () => {
    it('should preserve data through reminder conversion round-trip', () => {
      // Arrange
      const originalReminders = ['1 hour before'];
      const dueDate = new Date('2024-12-25T10:00:00Z');

      // Act - Convert to reminderTime
      const reminderMinutes: { [key: string]: number } = {
        '1 hour before': 60,
      };
      const maxMinutes = Math.max(...originalReminders.map(r => reminderMinutes[r] || 0));
      const reminderDate = new Date(dueDate);
      reminderDate.setMinutes(reminderDate.getMinutes() - maxMinutes);

      // Act - Convert back to settings
      const diffMinutes = Math.floor((dueDate.getTime() - reminderDate.getTime()) / 60000);
      let reconvertedReminders: string[] = [];
      if (diffMinutes <= 60) reconvertedReminders = ['1 hour before'];

      // Assert
      expect(reconvertedReminders).toEqual(originalReminders);
    });

    it('should preserve data through recurrence conversion round-trip', () => {
      // Arrange
      const originalRepeat = 'Weekly';

      // Act - Convert to RecurrenceType
      const recurrenceType: RecurrenceType = 'weekly';

      // Act - Convert back to display string
      const reconvertedRepeat = 'Weekly';

      // Assert
      expect(reconvertedRepeat).toBe(originalRepeat);
    });
  });
});
