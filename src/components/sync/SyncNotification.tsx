// SyncNotification component - Shows sync status notifications
// Phase 2 stub - Will be fully implemented in offline sync phase

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../config/theme';

type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

interface SyncNotificationProps {
  status: SyncStatus;
  message?: string;
}

export const SyncNotification: React.FC<SyncNotificationProps> = ({
  status,
  message,
}) => {
  if (status === 'idle') {
    return null;
  }

  const getStatusConfig = () => {
    switch (status) {
      case 'syncing':
        return {
          icon: '⏳',
          color: colors.semantic.info,
          defaultMessage: 'Syncing changes...',
        };
      case 'success':
        return {
          icon: '✓',
          color: colors.semantic.success,
          defaultMessage: 'Synced successfully',
        };
      case 'error':
        return {
          icon: '⚠️',
          color: colors.semantic.danger,
          defaultMessage: 'Sync failed',
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  if (!config) return null;

  return (
    <View style={[styles.container, { backgroundColor: config.color + '20' }]}>
      <Text style={styles.icon}>{config.icon}</Text>
      <Text style={styles.message}>
        {message || config.defaultMessage}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 8,
    gap: spacing.sm,
  },
  icon: {
    fontSize: 20,
  },
  message: {
    flex: 1,
    fontSize: typography.caption.fontSize,
    color: colors.text.primary,
    fontWeight: '600',
  },
});
