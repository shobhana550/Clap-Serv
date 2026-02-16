/**
 * Location utility functions for Clap-Serv
 * Handles both native (expo-location) and web (browser geolocation) platforms
 */

import { Platform } from 'react-native';
import { Location, DistanceResult } from '@/types';

// Only import expo-location on native platforms
let ExpoLocation: any = null;
if (Platform.OS !== 'web') {
  ExpoLocation = require('expo-location');
}

/**
 * Request location permissions
 */
export const requestLocationPermission = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'web') {
      // Browser geolocation API handles permissions via prompt
      return true;
    }
    const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return false;
  }
};

/**
 * Get current location (works on both web and native)
 */
export const getCurrentLocation = async (): Promise<Location | null> => {
  try {
    if (Platform.OS === 'web') {
      return await getWebLocation();
    }

    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      return null;
    }

    const location = await ExpoLocation.getCurrentPositionAsync({
      accuracy: ExpoLocation.Accuracy.Balanced,
    });

    // Reverse geocode to get address
    const addresses = await ExpoLocation.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });

    const address = addresses[0];
    return {
      lat: location.coords.latitude,
      lng: location.coords.longitude,
      city: address?.city || undefined,
      state: address?.region || undefined,
      country: address?.country || undefined,
      postalCode: address?.postalCode || undefined,
      address: address?.name || undefined,
    };
  } catch (error) {
    console.error('Error getting current location:', error);
    return null;
  }
};

/**
 * Get location using browser's geolocation API (web only)
 * Falls back to IP-based geolocation if browser API fails
 */
const getWebLocation = (): Promise<Location | null> => {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      console.log('Geolocation not supported in this browser');
      getIpBasedLocation().then(resolve);
      return;
    }

    // Geolocation requires HTTPS or localhost
    const isSecure = typeof window !== 'undefined' && (
      window.location.protocol === 'https:' ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1'
    );

    if (!isSecure) {
      console.log('Geolocation requires HTTPS. Using IP-based fallback.');
      getIpBasedLocation().then(resolve);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.error('Browser geolocation error:', error.code, error.message);
        getIpBasedLocation().then(resolve);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  });
};

/**
 * IP-based geolocation fallback for web
 */
const getIpBasedLocation = async (): Promise<Location | null> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const response = await fetch('https://ipapi.co/json/', { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) return null;
    const data = await response.json();
    if (data.latitude && data.longitude) {
      return {
        lat: data.latitude,
        lng: data.longitude,
        city: data.city || undefined,
        state: data.region || undefined,
        country: data.country_name || undefined,
        postalCode: data.postal || undefined,
      };
    }
    return null;
  } catch (error) {
    console.error('IP-based geolocation failed:', error);
    return null;
  }
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 Latitude of first point
 * @param lng1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lng2 Longitude of second point
 * @returns Distance in kilometers
 */
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal place
};

/**
 * Convert degrees to radians
 */
const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Check if location is within radius
 */
export const isWithinRadius = (
  userLat: number,
  userLng: number,
  targetLat: number,
  targetLng: number,
  radiusKm: number
): boolean => {
  const distance = calculateDistance(userLat, userLng, targetLat, targetLng);
  return distance <= radiusKm;
};

/**
 * Get distance result with formatting
 */
export const getDistanceResult = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
  unit: 'km' | 'mi' = 'km'
): DistanceResult => {
  const distanceKm = calculateDistance(lat1, lng1, lat2, lng2);
  const distance = unit === 'mi' ? distanceKm * 0.621371 : distanceKm;

  return {
    distance: Math.round(distance * 10) / 10,
    unit,
  };
};

/**
 * Geocode address to coordinates
 */
export const geocodeAddress = async (address: string): Promise<Location | null> => {
  try {
    if (Platform.OS === 'web') {
      // On web, geocoding isn't available without a third-party API
      console.log('Geocoding not available on web');
      return null;
    }
    const results = await ExpoLocation.geocodeAsync(address);
    if (results.length === 0) {
      return null;
    }

    const result = results[0];
    return {
      lat: result.latitude,
      lng: result.longitude,
      address,
    };
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
};

/**
 * Format location for display
 */
export const formatLocationString = (location: Location): string => {
  const parts = [];
  if (location.city) parts.push(location.city);
  if (location.state) parts.push(location.state);
  return parts.join(', ') || location.address || 'Unknown location';
};
