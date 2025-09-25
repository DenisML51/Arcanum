// hooks/types.ts

// Основные категории ингредиентов по D&D правилам
export type IngredientCategory = 'poition' | 'mineral' | 'creature' | 'other';

// Элементы для алхимии согласно таблице D&D
export type AlchemicalElement =
  // Сущность
  | 'time' | 'matter' | 'stasis' | 'space' | 'decay' | 'mind' | 'chaos' | 'energy' | 'sound' | 'radiance' | 'acid' | 'necrotic' | 'fire' | 'foam'
  // Шкала
  | 'embodiment' | 'challenge' | 'illusion' | 'necromancy' | 'reflection' | 'enchantment' | 'transmutation' | 'divination' | 'psychic' | 'force' | 'physical' | 'cold' | 'electricity' | 'poison'
  // Вид существа
  | 'aberration' | 'giant' | 'humanoid' | 'dragon' | 'beast' | 'healing' | 'construct' | 'monster' | 'celestial' | 'undead' | 'plant' | 'slime' | 'fey' | 'elemental'
  // Дополнительные
  | 'protection';

const ALCHEMICAL_ELEMENT_DETAILS: Record<AlchemicalElement, { name: string; shortCode: string; category: string; color: string; }> = {
  // Сущность
  'time': { name: 'Время', shortCode: 'В', category: 'Сущность', color: 'bg-indigo-500' },
  'matter': { name: 'Материя', shortCode: 'М', category: 'Сущность', color: 'bg-indigo-500' },
  'stasis': { name: 'Остановка', shortCode: 'О', category: 'Сущность', color: 'bg-indigo-500' },
  'space': { name: 'Пространство', shortCode: 'П', category: 'Сущность', color: 'bg-indigo-500' },
  'decay': { name: 'Разложение', shortCode: 'Рл', category: 'Сущность', color: 'bg-indigo-500' },
  'mind': { name: 'Разум', shortCode: 'Рм', category: 'Сущность', color: 'bg-indigo-500' },
  'chaos': { name: 'Хаос', shortCode: 'Х', category: 'Сущность', color: 'bg-indigo-500' },
  'energy': { name: 'Энергия', shortCode: 'Э', category: 'Сущность', color: 'bg-indigo-500' },

  // Школа
  'embodiment': { name: 'Воплощение', shortCode: 'Вопл', category: 'Школа', color: 'bg-sky-500' },
  'challenge': { name: 'Вызов', shortCode: 'Выз', category: 'Школа', color: 'bg-sky-500' },
  'illusion': { name: 'Иллюзия', shortCode: 'Илл', category: 'Школа', color: 'bg-sky-500' },
  'necromancy': { name: 'Некромантия', shortCode: 'Некя', category: 'Школа', color: 'bg-sky-500' },
  'reflection': { name: 'Ограждение', shortCode: 'Огр', category: 'Школа', color: 'bg-sky-500' }, // Отражение -> Ограждение
  'enchantment': { name: 'Очарование', shortCode: 'Очар', category: 'Школа', color: 'bg-sky-500' },
  'transmutation': { name: 'Преобразование', shortCode: 'Прео', category: 'Школа', color: 'bg-sky-500' },
  'divination': { name: 'Прорицание', shortCode: 'Прор', category: 'Школа', color: 'bg-sky-500' },

  // Стихия
  'sound': { name: 'Звук', shortCode: 'Зв', category: 'Стихия', color: 'bg-amber-500' },
  'radiance': { name: 'Излучение', shortCode: 'Изл', category: 'Стихия', color: 'bg-amber-500' },
  'acid': { name: 'Кислота', shortCode: 'Кис', category: 'Стихия', color: 'bg-amber-500' },
  'necrotic': { name: 'Некротический', shortCode: 'Нки', category: 'Стихия', color: 'bg-amber-500' },
  'fire': { name: 'Огонь', shortCode: 'Огн', category: 'Стихия', color: 'bg-amber-500' },
  'foam': { name: 'Пенный', shortCode: 'Пен', category: 'Стихия', color: 'bg-amber-500' },
  'psychic': { name: 'Психический', shortCode: 'Пси', category: 'Стихия', color: 'bg-amber-500' },
  'force': { name: 'Силовое поле', shortCode: 'СП', category: 'Стихия', color: 'bg-amber-500' },
  'physical': { name: 'Физический', shortCode: 'Физ', category: 'Стихия', color: 'bg-amber-500' },
  'cold': { name: 'Холод', shortCode: 'Хол', category: 'Стихия', color: 'bg-amber-500' },
  'electricity': { name: 'Электрический', shortCode: 'Элк', category: 'Стихия', color: 'bg-amber-500' },
  'poison': { name: 'Яд', shortCode: 'Яд', category: 'Стихия', color: 'bg-amber-500' },

  // Вид существа
  'aberration': { name: 'Аберрация', shortCode: 'Аб', category: 'Вид', color: 'bg-emerald-500' },
  'giant': { name: 'Великан', shortCode: 'Вел', category: 'Вид', color: 'bg-emerald-500' },
  'humanoid': { name: 'Гуманоид', shortCode: 'Гум', category: 'Вид', color: 'bg-emerald-500' },
  'dragon': { name: 'Дракон', shortCode: 'Дрк', category: 'Вид', color: 'bg-emerald-500' },
  'beast': { name: 'Зверь', shortCode: 'Звр', category: 'Вид', color: 'bg-emerald-500' },
  'construct': { name: 'Конструкт', shortCode: 'Кон', category: 'Вид', color: 'bg-emerald-500' },
  'monster': { name: 'Монстр', shortCode: 'Мон', category: 'Вид', color: 'bg-emerald-500' },
  'celestial': { name: 'Небожитель', shortCode: 'Неб', category: 'Вид', color: 'bg-emerald-500' },
  'undead': { name: 'Нежить', shortCode: 'Неж', category: 'Вид', color: 'bg-emerald-500' },
  'plant': { name: 'Растение', shortCode: 'Рас', category: 'Вид', color: 'bg-emerald-500' },
  'slime': { name: 'Слизь', shortCode: 'Сли', category: 'Вид', color: 'bg-emerald-500' },
  'fey': { name: 'Фея', shortCode: 'Фея', category: 'Вид', color: 'bg-emerald-500' },
  'elemental': { name: 'Элементаль', shortCode: 'Элм', category: 'Вид', color: 'bg-emerald-500' },

  // Дополнительные
  'healing': { name: 'Лечение', shortCode: 'Л', category: 'Эффект', color: 'bg-rose-500' },
  'protection': { name: 'Защита', shortCode: 'Зщ', category: 'Эффект', color: 'bg-rose-500' }
};

