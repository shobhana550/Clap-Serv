/**
 * Request Details Screen
 * Shows request details, proposals, and handles proposal acceptance with contact info sharing.
 * Uses Supabase for all data operations.
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
  Linking,
  Modal,
  TextInput,
} from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { useRoleStore } from '@/store/roleStore';
import { saveNotificationRecord } from '@/lib/notifications/sendNotification';
import { showAlert } from '@/utils/alert';

// Colors
const PRIMARY = '#E20010';
const DARK = '#5F6267';
const MEDIUM = '#B3B8C4';
const BG = '#F7F8FA';
const GREEN = '#10B981';
const BORDER = '#E6E9EF';
const MUTED = '#C5C4CC';

export default function RequestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const { activeRole } = useRoleStore();
  const isBuyer = activeRole === 'buyer';

  const [request, setRequest] = useState<any>(null);
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [expandedProposalId, setExpandedProposalId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [myProposal, setMyProposal] = useState<any>(null);

  // Rating state
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingStars, setRatingStars] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [existingReview, setExistingReview] = useState<any>(null);

  // Refresh data when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (id) {
        loadRequestDetails();
      }
    }, [id])
  );

  const loadRequestDetails = async () => {
    try {
      setLoading(true);

      // Load request with category and buyer profile
      const { data: requestData, error: requestError } = await supabase
        .from('service_requests')
        .select('*, category:service_categories!category_id(id, name, icon), buyer:profiles!buyer_id(id, full_name, email, phone)')
        .eq('id', id)
        .single();

      if (requestError) {
        console.error('Error loading request:', requestError);
        setRequest(null);
        return;
      }

      setRequest(requestData);

      // Load proposals with provider profiles
      const { data: proposalsData, error: proposalsError } = await supabase
        .from('proposals')
        .select('*, provider:profiles!provider_id(id, full_name, email, phone, avatar_url)')
        .eq('request_id', id)
        .order('created_at', { ascending: false });

      if (proposalsError) {
        console.error('Error loading proposals:', proposalsError);
      } else {
        setProposals(proposalsData || []);

        // If provider is viewing, find their proposal
        if (!isBuyer && user) {
          const mine = (proposalsData || []).find(
            (p: any) => p.provider_id === user.id
          );
          setMyProposal(mine || null);
        }
      }

      // Check for existing conversation (for the handoff card Message button)
      if (requestData && requestData.status === 'in_progress' && user) {
        const { data: convoData } = await supabase
          .from('conversations')
          .select('id')
          .eq('request_id', id)
          .or(`buyer_id.eq.${user.id},provider_id.eq.${user.id}`)
          .limit(1)
          .single();

        if (convoData) {
          setConversationId(convoData.id);
        }
      }

      // Check if buyer already reviewed the provider for this request
      if (user) {
        const { data: reviewData } = await supabase
          .from('reviews')
          .select('*')
          .eq('request_id', id)
          .eq('reviewer_id', user.id)
          .maybeSingle();

        setExistingReview(reviewData || null);
      }
    } catch (error) {
      console.error('Error loading request details:', error);
    } finally {
      setLoading(false);
    }
  };

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
      `Are you sure you want to accept the proposal from ${proposal.provider?.full_name || 'this provider'} for ₹${proposal.price?.toLocaleString()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          style: 'default',
          onPress: async () => {
            try {
              setAccepting(true);

              // a. Update accepted proposal status
              const { error: acceptError } = await supabase
                .from('proposals')
                .update({ status: 'accepted' })
                .eq('id', proposal.id);

              if (acceptError) throw acceptError;

              // b. Reject all other pending proposals for this request
              const { error: rejectError } = await supabase
                .from('proposals')
                .update({ status: 'rejected' })
                .eq('request_id', id)
                .eq('status', 'pending')
                .neq('id', proposal.id);

              if (rejectError) console.error('Error rejecting other proposals:', rejectError);

              // c. Update request status to in_progress
              const { error: requestUpdateError } = await supabase
                .from('service_requests')
                .update({ status: 'in_progress' })
                .eq('id', id);

              if (requestUpdateError) throw requestUpdateError;

              // d. Create conversation between buyer and provider
              const { data: convoData, error: convoError } = await supabase
                .from('conversations')
                .insert({
                  request_id: id,
                  buyer_id: user!.id,
                  provider_id: proposal.provider_id,
                  request_title: request.title,
                })
                .select('id')
                .single();

              if (convoError) {
                console.error('Error creating conversation:', convoError);
              } else if (convoData) {
                setConversationId(convoData.id);
              }

              // e. Send in-app notification to provider
              await saveNotificationRecord(
                proposal.provider_id,
                'proposal_accepted',
                'Proposal Accepted!',
                `Your proposal for "${request.title}" has been accepted! Check the request details for buyer contact info.`,
                { requestId: id }
              );

              // Notify rejected providers
              const rejectedProposals = proposals.filter(
                (p) => p.id !== proposal.id && p.status === 'pending'
              );
              for (const rp of rejectedProposals) {
                await saveNotificationRecord(
                  rp.provider_id,
                  'proposal_rejected',
                  'Proposal Update',
                  `The request "${request.title}" has been awarded to another provider.`,
                  { requestId: id }
                );
              }

              // Refresh data to show handoff card
              await loadRequestDetails();

              showAlert(
                'Success!',
                'Proposal accepted! You can now see contact details and message the provider.',
                [{ text: 'OK' }]
              );
            } catch (error) {
              console.error('Error accepting proposal:', error);
              showAlert('Error', 'Failed to accept proposal. Please try again.');
            } finally {
              setAccepting(false);
            }
          },
        },
      ]
    );
  };

  const handleRejectProposal = (proposal: any) => {
    showAlert(
      'Reject Proposal',
      `Are you sure you want to reject the proposal from ${proposal.provider?.full_name || 'this provider'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('proposals')
                .update({ status: 'rejected' })
                .eq('id', proposal.id);

              if (error) throw error;

              // Send notification to provider
              await saveNotificationRecord(
                proposal.provider_id,
                'proposal_rejected',
                'Proposal Rejected',
                `Your proposal for "${request.title}" was not selected.`,
                { requestId: id }
              );

              // Refresh proposals
              await loadRequestDetails();
              showAlert('Done', 'The proposal has been rejected and the provider has been notified.');
            } catch (error) {
              console.error('Error rejecting proposal:', error);
              showAlert('Error', 'Failed to reject proposal. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleSubmitProposal = () => {
    if (!request) return;
    router.push(`/proposals/new/${request.id}` as any);
  };

  const handleMessagePress = () => {
    if (conversationId) {
      router.push(`/messages/chat?conversationId=${conversationId}` as any);
    } else {
      showAlert('No Conversation', 'A conversation will be created once a proposal is accepted.');
    }
  };

  const handleChatWithProvider = async (proposal: any) => {
    if (!user || !request) return;

    try {
      // Check if conversation already exists for this request + provider
      const { data: existingConvo } = await supabase
        .from('conversations')
        .select('id')
        .eq('request_id', id)
        .eq('buyer_id', user.id)
        .eq('provider_id', proposal.provider_id)
        .limit(1)
        .maybeSingle();

      if (existingConvo) {
        router.push(`/messages/chat?conversationId=${existingConvo.id}` as any);
        return;
      }

      // Create new conversation
      const { data: newConvo, error } = await supabase
        .from('conversations')
        .insert({
          request_id: id,
          buyer_id: user.id,
          provider_id: proposal.provider_id,
          request_title: request.title,
        })
        .select('id')
        .single();

      if (error) throw error;

      router.push(`/messages/chat?conversationId=${newConvo.id}` as any);
    } catch (error) {
      console.error('Error creating conversation:', error);
      showAlert('Error', 'Failed to start chat. Please try again.');
    }
  };

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/requests/my-requests');
    }
  };

  const handleSubmitRating = async () => {
    if (!ratingStars || !acceptedProposal || !user) return;

    setSubmittingRating(true);
    try {
      // Insert review
      const { error: reviewError } = await supabase.from('reviews').insert({
        request_id: id,
        reviewer_id: user.id,
        provider_id: acceptedProposal.provider_id,
        rating: ratingStars,
        comment: ratingComment.trim() || null,
      });

      if (reviewError) throw reviewError;

      // Recalculate provider's average rating
      const { data: allReviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('provider_id', acceptedProposal.provider_id);

      if (allReviews && allReviews.length > 0) {
        const avgRating =
          allReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / allReviews.length;

        await supabase
          .from('provider_profiles')
          .update({
            rating: Math.round(avgRating * 10) / 10,
            total_reviews: allReviews.length,
          })
          .eq('user_id', acceptedProposal.provider_id);
      }

      // Notify provider
      await saveNotificationRecord(
        acceptedProposal.provider_id,
        'review',
        'New Review Received',
        `You received a ${ratingStars}-star review for "${request.title}"`,
        { requestId: id }
      );

      setShowRatingModal(false);
      setRatingStars(0);
      setRatingComment('');
      await loadRequestDetails();

      showAlert('Thank You!', 'Your rating has been submitted successfully.');
    } catch (error) {
      console.error('Error submitting rating:', error);
      showAlert('Error', 'Failed to submit rating. Please try again.');
    } finally {
      setSubmittingRating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return GREEN;
      case 'in_progress': return '#F59E0B';
      case 'completed': return MEDIUM;
      case 'cancelled': return '#EF4444';
      default: return MEDIUM;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return 'Open';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const getLocationText = (location: any) => {
    if (!location) return 'Online';
    return location.city || location.address || 'Online';
  };

  // Find the accepted proposal for the handoff card
  const acceptedProposal = proposals.find((p) => p.status === 'accepted');

  // Loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.headerBackButton}>
            <FontAwesome name="arrow-left" size={20} color={PRIMARY} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Request Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorContainer}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text style={{ color: MEDIUM, marginTop: 12 }}>Loading...</Text>
        </View>
      </View>
    );
  }

  // Not found state
  if (!request) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.headerBackButton}>
            <FontAwesome name="arrow-left" size={20} color={PRIMARY} />
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
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.headerBackButton}>
          <FontAwesome name="arrow-left" size={20} color={PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request Details</Text>
        <TouchableOpacity style={styles.headerShareButton}>
          <FontAwesome name="share-alt" size={18} color={PRIMARY} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Contact Info Handoff Card */}
        {request.status === 'in_progress' && acceptedProposal && (
          <View style={styles.handoffCard}>
            <View style={styles.handoffHeader}>
              <FontAwesome name="handshake-o" size={20} color={GREEN} />
              <Text style={styles.handoffTitle}>Proposal Accepted - Contact Details</Text>
            </View>

            <View style={styles.handoffDivider} />

            {/* Provider Info */}
            <View style={styles.handoffParty}>
              <Text style={styles.handoffPartyLabel}>Provider</Text>
              <Text style={styles.handoffPartyName}>
                {acceptedProposal.provider?.full_name || 'Provider'}
              </Text>
              {acceptedProposal.provider?.email && (
                <TouchableOpacity
                  style={styles.handoffContactRow}
                  onPress={() => Linking.openURL(`mailto:${acceptedProposal.provider.email}`)}
                >
                  <FontAwesome name="envelope" size={14} color={PRIMARY} />
                  <Text style={styles.handoffContactText}>
                    {acceptedProposal.provider.email}
                  </Text>
                </TouchableOpacity>
              )}
              {acceptedProposal.provider?.phone && (
                <TouchableOpacity
                  style={styles.handoffContactRow}
                  onPress={() => Linking.openURL(`tel:${acceptedProposal.provider.phone}`)}
                >
                  <FontAwesome name="phone" size={14} color={PRIMARY} />
                  <Text style={styles.handoffContactText}>
                    {acceptedProposal.provider.phone}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.handoffDivider} />

            {/* Buyer Info */}
            <View style={styles.handoffParty}>
              <Text style={styles.handoffPartyLabel}>Buyer</Text>
              <Text style={styles.handoffPartyName}>
                {request.buyer?.full_name || 'Buyer'}
              </Text>
              {request.buyer?.email && (
                <TouchableOpacity
                  style={styles.handoffContactRow}
                  onPress={() => Linking.openURL(`mailto:${request.buyer.email}`)}
                >
                  <FontAwesome name="envelope" size={14} color={PRIMARY} />
                  <Text style={styles.handoffContactText}>{request.buyer.email}</Text>
                </TouchableOpacity>
              )}
              {request.buyer?.phone && (
                <TouchableOpacity
                  style={styles.handoffContactRow}
                  onPress={() => Linking.openURL(`tel:${request.buyer.phone}`)}
                >
                  <FontAwesome name="phone" size={14} color={PRIMARY} />
                  <Text style={styles.handoffContactText}>{request.buyer.phone}</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.handoffDivider} />

            <Text style={styles.handoffMessage}>
              You can now contact each other directly to discuss and complete the service.
            </Text>

            <TouchableOpacity style={styles.handoffMessageButton} onPress={handleMessagePress}>
              <FontAwesome name="comment" size={16} color="#FFFFFF" />
              <Text style={styles.handoffMessageButtonText}>Message</Text>
            </TouchableOpacity>

            {/* Rating Section */}
            {isBuyer && !existingReview && (
              <>
                <View style={styles.handoffDivider} />
                <TouchableOpacity
                  style={styles.rateProviderButton}
                  onPress={() => setShowRatingModal(true)}
                >
                  <FontAwesome name="star" size={16} color="#F59E0B" />
                  <Text style={styles.rateProviderButtonText}>Rate Provider</Text>
                </TouchableOpacity>
              </>
            )}

            {/* Existing Review Display */}
            {existingReview && (
              <>
                <View style={styles.handoffDivider} />
                <View style={styles.existingReviewCard}>
                  <Text style={styles.existingReviewLabel}>Your Rating</Text>
                  <View style={styles.existingReviewStars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FontAwesome
                        key={star}
                        name={star <= existingReview.rating ? 'star' : 'star-o'}
                        size={18}
                        color="#F59E0B"
                      />
                    ))}
                    <Text style={styles.existingReviewRating}>{existingReview.rating}/5</Text>
                  </View>
                  {existingReview.comment && (
                    <Text style={styles.existingReviewComment}>"{existingReview.comment}"</Text>
                  )}
                </View>
              </>
            )}
          </View>
        )}

        {/* Main Request Card */}
        <View style={styles.requestCard}>
          <View style={styles.categoryRow}>
            <View style={styles.categoryBadge}>
              <FontAwesome
                name={(request.category?.icon as any) || 'briefcase'}
                size={14}
                color={PRIMARY}
              />
              <Text style={styles.categoryText}>
                {request.category?.name || 'Other'}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) }]}>
              <Text style={styles.statusText}>{getStatusText(request.status)}</Text>
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
                <FontAwesome name="money" size={18} color={GREEN} />
              </View>
              <View>
                <Text style={styles.detailLabel}>Budget</Text>
                <Text style={styles.detailValue}>
                  ₹{request.budget_min?.toLocaleString()} - ₹{request.budget_max?.toLocaleString()}
                </Text>
              </View>
            </View>

            {request.timeline && (
              <View style={styles.detailItem}>
                <View style={styles.detailIcon}>
                  <FontAwesome name="clock-o" size={18} color="#F59E0B" />
                </View>
                <View>
                  <Text style={styles.detailLabel}>Timeline</Text>
                  <Text style={styles.detailValue}>{request.timeline}</Text>
                </View>
              </View>
            )}

            {request.deadline && (
              <View style={styles.detailItem}>
                <View style={styles.detailIcon}>
                  <FontAwesome name="calendar-check-o" size={18} color="#EF4444" />
                </View>
                <View>
                  <Text style={styles.detailLabel}>Deadline</Text>
                  <Text style={styles.detailValue}>
                    {new Date(request.deadline).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <FontAwesome name="map-marker" size={18} color={PRIMARY} />
              </View>
              <View>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue}>
                  {getLocationText(request.location)}
                </Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <FontAwesome name="calendar" size={18} color={MEDIUM} />
              </View>
              <View>
                <Text style={styles.detailLabel}>Posted</Text>
                <Text style={styles.detailValue}>
                  {getTimeAgo(request.created_at)}
                </Text>
              </View>
            </View>
          </View>
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
                        {(proposal.provider?.full_name || 'P').charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.providerName}>
                        {proposal.provider?.full_name || 'Provider'}
                      </Text>
                      <Text style={styles.providerMetaText}>
                        Submitted {proposal.created_at ? getTimeAgo(proposal.created_at) : 'recently'}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.proposalStatusBadge,
                      {
                        backgroundColor:
                          proposal.status === 'pending'
                            ? '#3B82F6'
                            : proposal.status === 'accepted'
                            ? GREEN
                            : '#EF4444',
                      },
                    ]}
                  >
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
                    <Text style={styles.proposalDetailValue}>
                      {proposal.timeline_estimate || 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.proposalDetailItem}>
                    <Text style={styles.proposalDetailLabel}>Submitted</Text>
                    <Text style={styles.proposalDetailValue}>
                      {proposal.created_at ? getTimeAgo(proposal.created_at) : 'Recently'}
                    </Text>
                  </View>
                </View>

                {/* Cover Letter (Expandable) */}
                {proposal.cover_letter && (
                  <>
                    <TouchableOpacity
                      style={styles.coverLetterToggle}
                      onPress={() =>
                        setExpandedProposalId(
                          expandedProposalId === proposal.id ? null : proposal.id
                        )
                      }
                    >
                      <Text style={styles.coverLetterLabel}>Cover Letter</Text>
                      <FontAwesome
                        name={expandedProposalId === proposal.id ? 'chevron-up' : 'chevron-down'}
                        size={14}
                        color={MEDIUM}
                      />
                    </TouchableOpacity>

                    {expandedProposalId === proposal.id && (
                      <View style={styles.coverLetterContent}>
                        <Text style={styles.coverLetterText}>{proposal.cover_letter}</Text>
                      </View>
                    )}
                  </>
                )}

                {/* Actions for pending proposals */}
                {proposal.status === 'pending' && request.status === 'open' && (
                  <View>
                    <TouchableOpacity
                      style={styles.chatProviderButton}
                      onPress={() => handleChatWithProvider(proposal)}
                    >
                      <FontAwesome name="comment" size={16} color={PRIMARY} />
                      <Text style={styles.chatProviderButtonText}>Chat with Provider</Text>
                    </TouchableOpacity>
                    <View style={styles.proposalActions}>
                      <TouchableOpacity
                        style={[styles.acceptButton, accepting && { opacity: 0.6 }]}
                        onPress={() => handleAcceptProposal(proposal)}
                        disabled={accepting}
                      >
                        {accepting ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <>
                            <FontAwesome name="check" size={16} color="#FFFFFF" />
                            <Text style={styles.acceptButtonText}>Accept</Text>
                          </>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.rejectButton}
                        onPress={() => handleRejectProposal(proposal)}
                        disabled={accepting}
                      >
                        <FontAwesome name="times" size={16} color="#EF4444" />
                        <Text style={styles.rejectButtonText}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Show accepted badge with contact hint */}
                {proposal.status === 'accepted' && (
                  <View style={styles.acceptedBanner}>
                    <FontAwesome name="check-circle" size={16} color={GREEN} />
                    <Text style={styles.acceptedBannerText}>
                      Accepted - See contact details above
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* No proposals message for buyers */}
        {isBuyer && proposals.length === 0 && request.status === 'open' && (
          <View style={styles.emptyProposals}>
            <FontAwesome name="inbox" size={36} color={MEDIUM} />
            <Text style={styles.emptyProposalsTitle}>No Proposals Yet</Text>
            <Text style={styles.emptyProposalsText}>
              Providers will start submitting proposals soon. Check back later!
            </Text>
          </View>
        )}

        {/* Provider View: Submit Proposal or Show Status */}
        {!isBuyer && (
          <View style={styles.actionButtons}>
            {request.status === 'open' && !myProposal && (
              <TouchableOpacity
                style={styles.submitProposalButton}
                onPress={handleSubmitProposal}
              >
                <FontAwesome name="paper-plane" size={16} color="#FFFFFF" />
                <Text style={styles.submitProposalButtonText}>Submit Proposal</Text>
              </TouchableOpacity>
            )}

            {myProposal && (
              <View style={styles.myProposalCard}>
                <View style={styles.myProposalHeader}>
                  <Text style={styles.myProposalTitle}>Your Proposal</Text>
                  <View
                    style={[
                      styles.proposalStatusBadge,
                      {
                        backgroundColor:
                          myProposal.status === 'pending'
                            ? '#3B82F6'
                            : myProposal.status === 'accepted'
                            ? GREEN
                            : '#EF4444',
                      },
                    ]}
                  >
                    <Text style={styles.proposalStatusText}>
                      {myProposal.status.charAt(0).toUpperCase() + myProposal.status.slice(1)}
                    </Text>
                  </View>
                </View>
                <View style={styles.proposalDetails}>
                  <View style={styles.proposalDetailItem}>
                    <Text style={styles.proposalDetailLabel}>Your Bid</Text>
                    <Text style={styles.proposalDetailValue}>
                      ₹{myProposal.price?.toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.proposalDetailItem}>
                    <Text style={styles.proposalDetailLabel}>Timeline</Text>
                    <Text style={styles.proposalDetailValue}>
                      {myProposal.timeline_estimate || 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.proposalDetailItem}>
                    <Text style={styles.proposalDetailLabel}>Submitted</Text>
                    <Text style={styles.proposalDetailValue}>
                      {myProposal.created_at ? getTimeAgo(myProposal.created_at) : 'Recently'}
                    </Text>
                  </View>
                </View>
                {myProposal.cover_letter && (
                  <View style={styles.coverLetterContent}>
                    <Text style={styles.coverLetterText}>{myProposal.cover_letter}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Rating Modal */}
      <Modal
        visible={showRatingModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRatingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.ratingModalContent}>
            <View style={styles.ratingModalHeader}>
              <Text style={styles.ratingModalTitle}>Rate Provider</Text>
              <TouchableOpacity onPress={() => setShowRatingModal(false)}>
                <FontAwesome name="times" size={20} color={MEDIUM} />
              </TouchableOpacity>
            </View>

            {acceptedProposal && (
              <Text style={styles.ratingModalSubtitle}>
                How was your experience with {acceptedProposal.provider?.full_name || 'this provider'}?
              </Text>
            )}

            {/* Star Selection */}
            <View style={styles.starSelectionRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRatingStars(star)}
                  style={styles.starButton}
                >
                  <FontAwesome
                    name={star <= ratingStars ? 'star' : 'star-o'}
                    size={36}
                    color={star <= ratingStars ? '#F59E0B' : MEDIUM}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.starLabel}>
              {ratingStars === 0
                ? 'Tap to rate'
                : ratingStars === 1
                ? 'Poor'
                : ratingStars === 2
                ? 'Fair'
                : ratingStars === 3
                ? 'Good'
                : ratingStars === 4
                ? 'Very Good'
                : 'Excellent'}
            </Text>

            {/* Comment Input */}
            <TextInput
              style={styles.ratingCommentInput}
              placeholder="Share your experience (optional)"
              placeholderTextColor={MUTED}
              value={ratingComment}
              onChangeText={setRatingComment}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.ratingCharCount}>{ratingComment.length}/500</Text>

            {/* Submit */}
            <TouchableOpacity
              style={[
                styles.submitRatingButton,
                (!ratingStars || submittingRating) && { opacity: 0.5 },
              ]}
              onPress={handleSubmitRating}
              disabled={!ratingStars || submittingRating}
            >
              {submittingRating ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <FontAwesome name="star" size={16} color="#FFFFFF" />
                  <Text style={styles.submitRatingButtonText}>Submit Rating</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
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
    color: DARK,
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

  // Handoff Card
  handoffCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: GREEN,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px 0 rgba(16, 185, 129, 0.15)',
      },
      default: {
        shadowColor: GREEN,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
      },
    }),
  },
  handoffHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  handoffTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#065F46',
    flex: 1,
  },
  handoffDivider: {
    height: 1,
    backgroundColor: '#A7F3D0',
    marginVertical: 12,
  },
  handoffParty: {
    gap: 6,
  },
  handoffPartyLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: GREEN,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  handoffPartyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065F46',
  },
  handoffContactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 2,
  },
  handoffContactText: {
    fontSize: 14,
    color: '#047857',
  },
  handoffMessage: {
    fontSize: 13,
    color: '#065F46',
    lineHeight: 20,
    marginBottom: 12,
  },
  handoffMessageButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: GREEN,
    paddingVertical: 12,
    borderRadius: 8,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px 0 rgba(16, 185, 129, 0.3)',
      },
      default: {
        shadowColor: GREEN,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
      },
    }),
  },
  handoffMessageButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  // Request Card
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BORDER,
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
    color: PRIMARY,
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
    color: DARK,
    lineHeight: 30,
    marginBottom: 8,
  },
  postedTime: {
    fontSize: 13,
    color: MUTED,
  },
  divider: {
    height: 1,
    backgroundColor: BORDER,
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: DARK,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: DARK,
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
    backgroundColor: BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: MUTED,
    fontWeight: '500',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: DARK,
  },

  // Proposals Section
  proposalsSection: {
    marginBottom: 16,
  },
  proposalsHeader: {
    marginBottom: 16,
  },
  proposalsSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: DARK,
  },
  proposalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER,
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
    backgroundColor: GREEN,
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
    color: DARK,
    marginBottom: 4,
  },
  providerMetaText: {
    fontSize: 12,
    color: MEDIUM,
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
    backgroundColor: BG,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  proposalDetailItem: {
    alignItems: 'center',
  },
  proposalDetailLabel: {
    fontSize: 11,
    color: MUTED,
    fontWeight: '500',
    marginBottom: 4,
  },
  proposalDetailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: DARK,
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
    color: DARK,
  },
  coverLetterContent: {
    backgroundColor: BG,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 12,
  },
  coverLetterText: {
    fontSize: 14,
    color: DARK,
    lineHeight: 20,
  },
  chatProviderButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: PRIMARY,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  chatProviderButtonText: {
    color: PRIMARY,
    fontSize: 14,
    fontWeight: '600',
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
    backgroundColor: GREEN,
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
  acceptedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    padding: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  acceptedBannerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#065F46',
  },

  // Empty Proposals
  emptyProposals: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 32,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
  },
  emptyProposalsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: DARK,
    marginTop: 12,
    marginBottom: 6,
  },
  emptyProposalsText: {
    fontSize: 14,
    color: MEDIUM,
    textAlign: 'center',
  },

  // Provider Action Buttons
  actionButtons: {
    gap: 12,
  },
  submitProposalButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: PRIMARY,
    paddingVertical: 16,
    borderRadius: 8,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 6px -1px rgba(226, 0, 16, 0.25)',
      },
      default: {
        shadowColor: PRIMARY,
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

  // My Proposal Card (provider view)
  myProposalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
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
  myProposalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  myProposalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: DARK,
  },

  // Error / Loading states
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: DARK,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: MEDIUM,
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // Rating Styles
  rateProviderButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFBEB',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    paddingVertical: 12,
    borderRadius: 8,
  },
  rateProviderButtonText: {
    color: '#92400E',
    fontSize: 15,
    fontWeight: '700',
  },
  existingReviewCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    padding: 12,
  },
  existingReviewLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  existingReviewStars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  existingReviewRating: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
    marginLeft: 6,
  },
  existingReviewComment: {
    fontSize: 13,
    color: '#78350F',
    fontStyle: 'italic',
    lineHeight: 20,
  },

  // Rating Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  ratingModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    ...Platform.select({
      web: { boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)' },
      default: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 8 },
    }),
  },
  ratingModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: DARK,
  },
  ratingModalSubtitle: {
    fontSize: 14,
    color: MEDIUM,
    marginBottom: 20,
  },
  starSelectionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 8,
  },
  starButton: {
    padding: 6,
  },
  starLabel: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
    marginBottom: 20,
  },
  ratingCommentInput: {
    backgroundColor: BG,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: DARK,
    minHeight: 100,
  },
  ratingCharCount: {
    textAlign: 'right',
    fontSize: 11,
    color: MUTED,
    marginTop: 4,
    marginBottom: 16,
  },
  submitRatingButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F59E0B',
    paddingVertical: 14,
    borderRadius: 8,
    ...Platform.select({
      web: { boxShadow: '0 3px 6px rgba(245, 158, 11, 0.3)' },
      default: { shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 3 },
    }),
  },
  submitRatingButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
