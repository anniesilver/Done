// CategoryFilterModal - Compact dropdown modal for filtering tasks by category

import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Category } from '../../types/category';
import { colors, spacing, typography } from '../../config/theme';

interface CategoryFilterModalProps {
  visible: boolean;
  categories: Category[];
  selectedCategoryId: number | null;
  onSelectCategory: (categoryId: number | null) => void;
  onClose: () => void;
}

export const CategoryFilterModal: React.FC<CategoryFilterModalProps> = ({
  visible,
  categories,
  selectedCategoryId,
  onSelectCategory,
  onClose,
}) => {
  const handleSelectCategory = (categoryId: number | null) => {
    Haptics.selectionAsync();
    onSelectCategory(categoryId);
    onClose();
  };

  // Get category color
  const getCategoryColor = (categoryId: number) => {
    const colorIndex = (categoryId - 1) % colors.categories.length;
    return colors.categories[colorIndex];
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
      transparent={true}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.container}>
          <TouchableOpacity activeOpacity={1}>
            <ScrollView style={styles.content} contentContainerStyle={styles.menuList}>
              {/* All Tasks option */}
              <TouchableOpacity
                style={[
                  styles.menuItem,
                  selectedCategoryId === null && styles.menuItemSelected
                ]}
                onPress={() => handleSelectCategory(null)}
              >
                <Text style={[
                  styles.menuItemText,
                  selectedCategoryId === null && styles.menuItemTextSelected
                ]}>
                  All Tasks
                </Text>
                {selectedCategoryId === null && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.divider} />

              {/* Categories */}
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.menuItem,
                    selectedCategoryId === category.id && styles.menuItemSelected
                  ]}
                  onPress={() => handleSelectCategory(category.id)}
                >
                  <View style={styles.categoryRow}>
                    <View style={[
                      styles.categoryDot,
                      { backgroundColor: getCategoryColor(category.id) }
                    ]} />
                    <Text style={[
                      styles.menuItemText,
                      selectedCategoryId === category.id && styles.menuItemTextSelected
                    ]}>
                      {category.name}
                    </Text>
                  </View>
                  {selectedCategoryId === category.id && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 90, // Position below navigation bar
    paddingRight: spacing.sm,
  },
  container: {
    backgroundColor: colors.surface.white,
    borderRadius: 12,
    minWidth: 220,
    maxWidth: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  content: {
    maxHeight: 400,
  },
  menuList: {
    paddingVertical: spacing.xs,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    minHeight: 44,
  },
  menuItemSelected: {
    backgroundColor: colors.surface.light,
  },
  menuItemText: {
    fontSize: typography.body.fontSize,
    color: colors.text.primary,
    fontWeight: '400',
  },
  menuItemTextSelected: {
    fontWeight: '600',
    color: colors.primary.main,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  checkmark: {
    fontSize: 18,
    color: colors.primary.main,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.surface.light,
    marginVertical: spacing.xs,
  },
  manageText: {
    fontSize: typography.body.fontSize,
    color: colors.primary.main,
    fontWeight: '500',
  },
});
