import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Slot, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { useAuthStore } from '@/store/authStore';
import { useUserStore } from '@/store/userStore';
import { useRoleStore } from '@/store/roleStore';
import { registerForPushNotifications } from '@/lib/notifications';
import { warmCategoryCache } from '@/lib/categoryCache';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const router = useRouter();

  const { isAuthenticated, loading, user, initialize, isPasswordRecovery } = useAuthStore();
  const { fetchProfile, fetchProviderProfile, profile } = useUserStore();
  const { setUserRole, initialize: initializeRole } = useRoleStore();

  // Initialize auth and role stores
  useEffect(() => {
    initialize();
    initializeRole();
    warmCategoryCache(); // Pre-load categories from DB
  }, []);

  // Fetch user profile when authenticated
  useEffect(() => {
    if (user && !profile) {
      fetchProfile(user.id);
    }
  }, [user]);

  // Set user role in role store and fetch provider profile if applicable
  useEffect(() => {
    if (profile?.role) {
      setUserRole(profile.role);
      // Fetch provider profile for providers/both roles
      if ((profile.role === 'provider' || profile.role === 'both') && user?.id) {
        fetchProviderProfile(user.id);
      }
    }
  }, [profile]);

  // Register for push notifications when user is authenticated
  useEffect(() => {
    if (user?.id && isAuthenticated) {
      registerForPushNotifications(user.id).catch((err) =>
        console.log('Push token registration skipped:', err)
      );
    }
  }, [user?.id, isAuthenticated]);

  // Handle navigation based on auth state
  useEffect(() => {
    console.log('🔄 Navigation guard:', {
      loading,
      isAuthenticated,
      segments,
      user: user?.email,
    });

    if (loading) {
      console.log('⏳ Still loading, skipping navigation');
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';
    const inAdminGroup = segments[0] === '(admin)';
    console.log('📍 Current location:', { inAuthGroup, inAdminGroup, segments });

    if (!isAuthenticated && !inAuthGroup) {
      console.log('🚫 Not authenticated, redirecting to login');
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup && !isPasswordRecovery) {
      console.log('✅ Authenticated in auth group, redirecting to tabs');
      router.replace('/(tabs)');
    } else {
      console.log('👍 Navigation state OK, no redirect needed');
    }
  }, [isAuthenticated, segments, loading, isPasswordRecovery]);

  // Show loading screen while checking auth
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#E20010" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Slot />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
