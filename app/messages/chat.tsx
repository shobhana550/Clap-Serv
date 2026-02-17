/**
 * Chat Screen - Real-time messaging with file attachment support
 * Uses Supabase Realtime for live message updates + polling fallback
 * Supports image, video, and document attachments
 * Sends push notifications on new messages
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  Dimensions,
  Linking,
  Keyboard,
  AppState,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import {
  ChatAttachment,
  uploadChatAttachment,
  getAttachmentSignedUrl,
  getAttachmentType,
  validateAttachment,
  formatFileSize,
} from '@/lib/chat/uploadAttachment';
import { sendPushNotifications, saveNotificationRecord } from '@/lib/notifications/sendNotification';
import { showAlert } from '@/utils/alert';

const PRIMARY = '#E20010';
const DARK = '#5F6267';
const MEDIUM = '#B3B8C4';
const BG = '#F7F8FA';
const BORDER = '#E6E9EF';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  attachments: string[] | null;
  read: boolean;
  created_at: string;
}

interface ParsedAttachment {
  path: string;
  type: 'image' | 'video' | 'document';
  name: string;
  mimeType: string;
  size: number;
}

export default function ChatScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const { user } = useAuthStore();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [otherPersonName, setOtherPersonName] = useState('');
  const [otherPersonId, setOtherPersonId] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isScreenFocused = useRef(true);

  // Attachment state
  const [pendingAttachments, setPendingAttachments] = useState<ChatAttachment[]>([]);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [signedUrlCache, setSignedUrlCache] = useState<Record<string, string>>({});

  // Safe bottom padding for nav buttons/gesture bar
  const bottomInset = Platform.OS === 'android' ? Math.max(insets.bottom, 4) : insets.bottom;
  const topInset = Platform.OS === 'android' ? Math.max(insets.top, 24) : insets.top;

  // Fetch conversation details
  useEffect(() => {
    if (!conversationId || !user?.id) return;

    const fetchConversation = async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select(
          '*, buyer:profiles!buyer_id(id, full_name), provider:profiles!provider_id(id, full_name)'
        )
        .eq('id', conversationId)
        .single();

      if (error) {
        console.error('Error fetching conversation:', error);
        return;
      }

      if (data) {
        const isUserBuyer = data.buyer_id === user.id;
        const otherProfile = isUserBuyer ? data.provider : data.buyer;
        setOtherPersonName(otherProfile?.full_name || 'Unknown User');
        setOtherPersonId(isUserBuyer ? data.provider_id : data.buyer_id);
      }
    };

    fetchConversation();
  }, [conversationId, user?.id]);

  // Fetch messages function (used by both initial load and polling)
  const fetchMessages = useCallback(async (silent = false) => {
    if (!conversationId) return;

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
    } else {
      setMessages((prev) => {
        if (!data) return prev;
        // Only update state if data actually changed
        if (data.length !== prev.length) return data;
        if (data.length > 0 && prev.length > 0) {
          const lastNew = data[data.length - 1];
          const lastOld = prev[prev.length - 1];
          if (lastNew.id !== lastOld.id || lastNew.read !== lastOld.read) return data;
        }
        return prev;
      });
    }

    if (!silent) setLoading(false);
  }, [conversationId]);

  // Initial fetch + real-time subscription + polling fallback
  useEffect(() => {
    if (!conversationId) return;

    fetchMessages();

    // Subscribe to new messages and updates in real-time
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => {
            const exists = prev.some((m) => m.id === payload.new.id);
            if (exists) return prev;
            return [...prev, payload.new as Message];
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === payload.new.id ? { ...m, ...payload.new } as Message : m))
          );
        }
      )
      .subscribe();

    // Polling fallback every 5 seconds (in case realtime subscription drops)
    pollTimerRef.current = setInterval(() => {
      if (isScreenFocused.current) {
        fetchMessages(true);
      }
    }, 5000);

    return () => {
      supabase.removeChannel(channel);
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [conversationId, fetchMessages]);

  // Pause/resume polling when app goes background/foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      isScreenFocused.current = nextState === 'active';
      if (nextState === 'active') {
        fetchMessages(true);
      }
    });
    return () => subscription.remove();
  }, [fetchMessages]);

  // Mark unread messages as read
  useEffect(() => {
    if (!conversationId || !user?.id || messages.length === 0) return;

    const markAsRead = async () => {
      const unreadIds = messages
        .filter((m) => m.sender_id !== user.id && !m.read)
        .map((m) => m.id);

      if (unreadIds.length === 0) return;

      await supabase
        .from('messages')
        .update({ read: true })
        .in('id', unreadIds);
    };

    markAsRead();
  }, [messages, user?.id, conversationId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 150);
    }
  }, [messages.length]);

  // Scroll to bottom when keyboard opens
  useEffect(() => {
    const event = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const sub = Keyboard.addListener(event, () => {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 200);
    });
    return () => sub.remove();
  }, []);

  // Fetch signed URLs for attachments
  useEffect(() => {
    const fetchSignedUrls = async () => {
      const paths: string[] = [];
      for (const msg of messages) {
        if (!msg.attachments || msg.attachments.length === 0) continue;
        for (const attJson of msg.attachments) {
          try {
            const att: ParsedAttachment = JSON.parse(attJson);
            if (att.path && !signedUrlCache[att.path]) {
              paths.push(att.path);
            }
          } catch {}
        }
      }

      if (paths.length === 0) return;

      const newUrls: Record<string, string> = {};
      for (const path of paths) {
        const url = await getAttachmentSignedUrl(path);
        if (url) newUrls[path] = url;
      }

      if (Object.keys(newUrls).length > 0) {
        setSignedUrlCache((prev) => ({ ...prev, ...newUrls }));
      }
    };

    fetchSignedUrls();
  }, [messages]);

  // --- Attachment Picking ---

  const pickFromGallery = async () => {
    setShowAttachmentMenu(false);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showAlert('Permission Required', 'Permission to access media library is required.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      addAttachments(result.assets.map((asset) => ({
        uri: asset.uri,
        name: asset.fileName || `file_${Date.now()}.${asset.type === 'video' ? 'mp4' : 'jpg'}`,
        mimeType: asset.mimeType || (asset.type === 'video' ? 'video/mp4' : 'image/jpeg'),
        size: asset.fileSize || 0,
        type: getAttachmentType(asset.mimeType || 'image/jpeg'),
      })));
    }
  };

  const takePhoto = async () => {
    setShowAttachmentMenu(false);
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      showAlert('Permission Required', 'Permission to access camera is required.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });

    if (!result.canceled && result.assets && result.assets[0]) {
      const asset = result.assets[0];
      addAttachments([{
        uri: asset.uri,
        name: asset.fileName || `photo_${Date.now()}.jpg`,
        mimeType: asset.mimeType || 'image/jpeg',
        size: asset.fileSize || 0,
        type: 'image',
      }]);
    }
  };

  const pickDocument = async () => {
    setShowAttachmentMenu(false);
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
      multiple: true,
    });

    if (!result.canceled && result.assets) {
      addAttachments(result.assets.map((asset) => ({
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType || 'application/octet-stream',
        size: asset.size || 0,
        type: getAttachmentType(asset.mimeType || 'application/octet-stream'),
      })));
    }
  };

  const addAttachments = (newAtts: ChatAttachment[]) => {
    for (const att of newAtts) {
      const err = validateAttachment(att);
      if (err) {
        showAlert('File Too Large', err);
        return;
      }
    }
    const total = pendingAttachments.length + newAtts.length;
    if (total > 5) {
      showAlert('Too Many Files', 'You can attach up to 5 files per message.');
      return;
    }
    setPendingAttachments((prev) => [...prev, ...newAtts]);
  };

  const removePendingAttachment = (index: number) => {
    setPendingAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // --- Send Push Notification to Recipient ---

  const sendChatPushNotification = async (recipientId: string, messageContent: string) => {
    try {
      const { data: tokens } = await supabase
        .rpc('get_user_push_tokens', { target_user_id: recipientId });

      if (tokens && tokens.length > 0) {
        const tokenStrings = tokens.map((t: any) => t.token);
        const senderName = user?.user_metadata?.full_name || 'Someone';

        await sendPushNotifications(
          tokenStrings,
          `New message from ${senderName}`,
          messageContent.length > 100 ? messageContent.substring(0, 100) + '...' : messageContent,
          {
            type: 'new_message',
            conversationId,
            screen: 'messages/chat',
          }
        );
      }

      // Save in-app notification record
      await saveNotificationRecord(
        recipientId,
        'new_message',
        'New Message',
        messageContent.length > 100 ? messageContent.substring(0, 100) + '...' : messageContent,
        { type: 'new_message', conversationId }
      );
    } catch (error) {
      console.error('Error sending chat notification:', error);
    }
  };

  // --- Send Message ---

  const sendMessage = async () => {
    const trimmed = newMessage.trim();
    if ((!trimmed && pendingAttachments.length === 0) || !user?.id || !conversationId || sending) return;

    Keyboard.dismiss();
    setSending(true);
    const savedMessage = trimmed;
    setNewMessage('');
    const attachmentsToSend = [...pendingAttachments];
    setPendingAttachments([]);

    try {
      let uploadedPaths: string[] = [];
      if (attachmentsToSend.length > 0) {
        setUploading(true);
        for (const att of attachmentsToSend) {
          const result = await uploadChatAttachment(att, user.id, conversationId);
          uploadedPaths.push(JSON.stringify({
            path: result.path,
            type: result.type,
            name: result.name,
            mimeType: result.mimeType,
            size: result.size,
          }));
        }
        setUploading(false);
      }

      const messageContent = trimmed || `Sent ${attachmentsToSend.length} attachment(s)`;

      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: messageContent,
          attachments: uploadedPaths.length > 0 ? uploadedPaths : [],
          read: false,
        })
        .select()
        .single();

      if (messageError) {
        console.error('Error sending message:', messageError);
        setNewMessage(savedMessage);
        setPendingAttachments(attachmentsToSend);
        return;
      }

      if (messageData) {
        setMessages((prev) => {
          const exists = prev.some((m) => m.id === messageData.id);
          if (exists) return prev;
          return [...prev, messageData];
        });
      }

      // Update conversation last_message
      await supabase
        .from('conversations')
        .update({
          last_message: messageContent,
          last_message_at: new Date().toISOString(),
        })
        .eq('id', conversationId);

      // Send push notification to recipient (fire-and-forget)
      if (otherPersonId) {
        sendChatPushNotification(otherPersonId, messageContent);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(savedMessage);
      setPendingAttachments(attachmentsToSend);
      showAlert('Error', 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
      setUploading(false);
    }
  };

  // --- Formatting ---

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDateSeparator = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const shouldShowDateSeparator = (index: number) => {
    if (index === 0) return true;
    const currentDate = new Date(messages[index].created_at).toDateString();
    const previousDate = new Date(messages[index - 1].created_at).toDateString();
    return currentDate !== previousDate;
  };

  // --- Attachment Rendering ---

  const handleAttachmentPress = async (att: ParsedAttachment) => {
    const url = signedUrlCache[att.path];
    if (!url) return;

    if (att.type === 'image') {
      setImagePreviewUrl(url);
    } else {
      try {
        await Linking.openURL(url);
      } catch {
        showAlert('Error', 'Could not open the file.');
      }
    }
  };

  const renderAttachments = (attachments: string[] | null, isOwn: boolean) => {
    if (!attachments || attachments.length === 0) return null;

    return (
      <View style={styles.messageAttachments}>
        {attachments.map((attJson, idx) => {
          let att: ParsedAttachment;
          try {
            att = JSON.parse(attJson);
          } catch {
            return null;
          }

          const url = signedUrlCache[att.path];

          if (att.type === 'image') {
            return (
              <TouchableOpacity key={idx} onPress={() => handleAttachmentPress(att)} activeOpacity={0.8}>
                {url ? (
                  <Image source={{ uri: url }} style={styles.messageImage} resizeMode="cover" />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <ActivityIndicator size="small" color={isOwn ? '#FFF' : PRIMARY} />
                  </View>
                )}
              </TouchableOpacity>
            );
          }

          if (att.type === 'video') {
            return (
              <TouchableOpacity key={idx} style={styles.videoAttachment} onPress={() => handleAttachmentPress(att)} activeOpacity={0.8}>
                <FontAwesome name="play-circle" size={32} color="#FFFFFF" />
                <Text style={[styles.videoName, isOwn && { color: '#FFF' }]} numberOfLines={1}>{att.name}</Text>
                <Text style={[styles.videoSize, isOwn && { color: 'rgba(255,255,255,0.7)' }]}>{formatFileSize(att.size)}</Text>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity key={idx} style={[styles.documentAttachment, isOwn && styles.documentAttachmentOwn]} onPress={() => handleAttachmentPress(att)} activeOpacity={0.8}>
              <FontAwesome name="file-o" size={20} color={isOwn ? '#FFFFFF' : DARK} />
              <View style={styles.documentInfo}>
                <Text style={[styles.documentName, isOwn && { color: '#FFF' }]} numberOfLines={1}>{att.name}</Text>
                <Text style={[styles.documentSize, isOwn && { color: 'rgba(255,255,255,0.7)' }]}>{formatFileSize(att.size)}</Text>
              </View>
              <FontAwesome name="download" size={14} color={isOwn ? 'rgba(255,255,255,0.7)' : MEDIUM} />
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  // --- Render Message ---

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isOwnMessage = item.sender_id === user?.id;
    const showDate = shouldShowDateSeparator(index);
    const hasAttachments = item.attachments && item.attachments.length > 0;
    const isAttachmentOnly = hasAttachments && item.content.match(/^Sent \d+ attachment/);

    return (
      <View>
        {showDate && (
          <View style={styles.dateSeparator}>
            <View style={styles.dateLine} />
            <Text style={styles.dateText}>{formatDateSeparator(item.created_at)}</Text>
            <View style={styles.dateLine} />
          </View>
        )}

        <View style={[styles.messageBubbleRow, isOwnMessage ? styles.ownMessageRow : styles.otherMessageRow]}>
          <View style={[styles.messageBubble, isOwnMessage ? styles.ownBubble : styles.otherBubble, hasAttachments && styles.attachmentBubble]}>
            {renderAttachments(item.attachments, isOwnMessage)}

            {!isAttachmentOnly && (
              <Text style={[styles.messageText, isOwnMessage ? styles.ownMessageText : styles.otherMessageText]}>
                {item.content}
              </Text>
            )}

            <View style={styles.messageFooter}>
              <Text style={[styles.messageTime, isOwnMessage ? styles.ownTimeText : styles.otherTimeText]}>
                {formatTime(item.created_at)}
              </Text>
              {isOwnMessage && (
                <FontAwesome
                  name={item.read ? 'check-circle' : 'check-circle-o'}
                  size={12}
                  color={item.read ? '#FFFFFF' : 'rgba(255,255,255,0.6)'}
                  style={{ marginLeft: 4 }}
                />
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  // --- Loading State ---

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: topInset }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <FontAwesome name="chevron-left" size={18} color={DARK} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Loading...</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PRIMARY} />
        </View>
      </View>
    );
  }

  const canSend = (newMessage.trim() || pendingAttachments.length > 0) && !sending;

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome name="chevron-left" size={18} color={DARK} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>
              {otherPersonName.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={styles.headerTitle} numberOfLines={1}>{otherPersonName}</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView
        style={styles.chatArea}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? topInset : 0}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyChat}>
            <FontAwesome name="comment-o" size={48} color={BORDER} />
            <Text style={styles.emptyChatText}>No messages yet. Say hello!</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            onContentSizeChange={() => {
              flatListRef.current?.scrollToEnd({ animated: false });
            }}
            onLayout={() => {
              flatListRef.current?.scrollToEnd({ animated: false });
            }}
          />
        )}

        {/* Uploading indicator */}
        {uploading && (
          <View style={styles.uploadingBar}>
            <ActivityIndicator size="small" color={PRIMARY} />
            <Text style={styles.uploadingText}>Uploading files...</Text>
          </View>
        )}

        {/* Pending Attachments Preview */}
        {pendingAttachments.length > 0 && (
          <View style={styles.attachmentPreviewStrip}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 12 }}>
              {pendingAttachments.map((att, index) => (
                <View key={index} style={styles.previewItem}>
                  {att.type === 'image' ? (
                    <Image source={{ uri: att.uri }} style={styles.previewThumb} />
                  ) : att.type === 'video' ? (
                    <View style={[styles.previewThumb, styles.previewVideoThumb]}>
                      <FontAwesome name="play-circle" size={24} color="#FFFFFF" />
                    </View>
                  ) : (
                    <View style={[styles.previewThumb, styles.previewDocThumb]}>
                      <FontAwesome name="file-o" size={20} color={DARK} />
                    </View>
                  )}
                  <TouchableOpacity style={styles.removeAttachmentBtn} onPress={() => removePendingAttachment(index)}>
                    <FontAwesome name="times-circle" size={20} color="#EF4444" />
                  </TouchableOpacity>
                  <Text style={styles.previewFileName} numberOfLines={1}>{att.name}</Text>
                  <Text style={styles.previewFileSize}>{formatFileSize(att.size)}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Input Bar — bottom inset applied for gesture bar / nav buttons */}
        <View style={[styles.inputContainer, { paddingBottom: Math.max(10, bottomInset) }]}>
          <TouchableOpacity style={styles.attachButton} onPress={() => setShowAttachmentMenu(true)}>
            <FontAwesome name="paperclip" size={20} color={PRIMARY} />
          </TouchableOpacity>

          <TextInput
            style={styles.textInput}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            placeholderTextColor={MEDIUM}
            multiline
            maxLength={2000}
            returnKeyType="default"
          />

          <TouchableOpacity
            onPress={sendMessage}
            style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
            disabled={!canSend}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <FontAwesome name="send" size={16} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Attachment Menu Modal */}
      <Modal visible={showAttachmentMenu} transparent animationType="slide" onRequestClose={() => setShowAttachmentMenu(false)}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setShowAttachmentMenu(false)}>
          <View style={[styles.attachmentMenu, { paddingBottom: Math.max(20, bottomInset + 10) }]}>
            <View style={styles.attachmentMenuHandle} />
            <Text style={styles.attachmentMenuTitle}>Share</Text>

            <View style={styles.attachmentMenuOptions}>
              <TouchableOpacity style={styles.attachmentMenuOption} onPress={pickFromGallery}>
                <View style={[styles.attachmentMenuIcon, { backgroundColor: '#3B82F6' }]}>
                  <FontAwesome name="image" size={22} color="#FFFFFF" />
                </View>
                <Text style={styles.attachmentMenuLabel}>Gallery</Text>
                <Text style={styles.attachmentMenuHint}>Images & Videos</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.attachmentMenuOption} onPress={takePhoto}>
                <View style={[styles.attachmentMenuIcon, { backgroundColor: '#10B981' }]}>
                  <FontAwesome name="camera" size={22} color="#FFFFFF" />
                </View>
                <Text style={styles.attachmentMenuLabel}>Camera</Text>
                <Text style={styles.attachmentMenuHint}>Take a photo</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.attachmentMenuOption} onPress={pickDocument}>
                <View style={[styles.attachmentMenuIcon, { backgroundColor: '#F59E0B' }]}>
                  <FontAwesome name="file" size={22} color="#FFFFFF" />
                </View>
                <Text style={styles.attachmentMenuLabel}>Document</Text>
                <Text style={styles.attachmentMenuHint}>PDF, DOC, etc.</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.attachmentMenuLimits}>
              Images: max 5MB  |  Videos: max 20MB
            </Text>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Full-screen Image Preview */}
      <Modal visible={!!imagePreviewUrl} transparent animationType="fade" onRequestClose={() => setImagePreviewUrl(null)}>
        <View style={styles.imagePreviewOverlay}>
          <TouchableOpacity style={[styles.imagePreviewClose, { top: Math.max(20, topInset) }]} onPress={() => setImagePreviewUrl(null)}>
            <FontAwesome name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          {imagePreviewUrl && (
            <Image source={{ uri: imagePreviewUrl }} style={styles.fullImage} resizeMode="contain" />
          )}
        </View>
      </Modal>
    </View>
  );
}

