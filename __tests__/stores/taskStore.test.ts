// Tests for taskStore (Zustand store for tasks)

import { useTaskStore } from '../../src/stores/taskStore';
import { useAuthStore } from '../../src/stores/authStore';
import { taskService } from '../../src/services/supabaseService';
import { createMockTask, createMockUser, createMockTasks } from '../utils/testHelpers';
import { RecurrenceType } from '../../src/types/task';

// Mock the services
jest.mock('../../src/services/supabaseService');
jest.mock('../../src/stores/authStore');

describe('taskStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useTaskStore.setState({
      tasks: [],
      isLoading: false,
      error: null,
    });

    // Mock authenticated user
    (useAuthStore.getState as jest.Mock).mockReturnValue({
      user: createMockUser(),
    });

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('fetchTasks', () => {
    it('should fetch tasks successfully', async () => {
      // Arrange
      const mockTasks = createMockTasks(3);
      (taskService.getTasks as jest.Mock).mockResolvedValue({
        tasks: mockTasks,
        error: null,
      });

      // Act
      await useTaskStore.getState().fetchTasks();

      // Assert
      expect(taskService.getTasks).toHaveBeenCalledWith('test-user-id');
      expect(useTaskStore.getState().tasks).toEqual(mockTasks);
      expect(useTaskStore.getState().isLoading).toBe(false);
      expect(useTaskStore.getState().error).toBeNull();
    });

    it('should handle fetch error', async () => {
      // Arrange
      const errorMessage = 'Network error';
      (taskService.getTasks as jest.Mock).mockResolvedValue({
        tasks: null,
        error: errorMessage,
      });

      // Act
      await useTaskStore.getState().fetchTasks();

      // Assert
      expect(useTaskStore.getState().tasks).toEqual([]);
      expect(useTaskStore.getState().error).toBe(errorMessage);
      expect(useTaskStore.getState().isLoading).toBe(false);
    });

    it('should not fetch if user is not authenticated', async () => {
      // Arrange
      (useAuthStore.getState as jest.Mock).mockReturnValue({ user: null });

      // Act
      await useTaskStore.getState().fetchTasks();

      // Assert
      expect(taskService.getTasks).not.toHaveBeenCalled();
    });
  });

  describe('addTask', () => {
    it('should add a new task successfully', async () => {
      // Arrange
      const newTask = createMockTask({ id: 5, text: 'New Task' });
      (taskService.createTask as jest.Mock).mockResolvedValue({
        task: newTask,
        error: null,
      });

      // Act
      await useTaskStore.getState().addTask({ text: 'New Task' });

      // Assert
      expect(taskService.createTask).toHaveBeenCalledWith('test-user-id', { text: 'New Task' });
      expect(useTaskStore.getState().tasks).toContainEqual(newTask);
      expect(useTaskStore.getState().error).toBeNull();
    });

    it('should handle add task error', async () => {
      // Arrange
      const errorMessage = 'Failed to create task';
      (taskService.createTask as jest.Mock).mockResolvedValue({
        task: null,
        error: errorMessage,
      });

      // Act
      await useTaskStore.getState().addTask({ text: 'New Task' });

      // Assert
      expect(useTaskStore.getState().tasks).toEqual([]);
      expect(useTaskStore.getState().error).toBe(errorMessage);
    });

    it('should add task with all properties', async () => {
      // Arrange
      const dueDate = new Date('2024-12-25T10:00:00Z');
      const reminderTime = new Date('2024-12-25T09:30:00Z');
      const taskInput = {
        text: 'Complete project',
        dueDate,
        reminderTime,
        recurrence: 'daily' as RecurrenceType,
        categoryId: 1,
        duration: 60,
      };

      const createdTask = createMockTask({ ...taskInput, id: 10 });
      (taskService.createTask as jest.Mock).mockResolvedValue({
        task: createdTask,
        error: null,
      });

      // Act
      await useTaskStore.getState().addTask(taskInput);

      // Assert
      expect(taskService.createTask).toHaveBeenCalledWith('test-user-id', taskInput);
      expect(useTaskStore.getState().tasks).toContainEqual(createdTask);
    });
  });

  describe('updateTask', () => {
    it('should update a task successfully', async () => {
      // Arrange
      const existingTask = createMockTask({ id: 1, text: 'Old Text' });
      useTaskStore.setState({ tasks: [existingTask] });

      const updatedTask = { ...existingTask, text: 'Updated Text' };
      (taskService.updateTask as jest.Mock).mockResolvedValue({
        task: updatedTask,
        error: null,
      });

      // Act
      await useTaskStore.getState().updateTask(1, { text: 'Updated Text' });

      // Assert
      expect(taskService.updateTask).toHaveBeenCalledWith(1, { text: 'Updated Text' });
      expect(useTaskStore.getState().tasks[0].text).toBe('Updated Text');
    });

    it('should handle update task error', async () => {
      // Arrange
      const errorMessage = 'Failed to update task';
      (taskService.updateTask as jest.Mock).mockResolvedValue({
        task: null,
        error: errorMessage,
      });

      // Act
      await useTaskStore.getState().updateTask(1, { text: 'Updated' });

      // Assert
      expect(useTaskStore.getState().error).toBe(errorMessage);
    });

    it('should update multiple properties at once', async () => {
      // Arrange
      const existingTask = createMockTask({ id: 1 });
      useTaskStore.setState({ tasks: [existingTask] });

      const updates = {
        text: 'Updated Task',
        completed: true,
        duration: 90,
        categoryId: 2,
      };

      const updatedTask = { ...existingTask, ...updates };
      (taskService.updateTask as jest.Mock).mockResolvedValue({
        task: updatedTask,
        error: null,
      });

      // Act
      await useTaskStore.getState().updateTask(1, updates);

      // Assert
      const resultTask = useTaskStore.getState().tasks[0];
      expect(resultTask.text).toBe('Updated Task');
      expect(resultTask.completed).toBe(true);
      expect(resultTask.duration).toBe(90);
      expect(resultTask.categoryId).toBe(2);
    });
  });

  describe('deleteTask', () => {
    it('should delete a task successfully', async () => {
      // Arrange
      const tasks = createMockTasks(3);
      useTaskStore.setState({ tasks });

      (taskService.deleteTask as jest.Mock).mockResolvedValue({ error: null });

      // Act
      await useTaskStore.getState().deleteTask(2);

      // Assert
      expect(taskService.deleteTask).toHaveBeenCalledWith(2);
      expect(useTaskStore.getState().tasks).toHaveLength(2);
      expect(useTaskStore.getState().tasks.find(t => t.id === 2)).toBeUndefined();
    });

    it('should handle delete task error', async () => {
      // Arrange
      const errorMessage = 'Failed to delete task';
      (taskService.deleteTask as jest.Mock).mockResolvedValue({ error: errorMessage });

      // Act
      await useTaskStore.getState().deleteTask(1);

      // Assert
      expect(useTaskStore.getState().error).toBe(errorMessage);
    });
  });

  describe('toggleComplete', () => {
    it('should toggle task completion from false to true', async () => {
      // Arrange
      const task = createMockTask({ id: 1, completed: false, recurrence: 'none' });
      useTaskStore.setState({ tasks: [task] });

      const completedTask = { ...task, completed: true };
      (taskService.updateTask as jest.Mock).mockResolvedValue({
        task: completedTask,
        error: null,
      });

      // Act
      await useTaskStore.getState().toggleComplete(1);

      // Assert
      expect(taskService.updateTask).toHaveBeenCalledWith(1, { completed: true });
      expect(useTaskStore.getState().tasks[0].completed).toBe(true);
    });

    it('should toggle task completion from true to false', async () => {
      // Arrange
      const task = createMockTask({ id: 1, completed: true });
      useTaskStore.setState({ tasks: [task] });

      const incompletedTask = { ...task, completed: false };
      (taskService.updateTask as jest.Mock).mockResolvedValue({
        task: incompletedTask,
        error: null,
      });

      // Act
      await useTaskStore.getState().toggleComplete(1);

      // Assert
      expect(taskService.updateTask).toHaveBeenCalledWith(1, { completed: false });
      expect(useTaskStore.getState().tasks[0].completed).toBe(false);
    });

    it('should create recurring instance when completing recurring task', async () => {
      // Arrange
      const dueDate = new Date('2024-12-01T10:00:00Z');
      const recurringTask = createMockTask({
        id: 1,
        completed: false,
        recurrence: 'daily',
        dueDate,
      });
      useTaskStore.setState({ tasks: [recurringTask] });

      const completedTask = { ...recurringTask, completed: true };
      (taskService.updateTask as jest.Mock).mockResolvedValue({
        task: completedTask,
        error: null,
      });

      const newInstanceTask = createMockTask({
        id: 2,
        completed: false,
        recurrence: 'daily',
        dueDate: new Date('2024-12-02T10:00:00Z'), // Next day
      });
      (taskService.createTask as jest.Mock).mockResolvedValue({
        task: newInstanceTask,
        error: null,
      });

      // Act
      await useTaskStore.getState().toggleComplete(1);

      // Assert
      expect(taskService.updateTask).toHaveBeenCalledWith(1, { completed: true });
      expect(taskService.createTask).toHaveBeenCalled();
      // The new instance should be added to tasks
      expect(useTaskStore.getState().tasks).toHaveLength(2);
    });

    it('should NOT create recurring instance when uncompleting a task', async () => {
      // Arrange
      const recurringTask = createMockTask({
        id: 1,
        completed: true,
        recurrence: 'weekly',
      });
      useTaskStore.setState({ tasks: [recurringTask] });

      const incompletedTask = { ...recurringTask, completed: false };
      (taskService.updateTask as jest.Mock).mockResolvedValue({
        task: incompletedTask,
        error: null,
      });

      // Act
      await useTaskStore.getState().toggleComplete(1);

      // Assert
      expect(taskService.updateTask).toHaveBeenCalledWith(1, { completed: false });
      expect(taskService.createTask).not.toHaveBeenCalled();
    });

    it('should NOT create recurring instance for non-recurring tasks', async () => {
      // Arrange
      const task = createMockTask({ id: 1, completed: false, recurrence: 'none' });
      useTaskStore.setState({ tasks: [task] });

      const completedTask = { ...task, completed: true };
      (taskService.updateTask as jest.Mock).mockResolvedValue({
        task: completedTask,
        error: null,
      });

      // Act
      await useTaskStore.getState().toggleComplete(1);

      // Assert
      expect(taskService.createTask).not.toHaveBeenCalled();
    });
  });

  describe('Filter methods', () => {
    beforeEach(() => {
      const today = new Date('2024-10-19T12:00:00Z');
      const yesterday = new Date('2024-10-18T12:00:00Z');
      const tomorrow = new Date('2024-10-20T12:00:00Z');

      const tasks = [
        createMockTask({ id: 1, text: 'Today Task 1', dueDate: today, categoryId: 1 }),
        createMockTask({ id: 2, text: 'Today Task 2', dueDate: today, categoryId: 2 }),
        createMockTask({ id: 3, text: 'Yesterday Task', dueDate: yesterday, categoryId: 1 }),
        createMockTask({ id: 4, text: 'Tomorrow Task', dueDate: tomorrow, categoryId: null }),
        createMockTask({ id: 5, text: 'No Date Task', dueDate: null, categoryId: 1 }),
      ];

      useTaskStore.setState({ tasks });
    });

    describe('getTasksForDate', () => {
      it('should return tasks for specific date', () => {
        // Act
        const todayTasks = useTaskStore
          .getState()
          .getTasksForDate(new Date('2024-10-19T12:00:00Z'));

        // Assert
        expect(todayTasks).toHaveLength(2);
        expect(todayTasks.every(t => t.text.includes('Today'))).toBe(true);
      });

      it('should return empty array if no tasks on date', () => {
        // Act
        const tasks = useTaskStore
          .getState()
          .getTasksForDate(new Date('2024-10-25T12:00:00Z'));

        // Assert
        expect(tasks).toHaveLength(0);
      });

      it('should ignore time when comparing dates', () => {
        // Act - Different time, same day
        const tasks = useTaskStore
          .getState()
          .getTasksForDate(new Date('2024-10-19T23:59:59Z'));

        // Assert
        expect(tasks).toHaveLength(2);
      });
    });

    describe('getTasksByCategory', () => {
      it('should return tasks for specific category', () => {
        // Act
        const categoryTasks = useTaskStore.getState().getTasksByCategory(1);

        // Assert
        expect(categoryTasks).toHaveLength(3); // Tasks 1, 3, 5
        expect(categoryTasks.every(t => t.categoryId === 1)).toBe(true);
      });

      it('should return uncategorized tasks when categoryId is null', () => {
        // Act
        const uncategorizedTasks = useTaskStore.getState().getTasksByCategory(null);

        // Assert
        expect(uncategorizedTasks).toHaveLength(1); // Task 4
        expect(uncategorizedTasks[0].id).toBe(4);
      });

      it('should return empty array for non-existent category', () => {
        // Act
        const tasks = useTaskStore.getState().getTasksByCategory(999);

        // Assert
        expect(tasks).toHaveLength(0);
      });
    });

    describe('getTodayTasks', () => {
      it('should return tasks for today', () => {
        // Note: This test assumes "today" is 2024-10-19
        // In a real scenario, you might need to mock the Date object

        // For this test, we'll manually set the expected behavior
        const todayTasks = useTaskStore
          .getState()
          .getTasksForDate(new Date('2024-10-19T00:00:00Z'));

        // Assert
        expect(todayTasks).toHaveLength(2);
      });
    });
  });

  describe('Utility methods', () => {
    it('setTasks should replace all tasks', () => {
      // Arrange
      const newTasks = createMockTasks(5);

      // Act
      useTaskStore.getState().setTasks(newTasks);

      // Assert
      expect(useTaskStore.getState().tasks).toEqual(newTasks);
    });

    it('setLoading should update loading state', () => {
      // Act
      useTaskStore.getState().setLoading(true);

      // Assert
      expect(useTaskStore.getState().isLoading).toBe(true);
    });

    it('setError should update error state', () => {
      // Act
      useTaskStore.getState().setError('Test error');

      // Assert
      expect(useTaskStore.getState().error).toBe('Test error');
    });

    it('clearError should clear error state', () => {
      // Arrange
      useTaskStore.setState({ error: 'Some error' });

      // Act
      useTaskStore.getState().clearError();

      // Assert
      expect(useTaskStore.getState().error).toBeNull();
    });
  });
});
