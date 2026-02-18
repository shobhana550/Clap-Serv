/**
 * OnboardingOverlay — First-time user walkthrough
 * Shows step-by-step tooltips highlighting key app features.
 * Role-aware: shows different content for buyers vs providers.
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useRoleStore } from '@/store/roleStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const PRIMARY = '#E20010';
const DARK = '#5F6267';
const MEDIUM = '#B3B8C4';
const WHITE = '#FFFFFF';

interface StepConfig {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
  highlightArea?: 'tab-home' | 'tab-browse' | 'tab-messages' | 'tab-profile' | 'primary-action';
}

const BUYER_STEPS: StepConfig[] = [
  {
    icon: 'hand-peace-o',
    iconColor: PRIMARY,
    iconBg: '#FFF0F1',
    title: 'Welcome to Clap-Serv!',
    description: 'Let us give you a quick tour of the app. It will only take a moment.',
  },
  {
    icon: 'home',
    iconColor: '#3B82F6',
    iconBg: '#DBEAFE',
    title: 'Your Dashboard',
    description: 'This is your home screen. View your stats, active requests, and quick actions all in one place.',
    highlightArea: 'tab-home',
  },
  {
    icon: 'plus-circle',
    iconColor: PRIMARY,
    iconBg: '#FFF0F1',
    title: 'Post a Service Request',
    description: 'Need something done? Tap this button to describe your service need, set a budget, and get proposals from qualified providers.',
    highlightArea: 'primary-action',
  },
  {
    icon: 'search',
    iconColor: '#10B981',
    iconBg: '#D1FAE5',
    title: 'Browse Providers',
    description: 'Explore verified service providers in your area. View their profiles, ratings, skills, and hourly rates.',
    highlightArea: 'tab-browse',
  },
  {
    icon: 'comments',
    iconColor: '#F59E0B',
    iconBg: '#FEF3C7',
    title: 'Messages',
    description: 'Chat with providers after accepting a proposal. Share details, files, and coordinate your service.',
    highlightArea: 'tab-messages',
  },
  {
    icon: 'user',
    iconColor: '#8B5CF6',
    iconBg: '#EDE9FE',
    title: 'Your Profile',
    description: 'Set up your profile, manage settings, view help & support, and access legal information.',
    highlightArea: 'tab-profile',
  },
  {
    icon: 'rocket',
    iconColor: PRIMARY,
    iconBg: '#FFF0F1',
    title: "You're All Set!",
    description: 'Start by posting your first service request. Providers will send you proposals that you can review and accept.',
  },
];

const PROVIDER_STEPS: StepConfig[] = [
  {
    icon: 'hand-peace-o',
    iconColor: PRIMARY,
    iconBg: '#FFF0F1',
    title: 'Welcome to Clap-Serv!',
    description: 'Let us give you a quick tour of the app. It will only take a moment.',
  },
  {
    icon: 'home',
    iconColor: '#3B82F6',
    iconBg: '#DBEAFE',
    title: 'Your Dashboard',
    description: 'This is your home screen. Track your active bids, conversations, and recent activity at a glance.',
    highlightArea: 'tab-home',
  },
  {
    icon: 'search',
    iconColor: '#10B981',
    iconBg: '#D1FAE5',
    title: 'Browse Opportunities',
    description: 'Find service requests from buyers that match your skills. Submit proposals with your bid and timeline.',
    highlightArea: 'primary-action',
  },
  {
    icon: 'th-list',
    iconColor: '#10B981',
    iconBg: '#D1FAE5',
    title: 'Browse Requests',
    description: 'Explore all open service requests. Filter by category and location to find the best matches.',
    highlightArea: 'tab-browse',
  },
  {
    icon: 'comments',
    iconColor: '#F59E0B',
    iconBg: '#FEF3C7',
    title: 'Messages',
    description: 'Receive messages from buyers when your proposals get accepted. Coordinate service details here.',
    highlightArea: 'tab-messages',
  },
  {
    icon: 'user',
    iconColor: '#8B5CF6',
    iconBg: '#EDE9FE',
    title: 'Your Profile',
    description: 'Complete your profile with skills, hourly rate, and bio to stand out and attract more buyers.',
    highlightArea: 'tab-profile',
  },
  {
    icon: 'rocket',
    iconColor: PRIMARY,
    iconBg: '#FFF0F1',
    title: "You're All Set!",
    description: "Complete your profile and start browsing opportunities. Submit great proposals to win service requests!",
  },
];

// Tab bar highlight positions (approximate, based on 4 visible tabs evenly spaced)
const TAB_COUNT = 4; // home, browse, messages, profile (projects is hidden)
const TAB_WIDTH = SCREEN_WIDTH / TAB_COUNT;
const TAB_POSITIONS: Record<string, { left: number }> = {
  'tab-home': { left: TAB_WIDTH * 0 + TAB_WIDTH / 2 },
  'tab-browse': { left: TAB_WIDTH * 1 + TAB_WIDTH / 2 },
  'tab-messages': { left: TAB_WIDTH * 2 + TAB_WIDTH / 2 },
  'tab-profile': { left: TAB_WIDTH * 3 + TAB_WIDTH / 2 },
};

export default function OnboardingOverlay() {
  const { isOnboarding, currentStep, nextStep, prevStep, skipOnboarding, completeOnboarding } =
    useOnboardingStore();
  const { activeRole } = useRoleStore();

  if (!isOnboarding) return null;

  const steps = activeRole === 'provider' ? PROVIDER_STEPS : BUYER_STEPS;
  const step = steps[currentStep];
  if (!step) return null;

  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;
  const totalSteps = steps.length;
  const hasHighlight = !!step.highlightArea;
  const isTabHighlight = step.highlightArea?.startsWith('tab-');

  const handleNext = () => {
    if (isLast) {
      completeOnboarding();
    } else {
      nextStep();
    }
  };

  // Determine where to show the tab indicator dot
  const tabPos = step.highlightArea ? TAB_POSITIONS[step.highlightArea] : null;

  return (
    <Modal
      visible={isOnboarding}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        {/* Tab highlight indicator */}
        {isTabHighlight && tabPos && (
          <View
            style={[
              styles.tabIndicator,
              { left: tabPos.left - 28 },
            ]}
          >
            <View style={styles.tabIndicatorDot} />
            <Text style={styles.tabIndicatorLabel}>Here</Text>
          </View>
        )}

        {/* Primary action highlight */}
        {step.highlightArea === 'primary-action' && (
          <View style={styles.actionIndicator}>
            <FontAwesome name="hand-pointer-o" size={28} color={WHITE} />
          </View>
        )}

        {/* Tooltip Card */}
        <View style={styles.cardContainer}>
          <View style={styles.card}>
            {/* Step indicator */}
            <Text style={styles.stepIndicator}>
              Step {currentStep + 1} of {totalSteps}
            </Text>

            {/* Icon */}
            <View style={[styles.iconCircle, { backgroundColor: step.iconBg }]}>
              <FontAwesome name={step.icon} size={28} color={step.iconColor} />
            </View>

            {/* Title */}
            <Text style={styles.title}>{step.title}</Text>

            {/* Description */}
            <Text style={styles.description}>{step.description}</Text>

            {/* Progress dots */}
            <View style={styles.dotsRow}>
              {steps.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    i === currentStep && styles.dotActive,
                    i < currentStep && styles.dotCompleted,
                  ]}
                />
              ))}
            </View>

            {/* Buttons */}
            <View style={styles.buttonsRow}>
              {!isFirst && (
                <TouchableOpacity onPress={prevStep} style={styles.backButton}>
                  <FontAwesome name="chevron-left" size={12} color={MEDIUM} />
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
              )}

              <View style={{ flex: 1 }} />

              {!isLast && (
                <TouchableOpacity onPress={() => skipOnboarding()} style={styles.skipButton}>
                  <Text style={styles.skipButtonText}>Skip Tour</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
                <Text style={styles.nextButtonText}>
                  {isLast ? 'Get Started' : 'Next'}
                </Text>
                {!isLast && (
                  <FontAwesome name="chevron-right" size={12} color={WHITE} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 90 : 70,
    alignItems: 'center',
    zIndex: 10,
  },
  tabIndicatorDot: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: WHITE,
    backgroundColor: 'rgba(226, 0, 16, 0.3)',
  },
  tabIndicatorLabel: {
    color: WHITE,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  actionIndicator: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.32,
    right: 40,
    alignItems: 'center',
    zIndex: 10,
  },
  cardContainer: {
    paddingHorizontal: 24,
    width: '100%',
    maxWidth: 400,
  },
  card: {
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 32,
        elevation: 10,
      },
    }),
  },
  stepIndicator: {
    fontSize: 12,
    fontWeight: '600',
    color: MEDIUM,
    marginBottom: 16,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: DARK,
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: DARK,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E6E9EF',
  },
  dotActive: {
    backgroundColor: PRIMARY,
    width: 20,
  },
  dotCompleted: {
    backgroundColor: '#FFC7CB',
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  backButtonText: {
    fontSize: 14,
    color: MEDIUM,
    fontWeight: '500',
  },
  skipButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  skipButtonText: {
    fontSize: 13,
    color: MEDIUM,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  nextButton: {
    backgroundColor: PRIMARY,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  nextButtonText: {
    color: WHITE,
    fontSize: 15,
    fontWeight: '700',
  },
});
