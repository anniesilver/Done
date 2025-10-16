// CalendarDay component - Single day cell in calendar

import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../config/theme';
import { isSameDay, isToday } from 'date-fns';

interface CalendarDayProps {
  date: Date;
  isCurrentMonth: boolean;
  selectedDate: Date | null;
  onPress: (date: Date) => void;
  taskCount?: number;
}

export const CalendarDay: React.FC<CalendarDayProps> = ({
  date,
  isCurrentMonth,
  selectedDate,
  onPress,
  taskCount = 0,
}) => {
  const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;
  const isCurrentDay = isToday(date);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        !isCurrentMonth && styles.otherMonth,
        isSelected && styles.selected,
        isCurrentDay && styles.today,
      ]}
      onPress={() => onPress(date)}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.dayNumber,
          !isCurrentMonth && styles.dayNumberOtherMonth,
          isSelected && styles.dayNumberSelected,
          isCurrentDay && styles.dayNumberToday,
        ]}
      >
        {date.getDate()}
      </Text>

      {taskCount > 0 && (
        <View style={styles.taskIndicator}>
          <Text style={styles.taskCount}>{taskCount > 9 ? '9+' : taskCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    position: 'relative',
  },
  otherMonth: {
    opacity: 0.3,
  },
  selected: {
    backgroundColor: colors.primary.main,
  },
  today: {
    borderWidth: 2,
    borderColor: colors.primary.main,
  },
  dayNumber: {
    fontSize: typography.body.fontSize,
    color: colors.text.primary,
    fontWeight: '500',
  },
  dayNumberOtherMonth: {
    color: colors.text.disabled,
  },
  dayNumberSelected: {
    color: colors.surface.white,
    fontWeight: 'bold',
  },
  dayNumberToday: {
    fontWeight: 'bold',
  },
  taskIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.semantic.info,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  taskCount: {
    fontSize: 10,
    color: colors.surface.white,
    fontWeight: 'bold',
  },
});
