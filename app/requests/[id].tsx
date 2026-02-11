/**
 * Request Details Screen
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCategoryLookup } from '@/lib/useCategoryLookup';
import { useRoleStore } from '@/store/roleStore';
import { showAlert } from '@/utils/alert';

export default function RequestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { activeRole } = useRoleStore();
  const { getCategoryById } = useCategoryLookup();
  const isBuyer = activeRole === 'buyer';

  const [request, setRequest] = useState<any>(null);
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedProposalId, setExpandedProposalId] = useState<string | null>(null);

  useEffect(() => {
    loadRequestDetails();
  }, [id]);

  const loadRequestDetails = async () => {
    try {
      // Load request from AsyncStorage
      const requestsJson = await AsyncStorage.getItem('my_requests');
      if (requestsJson) {
        const requests = JSON.parse(requestsJson);
        const foundRequest = requests.find((r: any) => r.id === id);
        setRequest(foundRequest);
      }

      // Load proposals for this request
      const proposalsJson = await AsyncStorage.getItem(`proposals_${id}`);
      if (proposalsJson) {
        const loadedProposals = JSON.parse(proposalsJson);
        setProposals(loadedProposals);
      }
    } catch (error) {
      console.error('Error loading request details:', error);
    } finally {
      setLoading(false);
    }
  };

  const category = request ? getCategoryById(request.category_id) : null;

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const handleAcceptProposal = async (proposal: any) => {
    showAlert(
      'Accept Proposal',
      `Are you sure you want to accept the proposal from ${proposal.provider?.name || 'this provider'} for ₹${proposal.price?.toLocaleString()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          style: 'default',
          onPress: async () => {
            try {
              // Create project
              const newProject = {
                id: `proj-${Date.now()}`,
                request_id: request.id,
                proposal_id: proposal.id,
                request_title: request.title,
                request_description: request.description,
                category_id: request.category_id,
                budget: proposal.price,
                timeline: proposal.timeline,
                provider_name: proposal.provider?.name || 'Provider',
                provider_id: proposal.provider_id || 'provider-1',
                buyer_name: request.buyer?.name || 'Buyer',
                buyer_id: request.buyer_id || 'buyer-1',
                status: 'active',
                created_at: new Date().toISOString(),
                milestones: [],
              };

              // Save to projects in AsyncStorage
              const projectsJson = await AsyncStorage.getItem('projects');
              const projects = projectsJson ? JSON.parse(projectsJson) : [];
              projects.unshift(newProject);
              await AsyncStorage.setItem('projects', JSON.stringify(projects));

              // Update proposal status to 'accepted'
              const updatedProposals = proposals.map((p: any) =>
                p.id === proposal.id
                  ? { ...p, status: 'accepted' }
                  : p.status === 'pending'
                  ? { ...p, status: 'rejected' } // Reject other pending proposals
                  : p
              );
              await AsyncStorage.setItem(`proposals_${id}`, JSON.stringify(updatedProposals));
              setProposals(updatedProposals);

              // Update request status to 'in_progress'
              const requestsJson = await AsyncStorage.getItem('my_requests');
              if (requestsJson) {
                const requests = JSON.parse(requestsJson);
                const updatedRequests = requests.map((r: any) =>
                  r.id === request.id ? { ...r, status: 'in_progress' } : r
                );
                await AsyncStorage.setItem('my_requests', JSON.stringify(updatedRequests));
                setRequest({ ...request, status: 'in_progress' });
              }

              showAlert(
                'Success!',
                'Proposal accepted! Project created successfully.',
                [
                  {
                    text: 'View Projects',
                    onPress: () => router.push('/(tabs)/projects'),
                  },
                  { text: 'OK' },
                ]
              );
            } catch (error) {
              console.error('Error accepting proposal:', error);
              showAlert('Error', 'Failed to accept proposal. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleRejectProposal = (proposal: any) => {
    showAlert(
      'Reject Proposal',
      `Are you sure you want to reject the proposal from ${proposal.provider?.name || 'this provider'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () => {
            showAlert('Proposal Rejected', 'The provider has been notified.');
          },
        },
      ]
    );
  };

  const handleSubmitProposal = () => {
    if (!request) return;
    router.push(`/proposals/new/${request.id}` as any);
  };

  const handleMessage = (name: string) => {
    showAlert('Message', `Messaging feature will open conversation with ${name}`);
  };

  const handleBackPress = () => {
    // Try to go back, but fallback to My Requests if no history
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/requests/my-requests');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.headerBackButton}>
            <FontAwesome name="arrow-left" size={20} color="#E20010" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Request Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={{ color: '#B3B8C4' }}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (!request) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.headerBackButton}>
            <FontAwesome name="arrow-left" size={20} color="#E20010" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Request Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorContainer}>
          <FontAwesome name="exclamation-triangle" size={48} color="#EF4444" />
          <Text style={styles.errorTitle}>Request Not Found</Text>
          <Text style={styles.errorText}>
            The service request you're looking for doesn't exist.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.headerBackButton}>
          <FontAwesome name="arrow-left" size={20} color="#E20010" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request Details</Text>
        <TouchableOpacity style={styles.headerShareButton}>
          <FontAwesome name="share-alt" size={18} color="#E20010" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Request Card */}
        <View style={styles.requestCard}>
          <View style={styles.categoryRow}>
            <View style={styles.categoryBadge}>
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

          <Text style={styles.requestTitle}>{request.title}</Text>
          <Text style={styles.postedTime}>{getTimeAgo(request.created_at)}</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{request.description}</Text>

          <View style={styles.divider} />

          {/* Details Grid */}
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <FontAwesome name="money" size={18} color="#10B981" />
              </View>
              <View>
                <Text style={styles.detailLabel}>Budget</Text>
                <Text style={styles.detailValue}>
                  ₹{request.budget_min?.toLocaleString()} - ₹{request.budget_max?.toLocaleString()}
                </Text>
              </View>
            </View>

            {request.when_needed && (
              <View style={styles.detailItem}>
                <View style={styles.detailIcon}>
                  <FontAwesome name="clock-o" size={18} color="#F59E0B" />
                </View>
                <View>
                  <Text style={styles.detailLabel}>When Needed</Text>
                  <Text style={styles.detailValue}>{request.when_needed}</Text>
                </View>
              </View>
            )}

            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <FontAwesome name="calendar" size={18} color="#B3B8C4" />
              </View>
              <View>
                <Text style={styles.detailLabel}>Posted</Text>
                <Text style={styles.detailValue}>
                  {getTimeAgo(request.created_at)}
                </Text>
              </View>
            </View>
          </View>

          {/* Attachments */}
          {request.attachments && request.attachments.length > 0 && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>Attachments</Text>
              <View>
                {request.attachments.map((attachment: any, index: number) => (
                  <View key={index} style={styles.detailItem}>
                    <FontAwesome
                      name={attachment.type === 'image' ? 'image' : 'file'}
                      size={16}
                      color="#B3B8C4"
                    />
                    <Text style={styles.detailValue}>{attachment.name}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>

        {/* Proposals Section (for buyers) */}
        {isBuyer && proposals.length > 0 && (
          <View style={styles.proposalsSection}>
            <View style={styles.proposalsHeader}>
              <Text style={styles.proposalsSectionTitle}>
                Proposals Received ({proposals.length})
              </Text>
            </View>

            {proposals.map((proposal) => (
              <View key={proposal.id} style={styles.proposalCard}>
                <View style={styles.proposalHeader}>
                  <View style={styles.providerInfo}>
                    <View style={styles.providerAvatar}>
                      <Text style={styles.providerAvatarText}>
                        {proposal.provider.name.charAt(0)}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.providerName}>{proposal.provider.name}</Text>
                      <View style={styles.providerMeta}>
                        <FontAwesome name="star" size={12} color="#F59E0B" />
                        <Text style={styles.providerMetaText}>
                          {proposal.provider.rating} ({proposal.provider.reviewCount})
                        </Text>
                        <Text style={styles.providerMetaText}>
                          · {proposal.provider.completedJobs} jobs
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={[styles.proposalStatusBadge, { backgroundColor: proposal.status === 'pending' ? '#3B82F6' : proposal.status === 'accepted' ? '#10B981' : '#EF4444' }]}>
                    <Text style={styles.proposalStatusText}>
                      {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                    </Text>
                  </View>
                </View>

                <View style={styles.proposalDetails}>
                  <View style={styles.proposalDetailItem}>
                    <Text style={styles.proposalDetailLabel}>Bid</Text>
                    <Text style={styles.proposalDetailValue}>
                      ₹{proposal.price?.toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.proposalDetailItem}>
                    <Text style={styles.proposalDetailLabel}>Timeline</Text>
                    <Text style={styles.proposalDetailValue}>{proposal.timeline || 'N/A'}</Text>
                  </View>
                  <View style={styles.proposalDetailItem}>
                    <Text style={styles.proposalDetailLabel}>Submitted</Text>
                    <Text style={styles.proposalDetailValue}>
                      {proposal.created_at ? getTimeAgo(proposal.created_at) : 'Recently'}
                    </Text>
                  </View>
                </View>

                {/* Cover Letter (Expandable) */}
                <TouchableOpacity
                  style={styles.coverLetterToggle}
                  onPress={() => setExpandedProposalId(
                    expandedProposalId === proposal.id ? null : proposal.id
                  )}
                >
                  <Text style={styles.coverLetterLabel}>Cover Letter</Text>
                  <FontAwesome
                    name={expandedProposalId === proposal.id ? 'chevron-up' : 'chevron-down'}
                    size={14}
                    color="#B3B8C4"
                  />
                </TouchableOpacity>

                {expandedProposalId === proposal.id && (
                  <View style={styles.coverLetterContent}>
                    <Text style={styles.coverLetterText}>{proposal.cover_letter}</Text>
                  </View>
                )}

                {/* Actions */}
                {proposal.status === 'pending' && (
                  <View style={styles.proposalActions}>
                    <TouchableOpacity
                      style={styles.acceptButton}
                      onPress={() => handleAcceptProposal(proposal)}
                    >
                      <FontAwesome name="check" size={16} color="#FFFFFF" />
                      <Text style={styles.acceptButtonText}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.rejectButton}
                      onPress={() => handleRejectProposal(proposal)}
                    >
                      <FontAwesome name="times" size={16} color="#EF4444" />
                      <Text style={styles.rejectButtonText}>Reject</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.messageButtonSmall}
                      onPress={() => handleMessage(proposal.provider.name)}
                    >
                      <FontAwesome name="comment" size={16} color="#E20010" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Action Buttons (for providers) */}
        {!isBuyer && request.status === 'open' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.submitProposalButton}
              onPress={handleSubmitProposal}
            >
              <FontAwesome name="paper-plane" size={16} color="#FFFFFF" />
              <Text style={styles.submitProposalButtonText}>Submit Proposal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.messageButtonOutline}
              onPress={() => handleMessage(request.buyer?.name || 'Buyer')}
            >
              <FontAwesome name="comment" size={16} color="#E20010" />
              <Text style={styles.messageButtonOutlineText}>Message Buyer</Text>
            </TouchableOpacity>
          </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E6E9EF',
  },
  headerBackButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#5F6267',
  },
  headerShareButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E6E9EF',
    ...Platform.select({
      web: {
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 2,
      },
    }),
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF0F1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 12,
    color: '#E20010',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  requestTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#5F6267',
    lineHeight: 30,
    marginBottom: 8,
  },
  postedTime: {
    fontSize: 13,
    color: '#C5C4CC',
  },
  divider: {
    height: 1,
    backgroundColor: '#E6E9EF',
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#5F6267',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#5F6267',
    lineHeight: 24,
  },
  detailsGrid: {
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F7F8FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#C5C4CC',
    fontWeight: '500',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#5F6267',
  },
  buyerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F7F8FA',
    padding: 12,
    borderRadius: 8,
  },
  buyerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  buyerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E20010',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyerAvatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  buyerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#5F6267',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    color: '#B3B8C4',
  },
  messageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF0F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  proposalsSection: {
    marginBottom: 16,
  },
  proposalsHeader: {
    marginBottom: 16,
  },
  proposalsSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#5F6267',
  },
  proposalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E6E9EF',
    ...Platform.select({
      web: {
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 2,
      },
    }),
  },
  proposalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  providerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  providerAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  providerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#5F6267',
    marginBottom: 4,
  },
  providerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  providerMetaText: {
    fontSize: 12,
    color: '#B3B8C4',
  },
  proposalStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  proposalStatusText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  proposalDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F7F8FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  proposalDetailItem: {
    alignItems: 'center',
  },
  proposalDetailLabel: {
    fontSize: 11,
    color: '#C5C4CC',
    fontWeight: '500',
    marginBottom: 4,
  },
  proposalDetailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#5F6267',
  },
  coverLetterToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  coverLetterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5F6267',
  },
  coverLetterContent: {
    backgroundColor: '#F7F8FA',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 12,
  },
  coverLetterText: {
    fontSize: 14,
    color: '#5F6267',
    lineHeight: 20,
  },
  proposalActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#10B981',
    paddingVertical: 10,
    borderRadius: 8,
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EF4444',
    paddingVertical: 10,
    borderRadius: 8,
  },
  rejectButtonText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
  messageButtonSmall: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF0F1',
    borderRadius: 8,
  },
  actionButtons: {
    gap: 12,
  },
  submitProposalButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E20010',
    paddingVertical: 16,
    borderRadius: 8,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 6px -1px rgba(226, 0, 16, 0.25)',
      },
      default: {
        shadowColor: '#E20010',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
      },
    }),
  },
  submitProposalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  messageButtonOutline: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E20010',
    paddingVertical: 14,
    borderRadius: 8,
  },
  messageButtonOutlineText: {
    color: '#E20010',
    fontSize: 16,
    fontWeight: '700',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#5F6267',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#B3B8C4',
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#E20010',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
