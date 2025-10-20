// Integration tests for complete task CRUD flows
// These tests verify that multiple components work together correctly

import { useTaskStore } from '../../src/stores/taskStore';
import { useAuthStore } from '../../src/stores/authStore';
import { useCategoryStore } from '../../src/stores/categoryStore';
import { taskService, categoryService } from '../../src/services/supabaseService';
import { createMockUser, createMockTask, createMockCategory } from '../utils/testHelpers';
import { RecurrenceType } from '../../src/types/task';

// Mock the services
jest.mock('../../src/services/supabaseService');
jest.mock('../../src/stores/authStore');

describe('Task CRUD Integration Tests', () => {
  const mockUser = createMockUser();

  beforeEach(() => {
    // Reset all stores
    useTaskStore.setState({ tasks: [], isLoading: false, error: null });
    useCategoryStore.setState({ categories: [], isLoading: false, error: null });

    // Mock authenticated user
    (useAuthStore.getState as jest.Mock).mockReturnValue({ user: mockUser });

    jest.clearAllMocks();
  });

  describe('Complete Task Lifecycle', () => {
    it('should create, update, and delete a task', async () => {
      // === STEP 1: Create a task ===
      const newTask = createMockTask({
        id: 1,
        text: 'Integration Test Task',
        dueDate: new Date('2024-12-25T10:00:00Z'),
        categoryId: 1,
        duration: 60,
      });

      (taskService.createTask as jest.Mock).mockResolvedValue({
        task: newTask,
        error: null,
      });

      await useTaskStore.getState().addTask({
        text: 'Integration Test Task',
        dueDate: new Date('2024-12-25T10:00:00Z'),
        categoryId: 1,
        duration: 60,
      });

      expect(useTaskStore.getState().tasks).toHaveLength(1);
      expect(useTaskStore.getState().tasks[0].text).toBe('Integration Test Task');

      // === STEP 2: Update the task ===
      const updatedTask = { ...newTask, text: 'Updated Task Text', duration: 90 };
      (taskService.updateTask as jest.Mock).mockResolvedValue({
        task: updatedTask,
        error: null,
      });

      await useTaskStore.getState().updateTask(1, {
        text: 'Updated Task Text',
        duration: 90,
      });

      expect(useTaskStore.getState().tasks[0].text).toBe('Updated Task Text');
      expect(useTaskStore.getState().tasks[0].duration).toBe(90);

      // === STEP 3: Delete the task ===
      (taskService.deleteTask as jest.Mock).mockResolvedValue({ error: null });

      await useTaskStore.getState().deleteTask(1);

      expect(useTaskStore.getState().tasks).toHaveLength(0);
    });
  });

  describe('Task Creation with All Properties', () => {
    it('should create a task with dueDate, reminderTime, recurrence, category, and duration', async () => {
      // Arrange
      const taskInput = {
        text: 'Complete project documentation',
        dueDate: new Date('2024-12-31T15:00:00Z'),
        reminderTime: new Date('2024-12-31T14:00:00Z'), // 1 hour before
        recurrence: 'weekly' as RecurrenceType,
        categoryId: 2,
        duration: 120, // 2 hours
      };

      const createdTask = createMockTask({ ...taskInput, id: 5 });
      (taskService.createTask as jest.Mock).mockResolvedValue({
        task: createdTask,
        error: null,
      });

      // Act
      await useTaskStore.getState().addTask(taskInput);

      // Assert
      const task = useTaskStore.getState().tasks[0];
      expect(task.text).toBe('Complete project documentation');
      expect(task.dueDate).toEqual(new Date('2024-12-31T15:00:00Z'));
      expect(task.reminderTime).toEqual(new Date('2024-12-31T14:00:00Z'));
      expect(task.recurrence).toBe('weekly');
      expect(task.categoryId).toBe(2);
      expect(task.duration).toBe(120);
    });

    it('should convert UI reminder selections to earliest reminder time', async () => {
      // Arrange - User selects multiple reminders in UI
      const reminders = ['10 minutes before', '1 hour before', '1 day before'];
      const dueDate = new Date('2024-12-25T10:00:00Z');

      // Calculate earliest reminder time (1 day before = 1440 minutes)
      const reminderTime = new Date(dueDate);
      reminderTime.setMinutes(reminderTime.getMinutes() - 1440);

      const taskInput = {
        text: 'Task with multiple reminders',
        dueDate,
        reminderTime, // Should be 1 day before
        recurrence: 'none' as RecurrenceType,
      };

      const createdTask = createMockTask({ ...taskInput, id: 10 });
      (taskService.createTask as jest.Mock).mockResolvedValue({
        task: createdTask,
        error: null,
      });

      // Act
      await useTaskStore.getState().addTask(taskInput);

      // Assert
      const task = useTaskStore.getState().tasks[0];
      expect(task.reminderTime).toEqual(new Date('2024-12-24T10:00:00Z'));
    });
  });

  describe('Task Completion with Recurring Tasks', () => {
    it('should create next instance when completing a daily recurring task', async () => {
      // Arrange - Create a daily recurring task
      const recurringTask = createMockTask({
        id: 1,
        text: 'Daily Exercise',
        completed: false,
        dueDate: new Date('2024-10-19T07:00:00Z'),
        reminderTime: new Date('2024-10-19T06:30:00Z'),
        recurrence: 'daily',
        categoryId: 1,
        duration: 30,
      });

      useTaskStore.setState({ tasks: [recurringTask] });

      const completedTask = { ...recurringTask, completed: true };
      (taskService.updateTask as jest.Mock).mockResolvedValue({
        task: completedTask,
        error: null,
      });

      const nextInstance = createMockTask({
        id: 2,
        text: 'Daily Exercise',
        completed: false,
        dueDate: new Date('2024-10-20T07:00:00Z'), // Next day
        reminderTime: new Date('2024-10-20T06:30:00Z'), // Same offset
        recurrence: 'daily',
        categoryId: 1,
        duration: 30,
      });

      (taskService.createTask as jest.Mock).mockResolvedValue({
        task: nextInstance,
        error: null,
      });

      // Act
      await useTaskStore.getState().toggleComplete(1);

      // Assert
      expect(taskService.updateTask).toHaveBeenCalledWith(1, { completed: true });
      expect(taskService.createTask).toHaveBeenCalled();
      expect(useTaskStore.getState().tasks).toHaveLength(2);
      // New recurring instance is added to the front (position 0)
      expect(useTaskStore.getState().tasks[0].completed).toBe(false);
      expect(useTaskStore.getState().tasks[0].dueDate).toEqual(new Date('2024-10-20T07:00:00Z'));
      // Completed task is at position 1
      expect(useTaskStore.getState().tasks[1].completed).toBe(true);
    });

    it('should handle weekly recurring task completion', async () => {
      // Arrange
      const weeklyTask = createMockTask({
        id: 1,
        text: 'Weekly Team Meeting',
        completed: false,
        dueDate: new Date('2024-10-19T10:00:00Z'), // Saturday
        recurrence: 'weekly',
      });

      useTaskStore.setState({ tasks: [weeklyTask] });

      const completedTask = { ...weeklyTask, completed: true };
      (taskService.updateTask as jest.Mock).mockResolvedValue({
        task: completedTask,
        error: null,
      });

      const nextInstance = createMockTask({
        id: 2,
        text: 'Weekly Team Meeting',
        dueDate: new Date('2024-10-26T10:00:00Z'), // Next Saturday
        recurrence: 'weekly',
      });

      (taskService.createTask as jest.Mock).mockResolvedValue({
        task: nextInstance,
        error: null,
      });

      // Act
      await useTaskStore.getState().toggleComplete(1);

      // Assert
      expect(useTaskStore.getState().tasks).toHaveLength(2);
      // New recurring instance is added to the front (position 0)
      expect(useTaskStore.getState().tasks[0].dueDate).toEqual(new Date('2024-10-26T10:00:00Z'));
    });

    it('should maintain reminder offset when creating recurring instance', async () => {
      // Arrange - Task with 1-hour reminder
      const task = createMockTask({
        id: 1,
        text: 'Daily Standup',
        completed: false,
        dueDate: new Date('2024-10-19T09:00:00Z'),
        reminderTime: new Date('2024-10-19T08:00:00Z'), // 1 hour before
        recurrence: 'daily',
      });

      useTaskStore.setState({ tasks: [task] });

      (taskService.updateTask as jest.Mock).mockResolvedValue({
        task: { ...task, completed: true },
        error: null,
      });

      const nextInstance = createMockTask({
        id: 2,
        text: 'Daily Standup',
        dueDate: new Date('2024-10-20T09:00:00Z'),
        reminderTime: new Date('2024-10-20T08:00:00Z'), // Same 1-hour offset
        recurrence: 'daily',
      });

      (taskService.createTask as jest.Mock).mockResolvedValue({
        task: nextInstance,
        error: null,
      });

      // Act
      await useTaskStore.getState().toggleComplete(1);

      // Assert
      const newTask = useTaskStore.getState().tasks[1];
      const reminderOffset = newTask.dueDate!.getTime() - newTask.reminderTime!.getTime();
      expect(reminderOffset).toBe(60 * 60 * 1000); // 1 hour in milliseconds
    });
  });

  describe('Task Filtering and Categorization', () => {
    it('should filter tasks by date and category together', async () => {
      // Arrange - Create multiple tasks
      const today = new Date('2024-10-19T12:00:00Z');
      const tomorrow = new Date('2024-10-20T12:00:00Z');

      const tasks = [
        createMockTask({ id: 1, text: 'Today Work', dueDate: today, categoryId: 1 }),
        createMockTask({ id: 2, text: 'Today Personal', dueDate: today, categoryId: 2 }),
        createMockTask({ id: 3, text: 'Tomorrow Work', dueDate: tomorrow, categoryId: 1 }),
        createMockTask({ id: 4, text: 'No Date Work', dueDate: null, categoryId: 1 }),
      ];

      useTaskStore.setState({ tasks });

      // Act - Get today's tasks
      const todayTasks = useTaskStore.getState().getTasksForDate(today);

      // Assert
      expect(todayTasks).toHaveLength(2);
      expect(todayTasks.every(t => t.text.includes('Today'))).toBe(true);

      // Act - Get work category tasks
      const workTasks = useTaskStore.getState().getTasksByCategory(1);

      // Assert
      expect(workTasks).toHaveLength(3); // Tasks 1, 3, 4
      expect(workTasks.every(t => t.categoryId === 1)).toBe(true);
    });
  });

  describe('Multi-Store Integration', () => {
    it('should create task with category and fetch both', async () => {
      // === STEP 1: Create categories ===
      const workCategory = createMockCategory({ id: 1, name: 'Work', icon: '💼' });
      const personalCategory = createMockCategory({ id: 2, name: 'Personal', icon: '🏠' });

      (categoryService.getCategories as jest.Mock).mockResolvedValue({
        categories: [workCategory, personalCategory],
        error: null,
      });

      await useCategoryStore.getState().fetchCategories();

      expect(useCategoryStore.getState().categories).toHaveLength(2);

      // === STEP 2: Create task with category ===
      const taskWithCategory = createMockTask({
        id: 1,
        text: 'Work Task',
        categoryId: 1,
      });

      (taskService.createTask as jest.Mock).mockResolvedValue({
        task: taskWithCategory,
        error: null,
      });

      await useTaskStore.getState().addTask({
        text: 'Work Task',
        categoryId: 1,
      });

      // === STEP 3: Verify task-category relationship ===
      const task = useTaskStore.getState().tasks[0];
      const category = useCategoryStore.getState().categories.find(c => c.id === task.categoryId);

      expect(task.categoryId).toBe(1);
      expect(category?.name).toBe('Work');
      expect(category?.icon).toBe('💼');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully during task creation', async () => {
      // Arrange
      (taskService.createTask as jest.Mock).mockResolvedValue({
        task: null,
        error: 'Network error: Unable to connect to server',
      });

      // Act
      await useTaskStore.getState().addTask({ text: 'Test Task' });

      // Assert
      expect(useTaskStore.getState().tasks).toHaveLength(0);
      expect(useTaskStore.getState().error).toBe('Network error: Unable to connect to server');
    });

    it('should recover from error and successfully create task after', async () => {
      // Arrange - First attempt fails
      (taskService.createTask as jest.Mock).mockResolvedValueOnce({
        task: null,
        error: 'Server error',
      });

      // Act - First attempt
      await useTaskStore.getState().addTask({ text: 'Test Task' });

      expect(useTaskStore.getState().error).toBe('Server error');

      // Arrange - Second attempt succeeds
      const newTask = createMockTask({ id: 1, text: 'Test Task' });
      (taskService.createTask as jest.Mock).mockResolvedValueOnce({
        task: newTask,
        error: null,
      });

      // Clear error before retry
      useTaskStore.getState().clearError();

      // Act - Second attempt
      await useTaskStore.getState().addTask({ text: 'Test Task' });

      // Assert
      expect(useTaskStore.getState().tasks).toHaveLength(1);
      expect(useTaskStore.getState().error).toBeNull();
    });
  });

  describe('Complex Task Scenarios', () => {
    it('should handle monthly recurring task at end of month', async () => {
      // Arrange - Task on January 31st
      const task = createMockTask({
        id: 1,
        text: 'Monthly Report',
        dueDate: new Date('2024-01-31T10:00:00Z'),
        recurrence: 'monthly',
      });

      useTaskStore.setState({ tasks: [task] });

      (taskService.updateTask as jest.Mock).mockResolvedValue({
        task: { ...task, completed: true },
        error: null,
      });

      // February has 29 days in 2024 (leap year)
      const nextInstance = createMockTask({
        id: 2,
        text: 'Monthly Report',
        dueDate: new Date('2024-02-29T10:00:00Z'),
        recurrence: 'monthly',
      });

      (taskService.createTask as jest.Mock).mockResolvedValue({
        task: nextInstance,
        error: null,
      });

      // Act
      await useTaskStore.getState().toggleComplete(1);

      // Assert
      // New recurring instance is added to the front (position 0)
      const newTask = useTaskStore.getState().tasks[0];
      expect(newTask.dueDate?.getMonth()).toBe(1); // February (0-indexed)
    });
  });
});
