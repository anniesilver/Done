import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../config/theme';

interface ButtonProps extends TouchableOpacityProps {
  title?: string;
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  children,
  variant = 'primary',
  loading = false,
  isLoading = false,
  fullWidth = false,
  disabled,
  style,
  ...props
}) => {
  const isLoadingState = loading || isLoading;
  const displayText = title || children;
  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryButton;
      case 'danger':
        return styles.dangerButton;
      default:
        return styles.primaryButton;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryText;
      case 'danger':
        return styles.dangerText;
      default:
        return styles.primaryText;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        fullWidth && styles.fullWidth,
        (disabled || isLoadingState) && styles.disabled,
        style,
      ]}
      disabled={disabled || isLoadingState}
      {...props}
    >
      {isLoadingState ? (
        <ActivityIndicator
          color={variant === 'secondary' ? colors.primary.main : colors.ui.textInverse}
        />
      ) : (
        <Text style={[styles.text, getTextStyle()]}>{displayText}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  fullWidth: {
    width: '100%',
  },
  primaryButton: {
    backgroundColor: colors.primary.main,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary.main,
  },
  dangerButton: {
    backgroundColor: colors.semantic.error,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold as any,
  },
  primaryText: {
    color: colors.ui.textInverse,
  },
  secondaryText: {
    color: colors.primary.main,
  },
  dangerText: {
    color: colors.ui.textInverse,
  },
});
