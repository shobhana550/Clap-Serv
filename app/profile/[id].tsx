/**
 * Public Provider Profile Screen
 * Shows provider's full profile, skills, gigs, and past work to buyers.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { supabase } from '@/lib/supabase';
import { useCategoryLookup } from '@/lib/useCategoryLookup';

const PRIMARY = '#E20010';
const DARK_GRAY = '#5F6267';
const MEDIUM_GRAY = '#B3B8C4';
const LIGHT_GRAY = '#C5C4CC';
const BACKGROUND = '#F7F8FA';
const GREEN = '#10B981';
const BORDER = '#E6E9EF';
const WHITE = '#FFFFFF';
const PINK_BG = '#FFF0F1';

const BADGE_COLORS = [
  '#E20010', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#F97316', '#6366F1', '#14B8A6',
];

function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0][0].toUpperCase();
}

function renderStars(rating: number) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(<FontAwesome key={i} name="star" size={16} color="#F59E0B" />);
    } else if (i === fullStars && hasHalf) {
      stars.push(<FontAwesome key={i} name="star-half-full" size={16} color="#F59E0B" />);
    } else {
      stars.push(<FontAwesome key={i} name="star-o" size={16} color={MEDIUM_GRAY} />);
    }
  }
  return stars;
}

export default function PublicProviderProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getCategoryById } = useCategoryLookup();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [providerProfile, setProviderProfile] = useState<any>(null);
  const [completedJobs, setCompletedJobs] = useState(0);
  const [gigs, setGigs] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (profileError || !profileData) {
        setProfile(null);
        setLoading(false);
        return;
      }
      setProfile(profileData);

      // Fetch provider profile
      const { data: provData } = await supabase
        .from('provider_profiles')
        .select('*')
        .eq('user_id', profileData.user_id || id)
        .single();

      setProviderProfile(provData);

      // Fetch completed proposals count
      const { count } = await supabase
        .from('proposals')
        .select('*', { count: 'exact', head: true })
        .eq('provider_id', profileData.user_id || id)
        .eq('status', 'accepted');

      setCompletedJobs(count || 0);

      // Fetch gigs from provider_gigs table (if exists)
      const { data: gigsData } = await supabase
        .from('provider_gigs')
        .select('*')
        .eq('provider_id', profileData.user_id || id)
        .order('created_at', { ascending: false });

      setGigs(gigsData || []);
    } catch (err) {
      console.error('Error fetching provider profile:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <FontAwesome name="arrow-left" size={18} color={DARK_GRAY} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Provider Profile</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <FontAwesome name="arrow-left" size={18} color={DARK_GRAY} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Provider Profile</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centered}>
          <FontAwesome name="user-times" size={48} color={LIGHT_GRAY} />
          <Text style={styles.emptyTitle}>Profile Not Found</Text>
          <Text style={styles.emptyText}>This provider profile doesn't exist or has been removed.</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => router.back()}>
            <Text style={styles.primaryBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const fullName = profile.full_name || 'Unknown';
  const initials = getInitials(fullName);
  const rating = providerProfile?.rating || 0;
  const reviewCount = providerProfile?.total_reviews || providerProfile?.review_count || 0;
  const skills = providerProfile?.skills || [];
  const bio = providerProfile?.bio || '';
  const hourlyRate = providerProfile?.hourly_rate;
  const isVerified = providerProfile?.is_verified || false;
  const location = profile.location;
  const city = location?.city || location?.address || '';
  const memberSince = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : '';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <FontAwesome name="arrow-left" size={18} color={DARK_GRAY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Provider Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>{initials}</Text>
          </View>

          <View style={styles.nameRow}>
            <Text style={styles.profileName}>{fullName}</Text>
            {isVerified && (
              <FontAwesome name="check-circle" size={18} color={GREEN} />
            )}
          </View>

          {city ? (
            <View style={styles.locationRow}>
              <FontAwesome name="map-marker" size={14} color={GREEN} />
              <Text style={styles.locationText}>{city}</Text>
            </View>
          ) : null}

          {memberSince ? (
            <Text style={styles.memberSince}>Member since {memberSince}</Text>
          ) : null}

          {/* Rating */}
          <View style={styles.ratingSection}>
            <View style={styles.starsRow}>
              {renderStars(rating)}
            </View>
            <Text style={styles.ratingValue}>{rating.toFixed(1)}</Text>
            <Text style={styles.reviewCountText}>({reviewCount} review{reviewCount !== 1 ? 's' : ''})</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{completedJobs}</Text>
            <Text style={styles.statLabel}>Jobs Done</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{reviewCount}</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {hourlyRate ? `\u20B9${hourlyRate}` : 'N/A'}
            </Text>
            <Text style={styles.statLabel}>Hourly Rate</Text>
          </View>
        </View>

        {/* About / Bio */}
        {bio ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bioText}>{bio}</Text>
          </View>
        ) : null}

        {/* Skills */}
        {skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills & Services</Text>
            <View style={styles.skillsRow}>
              {skills.map((skillId: string, index: number) => {
                const cat = getCategoryById(skillId);
                const color = BADGE_COLORS[index % BADGE_COLORS.length];
                return (
                  <View key={skillId} style={[styles.skillBadge, { backgroundColor: color + '18' }]}>
                    <Text style={[styles.skillBadgeText, { color }]}>
                      {cat?.name || 'Service'}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Gigs / Portfolio */}
        {gigs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gigs & Services</Text>
            {gigs.map((gig: any) => (
              <View key={gig.id} style={styles.gigCard}>
                <Text style={styles.gigTitle}>{gig.title}</Text>
                {gig.description ? (
                  <Text style={styles.gigDescription} numberOfLines={3}>
                    {gig.description}
                  </Text>
                ) : null}
                <View style={styles.gigFooter}>
                  {gig.price ? (
                    <Text style={styles.gigPrice}>
                      {'\u20B9'}{Number(gig.price).toLocaleString('en-IN')}
                    </Text>
                  ) : null}
                  {gig.duration ? (
                    <View style={styles.gigDuration}>
                      <FontAwesome name="clock-o" size={12} color={MEDIUM_GRAY} />
                      <Text style={styles.gigDurationText}>{gig.duration}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Contact / Message CTA */}
        <TouchableOpacity
          style={styles.contactBtn}
          onPress={() => {
            // Navigate to messages with this provider
            router.push(`/messages/chat?userId=${profile.user_id || id}&name=${encodeURIComponent(fullName)}` as any);
          }}
        >
          <FontAwesome name="comment" size={16} color={WHITE} />
          <Text style={styles.contactBtnText}>Send Message</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: DARK_GRAY,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: MEDIUM_GRAY,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: DARK_GRAY,
    marginTop: 12,
  },
  emptyText: {
    fontSize: 13,
    color: MEDIUM_GRAY,
    textAlign: 'center',
    marginBottom: 16,
  },
  primaryBtn: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  primaryBtnText: {
    color: WHITE,
    fontSize: 14,
    fontWeight: '600',
  },

  // Profile Card
  profileCard: {
    backgroundColor: WHITE,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 12,
    ...Platform.select({
      web: { boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)' },
      default: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
    }),
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarLargeText: {
    color: WHITE,
    fontSize: 28,
    fontWeight: '700',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: DARK_GRAY,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: GREEN,
    fontWeight: '500',
  },
  memberSince: {
    fontSize: 12,
    color: LIGHT_GRAY,
    marginBottom: 12,
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 3,
  },
  ratingValue: {
    fontSize: 16,
    fontWeight: '700',
    color: DARK_GRAY,
  },
  reviewCountText: {
    fontSize: 13,
    color: MEDIUM_GRAY,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    backgroundColor: WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BORDER,
    ...Platform.select({
      web: { boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)' },
      default: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
    }),
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: PRIMARY,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: MEDIUM_GRAY,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: BORDER,
    marginVertical: 4,
  },

  // Sections
  section: {
    backgroundColor: WHITE,
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER,
    ...Platform.select({
      web: { boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)' },
      default: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
    }),
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: DARK_GRAY,
    marginBottom: 12,
  },
  bioText: {
    fontSize: 14,
    color: DARK_GRAY,
    lineHeight: 22,
  },

  // Skills
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  skillBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Gigs
  gigCard: {
    backgroundColor: BACKGROUND,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: BORDER,
  },
  gigTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: DARK_GRAY,
    marginBottom: 6,
  },
  gigDescription: {
    fontSize: 13,
    color: MEDIUM_GRAY,
    lineHeight: 19,
    marginBottom: 10,
  },
  gigFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gigPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: GREEN,
  },
  gigDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  gigDurationText: {
    fontSize: 12,
    color: MEDIUM_GRAY,
  },

  // Contact Button
  contactBtn: {
    flexDirection: 'row',
    backgroundColor: PRIMARY,
    borderRadius: 10,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
    ...Platform.select({
      web: { boxShadow: '0 4px 8px rgba(226, 0, 16, 0.25)' },
      default: { shadowColor: PRIMARY, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 3 },
    }),
  },
  contactBtnText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: '700',
  },
});
