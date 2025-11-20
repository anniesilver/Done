// TaskDurationPicker - Standalone duration picker component

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography } from '../../config/theme';

interface TaskDurationPickerProps {
  value: number; // in minutes
  onChange: (duration: number) => void;
  showWarning?: boolean;
}

export const TaskDurationPicker: React.FC<TaskDurationPickerProps> = ({
  value,
  onChange,
  showWarning = false,
}) => {
  const [showPicker, setShowPicker] = useState(false);

  const durationOptions = [
    { label: '15 min', value: 15 },
    { label: '30 min', value: 30 },
    { label: '45 min', value: 45 },
    { label: '1 hour', value: 60 },
    { label: '1.5 hours', value: 90 },
    { label: '2 hours', value: 120 },
    { label: '3 hours', value: 180 },
    { label: '4 hours', value: 240 },
  ];

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const handleSelect = (duration: number) => {
    Haptics.selectionAsync();
    onChange(duration);
    setShowPicker(false);
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
          <Text style={styles.icon}>⏱️</Text>
          <Text style={styles.label}>Duration</Text>
          {showWarning && <Text style={styles.warning}>⚠️</Text>}
        </View>
        <View style={styles.right}>
          <Text style={styles.value}>{formatDuration(value)}</Text>
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
              <Text style={styles.modalTitle}>Select Duration</Text>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.optionsList}>
              {durationOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.optionItem}
                  onPress={() => handleSelect(option.value)}
                >
                  <Text style={[
                    styles.optionText,
                    value === option.value && styles.optionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                  {value === option.value && <Text style={styles.checkmark}>✓</Text>}
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
