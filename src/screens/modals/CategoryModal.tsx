// CategoryModal - Modal for managing categories

import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { CategoryForm } from '../../components/categories/CategoryForm';
import { CategoryChip } from '../../components/categories/CategoryChip';
import { CreateCategoryInput } from '../../types/category';
import { useCategoryStore } from '../../stores/categoryStore';
import { colors, spacing, typography } from '../../config/theme';

interface CategoryModalProps {
  visible: boolean;
  onClose: () => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  visible,
  onClose,
}) => {
  const [isCreating, setIsCreating] = useState(false);

  const categories = useCategoryStore((state) => state.categories);
  const addCategory = useCategoryStore((state) => state.addCategory);
  const deleteCategory = useCategoryStore((state) => state.deleteCategory);
  const createDefaultCategories = useCategoryStore((state) => state.createDefaultCategories);
  const isLoading = useCategoryStore((state) => state.isLoading);

  const handleCreate = async (input: CreateCategoryInput) => {
    await addCategory(input);
    setIsCreating(false);
  };

  const handleDelete = (id: number, name: string) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${name}"? Tasks in this category will not be deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteCategory(id);
          },
        },
      ]
    );
  };

  const handleCreateDefaults = () => {
    Alert.alert(
      'Create Default Categories',
      'This will create the default categories (Work, Personal, Health, Learning, Shopping). Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create',
          onPress: async () => {
            await createDefaultCategories();
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>Close</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            {isCreating ? 'New Category' : 'Manage Categories'}
          </Text>

          {!isCreating && (
            <TouchableOpacity
              onPress={() => setIsCreating(true)}
              style={styles.headerButton}
            >
              <Text style={styles.headerButtonText}>+ New</Text>
            </TouchableOpacity>
          )}

          {isCreating && <View style={styles.headerButton} />}
        </View>

        {/* Content */}
        {isCreating ? (
          <CategoryForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreating(false)}
            isLoading={isLoading}
          />
        ) : (
          <ScrollView style={styles.content}>
            {/* Category list */}
            {categories.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No categories yet</Text>
                <TouchableOpacity
                  style={styles.defaultsButton}
                  onPress={handleCreateDefaults}
                  disabled={isLoading}
                >
                  <Text style={styles.defaultsButtonText}>
                    Create Default Categories
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.categoryList}>
                {categories.map((category) => (
                  <View key={category.id} style={styles.categoryRow}>
                    <CategoryChip category={category} />

                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDelete(category.id, category.name)}
                      disabled={isLoading}
                    >
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                ))}

                {/* Create defaults button (even if categories exist) */}
                <TouchableOpacity
                  style={styles.defaultsButtonSecondary}
                  onPress={handleCreateDefaults}
                  disabled={isLoading}
                >
                  <Text style={styles.defaultsButtonSecondaryText}>
                    Add Default Categories
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.light,
  },
  headerTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: '600',
    color: colors.text.primary,
  },
  headerButton: {
    minWidth: 60,
  },
  headerButtonText: {
    fontSize: typography.body.fontSize,
    color: colors.primary.main,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl * 2,
  },
  emptyText: {
    fontSize: typography.body.fontSize,
    color: colors.text.disabled,
    marginBottom: spacing.xl,
  },
  defaultsButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    backgroundColor: colors.primary.main,
  },
  defaultsButtonText: {
    fontSize: typography.body.fontSize,
    color: colors.surface.white,
    fontWeight: '600',
  },
  categoryList: {
    padding: spacing.lg,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.light,
  },
  deleteButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  deleteButtonText: {
    fontSize: typography.caption.fontSize,
    color: colors.semantic.danger,
    fontWeight: '600',
  },
  defaultsButtonSecondary: {
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary.main,
    alignItems: 'center',
  },
  defaultsButtonSecondaryText: {
    fontSize: typography.body.fontSize,
    color: colors.primary.main,
    fontWeight: '600',
  },
});
