// hooks/stores/useAlchemyStore.ts

import { useInventoryStore } from './useInventoryStore';
import { usePotionStore } from './usePotionStore';
import { useCharacterStore } from './useCharacterStore';
import { useDataStore } from './useDataStore';
import { useFiltersStore } from './useFiltersStore';
import { useIngredientSelectionStore } from './useIngredientSelectionStore';
import type { Ingredient, Recipe, RecipeComponent, Potion } from '../types';
import { getQualityEffect, getRarityDetails } from '../types';

const FLAW_TABLE = [
  { range: [1, 10], effect: "Ошибки - путь к успеху. Редкость зелья повышается на 1 (не выше Легендарной)."}, // [cite: 2014]
  { range: [11, 20], effect: "Неконтролируемый полиморфизм. Выпивший меняет расу на случайную на время действия зелья."}, // [cite: 2014]
  { range: [21, 30], effect: "Гремучая смесь. Выпивший получает 1к6 степеней Истощения."}, // [cite: 2014]
  { range: [31, 40], effect: "Некачественные ингредиенты. Редкость зелья снижается на 1 (не ниже Обычной)."}, // [cite: 2014]
  { range: [41, 50], effect: "Богомерзкое варево. Пока активен эффект зелья, магическое лечение вместо исцеления наносит выпившему некротический урон."}, // [cite: 2014]
  { range: [51, 100], effect: "Внезапное открытие. Зелье превращается в Зелье экспериментальной алхимии."}, // [cite: 2014]
];

const EXCELLENCE_TABLE = [
  { range: [1, 10], effect: "Неконтролируемое деление. Вы изготавливаете два зелья. Их редкость снижается на 1 от первоначальной (не ниже Обычной)."}, // [cite: 2017]
  { range: [11, 20], effect: "Экономный подход. Изготовление не затратило Базу зелья."}, // [cite: 2017]
  { range: [21, 30], effect: "Первая проба. По окончании изготовления изготовитель получает эффект зелья."}, // [cite: 2017]
  { range: [31, 40], effect: "Внезапное открытие. В процессе изготовления вы создали ещё одно варево. Вы получаете ещё одно зелье. Совершите бросок по таблице «Эффектов экспериментальной алхимии» для определения его эффекта."}, // [cite: 2017]
  { range: [41, 50], effect: "Тщательная очистка. Зелье не имеет эффектов от примесей. Если примесей нет, зелье не имеет негативных эффектов, содержащихся в описании зелья."}, // [cite: 2017]
  { range: [51, 100], effect: "Награда с небес. Изготовитель получает Вдохновение."}, // [cite: 2017]
];

