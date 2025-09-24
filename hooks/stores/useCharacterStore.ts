// hooks/stores/useCharacterStore.ts

import { useState, useEffect } from 'react';
import type { Character, BrewingStats, Currency, Equipment } from '../types';
import { convertToGold, convertFromGold } from '../types';

interface CharacterStore {
  character: Character;
  currency: Currency;
  stats: BrewingStats;
  equipment: Equipment[];
  ownedEquipment: string[];
  activeEquipment: Equipment | null;
  getOwnedEquipment: () => Equipment[];
  getAvailableForPurchaseEquipment: () => Equipment[];
  hasEquipment: (equipmentId: string) => boolean;
  updateCharacterName: (name: string) => void;
  updateCharacterLevel: (level: number) => void;
  updateAlchemyToolsProficiency: (hasProficiency: boolean) => void;
  updateCharacterStats: (stats: Partial<Character['baseStats']>) => void;
  updateCurrency: (currency: Partial<Currency>) => void;
  spendGold: (amount: number) => boolean;
  earnGold: (amount: number) => void;
  getTotalGold: () => number;
  buyEquipment: (equipmentId: string) => { success: boolean; message: string };
  setActiveEquipment: (equipmentId: string) => void;
  updateStats: (updates: Partial<BrewingStats>) => void;
  incrementStat: (stat: keyof BrewingStats, amount?: number) => void;
}

const STORAGE_KEY = 'alchemy-character';

const defaultCharacter: Character = {
  name: 'Алхимик',
  level: 1,
  alchemyToolsProficiency: false,
  activeEquipmentId: 'cauldron',
  baseStats: {
    strength: 10,
    dexterity: 14,
    constitution: 12,
    intelligence: 15,
    wisdom: 13,
    charisma: 10
  }
};

const defaultCurrency: Currency = {
  copper: 0,
  silver: 0,
  gold: 100,
  platinum: 0
};

const defaultStats: BrewingStats = {
  totalBrews: 0,
  successfulBrews: 0,
  failedBrews: 0,
  potionsCreated: 0,
  ingredientsUsed: 0,
  goldSpent: 0,
  goldEarned: 0
};

export function useCharacterStore(): CharacterStore {
  const [character, setCharacter] = useState<Character>(() => {
    if (typeof window === 'undefined') return defaultCharacter;
    
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        return { ...defaultCharacter, ...data.character };
      } catch {
        return defaultCharacter;
      }
    }
    return defaultCharacter;
  });

  const [currency, setCurrency] = useState<Currency>(() => {
    if (typeof window === 'undefined') return defaultCurrency;
    
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        return data.currency || defaultCurrency;
      } catch {
        return defaultCurrency;
      }
    }
    return defaultCurrency;
  });

  const [stats, setStats] = useState<BrewingStats>(() => {
    if (typeof window === 'undefined') return defaultStats;
    
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        return { ...defaultStats, ...data.stats };
      } catch {
        return defaultStats;
      }
    }
    return defaultStats;
  });

  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [ownedEquipment, setOwnedEquipment] = useState<string[]>(() => {
    if (typeof window === 'undefined') return ['cauldron']; // Базовое оборудование
    
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        return data.ownedEquipment || ['cauldron'];
      } catch {
        return ['cauldron'];
      }
    }
    return ['cauldron'];
  });

  useEffect(() => {
    const loadEquipment = async () => {
      try {
        const { loadEquipment } = await import('../../utils/dataLoader');
        const equipmentData = await loadEquipment();
        setEquipment(equipmentData);
      } catch (error) {
        console.error('Failed to load equipment:', error);
      }
    };
    loadEquipment();
  }, []);

  useEffect(() => {
    const data = { character, currency, stats, ownedEquipment };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [character, currency, stats, ownedEquipment]);

  const updateCharacterName = (name: string) => {
    setCharacter(prev => ({ ...prev, name }));
  };

  const updateCharacterLevel = (level: number) => {
    setCharacter(prev => ({ ...prev, level: Math.max(1, Math.min(20, level)) }));
  };

  const updateAlchemyToolsProficiency = (hasProficiency: boolean) => {
    setCharacter(prev => ({ ...prev, alchemyToolsProficiency: hasProficiency }));
  };

  const updateCharacterStats = (newStats: Partial<Character['baseStats']>) => {
    setCharacter(prev => ({
      ...prev,
      baseStats: { ...prev.baseStats, ...newStats }
    }));
  };

  const updateCurrency = (newCurrency: Partial<Currency>) => {
    setCurrency(prev => ({ ...prev, ...newCurrency }));
  };

  const getTotalGold = () => {
    return convertToGold(currency);
  };

  const spendGold = (amount: number) => {
    const totalGold = getTotalGold();
    if (totalGold >= amount) {
      const newTotal = totalGold - amount;
      const newCurrency = convertFromGold(newTotal);
      setCurrency(newCurrency);
      incrementStat('goldSpent', amount);
      return true;
    }
    return false;
  };

  const earnGold = (amount: number) => {
    const totalGold = getTotalGold();
    const newTotal = totalGold + amount;
    const newCurrency = convertFromGold(newTotal);
    setCurrency(newCurrency);
    incrementStat('goldEarned', amount);
  };

  const buyEquipment = (equipmentId: string) => {
    const equipmentItem = equipment.find(eq => eq.id === equipmentId);
    if (!equipmentItem) {
      return { success: false, message: 'Оборудование не найдено' };
    }

    if (ownedEquipment.includes(equipmentId)) {
      return { success: false, message: 'Оборудование уже куплено' };
    }

    if (!spendGold(equipmentItem.cost)) {
      return { success: false, message: 'Недостаточно золота' };
    }

    setOwnedEquipment(prev => [...prev, equipmentId]);
    return { success: true, message: 'Оборудование куплено' };
  };

  const setActiveEquipment = (equipmentId: string) => {
    const equipmentItem = equipment.find(eq => eq.id === equipmentId);
    if (equipmentItem) {
      setCharacter(prev => ({ ...prev, activeEquipmentId: equipmentId }));
    }
  };

  const activeEquipment = equipment.find(eq => eq.id === character.activeEquipmentId) || null;

  // Получаем имеющееся оборудование
  const getOwnedEquipment = () => {
    return equipment.filter(eq => ownedEquipment.includes(eq.id));
  };

  // Получаем доступное для покупки оборудование
  const getAvailableForPurchaseEquipment = () => {
    return equipment.filter(eq => !ownedEquipment.includes(eq.id));
  };

  // Проверяем, есть ли оборудование у персонажа
  const hasEquipment = (equipmentId: string) => {
    return ownedEquipment.includes(equipmentId);
  };

  const updateStats = (updates: Partial<BrewingStats>) => {
    setStats(prev => ({ ...prev, ...updates }));
  };

  const incrementStat = (stat: keyof BrewingStats, amount = 1) => {
    setStats(prev => ({ ...prev, [stat]: prev[stat] + amount }));
  };

  return {
    character,
    currency,
    stats,
    equipment,
    ownedEquipment,
    activeEquipment,
    getOwnedEquipment,
    getAvailableForPurchaseEquipment,
    hasEquipment,
    updateCharacterName,
    updateCharacterLevel,
    updateAlchemyToolsProficiency,
    updateCharacterStats,
    updateCurrency,
    spendGold,
    earnGold,
    getTotalGold,
    buyEquipment,
    setActiveEquipment,
    updateStats,
    incrementStat
  };
}
