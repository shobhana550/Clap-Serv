/**
 * Profile Screen for Clap-Serv
 * Shows user profile and settings
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useUserStore } from '@/store/userStore';
import { useRoleStore } from '@/store/roleStore';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { showAlert } from '@/utils/alert';
import { useCategoryLookup } from '@/lib/useCategoryLookup';

export default function ProfileScreen() {
  const { signOut } = useAuthStore();
  const { profile, providerProfile, clearProfile } = useUserStore();
  const { userRole } = useRoleStore();
  const { getCategoryById } = useCategoryLookup();

  const handleSignOut = async () => {
    showAlert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            console.log('Signing out...');
            await signOut();
            clearProfile();
            console.log('Navigating to login...');
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeText = () => {
    if (userRole === 'both') return 'Buyer & Provider';
    if (userRole === 'buyer') return 'Buyer';
    return 'Provider';
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header Card */}
      <View style={styles.card}>
        <View style={styles.profileHeader}>
          {/* Avatar */}
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {getInitials(profile?.full_name || 'User')}
            </Text>
          </View>

          <Text style={styles.name}>{profile?.full_name || 'User Name'}</Text>
          <Text style={styles.email}>{profile?.email || 'No email'}</Text>

          {/* Location */}
          {((profile as any)?.location?.city || (profile as any)?.location?.zip_code) && (
            <View style={styles.locationRow}>
              <FontAwesome name="map-marker" size={13} color="#B3B8C4" />
              <Text style={styles.locationText}>
                {(profile as any).location.city
                  ? `${(profile as any).location.city}${(profile as any).location.state ? `, ${(profile as any).location.state}` : ''}`
                  : ''}
                {(profile as any).location.zip_code
                  ? `${(profile as any).location.city ? ' - ' : ''}${(profile as any).location.zip_code}`
                  : ''}
              </Text>
            </View>
          )}

          {/* Role Badge */}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{getRoleBadgeText()}</Text>
          </View>
        </View>
      </View>

      {/* Provider Info (if applicable) */}
      {(userRole === 'provider' || userRole === 'both') && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Provider Details</Text>

          <View style={styles.infoRow}>
            <FontAwesome name="star" size={18} color="#F59E0B" />
            <Text style={styles.infoText}>
              Rating: {providerProfile?.rating?.toFixed(1) || '0.0'} (
              {providerProfile?.total_reviews || 0} reviews)
            </Text>
          </View>

          <View style={styles.infoRow}>
            <FontAwesome name="dollar" size={18} color="#10B981" />
            <Text style={styles.infoText}>
              Hourly Rate: ${providerProfile?.hourly_rate || 'Not set'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <FontAwesome name="check-circle" size={18} color="#E20010" />
            <Text style={styles.infoText}>
              Skills: {providerProfile?.skills?.length || 0}
            </Text>
          </View>

          {/* Skills badges */}
          {providerProfile?.skills && providerProfile.skills.length > 0 && (
            <View style={styles.skillsContainer}>
              {providerProfile.skills.map((skillId: string) => {
                const cat = getCategoryById(skillId);
                return (
                  <View key={skillId} style={styles.skillBadge}>
                    {cat && (
                      <FontAwesome name={cat.icon as any} size={11} color="#E20010" />
                    )}
                    <Text style={styles.skillBadgeText}>
                      {cat?.name || skillId}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      )}

      {/* Profile Actions */}
      <View style={styles.actionsContainer}>
        {/* Edit Profile */}
        <TouchableOpacity style={styles.actionCard} onPress={handleEditProfile}>
          <View style={styles.actionRow}>
            <View style={styles.actionLeft}>
              <View style={[styles.iconCircle, { backgroundColor: '#FFF0F1' }]}>
                <FontAwesome name="user" size={16} color="#E20010" />
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Edit Profile</Text>
                <Text style={styles.actionSubtitle}>
                  Update your personal information
                </Text>
              </View>
            </View>
            <FontAwesome name="chevron-right" size={18} color="#C5C4CC" />
          </View>
        </TouchableOpacity>

        {/* Provider Gigs & Portfolio */}
        {(userRole === 'provider' || userRole === 'both') && (
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/profile/provider-gigs')}
          >
            <View style={styles.actionRow}>
              <View style={styles.actionLeft}>
                <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
                  <FontAwesome name="briefcase" size={16} color="#F59E0B" />
                </View>
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionTitle}>My Gigs & Portfolio</Text>
                  <Text style={styles.actionSubtitle}>
                    Manage services, links, and bio
                  </Text>
                </View>
              </View>
              <FontAwesome name="chevron-right" size={18} color="#C5C4CC" />
            </View>
          </TouchableOpacity>
        )}

        {/* Settings */}
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/settings')}
        >
          <View style={styles.actionRow}>
            <View style={styles.actionLeft}>
              <View style={[styles.iconCircle, { backgroundColor: '#E6E9EF' }]}>
                <FontAwesome name="cog" size={16} color="#5F6267" />
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Settings</Text>
                <Text style={styles.actionSubtitle}>
                  App preferences and notifications
                </Text>
              </View>
            </View>
            <FontAwesome name="chevron-right" size={18} color="#C5C4CC" />
          </View>
        </TouchableOpacity>

        {/* Help & Support */}
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() =>
            showAlert('Help & Support', 'Help screen coming soon!')
          }
        >
          <View style={styles.actionRow}>
            <View style={styles.actionLeft}>
              <View style={[styles.iconCircle, { backgroundColor: '#D1FAE5' }]}>
                <FontAwesome name="question-circle" size={16} color="#10B981" />
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Help & Support</Text>
                <Text style={styles.actionSubtitle}>FAQs and contact support</Text>
              </View>
            </View>
            <FontAwesome name="chevron-right" size={18} color="#C5C4CC" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Sign Out Button */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <FontAwesome name="sign-out" size={16} color="#FFFFFF" />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      {/* App Version */}
      <Text style={styles.version}>Clap-Serv v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
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
  profileHeader: {
    alignItems: 'center',
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#E20010',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#5F6267',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#B3B8C4',
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 12,
  },
  locationText: {
    fontSize: 13,
    color: '#B3B8C4',
  },
  badge: {
    backgroundColor: '#FFF0F1',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FFC7CB',
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E20010',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#5F6267',
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#5F6267',
  },
  actionsContainer: {
    marginBottom: 16,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E6E9EF',
    ...Platform.select({
      web: {
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 1,
      },
    }),
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#5F6267',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#B3B8C4',
  },
  signOutButton: {
    backgroundColor: '#E20010',
    borderRadius: 8,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 6px rgba(226, 0, 16, 0.25)',
      },
      default: {
        shadowColor: '#E20010',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 3,
      },
    }),
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  skillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFF0F1',
    borderWidth: 1,
    borderColor: '#FFC7CB',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  skillBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E20010',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: '#C5C4CC',
    marginTop: 8,
  },
});
