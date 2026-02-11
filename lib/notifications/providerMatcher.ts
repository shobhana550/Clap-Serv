/**
 * Provider Matcher Service
 * Finds providers that match a service request based on:
 * 1. Category skills match
 * 2. Distance/location proximity
 * 3. Active region check
 */

import { supabase } from '@/lib/supabase';
import { calculateDistance } from '@/lib/utils/location';
import { geocodeAddress } from '@/lib/utils/location';

interface MatchedProvider {
  userId: string;
  fullName: string;
  distance: number | null; // null for online services
  pushTokens: string[];
}

interface RequestLocation {
  lat?: number;
  lng?: number;
  city?: string;
  state?: string;
  zip_code?: string;
}

/**
 * Find providers matching a service request's category and within distance range
 */
export const findMatchingProviders = async (
  requestId: string,
  categoryId: string,
  requestLocation: RequestLocation | null,
  buyerId: string
): Promise<MatchedProvider[]> => {
  try {
    // 1. Get the category to know max_distance_km
    const { data: category, error: catError } = await supabase
      .from('service_categories')
      .select('id, name, max_distance_km')
      .eq('id', categoryId)
      .single();

    if (catError || !category) {
      console.error('Error fetching category:', catError);
      return [];
    }

    const maxDistanceKm = category.max_distance_km;

    // 2. Find all providers who have this category in their skills
    const { data: providers, error: provError } = await supabase
      .from('provider_profiles')
      .select(`
        user_id,
        skills,
        profiles!inner (
          id,
          full_name,
          location
        )
      `)
      .contains('skills', [categoryId]);

    if (provError || !providers) {
      console.error('Error fetching providers:', provError);
      return [];
    }

    // 3. Filter out the buyer themselves
    const candidateProviders = providers.filter((p: any) => p.user_id !== buyerId);

    if (candidateProviders.length === 0) {
      return [];
    }

    // 4. For online/unlimited services, all matching providers qualify
    if (maxDistanceKm === null) {
      return await getProviderTokens(
        candidateProviders.map((p: any) => ({
          userId: p.user_id,
          fullName: (p.profiles as any)?.full_name || 'Provider',
          distance: null,
        }))
      );
    }

    // 5. For distance-based services, filter by proximity
    // First, resolve the request location to coordinates
    let requestLat = requestLocation?.lat;
    let requestLng = requestLocation?.lng;

    // If no lat/lng but has zip code or city, try to geocode
    if ((!requestLat || !requestLng) && requestLocation) {
      const addressToGeocode = requestLocation.zip_code
        ? `${requestLocation.zip_code}, ${requestLocation.state || ''}, India`
        : requestLocation.city
        ? `${requestLocation.city}, ${requestLocation.state || ''}, India`
        : null;

      if (addressToGeocode) {
        const geocoded = await geocodeAddress(addressToGeocode);
        if (geocoded) {
          requestLat = geocoded.lat;
          requestLng = geocoded.lng;
        }
      }
    }

    if (!requestLat || !requestLng) {
      console.log('No request location coordinates available, sending to all matching providers');
      return await getProviderTokens(
        candidateProviders.map((p: any) => ({
          userId: p.user_id,
          fullName: (p.profiles as any)?.full_name || 'Provider',
          distance: null,
        }))
      );
    }

    // 6. Filter providers by distance
    const nearbyProviders: { userId: string; fullName: string; distance: number }[] = [];

    for (const provider of candidateProviders) {
      const providerLocation = (provider.profiles as any)?.location;
      if (!providerLocation) continue;

      let providerLat = providerLocation.lat;
      let providerLng = providerLocation.lng;

      // If provider has no lat/lng, try to geocode their city or zip
      if (!providerLat || !providerLng) {
        const provAddress = providerLocation.zip_code
          ? `${providerLocation.zip_code}, ${providerLocation.state || ''}, India`
          : providerLocation.city
          ? `${providerLocation.city}, ${providerLocation.state || ''}, India`
          : null;

        if (provAddress) {
          const geocoded = await geocodeAddress(provAddress);
          if (geocoded) {
            providerLat = geocoded.lat;
            providerLng = geocoded.lng;
          }
        }
      }

      if (!providerLat || !providerLng) continue;

      const distance = calculateDistance(requestLat, requestLng, providerLat, providerLng);

      if (distance <= maxDistanceKm) {
        nearbyProviders.push({
          userId: provider.user_id,
          fullName: (provider.profiles as any)?.full_name || 'Provider',
          distance,
        });
      }
    }

    // 7. Get push tokens for matched providers
    return await getProviderTokens(nearbyProviders);
  } catch (error) {
    console.error('Error in findMatchingProviders:', error);
    return [];
  }
};

/**
 * Get push tokens for a list of provider user IDs
 */
const getProviderTokens = async (
  providers: { userId: string; fullName: string; distance: number | null }[]
): Promise<MatchedProvider[]> => {
  if (providers.length === 0) return [];

  const userIds = providers.map((p) => p.userId);

  const { data: tokens, error } = await supabase
    .from('push_tokens')
    .select('user_id, token')
    .in('user_id', userIds);

  if (error) {
    console.error('Error fetching push tokens:', error);
  }

  const tokenMap = new Map<string, string[]>();
  (tokens || []).forEach((t: any) => {
    const existing = tokenMap.get(t.user_id) || [];
    existing.push(t.token);
    tokenMap.set(t.user_id, existing);
  });

  return providers.map((p) => ({
    ...p,
    pushTokens: tokenMap.get(p.userId) || [],
  }));
};
