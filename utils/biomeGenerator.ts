// utils/biomeGenerator.ts

import type { Ingredient, Biome, BiomeIngredient } from '../hooks/types';

// Маппинг локаций на биомы
const LOCATION_TO_BIOME_MAP: Record<string, string> = {
  // Лесные локации
  'Лес': 'forest',
  'Зачарованные рощи': 'enchanted_forest',
  'Поселения фей': 'fey_settlement',
  
  // Горные локации
  'Горы': 'mountains',
  'Холмы': 'hills',
  
  // Водные локации
  'Побережье': 'coastline',
  'Под водой': 'underwater',
  'Вода': 'water_source',
  
  // Подземные локации
  'Подземье': 'underdark',
  'Древние руины': 'ancient_ruins',
  'Кладбища': 'cemetery',
  
  // Магические локации
  'Магическая академия': 'magic_academy',
  'Башня архимага': 'archmage_tower',
  'Алхимическая лаборатория': 'alchemy_lab',
  'Лавки алхимиков': 'alchemist_shop',
  'Лавки торговцев': 'merchant_shop',
  'Библиотеки': 'library',
  'Жилища ведьм': 'witch_hut',
  
  // Планарные локации
  'План Теней': 'shadow_plane',
  'Верхние планы': 'upper_planes',
  'Планарный разлом': 'planar_rift',
  'Астральная обсерватория': 'astral_observatory',
  
  // Другие локации
  'Луг': 'meadow',
  'Болото': 'swamp',
  'Пустыня': 'desert',
  'Арктика': 'arctic',
  'Орочьи поселения': 'orc_settlements',
  'Таверны': 'taverns',
  'Кобольды': 'kobold_territory',
  'Поселения друидов': 'druid_settlements',
  'Везде, кроме Пустыни и Под водой': 'common_areas',
  'Везде, кроме Под водой': 'common_areas'
};

