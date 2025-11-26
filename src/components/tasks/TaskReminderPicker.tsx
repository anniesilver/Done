// TaskReminderPicker - Standalone reminder picker component

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography } from '../../config/theme';

interface TaskReminderPickerProps {
  value: string[]; // Array of reminder strings
  onChange: (reminders: string[]) => void;
  showWarning?: boolean;
}

export const TaskReminderPicker: React.FC<TaskReminderPickerProps> = ({
  value,
  onChange,
  showWarning = false,
}) => {
  const [showPicker, setShowPicker] = useState(false);

  const reminderOptions = [
    '5 minutes before',
    '10 minutes before',
    '30 minutes before',
    '1 hour before',
    '1 day before',
  ];

  const handleToggle = (option: string) => {
    Haptics.selectionAsync();
    if (value.includes(option)) {
      onChange(value.filter(r => r !== option));
    } else {
      onChange([...value, option]);
    }
  };

  const getDisplayValue = () => {
    if (value.length === 0) return 'None';
    if (value.length === 1) return value[0];
    return `${value.length} selected`;
  };

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
          <Text style={styles.icon}>🔔</Text>
          <Text style={styles.label}>Reminder</Text>
          {showWarning && <Text style={styles.warning}>⚠️</Text>}
        </View>
        <View style={styles.right}>
          <Text style={styles.value}>{getDisplayValue()}</Text>
          <Text style={styles.chevron}>▶</Text>
        </View>
      </TouchableOpacity>

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
              <Text style={styles.modalTitle}>Select Reminders</Text>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.optionsList}>
              {reminderOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.optionItem}
                  onPress={() => handleToggle(option)}
                >
                  <Text style={[
                    styles.optionText,
                    value.includes(option) && styles.optionTextSelected
                  ]}>
                    {option}
                  </Text>
                  {value.includes(option) && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    maxHeight: '60%',
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
  optionsList: {
    maxHeight: 400,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.light,
  },
  optionText: {
    fontSize: typography.body.fontSize,
    color: colors.text.primary,
  },
  optionTextSelected: {
    fontWeight: '600',
    color: colors.primary.main,
  },
  checkmark: {
    fontSize: 18,
    color: colors.primary.main,
    fontWeight: '600',
  },
});
