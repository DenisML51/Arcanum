// hooks/stores/useAlchemyStore.ts

import { useInventoryStore } from './useInventoryStore';
import { usePotionStore } from './usePotionStore';
import { useCharacterStore } from './useCharacterStore';
import { useDataStore } from './useDataStore';
import { useFiltersStore } from './useFiltersStore';
import { useIngredientSelectionStore } from './useIngredientSelectionStore';
import type { Recipe, Potion, AlchemicalElement } from '../types';
import { getRarityDetails, getAlchemicalElementName } from '../types';

// --- ДАННЫЕ ДЛЯ МЕХАНИКИ ПРОВАЛОВ И УСПЕХОВ ---
const FLAW_TABLE = [
  { range: [1, 10], effect: "Ошибки - путь к успеху. Редкость зелья повышается на 1 (не выше Легендарной)." },
  { range: [11, 20], effect: "Неконтролируемый полиморфизм. Выпивший меняет расу на случайную на время действия зелья." },
  { range: [21, 30], effect: "Гремучая смесь. Выпивший получает 1к6 степеней Истощения." },
  { range: [31, 40], effect: "Некачественные ингредиенты. Редкость зелья снижается на 1 (не ниже Обычной)." },
  { range: [41, 50], effect: "Богомерзкое варево. Пока активен эффект зелья, магическое лечение вместо исцеления наносит выпившему некротический урон." },
  { range: [51, 100], effect: "Внезапное открытие. Зелье превращается в Зелье экспериментальной алхимии." },
];

const EXCELLENCE_TABLE = [
  { range: [1, 10], effect: "Неконтролируемое деление. Вы изготавливаете два зелья. Их редкость снижается на 1 от первоначальной (не ниже Обычной)." },
  { range: [11, 20], effect: "Экономный подход. Изготовление не затратило Базу зелья." },
  { range: [21, 30], effect: "Первая проба. По окончании изготовления изготовитель получает эффект зелья." },
  { range: [31, 40], effect: "Внезапное открытие. В процессе изготовления вы создали ещё одно варево. Совершите бросок по таблице «Эффектов экспериментальной алхимии»." },
  { range: [41, 50], effect: "Тщательная очистка. Зелье не имеет эффектов от примесей. Если примесей нет, зелье не имеет негативных эффектов, содержащихся в описании." },
  { range: [51, 100], effect: "Награда с небес. Изготовитель получает Вдохновение." },
];

// --- ДАННЫЕ ДЛЯ МЕХАНИКИ ПРИМЕСЕЙ ---
export const ELEMENT_RANK: Record<string, number> = {
  'time': 4, 'matter': 4, 'stasis': 4, 'space': 4, 'decay': 4, 'mind': 4, 'chaos': 4, 'energy': 4,
  'embodiment': 3, 'challenge': 3, 'illusion': 3, 'necromancy': 3, 'reflection': 3, 'enchantment': 3, 'transmutation': 3, 'divination': 3,
  'sound': 2, 'radiance': 2, 'acid': 2, 'necrotic': 2, 'fire': 2, 'foam': 2, 'psychic': 2, 'force': 2, 'physical': 2, 'cold': 2, 'electricity': 2, 'poison': 2,
  'aberration': 1, 'giant': 1, 'humanoid': 1, 'dragon': 1, 'beast': 1, 'construct': 1, 'monster': 1, 'celestial': 1, 'undead': 1, 'plant': 1, 'slime': 1, 'fey': 1, 'elemental': 1, 'fiend': 1,
};

