/**
 * Admin Projects Management Screen
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { getProjects } from '@/lib/api/admin';
import { showAlert } from '@/utils/alert';

const Colors = {
  primary: '#E20010',
  darkGray: '#5F6267',
  mediumGray: '#B3B8C4',
  background: '#F7F8FA',
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  active: { bg: '#D1FAE5', text: '#10B981' },
  completed: { bg: '#DBEAFE', text: '#3B82F6' },
  cancelled: { bg: '#FEE2E2', text: '#EF4444' },
};

export default function AdminProjectsScreen() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await getProjects();
      if (error) {
        showAlert('Error', 'Failed to fetch projects');
        setProjects([]);
      } else {
        setProjects(data || []);
      }
    } catch (err) {
      showAlert('Error', 'An error occurred');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Projects</Text>
        <Text style={styles.headerSubtitle}>{projects.length} total</Text>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading projects...</Text>
        </View>
      ) : projects.length === 0 ? (
        <View style={styles.centerContainer}>
          <FontAwesome name="folder-open" size={48} color={Colors.mediumGray} />
          <Text style={styles.emptyText}>No projects yet</Text>
        </View>
      ) : (
        <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
          {projects.map((project) => {
            const statusStyle = STATUS_COLORS[project.status] || STATUS_COLORS.active;
            return (
              <View key={project.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {project.request?.title || 'Untitled Project'}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                    <Text style={[styles.statusText, { color: statusStyle.text }]}>
                      {project.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.participantsRow}>
                  <View style={styles.participant}>
                    <FontAwesome name="user" size={12} color={Colors.primary} />
                    <Text style={styles.participantLabel}>Buyer:</Text>
                    <Text style={styles.participantName}>
                      {project.buyer?.full_name || 'Unknown'}
                    </Text>
                  </View>
                  <View style={styles.participant}>
                    <FontAwesome name="briefcase" size={12} color="#10B981" />
                    <Text style={styles.participantLabel}>Provider:</Text>
                    <Text style={styles.participantName}>
                      {project.provider?.full_name || 'Unknown'}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardBottom}>
                  <Text style={styles.dateText}>
                    Started: {formatDate(project.created_at)}
                  </Text>
                  {project.completed_at && (
                    <Text style={styles.dateText}>
                      Completed: {formatDate(project.completed_at)}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E6E9EF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.darkGray,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.mediumGray,
    marginTop: 2,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E6E9EF',
    ...Platform.select({
      web: { boxShadow: '0 1px 3px rgba(0,0,0,0.04)' },
      default: { elevation: 1 },
    }),
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardInfo: {
    flex: 1,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.darkGray,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  participantsRow: {
    gap: 8,
    marginBottom: 12,
  },
  participant: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  participantLabel: {
    fontSize: 12,
    color: Colors.mediumGray,
  },
  participantName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.darkGray,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F1F3',
    paddingTop: 10,
  },
  dateText: {
    fontSize: 12,
    color: Colors.mediumGray,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.mediumGray,
    marginTop: 12,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.mediumGray,
    marginTop: 12,
  },
});