// Главный хук, объединяющий все остальные хуки
export function useAlchemyStore() {
  const inventory = useInventoryStore();
  const potions = usePotionStore();
  const character = useCharacterStore();
  const data = useDataStore();
  const filters = useFiltersStore();
  const ingredientSelection = useIngredientSelectionStore();

  // Методы для варки зелий
  const canBrewRecipe = (recipe: Recipe): { canBrew: boolean; missingIngredients: string[] } => {
    const missingIngredients: string[] = [];

    for (const component of recipe.components) {
      // Проверяем, есть ли выбранный ингредиент для этого компонента
      const selectedIngredientId = ingredientSelection.getSelectedIngredient(recipe.id, component.id);
      
      if (!selectedIngredientId) {
        // Если нет выбранного ингредиента, добавляем в список отсутствующих
        missingIngredients.push(component.name);
        continue;
      }

      // Проверяем доступность выбранного ингредиента
      const available = inventory.isIngredientAvailable(selectedIngredientId, component.quantity);
      if (!available) {
        const ingredient = inventory.getIngredient(selectedIngredientId);
        missingIngredients.push(ingredient?.name || 'Неизвестный ингредиент');
      }
    }

    return {
      canBrew: missingIngredients.length === 0,
      missingIngredients
    };
  };

  const findSuitableIngredient = (component: RecipeComponent): Ingredient | undefined => {
    return inventory.ingredients.find(ingredient => {
      // Проверяем количество
      if (ingredient.quantity < component.quantity) return false;

      // Проверяем тип (для совместимости)
      if (component.types && component.types.length > 0) {
        if (!component.types.includes(ingredient.type)) return false;
      }

      // Проверяем категорию
      if (component.categories && component.categories.length > 0) {
        if (!component.categories.includes(ingredient.category)) return false;
      }

      // Проверяем элементы - должны быть ВСЕ требуемые элементы
      if (component.requiredElements && component.requiredElements.length > 0) {
        const hasAllRequiredElements = component.requiredElements.every(requiredElement =>
          ingredient.elements && ingredient.elements.includes(requiredElement)
        );
        if (!hasAllRequiredElements) return false;
      }

      return true;
    });
  };

    const brewPotion = (recipe: Recipe): { success: boolean; message: string; potion?: Potion } => {
    // ... (проверка canBrew остается без изменений)
    const { canBrew, missingIngredients } = canBrewRecipe(recipe);
    if (!canBrew) {
      return {
        success: false,
        message: `Недостаточно ингредиентов: ${missingIngredients.join(', ')}`
      };
    }

    const rarityDetails = getRarityDetails(recipe.rarity);
    const targetDifficulty = 5 * rarityDetails.rarityModifier + 5 + recipe.components.length;
    const brewResult = determineBrewedQuality(targetDifficulty, character.character.brewingMode);

    character.incrementStat('totalBrews');

    // При любом провале ингредиенты тратятся
    const usedIngredients = recipe.components.map(component => ({
      id: ingredientSelection.getSelectedIngredient(recipe.id, component.id)!,
      quantity: component.quantity
    }));
    inventory.useIngredients(usedIngredients);
    character.incrementStat('ingredientsUsed', usedIngredients.reduce((sum, ing) => sum + ing.quantity, 0));

    if (!brewResult.success) {
      character.incrementStat('failedBrews');

      let message = `Варка провалилась! (Бросок: ${brewResult.rollResults.mainRoll} против СЛ ${targetDifficulty})`;
      if (brewResult.flawEffect) {
        message += `\nИзъян: ${brewResult.flawEffect}`;
      }

      // Создаем "испорченное" зелье с описанием изъяна
      const flawedPotion: Omit<Potion, 'id'> = {
        name: `Испорченное ${recipe.name}`,
        description: recipe.description,
        effect: "Эффект непредсказуем из-за неудачной варки.",
        rarity: recipe.rarity,
        potionType: recipe.potionType,
        potionQuality: recipe.potionQuality,
        brewedQuality: 'poor',
        flawEffect: brewResult.flawEffect,
        tags: [...recipe.tags, 'испорченное'],
        quantity: 1,
        recipeId: recipe.id,
        dateCreated: new Date().toISOString(),
        components: recipe.components,
        rollResults: brewResult.rollResults
      };
      potions.addPotion(flawedPotion);

      return { success: false, message };
    }

    // Логика для успешной варки
    const newPotion: Omit<Potion, 'id'> = {
      name: recipe.name,
      description: recipe.description,
      effect: recipe.effect,
      rarity: recipe.rarity,
      potionType: recipe.potionType,
      potionQuality: recipe.potionQuality,
      brewedQuality: brewResult.quality,
      excellenceEffect: brewResult.excellenceEffect,
      tags: recipe.tags,
      quantity: 1,
      recipeId: recipe.id,
      dateCreated: new Date().toISOString(),
      components: recipe.components,
      rollResults: brewResult.rollResults
    };
    potions.addPotion(newPotion);

    character.incrementStat('successfulBrews');
    character.incrementStat('potionsCreated');

    let message = `Зелье "${recipe.name}" успешно создано! (Бросок: ${brewResult.rollResults.mainRoll} против СЛ ${targetDifficulty})`;
    if (brewResult.excellenceEffect) {
        message += `\nИзысканность: ${brewResult.excellenceEffect}`;
    }

    return {
      success: true,
      message,
      potion: { ...newPotion, id: Date.now().toString() }
    };
  };

  const determineBrewedQuality = (
    targetDifficulty: number,
    mode: 'percentage' | 'ttrpg'
  ): {
    success: boolean;
    quality: 'poor' | 'standard' | 'excellent';
    flawEffect?: string;
    excellenceEffect?: string;
    rollResults: {
      naturalRoll: number;
      bonus: number;
      mainRoll: number;
      fumbleRoll?: number;
      excellenceRoll?: number
    }
  } => {
    let bonus = 0;
    const activeEquipment = character.equipment.find(eq => eq.id === character.character.activeEquipmentId);
    if (activeEquipment) bonus += activeEquipment.brewingBonus;
    if (character.character.alchemyToolsProficiency) bonus += 2;

    const naturalRoll = Math.floor(Math.random() * 20) + 1;
    const mainRoll = naturalRoll + bonus;

    const success = mainRoll >= targetDifficulty;

    const rollResults = { naturalRoll, bonus, mainRoll, fumbleRoll: undefined, excellenceRoll: undefined };

    if (!success) {
      const fumbleRoll = Math.floor(Math.random() * 100) + 1;
      const flaw = FLAW_TABLE.find(f => fumbleRoll >= f.range[0] && fumbleRoll <= f.range[1]);
      return {
        success: false,
        quality: 'poor',
        flawEffect: flaw?.effect || "Неизвестный изъян.",
        rollResults: { ...rollResults, fumbleRoll }
      };
    }

    if (naturalRoll === 20) {
      const excellenceRoll = Math.floor(Math.random() * 100) + 1;
      const excellence = EXCELLENCE_TABLE.find(e => excellenceRoll >= e.range[0] && excellenceRoll <= e.range[1]);
      return {
        success: true,
        quality: 'excellent',
        excellenceEffect: excellence?.effect || "Невероятный результат!",
        rollResults: { ...rollResults, excellenceRoll }
      };
    }

    return {
      success: true,
      quality: 'standard',
      rollResults
    };
  };

  // Методы для работы с рецептами
  const selectIngredientForComponent = (recipeId: string, componentId: string, ingredientId: string | undefined) => {
    ingredientSelection.setSelectedIngredient(recipeId, componentId, ingredientId);
  };

  const getSelectedIngredient = (recipeId: string, componentId: string) => {
    return ingredientSelection.getSelectedIngredient(recipeId, componentId);
  };

  const clearIngredientSelection = (recipeId: string, componentId: string) => {
    ingredientSelection.clearSelection(recipeId, componentId);
  };

  const clearAllIngredientSelections = () => {
    ingredientSelection.clearAllSelections();
  };

  return {
    // Инвентарь
    ingredients: inventory.ingredients,
    allIngredients: data.ingredients, // Все доступные ингредиенты из JSON
    addIngredient: inventory.addIngredient,
    updateIngredientQuantity: inventory.updateIngredientQuantity,
    removeIngredient: inventory.removeIngredient,
    getIngredient: inventory.getIngredient,
    getTotalIngredients: inventory.getTotalIngredients,
    getIngredientsByCategory: inventory.getIngredientsByCategory,
    isIngredientAvailable: inventory.isIngredientAvailable,
    cleanDuplicates: inventory.cleanDuplicates,

    // Зелья
    potions: potions.potions,
    addPotion: potions.addPotion,
    updatePotionQuantity: potions.updatePotionQuantity,
    removePotion: potions.removePotion,
    togglePotionFavorite: potions.togglePotionFavorite,
    getPotion: potions.getPotion,
    getPotionsByType: potions.getPotionsByType,
    getFavoritePotions: potions.getFavoritePotions,
    getTotalPotions: potions.getTotalPotions,
    consumePotion: potions.consumePotion,

    // Персонаж
    character: character.character,
    currency: character.currency,
    stats: character.stats,
    equipment: character.equipment,
    ownedEquipment: character.ownedEquipment,
    availableEquipment: character.getOwnedEquipment(),
    availableForPurchaseEquipment: character.getAvailableForPurchaseEquipment(),
    hasEquipment: character.hasEquipment,
    activeEquipment: character.activeEquipment,
    playerGold: character.getTotalGold(),
    updateCharacterName: character.updateCharacterName,
    updateCharacterLevel: character.updateCharacterLevel,
    updateAlchemyToolsProficiency: character.updateAlchemyToolsProficiency,
    updateCharacterStats: character.updateCharacterStats,
    updateCurrency: character.updateCurrency,
    spendGold: character.spendGold,
    earnGold: character.earnGold,
    getTotalGold: character.getTotalGold,
    buyEquipment: character.buyEquipment,
    setActiveEquipment: character.setActiveEquipment,
    updateStats: character.updateStats,
    incrementStat: character.incrementStat,

    // Данные
    recipes: data.recipes,
    biomes: data.biomes,
    isLoading: data.isLoading,
    error: data.error,
    reloadData: data.reloadData,
    getRecipe: data.getRecipe,
    getBiome: data.getBiome,
    getIngredientData: data.getIngredient,
    getRecipesByType: data.getRecipesByType,
    getRecipesByRarity: data.getRecipesByRarity,

    // Фильтры
    activeFilters: filters.filters,
    updateFilter: filters.updateFilter,
    resetFilters: filters.resetFilters,
    toggleFilterValue: filters.toggleFilterValue,
    hasActiveFilters: filters.hasActiveFilters,

    // Варка зелий
    canBrewRecipe,
    updateBrewingMode: character.updateBrewingMode,
    findSuitableIngredient,
    brewPotion,
    selectIngredientForComponent,
    getSelectedIngredient,
    clearIngredientSelection,
    clearAllIngredientSelections,
    
    // Методы для магазина
    buyIngredient: (ingredientId: string, quantity: number) => {
      // Находим ингредиент в данных JSON
      const allIngredients = data.recipes.length > 0 ? 
        [...inventory.ingredients] : []; // Можно добавить список ингредиентов для покупки
      
      const ingredient = allIngredients.find(ing => ing.id === ingredientId);
      if (!ingredient) {
        return { success: false, message: 'Ингредиент не найден' };
      }
      
      const totalCost = ingredient.cost * quantity;
      if (!character.spendGold(totalCost)) {
        return { success: false, message: 'Недостаточно золота' };
      }
      
      // Добавляем ингредиент в инвентарь
      const existingIngredient = inventory.getIngredient(ingredientId);
      if (existingIngredient) {
        inventory.updateIngredientQuantity(ingredientId, existingIngredient.quantity + quantity);
      } else {
        inventory.addIngredient({...ingredient, quantity});
      }
      
      return { success: true, message: `Куплено ${quantity} x ${ingredient.name}` };
    },
    
    sellIngredient: (ingredientId: string, quantity: number) => {
      const ingredient = inventory.getIngredient(ingredientId);
      if (!ingredient || ingredient.quantity < quantity) {
        return { success: false, message: 'Недостаточно ингредиентов' };
      }
      
      const sellPrice = Math.floor(ingredient.cost * quantity * 0.5); // Продаем за половину цены
      character.earnGold(sellPrice);
      inventory.updateIngredientQuantity(ingredientId, ingredient.quantity - quantity);
      
      return { success: true, message: `Продано ${quantity} x ${ingredient.name} за ${sellPrice} зм` };
    },
    
    // Методы для исследований
    exploreLocation: (biomeId: string) => {
      const biome = data.getBiome(biomeId);
      if (!biome) {
        return { success: false, message: 'Биом не найден', items: [] };
      }
      
      if (!character.spendGold(biome.cost)) {
        return { success: false, message: 'Недостаточно золота для исследования', items: [] };
      }
      
      // Простая логика исследования - добавляем случайные ингредиенты
      const foundItems: { id: string; quantity: number; name: string }[] = [];
      const allIngredients = [
        ...biome.commonIngredients,
        ...biome.uncommonIngredients,
        ...biome.rareIngredients,
        ...biome.legendaryIngredients
      ];
      
      allIngredients.forEach(available => {
        if (Math.random() < available.chance) {
          const [min, max] = available.quantity;
          const quantity = Math.floor(Math.random() * (max - min + 1)) + min;
          
          // Получаем информацию об ингредиенте из данных
          const ingredientData = data.getIngredient(available.id);
          if (!ingredientData) {
            console.warn(`Ингредиент с ID ${available.id} не найден в данных`);
            return;
          }
          
          // Добавляем ингредиент в инвентарь (автоматически стекается с существующими)
          inventory.addIngredient({
            ...ingredientData,
            quantity: quantity
          });
          
          foundItems.push({ 
            id: available.id, 
            quantity, 
            name: ingredientData.name 
          });
        }
      });
      
      // Формируем детальное сообщение о находках
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
    },
    
    // Лаборатория
    addRecipeToLaboratory: data.addRecipeToLaboratory,
    removeRecipeFromLaboratory: data.removeRecipeFromLaboratory,
    isRecipeInLaboratory: data.isRecipeInLaboratory,
    getLaboratoryRecipes: data.getLaboratoryRecipes,
    
    // Заглушки для совместимости
    isIngredientCompatibleWithComponent: () => true
  };
}
