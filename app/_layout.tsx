import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../services/authContext';
import LoadingScreen from '../components/LoadingScreen';
import { THEME } from '../constants/theme';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync().catch(() => {});

function NavigationGate() {
  const { token, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!token && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (token && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [token, isLoading, segments]);

  if (isLoading) {
    return <LoadingScreen message="Initializing KeyPrime Sales App..." showLogo={true} />;
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: THEME.colors.surface,
          },
          headerTintColor: THEME.colors.primary,
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: THEME.typography.sizes.lg,
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: THEME.colors.background,
          },
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="customers/add"
          options={{
            title: 'Add New Customer',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="customers/[id]"
          options={{
            title: 'Customer Details',
          }}
        />
        <Stack.Screen
          name="customers/edit/[id]"
          options={{
            title: 'Edit Customer',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="demos/add"
          options={{
            title: 'Schedule Demo Visit',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="payments/add"
          options={{
            title: 'Record Payment',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="reports/index"
          options={{
            title: 'Sales & Analytics Reports',
          }}
        />
        <Stack.Screen
          name="admin/users"
          options={{
            title: 'Sales Team Management',
          }}
        />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationGate />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
