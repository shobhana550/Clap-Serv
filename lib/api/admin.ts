/**
 * Admin API functions for Clap-Serv
 */

import { supabase } from '@/lib/supabase';

// ===== User Management =====

export const getUsers = async (search?: string) => {
  let query = supabase
    .from('profiles')
    .select('*, provider_profiles(*)')
    .order('created_at', { ascending: false });

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data, error } = await query;
  return { data, error };
};

export const toggleBlockUser = async (userId: string, blocked: boolean) => {
  const { error } = await supabase
    .from('profiles')
    .update({ is_blocked: blocked })
    .eq('id', userId);
  return { error };
};

export const toggleVerifyProvider = async (userId: string, verified: boolean) => {
  const { error } = await supabase
    .from('provider_profiles')
    .update({ is_verified: verified })
    .eq('user_id', userId);
  return { error };
};

// ===== Region Management =====

export const getRegions = async () => {
  const { data, error } = await supabase
    .from('service_regions')
    .select('*')
    .order('name');
  return { data, error };
};

// Auto-create a region if one doesn't exist for the given city
export const autoCreateRegion = async (city: string, state?: string, lat?: number, lng?: number) => {
  // Check if region already exists for this city (case-insensitive)
  const { data: existing } = await supabase
    .from('service_regions')
    .select('id')
    .ilike('city', city)
    .limit(1);

  if (existing && existing.length > 0) {
    return { data: existing[0], error: null, created: false };
  }

  // Create new region with is_active = false
  const regionName = state ? `${city}, ${state}` : city;
  const { data, error } = await supabase
    .from('service_regions')
    .insert({
      name: regionName,
      city,
      state: state || null,
      lat: lat || null,
      lng: lng || null,
      radius_km: 30,
      is_active: false,
    })
    .select()
    .single();

  return { data, error, created: true };
};

export const createRegion = async (region: {
  name: string;
  city: string;
  state?: string;
  country?: string;
  lat?: number;
  lng?: number;
  radius_km?: number;
}) => {
  const { data, error } = await supabase
    .from('service_regions')
    .insert(region)
    .select()
    .single();
  return { data, error };
};

export const updateRegion = async (id: string, updates: any) => {
  const { error } = await supabase
    .from('service_regions')
    .update(updates)
    .eq('id', id);
  return { error };
};

export const deleteRegion = async (id: string) => {
  const { error } = await supabase
    .from('service_regions')
    .delete()
    .eq('id', id);
  return { error };
};

// ===== Region Categories =====

export const getRegionCategories = async (regionId: string) => {
  const { data, error } = await supabase
    .from('region_categories')
    .select('*, category:service_categories(*)')
    .eq('region_id', regionId);
  return { data, error };
};

export const setRegionCategories = async (regionId: string, categoryIds: string[]) => {
  // Delete existing
  await supabase
    .from('region_categories')
    .delete()
    .eq('region_id', regionId);

  // Insert new
  if (categoryIds.length > 0) {
    const rows = categoryIds.map((catId) => ({
      region_id: regionId,
      category_id: catId,
    }));
    const { error } = await supabase
      .from('region_categories')
      .insert(rows);
    return { error };
  }

  return { error: null };
};

// ===== Stats =====

export const getAdminStats = async () => {
  const [users, providers, requests, projects] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('provider_profiles').select('user_id', { count: 'exact', head: true }),
    supabase.from('service_requests').select('id', { count: 'exact', head: true }),
    supabase.from('projects').select('id', { count: 'exact', head: true }),
  ]);

  return {
    totalUsers: users.count || 0,
    totalProviders: providers.count || 0,
    totalRequests: requests.count || 0,
    totalProjects: projects.count || 0,
  };
};

// ===== Requests Management =====

export const getRequests = async (search?: string) => {
  let query = supabase
    .from('service_requests')
    .select('*, buyer:profiles!buyer_id(full_name, email), category:service_categories!category_id(name, icon)')
    .order('created_at', { ascending: false });

  if (search) {
    query = query.ilike('title', `%${search}%`);
  }

  const { data, error } = await query;
  return { data, error };
};

// ===== Projects Management =====

export const getProjects = async () => {
  const { data, error } = await supabase
    .from('projects')
    .select('*, buyer:profiles!buyer_id(full_name, email), provider:profiles!provider_id(full_name, email), request:service_requests!request_id(title)')
    .order('created_at', { ascending: false });

  return { data, error };
};

// ===== Category Management =====

export const createCategory = async (category: {
  name: string;
  description: string;
  icon: string;
  max_distance_km: number | null;
}) => {
  const { data, error } = await supabase
    .from('service_categories')
    .insert(category)
    .select()
    .single();
  return { data, error };
};

export const getCategories = async () => {
  const { data, error } = await supabase
    .from('service_categories')
    .select('*')
    .order('name');
  return { data, error };
};

export const updateCategory = async (id: string, updates: any) => {
  const { error } = await supabase
    .from('service_categories')
    .update(updates)
    .eq('id', id);
  return { error };
};
