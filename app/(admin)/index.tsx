import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import { getAdminStats } from '@/lib/api/admin';

interface AdminStats {
  totalUsers: number;
  totalProviders: number;
  totalRequests: number;
  totalProjects?: number;
}

interface StatCard {
  icon: string;
  label: string;
  value: number;
  route: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        const data = await getAdminStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  const statCards: StatCard[] = stats
    ? [
        {
          icon: 'users',
          label: 'Total Users',
          value: stats.totalUsers,
          route: '/(admin)/users',
        },
        {
          icon: 'briefcase',
          label: 'Total Providers',
          value: stats.totalProviders,
          route: '/(admin)/providers',
        },
        {
          icon: 'list',
          label: 'Total Requests',
          value: stats.totalRequests,
          route: '/(admin)/requests',
        },
      ]
    : [];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={'#E20010'} />
        </View>
      ) : (
        <View style={styles.gridContainer}>
          {statCards.map((card, index) => (
            <TouchableOpacity
              key={index}
              style={styles.cardWrapper}
              onPress={() => router.push(card.route as any)}
              activeOpacity={0.7}
            >
              <View style={styles.statCard}>
                <View style={styles.iconContainer}>
                  <FontAwesome
                    name={card.icon as any}
                    size={32}
                    color={'#E20010'}
                  />
                </View>
                <Text style={styles.statValue}>{card.value}</Text>
                <Text style={styles.statLabel}>{card.label}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  headerContainer: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#5F6267',
    marginBottom: 8,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 400,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  cardWrapper: {
    width: '48%',
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
      },
      native: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
      },
    }),
  },
  iconContainer: {
    marginBottom: 12,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#5F6267',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#B3B8C4',
    textAlign: 'center',
  },
});
