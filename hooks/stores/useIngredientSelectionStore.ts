// hooks/stores/useIngredientSelectionStore.ts

import { useState, useEffect } from 'react';

interface IngredientSelectionStore {
  selectedIngredients: Map<string, string>; // recipeId-componentId -> ingredientId
  setSelectedIngredient: (recipeId: string, componentId: string, ingredientId: string | undefined) => void;
  getSelectedIngredient: (recipeId: string, componentId: string) => string | undefined;
  clearSelection: (recipeId: string, componentId: string) => void;
  clearAllSelections: () => void;
}

const STORAGE_KEY = 'alchemy-ingredient-selections';

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

  // Сохраняем состояние в localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(selectedIngredients.entries())));
  }, [selectedIngredients]);

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

  return {
    selectedIngredients,
    setSelectedIngredient,
    getSelectedIngredient,
    clearSelection,
    clearAllSelections
  };
}
