// hooks/useAlchemyStory.ts

import { useState, useEffect } from 'react';

// Основные категории ингредиентов по D&D правилам
export type IngredientCategory = 'plant' | 'mineral' | 'creature' | 'other';

// Элементы для алхимии согласно таблице D&D
export type AlchemicalElement =
  // Сущность
  | 'time' | 'matter' | 'stasis' | 'space' | 'decay' | 'mind' | 'chaos' | 'energy' | 'sound' | 'radiance' | 'acid' | 'necrotic' | 'fire' | 'foam' |
  // Шкала
  | 'embodiment' | 'challenge' | 'illusion' | 'necromancy' | 'reflection' | 'enchantment' | 'transmutation' | 'divination' | 'psychic' | 'force' | 'physical' | 'cold' | 'electricity' | 'poison' |
  // Вид существа
  | 'aberration' | 'giant' | 'humanoid' | 'dragon' | 'beast' | 'healing' | 'construct' | 'monster' | 'celestial' | 'undead' | 'plant' | 'slime' | 'fey' | 'elemental' |
  // Дополнительные
  | 'protection';

// Базы для зелий согласно таблице
export type PotionBase = 'spring_water' | 'enchanted_ink' | 'thick_magical_ink' | 'dissolved_ether' | 'irminsul_juice';

// Расширенный тип ингредиентов, включающий базы
export type IngredientType = IngredientCategory | PotionBase;

export interface Ingredient {
  id: string;
  name: string;
  description: string;
  type: IngredientType;
  category: IngredientCategory; // Основная категория (растения, ископаемые, существа, иные)
  elements: AlchemicalElement[]; // Алхимические элементы ингредиента
  rarity: 'common' | 'uncommon' | 'rare' | 'very rare' | 'legendary';
  tags: string[];
  cost: number; // в золотых монетах
  weight: number; // в фунтах
  locations: string[];
  quantity: number;
  // Поля для баз зелий
  isBase?: boolean; // Является ли база для зелий
  baseRarityModifier?: PotionRarity; // На какую редкость влияет база
  shortCode?: string; // Краткое обозначение (например, "В" для Время)
}

export interface RecipeComponent {
  id: string;
  name: string;
  description: string;
  requiredElements: AlchemicalElement[]; // Требуемые алхимические элементы
  categories?: IngredientCategory[]; // Допустимые категории ингредиентов (опционально)
  tags: string[];
  quantity: number;
  selectedIngredientId?: string; // Выбранный ингредиент для этого компонента
  // Для совместимости со старой системой
  types?: IngredientType[]; // Устаревшее поле
}

export type PotionRarity = 'common' | 'uncommon' | 'rare' | 'very rare' | 'legendary' | 'artifact';

export type PotionType = 'oil' | 'elixir' | 'potion';
export type PotionQuality = 'low' | 'common' | 'high';

export const getPotionTypeName = (type: PotionType): string => {
  switch (type) {
    case 'oil': return 'Масло';
    case 'elixir': return 'Эликсир';
    case 'potion': return 'Зелье';
  }
};

export const getPotionTypeColor = (type: PotionType): string => {
  switch (type) {
    case 'oil': return 'bg-amber-500';
    case 'elixir': return 'bg-violet-500';
    case 'potion': return 'bg-blue-500';
  }
};

export const getPotionQualityName = (quality: PotionQuality): string => {
  switch (quality) {
    case 'low': return 'Низкое';
    case 'common': return 'Обычное';
    case 'high': return 'Высокое';
  }
};

export const getPotionQualityColor = (quality: PotionQuality): string => {
  switch (quality) {
    case 'low': return 'bg-gray-600';
    case 'common': return 'bg-blue-600';
    case 'high': return 'bg-purple-600';
  }
};

export const getBrewedQualityName = (quality: 'poor' | 'standard' | 'excellent'): string => {
  switch (quality) {
    case 'poor': return 'С изъянами';
    case 'standard': return 'Стандартное';
    case 'excellent': return 'Изысканное';
  }
};

export const getBrewedQualityColor = (quality: 'poor' | 'standard' | 'excellent'): string => {
  switch (quality) {
    case 'poor': return 'bg-red-600';
    case 'standard': return 'bg-slate-500';
    case 'excellent': return 'bg-green-600';
  }
};

// Функции для работы с новой системой ингредиентов

export const getIngredientCategoryName = (category: IngredientCategory): string => {
  switch (category) {
    case 'plant': return 'Растения';
    case 'mineral': return 'Ископаемые';
    case 'creature': return 'Существа';
    case 'other': return 'Иные';
  }
};

export const getIngredientCategoryColor = (category: IngredientCategory): string => {
  switch (category) {
    case 'plant': return 'bg-green-500';
    case 'mineral': return 'bg-gray-500';
    case 'creature': return 'bg-red-500';
    case 'other': return 'bg-purple-500';
  }
};

export const getAlchemicalElementName = (element: AlchemicalElement): string => {
  const elementNames: Record<AlchemicalElement, string> = {
    // Сущность
    'time': 'Время',
    'matter': 'Материя',
    'stasis': 'Остановка',
    'space': 'Пространство',
    'decay': 'Разложение',
    'mind': 'Разум',
    'chaos': 'Хаос',
    'energy': 'Энергия',
    'sound': 'Звук',
    'radiance': 'Излучение',
    'acid': 'Кислота',
    'necrotic': 'Некротический',
    'fire': 'Огонь',
    'foam': 'Пенный',
    // Шкала
    'embodiment': 'Воплощение',
    'challenge': 'Вызов',
    'illusion': 'Иллюзия',
    'necromancy': 'Некромантия',
    'reflection': 'Отражение',
    'enchantment': 'Очарование',
    'transmutation': 'Преобразование',
    'divination': 'Прорицание',
    'psychic': 'Психический',
    'force': 'Силовое поле',
    'physical': 'Физический',
    'cold': 'Холод',
    'electricity': 'Электрический',
    'poison': 'Яд',
    // Вид существа
    'aberration': 'Аберрация',
    'giant': 'Великан',
    'humanoid': 'Гуманоид',
    'dragon': 'Дракон',
    'beast': 'Зверь',
    'healing': 'Исцеление',
    'construct': 'Конструкт',
    'monster': 'Монстр',
    'celestial': 'Небожитель',
    'undead': 'Нежить',
    'plant': 'Растение',
    'slime': 'Слизь',
    'fey': 'Фея',
    'elemental': 'Элементаль',
    // Дополнительные
    'protection': 'Защита'
  };
  return elementNames[element] || element;
};

export const getAlchemicalElementShortCode = (element: AlchemicalElement): string => {
  const shortCodes: Record<AlchemicalElement, string> = {
    // Сущность
    'time': 'В',
    'matter': 'М',
    'stasis': 'О',
    'space': 'П',
    'decay': 'Рл',
    'mind': 'Рм',
    'chaos': 'Х',
    'energy': 'Э',
    'sound': 'Зв',
    'radiance': 'Изл',
    'acid': 'Кис',
    'necrotic': 'Нки',
    'fire': 'Огн',
    'foam': 'Пен',
    // Шкала
    'embodiment': 'Вопл',
    'challenge': 'Выз',
    'illusion': 'Илл',
    'necromancy': 'Нека',
    'reflection': 'Отр',
    'enchantment': 'Очар',
    'transmutation': 'Прео',
    'divination': 'Прор',
    'psychic': 'Пси',
    'force': 'СП',
    'physical': 'Физ',
    'cold': 'Хол',
    'electricity': 'Элк',
    'poison': 'Яд',
    // Вид существа
    'aberration': 'Аб',
    'giant': 'Вел',
    'humanoid': 'Гум',
    'dragon': 'Дрк',
    'beast': 'Звр',
    'healing': 'Исц',
    'construct': 'Кон',
    'monster': 'Мон',
    'celestial': 'Неб',
    'undead': 'Неж',
    'plant': 'Рас',
    'slime': 'Сли',
    'fey': 'Фея',
    'elemental': 'Элм',
    // Дополнительные
    'protection': 'Защ'
  };
  return shortCodes[element] || element.slice(0, 3).toUpperCase();
};

export const getPotionBaseName = (base: PotionBase): string => {
  switch (base) {
    case 'spring_water': return 'Родниковая вода (РВ)';
    case 'enchanted_ink': return 'Волшебные чернила (ВЧ)';
    case 'thick_magical_ink': return 'Густые волшебные чернила (ГВЧ)';
    case 'dissolved_ether': return 'Растворённый эфир (РЭ)';
    case 'irminsul_juice': return 'Сок Ирминсула (СИ)';
    default: return base || 'Неизвестная база';
  }
};

export const getPotionBaseRarity = (base: PotionBase): PotionRarity => {
  switch (base) {
    case 'spring_water': return 'common';
    case 'enchanted_ink': return 'uncommon';
    case 'thick_magical_ink': return 'rare';
    case 'dissolved_ether': return 'very rare';
    case 'irminsul_juice': return 'legendary';
    default: return 'common';
  }
};

export const getPotionBaseCost = (base: PotionBase): number => {
  switch (base) {
    case 'spring_water': return 5;
    case 'enchanted_ink': return 50;
    case 'thick_magical_ink': return 500;
    case 'dissolved_ether': return 1000;
    case 'irminsul_juice': return 5000;
    default: return 0;
  }
};

export interface RarityDetails {
  modifier: number; // Модификатор редкости (1-6)
  dice: string; // Тип кости (к4, к6, к8, к10, к12, к100)
  savingThrow: number; // Спасбросок (10, 14, 18, 22, 26, 30)
  duration: string; // Длительность эффекта
  brewingTimeHours: number; // Время варки в часах
  brewingTimeText: string; // Текстовое описание времени варки
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  effect: string;
  difficulty: number; // 1-10 (устаревшее, заменено на систему редкости)
  baseSuccessChance: number; // 0-100% (устаревшее, теперь рассчитывается)
  brewingTime: string; // Устаревшее, теперь берется из rarityDetails
  components: RecipeComponent[];
  inLaboratory: boolean;
  rarity: PotionRarity;
  potionType: PotionType;
  potionQuality: PotionQuality;
  tags: string[];
  // Новые поля согласно D&D 5e
  savingThrowType?: 'strength' | 'dexterity' | 'constitution' | 'intelligence' | 'wisdom' | 'charisma';
  durationOverride?: string; // Переопределение длительности для особых зелий
}

