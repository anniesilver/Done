// TaskForm component - Form for creating/editing tasks

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { CreateTaskInput, UpdateTaskInput, RecurrenceType } from '../../types/task';
import { Button } from '../common/Button';
import { TaskTimeSelector } from './TaskTimeSelector';
import { TaskReminderSelector } from './TaskReminderSelector';
import { TaskDurationSelector } from './TaskDurationSelector';
import { TaskRecurrenceSelector } from './TaskRecurrenceSelector';
import { CategoryPicker } from '../categories/CategoryPicker';
import { useCategoryStore } from '../../stores/categoryStore';
import { colors, spacing, typography } from '../../config/theme';
import { format } from 'date-fns';

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
  const categories = useCategoryStore((state) => state.categories);

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

  // Helper to convert reminderTime to reminder setting strings
  const getReminderSettingsFromTime = (reminderTime: Date | null, dueDate: Date | null): string[] => {
    if (!reminderTime || !dueDate) return [];

    const diffMinutes = Math.floor((new Date(dueDate).getTime() - new Date(reminderTime).getTime()) / 60000);

    if (diffMinutes <= 5) return ['5 minutes before'];
    if (diffMinutes <= 10) return ['10 minutes before'];
    if (diffMinutes <= 30) return ['30 minutes before'];
    if (diffMinutes <= 60) return ['1 hour before'];
    if (diffMinutes <= 1440) return ['1 day before'];

    return [];
  };

  // Helper to convert RecurrenceType to display string
  const getRepeatSettingFromRecurrence = (recurrence: RecurrenceType): string => {
    switch (recurrence) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      case 'yearly': return 'Yearly';
      default: return 'None';
    }
  };

  // New states for reminder and repeat from calendar modal
  const [reminderSettings, setReminderSettings] = useState<string[]>(
    getReminderSettingsFromTime(initialValues?.reminderTime || null, initialValues?.dueDate || null)
  );
  const [repeatSetting, setRepeatSetting] = useState<string>(
    getRepeatSettingFromRecurrence(initialValues?.recurrence || 'none')
  );

  const handleSubmit = () => {
    if (!text.trim()) {
      return;
    }

    // Convert repeat setting to RecurrenceType
    const getRecurrence = (repeat: string): RecurrenceType => {
      switch (repeat.toLowerCase()) {
        case 'daily': return 'daily';
        case 'weekly': return 'weekly';
        case 'monthly': return 'monthly';
        case 'yearly': return 'yearly';
        default: return 'none';
      }
    };

    // Convert reminder settings to earliest reminder time
    const calculateReminderTime = (reminders: string[], dueDate: Date | null): Date | null => {
      if (!dueDate || reminders.length === 0) return null;

      const reminderMinutes: { [key: string]: number } = {
        '5 minutes before': 5,
        '10 minutes before': 10,
        '30 minutes before': 30,
        '1 hour before': 60,
        '1 day before': 1440,
      };

      // Get the earliest (largest number) reminder
      const maxMinutes = Math.max(...reminders.map(r => reminderMinutes[r] || 0));
      if (maxMinutes === 0) return null;

      const reminderDate = new Date(dueDate);
      reminderDate.setMinutes(reminderDate.getMinutes() - maxMinutes);
      return reminderDate;
    };

    const input: CreateTaskInput = {
      text: text.trim(),
      completed: false,
      dueDate,
      reminderTime: calculateReminderTime(reminderSettings, dueDate),
      recurrence: getRecurrence(repeatSetting),
      categoryId,
      duration,
    };

    onSubmit(input);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
                returnKeyType="done"
                blurOnSubmit={true}
              />
            </View>

            {/* Due Date with integrated time/reminder/repeat/duration */}
            <TaskTimeSelector
              value={dueDate}
              onChange={(date) => {
                Keyboard.dismiss(); // Dismiss keyboard when opening date picker
                setDueDate(date);
              }}
              label="Due Date"
              onReminderChange={setReminderSettings}
              onRepeatChange={setRepeatSetting}
              onDurationChange={setDuration}
              reminderValue={reminderSettings}
              repeatValue={repeatSetting}
              durationValue={duration}
            />

        {/* Display selected settings */}
        {(reminderSettings.length > 0 || repeatSetting !== 'None' || dueDate || duration > 0) && (
          <View style={styles.selectedSettings}>
            {dueDate && (
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>📅 Due:</Text>
                <Text style={styles.settingValue}>{format(dueDate, 'MMM d, yyyy h:mm a')}</Text>
              </View>
            )}
            {duration > 0 && (
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>⏱️ Duration:</Text>
                <Text style={styles.settingValue}>
                  {duration < 60 ? `${duration} min` : `${Math.floor(duration / 60)}h ${duration % 60 > 0 ? `${duration % 60}m` : ''}`}
                </Text>
              </View>
            )}
            {reminderSettings.length > 0 && (
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>🔔 Reminders:</Text>
                <Text style={styles.settingValue}>{reminderSettings.join(', ')}</Text>
              </View>
            )}
            {repeatSetting !== 'None' && (
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>🔁 Repeat:</Text>
                <Text style={styles.settingValue}>{repeatSetting}</Text>
              </View>
            )}
          </View>
        )}

        {/* Category */}
        <CategoryPicker
          categories={categories}
          selectedCategoryId={categoryId}
          onSelectCategory={setCategoryId}
          label="Category"
          allowNone={true}
        />

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
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  form: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  field: {
    marginBottom: spacing.md,
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
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
    paddingBottom: spacing.xl, // Extra padding to ensure buttons are visible above keyboard
  },
  button: {
    flex: 1,
  },
  selectedSettings: {
    backgroundColor: colors.surface.light,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  settingLabel: {
    fontSize: typography.caption.fontSize,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  settingValue: {
    fontSize: typography.caption.fontSize,
    color: colors.text.primary,
  },
});
