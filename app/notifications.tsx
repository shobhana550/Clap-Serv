/**
 * Notifications Screen - Shows in-app notification history
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'new_opportunity':
      return { name: 'bolt', color: '#F59E0B' };
    case 'new_proposal':
      return { name: 'file-text', color: '#3B82F6' };
    case 'proposal_accepted':
      return { name: 'check-circle', color: '#10B981' };
    case 'proposal_rejected':
      return { name: 'times-circle', color: '#EF4444' };
    case 'new_message':
      return { name: 'comment', color: '#8B5CF6' };
    case 'project_update':
      return { name: 'folder-open', color: '#E20010' };
    default:
      return { name: 'bell', color: '#B3B8C4' };
  }
};

const getTimeAgo = (dateString: string) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

export default function NotificationsScreen() {
  const { user } = useAuthStore();
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();

  useEffect(() => {
    if (user?.id) {
      fetchNotifications(user.id);
    }
  }, [user?.id]);

  const handleNotificationPress = async (notification: any) => {
    // Mark as read
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.data?.requestId) {
      router.push(`/requests/${notification.data.requestId}` as any);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color="#E20010" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={() => user?.id && markAllAsRead(user.id)}>
            <Text style={styles.markAllRead}>Mark all read</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 80 }} />
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E20010" />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <FontAwesome name="bell-slash-o" size={48} color="#C5C4CC" />
          <Text style={styles.emptyTitle}>No notifications yet</Text>
          <Text style={styles.emptyText}>
            You'll receive notifications when there are new service requests matching your skills
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
          {notifications.map((notification) => {
            const icon = getNotificationIcon(notification.type);
            return (
              <TouchableOpacity
                key={notification.id}
                style={[
                  styles.notificationItem,
                  !notification.read && styles.notificationUnread,
                ]}
                onPress={() => handleNotificationPress(notification)}
              >
                <View style={[styles.iconCircle, { backgroundColor: icon.color + '15' }]}>
                  <FontAwesome name={icon.name as any} size={18} color={icon.color} />
                </View>
                <View style={styles.notificationContent}>
                  <Text style={[styles.notificationTitle, !notification.read && styles.textBold]}>
                    {notification.title}
                  </Text>
                  <Text style={styles.notificationBody} numberOfLines={2}>
                    {notification.body}
                  </Text>
                  <Text style={styles.notificationTime}>
                    {getTimeAgo(notification.created_at)}
                  </Text>
                </View>
                {!notification.read && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E6E9EF',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#5F6267',
  },
  markAllRead: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E20010',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#5F6267',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#B3B8C4',
    textAlign: 'center',
    lineHeight: 20,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F7F8FA',
    gap: 14,
  },
  notificationUnread: {
    backgroundColor: '#FFFBF5',
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#5F6267',
    marginBottom: 2,
  },
  textBold: {
    fontWeight: '700',
  },
  notificationBody: {
    fontSize: 13,
    color: '#B3B8C4',
    lineHeight: 18,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 11,
    color: '#C5C4CC',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E20010',
    marginTop: 6,
  },
});
