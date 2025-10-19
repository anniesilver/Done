// Test helpers and utilities

import { Task, RecurrenceType } from '../../src/types/task';
import { Category } from '../../src/types/category';
import { User } from '../../src/types/user';

/**
 * Create a mock user for testing
 */
export const createMockUser = (overrides?: Partial<User>): User => ({
  id: 'test-user-id',
  email: 'test@example.com',
  createdAt: new Date('2024-01-01'),
  ...overrides,
});

/**
 * Create a mock task for testing
 */
export const createMockTask = (overrides?: Partial<Task>): Task => ({
  id: 1,
  text: 'Test Task',
  completed: false,
  dueDate: new Date('2024-12-31T12:00:00Z'),
  reminderTime: null,
  recurrence: 'none' as RecurrenceType,
  categoryId: null,
  duration: 0,
  userId: 'test-user-id',
  createdAt: new Date('2024-01-01'),
  ...overrides,
});

/**
 * Create a mock category for testing
 */
export const createMockCategory = (overrides?: Partial<Category>): Category => ({
  id: 1,
  name: 'Work',
  icon: '💼',
  userId: 'test-user-id',
  createdAt: new Date('2024-01-01'),
  ...overrides,
});

/**
 * Create mock Supabase response
 */
export const createMockSupabaseResponse = <T>(data: T, error: string | null = null) => ({
  data,
  error: error ? { message: error } : null,
});

/**
 * Create a date helper for testing
 */
export const createTestDate = (dateString: string): Date => {
  return new Date(dateString);
};

/**
 * Wait for async operations to complete
 */
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

/**
 * Mock Supabase auth response
 */
export const mockAuthResponse = (user: User | null, error: string | null = null) => ({
  data: { user: user ? { id: user.id, email: user.email, created_at: user.createdAt.toISOString() } : null },
  error: error ? { message: error } : null,
});

/**
 * Mock Supabase data response
 */
export const mockDataResponse = <T>(data: T, error: string | null = null) => ({
  data,
  error: error ? { message: error } : null,
});

/**
 * Create multiple mock tasks
 */
export const createMockTasks = (count: number, overrides?: Partial<Task>): Task[] => {
  return Array.from({ length: count }, (_, index) =>
    createMockTask({
      id: index + 1,
      text: `Task ${index + 1}`,
      ...overrides,
    })
  );
};

/**
 * Create multiple mock categories
 */
export const createMockCategories = (count: number): Category[] => {
  const names = ['Work', 'Personal', 'Shopping', 'Health', 'Study'];
  const icons = ['💼', '🏠', '🛒', '🏥', '📚'];

  return Array.from({ length: count }, (_, index) =>
    createMockCategory({
      id: index + 1,
      name: names[index] || `Category ${index + 1}`,
      icon: icons[index] || '📁',
    })
  );
};

/**
 * Convert database row to Task object (mimics supabaseService conversion)
 */
export const dbRowToTask = (row: any): Task => ({
  id: row.id,
  text: row.text,
  completed: row.completed,
  dueDate: row.due_date ? new Date(row.due_date) : null,
  reminderTime: row.reminder_time ? new Date(row.reminder_time) : null,
  recurrence: row.recurrence || 'none',
  categoryId: row.category_id,
  duration: row.duration || 0,
  userId: row.user_id,
  createdAt: new Date(row.created_at),
});

/**
 * Convert Task object to database row (mimics supabaseService conversion)
 */
export const taskToDbRow = (task: Partial<Task>): any => ({
  id: task.id,
  text: task.text,
  completed: task.completed || false,
  due_date: task.dueDate?.toISOString() || null,
  reminder_time: task.reminderTime?.toISOString() || null,
  recurrence: task.recurrence || 'none',
  category_id: task.categoryId || null,
  duration: task.duration || 0,
  user_id: task.userId,
  created_at: task.createdAt?.toISOString() || new Date().toISOString(),
});
