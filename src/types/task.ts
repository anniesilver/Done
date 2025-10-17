// Task type definitions

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

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
}

export interface UpdateTaskInput {
  text?: string;
  completed?: boolean;
  dueDate?: Date | null;
  reminderTime?: Date | null;
  recurrence?: RecurrenceType;
  categoryId?: number | null;
  duration?: number;
}
