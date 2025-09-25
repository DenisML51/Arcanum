// hooks/stores/usePotionStore.ts

import { useState, useEffect } from 'react';
import type { Potion } from '../types';

interface PotionStore {
  potions: Potion[];
  addPotion: (potion: Omit<Potion, 'id'>) => void;
  updatePotionQuantity: (id: string, quantity: number) => void;
  removePotion: (id: string) => void;
  togglePotionFavorite: (id: string) => void;
  getPotion: (id: string) => Potion | undefined;
  getPotionsByType: (type: string) => Potion[];
  getFavoritePotions: () => Potion[];
  getTotalPotions: () => number;
  consumePotion: (id: string, quantity?: number) => boolean;

  setPotions: (potions: Potion[]) => void;
}

const STORAGE_KEY = 'alchemy-potions';

export function usePotionStore(): PotionStore {
  const [potions, setPotions] = useState<Potion[]>(() => {
    if (typeof window === 'undefined') return [];
    
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        return Array.isArray(data) ? data.filter(p => p.quantity > 0) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(potions));
  }, [potions]);

  const addPotion = (potion: Omit<Potion, 'id'>) => {
    setPotions(prev => {
      // Проверяем, есть ли уже такое зелье (по recipeId)
      const existingIndex = prev.findIndex(p => 
        p.recipeId === potion.recipeId && 
        p.brewedQuality === potion.brewedQuality &&
        p.flawEffect === potion.flawEffect &&
        p.excellenceEffect === potion.excellenceEffect
      );

      if (existingIndex >= 0) {
        // Увеличиваем количество существующего зелья
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + potion.quantity
        };
        return updated;
      } else {
        // Добавляем новое зелье
        return [...prev, { ...potion, id: Date.now().toString() }];
      }
    });
  };

  const updatePotionQuantity = (id: string, quantity: number) => {
    setPotions(prev => prev.map(potion =>
      potion.id === id ? { ...potion, quantity: Math.max(0, quantity) } : potion
    ).filter(potion => potion.quantity > 0));
  };

  const removePotion = (id: string) => {
    setPotions(prev => prev.filter(potion => potion.id !== id));
  };

  const togglePotionFavorite = (id: string) => {
    setPotions(prev => prev.map(potion =>
      potion.id === id ? { ...potion, isFavorite: !potion.isFavorite } : potion
    ));
  };

  const getPotion = (id: string) => {
    return potions.find(potion => potion.id === id);
  };

  const getPotionsByType = (type: string) => {
    return potions.filter(potion => potion.potionType === type);
  };

  const getFavoritePotions = () => {
    return potions.filter(potion => potion.isFavorite);
  };

  const getTotalPotions = () => {
    return potions.reduce((total, potion) => total + potion.quantity, 0);
  };

  const consumePotion = (id: string, quantity = 1) => {
    const potion = getPotion(id);
    if (!potion || potion.quantity < quantity) {
      return false;
    }

    updatePotionQuantity(id, potion.quantity - quantity);
    return true;
  };

  const setPotionsState = (newPotions: Potion[]) => {
    setPotions(Array.isArray(newPotions) ? newPotions : []);
  };

  return {
    potions,
    addPotion,
    updatePotionQuantity,
    removePotion,
    togglePotionFavorite,
    getPotion,
    getPotionsByType,
    getFavoritePotions,
    getTotalPotions,
    consumePotion,
    setPotions: setPotionsState,
  };
}
