// TaskDetailModal - Modal for creating new tasks or viewing/editing existing tasks

import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Task, UpdateTaskInput, CreateTaskInput } from '../../types/task';
import { TaskForm } from '../../components/tasks/TaskForm';
import { useTaskStore } from '../../stores/taskStore';
import { colors, spacing, typography } from '../../config/theme';
import { format } from 'date-fns';

interface TaskDetailModalProps {
  visible: boolean;
  task: Task | null; // null means create mode
  onClose: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  visible,
  task,
  onClose,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [submitForm, setSubmitForm] = useState<(() => void) | null>(null);

  const addTask = useTaskStore((state) => state.addTask);
  const updateTask = useTaskStore((state) => state.updateTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const isLoading = useTaskStore((state) => state.isLoading);

  const isCreateMode = task === null;

  // Auto-set editing mode for create
  useEffect(() => {
    if (isCreateMode) {
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  }, [isCreateMode, task]);

  const handleCreate = async (input: CreateTaskInput) => {
    await addTask(input);
    onClose();
  };

  const handleUpdate = async (updates: UpdateTaskInput) => {
    if (!task) return;
    await updateTask(task.id, updates);
    setIsEditing(false);
    onClose();
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteTask(task.id);
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={isCreateMode || isEditing ? "formSheet" : "pageSheet"}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>
              {isCreateMode || isEditing ? 'Cancel' : 'Close'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            {isCreateMode
              ? 'New Task'
              : isEditing
              ? 'Edit Task'
              : 'Task Details'}
          </Text>

          {!isCreateMode && !isEditing && (
            <TouchableOpacity
              onPress={() => setIsEditing(true)}
              style={styles.headerButton}
            >
              <Text style={styles.headerButtonText}>Edit</Text>
            </TouchableOpacity>
          )}

          {(isCreateMode || isEditing) && (
            <TouchableOpacity
              onPress={() => submitForm && submitForm()}
              style={styles.headerButton}
              disabled={isLoading}
            >
              <Text style={[styles.headerButtonText, isLoading && styles.headerButtonTextDisabled]}>
                Done
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Content */}
        {isCreateMode || isEditing ? (
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
                : undefined
            }
            taskId={task?.id}
            onSubmit={isCreateMode ? handleCreate : handleUpdate}
            onClose={onClose}
            isLoading={isLoading}
            isCreateMode={isCreateMode}
            onSubmitReady={setSubmitForm}
          />
        ) : task ? (
          <ScrollView style={styles.content}>
            {/* Task text */}
            <View style={styles.section}>
              <Text style={styles.taskText}>{task.text}</Text>
              <Text
                style={[
                  styles.statusBadge,
                  task.completed ? styles.statusBadgeComplete : styles.statusBadgeIncomplete,
                ]}
              >
                {task.completed ? 'Completed' : 'Pending'}
              </Text>
            </View>

            {/* Task metadata */}
            {task.dueDate && (
              <View style={styles.metadataRow}>
                <Text style={styles.metadataLabel}>Due Date:</Text>
                <Text style={styles.metadataValue}>
                  {format(new Date(task.dueDate), 'MMM d, yyyy h:mm a')}
                </Text>
              </View>
            )}

            {task.reminderTime && (
              <View style={styles.metadataRow}>
                <Text style={styles.metadataLabel}>Reminder:</Text>
                <Text style={styles.metadataValue}>
                  {format(new Date(task.reminderTime), 'MMM d, yyyy h:mm a')}
                </Text>
              </View>
            )}

            {task.duration > 0 && (
              <View style={styles.metadataRow}>
                <Text style={styles.metadataLabel}>Duration:</Text>
                <Text style={styles.metadataValue}>{task.duration} minutes</Text>
              </View>
            )}

            {task.recurrence !== 'none' && (
              <View style={styles.metadataRow}>
                <Text style={styles.metadataLabel}>Recurrence:</Text>
                <Text style={styles.metadataValue}>
                  {task.recurrence.charAt(0).toUpperCase() + task.recurrence.slice(1)}
                </Text>
              </View>
            )}

            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Created:</Text>
              <Text style={styles.metadataValue}>
                {format(new Date(task.createdAt), 'MMM d, yyyy')}
              </Text>
            </View>

            {/* Delete button */}
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
              disabled={isLoading}
            >
              <Text style={styles.deleteButtonText}>Delete Task</Text>
            </TouchableOpacity>
          </ScrollView>
        ) : null}
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
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  taskText: {
    fontSize: typography.h3.fontSize,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 12,
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
  },
  statusBadgeComplete: {
    backgroundColor: colors.semantic.success + '20',
    color: colors.semantic.success,
  },
  statusBadgeIncomplete: {
    backgroundColor: colors.semantic.info + '20',
    color: colors.semantic.info,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.light,
  },
  metadataLabel: {
    fontSize: typography.body.fontSize,
    color: colors.text.secondary,
  },
  metadataValue: {
    fontSize: typography.body.fontSize,
    color: colors.text.primary,
    fontWeight: '600',
  },
  deleteButton: {
    marginTop: spacing.xl,
    padding: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.semantic.danger,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: typography.body.fontSize,
    color: colors.surface.white,
    fontWeight: '600',
  },
});
