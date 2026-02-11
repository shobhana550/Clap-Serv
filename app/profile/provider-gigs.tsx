/**
 * Provider Gigs & Portfolio Management Screen
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '@/store/authStore';
import { showAlert } from '@/utils/alert';

interface Gig {
  id: string;
  title: string;
  description: string;
  price: string;
  duration: string;
}

interface SocialLink {
  id: string;
  platform: string;
  url: string;
}

export default function ProviderGigsScreen() {
  const { user } = useAuthStore();
  const [bio, setBio] = useState('');
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [isAddingGig, setIsAddingGig] = useState(false);
  const [isAddingLink, setIsAddingLink] = useState(false);

  // New gig form
  const [newGigTitle, setNewGigTitle] = useState('');
  const [newGigDescription, setNewGigDescription] = useState('');
  const [newGigPrice, setNewGigPrice] = useState('');
  const [newGigDuration, setNewGigDuration] = useState('');

  // New link form
  const [newLinkPlatform, setNewLinkPlatform] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  useEffect(() => {
    loadProviderData();
  }, []);

  const loadProviderData = async () => {
    try {
      const providerDataJson = await AsyncStorage.getItem(`provider_data_${user?.id}`);
      if (providerDataJson) {
        const data = JSON.parse(providerDataJson);
        setBio(data.bio || '');
        setGigs(data.gigs || []);
        setSocialLinks(data.socialLinks || []);
      }
    } catch (error) {
      console.error('Error loading provider data:', error);
    }
  };

  const saveProviderData = async () => {
    try {
      const data = {
        bio,
        gigs,
        socialLinks,
        updatedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem(`provider_data_${user?.id}`, JSON.stringify(data));
      showAlert('Success', 'Your information has been saved!');
    } catch (error) {
      console.error('Error saving provider data:', error);
      showAlert('Error', 'Failed to save your information.');
    }
  };

  const handleAddGig = () => {
    if (!newGigTitle.trim() || !newGigDescription.trim() || !newGigPrice.trim()) {
      showAlert('Error', 'Please fill in all required fields for the gig.');
      return;
    }

    const newGig: Gig = {
      id: `gig-${Date.now()}`,
      title: newGigTitle.trim(),
      description: newGigDescription.trim(),
      price: newGigPrice.trim(),
      duration: newGigDuration.trim(),
    };

    setGigs([...gigs, newGig]);
    setNewGigTitle('');
    setNewGigDescription('');
    setNewGigPrice('');
    setNewGigDuration('');
    setIsAddingGig(false);
  };

  const handleDeleteGig = (gigId: string) => {
    showAlert(
      'Delete Gig',
      'Are you sure you want to delete this gig?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setGigs(gigs.filter(g => g.id !== gigId));
          },
        },
      ]
    );
  };

  const handleAddLink = () => {
    if (!newLinkPlatform.trim() || !newLinkUrl.trim()) {
      showAlert('Error', 'Please fill in both platform and URL.');
      return;
    }

    const newLink: SocialLink = {
      id: `link-${Date.now()}`,
      platform: newLinkPlatform.trim(),
      url: newLinkUrl.trim(),
    };

    setSocialLinks([...socialLinks, newLink]);
    setNewLinkPlatform('');
    setNewLinkUrl('');
    setIsAddingLink(false);
  };

  const handleDeleteLink = (linkId: string) => {
    showAlert(
      'Delete Link',
      'Are you sure you want to delete this link?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setSocialLinks(socialLinks.filter(l => l.id !== linkId));
          },
        },
      ]
    );
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/(tabs)/profile');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color="#E20010" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Gigs & Portfolio</Text>
        <TouchableOpacity onPress={saveProviderData} style={styles.saveButton}>
          <FontAwesome name="save" size={20} color="#10B981" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Bio Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Bio</Text>
          <Text style={styles.sectionSubtitle}>
            Tell clients about your experience and expertise
          </Text>
          <TextInput
            style={styles.bioInput}
            placeholder="Enter your professional bio..."
            placeholderTextColor="#C5C4CC"
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={6}
          />
        </View>

        {/* Social Links Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Links & Portfolio</Text>
              <Text style={styles.sectionSubtitle}>
                Add your website, YouTube, LinkedIn, etc.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setIsAddingLink(true)}
            >
              <FontAwesome name="plus" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {isAddingLink && (
            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Platform (e.g., YouTube, Website, LinkedIn)"
                placeholderTextColor="#C5C4CC"
                value={newLinkPlatform}
                onChangeText={setNewLinkPlatform}
              />
              <TextInput
                style={styles.input}
                placeholder="URL (e.g., https://youtube.com/@yourhandle)"
                placeholderTextColor="#C5C4CC"
                value={newLinkUrl}
                onChangeText={setNewLinkUrl}
                autoCapitalize="none"
                keyboardType="url"
              />
              <View style={styles.formActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setIsAddingLink(false);
                    setNewLinkPlatform('');
                    setNewLinkUrl('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitButton} onPress={handleAddLink}>
                  <Text style={styles.submitButtonText}>Add Link</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {socialLinks.map((link) => (
            <View key={link.id} style={styles.linkCard}>
              <View style={styles.linkInfo}>
                <FontAwesome name="link" size={16} color="#E20010" />
                <View style={styles.linkContent}>
                  <Text style={styles.linkPlatform}>{link.platform}</Text>
                  <Text style={styles.linkUrl} numberOfLines={1}>
                    {link.url}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => handleDeleteLink(link.id)}>
                <FontAwesome name="trash" size={16} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))}

          {socialLinks.length === 0 && !isAddingLink && (
            <Text style={styles.emptyText}>
              No links added yet. Tap + to add your portfolio links.
            </Text>
          )}
        </View>

        {/* Gigs Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>My Services/Gigs</Text>
              <Text style={styles.sectionSubtitle}>
                List the services you offer with pricing
              </Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setIsAddingGig(true)}
            >
              <FontAwesome name="plus" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {isAddingGig && (
            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Gig Title *"
                placeholderTextColor="#C5C4CC"
                value={newGigTitle}
                onChangeText={setNewGigTitle}
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Gig Description *"
                placeholderTextColor="#C5C4CC"
                value={newGigDescription}
                onChangeText={setNewGigDescription}
                multiline
                numberOfLines={4}
              />
              <TextInput
                style={styles.input}
                placeholder="Price (e.g., ₹5000 or ₹500/hour) *"
                placeholderTextColor="#C5C4CC"
                value={newGigPrice}
                onChangeText={setNewGigPrice}
              />
              <TextInput
                style={styles.input}
                placeholder="Delivery Time (e.g., 3 days, 1 week)"
                placeholderTextColor="#C5C4CC"
                value={newGigDuration}
                onChangeText={setNewGigDuration}
              />
              <View style={styles.formActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setIsAddingGig(false);
                    setNewGigTitle('');
                    setNewGigDescription('');
                    setNewGigPrice('');
                    setNewGigDuration('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitButton} onPress={handleAddGig}>
                  <Text style={styles.submitButtonText}>Add Gig</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {gigs.map((gig) => (
            <View key={gig.id} style={styles.gigCard}>
              <View style={styles.gigHeader}>
                <Text style={styles.gigTitle}>{gig.title}</Text>
                <TouchableOpacity onPress={() => handleDeleteGig(gig.id)}>
                  <FontAwesome name="trash" size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
              <Text style={styles.gigDescription}>{gig.description}</Text>
              <View style={styles.gigFooter}>
                <View style={styles.gigDetail}>
                  <FontAwesome name="money" size={14} color="#10B981" />
                  <Text style={styles.gigPrice}>{gig.price}</Text>
                </View>
                {gig.duration && (
                  <View style={styles.gigDetail}>
                    <FontAwesome name="clock-o" size={14} color="#F59E0B" />
                    <Text style={styles.gigDuration}>{gig.duration}</Text>
                  </View>
                )}
              </View>
            </View>
          ))}

          {gigs.length === 0 && !isAddingGig && (
            <Text style={styles.emptyText}>
              No gigs added yet. Tap + to create your first service offering.
            </Text>
          )}
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
  saveButton: {
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
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#5F6267',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#B3B8C4',
    marginTop: 4,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E20010',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bioInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#5F6267',
    textAlignVertical: 'top',
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#E6E9EF',
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E6E9EF',
  },
  input: {
    backgroundColor: '#F7F8FA',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#5F6267',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E6E9EF',
  },
  textArea: {
    textAlignVertical: 'top',
    minHeight: 100,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E6E9EF',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#B3B8C4',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#E20010',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  linkCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6E9EF',
  },
  linkInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  linkContent: {
    flex: 1,
  },
  linkPlatform: {
    fontSize: 15,
    fontWeight: '600',
    color: '#5F6267',
    marginBottom: 4,
  },
  linkUrl: {
    fontSize: 13,
    color: '#B3B8C4',
  },
  gigCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E6E9EF',
  },
  gigHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  gigTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5F6267',
    flex: 1,
  },
  gigDescription: {
    fontSize: 14,
    color: '#B3B8C4',
    lineHeight: 20,
    marginBottom: 12,
  },
  gigFooter: {
    flexDirection: 'row',
    gap: 16,
  },
  gigDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gigPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  gigDuration: {
    fontSize: 14,
    color: '#B3B8C4',
  },
  emptyText: {
    fontSize: 14,
    color: '#C5C4CC',
    textAlign: 'center',
    paddingVertical: 32,
    fontStyle: 'italic',
  },
});
