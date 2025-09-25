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

  setLaboratoryRecipes: (recipeIds: string[]) => void;
  addCustomIngredient: (ingredient: Ingredient) => void;

  isRecipeInLaboratory: (recipeId: string) => boolean;
  getLaboratoryRecipes: () => Recipe[];
  exploreLocation: (biomeId: string) => { success: boolean; message: string; items: { id: string; quantity: number; name: string }[] };
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
    return saved ? new Set(JSON.parse(saved)) : new Set();
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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(laboratoryRecipes)));
  }, [laboratoryRecipes]);

  const reloadData = async () => {
    await loadData();
  };

  const getRecipe = (id: string) => recipes.find(recipe => recipe.id === id);
  const getBiome = (id: string) => biomes.find(biome => biome.id === id);
  const getIngredient = (id: string) => ingredients.find(ingredient => ingredient.id === id);
  const getRecipesByType = (type: string) => recipes.filter(recipe => recipe.potionType === type);
  const getRecipesByRarity = (rarity: string) => recipes.filter(recipe => recipe.rarity === rarity);
  const addRecipeToLaboratory = (recipeId: string) => setLaboratoryRecipes(prev => new Set(prev).add(recipeId));
  const removeRecipeFromLaboratory = (recipeId: string) => {
    setLaboratoryRecipes(prev => {
      const newSet = new Set(prev);
      newSet.delete(recipeId);
      return newSet;
    });
  };
  const isRecipeInLaboratory = (recipeId: string) => laboratoryRecipes.has(recipeId);
  const getLaboratoryRecipes = () => recipes.filter(recipe => laboratoryRecipes.has(recipe.id));

  const exploreLocation = (biomeId: string) => {
    const biome = biomes.find(b => b.id === biomeId);
    if (!biome) {
        return { success: false, message: 'Биом не найден', items: [] };
    }

    const foundItems: { id: string; quantity: number; name: string }[] = [];
    const allPossibleIngredients = [
        ...biome.commonIngredients,
        ...biome.uncommonIngredients,
        ...biome.rareIngredients,
        ...biome.legendaryIngredients
    ];

    allPossibleIngredients.forEach(available => {
        if (Math.random() < available.chance) {
            const [min, max] = available.quantity;
            const quantity = Math.floor(Math.random() * (max - min + 1)) + min;
            const ingredientData = ingredients.find(ing => ing.id === available.id);

            if (ingredientData) {
                foundItems.push({
                    id: available.id,
                    quantity,
                    name: ingredientData.name
                });
            }
        }
    });

    let message = `Исследование завершено! Найдено предметов: ${foundItems.length}`;
    if (foundItems.length > 0) {
        message += '\n\nНайденные ингредиенты:';
        foundItems.forEach(item => {
            message += `\n• ${item.name} ×${item.quantity}`;
        });
    } else {
        message += '\n\nК сожалению, ничего не найдено.';
    }

    return {
        success: true,
        message,
        items: foundItems
    };
  };

  const setLaboratoryRecipesState = (recipeIds: string[]) => {
    setLaboratoryRecipes(new Set(Array.isArray(recipeIds) ? recipeIds : []));
  };

  const addCustomIngredientState = (ingredient: Ingredient) => {
    setIngredients(prev => {
      if (prev.some(ing => ing.id === ingredient.id)) {
        return prev;
      }
      return [...prev, ingredient];
    });
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
    getLaboratoryRecipes,
    exploreLocation,

    setLaboratoryRecipes: setLaboratoryRecipesState,
    addCustomIngredient: addCustomIngredientState,
  };
}