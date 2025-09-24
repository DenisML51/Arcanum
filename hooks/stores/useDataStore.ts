// hooks/stores/useDataStore.ts

import { useState, useEffect } from 'react';
import type { Recipe, Biome, Ingredient } from '../types';
import { loadRecipes, loadBiomes, loadIngredients } from '../../utils/dataLoader';

interface DataStore {
  recipes: Recipe[];
  biomes: Biome[];
  ingredients: Ingredient[];
  isLoading: boolean;
  error: string | null;
  reloadData: () => Promise<void>;
  getRecipe: (id: string) => Recipe | undefined;
  getBiome: (id: string) => Biome | undefined;
  getIngredient: (id: string) => Ingredient | undefined;
  getRecipesByType: (type: string) => Recipe[];
  getRecipesByRarity: (rarity: string) => Recipe[];
  addRecipeToLaboratory: (recipeId: string) => void;
  removeRecipeFromLaboratory: (recipeId: string) => void;
  isRecipeInLaboratory: (recipeId: string) => boolean;
  getLaboratoryRecipes: () => Recipe[];
}

const STORAGE_KEY = 'alchemy-laboratory';

export function useDataStore(): DataStore {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [biomes, setBiomes] = useState<Biome[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [laboratoryRecipes, setLaboratoryRecipes] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        return new Set(Array.isArray(data) ? data : []);
      } catch {
        return new Set();
      }
    }
    return new Set();
  });

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [recipesData, biomesData, ingredientsData] = await Promise.all([
        loadRecipes(),
        loadBiomes(),
        loadIngredients()
      ]);
      
      setRecipes(recipesData);
      setBiomes(biomesData);
      setIngredients(ingredientsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Сохраняем состояние лаборатории в localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(laboratoryRecipes)));
  }, [laboratoryRecipes]);

  const reloadData = async () => {
    await loadData();
  };

  const getRecipe = (id: string) => {
    return recipes.find(recipe => recipe.id === id);
  };

  const getBiome = (id: string) => {
    return biomes.find(biome => biome.id === id);
  };

  const getIngredient = (id: string) => {
    return ingredients.find(ingredient => ingredient.id === id);
  };

  const getRecipesByType = (type: string) => {
    return recipes.filter(recipe => recipe.potionType === type);
  };

  const getRecipesByRarity = (rarity: string) => {
    return recipes.filter(recipe => recipe.rarity === rarity);
  };

  const addRecipeToLaboratory = (recipeId: string) => {
    setLaboratoryRecipes(prev => new Set([...prev, recipeId]));
  };

  const removeRecipeFromLaboratory = (recipeId: string) => {
    setLaboratoryRecipes(prev => {
      const newSet = new Set(prev);
      newSet.delete(recipeId);
      return newSet;
    });
  };

  const isRecipeInLaboratory = (recipeId: string) => {
    return laboratoryRecipes.has(recipeId);
  };

  const getLaboratoryRecipes = () => {
    return recipes.filter(recipe => laboratoryRecipes.has(recipe.id));
  };

  return {
    recipes,
    biomes,
    ingredients,
    isLoading,
    error,
    reloadData,
    getRecipe,
    getBiome,
    getIngredient,
    getRecipesByType,
    getRecipesByRarity,
    addRecipeToLaboratory,
    removeRecipeFromLaboratory,
    isRecipeInLaboratory,
    getLaboratoryRecipes
  };
}
