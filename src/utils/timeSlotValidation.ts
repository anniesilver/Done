// Time slot validation utilities for preventing overlapping tasks

import { Task } from '../types/task';

export interface TimeSlot {
  start: Date;
  end: Date;
}

/**
 * Check if two time slots overlap
 * @param slot1 First time slot
 * @param slot2 Second time slot
 * @returns true if slots overlap, false otherwise
 */
export const hasOverlap = (slot1: TimeSlot, slot2: TimeSlot): boolean => {
  const start1 = slot1.start.getTime();
  const end1 = slot1.end.getTime();
  const start2 = slot2.start.getTime();
  const end2 = slot2.end.getTime();

  // Check if slot1 starts within slot2
  if (start1 >= start2 && start1 < end2) return true;

  // Check if slot1 ends within slot2
  if (end1 > start2 && end1 <= end2) return true;

  // Check if slot1 completely contains slot2
  if (start1 <= start2 && end1 >= end2) return true;

  return false;
};

/**
 * Find all tasks that overlap with a given time slot
 * @param newSlot The new time slot to check
 * @param existingTasks Array of existing tasks
 * @returns Array of tasks that overlap with the new slot
 */
export const getOverlappingTasks = (
  newSlot: TimeSlot,
  existingTasks: Task[]
): Task[] => {
  return existingTasks.filter((task) => {
    // Skip tasks without due date or duration
    if (!task.dueDate || !task.duration || task.duration === 0) {
      return false;
    }

    const taskStart = new Date(task.dueDate);
    const taskEnd = new Date(taskStart.getTime() + task.duration * 60000); // duration in minutes

    const taskSlot: TimeSlot = {
      start: taskStart,
      end: taskEnd,
    };

    return hasOverlap(newSlot, taskSlot);
  });
};

/**
 * Check if a task can be scheduled at a specific time
 * @param dueDate The proposed start time
 * @param duration Duration in minutes
 * @param existingTasks Array of existing tasks
 * @param excludeTaskId Optional task ID to exclude (for editing)
 * @returns Object with isValid flag and array of conflicting tasks
 */
export const validateTaskSchedule = (
  dueDate: Date,
  duration: number,
  existingTasks: Task[],
  excludeTaskId?: number | string
): { isValid: boolean; conflicts: Task[] } => {
  if (!dueDate || !duration || duration === 0) {
    return { isValid: true, conflicts: [] };
  }

  const newSlot: TimeSlot = {
    start: new Date(dueDate),
    end: new Date(dueDate.getTime() + duration * 60000),
  };

  // Filter out the task being edited
  const tasksToCheck = excludeTaskId
    ? existingTasks.filter((t) => t.id !== excludeTaskId)
    : existingTasks;

  const conflicts = getOverlappingTasks(newSlot, tasksToCheck);

  return {
    isValid: conflicts.length === 0,
    conflicts,
  };
};
