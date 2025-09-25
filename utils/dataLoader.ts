// utils/dataLoader.ts

import type { Ingredient, Recipe, Biome, Equipment } from '../hooks/types';

// Прямой импорт JSON файлов
import ingredientsData from '../data/ingredients.json';
import recipesData from '../data/recipes.json';
import biomesData from '../data/biomes.json';
import equipmentData from '../data/equipment.json';

// Функции для загрузки данных из JSON файлов
export async function loadIngredients(): Promise<Ingredient[]> {
  try {
    const ingredients = ingredientsData as Ingredient[];
    
    // Удаляем дубликаты по ID
    const uniqueIngredients = ingredients.reduce((acc, ingredient) => {
      const existingIndex = acc.findIndex(existing => existing.id === ingredient.id);
      if (existingIndex === -1) {
        acc.push(ingredient);
      } else {
        console.warn(`Duplicate ingredient found with ID: ${ingredient.id} (${ingredient.name})`);
      }
      return acc;
    }, [] as Ingredient[]);
    
    return uniqueIngredients;
  } catch (error) {
    console.error('Error loading ingredients:', error);
    return [];
  }
}

export async function loadRecipes(): Promise<Recipe[]> {
  try {
    const recipes = recipesData as Recipe[];
    
    // Удаляем дубликаты по ID
    const uniqueRecipes = recipes.reduce((acc, recipe) => {
      const existingIndex = acc.findIndex(existing => existing.id === recipe.id);
      if (existingIndex === -1) {
        acc.push(recipe);
      } else {
        console.warn(`Duplicate recipe found with ID: ${recipe.id} (${recipe.name})`);
      }
      return acc;
    }, [] as Recipe[]);
    
    return uniqueRecipes;
  } catch (error) {
    console.error('Error loading recipes:', error);
    return [];
  }
}

export async function loadBiomes(): Promise<Biome[]> {
  try {
    const biomes = biomesData as Biome[];
    
    // Удаляем дубликаты по ID
    const uniqueBiomes = biomes.reduce((acc, biome) => {
      const existingIndex = acc.findIndex(existing => existing.id === biome.id);
      if (existingIndex === -1) {
        acc.push(biome);
      } else {
        console.warn(`Duplicate biome found with ID: ${biome.id} (${biome.name})`);
      }
      return acc;
    }, [] as Biome[]);
    
    return uniqueBiomes;
  } catch (error) {
    console.error('Error loading biomes:', error);
    return [];
  }
}

export async function loadEquipment(): Promise<Equipment[]> {
  try {
    const equipment = equipmentData as Equipment[];
    
    // Удаляем дубликаты по ID
    const uniqueEquipment = equipment.reduce((acc, item) => {
      const existingIndex = acc.findIndex(existing => existing.id === item.id);
      if (existingIndex === -1) {
        acc.push(item);
      } else {
        console.warn(`Duplicate equipment found with ID: ${item.id} (${item.name})`);
      }
      return acc;
    }, [] as Equipment[]);
    
    return uniqueEquipment;
  } catch (error) {
    console.error('Error loading equipment:', error);
    return [];
  }
}

// Функция для загрузки всех данных одновременно
export async function loadAllData() {
  const [ingredients, recipes, biomes, equipment] = await Promise.all([
    loadIngredients(),
    loadRecipes(),
    loadBiomes(),
    loadEquipment()
  ]);

  return {
    ingredients,
    recipes,
    biomes,
    equipment
  };
}

// Функция для экспорта текущих данных в JSON формате
export function exportData(data: {
  ingredients: Ingredient[];
  recipes: Recipe[];
  biomes: Biome[];
  equipment: Equipment[];
}) {
  const dataToExport = {
    ingredients: data.ingredients,
    recipes: data.recipes,
    biomes: data.biomes,
    equipment: data.equipment,
    exportDate: new Date().toISOString(),
    version: "1.0"
  };

  const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
    type: 'application/json'
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `alchemy-data-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Функция для импорта данных из файла
export function importData(file: File): Promise<{
  ingredients?: Ingredient[];
  recipes?: Recipe[];
  biomes?: Biome[];
  equipment?: Equipment[];
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        resolve(data);
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}

// Валидация данных
export function validateIngredient(ingredient: any): ingredient is Ingredient {
  return (
    typeof ingredient.id === 'string' &&
    typeof ingredient.name === 'string' &&
    typeof ingredient.description === 'string' &&
    typeof ingredient.type === 'string' &&
    typeof ingredient.category === 'string' &&
    Array.isArray(ingredient.elements) &&
    Array.isArray(ingredient.tags) &&
    typeof ingredient.rarity === 'string' &&
    typeof ingredient.quantity === 'number' &&
    typeof ingredient.cost === 'number' &&
    typeof ingredient.weight === 'number' &&
    Array.isArray(ingredient.locations) &&
    // Дополнительные поля могут быть undefined
    (ingredient.isBase === undefined || typeof ingredient.isBase === 'boolean') &&
    (ingredient.baseRarityModifier === undefined || typeof ingredient.baseRarityModifier === 'string') &&
    (ingredient.shortCode === undefined || typeof ingredient.shortCode === 'string')
  );
}

export function validateRecipe(recipe: any): recipe is Recipe {
  return (
    typeof recipe.id === 'string' &&
    typeof recipe.name === 'string' &&
    typeof recipe.description === 'string' &&
    typeof recipe.effect === 'string' &&
    typeof recipe.rarity === 'string' &&
    typeof recipe.potionType === 'string' &&
    typeof recipe.potionQuality === 'string' &&
    Array.isArray(recipe.tags) &&
    Array.isArray(recipe.components) &&
    typeof recipe.inLaboratory === 'boolean' &&
    // Проверяем компоненты
    recipe.components.every((comp: any) =>
      typeof comp.id === 'string' &&
      typeof comp.name === 'string' &&
      typeof comp.description === 'string' &&
      typeof comp.quantity === 'number' &&
      Array.isArray(comp.tags) &&
      (Array.isArray(comp.requiredElements) || Array.isArray(comp.types)) &&
      (comp.categories === undefined || Array.isArray(comp.categories))
    )
  );
}

export function validateBiome(biome: any): biome is Biome {
  return (
    typeof biome.id === 'string' &&
    typeof biome.name === 'string' &&
    typeof biome.description === 'string' &&
    typeof biome.difficulty === 'string' &&
    typeof biome.cost === 'number' &&
    Array.isArray(biome.commonIngredients) &&
    Array.isArray(biome.uncommonIngredients) &&
    Array.isArray(biome.rareIngredients) &&
    Array.isArray(biome.legendaryIngredients)
  );
}

export function validateEquipment(equipment: any): equipment is Equipment {
  return (
    typeof equipment.id === 'string' &&
    typeof equipment.name === 'string' &&
    typeof equipment.description === 'string' &&
    typeof equipment.brewingBonus === 'number' &&
    typeof equipment.cost === 'number' &&
    typeof equipment.weight === 'number' &&
    typeof equipment.rarity === 'string'
  );
}