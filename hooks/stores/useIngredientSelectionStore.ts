// hooks/stores/useIngredientSelectionStore.ts

import { useState, useEffect } from 'react';

interface IngredientSelectionStore {
  selectedIngredients: Map<string, string>; // recipeId-componentId -> ingredientId
  useMagicalDust: Set<string>;
  setSelectedIngredient: (recipeId: string, componentId: string, ingredientId: string | undefined) => void;
  getSelectedIngredient: (recipeId: string, componentId: string) => string | undefined;
  toggleMagicalDust: (recipeId: string) => void;
  isMagicalDustActive: (recipeId: string) => boolean;
  clearSelection: (recipeId: string, componentId: string) => void;
  clearAllSelections: () => void;

  setSelectedIngredients: (entries: [string, string][]) => void;
  setUseMagicalDust: (recipeIds: string[]) => void;
}

const STORAGE_KEY = 'alchemy-ingredient-selections';
const STORAGE_KEY_SELECTIONS = 'alchemy-ingredient-selections';
const STORAGE_KEY_DUST = 'alchemy-magical-dust';

export function useIngredientSelectionStore(): IngredientSelectionStore {
  const [selectedIngredients, setSelectedIngredients] = useState<Map<string, string>>(() => {
    if (typeof window === 'undefined') return new Map();
    
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        return new Map(Array.isArray(data) ? data : []);
      } catch {
        return new Map();
      }
    }
    return new Map();
  });

  const [useMagicalDust, setUseMagicalDust] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    const saved = localStorage.getItem(STORAGE_KEY_DUST);
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  // Сохраняем состояние в localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(selectedIngredients.entries())));
  }, [selectedIngredients]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_DUST, JSON.stringify(Array.from(useMagicalDust)));
  }, [useMagicalDust]);

  const toggleMagicalDust = (recipeId: string) => {
    setUseMagicalDust(prev => {
      const newSet = new Set(prev);
      if (newSet.has(recipeId)) {
        newSet.delete(recipeId);
      } else {
        newSet.add(recipeId);
      }
      return newSet;
    });
  };

  const isMagicalDustActive = (recipeId: string) => {
    return useMagicalDust.has(recipeId);
  };

  const setSelectedIngredient = (recipeId: string, componentId: string, ingredientId: string | undefined) => {
    const key = `${recipeId}-${componentId}`;
    setSelectedIngredients(prev => {
      const newMap = new Map(prev);
      if (ingredientId) {
        newMap.set(key, ingredientId);
      } else {
        newMap.delete(key);
      }
      return newMap;
    });
  };

  const getSelectedIngredient = (recipeId: string, componentId: string) => {
    const key = `${recipeId}-${componentId}`;
    return selectedIngredients.get(key);
  };

  const clearSelection = (recipeId: string, componentId: string) => {
    const key = `${recipeId}-${componentId}`;
    setSelectedIngredients(prev => {
      const newMap = new Map(prev);
      newMap.delete(key);
      return newMap;
    });
  };

  const clearAllSelections = () => {
    setSelectedIngredients(new Map());
  };

  const setSelectedIngredientsState = (entries: [string, string][]) => {
    setSelectedIngredients(new Map(Array.isArray(entries) ? entries : []));
  };

  const setUseMagicalDustState = (recipeIds: string[]) => {
    setUseMagicalDust(new Set(Array.isArray(recipeIds) ? recipeIds : []));
  };

  return {
    selectedIngredients,
    setSelectedIngredient,
    useMagicalDust,
    isMagicalDustActive,
    getSelectedIngredient,
    toggleMagicalDust,
    clearSelection,
    clearAllSelections,

    setSelectedIngredients: setSelectedIngredientsState,
    setUseMagicalDust: setUseMagicalDustState,
  };
}
