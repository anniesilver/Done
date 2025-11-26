// ScreenHeader - Unified header component for all main tabs

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, typography } from '../../config/theme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  leftIcon?: string;
  rightIcon?: string;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  children?: React.ReactNode; // For additional content like progress bar
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
  children,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        {/* Left icon or spacer */}
        <View style={styles.iconContainer}>
          {leftIcon && onLeftPress ? (
            <TouchableOpacity onPress={onLeftPress} style={styles.iconButton}>
              <Icon name={leftIcon} size={22} color={colors.surface.white} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Title and subtitle */}
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
          )}
        </View>

        {/* Right icon or spacer */}
        <View style={styles.iconContainer}>
          {rightIcon && onRightPress ? (
            <TouchableOpacity onPress={onRightPress} style={styles.iconButton}>
              <Icon name={rightIcon} size={22} color={colors.surface.white} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Additional content (e.g., progress bar) */}
      {children && <View style={styles.childrenContainer}>{children}</View>}
    </View>
  );
};

const HEADER_HEIGHT = 110; // Fixed header height for consistency

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary.main,
    paddingTop: spacing.xl + spacing.lg, // Account for status bar
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: HEADER_HEIGHT,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.surface.white,
  },
  subtitle: {
    fontSize: typography.caption.fontSize,
    color: colors.surface.white,
    opacity: 0.85,
    marginTop: 2,
  },
  childrenContainer: {
    marginTop: spacing.sm,
  },
});
