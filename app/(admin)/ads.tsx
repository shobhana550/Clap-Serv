/**
 * Admin — Hyperlocal Ads Management
 * Create, toggle, and delete in-app ad banners visible on the home screen.
 */

import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, ActivityIndicator, Switch,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { getAds, createAd, toggleAdActive, deleteAd } from '@/lib/api/admin';
import { showAlert } from '@/utils/alert';

interface Ad {
  id: string;
  title: string;
  subtitle: string | null;
  cta_text: string;
  cta_url: string | null;
  bg_color: string;
  text_color: string;
  is_active: boolean;
  target_city: string | null;
  created_at: string;
}

const DEFAULT_FORM = {
  title: '',
  subtitle: '',
  cta_text: 'Learn More',
  cta_url: '',
  bg_color: '#E20010',
  text_color: '#FFFFFF',
  target_city: '',
};

export default function AdsAdminScreen() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);

  const fetchAds = async () => {
    setLoading(true);
    const { data, error } = await getAds();
    if (!error && data) setAds(data as Ad[]);
    setLoading(false);
  };

  useEffect(() => { fetchAds(); }, []);

  const handleCreate = async () => {
    if (!form.title.trim()) {
      showAlert('Validation', 'Title is required.');
      return;
    }
    if (!form.cta_text.trim()) {
      showAlert('Validation', 'CTA button text is required.');
      return;
    }
    setSaving(true);
    const { error } = await createAd({
      title: form.title.trim(),
      subtitle: form.subtitle.trim() || undefined,
      cta_text: form.cta_text.trim(),
      cta_url: form.cta_url.trim() || undefined,
      bg_color: form.bg_color.trim() || '#E20010',
      text_color: form.text_color.trim() || '#FFFFFF',
      target_city: form.target_city.trim() || undefined,
    });
    setSaving(false);
    if (error) {
      showAlert('Error', error.message || 'Failed to create ad.');
    } else {
      setForm(DEFAULT_FORM);
      setShowForm(false);
      fetchAds();
    }
  };

  const handleToggle = async (ad: Ad) => {
    const { error } = await toggleAdActive(ad.id, !ad.is_active);
    if (error) {
      showAlert('Error', error.message || 'Failed to update ad.');
    } else {
      setAds((prev) => prev.map((a) => a.id === ad.id ? { ...a, is_active: !a.is_active } : a));
    }
  };

  const handleDelete = async (id: string) => {
    showAlert(
      'Delete Ad',
      'Are you sure you want to delete this ad? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            const { error } = await deleteAd(id);
            if (error) {
              showAlert('Error', error.message || 'Failed to delete ad.');
            } else {
              setAds((prev) => prev.filter((a) => a.id !== id));
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Page Header */}
      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>Hyperlocal Ads</Text>
          <Text style={styles.pageSubtitle}>
            Banners shown at the top of the home screen for all users
          </Text>
        </View>
        <TouchableOpacity
          style={styles.newButton}
          onPress={() => setShowForm(!showForm)}
        >
          <FontAwesome name={showForm ? 'times' : 'plus'} size={14} color="#FFFFFF" />
          <Text style={styles.newButtonText}>{showForm ? 'Cancel' : 'New Ad'}</Text>
        </TouchableOpacity>
      </View>

      {/* Create Form */}
      {showForm && (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Create New Ad</Text>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Title <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              value={form.title}
              onChangeText={(v) => setForm({ ...form, title: v })}
              placeholder="e.g., Grow Your Business Locally"
              placeholderTextColor="#C5C4CC"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Subtitle</Text>
            <TextInput
              style={styles.input}
              value={form.subtitle}
              onChangeText={(v) => setForm({ ...form, subtitle: v })}
              placeholder="Short supporting line (optional)"
              placeholderTextColor="#C5C4CC"
            />
          </View>

          <View style={styles.formRow}>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.formLabel}>CTA Button Text <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.input}
                value={form.cta_text}
                onChangeText={(v) => setForm({ ...form, cta_text: v })}
                placeholder="Learn More"
                placeholderTextColor="#C5C4CC"
              />
            </View>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.formLabel}>CTA URL</Text>
              <TextInput
                style={styles.input}
                value={form.cta_url}
                onChangeText={(v) => setForm({ ...form, cta_url: v })}
                placeholder="https://..."
                placeholderTextColor="#C5C4CC"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.formLabel}>Background Color</Text>
              <View style={styles.colorRow}>
                <View style={[styles.colorSwatch, { backgroundColor: form.bg_color || '#E20010' }]} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={form.bg_color}
                  onChangeText={(v) => setForm({ ...form, bg_color: v })}
                  placeholder="#E20010"
                  placeholderTextColor="#C5C4CC"
                  autoCapitalize="none"
                />
              </View>
            </View>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.formLabel}>Text Color</Text>
              <View style={styles.colorRow}>
                <View style={[styles.colorSwatch, { backgroundColor: form.text_color || '#FFFFFF', borderWidth: 1, borderColor: '#E6E9EF' }]} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={form.text_color}
                  onChangeText={(v) => setForm({ ...form, text_color: v })}
                  placeholder="#FFFFFF"
                  placeholderTextColor="#C5C4CC"
                  autoCapitalize="none"
                />
              </View>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Target City <Text style={styles.muted}>(leave blank to show to all cities)</Text></Text>
            <TextInput
              style={styles.input}
              value={form.target_city}
              onChangeText={(v) => setForm({ ...form, target_city: v })}
              placeholder="e.g., Mumbai"
              placeholderTextColor="#C5C4CC"
            />
          </View>

          {/* Preview */}
          <Text style={styles.previewLabel}>Preview</Text>
          <View style={[styles.adPreview, { backgroundColor: form.bg_color || '#E20010' }]}>
            <View style={styles.adPreviewLeft}>
              <View style={styles.adBadge}><Text style={styles.adBadgeText}>Ad</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.adPreviewTitle, { color: form.text_color || '#FFFFFF' }]} numberOfLines={1}>
                  {form.title || 'Ad Title'}
                </Text>
                {form.subtitle ? (
                  <Text style={[styles.adPreviewSubtitle, { color: form.text_color || '#FFFFFF' }]} numberOfLines={1}>
                    {form.subtitle}
                  </Text>
                ) : null}
              </View>
            </View>
            <View style={[styles.adPreviewCta, { borderColor: form.text_color || '#FFFFFF' }]}>
              <Text style={[styles.adPreviewCtaText, { color: form.text_color || '#FFFFFF' }]}>
                {form.cta_text || 'Learn More'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleCreate}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <FontAwesome name="check" size={14} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Create Ad (starts inactive)</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Ads List */}
      {loading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color="#E20010" />
        </View>
      ) : ads.length === 0 ? (
        <View style={styles.emptyState}>
          <FontAwesome name="bullhorn" size={40} color="#C5C4CC" />
          <Text style={styles.emptyTitle}>No ads yet</Text>
          <Text style={styles.emptySubtitle}>Create your first hyperlocal ad banner above</Text>
        </View>
      ) : (
        <View style={styles.adsList}>
          {ads.map((ad) => (
            <View key={ad.id} style={styles.adRow}>
              {/* Mini Preview */}
              <View style={[styles.adMiniPreview, { backgroundColor: ad.bg_color }]}>
                <Text style={[styles.adMiniTitle, { color: ad.text_color }]} numberOfLines={1}>
                  {ad.title}
                </Text>
                {ad.subtitle ? (
                  <Text style={[styles.adMiniSubtitle, { color: ad.text_color }]} numberOfLines={1}>
                    {ad.subtitle}
                  </Text>
                ) : null}
              </View>

              {/* Controls */}
              <View style={styles.adControls}>
                <View style={styles.adMeta}>
                  {ad.target_city ? (
                    <View style={styles.cityBadge}>
                      <FontAwesome name="map-marker" size={10} color="#3B82F6" />
                      <Text style={styles.cityBadgeText}>{ad.target_city}</Text>
                    </View>
                  ) : (
                    <View style={styles.cityBadge}>
                      <FontAwesome name="globe" size={10} color="#10B981" />
                      <Text style={[styles.cityBadgeText, { color: '#10B981' }]}>All cities</Text>
                    </View>
                  )}
                  <Text style={styles.adDate}>
                    {new Date(ad.created_at).toLocaleDateString('en-IN')}
                  </Text>
                </View>

                <View style={styles.adActions}>
                  <View style={styles.toggleRow}>
                    <Text style={[styles.toggleLabel, { color: ad.is_active ? '#10B981' : '#B3B8C4' }]}>
                      {ad.is_active ? 'Live' : 'Off'}
                    </Text>
                    <Switch
                      value={ad.is_active}
                      onValueChange={() => handleToggle(ad)}
                      trackColor={{ false: '#E6E9EF', true: '#10B981' }}
                      thumbColor="#FFFFFF"
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(ad.id)}
                  >
                    <FontAwesome name="trash" size={14} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F8FA' },
  content: { padding: 24, paddingBottom: 60 },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  pageTitle: { fontSize: 22, fontWeight: '700', color: '#5F6267', marginBottom: 4 },
  pageSubtitle: { fontSize: 13, color: '#B3B8C4', maxWidth: 300 },
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E20010',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  newButtonText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },

  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E6E9EF',
  },
  formTitle: { fontSize: 16, fontWeight: '700', color: '#5F6267', marginBottom: 16 },
  formGroup: { marginBottom: 14 },
  formRow: { flexDirection: 'row', gap: 12 },
  formLabel: { fontSize: 12, fontWeight: '600', color: '#5F6267', marginBottom: 6 },
  required: { color: '#EF4444' },
  muted: { color: '#B3B8C4', fontWeight: '400' },
  input: {
    backgroundColor: '#F7F8FA',
    borderWidth: 1,
    borderColor: '#E6E9EF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#5F6267',
  },
  colorRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  colorSwatch: { width: 32, height: 32, borderRadius: 6 },

  previewLabel: { fontSize: 12, fontWeight: '600', color: '#B3B8C4', marginBottom: 8, marginTop: 4 },
  adPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    gap: 10,
  },
  adPreviewLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  adBadge: { backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  adBadgeText: { fontSize: 10, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.5 },
  adPreviewTitle: { fontSize: 14, fontWeight: '700' },
  adPreviewSubtitle: { fontSize: 12, opacity: 0.85, marginTop: 1 },
  adPreviewCta: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5 },
  adPreviewCtaText: { fontSize: 12, fontWeight: '700' },

  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#E20010',
    borderRadius: 8,
    paddingVertical: 13,
  },
  saveButtonDisabled: { backgroundColor: '#C5C4CC' },
  saveButtonText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },

  loadingState: { alignItems: 'center', paddingVertical: 48 },
  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyTitle: { fontSize: 17, fontWeight: '600', color: '#5F6267', marginTop: 14, marginBottom: 6 },
  emptySubtitle: { fontSize: 13, color: '#C5C4CC', textAlign: 'center' },

  adsList: { gap: 12 },
  adRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6E9EF',
    overflow: 'hidden',
  },
  adMiniPreview: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  adMiniTitle: { fontSize: 14, fontWeight: '700' },
  adMiniSubtitle: { fontSize: 12, opacity: 0.85, marginTop: 2 },
  adControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F7F8FA',
  },
  adMeta: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  cityBadgeText: { fontSize: 11, fontWeight: '600', color: '#3B82F6' },
  adDate: { fontSize: 11, color: '#B3B8C4' },
  adActions: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  toggleLabel: { fontSize: 12, fontWeight: '600' },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
