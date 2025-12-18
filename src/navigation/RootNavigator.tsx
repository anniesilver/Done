// RootNavigator - Stack navigator that includes main tabs and additional screens

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { MainNavigator } from './MainNavigator';
import { CalendarSyncScreen } from '../screens/settings/CalendarSyncScreen';

export type RootStackParamList = {
  MainTabs: undefined;
  CalendarSync: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MainTabs" component={MainNavigator} />
      <Stack.Screen
        name="CalendarSync"
        component={CalendarSyncScreen}
        options={{
          headerShown: true,
          title: 'Calendar Sync',
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
};
