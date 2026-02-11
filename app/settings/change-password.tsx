/**
 * Change Password Screen - For logged-in users
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { supabase } from '@/lib/supabase';
import { showAlert } from '@/utils/alert';

export default function ChangePasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChangePassword = async () => {
    if (!currentPassword) {
      setError('Please enter your current password');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }
    if (!/\d/.test(newPassword)) {
      setError('New password must contain at least one number');
      return;
    }
    if (!/[a-zA-Z]/.test(newPassword)) {
      setError('New password must contain at least one letter');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (currentPassword === newPassword) {
      setError('New password must be different from current password');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // First verify current password by re-authenticating
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        setError('Unable to verify your account');
        setLoading(false);
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        setError('Current password is incorrect');
        setLoading(false);
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        showAlert('Success', 'Your password has been updated successfully.', [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/settings');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color="#E20010" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          {/* Current Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Current Password <Text style={styles.required}>*</Text>
            </Text>
            <View style={[styles.inputContainer, error && error.includes('Current') ? styles.inputError : {}]}>
              <FontAwesome name="lock" size={18} color="#B3B8C4" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter current password"
                placeholderTextColor="#C5C4CC"
                value={currentPassword}
                onChangeText={(t) => { setCurrentPassword(t); setError(''); }}
                secureTextEntry={!showCurrent}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)} style={styles.eyeButton}>
                <FontAwesome name={showCurrent ? 'eye' : 'eye-slash'} size={18} color="#B3B8C4" />
              </TouchableOpacity>
            </View>
          </View>

          {/* New Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              New Password <Text style={styles.required}>*</Text>
            </Text>
            <View style={[styles.inputContainer, error && !error.includes('Current') ? styles.inputError : {}]}>
              <FontAwesome name="lock" size={18} color="#B3B8C4" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter new password"
                placeholderTextColor="#C5C4CC"
                value={newPassword}
                onChangeText={(t) => { setNewPassword(t); setError(''); }}
                secureTextEntry={!showNew}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowNew(!showNew)} style={styles.eyeButton}>
                <FontAwesome name={showNew ? 'eye' : 'eye-slash'} size={18} color="#B3B8C4" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Confirm New Password <Text style={styles.required}>*</Text>
            </Text>
            <View style={[styles.inputContainer, error && error.includes('match') ? styles.inputError : {}]}>
              <FontAwesome name="lock" size={18} color="#B3B8C4" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm new password"
                placeholderTextColor="#C5C4CC"
                value={confirmPassword}
                onChangeText={(t) => { setConfirmPassword(t); setError(''); }}
                secureTextEntry={!showConfirm}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeButton}>
                <FontAwesome name={showConfirm ? 'eye' : 'eye-slash'} size={18} color="#B3B8C4" />
              </TouchableOpacity>
            </View>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Requirements */}
          <View style={styles.requirementsCard}>
            <FontAwesome name="info-circle" size={14} color="#B3B8C4" />
            <View style={styles.requirementsList}>
              <Text style={[styles.requirementText, newPassword.length >= 8 && { color: '#10B981' }]}>
                {newPassword.length >= 8 ? '\u2713' : '\u2022'} At least 8 characters
              </Text>
              <Text style={[styles.requirementText, /[a-zA-Z]/.test(newPassword) && { color: '#10B981' }]}>
                {/[a-zA-Z]/.test(newPassword) ? '\u2713' : '\u2022'} Contains a letter
              </Text>
              <Text style={[styles.requirementText, /\d/.test(newPassword) && { color: '#10B981' }]}>
                {/\d/.test(newPassword) ? '\u2713' : '\u2022'} Contains a number
              </Text>
            </View>
          </View>

          {/* Submit */}
          <TouchableOpacity
            onPress={handleChangePassword}
            disabled={loading}
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <FontAwesome name="check" size={16} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Update Password</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 16px rgba(0, 0, 0, 0.06)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
        elevation: 4,
      },
    }),
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
  required: {
    color: '#EF4444',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F8FA',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E6E9EF',
    paddingHorizontal: 16,
    height: 56,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#5F6267',
  },
  eyeButton: {
    padding: 8,
  },
  errorText: {
    fontSize: 13,
    color: '#EF4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  requirementsCard: {
    flexDirection: 'row',
    backgroundColor: '#F7F8FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    gap: 10,
  },
  requirementsList: {
    flex: 1,
    gap: 4,
  },
  requirementText: {
    fontSize: 12,
    color: '#B3B8C4',
    lineHeight: 18,
  },
  submitButton: {
    backgroundColor: '#E20010',
    borderRadius: 8,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 8px rgba(226, 0, 16, 0.25)',
      },
      default: {
        shadowColor: '#E20010',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 6,
      },
    }),
  },
  submitButtonDisabled: {
    backgroundColor: '#C5C4CC',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
