/**
 * My Service Requests Screen
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  RefreshControl,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { useCategoryLookup } from '@/lib/useCategoryLookup';
import { showAlert } from '@/utils/alert';

export default function MyRequestsScreen() {
  const { getCategoryById } = useCategoryLookup();
  const { user } = useAuthStore();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('service_requests')
        .select(`
          *,
          category:service_categories!category_id(id, name, icon),
          proposals(id)
        `)
        .eq('buyer_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading requests:', error);
      } else if (data) {
        const transformed = data.map((item: any) => ({
          ...item,
          proposal_count: item.proposals?.length || 0,
          category_id: item.category_id,
        }));
        setRequests(transformed);
      }
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadRequests();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadRequests();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return '#10B981';
      case 'in_progress': return '#F59E0B';
      case 'completed': return '#B3B8C4';
      case 'cancelled': return '#EF4444';
      default: return '#B3B8C4';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Open';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const handleBack = () => {
    router.push('/(tabs)');
  };

  const handleDeleteRequest = (requestId: string, requestTitle: string) => {
    showAlert(
      'Delete Request',
      `Are you sure you want to delete "${requestTitle}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('service_requests')
                .delete()
                .eq('id', requestId);

              if (error) {
                console.error('Error deleting request:', error);
                showAlert('Error', 'Failed to delete request. Please try again.');
              } else {
                showAlert('Success', 'Request deleted successfully.');
                loadRequests();
              }
            } catch (error) {
              console.error('Error deleting request:', error);
              showAlert('Error', 'Failed to delete request. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleCloseRequest = (requestId: string, requestTitle: string) => {
    showAlert(
      'Close Request',
      `Are you sure you want to close "${requestTitle}"? This will mark it as cancelled and you won't receive new proposals.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Close',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('service_requests')
                .update({ status: 'cancelled' })
                .eq('id', requestId);

              if (error) {
                console.error('Error closing request:', error);
                showAlert('Error', 'Failed to close request. Please try again.');
              } else {
                showAlert('Success', 'Request closed successfully.');
                loadRequests();
              }
            } catch (error) {
              console.error('Error closing request:', error);
              showAlert('Error', 'Failed to close request. Please try again.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <FontAwesome name="arrow-left" size={18} color="#5F6267" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Requests</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#B3B8C4' }}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={18} color="#5F6267" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Requests</Text>
        <TouchableOpacity onPress={() => router.push('/requests/new')} style={styles.addButton}>
          <FontAwesome name="plus" size={18} color="#E20010" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {requests.length === 0 ? (
          <View style={styles.emptyCard}>
            <FontAwesome name="inbox" size={56} color="#C5C4CC" />
            <Text style={styles.emptyTitle}>No Service Requests Yet</Text>
            <Text style={styles.emptyText}>
              Post your first service request to get proposals from providers
            </Text>

            <TouchableOpacity
              style={styles.postButton}
              onPress={() => router.push('/requests/new')}
            >
              <FontAwesome name="plus" size={16} color="#FFFFFF" />
              <Text style={styles.postButtonText}>Post Request</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {requests.map((request) => {
              const category = getCategoryById(request.category_id);
              return (
                <View
                  key={request.id}
                  style={styles.requestCard}
                >
                  <TouchableOpacity
                    onPress={() => router.push(`/requests/${request.id}`)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.requestHeader}>
                      {category && (
                        <View style={styles.categoryBadge}>
                          <FontAwesome
                            name={category.icon as any}
                            size={13}
                            color="#E20010"
                          />
                          <Text style={styles.categoryText}>{category.name}</Text>
                        </View>
                      )}
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: `${getStatusColor(request.status)}20` },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            { color: getStatusColor(request.status) },
                          ]}
                        >
                          {getStatusLabel(request.status)}
                        </Text>
                      </View>
                    </View>

                  <Text style={styles.requestTitle} numberOfLines={2}>
                    {request.title}
                  </Text>

                  <Text style={styles.requestDescription} numberOfLines={2}>
                    {request.description}
                  </Text>

                  <View style={styles.requestFooter}>
                    <View style={styles.budgetContainer}>
                      <FontAwesome name="rupee" size={13} color="#B3B8C4" />
                      <Text style={styles.budgetText}>
                        {'\u20B9'}{request.budget_min?.toLocaleString('en-IN')} - {'\u20B9'}{request.budget_max?.toLocaleString('en-IN')}
                      </Text>
                    </View>
                    <View style={styles.proposalCount}>
                      <FontAwesome name="file-text-o" size={13} color="#E20010" />
                      <Text style={styles.proposalCountText}>
                        {request.proposal_count || 0} proposals
                      </Text>
                    </View>
                  </View>

                  {request.when_needed && (
                    <View style={styles.whenNeeded}>
                      <FontAwesome name="clock-o" size={13} color="#B3B8C4" />
                      <Text style={styles.whenNeededText}>{request.when_needed}</Text>
                    </View>
                  )}
                  </TouchableOpacity>

                  {/* Action Buttons for open requests */}
                  {(request.status === 'open' || request.status === 'in_progress') && (
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => handleCloseRequest(request.id, request.title)}
                      >
                        <FontAwesome name="ban" size={13} color="#F59E0B" />
                        <Text style={styles.closeButtonText}>Close</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteRequest(request.id, request.title)}
                      >
                        <FontAwesome name="trash" size={13} color="#EF4444" />
                        <Text style={styles.deleteButtonText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Delete button for completed/cancelled requests */}
                  {(request.status === 'completed' || request.status === 'cancelled') && (
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteRequest(request.id, request.title)}
                      >
                        <FontAwesome name="trash" size={13} color="#EF4444" />
                        <Text style={styles.deleteButtonText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
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
  addButton: {
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
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 44,
    alignItems: 'center',
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
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#5F6267',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#B3B8C4',
    textAlign: 'center',
    marginBottom: 24,
  },
  postButton: {
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
  postButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  requestCard: {
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
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 5,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E20010',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  requestTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#5F6267',
    marginBottom: 6,
  },
  requestDescription: {
    fontSize: 13,
    color: '#B3B8C4',
    marginBottom: 12,
    lineHeight: 19,
  },
  requestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  budgetText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5F6267',
  },
  proposalCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  proposalCountText: {
    fontSize: 12,
    color: '#B3B8C4',
  },
  whenNeeded: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E6E9EF',
  },
  whenNeededText: {
    fontSize: 12,
    color: '#B3B8C4',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E6E9EF',
  },
  closeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    borderRadius: 6,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  closeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F59E0B',
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FEE2E2',
    borderRadius: 6,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  deleteButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EF4444',
  },
});
