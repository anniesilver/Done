// CalendarGrid component - Monthly calendar grid view

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CalendarDay } from './CalendarDay';
import { colors, spacing, typography } from '../../config/theme';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
} from 'date-fns';

interface CalendarGridProps {
  currentDate: Date;
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  getTaskCountForDate?: (date: Date) => number;
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentDate,
  selectedDate,
  onSelectDate,
  getTaskCountForDate,
}) => {
  // Calculate the calendar grid dates
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  return (
    <View style={styles.container}>
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
              isCurrentMonth={isSameMonth(date, currentDate)}
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

const styles = StyleSheet.create({
  container: {
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
