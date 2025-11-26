// CategoryChip component - Small chip to display category with colored dot (iOS style)

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
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
  // Get category color from the color array based on category ID
  const getCategoryColor = () => {
    if (!category.id) return colors.categories[0];
    const colorIndex = (category.id - 1) % colors.categories.length;
    return colors.categories[colorIndex];
  };

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
      {/* Colored dot instead of emoji */}
      <View
        style={[
          styles.dot,
          { backgroundColor: getCategoryColor() }
        ]}
      />
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
    backgroundColor: colors.surface.light,
    borderColor: colors.surface.medium,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  name: {
    fontSize: typography.caption.fontSize,
    color: colors.text.primary,
    fontWeight: '500',
  },
  nameSelected: {
    fontWeight: '600',
  },
});
