/**
 * Privacy Policy Screen
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const PRIMARY = '#E20010';
const DARK = '#5F6267';
const MEDIUM = '#B3B8C4';
const BG = '#F7F8FA';
const BORDER = '#E6E9EF';
const WHITE = '#FFFFFF';

const LAST_UPDATED = 'February 16, 2026';

export default function PrivacyPolicyScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <FontAwesome name="arrow-left" size={18} color={DARK} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lastUpdated}>Last Updated: {LAST_UPDATED}</Text>

        <View style={styles.section}>
          <Text style={styles.paragraph}>
            Clap-Serv ("we", "our", or "us") respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and website (collectively, the "Platform").
          </Text>
          <Text style={styles.paragraph}>
            By using Clap-Serv, you agree to the collection and use of information in accordance with this policy.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Information We Collect</Text>

          <Text style={styles.subTitle}>a) Information You Provide</Text>
          <Text style={styles.bulletItem}>{'\u2022'} Account information: name, email address, phone number, and password when you register.</Text>
          <Text style={styles.bulletItem}>{'\u2022'} Profile information: location, skills, bio, hourly rate, and portfolio details for service providers.</Text>
          <Text style={styles.bulletItem}>{'\u2022'} Service request details: title, description, budget range, timeline, and category.</Text>
          <Text style={styles.bulletItem}>{'\u2022'} Proposal details: bid amount, timeline estimate, and cover letter.</Text>
          <Text style={styles.bulletItem}>{'\u2022'} Messages and attachments exchanged through our in-app chat.</Text>
          <Text style={styles.bulletItem}>{'\u2022'} Ratings and reviews you leave for service providers.</Text>

          <Text style={styles.subTitle}>b) Information Collected Automatically</Text>
          <Text style={styles.bulletItem}>{'\u2022'} Device information: device type, operating system, and unique device identifiers.</Text>
          <Text style={styles.bulletItem}>{'\u2022'} Location data: approximate location based on IP address or device GPS (with your permission) to match you with nearby services.</Text>
          <Text style={styles.bulletItem}>{'\u2022'} Usage data: pages viewed, features used, and interaction patterns to improve the Platform.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
          <Text style={styles.paragraph}>We use the information we collect to:</Text>
          <Text style={styles.bulletItem}>{'\u2022'} Create and manage your account.</Text>
          <Text style={styles.bulletItem}>{'\u2022'} Facilitate connections between buyers and service providers.</Text>
          <Text style={styles.bulletItem}>{'\u2022'} Enable in-app messaging and file sharing between parties.</Text>
          <Text style={styles.bulletItem}>{'\u2022'} Display provider profiles, ratings, and reviews to buyers.</Text>
          <Text style={styles.bulletItem}>{'\u2022'} Send notifications about proposals, messages, and account activity.</Text>
          <Text style={styles.bulletItem}>{'\u2022'} Improve and optimise the Platform's performance and user experience.</Text>
          <Text style={styles.bulletItem}>{'\u2022'} Detect and prevent fraud, abuse, or security threats.</Text>
          <Text style={styles.bulletItem}>{'\u2022'} Comply with legal obligations.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Information Sharing</Text>
          <Text style={styles.paragraph}>
            Clap-Serv does not sell, rent, or trade your personal information to third parties. We share your information only in the following circumstances:
          </Text>
          <Text style={styles.bulletItem}>{'\u2022'} <Text style={styles.bold}>Between Parties:</Text> When a proposal is accepted, the buyer and provider can see each other's contact details (name, email, phone) to facilitate direct communication.</Text>
          <Text style={styles.bulletItem}>{'\u2022'} <Text style={styles.bold}>Public Profile:</Text> Provider profiles including name, skills, rating, bio, and review count are visible to all users browsing the Platform.</Text>
          <Text style={styles.bulletItem}>{'\u2022'} <Text style={styles.bold}>Service Providers:</Text> We may use third-party services (e.g., hosting, analytics, push notifications) that process data on our behalf under strict confidentiality agreements.</Text>
          <Text style={styles.bulletItem}>{'\u2022'} <Text style={styles.bold}>Legal Requirements:</Text> We may disclose information if required by law, court order, or government regulation.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Data Storage and Security</Text>
          <Text style={styles.paragraph}>
            Your data is stored securely using industry-standard encryption and hosted on Supabase infrastructure with enterprise-grade security. We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, alteration, disclosure, or destruction.
          </Text>
          <Text style={styles.paragraph}>
            However, no method of electronic transmission or storage is 100% secure. While we strive to protect your personal data, we cannot guarantee its absolute security.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Your Rights</Text>
          <Text style={styles.paragraph}>You have the right to:</Text>
          <Text style={styles.bulletItem}>{'\u2022'} <Text style={styles.bold}>Access:</Text> Request a copy of the personal data we hold about you.</Text>
          <Text style={styles.bulletItem}>{'\u2022'} <Text style={styles.bold}>Correction:</Text> Update or correct inaccurate personal information.</Text>
          <Text style={styles.bulletItem}>{'\u2022'} <Text style={styles.bold}>Deletion:</Text> Request deletion of your account and associated data.</Text>
          <Text style={styles.bulletItem}>{'\u2022'} <Text style={styles.bold}>Withdrawal:</Text> Withdraw consent for location tracking at any time through your device settings.</Text>
          <Text style={styles.paragraph}>
            To exercise any of these rights, contact us at support@clap-serv.com.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Data Retention</Text>
          <Text style={styles.paragraph}>
            We retain your personal data for as long as your account is active or as needed to provide you with our services. If you delete your account, we will remove your personal data within 30 days, except where retention is required by law or for legitimate business purposes (such as resolving disputes).
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Children's Privacy</Text>
          <Text style={styles.paragraph}>
            Clap-Serv is not intended for use by individuals under the age of 18. We do not knowingly collect personal data from children. If we become aware that we have collected data from a child under 18, we will promptly delete it.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Changes to This Policy</Text>
          <Text style={styles.paragraph}>
            We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the updated policy on the Platform and updating the "Last Updated" date. Your continued use of Clap-Serv after any changes indicates your acceptance of the updated policy.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at:
          </Text>
          <Text style={styles.contactInfo}>Clap-Serv Support</Text>
          <Text style={styles.contactInfo}>Email: support@clap-serv.com</Text>
        </View>

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
  lastUpdated: { fontSize: 12, color: MEDIUM, marginBottom: 16, fontStyle: 'italic' },

  section: {
    backgroundColor: WHITE, borderRadius: 12, padding: 18, marginBottom: 12,
    borderWidth: 1, borderColor: BORDER,
    ...Platform.select({
      web: { boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)' },
      default: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
    }),
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: DARK, marginBottom: 10 },
  subTitle: { fontSize: 14, fontWeight: '700', color: DARK, marginTop: 10, marginBottom: 6 },
  paragraph: { fontSize: 14, color: DARK, lineHeight: 22, marginBottom: 8 },
  bulletItem: { fontSize: 13, color: DARK, lineHeight: 22, paddingLeft: 8, marginBottom: 4 },
  bold: { fontWeight: '700' },
  contactInfo: { fontSize: 14, color: PRIMARY, fontWeight: '600', marginBottom: 2 },
});
