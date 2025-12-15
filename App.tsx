import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppNavigator } from './src/navigation/AppNavigator';
import { initializeSound } from './src/utils/sound';
import { requestNotificationPermissions } from './src/services/notificationService';
import { startRecurringTaskProcessor } from './src/services/recurringTaskService';

export default function App() {
  useEffect(() => {
    // Initialize audio and notifications when app loads
    const initialize = async () => {
      await initializeSound();
      await requestNotificationPermissions();
    };
    initialize();

    // DISABLED: Recurring task processor was creating duplicates
    // Recurring instances are already created when tasks are completed (see taskStore.toggleComplete)
    // const stopProcessor = startRecurringTaskProcessor();

    // Cleanup on unmount
    // return () => {
    //   stopProcessor();
    // };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppNavigator />
      <StatusBar style="auto" />
    </GestureHandlerRootView>
  );
}
