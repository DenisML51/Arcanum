// hooks/stores/useAlchemyStore.ts

import { useInventoryStore } from './useInventoryStore';
import { usePotionStore } from './usePotionStore';
import { useCharacterStore } from './useCharacterStore';
import { useDataStore } from './useDataStore';
import { useFiltersStore } from './useFiltersStore';
import { useIngredientSelectionStore } from './useIngredientSelectionStore';
import type { Ingredient, Recipe, RecipeComponent, Potion } from '../types';
import { getQualityEffect } from '../types';

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
    const { canBrew, missingIngredients } = canBrewRecipe(recipe);
    
    if (!canBrew) {
      return {
        success: false,
        message: `Недостаточно ингредиентов: ${missingIngredients.join(', ')}`
      };
    }

    // Списываем ингредиенты (только выбранные пользователем)
    const usedIngredients: { id: string; quantity: number }[] = [];
    
    for (const component of recipe.components) {
      const ingredientId = ingredientSelection.getSelectedIngredient(recipe.id, component.id);
      
      if (!ingredientId) {
        return {
          success: false,
          message: `Не выбран ингредиент для компонента: ${component.name}`
        };
      }
      
      usedIngredients.push({ id: ingredientId, quantity: component.quantity });
    }

    // Проверяем еще раз и списываем
    const success = inventory.useIngredients(usedIngredients);
    
    if (!success) {
      return {
        success: false,
        message: 'Ошибка при использовании ингредиентов'
      };
    }

    // Создаем зелье
    const qualityResult = determineBrewedQuality();
    const qualityEffect = getQualityEffect(qualityResult.quality);
    
    // Формируем описание с учетом эффекта качества
    let finalDescription = recipe.description;
    if (qualityEffect) {
      finalDescription += `\n\nОсобенность: ${qualityEffect}`;
    }
    
    const potion: Omit<Potion, 'id'> = {
      name: recipe.name,
      description: finalDescription,
      effect: recipe.effect,
      rarity: recipe.rarity,
      potionType: recipe.potionType,
      potionQuality: recipe.potionQuality,
      brewedQuality: qualityResult.quality,
      tags: recipe.tags,
      quantity: 1,
      recipeId: recipe.id,
      dateCreated: new Date().toISOString(),
      components: recipe.components,
      rollResults: qualityResult.rollResults
    };

    potions.addPotion(potion);

    // Обновляем статистику
    character.incrementStat('totalBrews');
    character.incrementStat('successfulBrews');
    character.incrementStat('potionsCreated');
    character.incrementStat('ingredientsUsed', usedIngredients.reduce((sum, ing) => sum + ing.quantity, 0));

    // Формируем сообщение с результатами бросков
    let message = `Зелье "${recipe.name}" успешно создано!`;
    message += `\n🎲 Основной бросок: ${qualityResult.rollResults.naturalRoll} + ${qualityResult.rollResults.bonus} = ${qualityResult.rollResults.mainRoll}`;
    
    if (qualityResult.rollResults.fumbleRoll) {
      message += `\n💥 Провал (к100): ${qualityResult.rollResults.fumbleRoll}`;
    }
    if (qualityResult.rollResults.excellenceRoll) {
      message += `\n⭐ Успех (к100): ${qualityResult.rollResults.excellenceRoll}`;
    }
    
    message += `\nКачество: ${qualityResult.quality === 'poor' ? 'Изъян' : qualityResult.quality === 'excellent' ? 'Изысканное' : 'Стандартное'}`;
    
    if (qualityEffect) {
      message += `\nОсобенность: ${qualityEffect}`;
    }

    return {
      success: true,
      message,
      potion: { ...potion, id: Date.now().toString() }
    };
  };

  const determineBrewedQuality = (): { quality: 'poor' | 'standard' | 'excellent'; rollResults: { naturalRoll: number; bonus: number; mainRoll: number; fumbleRoll?: number; excellenceRoll?: number } } => {
    // Бросок к20 для основного результата
    const naturalRoll = Math.floor(Math.random() * 20) + 1;
    
    // Бонус от оборудования и навыков
    let bonus = 0;
    if (character.activeEquipment) {
      bonus += character.activeEquipment.brewingBonus;
    }
    if (character.character.alchemyToolsProficiency) {
      bonus += 2; // Профициенси в инструментах алхимика дает +2
    }

    const mainRoll = naturalRoll + bonus;
    
    // Дополнительные броски для критических результатов
    let fumbleRoll: number | undefined;
    let excellenceRoll: number | undefined;
    
    if (naturalRoll === 1) {
      // Критический провал - бросок к100
      fumbleRoll = Math.floor(Math.random() * 100) + 1;
    } else if (naturalRoll === 20) {
      // Критический успех - бросок к100
      excellenceRoll = Math.floor(Math.random() * 100) + 1;
    }

    // Определяем качество на основе результата
    let quality: 'poor' | 'standard' | 'excellent';
    
    if (naturalRoll === 1 || mainRoll < 10) {
      quality = 'poor';
    } else if (naturalRoll === 20 || mainRoll >= 25) {
      quality = 'excellent';
    } else if (mainRoll >= 15) {
      quality = 'excellent';
    } else if (mainRoll >= 10) {
      quality = 'standard';
    } else {
      quality = 'poor';
    }

    return {
      quality,
      rollResults: {
        naturalRoll,
        bonus,
        mainRoll,
        fumbleRoll,
        excellenceRoll
      }
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
    availableEquipment: character.equipment,
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
