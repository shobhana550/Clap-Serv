/**
 * Terms of Service Screen
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

export default function TermsOfServiceScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <FontAwesome name="arrow-left" size={18} color={DARK} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
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
            Welcome to Clap-Serv. These Terms of Service ("Terms") govern your access to and use of the Clap-Serv mobile application and website (collectively, the "Platform"). By creating an account or using the Platform, you agree to be bound by these Terms.
          </Text>
          <Text style={styles.paragraph}>
            Please read these Terms carefully before using Clap-Serv. If you do not agree with any part of these Terms, you must not use the Platform.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. About the Platform</Text>
          <Text style={styles.paragraph}>
            Clap-Serv is an online marketplace platform that connects individuals seeking services ("Buyers") with individuals or businesses offering services ("Providers"). Clap-Serv merely acts as a facilitator to bring people closer together, enabling them to interact, bid, request, and fulfil service needs, thereby creating opportunities in the market and opening up livelihoods among society.
          </Text>
          <View style={styles.highlight}>
            <FontAwesome name="exclamation-circle" size={16} color="#DC2626" />
            <Text style={styles.highlightText}>
              Clap-Serv does not provide, guarantee, or endorse any services listed on the Platform. We are not a party to any agreement between Buyers and Providers.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Account Registration</Text>
          <Text style={styles.bulletItem}>{'\u2022'} You must be at least 18 years of age to create an account on Clap-Serv.</Text>
          <Text style={styles.bulletItem}>{'\u2022'} You agree to provide accurate, current, and complete information during registration.</Text>
          <Text style={styles.bulletItem}>{'\u2022'} You are responsible for maintaining the confidentiality of your account credentials.</Text>
          <Text style={styles.bulletItem}>{'\u2022'} You are responsible for all activities that occur under your account.</Text>
          <Text style={styles.bulletItem}>{'\u2022'} You must not create multiple accounts or impersonate another person.</Text>
          <Text style={styles.bulletItem}>{'\u2022'} Clap-Serv reserves the right to suspend or terminate accounts that violate these Terms.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Role of Clap-Serv</Text>
          <Text style={styles.paragraph}>
            Clap-Serv serves exclusively as a platform and marketplace. We:
          </Text>
          <Text style={styles.bulletItem}>{'\u2022'} <Text style={styles.bold}>Do not employ</Text> any service provider listed on the Platform.</Text>
          <Text style={styles.bulletItem}>{'\u2022'} <Text style={styles.bold}>Do not interfere</Text> in the selection process between buyers and providers.</Text>
          <Text style={styles.bulletItem}>{'\u2022'} <Text style={styles.bold}>Do not mediate</Text> or arbitrate disputes between users.</Text>
          <Text style={styles.bulletItem}>{'\u2022'} <Text style={styles.bold}>Do not guarantee</Text> the quality, safety, legality, or timeliness of any service.</Text>
          <Text style={styles.bulletItem}>{'\u2022'} <Text style={styles.bold}>Do not verify</Text> the credentials, qualifications, or background of providers unless explicitly marked as "Verified" by our admin team.</Text>
          <Text style={styles.bulletItem}>{'\u2022'} <Text style={styles.bold}>Do not process payments</Text> between buyers and providers. All payment arrangements are made directly between the parties.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Service Requests and Proposals</Text>
          <Text style={styles.subTitle}>For Buyers:</Text>
          <Text style={styles.bulletItem}>{'\u2022'} You may post service requests describing your needs, budget, and timeline.</Text>
          <Text style={styles.bulletItem}>{'\u2022'} You are responsible for providing accurate descriptions of the services you require.</Text>
          <Text style={styles.bulletItem}>{'\u2022'} You have full discretion to accept or reject any proposal received.</Text>
          <Text style={styles.bulletItem}>{'\u2022'} Accepting a proposal constitutes an agreement between you and the provider, not with Clap-Serv.</Text>

          <Text style={styles.subTitle}>For Providers:</Text>
          <Text style={styles.bulletItem}>{'\u2022'} You may submit proposals for service requests that match your skills.</Text>
          <Text style={styles.bulletItem}>{'\u2022'} You must provide honest and accurate information in your proposals, profile, and communications.</Text>
          <Text style={styles.bulletItem}>{'\u2022'} You are solely responsible for the quality, delivery, and completion of any service you agree to provide.</Text>
          <Text style={styles.bulletItem}>{'\u2022'} You must comply with all applicable laws and regulations in your jurisdiction.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Disclaimer of Warranties</Text>
          <View style={styles.highlight}>
            <FontAwesome name="warning" size={16} color="#F59E0B" />
            <Text style={styles.highlightText}>
              CLAP-SERV DOES NOT GUARANTEE THE QUALITY, RELIABILITY, TIMELINESS, OR ACCURACY OF ANY SERVICES PROVIDED BY SERVICE PROVIDERS ON THE PLATFORM. ALL SERVICES ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS.
            </Text>
          </View>
          <Text style={styles.paragraph}>
            Clap-Serv expressly disclaims all warranties, whether express or implied, including but not limited to:
          </Text>
          <Text style={styles.bulletItem}>{'\u2022'} Fitness of any provider for a particular purpose.</Text>
          <Text style={styles.bulletItem}>{'\u2022'} Accuracy of provider profiles, ratings, or reviews.</Text>
          <Text style={styles.bulletItem}>{'\u2022'} Merchantability of any service offered.</Text>
          <Text style={styles.bulletItem}>{'\u2022'} Non-infringement of any third-party rights.</Text>
          <Text style={styles.paragraph}>
            Users engage with providers at their own risk. We strongly recommend verifying credentials independently and discussing all terms clearly before commencing any service arrangement.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Limitation of Liability</Text>
          <Text style={styles.paragraph}>
            To the maximum extent permitted by applicable law, Clap-Serv and its directors, employees, agents, and affiliates shall not be liable for:
          </Text>
          <Text style={styles.bulletItem}>{'\u2022'} Any direct, indirect, incidental, consequential, or punitive damages arising from your use of the Platform.</Text>
          <Text style={styles.bulletItem}>{'\u2022'} Any loss or damage resulting from services provided by Providers.</Text>
          <Text style={styles.bulletItem}>{'\u2022'} Any unauthorised access to or alteration of your data.</Text>
          <Text style={styles.bulletItem}>{'\u2022'} Any interruption or cessation of the Platform's services.</Text>
          <Text style={styles.bulletItem}>{'\u2022'} Any disputes between Buyers and Providers.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. User Conduct</Text>
          <Text style={styles.paragraph}>You agree not to:</Text>
          <Text style={styles.bulletItem}>{'\u2022'} Use the Platform for any unlawful or fraudulent purpose.</Text>
          <Text style={styles.bulletItem}>{'\u2022'} Post false, misleading, or deceptive content.</Text>
          <Text style={styles.bulletItem}>{'\u2022'} Harass, abuse, or threaten other users.</Text>
          <Text style={styles.bulletItem}>{'\u2022'} Spam users with unsolicited messages or promotional content.</Text>
          <Text style={styles.bulletItem}>{'\u2022'} Attempt to manipulate ratings, reviews, or the bidding process.</Text>
          <Text style={styles.bulletItem}>{'\u2022'} Circumvent or interfere with the Platform's security features.</Text>
          <Text style={styles.bulletItem}>{'\u2022'} Use automated tools to scrape or extract data from the Platform.</Text>
          <Text style={styles.bulletItem}>{'\u2022'} Upload malicious content, viruses, or harmful files.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Ratings and Reviews</Text>
          <Text style={styles.bulletItem}>{'\u2022'} Buyers can rate providers on a 1-5 star scale after a proposal is accepted.</Text>
          <Text style={styles.bulletItem}>{'\u2022'} Reviews must be honest, fair, and based on genuine experience.</Text>
          <Text style={styles.bulletItem}>{'\u2022'} Clap-Serv reserves the right to remove reviews that are fraudulent, abusive, or violate these Terms.</Text>
          <Text style={styles.bulletItem}>{'\u2022'} Providers may not offer incentives in exchange for positive reviews.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Intellectual Property</Text>
          <Text style={styles.paragraph}>
            The Clap-Serv name, logo, and all related intellectual property are owned by Clap-Serv. You may not use our branding, trademarks, or proprietary content without prior written consent. Content you post on the Platform (such as service descriptions, reviews, and messages) remains yours, but you grant Clap-Serv a non-exclusive licence to display it on the Platform.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Indemnification</Text>
          <Text style={styles.paragraph}>
            You agree to indemnify and hold harmless Clap-Serv, its officers, directors, employees, and agents from any claims, damages, losses, or expenses (including legal fees) arising from:
          </Text>
          <Text style={styles.bulletItem}>{'\u2022'} Your use of the Platform.</Text>
          <Text style={styles.bulletItem}>{'\u2022'} Your violation of these Terms.</Text>
          <Text style={styles.bulletItem}>{'\u2022'} Your violation of any third-party rights.</Text>
          <Text style={styles.bulletItem}>{'\u2022'} Any service you provide or receive through the Platform.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. Termination</Text>
          <Text style={styles.paragraph}>
            Clap-Serv reserves the right to suspend or terminate your account at any time, with or without notice, for any reason including but not limited to violation of these Terms. Upon termination, your right to use the Platform ceases immediately. Provisions that by their nature should survive termination (such as disclaimers, limitations of liability, and indemnification) shall remain in effect.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>12. Modifications to Terms</Text>
          <Text style={styles.paragraph}>
            We reserve the right to modify these Terms at any time. Changes will be posted on the Platform with an updated "Last Updated" date. Your continued use of Clap-Serv after any modifications constitutes acceptance of the revised Terms. We encourage you to review these Terms periodically.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>13. Governing Law</Text>
          <Text style={styles.paragraph}>
            These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from these Terms or your use of the Platform shall be subject to the exclusive jurisdiction of the courts in India.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>14. Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have any questions about these Terms of Service, please contact us at:
          </Text>
          <Text style={styles.contactInfo}>Clap-Serv Support</Text>
          <Text style={styles.contactInfo}>Email: support@clap-serv.com</Text>
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

  highlight: {
    flexDirection: 'row', gap: 10, backgroundColor: '#FEF2F2', borderRadius: 8,
    padding: 14, marginVertical: 8, borderWidth: 1, borderColor: '#FECACA',
  },
  highlightText: { flex: 1, fontSize: 13, color: '#991B1B', lineHeight: 20, fontWeight: '500' },

  contactInfo: { fontSize: 14, color: PRIMARY, fontWeight: '600', marginBottom: 2 },
  copyright: { textAlign: 'center', fontSize: 12, color: MEDIUM, marginTop: 16 },
});
