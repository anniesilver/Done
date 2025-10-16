// TimerControls component - Start, pause, reset buttons for timer

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../config/theme';

interface TimerControlsProps {
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

export const TimerControls: React.FC<TimerControlsProps> = ({
  isRunning,
  onStart,
  onPause,
  onReset,
}) => {
  return (
    <View style={styles.container}>
      {/* Start/Pause button */}
      <TouchableOpacity
        style={[styles.button, styles.primaryButton]}
        onPress={isRunning ? onPause : onStart}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryButtonText}>
          {isRunning ? 'Pause' : 'Start'}
        </Text>
      </TouchableOpacity>

      {/* Reset button */}
      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={onReset}
        activeOpacity={0.8}
      >
        <Text style={styles.secondaryButtonText}>Reset</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 150,
  },
  primaryButton: {
    backgroundColor: colors.primary.main,
  },
  primaryButtonText: {
    color: colors.surface.white,
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: colors.surface.medium,
  },
  secondaryButtonText: {
    color: colors.text.primary,
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
});
