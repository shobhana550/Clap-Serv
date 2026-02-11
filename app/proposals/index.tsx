/**
 * My Proposals Screen (Provider)
 * Fetches proposals from Supabase for the authenticated provider.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

type FilterType = 'all' | 'pending' | 'accepted' | 'rejected';

interface Proposal {
  id: string;
  request_id: string;
  provider_id: string;
  price: number;
  timeline_estimate: string;
  cover_letter: string;
  status: string;
  created_at: string;
  request: {
    id: string;
    title: string;
    description: string;
    budget_min: number;
    budget_max: number;
    status: string;
    category_id: string;
    category: {
      id: string;
      name: string;
      icon: string;
    } | null;
  } | null;
}

export default function MyProposalsScreen() {
  const { user } = useAuthStore();
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProposals = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('proposals')
      .select(
        '*, request:service_requests!request_id(id, title, description, budget_min, budget_max, status, category_id, category:service_categories!category_id(id, name, icon))'
      )
      .eq('provider_id', user.id)
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return;
    }

    setProposals((data as unknown as Proposal[]) || []);
    setLoading(false);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchProposals();
    }, [fetchProposals])
  );

  // Filter proposals based on status
  const filteredProposals = proposals.filter((proposal) => {
    if (selectedFilter === 'all') return true;
    return proposal.status === selectedFilter;
  });

  // Count proposals by status
  const counts = {
    all: proposals.length,
    pending: proposals.filter((p) => p.status === 'pending').length,
    accepted: proposals.filter((p) => p.status === 'accepted').length,
    rejected: proposals.filter((p) => p.status === 'rejected').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#3B82F6';
      case 'accepted':
        return '#10B981';
      case 'rejected':
        return '#EF4444';
      default:
        return '#B3B8C4';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return 'clock-o';
      case 'accepted':
        return 'check-circle';
      case 'rejected':
        return 'times-circle';
      default:
        return 'question-circle';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={18} color="#5F6267" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Proposals</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.filterTab,
              selectedFilter === 'all' && styles.filterTabActive,
            ]}
            onPress={() => setSelectedFilter('all')}
          >
            <Text
              style={[
                styles.filterTabText,
                selectedFilter === 'all' && styles.filterTabTextActive,
              ]}
            >
              All ({counts.all})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterTab,
              selectedFilter === 'pending' && styles.filterTabActive,
            ]}
            onPress={() => setSelectedFilter('pending')}
          >
            <FontAwesome
              name="clock-o"
              size={13}
              color={selectedFilter === 'pending' ? '#FFFFFF' : '#B3B8C4'}
              style={styles.filterIcon}
            />
            <Text
              style={[
                styles.filterTabText,
                selectedFilter === 'pending' && styles.filterTabTextActive,
              ]}
            >
              Pending ({counts.pending})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterTab,
              selectedFilter === 'accepted' && styles.filterTabActive,
            ]}
            onPress={() => setSelectedFilter('accepted')}
          >
            <FontAwesome
              name="check-circle"
              size={13}
              color={selectedFilter === 'accepted' ? '#FFFFFF' : '#B3B8C4'}
              style={styles.filterIcon}
            />
            <Text
              style={[
                styles.filterTabText,
                selectedFilter === 'accepted' && styles.filterTabTextActive,
              ]}
            >
              Accepted ({counts.accepted})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterTab,
              selectedFilter === 'rejected' && styles.filterTabActive,
            ]}
            onPress={() => setSelectedFilter('rejected')}
          >
            <FontAwesome
              name="times-circle"
              size={13}
              color={selectedFilter === 'rejected' ? '#FFFFFF' : '#B3B8C4'}
              style={styles.filterIcon}
            />
            <Text
              style={[
                styles.filterTabText,
                selectedFilter === 'rejected' && styles.filterTabTextActive,
              ]}
            >
              Rejected ({counts.rejected})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Proposals List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color="#E20010" />
            <Text style={styles.loadingText}>Loading proposals...</Text>
          </View>
        ) : error ? (
          <View style={styles.emptyState}>
            <FontAwesome name="exclamation-triangle" size={56} color="#EF4444" />
            <Text style={styles.emptyTitle}>Something went wrong</Text>
            <Text style={styles.emptyText}>{error}</Text>
            <TouchableOpacity style={styles.browseButton} onPress={fetchProposals}>
              <FontAwesome name="refresh" size={14} color="#FFFFFF" />
              <Text style={styles.browseButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : filteredProposals.length > 0 ? (
          <>
            {filteredProposals.map((proposal) => {
              const statusColor = getStatusColor(proposal.status);
              const statusIcon = getStatusIcon(proposal.status);

              return (
                <TouchableOpacity
                  key={proposal.id}
                  style={styles.proposalCard}
                  onPress={() => router.push('/requests/' + proposal.request_id)}
                  activeOpacity={0.7}
                >
                  {/* Card Header: Title + Status */}
                  <View style={styles.cardHeader}>
                    <Text style={styles.requestTitle} numberOfLines={2}>
                      {proposal.request?.title || 'Untitled Request'}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: statusColor + '18' },
                      ]}
                    >
                      <FontAwesome
                        name={statusIcon}
                        size={11}
                        color={statusColor}
                        style={{ marginRight: 4 }}
                      />
                      <Text style={[styles.statusText, { color: statusColor }]}>
                        {proposal.status.charAt(0).toUpperCase() +
                          proposal.status.slice(1)}
                      </Text>
                    </View>
                  </View>

                  {/* Category Badge */}
                  {proposal.request?.category && (
                    <View style={styles.categoryBadge}>
                      {proposal.request.category.icon ? (
                        <Text style={styles.categoryIcon}>
                          {proposal.request.category.icon}
                        </Text>
                      ) : (
                        <FontAwesome
                          name="tag"
                          size={10}
                          color="#5F6267"
                          style={{ marginRight: 4 }}
                        />
                      )}
                      <Text style={styles.categoryText}>
                        {proposal.request.category.name}
                      </Text>
                    </View>
                  )}

                  {/* Details Row: Bid + Timeline */}
                  <View style={styles.detailsRow}>
                    <View style={styles.detailItem}>
                      <FontAwesome name="rupee" size={12} color="#E20010" />
                      <Text style={styles.detailLabel}>Your Bid</Text>
                      <Text style={styles.detailValue}>
                        {'\u20B9'}
                        {Number(proposal.price).toLocaleString('en-IN')}
                      </Text>
                    </View>
                    <View style={styles.detailDivider} />
                    <View style={styles.detailItem}>
                      <FontAwesome name="calendar-o" size={12} color="#5F6267" />
                      <Text style={styles.detailLabel}>Timeline</Text>
                      <Text style={styles.detailValue}>
                        {proposal.timeline_estimate || 'N/A'}
                      </Text>
                    </View>
                    <View style={styles.detailDivider} />
                    <View style={styles.detailItem}>
                      <FontAwesome name="clock-o" size={12} color="#B3B8C4" />
                      <Text style={styles.detailLabel}>Submitted</Text>
                      <Text style={styles.detailValue}>
                        {formatDate(proposal.created_at)}
                      </Text>
                    </View>
                  </View>

                  {/* Budget Range */}
                  {proposal.request && (
                    <View style={styles.budgetRow}>
                      <Text style={styles.budgetLabel}>Client Budget:</Text>
                      <Text style={styles.budgetValue}>
                        {'\u20B9'}
                        {Number(proposal.request.budget_min).toLocaleString('en-IN')} -{' '}
                        {'\u20B9'}
                        {Number(proposal.request.budget_max).toLocaleString('en-IN')}
                      </Text>
                    </View>
                  )}

                  {/* Accepted Banner */}
                  {proposal.status === 'accepted' && (
                    <View style={styles.acceptedBanner}>
                      <View style={styles.acceptedBannerHeader}>
                        <FontAwesome name="check-circle" size={16} color="#10B981" />
                        <Text style={styles.acceptedBannerTitle}>Accepted</Text>
                      </View>
                      <Text style={styles.acceptedBannerText}>
                        Check request details for contact info
                      </Text>
                      <TouchableOpacity
                        style={styles.viewRequestButton}
                        onPress={() =>
                          router.push('/requests/' + proposal.request_id)
                        }
                      >
                        <Text style={styles.viewRequestButtonText}>
                          View Request
                        </Text>
                        <FontAwesome
                          name="arrow-right"
                          size={12}
                          color="#FFFFFF"
                        />
                      </TouchableOpacity>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </>
        ) : (
          <View style={styles.emptyState}>
            <FontAwesome
              name={selectedFilter === 'all' ? 'file-text-o' : 'inbox'}
              size={56}
              color="#C5C4CC"
            />
            <Text style={styles.emptyTitle}>
              {selectedFilter === 'all'
                ? 'No Proposals Yet'
                : `No ${
                    selectedFilter.charAt(0).toUpperCase() +
                    selectedFilter.slice(1)
                  } Proposals`}
            </Text>
            <Text style={styles.emptyText}>
              {selectedFilter === 'all'
                ? 'Browse opportunities and submit proposals to get started'
                : `You don't have any ${selectedFilter} proposals at the moment`}
            </Text>
            {selectedFilter === 'all' && (
              <TouchableOpacity
                style={styles.browseButton}
                onPress={() => router.push('/(tabs)/browse')}
              >
                <FontAwesome name="search" size={14} color="#FFFFFF" />
                <Text style={styles.browseButtonText}>Browse Opportunities</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* Stats Summary */}
      {!loading && proposals.length > 0 && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{counts.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#10B981' }]}>
              {counts.accepted}
            </Text>
            <Text style={styles.statLabel}>Accepted</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#EF4444' }]}>
              {counts.rejected}
            </Text>
            <Text style={styles.statLabel}>Rejected</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E6E9EF',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#5F6267',
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E6E9EF',
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 6,
    marginRight: 8,
    backgroundColor: '#E6E9EF',
  },
  filterTabActive: {
    backgroundColor: '#E20010',
  },
  filterIcon: {
    marginRight: 5,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#B3B8C4',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 56,
  },
  loadingText: {
    fontSize: 14,
    color: '#B3B8C4',
    marginTop: 12,
  },
  proposalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E6E9EF',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 10,
  },
  requestTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#5F6267',
    lineHeight: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#F7F8FA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 12,
  },
  categoryIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#5F6267',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F8FA',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginBottom: 10,
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  detailLabel: {
    fontSize: 10,
    color: '#B3B8C4',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 12,
    color: '#5F6267',
    fontWeight: '700',
  },
  detailDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E6E9EF',
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  budgetLabel: {
    fontSize: 11,
    color: '#B3B8C4',
    fontWeight: '500',
  },
  budgetValue: {
    fontSize: 11,
    color: '#5F6267',
    fontWeight: '600',
  },
  acceptedBanner: {
    backgroundColor: '#10B98112',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#10B98130',
  },
  acceptedBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  acceptedBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10B981',
  },
  acceptedBannerText: {
    fontSize: 12,
    color: '#5F6267',
    marginBottom: 10,
  },
  viewRequestButton: {
    backgroundColor: '#10B981',
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
  },
  viewRequestButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 56,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#5F6267',
    marginTop: 14,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#B3B8C4',
    textAlign: 'center',
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: '#E20010',
    borderRadius: 8,
    paddingHorizontal: 22,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  browseButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E6E9EF',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 12,
    ...Platform.select({
      web: {
        boxShadow: '0 -1px 4px rgba(0, 0, 0, 0.04)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
      },
    }),
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#E20010',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#B3B8C4',
    fontWeight: '500',
  },
});
