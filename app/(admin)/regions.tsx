/**
 * Admin Regions Management Screen
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { getRegions, createRegion, updateRegion, deleteRegion } from '@/lib/api/admin';
import { showAlert } from '@/utils/alert';

interface Region {
  id: string;
  name: string;
  city: string;
  state: string | null;
  country: string;
  lat: number | null;
  lng: number | null;
  radius_km: number;
  is_active: boolean;
}

export default function AdminRegionsScreen() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formState, setFormState] = useState('');
  const [formRadius, setFormRadius] = useState('30');
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await getRegions();
    if (error) console.error('Error fetching regions:', error);
    setRegions(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async () => {
    if (!formName.trim() || !formCity.trim()) {
      showAlert('Error', 'Name and City are required');
      return;
    }

    setSaving(true);
    const { error } = await createRegion({
      name: formName.trim(),
      city: formCity.trim(),
      state: formState.trim() || undefined,
      radius_km: parseInt(formRadius) || 30,
    });

    if (error) {
      showAlert('Error', error.message);
    } else {
      setFormName('');
      setFormCity('');
      setFormState('');
      setFormRadius('30');
      setShowForm(false);
      fetchData();
    }
    setSaving(false);
  };

  const handleToggleActive = async (region: Region) => {
    const { error } = await updateRegion(region.id, {
      is_active: !region.is_active,
    });
    if (error) {
      showAlert('Error', error.message);
    } else {
      fetchData();
    }
  };

  const handleDelete = (region: Region) => {
    showAlert(
      'Delete Region',
      `Are you sure you want to delete "${region.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error } = await deleteRegion(region.id);
            if (error) {
              showAlert('Error', error.message);
            } else {
              fetchData();
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E20010" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.header}>Service Regions</Text>
          <Text style={styles.subtitle}>
            {regions.length} regions configured
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowForm(!showForm)}
        >
          <FontAwesome name={showForm ? 'times' : 'plus'} size={14} color="#FFFFFF" />
          <Text style={styles.addButtonText}>
            {showForm ? 'Cancel' : 'Add Region'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Add Region Form */}
      {showForm && (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>New Region</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Region Name *</Text>
            <TextInput
              style={styles.input}
              value={formName}
              onChangeText={setFormName}
              placeholder="e.g., Mumbai Metro"
              placeholderTextColor="#C5C4CC"
            />
          </View>

          <View style={styles.formRow}>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>City *</Text>
              <TextInput
                style={styles.input}
                value={formCity}
                onChangeText={setFormCity}
                placeholder="e.g., Mumbai"
                placeholderTextColor="#C5C4CC"
              />
            </View>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>State</Text>
              <TextInput
                style={styles.input}
                value={formState}
                onChangeText={setFormState}
                placeholder="e.g., Maharashtra"
                placeholderTextColor="#C5C4CC"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Radius (km)</Text>
            <TextInput
              style={styles.input}
              value={formRadius}
              onChangeText={setFormRadius}
              placeholder="30"
              keyboardType="numeric"
              placeholderTextColor="#C5C4CC"
            />
          </View>

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleCreate}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? 'Saving...' : 'Create Region'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <FontAwesome name="info-circle" size={14} color="#3B82F6" />
        <Text style={styles.infoBannerText}>
          Regions are auto-created when users update their profile with a city. New regions start as Inactive — activate them when ready.
        </Text>
      </View>

      {/* Regions List */}
      {regions.length === 0 ? (
        <View style={styles.emptyState}>
          <FontAwesome name="map-o" size={44} color="#C5C4CC" />
          <Text style={styles.emptyTitle}>No regions yet</Text>
          <Text style={styles.emptyText}>
            Regions will appear here as users join from different cities
          </Text>
        </View>
      ) : (
        regions.map((region) => (
          <View key={region.id} style={styles.regionCard}>
            <View style={styles.regionHeader}>
              <View style={styles.regionInfo}>
                <View style={styles.regionNameRow}>
                  <FontAwesome name="map-marker" size={16} color="#E20010" />
                  <Text style={styles.regionName}>{region.name}</Text>
                </View>
                <Text style={styles.regionLocation}>
                  {region.city}{region.state ? `, ${region.state}` : ''} — {region.radius_km}km radius
                </Text>
              </View>

              <View style={styles.regionActions}>
                <TouchableOpacity
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: region.is_active ? '#D1FAE5' : '#FEE2E2',
                    },
                  ]}
                  onPress={() => handleToggleActive(region)}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: region.is_active ? '#10B981' : '#EF4444' },
                    ]}
                  >
                    {region.is_active ? 'Active' : 'Inactive'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(region)}
                >
                  <FontAwesome name="trash" size={14} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#5F6267',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#B3B8C4',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E20010',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E6E9EF',
    ...Platform.select({
      web: { boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
      default: { elevation: 2 },
    }),
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#5F6267',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5F6267',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F7F8FA',
    borderWidth: 1,
    borderColor: '#E6E9EF',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#5F6267',
  },
  saveButton: {
    backgroundColor: '#E20010',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#C5C4CC',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  regionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E6E9EF',
    ...Platform.select({
      web: { boxShadow: '0 1px 3px rgba(0,0,0,0.04)' },
      default: { elevation: 1 },
    }),
  },
  regionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  regionInfo: {
    flex: 1,
  },
  regionNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  regionName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#5F6267',
  },
  regionLocation: {
    fontSize: 13,
    color: '#B3B8C4',
    marginLeft: 24,
  },
  regionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 56,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#5F6267',
    marginTop: 14,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    color: '#C5C4CC',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#3B82F6',
    lineHeight: 18,
  },
});