const IMAGE_MAX_W = Math.min(SCREEN_WIDTH * 0.55, 280);
const IMAGE_MAX_H = Math.min(SCREEN_WIDTH * 0.4, 200);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    ...Platform.select({
      web: {
        height: '100vh' as any,
        maxHeight: '100vh' as any,
        overflow: 'hidden' as any,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    ...Platform.select({
      web: { boxShadow: '0 1px 4px rgba(0, 0, 0, 0.06)' },
    }),
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: DARK,
    flex: 1,
  },
  headerRight: {
    width: 34,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatArea: {
    flex: 1,
    ...Platform.select({
      web: {
        minHeight: 0,
        overflow: 'hidden' as any,
      },
    }),
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
    flexGrow: 1,
  },
  emptyChat: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyChatText: {
    fontSize: 15,
    color: MEDIUM,
    marginTop: 12,
    textAlign: 'center',
  },
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: BORDER,
  },
  dateText: {
    fontSize: 12,
    color: MEDIUM,
    marginHorizontal: 12,
    fontWeight: '500',
  },
  messageBubbleRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  ownMessageRow: {
    justifyContent: 'flex-end',
  },
  otherMessageRow: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  ownBubble: {
    backgroundColor: PRIMARY,
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#E6E9EF',
    borderBottomLeftRadius: 4,
  },
  attachmentBubble: {
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#FFFFFF',
  },
  otherMessageText: {
    color: DARK,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 11,
  },
  ownTimeText: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherTimeText: {
    color: MEDIUM,
  },

  // Message Attachments
  messageAttachments: {
    gap: 6,
    marginBottom: 6,
  },
  messageImage: {
    width: IMAGE_MAX_W,
    height: IMAGE_MAX_H,
    borderRadius: 10,
    backgroundColor: BORDER,
  },
  imagePlaceholder: {
    width: IMAGE_MAX_W,
    height: IMAGE_MAX_H,
    borderRadius: 10,
    backgroundColor: BORDER,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoAttachment: {
    width: IMAGE_MAX_W,
    height: 80,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  videoName: {
    fontSize: 12,
    color: DARK,
    fontWeight: '500',
    marginTop: 4,
  },
  videoSize: {
    fontSize: 10,
    color: MEDIUM,
  },
  documentAttachment: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: BORDER,
  },
  documentAttachmentOwn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderColor: 'rgba(255,255,255,0.3)',
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 13,
    fontWeight: '600',
    color: DARK,
  },
  documentSize: {
    fontSize: 11,
    color: MEDIUM,
    marginTop: 2,
  },

  // Uploading
  uploadingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  uploadingText: {
    fontSize: 13,
    color: MEDIUM,
  },

  // Preview Strip
  attachmentPreviewStrip: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingVertical: 10,
  },
  previewItem: {
    width: 80,
    alignItems: 'center',
  },
  previewThumb: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: BORDER,
  },
  previewVideoThumb: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  previewDocThumb: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BG,
    borderWidth: 1,
    borderColor: BORDER,
  },
  removeAttachmentBtn: {
    position: 'absolute',
    top: -6,
    right: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },
  previewFileName: {
    fontSize: 10,
    color: DARK,
    marginTop: 4,
    textAlign: 'center',
    width: 72,
  },
  previewFileSize: {
    fontSize: 9,
    color: MEDIUM,
    textAlign: 'center',
  },

  // Input Bar
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    paddingTop: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  attachButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: BG,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 15,
    color: DARK,
    maxHeight: 100,
    minHeight: 40,
    marginRight: 8,
    borderWidth: 1,
    borderColor: BORDER,
    ...Platform.select({
      web: {
        outlineStyle: 'none' as any,
      },
    }),
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: MEDIUM,
  },

  // Attachment Menu
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  attachmentMenu: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingHorizontal: 20,
  },
  attachmentMenuHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: BORDER,
    alignSelf: 'center',
    marginBottom: 16,
  },
  attachmentMenuTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: DARK,
    marginBottom: 20,
    textAlign: 'center',
  },
  attachmentMenuOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  attachmentMenuOption: {
    alignItems: 'center',
    width: 90,
  },
  attachmentMenuIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  attachmentMenuLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: DARK,
    marginBottom: 2,
  },
  attachmentMenuHint: {
    fontSize: 11,
    color: MEDIUM,
    textAlign: 'center',
  },
  attachmentMenuLimits: {
    fontSize: 11,
    color: MEDIUM,
    textAlign: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },

  // Image Preview
  imagePreviewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePreviewClose: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
    padding: 12,
  },
  fullImage: {
    width: Platform.OS === 'web' ? '90%' as any : SCREEN_WIDTH,
    height: '80%',
    maxWidth: 800,
    alignSelf: 'center' as any,
  },
});
