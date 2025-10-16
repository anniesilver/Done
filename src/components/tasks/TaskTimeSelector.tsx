// TaskTimeSelector component - Date and time picker for task due date

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, spacing, typography } from '../../config/theme';
import { format } from 'date-fns';

interface TaskTimeSelectorProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  label?: string;
  minDate?: Date;
}

export const TaskTimeSelector: React.FC<TaskTimeSelectorProps> = ({
  value,
  onChange,
  label = 'Due Date',
  minDate = new Date(),
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(value || new Date());

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (selectedDate) {
      setTempDate(selectedDate);
      if (Platform.OS === 'android') {
        // On Android, show time picker after date is selected
        setShowTimePicker(true);
      }
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);

    if (selectedTime) {
      // Combine the date from tempDate with the time from selectedTime
      const combined = new Date(tempDate);
      combined.setHours(selectedTime.getHours());
      combined.setMinutes(selectedTime.getMinutes());
      onChange(combined);
    } else if (Platform.OS === 'ios') {
      // iOS: just use the tempDate as-is
      onChange(tempDate);
    }
  };

  const handleClear = () => {
    onChange(null);
  };

  const handleShowDatePicker = () => {
    setShowDatePicker(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.selectButton}
          onPress={handleShowDatePicker}
        >
          <Text style={styles.selectButtonText}>
            {value ? format(value, 'MMM d, yyyy h:mm a') : 'Select date & time'}
          </Text>
        </TouchableOpacity>

        {value && (
          <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={handleDateChange}
          minimumDate={minDate}
        />
      )}

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={tempDate}
          mode="time"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={handleTimeChange}
        />
      )}

      {/* iOS combined picker */}
      {Platform.OS === 'ios' && showDatePicker && (
        <View style={styles.iosButtons}>
          <TouchableOpacity
            style={styles.doneButton}
            onPress={() => {
              setShowDatePicker(false);
              onChange(tempDate);
            }}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  selectButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.surface.medium,
    borderRadius: 8,
    padding: spacing.md,
    backgroundColor: colors.surface.white,
  },
  selectButtonText: {
    fontSize: typography.body.fontSize,
    color: colors.text.primary,
  },
  clearButton: {
    borderWidth: 1,
    borderColor: colors.semantic.danger,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    justifyContent: 'center',
  },
  clearButtonText: {
    fontSize: typography.body.fontSize,
    color: colors.semantic.danger,
    fontWeight: '600',
  },
  iosButtons: {
    marginTop: spacing.md,
    alignItems: 'flex-end',
  },
  doneButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  doneButtonText: {
    color: colors.surface.white,
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
});
