// CategoryForm component - Form for creating new categories

import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { CreateCategoryInput } from '../../types/category';
import { Button } from '../common/Button';
import { colors, spacing, typography } from '../../config/theme';
import { CATEGORY_COLORS } from '../../config/theme';

// Common category icons
const CATEGORY_ICONS = [
  '💼', '🏠', '❤️', '📚', '🛒',
  '🎯', '💪', '🎨', '🎵', '✈️',
  '🍔', '💰', '🎮', '📱', '🚗',
];

interface CategoryFormProps {
  onSubmit: (input: CreateCategoryInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📋');

  const handleSubmit = () => {
    if (!name.trim()) {
      return;
    }

    const input: CreateCategoryInput = {
      name: name.trim(),
      icon,
    };

    onSubmit(input);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        {/* Name input */}
        <View style={styles.field}>
          <Text style={styles.label}>Category Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g., Work, Personal, Health"
            autoFocus
            maxLength={30}
          />
        </View>

        {/* Icon picker */}
        <View style={styles.field}>
          <Text style={styles.label}>Icon</Text>
          <View style={styles.iconGrid}>
            {CATEGORY_ICONS.map((iconOption) => (
              <TouchableOpacity
                key={iconOption}
                style={[
                  styles.iconOption,
                  icon === iconOption && styles.iconOptionSelected,
                ]}
                onPress={() => setIcon(iconOption)}
              >
                <Text style={styles.iconText}>{iconOption}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Preview */}
        <View style={styles.field}>
          <Text style={styles.label}>Preview</Text>
          <View style={styles.preview}>
            <Text style={styles.previewIcon}>{icon}</Text>
            <Text style={styles.previewName}>{name || 'Category Name'}</Text>
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          <View style={styles.button}>
            <Button
              variant="secondary"
              onPress={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </View>
          <View style={styles.button}>
            <Button
              variant="primary"
              onPress={handleSubmit}
              disabled={!name.trim() || isLoading}
              loading={isLoading}
            >
              Create
            </Button>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.white,
  },
  form: {
    padding: spacing.lg,
  },
  field: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.surface.medium,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: typography.body.fontSize,
    color: colors.text.primary,
    backgroundColor: colors.surface.white,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.surface.medium,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface.white,
  },
  iconOptionSelected: {
    backgroundColor: colors.primary.light,
    borderColor: colors.primary.main,
    borderWidth: 2,
  },
  iconText: {
    fontSize: 24,
  },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.surface.light,
    gap: spacing.sm,
  },
  previewIcon: {
    fontSize: 24,
  },
  previewName: {
    fontSize: typography.body.fontSize,
    color: colors.text.primary,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  button: {
    flex: 1,
  },
});
