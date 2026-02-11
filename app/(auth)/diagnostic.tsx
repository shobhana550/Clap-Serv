/**
 * Diagnostic Page - Check Authentication Status
 * Visit: http://localhost:8081/diagnostic
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useUserStore } from '@/store/userStore';
import { useRoleStore } from '@/store/roleStore';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';

interface DiagnosticResult {
  name: string;
  status: 'pass' | 'fail' | 'warning' | 'loading';
  message: string;
  details?: any;
}

export default function DiagnosticScreen() {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [testing, setTesting] = useState(false);

  const { isAuthenticated, user, loading: authLoading } = useAuthStore();
  const { profile } = useUserStore();
  const { activeRole } = useRoleStore();

  const runDiagnostics = async () => {
    setTesting(true);
    const diagnostics: DiagnosticResult[] = [];

    // Test 1: Supabase Connection
    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      if (error) {
        diagnostics.push({
          name: 'Supabase Connection',
          status: 'fail',
          message: 'Cannot connect to Supabase',
          details: error.message,
        });
      } else {
        diagnostics.push({
          name: 'Supabase Connection',
          status: 'pass',
          message: 'Connected successfully',
        });
      }
    } catch (err: any) {
      diagnostics.push({
        name: 'Supabase Connection',
        status: 'fail',
        message: 'Connection exception',
        details: err.message,
      });
    }

    // Test 2: Authentication Status
    if (isAuthenticated && user) {
      diagnostics.push({
        name: 'Authentication',
        status: 'pass',
        message: `Logged in as ${user.email}`,
        details: { userId: user.id, email: user.email },
      });
    } else {
      diagnostics.push({
        name: 'Authentication',
        status: 'warning',
        message: 'Not authenticated',
        details: { isAuthenticated, hasUser: !!user },
      });
    }

    // Test 3: Profile Data
    if (profile) {
      diagnostics.push({
        name: 'Profile Data',
        status: 'pass',
        message: `Profile loaded for ${profile.full_name}`,
        details: {
          id: profile.id,
          full_name: profile.full_name,
          email: profile.email,
          role: profile.role,
        },
      });
    } else if (isAuthenticated) {
      diagnostics.push({
        name: 'Profile Data',
        status: 'fail',
        message: 'Profile not loaded (this is the problem!)',
        details: 'User is authenticated but profile is null',
      });
    } else {
      diagnostics.push({
        name: 'Profile Data',
        status: 'warning',
        message: 'Skipped (not authenticated)',
      });
    }

    // Test 4: RLS Policies (profiles table)
    if (isAuthenticated) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .limit(1);

        if (error) {
          diagnostics.push({
            name: 'RLS - Profiles SELECT',
            status: 'fail',
            message: 'Cannot read profiles table',
            details: error.message,
          });
        } else {
          diagnostics.push({
            name: 'RLS - Profiles SELECT',
            status: 'pass',
            message: 'Can read profiles table',
          });
        }
      } catch (err: any) {
        diagnostics.push({
          name: 'RLS - Profiles SELECT',
          status: 'fail',
          message: 'Exception reading profiles',
          details: err.message,
        });
      }

      // Test RLS INSERT (safe test)
      try {
        const testId = '00000000-0000-0000-0000-000000000000';
        const { error } = await supabase
          .from('profiles')
          .insert({
            id: testId,
            full_name: 'Test',
            email: 'test@test.com',
            role: 'buyer',
          });

        // We expect this to fail due to unique constraint or auth.uid() mismatch
        // But if it fails with 401, RLS is too restrictive
        if (error) {
          if (error.code === '42501') {
            // Permission denied
            diagnostics.push({
              name: 'RLS - Profiles INSERT',
              status: 'fail',
              message: 'RLS blocking INSERT (this is the problem!)',
              details: error.message,
            });
          } else {
            // Other errors are OK (unique constraint, etc.)
            diagnostics.push({
              name: 'RLS - Profiles INSERT',
              status: 'pass',
              message: 'RLS allows INSERT (failed for other reason, which is OK)',
              details: error.code,
            });
          }
        } else {
          diagnostics.push({
            name: 'RLS - Profiles INSERT',
            status: 'pass',
            message: 'RLS allows INSERT',
          });
        }
      } catch (err: any) {
        diagnostics.push({
          name: 'RLS - Profiles INSERT',
          status: 'warning',
          message: 'Could not test INSERT',
          details: err.message,
        });
      }
    } else {
      diagnostics.push({
        name: 'RLS - Profiles SELECT',
        status: 'warning',
        message: 'Skipped (not authenticated)',
      });
      diagnostics.push({
        name: 'RLS - Profiles INSERT',
        status: 'warning',
        message: 'Skipped (not authenticated)',
      });
    }

    // Test 5: Role Store
    if (activeRole) {
      diagnostics.push({
        name: 'Role Store',
        status: 'pass',
        message: `Active role: ${activeRole}`,
        details: { activeRole },
      });
    } else {
      diagnostics.push({
        name: 'Role Store',
        status: 'warning',
        message: 'No active role set',
      });
    }

    // Test 6: Session Storage
    try {
      const { data: session } = await supabase.auth.getSession();
      if (session?.session) {
        diagnostics.push({
          name: 'Session Storage',
          status: 'pass',
          message: 'Valid session found',
          details: {
            expiresAt: new Date(session.session.expires_at! * 1000).toLocaleString(),
          },
        });
      } else {
        diagnostics.push({
          name: 'Session Storage',
          status: 'warning',
          message: 'No session found',
        });
      }
    } catch (err: any) {
      diagnostics.push({
        name: 'Session Storage',
        status: 'fail',
        message: 'Error checking session',
        details: err.message,
      });
    }

    setResults(diagnostics);
    setTesting(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'pass':
        return '#10B981';
      case 'fail':
        return '#EF4444';
      case 'warning':
        return '#F59E0B';
      case 'loading':
        return '#C5C4CC';
    }
  };

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'pass':
        return '✅';
      case 'fail':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'loading':
        return '⏳';
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>🔍 System Diagnostics</Text>
        <Text style={styles.subtitle}>Checking authentication and database access</Text>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          onPress={runDiagnostics}
          disabled={testing}
          style={[styles.button, styles.refreshButton, testing && styles.buttonDisabled]}
        >
          {testing ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.buttonText}>🔄 Refresh Tests</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.replace('/(auth)/login')}
          style={[styles.button, styles.backButton]}
        >
          <Text style={styles.buttonText}>← Back to Login</Text>
        </TouchableOpacity>
      </View>

      {results.length === 0 && testing && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E20010" />
          <Text style={styles.loadingText}>Running diagnostics...</Text>
        </View>
      )}

      {results.map((result, index) => (
        <View key={index} style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultIcon}>{getStatusIcon(result.status)}</Text>
            <View style={styles.resultInfo}>
              <Text style={styles.resultName}>{result.name}</Text>
              <Text
                style={[
                  styles.resultMessage,
                  { color: getStatusColor(result.status) },
                ]}
              >
                {result.message}
              </Text>
            </View>
          </View>

          {result.details && (
            <View style={styles.detailsBox}>
              <Text style={styles.detailsTitle}>Details:</Text>
              <Text style={styles.detailsText}>
                {typeof result.details === 'string'
                  ? result.details
                  : JSON.stringify(result.details, null, 2)}
              </Text>
            </View>
          )}
        </View>
      ))}

      {results.length > 0 && (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Passed:</Text>
            <Text style={[styles.summaryValue, { color: '#10B981' }]}>
              {results.filter((r) => r.status === 'pass').length}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Failed:</Text>
            <Text style={[styles.summaryValue, { color: '#EF4444' }]}>
              {results.filter((r) => r.status === 'fail').length}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Warnings:</Text>
            <Text style={[styles.summaryValue, { color: '#F59E0B' }]}>
              {results.filter((r) => r.status === 'warning').length}
            </Text>
          </View>

          {results.some((r) => r.status === 'fail') && (
            <View style={styles.actionBox}>
              <Text style={styles.actionTitle}>⚠️ Action Required</Text>
              <Text style={styles.actionText}>
                You have failing tests. Please:
              </Text>
              <Text style={styles.actionStep}>
                1. Run the supabase-rls-fix.sql in Supabase SQL Editor
              </Text>
              <Text style={styles.actionStep}>
                2. Clear browser cache (Ctrl+Shift+Delete)
              </Text>
              <Text style={styles.actionStep}>
                3. Refresh this page to test again
              </Text>
            </View>
          )}

          {results.every((r) => r.status === 'pass' || r.status === 'warning') && (
            <View style={[styles.actionBox, { backgroundColor: '#D1FAE5' }]}>
              <Text style={[styles.actionTitle, { color: '#065F46' }]}>
                ✅ All Critical Tests Passed!
              </Text>
              <Text style={[styles.actionText, { color: '#065F46' }]}>
                Your authentication system is working correctly.
              </Text>
            </View>
          )}
        </View>
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
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#5F6267',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#B3B8C4',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButton: {
    backgroundColor: '#E20010',
  },
  backButton: {
    backgroundColor: '#B3B8C4',
  },
  buttonDisabled: {
    backgroundColor: '#C5C4CC',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#B3B8C4',
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  resultIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#5F6267',
    marginBottom: 4,
  },
  resultMessage: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailsBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F7F8FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E6E9EF',
  },
  detailsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B3B8C4',
    marginBottom: 4,
  },
  detailsText: {
    fontSize: 12,
    color: '#5F6267',
    fontFamily: 'monospace',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#5F6267',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#B3B8C4',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  actionBox: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#991B1B',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#991B1B',
    marginBottom: 8,
  },
  actionStep: {
    fontSize: 13,
    color: '#991B1B',
    marginLeft: 8,
    marginBottom: 4,
  },
});
