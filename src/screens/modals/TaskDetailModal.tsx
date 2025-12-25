// TaskDetailModal - Modal for creating new tasks or editing existing tasks

import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Task, UpdateTaskInput, CreateTaskInput } from '../../types/task';
import { TaskForm } from '../../components/tasks/TaskForm';
import { useTaskStore } from '../../stores/taskStore';
import { colors, spacing, typography } from '../../config/theme';

interface TaskDetailModalProps {
  visible: boolean;
  task: Task | null; // null means create mode
  onClose: () => void;
  initialDate?: Date; // Initial date for new tasks (when task is null)
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  visible,
  task,
  onClose,
  initialDate,
}) => {
  const [submitForm, setSubmitForm] = useState<(() => void) | null>(null);

  const addTask = useTaskStore((state) => state.addTask);
  const updateTask = useTaskStore((state) => state.updateTask);
  const isLoading = useTaskStore((state) => state.isLoading);

  const isCreateMode = task === null;

  const handleCreate = async (input: CreateTaskInput) => {
    await addTask(input);
    onClose();
  };

  const handleUpdate = async (updates: UpdateTaskInput) => {
    if (!task) return;
    await updateTask(task.id, updates);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="formSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>Cancel</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            {isCreateMode ? 'New Task' : 'Edit Task'}
          </Text>

          <TouchableOpacity
            onPress={() => submitForm && submitForm()}
            style={styles.headerButton}
            disabled={isLoading}
          >
            <Text style={[styles.headerButtonText, isLoading && styles.headerButtonTextDisabled]}>
              {isCreateMode ? 'Done' : 'Update'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content - Always show TaskForm */}
        <TaskForm
          initialValues={
            task
              ? {
                  text: task.text,
                  dueDate: task.dueDate,
                  reminderTime: task.reminderTime,
                  recurrence: task.recurrence,
                  categoryId: task.categoryId,
                  duration: task.duration,
                }
              : initialDate
              ? { dueDate: initialDate }
              : undefined
          }
          taskId={task?.id}
          onSubmit={isCreateMode ? handleCreate : handleUpdate}
          onClose={onClose}
          isLoading={isLoading}
          isCreateMode={isCreateMode}
          onSubmitReady={setSubmitForm}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.light,
  },
  headerTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: '600',
    color: colors.text.primary,
  },
  headerButton: {
    minWidth: 60,
  },
  headerButtonText: {
    fontSize: typography.body.fontSize,
    color: colors.primary.main,
    fontWeight: '600',
  },
  headerButtonTextDisabled: {
    color: colors.text.disabled,
  },
});
