/**
 * Registration Screen for Clap-Serv - Modern Design
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
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema } from '@/lib/utils/validation';
import { useAuthStore } from '@/store/authStore';
import { UserRole } from '@/types';
import { showAlert } from '@/utils/alert';

type SignUpFormData = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
};

export default function RegisterScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const signUp = useAuthStore((state) => state.signUp);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'buyer',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: SignUpFormData) => {
    const { error } = await signUp({
      email: data.email,
      password: data.password,
      fullName: data.fullName,
      role: data.role,
    });

    if (error) {
      showAlert('Registration Failed', error);
    } else {
      showAlert(
        'Success!',
        'Your account has been created. Please check your email to verify your account.',
        [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
      );
    }
  };

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
        {/* Background Gradient Effect */}
        <View style={styles.backgroundCircle1} />
        <View style={styles.backgroundCircle2} />

        <View style={styles.content}>
          {/* Logo/Brand Section */}
          <View style={styles.brandSection}>
            <Image
              source={require('@/assets/images/clapicon.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.brandName}>Join Clap-Serv</Text>
            <Text style={styles.brandTagline}>Start your journey today</Text>
          </View>

          {/* Registration Card */}
          <View style={styles.card}>
            {/* Full Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <Controller
                control={control}
                name="fullName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
                    <View style={[styles.inputContainer, errors.fullName && styles.inputError]}>
                      <Text style={styles.inputIcon}>👤</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="John Doe"
                        placeholderTextColor="#C5C4CC"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        autoCapitalize="words"
                      />
                    </View>
                    {errors.fullName && (
                      <Text style={styles.errorText}>{errors.fullName.message}</Text>
                    )}
                  </>
                )}
              />
            </View>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
                    <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                      <Text style={styles.inputIcon}>✉️</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="your@email.com"
                        placeholderTextColor="#C5C4CC"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                      />
                    </View>
                    {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
                  </>
                )}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
                    <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                      <Text style={styles.inputIcon}>🔒</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Create a strong password"
                        placeholderTextColor="#C5C4CC"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoComplete="password"
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeButton}
                      >
                        <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '🙈'}</Text>
                      </TouchableOpacity>
                    </View>
                    {errors.password && (
                      <Text style={styles.errorText}>{errors.password.message}</Text>
                    )}
                  </>
                )}
              />
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
                    <View
                      style={[styles.inputContainer, errors.confirmPassword && styles.inputError]}
                    >
                      <Text style={styles.inputIcon}>🔒</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Confirm your password"
                        placeholderTextColor="#C5C4CC"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                      />
                      <TouchableOpacity
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={styles.eyeButton}
                      >
                        <Text style={styles.eyeIcon}>
                          {showConfirmPassword ? '👁️' : '🙈'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    {errors.confirmPassword && (
                      <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>
                    )}
                  </>
                )}
              />
            </View>

            {/* Role Selection */}
            <View style={styles.roleSection}>
              <Text style={styles.roleHeader}>I want to</Text>
              <Controller
                control={control}
                name="role"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.roleOptions}>
                    {/* Buyer Option */}
                    <TouchableOpacity
                      onPress={() => onChange('buyer')}
                      style={[
                        styles.roleCard,
                        value === 'buyer' && styles.roleCardSelected,
                      ]}
                    >
                      <View style={styles.roleIconContainer}>
                        <Text style={styles.roleIcon}>🛒</Text>
                      </View>
                      <View style={styles.roleTextContainer}>
                        <Text
                          style={[
                            styles.roleTitle,
                            value === 'buyer' && styles.roleTextSelected,
                          ]}
                        >
                          Find Services
                        </Text>
                        <Text style={styles.roleDescription}>
                          Post requests & receive proposals
                        </Text>
                      </View>
                      {value === 'buyer' && (
                        <View style={styles.checkmark}>
                          <Text style={styles.checkmarkText}>✓</Text>
                        </View>
                      )}
                    </TouchableOpacity>

                    {/* Provider Option */}
                    <TouchableOpacity
                      onPress={() => onChange('provider')}
                      style={[
                        styles.roleCard,
                        value === 'provider' && styles.roleCardSelected,
                      ]}
                    >
                      <View style={styles.roleIconContainer}>
                        <Text style={styles.roleIcon}>🔧</Text>
                      </View>
                      <View style={styles.roleTextContainer}>
                        <Text
                          style={[
                            styles.roleTitle,
                            value === 'provider' && styles.roleTextSelected,
                          ]}
                        >
                          Offer Services
                        </Text>
                        <Text style={styles.roleDescription}>
                          Browse opportunities & submit bids
                        </Text>
                      </View>
                      {value === 'provider' && (
                        <View style={styles.checkmark}>
                          <Text style={styles.checkmarkText}>✓</Text>
                        </View>
                      )}
                    </TouchableOpacity>

                    {/* Both Option */}
                    <TouchableOpacity
                      onPress={() => onChange('both')}
                      style={[
                        styles.roleCard,
                        value === 'both' && styles.roleCardSelected,
                      ]}
                    >
                      <View style={styles.roleIconContainer}>
                        <Text style={styles.roleIcon}>⭐</Text>
                      </View>
                      <View style={styles.roleTextContainer}>
                        <Text
                          style={[
                            styles.roleTitle,
                            value === 'both' && styles.roleTextSelected,
                          ]}
                        >
                          Both
                        </Text>
                        <Text style={styles.roleDescription}>Find and offer services</Text>
                      </View>
                      {value === 'both' && (
                        <View style={styles.checkmark}>
                          <Text style={styles.checkmarkText}>✓</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              />
              {errors.role && <Text style={styles.errorText}>{errors.role.message}</Text>}
            </View>

            {/* Create Account Button */}
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              style={[styles.signUpButton, isSubmitting && styles.signUpButtonDisabled]}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.signUpButtonText}>Create Account</Text>
                  <Text style={styles.signUpButtonIcon}>🚀</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Terms and Privacy */}
          <Text style={styles.termsText}>
            By signing up, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>

          {/* Sign In Link */}
          <View style={styles.signInSection}>
            <Text style={styles.signInText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.signInLink}>Sign In</Text>
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
    backgroundColor: '#D1FAE5',
    opacity: 0.3,
    top: -100,
    left: -100,
  },
  backgroundCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#FFE0E2',
    opacity: 0.3,
    bottom: 100,
    right: -50,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoImage: {
    width: 70,
    height: 70,
    marginBottom: 8,
  },
  logoCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)',
      },
    }),
  },
  logoEmoji: {
    fontSize: 36,
  },
  brandName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 4,
  },
  brandTagline: {
    fontSize: 14,
    color: '#B3B8C4',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 16px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5F6267',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F8FA',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E6E9EF',
    paddingHorizontal: 16,
    height: 52,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  inputIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#5F6267',
    outlineStyle: 'none',
  },
  eyeButton: {
    padding: 8,
  },
  eyeIcon: {
    fontSize: 18,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    marginLeft: 4,
  },
  roleSection: {
    marginTop: 8,
    marginBottom: 24,
  },
  roleHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5F6267',
    marginBottom: 12,
  },
  roleOptions: {
    gap: 12,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E6E9EF',
    backgroundColor: '#FFFFFF',
  },
  roleCardSelected: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  roleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F7F8FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  roleIcon: {
    fontSize: 20,
  },
  roleTextContainer: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#5F6267',
    marginBottom: 2,
  },
  roleTextSelected: {
    color: '#10B981',
  },
  roleDescription: {
    fontSize: 13,
    color: '#B3B8C4',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  signUpButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0 4px 8px rgba(16, 185, 129, 0.3)',
      },
    }),
  },
  signUpButtonDisabled: {
    backgroundColor: '#C5C4CC',
  },
  signUpButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 8,
  },
  signUpButtonIcon: {
    fontSize: 18,
  },
  termsText: {
    fontSize: 12,
    color: '#B3B8C4',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  termsLink: {
    color: '#10B981',
    fontWeight: '600',
  },
  signInSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInText: {
    fontSize: 14,
    color: '#B3B8C4',
  },
  signInLink: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '700',
  },
});