// Базы для зелий согласно таблице
export type PotionBase = 'spring_water' | 'enchanted_ink' | 'thick_magical_ink' | 'dissolved_ether' | 'irminsul_juice';

// Расширенный тип ингредиентов, включающий базы
export type IngredientType = IngredientCategory | PotionBase;

export type PotionRarity = 'common' | 'uncommon' | 'rare' | 'very rare' | 'legendary' | 'artifact';
export type PotionType = 'oil' | 'elixir' | 'potion';
export type PotionQuality = 'low' | 'common' | 'high';

export interface Ingredient {
  id: string;
  name: string;
  description: string;
  type: IngredientType;
  category: IngredientCategory;
  elements: AlchemicalElement[];
  impurity?: AlchemicalElement;
  rarity: 'common' | 'uncommon' | 'rare' | 'very rare' | 'legendary';
  tags: string[];
  cost: number;
  weight: number;
  locations: string[];
  quantity: number;
  isBase?: boolean;
  baseRarityModifier?: PotionRarity;
  shortCode?: string;
}

export interface RecipeComponent {
  id: string;
  name: string;
  description: string;
  requiredElements: AlchemicalElement[];
  categories?: IngredientCategory[];
  tags: string[];
  quantity: number;
  selectedIngredientId?: string;
  types?: IngredientType[];
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  effect: string;
  rarity: PotionRarity;
  potionType: PotionType;
  potionQuality: PotionQuality;
  components: RecipeComponent[];
  tags: string[];
  savingThrowType?: 'constitution' | 'wisdom' | 'charisma' | 'dexterity' | 'none';
  inLaboratory: boolean;
  cost: number;
}

export interface Potion {
  id: string;
  name: string;
  description: string;
  effect: string;
  rarity: PotionRarity;
  potionType: PotionType;
  potionQuality: PotionQuality;
  brewedQuality?: 'poor' | 'standard' | 'excellent';
  flawEffect?: string;
  excellenceEffect?: string;
  impurityEffect?: string;
  tags: string[];
  quantity: number;
  isFavorite?: boolean;
  recipeId?: string;
  dateCreated?: string;
  components: RecipeComponent[];
  rollResults?: {
    naturalRoll: number;
    bonus: number;
    mainRoll: number;
    fumbleRoll?: number;
    excellenceRoll?: number;
  };
}

export interface Equipment {
  id: string;
  name: string;
  description: string;
  brewingBonus: number;
  cost: number;
  weight: number;
  rarity: string;
}

export interface BiomeIngredient {
  id: string;
  chance: number;
  quantity: [number, number];
}

export interface Biome {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  cost: number;
  commonIngredients: BiomeIngredient[];
  uncommonIngredients: BiomeIngredient[];
  rareIngredients: BiomeIngredient[];
  legendaryIngredients: BiomeIngredient[];
}

export interface Currency {
  copper: number;
  silver: number;
  gold: number;
  platinum: number;
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

export interface Character {
  name: string;
  level: number;
  alchemyToolsProficiency: boolean;
  activeEquipmentId: string;
  brewingMode: 'percentage' | 'ttrpg';
  baseStats: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
}

export interface Filters {
  ingredientTypes: string[];
  rarities: string[];
  tags: string[];
  search: string;
  availableForRecipes: string[];
  potionTypes: string[];
}

// Utility functions for potion types
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
    case 'standard': return 'bg-blue-600';
    case 'excellent': return 'bg-green-600';
  }
};

