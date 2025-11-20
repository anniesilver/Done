// CategoryPicker component - iOS-style picker for selecting a category

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Category } from '../../types/category';
import { CategoryFilterModal } from './CategoryFilterModal';
import { colors, spacing, typography } from '../../config/theme';

interface CategoryPickerProps {
  categories: Category[];
  selectedCategoryId: number | null;
  onSelectCategory: (categoryId: number | null) => void;
  label?: string;
  allowNone?: boolean;
  showWarning?: boolean;
}

export const CategoryPicker: React.FC<CategoryPickerProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  label = 'Category',
  allowNone = true,
  showWarning = false,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  const handleSelect = (categoryId: number | null) => {
    onSelectCategory(categoryId);
  };

  const handlePress = () => {
    Haptics.selectionAsync();
    setIsModalVisible(true);
  };

  // Get category color
  const getCategoryColor = () => {
    if (!selectedCategory || !selectedCategory.id) return colors.text.disabled;
    const colorIndex = (selectedCategory.id - 1) % colors.categories.length;
    return colors.categories[colorIndex];
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.selector}
        onPress={handlePress}
      >
        <View style={styles.selectorLeft}>
          <Text style={styles.labelText}>{label}</Text>
          {showWarning && <Text style={styles.warning}>⚠️</Text>}
        </View>
        <View style={styles.selectorRight}>
          {selectedCategory ? (
            <>
              <View style={[styles.dot, { backgroundColor: getCategoryColor() }]} />
              <Text style={styles.selectorText}>{selectedCategory.name}</Text>
            </>
          ) : (
            <Text style={[styles.selectorPlaceholder, showWarning && styles.placeholderWarning]}>
              {allowNone ? 'None' : 'Select'}
            </Text>
          )}
          <Text style={styles.chevron}>▶</Text>
        </View>
      </TouchableOpacity>

      <CategoryFilterModal
        visible={isModalVisible}
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={handleSelect}
        onManageCategories={() => {}}
        onClose={() => setIsModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: colors.surface.medium,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface.white,
    minHeight: 44,
  },
  selectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  labelText: {
    fontSize: typography.body.fontSize,
    color: colors.text.primary,
  },
  warning: {
    fontSize: 16,
    marginLeft: spacing.xs,
  },
  selectorRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  selectorText: {
    fontSize: typography.body.fontSize,
    color: colors.text.secondary,
  },
  selectorPlaceholder: {
    fontSize: typography.body.fontSize,
    color: colors.text.disabled,
  },
  placeholderWarning: {
    color: colors.semantic.warning,
  },
  chevron: {
    fontSize: 12,
    color: colors.text.disabled,
    marginLeft: spacing.sm,
  },
});
