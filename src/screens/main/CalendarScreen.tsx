// CalendarScreen - Calendar view with monthly grid and weekly view toggle

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { CalendarGrid } from '../../components/calendar/CalendarGrid';
import { WeeklyView } from '../../components/calendar/WeeklyView';
import { TaskList } from '../../components/tasks/TaskList';
import { TaskDetailModal } from '../modals/TaskDetailModal';
import { useTaskStore } from '../../stores/taskStore';
import { useCategoryStore } from '../../stores/categoryStore';
import { useUiStore } from '../../stores/uiStore';
import { colors, spacing, typography } from '../../config/theme';
import { format, addMonths, subMonths, addWeeks, subWeeks, isSameDay } from 'date-fns';
import { Task } from '../../types/task';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { getOverlappingTasks, TimeSlot } from '../../utils/timeSlotValidation';

type NavigationProp = StackNavigationProp<RootStackParamList, 'MainTabs'>;

export const CalendarScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const tasks = useTaskStore((state) => state.tasks);
  const fetchTasks = useTaskStore((state) => state.fetchTasks);
  const toggleComplete = useTaskStore((state) => state.toggleComplete);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const getTasksForDate = useTaskStore((state) => state.getTasksForDate);

  const categories = useCategoryStore((state) => state.categories);
  const fetchCategories = useCategoryStore((state) => state.fetchCategories);

  const selectedDate = useUiStore((state) => state.selectedDate);
  const setSelectedDate = useUiStore((state) => state.setSelectedDate);
  const calendarViewMode = useUiStore((state) => state.calendarViewMode);
  const setCalendarViewMode = useUiStore((state) => state.setCalendarViewMode);

  // Initial data fetch
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchTasks(),
          fetchCategories()
        ]);
      } catch (error) {
        console.error('[CalendarScreen] Error loading initial data:', error);
        // Don't crash the app, just log the error
        // The stores will handle their own error states
      }
    };

    loadData();
  }, []);

  // Toggle between monthly and weekly view
  const toggleViewMode = () => {
    Haptics.selectionAsync();
    setCalendarViewMode(calendarViewMode === 'monthly' ? 'weekly' : 'monthly');
  };

  // Get view mode icon
  const getViewModeIcon = () => {
    return calendarViewMode === 'monthly' ? 'calendar-week' : 'calendar-month';
  };

  // Navigate to calendar sync settings
  const handleOpenSyncSettings = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('CalendarSync');
  };

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
  };

  const getTaskCountForDate = (date: Date): number => {
    return getTasksForDate(date).length;
  };

  const getCategoryName = (categoryId: number | null): string | undefined => {
    if (!categoryId) return undefined;
    return categories.find((c) => c.id === categoryId)?.name;
  };

  // Detect conflicts among tasks for the selected date
  const getTaskConflicts = (tasks: Task[]): Map<number | string, Task[]> => {
    const conflictMap = new Map<number | string, Task[]>();

    tasks.forEach((task) => {
      // Skip tasks without duration or due date
      if (!task.dueDate || !task.duration || task.duration === 0) {
        return;
      }

      const taskStart = new Date(task.dueDate);
      const taskEnd = new Date(taskStart.getTime() + task.duration * 60000);

      const taskSlot: TimeSlot = {
        start: taskStart,
        end: taskEnd,
      };

      // Find other tasks that overlap with this one
      const otherTasks = tasks.filter((t) => t.id !== task.id);
      const conflicts = getOverlappingTasks(taskSlot, otherTasks);

      if (conflicts.length > 0) {
        conflictMap.set(task.id, conflicts);
      }
    });

    return conflictMap;
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

  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : [];
  const taskConflicts = getTaskConflicts(selectedDateTasks);
  const hasConflicts = taskConflicts.size > 0;

  return (
    <View style={styles.container}>
      {/* Header with current date and view toggle */}
      <ScreenHeader
        title={format(currentMonth, 'MMMM yyyy')}
        leftIcon={getViewModeIcon()}
        onLeftPress={toggleViewMode}
        rightIcon="cog"
        onRightPress={handleOpenSyncSettings}
      />

      <ScrollView>
        {/* Calendar view */}
        {calendarViewMode === 'monthly' ? (
          <CalendarGrid
            currentDate={currentMonth}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
            onMonthChange={setCurrentMonth}
            getTaskCountForDate={getTaskCountForDate}
          />
        ) : (
          <WeeklyView
            currentDate={currentMonth}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
            onWeekChange={setCurrentMonth}
            getTaskCountForDate={getTaskCountForDate}
          />
        )}

        {/* Selected date tasks */}
        {selectedDate && (
          <View style={styles.tasksSection}>
            <Text style={styles.tasksSectionTitle}>
              Tasks for {selectedDate.toLocaleDateString()}
            </Text>

            {/* Conflict Warning Banner */}
            {hasConflicts && (
              <View style={styles.conflictBanner}>
                <Icon name="alert-circle" size={20} color={colors.semantic.warning} />
                <Text style={styles.conflictBannerText}>
                  {taskConflicts.size} {taskConflicts.size === 1 ? 'task has' : 'tasks have'} scheduling conflicts
                </Text>
              </View>
            )}

            <TaskList
              tasks={selectedDateTasks}
              onToggleComplete={toggleComplete}
              onTaskPress={handleTaskPress}
              onDeleteTask={deleteTask}
              showCategory={true}
              getCategoryName={getCategoryName}
              emptyMessage="No tasks for this date"
              taskConflicts={taskConflicts}
              showTime={true}
            />
          </View>
        )}
      </ScrollView>

      {/* Add task button */}
      <TouchableOpacity style={styles.fab} onPress={handleCreateTask}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Task detail/create modal */}
      <TaskDetailModal
        visible={modalVisible}
        task={selectedTask}
        onClose={handleCloseModal}
        initialDate={selectedDate || undefined}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.white,
  },
  tasksSection: {
    padding: spacing.md,
    minHeight: 200,
  },
  tasksSectionTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.md,
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
  conflictBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: 8,
    gap: spacing.sm,
  },
  conflictBannerText: {
    fontSize: typography.body.fontSize,
    color: '#856404',
    fontWeight: '500',
    flex: 1,
  },
});
