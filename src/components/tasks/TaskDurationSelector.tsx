// TaskDurationSelector component - Select task duration in minutes

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing, typography } from '../../config/theme';
import { TASK_DURATIONS } from '../../config/constants';

interface TaskDurationSelectorProps {
  value: number;
  onChange: (duration: number) => void;
  label?: string;
}

export const TaskDurationSelector: React.FC<TaskDurationSelectorProps> = ({
  value,
  onChange,
  label = 'Duration',
}) => {
  const formatDuration = (minutes: number): string => {
    if (minutes === 0) return 'No duration';
    if (minutes < 60) return `${minutes} min`;

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (mins === 0) return `${hours} hr`;
    return `${hours}h ${mins}m`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <Text style={styles.currentValue}>
        Current: {formatDuration(value)}
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
        <View style={styles.options}>
          {TASK_DURATIONS.map((duration) => (
            <TouchableOpacity
              key={duration}
              style={[
                styles.option,
                value === duration && styles.optionSelected,
              ]}
              onPress={() => onChange(duration)}
            >
              <Text
                style={[
                  styles.optionText,
                  value === duration && styles.optionTextSelected,
                ]}
              >
                {formatDuration(duration)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  currentValue: {
    fontSize: typography.caption.fontSize,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  optionsScroll: {
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  options: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  option: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.surface.medium,
    backgroundColor: colors.surface.white,
  },
  optionSelected: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  optionText: {
    fontSize: typography.caption.fontSize,
    color: colors.text.primary,
  },
  optionTextSelected: {
    color: colors.surface.white,
    fontWeight: '600',
  },
});
