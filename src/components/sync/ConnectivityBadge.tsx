// ConnectivityBadge component - Shows online/offline status
// Phase 2 stub - Will be fully implemented in offline sync phase

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../config/theme';

interface ConnectivityBadgeProps {
  isOnline?: boolean;
}

export const ConnectivityBadge: React.FC<ConnectivityBadgeProps> = ({
  isOnline = true, // Default to online for Phase 1
}) => {
  return (
    <View style={[styles.badge, isOnline ? styles.badgeOnline : styles.badgeOffline]}>
      <View style={[styles.dot, isOnline ? styles.dotOnline : styles.dotOffline]} />
      <Text style={styles.text}>{isOnline ? 'Online' : 'Offline'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 12,
    gap: spacing.xs,
  },
  badgeOnline: {
    backgroundColor: colors.semantic.success + '20',
  },
  badgeOffline: {
    backgroundColor: colors.semantic.warning + '20',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotOnline: {
    backgroundColor: colors.semantic.success,
  },
  dotOffline: {
    backgroundColor: colors.semantic.warning,
  },
  text: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
    color: colors.text.primary,
  },
});