export interface Potion {
  id: string;
  name: string;
  description: string;
  effect: string;
  quantity: number;
  recipeId: string;
  rarity: PotionRarity;
  tags: string[];
  isFavorite?: boolean;
  // Тип и качество зелья согласно правилам D&D 5e
  potionType: PotionType;
  potionQuality: PotionQuality;
  // Новые поля для системы D&D 5e
  actualDuration?: string; // Реальная длительность (если была броской кости)
  brewedQuality?: 'poor' | 'standard' | 'excellent'; // Качество варки
  // Дополнительные эффекты от критических результатов
  additionalEffects?: {
    positive?: string[]; // Положительные дополнительные эффекты
    negative?: string[]; // Негативные дополнительные эффекты
    brewingComplications?: string[]; // Осложнения при варке
  };
  // Результаты бросков для отображения истории
  rollResults?: {
    mainRoll: number; // Основной бросок к20
    bonus: number; // Бонус персонажа
    naturalRoll?: number; // Натуральный результат (для критов)
    fumbleRoll?: number; // Бросок по таблице изъянов (к100)
    excellenceRoll?: number; // Бросок по таблице исключительности (к100)
  };
}

export interface Biome {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  explorationCost: number; // в золотых монетах
  availableIngredients: {
    ingredientId: string;
    chance: number; // 0-100%
    minQuantity: number;
    maxQuantity: number;
  }[];
}

export interface ExplorationResult {
  success: boolean;
  foundIngredients: { ingredient: Ingredient; quantity: number }[];
  message: string;
  cost: number;
}

export interface BrewingStats {
  totalBrews: number;
  successfulBrews: number;
  failedBrews: number;
  potionsCreated: number;
  ingredientsUsed: number;
  goldSpent: number;
  goldEarned: number;
}

export interface Equipment {
  id: string;
  name: string;
  description: string;
  brewingBonus: number;
  cost: number;
  weight: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'very rare' | 'legendary';
}

export interface Currency {
  copper: number;
  silver: number;
  gold: number;
  platinum: number;
}

// Конвертация монет в золотые по правилам D&D
export function convertToGold(currency: Currency): number {
  return currency.platinum * 10 + currency.gold + currency.silver / 10 + currency.copper / 100;
}

// Конвертация золотых монет в структуру валюты (наибольшими номиналами)
export function convertFromGold(goldAmount: number): Currency {
  let remaining = Math.round(goldAmount * 100); // Переводим в медные для точности

  const platinum = Math.floor(remaining / 1000);
  remaining -= platinum * 1000;

  const gold = Math.floor(remaining / 100);
  remaining -= gold * 100;

  const silver = Math.floor(remaining / 10);
  remaining -= silver * 10;

  const copper = remaining;

  return { platinum, gold, silver, copper };
}

// Получение деталей редкости согласно D&D 5e
export function getRarityDetails(rarity: PotionRarity): RarityDetails {
  switch (rarity) {
    case 'common':
      return {
        modifier: 1,
        dice: 'к4',
        savingThrow: 10,
        duration: '1к10 минут',
        brewingTimeHours: 1,
        brewingTimeText: '1 час'
      };
    case 'uncommon':
      return {
        modifier: 2,
        dice: 'к6',
        savingThrow: 14,
        duration: '1 час',
        brewingTimeHours: 2,
        brewingTimeText: '2 часа'
      };
    case 'rare':
      return {
        modifier: 3,
        dice: 'к8',
        savingThrow: 18,
        duration: '8 часов',
        brewingTimeHours: 4,
        brewingTimeText: '4 часа'
      };
    case 'very rare':
      return {
        modifier: 4,
        dice: 'к10',
        savingThrow: 22,
        duration: '24 часа',
        brewingTimeHours: 8,
        brewingTimeText: '8 часов'
      };
    case 'legendary':
      return {
        modifier: 5,
        dice: 'к12',
        savingThrow: 26,
        duration: '1к6 дней',
        brewingTimeHours: 24,
        brewingTimeText: '24 часа'
      };
    case 'artifact':
      return {
        modifier: 6,
        dice: 'к100',
        savingThrow: 30,
        duration: 'Особая',
        brewingTimeHours: 168, // 7 дней
        brewingTimeText: 'Особая'
      };
  }
}

// Получение цвета редкости для UI
export function getRarityColor(rarity: PotionRarity): string {
  switch (rarity) {
    case 'common': return 'bg-gray-500';
    case 'uncommon': return 'bg-green-500';
    case 'rare': return 'bg-blue-500';
    case 'very rare': return 'bg-purple-500';
    case 'legendary': return 'bg-orange-500';
    case 'artifact': return 'bg-red-500';
  }
}

// Получение названия редкости на русском
export function getRarityName(rarity: PotionRarity): string {
  switch (rarity) {
    case 'common': return 'Обычная';
    case 'uncommon': return 'Необычная';
    case 'rare': return 'Редкая';
    case 'very rare': return 'Очень редкая';
    case 'legendary': return 'Легендарная';
    case 'artifact': return 'Артефакт';
  }
}

// Броски костей для алхимии
export function rollDice(diceType: string, count: number = 1): number {
  const sides = parseInt(diceType.replace('к', ''));
  let total = 0;
  for (let i = 0; i < count; i++) {
    total += Math.floor(Math.random() * sides) + 1;
  }
  return total;
}

// Расчет длительности эффекта зелья
export function calculatePotionDuration(rarity: PotionRarity, override?: string): string {
  if (override) return override;

  const details = getRarityDetails(rarity);

  switch (rarity) {
    case 'common': {
      const minutes = rollDice('к10');
      return `${minutes} ${minutes === 1 ? 'минута' : minutes < 5 ? 'минуты' : 'минут'}`;
    }
    case 'legendary': {
      const days = rollDice('к6');
      return `${days} ${days === 1 ? 'день' : days < 5 ? 'дня' : 'дней'}`;
    }
    default:
      return details.duration;
  }
}

// Понижение редкости на 1 уровень
export function lowerRarity(rarity: PotionRarity): PotionRarity {
  switch (rarity) {
    case 'artifact': return 'legendary';
    case 'legendary': return 'very rare';
    case 'very rare': return 'rare';
    case 'rare': return 'uncommon';
    case 'uncommon': return 'common';
    case 'common': return 'common'; // Не может быть ниже
  }
}

// Обработка критического провала (натуральная 1)
export function handleCriticalFailure(rarity: PotionRarity): {
  effectDescription: string;
  additionalEffects: NonNullable<Potion['additionalEffects']>;
  modifiedRarity?: PotionRarity;
  rollResult: number;
} {
  const roll = rollDice('к100');
  let effectDescription = '';
  let additionalEffects: NonNullable<Potion['additionalEffects']> = {};
  let modifiedRarity: PotionRarity | undefined;

  if (roll <= 10) {
    // Ошибки - путь к успеху
    modifiedRarity = rarity === 'legendary' ? 'legendary' : lowerRarity(rarity);
    effectDescription = 'Ошибки - путь к успеху. Редкость зелья снижена.';
    additionalEffects.negative = ['Редкость понижена на 1 уровень'];
  } else if (roll <= 20) {
    // Неконтролируемый полиморфизм
    effectDescription = 'Неконтролируемый полиморфизм. Выпивший меняет расу на случайную на время действия зелья.';
    additionalEffects.negative = ['Случайное изменение расы на время действия'];
  } else if (roll <= 30) {
    // Процедурный эффект
    const exhaustionLevels = rollDice('к6');
    effectDescription = `Процедурный эффект. Выпивший получает ${exhaustionLevels} уровней истощения.`;
    additionalEffects.negative = [`Получает ${exhaustionLevels} уровней истощения`];
  } else if (roll <= 40) {
    // Неклассические ингредиенты
    modifiedRarity = rarity === 'common' ? 'common' : lowerRarity(rarity);
    effectDescription = 'Неклассические ингредиенты. Редкость зелья значительно снижена.';
    additionalEffects.negative = ['Редкость понижена на 1 уровень'];
  } else if (roll <= 50) {
    // Биоморфное варево
    effectDescription = 'Биоморфное варево. Активирует эффект зелья, но магическое лечение заменено некротическим уроном.';
    additionalEffects.negative = ['Лечение заменено некротическим уроном'];
  } else {
    // Внезапное открытие (51-100)
    effectDescription = 'Внезапное открытие. Зелье превращается в экспериментальное с непредсказуемыми свойствами.';
    additionalEffects.negative = ['Непредсказуемые экспериментальные свойства'];
  }

  return {
    effectDescription,
    additionalEffects,
    modifiedRarity,
    rollResult: roll
  };
}

// Обработка критического успеха (натуральная 20)
export function handleCriticalSuccess(rarity: PotionRarity): {
  effectDescription: string;
  additionalEffects: NonNullable<Potion['additionalEffects']>;
  extraPotion?: boolean;
  ingredientsRefunded?: boolean;
  rollResult: number;
} {
  const roll = rollDice('к100');
  let effectDescription = '';
  let additionalEffects: NonNullable<Potion['additionalEffects']> = {};
  let extraPotion = false;
  let ingredientsRefunded = false;

  if (roll <= 10) {
    // Неконтролируемое лечение
    const lowerRarity = rarity === 'common' ? 'common' :
                       rarity === 'uncommon' ? 'common' :
                       rarity === 'rare' ? 'uncommon' :
                       rarity === 'very rare' ? 'rare' : 'very rare';
    effectDescription = `Неконтролируемое лечение. Получено два зелья: одно обычное, второе редкости "${getRarityName(lowerRarity)}".`;
    additionalEffects.positive = ['Создано дополнительное зелье пониженной редкости'];
    extraPotion = true;
  } else if (roll <= 20) {
    // Экономный подход
    effectDescription = 'Экономный подход. Изготовление не потребовало расхода ингредиентов.';
    additionalEffects.positive = ['Ингредиенты возвращены'];
    ingredientsRefunded = true;
  } else if (roll <= 30) {
    // Первая проба
    effectDescription = 'Первая проба. Эффект зелья подействовал на создателя в процессе изготовления, плюс создано дополнительное зелье.';
    additionalEffects.positive = ['Эффект зелья подействовал на создателя', 'Создано дополнительное зелье'];
    extraPotion = true;
  } else if (roll <= 40) {
    // Внезапная мутация
    effectDescription = 'Внезапная мутация. Эффекты зелья не имеют никаких негативных последствий.';
    additionalEffects.positive = ['Отсутствуют негативные эффекты'];
  } else if (roll <= 50) {
    // Тщательное внимание
    effectDescription = 'Тщательное внимание. Зелье действует без каких-либо негативных эффектов и осложнений.';
    additionalEffects.positive = ['Идеальное исполнение без побочных эффектов'];
  } else {
    // Направ к небесам (51-100)
    effectDescription = 'Направ к небесам. Изготовитель получает вдохновение и дополнительный опыт.';
    additionalEffects.positive = ['Изготовитель получает вдохновение', 'Дополнительный опыт изготовления'];
  }

  return {
    effectDescription,
    additionalEffects,
    extraPotion,
    ingredientsRefunded,
    rollResult: roll
  };
}

