// SyncButton component - Manual sync trigger button
// Phase 2 stub - Will be fully implemented in offline sync phase

import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../config/theme';

interface SyncButtonProps {
  onPress: () => void;
  isSyncing?: boolean;
  disabled?: boolean;
}

export const SyncButton: React.FC<SyncButtonProps> = ({
  onPress,
  isSyncing = false,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        (disabled || isSyncing) && styles.buttonDisabled,
      ]}
      onPress={onPress}
      disabled={disabled || isSyncing}
      activeOpacity={0.7}
    >
      {isSyncing ? (
        <ActivityIndicator size="small" color={colors.primary.main} />
      ) : (
        <Text style={styles.icon}>🔄</Text>
      )}
      <Text style={styles.text}>
        {isSyncing ? 'Syncing...' : 'Sync'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary.main,
    backgroundColor: colors.surface.white,
    gap: spacing.xs,
  },
  buttonDisabled: {
    opacity: 0.5,
    borderColor: colors.surface.medium,
  },
  icon: {
    fontSize: 16,
  },
  text: {
    fontSize: typography.caption.fontSize,
    color: colors.primary.main,
    fontWeight: '600',
  },
});
