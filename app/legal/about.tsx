/**
 * About Clap-Serv Screen
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const PRIMARY = '#E20010';
const DARK = '#5F6267';
const MEDIUM = '#B3B8C4';
const BG = '#F7F8FA';
const BORDER = '#E6E9EF';
const GREEN = '#10B981';
const WHITE = '#FFFFFF';

export default function AboutScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <FontAwesome name="arrow-left" size={18} color={DARK} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Clap-Serv</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroCard}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>CS</Text>
          </View>
          <Text style={styles.appName}>Clap-Serv</Text>
          <Text style={styles.tagline}>Connecting People. Creating Opportunities.</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>

        {/* Mission */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.paragraph}>
            Clap-Serv is built on a simple yet powerful idea: bringing people closer together to create opportunities in the marketplace. We believe that every individual possesses unique skills and talents that deserve to be recognised and rewarded.
          </Text>
          <Text style={styles.paragraph}>
            Our platform serves as a bridge between those who need services and those who can provide them, fostering a vibrant ecosystem where livelihoods are created, communities are strengthened, and economic opportunities are opened up for everyone.
          </Text>
        </View>

        {/* What We Do */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What We Do</Text>
          <Text style={styles.paragraph}>
            Clap-Serv is a local service marketplace that empowers individuals and businesses to:
          </Text>

          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: '#FFF0F1' }]}>
                <FontAwesome name="search" size={16} color={PRIMARY} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Discover Services</Text>
                <Text style={styles.featureText}>
                  Browse and find skilled service providers in your area across a wide range of categories.
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: '#D1FAE5' }]}>
                <FontAwesome name="handshake-o" size={16} color={GREEN} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Connect & Interact</Text>
                <Text style={styles.featureText}>
                  Communicate directly with providers through in-app messaging, discuss requirements, and negotiate terms.
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: '#DBEAFE' }]}>
                <FontAwesome name="gavel" size={16} color="#3B82F6" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Bid & Request</Text>
                <Text style={styles.featureText}>
                  Post service requests with your budget and timeline. Providers compete to offer you the best deal through transparent bidding.
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: '#FEF3C7' }]}>
                <FontAwesome name="star" size={16} color="#F59E0B" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Rate & Review</Text>
                <Text style={styles.featureText}>
                  Help the community by rating providers after service completion. Build trust through transparent feedback.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Our Vision */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Vision</Text>
          <Text style={styles.paragraph}>
            We envision a world where access to quality services is not limited by geography or economic barriers. Clap-Serv aims to democratise the service economy by providing a platform where:
          </Text>
          <Text style={styles.bulletItem}>
            {'\u2022'} Every skilled individual has an opportunity to earn a livelihood
          </Text>
          <Text style={styles.bulletItem}>
            {'\u2022'} Communities are empowered through local service exchange
          </Text>
          <Text style={styles.bulletItem}>
            {'\u2022'} Transparency and trust are the foundation of every transaction
          </Text>
          <Text style={styles.bulletItem}>
            {'\u2022'} Technology bridges the gap between need and expertise
          </Text>
        </View>

        {/* Platform Role Disclaimer */}
        <View style={styles.disclaimerCard}>
          <FontAwesome name="info-circle" size={20} color="#3B82F6" />
          <View style={styles.disclaimerContent}>
            <Text style={styles.disclaimerTitle}>Platform Disclaimer</Text>
            <Text style={styles.disclaimerText}>
              Clap-Serv acts solely as a platform to connect buyers with service providers. We do not employ, endorse, or guarantee the quality of services offered by any provider on our platform. All service agreements are directly between the buyer and the provider. Clap-Serv does not intervene in the selection, execution, or outcome of any service arrangement.
            </Text>
          </View>
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Get in Touch</Text>
          <TouchableOpacity
            style={styles.contactRow}
            onPress={() => Linking.openURL('mailto:support@clap-serv.com')}
          >
            <FontAwesome name="envelope" size={16} color={PRIMARY} />
            <Text style={styles.contactText}>support@clap-serv.com</Text>
          </TouchableOpacity>
        </View>

        {/* Legal Links */}
        <View style={styles.legalLinks}>
          <TouchableOpacity onPress={() => router.push('/legal/privacy' as any)}>
            <Text style={styles.legalLink}>Privacy Policy</Text>
          </TouchableOpacity>
          <Text style={styles.legalDot}>{'\u2022'}</Text>
          <TouchableOpacity onPress={() => router.push('/legal/terms' as any)}>
            <Text style={styles.legalLink}>Terms of Service</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.copyright}>
          {'\u00A9'} {new Date().getFullYear()} Clap-Serv. All rights reserved.
        </Text>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14, backgroundColor: WHITE,
    borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: DARK },
  scrollView: { flex: 1 },
  content: { padding: 20 },

  heroCard: {
    backgroundColor: WHITE, borderRadius: 12, padding: 30, alignItems: 'center',
    marginBottom: 16, borderWidth: 1, borderColor: BORDER,
    ...Platform.select({
      web: { boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)' },
      default: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
    }),
  },
  logoCircle: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: PRIMARY,
    justifyContent: 'center', alignItems: 'center', marginBottom: 14,
  },
  logoText: { color: WHITE, fontSize: 26, fontWeight: '800', letterSpacing: 1 },
  appName: { fontSize: 26, fontWeight: '800', color: DARK, marginBottom: 4 },
  tagline: { fontSize: 14, color: MEDIUM, textAlign: 'center', fontStyle: 'italic' },
  version: { fontSize: 12, color: MEDIUM, marginTop: 8 },

  section: {
    backgroundColor: WHITE, borderRadius: 12, padding: 20, marginBottom: 12,
    borderWidth: 1, borderColor: BORDER,
    ...Platform.select({
      web: { boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)' },
      default: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
    }),
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: DARK, marginBottom: 12 },
  paragraph: { fontSize: 14, color: DARK, lineHeight: 22, marginBottom: 10 },
  bulletItem: { fontSize: 14, color: DARK, lineHeight: 24, paddingLeft: 8 },

  featureList: { gap: 14, marginTop: 4 },
  featureItem: { flexDirection: 'row', gap: 12 },
  featureIcon: {
    width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 2,
  },
  featureContent: { flex: 1 },
  featureTitle: { fontSize: 15, fontWeight: '700', color: DARK, marginBottom: 3 },
  featureText: { fontSize: 13, color: MEDIUM, lineHeight: 19 },

  disclaimerCard: {
    flexDirection: 'row', gap: 12, backgroundColor: '#EFF6FF', borderRadius: 12, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: '#BFDBFE',
  },
  disclaimerContent: { flex: 1 },
  disclaimerTitle: { fontSize: 14, fontWeight: '700', color: '#1E40AF', marginBottom: 6 },
  disclaimerText: { fontSize: 13, color: '#1E3A5F', lineHeight: 20 },

  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  contactText: { fontSize: 15, color: PRIMARY, fontWeight: '600' },

  legalLinks: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 16,
  },
  legalLink: { fontSize: 13, color: PRIMARY, fontWeight: '600' },
  legalDot: { fontSize: 13, color: MEDIUM },
  copyright: { textAlign: 'center', fontSize: 12, color: MEDIUM, marginTop: 12 },
});
