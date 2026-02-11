/**
 * Browse Screen for Clap-Serv
 * Shows opportunities for providers with distance-based filtering
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRoleStore } from '@/store/roleStore';
import { useUserStore } from '@/store/userStore';
import { useAuthStore } from '@/store/authStore';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { RequestCard } from '@/components/cards/RequestCard';
import { supabase } from '@/lib/supabase';
import { useCategoryLookup } from '@/lib/useCategoryLookup';
import { getCurrentLocation, calculateDistance, formatLocationString } from '@/lib/utils/location';
import { Location } from '@/types';
import BrowseProviders from '@/components/BrowseProviders';
import { router } from 'expo-router';

export default function BrowseScreen() {
  const { activeRole } = useRoleStore();
  const isBuyer = activeRole === 'buyer';
  const { user } = useAuthStore();
  const { providerProfile } = useUserStore();
  const { getCategoryById, categories: dbCategories } = useCategoryLookup();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'open' | 'in_progress'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  // Fetch user location
  const fetchLocation = useCallback(async () => {
    setLocationLoading(true);
    const loc = await getCurrentLocation();
    setUserLocation(loc);
    setLocationLoading(false);
  }, []);

  // Fetch service requests from Supabase
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('service_requests')
        .select(`
          *,
          buyer:profiles!buyer_id(id, full_name, avatar_url),
          category:service_categories!category_id(id, name, icon, max_distance_km),
          proposals(id)
        `)
        .order('created_at', { ascending: false });

      // Status filter
      if (selectedFilter !== 'all') {
        query = query.eq('status', selectedFilter);
      } else {
        query = query.in('status', ['open', 'in_progress']);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching requests:', error);
        setRequests([]);
        setLoading(false);
        return;
      }

      // Transform data to match RequestCard format
      let transformed = (data || []).map((req: any) => {
        const locationStr = req.location
          ? formatLocationString(req.location)
          : 'Remote';

        // Calculate distance if possible
        let distance: number | undefined;
        if (userLocation?.lat && userLocation?.lng && req.location?.lat && req.location?.lng) {
          distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            req.location.lat,
            req.location.lng
          );
        }

        return {
          id: req.id,
          title: req.title,
          description: req.description,
          category_id: req.category_id || '',
          budget_min: req.budget_min || 0,
          budget_max: req.budget_max || 0,
          location: locationStr,
          created_at: req.created_at,
          status: req.status,
          deadline: req.deadline,
          timeline: req.timeline || '',
          buyer: {
            id: req.buyer?.id || '',
            name: req.buyer?.full_name || 'Anonymous',
            rating: 0,
            reviewCount: 0,
          },
          proposal_count: req.proposals?.length || 0,
          _distance: distance,
          _maxDistanceKm: req.category?.max_distance_km,
        };
      });

      // Filter by category
      if (selectedCategory !== 'all') {
        transformed = transformed.filter((req: any) => req.category_id === selectedCategory);
      }

      // Distance filtering for physical services
      if (userLocation?.lat && userLocation?.lng) {
        transformed = transformed.filter((req: any) => {
          // Online services (null max distance) — show all
          if (req._maxDistanceKm === null || req._maxDistanceKm === undefined) return true;

          // Physical services — filter by distance if we have location data
          if (req._distance !== undefined) {
            return req._distance <= req._maxDistanceKm;
          }

          // No location data on request — show it anyway
          return true;
        });
      }

      // Filter by provider's skills
      if (providerProfile?.skills && providerProfile.skills.length > 0) {
        transformed = transformed.filter((req: any) =>
          providerProfile.skills.includes(req.category_id)
        );
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        transformed = transformed.filter(
          (req: any) =>
            req.title.toLowerCase().includes(q) ||
            req.description.toLowerCase().includes(q) ||
            (typeof req.location === 'string' && req.location.toLowerCase().includes(q))
        );
      }

      setRequests(transformed);
    } catch (err) {
      console.error('Error in fetchRequests:', err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [selectedFilter, selectedCategory, searchQuery, userLocation, providerProfile]);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  useEffect(() => {
    if (!isBuyer) {
      fetchRequests();
    }
  }, [fetchRequests, isBuyer]);

  // For buyers, show browse providers page
  if (isBuyer) {
    return <BrowseProviders />;
  }

  // If provider has no skills set, show a helpful message
  if (!providerProfile?.skills || providerProfile.skills.length === 0) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.card}>
            <View style={styles.emptyStateContent}>
              <View style={styles.iconCircle}>
                <FontAwesome name="wrench" size={32} color="#E20010" />
              </View>
              <Text style={styles.title}>Set Up Your Skills</Text>
              <Text style={styles.subtitle}>
                Set up your skills in your profile to see matching opportunities
              </Text>
              <TouchableOpacity
                style={styles.setupButton}
                onPress={() => router.push('/profile/edit')}
              >
                <FontAwesome name="pencil" size={14} color="#FFFFFF" />
                <Text style={styles.setupButtonText}>Go to Profile Settings</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }

  // For providers, show service requests with filters
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Browse Opportunities</Text>
        <Text style={styles.headerSubtitle}>
          {loading ? 'Loading...' : `${requests.length} service requests available`}
        </Text>
        {userLocation && (
          <View style={styles.locationBanner}>
            <FontAwesome name="map-marker" size={12} color="#10B981" />
            <Text style={styles.locationBannerText}>
              {formatLocationString(userLocation)}
            </Text>
          </View>
        )}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <FontAwesome name="search" size={15} color="#C5C4CC" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by title, description, or location..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#C5C4CC"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <FontAwesome name="times-circle" size={16} color="#B3B8C4" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Row */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {/* Status filters */}
          {(['all', 'open', 'in_progress'] as const).map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterTab,
                selectedFilter === filter && styles.filterTabActive,
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  selectedFilter === filter && styles.filterTabTextActive,
                ]}
              >
                {filter === 'all' ? 'All' : filter === 'open' ? 'Open' : 'In Progress'}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Category filter button */}
          <TouchableOpacity
            style={[
              styles.filterTab,
              selectedCategory !== 'all' && styles.filterTabActive,
            ]}
            onPress={() => setShowCategoryFilter(!showCategoryFilter)}
          >
            <FontAwesome
              name="filter"
              size={12}
              color={selectedCategory !== 'all' ? '#FFFFFF' : '#B3B8C4'}
            />
            <Text
              style={[
                styles.filterTabText,
                selectedCategory !== 'all' && styles.filterTabTextActive,
                { marginLeft: 5 },
              ]}
            >
              {selectedCategory === 'all'
                ? 'Category'
                : getCategoryById(selectedCategory)?.name || 'Category'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Category Filter Dropdown */}
      {showCategoryFilter && (
        <View style={styles.categoryDropdown}>
          <ScrollView style={styles.categoryList} nestedScrollEnabled>
            <TouchableOpacity
              style={[
                styles.categoryItem,
                selectedCategory === 'all' && styles.categoryItemSelected,
              ]}
              onPress={() => {
                setSelectedCategory('all');
                setShowCategoryFilter(false);
              }}
            >
              <Text
                style={[
                  styles.categoryItemText,
                  selectedCategory === 'all' && styles.categoryItemTextSelected,
                ]}
              >
                All Categories
              </Text>
            </TouchableOpacity>
            {dbCategories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryItem,
                  selectedCategory === cat.id && styles.categoryItemSelected,
                ]}
                onPress={() => {
                  setSelectedCategory(cat.id);
                  setShowCategoryFilter(false);
                }}
              >
                <FontAwesome
                  name={cat.icon as any}
                  size={14}
                  color={selectedCategory === cat.id ? '#E20010' : '#B3B8C4'}
                />
                <Text
                  style={[
                    styles.categoryItemText,
                    selectedCategory === cat.id && styles.categoryItemTextSelected,
                  ]}
                >
                  {cat.name}
                </Text>
                {cat.max_distance_km !== null && (
                  <Text style={styles.distanceBadge}>
                    {cat.max_distance_km}km
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Request List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color="#E20010" />
            <Text style={styles.emptyStateTitle}>Loading opportunities...</Text>
          </View>
        ) : requests.length > 0 ? (
          requests.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <FontAwesome name="inbox" size={44} color="#C5C4CC" />
            <Text style={styles.emptyStateTitle}>No requests found</Text>
            <Text style={styles.emptyStateText}>
              Try adjusting your search or filters
            </Text>
            {!userLocation && (
              <TouchableOpacity
                style={styles.locationButton}
                onPress={fetchLocation}
                disabled={locationLoading}
              >
                <FontAwesome name="map-marker" size={14} color="#FFFFFF" />
                <Text style={styles.locationButtonText}>
                  {locationLoading ? 'Getting location...' : 'Enable location for nearby results'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
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
  content: {
    padding: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E6E9EF',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#5F6267',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#B3B8C4',
  },
  locationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
  },
  locationBannerText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F8FA',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E6E9EF',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#5F6267',
    padding: 0,
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E6E9EF',
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 6,
    marginRight: 8,
    backgroundColor: '#E6E9EF',
  },
  filterTabActive: {
    backgroundColor: '#E20010',
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#B3B8C4',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  categoryDropdown: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E6E9EF',
    maxHeight: 300,
  },
  categoryList: {
    maxHeight: 300,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#F7F8FA',
  },
  categoryItemSelected: {
    backgroundColor: '#FFF0F1',
  },
  categoryItemText: {
    flex: 1,
    fontSize: 14,
    color: '#5F6267',
  },
  categoryItemTextSelected: {
    color: '#E20010',
    fontWeight: '600',
  },
  distanceBadge: {
    fontSize: 11,
    color: '#B3B8C4',
    backgroundColor: '#F7F8FA',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  scrollView: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 56,
  },
  emptyStateTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#5F6267',
    marginTop: 14,
    marginBottom: 6,
  },
  emptyStateText: {
    fontSize: 13,
    color: '#C5C4CC',
    textAlign: 'center',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E20010',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  locationButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E6E9EF',
    ...Platform.select({
      web: {
        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
      },
    }),
  },
  emptyStateContent: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  iconCircle: {
    backgroundColor: '#FFF0F1',
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#5F6267',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#B3B8C4',
    textAlign: 'center',
  },
  setupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#E20010',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 20,
  },
  setupButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
