/**
 * Projects Screen - Shows active projects for both buyers and providers
 */

import React, { useState } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCategoryLookup } from '@/lib/useCategoryLookup';
import { useRoleStore } from '@/store/roleStore';
import { useAuthStore } from '@/store/authStore';

export default function ProjectsScreen() {
  const { activeRole } = useRoleStore();
  const { user } = useAuthStore();
  const { getCategoryById } = useCategoryLookup();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const loadProjects = async () => {
    try {
      const projectsJson = await AsyncStorage.getItem('projects');
      if (projectsJson) {
        const allProjects = JSON.parse(projectsJson);
        // Filter based on user role
        const userProjects = allProjects.filter((p: any) => {
          if (activeRole === 'buyer') {
            return p.buyer_id === user?.id || p.request?.buyer?.email === user?.email;
          } else {
            return p.provider_id === user?.id || p.provider?.email === user?.email;
          }
        });
        setProjects(userProjects);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadProjects();
    }, [activeRole])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadProjects();
  };

  const getFilteredProjects = () => {
    if (filter === 'all') return projects;
    return projects.filter((p) => {
      if (filter === 'active') return p.status === 'active';
      if (filter === 'completed') return p.status === 'completed';
      return true;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'completed': return '#B3B8C4';
      case 'cancelled': return '#EF4444';
      default: return '#B3B8C4';
    }
  };

  const filteredProjects = getFilteredProjects();

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#B3B8C4' }}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All ({projects.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'active' && styles.filterTabActive]}
          onPress={() => setFilter('active')}
        >
          <Text style={[styles.filterText, filter === 'active' && styles.filterTextActive]}>
            Active ({projects.filter(p => p.status === 'active').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'completed' && styles.filterTabActive]}
          onPress={() => setFilter('completed')}
        >
          <Text style={[styles.filterText, filter === 'completed' && styles.filterTextActive]}>
            Completed ({projects.filter(p => p.status === 'completed').length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredProjects.length === 0 ? (
          <View style={styles.emptyCard}>
            <FontAwesome name="briefcase" size={64} color="#E6E9EF" />
            <Text style={styles.emptyTitle}>No Projects Yet</Text>
            <Text style={styles.emptyText}>
              {activeRole === 'buyer'
                ? 'Accept a proposal to start your first project'
                : 'Your accepted proposals will appear here as projects'}
            </Text>
          </View>
        ) : (
          <>
            {filteredProjects.map((project) => {
              const category = getCategoryById(project.category_id);
              return (
                <TouchableOpacity
                  key={project.id}
                  style={styles.projectCard}
                  onPress={() => router.push(`/projects/${project.id}`)}
                >
                  <View style={styles.projectHeader}>
                    {category && (
                      <View style={styles.categoryBadge}>
                        <FontAwesome
                          name={category.icon as any}
                          size={14}
                          color={category.color}
                        />
                        <Text style={styles.categoryText}>{category.name}</Text>
                      </View>
                    )}
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: `${getStatusColor(project.status)}20` },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(project.status) },
                        ]}
                      >
                        {project.status === 'active' ? 'Active' : 'Completed'}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.projectTitle} numberOfLines={2}>
                    {project.request_title}
                  </Text>

                  <View style={styles.projectInfo}>
                    <View style={styles.infoItem}>
                      <FontAwesome name="user" size={14} color="#B3B8C4" />
                      <Text style={styles.infoText}>
                        {activeRole === 'buyer' ? project.provider_name : project.buyer_name}
                      </Text>
                    </View>
                    <View style={styles.infoItem}>
                      <FontAwesome name="money" size={14} color="#B3B8C4" />
                      <Text style={styles.infoText}>₹{project.budget?.toLocaleString()}</Text>
                    </View>
                  </View>

                  {project.timeline && (
                    <View style={styles.timeline}>
                      <FontAwesome name="clock-o" size={14} color="#B3B8C4" />
                      <Text style={styles.timelineText}>{project.timeline}</Text>
                    </View>
                  )}
                </TouchableOpacity>
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
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E6E9EF',
    gap: 12,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E6E9EF',
  },
  filterTabActive: {
    backgroundColor: '#E20010',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B3B8C4',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 48,
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#5F6267',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#B3B8C4',
    textAlign: 'center',
  },
  projectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
      },
    }),
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6E9EF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5F6267',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5F6267',
    marginBottom: 12,
  },
  projectInfo: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#B3B8C4',
  },
  timeline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E6E9EF',
  },
  timelineText: {
    fontSize: 13,
    color: '#B3B8C4',
  },
});
