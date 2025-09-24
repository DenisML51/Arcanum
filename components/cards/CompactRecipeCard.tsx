// components/CompactRecipeCard.tsx

import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Clock, Target, FlaskConical, CheckCircle2 } from "lucide-react";
import { CompactCard } from "./CompactCard";
import type { Recipe, Ingredient, RecipeComponent } from "../../hooks/types";
import { getRarityColor, getRarityName, getRarityDetails, getPotionTypeName, getPotionTypeColor, getPotionQualityName, getPotionQualityColor } from "../../hooks/types";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface CompactRecipeCardProps {
  recipe: Recipe;
  ingredients: Ingredient[];
  onToggleLaboratory: (recipeId: string) => void;
  onSelectIngredient?: (recipeId: string, componentId: string, ingredientId: string | undefined) => void;
  canBrew?: boolean;
  onBrew?: (recipeId: string) => void;
  characterBonus?: number; // Общий бонус персонажа к варке
  isInLaboratory?: boolean; // Находится ли рецепт в лаборатории
}

const difficultyColors = {
  easy: "bg-green-500",
  medium: "bg-yellow-500",
  hard: "bg-red-500"
};

const typeColors = {
  herb: "bg-emerald-500",
  mineral: "bg-stone-500",
  creature: "bg-red-500",
  essence: "bg-violet-500",
  oil: "bg-amber-500",
  crystal: "bg-cyan-500"
};

function getDifficultyInfo(difficulty: number) {
  if (difficulty <= 3) return { label: 'Легкий', color: difficultyColors.easy };
  if (difficulty <= 6) return { label: 'Средний', color: difficultyColors.medium };
  return { label: 'Сложный', color: difficultyColors.hard };
}

