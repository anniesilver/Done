// TimelineView component - Visual timeline scheduler showing tasks in time slots

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Task } from '../../types/task';
import { Category } from '../../types/category';
import { colors, spacing, typography } from '../../config/theme';
import { format } from 'date-fns';

interface TimelineViewProps {
  tasks: Task[];
  categories: Category[];
  onToggleComplete: (taskId: number | string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: number | string) => void;
}

const HOUR_HEIGHT = 80; // pixels per hour (1.33px per minute for better visibility)
const TIME_COLUMN_WIDTH = 60;
const { width: screenWidth } = Dimensions.get('window');
const TASK_COLUMN_WIDTH = screenWidth - TIME_COLUMN_WIDTH - spacing.md * 2;

export const TimelineView: React.FC<TimelineViewProps> = ({
  tasks,
  categories,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-scroll to current hour on mount
  useEffect(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const scrollPosition = (currentHour * HOUR_HEIGHT) + (currentMinute * (HOUR_HEIGHT / 60)) - 100;

    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: Math.max(0, scrollPosition), animated: true });
    }, 100);
  }, []);

  // Get current time position for red line indicator
  const getCurrentTimePosition = (): number => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    return (hours * HOUR_HEIGHT) + (minutes * (HOUR_HEIGHT / 60));
  };

  // Get task vertical position based on due time
  const getTaskPosition = (task: Task): number => {
    if (!task.dueDate) return 0;

    const dueDate = new Date(task.dueDate);
    const hours = dueDate.getHours();
    const minutes = dueDate.getMinutes();
    return (hours * HOUR_HEIGHT) + (minutes * (HOUR_HEIGHT / 60));
  };

  // Get task height based on duration (proportional to time)
  const getTaskHeight = (duration: number): number => {
    // Calculate height: duration in minutes * (HOUR_HEIGHT / 60 minutes)
    // 15 min = 20px, 30 min = 40px, 60 min = 80px
    return (duration * HOUR_HEIGHT) / 60;
  };

  // Get category color based on category ID
  const getCategoryColor = (categoryId: number | null): string => {
    if (!categoryId) return colors.categories[0]; // Default to first color

    // Map category ID to color array (cycle through 10 colors)
    const category = categories.find(c => c.id === categoryId);
    if (!category) return colors.categories[0];

    // Use category ID to pick color from palette
    const colorIndex = (categoryId - 1) % colors.categories.length;
    return colors.categories[colorIndex];
  };

  // Render hour labels (00:00 - 23:00)
  const renderTimeLabels = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return hours.map(hour => (
      <View key={hour} style={[styles.hourRow, { height: HOUR_HEIGHT }]}>
        <View style={styles.timeLabel}>
          <Text style={styles.timeLabelText}>
            {hour.toString().padStart(2, '0')}:00
          </Text>
        </View>
        <View style={styles.hourLine} />
      </View>
    ));
  };

  // Render task block
  const renderTaskBlock = (task: Task) => {
    const position = getTaskPosition(task);
    const height = getTaskHeight(task.duration);
    const categoryColor = getCategoryColor(task.categoryId);
    const isCompleted = task.completed;

    return (
      <View
        key={task.id}
        style={[
          styles.taskBlock,
          {
            top: position,
            height,
            backgroundColor: isCompleted
              ? colors.surface.medium
              : `${categoryColor}CC`, // 80% opacity
            opacity: isCompleted ? 0.5 : 1,
            width: TASK_COLUMN_WIDTH,
          },
        ]}
      >
        {/* Task text */}
        <Text
          style={[
            styles.taskText,
            isCompleted && styles.taskTextCompleted,
          ]}
          numberOfLines={2}
        >
          {task.text}
        </Text>

        {/* Time info */}
        {task.dueDate && (
          <Text style={styles.taskTime}>
            {format(new Date(task.dueDate), 'h:mm a')}
            {task.duration > 0 && ` • ${task.duration} min`}
          </Text>
        )}

        {/* Action icons */}
        <View style={styles.actionIcons}>
          {/* Checkmark - toggle completion */}
          <TouchableOpacity
            onPress={() => onToggleComplete(task.id)}
            style={styles.iconButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon
              name={isCompleted ? "checkbox-marked" : "checkbox-blank-outline"}
              size={16}
              color={isCompleted ? colors.semantic.success : colors.surface.white}
            />
          </TouchableOpacity>

          {/* Edit */}
          <TouchableOpacity
            onPress={() => onEditTask(task)}
            style={styles.iconButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="pencil" size={16} color={colors.surface.white} />
          </TouchableOpacity>

          {/* Delete */}
          <TouchableOpacity
            onPress={() => onDeleteTask(task.id)}
            style={styles.iconButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="delete" size={16} color={colors.surface.white} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Render current time indicator (red line)
  const renderCurrentTimeIndicator = () => {
    const position = getCurrentTimePosition();

    return (
      <View style={[styles.currentTimeIndicator, { top: position }]}>
        <View style={styles.currentTimeDot} />
        <View style={styles.currentTimeLine} />
      </View>
    );
  };

  // Filter tasks that have due date and duration
  const timelineTasks = tasks.filter(t => t.dueDate && t.duration > 0);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.timeline}>
          {/* Time labels column */}
          <View style={styles.timeColumn}>
            {renderTimeLabels()}
          </View>

          {/* Tasks column */}
          <View style={styles.tasksColumn}>
            {/* Render all task blocks */}
            {timelineTasks.map(task => renderTaskBlock(task))}

            {/* Current time indicator */}
            {renderCurrentTimeIndicator()}

            {/* Empty state */}
            {timelineTasks.length === 0 && (
              <View style={styles.emptyState}>
                <Icon name="calendar-blank" size={64} color={colors.surface.medium} />
                <Text style={styles.emptyText}>No scheduled tasks for today</Text>
                <Text style={styles.emptyHint}>
                  Tap the + button to create a task with a specific time
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Add padding at bottom */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
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
  timeline: {
    flexDirection: 'row',
    position: 'relative',
  },
  timeColumn: {
    width: TIME_COLUMN_WIDTH,
    backgroundColor: colors.surface.light,
    borderRightWidth: 1,
    borderRightColor: colors.surface.medium,
  },
  hourRow: {
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.medium,
    justifyContent: 'flex-start',
  },
  timeLabel: {
    paddingTop: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  timeLabelText: {
    fontSize: typography.caption.fontSize,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  hourLine: {
    flex: 1,
  },
  tasksColumn: {
    flex: 1,
    position: 'relative',
    paddingHorizontal: spacing.sm,
  },
  taskBlock: {
    position: 'absolute',
    left: spacing.sm,
    right: spacing.sm,
    borderRadius: 6,
    padding: spacing.xs,
    paddingTop: 4,
    paddingBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    justifyContent: 'space-between',
  },
  taskText: {
    fontSize: 13,
    color: colors.surface.white,
    fontWeight: '600',
    marginBottom: 2,
    lineHeight: 16,
  },
  taskTextCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  taskTime: {
    fontSize: 11,
    color: colors.surface.white,
    opacity: 0.9,
    marginBottom: 2,
  },
  actionIcons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 2,
  },
  iconButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentTimeIndicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 100,
  },
  currentTimeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.semantic.error,
    marginLeft: -6,
  },
  currentTimeLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.semantic.error,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: HOUR_HEIGHT * 6, // Center around 6am
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    fontSize: typography.h3.fontSize,
    color: colors.text.secondary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyHint: {
    fontSize: typography.body.fontSize,
    color: colors.text.disabled,
    textAlign: 'center',
  },
});
