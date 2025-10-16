// CalendarScreen - Calendar view with monthly grid and weekly view toggle

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { CalendarHeader } from '../../components/calendar/CalendarHeader';
import { CalendarGrid } from '../../components/calendar/CalendarGrid';
import { WeeklyView } from '../../components/calendar/WeeklyView';
import { TaskList } from '../../components/tasks/TaskList';
import { useTaskStore } from '../../stores/taskStore';
import { useCategoryStore } from '../../stores/categoryStore';
import { useUiStore } from '../../stores/uiStore';
import { colors, spacing, typography } from '../../config/theme';
import { addMonths, subMonths, isSameDay } from 'date-fns';

export const CalendarScreen: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const tasks = useTaskStore((state) => state.tasks);
  const fetchTasks = useTaskStore((state) => state.fetchTasks);
  const toggleComplete = useTaskStore((state) => state.toggleComplete);
  const getTasksForDate = useTaskStore((state) => state.getTasksForDate);

  const categories = useCategoryStore((state) => state.categories);
  const fetchCategories = useCategoryStore((state) => state.fetchCategories);

  const selectedDate = useUiStore((state) => state.selectedDate);
  const setSelectedDate = useUiStore((state) => state.setSelectedDate);
  const calendarViewMode = useUiStore((state) => state.calendarViewMode);
  const setCalendarViewMode = useUiStore((state) => state.setCalendarViewMode);

  // Initial data fetch
  useEffect(() => {
    fetchTasks();
    fetchCategories();
  }, []);

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
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

  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : [];

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Calendar header */}
        <CalendarHeader
          currentDate={currentMonth}
          onPreviousMonth={handlePreviousMonth}
          onNextMonth={handleNextMonth}
          onToday={handleToday}
        />

        {/* View mode toggle */}
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              calendarViewMode === 'monthly' && styles.toggleButtonActive,
            ]}
            onPress={() => setCalendarViewMode('monthly')}
          >
            <Text
              style={[
                styles.toggleText,
                calendarViewMode === 'monthly' && styles.toggleTextActive,
              ]}
            >
              Month
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleButton,
              calendarViewMode === 'weekly' && styles.toggleButtonActive,
            ]}
            onPress={() => setCalendarViewMode('weekly')}
          >
            <Text
              style={[
                styles.toggleText,
                calendarViewMode === 'weekly' && styles.toggleTextActive,
              ]}
            >
              Week
            </Text>
          </TouchableOpacity>
        </View>

        {/* Calendar view */}
        {calendarViewMode === 'monthly' ? (
          <CalendarGrid
            currentDate={currentMonth}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
            getTaskCountForDate={getTaskCountForDate}
          />
        ) : (
          <WeeklyView
            currentDate={currentMonth}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
            getTaskCountForDate={getTaskCountForDate}
          />
        )}

        {/* Selected date tasks */}
        {selectedDate && (
          <View style={styles.tasksSection}>
            <Text style={styles.tasksSectionTitle}>
              Tasks for {selectedDate.toLocaleDateString()}
            </Text>
            <TaskList
              tasks={selectedDateTasks}
              onToggleComplete={toggleComplete}
              showCategory={true}
              getCategoryName={getCategoryName}
              emptyMessage="No tasks for this date"
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.white,
  },
  viewToggle: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.light,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.surface.medium,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  toggleText: {
    fontSize: typography.body.fontSize,
    color: colors.text.primary,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: colors.surface.white,
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
});
