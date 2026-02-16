/**
 * Help & Support Screen
 * FAQs, contact details, and support resources
 */

import React, { useState } from 'react';
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

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'What is Clap-Serv?',
    answer:
      'Clap-Serv is a local service marketplace that connects buyers seeking services with skilled providers in their area. Whether you need home repairs, tutoring, design work, or any other service, Clap-Serv helps you find the right professional quickly and easily.',
  },
  {
    question: 'How do I post a service request?',
    answer:
      'Switch to Buyer mode, tap the "+" button or "Post a Request" on your home screen. Fill in the title, description, category, budget range, timeline, and location. Once posted, providers in your area can view and submit proposals.',
  },
  {
    question: 'How do I submit a proposal as a provider?',
    answer:
      'Switch to Provider mode and browse available service requests. When you find one that matches your skills, tap "Submit Proposal" and enter your bid amount, estimated timeline, and an optional cover letter explaining why you are the best fit.',
  },
  {
    question: 'How does the bidding process work?',
    answer:
      'Buyers post service requests with a budget range. Providers submit proposals with their bid price and timeline. The buyer reviews all proposals and can chat with providers before accepting the one that best fits their needs.',
  },
  {
    question: 'Is there a fee for using Clap-Serv?',
    answer:
      'Currently, Clap-Serv is free to use for both buyers and providers. There are no listing fees, commission charges, or subscription costs. We aim to keep the platform accessible to everyone.',
  },
  {
    question: 'How do I communicate with a buyer or provider?',
    answer:
      'Once a buyer shows interest in your proposal (or vice versa), you can use the in-app messaging feature to chat directly. After a proposal is accepted, both parties can see each other\'s contact details including email and phone number.',
  },
  {
    question: 'Can I be both a buyer and a provider?',
    answer:
      'Yes! During registration, you can choose "Both" as your role. This allows you to switch between Buyer and Provider modes using the toggle on the home screen. You can post service requests as a buyer and submit proposals as a provider.',
  },
  {
    question: 'How are providers rated?',
    answer:
      'After a proposal is accepted and the service is completed, the buyer can rate the provider on a 1-5 star scale with an optional review comment. These ratings are visible on the provider\'s public profile and help other buyers make informed decisions.',
  },
  {
    question: 'What if I have a dispute with a provider or buyer?',
    answer:
      'Clap-Serv acts as a platform to connect buyers and providers. While we do not mediate disputes directly, we encourage both parties to communicate clearly through our messaging system. For serious concerns, contact our support team at support@clap-serv.com.',
  },
  {
    question: 'How do I edit or delete my service request?',
    answer:
      'Go to "My Requests" from the home screen, find the request you want to modify, and tap on it. You can edit details or cancel the request as long as no proposal has been accepted yet.',
  },
  {
    question: 'Is my personal information safe?',
    answer:
      'We take your privacy seriously. Your contact details (email, phone) are only shared with the other party after a proposal is accepted. We use industry-standard encryption and never sell your data to third parties. Read our Privacy Policy for full details.',
  },
  {
    question: 'How do I change my password?',
    answer:
      'Go to Profile > Settings > Change Password. Enter your current password and then set a new one. For security, we recommend using a strong password with a mix of letters, numbers, and symbols.',
  },
];

