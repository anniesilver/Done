// WeeklyView component - Horizontal swipeable week view

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, FlatList } from 'react-native';
import { colors, spacing, typography } from '../../config/theme';
import { startOfWeek, addDays, addWeeks, subWeeks, isSameDay, isToday, format } from 'date-fns';

interface WeeklyViewProps {
  currentDate: Date;
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  getTaskCountForDate?: (date: Date) => number;
}

const { width: screenWidth } = Dimensions.get('window');
const HORIZONTAL_PADDING = spacing.md * 2; // Left + right padding
const DAY_GAP = spacing.xs;
const TOTAL_GAPS = DAY_GAP * 6; // 6 gaps between 7 days
const DAY_CARD_WIDTH = (screenWidth - HORIZONTAL_PADDING - TOTAL_GAPS) / 7;

export const WeeklyView: React.FC<WeeklyViewProps> = ({
  currentDate,
  selectedDate,
  onSelectDate,
  getTaskCountForDate,
}) => {
  const weekStart = startOfWeek(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <View style={styles.container}>
      {weekDays.map((date) => {
        const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;
        const isCurrentDay = isToday(date);
        const taskCount = getTaskCountForDate ? getTaskCountForDate(date) : 0;

        return (
          <TouchableOpacity
            key={date.toISOString()}
            style={[
              styles.dayCard,
              isSelected && styles.dayCardSelected,
              isCurrentDay && styles.dayCardToday,
            ]}
            onPress={() => onSelectDate(date)}
            activeOpacity={0.7}
          >
            {/* Weekday label */}
            <Text
              style={[
                styles.weekdayLabel,
                isSelected && styles.weekdayLabelSelected,
              ]}
            >
              {format(date, 'EEE')}
            </Text>

            {/* Day number */}
            <Text
              style={[
                styles.dayNumber,
                isSelected && styles.dayNumberSelected,
                isCurrentDay && styles.dayNumberToday,
              ]}
            >
              {format(date, 'd')}
            </Text>

            {/* Task count indicator */}
            {taskCount > 0 && (
              <View style={[styles.taskIndicator, isSelected && styles.taskIndicatorSelected]}>
                <Text style={styles.taskCount}>
                  {taskCount > 9 ? '9+' : taskCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: DAY_GAP,
    justifyContent: 'space-between',
  },
  dayCard: {
    width: DAY_CARD_WIDTH,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.surface.medium,
    backgroundColor: colors.surface.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCardSelected: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  dayCardToday: {
    borderColor: colors.primary.main,
    borderWidth: 2,
  },
  weekdayLabel: {
    fontSize: typography.caption.fontSize,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  weekdayLabelSelected: {
    color: colors.surface.white,
  },
  dayNumber: {
    fontSize: typography.h3.fontSize,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  dayNumberSelected: {
    color: colors.surface.white,
  },
  dayNumberToday: {
    color: colors.primary.main,
  },
  taskIndicator: {
    marginTop: spacing.xs,
    backgroundColor: colors.semantic.info,
    borderRadius: 8,
    minWidth: 20,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  taskIndicatorSelected: {
    backgroundColor: colors.surface.white,
  },
  taskCount: {
    fontSize: 10,
    color: colors.surface.white,
    fontWeight: 'bold',
  },
});
