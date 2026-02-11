import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { getUsers, toggleVerifyProvider } from '@/lib/api/admin';
import { useCategoryLookup } from '@/lib/useCategoryLookup';
import { showAlert } from '@/utils/alert';

const Colors = {
  primary: '#E20010',
  darkGray: '#5F6267',
  mediumGray: '#B3B8C4',
  background: '#F7F8FA',
  green: '#10B981',
  white: '#FFFFFF',
};

export default function ProvidersScreen() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const { getCategoryById } = useCategoryLookup();

  const fetchProviders = async (search = '') => {
    try {
      setLoading(!refreshing);
      const { data, error } = await getUsers(search || undefined);

      if (error) {
        showAlert('Error', 'Failed to fetch providers');
        return;
      }

      // Filter users with role='provider' or role='both'
      const providersList = (data || []).filter(
        (user) => user.role === 'provider' || user.role === 'both'
      );

      setProviders(providersList);
    } catch (err) {
      showAlert('Error', 'An error occurred while fetching providers');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleSearch = (text) => {
    setSearchQuery(text);
    fetchProviders(text);
  };

  const handleToggleVerify = (provider) => {
    const providerProfile = provider.provider_profiles?.[0];
    if (!providerProfile) return;

    const newStatus = !providerProfile.is_verified;
    const action = newStatus ? 'verify' : 'unverify';

    showAlert(
      'Confirm Action',
      `Are you sure you want to ${action} ${provider.full_name}?`,
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              const { error } = await toggleVerifyProvider(provider.id, newStatus);
              if (error) {
                showAlert('Error', 'Failed to update provider status');
                return;
              }
              setRefreshing(true);
              await fetchProviders(searchQuery);
            } catch (err) {
              showAlert('Error', 'An error occurred while updating provider status');
            }
          },
        },
      ]
    );
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderProviderCard = (provider) => {
    const providerProfile = provider.provider_profiles?.[0];
    const hasProviderProfile = !!providerProfile;

    const skills = providerProfile?.skills || [];
    const skillNames = skills.map((skillId) => {
      const category = getCategoryById(skillId);
      return category?.name || skillId;
    });

    const isVerified = providerProfile?.is_verified || false;

    return (
      <View key={provider.id} style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(provider.full_name)}</Text>
            </View>
          </View>

          <View style={styles.providerInfo}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <Text style={styles.providerName}>{provider.full_name}</Text>
              {provider.role === 'both' && (
                <View style={[styles.badge, { backgroundColor: '#8B5CF6' }]}>
                  <Text style={styles.badgeText}>Buyer & Provider</Text>
                </View>
              )}
            </View>
            <Text style={styles.providerEmail}>{provider.email}</Text>

            {providerProfile?.rating != null && (
              <View style={styles.ratingContainer}>
                <FontAwesome name="star" size={14} color={Colors.primary} />
                <Text style={styles.ratingText}>
                  {providerProfile.rating.toFixed(1)} ({providerProfile.total_reviews || 0} reviews)
                </Text>
              </View>
            )}

            {!hasProviderProfile && (
              <Text style={{ fontSize: 12, color: '#F59E0B', marginTop: 4 }}>
                Provider profile not set up yet
              </Text>
            )}
          </View>

          <View style={styles.verifyBadge}>
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: isVerified ? Colors.green : Colors.mediumGray,
                },
              ]}
            >
              <Text style={styles.badgeText}>{isVerified ? 'Verified' : 'Unverified'}</Text>
            </View>
          </View>
        </View>

        {skillNames.length > 0 && (
          <View style={styles.skillsContainer}>
            {skillNames.map((skill, index) => (
              <View key={index} style={styles.skillBadge}>
                <Text style={styles.skillBadgeText}>{skill}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.cardFooter}>
          {hasProviderProfile ? (
            <TouchableOpacity
              style={[
                styles.button,
                {
                  backgroundColor: isVerified ? Colors.mediumGray : Colors.green,
                },
              ]}
              onPress={() => handleToggleVerify(provider)}
            >
              <Text style={styles.buttonText}>
                {isVerified ? 'Unverify' : 'Verify'}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={{ fontSize: 12, color: Colors.mediumGray, textAlign: 'center', paddingVertical: 4 }}>
              Verify available after provider completes their profile setup
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Provider Management</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <FontAwesome name="search" size={16} color={Colors.mediumGray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search providers..."
          placeholderTextColor={Colors.mediumGray}
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <FontAwesome name="times" size={16} color={Colors.mediumGray} />
          </TouchableOpacity>
        )}
      </View>

      {/* Loading State */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading providers...</Text>
        </View>
      ) : providers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FontAwesome name="users" size={48} color={Colors.mediumGray} />
          <Text style={styles.emptyText}>No providers found</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.listContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          {providers.map((provider) => renderProviderCard(provider))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    ...Platform.select({
      web: {
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: Colors.darkGray,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
      },
    }),
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.darkGray,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Platform.select({
      web: {
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
      },
      default: {
        shadowColor: Colors.darkGray,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      },
    }),
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 14,
    color: Colors.darkGray,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: Colors.darkGray,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.darkGray,
    marginBottom: 4,
  },
  providerEmail: {
    fontSize: 13,
    color: Colors.mediumGray,
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingText: {
    fontSize: 12,
    color: Colors.darkGray,
  },
  verifyBadge: {
    marginLeft: 12,
  },
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  skillBadge: {
    backgroundColor: '#FFF0F1',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FFC7CB',
  },
  skillBadgeText: {
    fontSize: 12,
    color: '#E20010',
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.mediumGray,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.mediumGray,
  },
});
