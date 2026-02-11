/**
 * Home / Dashboard Screen for Clap-Serv
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, Image, ActivityIndicator } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useUserStore } from '@/store/userStore';
import { useRoleStore } from '@/store/roleStore';
import { supabase } from '@/lib/supabase';
import FontAwesome from '@expo/vector-icons/FontAwesome';

function getRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;
}

function getStatusColor(status: string): { bg: string; text: string } {
  switch (status) {
    case 'open': return { bg: '#DBEAFE', text: '#1D4ED8' };
    case 'in_progress': return { bg: '#FEF3C7', text: '#B45309' };
    case 'pending': return { bg: '#FEF3C7', text: '#B45309' };
    case 'accepted': return { bg: '#D1FAE5', text: '#065F46' };
    case 'completed': return { bg: '#D1FAE5', text: '#065F46' };
    case 'rejected': return { bg: '#FEE2E2', text: '#991B1B' };
    case 'cancelled': return { bg: '#F3F4F6', text: '#6B7280' };
    default: return { bg: '#F3F4F6', text: '#6B7280' };
  }
}

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const { profile } = useUserStore();
  const { activeRole, userRole, switchRole } = useRoleStore();

  const [stat1, setStat1] = useState(0);
  const [stat2, setStat2] = useState(0);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const canSwitchRole = userRole === 'both';
  const isBuyer = activeRole === 'buyer';
  const isAdmin = Platform.OS === 'web' && (profile as any)?.is_admin === true;

  const fetchStats = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      if (isBuyer) {
        // Active Requests: service_requests where buyer_id = user.id and status IN ('open', 'in_progress')
        const { count: activeRequests } = await supabase
          .from('service_requests')
          .select('*', { count: 'exact', head: true })
          .eq('buyer_id', user.id)
          .in('status', ['open', 'in_progress']);

        // Proposal Count: proposals joined via service_requests where buyer_id = user.id
        const { data: myRequests } = await supabase
          .from('service_requests')
          .select('id')
          .eq('buyer_id', user.id);

        let proposalCount = 0;
        if (myRequests && myRequests.length > 0) {
          const requestIds = myRequests.map((r: any) => r.id);
          const { count } = await supabase
            .from('proposals')
            .select('*', { count: 'exact', head: true })
            .in('request_id', requestIds);
          proposalCount = count || 0;
        }

        setStat1(activeRequests || 0);
        setStat2(proposalCount);

        // Recent activity: 3 most recent service_requests for buyer
        const { data: recentRequests } = await supabase
          .from('service_requests')
          .select('id, title, status, created_at')
          .eq('buyer_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);

        setRecentActivity(
          (recentRequests || []).map((r: any) => ({
            id: r.id,
            title: r.title,
            status: r.status,
            date: r.created_at,
            type: 'request',
          }))
        );
      } else {
        // Active Bids: proposals where provider_id = user.id and status IN ('pending', 'accepted')
        const { count: activeBids } = await supabase
          .from('proposals')
          .select('*', { count: 'exact', head: true })
          .eq('provider_id', user.id)
          .in('status', ['pending', 'accepted']);

        // Active Projects: projects where provider_id = user.id and status = 'active'
        const { count: activeProjects } = await supabase
          .from('projects')
          .select('*', { count: 'exact', head: true })
          .eq('provider_id', user.id)
          .eq('status', 'active');

        setStat1(activeBids || 0);
        setStat2(activeProjects || 0);

        // Recent activity: 3 most recent proposals for provider
        const { data: recentProposals } = await supabase
          .from('proposals')
          .select('id, status, created_at, request_id, service_requests(title)')
          .eq('provider_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);

        setRecentActivity(
          (recentProposals || []).map((p: any) => ({
            id: p.id,
            title: (p.service_requests as any)?.title || 'Proposal',
            status: p.status,
            date: p.created_at,
            type: 'proposal',
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, isBuyer]);

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [fetchStats])
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeHeader}>
            <Image
              source={require('@/assets/images/clapicon.png')}
              style={styles.headerLogo}
              resizeMode="contain"
            />
            <Text style={styles.welcomeTitle}>
              Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}!
            </Text>
          </View>
          <Text style={styles.welcomeSubtitle}>
            {isBuyer
              ? 'Find the perfect service provider for your needs'
              : 'Discover new opportunities to offer your services'}
          </Text>
        </View>

        {/* Role Switcher (if user has 'both' role) */}
        {canSwitchRole && (
          <View style={styles.roleSwitcherCard}>
            <View style={styles.roleSwitcherContent}>
              <View style={styles.roleSwitcherLeft}>
                <Text style={styles.roleSwitcherLabel}>
                  Current Mode
                </Text>
                <View style={styles.roleSwitcherBadgeRow}>
                  <View style={styles.roleBadge}>
                    <Text style={styles.roleBadgeText}>
                      {isBuyer ? 'Buyer' : 'Provider'}
                    </Text>
                  </View>
                  <Text style={styles.roleSwitcherSubtext}>
                    {isBuyer ? 'Finding services' : 'Offering services'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={switchRole}
                style={styles.switchButton}
              >
                <FontAwesome name="exchange" size={14} color="white" />
                <Text style={styles.switchButtonText}>Switch</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Quick Stats
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{loading ? '-' : stat1}</Text>
              <Text style={styles.statLabel}>
                {isBuyer ? 'Active Requests' : 'Active Bids'}
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, { color: '#10B981' }]}>{loading ? '-' : stat2}</Text>
              <Text style={styles.statLabel}>
                {isBuyer ? 'Proposals' : 'Projects'}
              </Text>
            </View>
          </View>
        </View>

        {/* Admin Panel Link (web only, admin only) */}
        {isAdmin && (
          <TouchableOpacity
            style={styles.adminBanner}
            onPress={() => router.push('/(admin)' as any)}
          >
            <FontAwesome name="shield" size={16} color="#FFFFFF" />
            <Text style={styles.adminBannerText}>Open Admin Panel</Text>
            <FontAwesome name="chevron-right" size={14} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Quick Actions
          </Text>
          <View style={styles.actionsContainer}>
            {isBuyer ? (
              <>
                <TouchableOpacity
                  onPress={() => router.push('/requests/new')}
                  style={styles.primaryActionCard}
                >
                  <View style={styles.actionCardContent}>
                    <View style={styles.actionCardLeft}>
                      <Text style={styles.primaryActionTitle}>
                        Post a Service Request
                      </Text>
                      <Text style={styles.primaryActionSubtitle}>
                        Get proposals from qualified providers
                      </Text>
                    </View>
                    <FontAwesome name="plus-circle" size={28} color="white" />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.push('/requests/my-requests')}
                  style={styles.actionCard}
                >
                  <View style={styles.actionCardContent}>
                    <View style={styles.actionCardLeft}>
                      <Text style={styles.actionTitle}>
                        My Requests
                      </Text>
                      <Text style={styles.actionSubtitle}>
                        View and manage your service requests
                      </Text>
                    </View>
                    <FontAwesome name="chevron-right" size={18} color="#C5C4CC" />
                  </View>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  onPress={() => router.push('/(tabs)/browse')}
                  style={styles.primaryActionCard}
                >
                  <View style={styles.actionCardContent}>
                    <View style={styles.actionCardLeft}>
                      <Text style={styles.primaryActionTitle}>
                        Browse Opportunities
                      </Text>
                      <Text style={styles.primaryActionSubtitle}>
                        Find service requests matching your skills
                      </Text>
                    </View>
                    <FontAwesome name="search" size={28} color="white" />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.push('/proposals/index')}
                  style={styles.actionCard}
                >
                  <View style={styles.actionCardContent}>
                    <View style={styles.actionCardLeft}>
                      <Text style={styles.actionTitle}>
                        My Proposals
                      </Text>
                      <Text style={styles.actionSubtitle}>
                        View submitted bids and their status
                      </Text>
                    </View>
                    <FontAwesome name="chevron-right" size={18} color="#C5C4CC" />
                  </View>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Recent Activity
          </Text>
          {loading ? (
            <View style={styles.emptyStateCard}>
              <View style={styles.emptyStateContent}>
                <ActivityIndicator size="small" color="#E20010" />
              </View>
            </View>
          ) : recentActivity.length > 0 ? (
            <View style={styles.activityList}>
              {recentActivity.map((item) => {
                const statusColor = getStatusColor(item.status);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.activityCard}
                    onPress={() => {
                      if (item.type === 'request') {
                        router.push(`/requests/${item.id}` as any);
                      } else {
                        router.push(`/proposals/${item.id}` as any);
                      }
                    }}
                  >
                    <View style={styles.activityCardContent}>
                      <View style={styles.activityCardLeft}>
                        <Text style={styles.activityTitle} numberOfLines={1}>
                          {item.title}
                        </Text>
                        <View style={styles.activityMeta}>
                          <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
                            <Text style={[styles.statusBadgeText, { color: statusColor.text }]}>
                              {item.status.replace('_', ' ')}
                            </Text>
                          </View>
                          <Text style={styles.activityDate}>
                            {getRelativeTime(item.date)}
                          </Text>
                        </View>
                      </View>
                      <FontAwesome name="chevron-right" size={14} color="#C5C4CC" />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyStateCard}>
              <View style={styles.emptyStateContent}>
                <FontAwesome name="inbox" size={44} color="#C5C4CC" />
                <Text style={styles.emptyStateTitle}>
                  No recent activity
                </Text>
                <Text style={styles.emptyStateSubtitle}>
                  {isBuyer
                    ? 'Post your first service request to get started'
                    : 'Browse opportunities and submit your first proposal'}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  welcomeSection: {
    marginBottom: 24,
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerLogo: {
    width: 40,
    height: 40,
  },
  adminBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#5F6267',
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 20,
  },
  adminBannerText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#5F6267',
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: '#B3B8C4',
    lineHeight: 22,
  },
  roleSwitcherCard: {
    backgroundColor: '#FFF0F1',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FFC7CB',
  },
  roleSwitcherContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roleSwitcherLeft: {
    flex: 1,
  },
  roleSwitcherLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#5F6267',
    marginBottom: 6,
  },
  roleSwitcherBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleBadge: {
    backgroundColor: '#FFE0E2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  roleBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E20010',
  },
  roleSwitcherSubtext: {
    fontSize: 12,
    color: '#B3B8C4',
  },
  switchButton: {
    backgroundColor: '#E20010',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
    marginLeft: 6,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#5F6267',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 18,
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
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#E20010',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#B3B8C4',
  },
  actionsContainer: {
    gap: 12,
  },
  primaryActionCard: {
    backgroundColor: '#E20010',
    borderRadius: 8,
    padding: 18,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(226, 0, 16, 0.25)',
      },
      default: {
        shadowColor: '#E20010',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 3,
      },
    }),
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 18,
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
  actionCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionCardLeft: {
    flex: 1,
  },
  primaryActionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  primaryActionSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#5F6267',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#B3B8C4',
  },
  activityList: {
    gap: 10,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 14,
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
  activityCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activityCardLeft: {
    flex: 1,
    marginRight: 12,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5F6267',
    marginBottom: 6,
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  activityDate: {
    fontSize: 12,
    color: '#B3B8C4',
  },
  emptyStateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E6E9EF',
  },
  emptyStateContent: {
    alignItems: 'center',
    paddingVertical: 28,
  },
  emptyStateTitle: {
    color: '#B3B8C4',
    marginTop: 12,
    fontSize: 15,
    fontWeight: '500',
  },
  emptyStateSubtitle: {
    fontSize: 13,
    color: '#C5C4CC',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 16,
  },
});
