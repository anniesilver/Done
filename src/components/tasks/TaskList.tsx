// TaskList component - Scrollable list of tasks with empty state

import React from 'react';
import { ScrollView, View, Text, StyleSheet, RefreshControl } from 'react-native';
import { Task } from '../../types/task';
import { TaskItem } from './TaskItem';
import { colors, spacing, typography } from '../../config/theme';

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (id: number | string) => void;
  onTaskPress?: (task: Task) => void;
  onDeleteTask?: (id: number | string) => void;
  showCategory?: boolean;
  getCategoryName?: (categoryId: number | null) => string | undefined;
  emptyMessage?: string;
  refreshControl?: React.ReactElement<typeof RefreshControl>;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onToggleComplete,
  onTaskPress,
  onDeleteTask,
  showCategory = false,
  getCategoryName,
  emptyMessage = 'No tasks yet',
  refreshControl,
}) => {
  if (tasks.length === 0) {
    return (
      <ScrollView
        contentContainerStyle={styles.emptyList}
        refreshControl={refreshControl}
      >
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView refreshControl={refreshControl}>
      {tasks.map((task) => (
        <TaskItem
          key={task.id.toString()}
          task={task}
          onToggleComplete={onToggleComplete}
          onPress={onTaskPress ? () => onTaskPress(task) : undefined}
          onDelete={onDeleteTask}
          showCategory={showCategory}
          categoryName={getCategoryName ? getCategoryName(task.categoryId) : undefined}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  emptyList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyText: {
    fontSize: typography.body.fontSize,
    color: colors.text.disabled,
    textAlign: 'center',
  },
});
