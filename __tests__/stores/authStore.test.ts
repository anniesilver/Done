// Tests for authStore (Zustand store for authentication)

import { useAuthStore } from '../../src/stores/authStore';
import { authService } from '../../src/services/supabaseService';
import { createMockUser } from '../utils/testHelpers';

// Mock the auth service
jest.mock('../../src/services/supabaseService');

describe('authStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.setState({
      user: null,
      isLoading: false,
      error: null,
    });

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('signUp', () => {
    it('should sign up a new user successfully', async () => {
      // Arrange
      const mockUser = createMockUser({ email: 'newuser@example.com' });
      const credentials = { email: 'newuser@example.com', password: 'password123', confirmPassword: 'password123' };

      (authService.signUp as jest.Mock).mockResolvedValue({
        user: mockUser,
        error: null,
      });

      // Act
      await useAuthStore.getState().signUp(credentials);

      // Assert
      expect(authService.signUp).toHaveBeenCalledWith(credentials);
      expect(useAuthStore.getState().user).toEqual(mockUser);
      expect(useAuthStore.getState().isLoading).toBe(false);
      expect(useAuthStore.getState().error).toBeNull();
    });

    it('should handle sign up error', async () => {
      // Arrange
      const errorMessage = 'Email already exists';
      const credentials = { email: 'existing@example.com', password: 'password123', confirmPassword: 'password123' };

      (authService.signUp as jest.Mock).mockResolvedValue({
        user: null,
        error: errorMessage,
      });

      // Act
      await useAuthStore.getState().signUp(credentials);

      // Assert
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().error).toBe(errorMessage);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('should set loading state during sign up', async () => {
      // Arrange
      const credentials = { email: 'test@example.com', password: 'password123', confirmPassword: 'password123' };
      let loadingDuringCall = false;

      (authService.signUp as jest.Mock).mockImplementation(async () => {
        loadingDuringCall = useAuthStore.getState().isLoading;
        return { user: createMockUser(), error: null };
      });

      // Act
      await useAuthStore.getState().signUp(credentials);

      // Assert
      expect(loadingDuringCall).toBe(true);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  describe('signIn', () => {
    it('should sign in a user successfully', async () => {
      // Arrange
      const mockUser = createMockUser();
      const credentials = { email: 'test@example.com', password: 'password123' };

      (authService.signIn as jest.Mock).mockResolvedValue({
        user: mockUser,
        error: null,
      });

      // Act
      await useAuthStore.getState().signIn(credentials);

      // Assert
      expect(authService.signIn).toHaveBeenCalledWith(credentials);
      expect(useAuthStore.getState().user).toEqual(mockUser);
      expect(useAuthStore.getState().error).toBeNull();
    });

    it('should handle invalid credentials', async () => {
      // Arrange
      const errorMessage = 'Invalid email or password';
      const credentials = { email: 'wrong@example.com', password: 'wrongpass' };

      (authService.signIn as jest.Mock).mockResolvedValue({
        user: null,
        error: errorMessage,
      });

      // Act
      await useAuthStore.getState().signIn(credentials);

      // Assert
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().error).toBe(errorMessage);
    });

    it('should handle network errors during sign in', async () => {
      // Arrange
      const errorMessage = 'Network error';
      const credentials = { email: 'test@example.com', password: 'password123' };

      (authService.signIn as jest.Mock).mockResolvedValue({
        user: null,
        error: errorMessage,
      });

      // Act
      await useAuthStore.getState().signIn(credentials);

      // Assert
      expect(useAuthStore.getState().error).toBe(errorMessage);
      expect(useAuthStore.getState().user).toBeNull();
    });
  });

  describe('signOut', () => {
    it('should sign out a user successfully', async () => {
      // Arrange
      const mockUser = createMockUser();
      useAuthStore.setState({ user: mockUser });

      (authService.signOut as jest.Mock).mockResolvedValue({ error: null });

      // Act
      await useAuthStore.getState().signOut();

      // Assert
      expect(authService.signOut).toHaveBeenCalled();
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().error).toBeNull();
    });

    it('should handle sign out error', async () => {
      // Arrange
      const errorMessage = 'Failed to sign out';
      const mockUser = createMockUser();
      useAuthStore.setState({ user: mockUser });

      (authService.signOut as jest.Mock).mockResolvedValue({ error: errorMessage });

      // Act
      await useAuthStore.getState().signOut();

      // Assert
      expect(useAuthStore.getState().user).toEqual(mockUser); // User should remain
      expect(useAuthStore.getState().error).toBe(errorMessage);
    });

    it('should clear user state on successful sign out', async () => {
      // Arrange
      useAuthStore.setState({
        user: createMockUser(),
        error: 'Previous error',
      });

      (authService.signOut as jest.Mock).mockResolvedValue({ error: null });

      // Act
      await useAuthStore.getState().signOut();

      // Assert
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().error).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('should get current user successfully', async () => {
      // Arrange
      const mockUser = createMockUser();

      (authService.getCurrentUser as jest.Mock).mockResolvedValue({
        user: mockUser,
        error: null,
      });

      // Act
      await useAuthStore.getState().getCurrentUser();

      // Assert
      expect(authService.getCurrentUser).toHaveBeenCalled();
      expect(useAuthStore.getState().user).toEqual(mockUser);
      expect(useAuthStore.getState().error).toBeNull();
    });

    it('should handle no authenticated user', async () => {
      // Arrange
      (authService.getCurrentUser as jest.Mock).mockResolvedValue({
        user: null,
        error: null,
      });

      // Act
      await useAuthStore.getState().getCurrentUser();

      // Assert
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().error).toBeNull();
    });

    it('should handle get current user error', async () => {
      // Arrange
      const errorMessage = 'Session expired';

      (authService.getCurrentUser as jest.Mock).mockResolvedValue({
        user: null,
        error: errorMessage,
      });

      // Act
      await useAuthStore.getState().getCurrentUser();

      // Assert
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().error).toBe(errorMessage);
    });
  });

  describe('Utility methods', () => {
    it('setUser should update user state', () => {
      // Arrange
      const mockUser = createMockUser();

      // Act
      useAuthStore.getState().setUser(mockUser);

      // Assert
      expect(useAuthStore.getState().user).toEqual(mockUser);
    });

    it('setUser should allow setting user to null', () => {
      // Arrange
      useAuthStore.setState({ user: createMockUser() });

      // Act
      useAuthStore.getState().setUser(null);

      // Assert
      expect(useAuthStore.getState().user).toBeNull();
    });

    it('setError should update error state', () => {
      // Act
      useAuthStore.getState().setError('Authentication failed');

      // Assert
      expect(useAuthStore.getState().error).toBe('Authentication failed');
    });

    it('clearError should clear error state', () => {
      // Arrange
      useAuthStore.setState({ error: 'Some error' });

      // Act
      useAuthStore.getState().clearError();

      // Assert
      expect(useAuthStore.getState().error).toBeNull();
    });
  });
});
