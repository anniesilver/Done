// TaskList component - Scrollable list of tasks with empty state

import React from 'react';
import { FlatList, View, Text, StyleSheet, RefreshControl } from 'react-native';
import { Task } from '../../types/task';
import { TaskItem } from './TaskItem';
import { colors, spacing, typography } from '../../config/theme';

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (id: number | string) => void;
  onTaskPress?: (task: Task) => void;
  showCategory?: boolean;
  getCategoryName?: (categoryId: number | null) => string | undefined;
  emptyMessage?: string;
  refreshControl?: React.ReactElement<typeof RefreshControl>;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onToggleComplete,
  onTaskPress,
  showCategory = false,
  getCategoryName,
  emptyMessage = 'No tasks yet',
  refreshControl,
}) => {
  const renderItem = ({ item }: { item: Task }) => (
    <TaskItem
      task={item}
      onToggleComplete={onToggleComplete}
      onPress={onTaskPress ? () => onTaskPress(item) : undefined}
      showCategory={showCategory}
      categoryName={getCategoryName ? getCategoryName(item.categoryId) : undefined}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>{emptyMessage}</Text>
    </View>
  );

  return (
    <FlatList
      data={tasks}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      ListEmptyComponent={renderEmpty}
      contentContainerStyle={tasks.length === 0 ? styles.emptyList : undefined}
      refreshControl={refreshControl}
    />
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
