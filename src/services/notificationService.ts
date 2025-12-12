// Notification service for scheduling task reminders

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Task } from '../types/task';

// Configure how notifications should be handled when the app is in the foreground
// Only show notifications in background/when app is closed - not when actively using the app
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: false, // Don't show alert when app is in foreground
    shouldPlaySound: false, // Don't play sound when app is in foreground
    shouldSetBadge: true, // Still update badge count
  }),
});

// Request notification permissions
export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    console.log('🔔 Requesting notification permissions...');

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    console.log('📱 Existing permission status:', existingStatus);
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      console.log('❓ Permission not granted, requesting...');
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
      console.log('📱 New permission status:', status);
    }

    if (finalStatus !== 'granted') {
      console.warn('⚠️  Notification permissions not granted!');
      console.warn('   Reminders will not work without notification permissions');
      return false;
    }

    console.log('✅ Notification permissions granted');

    // Set up notification channel for Android
    if (Platform.OS === 'android') {
      console.log('📱 Setting up Android notification channel...');
      await Notifications.setNotificationChannelAsync('task-reminders', {
        name: 'Task Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        sound: 'default',
      });
      console.log('✅ Android notification channel created');
    }

    return true;
  } catch (error) {
    console.error('❌ Failed to request notification permissions:', error);
    return false;
  }
};

// Schedule a reminder notification for a task
export const scheduleTaskReminder = async (task: Task): Promise<string | null> => {
  try {
    console.log('📅 scheduleTaskReminder called for task:', task.id, 'text:', task.text);

    // Only schedule if task has a reminder time
    if (!task.reminderTime) {
      console.log('❌ No reminder time set for task:', task.id);
      return null;
    }

    const reminderDate = new Date(task.reminderTime);
    const now = new Date();

    console.log('⏰ Reminder time:', reminderDate.toISOString());
    console.log('🕐 Current time:', now.toISOString());
    console.log('⏱️  Time until reminder:', Math.round((reminderDate.getTime() - now.getTime()) / 1000 / 60), 'minutes');

    // Don't schedule if reminder time is in the past
    if (reminderDate <= now) {
      console.warn('⚠️  Reminder time is in the past, skipping notification');
      console.warn('   Reminder:', reminderDate.toISOString());
      console.warn('   Now:', now.toISOString());
      return null;
    }

    // Cancel any existing notification for this task
    if (task.id) {
      await cancelTaskReminder(task.id);
      console.log('🔕 Cancelled previous reminder for task:', task.id);
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

    console.log('✅ Successfully scheduled reminder!');
    console.log('   Notification ID:', notificationId);
    console.log('   Task:', task.id, '-', task.text);
    console.log('   Reminder time:', reminderDate.toLocaleString());

    // Verify it was scheduled
    const allScheduled = await Notifications.getAllScheduledNotificationsAsync();
    console.log('📋 Total scheduled notifications:', allScheduled.length);

    return notificationId;
  } catch (error) {
    console.error('❌ Failed to schedule task reminder:', error);
    console.error('   Task ID:', task.id);
    console.error('   Task text:', task.text);
    console.error('   Reminder time:', task.reminderTime);
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
