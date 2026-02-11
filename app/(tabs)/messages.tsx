/**
 * Messages Screen - Shows conversations between buyers and providers
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  RefreshControl,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '@/store/authStore';

export default function MessagesScreen() {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadConversations = async () => {
    try {
      const conversationsJson = await AsyncStorage.getItem('conversations');
      if (conversationsJson) {
        const allConversations = JSON.parse(conversationsJson);
        // Filter conversations where user is a participant
        const userConversations = allConversations.filter(
          (c: any) => c.buyer_id === user?.id || c.provider_id === user?.id
        );
        // Sort by last message time
        userConversations.sort((a: any, b: any) => {
          const aTime = a.last_message_at || a.created_at;
          const bTime = b.last_message_at || b.created_at;
          return new Date(bTime).getTime() - new Date(aTime).getTime();
        });
        setConversations(userConversations);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadConversations();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadConversations();
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#B3B8C4' }}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {conversations.length === 0 ? (
          <View style={styles.emptyCard}>
            <FontAwesome name="comments" size={64} color="#E6E9EF" />
            <Text style={styles.emptyTitle}>No Messages Yet</Text>
            <Text style={styles.emptyText}>
              Start a conversation by sending a message to a service provider or buyer
            </Text>
          </View>
        ) : (
          <>
            {conversations.map((conversation) => {
              const isUserBuyer = conversation.buyer_id === user?.id;
              const otherPartyName = isUserBuyer
                ? conversation.provider_name
                : conversation.buyer_name;
              const unreadCount = conversation.unread_count || 0;

              return (
                <TouchableOpacity
                  key={conversation.id}
                  style={styles.conversationCard}
                  onPress={() => router.push(`/projects/${conversation.project_id}/chat`)}
                >
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {otherPartyName?.charAt(0) || 'U'}
                    </Text>
                  </View>

                  <View style={styles.conversationContent}>
                    <View style={styles.conversationHeader}>
                      <Text style={styles.conversationName}>{otherPartyName}</Text>
                      <Text style={styles.conversationTime}>
                        {getTimeAgo(conversation.last_message_at || conversation.created_at)}
                      </Text>
                    </View>

                    <View style={styles.conversationFooter}>
                      <Text style={styles.lastMessage} numberOfLines={1}>
                        {conversation.last_message || 'No messages yet'}
                      </Text>
                      {unreadCount > 0 && (
                        <View style={styles.unreadBadge}>
                          <Text style={styles.unreadText}>{unreadCount}</Text>
                        </View>
                      )}
                    </View>

                    {conversation.project_title && (
                      <Text style={styles.projectTitle} numberOfLines={1}>
                        <FontAwesome name="briefcase" size={12} color="#B3B8C4" /> {conversation.project_title}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 48,
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#5F6267',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#B3B8C4',
    textAlign: 'center',
  },
  conversationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
      },
    }),
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E20010',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5F6267',
  },
  conversationTime: {
    fontSize: 12,
    color: '#B3B8C4',
  },
  conversationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    color: '#B3B8C4',
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: '#E20010',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  unreadText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  projectTitle: {
    fontSize: 12,
    color: '#B3B8C4',
    marginTop: 4,
  },
});
