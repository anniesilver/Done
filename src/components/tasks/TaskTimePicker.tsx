// TaskTimePicker - Simplified date/time picker (iOS only for now)

import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Platform, PanResponder, Animated } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay } from 'date-fns';
import { colors, spacing, typography } from '../../config/theme';

interface TaskTimePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  showWarning?: boolean;
}

export const TaskTimePicker: React.FC<TaskTimePickerProps> = ({
  value,
  onChange,
  showWarning = false,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value || new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(value);
  const [selectedTime, setSelectedTime] = useState<Date>(value || new Date());

  // Animation for calendar swipe
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Swipe gesture for month navigation
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to clear horizontal swipes (more horizontal than vertical)
        const isHorizontal = Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.5;
        const hasMinDistance = Math.abs(gestureState.dx) > 15;
        return isHorizontal && hasMinDistance;
      },
      onPanResponderGrant: () => {
        // Reset animation when gesture starts
        slideAnim.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        // Only animate for horizontal movement
        if (Math.abs(gestureState.dx) > Math.abs(gestureState.dy)) {
          slideAnim.setValue(gestureState.dx * 0.5); // Dampen the movement
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const SWIPE_THRESHOLD = 50;

        if (gestureState.dx > SWIPE_THRESHOLD) {
          // Swiped right - go to previous month
          Haptics.selectionAsync();
          Animated.timing(slideAnim, {
            toValue: 400,
            duration: 150,
            useNativeDriver: true,
          }).start(() => {
            setCurrentMonth(prev => subMonths(prev, 1));
            slideAnim.setValue(-400);
            Animated.timing(slideAnim, {
              toValue: 0,
              duration: 150,
              useNativeDriver: true,
            }).start();
          });
        } else if (gestureState.dx < -SWIPE_THRESHOLD) {
          // Swiped left - go to next month
          Haptics.selectionAsync();
          Animated.timing(slideAnim, {
            toValue: -400,
            duration: 150,
            useNativeDriver: true,
          }).start(() => {
            setCurrentMonth(prev => addMonths(prev, 1));
            slideAnim.setValue(400);
            Animated.timing(slideAnim, {
              toValue: 0,
              duration: 150,
              useNativeDriver: true,
            }).start();
          });
        } else {
          // Not enough swipe - snap back
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const getMinimumDate = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  const generateCalendarDays = () => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  };

  const handleDateSelect = (day: Date) => {
    if (isPastDate(day) || !isSameMonth(day, currentMonth)) return;
    Haptics.selectionAsync();
    setSelectedDate(day);
  };

  const handleDone = () => {
    if (!selectedDate) {
      setShowPicker(false);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const combinedDateTime = new Date(selectedDate);
    combinedDateTime.setHours(selectedTime.getHours());
    combinedDateTime.setMinutes(selectedTime.getMinutes());

    onChange(combinedDateTime);
    setShowPicker(false);
  };

  const calendarDays = generateCalendarDays();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.row}
        onPress={() => {
          Haptics.selectionAsync();
          setShowPicker(true);
        }}
      >
        <View style={styles.left}>
          <Text style={styles.icon}>📅</Text>
          <Text style={styles.label}>Due Time</Text>
          {showWarning && <Text style={styles.warning}>⚠️</Text>}
        </View>
        <View style={styles.right}>
          <Text style={[styles.value, showWarning && styles.valueWarning]}>
            {value ? format(value, 'MMM d, h:mm a') : 'None'}
          </Text>
          <Text style={styles.chevron}>▶</Text>
        </View>
      </TouchableOpacity>

      {Platform.OS === 'ios' && (
        <Modal
          visible={showPicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowPicker(false)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Select Date & Time</Text>
                <TouchableOpacity onPress={handleDone}>
                  <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
              </View>

              {/* Calendar with swipe gesture */}
              <View style={styles.calendarContainer} {...panResponder.panHandlers}>
                <View style={styles.monthHeader}>
                  <TouchableOpacity onPress={() => {
                    Haptics.selectionAsync();
                    setCurrentMonth(subMonths(currentMonth, 1));
                  }}>
                    <Text style={styles.navButton}>‹</Text>
                  </TouchableOpacity>
                  <Text style={styles.monthTitle}>{format(currentMonth, 'MMMM yyyy')}</Text>
                  <TouchableOpacity onPress={() => {
                    Haptics.selectionAsync();
                    setCurrentMonth(addMonths(currentMonth, 1));
                  }}>
                    <Text style={styles.navButton}>›</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.weekDaysRow}>
                  {weekDays.map((day) => (
                    <View key={day} style={styles.weekDayCell}>
                      <Text style={styles.weekDayText}>{day}</Text>
                    </View>
                  ))}
                </View>

                <Animated.View style={[styles.daysGrid, { transform: [{ translateX: slideAnim }] }]}>
                  {calendarDays.map((day, index) => {
                    const isCurrentMonth = isSameMonth(day, currentMonth);
                    const isPast = isPastDate(day);
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const isToday = isSameDay(day, new Date());

                    return (
                      <TouchableOpacity
                        key={index}
                        style={styles.dayCell}
                        onPress={() => handleDateSelect(day)}
                        disabled={isPast || !isCurrentMonth}
                      >
                        {(isSelected || (isToday && !isSelected)) ? (
                          <View style={[
                            isSelected && styles.selectedDay,
                            isToday && !isSelected && styles.todayDay,
                          ]}>
                            <Text style={[
                              styles.dayText,
                              !isCurrentMonth && styles.otherMonthDay,
                              isPast && styles.pastDay,
                              isSelected && styles.selectedDayText,
                              isToday && !isSelected && styles.todayDayText,
                            ]}>
                              {format(day, 'd')}
                            </Text>
                          </View>
                        ) : (
                          <Text style={[
                            styles.dayText,
                            !isCurrentMonth && styles.otherMonthDay,
                            isPast && styles.pastDay,
                          ]}>
                            {format(day, 'd')}
                          </Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </Animated.View>
              </View>

              {/* Time Picker */}
              <View style={styles.timeSection}>
                <View style={styles.timeSectionHeader}>
                  <Text style={styles.timeSectionIcon}>🕐</Text>
                  <Text style={styles.timeSectionLabel}>Time</Text>
                </View>
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
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: colors.surface.medium,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface.white,
    minHeight: 44,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  icon: {
    fontSize: 18,
  },
  label: {
    fontSize: typography.body.fontSize,
    color: colors.text.primary,
  },
  warning: {
    fontSize: 16,
    marginLeft: spacing.xs,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  value: {
    fontSize: typography.body.fontSize,
    color: colors.text.secondary,
  },
  valueWarning: {
    color: colors.semantic.warning,
  },
  chevron: {
    fontSize: 12,
    color: colors.text.disabled,
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
    maxHeight: '90%',
    paddingBottom: spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.light,
  },
  modalTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: '600',
    color: colors.text.primary,
  },
  cancelButtonText: {
    fontSize: typography.body.fontSize,
    color: colors.text.secondary,
    fontWeight: '400',
  },
  doneButtonText: {
    fontSize: typography.body.fontSize,
    color: colors.primary.main,
    fontWeight: '600',
  },
  calendarContainer: {
    padding: spacing.md,
    overflow: 'hidden',
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  monthTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: '600',
    color: colors.text.primary,
  },
  navButton: {
    fontSize: 32,
    color: colors.primary.main,
    paddingHorizontal: spacing.md,
  },
  weekDaysRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
  },
  weekDayText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  selectedDay: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayDay: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: typography.body.fontSize,
    color: colors.text.primary,
  },
  otherMonthDay: {
    color: colors.text.disabled,
  },
  pastDay: {
    color: colors.text.disabled,
    textDecorationLine: 'line-through',
  },
  selectedDayText: {
    color: colors.surface.white,
    fontWeight: '600',
  },
  todayDayText: {
    color: colors.primary.main,
    fontWeight: '600',
  },
  timeSection: {
    borderTopWidth: 1,
    borderTopColor: colors.surface.medium,
    padding: spacing.md,
  },
  timeSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  timeSectionIcon: {
    fontSize: 18,
  },
  timeSectionLabel: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.text.primary,
  },
});