// Конфигурация биомов
const BIOME_CONFIG: Record<string, {
  name: string;
  description: string;
  difficulty: string;
  baseCost: number;
  rarityModifiers: Record<string, number>;
}> = {
  forest: {
    name: 'Мистический лес',
    description: 'Древний лес, пропитанный магией и тайнами',
    difficulty: 'Средне',
    baseCost: 15,
    rarityModifiers: { common: 1.0, uncommon: 0.8, rare: 0.6, 'very rare': 0.4, legendary: 0.2 }
  },
  enchanted_forest: {
    name: 'Зачарованный лес',
    description: 'Лес, где деревья поют и светятся в темноте',
    difficulty: 'Сложно',
    baseCost: 25,
    rarityModifiers: { common: 0.8, uncommon: 1.0, rare: 0.8, 'very rare': 0.6, legendary: 0.4 }
  },
  fey_settlement: {
    name: 'Поселение фей',
    description: 'Магическое место, где живут феи и другие волшебные существа',
    difficulty: 'Сложно',
    baseCost: 30,
    rarityModifiers: { common: 0.6, uncommon: 1.0, rare: 1.0, 'very rare': 0.8, legendary: 0.6 }
  },
  mountains: {
    name: 'Горные вершины',
    description: 'Высокие горы с редкими минералами и кристаллами',
    difficulty: 'Средне',
    baseCost: 20,
    rarityModifiers: { common: 1.0, uncommon: 0.9, rare: 0.7, 'very rare': 0.5, legendary: 0.3 }
  },
  hills: {
    name: 'Зеленые холмы',
    description: 'Покрытые травой холмы с разнообразной флорой',
    difficulty: 'Легко',
    baseCost: 10,
    rarityModifiers: { common: 1.2, uncommon: 0.8, rare: 0.5, 'very rare': 0.3, legendary: 0.1 }
  },
  coastline: {
    name: 'Морское побережье',
    description: 'Скалистое побережье с морскими сокровищами',
    difficulty: 'Средне',
    baseCost: 18,
    rarityModifiers: { common: 1.0, uncommon: 0.9, rare: 0.6, 'very rare': 0.4, legendary: 0.2 }
  },
  underwater: {
    name: 'Подводные глубины',
    description: 'Тайные глубины океана с древними артефактами',
    difficulty: 'Сложно',
    baseCost: 35,
    rarityModifiers: { common: 0.7, uncommon: 1.0, rare: 0.8, 'very rare': 0.6, legendary: 0.4 }
  },
  water_source: {
    name: 'Родниковый источник',
    description: 'Чистый источник с магическими свойствами',
    difficulty: 'Легко',
    baseCost: 8,
    rarityModifiers: { common: 1.3, uncommon: 0.7, rare: 0.4, 'very rare': 0.2, legendary: 0.1 }
  },
  underdark: {
    name: 'Подземные глубины',
    description: 'Опасные подземные пещеры с редкими минералами',
    difficulty: 'Крайне сложно',
    baseCost: 50,
    rarityModifiers: { common: 0.5, uncommon: 0.8, rare: 1.0, 'very rare': 0.8, legendary: 0.6 }
  },
  ancient_ruins: {
    name: 'Древние руины',
    description: 'Развалины древней цивилизации с магическими артефактами',
    difficulty: 'Сложно',
    baseCost: 40,
    rarityModifiers: { common: 0.6, uncommon: 0.9, rare: 1.0, 'very rare': 0.7, legendary: 0.5 }
  },
  cemetery: {
    name: 'Старое кладбище',
    description: 'Заброшенное кладбище с некромантическими компонентами',
    difficulty: 'Средне',
    baseCost: 22,
    rarityModifiers: { common: 1.0, uncommon: 0.8, rare: 0.6, 'very rare': 0.4, legendary: 0.2 }
  },
  magic_academy: {
    name: 'Магическая академия',
    description: 'Центр обучения магии с редкими компонентами',
    difficulty: 'Средне',
    baseCost: 25,
    rarityModifiers: { common: 0.8, uncommon: 1.0, rare: 0.8, 'very rare': 0.6, legendary: 0.4 }
  },
  archmage_tower: {
    name: 'Башня архимага',
    description: 'Высокая башня могущественного волшебника',
    difficulty: 'Крайне сложно',
    baseCost: 60,
    rarityModifiers: { common: 0.4, uncommon: 0.7, rare: 1.0, 'very rare': 1.0, legendary: 0.8 }
  },
  alchemy_lab: {
    name: 'Алхимическая лаборатория',
    description: 'Специализированная лаборатория для алхимических экспериментов',
    difficulty: 'Сложно',
    baseCost: 35,
    rarityModifiers: { common: 0.7, uncommon: 1.0, rare: 0.9, 'very rare': 0.7, legendary: 0.5 }
  },
  alchemist_shop: {
    name: 'Лавка алхимика',
    description: 'Магазин с редкими алхимическими компонентами',
    difficulty: 'Средне',
    baseCost: 20,
    rarityModifiers: { common: 0.9, uncommon: 1.0, rare: 0.7, 'very rare': 0.5, legendary: 0.3 }
  },
  merchant_shop: {
    name: 'Торговая лавка',
    description: 'Обычная торговая лавка с базовыми компонентами',
    difficulty: 'Легко',
    baseCost: 12,
    rarityModifiers: { common: 1.2, uncommon: 0.8, rare: 0.5, 'very rare': 0.3, legendary: 0.1 }
  },
  library: {
    name: 'Древняя библиотека',
    description: 'Библиотека с магическими книгами и компонентами',
    difficulty: 'Средне',
    baseCost: 18,
    rarityModifiers: { common: 0.9, uncommon: 1.0, rare: 0.8, 'very rare': 0.6, legendary: 0.4 }
  },
  witch_hut: {
    name: 'Избушка ведьмы',
    description: 'Таинственная избушка с магическими компонентами',
    difficulty: 'Средне',
    baseCost: 22,
    rarityModifiers: { common: 0.8, uncommon: 1.0, rare: 0.8, 'very rare': 0.6, legendary: 0.4 }
  },
  shadow_plane: {
    name: 'План Теней',
    description: 'Мистический план существования с темными артефактами',
    difficulty: 'Крайне сложно',
    baseCost: 80,
    rarityModifiers: { common: 0.3, uncommon: 0.6, rare: 0.9, 'very rare': 1.0, legendary: 0.8 }
  },
  upper_planes: {
    name: 'Верхние планы',
    description: 'Небесные планы с божественными артефактами',
    difficulty: 'Легендарно',
    baseCost: 100,
    rarityModifiers: { common: 0.2, uncommon: 0.4, rare: 0.7, 'very rare': 1.0, legendary: 1.0 }
  },
  planar_rift: {
    name: 'Планарный разлом',
    description: 'Разлом в реальности с экзотическими компонентами',
    difficulty: 'Легендарно',
    baseCost: 120,
    rarityModifiers: { common: 0.1, uncommon: 0.3, rare: 0.6, 'very rare': 0.9, legendary: 1.0 }
  },
  astral_observatory: {
    name: 'Астральная обсерватория',
    description: 'Обсерватория для изучения звезд и планов',
    difficulty: 'Крайне сложно',
    baseCost: 90,
    rarityModifiers: { common: 0.2, uncommon: 0.5, rare: 0.8, 'very rare': 1.0, legendary: 0.9 }
  },
  meadow: {
    name: 'Цветущий луг',
    description: 'Покрытый цветами луг с разнообразными травами',
    difficulty: 'Легко',
    baseCost: 8,
    rarityModifiers: { common: 1.3, uncommon: 0.7, rare: 0.4, 'very rare': 0.2, legendary: 0.1 }
  },
  swamp: {
    name: 'Топи и болота',
    description: 'Влажные болота с ядовитыми растениями',
    difficulty: 'Средне',
    baseCost: 16,
    rarityModifiers: { common: 1.0, uncommon: 0.8, rare: 0.6, 'very rare': 0.4, legendary: 0.2 }
  },
  desert: {
    name: 'Бескрайняя пустыня',
    description: 'Жаркая пустыня с редкими минералами',
    difficulty: 'Сложно',
    baseCost: 28,
    rarityModifiers: { common: 0.8, uncommon: 0.9, rare: 0.7, 'very rare': 0.5, legendary: 0.3 }
  },
  common_areas: {
    name: 'Обычные земли',
    description: 'Повседневные места с базовыми компонентами',
    difficulty: 'Легко',
    baseCost: 6,
    rarityModifiers: { common: 1.4, uncommon: 0.6, rare: 0.3, 'very rare': 0.1, legendary: 0.05 }
  },
  arctic: {
    name: 'Арктические пустоши',
    description: 'Ледяные пустоши с морозостойкими растениями',
    difficulty: 'Средне',
    baseCost: 18,
    rarityModifiers: { common: 0.9, uncommon: 0.8, rare: 0.6, 'very rare': 0.4, legendary: 0.2 }
  },
  orc_settlements: {
    name: 'Орочьи поселения',
    description: 'Поселения орочьих племен с темными артефактами',
    difficulty: 'Средне',
    baseCost: 20,
    rarityModifiers: { common: 0.8, uncommon: 0.9, rare: 0.7, 'very rare': 0.5, legendary: 0.3 }
  },
  taverns: {
    name: 'Таверны',
    description: 'Места отдыха путешественников с различными товарами',
    difficulty: 'Легко',
    baseCost: 8,
    rarityModifiers: { common: 1.2, uncommon: 0.7, rare: 0.4, 'very rare': 0.2, legendary: 0.1 }
  },
  kobold_territory: {
    name: 'Территория кобольдов',
    description: 'Подземные туннели кобольдов с редкими находками',
    difficulty: 'Средне',
    baseCost: 15,
    rarityModifiers: { common: 0.9, uncommon: 0.8, rare: 0.6, 'very rare': 0.4, legendary: 0.2 }
  },
  druid_settlements: {
    name: 'Поселения друидов',
    description: 'Священные рощи друидов с природными артефактами',
    difficulty: 'Средне',
    baseCost: 22,
    rarityModifiers: { common: 0.8, uncommon: 0.9, rare: 0.8, 'very rare': 0.6, legendary: 0.4 }
  }
};

