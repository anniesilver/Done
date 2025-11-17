// TaskItem component - Individual task display with checkbox, text, and swipe actions

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';
import { Task } from '../../types/task';
import { colors, spacing, typography } from '../../config/theme';
import { format } from 'date-fns';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: number | string) => void;
  onPress?: () => void;
  onDelete?: (id: number | string) => void;
  showCategory?: boolean;
  categoryName?: string;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleComplete,
  onPress,
  onDelete,
  showCategory = false,
  categoryName,
}) => {
  const swipeableRef = React.useRef<Swipeable>(null);

  // Get category color based on category ID
  const getCategoryColor = () => {
    if (!task.categoryId) return colors.categories[0];
    const colorIndex = (task.categoryId - 1) % colors.categories.length;
    return colors.categories[colorIndex];
  };

  const handleCheckboxPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggleComplete(task.id);
  };

  const handlePress = () => {
    if (onPress) {
      Haptics.selectionAsync();
      onPress();
    }
  };

  const handleDelete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    swipeableRef.current?.close();
    if (onDelete) {
      onDelete(task.id);
    }
  };

  const handleEdit = () => {
    Haptics.selectionAsync();
    swipeableRef.current?.close();
    if (onPress) {
      onPress();
    }
  };

  // Right swipe action - Quick complete
  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const trans = dragX.interpolate({
      inputRange: [0, 100],
      outputRange: [0, 0],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        style={[
          styles.rightAction,
          {
            transform: [{ translateX: trans }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.completeAction}
          onPress={handleCheckboxPress}
        >
          <Icon name="check" size={24} color={colors.surface.white} />
          <Text style={styles.actionText}>Complete</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Left swipe actions - Edit and Delete
  const renderLeftActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const trans = dragX.interpolate({
      inputRange: [-160, 0],
      outputRange: [0, 0],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        style={[
          styles.leftActions,
          {
            transform: [{ translateX: trans }],
          },
        ]}
      >
        <TouchableOpacity style={styles.editAction} onPress={handleEdit}>
          <Icon name="pencil" size={24} color={colors.surface.white} />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteAction} onPress={handleDelete}>
          <Icon name="delete" size={24} color={colors.surface.white} />
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const handleSwipeableWillOpen = (direction: 'left' | 'right') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={!task.completed ? renderRightActions : undefined}
      renderLeftActions={renderLeftActions}
      onSwipeableWillOpen={handleSwipeableWillOpen}
      overshootRight={false}
      overshootLeft={false}
      rightThreshold={40}
      leftThreshold={40}
      friction={2}
    >
      <TouchableOpacity
        style={[styles.container, { backgroundColor: colors.surface.white }]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        {/* Checkbox */}
        <TouchableOpacity
          style={[styles.checkbox, task.completed && styles.checkboxCompleted]}
          onPress={handleCheckboxPress}
          activeOpacity={0.7}
        >
          {task.completed && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>

        {/* Task content */}
        <View style={styles.content}>
          <Text
            style={[
              styles.taskText,
              task.completed && styles.taskTextCompleted,
            ]}
          >
            {task.text}
          </Text>

          {/* Metadata row */}
          <View style={styles.metadata}>
            {showCategory && categoryName && (
              <View style={styles.categoryContainer}>
                <View style={[styles.categoryDot, { backgroundColor: getCategoryColor() }]} />
                <Text style={styles.categoryText}>{categoryName}</Text>
              </View>
            )}

            {task.dueDate && (
              <Text style={styles.dueDateText}>
                {format(new Date(task.dueDate), 'MMM d, yyyy')}
              </Text>
            )}

            {task.duration > 0 && (
              <Text style={styles.durationText}>{task.duration} min</Text>
            )}

            {task.recurrence !== 'none' && (
              <Text style={styles.recurrenceText}>
                ↻ {task.recurrence}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface.white,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.light,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary.main,
    marginRight: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCompleted: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  checkmark: {
    color: colors.surface.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  taskText: {
    fontSize: typography.body.fontSize,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  taskTextCompleted: {
    textDecorationLine: 'line-through',
    color: colors.text.disabled,
  },
  metadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    alignItems: 'center',
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  categoryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  categoryText: {
    fontSize: typography.caption.fontSize,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  dueDateText: {
    fontSize: typography.caption.fontSize,
    color: colors.text.secondary,
  },
  durationText: {
    fontSize: typography.caption.fontSize,
    color: colors.text.secondary,
  },
  recurrenceText: {
    fontSize: typography.caption.fontSize,
    color: colors.text.secondary,
  },
  rightAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  completeAction: {
    backgroundColor: colors.semantic.success,
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    height: '100%',
    paddingHorizontal: spacing.md,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editAction: {
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    paddingHorizontal: spacing.md,
  },
  deleteAction: {
    backgroundColor: colors.semantic.error,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    paddingHorizontal: spacing.md,
  },
  actionText: {
    color: colors.surface.white,
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
});
