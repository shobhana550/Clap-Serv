/**
 * useCategoryLookup - React hook for looking up categories by DB UUID
 * Replaces getCategoryById from ServiceCategories constant
 */

import { useState, useEffect } from 'react';
import { getCategories, getCategoryByIdSync } from '@/lib/categoryCache';

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  max_distance_km: number | null;
}

/**
 * Hook that loads categories and provides a sync lookup function.
 * Use this in any component that needs to display category info from a UUID.
 *
 * Usage:
 *   const { getCategoryById, categories, loading } = useCategoryLookup();
 *   const cat = getCategoryById(someUuid);
 *   // cat?.name, cat?.icon, etc.
 */
export const useCategoryLookup = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories().then((cats) => {
      setCategories(cats);
      setLoading(false);
    });
  }, []);

  const getCategoryById = (id: string): Category | undefined => {
    return getCategoryByIdSync(id) || categories.find((c) => c.id === id);
  };

  return { getCategoryById, categories, loading };
};
