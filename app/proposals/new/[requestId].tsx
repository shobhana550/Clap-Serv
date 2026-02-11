/**
 * Submit Proposal Screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  TextInput,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getRequestById } from '@/constants/DummyData';
import { useCategoryLookup } from '@/lib/useCategoryLookup';
import { showAlert } from '@/utils/alert';

// Validation schema
const proposalSchema = z.object({
  price: z.string()
    .min(1, 'Price is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Must be a valid positive number'),
  timeline: z.string()
    .min(1, 'Timeline is required')
    .max(100, 'Timeline must be less than 100 characters'),
  cover_letter: z.string()
    .min(100, 'Cover letter must be at least 100 characters')
    .max(2000, 'Cover letter must be less than 2000 characters'),
});

type ProposalFormData = z.infer<typeof proposalSchema>;

export default function NewProposalScreen() {
  const { requestId } = useLocalSearchParams<{ requestId: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { categories: dbCategories } = useCategoryLookup();

  const request = requestId ? getRequestById(requestId) : null;
  const category = request ? dbCategories.find(cat => cat.id === request.category_id) : null;

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ProposalFormData>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      price: '',
      timeline: '',
      cover_letter: '',
    },
  });

  const onSubmit = async (data: ProposalFormData) => {
    if (!request) return;

    // Validate price is within budget range
    const price = Number(data.price);
    if (price < request.budget_min || price > request.budget_max) {
      showAlert(
        'Price Warning',
        `The buyer's budget is $${request.budget_min.toLocaleString()} - $${request.budget_max.toLocaleString()}. Your bid is outside this range. Are you sure you want to continue?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Submit Anyway',
            onPress: () => submitProposal(),
          },
        ]
      );
      return;
    }

    submitProposal();
  };

  const submitProposal = () => {
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      showAlert(
        'Success!',
        'Your proposal has been submitted successfully. The buyer will be notified and can review your proposal.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    }, 1000);
  };

  if (!request) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <FontAwesome name="exclamation-triangle" size={48} color="#EF4444" />
          <Text style={styles.errorTitle}>Request Not Found</Text>
          <Text style={styles.errorMessage}>
            The service request you're looking for doesn't exist.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
          <FontAwesome name="arrow-left" size={20} color="#E20010" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Submit Proposal</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Request Details Card */}
        <View style={styles.requestCard}>
          <View style={styles.requestHeader}>
            <View style={styles.categoryBadge}>
              <FontAwesome
                name={category?.icon as any || 'briefcase'}
                size={14}
                color="#E20010"
              />
              <Text style={styles.categoryText}>{category?.name || 'Other'}</Text>
            </View>
          </View>
          <Text style={styles.requestTitle}>{request.title}</Text>
          <Text style={styles.requestDescription} numberOfLines={3}>
            {request.description}
          </Text>
          <View style={styles.requestMeta}>
            <View style={styles.metaItem}>
              <FontAwesome name="dollar" size={14} color="#10B981" />
              <Text style={styles.metaText}>
                ${request.budget_min.toLocaleString()} - ${request.budget_max.toLocaleString()}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <FontAwesome name="clock-o" size={14} color="#F59E0B" />
              <Text style={styles.metaText}>{request.timeline}</Text>
            </View>
            <View style={styles.metaItem}>
              <FontAwesome name="map-marker" size={14} color="#B3B8C4" />
              <Text style={styles.metaText}>{request.location}</Text>
            </View>
          </View>
        </View>

        {/* Proposal Form */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Your Proposal</Text>

          {/* Price */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Your Bid <Text style={styles.required}>*</Text>
            </Text>
            <Controller
              control={control}
              name="price"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.currencyInput}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <TextInput
                    style={[
                      styles.currencyField,
                      errors.price && styles.inputError,
                    ]}
                    placeholder="0"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="numeric"
                    placeholderTextColor="#C5C4CC"
                  />
                </View>
              )}
            />
            {errors.price && (
              <Text style={styles.errorText}>{errors.price.message}</Text>
            )}
            <Text style={styles.helperText}>
              Buyer's budget: ${request.budget_min.toLocaleString()} - ${request.budget_max.toLocaleString()}
            </Text>
          </View>

          {/* Timeline */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Estimated Timeline <Text style={styles.required}>*</Text>
            </Text>
            <Controller
              control={control}
              name="timeline"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.timeline && styles.inputError]}
                  placeholder="e.g., 2 weeks, 10 days, 1 month"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholderTextColor="#C5C4CC"
                />
              )}
            />
            {errors.timeline && (
              <Text style={styles.errorText}>{errors.timeline.message}</Text>
            )}
            <Text style={styles.helperText}>
              Expected timeline: {request.timeline}
            </Text>
          </View>

          {/* Cover Letter */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Cover Letter <Text style={styles.required}>*</Text>
            </Text>
            <Controller
              control={control}
              name="cover_letter"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.textArea, errors.cover_letter && styles.inputError]}
                  placeholder="Explain why you're the best fit for this project. Include your relevant experience, approach, and what makes you stand out..."
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                  numberOfLines={10}
                  textAlignVertical="top"
                  placeholderTextColor="#C5C4CC"
                />
              )}
            />
            {errors.cover_letter && (
              <Text style={styles.errorText}>{errors.cover_letter.message}</Text>
            )}
            <Text style={styles.helperText}>
              {watch('cover_letter')?.length || 0} / 2000 characters
            </Text>
          </View>

          {/* Tips Card */}
          <View style={styles.tipsCard}>
            <View style={styles.tipsHeader}>
              <FontAwesome name="lightbulb-o" size={18} color="#F59E0B" />
              <Text style={styles.tipsTitle}>Tips for a Great Proposal</Text>
            </View>
            <Text style={styles.tipItem}>• Be specific about your experience</Text>
            <Text style={styles.tipItem}>• Explain your approach to the project</Text>
            <Text style={styles.tipItem}>• Ask clarifying questions if needed</Text>
            <Text style={styles.tipItem}>• Keep it professional and concise</Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Text style={styles.submitButtonText}>Submitting...</Text>
            ) : (
              <>
                <FontAwesome name="paper-plane" size={16} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Submit Proposal</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.infoCard}>
            <FontAwesome name="info-circle" size={16} color="#B3B8C4" />
            <Text style={styles.infoText}>
              The buyer will review your proposal and may contact you for more details.
            </Text>
          </View>
        </View>
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
  headerBackButton: {
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
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E6E9EF',
    ...Platform.select({
      web: {
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 2,
      },
    }),
  },
  requestHeader: {
    marginBottom: 12,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#FFF0F1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 12,
    color: '#E20010',
    fontWeight: '600',
  },
  requestTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#5F6267',
    marginBottom: 8,
    lineHeight: 24,
  },
  requestDescription: {
    fontSize: 14,
    color: '#B3B8C4',
    lineHeight: 20,
    marginBottom: 16,
  },
  requestMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: '#5F6267',
    fontWeight: '500',
  },
  formSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E6E9EF',
    ...Platform.select({
      web: {
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 2,
      },
    }),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#5F6267',
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 24,
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
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E9EF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#5F6267',
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E9EF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#5F6267',
    minHeight: 180,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#B3B8C4',
    marginTop: 4,
  },
  currencyInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E9EF',
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#B3B8C4',
    marginRight: 4,
  },
  currencyField: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#5F6267',
  },
  tipsCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
  },
  tipItem: {
    fontSize: 13,
    color: '#78350F',
    lineHeight: 20,
    marginBottom: 4,
  },
  submitButton: {
    backgroundColor: '#E20010',
    borderRadius: 8,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 6px -1px rgba(226, 0, 16, 0.25)',
      },
      default: {
        shadowColor: '#E20010',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
      },
    }),
  },
  submitButtonDisabled: {
    backgroundColor: '#C5C4CC',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#F7F8FA',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#B3B8C4',
    lineHeight: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#5F6267',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#B3B8C4',
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#E20010',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
