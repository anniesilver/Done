// CategoryList component - Horizontal scrollable list of categories

import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Category } from '../../types/category';
import { CategoryChip } from './CategoryChip';
import { colors, spacing, typography } from '../../config/theme';

interface CategoryListProps {
  categories: Category[];
  selectedCategoryId: number | null;
  onSelectCategory: (categoryId: number | null) => void;
  showAllOption?: boolean;
  onManageCategories?: () => void; // NEW: Callback to open category management modal
}

export const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  showAllOption = true,
  onManageCategories,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={styles.scroll}
    >
      {showAllOption && (
        <CategoryChip
          category={{ id: 0, name: 'All', icon: '📋', userId: '', createdAt: new Date() }}
          selected={selectedCategoryId === null}
          onPress={() => onSelectCategory(null)}
        />
      )}

      {categories.map((category) => (
        <CategoryChip
          key={category.id}
          category={category}
          selected={selectedCategoryId === category.id}
          onPress={() => onSelectCategory(category.id)}
        />
      ))}

      {/* Manage Categories Button */}
      {onManageCategories && (
        <TouchableOpacity
          style={styles.manageButton}
          onPress={onManageCategories}
        >
          <Text style={styles.manageButtonIcon}>⚙️</Text>
          <Text style={styles.manageButtonText}>Manage</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
  },
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  emptyContainer: {
    padding: spacing.md,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.caption.fontSize,
    color: colors.text.disabled,
    fontStyle: 'italic',
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary.main,
    borderStyle: 'dashed',
    backgroundColor: colors.surface.white,
    gap: spacing.xs,
  },
  manageButtonIcon: {
    fontSize: 16,
  },
  manageButtonText: {
    fontSize: typography.caption.fontSize,
    color: colors.primary.main,
    fontWeight: '600',
  },
});
