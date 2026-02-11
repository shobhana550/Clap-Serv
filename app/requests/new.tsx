/**
 * Post New Service Request Screen
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  TextInput,
  Image,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { showAlert } from '@/utils/alert';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { getCurrentLocation, formatLocationString } from '@/lib/utils/location';
import { Location } from '@/types';
import { notifyMatchingProviders } from '@/lib/notifications';

interface DbCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  max_distance_km: number | null;
}

// Validation schema
const requestSchema = z.object({
  category_id: z.string().min(1, 'Please select a category'),
  title: z.string()
    .min(10, 'Title must be at least 10 characters')
    .max(100, 'Title must be less than 100 characters'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be less than 1000 characters'),
  budget_min: z.string()
    .min(1, 'Minimum budget is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Must be a valid positive number'),
  budget_max: z.string()
    .min(1, 'Maximum budget is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Must be a valid positive number'),
  when_needed: z.string().min(1, 'Please select when you need the service'),
});

type RequestFormData = z.infer<typeof requestSchema>;

export default function NewRequestScreen() {
  const { user } = useAuthStore();
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState<Date>(new Date());
  const [attachments, setAttachments] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [dbCategories, setDbCategories] = useState<DbCategory[]>([]);

  // Fetch categories from Supabase
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('service_categories')
        .select('id, name, description, icon, max_distance_km')
        .order('name');
      if (!error && data) {
        setDbCategories(data);
      }
    };
    fetchCategories();
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      category_id: '',
      title: '',
      description: '',
      budget_min: '',
      budget_max: '',
      when_needed: '',
    },
  });

  const selectedCategoryId = watch('category_id');
  const selectedCategory = dbCategories.find(cat => cat.id === selectedCategoryId);

  // Auto-capture location when a physical service category is selected
  useEffect(() => {
    if (selectedCategory && selectedCategory.max_distance_km !== null && !userLocation) {
      fetchUserLocation();
    }
  }, [selectedCategoryId, selectedCategory]);

  const fetchUserLocation = async () => {
    setLocationLoading(true);
    const loc = await getCurrentLocation();
    setUserLocation(loc);
    setLocationLoading(false);
  };

  const onSubmit = async (data: RequestFormData) => {
    console.log('Form submitted with data:', data);

    // Validate budget range
    const minBudget = Number(data.budget_min);
    const maxBudget = Number(data.budget_max);

    if (maxBudget < minBudget) {
      showAlert('Validation Error', 'Maximum budget must be greater than minimum budget');
      return;
    }

    // Check location for physical services
    const cat = dbCategories.find((c) => c.id === data.category_id);
    if (cat && cat.max_distance_km !== null && !userLocation) {
      showAlert(
        'Location Required',
        'Physical service requests need your location so nearby providers can find you. Please enable location access.'
      );
      fetchUserLocation();
      return;
    }

    setIsSubmitting(true);

    try {
      // category_id is already the Supabase UUID (fetched from DB)
      const categoryUuid = data.category_id;

      // Build the request object for Supabase
      const requestLocation = userLocation ? {
        lat: userLocation.lat,
        lng: userLocation.lng,
        city: userLocation.city,
        state: userLocation.state,
        address: userLocation.address,
      } : null;

      const newRequest = {
        buyer_id: user?.id,
        category_id: categoryUuid,
        title: data.title,
        description: data.description,
        budget_min: minBudget,
        budget_max: maxBudget,
        timeline: data.when_needed,
        deadline: selectedDateTime.toISOString(),
        location: requestLocation,
        status: 'open',
      };

      const { data: insertedRequest, error } = await supabase
        .from('service_requests')
        .insert(newRequest)
        .select('id')
        .single();

      if (error) {
        console.error('Error saving request:', error);
        setIsSubmitting(false);
        showAlert('Error', error.message || 'Failed to post request. Please try again.');
        return;
      }

      console.log('Request saved to Supabase successfully');

      // Notify matching providers (runs in background, don't block the user)
      if (insertedRequest?.id) {
        notifyMatchingProviders(
          insertedRequest.id,
          categoryUuid,
          data.title,
          requestLocation,
          user?.id!,
          minBudget,
          maxBudget
        ).then((result) => {
          console.log(`Notification sent to ${result.notifiedCount} providers`);
        }).catch((err) => {
          console.error('Error sending notifications:', err);
        });
      }

      setIsSubmitting(false);

      // Navigate to My Requests
      router.push('/requests/my-requests');

      // Show success message after navigation (for web compatibility)
      setTimeout(() => {
        showAlert(
          'Success!',
          'Your service request has been posted. Matching providers will be notified!'
        );
      }, 100);
    } catch (error: any) {
      console.error('Error saving request:', error);
      setIsSubmitting(false);
      showAlert('Error', 'Failed to post request. Please try again.');
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      showAlert('Permission Required', 'Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      const newAttachments = result.assets.map((asset) => ({
        uri: asset.uri,
        type: 'image',
        name: asset.fileName || `image_${Date.now()}.jpg`,
      }));
      setAttachments([...attachments, ...newAttachments]);
    }
  };

  const takePicture = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      showAlert('Permission Required', 'Permission to access camera is required!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      const newAttachment = {
        uri: result.assets[0].uri,
        type: 'image',
        name: `photo_${Date.now()}.jpg`,
      };
      setAttachments([...attachments, newAttachment]);
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
      multiple: true,
    });

    if (!result.canceled && result.assets) {
      const newAttachments = result.assets.map((asset) => ({
        uri: asset.uri,
        type: 'document',
        name: asset.name,
      }));
      setAttachments([...attachments, ...newAttachments]);
    }
  };

  const removeAttachment = (index: number) => {
    const newAttachments = attachments.filter((_, i) => i !== index);
    setAttachments(newAttachments);
  };

  const handleDateTimeChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      setShowTimePicker(false);
    }

    if (date) {
      setSelectedDateTime(date);
      const formattedDateTime = date.toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      setValue('when_needed', formattedDateTime);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color="#E20010" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post Service Request</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Category Selection */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Category <Text style={styles.required}>*</Text>
          </Text>
          <Controller
            control={control}
            name="category_id"
            render={({ field: { value } }) => (
              <TouchableOpacity
                style={[
                  styles.categoryButton,
                  errors.category_id && styles.inputError,
                ]}
                onPress={() => setShowCategoryPicker(!showCategoryPicker)}
              >
                <View style={styles.categoryButtonContent}>
                  {selectedCategory ? (
                    <>
                      <FontAwesome
                        name={selectedCategory.icon as any}
                        size={18}
                        color="#E20010"
                      />
                      <Text style={styles.categoryButtonText}>
                        {selectedCategory.name}
                      </Text>
                    </>
                  ) : (
                    <Text style={styles.categoryPlaceholder}>Select a category</Text>
                  )}
                </View>
                <FontAwesome
                  name={showCategoryPicker ? 'chevron-up' : 'chevron-down'}
                  size={14}
                  color="#B3B8C4"
                />
              </TouchableOpacity>
            )}
          />
          {errors.category_id && (
            <Text style={styles.errorText}>{errors.category_id.message}</Text>
          )}

          {/* Category Picker Dropdown */}
          {showCategoryPicker && (
            <View style={styles.categoryDropdown}>
              <ScrollView style={styles.categoryList} nestedScrollEnabled>
                {dbCategories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryItem,
                      selectedCategoryId === category.id && styles.categoryItemSelected,
                    ]}
                    onPress={() => {
                      setValue('category_id', category.id);
                      setShowCategoryPicker(false);
                    }}
                  >
                    <FontAwesome
                      name={category.icon as any}
                      size={18}
                      color={selectedCategoryId === category.id ? '#E20010' : '#B3B8C4'}
                    />
                    <Text
                      style={[
                        styles.categoryItemText,
                        selectedCategoryId === category.id && styles.categoryItemTextSelected,
                      ]}
                    >
                      {category.name}
                    </Text>
                    {selectedCategoryId === category.id && (
                      <FontAwesome name="check" size={16} color="#E20010" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Title */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Title <Text style={styles.required}>*</Text>
          </Text>
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, errors.title && styles.inputError]}
                placeholder="e.g., Need a professional plumber for bathroom renovation"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholderTextColor="#C5C4CC"
              />
            )}
          />
          {errors.title && (
            <Text style={styles.errorText}>{errors.title.message}</Text>
          )}
        </View>

        {/* Description */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Description <Text style={styles.required}>*</Text>
          </Text>
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.textArea, errors.description && styles.inputError]}
                placeholder="Provide detailed information about what you need..."
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                placeholderTextColor="#C5C4CC"
              />
            )}
          />
          {errors.description && (
            <Text style={styles.errorText}>{errors.description.message}</Text>
          )}
          <Text style={styles.helperText}>
            {watch('description')?.length || 0} / 1000 characters
          </Text>
        </View>

        {/* Budget Range */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Budget Range <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.budgetRow}>
            <View style={styles.budgetInput}>
              <Text style={styles.budgetLabel}>Minimum</Text>
              <Controller
                control={control}
                name="budget_min"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.currencyInput}>
                    <Text style={styles.currencySymbol}>₹</Text>
                    <TextInput
                      style={[
                        styles.currencyField,
                        errors.budget_min && styles.inputError,
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
            </View>
            <Text style={styles.budgetSeparator}>-</Text>
            <View style={styles.budgetInput}>
              <Text style={styles.budgetLabel}>Maximum</Text>
              <Controller
                control={control}
                name="budget_max"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.currencyInput}>
                    <Text style={styles.currencySymbol}>₹</Text>
                    <TextInput
                      style={[
                        styles.currencyField,
                        errors.budget_max && styles.inputError,
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
            </View>
          </View>
          {(errors.budget_min || errors.budget_max) && (
            <Text style={styles.errorText}>
              {errors.budget_min?.message || errors.budget_max?.message}
            </Text>
          )}
        </View>

        {/* When do you want it */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            When do you want it? <Text style={styles.required}>*</Text>
          </Text>
          <Controller
            control={control}
            name="when_needed"
            render={({ field: { onChange, value } }) => (
              <>
                {Platform.OS === 'web' ? (
                  <>
                    <TextInput
                      style={styles.input}
                      type="datetime-local"
                      min={new Date().toISOString().slice(0, 16)}
                      onChange={(e: any) => {
                        const datetimeValue = e.target.value;
                        if (datetimeValue) {
                          // Convert datetime-local value to readable format
                          const date = new Date(datetimeValue);
                          const formattedDateTime = date.toLocaleString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                          });
                          onChange(formattedDateTime);
                        }
                      }}
                      placeholderTextColor="#C5C4CC"
                    />
                    {value && (
                      <View style={styles.selectedDateTimeDisplay}>
                        <FontAwesome name="clock-o" size={16} color="#E20010" />
                        <Text style={styles.selectedDateTimeText}>{value}</Text>
                      </View>
                    )}
                  </>
                ) : (
                  <>
                    <TouchableOpacity
                      style={styles.dateButton}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <FontAwesome name="calendar" size={18} color="#E20010" />
                      <Text style={styles.dateButtonText}>
                        {value || 'Select date and time'}
                      </Text>
                    </TouchableOpacity>

                    {/* Date Picker */}
                    {showDatePicker && (
                      <DateTimePicker
                        value={selectedDateTime}
                        mode="date"
                        display="default"
                        minimumDate={new Date()}
                        onChange={(event, date) => {
                          if (Platform.OS === 'android') {
                            setShowDatePicker(false);
                            if (date) {
                              setSelectedDateTime(date);
                              setShowTimePicker(true);
                            }
                          } else {
                            if (date) {
                              setSelectedDateTime(date);
                              setShowDatePicker(false);
                              setShowTimePicker(true);
                            }
                          }
                        }}
                      />
                    )}

                    {/* Time Picker */}
                    {showTimePicker && (
                      <DateTimePicker
                        value={selectedDateTime}
                        mode="time"
                        display="default"
                        onChange={handleDateTimeChange}
                      />
                    )}
                  </>
                )}
              </>
            )}
          />
          {errors.when_needed && (
            <Text style={styles.errorText}>{errors.when_needed.message}</Text>
          )}
          <Text style={styles.helperText}>
            Select the date and time when you need the service
          </Text>
        </View>

        {/* Location (auto-captured for physical services) */}
        {selectedCategory && selectedCategory.max_distance_km !== null && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Your Location <Text style={styles.required}>*</Text>
            </Text>
            {locationLoading ? (
              <View style={styles.dateButton}>
                <FontAwesome name="spinner" size={18} color="#E20010" />
                <Text style={styles.dateButtonText}>Getting your location...</Text>
              </View>
            ) : userLocation ? (
              <View style={styles.dateButton}>
                <FontAwesome name="map-marker" size={18} color="#10B981" />
                <Text style={[styles.dateButtonText, { color: '#10B981' }]}>
                  {formatLocationString(userLocation)}
                </Text>
                <TouchableOpacity onPress={fetchUserLocation}>
                  <FontAwesome name="refresh" size={14} color="#B3B8C4" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.dateButton} onPress={fetchUserLocation}>
                <FontAwesome name="map-marker" size={18} color="#E20010" />
                <Text style={styles.dateButtonText}>Tap to capture your location</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.helperText}>
              Location is required for {selectedCategory.name} (within {selectedCategory.max_distance_km}km range)
            </Text>
          </View>
        )}

        {/* Attachments */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Attachments (Optional)</Text>
          <View style={styles.attachmentButtons}>
            <TouchableOpacity style={styles.attachmentButton} onPress={takePicture}>
              <FontAwesome name="camera" size={20} color="#E20010" />
              <Text style={styles.attachmentButtonText}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.attachmentButton} onPress={pickImage}>
              <FontAwesome name="image" size={20} color="#E20010" />
              <Text style={styles.attachmentButtonText}>Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.attachmentButton} onPress={pickDocument}>
              <FontAwesome name="file" size={20} color="#E20010" />
              <Text style={styles.attachmentButtonText}>Document</Text>
            </TouchableOpacity>
          </View>

          {/* Display attachments */}
          {attachments.length > 0 && (
            <View style={styles.attachmentsList}>
              {attachments.map((attachment, index) => (
                <View key={index} style={styles.attachmentItem}>
                  {attachment.type === 'image' && (
                    <Image source={{ uri: attachment.uri }} style={styles.attachmentImage} />
                  )}
                  <View style={styles.attachmentInfo}>
                    <FontAwesome
                      name={attachment.type === 'image' ? 'image' : 'file'}
                      size={16}
                      color="#B3B8C4"
                    />
                    <Text style={styles.attachmentName} numberOfLines={1}>
                      {attachment.name}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => removeAttachment(index)}>
                    <FontAwesome name="times-circle" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={() => {
            console.log('Button clicked!');
            console.log('Form errors:', errors);
            handleSubmit(onSubmit, (errors) => {
              console.log('Form validation failed:', errors);
              showAlert('Form Error', 'Please fill in all required fields correctly.');
            })();
          }}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Text style={styles.submitButtonText}>Posting...</Text>
          ) : (
            <>
              <FontAwesome name="paper-plane" size={16} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>Post Service Request</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.infoCard}>
          <FontAwesome name="info-circle" size={20} color="#E20010" />
          <Text style={styles.infoText}>
            Your request will be visible to qualified service providers who can submit proposals.
          </Text>
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
    minHeight: 120,
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
  categoryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E9EF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  categoryButtonText: {
    fontSize: 15,
    color: '#5F6267',
    fontWeight: '500',
  },
  categoryPlaceholder: {
    fontSize: 15,
    color: '#C5C4CC',
  },
  categoryDropdown: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E9EF',
    borderRadius: 8,
    marginTop: 8,
    maxHeight: 300,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      },
    }),
  },
  categoryList: {
    maxHeight: 300,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E6E9EF',
  },
  categoryItemSelected: {
    backgroundColor: '#FFF0F1',
  },
  categoryItemText: {
    flex: 1,
    fontSize: 14,
    color: '#5F6267',
  },
  categoryItemTextSelected: {
    color: '#E20010',
    fontWeight: '600',
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  budgetInput: {
    flex: 1,
  },
  budgetLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#B3B8C4',
    marginBottom: 6,
  },
  currencyInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E9EF',
    borderRadius: 8,
    paddingHorizontal: 12,
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
  budgetSeparator: {
    fontSize: 18,
    color: '#B3B8C4',
    marginBottom: 12,
  },
  dateButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E9EF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dateButtonText: {
    fontSize: 15,
    color: '#5F6267',
    flex: 1,
  },
  selectedDateTimeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF0F1',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFC7CB',
  },
  selectedDateTimeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E20010',
  },
  submitButton: {
    backgroundColor: '#E20010',
    borderRadius: 8,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 6px -1px rgba(30, 64, 175, 0.3)',
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
    backgroundColor: '#FFF0F1',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#E20010',
    lineHeight: 18,
  },
  attachmentButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  attachmentButton: {
    flex: 1,
    backgroundColor: '#FFF0F1',
    borderWidth: 1,
    borderColor: '#FFC7CB',
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  attachmentButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E20010',
  },
  attachmentsList: {
    marginTop: 12,
    gap: 8,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F8FA',
    borderRadius: 8,
    padding: 12,
    gap: 12,
  },
  attachmentImage: {
    width: 50,
    height: 50,
    borderRadius: 6,
  },
  attachmentInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  attachmentName: {
    flex: 1,
    fontSize: 14,
    color: '#5F6267',
  },
});
