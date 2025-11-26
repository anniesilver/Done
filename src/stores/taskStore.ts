// Task store using Zustand - Phase 1 (Online-only, direct Supabase calls)

import { create } from 'zustand';
import { Task, CreateTaskInput, UpdateTaskInput } from '../types/task';
import { taskService } from '../services/supabaseService';
import { createRecurringInstance } from '../utils/recurringTasks';
import { useAuthStore } from './authStore';
import { playCompletionSound } from '../utils/sound';
import { scheduleTaskReminder, cancelTaskReminder } from '../services/notificationService';

interface TaskStore {
  // State
  tasks: Task[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchTasks: () => Promise<void>;
  addTask: (input: CreateTaskInput) => Promise<void>;
  updateTask: (id: number | string, updates: UpdateTaskInput) => Promise<void>;
  deleteTask: (id: number | string) => Promise<void>;
  toggleComplete: (id: number | string) => Promise<void>;

  // Filters
  getTasksForDate: (date: Date) => Task[];
  getTasksByCategory: (categoryId: number | null) => Task[];
  getTodayTasks: () => Task[];

  // Utilities
  setTasks: (tasks: Task[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  // State
  tasks: [],
  isLoading: false,
  error: null,

  // Actions
  fetchTasks: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    set({ isLoading: true, error: null });

    const { tasks, error } = await taskService.getTasks(user.id);

    if (error) {
      set({ isLoading: false, error });
      return;
    }

    set({ tasks: tasks || [], isLoading: false });
  },

  addTask: async (input: CreateTaskInput) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    set({ isLoading: true, error: null });

    const { task, error } = await taskService.createTask(user.id, input);

    if (error) {
      set({ isLoading: false, error });
      return;
    }

    if (task) {
      set((state) => ({
        tasks: [task, ...state.tasks],
        isLoading: false,
      }));

      // Schedule reminder notification if task has a reminder time
      if (task.reminderTime) {
        scheduleTaskReminder(task);
      }
    }
  },

  updateTask: async (id: number | string, updates: UpdateTaskInput) => {
    set({ isLoading: true, error: null });

    const { task, error } = await taskService.updateTask(id, updates);

    if (error) {
      set({ isLoading: false, error });
      return;
    }

    if (task) {
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? task : t)),
        isLoading: false,
      }));

      // Update reminder notification
      if (task.reminderTime && !task.completed) {
        scheduleTaskReminder(task);
      } else {
        // Cancel reminder if task is completed or reminder was removed
        cancelTaskReminder(task.id);
      }
    }
  },

  deleteTask: async (id: number | string) => {
    set({ isLoading: true, error: null });

    const { error } = await taskService.deleteTask(id);

    if (error) {
      set({ isLoading: false, error });
      return;
    }

    // Cancel reminder notification
    cancelTaskReminder(id);

    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
      isLoading: false,
    }));
  },

  toggleComplete: async (id: number | string) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return;

    console.log('toggleComplete - Task:', task.text, 'Current completed:', task.completed, 'Recurrence:', task.recurrence);

    const user = useAuthStore.getState().user;
    if (!user) return;

    const newCompleted = !task.completed;

    set({ isLoading: true, error: null });

    // Update task completion
    const { task: updatedTask, error } = await taskService.updateTask(id, {
      completed: newCompleted,
    });

    if (error) {
      set({ isLoading: false, error });
      return;
    }

    // Play completion sound when marking as done
    if (newCompleted) {
      playCompletionSound();
    }

    // If completing a recurring task, create next instance
    if (newCompleted && task.recurrence !== 'none') {
      console.log('Creating next instance for recurring task:', task.text, 'Recurrence:', task.recurrence);
      const recurringInstance = createRecurringInstance(task);
      console.log('Next instance due date:', recurringInstance.dueDate);
      await get().addTask(recurringInstance as CreateTaskInput);
    }

    if (updatedTask) {
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? updatedTask : t)),
        isLoading: false,
      }));
    }
  },

  // Filters
  getTasksForDate: (date: Date) => {
    const tasks = get().tasks;
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    return tasks.filter((task) => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() === targetDate.getTime();
    });
  },

  getTasksByCategory: (categoryId: number | null) => {
    const tasks = get().tasks;
    if (categoryId === null) {
      return tasks.filter((task) => task.categoryId === null);
    }
    return tasks.filter((task) => task.categoryId === categoryId);
  },

  getTodayTasks: () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return get().getTasksForDate(today);
  },

  // Utilities
  setTasks: (tasks: Task[]) => set({ tasks }),
  setLoading: (isLoading: boolean) => set({ isLoading }),
  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),
}));
