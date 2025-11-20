// TaskTimeSelector component - Date and time picker for task due date

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet, TextInput, Modal, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, spacing, typography } from '../../config/theme';
import { format, parse, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';

interface TaskTimeSelectorProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  label?: string;
  minDate?: Date;
  onReminderChange?: (reminders: string[]) => void;
  onRepeatChange?: (repeat: string) => void;
  onDurationChange?: (duration: number) => void;
  reminderValue?: string[];
  repeatValue?: string;
  durationValue?: number;
}

export const TaskTimeSelector: React.FC<TaskTimeSelectorProps> = ({
  value,
  onChange,
  label = 'Due Date',
  minDate,
  onReminderChange,
  onRepeatChange,
  onDurationChange,
  reminderValue,
  repeatValue,
  durationValue,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [showRepeatPicker, setShowRepeatPicker] = useState(false);
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [mode, setMode] = useState<'date' | 'time'>('date');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(value);
  const [selectedTime, setSelectedTime] = useState<Date>(value || new Date());
  const [reminders, setReminders] = useState<string[]>(reminderValue || []);
  const [repeat, setRepeat] = useState<string>(repeatValue || 'None');
  const [duration, setDuration] = useState<number>(durationValue || 0);

  // Get minimum date - always start of today at minimum
  const getMinimumDate = () => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

    if (minDate) {
      const minDateStart = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate(), 0, 0, 0, 0);
      return minDateStart > todayStart ? minDateStart : todayStart;
    }

    return todayStart;
  };

  // Get initial date for picker
  const getInitialDate = () => {
    const minimum = getMinimumDate();
    if (value && value >= minimum) {
      return value;
    }
    // Return current time if it's after minimum, otherwise return minimum
    const now = new Date();
    return now >= minimum ? now : minimum;
  };

  const [tempDate, setTempDate] = useState<Date>(getInitialDate());

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
    setSelectedDate(null);
  };

  const handleShowDatePicker = () => {
    setShowDatePicker(true);
  };

  // Calendar helper functions for iOS
  const generateCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: startDate, end: endDate });
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  const handleDateSelect = (date: Date) => {
    if (isPastDate(date)) return;
    setSelectedDate(date);
  };

  const handleDone = () => {
    // Combine date and time if date is selected
    if (selectedDate) {
      const finalDate = new Date(selectedDate);
      finalDate.setHours(selectedTime.getHours());
      finalDate.setMinutes(selectedTime.getMinutes());
      onChange(finalDate);
    }

    // Pass back reminder, repeat, and duration settings
    if (onReminderChange) {
      onReminderChange(reminders);
    }
    if (onRepeatChange) {
      onRepeatChange(repeat);
    }
    if (onDurationChange) {
      onDurationChange(duration);
    }

    // Always close the modal
    setShowDatePicker(false);
    setShowTimePicker(false);
    setShowReminderPicker(false);
    setShowRepeatPicker(false);
    setShowDurationPicker(false);
  };

  const toggleReminder = (option: string) => {
    if (reminders.includes(option)) {
      setReminders(reminders.filter(r => r !== option));
    } else {
      setReminders([...reminders, option]);
    }
  };

  const getDurationLabel = () => {
    if (duration === 0) return 'No duration';
    const hours = Math.floor(duration / 60);
    const mins = duration % 60;
    if (hours === 0) return `${mins} min`;
    if (mins === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    return `${hours}h ${mins}m`;
  };

  const handleWebDateChange = (dateString: string) => {
    try {
      const parsed = parse(dateString, 'yyyy-MM-dd', new Date());
      if (value) {
        parsed.setHours(value.getHours());
        parsed.setMinutes(value.getMinutes());
      } else {
        // Set default time to noon if no previous value
        parsed.setHours(12);
        parsed.setMinutes(0);
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
    const today = new Date();
    const defaultDate = format(today, 'yyyy-MM-dd');
    const defaultTime = '12:00';

    return (
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.buttonRow}>
          <input
            style={{
              flex: 1,
              border: `1px solid ${colors.surface.medium}`,
              borderRadius: '8px',
              padding: `${spacing.md}px`,
              backgroundColor: colors.surface.white,
              fontSize: `${typography.body.fontSize}px`,
              outline: 'none',
              fontFamily: 'inherit',
              cursor: 'pointer',
            } as any}
            type="date"
            value={value ? format(value, 'yyyy-MM-dd') : ''}
            onChange={(e: any) => {
              if (e.target.value) {
                handleWebDateChange(e.target.value);
              }
            }}
            onFocus={(e: any) => {
              // Set default date when focused if no value
              if (!value) {
                e.target.value = defaultDate;
                handleWebDateChange(defaultDate);
              }
            }}
            min={format(getMinimumDate(), 'yyyy-MM-dd')}
            placeholder="Select date"
          />
          <input
            style={{
              flex: 1,
              border: `1px solid ${colors.surface.medium}`,
              borderRadius: '8px',
              padding: `${spacing.md}px`,
              backgroundColor: colors.surface.white,
              fontSize: `${typography.body.fontSize}px`,
              outline: 'none',
              fontFamily: 'inherit',
              cursor: 'pointer',
            } as any}
            type="time"
            value={value ? format(value, 'HH:mm') : ''}
            onChange={(e: any) => {
              if (e.target.value) {
                handleWebTimeChange(e.target.value);
              }
            }}
            onFocus={(e: any) => {
              // Set default time when focused if no time set
              if (!value) {
                e.target.value = defaultTime;
                handleWebTimeChange(defaultTime);
              }
            }}
            placeholder="Select time"
          />
        </View>
      </View>
    );
  }

  // iOS version with calendar picker
  if (Platform.OS === 'ios') {
    const calendarDays = generateCalendarDays();
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.selectRow}
          onPress={() => setShowDatePicker(true)}
        >
          <View style={styles.selectLeft}>
            <Text style={styles.selectIcon}>📅</Text>
            <Text style={styles.selectLabel}>{label}</Text>
          </View>
          <View style={styles.selectRight}>
            <Text style={styles.selectValue}>
              {value ? format(value, 'MMM d, h:mm a') : 'None'}
            </Text>
            <Text style={styles.chevron}>▶</Text>
          </View>
        </TouchableOpacity>

        {/* iOS Modal with Calendar */}
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => {
            setShowDatePicker(false);
            setShowTimePicker(false);
            setShowReminderPicker(false);
            setShowRepeatPicker(false);
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => {
                  setShowDatePicker(false);
                  setShowTimePicker(false);
                  setShowReminderPicker(false);
                  setShowRepeatPicker(false);
                }}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Select Date & Time</Text>
                <TouchableOpacity onPress={handleDone}>
                  <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
              </View>

              {/* Calendar - Fixed at top */}
              <View style={styles.calendarContainer}>
                {/* Month navigation */}
                <View style={styles.monthHeader}>
                  <TouchableOpacity onPress={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                    <Text style={styles.navButton}>‹</Text>
                  </TouchableOpacity>
                  <Text style={styles.monthTitle}>{format(currentMonth, 'MMMM yyyy')}</Text>
                  <TouchableOpacity onPress={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                    <Text style={styles.navButton}>›</Text>
                  </TouchableOpacity>
                </View>

                {/* Week day headers */}
                <View style={styles.weekDaysRow}>
                  {weekDays.map((day) => (
                    <View key={day} style={styles.weekDayCell}>
                      <Text style={styles.weekDayText}>{day}</Text>
                    </View>
                  ))}
                </View>

                {/* Calendar grid */}
                <View style={styles.daysGrid}>
                  {calendarDays.map((day, index) => {
                    const isCurrentMonth = isSameMonth(day, currentMonth);
                    const isPast = isPastDate(day);
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const isToday = isSameDay(day, new Date());

                    return (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.dayCell,
                          isSelected && styles.selectedDay,
                          isToday && !isSelected && styles.todayDay,
                        ]}
                        onPress={() => handleDateSelect(day)}
                        disabled={isPast || !isCurrentMonth}
                      >
                        <Text style={[
                          styles.dayText,
                          !isCurrentMonth && styles.otherMonthDay,
                          isPast && styles.pastDay,
                          isSelected && styles.selectedDayText,
                          isToday && !isSelected && styles.todayDayText,
                        ]}>
                          {format(day, 'd')}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Options Section - Scrollable */}
              <ScrollView style={styles.optionsScrollView} bounces={false}>
                <View style={styles.optionsContainer}>
                  {/* Time Option */}
                  <TouchableOpacity
                    style={styles.optionRow}
                    onPress={() => setShowTimePicker(!showTimePicker)}
                  >
                    <View style={styles.optionLeft}>
                      <Text style={styles.optionIcon}>🕐</Text>
                      <Text style={styles.optionLabel}>Time</Text>
                    </View>
                    <View style={styles.optionRight}>
                      <Text style={styles.optionValue}>
                        {selectedTime ? format(selectedTime, 'h:mm a') : 'None'}
                      </Text>
                      <Text style={styles.chevron}>{showTimePicker ? '▼' : '▶'}</Text>
                    </View>
                  </TouchableOpacity>

                  {showTimePicker && (
                    <View style={styles.expandedPickerContainer}>
                      <DateTimePicker
                        value={selectedTime}
                        mode="time"
                        display="spinner"
                        onChange={(event, time) => {
                          if (time) {
                            setSelectedTime(time);
                          }
                        }}
                        textColor={colors.text.primary}
                      />
                    </View>
                  )}

                  {/* Reminder Option - Multiple Choice */}
                  <TouchableOpacity
                    style={styles.optionRow}
                    onPress={() => setShowReminderPicker(!showReminderPicker)}
                  >
                    <View style={styles.optionLeft}>
                      <Text style={styles.optionIcon}>🔔</Text>
                      <Text style={styles.optionLabel}>Reminder</Text>
                    </View>
                    <View style={styles.optionRight}>
                      <Text style={styles.optionValue}>
                        {reminders.length === 0 ? 'None' : `${reminders.length} selected`}
                      </Text>
                      <Text style={styles.chevron}>{showReminderPicker ? '▼' : '▶'}</Text>
                    </View>
                  </TouchableOpacity>

                  {showReminderPicker && (
                    <View style={styles.expandedOptionsContainer}>
                      {['5 minutes before', '10 minutes before', '30 minutes before', '1 hour before', '1 day before'].map((option) => (
                        <TouchableOpacity
                          key={option}
                          style={styles.optionItem}
                          onPress={() => toggleReminder(option)}
                        >
                          <Text style={[
                            styles.optionItemText,
                            reminders.includes(option) && styles.optionItemTextSelected
                          ]}>{option}</Text>
                          {reminders.includes(option) && <Text style={styles.checkMark}>✓</Text>}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {/* Duration Option */}
                  <TouchableOpacity
                    style={styles.optionRow}
                    onPress={() => setShowDurationPicker(!showDurationPicker)}
                  >
                    <View style={styles.optionLeft}>
                      <Text style={styles.optionIcon}>⏱️</Text>
                      <Text style={styles.optionLabel}>Duration</Text>
                    </View>
                    <View style={styles.optionRight}>
                      <Text style={styles.optionValue}>{getDurationLabel()}</Text>
                      <Text style={styles.chevron}>{showDurationPicker ? '▼' : '▶'}</Text>
                    </View>
                  </TouchableOpacity>

                  {showDurationPicker && (
                    <View style={styles.expandedOptionsContainer}>
                      {[
                        { label: 'No duration', value: 0 },
                        { label: '15 min', value: 15 },
                        { label: '30 min', value: 30 },
                        { label: '45 min', value: 45 },
                        { label: '1 hour', value: 60 },
                        { label: '1.5 hours', value: 90 },
                        { label: '2 hours', value: 120 },
                      ].map((option) => (
                        <TouchableOpacity
                          key={option.value}
                          style={styles.optionItem}
                          onPress={() => {
                            setDuration(option.value);
                            setShowDurationPicker(false);
                          }}
                        >
                          <Text style={[
                            styles.optionItemText,
                            duration === option.value && styles.optionItemTextSelected
                          ]}>{option.label}</Text>
                          {duration === option.value && <Text style={styles.checkMark}>✓</Text>}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {/* Repeat Option */}
                  <TouchableOpacity
                    style={styles.optionRow}
                    onPress={() => setShowRepeatPicker(!showRepeatPicker)}
                  >
                    <View style={styles.optionLeft}>
                      <Text style={styles.optionIcon}>🔁</Text>
                      <Text style={styles.optionLabel}>Repeat</Text>
                    </View>
                    <View style={styles.optionRight}>
                      <Text style={styles.optionValue}>{repeat}</Text>
                      <Text style={styles.chevron}>{showRepeatPicker ? '▼' : '▶'}</Text>
                    </View>
                  </TouchableOpacity>

                  {showRepeatPicker && (
                    <View style={styles.expandedOptionsContainer}>
                      {['None', 'Daily', 'Weekly', 'Monthly', 'Yearly'].map((option) => (
                        <TouchableOpacity
                          key={option}
                          style={styles.optionItem}
                          onPress={() => {
                            setRepeat(option);
                            setShowRepeatPicker(false);
                          }}
                        >
                          <Text style={[
                            styles.optionItemText,
                            repeat === option && styles.optionItemTextSelected
                          ]}>{option}</Text>
                          {repeat === option && <Text style={styles.checkMark}>✓</Text>}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // Android version with sequential pickers
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <TouchableOpacity
        style={styles.selectButton}
        onPress={handleShowDatePicker}
      >
        <Text style={styles.selectButtonText}>
          {value ? format(value, 'MMM d, yyyy h:mm a') : 'Select date & time'}
        </Text>
      </TouchableOpacity>

      {/* Android: Separate date and time pickers */}
      {showDatePicker && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={getMinimumDate()}
        />
      )}

      {showTimePicker && (
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
    borderTopWidth: 1,
    borderTopColor: colors.surface.medium,
  },
  selectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface.white,
    minHeight: 44,
  },
  selectLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  selectIcon: {
    fontSize: 18,
  },
  selectLabel: {
    fontSize: typography.body.fontSize,
    color: colors.text.primary,
  },
  selectRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  selectValue: {
    fontSize: typography.body.fontSize,
    color: colors.text.secondary,
  },
  chevron: {
    fontSize: 12,
    color: colors.text.disabled,
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
  clearButtonFullWidth: {
    borderWidth: 1,
    borderColor: colors.semantic.danger,
    borderRadius: 8,
    padding: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  pickerContainer: {
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.surface.medium,
    borderRadius: 8,
    padding: spacing.sm,
    backgroundColor: colors.surface.light,
  },
  datePicker: {
    height: 200,
    width: '100%',
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
    color: colors.primary.main,
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.surface.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: spacing.md,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.medium,
  },
  modalTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: '600',
    color: colors.text.primary,
  },
  cancelButtonText: {
    fontSize: typography.body.fontSize,
    color: colors.text.secondary,
  },
  disabledText: {
    opacity: 0.3,
  },
  calendarContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  monthTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.text.primary,
  },
  navButton: {
    fontSize: 24,
    color: colors.primary.main,
    paddingHorizontal: spacing.sm,
  },
  weekDaysRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  weekDayText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  calendarGrid: {
    maxHeight: 240,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  dayText: {
    fontSize: 14,
    color: colors.text.primary,
  },
  otherMonthDay: {
    color: colors.text.disabled,
  },
  pastDay: {
    color: colors.text.disabled,
    textDecorationLine: 'line-through',
  },
  selectedDay: {
    backgroundColor: colors.primary.main,
    borderRadius: 16,
  },
  selectedDayText: {
    color: colors.surface.white,
    fontWeight: '700',
  },
  todayDay: {
    borderWidth: 1.5,
    borderColor: colors.primary.main,
    borderRadius: 16,
  },
  todayDayText: {
    color: colors.primary.main,
    fontWeight: '600',
  },
  timePickerContainer: {
    paddingVertical: spacing.md,
  },
  optionsScrollView: {
    maxHeight: 280,
    flexGrow: 0,
  },
  optionsContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.surface.medium,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.light,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  optionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  optionIcon: {
    fontSize: 20,
  },
  optionLabel: {
    fontSize: typography.body.fontSize,
    fontWeight: '500',
    color: colors.text.primary,
  },
  optionValue: {
    fontSize: typography.body.fontSize,
    color: colors.text.secondary,
  },
  chevron: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  expandedPickerContainer: {
    backgroundColor: colors.surface.light,
    paddingVertical: spacing.sm,
  },
  expandedOptionsContainer: {
    backgroundColor: colors.surface.light,
    paddingVertical: spacing.xs,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  optionItemText: {
    fontSize: typography.body.fontSize,
    color: colors.text.primary,
  },
  optionItemTextSelected: {
    color: colors.primary.main,
    fontWeight: '600',
  },
  checkMark: {
    fontSize: typography.body.fontSize,
    color: colors.primary.main,
    fontWeight: '700',
  },
});
