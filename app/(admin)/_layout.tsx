/**
 * Admin Layout - Web-only admin panel
 */

import React, { useEffect } from 'react';
import { View, Text, Platform, TouchableOpacity, StyleSheet } from 'react-native';
import { Stack, router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useAdminStore } from '@/store/adminStore';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function AdminLayout() {
  const { user, isAuthenticated } = useAuthStore();
  const { isAdmin, loading, checkAdmin } = useAdminStore();

  useEffect(() => {
    if (user?.id) {
      checkAdmin(user.id);
    }
  }, [user?.id]);

  // Web-only guard
  if (Platform.OS !== 'web') {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Admin panel is only available on web.
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Auth guard
  if (!isAuthenticated) {
    router.replace('/(auth)/login');
    return null;
  }

  // Loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Checking admin access...</Text>
      </View>
    );
  }

  // Admin guard
  if (!isAdmin) {
    return (
      <View style={styles.container}>
        <FontAwesome name="lock" size={48} color="#E20010" />
        <Text style={styles.errorTitle}>Access Denied</Text>
        <Text style={styles.errorText}>
          You do not have admin privileges.
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.layoutContainer}>
      {/* Admin Sidebar */}
      <View style={styles.sidebar}>
        <Text style={styles.sidebarTitle}>Admin Panel</Text>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push('/(admin)')}
        >
          <FontAwesome name="dashboard" size={16} color="#5F6267" />
          <Text style={styles.navText}>Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push('/(admin)/users')}
        >
          <FontAwesome name="users" size={16} color="#5F6267" />
          <Text style={styles.navText}>Users</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push('/(admin)/providers')}
        >
          <FontAwesome name="id-badge" size={16} color="#5F6267" />
          <Text style={styles.navText}>Providers</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push('/(admin)/requests' as any)}
        >
          <FontAwesome name="list" size={16} color="#5F6267" />
          <Text style={styles.navText}>Requests</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push('/(admin)/categories')}
        >
          <FontAwesome name="th-list" size={16} color="#5F6267" />
          <Text style={styles.navText}>Categories</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push('/(admin)/regions')}
        >
          <FontAwesome name="map" size={16} color="#5F6267" />
          <Text style={styles.navText}>Regions</Text>
        </TouchableOpacity>

        <View style={styles.sidebarDivider} />

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.replace('/(tabs)')}
        >
          <FontAwesome name="arrow-left" size={16} color="#B3B8C4" />
          <Text style={[styles.navText, { color: '#B3B8C4' }]}>Back to App</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F8FA',
    padding: 20,
  },
  layoutContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F7F8FA',
  },
  loadingText: {
    fontSize: 16,
    color: '#B3B8C4',
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#5F6267',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#B3B8C4',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#E20010',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  sidebar: {
    width: 220,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E6E9EF',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E20010',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 4,
  },
  navText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#5F6267',
  },
  sidebarDivider: {
    height: 1,
    backgroundColor: '#E6E9EF',
    marginVertical: 16,
  },
  mainContent: {
    flex: 1,
  },
});
