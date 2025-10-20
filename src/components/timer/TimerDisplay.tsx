// TimerDisplay component - Large countdown timer display

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../config/theme';

interface TimerDisplayProps {
  minutes: number;
  seconds: number;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  minutes,
  seconds,
}) => {
  const formatTime = (value: number): string => {
    return value.toString().padStart(2, '0');
  };

  const isWarning = minutes === 0 && seconds > 0 && seconds <= 10;
  const isComplete = minutes === 0 && seconds === 0;

  return (
    <View style={styles.container}>
      <View style={styles.display}>
        <Text
          style={[
            styles.time,
            isWarning && styles.timeWarning,
            isComplete && styles.timeComplete,
          ]}
        >
          {formatTime(minutes)}:{formatTime(seconds)}
        </Text>
      </View>

      <Text style={styles.label}>
        {isComplete ? 'Time\'s up!' : 'Remaining'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  display: {
    backgroundColor: colors.surface.light,
    borderRadius: 16,
    padding: spacing.xl,
    marginBottom: spacing.md,
    minWidth: 200,
    alignItems: 'center',
  },
  time: {
    fontSize: 64,
    fontWeight: 'bold',
    color: colors.primary.main,
    fontVariant: ['tabular-nums'],
  },
  timeWarning: {
    color: colors.semantic.warning,
  },
  timeComplete: {
    color: colors.semantic.success,
  },
  label: {
    fontSize: typography.body.fontSize,
    color: colors.text.secondary,
  },
});
