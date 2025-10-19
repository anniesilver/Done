// WeeklyView component - Horizontal swipeable week view

import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { colors, spacing, typography } from '../../config/theme';
import { startOfWeek, addDays, addWeeks, subWeeks, isSameDay, isToday, format } from 'date-fns';

interface WeeklyViewProps {
  currentDate: Date;
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  onWeekChange?: (newDate: Date) => void; // Callback when week changes via swipe
  getTaskCountForDate?: (date: Date) => number;
}

const { width: screenWidth } = Dimensions.get('window');
const HORIZONTAL_PADDING = spacing.md * 2;
const DAY_GAP = spacing.xs;
const TOTAL_GAPS = DAY_GAP * 6;
const DAY_CARD_WIDTH = (screenWidth - HORIZONTAL_PADDING - TOTAL_GAPS) / 7;
const WEEK_WIDTH = screenWidth;

export const WeeklyView: React.FC<WeeklyViewProps> = ({
  currentDate,
  selectedDate,
  onSelectDate,
  onWeekChange,
  getTaskCountForDate,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);

  // Generate 3 weeks: previous, current, next
  const prevWeekStart = startOfWeek(subWeeks(currentDate, 1));
  const currWeekStart = startOfWeek(currentDate);
  const nextWeekStart = startOfWeek(addWeeks(currentDate, 1));

  const weeks = [
    { weekStart: prevWeekStart, index: 0 },
    { weekStart: currWeekStart, index: 1 },
    { weekStart: nextWeekStart, index: 2 },
  ];

  // Scroll to current week on mount and when currentDate changes
  useEffect(() => {
    scrollViewRef.current?.scrollTo({ x: WEEK_WIDTH, animated: false });
  }, [currentDate]);

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / WEEK_WIDTH);

    if (page === 0 && onWeekChange) {
      // Scrolled to previous week
      onWeekChange(subWeeks(currentDate, 1));
    } else if (page === 2 && onWeekChange) {
      // Scrolled to next week
      onWeekChange(addWeeks(currentDate, 1));
    }
  };

  const renderWeek = (weekStart: Date) => {
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    return (
      <View style={styles.weekContainer}>
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
              <Text
                style={[
                  styles.weekdayLabel,
                  isSelected && styles.weekdayLabelSelected,
                ]}
              >
                {format(date, 'EEE')}
              </Text>

              <Text
                style={[
                  styles.dayNumber,
                  isSelected && styles.dayNumberSelected,
                  isCurrentDay && styles.dayNumberToday,
                ]}
              >
                {format(date, 'd')}
              </Text>

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

  return (
    <ScrollView
      ref={scrollViewRef}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      onMomentumScrollEnd={handleScrollEnd}
      scrollEventThrottle={16}
      decelerationRate="fast"
    >
      {weeks.map(({ weekStart, index }) => (
        <View key={index} style={{ width: WEEK_WIDTH }}>
          {renderWeek(weekStart)}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  weekContainer: {
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
