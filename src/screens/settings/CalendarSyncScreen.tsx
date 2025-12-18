import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import Constants from 'expo-constants';
import {
  Text,
  Button,
  List,
  ActivityIndicator,
  Checkbox,
  Banner,
  Divider,
  IconButton,
} from 'react-native-paper';
import { useCalendarSyncStore } from '../../stores/calendarSyncStore';
import { theme, colors } from '../../config/theme';

export function CalendarSyncScreen() {
  const {
    permissionStatus,
    availableCalendars,
    selectedCalendarIds,
    isSyncing,
    lastSyncTime,
    lastBackgroundSyncTime,
    syncError,
    totalEventsImported,
    syncInterval,
    checkPermissions,
    requestPermissions,
    loadAvailableCalendars,
    toggleCalendarSelection,
    selectAllCalendars,
    deselectAllCalendars,
    setSyncInterval,
    syncCalendars,
    quickSync,
    clearSyncError,
    loadLastBackgroundSyncTime,
  } = useCalendarSyncStore();

  const [isInitializing, setIsInitializing] = useState(true);

  // Check if running in Expo Go (background fetch not supported)
  const isExpoGo = Constants.appOwnership === 'expo';

  useEffect(() => {
    initializeScreen();
  }, []);

  // Periodically refresh last background sync time
  useEffect(() => {
    const interval = setInterval(() => {
      loadLastBackgroundSyncTime();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const initializeScreen = async () => {
    setIsInitializing(true);
    await checkPermissions();
    await loadLastBackgroundSyncTime();

    // Load calendars if permissions granted
    const status = useCalendarSyncStore.getState().permissionStatus;
    if (status?.granted) {
      await loadAvailableCalendars();
    }

    setIsInitializing(false);
  };

  const handleRequestPermissions = async () => {
    const granted = await requestPermissions();

    if (granted) {
      await loadAvailableCalendars();
    } else {
      Alert.alert(
        'Permission Denied',
        'Calendar permissions are required to sync events. Please enable them in Settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      );
    }
  };

  const handleSync = async () => {
    if (selectedCalendarIds.length === 0) {
      Alert.alert('No Calendars Selected', 'Please select at least one calendar to sync.');
      return;
    }

    const result = await syncCalendars(30); // Sync next 30 days

    if (result.success) {
      Alert.alert(
        'Sync Complete',
        `Successfully imported ${result.eventsImported} event(s) as tasks.`
      );
    } else {
      Alert.alert('Sync Failed', result.errors.join('\n'));
    }
  };

  const handleQuickSync = async () => {
    const result = await quickSync();

    if (result.success) {
      Alert.alert(
        'Quick Sync Complete',
        `Successfully imported ${result.eventsImported} event(s) as tasks.`
      );
    } else {
      Alert.alert('Quick Sync Failed', result.errors.join('\n'));
    }
  };

  const formatLastSyncTime = () => {
    if (!lastSyncTime) return 'Never';

    const now = new Date();
    const diff = now.getTime() - lastSyncTime.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute(s) ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour(s) ago`;

    const days = Math.floor(hours / 24);
    return `${days} day(s) ago`;
  };

  const formatLastBackgroundSyncTime = () => {
    if (!lastBackgroundSyncTime) return 'Never';

    const now = new Date();
    const diff = now.getTime() - lastBackgroundSyncTime.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute(s) ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour(s) ago`;

    const days = Math.floor(hours / 24);
    return `${days} day(s) ago`;
  };


  if (isInitializing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={styles.loadingText}>Checking permissions...</Text>
      </View>
    );
  }

  // Permission not granted
  if (!permissionStatus?.granted) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.permissionSection}>
            <IconButton
              icon="calendar-alert"
              size={64}
              iconColor={colors.primary.main}
            />
            <Text variant="headlineSmall" style={styles.permissionTitle}>
              Calendar Access Required
            </Text>
            <Text variant="bodyMedium" style={styles.permissionDescription}>
              To sync your calendar events as tasks, we need permission to access your device
              calendar.
            </Text>
            <Text variant="bodyMedium" style={styles.permissionNote}>
              Your calendar data stays private and is only used to import events into this app.
            </Text>
            <Button
              mode="contained"
              onPress={handleRequestPermissions}
              style={styles.permissionButton}
              icon="calendar-check"
            >
              Grant Calendar Access
            </Button>
          </View>
        </View>
      </ScrollView>
    );
  }

  // Permission granted - show sync interface
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Error Banner */}
        {syncError && (
          <Banner
            visible={true}
            actions={[
              {
                label: 'Dismiss',
                onPress: clearSyncError,
              },
            ]}
            icon="alert-circle"
          >
            {syncError}
          </Banner>
        )}

        {/* Sync Status Section */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Sync Status
          </Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text variant="bodySmall" style={styles.statLabel}>
                Last Manual Sync
              </Text>
              <Text variant="bodyLarge" style={styles.statValue}>
                {formatLastSyncTime()}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="bodySmall" style={styles.statLabel}>
                Last Auto Sync
              </Text>
              <Text variant="bodyLarge" style={styles.statValue}>
                {formatLastBackgroundSyncTime()}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="bodySmall" style={styles.statLabel}>
                Events Imported
              </Text>
              <Text variant="bodyLarge" style={styles.statValue}>
                {totalEventsImported}
              </Text>
            </View>
          </View>
        </View>

        <Divider />

        {/* Sync Interval Section */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Sync Frequency
          </Text>

          {isExpoGo ? (
            <Banner
              visible={true}
              icon="information"
              style={styles.expoGoBanner}
            >
              Background sync is not available in Expo Go. Please use a development build or
              TestFlight build to enable automatic syncing.
            </Banner>
          ) : (
            <>
              <View style={styles.intervalContainer}>
                <Button
                  mode={syncInterval === 'manual' ? 'contained' : 'outlined'}
                  onPress={() => setSyncInterval('manual')}
                  style={styles.intervalButton}
                >
                  Manual
                </Button>
                <Button
                  mode={syncInterval === 'hourly' ? 'contained' : 'outlined'}
                  onPress={() => setSyncInterval('hourly')}
                  style={styles.intervalButton}
                >
                  Hourly
                </Button>
                <Button
                  mode={syncInterval === 'daily' ? 'contained' : 'outlined'}
                  onPress={() => setSyncInterval('daily')}
                  style={styles.intervalButton}
                >
                  Daily
                </Button>
              </View>
              <Text variant="bodySmall" style={styles.helperText}>
                {syncInterval === 'manual'
                  ? 'Calendar events will only sync when you tap the sync button'
                  : `Calendar events will automatically sync ${
                      syncInterval === 'hourly' ? 'every hour' : 'once per day'
                    } in the background`}
              </Text>
            </>
          )}
        </View>

        <Divider />

        {/* Sync Actions */}
        <View style={styles.section}>
          <Button
            mode="contained"
            onPress={handleSync}
            loading={isSyncing}
            disabled={isSyncing || selectedCalendarIds.length === 0}
            icon="sync"
            style={styles.syncButton}
          >
            {isSyncing ? 'Syncing...' : 'Sync Selected Calendars'}
          </Button>
          <Text variant="bodySmall" style={styles.helperText}>
            Import events from the next 30 days
          </Text>
        </View>

        <Divider />

        {/* Calendar Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Select Calendars
            </Text>
            <View style={styles.headerActions}>
              <Button onPress={selectAllCalendars} compact>
                Select All
              </Button>
              <Button onPress={deselectAllCalendars} compact>
                Clear
              </Button>
            </View>
          </View>

          {availableCalendars.length === 0 ? (
            <View style={styles.emptyState}>
              <Text variant="bodyMedium">No calendars available</Text>
              <Button
                mode="outlined"
                onPress={loadAvailableCalendars}
                style={styles.reloadButton}
                icon="reload"
              >
                Reload Calendars
              </Button>
            </View>
          ) : (
            <View>
              {availableCalendars.map((calendar) => (
                <List.Item
                  key={calendar.id}
                  title={calendar.title}
                  description={calendar.source}
                  left={() => (
                    <View style={styles.calendarIndicator}>
                      <View
                        style={[
                          styles.colorDot,
                          { backgroundColor: calendar.color },
                        ]}
                      />
                    </View>
                  )}
                  right={() => (
                    <Checkbox
                      status={
                        selectedCalendarIds.includes(calendar.id)
                          ? 'checked'
                          : 'unchecked'
                      }
                      onPress={() => toggleCalendarSelection(calendar.id)}
                    />
                  )}
                  onPress={() => toggleCalendarSelection(calendar.id)}
                />
              ))}
            </View>
          )}

          {availableCalendars.length === 0 && (
            <Button
              mode="text"
              onPress={loadAvailableCalendars}
              style={styles.loadButton}
            >
              Load Available Calendars
            </Button>
          )}
        </View>

        {/* Info Section */}
        <View style={styles.section}>
          <Text variant="bodySmall" style={styles.infoText}>
            ℹ️ Events are imported as tasks with their original due dates, reminders, and
            recurrence patterns.
          </Text>
          <Text variant="bodySmall" style={styles.infoText}>
            ℹ️ Only future events (up to 30 days ahead) are synced. Already-imported events
            won't be duplicated.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ui.background,
  },
  content: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.ui.background,
  },
  loadingText: {
    marginTop: 16,
    color: colors.text.primary,
  },
  permissionSection: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionTitle: {
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
    color: colors.text.primary,
  },
  permissionDescription: {
    marginBottom: 12,
    textAlign: 'center',
    color: colors.text.secondary,
  },
  permissionNote: {
    marginBottom: 24,
    textAlign: 'center',
    fontStyle: 'italic',
    color: colors.text.secondary,
  },
  permissionButton: {
    marginTop: 8,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.text.primary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    alignItems: 'center',
    minWidth: '30%',
  },
  statLabel: {
    color: colors.text.secondary,
    marginBottom: 4,
  },
  statValue: {
    color: colors.primary.main,
    fontWeight: 'bold',
  },
  syncButton: {
    marginBottom: 8,
  },
  intervalContainer: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 12,
  },
  intervalButton: {
    flex: 1,
  },
  helperText: {
    textAlign: 'center',
    color: colors.text.secondary,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  reloadButton: {
    marginTop: 12,
  },
  loadButton: {
    marginTop: 8,
  },
  calendarIndicator: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  infoText: {
    color: colors.text.secondary,
    marginBottom: 8,
    lineHeight: 20,
  },
});
