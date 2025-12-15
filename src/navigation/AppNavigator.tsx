import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthNavigator } from './AuthNavigator';
import { RootNavigator } from './RootNavigator';
import { useAuthStore } from '../stores/authStore';

export const AppNavigator: React.FC = () => {
  const { user, getCurrentUser } = useAuthStore();

  useEffect(() => {
    // Check for existing session on app start
    getCurrentUser();
  }, [getCurrentUser]);

  return (
    <NavigationContainer>
      {user ? <RootNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};
