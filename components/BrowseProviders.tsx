/**
 * BrowseProviders - Browse and filter verified service providers
 * Used by buyers to find providers by name, category/skill, rating, etc.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useCategoryLookup } from '@/lib/useCategoryLookup';

// Colors
const PRIMARY = '#E20010';
const DARK_GRAY = '#5F6267';
const MEDIUM_GRAY = '#B3B8C4';
const LIGHT_GRAY = '#C5C4CC';
const BACKGROUND = '#F7F8FA';
const GREEN = '#10B981';
const BORDER = '#E6E9EF';
const WHITE = '#FFFFFF';
const PINK_BG = '#FFF0F1';

// Badge color palette for skill tags
const BADGE_COLORS = [
  '#E20010', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#F97316', '#6366F1', '#14B8A6',
];

interface ProviderProfile {
  id: string;
  user_id: string;
  skills: string[];
  hourly_rate: number | null;
  bio: string | null;
  is_verified: boolean;
  rating: number;
  review_count: number;
  profile: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
    location: any;
  };
}

function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0][0].toUpperCase();
}

function getLocationCity(location: any): string {
  if (!location) return '';
  if (typeof location === 'string') return location;
  if (location.city) return location.city;
  if (location.address) return location.address;
  return '';
}

function renderStars(rating: number) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(<FontAwesome key={i} name="star" size={13} color="#F59E0B" />);
    } else if (i === fullStars && hasHalf) {
      stars.push(<FontAwesome key={i} name="star-half-full" size={13} color="#F59E0B" />);
    } else {
      stars.push(<FontAwesome key={i} name="star-o" size={13} color={MEDIUM_GRAY} />);
    }
  }
  return stars;
}

export default function BrowseProviders() {
  const router = useRouter();
  const { getCategoryById, categories: dbCategories, loading: categoriesLoading } = useCategoryLookup();

  const [providers, setProviders] = useState<ProviderProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);

  const fetchProviders = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('provider_profiles')
        .select(`
          *,
          profile:profiles!user_id(id, full_name, email, avatar_url, location)
        `)
        .order('rating', { ascending: false });

      if (error) {
        console.error('Error fetching providers:', error);
        setProviders([]);
      } else {
        setProviders((data as unknown as ProviderProfile[]) || []);
      }
    } catch (err) {
      console.error('Error in fetchProviders:', err);
      setProviders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  // Filtered providers
  const filteredProviders = providers.filter((provider) => {
    // Search filter by name
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = provider.profile?.full_name?.toLowerCase() || '';
      const bio = provider.bio?.toLowerCase() || '';
      if (!name.includes(q) && !bio.includes(q)) {
        return false;
      }
    }

    // Category filter by skills
    if (selectedCategory !== 'all') {
      const skills = provider.skills || [];
      if (!skills.includes(selectedCategory)) {
        return false;
      }
    }

    return true;
  });

  const selectedCategoryName =
    selectedCategory === 'all'
      ? 'Category'
      : getCategoryById(selectedCategory)?.name || 'Category';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Browse Providers</Text>
        <Text style={styles.headerSubtitle}>
          {loading
            ? 'Loading...'
            : `${filteredProviders.length} provider${filteredProviders.length !== 1 ? 's' : ''} available`}
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <FontAwesome name="search" size={15} color={LIGHT_GRAY} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search providers by name..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={LIGHT_GRAY}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <FontAwesome name="times-circle" size={16} color={MEDIUM_GRAY} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Filter */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.filterTab,
              selectedCategory === 'all' && styles.filterTabActive,
            ]}
            onPress={() => {
              setSelectedCategory('all');
              setShowCategoryFilter(false);
            }}
          >
            <Text
              style={[
                styles.filterTabText,
                selectedCategory === 'all' && styles.filterTabTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

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
              color={selectedCategory !== 'all' ? WHITE : MEDIUM_GRAY}
            />
            <Text
              style={[
                styles.filterTabText,
                selectedCategory !== 'all' && styles.filterTabTextActive,
                { marginLeft: 5 },
              ]}
            >
              {selectedCategoryName}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Category Dropdown */}
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
                  name={(cat as any).icon as any}
                  size={14}
                  color={selectedCategory === cat.id ? PRIMARY : MEDIUM_GRAY}
                />
                <Text
                  style={[
                    styles.categoryItemText,
                    selectedCategory === cat.id && styles.categoryItemTextSelected,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Provider List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color={PRIMARY} />
            <Text style={styles.emptyStateTitle}>Loading providers...</Text>
          </View>
        ) : filteredProviders.length > 0 ? (
          filteredProviders.map((provider) => {
            const fullName = provider.profile?.full_name || 'Unknown';
            const initials = getInitials(fullName);
            const city = getLocationCity(provider.profile?.location);
            const skills = provider.skills || [];

            return (
              <View key={provider.id} style={styles.providerCard}>
                <View style={styles.providerHeader}>
                  {/* Avatar */}
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initials}</Text>
                  </View>

                  {/* Name & Rating */}
                  <View style={styles.providerInfo}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.providerName} numberOfLines={1}>
                        {fullName}
                      </Text>
                      {provider.is_verified && (
                        <FontAwesome name="check-circle" size={14} color={GREEN} />
                      )}
                    </View>
                    <View style={styles.ratingRow}>
                      {renderStars(provider.rating || 0)}
                      <Text style={styles.ratingText}>
                        {(provider.rating || 0).toFixed(1)}
                      </Text>
                      <Text style={styles.reviewCount}>
                        ({provider.review_count || 0} review{(provider.review_count || 0) !== 1 ? 's' : ''})
                      </Text>
                    </View>
                    {city ? (
                      <View style={styles.locationRow}>
                        <FontAwesome name="map-marker" size={12} color={GREEN} />
                        <Text style={styles.locationText}>{city}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>

                {/* Bio */}
                {provider.bio ? (
                  <Text style={styles.bio} numberOfLines={2}>
                    {provider.bio}
                  </Text>
                ) : null}

                {/* Skills */}
                {skills.length > 0 && (
                  <View style={styles.skillsRow}>
                    {skills.map((skillId, index) => {
                      const cat = getCategoryById(skillId);
                      const color = BADGE_COLORS[index % BADGE_COLORS.length];
                      return (
                        <View
                          key={skillId}
                          style={[styles.skillBadge, { backgroundColor: color + '18' }]}
                        >
                          <Text style={[styles.skillBadgeText, { color }]}>
                            {cat?.name || 'Service'}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                )}

                {/* Hourly Rate + View Profile */}
                <View style={styles.cardFooter}>
                  {provider.hourly_rate ? (
                    <Text style={styles.hourlyRate}>
                      {'\u20B9'}{provider.hourly_rate}/hr
                    </Text>
                  ) : (
                    <View />
                  )}
                  <TouchableOpacity
                    style={styles.viewProfileButton}
                    onPress={() => router.push(`/profile/${provider.profile?.id}`)}
                  >
                    <Text style={styles.viewProfileText}>View Profile</Text>
                    <FontAwesome name="chevron-right" size={11} color={WHITE} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <FontAwesome name="users" size={44} color={LIGHT_GRAY} />
            <Text style={styles.emptyStateTitle}>No providers found</Text>
            <Text style={styles.emptyStateText}>
              Try adjusting your search or filters
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: DARK_GRAY,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: MEDIUM_GRAY,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: WHITE,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BACKGROUND,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 10,
    borderWidth: 1,
    borderColor: BORDER,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: DARK_GRAY,
    padding: 0,
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
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
    backgroundColor: PRIMARY,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: MEDIUM_GRAY,
  },
  filterTabTextActive: {
    color: WHITE,
  },
  categoryDropdown: {
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
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
    borderBottomColor: BACKGROUND,
  },
  categoryItemSelected: {
    backgroundColor: PINK_BG,
  },
  categoryItemText: {
    flex: 1,
    fontSize: 14,
    color: DARK_GRAY,
  },
  categoryItemTextSelected: {
    color: PRIMARY,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  providerCard: {
    backgroundColor: WHITE,
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER,
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
  providerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: WHITE,
    fontSize: 18,
    fontWeight: '700',
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '700',
    color: DARK_GRAY,
    marginBottom: 3,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: DARK_GRAY,
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: MEDIUM_GRAY,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  locationText: {
    fontSize: 12,
    color: GREEN,
    fontWeight: '500',
  },
  bio: {
    fontSize: 13,
    color: DARK_GRAY,
    lineHeight: 18,
    marginTop: 10,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  skillBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  skillBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: BACKGROUND,
  },
  hourlyRate: {
    fontSize: 15,
    fontWeight: '700',
    color: DARK_GRAY,
  },
  viewProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: PRIMARY,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  viewProfileText: {
    fontSize: 13,
    fontWeight: '600',
    color: WHITE,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 56,
  },
  emptyStateTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: DARK_GRAY,
    marginTop: 14,
    marginBottom: 6,
  },
  emptyStateText: {
    fontSize: 13,
    color: LIGHT_GRAY,
    textAlign: 'center',
  },
});
