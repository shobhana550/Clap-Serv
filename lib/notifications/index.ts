/**
 * Notification Service - Main entry point
 * Orchestrates the full notification flow:
 * 1. Find matching providers (by category + distance)
 * 2. Send push notifications
 * 3. Save in-app notification records
 */

export { registerForPushNotifications, removePushToken } from './pushTokenService';
export { findMatchingProviders } from './providerMatcher';
export { sendPushNotifications, notifyProvidersOfNewRequest, saveNotificationRecord } from './sendNotification';

import { findMatchingProviders } from './providerMatcher';
import { notifyProvidersOfNewRequest } from './sendNotification';
import { supabase } from '@/lib/supabase';

/**
 * Main function: Notify relevant providers when a new service request is created.
 *
 * Flow:
 * 1. Look up the request details (category, location, budget)
 * 2. Find providers matching the category who are within distance range
 * 3. Send push notifications + save in-app notifications
 *
 * @param requestId - The ID of the newly created service request
 * @param buyerId - The ID of the buyer who created the request
 * @returns Number of providers notified
 */
export const notifyMatchingProviders = async (
  requestId: string,
  categoryId: string,
  requestTitle: string,
  requestLocation: any | null,
  buyerId: string,
  budgetMin: number,
  budgetMax: number
): Promise<{ notifiedCount: number }> => {
  try {
    // 1. Get category name
    const { data: category } = await supabase
      .from('service_categories')
      .select('name')
      .eq('id', categoryId)
      .single();

    const categoryName = category?.name || 'Service';

    // 2. Find matching providers based on category + distance
    const matchedProviders = await findMatchingProviders(
      requestId,
      categoryId,
      requestLocation,
      buyerId
    );

    console.log(`Found ${matchedProviders.length} matching providers for request "${requestTitle}"`);

    if (matchedProviders.length === 0) {
      console.log('No matching providers found for this request');
      return { notifiedCount: 0 };
    }

    // Log matched providers for debugging
    matchedProviders.forEach((p) => {
      const distStr = p.distance !== null ? `${p.distance}km away` : 'online';
      const tokenStr = p.pushTokens.length > 0 ? 'has push token' : 'no push token';
      console.log(`  - ${p.fullName}: ${distStr}, ${tokenStr}`);
    });

    // 3. Send notifications
    const result = await notifyProvidersOfNewRequest(
      matchedProviders,
      requestTitle,
      requestId,
      categoryName,
      budgetMin,
      budgetMax
    );

    console.log(`Notified ${result.notifiedCount} providers`);
    return result;
  } catch (error) {
    console.error('Error in notifyMatchingProviders:', error);
    return { notifiedCount: 0 };
  }
};
