// Notification service for scheduling task reminders

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Task } from '../types/task';

// Configure how notifications should be handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Request notification permissions
export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Notification permissions not granted');
      return false;
    }

    // Set up notification channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('task-reminders', {
        name: 'Task Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        sound: 'default',
      });
    }

    return true;
  } catch (error) {
    console.error('Failed to request notification permissions:', error);
    return false;
  }
};

// Schedule a reminder notification for a task
export const scheduleTaskReminder = async (task: Task): Promise<string | null> => {
  try {
    // Only schedule if task has a reminder time
    if (!task.reminderTime) {
      return null;
    }

    const reminderDate = new Date(task.reminderTime);
    const now = new Date();

    // Don't schedule if reminder time is in the past
    if (reminderDate <= now) {
      console.warn('Reminder time is in the past, skipping notification');
      return null;
    }

    // Cancel any existing notification for this task
    if (task.id) {
      await cancelTaskReminder(task.id);
    }

    // Schedule the notification
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏰ Task Reminder',
        body: task.text,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { taskId: task.id },
      },
      trigger: {
        date: reminderDate,
      },
      identifier: `task-reminder-${task.id}`,
    });

    console.log(`Scheduled reminder for task ${task.id} at ${reminderDate.toISOString()}`);
    return notificationId;
  } catch (error) {
    console.error('Failed to schedule task reminder:', error);
    return null;
  }
};

// Cancel a task reminder notification
export const cancelTaskReminder = async (taskId: number | string): Promise<void> => {
  try {
    await Notifications.cancelScheduledNotificationAsync(`task-reminder-${taskId}`);
    console.log(`Cancelled reminder for task ${taskId}`);
  } catch (error) {
    console.error('Failed to cancel task reminder:', error);
  }
};

// Cancel all scheduled notifications
export const cancelAllReminders = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('Cancelled all scheduled reminders');
  } catch (error) {
    console.error('Failed to cancel all reminders:', error);
  }
};

// Get all scheduled notifications
export const getScheduledReminders = async (): Promise<Notifications.NotificationRequest[]> => {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    return notifications;
  } catch (error) {
    console.error('Failed to get scheduled reminders:', error);
    return [];
  }
};

// Reschedule all task reminders (useful after app updates or permission changes)
export const rescheduleAllTaskReminders = async (tasks: Task[]): Promise<void> => {
  try {
    // Cancel all existing reminders
    await cancelAllReminders();

    // Schedule reminders for all tasks that have reminder times
    const scheduledCount = await Promise.all(
      tasks
        .filter(task => task.reminderTime && !task.completed)
        .map(task => scheduleTaskReminder(task))
    );

    console.log(`Rescheduled ${scheduledCount.filter(id => id !== null).length} task reminders`);
  } catch (error) {
    console.error('Failed to reschedule task reminders:', error);
  }
};
