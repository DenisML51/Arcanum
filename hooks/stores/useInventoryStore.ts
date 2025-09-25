// hooks/stores/useInventoryStore.ts

import { useState, useEffect } from 'react';
import type { Ingredient } from '../types';

interface InventoryStore {
  ingredients: Ingredient[];
  addIngredient: (ingredient: Ingredient) => void;
  updateIngredientQuantity: (id: string, quantity: number) => void;
  removeIngredient: (id: string) => void;
  getIngredient: (id: string) => Ingredient | undefined;
  isIngredientAvailable: (id: string, requiredQuantity?: number) => boolean;
  useIngredients: (ingredients: { id: string; quantity: number }[]) => boolean;
  cleanDuplicates: () => void;
  swapIngredientElements: (ingredientId: string) => { success: boolean, message: string };
  buyIngredient: (ingredient: Ingredient, quantity: number) => void;
  sellIngredient: (ingredientId: string, quantity: number) => void;
  setIngredients: (ingredients: Ingredient[]) => void;
}

const STORAGE_KEY = 'alchemy-inventory';

export function useInventoryStore(): InventoryStore {
  const [ingredients, setIngredients] = useState<Ingredient[]>(() => {
    if (typeof window === 'undefined') return [];

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        return Array.isArray(data) ? data : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  const setIngredientsState = (newIngredients: Ingredient[]) => {
    setIngredients(Array.isArray(newIngredients) ? newIngredients : []);
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ingredients));
  }, [ingredients]);

  const areIngredientsEqual = (ing1: Omit<Ingredient, 'id' | 'quantity'>, ing2: Omit<Ingredient, 'id' | 'quantity'>): boolean => {
    return ing1.name === ing2.name && ing1.type === ing2.type && ing1.rarity === ing2.rarity;
  };

  const addIngredient = (ingredient: Ingredient) => {
    setIngredients(prev => {
      if (!ingredient || !ingredient.name || !ingredient.type) {
        console.warn('Invalid ingredient:', ingredient);
        return prev;
      }

      const existingByIdIndex = prev.findIndex(existing => existing.id === ingredient.id);
      if (existingByIdIndex !== -1) {
        const updatedIngredients = [...prev];
        updatedIngredients[existingByIdIndex].quantity += (ingredient.quantity || 1);
        return updatedIngredients;
      }

      const existingByPropsIndex = prev.findIndex(existing => areIngredientsEqual(existing, ingredient));
      if (existingByPropsIndex !== -1) {
        const updatedIngredients = [...prev];
        updatedIngredients[existingByPropsIndex].quantity += (ingredient.quantity || 1);
        return updatedIngredients;
      } else {
        return [...prev, { ...ingredient }];
      }
    });
  };

  const updateIngredientQuantity = (id: string, quantity: number) => {
    setIngredients(prev => prev.map(ing =>
      ing.id === id ? { ...ing, quantity: Math.max(0, quantity) } : ing
    ).filter(ing => ing.quantity > 0));
  };

  const removeIngredient = (id: string) => {
    setIngredients(prev => prev.filter(ing => ing.id !== id));
  };

  const getIngredient = (id: string) => {
    return ingredients.find(ing => ing.id === id);
  };

  const isIngredientAvailable = (id: string, requiredQuantity = 1) => {
    const ingredient = getIngredient(id);
    return ingredient ? ingredient.quantity >= requiredQuantity : false;
  };

  const useIngredients = (ingredientsToUse: { id: string; quantity: number }[]) => {
    for (const { id, quantity } of ingredientsToUse) {
      if (!isIngredientAvailable(id, quantity)) {
        console.error(`Ingredient ${id} not available in required quantity.`);
        return false;
      }
    }
    for (const { id, quantity } of ingredientsToUse) {
      const ingredient = getIngredient(id);
      if (ingredient) {
        updateIngredientQuantity(id, ingredient.quantity - quantity);
      }
    }
    return true;
  };

  const cleanDuplicates = () => {
    setIngredients(prev => {
      const cleaned: Ingredient[] = [];
      prev.forEach(ingredient => {
        const existingIndex = cleaned.findIndex(existing => areIngredientsEqual(existing, ingredient));
        if (existingIndex !== -1) {
          cleaned[existingIndex].quantity += ingredient.quantity;
        } else {
          cleaned.push({ ...ingredient });
        }
      });
      return cleaned;
    });
  };

  const swapIngredientElements = (ingredientId: string): { success: boolean, message: string } => {
    const potionForSwapId = 'potion_of_equality';
    const potionInInventory = ingredients.find(ing => ing.id === potionForSwapId && ing.quantity > 0);

    if (!potionInInventory) {
      return { success: false, message: 'Нет "Зелья Равенства и Братства"!' };
    }

    const targetIngredient = ingredients.find(ing => ing.id === ingredientId);
    if (!targetIngredient) {
      return { success: false, message: 'Целевой ингредиент не найден.' };
    }

    if (!targetIngredient.impurity || !targetIngredient.elements[0]) {
      return { success: false, message: 'У этого ингредиента нет примеси или основного элемента для преобразования.' };
    }

    const newIngredient: Ingredient = {
      ...targetIngredient,
      id: `${targetIngredient.id}-transformed-${Date.now()}`,
      name: `Преобразованный ${targetIngredient.name}`,
      elements: [targetIngredient.impurity],
      impurity: targetIngredient.elements[0],
      quantity: 1,
    };

    updateIngredientQuantity(potionForSwapId, potionInInventory.quantity - 1);
    updateIngredientQuantity(targetIngredient.id, targetIngredient.quantity - 1);
    addIngredient(newIngredient);

    return { success: true, message: `Ингредиент ${targetIngredient.name} преобразован!` };
  };

  const buyIngredient = (ingredient: Ingredient, quantity: number) => {
    addIngredient({ ...ingredient, quantity });
  };

  const sellIngredient = (ingredientId: string, quantity: number) => {
    const existing = ingredients.find(ing => ing.id === ingredientId);
    if (existing) {
      updateIngredientQuantity(ingredientId, existing.quantity - quantity);
    }
  };

  return {
    ingredients,
    addIngredient,
    updateIngredientQuantity,
    removeIngredient,
    getIngredient,
    setIngredients,
    isIngredientAvailable,
    useIngredients,
    cleanDuplicates,
    swapIngredientElements,
    buyIngredient,
    sellIngredient,
  };
}