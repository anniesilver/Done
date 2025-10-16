// TasksScreen - All tasks view with category filtering

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, RefreshControl } from 'react-native';
import { TaskList } from '../../components/tasks/TaskList';
import { CategoryList } from '../../components/categories/CategoryList';
import { useTaskStore } from '../../stores/taskStore';
import { useCategoryStore } from '../../stores/categoryStore';
import { useUiStore } from '../../stores/uiStore';
import { colors } from '../../config/theme';

export const TasksScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);

  const tasks = useTaskStore((state) => state.tasks);
  const fetchTasks = useTaskStore((state) => state.fetchTasks);
  const toggleComplete = useTaskStore((state) => state.toggleComplete);
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
      />

      {/* Tasks list */}
      <TaskList
        tasks={sortedTasks}
        onToggleComplete={toggleComplete}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.white,
  },
});
