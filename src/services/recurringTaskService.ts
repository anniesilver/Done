// Service for managing recurring tasks automatically

import { Task, CreateTaskInput } from '../types/task';
import { calculateNextDueDate, createRecurringInstance } from '../utils/recurringTasks';
import { useTaskStore } from '../stores/taskStore';

/**
 * Check all recurring tasks and create next instances for overdue ones
 * This runs periodically to ensure recurring tasks continue even if not completed
 */
export const processOverdueRecurringTasks = async () => {
  const taskStore = useTaskStore.getState();
  const tasks = taskStore.tasks;
  const now = new Date();

  console.log('Processing overdue recurring tasks...');

  for (const task of tasks) {
    // Skip if not a recurring task
    if (task.recurrence === 'none') continue;

    // Skip if task has no due date
    if (!task.dueDate) continue;

    const dueDate = new Date(task.dueDate);

    // Check if this task is overdue (due date has passed)
    if (dueDate <= now) {
      console.log(`Found overdue recurring task: ${task.text} (Due: ${dueDate.toISOString()})`);

      // Create the next instance
      const nextInstance = createRecurringInstance(task);

      // Only create if we don't already have a future instance of this task
      const hasFutureInstance = tasks.some(t =>
        t.text === task.text &&
        t.recurrence === task.recurrence &&
        t.dueDate &&
        new Date(t.dueDate) > now
      );

      if (!hasFutureInstance) {
        console.log(`Creating next instance due at: ${nextInstance.dueDate?.toISOString()}`);
        await taskStore.addTask(nextInstance as CreateTaskInput);
      } else {
        console.log(`Future instance already exists, skipping`);
      }
    }
  }
};

/**
 * Start a periodic check for overdue recurring tasks
 * Checks every 5 minutes
 */
export const startRecurringTaskProcessor = () => {
  // Run immediately on start
  processOverdueRecurringTasks();

  // Then run every 5 minutes
  const interval = setInterval(() => {
    processOverdueRecurringTasks();
  }, 5 * 60 * 1000); // 5 minutes

  return () => clearInterval(interval);
};
