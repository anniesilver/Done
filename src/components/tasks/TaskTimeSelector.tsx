// TaskTimeSelector component - Date and time picker for task due date

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet, TextInput } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, spacing, typography } from '../../config/theme';
import { format, parse } from 'date-fns';

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

  const handleWebDateChange = (dateString: string) => {
    try {
      const parsed = parse(dateString, 'yyyy-MM-dd', new Date());
      if (value) {
        parsed.setHours(value.getHours());
        parsed.setMinutes(value.getMinutes());
      }
      onChange(parsed);
    } catch (e) {
      // Invalid date, ignore
    }
  };

  const handleWebTimeChange = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':').map(Number);
      const newDate = value ? new Date(value) : new Date();
      newDate.setHours(hours);
      newDate.setMinutes(minutes);
      onChange(newDate);
    } catch (e) {
      // Invalid time, ignore
    }
  };

  // Web version with HTML inputs
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.buttonRow}>
          <TextInput
            style={[styles.selectButton, styles.webInput]}
            value={value ? format(value, 'yyyy-MM-dd') : ''}
            onChange={(e: any) => handleWebDateChange(e.target.value)}
            placeholder="Select date"
            type="date"
          />
          <TextInput
            style={[styles.selectButton, styles.webInput]}
            value={value ? format(value, 'HH:mm') : ''}
            onChange={(e: any) => handleWebTimeChange(e.target.value)}
            placeholder="Select time"
            type="time"
          />
          {value && (
            <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  // Native version with DateTimePicker
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

      {/* iOS: Combined date+time picker */}
      {Platform.OS === 'ios' && showDatePicker && (
        <>
          <DateTimePicker
            value={tempDate}
            mode="datetime"
            display="inline"
            onChange={(event, selectedDate) => {
              if (selectedDate) {
                setTempDate(selectedDate);
              }
            }}
            minimumDate={minDate}
          />
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
        </>
      )}

      {/* Android: Separate date and time pickers */}
      {Platform.OS === 'android' && showDatePicker && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={minDate}
        />
      )}

      {Platform.OS === 'android' && showTimePicker && (
        <DateTimePicker
          value={tempDate}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
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
  webInput: {
    outlineStyle: 'none',
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
