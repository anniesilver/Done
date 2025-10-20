// Tests for categoryStore (Zustand store for categories)

import { useCategoryStore } from '../../src/stores/categoryStore';
import { useAuthStore } from '../../src/stores/authStore';
import { categoryService } from '../../src/services/supabaseService';
import { createMockCategory, createMockUser, createMockCategories } from '../utils/testHelpers';

// Mock the services
jest.mock('../../src/services/supabaseService');
jest.mock('../../src/stores/authStore');

describe('categoryStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useCategoryStore.setState({
      categories: [],
      isLoading: false,
      error: null,
    });

    // Mock authenticated user
    (useAuthStore.getState as jest.Mock).mockReturnValue({
      user: createMockUser(),
    });

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('fetchCategories', () => {
    it('should fetch categories successfully', async () => {
      // Arrange
      const mockCategories = createMockCategories(3);
      (categoryService.getCategories as jest.Mock).mockResolvedValue({
        categories: mockCategories,
        error: null,
      });

      // Act
      await useCategoryStore.getState().fetchCategories();

      // Assert
      expect(categoryService.getCategories).toHaveBeenCalledWith('test-user-id');
      expect(useCategoryStore.getState().categories).toEqual(mockCategories);
      expect(useCategoryStore.getState().isLoading).toBe(false);
      expect(useCategoryStore.getState().error).toBeNull();
    });

    it('should handle fetch error', async () => {
      // Arrange
      const errorMessage = 'Database connection failed';
      (categoryService.getCategories as jest.Mock).mockResolvedValue({
        categories: null,
        error: errorMessage,
      });

      // Act
      await useCategoryStore.getState().fetchCategories();

      // Assert
      expect(useCategoryStore.getState().categories).toEqual([]);
      expect(useCategoryStore.getState().error).toBe(errorMessage);
      expect(useCategoryStore.getState().isLoading).toBe(false);
    });

    it('should not fetch if user is not authenticated', async () => {
      // Arrange
      (useAuthStore.getState as jest.Mock).mockReturnValue({ user: null });

      // Act
      await useCategoryStore.getState().fetchCategories();

      // Assert
      expect(categoryService.getCategories).not.toHaveBeenCalled();
    });
  });

  describe('addCategory', () => {
    it('should add a new category successfully', async () => {
      // Arrange
      const newCategory = createMockCategory({ id: 10, name: 'Fitness', icon: '🏋️' });
      (categoryService.createCategory as jest.Mock).mockResolvedValue({
        category: newCategory,
        error: null,
      });

      // Act
      await useCategoryStore.getState().addCategory({ name: 'Fitness', icon: '🏋️' });

      // Assert
      expect(categoryService.createCategory).toHaveBeenCalledWith('test-user-id', {
        name: 'Fitness',
        icon: '🏋️',
      });
      expect(useCategoryStore.getState().categories).toContainEqual(newCategory);
      expect(useCategoryStore.getState().error).toBeNull();
    });

    it('should handle add category error', async () => {
      // Arrange
      const errorMessage = 'Category already exists';
      (categoryService.createCategory as jest.Mock).mockResolvedValue({
        category: null,
        error: errorMessage,
      });

      // Act
      await useCategoryStore.getState().addCategory({ name: 'Duplicate', icon: '📁' });

      // Assert
      expect(useCategoryStore.getState().categories).toEqual([]);
      expect(useCategoryStore.getState().error).toBe(errorMessage);
    });

    it('should append new category to existing categories', async () => {
      // Arrange
      const existingCategories = createMockCategories(2);
      useCategoryStore.setState({ categories: existingCategories });

      const newCategory = createMockCategory({ id: 3, name: 'New', icon: '🆕' });
      (categoryService.createCategory as jest.Mock).mockResolvedValue({
        category: newCategory,
        error: null,
      });

      // Act
      await useCategoryStore.getState().addCategory({ name: 'New', icon: '🆕' });

      // Assert
      expect(useCategoryStore.getState().categories).toHaveLength(3);
      expect(useCategoryStore.getState().categories[2]).toEqual(newCategory);
    });
  });

  describe('deleteCategory', () => {
    it('should delete a category successfully', async () => {
      // Arrange
      const categories = createMockCategories(3);
      useCategoryStore.setState({ categories });

      (categoryService.deleteCategory as jest.Mock).mockResolvedValue({ error: null });

      // Act
      await useCategoryStore.getState().deleteCategory(2);

      // Assert
      expect(categoryService.deleteCategory).toHaveBeenCalledWith(2);
      expect(useCategoryStore.getState().categories).toHaveLength(2);
      expect(useCategoryStore.getState().categories.find(c => c.id === 2)).toBeUndefined();
    });

    it('should handle delete category error', async () => {
      // Arrange
      const errorMessage = 'Cannot delete category with existing tasks';
      (categoryService.deleteCategory as jest.Mock).mockResolvedValue({ error: errorMessage });

      // Act
      await useCategoryStore.getState().deleteCategory(1);

      // Assert
      expect(useCategoryStore.getState().error).toBe(errorMessage);
    });

    it('should keep other categories when deleting one', async () => {
      // Arrange
      const categories = createMockCategories(3);
      useCategoryStore.setState({ categories });

      (categoryService.deleteCategory as jest.Mock).mockResolvedValue({ error: null });

      // Act
      await useCategoryStore.getState().deleteCategory(2);

      // Assert
      const remainingIds = useCategoryStore.getState().categories.map(c => c.id);
      expect(remainingIds).toEqual([1, 3]);
    });
  });

  describe('createDefaultCategories', () => {
    it('should create all default categories', async () => {
      // Arrange
      const defaultCategories = createMockCategories(5);
      (categoryService.createCategory as jest.Mock).mockResolvedValue({
        category: {},
        error: null,
      });
      (categoryService.getCategories as jest.Mock).mockResolvedValue({
        categories: defaultCategories,
        error: null,
      });

      // Act
      await useCategoryStore.getState().createDefaultCategories();

      // Assert
      // Should call createCategory for each default category
      expect(categoryService.createCategory).toHaveBeenCalled();
      // Should fetch all categories after creation
      expect(categoryService.getCategories).toHaveBeenCalledWith('test-user-id');
      expect(useCategoryStore.getState().categories).toEqual(defaultCategories);
    });

    it('should handle error during default category creation', async () => {
      // Arrange
      const errorMessage = 'Failed to create default categories';
      (categoryService.createCategory as jest.Mock).mockResolvedValue({
        category: {},
        error: null,
      });
      (categoryService.getCategories as jest.Mock).mockResolvedValue({
        categories: null,
        error: errorMessage,
      });

      // Act
      await useCategoryStore.getState().createDefaultCategories();

      // Assert
      expect(useCategoryStore.getState().error).toBe(errorMessage);
      expect(useCategoryStore.getState().categories).toEqual([]);
    });
  });

  describe('Utility methods', () => {
    it('setCategories should replace all categories', () => {
      // Arrange
      const newCategories = createMockCategories(3);

      // Act
      useCategoryStore.getState().setCategories(newCategories);

      // Assert
      expect(useCategoryStore.getState().categories).toEqual(newCategories);
    });

    it('setLoading should update loading state', () => {
      // Act
      useCategoryStore.getState().setLoading(true);

      // Assert
      expect(useCategoryStore.getState().isLoading).toBe(true);
    });

    it('setError should update error state', () => {
      // Act
      useCategoryStore.getState().setError('Test error');

      // Assert
      expect(useCategoryStore.getState().error).toBe('Test error');
    });

    it('clearError should clear error state', () => {
      // Arrange
      useCategoryStore.setState({ error: 'Some error' });

      // Act
      useCategoryStore.getState().clearError();

      // Assert
      expect(useCategoryStore.getState().error).toBeNull();
    });
  });
});
