// Temporary placeholder screen for authenticated users
// Will be replaced with TodayScreen in Phase 1.4

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '../../components/common/Button';
import { useAuthStore } from '../../stores/authStore';
import { colors, spacing, typography } from '../../config/theme';

export const HomeScreen: React.FC = () => {
  const { user, signOut } = useAuthStore();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Done!</Text>
        <Text style={styles.subtitle}>Logged in as: {user?.email}</Text>
        <Text style={styles.message}>
          Authentication is working! 🎉{'\n\n'}
          The main app screens will be built in the next steps.
        </Text>
      </View>

      <Button
        title="Sign Out"
        variant="danger"
        onPress={signOut}
        fullWidth
        style={styles.signOutButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ui.background,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold as any,
    color: colors.primary.main,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.ui.textSecondary,
    marginBottom: spacing.xxl,
    textAlign: 'center',
  },
  message: {
    fontSize: typography.fontSize.base,
    color: colors.ui.textPrimary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  signOutButton: {
    marginTop: spacing.xl,
  },
});
