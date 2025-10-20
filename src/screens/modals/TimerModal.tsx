// TimerModal - Modal for task timer with countdown

import React, { useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TimerDisplay } from '../../components/timer/TimerDisplay';
import { TimerControls } from '../../components/timer/TimerControls';
import { TimerPresets } from '../../components/timer/TimerPresets';
import { useTimerStore } from '../../stores/timerStore';
import { colors, spacing, typography } from '../../config/theme';

interface TimerModalProps {
  visible: boolean;
  onClose: () => void;
  taskName?: string;
}

export const TimerModal: React.FC<TimerModalProps> = ({
  visible,
  onClose,
  taskName,
}) => {
  const minutes = useTimerStore((state) => state.minutes);
  const seconds = useTimerStore((state) => state.seconds);
  const isRunning = useTimerStore((state) => state.isRunning);
  const start = useTimerStore((state) => state.start);
  const pause = useTimerStore((state) => state.pause);
  const reset = useTimerStore((state) => state.reset);
  const setPreset = useTimerStore((state) => state.setPreset);

  // Auto-close when timer finishes
  useEffect(() => {
    if (minutes === 0 && seconds === 0 && !isRunning) {
      // Timer finished - could show notification here
      // For now, just reset
    }
  }, [minutes, seconds, isRunning]);

  const handleClose = () => {
    if (isRunning) {
      pause();
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Timer</Text>

          <View style={styles.closeButton} />
        </View>

        {/* Task name (if provided) */}
        {taskName && (
          <View style={styles.taskSection}>
            <Text style={styles.taskLabel}>Working on:</Text>
            <Text style={styles.taskName}>{taskName}</Text>
          </View>
        )}

        {/* Timer display */}
        <TimerDisplay minutes={minutes} seconds={seconds} />

        {/* Timer controls */}
        <TimerControls
          isRunning={isRunning}
          onStart={start}
          onPause={pause}
          onReset={reset}
        />

        {/* Timer presets */}
        <View style={styles.presetsSection}>
          <TimerPresets
            onSelectPreset={setPreset}
            disabled={isRunning}
          />
        </View>

        {/* Help text */}
        {!isRunning && minutes === 0 && seconds === 0 && (
          <View style={styles.helpSection}>
            <Text style={styles.helpText}>
              Select a preset above or set a custom timer to get started
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.light,
  },
  headerTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: '600',
    color: colors.text.primary,
  },
  closeButton: {
    minWidth: 60,
  },
  closeButtonText: {
    fontSize: typography.body.fontSize,
    color: colors.primary.main,
    fontWeight: '600',
  },
  taskSection: {
    padding: spacing.lg,
    backgroundColor: colors.surface.light,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.medium,
  },
  taskLabel: {
    fontSize: typography.caption.fontSize,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  taskName: {
    fontSize: typography.body.fontSize,
    color: colors.text.primary,
    fontWeight: '600',
  },
  presetsSection: {
    marginTop: spacing.xl,
  },
  helpSection: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  helpText: {
    fontSize: typography.caption.fontSize,
    color: colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
