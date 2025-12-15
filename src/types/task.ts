// Task type definitions

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
export type SourceType = 'manual' | 'iphone_calendar' | 'google_calendar';

export interface Task {
  id: number | string;
  text: string;
  completed: boolean;
  dueDate: Date | null;
  reminderTime: Date | null; // When to send notification
  recurrence: RecurrenceType;
  categoryId: number | null;
  duration: number; // in minutes
  userId: string;
  createdAt: Date;

  // Calendar sync metadata
  sourceType: SourceType;
  sourceEventId: string | null; // External event ID for deduplication
  syncedAt: Date | null; // When this was imported from calendar

  // Metadata for offline sync (Phase 2)
  _isTemporary?: boolean;
  _lastModified?: number;
}

export interface CreateTaskInput {
  text: string;
  completed?: boolean;
  dueDate?: Date | null;
  reminderTime?: Date | null;
  recurrence?: RecurrenceType;
  categoryId?: number | null;
  duration?: number;
  sourceType?: SourceType;
  sourceEventId?: string | null;
  syncedAt?: Date | null;
}

export interface UpdateTaskInput {
  text?: string;
  completed?: boolean;
  dueDate?: Date | null;
  reminderTime?: Date | null;
  recurrence?: RecurrenceType;
  categoryId?: number | null;
  duration?: number;
  sourceType?: SourceType;
  sourceEventId?: string | null;
  syncedAt?: Date | null;
}
