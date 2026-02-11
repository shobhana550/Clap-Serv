/**
 * Edit Profile Screen - Update user information
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useUserStore } from '@/store/userStore';
import { useAuthStore } from '@/store/authStore';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { showAlert } from '@/utils/alert';
import { CategoryMultiSelect } from '@/components/ui/CategoryMultiSelect';
import { getCurrentLocation } from '@/lib/utils/location';
import { autoCreateRegion } from '@/lib/api/admin';

export default function EditProfileScreen() {
  const { profile, providerProfile, updateProfile, fetchProfile, fetchProviderProfile } = useUserStore();
  const { user } = useAuthStore();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [bio, setBio] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      const loc = (profile as any).location;
      if (loc) {
        setCity(loc.city || '');
        setState(loc.state || '');
        setZipCode(loc.zip_code || '');
      }
    }
    if (providerProfile) {
      setBio(providerProfile.bio || '');
      setHourlyRate(providerProfile.hourly_rate?.toString() || '');
      setSelectedSkills(providerProfile.skills || []);
    }
  }, [profile, providerProfile]);

  const handleSave = async () => {
    if (!fullName.trim()) {
      showAlert('Error', 'Full name is required');
      return;
    }

    setSaving(true);
    try {
      const updates: any = {
        full_name: fullName.trim(),
        phone: phone.trim() || null,
      };

      // Add location if city or zip code is provided
      if (city.trim() || zipCode.trim()) {
        updates.location = {
          city: city.trim() || null,
          state: state.trim() || null,
          zip_code: zipCode.trim() || null,
        };
      }

      await updateProfile(user?.id!, updates);

      // Auto-create region if city is set
      if (city.trim()) {
        try {
          await autoCreateRegion(city.trim(), state.trim() || undefined);
        } catch (e) {
          // Silently fail - region creation is optional
          console.log('Auto-region creation skipped:', e);
        }
      }

      // If provider, update provider profile too
      if (profile?.role === 'provider' || profile?.role === 'both') {
        const providerUpdates: any = {
          bio: bio.trim() || null,
          hourly_rate: hourlyRate ? parseFloat(hourlyRate) : null,
          skills: selectedSkills,
        };

        // Call API to update provider profile
        const { supabase } = await import('@/lib/supabase');
        const { error } = await supabase
          .from('provider_profiles')
          .update(providerUpdates)
          .eq('user_id', user?.id!);

        if (error) {
          console.error('Error updating provider profile:', error);
          showAlert('Warning', 'Profile updated but provider details failed');
        }
      }

      // Refresh profile and provider profile
      await fetchProfile(user?.id!);
      if (isProvider) {
        await fetchProviderProfile(user?.id!);
      }

      showAlert('Success', 'Profile updated successfully!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      console.error('Error saving profile:', error);
      showAlert('Error', error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const isProvider = profile?.role === 'provider' || profile?.role === 'both';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color="#E20010" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Basic Information Card */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Basic Information</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
            placeholderTextColor="#C5C4CC"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email (Read-only)</Text>
          <TextInput
            style={[styles.input, styles.inputDisabled]}
            value={user?.email || profile?.email || ''}
            editable={false}
          />
          <Text style={styles.helpText}>Email cannot be changed</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="+1 (555) 123-4567"
            placeholderTextColor="#C5C4CC"
            keyboardType="phone-pad"
          />
        </View>

        {/* Location Fields */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Location</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <TextInput
                style={styles.input}
                value={city}
                onChangeText={setCity}
                placeholder="City"
                placeholderTextColor="#C5C4CC"
              />
            </View>
            <View style={{ flex: 1 }}>
              <TextInput
                style={styles.input}
                value={state}
                onChangeText={setState}
                placeholder="State"
                placeholderTextColor="#C5C4CC"
              />
            </View>
          </View>
          <TextInput
            style={[styles.input, { marginTop: 12 }]}
            value={zipCode}
            onChangeText={setZipCode}
            placeholder="Zip / Pin Code"
            placeholderTextColor="#C5C4CC"
            keyboardType="number-pad"
          />
          <TouchableOpacity
            style={styles.detectButton}
            onPress={async () => {
              setDetectingLocation(true);
              try {
                const loc = await getCurrentLocation();
                if (loc) {
                  setCity(loc.city || '');
                  setState(loc.state || '');
                } else {
                  showAlert('Error', 'Could not detect your location. Please enter manually.');
                }
              } catch (e) {
                showAlert('Error', 'Location detection failed. Please enter manually.');
              } finally {
                setDetectingLocation(false);
              }
            }}
            disabled={detectingLocation}
          >
            {detectingLocation ? (
              <ActivityIndicator size="small" color="#E20010" />
            ) : (
              <>
                <FontAwesome name="map-marker" size={14} color="#E20010" />
                <Text style={styles.detectButtonText}>Detect My Location</Text>
              </>
            )}
          </TouchableOpacity>
          <Text style={styles.helpText}>Your location or zip code helps match you with nearby services</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Role (Read-only)</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {profile?.role === 'both'
                ? 'Buyer & Provider'
                : profile?.role === 'buyer'
                ? 'Buyer'
                : 'Provider'}
            </Text>
          </View>
          <Text style={styles.helpText}>
            Contact support to change your role
          </Text>
        </View>
      </View>

      {/* Provider Information Card */}
      {isProvider && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Provider Details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell buyers about yourself and your services..."
              placeholderTextColor="#C5C4CC"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Hourly Rate ($)</Text>
            <TextInput
              style={styles.input}
              value={hourlyRate}
              onChangeText={setHourlyRate}
              placeholder="50"
              placeholderTextColor="#C5C4CC"
              keyboardType="decimal-pad"
            />
            <Text style={styles.helpText}>Your hourly rate in USD</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Service Categories</Text>
            <CategoryMultiSelect
              selectedIds={selectedSkills}
              onSelectionChange={setSelectedSkills}
            />
            <Text style={styles.helpText}>
              Select the service categories you offer
            </Text>
          </View>
        </View>
      )}

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <>
            <FontAwesome name="save" size={18} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Cancel Button */}
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => router.back()}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#5F6267',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#5F6267',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5F6267',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F7F8FA',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E6E9EF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#5F6267',
    outlineStyle: 'none',
  },
  inputDisabled: {
    backgroundColor: '#F7F8FA',
    color: '#C5C4CC',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  helpText: {
    fontSize: 12,
    color: '#B3B8C4',
    marginTop: 4,
    marginLeft: 4,
  },
  badge: {
    backgroundColor: '#FFE0E2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E20010',
  },
  saveButton: {
    backgroundColor: '#E20010',
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 8px rgba(30, 64, 175, 0.3)',
      },
    }),
  },
  saveButtonDisabled: {
    backgroundColor: '#C5C4CC',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  cancelButton: {
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E6E9EF',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#B3B8C4',
  },
  detectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
    paddingVertical: 10,
    backgroundColor: '#FFF0F1',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFC7CB',
  },
  detectButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E20010',
  },
});
