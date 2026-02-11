/**
 * App Entry Point
 * Redirects to auth or main app based on authentication status
 */

import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const { isAuthenticated, loading } = useAuthStore();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#E20010" />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
