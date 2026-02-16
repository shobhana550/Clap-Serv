/**
 * Admin Requests Management Screen
 */

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
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { getRequests } from '@/lib/api/admin';
import { showAlert } from '@/utils/alert';

const Colors = {
  primary: '#E20010',
  darkGray: '#5F6267',
  mediumGray: '#B3B8C4',
  background: '#F7F8FA',
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  open: { bg: '#D1FAE5', text: '#10B981' },
  in_progress: { bg: '#FEF3C7', text: '#F59E0B' },
  completed: { bg: '#DBEAFE', text: '#3B82F6' },
  cancelled: { bg: '#FEE2E2', text: '#EF4444' },
};

export default function AdminRequestsScreen() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async (search?: string) => {
    setLoading(true);
    try {
      const { data, error } = await getRequests(search || undefined);
      if (error) {
        showAlert('Error', 'Failed to fetch requests');
        setRequests([]);
      } else {
        setRequests(data || []);
      }
    } catch (err) {
      showAlert('Error', 'An error occurred');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    fetchData(text);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatBudget = (min?: number, max?: number) => {
    if (!min && !max) return 'Not set';
    if (min && max) return `\u20B9${min.toLocaleString('en-IN')} - \u20B9${max.toLocaleString('en-IN')}`;
    if (min) return `From \u20B9${min.toLocaleString('en-IN')}`;
    return `Up to \u20B9${(max as number).toLocaleString('en-IN')}`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Service Requests</Text>
        <Text style={styles.headerSubtitle}>{requests.length} total</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <FontAwesome name="search" size={16} color={Colors.mediumGray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search requests by title..."
          placeholderTextColor={Colors.mediumGray}
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <FontAwesome name="times-circle" size={16} color={Colors.mediumGray} />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading requests...</Text>
        </View>
      ) : requests.length === 0 ? (
        <View style={styles.centerContainer}>
          <FontAwesome name="list" size={48} color={Colors.mediumGray} />
          <Text style={styles.emptyText}>No requests found</Text>
        </View>
      ) : (
        <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
          {requests.map((req) => {
            const statusStyle = STATUS_COLORS[req.status] || STATUS_COLORS.open;
            return (
              <View key={req.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle} numberOfLines={1}>{req.title}</Text>
                    <Text style={styles.cardMeta}>
                      <FontAwesome name="user" size={11} color={Colors.mediumGray} />
                      {'  '}{req.buyer?.full_name || 'Unknown'}
                    </Text>
                    {req.category && (
                      <Text style={styles.cardMeta}>
                        <FontAwesome name={(req.category.icon || 'tag') as any} size={11} color={Colors.mediumGray} />
                        {'  '}{req.category.name}
                      </Text>
                    )}
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                    <Text style={[styles.statusText, { color: statusStyle.text }]}>
                      {req.status?.replace('_', ' ')}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardBottom}>
                  <Text style={styles.budgetText}>
                    {formatBudget(req.budget_min, req.budget_max)}
                  </Text>
                  <Text style={styles.dateText}>{formatDate(req.created_at)}</Text>
                </View>
              </View>
            );
          })}
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
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E6E9EF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.darkGray,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.mediumGray,
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E6E9EF',
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
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E6E9EF',
    ...Platform.select({
      web: { boxShadow: '0 1px 3px rgba(0,0,0,0.04)' },
      default: { elevation: 1 },
    }),
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cardInfo: {
    flex: 1,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.darkGray,
    marginBottom: 6,
  },
  cardMeta: {
    fontSize: 12,
    color: Colors.mediumGray,
    marginBottom: 3,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F1F3',
    paddingTop: 10,
  },
  budgetText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.darkGray,
  },
  dateText: {
    fontSize: 12,
    color: Colors.mediumGray,
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
