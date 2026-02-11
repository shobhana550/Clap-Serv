/**
 * Category Cache - Fetches and caches categories from Supabase
 * Replaces the hardcoded SERVICE_CATEGORIES constant for lookups
 */

import { supabase } from '@/lib/supabase';

interface CachedCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  max_distance_km: number | null;
}

let cachedCategories: CachedCategory[] = [];
let lastFetchTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get all categories (fetches from DB if cache is stale)
 */
export const getCategories = async (): Promise<CachedCategory[]> => {
  const now = Date.now();
  if (cachedCategories.length > 0 && now - lastFetchTime < CACHE_TTL) {
    return cachedCategories;
  }

  const { data, error } = await supabase
    .from('service_categories')
    .select('id, name, description, icon, max_distance_km')
    .order('name');

  if (!error && data) {
    cachedCategories = data;
    lastFetchTime = now;
  }

  return cachedCategories;
};

/**
 * Get a single category by its UUID
 * Returns cached data if available, otherwise fetches
 */
export const getCategoryByDbId = async (
  id: string
): Promise<CachedCategory | undefined> => {
  const categories = await getCategories();
  return categories.find((c) => c.id === id);
};

/**
 * Synchronous version - uses whatever is in cache
 * Call getCategories() first to populate the cache
 */
export const getCategoryByIdSync = (id: string): CachedCategory | undefined => {
  return cachedCategories.find((c) => c.id === id);
};

/**
 * Pre-warm the cache (call on app init)
 */
export const warmCategoryCache = async (): Promise<void> => {
  await getCategories();
};

/**
 * Invalidate the cache (call after admin adds/edits a category)
 */
export const invalidateCategoryCache = (): void => {
  lastFetchTime = 0;
};
