// TaskForm component - Form for creating/editing tasks

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import { CreateTaskInput, UpdateTaskInput, RecurrenceType } from '../../types/task';
import { Button } from '../common/Button';
import { TaskTimePicker } from './TaskTimePicker';
import { TaskDurationPicker } from './TaskDurationPicker';
import { TaskReminderPicker } from './TaskReminderPicker';
import { TaskRepeatPicker } from './TaskRepeatPicker';
import { CategoryPicker } from '../categories/CategoryPicker';
import { useCategoryStore } from '../../stores/categoryStore';
import { useTaskStore } from '../../stores/taskStore';
import { validateTaskSchedule } from '../../utils/timeSlotValidation';
import { colors, spacing, typography } from '../../config/theme';
import { format } from 'date-fns';

interface TaskFormProps {
  initialValues?: Partial<CreateTaskInput>;
  onSubmit: (input: CreateTaskInput | UpdateTaskInput) => void;
  onClose: () => void;
  isLoading?: boolean;
  isCreateMode?: boolean;
  taskId?: number | string; // For overlap validation when editing
  onSubmitReady?: (submitFn: () => void) => void; // Callback to expose submit function
}

export const TaskForm: React.FC<TaskFormProps> = ({
  initialValues,
  onSubmit,
  onClose,
  isLoading = false,
  isCreateMode = true,
  taskId,
  onSubmitReady,
}) => {
  const categories = useCategoryStore((state) => state.categories);
  const getTodayTasks = useTaskStore((state) => state.getTodayTasks);

  const [text, setText] = useState(initialValues?.text || '');
  const [dueDate, setDueDate] = useState<Date | null>(initialValues?.dueDate || new Date());
  const [reminderTime, setReminderTime] = useState<Date | null>(
    initialValues?.reminderTime || null
  );
  const [recurrence, setRecurrence] = useState<RecurrenceType>(
    initialValues?.recurrence || 'none'
  );
  const [categoryId, setCategoryId] = useState<number | null>(
    initialValues?.categoryId || null
  );
  const [duration, setDuration] = useState(initialValues?.duration ?? 15);
  const [showValidation, setShowValidation] = useState(false);

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

  // Expose submit function to parent via callback
  useEffect(() => {
    if (onSubmitReady) {
      onSubmitReady(() => handleSubmit);
    }
  }, [text, dueDate, categoryId, duration, reminderSettings, repeatSetting]);

  const handleSubmit = () => {
    // Validate required fields
    if (!text.trim() || !dueDate || categoryId === null) {
      setShowValidation(true);
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

    // Validate time slot to prevent overlaps (only if dueDate and duration are set)
    if (dueDate && duration > 0) {
      const todayTasks = getTodayTasks();
      const validation = validateTaskSchedule(dueDate, duration, todayTasks, taskId);

      if (!validation.isValid) {
        const conflictNames = validation.conflicts.map(t => `• ${t.text}`).join('\n');
        Alert.alert(
          'Time Conflict',
          `This time slot overlaps with:\n\n${conflictNames}\n\nPlease choose a different time.`,
          [{ text: 'OK' }]
        );
        return;
      }
    }

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
    onClose();
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
            {/* Task text input - iOS style */}
            <View style={styles.section}>
              <TextInput
                style={styles.taskInput}
                value={text}
                onChangeText={setText}
                placeholder="What do you plan"
                placeholderTextColor={colors.text.disabled}
                multiline
                autoFocus
                returnKeyType="done"
                blurOnSubmit={true}
              />
            </View>

            {/* Settings Section - Individual Pickers */}
            <View style={styles.section}>
              <TaskTimePicker
                value={dueDate}
                onChange={(date) => {
                  Keyboard.dismiss();
                  setDueDate(date);
                  if (showValidation && date) {
                    setShowValidation(false);
                  }
                }}
                showWarning={showValidation && !dueDate}
              />

              <TaskDurationPicker
                value={duration}
                onChange={setDuration}
              />

              <TaskReminderPicker
                value={reminderSettings}
                onChange={setReminderSettings}
              />

              <TaskRepeatPicker
                value={repeatSetting}
                onChange={setRepeatSetting}
              />

              <CategoryPicker
                categories={categories}
                selectedCategoryId={categoryId}
                onSelectCategory={(id) => {
                  setCategoryId(id);
                  if (showValidation && id !== null) {
                    setShowValidation(false);
                  }
                }}
                label="Category"
                allowNone={true}
                showWarning={showValidation && categoryId === null}
              />
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
    flex: 1,
    backgroundColor: colors.surface.light,
  },
  section: {
    backgroundColor: colors.surface.white,
    marginTop: spacing.lg,
    marginBottom: 0,
  },
  taskInput: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.text.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    minHeight: 100,
    textAlignVertical: 'top',
  },
});
