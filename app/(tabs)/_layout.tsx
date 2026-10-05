import React from 'react';
import { Tabs } from 'expo-router';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  ShieldCheck,
  User,
} from 'lucide-react-native';
import { THEME } from '../../constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: THEME.colors.primary,
        tabBarInactiveTintColor: THEME.colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: THEME.colors.tabBarBg,
          borderTopColor: THEME.colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <LayoutDashboard size={size || 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="customers"
        options={{
          title: 'Customers',
          tabBarIcon: ({ color, size }) => (
            <Users size={size || 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="demos"
        options={{
          title: 'Demos',
          tabBarIcon: ({ color, size }) => (
            <CalendarDays size={size || 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="subscriptions"
        options={{
          title: 'Subscriptions',
          tabBarIcon: ({ color, size }) => (
            <ShieldCheck size={size || 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <User size={size || 22} color={color} />
          ),
        }}
      />
      {/* Hide default two.tsx if still present in template */}
      <Tabs.Screen
        name="two"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
