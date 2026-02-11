/**
 * Project Details Screen - View project information and manage progress
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

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { activeRole } = useRoleStore();
  const { getCategoryById } = useCategoryLookup();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjectDetails();
  }, [id]);

  const loadProjectDetails = async () => {
    try {
      const projectsJson = await AsyncStorage.getItem('projects');
      if (projectsJson) {
        const projects = JSON.parse(projectsJson);
        const foundProject = projects.find((p: any) => p.id === id);
        setProject(foundProject);
      }
    } catch (error) {
      console.error('Error loading project details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsCompleted = async () => {
    showAlert(
      'Mark as Completed',
      'Are you sure you want to mark this project as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          style: 'default',
          onPress: async () => {
            try {
              const projectsJson = await AsyncStorage.getItem('projects');
              if (projectsJson) {
                const projects = JSON.parse(projectsJson);
                const updatedProjects = projects.map((p: any) =>
                  p.id === project.id
                    ? { ...p, status: 'completed', completed_at: new Date().toISOString() }
                    : p
                );
                await AsyncStorage.setItem('projects', JSON.stringify(updatedProjects));
                setProject({ ...project, status: 'completed', completed_at: new Date().toISOString() });
                showAlert('Success', 'Project marked as completed!');
              }
            } catch (error) {
              console.error('Error completing project:', error);
              showAlert('Error', 'Failed to update project status.');
            }
          },
        },
      ]
    );
  };

  const handleOpenChat = () => {
    router.push(`/projects/${project.id}/chat`);
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/(tabs)/projects');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <FontAwesome name="arrow-left" size={20} color="#E20010" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Project Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#B3B8C4' }}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (!project) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <FontAwesome name="arrow-left" size={20} color="#E20010" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Project Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorContainer}>
          <FontAwesome name="exclamation-triangle" size={48} color="#EF4444" />
          <Text style={styles.errorTitle}>Project Not Found</Text>
          <Text style={styles.errorText}>
            The project you're looking for doesn't exist.
          </Text>
        </View>
      </View>
    );
  }

  const category = getCategoryById(project.category_id);
  const isBuyer = activeRole === 'buyer';
  const otherParty = isBuyer ? project.provider_name : project.buyer_name;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color="#E20010" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Project Details</Text>
        <TouchableOpacity onPress={handleOpenChat} style={styles.chatButton}>
          <FontAwesome name="comments" size={20} color="#E20010" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Project Overview Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            {category && (
              <View style={styles.categoryBadge}>
                <FontAwesome name={category.icon as any} size={14} color={category.color} />
                <Text style={styles.categoryText}>{category.name}</Text>
              </View>
            )}
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    project.status === 'active' ? '#10B98120' : '#B3B8C420',
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  {
                    color: project.status === 'active' ? '#10B981' : '#B3B8C4',
                  },
                ]}
              >
                {project.status === 'active' ? 'Active' : 'Completed'}
              </Text>
            </View>
          </View>

          <Text style={styles.projectTitle}>{project.request_title}</Text>
          <Text style={styles.description}>{project.request_description}</Text>

          <View style={styles.divider} />

          {/* Project Details */}
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <FontAwesome name="money" size={18} color="#10B981" />
              </View>
              <View>
                <Text style={styles.detailLabel}>Budget</Text>
                <Text style={styles.detailValue}>₹{project.budget?.toLocaleString()}</Text>
              </View>
            </View>

            {project.timeline && (
              <View style={styles.detailItem}>
                <View style={styles.detailIcon}>
                  <FontAwesome name="clock-o" size={18} color="#F59E0B" />
                </View>
                <View>
                  <Text style={styles.detailLabel}>Timeline</Text>
                  <Text style={styles.detailValue}>{project.timeline}</Text>
                </View>
              </View>
            )}

            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <FontAwesome name="calendar" size={18} color="#B3B8C4" />
              </View>
              <View>
                <Text style={styles.detailLabel}>Started</Text>
                <Text style={styles.detailValue}>
                  {new Date(project.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Other Party Info */}
          <Text style={styles.sectionTitle}>
            {isBuyer ? 'Service Provider' : 'Client'}
          </Text>
          <View style={styles.userCard}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>{otherParty?.charAt(0) || 'U'}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{otherParty}</Text>
              <Text style={styles.userRole}>{isBuyer ? 'Provider' : 'Buyer'}</Text>
            </View>
            <TouchableOpacity onPress={handleOpenChat} style={styles.messageIconButton}>
              <FontAwesome name="comment" size={18} color="#E20010" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        {project.status === 'active' && (
          <View style={styles.actionsCard}>
            <TouchableOpacity style={styles.chatButton2} onPress={handleOpenChat}>
              <FontAwesome name="comments" size={16} color="#FFFFFF" />
              <Text style={styles.chatButtonText}>Open Chat</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.completeButton}
              onPress={handleMarkAsCompleted}
            >
              <FontAwesome name="check-circle" size={16} color="#FFFFFF" />
              <Text style={styles.completeButtonText}>Mark as Completed</Text>
            </TouchableOpacity>
          </View>
        )}

        {project.status === 'completed' && (
          <View style={styles.completedCard}>
            <FontAwesome name="check-circle" size={32} color="#10B981" />
            <Text style={styles.completedTitle}>Project Completed!</Text>
            <Text style={styles.completedText}>
              Completed on{' '}
              {new Date(project.completed_at).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
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
  backButton: {
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
  chatButton: {
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6E9EF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
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
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  projectTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#5F6267',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#B3B8C4',
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: '#E6E9EF',
    marginVertical: 20,
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
    color: '#B3B8C4',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#5F6267',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#5F6267',
    marginBottom: 12,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F8FA',
    padding: 12,
    borderRadius: 8,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E20010',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#5F6267',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 13,
    color: '#B3B8C4',
  },
  messageIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF0F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsCard: {
    gap: 12,
    marginBottom: 16,
  },
  chatButton2: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E20010',
    paddingVertical: 14,
    borderRadius: 8,
  },
  chatButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  completeButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 8,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  completedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 32,
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
      },
    }),
  },
  completedTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#10B981',
    marginTop: 12,
    marginBottom: 8,
  },
  completedText: {
    fontSize: 14,
    color: '#B3B8C4',
    textAlign: 'center',
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
  },
});