export interface Character {
  name: string;
  level: number;
  proficiencyBonus: number;
  alchemyToolsProficiency: boolean;
  equipment: Equipment[];
  activeEquipmentId: string;
  totalBrewingBonus: number;
  baseStats?: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
}

export interface AlchemyStore {
  ingredients: Ingredient[];
  recipes: Recipe[];
  potions: Potion[];
  biomes: Biome[];
  playerGold: number; // Deprecated, используется только для миграции
  currency: Currency;
  stats: BrewingStats;
  character: Character;
  availableEquipment: Equipment[];
  activeFilters: {
    ingredientTypes: string[];
    rarities: string[];
    tags: string[];
    search: string;
    availableForRecipes: string[];
    potionTypes: string[];
  };
}

const defaultIngredients: Ingredient[] = [
  {
    id: "spring_water",
    name: "Родниковая вода",
    description: "Чистая вода из священного источника. Основа для простых зелий.",
    type: "spring_water",
    category: "other",
    elements: ["healing"],
    rarity: "common",
    quantity: 20,
    cost: 5,
    weight: 1.0,
    locations: ["Священный источник", "Чистые реки"],
    tags: ["база", "жидкость", "лечение"],
    isBase: true,
    baseRarityModifier: "common",
    shortCode: "РВ"
  },
  {
    id: "enchanted_ink",
    name: "Волшебные чернила",
    description: "Чернила, насыщенные магической энергией. Используются для необычных зелий.",
    type: "enchanted_ink",
    category: "other",
    elements: ["enchantment", "energy"],
    rarity: "uncommon",
    quantity: 10,
    cost: 50,
    weight: 0.5,
    locations: ["Магическая академия", "Библиотека волшебника"],
    tags: ["база", "магия", "чернила"],
    isBase: true,
    baseRarityModifier: "uncommon",
    shortCode: "ВЧ"
  },
  {
    id: "belladonna_root",
    name: "Белладонны корень",
    description: "Ядовитый корень с сильными токсическими свойствами",
    type: "plant",
    category: "plant",
    elements: ["poison"],
    rarity: "common",
    quantity: 8,
    cost: 22,
    weight: 0.1,
    locations: ["Лес", "Луг"],
    tags: ["яд", "растение"],
    shortCode: "БК"
  },
  {
    id: "hippogriph",
    name: "Гиппогриб",
    description: "Магическое существо с иллюзорными свойствами",
    type: "creature",
    category: "creature",
    elements: ["illusion"],
    rarity: "uncommon",
    quantity: 2,
    cost: 100,
    weight: 0.5,
    locations: ["Подземье"],
    tags: ["иллюзия", "существо"],
    shortCode: "Гп"
  },
  {
    id: "firebloom",
    name: "Горицвет",
    description: "Цветок, пылающий внутренним огнем",
    type: "plant",
    category: "plant",
    elements: ["fire"],
    rarity: "common",
    quantity: 5,
    cost: 15,
    weight: 0.1,
    locations: ["Горы", "Луг", "Подземье"],
    tags: ["огонь", "цветок"],
    shortCode: "ГЦ"
  },
  {
    id: "thunder_rose",
    name: "Громовая роза",
    description: "Роза, искрящаяся электричеством",
    type: "plant",
    category: "plant",
    elements: ["electricity"],
    rarity: "common",
    quantity: 6,
    cost: 10,
    weight: 0.1,
    locations: ["Горы", "Холмы"],
    tags: ["электричество", "роза"],
    shortCode: "ГР"
  },
  {
    id: "doom_bud",
    name: "Губительный бутон",
    description: "Бутон с кислотными свойствами",
    type: "plant",
    category: "plant",
    elements: ["acid"],
    rarity: "common",
    quantity: 7,
    cost: 10,
    weight: 0.1,
    locations: ["Лес"],
    tags: ["кислота", "бутон"],
    shortCode: "ГБ"
  },
  {
    id: "kingfisher",
    name: "Зимородок",
    description: "Птица с холодными свойствами",
    type: "creature",
    category: "creature",
    elements: ["cold"],
    rarity: "common",
    quantity: 4,
    cost: 15,
    weight: 0.2,
    locations: ["Арктика", "Горы"],
    tags: ["холод", "птица"],
    shortCode: "Зм"
  },
  {
    id: "stone",
    name: "Камень",
    description: "Обычный камень с физическими свойствами",
    type: "mineral",
    category: "mineral",
    elements: ["physical"],
    rarity: "common",
    quantity: 15,
    cost: 1,
    weight: 1.0,
    locations: ["Болото", "Лес"],
    tags: ["физический", "камень"],
    shortCode: "Км"
  },
  {
    id: "hemp",
    name: "Конопля",
    description: "Растение с психическими свойствами",
    type: "plant",
    category: "plant",
    elements: ["psychic"],
    rarity: "common",
    quantity: 3,
    cost: 10,
    weight: 0.1,
    locations: ["Луг", "Побережье", "Холмы"],
    tags: ["психический", "растение"],
    shortCode: "Кн"
  },
  {
    id: "tumbleweed",
    name: "Перекати-тыльник",
    description: "Растение со звуковыми свойствами",
    type: "plant",
    category: "plant",
    elements: ["sound"],
    rarity: "common",
    quantity: 6,
    cost: 15,
    weight: 0.1,
    locations: ["Пустыня"],
    tags: ["звук", "растение"],
    shortCode: "ПТ"
  },
  {
    id: "fog_mushroom",
    name: "Поганка туманная",
    description: "Гриб с некротическими свойствами",
    type: "plant",
    category: "plant",
    elements: ["necrotic"],
    rarity: "uncommon",
    quantity: 2,
    cost: 30,
    weight: 0.1,
    locations: ["Болото"],
    tags: ["некротический", "гриб"],
    shortCode: "ПТ"
  },
  {
    id: "healer_trace",
    name: "След Целителя",
    description: "Магический след с целительными свойствами",
    type: "other",
    category: "other",
    elements: ["challenge"],
    rarity: "rare",
    quantity: 1,
    cost: 50,
    weight: 0.1,
    locations: ["Горы"],
    tags: ["вызов", "магия"],
    shortCode: "СЦ"
  },
  {
    id: "pacifying_spores",
    name: "Споры усмиряющие",
    description: "Споры с очаровывающими свойствами",
    type: "plant",
    category: "plant",
    elements: ["enchantment"],
    rarity: "uncommon",
    quantity: 3,
    cost: 125,
    weight: 0.1,
    locations: ["Лес", "Подземье"],
    tags: ["очарование", "споры"],
    shortCode: "СУ"
  },
  {
    id: "melting_flower",
    name: "Таящий цветок",
    description: "Цветок с кислотными свойствами",
    type: "plant",
    category: "plant",
    elements: ["acid"],
    rarity: "common",
    quantity: 5,
    cost: 10,
    weight: 0.1,
    locations: ["Арктика", "Горы"],
    tags: ["кислота", "цв��ток"],
    shortCode: "ТЦ"
  },
  {
    id: "herbal_collection",
    name: "Травяной сбор",
    description: "Сбор трав с отражающими свойствами",
    type: "plant",
    category: "plant",
    elements: ["reflection"],
    rarity: "uncommon",
    quantity: 2,
    cost: 120,
    weight: 0.2,
    locations: ["Везде", "кроме Пустыни и Под водой"],
    tags: ["отражение", "травы"],
    shortCode: "ТС"
  },
  {
    id: "glowwort",
    name: "Трава-светлячка",
    description: "Светящаяся трава с излучающими свойствами",
    type: "plant",
    category: "plant",
    elements: ["radiance"],
    rarity: "common",
    quantity: 4,
    cost: 10,
    weight: 0.1,
    locations: ["Везде", "кроме Под водой"],
    tags: ["излучение", "свет"],
    shortCode: "ТС"
  },
  {
    id: "hops",
    name: "Хмель",
    description: "Растение с пенными свойствами",
    type: "plant",
    category: "plant",
    elements: ["foam"],
    rarity: "common",
    quantity: 8,
    cost: 10,
    weight: 0.1,
    locations: ["Лес", "Луг", "Холмы"],
    tags: ["пена", "растение"],
    shortCode: "Хм"
  },
  {
    id: "sugar_flower_pollen",
    name: "Цветка-сахарка пыльца",
    description: "Сладкая пыльца с физическими свойствами",
    type: "plant",
    category: "plant",
    elements: ["physical"],
    rarity: "common",
    quantity: 6,
    cost: 30,
    weight: 0.1,
    locations: ["Луг", "Холмы"],
    tags: ["физический", "пыльца"],
    shortCode: "ЦС"
  },
  {
    id: "mercury_drops",
    name: "Ртуть",
    description: "Жидкий металл с трансмутационными свойствами",
    type: "mineral",
    category: "mineral",
    elements: ["transmutation"],
    rarity: "uncommon",
    quantity: 3,
    cost: 80,
    weight: 0.3,
    locations: ["Алхимическая лаборатория", "Шахты"],
    tags: ["трансмутация", "металл"],
    shortCode: "Рт"
  },
  {
    id: "thick_magical_ink",
    name: "Густые волшебные чернила",
    description: "Густые чернила, насыщенные сильной магической энергией. Используются для редких зелий.",
    type: "thick_magical_ink",
    category: "other",
    elements: ["energy", "enchantment"],
    rarity: "rare",
    quantity: 5,
    cost: 500,
    weight: 0.5,
    locations: ["Древняя библиотека", "Магическая академия"],
    tags: ["база", "магия", "чернила"],
    isBase: true,
    baseRarityModifier: "rare",
    shortCode: "ГВЧ"
  },
  {
    id: "dissolved_ether",
    name: "Растворённый эфир",
    description: "Эфирная субстанция в жидком виде. Используется для очень редких зелий.",
    type: "dissolved_ether",
    category: "other",
    elements: ["space", "energy"],
    rarity: "very rare",
    quantity: 2,
    cost: 1000,
    weight: 0.2,
    locations: ["Астральный план", "Эфирные врата"],
    tags: ["база", "эфир", "план"],
    isBase: true,
    baseRarityModifier: "very rare",
    shortCode: "РЭ"
  },
  {
    id: "irminsul_juice",
    name: "Сок Ирминсула",
    description: "Божественный сок мирового древа. Используется для легендарных зелий.",
    type: "irminsul_juice",
    category: "plant",
    elements: ["healing", "celestial", "time"],
    rarity: "legendary",
    quantity: 1,
    cost: 5000,
    weight: 0.1,
    locations: ["Мировое древо", "Божественный сад"],
    tags: ["база", "божественное", "древо"],
    isBase: true,
    baseRarityModifier: "legendary",
    shortCode: "СИ"
  }
];

