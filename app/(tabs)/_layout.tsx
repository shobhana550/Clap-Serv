/**
 * Bottom Tab Navigation Layout for Clap-Serv
 */

import React, { useEffect } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs, router } from 'expo-router';
import { Platform, TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';

// Tab Bar Icon Component
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={22} style={{ marginBottom: -2 }} {...props} />;
}

// Notification Bell with badge
function NotificationBell() {
  const { unreadCount } = useNotificationStore();
  return (
    <TouchableOpacity
      onPress={() => router.push('/notifications')}
      style={bellStyles.container}
    >
      <FontAwesome name="bell-o" size={20} color="#5F6267" />
      {unreadCount > 0 && (
        <View style={bellStyles.badge}>
          <Text style={bellStyles.badgeText}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const bellStyles = StyleSheet.create({
  container: {
    marginRight: 16,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#E20010',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});

export default function TabLayout() {
  const { user } = useAuthStore();
  const { fetchNotifications } = useNotificationStore();
  const insets = useSafeAreaInsets();

  // On older Android with software nav buttons, insets.bottom > 0
  const bottomInset = Platform.OS === 'android' ? insets.bottom : 0;

  // Fetch notifications on mount and periodically
  useEffect(() => {
    if (user?.id) {
      fetchNotifications(user.id);
      // Refresh every 30 seconds
      const interval = setInterval(() => fetchNotifications(user.id), 30000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#E20010',
        tabBarInactiveTintColor: '#C5C4CC',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E6E9EF',
          borderTopWidth: 1,
          height: 60 + bottomInset,
          paddingBottom: 8 + bottomInset,
          paddingTop: 8,
          ...Platform.select({
            web: {
              boxShadow: '0 -1px 4px rgba(0, 0, 0, 0.04)',
            },
            default: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -1 },
              shadowOpacity: 0.04,
              shadowRadius: 4,
              elevation: 2,
            },
          }),
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: '#FFFFFF',
          ...Platform.select({
            web: {
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
            },
            default: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.06,
              shadowRadius: 3,
              elevation: 2,
            },
          }),
        },
        headerTintColor: '#5F6267',
        headerShadowVisible: false,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
          color: '#5F6267',
        },
      }}
    >
      {/* Home / Dashboard Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          headerTitle: 'Clap-Serv',
          headerTitleStyle: {
            fontWeight: '800',
            fontSize: 20,
            color: '#E20010',
          },
          headerRight: () => <NotificationBell />,
        }}
      />

      {/* Browse Opportunities/Requests Tab */}
      <Tabs.Screen
        name="browse"
        options={{
          title: 'Browse',
          tabBarIcon: ({ color }) => <TabBarIcon name="search" color={color} />,
          headerTitle: 'Browse',
        }}
      />

      {/* Projects Tab - Hidden (role ends at acceptance) */}
      <Tabs.Screen
        name="projects"
        options={{
          href: null, // Hide from tab bar
        }}
      />

      {/* Messages Tab */}
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color }) => <TabBarIcon name="comments" color={color} />,
          headerTitle: 'Messages',
        }}
      />

      {/* Profile Tab */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
          headerTitle: 'Profile',
        }}
      />
    </Tabs>
  );
}
