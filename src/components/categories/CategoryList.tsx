// CategoryList component - Horizontal scrollable list of categories

import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { Category } from '../../types/category';
import { CategoryChip } from './CategoryChip';
import { colors, spacing, typography } from '../../config/theme';

interface CategoryListProps {
  categories: Category[];
  selectedCategoryId: number | null;
  onSelectCategory: (categoryId: number | null) => void;
  showAllOption?: boolean;
}

export const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  showAllOption = true,
}) => {
  if (categories.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No categories yet</Text>
      </View>
    );
  }

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
});