const defaultBiomes: Biome[] = [
  {
    id: 'forest',
    name: 'Заколдованный лес',
    description: 'Мистический лес, полный магических растений и существ',
    difficulty: 'medium',
    explorationCost: 10,
    availableIngredients: [
      { ingredientId: '1', chance: 30, minQuantity: 1, maxQuantity: 2 }, // Лист мантрагоры
      { ingredientId: '4', chance: 70, minQuantity: 2, maxQuantity: 5 }, // Корень мирака
      { ingredientId: '5', chance: 15, minQuantity: 1, maxQuantity: 1 }, // Пыль феи
    ]
  },
  {
    id: 'mountains',
    name: 'Кристальные горы',
    description: 'Высокие горы с кристальными пещерами и редкими минералами',
    difficulty: 'hard',
    explorationCost: 25,
    availableIngredients: [
      { ingredientId: '3', chance: 60, minQuantity: 1, maxQuantity: 3 }, // Лунный камень
    ]
  },
  {
    id: 'meadows',
    name: 'Солнечные луга',
    description: 'Мирные луга с обычными, но полезными растениями',
    difficulty: 'easy',
    explorationCost: 5,
    availableIngredients: [
      { ingredientId: '4', chance: 90, minQuantity: 3, maxQuantity: 7 }, // Корень мирака
    ]
  },
  {
    id: 'dragon_lair',
    name: 'Логово дракона',
    description: 'Опасное место с редчайшими ингредиентами',
    difficulty: 'hard',
    explorationCost: 100,
    availableIngredients: [
      { ingredientId: '2', chance: 5, minQuantity: 1, maxQuantity: 1 }, // Кровь дракона
    ]
  },
  {
    id: 'fairy_ring',
    name: 'Феийный круг',
    description: 'Магическое место, где обитают феи',
    difficulty: 'medium',
    explorationCost: 20,
    availableIngredients: [
      { ingredientId: '5', chance: 40, minQuantity: 1, maxQuantity: 2 }, // Пыль феи
      { ingredientId: '1', chance: 25, minQuantity: 1, maxQuantity: 1 }, // Лист мантрагоры
    ]
  }
];

const defaultRecipes: Recipe[] = [
  {
    id: "r1",
    name: "Алхимическая краска",
    description: "Можно нанести на любую поверхность. Скрывается только Белым духом, Жёлтым отваром и Исполнением желаний",
    effect: "Можно нанести на любую поверхность. Скрывается только Белым духом, Жёлт��м отваром и Исполнением желаний. Если предмет уничтожен, краска тоже уничтожается",
    rarity: "common",
    potionType: "oil",
    potionQuality: "low",
    tags: ["краска", "маскировка"],
    savingThrowType: "none",
    inLaboratory: true,
    difficulty: 3,
    baseSuccessChance: 85,
    brewingTime: "1 час",
    components: [
      {
        id: "c1-base",
        name: "Родниковая вода",
        description: "База зелья",
        quantity: 1,
        requiredElements: [],
        categories: ["other"],
        tags: ["база"],
        types: ["spring_water"]
      },
      {
        id: "c1-1",
        name: "Вяз",
        description: "Кора вяза для основы краски",
        quantity: 1,
        requiredElements: ["protection"],
        categories: ["plant"],
        tags: ["защита"],
        types: ["plant"]
      },
      {
        id: "c1-2",
        name: "Ядовитый компонент",
        description: "Компонент с ядовитыми свойствами",
        quantity: 1,
        requiredElements: ["poison"],
        categories: ["plant"],
        tags: ["яд"],
        types: ["plant"]
      }
    ]
  },
  {
    id: 'r2',
    name: 'Зелье огненного дыхания',
    description: 'Позволяет дышать огнем в течение 1 минуты',
    effect: 'Огненное дыхание 3d6 урона, спасбросок Лов СЛ 13',
    difficulty: 7,
    baseSuccessChance: 60,
    brewingTime: '4 часа',
    rarity: 'uncommon',
    potionType: 'elixir',
    potionQuality: 'common',
    tags: ['боевое', 'огонь', 'дыхание'],
    savingThrowType: 'dexterity',
    components: [
      {
        id: 'c2-1',
        name: 'Огненная эссенция',
        description: 'Источник огненной магии',
        types: ['essence'],
        tags: ['о��онь', 'сила'],
        quantity: 1
      },
      {
        id: 'c2-2',
        name: 'Стабилизатор',
        description: 'Контролирует магическую энергию',
        types: ['herb', 'mineral'],
        tags: ['магия', 'стабильность'],
        quantity: 1
      }
    ],
    inLaboratory: false
  },
  {
    id: 'r3',
    name: 'Зелье невидимости',
    description: 'Делает невидимым на 1 час',
    effect: 'Невидимость на 1 час',
    difficulty: 8,
    baseSuccessChance: 50,
    brewingTime: '6 часов',
    rarity: 'rare',
    potionType: 'potion',
    potionQuality: 'common',
    tags: ['иллюзия', 'скрытность', 'магия'],
    savingThrowType: 'wisdom',
    components: [
      {
        id: 'c3-1',
        name: 'Эфирная субстанция',
        description: 'Основа для невидимости',
        types: ['essence'],
        tags: ['иллюзия', 'магия'],
        quantity: 2
      },
      {
        id: 'c3-2',
        name: 'Преломляющий элемент',
        description: 'Искривляет свет вокруг тела',
        types: ['crystal'],
        tags: ['свет', 'магия'],
        quantity: 2
      }
    ],
    inLaboratory: false
  },
  {
    id: 'r4',
    name: 'Зелье великого лечения',
    description: 'Восстанавливает 4d4+4 очков здоровья',
    effect: 'Лечение 4d4+4 ОЗ',
    difficulty: 10, // Устаревшее поле
    baseSuccessChance: 35, // Устаревшее поле
    brewingTime: '8 часов', // Устаревшее поле
    rarity: 'very rare',
    potionType: 'potion',
    potionQuality: 'high',
    tags: ['лечение', 'восстановление', 'мощное'],
    savingThrowType: 'constitution',
    components: [
      {
        id: 'c4-1',
        name: 'Концентрированная эссенция жизни',
        description: 'Мощный лечебный компонент',
        types: ['essence'],
        tags: ['лечение', 'жизнь', 'магия'],
        quantity: 3
      },
      {
        id: 'c4-2',
        name: 'Редкие лечебные травы',
        description: 'Особые растения с целебными свойствами',
        types: ['herb'],
        tags: ['лечение', 'редкость', 'восстановление'],
        quantity: 2
      },
      {
        id: 'c4-3',
        name: 'Кристалл усиления',
        description: 'Многократно усиливает эффект',
        types: ['crystal'],
        tags: ['магия', 'усиление'],
        quantity: 1
      }
    ],
    inLaboratory: false
  },
  {
    id: 'r5',
    name: 'Эликсир бессмертия',
    description: 'Временно останавливает старение и даёт сопротивление к смерти',
    effect: 'Временное бессмертие на 1к6 дней, сопротивление некротическому урону',
    difficulty: 15, // Устаревшее поле
    baseSuccessChance: 15, // Устаревшее поле
    brewingTime: '24 часа', // Устаревшее поле
    rarity: 'legendary',
    potionType: 'elixir',
    potionQuality: 'high',
    tags: ['бессмертие', 'жизнь', 'время', 'легендарное'],
    savingThrowType: 'constitution',
    durationOverride: '1к6 дней абсолютной защиты от смерти',
    components: [
      {
        id: 'c5-1',
        name: 'Капля крови древнего дракона',
        description: 'Источник бесконечной жизненной силы',
        types: ['creature'],
        tags: ['дракон', 'кровь', 'бессмертие'],
        quantity: 1
      },
      {
        id: 'c5-2',
        name: 'Лист мирового древа',
        description: 'Растение, связанное с источником всей жизни',
        types: ['herb'],
        tags: ['древо', 'мир', 'вечность'],
        quantity: 1
      },
      {
        id: 'c5-3',
        name: 'Осколок времени',
        description: 'Кристаллизованное время из потока вечности',
        types: ['crystal'],
        tags: ['время', 'вечность', 'магия'],
        quantity: 1
      }
    ],
    inLaboratory: false
  },
  {
    id: 'r6',
    name: 'Масло острых клинков',
    description: 'Покрывает оружие для увеличения урона',
    effect: '+1к4 колющего урона к следующим 3 атакам',
    difficulty: 5,
    baseSuccessChance: 70,
    brewingTime: '2 часа',
    rarity: 'uncommon',
    potionType: 'oil',
    potionQuality: 'common',
    tags: ['масло', 'оружие', 'урон'],
    inLaboratory: true,
    components: [
      {
        id: 'c6-1',
        name: 'Кислотная основа',
        description: 'Едкое вещество для пропитки лезвия',
        quantity: 2,
        types: ['кислота', 'жидкость'],
        tags: ['кислота', 'растворитель'],
        selectedIngredientId: undefined
      },
      {
        id: 'c6-2',
        name: 'Укрепляющий порошок',
        description: 'Минеральный порошок для закрепления эффекта',
        quantity: 1,
        types: ['минерал', 'порошок'],
        tags: ['металл', 'твердый'],
        selectedIngredientId: undefined
      }
    ]
  }
];

