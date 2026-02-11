import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { DummyServiceRequest, getTimeAgo } from '../../constants/DummyData';
import { SERVICE_CATEGORIES } from '../../constants/ServiceCategories';

interface RequestCardProps {
  request: DummyServiceRequest;
}

export const RequestCard: React.FC<RequestCardProps> = ({ request }) => {
  const category = SERVICE_CATEGORIES.find(cat => cat.id === request.category_id);

  const getStatusColor = () => {
    switch (request.status) {
      case 'open': return '#10B981';
      case 'in_progress': return '#F59E0B';
      case 'completed': return '#B3B8C4';
      case 'cancelled': return '#EF4444';
      default: return '#B3B8C4';
    }
  };

  const getStatusText = () => {
    switch (request.status) {
      case 'open': return 'Open';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return request.status;
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/requests/${request.id}` as any)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.categoryContainer}>
          <FontAwesome
            name={category?.icon as any || 'briefcase'}
            size={14}
            color="#E20010"
          />
          <Text style={styles.categoryText}>{category?.name || 'Other'}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
      </View>

      <Text style={styles.title} numberOfLines={2}>{request.title}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {request.description}
      </Text>

      <View style={styles.footer}>
        <View style={styles.budgetContainer}>
          <FontAwesome name="dollar" size={13} color="#10B981" />
          <Text style={styles.budgetText}>
            ${request.budget_min.toLocaleString()} - ${request.budget_max.toLocaleString()}
          </Text>
        </View>
        <View style={styles.locationContainer}>
          <FontAwesome name="map-marker" size={13} color="#B3B8C4" />
          <Text style={styles.locationText}>{request.location}</Text>
        </View>
      </View>

      <View style={styles.metaContainer}>
        <View style={styles.buyerInfo}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {request.buyer.name.charAt(0)}
            </Text>
          </View>
          <View>
            <Text style={styles.buyerName}>{request.buyer.name}</Text>
            <View style={styles.ratingContainer}>
              <FontAwesome name="star" size={11} color="#F59E0B" />
              <Text style={styles.ratingText}>
                {request.buyer.rating} ({request.buyer.reviewCount})
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.rightMeta}>
          <Text style={styles.timeAgo}>{getTimeAgo(request.created_at)}</Text>
          <View style={styles.proposalCount}>
            <FontAwesome name="file-text-o" size={11} color="#E20010" />
            <Text style={styles.proposalCountText}>
              {request.proposal_count} proposals
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryText: {
    fontSize: 12,
    color: '#E20010',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#5F6267',
    marginBottom: 6,
    lineHeight: 21,
  },
  description: {
    fontSize: 13,
    color: '#B3B8C4',
    lineHeight: 19,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E6E9EF',
  },
  budgetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  budgetText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10B981',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#B3B8C4',
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buyerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarPlaceholder: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E20010',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  buyerName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5F6267',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 11,
    color: '#B3B8C4',
  },
  rightMeta: {
    alignItems: 'flex-end',
  },
  timeAgo: {
    fontSize: 11,
    color: '#C5C4CC',
    marginBottom: 3,
  },
  proposalCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  proposalCountText: {
    fontSize: 11,
    color: '#E20010',
    fontWeight: '500',
  },
});
