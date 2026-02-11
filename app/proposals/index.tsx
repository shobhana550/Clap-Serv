/**
 * My Proposals Screen (Provider)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DUMMY_PROPOSALS } from '@/constants/DummyData';
import { ProposalCard } from '@/components/cards/ProposalCard';

type FilterType = 'all' | 'pending' | 'accepted' | 'rejected';

export default function MyProposalsScreen() {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');

  // Filter proposals based on status
  const filteredProposals = DUMMY_PROPOSALS.filter((proposal) => {
    if (selectedFilter === 'all') return true;
    return proposal.status === selectedFilter;
  });

  // Count proposals by status
  const counts = {
    all: DUMMY_PROPOSALS.length,
    pending: DUMMY_PROPOSALS.filter(p => p.status === 'pending').length,
    accepted: DUMMY_PROPOSALS.filter(p => p.status === 'accepted').length,
    rejected: DUMMY_PROPOSALS.filter(p => p.status === 'rejected').length,
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
        {filteredProposals.length > 0 ? (
          <>
            {filteredProposals.map((proposal) => (
              <ProposalCard key={proposal.id} proposal={proposal} />
            ))}
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
                : `No ${selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1)} Proposals`}
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
      {filteredProposals.length > 0 && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{counts.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#10B981' }]}>{counts.accepted}</Text>
            <Text style={styles.statLabel}>Accepted</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#EF4444' }]}>{counts.rejected}</Text>
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
