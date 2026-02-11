/**
 * Forgot Password Screen for Clap-Serv
 * Uses OTP code-based flow that works on both mobile and web
 * Flow: Enter email → Enter OTP from email → Set new password
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

type Step = 'email' | 'otp' | 'newPassword' | 'success';

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Step 1: Send reset email
  const handleSendEmail = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setEmailError('Please enter a valid email address');
      return;
    }
    setEmailError('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        // No redirect needed - we use OTP verification
      });

      if (error) {
        setEmailError(error.message);
      } else {
        setStep('otp');
      }
    } catch (err: any) {
      setEmailError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    const trimmedCode = otpCode.trim();
    if (trimmedCode.length < 6) {
      setOtpError('Please enter the verification code from your email');
      return;
    }
    setOtpError('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: trimmedCode,
        type: 'recovery',
      });

      if (error) {
        setOtpError('Invalid or expired code. Please try again.');
      } else if (data.session) {
        setStep('newPassword');
      } else {
        setOtpError('Verification failed. Please request a new code.');
      }
    } catch (err: any) {
      setOtpError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Set new password
  const handleSetPassword = async () => {
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
    if (!/\d/.test(newPassword)) {
      setPasswordError('Password must contain at least one number');
      return;
    }
    if (!/[a-zA-Z]/.test(newPassword)) {
      setPasswordError('Password must contain at least one letter');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    setPasswordError('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setPasswordError(error.message);
      } else {
        // Sign out so user logs in fresh with new password
        await supabase.auth.signOut();
        setStep('success');
      }
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendCode = async () => {
    setOtpCode('');
    setOtpError('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase()
      );
      if (error) {
        setOtpError(error.message);
      } else {
        showAlert('Code Sent', 'A new verification code has been sent to your email.');
      }
    } catch (err: any) {
      setOtpError('Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  // ===== STEP: SUCCESS =====
  if (step === 'success') {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <View style={styles.successIcon}>
            <FontAwesome name="check-circle" size={64} color="#10B981" />
          </View>
          <Text style={styles.successTitle}>Password Updated!</Text>
          <Text style={styles.successText}>
            Your password has been successfully reset. You can now sign in with
            your new password.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.replace('/(auth)/login')}
          >
            <Text style={styles.primaryButtonText}>Go to Sign In</Text>
            <FontAwesome name="arrow-right" size={16} color="#FFFFFF" />
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
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => {
              if (step === 'email') {
                router.back();
              } else if (step === 'otp') {
                setStep('email');
                setOtpCode('');
                setOtpError('');
              } else if (step === 'newPassword') {
                setStep('otp');
                setPasswordError('');
              }
            }}
            style={styles.backButton}
          >
            <FontAwesome name="arrow-left" size={18} color="#E20010" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          {/* Step indicator */}
          <View style={styles.stepIndicator}>
            {[1, 2, 3].map((s) => (
              <View key={s} style={styles.stepRow}>
                <View
                  style={[
                    styles.stepDot,
                    (step === 'email' && s === 1) ||
                    (step === 'otp' && s === 2) ||
                    (step === 'newPassword' && s === 3)
                      ? styles.stepDotActive
                      : (step === 'otp' && s === 1) ||
                        (step === 'newPassword' && (s === 1 || s === 2))
                      ? styles.stepDotCompleted
                      : {},
                  ]}
                >
                  {((step === 'otp' && s === 1) ||
                    (step === 'newPassword' && (s === 1 || s === 2))) ? (
                    <FontAwesome name="check" size={10} color="#FFFFFF" />
                  ) : (
                    <Text style={styles.stepDotText}>{s}</Text>
                  )}
                </View>
                {s < 3 && (
                  <View
                    style={[
                      styles.stepLine,
                      (step === 'otp' && s === 1) ||
                      (step === 'newPassword' && (s === 1 || s === 2))
                        ? styles.stepLineActive
                        : {},
                    ]}
                  />
                )}
              </View>
            ))}
          </View>

          {/* ===== STEP 1: ENTER EMAIL ===== */}
          {step === 'email' && (
            <>
              <View style={styles.header}>
                <View style={styles.headerIcon}>
                  <FontAwesome name="envelope" size={32} color="#E20010" />
                </View>
                <Text style={styles.title}>Forgot Password?</Text>
                <Text style={styles.subtitle}>
                  Enter your email and we'll send you a 6-digit verification
                  code to reset your password.
                </Text>
              </View>

              <View style={styles.card}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Address</Text>
                  <View
                    style={[
                      styles.inputContainer,
                      emailError ? styles.inputError : {},
                    ]}
                  >
                    <FontAwesome
                      name="envelope"
                      size={18}
                      color="#B3B8C4"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="your@email.com"
                      placeholderTextColor="#C5C4CC"
                      value={email}
                      onChangeText={(t) => {
                        setEmail(t);
                        setEmailError('');
                      }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                    />
                  </View>
                  {emailError ? (
                    <Text style={styles.errorText}>{emailError}</Text>
                  ) : null}
                </View>

                <TouchableOpacity
                  onPress={handleSendEmail}
                  disabled={loading}
                  style={[
                    styles.submitButton,
                    loading && styles.submitButtonDisabled,
                  ]}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <FontAwesome
                        name="paper-plane"
                        size={16}
                        color="#FFFFFF"
                      />
                      <Text style={styles.submitButtonText}>
                        Send Verification Code
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.infoCard}>
                <FontAwesome name="info-circle" size={16} color="#B3B8C4" />
                <Text style={styles.infoText}>
                  <Text style={styles.infoTextBold}>Note: </Text>
                  If you don't see the email, check your spam or junk folder.
                </Text>
              </View>
            </>
          )}

          {/* ===== STEP 2: ENTER OTP ===== */}
          {step === 'otp' && (
            <>
              <View style={styles.header}>
                <View style={styles.headerIcon}>
                  <FontAwesome name="key" size={32} color="#E20010" />
                </View>
                <Text style={styles.title}>Enter Code</Text>
                <Text style={styles.subtitle}>
                  We sent a verification code to{'\n'}
                  <Text style={{ fontWeight: '600', color: '#5F6267' }}>
                    {email}
                  </Text>
                </Text>
              </View>

              <View style={styles.card}>
                <Text style={styles.label}>Verification Code</Text>
                <View
                  style={[
                    styles.otpSingleInput,
                    otpCode ? styles.otpSingleInputFilled : {},
                    otpError ? styles.otpSingleInputError : {},
                  ]}
                >
                  <FontAwesome name="key" size={18} color="#B3B8C4" style={styles.inputIcon} />
                  <TextInput
                    style={styles.otpTextInput}
                    placeholder="Enter code from email"
                    placeholderTextColor="#C5C4CC"
                    value={otpCode}
                    onChangeText={(text) => {
                      setOtpCode(text.replace(/[^0-9]/g, ''));
                      setOtpError('');
                    }}
                    keyboardType="number-pad"
                    maxLength={8}
                    autoFocus
                  />
                </View>
                {otpError ? (
                  <Text style={[styles.errorText, { textAlign: 'center' }]}>
                    {otpError}
                  </Text>
                ) : null}

                <TouchableOpacity
                  onPress={handleVerifyOtp}
                  disabled={loading}
                  style={[
                    styles.submitButton,
                    { marginTop: 20 },
                    loading && styles.submitButtonDisabled,
                  ]}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <FontAwesome name="check" size={16} color="#FFFFFF" />
                      <Text style={styles.submitButtonText}>Verify Code</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleResendCode}
                  disabled={loading}
                  style={styles.resendButton}
                >
                  <Text style={styles.resendButtonText}>
                    Didn't receive the code? Resend
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* ===== STEP 3: NEW PASSWORD ===== */}
          {step === 'newPassword' && (
            <>
              <View style={styles.header}>
                <View style={styles.headerIcon}>
                  <FontAwesome name="lock" size={32} color="#E20010" />
                </View>
                <Text style={styles.title}>Set New Password</Text>
                <Text style={styles.subtitle}>
                  Create a strong password that you don't use for other
                  websites.
                </Text>
              </View>

              <View style={styles.card}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    New Password <Text style={styles.required}>*</Text>
                  </Text>
                  <View
                    style={[
                      styles.inputContainer,
                      passwordError ? styles.inputError : {},
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
                      value={newPassword}
                      onChangeText={(t) => {
                        setNewPassword(t);
                        setPasswordError('');
                      }}
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
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    Confirm Password <Text style={styles.required}>*</Text>
                  </Text>
                  <View
                    style={[
                      styles.inputContainer,
                      passwordError ? styles.inputError : {},
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
                      value={confirmPassword}
                      onChangeText={(t) => {
                        setConfirmPassword(t);
                        setPasswordError('');
                      }}
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
                </View>

                {passwordError ? (
                  <Text style={styles.errorText}>{passwordError}</Text>
                ) : null}

                <View style={styles.requirementsCard}>
                  <FontAwesome name="info-circle" size={14} color="#B3B8C4" />
                  <View style={styles.requirementsList}>
                    <Text
                      style={[
                        styles.requirementText,
                        newPassword.length >= 8 && { color: '#10B981' },
                      ]}
                    >
                      {newPassword.length >= 8 ? '\u2713' : '\u2022'} At least 8
                      characters long
                    </Text>
                    <Text
                      style={[
                        styles.requirementText,
                        /[a-zA-Z]/.test(newPassword) && { color: '#10B981' },
                      ]}
                    >
                      {/[a-zA-Z]/.test(newPassword) ? '\u2713' : '\u2022'}{' '}
                      Contains at least one letter
                    </Text>
                    <Text
                      style={[
                        styles.requirementText,
                        /\d/.test(newPassword) && { color: '#10B981' },
                      ]}
                    >
                      {/\d/.test(newPassword) ? '\u2713' : '\u2022'} Contains at
                      least one number
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleSetPassword}
                  disabled={loading}
                  style={[
                    styles.submitButton,
                    loading && styles.submitButtonDisabled,
                  ]}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <FontAwesome name="check" size={16} color="#FFFFFF" />
                      <Text style={styles.submitButtonText}>
                        Update Password
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 15,
    color: '#E20010',
    fontWeight: '600',
  },
  // Step indicator
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E6E9EF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotActive: {
    backgroundColor: '#E20010',
  },
  stepDotCompleted: {
    backgroundColor: '#10B981',
  },
  stepDotText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B3B8C4',
  },
  stepLine: {
    width: 40,
    height: 3,
    backgroundColor: '#E6E9EF',
    marginHorizontal: 4,
  },
  stepLineActive: {
    backgroundColor: '#10B981',
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  headerIcon: {
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
    marginBottom: 20,
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
  // OTP single input
  otpSingleInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F8FA',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E6E9EF',
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 8,
  },
  otpSingleInputFilled: {
    borderColor: '#E20010',
  },
  otpSingleInputError: {
    borderColor: '#EF4444',
  },
  otpTextInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#5F6267',
    letterSpacing: 4,
  },
  resendButton: {
    alignItems: 'center',
    marginTop: 16,
    padding: 8,
  },
  resendButtonText: {
    fontSize: 14,
    color: '#E20010',
    fontWeight: '600',
  },
  // Requirements
  requirementsCard: {
    flexDirection: 'row',
    backgroundColor: '#F7F8FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
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
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E6E9EF',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#B3B8C4',
    lineHeight: 20,
  },
  infoTextBold: {
    fontWeight: '700',
    color: '#5F6267',
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
  primaryButton: {
    backgroundColor: '#E20010',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 32,
    flexDirection: 'row',
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
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
