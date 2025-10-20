// CalendarGrid component - Monthly calendar grid view with swipe navigation

import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { CalendarDay } from './CalendarDay';
import { colors, spacing, typography } from '../../config/theme';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  addMonths,
  subMonths,
} from 'date-fns';

interface CalendarGridProps {
  currentDate: Date;
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  onMonthChange?: (newDate: Date) => void; // Callback when month changes via swipe
  getTaskCountForDate?: (date: Date) => number;
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const { width: screenWidth } = Dimensions.get('window');
const MONTH_WIDTH = screenWidth;

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentDate,
  selectedDate,
  onSelectDate,
  onMonthChange,
  getTaskCountForDate,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);

  // Generate 3 months: previous, current, next
  const prevMonth = subMonths(currentDate, 1);
  const currMonth = currentDate;
  const nextMonth = addMonths(currentDate, 1);

  const months = [
    { month: prevMonth, index: 0 },
    { month: currMonth, index: 1 },
    { month: nextMonth, index: 2 },
  ];

  // Scroll to current month on mount and when currentDate changes
  useEffect(() => {
    scrollViewRef.current?.scrollTo({ x: MONTH_WIDTH, animated: false });
  }, [currentDate]);

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / MONTH_WIDTH);

    if (page === 0 && onMonthChange) {
      // Scrolled to previous month
      onMonthChange(subMonths(currentDate, 1));
    } else if (page === 2 && onMonthChange) {
      // Scrolled to next month
      onMonthChange(addMonths(currentDate, 1));
    }
  };

  const renderMonth = (monthDate: Date) => {
    // Calculate the calendar grid dates for this month
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({
      start: calendarStart,
      end: calendarEnd,
    });

    return (
      <View style={styles.monthContainer}>
        {/* Weekday headers */}
        <View style={styles.weekdayRow}>
          {WEEKDAY_LABELS.map((label) => (
            <View key={label} style={styles.weekdayCell}>
              <Text style={styles.weekdayLabel}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Calendar days grid */}
        <View style={styles.daysGrid}>
          {calendarDays.map((date) => (
            <View key={date.toISOString()} style={styles.dayCell}>
              <CalendarDay
                date={date}
                isCurrentMonth={isSameMonth(date, monthDate)}
                selectedDate={selectedDate}
                onPress={onSelectDate}
                taskCount={getTaskCountForDate ? getTaskCountForDate(date) : 0}
              />
            </View>
          ))}
        </View>
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
      {months.map(({ month, index }) => (
        <View key={index} style={{ width: MONTH_WIDTH }}>
          {renderMonth(month)}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  monthContainer: {
    backgroundColor: colors.surface.white,
    padding: spacing.sm,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  weekdayLabel: {
    fontSize: typography.caption.fontSize,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    padding: 2,
  },
});
