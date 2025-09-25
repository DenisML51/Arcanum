// hooks/types.ts

// Основные категории ингредиентов по D&D правилам
export type IngredientCategory = 'plant' | 'mineral' | 'creature' | 'other';

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
    case 'plant': return 'Растение';
    case 'mineral': return 'Минерал';
    case 'creature': return 'Существо';
    case 'other': return 'Иное';
    default: return 'Неизвестно';
  }
};

export const getIngredientCategoryColor = (category: IngredientCategory): string => {
  switch (category) {
    case 'plant': return 'bg-green-500';
    case 'mineral': return 'bg-gray-500';
    case 'creature': return 'bg-red-500';
    case 'other': return 'bg-purple-500';
    default: return 'bg-gray-500';
  }
};

export const getAlchemicalElementName = (element: AlchemicalElement): string => {
  const elementNames: Record<AlchemicalElement, string> = {
    // Сущность
    'time': 'Время',
    'matter': 'Материя',
    'stasis': 'Стазис',
    'space': 'Пространство',
    'decay': 'Распад',
    'mind': 'Разум',
    'chaos': 'Хаос',
    'energy': 'Энергия',
    'sound': 'Звук',
    'radiance': 'Сияние',
    'acid': 'Кислота',
    'necrotic': 'Некротика',
    'fire': 'Огонь',
    'foam': 'Пена',
    // Шкала
    'embodiment': 'Воплощение',
    'challenge': 'Вызов',
    'illusion': 'Иллюзия',
    'necromancy': 'Некромантия',
    'reflection': 'Отражение',
    'enchantment': 'Зачарование',
    'transmutation': 'Трансмутация',
    'divination': 'Прорицание',
    'psychic': 'Психика',
    'force': 'Сила',
    'physical': 'Физика',
    'cold': 'Холод',
    'electricity': 'Электричество',
    'poison': 'Яд',
    // Вид существа
    'aberration': 'Аберрация',
    'giant': 'Гигант',
    'humanoid': 'Гуманоид',
    'dragon': 'Дракон',
    'beast': 'Зверь',
    'healing': 'Лечение',
    'construct': 'Конструкт',
    'monster': 'Монстр',
    'celestial': 'Небесный',
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
    'time': 'В', 'matter': 'М', 'stasis': 'С', 'space': 'П', 'decay': 'Р', 'mind': 'Рз', 'chaos': 'Х', 'energy': 'Э',
    'sound': 'Зв', 'radiance': 'Си', 'acid': 'К', 'necrotic': 'Н', 'fire': 'О', 'foam': 'Пн',
    'embodiment': 'Вп', 'challenge': 'Вз', 'illusion': 'И', 'necromancy': 'Нк', 'reflection': 'От', 'enchantment': 'З',
    'transmutation': 'Т', 'divination': 'Пр', 'psychic': 'Пс', 'force': 'Сл', 'physical': 'Ф', 'cold': 'Хл',
    'electricity': 'Эл', 'poison': 'Яд', 'aberration': 'Аб', 'giant': 'Гг', 'humanoid': 'Гм', 'dragon': 'Др',
    'beast': 'Зв', 'healing': 'Лч', 'construct': 'Кн', 'monster': 'Мн', 'celestial': 'Нб', 'undead': 'Нж',
    'plant': 'Рс', 'slime': 'Сл', 'fey': 'Фе', 'elemental': 'Эл', 'protection': 'Зщ'
  };
  return shortCodes[element] || element.charAt(0).toUpperCase();
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

// Таблицы эффектов для зелий
export const POOR_QUALITY_EFFECTS = [
  "Зелье имеет неприятный запах и вкус",
  "Эффект длится в два раза меньше обычного",
  "При употреблении вызывает легкую тошноту",
  "Зелье имеет мутный цвет и осадок",
  "Эффект проявляется с задержкой в 1d4 раунда",
  "Зелье имеет горький привкус",
  "Эффект на 25% слабее обычного",
  "Зелье пенится при встряхивании",
  "При употреблении вызывает головокружение",
  "Зелье имеет странный металлический привкус"
];

export const EXCELLENT_QUALITY_EFFECTS = [
  "Эффект длится в два раза дольше обычного",
  "Зелье имеет приятный аромат и вкус",
  "Эффект на 50% сильнее обычного",
  "Зелье светится мягким светом",
  "Эффект проявляется мгновенно",
  "Зелье имеет кристально чистый вид",
  "При употреблении дает чувство бодрости",
  "Зелье имеет сладкий медовый вкус",
  "Эффект распространяется на союзников в радиусе 10 футов",
  "Зелье имеет золотистый оттенок"
];

// Функция для получения случайного эффекта
export function getRandomEffect(effects: string[]): string {
  return effects[Math.floor(Math.random() * effects.length)];
}

// Функция для получения эффекта по качеству зелья
export function getQualityEffect(quality: 'poor' | 'standard' | 'excellent'): string | null {
  switch (quality) {
    case 'poor':
      return getRandomEffect(POOR_QUALITY_EFFECTS);
    case 'excellent':
      return getRandomEffect(EXCELLENT_QUALITY_EFFECTS);
    default:
      return null;
  }
}
