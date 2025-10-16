// CategoryPicker component - Dropdown-style picker for selecting a category

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { Category } from '../../types/category';
import { colors, spacing, typography } from '../../config/theme';

interface CategoryPickerProps {
  categories: Category[];
  selectedCategoryId: number | null;
  onSelectCategory: (categoryId: number | null) => void;
  label?: string;
  allowNone?: boolean;
}

export const CategoryPicker: React.FC<CategoryPickerProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  label = 'Category',
  allowNone = true,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  const handleSelect = (categoryId: number | null) => {
    onSelectCategory(categoryId);
    setIsModalVisible(false);
  };

  const renderCategoryItem = ({ item }: { item: Category | null }) => {
    const isSelected = item === null
      ? selectedCategoryId === null
      : selectedCategoryId === item.id;

    return (
      <TouchableOpacity
        style={[styles.item, isSelected && styles.itemSelected]}
        onPress={() => handleSelect(item?.id || null)}
      >
        <Text style={styles.itemIcon}>{item?.icon || '❌'}</Text>
        <Text style={[styles.itemName, isSelected && styles.itemNameSelected]}>
          {item?.name || 'No Category'}
        </Text>
        {isSelected && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>
    );
  };

  const data = allowNone ? [null, ...categories] : categories;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <TouchableOpacity
        style={styles.selector}
        onPress={() => setIsModalVisible(true)}
      >
        {selectedCategory ? (
          <>
            <Text style={styles.selectorIcon}>{selectedCategory.icon}</Text>
            <Text style={styles.selectorText}>{selectedCategory.name}</Text>
          </>
        ) : (
          <Text style={styles.selectorPlaceholder}>
            {allowNone ? 'No Category' : 'Select a category'}
          </Text>
        )}
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={data}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item?.id.toString() || 'none'}
              style={styles.list}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surface.medium,
    borderRadius: 8,
    padding: spacing.md,
    backgroundColor: colors.surface.white,
    gap: spacing.sm,
  },
  selectorIcon: {
    fontSize: 20,
  },
  selectorText: {
    flex: 1,
    fontSize: typography.body.fontSize,
    color: colors.text.primary,
  },
  selectorPlaceholder: {
    flex: 1,
    fontSize: typography.body.fontSize,
    color: colors.text.disabled,
  },
  arrow: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.light,
  },
  modalTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: '600',
    color: colors.text.primary,
  },
  closeButton: {
    fontSize: 24,
    color: colors.text.secondary,
    padding: spacing.xs,
  },
  list: {
    flexGrow: 0,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.light,
    gap: spacing.md,
  },
  itemSelected: {
    backgroundColor: colors.primary.light + '20',
  },
  itemIcon: {
    fontSize: 24,
  },
  itemName: {
    flex: 1,
    fontSize: typography.body.fontSize,
    color: colors.text.primary,
  },
  itemNameSelected: {
    fontWeight: '600',
    color: colors.primary.dark,
  },
  checkmark: {
    fontSize: 20,
    color: colors.primary.main,
  },
});
