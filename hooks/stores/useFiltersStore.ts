// hooks/stores/useFiltersStore.ts

import { useState, useEffect } from 'react';
import type { Filters } from '../types';

interface FiltersStore {
  filters: Filters;
  updateFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  resetFilters: () => void;
  toggleFilterValue: (filterKey: keyof Filters, value: string) => void;
  hasActiveFilters: () => boolean;
}

const defaultFilters: Filters = {
  ingredientTypes: [],
  rarities: [],
  tags: [],
  search: '',
  availableForRecipes: [],
  potionTypes: [],
  elements: [],
  potionBases: []
};

const STORAGE_KEY = 'alchemy-filters';

export function useFiltersStore(): FiltersStore {
  const [filters, setFilters] = useState<Filters>(() => {
    if (typeof window === 'undefined') return defaultFilters;
    
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        return { ...defaultFilters, ...data };
      } catch {
        return defaultFilters;
      }
    }
    return defaultFilters;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  }, [filters]);

  const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  const toggleFilterValue = (filterKey: keyof Filters, value: string) => {
    setFilters(prev => {
      const currentValues = prev[filterKey];
      if (Array.isArray(currentValues)) {
        const newValues = currentValues.includes(value)
          ? currentValues.filter(v => v !== value)
          : [...currentValues, value];
        return { ...prev, [filterKey]: newValues };
      }
      return prev;
    });
  };

  const hasActiveFilters = () => {
    return (
      filters.search !== '' ||
      filters.ingredientTypes.length > 0 ||
      filters.rarities.length > 0 ||
      filters.tags.length > 0 ||
      filters.availableForRecipes.length > 0 ||
      filters.potionTypes.length > 0 ||
      filters.elements.length > 0 ||
      filters.potionBases.length > 0
    );
  };

  return {
    filters,
    updateFilter,
    resetFilters,
    toggleFilterValue,
    hasActiveFilters
  };
}
