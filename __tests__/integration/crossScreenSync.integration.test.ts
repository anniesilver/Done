// Cross-screen synchronization integration tests
// Tests verify that task operations in one screen are immediately reflected in other screens

import { useTaskStore } from '../../src/stores/taskStore';
import { useAuthStore } from '../../src/stores/authStore';
import { useCategoryStore } from '../../src/stores/categoryStore';
import { useUiStore } from '../../src/stores/uiStore';
import { taskService } from '../../src/services/supabaseService';
import { createMockUser, createMockTask } from '../utils/testHelpers';

// Mock the services
jest.mock('../../src/services/supabaseService');
jest.mock('../../src/stores/authStore');

/**
 * Cross-Screen Synchronization Tests
 *
 * These tests validate that the Zustand state management system properly synchronizes
 * task data across different screens in the application (Today, Calendar, Tasks).
 *
 * The bug being tested:
 * - When tasks are deleted/completed in Calendar view, they still appear in Today view
 *
 * Root cause:
 * - The issue is NOT with Zustand state management (which works correctly)
 * - The issue is likely with React Navigation screen lifecycle and re-rendering
 * - Screens may not re-render when navigating back from another screen
 *
 * These tests verify:
 * 1. Store state updates correctly after delete/toggle operations
 * 2. Different screens would receive the same updated data from the store
 * 3. Date-based filtering works correctly (getTodayTasks, getTasksForDate)
 */