function ComponentSelector({
  component,
  ingredients,
  recipeId,
  onSelectIngredient,
  selectedIngredientId
}: {
  component: RecipeComponent;
  ingredients: Ingredient[];
  recipeId: string;
  onSelectIngredient?: (recipeId: string, componentId: string, ingredientId: string | undefined) => void;
  selectedIngredientId?: string;
}) {
  // Функция для проверки совместимости ингредиента с компонентом
  const isIngredientCompatible = (ingredient: Ingredient, component: RecipeComponent): boolean => {
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

  const availableIngredients = ingredients.filter(ing =>
    isIngredientCompatible(ing, component) && ing.quantity >= component.quantity
  );

  const selectedIngredient = selectedIngredientId
    ? ingredients.find(ing => ing.id === selectedIngredientId)
    : null;

  // Проверяем, является ли выбранный ингредиент валидным
  const isSelectedIngredientValid = selectedIngredient &&
    isIngredientCompatible(selectedIngredient, component) &&
    selectedIngredient.quantity >= component.quantity;

  // Определяем класс для границы select
  const selectBorderClass = selectedIngredientId && isSelectedIngredientValid
    ? "border-green-500 dark:border-green-400"
    : !selectedIngredientId
    ? "border-red-500 dark:border-red-400"
    : "border-red-500 dark:border-red-400"; // невалидный выбор

  return (
    <div className="space-y-3 p-3 border rounded-lg">
      {/* Заголовок и количество */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h4 className="text-sm mb-1">{component.name}</h4>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {component.types.slice(0, 3).map(type => (
                <div
                  key={type}
                  className={`w-4 h-4 rounded-full ${typeColors[type]} flex items-center justify-center text-xs text-white`}
                  title={type}
                >
                  {type.slice(0, 1).toUpperCase()}
                </div>
              ))}
              {component.types.length > 3 && (
                <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                  +{component.types.length - 3}
                </div>
              )}
            </div>
          </div>
        </div>
        <Badge variant="outline" className="text-xs shrink-0">
          ×{component.quantity}
        </Badge>
      </div>

      <p className="text-xs text-muted-foreground">{component.description}</p>

      <div className="flex flex-wrap gap-1">
        {component.tags.map(tag => (
          <Badge key={tag} variant="secondary" className="text-xs">
            {tag}
          </Badge>
        ))}
      </div>

      {onSelectIngredient && (
        <Select
          value={selectedIngredientId || ""}
          onValueChange={(value) => {
            if (value === "clear" || value === "no-ingredients") {
              onSelectIngredient(recipeId, component.id, undefined);
            } else {
              onSelectIngredient(recipeId, component.id, value);
            }
          }}
        >
          <SelectTrigger
            className={`h-8 text-xs ${selectBorderClass}`}
            onClick={(e) => e.stopPropagation()}
          >
            <SelectValue placeholder="Выберите ингредиент">
              {selectedIngredient ? (
                <div className="flex items-center justify-between w-full">
                  <span>{selectedIngredient.name} (×{selectedIngredient.quantity})</span>
                  {!isSelectedIngredientValid && (
                    <span className="text-red-500 text-xs ml-2">⚠️</span>
                  )}
                </div>
              ) : (
                "Выберите ингредиент"
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="clear">
              <span className="text-muted-foreground">Очистить</span>
            </SelectItem>
            {availableIngredients.length === 0 ? (
              <SelectItem value="no-ingredients" disabled>
                Нет подходящих ингредиентов
              </SelectItem>
            ) : (
              availableIngredients.map(ingredient => (
                <SelectItem key={ingredient.id} value={ingredient.id}>
                  {ingredient.name} (×{ingredient.quantity})
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}

export function CompactRecipeCard({
  recipe,
  ingredients,
  onToggleLaboratory,
  onSelectIngredient,
  canBrew,
  onBrew,
  characterBonus = 0,
  getSelectedIngredient,
  isInLaboratory = false
}: CompactRecipeCardProps & { getSelectedIngredient?: (recipeId: string, componentId: string) => string | undefined }) {
  const rarityDetails = getRarityDetails(recipe.rarity);
  const rarityColor = getRarityColor(recipe.rarity);
  const rarityName = getRarityName(recipe.rarity);

  // Рассчитываем шанс успеха в новой системе D&D 5e
  // Нужно бросить к20 + бонус >= сложность
  const targetDifficulty = rarityDetails.savingThrow;
  const totalBonus = characterBonus;

  // Вероятность успеха = (21 - (сложность - бонус)) / 20, но не больше 95% и не меньше 5%
  const baseSuccessRolls = Math.max(1, Math.min(20, 21 - (targetDifficulty - totalBonus)));
  const successPercentage = Math.max(5, Math.min(95, (baseSuccessRolls / 20) * 100));

  // Функция для проверки совместимости (та же что в ComponentSelector)
  const isIngredientCompatible = (ingredient: Ingredient, component: RecipeComponent): boolean => {
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

  // Проверяем, есть ли все компоненты выбраны и валидны
  const allComponentsSelected = recipe.components?.every(component => {
    const selectedIngredientId = getSelectedIngredient?.(recipe.id, component.id);
    if (!selectedIngredientId) return false;
    const selectedIng = ingredients.find(ing => ing.id === selectedIngredientId);
    return selectedIng &&
      isIngredientCompatible(selectedIng, component) &&
      selectedIng.quantity >= component.quantity;
  }) || false;

  // Проверяем, доступны ли все ингредиенты (даже если не выбраны)
  const allIngredientsAvailable = recipe.components?.every(component => {
    const availableIngredients = ingredients.filter(ing =>
      isIngredientCompatible(ing, component) && ing.quantity >= component.quantity
    );
    return availableIngredients.length > 0;
  }) || false;

  // Вычисляем, можно ли сварить зелье (все компоненты выбраны и доступны)
  const canActuallyBrew = recipe.components?.every(component => {
    const selectedIngredientId = getSelectedIngredient?.(recipe.id, component.id);
    if (!selectedIngredientId) return false; // Требуем явного выбора
    
    const selectedIngredient = ingredients.find(ing => ing.id === selectedIngredientId);
    return selectedIngredient && 
           isIngredientCompatible(selectedIngredient, component) &&
           selectedIngredient.quantity >= component.quantity;
  }) || false;

  const badges = [
    {
      label: rarityName,
      className: `${rarityColor} text-white border-none`,
      title: `Редкость зелья: ${rarityName}`
    },
    {
      label: getPotionTypeName(recipe.potionType),
      className: `${getPotionTypeColor(recipe.potionType)} text-white border-none`,
      title: `Тип зелья: ${getPotionTypeName(recipe.potionType)}`
    },
    {
      label: getPotionQualityName(recipe.potionQuality),
      className: `${getPotionQualityColor(recipe.potionQuality)} text-white border-none`,
      title: `Качество варева: ${getPotionQualityName(recipe.potionQuality)}`
    },
    {
      label: `${Math.round(successPercentage)}%`,
      variant: "outline" as const,
      title: `к20+${totalBonus} против СЛ ${targetDifficulty}`
    },
    {
      label: rarityDetails.brewingTimeText,
      variant: "secondary" as const
    }
  ];

  // Создаем typeCircles с учетом доступности ингредиентов для каждого компонента
  const componentAvailability = recipe.components?.map(component => {
    const availableIngredients = ingredients.filter(ing =>
      component.types.includes(ing.type) &&
      component.tags.every(tag => ing.tags.includes(tag)) &&
      ing.quantity >= component.quantity
    );
    return {
      types: component.types,
      available: availableIngredients.length > 0
    };
  }) || [];

  // Получаем уникальные типы и определяем их доступность
  const uniqueTypes = Array.from(new Set(recipe.components?.flatMap(c => c.types) || []));
  const typeCircles = uniqueTypes.map(type => {
    const typeAvailable = componentAvailability.some(comp =>
      comp.types.includes(type) && comp.available
    );
    return {
      label: type,
      color: typeAvailable
        ? `${typeColors[type]} ring-2 ring-green-500 dark:ring-green-400`
        : `${typeColors[type]} ring-2 ring-red-500 dark:ring-red-400`
    };
  });

  // Создаем кружочки с индикатором доступности и разделителями между типами
  const typeCirclesWithIndicator = [
    // Сначала индикатор доступности
    {
      label: allIngredientsAvailable ? "✓" : "!",
      color: allIngredientsAvailable
        ? "bg-green-500 dark:bg-green-600"
        : "bg-red-500 dark:bg-red-600",
      tooltip: allIngredientsAvailable
        ? "Все ингредиенты доступны - в инвентаре есть подходящие ингредиенты для всех компонентов"
        : "Не все ингредиенты доступны - некоторые компоненты недоступны в инвентаре"
    },
    // Потом разделитель (специальный элемент)
    {
      label: "—",
      color: "bg-border w-6 h-px rounded-none"
    },
    // Потом кружочки типов с мини-разделителями между ними
    ...typeCircles.reduce((acc, circle, index) => {
      // Добавляем кружочек типа
      acc.push({
        ...circle,
        tooltip: `Тип: ${circle.label}`
      });

      // Добавляем мини-разделитель после каждого кружочка, кроме последнего
      if (index < typeCircles.length - 1) {
        acc.push({
          label: "mini-separator",
          color: "bg-muted w-2 h-px rounded-none"
        });
      }

      return acc;
    }, [] as Array<{ label: string; color: string; tooltip?: string }>)
  ];

  const actions = (
    <div className="flex items-center gap-1 shrink-0">
      {isInLaboratory && canBrew && onBrew && (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onBrew(recipe.id);
          }}
          disabled={!allComponentsSelected}
          size="sm"
          className={`h-7 text-xs px-2 ${
            !allComponentsSelected 
              ? 'opacity-50 cursor-not-allowed' 
              : ''
          }`}
          variant={allComponentsSelected ? "default" : "secondary"}
        >
          <FlaskConical className="h-3 w-3 mr-1" />
          Варить
        </Button>
      )}
    </div>
  );

  return (
    <CompactCard
      title={recipe.name}
      badges={badges}
      typeCircles={typeCirclesWithIndicator}
      actions={actions}
    >
      <div className="space-y-4">
        <div className="stat-container">
          <div className="text-xs text-muted-foreground mb-1 text-center">Эффект</div>
          <div className="text-sm font-medium text-left">{recipe.effect}</div>
        </div>

        {isInLaboratory && (
          <div className="space-y-3">
            <h4 className="text-sm">Компоненты:</h4>
            {recipe.components?.map((component) => (
                <ComponentSelector
                  key={component.id}
                  component={component}
                  ingredients={ingredients}
                  recipeId={recipe.id}
                  onSelectIngredient={onSelectIngredient}
                  selectedIngredientId={getSelectedIngredient?.(recipe.id, component.id)}
                />
            )) || (
              <p className="text-sm text-muted-foreground">Нет компонентов</p>
            )}
          </div>
        )}

        <div className="pt-2 border-t space-y-2">
          {!isInLaboratory ? (
            <Button
              onClick={() => onToggleLaboratory(recipe.id)}
              variant="outline"
              className="w-full"
              size="sm"
            >
              <FlaskConical className="h-4 w-4 mr-2" />
              Добавить в лабораторию
            </Button>
          ) : (
            <Button
              onClick={() => onToggleLaboratory(recipe.id)}
              variant="outline"
              className="w-full"
              size="sm"
            >
              Убрать из лаборатории
            </Button>
          )}
        </div>
      </div>
    </CompactCard>
  );
}