import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Image,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { getUsers, toggleBlockUser } from '@/lib/api/admin';
import { showAlert } from '@/utils/alert';

const Colors = {
  primary: '#E20010',
  darkGray: '#5F6267',
  mediumGray: '#B3B8C4',
  background: '#F7F8FA',
};

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  is_blocked: boolean;
  created_at: string;
  provider_profiles?: Array<{
    is_verified: boolean;
    skills: string[];
    rating: number;
  }>;
}

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toggling, setToggling] = useState<string | null>(null);

  // Fetch users on mount and when search changes
  useEffect(() => {
    fetchUsers();
  }, [searchQuery]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await getUsers(searchQuery || undefined);
      if (error) {
        showAlert('Error', 'Failed to fetch users');
        setUsers([]);
      } else {
        setUsers(data || []);
      }
    } catch (err) {
      showAlert('Error', 'An error occurred while fetching users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async (userId: string, currentBlocked: boolean) => {
    const action = currentBlocked ? 'unblock' : 'block';
    showAlert(
      'Confirm',
      `Are you sure you want to ${action} this user?`,
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          onPress: async () => {
            setToggling(userId);
            try {
              const { error } = await toggleBlockUser(userId, !currentBlocked);
              if (error) {
                showAlert('Error', `Failed to ${action} user`);
              } else {
                showAlert('Success', `User ${action}ed successfully`);
                // Refetch users after toggling
                fetchUsers();
              }
            } catch (err) {
              showAlert('Error', `An error occurred while ${action}ing user`);
            } finally {
              setToggling(null);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const renderUserRow = (user: User) => {
    const initials = getInitials(user.full_name);
    const isVerified = user.provider_profiles?.[0]?.is_verified ?? false;
    const rating = user.provider_profiles?.[0]?.rating ?? 0;

    return (
      <View key={user.id} style={styles.userRow}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, user.is_blocked && styles.avatarBlocked]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
          <View style={styles.userHeader}>
            <Text style={styles.userName}>{user.full_name}</Text>
            {isVerified && (
              <FontAwesome name="check-circle" size={14} color={Colors.primary} />
            )}
          </View>
          <Text style={styles.userEmail}>{user.email}</Text>
          <View style={styles.userMeta}>
            <Text style={styles.userRole}>{user.role}</Text>
            {rating > 0 && (
              <Text style={styles.userRating}>
                <FontAwesome name="star" size={10} color={Colors.primary} /> {rating.toFixed(1)}
              </Text>
            )}
          </View>
        </View>

        {/* Block/Unblock Button */}
        <TouchableOpacity
          style={[
            styles.toggleButton,
            user.is_blocked && styles.toggleButtonActive,
          ]}
          onPress={() => handleToggleBlock(user.id, user.is_blocked)}
          disabled={toggling === user.id}
        >
          {toggling === user.id ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <FontAwesome
              name={user.is_blocked ? 'lock' : 'unlock'}
              size={16}
              color={user.is_blocked ? Colors.primary : Colors.mediumGray}
            />
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <FontAwesome name="search" size={16} color={Colors.mediumGray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users by name or email..."
          placeholderTextColor={Colors.mediumGray}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery !== '' && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <FontAwesome name="times-circle" size={16} color={Colors.mediumGray} />
          </TouchableOpacity>
        )}
      </View>

      {/* Users List */}
      {loading && users.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading users...</Text>
        </View>
      ) : users.length === 0 ? (
        <View style={styles.centerContainer}>
          <FontAwesome name="users" size={48} color={Colors.mediumGray} />
          <Text style={styles.emptyText}>No users found</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.listContainer}
          showsVerticalScrollIndicator={false}
        >
          {users.map((user) => renderUserRow(user))}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8EAED',
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: Colors.darkGray,
    backgroundColor: Colors.background,
    borderRadius: 8,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginVertical: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: Colors.darkGray,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarBlocked: {
    backgroundColor: Colors.mediumGray,
    opacity: 0.6,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  userInfo: {
    flex: 1,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.darkGray,
    marginRight: 6,
  },
  userEmail: {
    fontSize: 12,
    color: Colors.mediumGray,
    marginBottom: 4,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userRole: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#FFE8EA',
    borderRadius: 4,
  },
  userRating: {
    fontSize: 11,
    color: Colors.mediumGray,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#FFE8EA',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.mediumGray,
    marginTop: 12,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.mediumGray,
    marginTop: 12,
  },
});
