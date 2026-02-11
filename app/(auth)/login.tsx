/**
 * Login Screen for Clap-Serv - Modern Design
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
import { loginSchema } from '@/lib/utils/validation';
import { useAuthStore } from '@/store/authStore';
import { Colors } from '@/constants/Colors';
import { showAlert } from '@/utils/alert';

type LoginFormData = {
  email: string;
  password: string;
};

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('');
  const signIn = useAuthStore((state) => state.signIn);

  // Test Supabase connection
  const testConnection = async () => {
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data, error } = await supabase.from('profiles').select('count').limit(1);

      if (error) {
        setConnectionStatus('❌ Error: ' + error.message);
        console.error('Connection test failed:', error);
      } else {
        setConnectionStatus('✅ Connected to Supabase!');
        console.log('Connection test successful:', data);
      }
    } catch (err: any) {
      setConnectionStatus('❌ Exception: ' + err.message);
      console.error('Connection exception:', err);
    }
  };

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    console.log('Login attempt with:', { email: data.email, hasPassword: !!data.password });

    try {
      const { error } = await signIn(data);

      console.log('Login result:', { success: !error, error });

      if (error) {
        console.error('Login error:', error);
        showAlert('Login Failed', error);
      } else {
        console.log('Login successful, navigating to tabs');
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      console.error('Login exception:', err);
      showAlert('Login Error', err.message || 'An unexpected error occurred');
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
            <Text style={styles.brandName}>Clap-Serv</Text>
            <Text style={styles.brandTagline}>Connect. Service. Success.</Text>
          </View>

          {/* Welcome Header */}
          <View style={styles.header}>
            <Text style={styles.welcomeText}>Welcome Back!</Text>
            <Text style={styles.subtitle}>Sign in to continue your journey</Text>
          </View>

          {/* Login Card */}
          <View style={styles.card}>
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
                    <View style={[
                      styles.inputContainer,
                      errors.email && styles.inputError
                    ]}>
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
                    {errors.email && (
                      <Text style={styles.errorText}>{errors.email.message}</Text>
                    )}
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
                    <View style={[
                      styles.inputContainer,
                      errors.password && styles.inputError
                    ]}>
                      <Text style={styles.inputIcon}>🔒</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter your password"
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
                        <Text style={styles.eyeIcon}>
                          {showPassword ? '👁️' : '🙈'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    {errors.password && (
                      <Text style={styles.errorText}>{errors.password.message}</Text>
                    )}
                  </>
                )}
              />
            </View>

            {/* Forgot Password Link */}
            <TouchableOpacity
              onPress={() => router.push('/(auth)/forgot-password')}
              style={styles.forgotPasswordButton}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Sign In Button */}
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              style={[styles.signInButton, isSubmitting && styles.signInButtonDisabled]}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.signInButtonText}>Sign In</Text>
                  <Text style={styles.signInButtonIcon}>→</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Connection Test */}
          {connectionStatus && (
            <View style={styles.statusBox}>
              <Text style={styles.statusText}>{connectionStatus}</Text>
            </View>
          )}
          <TouchableOpacity onPress={testConnection} style={styles.testButton}>
            <Text style={styles.testButtonText}>🔌 Test Connection</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Login Placeholder */}
          <View style={styles.socialSection}>
            <Text style={styles.socialText}>🚀 Social login coming soon</Text>
          </View>

          {/* Sign Up Link */}
          <View style={styles.signUpSection}>
            <Text style={styles.signUpText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.signUpLink}>Create Account</Text>
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
  backgroundCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#D1FAE5',
    opacity: 0.3,
    bottom: 100,
    left: -50,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoImage: {
    width: 80,
    height: 80,
    marginBottom: 8,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#E20010',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 4px 12px rgba(30, 64, 175, 0.15)',
      },
    }),
  },
  logoEmoji: {
    fontSize: 40,
  },
  brandName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#E20010',
    marginBottom: 4,
  },
  brandTagline: {
    fontSize: 14,
    color: '#B3B8C4',
    fontWeight: '500',
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#5F6267',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#B3B8C4',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
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
    marginBottom: 20,
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
    height: 56,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  inputIcon: {
    fontSize: 20,
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
    fontSize: 20,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    marginLeft: 4,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#E20010',
    fontWeight: '600',
  },
  signInButton: {
    backgroundColor: '#E20010',
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#E20010',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0 4px 8px rgba(30, 64, 175, 0.3)',
      },
    }),
  },
  signInButtonDisabled: {
    backgroundColor: '#C5C4CC',
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 8,
  },
  signInButtonIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E6E9EF',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#C5C4CC',
    fontWeight: '500',
  },
  socialSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  socialText: {
    fontSize: 14,
    color: '#B3B8C4',
  },
  signUpSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    fontSize: 14,
    color: '#B3B8C4',
  },
  signUpLink: {
    fontSize: 14,
    color: '#E20010',
    fontWeight: '700',
  },
  statusBox: {
    backgroundColor: '#F7F8FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E6E9EF',
  },
  statusText: {
    fontSize: 13,
    color: '#5F6267',
    textAlign: 'center',
  },
  testButton: {
    backgroundColor: '#F7F8FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E20010',
  },
  testButtonText: {
    fontSize: 14,
    color: '#E20010',
    fontWeight: '600',
    textAlign: 'center',
  },
});
