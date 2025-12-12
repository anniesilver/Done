// CategorySelectionModal - Integrated modal for selecting and managing categories during task creation

import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Keyboard,
} from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';
import * as Haptics from 'expo-haptics';
import { Category } from '../../types/category';
import { useCategoryStore } from '../../stores/categoryStore';
import { colors, spacing, typography } from '../../config/theme';

interface CategorySelectionModalProps {
  visible: boolean;
  selectedCategoryId: number | null;
  onSelectCategory: (categoryId: number) => void;
  onClose: () => void;
}

export const CategorySelectionModal: React.FC<CategorySelectionModalProps> = ({
  visible,
  selectedCategoryId,
  onSelectCategory,
  onClose,
}) => {
  const categories = useCategoryStore((state) => state.categories);
  const addCategory = useCategoryStore((state) => state.addCategory);
  const deleteCategory = useCategoryStore((state) => state.deleteCategory);
  const createDefaultCategories = useCategoryStore((state) => state.createDefaultCategories);

  const [newCategoryName, setNewCategoryName] = useState('');
  const swipeListRef = useRef<SwipeListView<Category>>(null);

  // Close all open rows when modal closes
  useEffect(() => {
    if (!visible) {
      swipeListRef.current?.closeAllOpenRows();
      setNewCategoryName('');
    }
  }, [visible]);

  // Get category color based on ID
  const getCategoryColor = (categoryId: number) => {
    const colorIndex = (categoryId - 1) % colors.categories.length;
    return colors.categories[colorIndex];
  };

  // Handle adding a new category
  const handleQuickAdd = async () => {
    const trimmedName = newCategoryName.trim();

    // Validation
    if (!trimmedName) return;

    if (trimmedName.length > 30) {
      Alert.alert('Name Too Long', 'Category name must be 30 characters or less.');
      return;
    }

    // Check duplicates (case-insensitive)
    const isDuplicate = categories.some(
      (c) => c.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (isDuplicate) {
      Alert.alert('Duplicate Name', 'A category with this name already exists.');
      return;
    }

    // Create with dummy icon value (not displayed - color is auto-assigned by ID)
    await addCategory({ name: trimmedName, icon: '📋' });

    // Find the newly created category and select it
    // Wait a tick for store to update
    setTimeout(() => {
      const newCategory = categories.find(
        (c) => c.name.toLowerCase() === trimmedName.toLowerCase()
      );
      if (newCategory) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onSelectCategory(newCategory.id);
        onClose(); // Close modal after selecting the new category
      }
    }, 100);

    setNewCategoryName('');
  };

  // Handle selecting a category
  const handleSelectCategory = (categoryId: number) => {
    Haptics.selectionAsync();
    onSelectCategory(categoryId);
    onClose(); // Close immediately after selection
  };

  // Handle deleting a category
  const handleDeleteCategory = async (id: number, name: string) => {
    // Protection: Currently selected category
    if (selectedCategoryId === id) {
      Alert.alert(
        'Cannot Delete',
        'This category is currently selected for your task. Please select a different category first.',
        [{ text: 'OK', style: 'cancel' }]
      );
      return;
    }

    // Confirmation dialog
    Alert.alert(
      'Delete Category',
      `Delete "${name}"? Tasks in this category will not be deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            await deleteCategory(id);
          },
        },
      ]
    );
  };

  // Handle creating default categories
  const handleCreateDefaults = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await createDefaultCategories();
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>No categories yet</Text>
      <Text style={styles.emptyHint}>
        Add your first category above or create defaults below
      </Text>
      <TouchableOpacity style={styles.defaultsButton} onPress={handleCreateDefaults}>
        <Text style={styles.defaultsButtonText}>Create Default Categories</Text>
      </TouchableOpacity>
    </View>
  );

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
        <TouchableOpacity activeOpacity={1} style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Category</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Add category input */}
            <View style={styles.addSection}>
              <TextInput
                style={styles.addInput}
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                placeholder="Add new category..."
                placeholderTextColor={colors.text.disabled}
                returnKeyType="done"
                onSubmitEditing={handleQuickAdd}
                maxLength={30}
              />
              {newCategoryName.trim() && (
                <TouchableOpacity onPress={handleQuickAdd} style={styles.addButton}>
                  <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Category list or empty state */}
            {categories.length === 0 ? (
              renderEmptyState()
            ) : (
              <SwipeListView
                ref={swipeListRef}
                data={categories}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  // VISIBLE ROW
                  <TouchableOpacity
                    style={styles.rowFront}
                    onPress={() => handleSelectCategory(item.id)}
                  >
                    <View style={styles.categoryRow}>
                      <View
                        style={[
                          styles.dot,
                          { backgroundColor: getCategoryColor(item.id) },
                        ]}
                      />
                      <Text style={styles.categoryName}>{item.name}</Text>
                    </View>
                    {selectedCategoryId === item.id && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                )}
                renderHiddenItem={({ item }) => (
                  // HIDDEN ROW - revealed on swipe left
                  <View style={styles.rowBack}>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteCategory(item.id, item.name)}
                    >
                      <Text style={styles.deleteText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                )}
                rightOpenValue={-75}
                disableRightSwipe
                closeOnRowPress
                keyboardShouldPersistTaps="handled"
                onScrollBeginDrag={Keyboard.dismiss}
                style={styles.listContainer}
              />
            )}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    maxHeight: '70%',
  },
  modalContent: {
    backgroundColor: colors.surface.white,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.medium,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.text.primary,
  },
  closeButton: {
    padding: spacing.xs,
  },
  closeText: {
    fontSize: 20,
    color: colors.text.secondary,
  },
  addSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.medium,
    backgroundColor: colors.surface.light,
  },
  addInput: {
    flex: 1,
    fontSize: typography.body.fontSize,
    color: colors.text.primary,
    paddingVertical: spacing.xs,
  },
  addButton: {
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  addButtonText: {
    fontSize: typography.body.fontSize,
    color: colors.primary.main,
    fontWeight: '600',
  },
  listContainer: {
    maxHeight: 300,
  },
  rowFront: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface.white,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.light,
    minHeight: 44,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  categoryName: {
    fontSize: typography.body.fontSize,
    color: colors.text.primary,
  },
  checkmark: {
    fontSize: 18,
    color: colors.primary.main,
    fontWeight: '600',
  },
  rowBack: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: colors.semantic.error,
    height: '100%',
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 75,
    height: '100%',
  },
  deleteText: {
    color: colors.text.white,
    fontWeight: '600',
    fontSize: typography.body.fontSize,
  },
  emptyState: {
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  emptyHint: {
    fontSize: typography.body.fontSize,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  defaultsButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  defaultsButtonText: {
    color: colors.text.white,
    fontWeight: '600',
    fontSize: typography.body.fontSize,
  },
});