const defaultEquipment: Equipment[] = [
  {
    id: 'cauldron',
    name: 'Котелок на огне',
    description: 'Базовое алхимическое оборудование',
    brewingBonus: -2,
    cost: 0,
    weight: 1,
    rarity: 'common'
  },
  {
    id: 'herbalism_kit',
    name: 'Набор травника',
    description: 'Основные инструменты для работы с растениями',
    brewingBonus: 0,
    cost: 5,
    weight: 3,
    rarity: 'common'
  },
  {
    id: 'alchemist_supplies',
    name: 'Инструменты алхимика',
    description: 'Профессиональные алхимические инструменты',
    brewingBonus: 2,
    cost: 50,
    weight: 8,
    rarity: 'uncommon'
  },
  {
    id: 'alchemical_jug',
    name: 'Алхимическая стопка',
    description: 'Магическая посуда для точной дозировки',
    brewingBonus: 4,
    cost: 500,
    weight: 12,
    rarity: 'rare'
  },
  {
    id: 'portable_alchemy_set',
    name: 'Стационарный алхимический набор',
    description: 'Полная лаборатория в портативном исполнении',
    brewingBonus: 6,
    cost: 5000,
    weight: 0,
    rarity: 'very rare'
  },
  {
    id: 'laboratory',
    name: 'Лаборатория',
    description: 'Полноценная алхимическая лаборатория',
    brewingBonus: 8,
    cost: 50000,
    weight: 0,
    rarity: 'legendary'
  }
];

const defaultPotions: Potion[] = [
  {
    id: 'p1',
    name: 'Зелье лечения',
    description: 'Восстанавливает 2d4+2 очков здоровья',
    effect: 'Лечение 2d4+2 ОЗ',
    quantity: 3,
    recipeId: 'r1',
    rarity: 'common',
    potionType: 'potion',
    potionQuality: 'low',
    tags: ['лечение', 'восстановление']
  },
  {
    id: 'p2',
    name: 'Изысканное зелье огн�������нного дыхания',
    description: 'Превосходно сваренное зелье огненного дыхания',
    effect: 'Огненное дыхание 3d6 урона, спасбросок Лов СЛ 13. Длительность увеличена в 2 раза.',
    quantity: 1,
    recipeId: 'r2',
    rarity: 'uncommon',
    potionType: 'elixir',
    potionQuality: 'common',
    brewedQuality: 'excellent',
    tags: ['боевое', 'огонь', 'дыхание'],
    additionalEffects: {
      positive: ['Длительность увеличена в 2 раза', 'Дополнительно +1 к урону']
    },
    actualDuration: '2 минуты'
  },
  {
    id: 'p3',
    name: 'Зелье невидимости с изъянами',
    description: 'Неудачно сваренное зелье невидимости',
    effect: 'Невидимость на 30 минут вместо 1 часа',
    quantity: 1,
    recipeId: 'r3',
    rarity: 'rare',
    potionType: 'potion',
    potionQuality: 'common',
    brewedQuality: 'poor',
    tags: ['иллюзия', 'скрытность', 'магия'],
    additionalEffects: {
      negative: ['Длительность уменьшена вдвое', 'Слабое мерцание при движении']
    },
    actualDuration: '30 минут'
  },
  {
    id: 'p4',
    name: 'Масло острых клинков',
    description: 'Покрывает оружие для увеличения урона',
    effect: '+1к4 колющего урона к следующим 3 атакам',
    quantity: 2,
    recipeId: 'r6',
    rarity: 'uncommon',
    potionType: 'oil',
    potionQuality: 'common',
    tags: ['масло', 'оружие', 'урон']
  }
];

const defaultCharacter: Character = {
  name: 'Алхимик',
  level: 1,
  proficiencyBonus: 2,
  alchemyToolsProficiency: true,
  equipment: [defaultEquipment[0]], // Котелок на огне
  activeEquipmentId: defaultEquipment[0].id,
  totalBrewingBonus: -2,
  baseStats: {
    strength: 10,
    dexterity: 12,
    constitution: 14,
    intelligence: 15,
    wisdom: 13,
    charisma: 10
  }
};

