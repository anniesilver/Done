// TodayScreen - Main screen showing today's tasks with live clock

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { TaskList } from '../../components/tasks/TaskList';
import { TaskDetailModal } from '../modals/TaskDetailModal';
import { useTaskStore } from '../../stores/taskStore';
import { useCategoryStore } from '../../stores/categoryStore';
import { colors, spacing, typography } from '../../config/theme';
import { format } from 'date-fns';
import { Task } from '../../types/task';

export const TodayScreen: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const tasks = useTaskStore((state) => state.tasks);
  const isLoading = useTaskStore((state) => state.isLoading);
  const fetchTasks = useTaskStore((state) => state.fetchTasks);
  const toggleComplete = useTaskStore((state) => state.toggleComplete);
  const getTodayTasks = useTaskStore((state) => state.getTodayTasks);

  const categories = useCategoryStore((state) => state.categories);
  const fetchCategories = useCategoryStore((state) => state.fetchCategories);

  // Live clock
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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

  const todayTasks = getTodayTasks();
  const completedCount = todayTasks.filter((t) => t.completed).length;
  const totalCount = todayTasks.length;

  return (
    <View style={styles.container}>
      {/* Header with logo and live clock */}
      <View style={styles.header}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/images/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>Done</Text>
        </View>

        <View style={styles.dateSection}>
          <Text style={styles.date}>{format(currentTime, 'EEEE, MMMM d')}</Text>
          <Text style={styles.time}>{format(currentTime, 'h:mm:ss a')}</Text>
        </View>

        {/* Task summary */}
        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            {completedCount} of {totalCount} tasks completed
          </Text>
          {totalCount > 0 && (
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(completedCount / totalCount) * 100}%` },
                ]}
              />
            </View>
          )}
        </View>
      </View>

      {/* Today's tasks list */}
      <TaskList
        tasks={todayTasks}
        onToggleComplete={toggleComplete}
        onTaskPress={handleTaskPress}
        showCategory={true}
        getCategoryName={getCategoryName}
        emptyMessage="No tasks for today. Add one to get started!"
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.white,
  },
  header: {
    backgroundColor: colors.primary.main,
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logo: {
    width: 48,
    height: 48,
    marginRight: spacing.md,
  },
  appName: {
    fontSize: typography.h1.fontSize,
    fontWeight: 'bold',
    color: colors.surface.white,
    letterSpacing: 1,
  },
  dateSection: {
    marginBottom: spacing.md,
  },
  date: {
    fontSize: typography.h2.fontSize,
    fontWeight: 'bold',
    color: colors.surface.white,
    marginBottom: spacing.xs,
  },
  time: {
    fontSize: typography.h3.fontSize,
    color: colors.surface.white,
    opacity: 0.9,
  },
  summary: {
    marginTop: spacing.md,
  },
  summaryText: {
    fontSize: typography.body.fontSize,
    color: colors.surface.white,
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.primary.dark,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.surface.white,
    borderRadius: 3,
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
