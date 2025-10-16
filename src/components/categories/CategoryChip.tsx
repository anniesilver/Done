// CategoryChip component - Small chip to display category with icon

import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Category } from '../../types/category';
import { colors, spacing, typography } from '../../config/theme';

interface CategoryChipProps {
  category: Category;
  onPress?: () => void;
  selected?: boolean;
}

export const CategoryChip: React.FC<CategoryChipProps> = ({
  category,
  onPress,
  selected = false,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        selected && styles.chipSelected,
      ]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.icon}>{category.icon}</Text>
      <Text
        style={[
          styles.name,
          selected && styles.nameSelected,
        ]}
      >
        {category.name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.surface.medium,
    backgroundColor: colors.surface.white,
    gap: spacing.xs,
  },
  chipSelected: {
    backgroundColor: colors.primary.light,
    borderColor: colors.primary.main,
  },
  icon: {
    fontSize: 16,
  },
  name: {
    fontSize: typography.caption.fontSize,
    color: colors.text.primary,
  },
  nameSelected: {
    color: colors.primary.dark,
    fontWeight: '600',
  },
});
