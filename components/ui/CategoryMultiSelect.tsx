/**
 * CategoryMultiSelect - Multi-select component for service categories
 * Fetches categories from Supabase so admin-added categories are included
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { supabase } from '@/lib/supabase';

interface DbCategory {
  id: string;
  name: string;
  icon: string;
  max_distance_km: number | null;
}

interface CategoryMultiSelectProps {
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

export const CategoryMultiSelect: React.FC<CategoryMultiSelectProps> = ({
  selectedIds,
  onSelectionChange,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('service_categories')
        .select('id, name, icon, max_distance_km')
        .order('name');

      if (!error && data) {
        setCategories(data);
      }
      setLoading(false);
    };

    fetchCategories();
  }, []);

  const toggleCategory = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((s) => s !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const getCatById = (id: string) => categories.find((c) => c.id === id);

  // Group categories by distance type
  const localCats = categories.filter((c) => c.max_distance_km !== null && c.max_distance_km <= 5);
  const cityCats = categories.filter((c) => c.max_distance_km !== null && c.max_distance_km > 5);
  const onlineCats = categories.filter((c) => c.max_distance_km === null);

  const groups = [
    { key: 'local', title: 'Local Services (Within 5 KM)', categories: localCats },
    { key: 'city', title: 'City Services (Within 30 KM)', categories: cityCats },
    { key: 'online', title: 'Online Services (Anywhere)', categories: onlineCats },
  ];

  return (
    <View>
      {/* Selected chips */}
      {selectedIds.length > 0 && (
        <View style={styles.chipsContainer}>
          {selectedIds.map((id) => {
            const cat = getCatById(id);
            if (!cat) return null;
            return (
              <TouchableOpacity
                key={id}
                style={styles.chip}
                onPress={() => toggleCategory(id)}
              >
                <FontAwesome name={(cat.icon || 'tag') as any} size={12} color="#E20010" />
                <Text style={styles.chipText}>{cat.name}</Text>
                <FontAwesome name="times" size={10} color="#E20010" />
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Toggle button */}
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => setExpanded(!expanded)}
      >
        <Text style={styles.toggleText}>
          {expanded ? 'Hide categories' : `Select categories (${selectedIds.length} selected)`}
        </Text>
        <FontAwesome
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={14}
          color="#B3B8C4"
        />
      </TouchableOpacity>

      {/* Category list */}
      {expanded && (
        <View style={styles.dropdown}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#E20010" />
              <Text style={styles.loadingText}>Loading categories...</Text>
            </View>
          ) : (
            <ScrollView style={styles.scrollView} nestedScrollEnabled>
              {groups.map((group) => {
                if (group.categories.length === 0) return null;
                return (
                  <View key={group.key}>
                    <Text style={styles.groupTitle}>{group.title}</Text>
                    {group.categories.map((cat) => {
                      const isSelected = selectedIds.includes(cat.id);
                      return (
                        <TouchableOpacity
                          key={cat.id}
                          style={[
                            styles.categoryItem,
                            isSelected && styles.categoryItemSelected,
                          ]}
                          onPress={() => toggleCategory(cat.id)}
                        >
                          <FontAwesome
                            name={(cat.icon || 'tag') as any}
                            size={16}
                            color={isSelected ? '#E20010' : '#B3B8C4'}
                          />
                          <Text
                            style={[
                              styles.categoryText,
                              isSelected && styles.categoryTextSelected,
                            ]}
                          >
                            {cat.name}
                          </Text>
                          {isSelected && (
                            <FontAwesome name="check" size={14} color="#E20010" />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                );
              })}
            </ScrollView>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF0F1',
    borderWidth: 1,
    borderColor: '#FFC7CB',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E20010',
  },
  toggleButton: {
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
  toggleText: {
    fontSize: 14,
    color: '#5F6267',
  },
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E9EF',
    borderRadius: 8,
    marginTop: 8,
    maxHeight: 350,
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
  scrollView: {
    maxHeight: 350,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: '#B3B8C4',
  },
  groupTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B3B8C4',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
    backgroundColor: '#F7F8FA',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#F7F8FA',
  },
  categoryItemSelected: {
    backgroundColor: '#FFF0F1',
  },
  categoryText: {
    flex: 1,
    fontSize: 14,
    color: '#5F6267',
  },
  categoryTextSelected: {
    color: '#E20010',
    fontWeight: '600',
  },
});
