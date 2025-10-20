// TimerPresets component - Quick preset buttons for common timer durations

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing, typography } from '../../config/theme';
import { TIMER_PRESETS } from '../../config/constants';

interface TimerPresetsProps {
  onSelectPreset: (minutes: number) => void;
  disabled?: boolean;
}

export const TimerPresets: React.FC<TimerPresetsProps> = ({
  onSelectPreset,
  disabled = false,
}) => {
  const formatPreset = (minutes: number): string => {
    if (minutes < 60) return `${minutes} min`;

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (mins === 0) return `${hours} hr`;
    return `${hours}h ${mins}m`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Quick Presets</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.presets}
      >
        {TIMER_PRESETS.map((preset) => (
          <TouchableOpacity
            key={preset}
            style={[styles.preset, disabled && styles.presetDisabled]}
            onPress={() => onSelectPreset(preset)}
            disabled={disabled}
            activeOpacity={0.7}
          >
            <Text style={[styles.presetText, disabled && styles.presetTextDisabled]}>
              {formatPreset(preset)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
  },
  label: {
    fontSize: typography.caption.fontSize,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
    fontWeight: '600',
  },
  presets: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  preset: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary.main,
    backgroundColor: colors.surface.white,
  },
  presetDisabled: {
    borderColor: colors.surface.medium,
    opacity: 0.5,
  },
  presetText: {
    fontSize: typography.caption.fontSize,
    color: colors.primary.main,
    fontWeight: '600',
  },
  presetTextDisabled: {
    color: colors.text.disabled,
  },
});
