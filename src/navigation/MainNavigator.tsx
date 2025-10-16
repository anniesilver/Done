// MainNavigator - Bottom tab navigation for main app screens

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TodayScreen } from '../screens/main/TodayScreen';
import { TasksScreen } from '../screens/main/TasksScreen';
import { CalendarScreen } from '../screens/main/CalendarScreen';
import { colors } from '../config/theme';

export type MainTabParamList = {
  Today: undefined;
  Tasks: undefined;
  Calendar: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary.main,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarStyle: {
          borderTopColor: colors.surface.light,
        },
        headerStyle: {
          backgroundColor: colors.surface.white,
          borderBottomColor: colors.surface.light,
        },
        headerTintColor: colors.text.primary,
      }}
    >
      <Tab.Screen
        name="Today"
        component={TodayScreen}
        options={{
          tabBarLabel: 'Today',
          tabBarIcon: ({ color }) => <span style={{ fontSize: 24 }}>📅</span>,
          headerShown: false, // TodayScreen has its own custom header
        }}
      />

      <Tab.Screen
        name="Tasks"
        component={TasksScreen}
        options={{
          tabBarLabel: 'Tasks',
          tabBarIcon: ({ color }) => <span style={{ fontSize: 24 }}>✓</span>,
          headerTitle: 'All Tasks',
        }}
      />

      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          tabBarLabel: 'Calendar',
          tabBarIcon: ({ color }) => <span style={{ fontSize: 24 }}>📆</span>,
          headerShown: false, // CalendarScreen has its own header
        }}
      />
    </Tab.Navigator>
  );
};
