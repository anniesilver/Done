// CalendarHeader component - Month/year display with navigation

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../config/theme';
import { format } from 'date-fns';

interface CalendarHeaderProps {
  currentDate: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  onPreviousMonth,
  onNextMonth,
  onToday,
}) => {
  return (
    <View style={styles.container}>
      {/* Month and Year */}
      <Text style={styles.monthYear}>
        {format(currentDate, 'MMMM yyyy')}
      </Text>

      {/* Navigation buttons */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.button}
          onPress={onPreviousMonth}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>←</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.todayButton}
          onPress={onToday}
          activeOpacity={0.7}
        >
          <Text style={styles.todayButtonText}>Today</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={onNextMonth}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>→</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    backgroundColor: colors.surface.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.light,
  },
  monthYear: {
    fontSize: typography.h3.fontSize,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 20,
    color: colors.text.primary,
  },
  todayButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.primary.main,
  },
  todayButtonText: {
    fontSize: typography.caption.fontSize,
    color: colors.surface.white,
    fontWeight: '600',
  },
});
