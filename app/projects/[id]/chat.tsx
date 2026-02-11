/**
 * Chat Screen - Messaging between buyer and provider for a project
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '@/store/authStore';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const [project, setProject] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadChatData();
  }, [id]);

  const loadChatData = async () => {
    try {
      // Load project details
      const projectsJson = await AsyncStorage.getItem('projects');
      if (projectsJson) {
        const projects = JSON.parse(projectsJson);
        const foundProject = projects.find((p: any) => p.id === id);
        setProject(foundProject);

        // Load messages for this project
        const messagesJson = await AsyncStorage.getItem(`messages_${id}`);
        if (messagesJson) {
          const loadedMessages = JSON.parse(messagesJson);
          setMessages(loadedMessages);
        }
      }
    } catch (error) {
      console.error('Error loading chat data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !project) return;

    const newMessage = {
      id: `msg-${Date.now()}`,
      project_id: project.id,
      sender_id: user?.id,
      sender_name: user?.email?.split('@')[0] || 'User',
      content: messageText.trim(),
      created_at: new Date().toISOString(),
      read: false,
    };

    try {
      // Add message to local list
      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);

      // Save to AsyncStorage
      await AsyncStorage.setItem(`messages_${id}`, JSON.stringify(updatedMessages));

      // Update conversation's last message
      const conversationsJson = await AsyncStorage.getItem('conversations');
      if (conversationsJson) {
        const conversations = JSON.parse(conversationsJson);
        const conversationIndex = conversations.findIndex((c: any) => c.project_id === project.id);

        if (conversationIndex >= 0) {
          conversations[conversationIndex].last_message = messageText.trim();
          conversations[conversationIndex].last_message_at = newMessage.created_at;
          await AsyncStorage.setItem('conversations', JSON.stringify(conversations));
        } else {
          // Create new conversation
          const newConversation = {
            id: `conv-${Date.now()}`,
            project_id: project.id,
            buyer_id: project.buyer_id,
            provider_id: project.provider_id,
            buyer_name: project.buyer_name,
            provider_name: project.provider_name,
            project_title: project.request_title,
            last_message: messageText.trim(),
            last_message_at: newMessage.created_at,
            created_at: newMessage.created_at,
            unread_count: 0,
          };
          conversations.push(newConversation);
          await AsyncStorage.setItem('conversations', JSON.stringify(conversations));
        }
      } else {
        // Create first conversation
        const newConversation = {
          id: `conv-${Date.now()}`,
          project_id: project.id,
          buyer_id: project.buyer_id,
          provider_id: project.provider_id,
          buyer_name: project.buyer_name,
          provider_name: project.provider_name,
          project_title: project.request_title,
          last_message: messageText.trim(),
          last_message_at: newMessage.created_at,
          created_at: newMessage.created_at,
          unread_count: 0,
        };
        await AsyncStorage.setItem('conversations', JSON.stringify([newConversation]));
      }

      setMessageText('');
      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push(`/projects/${id}`);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <FontAwesome name="arrow-left" size={20} color="#E20010" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chat</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#B3B8C4' }}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (!project) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <FontAwesome name="arrow-left" size={20} color="#E20010" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chat</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#EF4444' }}>Project not found</Text>
        </View>
      </View>
    );
  }

  const otherPartyName =
    user?.id === project.buyer_id ? project.provider_name : project.buyer_name;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color="#E20010" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{otherPartyName}</Text>
          <Text style={styles.headerSubtitle}>{project.request_title}</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push(`/projects/${project.id}`)}
          style={styles.infoButton}
        >
          <FontAwesome name="info-circle" size={20} color="#E20010" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <FontAwesome name="comment" size={48} color="#E6E9EF" />
            <Text style={styles.emptyText}>No messages yet. Start the conversation!</Text>
          </View>
        ) : (
          <>
            {messages.map((message) => {
              const isOwnMessage = message.sender_id === user?.id;
              return (
                <View
                  key={message.id}
                  style={[
                    styles.messageBubble,
                    isOwnMessage ? styles.ownMessage : styles.otherMessage,
                  ]}
                >
                  {!isOwnMessage && (
                    <Text style={styles.senderName}>{message.sender_name}</Text>
                  )}
                  <Text
                    style={[
                      styles.messageText,
                      isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
                    ]}
                  >
                    {message.content}
                  </Text>
                  <Text
                    style={[
                      styles.messageTime,
                      isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime,
                    ]}
                  >
                    {new Date(message.created_at).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>

      {/* Message Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#C5C4CC"
          value={messageText}
          onChangeText={setMessageText}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[styles.sendButton, !messageText.trim() && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={!messageText.trim()}
        >
          <FontAwesome
            name="send"
            size={20}
            color={messageText.trim() ? '#FFFFFF' : '#C5C4CC'}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    paddingVertical: 12,
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
  headerInfo: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#5F6267',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#B3B8C4',
    marginTop: 2,
  },
  infoButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 24,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    color: '#B3B8C4',
    marginTop: 16,
    textAlign: 'center',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  ownMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#E20010',
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    ...Platform.select({
      web: {
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  senderName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#E20010',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#FFFFFF',
  },
  otherMessageText: {
    color: '#5F6267',
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
  },
  ownMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  otherMessageTime: {
    color: '#C5C4CC',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E6E9EF',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#F7F8FA',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#5F6267',
    maxHeight: 100,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E20010',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#E6E9EF',
  },
});