export const getImpurityEffect = (impurity: AlchemicalElement, rarityMod: number): string => {
    const rarityDice = `k${(rarityMod * 2) + 2}`;
    switch(impurity) {
        case 'time': return "Длительность действия эффектов зелья заменяется случайной (1к6): 1: Об, 2: Не, 3: Ре, 4: Ор, 5: Ле, 6: 1 раунд.";
        case 'matter': return `${100 - (10 * rarityMod)}% шанс возвратить один из ингредиентов при изготовлении.`;
        case 'decay': return "По окончании изготовления зелья изготовитель считается Нежитью, пока не закончит продолжительный отдых.";
        case 'mind': return `+1${rarityDice} к результату броска Алхимии при изготовлении.`;
        case 'stasis': return `По окончании варки зелья скорость изготовителя уменьшается на ${5 * rarityMod} фт, пока он не закончит продолжительный отдых.`;
        case 'space': return "Время варки зелья удваивается.";
        case 'chaos': return "По окончании варки зелья срабатывает случайный эффект Дикой магии.";
        case 'energy': return `По окончании варки зелья скорость изготовителя увеличивается на ${5 * rarityMod} фт, пока он не закончит продолжительный отдых.`;
        case 'sound': return "Выпивший с помехой совершает проверки характеристик, полагающиеся на слух.";
        case 'radiance': return "Выпивший излучает яркий свет в пределах 5 фт и тусклый свет в пределах ещё 5 фт и не получает преимущества от Невидимости.";
        case 'psychic': return `-1${rarityDice} к результату броска при изготовлении этого зелья.`;
        case 'force': return "Если зелье является Низким, его эффект всё равно считается магическим.";
        case 'poison': return "Выпивший должен совершить спасбросок Телосложения с базовой сложностью, иначе будет Отравлен парами на 1 минуту.";
        case 'acid': case 'necrotic': case 'fire': case 'foam': case 'physical': case 'cold': case 'electricity':
            return `Выпивший получает 2${rarityDice} урона типа '${getAlchemicalElementName(impurity)}'.`;
        case 'aberration': return `Частичная трансформация: Из вашего лба вырастают небольшие антенны. Вы получаете телепатию в пределах ${rarityMod * 5} фт.`;
        case 'giant': return "Частичная трансформация: Вы считаетесь существом на 1 размер больше при определении вашей массы.";
        case 'humanoid': return "Частичная трансформация: Вы получаете владение случайным набором инструментов по выбору Мастера.";
        case 'dragon': return "Частичная трансформация: Вашу кожу частично покрывает чешуя. Вы считаетесь существом на 1 размер больше при определении вашей массы.";
        case 'beast': return `Частичная трансформация: Ваше лицо обрастает жёсткой шерстью. У вас вырастают когти, вы получаете безоружную атаку 1${rarityDice} колющего урона.`;
        case 'fiend': return "Частичная трансформация: Ваше тело неестественно краснеет. Вы получаете сопротивление урону огнём.";
        case 'construct': return "Частичная трансформация: Ваши зрачки и радужки становятся квадратными. Вы считаетесь Конструктом для заклинаний и магического лечения.";
        case 'monster': return "Частичная трансформация: Ваша мимика пугает. Вы получаете преимущество на Запугивание, но помеху на остальные проверки Харизмы.";
        case 'celestial': return "Частичная трансформация: Ваша кожа становится абсолютно белой. Вы получаете сопротивление урону излучением.";
        case 'undead': return "Частичная трансформация: Ваше тело становится мертвенно ледяным. Вы считаетесь Нежитью для заклинаний и магического лечения.";
        case 'plant': return "Частичная трансформация: В ваших волосах распускаются крошечные цветы. Вы получаете двойной урон при падении.";
        case 'slime': return "Частичная трансформация: Ваши ноги издают чавкающие звуки при ходьбе. Вы можете протиснуться через пространство шириной до 1 дюйма.";
        case 'fey': return "Частичная трансформация: От вас исходит медовый аромат. При выпадении «1» при вашем броске к20, срабатывает случайный эффект Дикой магии.";
        case 'elemental': return "Частичная трансформация: Прикосновение к вам сродни касанию к водной глади. Вы можете протиснуться через пространство шириной до 1 дюйма.";
        case 'embodiment': case 'challenge': case 'illusion': case 'necromancy': case 'reflection': case 'enchantment': case 'transmutation': case 'divination':
            return `Срабатывает случайное заклинание школы '${getAlchemicalElementName(impurity)}'. (Эффект требует броска по таблице из правил).`;
        default: return "Неизвестный эффект примеси.";
    }
};

