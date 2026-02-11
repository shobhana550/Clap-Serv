/**
 * Push Token Service
 * Registers and manages Expo push notification tokens
 */

import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';

// Only import and configure notifications on native platforms
let Notifications: any = null;
let Device: any = null;

if (Platform.OS !== 'web') {
  Notifications = require('expo-notifications');
  Device = require('expo-device');

  // Configure how notifications appear when the app is in the foreground
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

/**
 * Register for push notifications and save token to Supabase
 */
export const registerForPushNotifications = async (userId: string): Promise<string | null> => {
  try {
    // Push notifications don't work on web or emulators without physical device
    if (Platform.OS === 'web') {
      console.log('Push notifications not supported on web');
      return null;
    }

    if (!Device.isDevice) {
      console.log('Push notifications require a physical device');
      return null;
    }

    // Check existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permission if not granted
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Push notification permission denied');
      return null;
    }

    // Get the Expo push token
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: undefined, // Uses the project ID from app.json
    });

    const pushToken = tokenData.data;
    console.log('Push token obtained:', pushToken);

    // Save token to Supabase
    await savePushToken(userId, pushToken);

    // Set up Android notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#E20010',
      });

      await Notifications.setNotificationChannelAsync('new_opportunity', {
        name: 'New Opportunities',
        description: 'Notifications for new service requests matching your skills',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#E20010',
      });
    }

    return pushToken;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return null;
  }
};

/**
 * Save push token to Supabase push_tokens table
 */
const savePushToken = async (userId: string, token: string) => {
  try {
    // Upsert: update if exists for this user+platform, insert if new
    const { error } = await supabase
      .from('push_tokens')
      .upsert(
        {
          user_id: userId,
          token,
          platform: Platform.OS,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,platform',
        }
      );

    if (error) {
      console.error('Error saving push token:', error);
    }
  } catch (error) {
    console.error('Error saving push token:', error);
  }
};

/**
 * Remove push token when user logs out
 */
export const removePushToken = async (userId: string) => {
  try {
    const { error } = await supabase
      .from('push_tokens')
      .delete()
      .eq('user_id', userId)
      .eq('platform', Platform.OS);

    if (error) {
      console.error('Error removing push token:', error);
    }
  } catch (error) {
    console.error('Error removing push token:', error);
  }
};