export const getRarityColor = (rarity: string): string => {
  switch (rarity) {
    case 'common': return 'bg-gray-500';
    case 'uncommon': return 'bg-green-500';
    case 'rare': return 'bg-blue-500';
    case 'very rare': return 'bg-purple-500';
    case 'legendary': return 'bg-orange-500';
    default: return 'bg-gray-500';
  }
};

export const getRarityName = (rarity: string): string => {
  switch (rarity) {
    case 'common': return 'Обычное';
    case 'uncommon': return 'Необычное';
    case 'rare': return 'Редкое';
    case 'very rare': return 'Очень редкое';
    case 'legendary': return 'Легендарное';
    default: return 'Неизвестное';
  }
};

export const getRarityDetails = (rarity: string): { savingThrow: number; brewingTimeText: string; rarityModifier: number } => {
  switch (rarity) {
    case 'common': return { savingThrow: 10, brewingTimeText: '1 час', rarityModifier: 1 };
    case 'uncommon': return { savingThrow: 14, brewingTimeText: '2 часа', rarityModifier: 2 };
    case 'rare': return { savingThrow: 18, brewingTimeText: '4 часа', rarityModifier: 3 };
    case 'very rare': return { savingThrow: 22, brewingTimeText: '8 часов', rarityModifier: 4 };
    case 'legendary': return { savingThrow: 26, brewingTimeText: '24 часа', rarityModifier: 5 };
    case 'artifact': return { savingThrow: 30, brewingTimeText: 'Особая', rarityModifier: 6 };
    default: return { savingThrow: 10, brewingTimeText: '1 час', rarityModifier: 1 };
  }
};

export const getIngredientCategoryName = (category: IngredientCategory): string => {
  switch (category) {
    case 'poition': return 'Яд';
    case 'mineral': return 'Минерал';
    case 'creature': return 'Существо';
    case 'other': return 'Иное';
    default: return 'Неизвестно';
  }
};

export const getIngredientCategoryColor = (category: IngredientCategory): string => {
  switch (category) {
    case 'poition': return 'bg-red-500';
    case 'mineral': return 'bg-gray-500';
    case 'creature': return 'bg-red-500';
    case 'other': return 'bg-purple-500';
    default: return 'bg-gray-500';
  }
};

export const getAlchemicalElementDetails = (element: AlchemicalElement) => {
  return ALCHEMICAL_ELEMENT_DETAILS[element] || { name: element, shortCode: '?', category: 'Неизвестно', color: 'bg-gray-400' };
};

export const getAlchemicalElementName = (element: AlchemicalElement): string => {
  return ALCHEMICAL_ELEMENT_DETAILS[element]?.name || element;
};

export const getAlchemicalElementShortCode = (element: AlchemicalElement): string => {
  return ALCHEMICAL_ELEMENT_DETAILS[element]?.shortCode || '?';
};

export const getPotionBaseName = (base: PotionBase): string => {
  switch (base) {
    case 'spring_water': return 'Родниковая вода';
    case 'enchanted_ink': return 'Волшебные чернила';
    case 'thick_magical_ink': return 'Густые волшебные чернила';
    case 'dissolved_ether': return 'Растворённый эфир';
    case 'irminsul_juice': return 'Сок Ирминсула';
    default: return base;
  }
};

export const getPotionBaseRarity = (base: PotionBase): string => {
  switch (base) {
    case 'spring_water': return 'common';
    case 'enchanted_ink': return 'uncommon';
    case 'thick_magical_ink': return 'rare';
    case 'dissolved_ether': return 'very rare';
    case 'irminsul_juice': return 'legendary';
    default: return 'common';
  }
};

export function convertToGold(currency: Currency): number {
  return currency.copper * 0.01 + currency.silver * 0.1 + currency.gold + currency.platinum * 10;
}

export function convertFromGold(gold: number): Currency {
  const platinum = Math.floor(gold / 10);
  const remainingAfterPlatinum = gold - platinum * 10;
  const goldCoins = Math.floor(remainingAfterPlatinum);
  const remainingAfterGold = remainingAfterPlatinum - goldCoins;
  const silver = Math.floor(remainingAfterGold * 10);
  const copper = Math.floor((remainingAfterGold * 10 - silver) * 10);
  
  return {
    copper,
    silver,
    gold: goldCoins,
    platinum
  };
}


export const getPotionBaseDetails = (base: PotionBase): { name: string; shortCode: string; color: string; } => {
  switch (base) {
    case 'spring_water': return { name: 'Родниковая вода', shortCode: 'РВ', color: 'bg-cyan-600' };
    case 'enchanted_ink': return { name: 'Волшебные чернила', shortCode: 'ВЧ', color: 'bg-cyan-600' };
    case 'thick_magical_ink': return { name: 'Густые волшебные чернила', shortCode: 'ГВЧ', color: 'bg-cyan-600' };
    case 'dissolved_ether': return { name: 'Растворённый эфир', shortCode: 'РЭ', color: 'bg-cyan-600' };
    case 'irminsul_juice': return { name: 'Сок Ирминсула', shortCode: 'СИ', color: 'bg-cyan-600' };
    default: return { name: base, shortCode: '?', color: 'bg-gray-400' };
  }
};