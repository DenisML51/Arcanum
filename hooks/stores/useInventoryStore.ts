// hooks/stores/useInventoryStore.ts

import { useState, useEffect } from 'react';
import type { Ingredient } from '../types';

interface InventoryStore {
  ingredients: Ingredient[];
  addIngredient: (ingredient: Omit<Ingredient, 'id'>) => void;
  updateIngredientQuantity: (id: string, quantity: number) => void;
  removeIngredient: (id: string) => void;
  getIngredient: (id: string) => Ingredient | undefined;
  getTotalIngredients: () => number;
  getIngredientsByCategory: (category: string) => Ingredient[];
  isIngredientAvailable: (id: string, requiredQuantity?: number) => boolean;
  useIngredients: (ingredients: { id: string; quantity: number }[]) => boolean;
  cleanDuplicates: () => void;
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

  // Загружаем начальные ингредиенты из JSON если инвентарь пуст
  useEffect(() => {
    const loadInitialIngredients = async () => {
      if (ingredients.length === 0) {
        try {
          const { loadIngredients } = await import('../../utils/dataLoader');
          const initialIngredients = await loadIngredients();
          setIngredients(initialIngredients);
        } catch (error) {
          console.error('Failed to load initial ingredients:', error);
        }
      }
    };
    loadInitialIngredients();
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ingredients));
  }, [ingredients]);

  // Функция для сравнения ингредиентов (исключая id и quantity)
  const areIngredientsEqual = (ing1: Omit<Ingredient, 'id' | 'quantity'>, ing2: Omit<Ingredient, 'id' | 'quantity'>): boolean => {
    // Основные поля для сравнения
    if (ing1.name !== ing2.name || ing1.type !== ing2.type) {
      return false;
    }
    
    // Сравниваем массивы элементов
    const elements1 = [...(ing1.elements || [])].sort();
    const elements2 = [...(ing2.elements || [])].sort();
    if (elements1.length !== elements2.length || !elements1.every((el, i) => el === elements2[i])) {
      return false;
    }
    
    // Сравниваем массивы тегов
    const tags1 = [...(ing1.tags || [])].sort();
    const tags2 = [...(ing2.tags || [])].sort();
    if (tags1.length !== tags2.length || !tags1.every((tag, i) => tag === tags2[i])) {
      return false;
    }
    
    // Сравниваем массивы локаций
    const locations1 = [...(ing1.locations || [])].sort();
    const locations2 = [...(ing2.locations || [])].sort();
    if (locations1.length !== locations2.length || !locations1.every((loc, i) => loc === locations2[i])) {
      return false;
    }
    
    // Сравниваем остальные поля
    return (
      ing1.description === ing2.description &&
      ing1.category === ing2.category &&
      ing1.rarity === ing2.rarity &&
      ing1.cost === ing2.cost &&
      ing1.weight === ing2.weight &&
      ing1.isBase === ing2.isBase &&
      ing1.baseRarityModifier === ing2.baseRarityModifier &&
      ing1.shortCode === ing2.shortCode
    );
  };

  const addIngredient = (ingredient: Omit<Ingredient, 'id'>) => {
    setIngredients(prev => {
      // Проверяем, что ингредиент валидный
      if (!ingredient || !ingredient.name || !ingredient.type) {
        console.warn('Invalid ingredient:', ingredient);
        return prev;
      }

      // Ищем существующий ингредиент с такими же характеристиками
      const existingIndex = prev.findIndex(existing => 
        areIngredientsEqual(existing, ingredient)
      );

      if (existingIndex !== -1) {
        // Если нашли совпадающий ингредиент, суммируем количества
        const updatedIngredients = [...prev];
        updatedIngredients[existingIndex] = {
          ...updatedIngredients[existingIndex],
          quantity: updatedIngredients[existingIndex].quantity + (ingredient.quantity || 0)
        };
        return updatedIngredients;
      } else {
        // Если не нашли, добавляем новый ингредиент
        return [
          ...prev,
          { ...ingredient, id: Date.now().toString() + Math.random().toString(36).substr(2, 9) }
        ];
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

  const getTotalIngredients = () => {
    return ingredients.reduce((total, ing) => total + ing.quantity, 0);
  };

  // Функция для очистки дубликатов
  const cleanDuplicates = () => {
    setIngredients(prev => {
      const cleaned: Ingredient[] = [];
      
      prev.forEach(ingredient => {
        const existingIndex = cleaned.findIndex(existing => 
          areIngredientsEqual(existing, ingredient)
        );
        
        if (existingIndex !== -1) {
          // Если нашли дубликат, суммируем количества
          cleaned[existingIndex] = {
            ...cleaned[existingIndex],
            quantity: cleaned[existingIndex].quantity + ingredient.quantity
          };
        } else {
          // Если не нашли, добавляем как новый
          cleaned.push(ingredient);
        }
      });
      
      return cleaned;
    });
  };

  const getIngredientsByCategory = (category: string) => {
    return ingredients.filter(ing => ing.category === category);
  };

  const isIngredientAvailable = (id: string, requiredQuantity = 1) => {
    const ingredient = getIngredient(id);
    return ingredient ? ingredient.quantity >= requiredQuantity : false;
  };

  const useIngredients = (ingredientsToUse: { id: string; quantity: number }[]) => {
    // Проверяем доступность всех ингредиентов
    for (const { id, quantity } of ingredientsToUse) {
      if (!isIngredientAvailable(id, quantity)) {
        return false;
      }
    }

    // Списываем ингредиенты
    for (const { id, quantity } of ingredientsToUse) {
      const ingredient = getIngredient(id);
      if (ingredient) {
        updateIngredientQuantity(id, ingredient.quantity - quantity);
      }
    }

    return true;
  };

  return {
    ingredients,
    addIngredient,
    updateIngredientQuantity,
    removeIngredient,
    getIngredient,
    getTotalIngredients,
    getIngredientsByCategory,
    isIngredientAvailable,
    useIngredients,
    cleanDuplicates
  };
}
