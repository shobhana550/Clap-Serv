/**
 * Notification Sender Service
 * Sends push notifications via Expo Push API and saves to DB
 */

import { supabase } from '@/lib/supabase';

interface PushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: 'default' | null;
  channelId?: string;
  priority?: 'default' | 'normal' | 'high';
}

/**
 * Send push notifications to multiple Expo push tokens
 * Uses the Expo Push API: https://docs.expo.dev/push-notifications/sending-notifications/
 */
export const sendPushNotifications = async (
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, any>,
  channelId?: string
): Promise<void> => {
  if (tokens.length === 0) return;

  // Build messages array (Expo supports batch sending)
  const messages: PushMessage[] = tokens
    .filter((token) => token.startsWith('ExponentPushToken[') || token.startsWith('ExpoPushToken['))
    .map((token) => ({
      to: token,
      title,
      body,
      data: data || {},
      sound: 'default' as const,
      channelId: channelId || 'default',
      priority: 'high' as const,
    }));

  if (messages.length === 0) return;

  // Send in chunks of 100 (Expo API limit)
  const chunks = chunkArray(messages, 100);

  for (const chunk of chunks) {
    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chunk),
      });

      const result = await response.json();

      if (result.errors) {
        console.error('Expo push errors:', result.errors);
      }

      // Log ticket IDs for debugging
      if (result.data) {
        const failures = result.data.filter((r: any) => r.status === 'error');
        if (failures.length > 0) {
          console.warn('Some push notifications failed:', failures);
        }
      }
    } catch (error) {
      console.error('Error sending push notifications:', error);
    }
  }
};

/**
 * Save a notification record to the database (for in-app notification list)
 */
export const saveNotificationRecord = async (
  recipientId: string,
  type: string,
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<void> => {
  try {
    const { error } = await supabase.from('notifications').insert({
      user_id: recipientId,
      type,
      title,
      body,
      data: data || {},
      read: false,
    });

    if (error) {
      console.error('Error saving notification record:', error);
    }
  } catch (error) {
    console.error('Error saving notification record:', error);
  }
};

/**
 * Notify matched providers about a new service request
 */
export const notifyProvidersOfNewRequest = async (
  matchedProviders: Array<{
    userId: string;
    fullName: string;
    distance: number | null;
    pushTokens: string[];
  }>,
  requestTitle: string,
  requestId: string,
  categoryName: string,
  budgetMin: number,
  budgetMax: number
): Promise<{ notifiedCount: number }> => {
  if (matchedProviders.length === 0) {
    return { notifiedCount: 0 };
  }

  const title = 'New Service Request!';
  const body = `"${requestTitle}" in ${categoryName} - Budget: ₹${budgetMin}-₹${budgetMax}`;
  const data = {
    type: 'new_opportunity',
    requestId,
    screen: 'requests/detail',
  };

  // Collect all push tokens
  const allTokens = matchedProviders.flatMap((p) => p.pushTokens);

  // Send push notifications
  if (allTokens.length > 0) {
    await sendPushNotifications(allTokens, title, body, data, 'new_opportunity');
  }

  // Save in-app notification records for each provider
  const savePromises = matchedProviders.map((provider) =>
    saveNotificationRecord(provider.userId, 'new_opportunity', title, body, data)
  );

  await Promise.allSettled(savePromises);

  return { notifiedCount: matchedProviders.length };
};

/**
 * Split array into chunks
 */
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}
