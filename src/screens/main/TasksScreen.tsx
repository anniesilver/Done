// TasksScreen - All tasks view with category filtering

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, RefreshControl, TouchableOpacity, Text } from 'react-native';
import * as Haptics from 'expo-haptics';
import { TaskList } from '../../components/tasks/TaskList';
import { CategoryList } from '../../components/categories/CategoryList';
import { TaskDetailModal } from '../modals/TaskDetailModal';
import { CategoryModal } from '../modals/CategoryModal';
import { useTaskStore } from '../../stores/taskStore';
import { useCategoryStore } from '../../stores/categoryStore';
import { useUiStore } from '../../stores/uiStore';
import { colors, spacing } from '../../config/theme';
import { Task } from '../../types/task';

export const TasksScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const tasks = useTaskStore((state) => state.tasks);
  const fetchTasks = useTaskStore((state) => state.fetchTasks);
  const toggleComplete = useTaskStore((state) => state.toggleComplete);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const getTasksByCategory = useTaskStore((state) => state.getTasksByCategory);

  const categories = useCategoryStore((state) => state.categories);
  const fetchCategories = useCategoryStore((state) => state.fetchCategories);

  const selectedCategory = useUiStore((state) => state.selectedCategory);
  const setSelectedCategory = useUiStore((state) => state.setSelectedCategory);

  // Initial data fetch
  useEffect(() => {
    fetchTasks();
    fetchCategories();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchTasks(), fetchCategories()]);
    setRefreshing(false);
  };

  const getCategoryName = (categoryId: number | null): string | undefined => {
    if (!categoryId) return undefined;
    return categories.find((c) => c.id === categoryId)?.name;
  };

  const handleCreateTask = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedTask(null);
    setModalVisible(true);
  };

  const handleTaskPress = (task: Task) => {
    setSelectedTask(task);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedTask(null);
  };

  // Get filtered tasks based on selected category
  const filteredTasks = selectedCategory === null
    ? tasks
    : getTasksByCategory(selectedCategory);

  // Sort tasks: incomplete first, then by creation date
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <View style={styles.container}>
      {/* Category filter */}
      <CategoryList
        categories={categories}
        selectedCategoryId={selectedCategory}
        onSelectCategory={setSelectedCategory}
        showAllOption={true}
        onManageCategories={() => setCategoryModalVisible(true)}
      />

      {/* Tasks list */}
      <TaskList
        tasks={sortedTasks}
        onToggleComplete={toggleComplete}
        onTaskPress={handleTaskPress}
        onDeleteTask={deleteTask}
        showCategory={selectedCategory === null}
        getCategoryName={getCategoryName}
        emptyMessage={
          selectedCategory === null
            ? 'No tasks yet. Create one to get started!'
            : 'No tasks in this category'
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />

      {/* Add task button */}
      <TouchableOpacity style={styles.fab} onPress={handleCreateTask}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Task detail/create modal */}
      <TaskDetailModal
        visible={modalVisible}
        task={selectedTask}
        onClose={handleCloseModal}
      />

      {/* Category management modal */}
      <CategoryModal
        visible={categoryModalVisible}
        onClose={() => setCategoryModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.white,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 32,
    lineHeight: 32,
    color: colors.surface.white,
    fontWeight: '300',
  },
});
