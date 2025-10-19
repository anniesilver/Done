// Tests for supabaseService (CRUD operations with Supabase)

import { taskService, categoryService, authService } from '../../src/services/supabaseService';
import { supabase } from '../../src/config/supabase';
import {
  createMockTask,
  createMockCategory,
  createMockUser,
  taskToDbRow,
  dbRowToTask,
} from '../utils/testHelpers';

// Mock is already set up in setup.ts, but we need to get the mock instance
// Use jest.mocked() helper to properly type the mocks
const mockSupabase = jest.mocked(supabase);

describe('supabaseService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('authService', () => {
    describe('signUp', () => {
      it('should sign up a user successfully', async () => {
        // Arrange
        const credentials = { email: 'test@example.com', password: 'password123', confirmPassword: 'password123' };
        const mockAuthData = {
          user: { id: 'user-123', email: 'test@example.com', created_at: '2024-01-01T00:00:00Z' },
        };

        (mockSupabase.auth.signUp as jest.Mock).mockResolvedValue({
          data: mockAuthData,
          error: null,
        });

        // Act
        const result = await authService.signUp(credentials);

        // Assert
        expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
          email: credentials.email,
          password: credentials.password,
        });
        expect(result.user).toBeDefined();
        expect(result.user?.email).toBe('test@example.com');
        expect(result.error).toBeNull();
      });

      it('should handle sign up errors', async () => {
        // Arrange
        const credentials = { email: 'test@example.com', password: '123', confirmPassword: '123' };

        (mockSupabase.auth.signUp as jest.Mock).mockResolvedValue({
          data: { user: null },
          error: { message: 'Password too short' },
        });

        // Act
        const result = await authService.signUp(credentials);

        // Assert
        expect(result.user).toBeNull();
        expect(result.error).toBe('Password too short');
      });
    });

    describe('signIn', () => {
      it('should sign in a user successfully', async () => {
        // Arrange
        const credentials = { email: 'test@example.com', password: 'password123' };
        const mockAuthData = {
          user: { id: 'user-123', email: 'test@example.com', created_at: '2024-01-01T00:00:00Z' },
        };

        (mockSupabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
          data: mockAuthData,
          error: null,
        });

        // Act
        const result = await authService.signIn(credentials);

        // Assert
        expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
          email: credentials.email,
          password: credentials.password,
        });
        expect(result.user).toBeDefined();
        expect(result.error).toBeNull();
      });

      it('should handle invalid credentials', async () => {
        // Arrange
        const credentials = { email: 'wrong@example.com', password: 'wrongpass' };

        (mockSupabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
          data: { user: null },
          error: { message: 'Invalid login credentials' },
        });

        // Act
        const result = await authService.signIn(credentials);

        // Assert
        expect(result.user).toBeNull();
        expect(result.error).toBe('Invalid login credentials');
      });
    });

    describe('signOut', () => {
      it('should sign out successfully', async () => {
        // Arrange
        (mockSupabase.auth.signOut as jest.Mock).mockResolvedValue({ error: null });

        // Act
        const result = await authService.signOut();

        // Assert
        expect(mockSupabase.auth.signOut).toHaveBeenCalled();
        expect(result.error).toBeNull();
      });

      it('should handle sign out errors', async () => {
        // Arrange
        (mockSupabase.auth.signOut as jest.Mock).mockResolvedValue({
          error: { message: 'Network error' },
        });

        // Act
        const result = await authService.signOut();

        // Assert
        expect(result.error).toBe('Network error');
      });
    });

    describe('getCurrentUser', () => {
      it('should get current user successfully', async () => {
        // Arrange
        const mockAuthData = {
          user: { id: 'user-123', email: 'test@example.com', created_at: '2024-01-01T00:00:00Z' },
        };

        (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
          data: mockAuthData,
          error: null,
        });

        // Act
        const result = await authService.getCurrentUser();

        // Assert
        expect(mockSupabase.auth.getUser).toHaveBeenCalled();
        expect(result.user).toBeDefined();
        expect(result.user?.id).toBe('user-123');
        expect(result.error).toBeNull();
      });

      it('should return null when no user is logged in', async () => {
        // Arrange
        (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
          data: { user: null },
          error: null,
        });

        // Act
        const result = await authService.getCurrentUser();

        // Assert
        expect(result.user).toBeNull();
        expect(result.error).toBeNull();
      });
    });
  });

  describe('taskService', () => {
    describe('getTasks', () => {
      it('should fetch tasks successfully', async () => {
        // Arrange
        const userId = 'user-123';
        const mockDbRows = [
          taskToDbRow(createMockTask({ id: 1, text: 'Task 1' })),
          taskToDbRow(createMockTask({ id: 2, text: 'Task 2' })),
        ];

        const mockFrom = {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({ data: mockDbRows, error: null }),
        };

        (mockSupabase.from as jest.Mock).mockReturnValue(mockFrom);

        // Act
        const result = await taskService.getTasks(userId);

        // Assert
        expect(mockSupabase.from).toHaveBeenCalledWith('tasks');
        expect(mockFrom.select).toHaveBeenCalledWith('*');
        expect(mockFrom.eq).toHaveBeenCalledWith('user_id', userId);
        expect(mockFrom.order).toHaveBeenCalledWith('created_at', { ascending: false });
        expect(result.tasks).toHaveLength(2);
        expect(result.tasks?.[0].text).toBe('Task 1');
        expect(result.error).toBeNull();
      });

      it('should handle fetch errors', async () => {
        // Arrange
        const userId = 'user-123';

        const mockFrom = {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({ data: null, error: { message: 'Database error' } }),
        };

        (mockSupabase.from as jest.Mock).mockReturnValue(mockFrom);

        // Act
        const result = await taskService.getTasks(userId);

        // Assert
        expect(result.tasks).toBeNull();
        expect(result.error).toBe('Database error');
      });

      it('should correctly convert database rows to Task objects', async () => {
        // Arrange
        const userId = 'user-123';
        const mockDbRow = {
          id: 1,
          user_id: userId,
          text: 'Test Task',
          completed: false,
          due_date: '2024-12-31T12:00:00Z',
          reminder_time: '2024-12-31T11:30:00Z',
          recurrence: 'daily',
          category_id: 5,
          duration: 60,
          created_at: '2024-01-01T00:00:00Z',
        };

        const mockFrom = {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({ data: [mockDbRow], error: null }),
        };

        (mockSupabase.from as jest.Mock).mockReturnValue(mockFrom);

        // Act
        const result = await taskService.getTasks(userId);

        // Assert
        const task = result.tasks?.[0];
        expect(task?.id).toBe(1);
        expect(task?.text).toBe('Test Task');
        expect(task?.completed).toBe(false);
        expect(task?.dueDate).toEqual(new Date('2024-12-31T12:00:00Z'));
        expect(task?.reminderTime).toEqual(new Date('2024-12-31T11:30:00Z'));
        expect(task?.recurrence).toBe('daily');
        expect(task?.categoryId).toBe(5);
        expect(task?.duration).toBe(60);
        expect(task?.userId).toBe(userId);
      });
    });

    describe('createTask', () => {
      it('should create a task successfully', async () => {
        // Arrange
        const userId = 'user-123';
        const taskInput = {
          text: 'New Task',
          dueDate: new Date('2024-12-31T12:00:00Z'),
          reminderTime: new Date('2024-12-31T11:30:00Z'),
          recurrence: 'daily' as const,
          categoryId: 1,
          duration: 60,
        };

        const mockDbRow = taskToDbRow({ ...taskInput, id: 10, userId, createdAt: new Date() });

        const mockFrom = {
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: mockDbRow, error: null }),
        };

        (mockSupabase.from as jest.Mock).mockReturnValue(mockFrom);

        // Act
        const result = await taskService.createTask(userId, taskInput);

        // Assert
        expect(mockSupabase.from).toHaveBeenCalledWith('tasks');
        expect(mockFrom.insert).toHaveBeenCalledWith({
          user_id: userId,
          text: taskInput.text,
          completed: false,
          due_date: taskInput.dueDate.toISOString(),
          reminder_time: taskInput.reminderTime.toISOString(),
          recurrence: taskInput.recurrence,
          category_id: taskInput.categoryId,
          duration: taskInput.duration,
        });
        expect(result.task).toBeDefined();
        expect(result.task?.text).toBe('New Task');
        expect(result.error).toBeNull();
      });

      it('should handle create errors', async () => {
        // Arrange
        const userId = 'user-123';
        const taskInput = { text: 'New Task' };

        const mockFrom = {
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Insert failed' } }),
        };

        (mockSupabase.from as jest.Mock).mockReturnValue(mockFrom);

        // Act
        const result = await taskService.createTask(userId, taskInput);

        // Assert
        expect(result.task).toBeNull();
        expect(result.error).toBe('Insert failed');
      });

      it('should convert null dates correctly', async () => {
        // Arrange
        const userId = 'user-123';
        const taskInput = { text: 'Task without dates' };

        const mockDbRow = {
          id: 1,
          user_id: userId,
          text: 'Task without dates',
          completed: false,
          due_date: null,
          reminder_time: null,
          recurrence: 'none',
          category_id: null,
          duration: 0,
          created_at: '2024-01-01T00:00:00Z',
        };

        const mockFrom = {
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: mockDbRow, error: null }),
        };

        (mockSupabase.from as jest.Mock).mockReturnValue(mockFrom);

        // Act
        const result = await taskService.createTask(userId, taskInput);

        // Assert
        expect(result.task?.dueDate).toBeNull();
        expect(result.task?.reminderTime).toBeNull();
        expect(result.task?.categoryId).toBeNull();
      });
    });

    describe('updateTask', () => {
      it('should update a task successfully', async () => {
        // Arrange
        const taskId = 1;
        const updates = { text: 'Updated Text', completed: true };

        const mockDbRow = taskToDbRow(createMockTask({ ...updates, id: taskId }));

        const mockFrom = {
          update: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: mockDbRow, error: null }),
        };

        (mockSupabase.from as jest.Mock).mockReturnValue(mockFrom);

        // Act
        const result = await taskService.updateTask(taskId, updates);

        // Assert
        expect(mockSupabase.from).toHaveBeenCalledWith('tasks');
        expect(mockFrom.update).toHaveBeenCalledWith({
          text: 'Updated Text',
          completed: true,
        });
        expect(mockFrom.eq).toHaveBeenCalledWith('id', taskId);
        expect(result.task?.text).toBe('Updated Text');
        expect(result.task?.completed).toBe(true);
        expect(result.error).toBeNull();
      });

      it('should only include defined fields in update', async () => {
        // Arrange
        const taskId = 1;
        const updates = { text: 'Updated', categoryId: undefined };

        const mockDbRow = taskToDbRow(createMockTask({ id: taskId, text: 'Updated' }));

        const mockFrom = {
          update: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: mockDbRow, error: null }),
        };

        (mockSupabase.from as jest.Mock).mockReturnValue(mockFrom);

        // Act
        await taskService.updateTask(taskId, updates);

        // Assert
        // categoryId should NOT be in the update object since it's undefined
        expect(mockFrom.update).toHaveBeenCalledWith({ text: 'Updated' });
      });

      it('should handle update errors', async () => {
        // Arrange
        const taskId = 1;
        const updates = { text: 'Updated' };

        const mockFrom = {
          update: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Update failed' } }),
        };

        (mockSupabase.from as jest.Mock).mockReturnValue(mockFrom);

        // Act
        const result = await taskService.updateTask(taskId, updates);

        // Assert
        expect(result.task).toBeNull();
        expect(result.error).toBe('Update failed');
      });
    });

    describe('deleteTask', () => {
      it('should delete a task successfully', async () => {
        // Arrange
        const taskId = 1;

        const mockFrom = {
          delete: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({ error: null }),
        };

        (mockSupabase.from as jest.Mock).mockReturnValue(mockFrom);

        // Act
        const result = await taskService.deleteTask(taskId);

        // Assert
        expect(mockSupabase.from).toHaveBeenCalledWith('tasks');
        expect(mockFrom.delete).toHaveBeenCalled();
        expect(mockFrom.eq).toHaveBeenCalledWith('id', taskId);
        expect(result.error).toBeNull();
      });

      it('should handle delete errors', async () => {
        // Arrange
        const taskId = 1;

        const mockFrom = {
          delete: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({ error: { message: 'Delete failed' } }),
        };

        (mockSupabase.from as jest.Mock).mockReturnValue(mockFrom);

        // Act
        const result = await taskService.deleteTask(taskId);

        // Assert
        expect(result.error).toBe('Delete failed');
      });
    });
  });

  describe('categoryService', () => {
    describe('getCategories', () => {
      it('should fetch categories successfully', async () => {
        // Arrange
        const userId = 'user-123';
        const mockCategories = [
          { id: 1, user_id: userId, name: 'Work', icon: '💼', created_at: '2024-01-01T00:00:00Z' },
          { id: 2, user_id: userId, name: 'Personal', icon: '🏠', created_at: '2024-01-01T00:00:00Z' },
        ];

        const mockFrom = {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({ data: mockCategories, error: null }),
        };

        (mockSupabase.from as jest.Mock).mockReturnValue(mockFrom);

        // Act
        const result = await categoryService.getCategories(userId);

        // Assert
        expect(mockSupabase.from).toHaveBeenCalledWith('categories');
        expect(mockFrom.eq).toHaveBeenCalledWith('user_id', userId);
        expect(result.categories).toHaveLength(2);
        expect(result.categories?.[0].name).toBe('Work');
        expect(result.error).toBeNull();
      });
    });

    describe('createCategory', () => {
      it('should create a category successfully', async () => {
        // Arrange
        const userId = 'user-123';
        const input = { name: 'Fitness', icon: '🏋️' };

        const mockDbRow = {
          id: 10,
          user_id: userId,
          name: 'Fitness',
          icon: '🏋️',
          created_at: '2024-01-01T00:00:00Z',
        };

        const mockFrom = {
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: mockDbRow, error: null }),
        };

        (mockSupabase.from as jest.Mock).mockReturnValue(mockFrom);

        // Act
        const result = await categoryService.createCategory(userId, input);

        // Assert
        expect(mockSupabase.from).toHaveBeenCalledWith('categories');
        expect(mockFrom.insert).toHaveBeenCalledWith({
          user_id: userId,
          name: 'Fitness',
          icon: '🏋️',
        });
        expect(result.category?.name).toBe('Fitness');
        expect(result.error).toBeNull();
      });
    });

    describe('deleteCategory', () => {
      it('should delete a category successfully', async () => {
        // Arrange
        const categoryId = 1;

        const mockFrom = {
          delete: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({ error: null }),
        };

        (mockSupabase.from as jest.Mock).mockReturnValue(mockFrom);

        // Act
        const result = await categoryService.deleteCategory(categoryId);

        // Assert
        expect(mockSupabase.from).toHaveBeenCalledWith('categories');
        expect(mockFrom.delete).toHaveBeenCalled();
        expect(mockFrom.eq).toHaveBeenCalledWith('id', categoryId);
        expect(result.error).toBeNull();
      });
    });
  });
});