export function useAlchemyStore() {
  const [isInitialized, setIsInitialized] = useState(false);

  // Проверяем наличие данных в localStorage синхронно
  const hasExistingData = typeof window !== 'undefined' && localStorage.getItem('alchemy-store');

  // Функция для миграции старых ингредиентов к новой структуре
  const migrateIngredientLocal = (ingredient: any): Ingredient => {
    const migrated = { ...ingredient };

    // Если нет category, определяем по старому type
    if (!migrated.category) {
      migrated.category = ingredient.type === 'herb' ? 'plant' :
                         ingredient.type === 'mineral' ? 'mineral' :
                         ingredient.type === 'creature' ? 'creature' : 'other';
    }

    // Если нет elements, создаем пустой массив
    if (!Array.isArray(migrated.elements)) {
      migrated.elements = [];
    }

    // Убеждаемся что tags это массив
    if (!Array.isArray(migrated.tags)) {
      migrated.tags = [];
    }

    // Убеждаемся что locations это массив
    if (!Array.isArray(migrated.locations)) {
      migrated.locations = [];
    }

    return migrated as Ingredient;
  };

  const [store, setStore] = useState<AlchemyStore>(() => {
    const saved = localStorage.getItem('alchemy-store');
    if (saved) {
      const parsedData = JSON.parse(saved);
      // Мигрируем старые данные, добавляя отсутствующие поля
      return {
        ingredients: Array.isArray(parsedData.ingredients) ? parsedData.ingredients.map(migrateIngredientLocal) : [],
        recipes: Array.isArray(parsedData.recipes) ? parsedData.recipes.map((recipe: any) => ({
          ...recipe,
          rarity: recipe.rarity || 'common',
          potionType: recipe.potionType || 'potion',
          potionQuality: recipe.potionQuality || 'low',
          tags: recipe.tags || []
        })) : defaultRecipes,
        potions: (() => {
          if (!Array.isArray(parsedData.potions)) {
            return defaultPotions;
          }

          const potions = parsedData.potions
            .map((potion: any) => ({
              ...potion,
              rarity: potion.rarity || 'common',
              potionType: potion.potionType || 'potion',
              potionQuality: potion.potionQuality || 'low',
              tags: potion.tags || []
            }))
            .filter((potion: any) => potion.quantity > 0); // Удаляем зелья с нулевым количеством

          // Группируем дублирующиеся зелья по recipeId
          const groupedPotions = new Map();
          potions.forEach((potion: any) => {
            const key = potion.recipeId || potion.name; // Используем recipeId, или name как fallback
            if (groupedPotions.has(key)) {
              const existing = groupedPotions.get(key);
              existing.quantity += potion.quantity;
            } else {
              groupedPotions.set(key, { ...potion });
            }
          });

          return Array.from(groupedPotions.values());
        })(),
        biomes: Array.isArray(parsedData.biomes) ? parsedData.biomes : defaultBiomes,
        playerGold: parsedData.playerGold || 100,
        currency: parsedData.currency || (parsedData.playerGold ? convertFromGold(parsedData.playerGold) : { copper: 0, silver: 0, gold: 100, platinum: 0 }),
        character: {
          ...defaultCharacter,
          ...parsedData.character,
          activeEquipmentId: parsedData.character?.activeEquipmentId || defaultCharacter.activeEquipmentId,
          baseStats: {
            ...defaultCharacter.baseStats,
            ...parsedData.character?.baseStats
          }
        },
        availableEquipment: Array.isArray(parsedData.availableEquipment) ? parsedData.availableEquipment : defaultEquipment,
        stats: parsedData.stats || {
          totalBrews: 0,
          successfulBrews: 0,
          failedBrews: 0,
          potionsCreated: 0,
          ingredientsUsed: 0,
          goldSpent: 0,
          goldEarned: 0
        },
        activeFilters: {
          ingredientTypes: Array.isArray(parsedData.activeFilters?.ingredientTypes) ? parsedData.activeFilters.ingredientTypes : [],
          rarities: Array.isArray(parsedData.activeFilters?.rarities) ? parsedData.activeFilters.rarities : [],
          tags: Array.isArray(parsedData.activeFilters?.tags) ? parsedData.activeFilters.tags : [],
          search: parsedData.activeFilters?.search || '',
          availableForRecipes: Array.isArray(parsedData.activeFilters?.availableForRecipes) ? parsedData.activeFilters.availableForRecipes : [],
          potionTypes: Array.isArray(parsedData.activeFilters?.potionTypes) ? parsedData.activeFilters.potionTypes : []
        }
      };
    }
    return {
      ingredients: [],
      recipes: defaultRecipes,
      potions: defaultPotions,
      biomes: defaultBiomes,
      playerGold: 100,
      currency: { copper: 0, silver: 0, gold: 100, platinum: 0 },
      character: defaultCharacter,
      availableEquipment: defaultEquipment,
      stats: {
        totalBrews: 0,
        successfulBrews: 0,
        failedBrews: 0,
        potionsCreated: 0,
        ingredientsUsed: 0,
        goldSpent: 0,
        goldEarned: 0
      },
      activeFilters: {
        ingredientTypes: [],
        rarities: [],
        tags: [],
        search: '',
        availableForRecipes: [],
        potionTypes: []
      }
    };
  });

  useEffect(() => {
    localStorage.setItem('alchemy-store', JSON.stringify(store));
  }, [store]);

  const addIngredient = (ingredient: Omit<Ingredient, 'id'>) => {
    setStore(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { ...ingredient, id: Date.now().toString() }]
    }));
  };

  const updateIngredientQuantity = (id: string, quantity: number) => {
    setStore(prev => ({
      ...prev,
      ingredients: Array.isArray(prev.ingredients) ? prev.ingredients.map(ing =>
        ing.id === id ? { ...ing, quantity } : ing
      ) : []
    }));
  };

  const updatePotionQuantity = (id: string, quantity: number) => {
    setStore(prev => ({
      ...prev,
      potions: Array.isArray(prev.potions) ? (quantity <= 0
        ? prev.potions.filter(potion => potion.id !== id) // Удаляем зелье если количество 0 или меньше
        : prev.potions.map(potion =>
            potion.id === id ? { ...potion, quantity } : potion
          )) : []
    }));
  };

  const togglePotionFavorite = (id: string) => {
    setStore(prev => ({
      ...prev,
      potions: Array.isArray(prev.potions) ? prev.potions.map(potion =>
        potion.id === id ? { ...potion, isFavorite: !potion.isFavorite } : potion
      ) : []
    }));
  };

  const addRecipeToLaboratory = (recipeId: string) => {
    setStore(prev => ({
      ...prev,
      recipes: Array.isArray(prev.recipes) ? prev.recipes.map(recipe =>
        recipe.id === recipeId ? { ...recipe, inLaboratory: true } : recipe
      ) : []
    }));
  };

  const removeRecipeFromLaboratory = (recipeId: string) => {
    setStore(prev => ({
      ...prev,
      recipes: Array.isArray(prev.recipes) ? prev.recipes.map(recipe =>
        recipe.id === recipeId ? { ...recipe, inLaboratory: false } : recipe
      ) : []
    }));
  };



  const exploreLocation = (biomeId: string): ExplorationResult => {
    const biome = Array.isArray(store.biomes) ? store.biomes.find(b => b.id === biomeId) : undefined;
    if (!biome) {
      return { success: false, foundIngredients: [], message: 'Локация не найдена', cost: 0 };
    }

    if (!canAfford(biome.explorationCost)) {
      return {
        success: false,
        foundIngredients: [],
        message: 'Недостаточно золота для исследования',
        cost: 0
      };
    }

    const foundIngredients: { ingredient: Ingredient; quantity: number }[] = [];
    let totalCost = biome.explorationCost;

    // Проверяем каждый ингредиент на шанс находки
    for (const available of biome.availableIngredients) {
      const roll = Math.random() * 100;
      if (roll <= available.chance) {
        const ingredient = Array.isArray(store.ingredients) ? store.ingredients.find(i => i.id === available.ingredientId) : undefined;
        if (ingredient) {
          const quantity = Math.floor(Math.random() * (available.maxQuantity - available.minQuantity + 1)) + available.minQuantity;
          foundIngredients.push({ ingredient, quantity });
        }
      }
    }

    // Обновляем store
    if (foundIngredients.length > 0) {
      spendGold(totalCost);

      setStore(prev => ({
        ...prev,
        ingredients: Array.isArray(prev.ingredients) ? prev.ingredients.map(ing => {
          const found = foundIngredients.find(f => f.ingredient.id === ing.id);
          return found ? { ...ing, quantity: ing.quantity + found.quantity } : ing;
        }) : []
      }));

      const ingredientNames = foundIngredients.map(f => `${f.ingredient.name} (×${f.quantity})`).join(', ');
      return {
        success: true,
        foundIngredients,
        message: `Найдено: ${ingredientNames}`,
        cost: totalCost
      };
    } else {
      setStore(prev => ({
        ...prev,
        playerGold: prev.playerGold - totalCost,
        stats: {
          ...prev.stats,
          goldSpent: prev.stats.goldSpent + totalCost
        }
      }));

      return {
        success: false,
        foundIngredients: [],
        message: 'Ничего не найдено. Попробуйте еще раз!',
        cost: totalCost
      };
    }
  };

  const buyIngredient = (ingredientId: string, quantity: number): { success: boolean; message: string } => {
    if (!Array.isArray(store.ingredients)) {
      return { success: false, message: 'Ошибка загрузки данных ингредиентов' };
    }

    const ingredient = store.ingredients.find(i => i.id === ingredientId);
    if (!ingredient) {
      return { success: false, message: 'Ингредиент не найден' };
    }

    const totalCost = ingredient.cost * quantity;
    if (!canAfford(totalCost)) {
      return { success: false, message: 'Недостаточно золота' };
    }

    spendGold(totalCost);

    setStore(prev => ({
      ...prev,
      ingredients: Array.isArray(prev.ingredients) ? prev.ingredients.map(ing =>
        ing.id === ingredientId
          ? { ...ing, quantity: ing.quantity + quantity }
          : ing
      ) : []
    }));

    return { success: true, message: `Куплено: ${ingredient.name} (×${quantity}) за ${totalCost} зм` };
  };

  const sellIngredient = (ingredientId: string, quantity: number): { success: boolean; message: string } => {
    if (!Array.isArray(store.ingredients)) {
      return { success: false, message: 'Ошибка загрузки данных ингредиентов' };
    }

    const ingredient = store.ingredients.find(i => i.id === ingredientId);
    if (!ingredient) {
      return { success: false, message: 'Ингредиент не найден' };
    }

    if (ingredient.quantity < quantity) {
      return { success: false, message: 'Недостаточно ингредиентов' };
    }

    const sellPrice = Math.floor(ingredient.cost * 0.5); // Продаем за половину цены
    const totalEarnings = sellPrice * quantity;

    earnGold(totalEarnings);

    setStore(prev => ({
      ...prev,
      ingredients: Array.isArray(prev.ingredients) ? prev.ingredients.map(ing =>
        ing.id === ingredientId
          ? { ...ing, quantity: ing.quantity - quantity }
          : ing
      ) : []
    }));

    return { success: true, message: `Продано: ${ingredient.name} (×${quantity}) за ${totalEarnings} зм` };
  };

  const brewPotion = (recipeId: string): { success: boolean; message: string; potionCreated?: Potion } => {
    if (!Array.isArray(store.recipes)) {
      return { success: false, message: 'Ошибка загрузки данных рецептов' };
    }
    if (!Array.isArray(store.ingredients)) {
      return { success: false, message: 'Ошибка загрузки данных ингредиентов' };
    }

    const recipe = store.recipes.find(r => r.id === recipeId);
    if (!recipe) return { success: false, message: 'Рецепт не найден' };

    // Проверяем что все компоненты имеют выбранные ингредиенты
    for (const component of recipe.components || []) {
      if (!component.selectedIngredientId) {
        return { success: false, message: `Не выбран ингредиент для компонента: ${component.name}` };
      }

      const ingredient = store.ingredients.find(i => i.id === component.selectedIngredientId);
      if (!ingredient || ingredient.quantity < component.quantity) {
        return { success: false, message: `Недостаточно ингредиента: ${ingredient?.name || 'неизвестно'}` };
      }
    }

    // Получаем детали редкости по D&D 5e
    const rarityDetails = getRarityDetails(recipe.rarity);

    // Симулируем успех/неудачу с новой системой D&D 5e
    const activeEquipment = Array.isArray(store.character.equipment) ? store.character.equipment.find(eq => eq.id === store.character.activeEquipmentId) : null;
    const equipmentBonus = activeEquipment ? activeEquipment.brewingBonus : 0;
    const proficiencyBonus = store.character.alchemyToolsProficiency ? store.character.proficiencyBonus : 0;
    const totalBonus = equipmentBonus + proficiencyBonus;

    // Новая механика: бросок к20 + бонусы против сложности (спасброска)
    const d20Roll = Math.floor(Math.random() * 20) + 1;
    const totalRoll = d20Roll + totalBonus;
    const difficulty = rarityDetails.savingThrow;
    const success = totalRoll >= difficulty;

    // Определяем качество варки на основе превышения сложности
    let quality: 'poor' | 'standard' | 'excellent' = 'standard';
    if (success) {
      const excess = totalRoll - difficulty;
      if (excess >= 10) quality = 'excellent';
      else if (excess < 0) quality = 'poor'; // Не должно случиться при успехе, но на всякий случай
    } else {
      quality = 'poor';
    }

    // Проверяем критические результаты (независимо от успеха/провала)
    const isCriticalFailure = d20Roll === 1;
    const isCriticalSuccess = d20Roll === 20;

    let criticalResult: any = null;
    let modifiedRarity = recipe.rarity;
    let additionalEffects: NonNullable<Potion['additionalEffects']> = {};
    let extraPotion = false;
    let ingredientsRefunded = false;

    // Критические результаты срабатывают всегда, независимо от общего успеха
    if (isCriticalFailure) {
      criticalResult = handleCriticalFailure(recipe.rarity);
      modifiedRarity = criticalResult.modifiedRarity || recipe.rarity;
      additionalEffects = criticalResult.additionalEffects;
    } else if (isCriticalSuccess) {
      criticalResult = handleCriticalSuccess(recipe.rarity);
      additionalEffects = criticalResult.additionalEffects;
      extraPotion = criticalResult.extraPotion || false;
      ingredientsRefunded = criticalResult.ingredientsRefunded || false;
    }

    const ingredientsUsed = recipe.components?.reduce((sum, comp) => sum + comp.quantity, 0) || 0;

    // Зелье создается при успехе ИЛИ при критическом результате (даже при провале)
    if (success || isCriticalFailure || isCriticalSuccess) {
      // Удаляем ингредиенты (если они не возвращаются при критическом успехе)
      // При критическом провале ингредиенты тратятся всегда
      const newIngredients = Array.isArray(store.ingredients) ? store.ingredients.map(ingredient => {
        const component = recipe.components?.find(c => c.selectedIngredientId === ingredient.id);
        if (component && (!ingredientsRefunded || isCriticalFailure)) {
          return { ...ingredient, quantity: ingredient.quantity - component.quantity };
        }
        return ingredient;
      }) : [];

      // Рассчитываем фактическую длительность
      const actualDuration = calculatePotionDuration(modifiedRarity, recipe.durationOverride);

      // Создаем новое зелье с результатами варки
      const newPotion: Potion = {
        id: Date.now().toString(),
        name: recipe.name,
        description: recipe.description,
        effect: recipe.effect,
        quantity: 1,
        recipeId: recipe.id,
        rarity: modifiedRarity,
        potionType: recipe.potionType,
        potionQuality: recipe.potionQuality,
        tags: recipe.tags,
        actualDuration,
        brewedQuality: quality,
        additionalEffects: Object.keys(additionalEffects).length > 0 ? additionalEffects : undefined,
        rollResults: {
          mainRoll: d20Roll,
          bonus: totalBonus,
          naturalRoll: d20Roll,
          fumbleRoll: isCriticalFailure ? criticalResult?.rollResult : undefined,
          excellenceRoll: isCriticalSuccess ? criticalResult?.rollResult : undefined
        }
      };

      // Проверяем возможность стакания: зелья стакаются только если у них одинаковые:
      // - recipeId, rarity, potionType, name, effect и НЕТ дополнительных эффектов
      const canStack = !newPotion.additionalEffects;
      let updatedPotions;
      let createdPotion: Potion;

      if (canStack && Array.isArray(store.potions)) {
        const existingPotionIndex = store.potions.findIndex(p =>
          p.recipeId === recipe.id &&
          p.rarity === modifiedRarity &&
          p.potionType === recipe.potionType &&
          p.potionQuality === recipe.potionQuality &&
          p.name === recipe.name &&
          p.effect === recipe.effect &&
          !p.additionalEffects
        );

        if (existingPotionIndex >= 0) {
          // Увеличиваем количество существующего зелья
          updatedPotions = store.potions.map((potion, index) =>
            index === existingPotionIndex
              ? { ...potion, quantity: potion.quantity + 1 }
              : potion
          );
          createdPotion = updatedPotions[existingPotionIndex];
        } else {
          // Добавляем новое зелье
          updatedPotions = Array.isArray(store.potions) ? [...store.potions, newPotion] : [newPotion];
          createdPotion = newPotion;
        }
      } else {
        // Зелья с дополнительными эффектами не стакаются
        updatedPotions = Array.isArray(store.potions) ? [...store.potions, newPotion] : [newPotion];
        createdPotion = newPotion;
      }

      // Если есть дополнительное зелье от критического успеха
      if (extraPotion) {
        const extraPotionData: Potion = {
          ...newPotion,
          id: (Date.now() + 1).toString(),
          additionalEffects: { positive: ['Бонусное ��елье от критического успеха'] }
        };
        updatedPotions = [...updatedPotions, extraPotionData];
      }

      setStore(prev => ({
        ...prev,
        ingredients: newIngredients,
        potions: updatedPotions,
        recipes: Array.isArray(prev.recipes) ? prev.recipes.map(r =>
          r.id === recipeId
            ? {
                ...r,
                components: r.components?.map(component => ({
                  ...component,
                  selectedIngredientId: undefined // Сбрасываем выборы
                })) || []
              }
            : r
        ) : [],
        stats: {
          ...prev.stats,
          totalBrews: prev.stats.totalBrews + 1,
          successfulBrews: prev.stats.successfulBrews + 1,
          potionsCreated: prev.stats.potionsCreated + 1,
          ingredientsUsed: prev.stats.ingredientsUsed + ingredientsUsed
        }
      }));

      const qualityText = quality === 'excellent' ? ' превосходного качества' : quality === 'poor' ? ' низкого качества' : '';
      const rollInfo = `(к20: ${d20Roll} + ${totalBonus} = ${totalRoll} против СЛ ${difficulty})`;

      let message = `${recipe.name}${qualityText} успешно создано! ${rollInfo}\nДлительность: ${actualDuration}`;

      // Доб��вляем информацию о критических результатах
      if (criticalResult) {
        if (isCriticalFailure) {
          message += `\n🎲 КРИТИЧЕСКИЙ ПРОВАЛ! (к100: ${criticalResult.rollResult})\n${criticalResult.effectDescription}`;
        } else if (isCriticalSuccess) {
          message += `\n✨ КРИТИЧЕСКИЙ УСПЕХ! (к100: ${criticalResult.rollResult})\n${criticalResult.effectDescription}`;
        }
      }

      if (extraPotion) {
        message += '\n🎁 Создано дополнительное зелье!';
      }

      if (ingredientsRefunded) {
        message += '\n💰 Ингредиенты возвращены!';
      }

      // Корректируем сообщение для критических провалов
      if (isCriticalFailure && !success) {
        message = message.replace('успешно создано!', 'создано с осложнениями!');
      }

      return {
        success: true,
        message,
        potionCreated: createdPotion
      };
    } else {
      // При неудаче половина ингредиентов тратится
      const newIngredients = store.ingredients.map(ingredient => {
        const component = recipe.components?.find(c => c.selectedIngredientId === ingredient.id);
        if (component) {
          return { ...ingredient, quantity: ingredient.quantity - Math.ceil(component.quantity / 2) };
        }
        return ingredient;
      });

      setStore(prev => ({
        ...prev,
        ingredients: newIngredients,
        recipes: prev.recipes.map(r =>
          r.id === recipeId
            ? {
                ...r,
                components: r.components?.map(component => ({
                  ...component,
                  selectedIngredientId: undefined // Сбрасываем выборы даже при неудаче
                })) || []
              }
            : r
        ),
        stats: {
          ...prev.stats,
          totalBrews: prev.stats.totalBrews + 1,
          failedBrews: prev.stats.failedBrews + 1,
          ingredientsUsed: prev.stats.ingredientsUsed + Math.ceil(ingredientsUsed / 2)
        }
      }));

      const rollInfo = `(к20: ${d20Roll} + ${totalBonus} = ${totalRoll} против СЛ ${difficulty})`;
      return {
        success: false,
        message: `Неудача при варке ${recipe.name}. ${rollInfo}\nЧасть ингредиентов потеряна при неудачной попытке.`
      };
    }
  };

  const updateFilters = (filters: Partial<typeof store.activeFilters>) => {
    setStore(prev => ({
      ...prev,
      activeFilters: { ...prev.activeFilters, ...filters }
    }));
  };

  const getFilteredIngredients = () => {
    let filtered = Array.isArray(store.ingredients) ? store.ingredients : [];

    if (store.activeFilters.search) {
      filtered = filtered.filter(ing =>
        ing.name.toLowerCase().includes(store.activeFilters.search.toLowerCase()) ||
        ing.description.toLowerCase().includes(store.activeFilters.search.toLowerCase())
      );
    }

    if (store.activeFilters.ingredientTypes.length > 0) {
      filtered = filtered.filter(ing =>
        store.activeFilters.ingredientTypes.includes(ing.type)
      );
    }

    if (store.activeFilters.rarities.length > 0) {
      filtered = filtered.filter(ing =>
        store.activeFilters.rarities.includes(ing.rarity)
      );
    }

    if (store.activeFilters.tags.length > 0) {
      filtered = filtered.filter(ing =>
        store.activeFilters.tags.some(tag => ing.tags.includes(tag))
      );
    }

    if (store.activeFilters.availableForRecipes.length > 0) {
      const recipesInLab = Array.isArray(store.recipes) ? store.recipes.filter(r =>
        store.activeFilters.availableForRecipes.includes(r.id)
      ) : [];
      const neededIngredients = recipesInLab.flatMap(r =>
        r.components?.flatMap(c =>
          Array.isArray(store.ingredients) ? store.ingredients
            .filter(ing => isIngredientCompatibleWithComponent(ing, c))
            .map(ing => ing.id) : []
        ) || []
      );
      filtered = filtered.filter(ing => neededIngredients.includes(ing.id));
    }

    return filtered;
  };

  const getFilteredPotions = () => {
    let filtered = Array.isArray(store.potions) ? store.potions : [];

    if (store.activeFilters.search) {
      filtered = filtered.filter(potion =>
        potion.name.toLowerCase().includes(store.activeFilters.search.toLowerCase()) ||
        potion.description.toLowerCase().includes(store.activeFilters.search.toLowerCase())
      );
    }

    if (store.activeFilters.rarities.length > 0) {
      filtered = filtered.filter(potion =>
        store.activeFilters.rarities.includes(potion.rarity)
      );
    }

    if (store.activeFilters.potionTypes.length > 0) {
      filtered = filtered.filter(potion =>
        store.activeFilters.potionTypes.some(tag => potion.tags.includes(tag))
      );
    }

    return filtered;
  };

  const buyEquipment = (equipmentId: string): { success: boolean; message: string } => {
    const equipment = store.availableEquipment.find(e => e.id === equipmentId);
    if (!equipment) {
      return { success: false, message: 'Оборудование не найдено' };
    }

    if (!canAfford(equipment.cost)) {
      return { success: false, message: 'Недостаточно золота' };
    }

    // Проверяем, есть ли уже такое оборудование
    if (store.character.equipment.some(e => e.id === equipmentId)) {
      return { success: false, message: 'У вас уже есть это оборудование' };
    }

    const newEquipment = [...store.character.equipment, equipment];

    spendGold(equipment.cost);

    setStore(prev => ({
      ...prev,
      character: {
        ...prev.character,
        equipment: newEquipment
      }
    }));

    return { success: true, message: `Куплено: ${equipment.name} за ${equipment.cost} зм` };
  };

  const updateCharacterName = (name: string) => {
    setStore(prev => ({
      ...prev,
      character: { ...prev.character, name }
    }));
  };

  const updateCharacterLevel = (level: number) => {
    const proficiencyBonus = Math.ceil(level / 4) + 1;
    setStore(prev => ({
      ...prev,
      character: { ...prev.character, level, proficiencyBonus }
    }));
  };

  const setActiveEquipment = (equipmentId: string) => {
    setStore(prev => ({
      ...prev,
      character: { ...prev.character, activeEquipmentId: equipmentId }
    }));
  };

  const updateAlchemyToolsProficiency = (hasProficiency: boolean) => {
    setStore(prev => ({
      ...prev,
      character: { ...prev.character, alchemyToolsProficiency: hasProficiency }
    }));
  };

  const updateCharacterStats = (stats: Partial<{ strength: number; dexterity: number; constitution: number; intelligence: number; wisdom: number; charisma: number }>) => {
    setStore(prev => ({
      ...prev,
      character: { ...prev.character, baseStats: { ...prev.character.baseStats, ...stats } }
    }));
  };

  const updateCurrency = (currency: Partial<Currency>) => {
    setStore(prev => ({
      ...prev,
      currency: { ...prev.currency, ...currency }
    }));
  };

  const getTotalGold = (): number => {
    return convertToGold(store.currency);
  };

  const canAfford = (goldCost: number): boolean => {
    return getTotalGold() >= goldCost;
  };

  const spendGold = (goldAmount: number): boolean => {
    if (!canAfford(goldAmount)) return false;

    const currentTotal = getTotalGold();
    const remaining = currentTotal - goldAmount;
    const newCurrency = convertFromGold(remaining);

    setStore(prev => ({
      ...prev,
      currency: newCurrency,
      stats: {
        ...prev.stats,
        goldSpent: prev.stats.goldSpent + goldAmount
      }
    }));

    return true;
  };

  const earnGold = (goldAmount: number) => {
    const currentTotal = getTotalGold();
    const newTotal = currentTotal + goldAmount;
    const newCurrency = convertFromGold(newTotal);

    setStore(prev => ({
      ...prev,
      currency: newCurrency,
      stats: {
        ...prev.stats,
        goldEarned: prev.stats.goldEarned + goldAmount
      }
    }));
  };

  // Функция для проверки совместимости ингредиента с компонентом рецепта
  const isIngredientCompatibleWithComponent = (ingredient: Ingredient, component: RecipeComponent): boolean => {
    // Проверяем наличие всех требуемых элементов
    if (component.requiredElements && component.requiredElements.length > 0) {
      const hasAllElements = component.requiredElements.every(requiredElement =>
        ingredient.elements && ingredient.elements.includes(requiredElement)
      );
      if (!hasAllElements) return false;
    }

    // Проверяем категории (если указаны)
    if (component.categories && component.categories.length > 0) {
      if (!component.categories.includes(ingredient.category)) return false;
    }

    // Проверяем старые типы для совместимости (если указаны)
    if (component.types && component.types.length > 0) {
      if (!component.types.includes(ingredient.type as any)) return false;
    }

    return true;
  };

  // Функция для выбора ингредиента для компонента рецепта
  const selectIngredientForComponent = (recipeId: string, componentId: string, ingredientId: string) => {
    setStore(prev => ({
      ...prev,
      recipes: Array.isArray(prev.recipes) ? prev.recipes.map(recipe =>
        recipe.id === recipeId
          ? {
              ...recipe,
              components: recipe.components?.map(component =>
                component.id === componentId
                  ? { ...component, selectedIngredientId: ingredientId }
                  : component
              ) || []
            }
          : recipe
      ) : []
    }));
  };

  // Функция для очистки недействительных выборов ингредиентов
  const clearInvalidSelections = () => {
    setStore(prev => ({
      ...prev,
      recipes: Array.isArray(prev.recipes) ? prev.recipes.map(recipe => ({
        ...recipe,
        components: recipe.components?.map(component => {
          if (component.selectedIngredientId) {
            const ingredient = Array.isArray(prev.ingredients)
              ? prev.ingredients.find(ing => ing.id === component.selectedIngredientId)
              : undefined;

            if (!ingredient || !isIngredientCompatibleWithComponent(ingredient, component)) {
              return { ...component, selectedIngredientId: undefined };
            }
          }
          return component;
        }) || []
      })) : []
    }));
  };

  // Функция для очистки зелий с нулевым количеством
  const cleanupPotions = () => {
    setStore(prev => ({
      ...prev,
      potions: Array.isArray(prev.potions) ? prev.potions.filter(potion => potion.quantity > 0) : []
    }));
  };

  // Функция для миграции старых ингредиентов к новой структуре
  const migrateIngredient = migrateIngredientLocal;

  const loadData = async (data: {
    ingredients?: Ingredient[];
    recipes?: Recipe[];
    biomes?: Biome[];
    equipment?: Equipment[];
  }) => {
    setStore(prev => ({
      ...prev,
      ...(data.ingredients && Array.isArray(data.ingredients) && {
        ingredients: data.ingredients.map(migrateIngredient)
      }),
      ...(data.recipes && Array.isArray(data.recipes) && { recipes: data.recipes }),
      ...(data.biomes && Array.isArray(data.biomes) && { biomes: data.biomes }),
      ...(data.equipment && Array.isArray(data.equipment) && { availableEquipment: data.equipment })
    }));
  };

  const initializeDefaultData = async () => {
    try {
      const { loadAllData } = await import('../utils/dataLoader');
      const data = await loadAllData();
      console.log('Loaded data:', data);

      if (data) {
        // Принудительно загружаем данные из JSON файлов
        setStore(prev => ({
          ...prev,
          ingredients: data.ingredients && Array.isArray(data.ingredients) ? data.ingredients.map(migrateIngredient) : defaultIngredients,
          recipes: data.recipes && Array.isArray(data.recipes) ? data.recipes : defaultRecipes,
          biomes: data.biomes && Array.isArray(data.biomes) ? data.biomes : defaultBiomes,
          availableEquipment: data.equipment && Array.isArray(data.equipment) ? data.equipment : defaultEquipment
        }));
      } else {
        // Если данные не загрузились, используем значения по умолчанию
        setStore(prev => ({
          ...prev,
          ingredients: defaultIngredients,
          recipes: defaultRecipes,
          biomes: defaultBiomes,
          availableEquipment: defaultEquipment
        }));
      }
    } catch (error) {
      console.error('Error initializing default data:', error);
      // В случае ошибки используем значения по умолчанию
      setStore(prev => ({
        ...prev,
        ingredients: defaultIngredients,
        recipes: defaultRecipes,
        biomes: defaultBiomes,
        availableEquipment: defaultEquipment
      }));
    } finally {
      // Всегда устанавливаем isInitialized в true
      setIsInitialized(true);
    }
  };

  // Функция для принудительного обновления данных из JSON файлов
  const forceUpdateData = async () => {
    try {
      const { loadAllData } = await import('../utils/dataLoader');
      const data = await loadAllData();
      console.log('Force updating data:', data);

      if (data) {
        setStore(prev => ({
          ...prev,
          ingredients: data.ingredients && Array.isArray(data.ingredients) ? data.ingredients.map(migrateIngredient) : defaultIngredients,
          recipes: data.recipes && Array.isArray(data.recipes) ? data.recipes : defaultRecipes,
          biomes: data.biomes && Array.isArray(data.biomes) ? data.biomes : defaultBiomes,
          availableEquipment: data.equipment && Array.isArray(data.equipment) ? data.equipment : defaultEquipment
        }));
      }
    } catch (error) {
      console.error('Error force updating data:', error);
    }
  };

  // Упрощенная инициализация данных при первом запуске
  useEffect(() => {
    if (!isInitialized) {
      console.log('Initializing store...', { hasExistingData: !!hasExistingData });

      // Таймаут безопасности - гарантирует что app никогда не зависнет
      const safetyTimeout = setTimeout(() => {
        if (!isInitialized) {
          console.warn('Safety timeout triggered - forcing initialization');
          setIsInitialized(true);
        }
      }, 3000);

      if (!hasExistingData) {
        console.log('No existing data, loading defaults...');
        // Асинхронно загружаем данные по умолчанию
        initializeDefaultData().catch((error) => {
          console.error('Failed to load default data:', error);
          // В случае ошибки все равно инициализируем
          setIsInitialized(true);
        }).finally(() => {
          clearTimeout(safetyTimeout);
        });
      } else {
        console.log('Found existing data, setting initialized...');
        setIsInitialized(true);
        clearTimeout(safetyTimeout);
      }

      return () => clearTimeout(safetyTimeout);
    }
  }, []);

  // Автосохранение в localStorage при изменении store
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('alchemy-store', JSON.stringify(store));
    }
  }, [store, isInitialized]);

  const addCustomIngredient = (ingredient: Omit<Ingredient, 'id'>) => {
    // Обеспечиваем совместимость со старыми ингредиентами
    const processedIngredient = {
      ...ingredient,
      // Если нет category, определяем по старому type
      category: ingredient.category || (ingredient.type === 'herb' ? 'plant' :
                ingredient.type === 'mineral' ? 'mineral' :
                ingredient.type === 'creature' ? 'creature' : 'other') as IngredientCategory,
      // Если нет elements, создаем пустой массив или определяем по тегам
      elements: ingredient.elements || [],
      // Убеждаемся что tags это массив
      tags: Array.isArray(ingredient.tags) ? ingredient.tags : [],
      // Убеждаемся что locations это массив
      locations: Array.isArray(ingredient.locations) ? ingredient.locations : []
    };

    const newIngredient: Ingredient = {
      ...processedIngredient,
      id: `custom_${Date.now()}`
    };

    setStore(prev => ({
      ...prev,
      ingredients: [...(Array.isArray(prev.ingredients) ? prev.ingredients : []), newIngredient]
    }));

    return newIngredient.id;
  };

  const addCustomRecipe = (recipe: Omit<Recipe, 'id'>) => {
    const newRecipe: Recipe = {
      ...recipe,
      id: `custom_${Date.now()}`,
      difficulty: 5, // Значение по умолчанию для совместимости
      baseSuccessChance: 50, // Значение по умолчанию для совместимости
      brewingTime: '1 час' // Значение по умолчанию для совместимости
    };

    setStore(prev => ({
      ...prev,
      recipes: [...(Array.isArray(prev.recipes) ? prev.recipes : []), newRecipe]
    }));

    return newRecipe.id;
  };

  const removeCustomItem = (type: 'ingredient' | 'recipe', id: string) => {
    if (!id.startsWith('custom_')) {
      return false; // Можно удалять только пользовательские элементы
    }

    setStore(prev => {
      if (type === 'ingredient') {
        return {
          ...prev,
          ingredients: Array.isArray(prev.ingredients) ? prev.ingredients.filter(ing => ing.id !== id) : []
        };
      } else {
        return {
          ...prev,
          recipes: Array.isArray(prev.recipes) ? prev.recipes.filter(rec => rec.id !== id) : []
        };
      }
    });

    return true;
  };

  return {
    ...store,
    addIngredient,
    updateIngredientQuantity,
    updatePotionQuantity,
    togglePotionFavorite,
    addRecipeToLaboratory,
    removeRecipeFromLaboratory,
    brewPotion,
    updateFilters,
    getFilteredIngredients,
    getFilteredPotions,
    selectIngredientForComponent,
    clearInvalidSelections,
    cleanupPotions,
    exploreLocation,
    buyIngredient,
    sellIngredient,
    buyEquipment,
    updateCharacterName,
    updateCharacterLevel,
    setActiveEquipment,
    updateAlchemyToolsProficiency,
    updateCharacterStats,
    updateCurrency,
    getTotalGold,
    canAfford,
    spendGold,
    earnGold,
    loadData,
    addCustomIngredient,
    addCustomRecipe,
    removeCustomItem,
    initializeDefaultData,
    forceUpdateData,
    isIngredientCompatibleWithComponent,
    isInitialized
  };
}