// Базовые шансы выпадения по редкости
const BASE_DROP_CHANCES: Record<string, number> = {
  common: 0.7,
  uncommon: 0.4,
  rare: 0.2,
  'very rare': 0.1,
  legendary: 0.05
};

// Количество предметов по редкости
const QUANTITY_RANGES: Record<string, [number, number]> = {
  common: [2, 5],
  uncommon: [1, 3],
  rare: [1, 2],
  'very rare': [1, 1],
  legendary: [1, 1]
};

export function generateBiomesFromIngredients(ingredients: Ingredient[]): Biome[] {
  const biomeMap = new Map<string, {
    ingredients: Map<string, Ingredient>;
    locations: Set<string>;
  }>();

  // Группируем ингредиенты по биомам
  ingredients.forEach(ingredient => {
    ingredient.locations.forEach(location => {
      const biomeId = LOCATION_TO_BIOME_MAP[location] || 'common_areas';
      
      if (!biomeMap.has(biomeId)) {
        biomeMap.set(biomeId, {
          ingredients: new Map(),
          locations: new Set()
        });
      }
      
      const biome = biomeMap.get(biomeId)!;
      biome.ingredients.set(ingredient.id, ingredient);
      biome.locations.add(location);
    });
  });

  // Создаем биомы
  const biomes: Biome[] = [];
  
  biomeMap.forEach((biomeData, biomeId) => {
    const config = BIOME_CONFIG[biomeId];
    if (!config) return;

    // Группируем ингредиенты по редкости
    const ingredientsByRarity = {
      common: [] as BiomeIngredient[],
      uncommon: [] as BiomeIngredient[],
      rare: [] as BiomeIngredient[],
      'very rare': [] as BiomeIngredient[],
      legendary: [] as BiomeIngredient[]
    };

    biomeData.ingredients.forEach(ingredient => {
      const rarity = ingredient.rarity;
      if (rarity in ingredientsByRarity) {
        const baseChance = BASE_DROP_CHANCES[rarity];
        const modifier = config.rarityModifiers[rarity] || 1.0;
        const finalChance = Math.min(0.95, baseChance * modifier);
        
        ingredientsByRarity[rarity as keyof typeof ingredientsByRarity].push({
          id: ingredient.id,
          chance: finalChance,
          quantity: QUANTITY_RANGES[rarity]
        });
      }
    });

    // Создаем биом
    const biome: Biome = {
      id: biomeId,
      name: config.name,
      description: config.description,
      difficulty: config.difficulty,
      cost: config.baseCost,
      commonIngredients: ingredientsByRarity.common,
      uncommonIngredients: ingredientsByRarity.uncommon,
      rareIngredients: ingredientsByRarity.rare,
      legendaryIngredients: ingredientsByRarity['very rare'].concat(ingredientsByRarity.legendary)
    };

    biomes.push(biome);
  });

  // Сортируем биомы по сложности и стоимости
  return biomes.sort((a, b) => {
    const difficultyOrder = ['Легко', 'Средне', 'Сложно', 'Крайне сложно', 'Легендарно'];
    const aDiffIndex = difficultyOrder.indexOf(a.difficulty);
    const bDiffIndex = difficultyOrder.indexOf(b.difficulty);
    
    if (aDiffIndex !== bDiffIndex) {
      return aDiffIndex - bDiffIndex;
    }
    
    return a.cost - b.cost;
  });
}

export function getBiomeDifficultyColor(difficulty: string): string {
  const colors = {
    'Легко': 'bg-green-500',
    'Средне': 'bg-yellow-500',
    'Сложно': 'bg-orange-500',
    'Крайне сложно': 'bg-red-500',
    'Легендарно': 'bg-purple-500'
  };
  
  return colors[difficulty as keyof typeof colors] || 'bg-gray-500';
}

export function getBiomeDifficultyLabel(difficulty: string): string {
  return difficulty;
}
