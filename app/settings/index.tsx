/**
 * Settings Screen - App settings and preferences
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { useLanguageStore } from '@/store/languageStore';
import { LANGUAGE_OPTIONS } from '@/lib/i18n';
import { showAlert } from '@/utils/alert';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { signOut } = useAuthStore();
  const { language, setLanguage } = useLanguageStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  const handleSignOut = () => {
    console.log('Sign out button clicked');
    showAlert(t('settings.signOutTitle'), t('settings.signOutMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('settings.signOut'),
        style: 'destructive',
        onPress: async () => {
          console.log('User confirmed sign out');
          try {
            console.log('Calling signOut()');
            await signOut();

            console.log('Sign out completed, navigating...');
            setTimeout(() => {
              console.log('Navigating to login screen');
              router.replace('/(auth)/login');
            }, 100);
          } catch (error) {
            console.error('Error signing out:', error);
            showAlert(t('common.error'), t('settings.signOutError'));
          }
        },
      },
    ]);
  };

  const handleClearData = () => {
    showAlert(
      t('settings.clearDataTitle'),
      t('settings.clearDataMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.clearDataButton'),
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                'my_requests',
                'projects',
                'conversations',
              ]);
              showAlert(t('common.success'), t('settings.clearDataSuccess'));
            } catch (error) {
              console.error('Error clearing data:', error);
              showAlert(t('common.error'), t('settings.clearDataError'));
            }
          },
        },
      ]
    );
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/(tabs)');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color="#E20010" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings.title')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.account')}</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.iconCircle, { backgroundColor: '#FFE0E2' }]}>
                <FontAwesome name="user" size={18} color="#E20010" />
              </View>
              <Text style={styles.settingText}>{t('settings.profileSettings')}</Text>
            </View>
            <FontAwesome name="chevron-right" size={16} color="#C5C4CC" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/profile/edit')}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.iconCircle, { backgroundColor: '#FFE0E2' }]}>
                <FontAwesome name="edit" size={18} color="#E20010" />
              </View>
              <Text style={styles.settingText}>{t('settings.editProfile')}</Text>
            </View>
            <FontAwesome name="chevron-right" size={16} color="#C5C4CC" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/settings/change-password')}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.iconCircle, { backgroundColor: '#FFE0E2' }]}>
                <FontAwesome name="lock" size={18} color="#E20010" />
              </View>
              <Text style={styles.settingText}>{t('settings.changePassword')}</Text>
            </View>
            <FontAwesome name="chevron-right" size={16} color="#C5C4CC" />
          </TouchableOpacity>
        </View>

        {/* Language Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
          <Text style={styles.languageNote}>{t('settings.languageNote')}</Text>

          <View style={styles.languageRow}>
            {LANGUAGE_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.code}
                style={[
                  styles.languageChip,
                  language === opt.code && styles.languageChipActive,
                ]}
                onPress={() => setLanguage(opt.code)}
              >
                <Text style={styles.languageFlag}>{opt.flag}</Text>
                <Text
                  style={[
                    styles.languageChipText,
                    language === opt.code && styles.languageChipTextActive,
                  ]}
                >
                  {opt.nativeLabel}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.notifications')}</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
                <FontAwesome name="bell" size={18} color="#F59E0B" />
              </View>
              <Text style={styles.settingText}>{t('settings.enableNotifications')}</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#E6E9EF', true: '#FFC7CB' }}
              thumbColor={notificationsEnabled ? '#E20010' : '#C5C4CC'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
                <FontAwesome name="envelope" size={18} color="#F59E0B" />
              </View>
              <Text style={styles.settingText}>{t('settings.emailNotifications')}</Text>
            </View>
            <Switch
              value={emailNotifications}
              onValueChange={setEmailNotifications}
              trackColor={{ false: '#E6E9EF', true: '#FFC7CB' }}
              thumbColor={emailNotifications ? '#E20010' : '#C5C4CC'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
                <FontAwesome name="mobile" size={18} color="#F59E0B" />
              </View>
              <Text style={styles.settingText}>{t('settings.pushNotifications')}</Text>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{ false: '#E6E9EF', true: '#FFC7CB' }}
              thumbColor={pushNotifications ? '#E20010' : '#C5C4CC'}
            />
          </View>
        </View>

        {/* App Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.app')}</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => showAlert(t('settings.about'), t('settings.aboutContent', { version: '1.0.0' }))}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.iconCircle, { backgroundColor: '#E0E7FF' }]}>
                <FontAwesome name="info-circle" size={18} color="#6366F1" />
              </View>
              <Text style={styles.settingText}>{t('settings.about')}</Text>
            </View>
            <FontAwesome name="chevron-right" size={16} color="#C5C4CC" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => showAlert(t('settings.privacyPolicy'), t('settings.privacyContent'))}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.iconCircle, { backgroundColor: '#E0E7FF' }]}>
                <FontAwesome name="shield" size={18} color="#6366F1" />
              </View>
              <Text style={styles.settingText}>{t('settings.privacyPolicy')}</Text>
            </View>
            <FontAwesome name="chevron-right" size={16} color="#C5C4CC" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => showAlert(t('settings.termsOfService'), t('settings.termsContent'))}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.iconCircle, { backgroundColor: '#E0E7FF' }]}>
                <FontAwesome name="file-text-o" size={18} color="#6366F1" />
              </View>
              <Text style={styles.settingText}>{t('settings.termsOfService')}</Text>
            </View>
            <FontAwesome name="chevron-right" size={16} color="#C5C4CC" />
          </TouchableOpacity>
        </View>

        {/* Data Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.dataManagement')}</Text>

          <TouchableOpacity style={styles.settingItem} onPress={handleClearData}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconCircle, { backgroundColor: '#FEE2E2' }]}>
                <FontAwesome name="trash" size={18} color="#EF4444" />
              </View>
              <Text style={[styles.settingText, { color: '#EF4444' }]}>
                {t('settings.clearAllData')}
              </Text>
            </View>
            <FontAwesome name="chevron-right" size={16} color="#C5C4CC" />
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <FontAwesome name="sign-out" size={18} color="#EF4444" />
          <Text style={styles.signOutText}>{t('settings.signOut')}</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>{t('common.version', { version: '1.0.0' })}</Text>
      </ScrollView>
    </View>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#5F6267',
    marginBottom: 12,
    paddingLeft: 4,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    ...Platform.select({
      web: {
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#5F6267',
  },
  signOutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#EF4444',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EF4444',
  },
  versionText: {
    fontSize: 12,
    color: '#C5C4CC',
    textAlign: 'center',
    marginTop: 24,
  },
  languageNote: {
    fontSize: 13,
    color: '#B3B8C4',
    marginBottom: 12,
    paddingLeft: 4,
  },
  languageRow: {
    flexDirection: 'row',
    gap: 10,
  },
  languageChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E6E9EF',
    paddingVertical: 12,
    borderRadius: 12,
  },
  languageChipActive: {
    borderColor: '#E20010',
    backgroundColor: '#FFF5F5',
  },
  languageFlag: {
    fontSize: 18,
  },
  languageChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#B3B8C4',
  },
  languageChipTextActive: {
    color: '#E20010',
  },
});
