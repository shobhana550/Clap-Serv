/**
 * Reset Password Screen for Clap-Serv
 * Handles the password reset flow after user clicks the email link
 */

import React, { useState, useEffect } from 'react';
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
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { passwordSchema } from '@/lib/utils/validation';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { showAlert } from '@/utils/alert';

const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = {
  password: string;
  confirmPassword: string;
};

export default function ResetPasswordScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const clearPasswordRecovery = useAuthStore((state) => state.clearPasswordRecovery);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  // Check if user has a valid recovery session
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    // Listen for auth state changes (recovery token from URL)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth event:', event);
        if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
          setSessionReady(true);
          setCheckingSession(false);
          if (timeoutId) clearTimeout(timeoutId);
        }
      }
    );

    // Also check current session after a short delay
    // (gives Supabase time to process URL tokens)
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setSessionReady(true);
          setCheckingSession(false);
          return;
        }
      } catch (error) {
        console.error('Error checking session:', error);
      }

      // If no session found after delay, show expired state
      timeoutId = setTimeout(() => {
        setCheckingSession(false);
      }, 5000);
    };

    // Wait a moment for Supabase to detect tokens in URL hash
    setTimeout(checkSession, 1000);

    return () => {
      subscription.unsubscribe();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        showAlert('Error', error.message);
      } else {
        setIsSuccess(true);
      }
    } catch (error: any) {
      showAlert('Error', error.message || 'An unexpected error occurred');
    }
  };

  if (checkingSession) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#E20010" />
          <Text style={styles.loadingText}>Verifying reset link...</Text>
        </View>
      </View>
    );
  }

  if (isSuccess) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <View style={styles.successIcon}>
            <FontAwesome name="check-circle" size={64} color="#10B981" />
          </View>
          <Text style={styles.successTitle}>Password Updated!</Text>
          <Text style={styles.successText}>
            Your password has been successfully reset. You can now sign in with your new password.
          </Text>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => {
              clearPasswordRecovery();
              router.replace('/(auth)/login');
            }}
          >
            <Text style={styles.signInButtonText}>Go to Sign In</Text>
            <FontAwesome name="arrow-right" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!sessionReady) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <View style={styles.errorIcon}>
            <FontAwesome name="exclamation-triangle" size={48} color="#F59E0B" />
          </View>
          <Text style={styles.errorTitle}>Invalid or Expired Link</Text>
          <Text style={styles.errorText}>
            This password reset link is invalid or has expired. Please request a new one.
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              clearPasswordRecovery();
              router.replace('/(auth)/forgot-password');
            }}
          >
            <FontAwesome name="refresh" size={16} color="#FFFFFF" />
            <Text style={styles.retryButtonText}>Request New Link</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backLink}
            onPress={() => {
              clearPasswordRecovery();
              router.replace('/(auth)/login');
            }}
          >
            <Text style={styles.backLinkText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.backgroundCircle1} />

        <View style={styles.content}>
          {/* Header */}
          <TouchableOpacity
            onPress={() => router.replace('/(auth)/login')}
            style={styles.backButton}
          >
            <FontAwesome name="arrow-left" size={18} color="#E20010" />
            <Text style={styles.backButtonText}>Back to Login</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.lockIcon}>
              <FontAwesome name="lock" size={32} color="#E20010" />
            </View>
            <Text style={styles.title}>Set New Password</Text>
            <Text style={styles.subtitle}>
              Create a strong password that you don't use for other websites.
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            {/* New Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                New Password <Text style={styles.required}>*</Text>
              </Text>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
                    <View
                      style={[
                        styles.inputContainer,
                        errors.password && styles.inputError,
                      ]}
                    >
                      <FontAwesome
                        name="lock"
                        size={18}
                        color="#B3B8C4"
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Enter new password"
                        placeholderTextColor="#C5C4CC"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeButton}
                      >
                        <FontAwesome
                          name={showPassword ? 'eye' : 'eye-slash'}
                          size={18}
                          color="#B3B8C4"
                        />
                      </TouchableOpacity>
                    </View>
                    {errors.password && (
                      <Text style={styles.errorText}>
                        {errors.password.message}
                      </Text>
                    )}
                  </>
                )}
              />
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Confirm Password <Text style={styles.required}>*</Text>
              </Text>
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
                    <View
                      style={[
                        styles.inputContainer,
                        errors.confirmPassword && styles.inputError,
                      ]}
                    >
                      <FontAwesome
                        name="lock"
                        size={18}
                        color="#B3B8C4"
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Confirm new password"
                        placeholderTextColor="#C5C4CC"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                      />
                      <TouchableOpacity
                        onPress={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        style={styles.eyeButton}
                      >
                        <FontAwesome
                          name={showConfirmPassword ? 'eye' : 'eye-slash'}
                          size={18}
                          color="#B3B8C4"
                        />
                      </TouchableOpacity>
                    </View>
                    {errors.confirmPassword && (
                      <Text style={styles.errorText}>
                        {errors.confirmPassword.message}
                      </Text>
                    )}
                  </>
                )}
              />
            </View>

            {/* Password Requirements */}
            <View style={styles.requirementsCard}>
              <FontAwesome name="info-circle" size={14} color="#B3B8C4" />
              <View style={styles.requirementsList}>
                <Text style={styles.requirementText}>
                  At least 8 characters long
                </Text>
                <Text style={styles.requirementText}>
                  Contains at least one letter
                </Text>
                <Text style={styles.requirementText}>
                  Contains at least one number
                </Text>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              style={[
                styles.submitButton,
                isSubmitting && styles.submitButtonDisabled,
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <FontAwesome name="check" size={16} color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>Update Password</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  backgroundCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#FFE0E2',
    opacity: 0.3,
    top: -100,
    right: -100,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#B3B8C4',
    marginTop: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
  },
  backButtonText: {
    fontSize: 15,
    color: '#E20010',
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  lockIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFF0F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#5F6267',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#B3B8C4',
    textAlign: 'center',
    lineHeight: 22,
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
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    marginLeft: 4,
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
  // Success state
  successIcon: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 12,
  },
  successText: {
    fontSize: 15,
    color: '#B3B8C4',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  signInButton: {
    backgroundColor: '#E20010',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Error state
  errorIcon: {
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#5F6267',
    marginBottom: 12,
  },
  errorTextLarge: {
    fontSize: 15,
    color: '#B3B8C4',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  retryButton: {
    backgroundColor: '#E20010',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  backLink: {
    padding: 8,
  },
  backLinkText: {
    fontSize: 14,
    color: '#E20010',
    fontWeight: '600',
  },
});
