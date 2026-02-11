import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { DummyProposal, getTimeAgo, getRequestById } from '../../constants/DummyData';

interface ProposalCardProps {
  proposal: DummyProposal;
}

export const ProposalCard: React.FC<ProposalCardProps> = ({ proposal }) => {
  const request = getRequestById(proposal.request_id);

  const getStatusColor = () => {
    switch (proposal.status) {
      case 'pending': return '#3B82F6';
      case 'accepted': return '#10B981';
      case 'rejected': return '#EF4444';
      default: return '#B3B8C4';
    }
  };

  const getStatusText = () => {
    switch (proposal.status) {
      case 'pending': return 'Pending';
      case 'accepted': return 'Accepted';
      case 'rejected': return 'Rejected';
      default: return proposal.status;
    }
  };

  const getStatusIcon = () => {
    switch (proposal.status) {
      case 'pending': return 'clock-o';
      case 'accepted': return 'check-circle';
      case 'rejected': return 'times-circle';
      default: return 'circle';
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/requests/${proposal.request_id}` as any)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <FontAwesome
            name={getStatusIcon() as any}
            size={12}
            color="#FFFFFF"
            style={styles.statusIcon}
          />
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
        <Text style={styles.timeAgo}>{getTimeAgo(proposal.created_at)}</Text>
      </View>

      <Text style={styles.requestTitle} numberOfLines={2}>
        {request?.title || 'Service Request'}
      </Text>

      <View style={styles.divider} />

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <FontAwesome name="dollar" size={16} color="#10B981" />
            <View>
              <Text style={styles.detailLabel}>Your Bid</Text>
              <Text style={styles.detailValue}>${proposal.price.toLocaleString()}</Text>
            </View>
          </View>
          <View style={styles.detailItem}>
            <FontAwesome name="clock-o" size={16} color="#F59E0B" />
            <View>
              <Text style={styles.detailLabel}>Timeline</Text>
              <Text style={styles.detailValue}>{proposal.timeline}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.coverLetterPreview}>
        <Text style={styles.coverLetterLabel}>Cover Letter:</Text>
        <Text style={styles.coverLetterText} numberOfLines={2}>
          {proposal.cover_letter}
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.providerInfo}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {proposal.provider.name.charAt(0)}
            </Text>
          </View>
          <View>
            <Text style={styles.providerName}>{proposal.provider.name}</Text>
            <View style={styles.ratingContainer}>
              <FontAwesome name="star" size={11} color="#F59E0B" />
              <Text style={styles.ratingText}>
                {proposal.provider.rating} ({proposal.provider.reviewCount})
              </Text>
              <Text style={styles.jobsText}>
                · {proposal.provider.completedJobs} jobs
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E6E9EF',
    ...Platform.select({
      web: {
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  statusIcon: {
    marginRight: 2,
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  timeAgo: {
    fontSize: 12,
    color: '#C5C4CC',
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#5F6267',
    marginBottom: 12,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: '#E6E9EF',
    marginBottom: 12,
  },
  detailsContainer: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: '#C5C4CC',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#5F6267',
    marginTop: 2,
  },
  coverLetterPreview: {
    backgroundColor: '#F7F8FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  coverLetterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#B3B8C4',
    marginBottom: 4,
  },
  coverLetterText: {
    fontSize: 13,
    color: '#5F6267',
    lineHeight: 18,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#E6E9EF',
    paddingTop: 12,
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E20010',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  providerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5F6267',
    marginBottom: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#B3B8C4',
  },
  jobsText: {
    fontSize: 12,
    color: '#C5C4CC',
  },
});