export function useAlchemyStore() {
  const inventory = useInventoryStore();
  const potions = usePotionStore();
  const character = useCharacterStore();
  const data = useDataStore();
  const filters = useFiltersStore();
  const ingredientSelection = useIngredientSelectionStore();

  const canBrewRecipe = (recipe: Recipe): { canBrew: boolean; missingIngredients: string[] } => {
    if (!recipe.components) return { canBrew: false, missingIngredients: ['Нет компонентов'] };
    const missingIngredients: string[] = [];
    for (const component of recipe.components) {
      const selectedIngredientId = ingredientSelection.getSelectedIngredient(recipe.id, component.id);
      if (!selectedIngredientId) {
        missingIngredients.push(component.name);
        continue;
      }
      const available = inventory.isIngredientAvailable(selectedIngredientId, component.quantity);
      if (!available) {
        const ingredient = inventory.getIngredient(selectedIngredientId);
        missingIngredients.push(ingredient?.name || 'Неизвестный ингредиент');
      }
    }
    return { canBrew: missingIngredients.length === 0, missingIngredients };
  };

  const determineBrewedQuality = (
    targetDifficulty: number,
    mode: 'percentage' | 'ttrpg'
  ): {
    success: boolean;
    quality: 'poor' | 'standard' | 'excellent';
    flawEffect?: string;
    excellenceEffect?: string;
    rollResults: { naturalRoll: number; bonus: number; mainRoll: number; fumbleRoll?: number; excellenceRoll?: number }
  } => {
    let bonus = 0;
    const activeEquipment = character.equipment.find(eq => eq.id === character.character.activeEquipmentId);
    if (activeEquipment) bonus += activeEquipment.brewingBonus;
    if (character.character.alchemyToolsProficiency) bonus += 2;

    const naturalRoll = Math.floor(Math.random() * 20) + 1;
    const mainRoll = naturalRoll + bonus;

    const rollResults = { naturalRoll, bonus, mainRoll };

    // В режиме TTRPG критический успех (20) всегда успешен и изумителен
    if (mode === 'ttrpg' && naturalRoll === 20) {
      const excellenceRoll = Math.floor(Math.random() * 100) + 1;
      const excellence = EXCELLENCE_TABLE.find(e => excellenceRoll >= e.range[0] && excellenceRoll <= e.range[1]);
      return {
        success: true,
        quality: 'excellent',
        excellenceEffect: excellence?.effect || "Невероятный результат!",
        rollResults: { ...rollResults, excellenceRoll }
      };
    }

    let success = mainRoll >= targetDifficulty;
    if (mode === 'percentage') {
        const successPercentage = Math.max(5, Math.min(95, ((21 - (targetDifficulty - bonus)) / 20) * 100));
        success = (Math.random() * 100) < successPercentage;
    }

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

    return { success: true, quality: 'standard', rollResults };
  };

  const brewPotion = (recipe: Recipe): { success: boolean; message: string; potion?: Potion } => {
    if (!canBrewRecipe(recipe).canBrew) {
      return { success: false, message: `Недостаточно ингредиентов: ${canBrewRecipe(recipe).missingIngredients.join(', ')}` };
    }

    const rarityDetails = getRarityDetails(recipe.rarity);
    const targetDifficulty = 5 * rarityDetails.rarityModifier + 5 + recipe.components.length;
    const brewResult = determineBrewedQuality(targetDifficulty, character.character.brewingMode);

    character.incrementStat('totalBrews');

    const usedIngredients = recipe.components.map(component => ({
      id: ingredientSelection.getSelectedIngredient(recipe.id, component.id)!,
      quantity: component.quantity
    }));

    const magicalDustIsActive = ingredientSelection.isMagicalDustActive(recipe.id);
    if (magicalDustIsActive) {
        const dust = inventory.getIngredient('magical_dust');
        if (dust && dust.quantity > 0) {
            usedIngredients.push({ id: 'magical_dust', quantity: 1 });
        } else {
            // Если магическая пыль выбрана, но её нет в инвентаре, отключаем её использование
            ingredientSelection.toggleMagicalDust(recipe.id);
            return { success: false, message: 'Недостаточно магической пыли в инвентаре!' };
        }
    }

    const usedIngredientObjects = usedIngredients.map(used => inventory.getIngredient(used.id)!).filter(Boolean);

    // Проверяем, действительно ли магическая пыль используется (есть в usedIngredients)
    const isMagicalDustActuallyUsed = usedIngredients.some(ing => ing.id === 'magical_dust');
    
    let impurityEffect: string | undefined = undefined;
    if (!isMagicalDustActuallyUsed) {
        const impurities = usedIngredientObjects.map(ing => ing.impurity).filter(Boolean) as AlchemicalElement[];
        if (impurities.length > 0) {
            let dominantImpurity: AlchemicalElement | undefined = impurities.reduce((dominant, current) => {
                const dominantRank = ELEMENT_RANK[dominant] || 0;
                const currentRank = ELEMENT_RANK[current] || 0;
                return currentRank > dominantRank ? current : dominant;
            });

            if (dominantImpurity) {
                impurityEffect = getImpurityEffect(dominantImpurity, rarityDetails.rarityModifier);
            }
        }
    }

    inventory.useIngredients(usedIngredients);
    character.incrementStat('ingredientsUsed', usedIngredients.reduce((sum, ing) => sum + ing.quantity, 0));

    if (!brewResult.success) {
      character.incrementStat('failedBrews');
      let message = `Варка провалилась! (Бросок: ${brewResult.rollResults.mainRoll} против СЛ ${targetDifficulty})`;
      if (brewResult.flawEffect) {
        message += `\nИзъян: ${brewResult.flawEffect}`;
      }
      if (impurityEffect) {
        message += `\nСработала примесь: ${impurityEffect}`;
      }

      const flawedPotion: Omit<Potion, 'id'> = {
        name: `Испорченное ${recipe.name}`,
        description: recipe.description,
        effect: "Эффект непредсказуем из-за неудачной варки.",
        rarity: recipe.rarity,
        potionType: recipe.potionType,
        potionQuality: recipe.potionQuality,
        brewedQuality: 'poor',
        flawEffect: brewResult.flawEffect,
        impurityEffect: impurityEffect,
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

    const newPotion: Omit<Potion, 'id'> = {
      name: recipe.name,
      description: recipe.description,
      effect: recipe.effect,
      rarity: recipe.rarity,
      potionType: recipe.potionType,
      potionQuality: recipe.potionQuality,
      brewedQuality: brewResult.quality,
      excellenceEffect: brewResult.excellenceEffect,
      impurityEffect: impurityEffect,
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
    if (impurityEffect) {
        message += `\nСработала примесь: ${impurityEffect}`;
    }

    return {
      success: true,
      message,
      potion: { ...newPotion, id: Date.now().toString() }
    };
  };

  const buyIngredient = (ingredientId: string, quantity: number) => {
    const ingredientData = data.ingredients.find(ing => ing.id === ingredientId);
    if (!ingredientData) {
      return { success: false, message: 'Ингредиент не найден в базе данных' };
    }
    const totalCost = ingredientData.cost * quantity;
    if (!character.spendGold(totalCost)) {
      return { success: false, message: 'Недостаточно золота' };
    }
    inventory.buyIngredient(ingredientData, quantity);
    return { success: true, message: `Куплено ${quantity} x ${ingredientData.name}` };
  };

  const sellIngredient = (ingredientId: string, quantity: number) => {
    const ingredient = inventory.getIngredient(ingredientId);
    if (!ingredient || ingredient.quantity < quantity) {
      return { success: false, message: 'Недостаточно ингредиентов для продажи' };
    }
    const sellPrice = Math.floor(ingredient.cost * quantity * 0.5);
    character.earnGold(sellPrice);
    inventory.sellIngredient(ingredientId, quantity);
    return { success: true, message: `Продано ${quantity} x ${ingredient.name} за ${sellPrice} зм` };
  };

  const exploreLocation = (biomeId: string) => {
    const biome = data.getBiome(biomeId);
    if (!biome) {
      return { success: false, message: 'Биом не найден' };
    }
    if (!character.spendGold(biome.cost)) {
      return { success: false, message: 'Недостаточно золота для исследования' };
    }
    const result = data.exploreLocation(biomeId);

    if (result.items.length > 0) {
      result.items.forEach(item => {
        const ingredientData = data.getIngredient(item.id);
        if (ingredientData) {
          inventory.addIngredient({ ...ingredientData, quantity: item.quantity });
        }
      });
    }

    return result;
  };

  const hasMagicalDust = () => {
    const dust = inventory.getIngredient('magical_dust');
    return dust && dust.quantity > 0;
  };

  const exportAllData = () => {
    const dataToExport = {
      // Character
      character: character.character,
      currency: character.currency,
      stats: character.stats,
      ownedEquipment: character.ownedEquipment,
      // Inventory & Potions
      inventory: inventory.ingredients,
      potions: potions.potions,
      // Settings
      laboratoryRecipes: Array.from(data.getLaboratoryRecipes().map(r => r.id)),
      selectedIngredients: Array.from(ingredientSelection.selectedIngredients.entries()),
      useMagicalDust: Array.from(ingredientSelection.useMagicalDust),
      // Metadata
      exportDate: new Date().toISOString(),
      version: "Arcanum-v1.0"
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `arcanum_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importAllData = async (file: File): Promise<{ success: boolean; message: string }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);

          const requiredKeys = ['character', 'currency', 'stats', 'inventory', 'potions', 'laboratoryRecipes'];
          for (const key of requiredKeys) {
            if (!(key in data)) {
              resolve({ success: false, message: `Ошибка: в файле отсутствует обязательный ключ "${key}".` });
              return;
            }
          }

          // Assuming you added the setters to the individual stores as per the previous response
          character.setCharacter(data.character);
          character.setCurrency(data.currency);
          character.setStats(data.stats);
          character.setOwnedEquipment(data.ownedEquipment || ['cauldron']);
          inventory.setIngredients(data.inventory);
          potions.setPotions(data.potions);
          data.setLaboratoryRecipes(data.laboratoryRecipes || []);
          ingredientSelection.setSelectedIngredients(data.selectedIngredients || []);
          ingredientSelection.setUseMagicalDust(data.useMagicalDust || []);

          resolve({ success: true, message: 'Все данные успешно импортированы!' });
        } catch (error) {
          console.error(error);
          resolve({ success: false, message: 'Ошибка парсинга файла. Убедитесь, что это корректный JSON.' });
        }
      };
      reader.onerror = () => {
        resolve({ success: false, message: 'Не удалось прочитать файл.' });
      };
      reader.readAsText(file);
    });
  };

  const resetAllData = () => {
    localStorage.removeItem('alchemy-character');
    localStorage.removeItem('alchemy-inventory');
    localStorage.removeItem('alchemy-potions');
    localStorage.removeItem('alchemy-laboratory');
    localStorage.removeItem('alchemy-ingredient-selections');
    localStorage.removeItem('alchemy-magical-dust');
    window.location.reload();
  };

  return {
    // Inventory
    ingredients: inventory.ingredients,
    allIngredients: data.ingredients,
    addIngredient: inventory.addIngredient,
    updateIngredientQuantity: inventory.updateIngredientQuantity,
    removeIngredient: inventory.removeIngredient,
    getIngredient: inventory.getIngredient,
    isIngredientAvailable: inventory.isIngredientAvailable,
    cleanDuplicates: inventory.cleanDuplicates,
    swapIngredientElements: inventory.swapIngredientElements,

    // Potions
    potions: potions.potions,
    addPotion: potions.addPotion,
    updatePotionQuantity: potions.updatePotionQuantity,
    togglePotionFavorite: potions.togglePotionFavorite,

    // Character & Equipment
    character: character.character,
    currency: character.currency,
    stats: character.stats,
    equipment: character.equipment,
    availableEquipment: character.getOwnedEquipment(),
    availableForPurchaseEquipment: character.getAvailableForPurchaseEquipment(),
    playerGold: character.getTotalGold(),
    getTotalGold: character.getTotalGold,
    updateCharacterName: character.updateCharacterName,
    updateCharacterLevel: character.updateCharacterLevel,
    updateAlchemyToolsProficiency: character.updateAlchemyToolsProficiency,
    updateCharacterStats: character.updateCharacterStats,
    updateCurrency: character.updateCurrency,
    buyEquipment: character.buyEquipment,
    setActiveEquipment: character.setActiveEquipment,
    updateBrewingMode: character.updateBrewingMode,
    incrementStat: character.incrementStat,

    // Data
    recipes: data.recipes,
    biomes: data.biomes,
    isLoading: data.isLoading,
    getRecipe: data.getRecipe,
    getBiome: data.getBiome,
    addRecipeToLaboratory: data.addRecipeToLaboratory,
    removeRecipeFromLaboratory: data.removeRecipeFromLaboratory,
    isRecipeInLaboratory: data.isRecipeInLaboratory,
    getLaboratoryRecipes: data.getLaboratoryRecipes,
     addCustomIngredient: data.addCustomIngredient,

    // Filters
    activeFilters: filters.filters,
    updateFilter: filters.updateFilter,
    resetFilters: filters.resetFilters,

    // Brewing
    canBrewRecipe,
    brewPotion,
    selectIngredientForComponent: ingredientSelection.setSelectedIngredient,
    getSelectedIngredient: ingredientSelection.getSelectedIngredient,
    toggleMagicalDust: ingredientSelection.toggleMagicalDust,
    isMagicalDustActive: ingredientSelection.isMagicalDustActive,
    hasMagicalDust,

    // Shop & Exploration
    buyIngredient,
    sellIngredient,
    exploreLocation,

    exportAllData,
    importAllData,
    resetAllData
  };
}