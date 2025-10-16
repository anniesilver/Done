// TaskForm component - Form for creating/editing tasks

import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView } from 'react-native';
import { CreateTaskInput, UpdateTaskInput, RecurrenceType } from '../../types/task';
import { Button } from '../common/Button';
import { colors, spacing, typography } from '../../config/theme';

interface TaskFormProps {
  initialValues?: Partial<CreateTaskInput>;
  onSubmit: (input: CreateTaskInput | UpdateTaskInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = 'Create Task',
}) => {
  const [text, setText] = useState(initialValues?.text || '');
  const [dueDate, setDueDate] = useState<Date | null>(initialValues?.dueDate || null);
  const [reminderTime, setReminderTime] = useState<Date | null>(
    initialValues?.reminderTime || null
  );
  const [recurrence, setRecurrence] = useState<RecurrenceType>(
    initialValues?.recurrence || 'none'
  );
  const [categoryId, setCategoryId] = useState<number | null>(
    initialValues?.categoryId || null
  );
  const [duration, setDuration] = useState(initialValues?.duration || 0);

  const handleSubmit = () => {
    if (!text.trim()) {
      return;
    }

    const input: CreateTaskInput = {
      text: text.trim(),
      completed: false,
      dueDate,
      reminderTime,
      recurrence,
      categoryId,
      duration,
    };

    onSubmit(input);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        {/* Task text input */}
        <View style={styles.field}>
          <Text style={styles.label}>Task</Text>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="What do you need to do?"
            multiline
            numberOfLines={2}
            autoFocus
          />
        </View>

        {/* Due Date - Placeholder for TaskTimeSelector */}
        <View style={styles.field}>
          <Text style={styles.label}>Due Date</Text>
          <Text style={styles.placeholder}>
            {dueDate ? dueDate.toLocaleDateString() : 'No date set'}
          </Text>
          <Text style={styles.todo}>TODO: Add TaskTimeSelector</Text>
        </View>

        {/* Reminder - Placeholder for TaskReminderSelector */}
        <View style={styles.field}>
          <Text style={styles.label}>Reminder</Text>
          <Text style={styles.placeholder}>
            {reminderTime ? reminderTime.toLocaleString() : 'No reminder'}
          </Text>
          <Text style={styles.todo}>TODO: Add TaskReminderSelector</Text>
        </View>

        {/* Duration - Placeholder for TaskDurationSelector */}
        <View style={styles.field}>
          <Text style={styles.label}>Duration</Text>
          <Text style={styles.placeholder}>
            {duration > 0 ? `${duration} minutes` : 'No duration set'}
          </Text>
          <Text style={styles.todo}>TODO: Add TaskDurationSelector</Text>
        </View>

        {/* Recurrence - Placeholder for TaskRecurrenceSelector */}
        <View style={styles.field}>
          <Text style={styles.label}>Recurrence</Text>
          <Text style={styles.placeholder}>{recurrence}</Text>
          <Text style={styles.todo}>TODO: Add TaskRecurrenceSelector</Text>
        </View>

        {/* Category - Placeholder for CategoryPicker */}
        <View style={styles.field}>
          <Text style={styles.label}>Category</Text>
          <Text style={styles.placeholder}>
            {categoryId ? `Category ${categoryId}` : 'No category'}
          </Text>
          <Text style={styles.todo}>TODO: Add CategoryPicker</Text>
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          <View style={styles.button}>
            <Button
              variant="secondary"
              onPress={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </View>
          <View style={styles.button}>
            <Button
              variant="primary"
              onPress={handleSubmit}
              disabled={!text.trim() || isLoading}
              loading={isLoading}
            >
              {submitLabel}
            </Button>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.white,
  },
  form: {
    padding: spacing.lg,
  },
  field: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.surface.medium,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: typography.body.fontSize,
    color: colors.text.primary,
    backgroundColor: colors.surface.white,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  placeholder: {
    fontSize: typography.body.fontSize,
    color: colors.text.disabled,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.surface.medium,
    borderRadius: 8,
  },
  todo: {
    fontSize: typography.caption.fontSize,
    color: colors.semantic.warning,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  button: {
    flex: 1,
  },
});
