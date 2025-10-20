// TaskItem component - Individual task display with checkbox, text, and actions

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Task } from '../../types/task';
import { colors, spacing, typography } from '../../config/theme';
import { format } from 'date-fns';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: number | string) => void;
  onPress?: () => void;
  showCategory?: boolean;
  categoryName?: string;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleComplete,
  onPress,
  showCategory = false,
  categoryName,
}) => {
  const handleCheckboxPress = () => {
    onToggleComplete(task.id);
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Checkbox */}
      <TouchableOpacity
        style={[styles.checkbox, task.completed && styles.checkboxCompleted]}
        onPress={handleCheckboxPress}
        activeOpacity={0.7}
      >
        {task.completed && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>

      {/* Task content */}
      <View style={styles.content}>
        <Text
          style={[
            styles.taskText,
            task.completed && styles.taskTextCompleted,
          ]}
        >
          {task.text}
        </Text>

        {/* Metadata row */}
        <View style={styles.metadata}>
          {showCategory && categoryName && (
            <Text style={styles.categoryText}>{categoryName}</Text>
          )}

          {task.dueDate && (
            <Text style={styles.dueDateText}>
              {format(new Date(task.dueDate), 'MMM d, yyyy')}
            </Text>
          )}

          {task.duration > 0 && (
            <Text style={styles.durationText}>{task.duration} min</Text>
          )}

          {task.recurrence !== 'none' && (
            <Text style={styles.recurrenceText}>
              🔁 {task.recurrence}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface.white,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.light,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary.main,
    marginRight: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCompleted: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  checkmark: {
    color: colors.surface.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  taskText: {
    fontSize: typography.body.fontSize,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  taskTextCompleted: {
    textDecorationLine: 'line-through',
    color: colors.text.disabled,
  },
  metadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryText: {
    fontSize: typography.caption.fontSize,
    color: colors.primary.main,
    fontWeight: '600',
  },
  dueDateText: {
    fontSize: typography.caption.fontSize,
    color: colors.text.secondary,
  },
  durationText: {
    fontSize: typography.caption.fontSize,
    color: colors.text.secondary,
  },
  recurrenceText: {
    fontSize: typography.caption.fontSize,
    color: colors.text.secondary,
  },
});
