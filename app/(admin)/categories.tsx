/**
 * Admin Categories Management Screen
 * Supports: view, add, and edit categories
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { getCategories, createCategory, updateCategory } from '@/lib/api/admin';
import { showAlert } from '@/utils/alert';

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  max_distance_km: number | null;
}

const DISTANCE_OPTIONS = [
  { label: 'Local (5 km)', value: 5 },
  { label: 'City (30 km)', value: 30 },
  { label: 'Online (Unlimited)', value: null },
];

export default function AdminCategoriesScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state (for both add and edit)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formIcon, setFormIcon] = useState('tag');
  const [formDistanceType, setFormDistanceType] = useState<number | null>(30);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await getCategories();
    if (error) {
      console.error('Error fetching categories:', error);
    }
    setCategories(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setFormName('');
    setFormDescription('');
    setFormIcon('tag');
    setFormDistanceType(30);
    setEditingId(null);
    setShowForm(false);
  };

  const handleStartEdit = (cat: Category) => {
    setEditingId(cat.id);
    setFormName(cat.name);
    setFormDescription(cat.description);
    setFormIcon(cat.icon || 'tag');
    setFormDistanceType(cat.max_distance_km);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      showAlert('Error', 'Category name is required');
      return;
    }
    if (!formDescription.trim()) {
      showAlert('Error', 'Description is required');
      return;
    }

    setSaving(true);

    if (editingId) {
      // Update existing
      const { error } = await updateCategory(editingId, {
        name: formName.trim(),
        description: formDescription.trim(),
        icon: formIcon.trim() || 'tag',
        max_distance_km: formDistanceType,
      });

      if (error) {
        showAlert('Error', error.message || 'Failed to update category');
      } else {
        showAlert('Success', 'Category updated successfully');
        resetForm();
        fetchData();
      }
    } else {
      // Create new
      const { error } = await createCategory({
        name: formName.trim(),
        description: formDescription.trim(),
        icon: formIcon.trim() || 'tag',
        max_distance_km: formDistanceType,
      });

      if (error) {
        showAlert('Error', error.message || 'Failed to create category');
      } else {
        showAlert('Success', 'Category created successfully');
        resetForm();
        fetchData();
      }
    }
    setSaving(false);
  };

  const getDistanceLabel = (km: number | null) => {
    if (km === null) return 'Online (Unlimited)';
    return `Within ${km} km`;
  };

  const getDistanceColor = (km: number | null) => {
    if (km === null) return '#8B5CF6';
    if (km <= 5) return '#EF4444';
    return '#F59E0B';
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
          <Text style={styles.header}>Service Categories</Text>
          <Text style={styles.subtitle}>
            {categories.length} categories configured
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            if (showForm) {
              resetForm();
            } else {
              setEditingId(null);
              setShowForm(true);
            }
          }}
        >
          <FontAwesome name={showForm ? 'times' : 'plus'} size={14} color="#FFFFFF" />
          <Text style={styles.addButtonText}>
            {showForm ? 'Cancel' : 'Add Category'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Add/Edit Category Form */}
      {showForm && (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>
            {editingId ? 'Edit Category' : 'New Category'}
          </Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Category Name *</Text>
            <TextInput
              style={styles.input}
              value={formName}
              onChangeText={setFormName}
              placeholder="e.g., Interior Design"
              placeholderTextColor="#C5C4CC"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, { minHeight: 60 }]}
              value={formDescription}
              onChangeText={setFormDescription}
              placeholder="e.g., Home and office interior design services"
              placeholderTextColor="#C5C4CC"
              multiline
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Icon Name</Text>
            <View style={styles.iconPreviewRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={formIcon}
                onChangeText={setFormIcon}
                placeholder="FontAwesome icon name"
                placeholderTextColor="#C5C4CC"
              />
              <View style={styles.iconPreview}>
                <FontAwesome name={(formIcon || 'tag') as any} size={20} color="#E20010" />
              </View>
            </View>
            <Text style={styles.helpText}>FontAwesome icon (e.g., home, car, code, gavel, balance-scale)</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Service Range</Text>
            <View style={styles.distanceOptions}>
              {DISTANCE_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={String(opt.value)}
                  style={[
                    styles.distanceOption,
                    formDistanceType === opt.value && styles.distanceOptionActive,
                  ]}
                  onPress={() => setFormDistanceType(opt.value)}
                >
                  <Text
                    style={[
                      styles.distanceOptionText,
                      formDistanceType === opt.value && styles.distanceOptionTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? 'Saving...' : editingId ? 'Update Category' : 'Create Category'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Group by distance type */}
      {[
        { label: 'Local Services', filter: (c: Category) => c.max_distance_km !== null && c.max_distance_km <= 5 },
        { label: 'City Services', filter: (c: Category) => c.max_distance_km !== null && c.max_distance_km > 5 },
        { label: 'Online Services', filter: (c: Category) => c.max_distance_km === null },
      ].map((group) => {
        const groupCats = categories.filter(group.filter);
        if (groupCats.length === 0) return null;
        return (
          <View key={group.label}>
            <Text style={styles.groupTitle}>{group.label}</Text>
            {groupCats.map((cat) => (
              <View key={cat.id} style={styles.card}>
                <View style={styles.cardRow}>
                  <View style={styles.cardLeft}>
                    <View style={[styles.iconCircle, { backgroundColor: '#FFF0F1' }]}>
                      <FontAwesome name={(cat.icon || 'tag') as any} size={16} color="#E20010" />
                    </View>
                    <View style={styles.cardInfo}>
                      <Text style={styles.cardTitle}>{cat.name}</Text>
                      <Text style={styles.cardDesc} numberOfLines={1}>
                        {cat.description}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.cardActions}>
                    <View
                      style={[
                        styles.distanceBadge,
                        { backgroundColor: getDistanceColor(cat.max_distance_km) + '20' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.distanceBadgeText,
                          { color: getDistanceColor(cat.max_distance_km) },
                        ]}
                      >
                        {getDistanceLabel(cat.max_distance_km)}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => handleStartEdit(cat)}
                    >
                      <FontAwesome name="pencil" size={13} color="#5F6267" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        );
      })}
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
  helpText: {
    fontSize: 11,
    color: '#B3B8C4',
    marginTop: 4,
  },
  iconPreviewRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  iconPreview: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#FFF0F1',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFC7CB',
  },
  distanceOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  distanceOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E6E9EF',
    backgroundColor: '#F7F8FA',
  },
  distanceOptionActive: {
    borderColor: '#E20010',
    backgroundColor: '#FFF0F1',
  },
  distanceOptionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#B3B8C4',
  },
  distanceOptionTextActive: {
    color: '#E20010',
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
  groupTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#B3B8C4',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginTop: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E6E9EF',
    ...Platform.select({
      web: {
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
      },
      default: {
        elevation: 1,
      },
    }),
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#5F6267',
  },
  cardDesc: {
    fontSize: 12,
    color: '#B3B8C4',
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  distanceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  distanceBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#F7F8FA',
    borderWidth: 1,
    borderColor: '#E6E9EF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