describe('Cross-Screen Synchronization Tests', () => {
  const mockUser = createMockUser();

  beforeEach(() => {
    // Reset all stores to initial state
    useTaskStore.setState({ tasks: [], isLoading: false, error: null });
    useCategoryStore.setState({ categories: [], isLoading: false, error: null });
    useUiStore.setState({
      currentView: 'today',
      selectedDate: new Date('2025-10-19T00:00:00Z'),
      selectedCategory: null,
      calendarViewMode: 'monthly',
    });

    // Mock authenticated user
    (useAuthStore.getState as jest.Mock).mockReturnValue({ user: mockUser });

    jest.clearAllMocks();
  });

  describe('Task Deletion Synchronization', () => {
    it('should remove deleted task from store state immediately', async () => {
      // Arrange - Create tasks for today
      const today = new Date('2025-10-19T00:00:00Z');
      const tasks = [
        createMockTask({ id: 1, text: 'Morning Meeting', dueDate: today }),
        createMockTask({ id: 2, text: 'Code Review', dueDate: today }),
        createMockTask({ id: 3, text: 'Lunch Break', dueDate: today }),
      ];

      useTaskStore.setState({ tasks });

      // Mock successful deletion
      (taskService.deleteTask as jest.Mock).mockResolvedValue({ error: null });

      // Act - Delete task in Calendar view
      await useTaskStore.getState().deleteTask(2);

      // Assert - Verify store state is updated
      const storeState = useTaskStore.getState();
      expect(storeState.tasks).toHaveLength(2);
      expect(storeState.tasks.find((t) => t.id === 2)).toBeUndefined();
      expect(taskService.deleteTask).toHaveBeenCalledWith(2);
    });

    it('should reflect deleted task across both Calendar and Today views', async () => {
      // Arrange - Set up tasks for today
      const today = new Date('2025-10-19T00:00:00Z');
      const tasks = [
        createMockTask({ id: 1, text: 'Task 1', dueDate: today }),
        createMockTask({ id: 2, text: 'Task 2', dueDate: today }),
        createMockTask({ id: 3, text: 'Task 3', dueDate: today }),
      ];

      useTaskStore.setState({ tasks });
      useUiStore.setState({ selectedDate: today });

      // Verify initial state - both views would show 3 tasks
      expect(useTaskStore.getState().getTodayTasks()).toHaveLength(3);
      expect(useTaskStore.getState().getTasksForDate(today)).toHaveLength(3);

      // Mock deletion
      (taskService.deleteTask as jest.Mock).mockResolvedValue({ error: null });

      // Act - Delete task (simulating deletion from Calendar view)
      await useTaskStore.getState().deleteTask(2);

      // Assert - Both Calendar and Today views would now show 2 tasks
      const todayTasks = useTaskStore.getState().getTodayTasks();
      const calendarTasks = useTaskStore.getState().getTasksForDate(today);

      expect(todayTasks).toHaveLength(2);
      expect(calendarTasks).toHaveLength(2);
      expect(todayTasks.find((t) => t.id === 2)).toBeUndefined();
      expect(calendarTasks.find((t) => t.id === 2)).toBeUndefined();
    });

    it('should handle deletion of multiple tasks sequentially', async () => {
      // Arrange
      const today = new Date('2025-10-19T00:00:00Z');
      const tasks = [
        createMockTask({ id: 1, text: 'Task 1', dueDate: today }),
        createMockTask({ id: 2, text: 'Task 2', dueDate: today }),
        createMockTask({ id: 3, text: 'Task 3', dueDate: today }),
        createMockTask({ id: 4, text: 'Task 4', dueDate: today }),
      ];

      useTaskStore.setState({ tasks });
      (taskService.deleteTask as jest.Mock).mockResolvedValue({ error: null });

      // Act - Delete multiple tasks
      await useTaskStore.getState().deleteTask(1);
      await useTaskStore.getState().deleteTask(3);

      // Assert
      const remainingTasks = useTaskStore.getState().getTodayTasks();
      expect(remainingTasks).toHaveLength(2);
      expect(remainingTasks.map((t) => t.id)).toEqual([2, 4]);
    });

    it('should not affect tasks from other dates when deleting today\'s tasks', async () => {
      // Arrange
      const today = new Date('2025-10-19T00:00:00Z');
      const tomorrow = new Date('2025-10-20T00:00:00Z');
      const tasks = [
        createMockTask({ id: 1, text: 'Today Task 1', dueDate: today }),
        createMockTask({ id: 2, text: 'Today Task 2', dueDate: today }),
        createMockTask({ id: 3, text: 'Tomorrow Task 1', dueDate: tomorrow }),
        createMockTask({ id: 4, text: 'Tomorrow Task 2', dueDate: tomorrow }),
      ];

      useTaskStore.setState({ tasks });
      (taskService.deleteTask as jest.Mock).mockResolvedValue({ error: null });

      // Act - Delete today's task
      await useTaskStore.getState().deleteTask(1);

      // Assert - Today's tasks reduced, tomorrow's unchanged
      expect(useTaskStore.getState().getTodayTasks()).toHaveLength(1);
      expect(useTaskStore.getState().getTasksForDate(tomorrow)).toHaveLength(2);
    });
  });

  describe('Task Completion (Toggle) Synchronization', () => {
    it('should update task completion status in store immediately', async () => {
      // Arrange
      const today = new Date('2025-10-19T00:00:00Z');
      const task = createMockTask({
        id: 1,
        text: 'Complete Report',
        dueDate: today,
        completed: false,
      });

      useTaskStore.setState({ tasks: [task] });

      const completedTask = { ...task, completed: true };
      (taskService.updateTask as jest.Mock).mockResolvedValue({
        task: completedTask,
        error: null,
      });

      // Act - Toggle completion in Calendar view
      await useTaskStore.getState().toggleComplete(1);

      // Assert - Store state updated
      const updatedTask = useTaskStore.getState().tasks.find((t) => t.id === 1);
      expect(updatedTask?.completed).toBe(true);
      expect(taskService.updateTask).toHaveBeenCalledWith(1, { completed: true });
    });

    it('should reflect task completion across Calendar and Today views', async () => {
      // Arrange
      const today = new Date('2025-10-19T00:00:00Z');
      const tasks = [
        createMockTask({ id: 1, text: 'Task 1', dueDate: today, completed: false }),
        createMockTask({ id: 2, text: 'Task 2', dueDate: today, completed: false }),
      ];

      useTaskStore.setState({ tasks });
      useUiStore.setState({ selectedDate: today });

      (taskService.updateTask as jest.Mock).mockResolvedValue({
        task: { ...tasks[0], completed: true },
        error: null,
      });

      // Act - Toggle task in Calendar view
      await useTaskStore.getState().toggleComplete(1);

      // Assert - Both views would show updated completion status
      const todayTasks = useTaskStore.getState().getTodayTasks();
      const calendarTasks = useTaskStore.getState().getTasksForDate(today);

      expect(todayTasks.find((t) => t.id === 1)?.completed).toBe(true);
      expect(calendarTasks.find((t) => t.id === 1)?.completed).toBe(true);
    });

    it('should handle toggling between completed and incomplete states', async () => {
      // Arrange
      const today = new Date('2025-10-19T00:00:00Z');
      const task = createMockTask({
        id: 1,
        text: 'Toggle Task',
        dueDate: today,
        completed: false,
        recurrence: 'none', // Non-recurring to avoid creating new instance
      });

      useTaskStore.setState({ tasks: [task] });

      // Act & Assert - Toggle to completed
      (taskService.updateTask as jest.Mock).mockResolvedValue({
        task: { ...task, completed: true },
        error: null,
      });

      await useTaskStore.getState().toggleComplete(1);
      expect(useTaskStore.getState().tasks[0].completed).toBe(true);

      // Act & Assert - Toggle back to incomplete
      (taskService.updateTask as jest.Mock).mockResolvedValue({
        task: { ...task, completed: false },
        error: null,
      });

      await useTaskStore.getState().toggleComplete(1);
      expect(useTaskStore.getState().tasks[0].completed).toBe(false);
    });

    it('should maintain completion status when navigating between screens', async () => {
      // Arrange
      const today = new Date('2025-10-19T00:00:00Z');
      const tasks = [
        createMockTask({ id: 1, text: 'Task 1', dueDate: today, completed: false }),
        createMockTask({ id: 2, text: 'Task 2', dueDate: today, completed: true }),
        createMockTask({ id: 3, text: 'Task 3', dueDate: today, completed: false }),
      ];

      useTaskStore.setState({ tasks });

      // Act - Simulate navigation flow: Today -> Calendar -> Today
      // (In real app, this would involve screen focus/blur events)

      // Verify initial state in "Today view"
      const todayTasksInitial = useTaskStore.getState().getTodayTasks();
      expect(todayTasksInitial.filter((t) => t.completed)).toHaveLength(1);

      // Simulate selecting today's date in "Calendar view"
      useUiStore.setState({ selectedDate: today });
      const calendarTasks = useTaskStore.getState().getTasksForDate(today);
      expect(calendarTasks.filter((t) => t.completed)).toHaveLength(1);

      // Verify "Today view" still shows correct state
      const todayTasksFinal = useTaskStore.getState().getTodayTasks();
      expect(todayTasksFinal.filter((t) => t.completed)).toHaveLength(1);
    });
  });

  describe('Date-Based Filtering Consistency', () => {
    it('should return identical task sets for getTodayTasks and getTasksForDate(today)', () => {
      // Arrange
      const today = new Date('2025-10-19T00:00:00Z');
      const yesterday = new Date('2025-10-18T00:00:00Z');
      const tomorrow = new Date('2025-10-20T00:00:00Z');

      const tasks = [
        createMockTask({ id: 1, text: 'Yesterday', dueDate: yesterday }),
        createMockTask({ id: 2, text: 'Today 1', dueDate: today }),
        createMockTask({ id: 3, text: 'Today 2', dueDate: today }),
        createMockTask({ id: 4, text: 'Tomorrow', dueDate: tomorrow }),
      ];

      useTaskStore.setState({ tasks });

      // Mock today's date for getTodayTasks
      const originalDate = global.Date;
      global.Date = class extends originalDate {
        constructor() {
          super();
          return today;
        }
      } as any;

      // Act
      const todayTasks = useTaskStore.getState().getTodayTasks();
      const tasksForToday = useTaskStore.getState().getTasksForDate(today);

      // Assert
      expect(todayTasks).toEqual(tasksForToday);
      expect(todayTasks).toHaveLength(2);

      // Cleanup
      global.Date = originalDate;
    });

    it('should handle timezone-normalized dates correctly', () => {
      // Arrange - Create tasks with different time components but same date
      const morning = new Date('2025-10-19T08:00:00Z');
      const afternoon = new Date('2025-10-19T14:00:00Z');
      const evening = new Date('2025-10-19T20:00:00Z');

      const tasks = [
        createMockTask({ id: 1, text: 'Morning Task', dueDate: morning }),
        createMockTask({ id: 2, text: 'Afternoon Task', dueDate: afternoon }),
        createMockTask({ id: 3, text: 'Evening Task', dueDate: evening }),
      ];

      useTaskStore.setState({ tasks });

      // Act - Get tasks for the date (ignoring time)
      const targetDate = new Date('2025-10-19T00:00:00Z');
      const tasksForDate = useTaskStore.getState().getTasksForDate(targetDate);

      // Assert - All tasks from the same day are returned
      expect(tasksForDate).toHaveLength(3);
    });

    it('should handle edge case of midnight boundary', () => {
      // Arrange - Tasks right at midnight boundaries
      const endOfYesterday = new Date('2025-10-18T23:59:59Z');
      const startOfToday = new Date('2025-10-19T00:00:00Z');
      const endOfToday = new Date('2025-10-19T23:59:59Z');
      const startOfTomorrow = new Date('2025-10-20T00:00:00Z');

      const tasks = [
        createMockTask({ id: 1, text: 'End of Yesterday', dueDate: endOfYesterday }),
        createMockTask({ id: 2, text: 'Start of Today', dueDate: startOfToday }),
        createMockTask({ id: 3, text: 'End of Today', dueDate: endOfToday }),
        createMockTask({ id: 4, text: 'Start of Tomorrow', dueDate: startOfTomorrow }),
      ];

      useTaskStore.setState({ tasks });

      // Act
      const todayDate = new Date('2025-10-19T00:00:00Z');
      const tasksForToday = useTaskStore.getState().getTasksForDate(todayDate);

      // Assert - Only tasks from Oct 19 are included
      expect(tasksForToday).toHaveLength(2);
      expect(tasksForToday.map((t) => t.id)).toEqual([2, 3]);
    });
  });

  describe('Complex Cross-Screen Scenarios', () => {
    it('should handle rapid task operations across multiple screens', async () => {
      // Arrange - Simulate user quickly switching between screens and performing operations
      const today = new Date('2025-10-19T00:00:00Z');
      const tasks = [
        createMockTask({ id: 1, text: 'Task 1', dueDate: today, completed: false }),
        createMockTask({ id: 2, text: 'Task 2', dueDate: today, completed: false }),
        createMockTask({ id: 3, text: 'Task 3', dueDate: today, completed: false }),
      ];

      useTaskStore.setState({ tasks });

      (taskService.updateTask as jest.Mock).mockResolvedValue({
        task: { ...tasks[0], completed: true },
        error: null,
      });
      (taskService.deleteTask as jest.Mock).mockResolvedValue({ error: null });

      // Act - Rapid operations
      // 1. Complete task in Calendar view
      await useTaskStore.getState().toggleComplete(1);

      // 2. Navigate to Today view (verify state)
      expect(useTaskStore.getState().getTodayTasks()[0].completed).toBe(true);

      // 3. Delete task in Today view
      await useTaskStore.getState().deleteTask(2);

      // 4. Navigate back to Calendar view (verify state)
      expect(useTaskStore.getState().getTasksForDate(today)).toHaveLength(2);
      expect(useTaskStore.getState().getTasksForDate(today).find((t) => t.id === 2)).toBeUndefined();
    });

    it('should handle simultaneous task count updates for Calendar and Today views', async () => {
      // Arrange
      const today = new Date('2025-10-19T00:00:00Z');
      const tasks = [
        createMockTask({ id: 1, text: 'Task 1', dueDate: today }),
        createMockTask({ id: 2, text: 'Task 2', dueDate: today }),
        createMockTask({ id: 3, text: 'Task 3', dueDate: today }),
      ];

      useTaskStore.setState({ tasks });
      useUiStore.setState({ selectedDate: today });

      // Initial counts
      const initialTodayCount = useTaskStore.getState().getTodayTasks().length;
      const initialCalendarCount = useTaskStore.getState().getTasksForDate(today).length;
      expect(initialTodayCount).toBe(3);
      expect(initialCalendarCount).toBe(3);

      // Act - Delete a task
      (taskService.deleteTask as jest.Mock).mockResolvedValue({ error: null });
      await useTaskStore.getState().deleteTask(2);

      // Assert - Both views show updated count
      const finalTodayCount = useTaskStore.getState().getTodayTasks().length;
      const finalCalendarCount = useTaskStore.getState().getTasksForDate(today).length;
      expect(finalTodayCount).toBe(2);
      expect(finalCalendarCount).toBe(2);
    });

    it('should maintain referential integrity when tasks are modified', async () => {
      // Arrange
      const today = new Date('2025-10-19T00:00:00Z');
      const task = createMockTask({
        id: 1,
        text: 'Original Text',
        dueDate: today,
      });

      useTaskStore.setState({ tasks: [task] });

      // Get references from different "views"
      const todayViewTaskBefore = useTaskStore.getState().getTodayTasks()[0];
      const calendarViewTaskBefore = useTaskStore.getState().getTasksForDate(today)[0];

      // Act - Update task
      const updatedTask = { ...task, text: 'Updated Text' };
      (taskService.updateTask as jest.Mock).mockResolvedValue({
        task: updatedTask,
        error: null,
      });

      await useTaskStore.getState().updateTask(1, { text: 'Updated Text' });

      // Assert - Both views see the update
      const todayViewTaskAfter = useTaskStore.getState().getTodayTasks()[0];
      const calendarViewTaskAfter = useTaskStore.getState().getTasksForDate(today)[0];

      expect(todayViewTaskAfter.text).toBe('Updated Text');
      expect(calendarViewTaskAfter.text).toBe('Updated Text');
    });
  });

  describe('Error Handling in Cross-Screen Context', () => {
    it('should not corrupt state if deletion fails in one screen', async () => {
      // Arrange
      const today = new Date('2025-10-19T00:00:00Z');
      const tasks = [
        createMockTask({ id: 1, text: 'Task 1', dueDate: today }),
        createMockTask({ id: 2, text: 'Task 2', dueDate: today }),
      ];

      useTaskStore.setState({ tasks });

      // Mock failed deletion
      (taskService.deleteTask as jest.Mock).mockResolvedValue({
        error: 'Network error',
      });

      // Act
      await useTaskStore.getState().deleteTask(1);

      // Assert - Tasks remain unchanged in both views
      expect(useTaskStore.getState().getTodayTasks()).toHaveLength(2);
      expect(useTaskStore.getState().getTasksForDate(today)).toHaveLength(2);
      expect(useTaskStore.getState().error).toBe('Network error');
    });

    it('should maintain consistency if toggle fails during cross-screen navigation', async () => {
      // Arrange
      const today = new Date('2025-10-19T00:00:00Z');
      const task = createMockTask({
        id: 1,
        text: 'Task 1',
        dueDate: today,
        completed: false,
      });

      useTaskStore.setState({ tasks: [task] });

      // Mock failed toggle
      (taskService.updateTask as jest.Mock).mockResolvedValue({
        task: null,
        error: 'Server error',
      });

      // Act
      await useTaskStore.getState().toggleComplete(1);

      // Assert - Task remains incomplete in both views
      expect(useTaskStore.getState().getTodayTasks()[0].completed).toBe(false);
      expect(useTaskStore.getState().getTasksForDate(today)[0].completed).toBe(false);
    });
  });

  describe('Selected Date Synchronization', () => {
    it('should maintain selected date when switching between views', () => {
      // Arrange
      const selectedDate = new Date('2025-10-19T00:00:00Z');

      // Act - Select date in Calendar view
      useUiStore.getState().setSelectedDate(selectedDate);

      // Assert - Selected date is available across all views
      expect(useUiStore.getState().selectedDate).toEqual(selectedDate);

      // Simulate navigation to another screen and back
      const dateAfterNavigation = useUiStore.getState().selectedDate;
      expect(dateAfterNavigation).toEqual(selectedDate);
    });

    it('should filter tasks based on selected date across views', () => {
      // Arrange
      const date1 = new Date('2025-10-19T00:00:00Z');
      const date2 = new Date('2025-10-20T00:00:00Z');

      const tasks = [
        createMockTask({ id: 1, text: 'Task for Oct 19', dueDate: date1 }),
        createMockTask({ id: 2, text: 'Task for Oct 20', dueDate: date2 }),
      ];

      useTaskStore.setState({ tasks });

      // Act - Select different dates
      useUiStore.setState({ selectedDate: date1 });
      const tasksForDate1 = useTaskStore.getState().getTasksForDate(
        useUiStore.getState().selectedDate!
      );

      useUiStore.setState({ selectedDate: date2 });
      const tasksForDate2 = useTaskStore.getState().getTasksForDate(
        useUiStore.getState().selectedDate!
      );

      // Assert
      expect(tasksForDate1).toHaveLength(1);
      expect(tasksForDate1[0].text).toBe('Task for Oct 19');
      expect(tasksForDate2).toHaveLength(1);
      expect(tasksForDate2[0].text).toBe('Task for Oct 20');
    });
  });
});
