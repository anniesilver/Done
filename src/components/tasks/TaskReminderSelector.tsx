// TaskReminderSelector component - Select reminder time for tasks

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing, typography } from '../../config/theme';
import { REMINDER_OPTIONS } from '../../config/constants';
import { format, subMinutes, subHours, subDays } from 'date-fns';

interface TaskReminderSelectorProps {
  dueDate: Date | null;
  value: Date | null;
  onChange: (reminderTime: Date | null) => void;
  label?: string;
}

export const TaskReminderSelector: React.FC<TaskReminderSelectorProps> = ({
  dueDate,
  value,
  onChange,
  label = 'Reminder',
}) => {
  const calculateReminderTime = (option: string): Date | null => {
    if (!dueDate) return null;

    const due = new Date(dueDate);

    switch (option) {
      case 'At time of event':
        return due;
      case '5 minutes before':
        return subMinutes(due, 5);
      case '15 minutes before':
        return subMinutes(due, 15);
      case '30 minutes before':
        return subMinutes(due, 30);
      case '1 hour before':
        return subHours(due, 1);
      case '2 hours before':
        return subHours(due, 2);
      case '1 day before':
        return subDays(due, 1);
      case '2 days before':
        return subDays(due, 2);
      default:
        return null;
    }
  };

  const handleSelectOption = (option: string) => {
    if (option === 'No reminder') {
      onChange(null);
    } else {
      const reminderTime = calculateReminderTime(option);
      onChange(reminderTime);
    }
  };

  const getSelectedOption = (): string => {
    if (!value) return 'No reminder';
    if (!dueDate) return 'No reminder';

    const due = new Date(dueDate);
    const reminder = new Date(value);
    const diffMinutes = Math.round((due.getTime() - reminder.getTime()) / (1000 * 60));

    if (diffMinutes === 0) return 'At time of event';
    if (diffMinutes === 5) return '5 minutes before';
    if (diffMinutes === 15) return '15 minutes before';
    if (diffMinutes === 30) return '30 minutes before';
    if (diffMinutes === 60) return '1 hour before';
    if (diffMinutes === 120) return '2 hours before';
    if (diffMinutes === 1440) return '1 day before';
    if (diffMinutes === 2880) return '2 days before';

    return format(reminder, 'MMM d, yyyy h:mm a');
  };

  if (!dueDate) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.disabledText}>Set a due date first</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <Text style={styles.currentValue}>
        Current: {getSelectedOption()}
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
        <View style={styles.options}>
          {REMINDER_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.option,
                getSelectedOption() === option && styles.optionSelected,
              ]}
              onPress={() => handleSelectOption(option)}
            >
              <Text
                style={[
                  styles.optionText,
                  getSelectedOption() === option && styles.optionTextSelected,
                ]}
              >
                {option}
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
  disabledText: {
    fontSize: typography.body.fontSize,
    color: colors.text.disabled,
    fontStyle: 'italic',
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