export default function HelpSupportScreen() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <FontAwesome name="arrow-left" size={18} color={DARK} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Contact Card */}
        <View style={styles.contactCard}>
          <FontAwesome name="headphones" size={32} color={PRIMARY} />
          <Text style={styles.contactTitle}>Need Help?</Text>
          <Text style={styles.contactText}>
            Our support team is here to assist you with any questions or concerns.
          </Text>

          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => Linking.openURL('mailto:support@clap-serv.com')}
          >
            <FontAwesome name="envelope" size={16} color={WHITE} />
            <Text style={styles.contactButtonText}>support@clap-serv.com</Text>
          </TouchableOpacity>

          <Text style={styles.responseTime}>
            We typically respond within 24-48 hours
          </Text>
        </View>

        {/* Quick Links */}
        <View style={styles.quickLinksRow}>
          <TouchableOpacity
            style={styles.quickLink}
            onPress={() => router.push('/legal/about' as any)}
          >
            <View style={[styles.quickLinkIcon, { backgroundColor: '#FFF0F1' }]}>
              <FontAwesome name="info-circle" size={20} color={PRIMARY} />
            </View>
            <Text style={styles.quickLinkText}>About</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickLink}
            onPress={() => router.push('/legal/privacy' as any)}
          >
            <View style={[styles.quickLinkIcon, { backgroundColor: '#D1FAE5' }]}>
              <FontAwesome name="shield" size={20} color={GREEN} />
            </View>
            <Text style={styles.quickLinkText}>Privacy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickLink}
            onPress={() => router.push('/legal/terms' as any)}
          >
            <View style={[styles.quickLinkIcon, { backgroundColor: '#DBEAFE' }]}>
              <FontAwesome name="file-text-o" size={20} color="#3B82F6" />
            </View>
            <Text style={styles.quickLinkText}>Terms</Text>
          </TouchableOpacity>
        </View>

        {/* FAQ Section */}
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

        {faqs.map((faq, index) => (
          <TouchableOpacity
            key={index}
            style={styles.faqCard}
            onPress={() => toggleFAQ(index)}
            activeOpacity={0.7}
          >
            <View style={styles.faqHeader}>
              <Text style={styles.faqQuestion}>{faq.question}</Text>
              <FontAwesome
                name={expandedIndex === index ? 'chevron-up' : 'chevron-down'}
                size={14}
                color={MEDIUM}
              />
            </View>
            {expandedIndex === index && (
              <Text style={styles.faqAnswer}>{faq.answer}</Text>
            )}
          </TouchableOpacity>
        ))}

        {/* Still Need Help */}
        <View style={styles.stillNeedHelp}>
          <Text style={styles.stillNeedHelpTitle}>Still need help?</Text>
          <Text style={styles.stillNeedHelpText}>
            Can't find what you're looking for? Reach out to our support team and we'll get back to you as soon as possible.
          </Text>
          <TouchableOpacity
            style={styles.emailButton}
            onPress={() =>
              Linking.openURL(
                'mailto:support@clap-serv.com?subject=Support%20Request%20-%20Clap-Serv'
              )
            }
          >
            <FontAwesome name="paper-plane" size={14} color={WHITE} />
            <Text style={styles.emailButtonText}>Email Support</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: DARK },
  scrollView: { flex: 1 },
  content: { padding: 20 },

  contactCard: {
    backgroundColor: WHITE,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BORDER,
    ...Platform.select({
      web: { boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)' },
      default: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
    }),
  },
  contactTitle: { fontSize: 20, fontWeight: '700', color: DARK, marginTop: 12, marginBottom: 6 },
  contactText: { fontSize: 14, color: MEDIUM, textAlign: 'center', lineHeight: 20, marginBottom: 16 },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: PRIMARY,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  contactButtonText: { color: WHITE, fontSize: 15, fontWeight: '600' },
  responseTime: { fontSize: 12, color: MEDIUM, fontStyle: 'italic' },

  quickLinksRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  quickLink: {
    flex: 1,
    backgroundColor: WHITE,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
  },
  quickLinkIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickLinkText: { fontSize: 13, fontWeight: '600', color: DARK },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: DARK, marginBottom: 14 },

  faqCard: {
    backgroundColor: WHITE,
    borderRadius: 10,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: BORDER,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  faqQuestion: { flex: 1, fontSize: 14, fontWeight: '600', color: DARK, lineHeight: 20 },
  faqAnswer: { fontSize: 13, color: DARK, lineHeight: 20, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: BORDER },

  stillNeedHelp: {
    backgroundColor: '#FFF0F1',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#FFC7CB',
  },
  stillNeedHelpTitle: { fontSize: 16, fontWeight: '700', color: DARK, marginBottom: 6 },
  stillNeedHelpText: { fontSize: 13, color: DARK, textAlign: 'center', lineHeight: 20, marginBottom: 14 },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: PRIMARY,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emailButtonText: { color: WHITE, fontSize: 14, fontWeight: '600' },
});
