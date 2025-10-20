// TaskRecurrenceSelector component - Select task recurrence pattern

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { RecurrenceType } from '../../types/task';
import { colors, spacing, typography } from '../../config/theme';
import { RECURRENCE_OPTIONS } from '../../config/constants';

interface TaskRecurrenceSelectorProps {
  value: RecurrenceType;
  onChange: (recurrence: RecurrenceType) => void;
  label?: string;
}

export const TaskRecurrenceSelector: React.FC<TaskRecurrenceSelectorProps> = ({
  value,
  onChange,
  label = 'Recurrence',
}) => {
  const capitalizeFirst = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.options}>
        {RECURRENCE_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.option,
              value === option && styles.optionSelected,
            ]}
            onPress={() => onChange(option as RecurrenceType)}
          >
            <Text
              style={[
                styles.optionText,
                value === option && styles.optionTextSelected,
              ]}
            >
              {option === 'none' ? 'No repeat' : capitalizeFirst(option)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {value !== 'none' && (
        <Text style={styles.helperText}>
          This task will repeat {value} after completion
        </Text>
      )}
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
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  helperText: {
    fontSize: typography.caption.fontSize,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
});
