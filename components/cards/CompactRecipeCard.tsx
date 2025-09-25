// components/cards/CompactRecipeCard.tsx

import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { FlaskConical, Beaker } from "lucide-react";
import { CompactCard } from "./CompactCard";
import type { Recipe, Ingredient, RecipeComponent, AlchemicalElement, IngredientType, PotionBase } from "../../hooks/types";
import { getRarityColor, getRarityName, getRarityDetails, getPotionTypeName, getPotionTypeColor, getPotionQualityName, getPotionQualityColor, getAlchemicalElementDetails, getPotionBaseDetails, getAlchemicalElementName } from "../../hooks/types";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Checkbox } from "../ui/checkbox";
import { ELEMENT_RANK, getImpurityEffect } from "../../hooks/stores/useAlchemyStore";

interface CompactRecipeCardProps {
  recipe: Recipe;
  ingredients: Ingredient[];
  onToggleLaboratory: (recipeId: string) => void;
  onSelectIngredient?: (recipeId: string, componentId: string, ingredientId: string | undefined) => void;
  canBrew?: boolean;
  onBrew?: (recipeId: string) => void;
  characterBonus?: number;
  isInLaboratory?: boolean;
  getSelectedIngredient?: (recipeId: string, componentId: string) => string | undefined;
  brewingMode?: 'percentage' | 'ttrpg';
  toggleMagicalDust?: (recipeId: string) => void;
  isMagicalDustActive?: (recipeId: string) => boolean;
  hasMagicalDust?: () => boolean;
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
  const isIngredientCompatible = (ingredient: Ingredient, component: RecipeComponent): boolean => {
    if (component.requiredElements && component.requiredElements.length > 0) {
      if (!component.requiredElements.every(el => ingredient.elements?.includes(el))) return false;
    }
    if (component.categories && component.categories.length > 0) {
      if (!component.categories.includes(ingredient.category)) return false;
    }
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

  const isSelectedIngredientValid = selectedIngredient &&
    isIngredientCompatible(selectedIngredient, component) &&
    selectedIngredient.quantity >= component.quantity;

  const selectBorderClass = selectedIngredientId && isSelectedIngredientValid
    ? "border-green-500 dark:border-green-400"
    : !selectedIngredientId
    ? "border-red-500 dark:border-red-400"
    : "border-red-500 dark:border-red-400";

  return (
    <div className="space-y-3 p-3 border rounded-lg">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h4 className="text-sm mb-1">{component.name}</h4>
        </div>
        <Badge variant="outline" className="text-xs shrink-0">
          ×{component.quantity}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground">{component.description}</p>

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
                  <div className="flex items-center gap-2">
                    {selectedIngredient.impurity && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Beaker className="h-3 w-3 text-purple-500 shrink-0" />
                            </TooltipTrigger>
                            <TooltipContent className="text-white dark:text-black">
                                <div className="text-xs text-white dark:text-black">
                                    Примесь: {getAlchemicalElementName(selectedIngredient.impurity)}
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    )}
                    <span>{selectedIngredient.name} (×{selectedIngredient.quantity})</span>
                  </div>
                  {!isSelectedIngredientValid && (
                    <span className="text-red-500 text-xs ml-2"> ⚠️ </span>
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
  isInLaboratory = false,
  brewingMode = 'percentage',
  toggleMagicalDust,
  isMagicalDustActive,
  hasMagicalDust
}: CompactRecipeCardProps) {
  const rarityDetails = getRarityDetails(recipe.rarity);
  const rarityColor = getRarityColor(recipe.rarity);
  const rarityName = getRarityName(recipe.rarity);

  const targetDifficulty = 5 * rarityDetails.rarityModifier + 5 + recipe.components.length;
  const totalBonus = characterBonus;
  const successPercentage = Math.max(5, Math.min(95, ((21 - (targetDifficulty - totalBonus)) / 20) * 100));

  const badges = [
    { label: rarityName, className: `${rarityColor} text-white border-none`, title: `Редкость: ${rarityName}` },
    { label: getPotionTypeName(recipe.potionType), className: `${getPotionTypeColor(recipe.potionType)} text-white border-none`, title: `Тип: ${getPotionTypeName(recipe.potionType)}` },
    { label: getPotionQualityName(recipe.potionQuality), className: `${getPotionQualityColor(recipe.potionQuality)} text-white border-none`, title: `Качество: ${getPotionQualityName(recipe.potionQuality)}` },
    { label: brewingMode === 'percentage' ? `${Math.round(successPercentage)}%` : `СЛ: ${targetDifficulty}`, variant: "outline" as const, title: brewingMode === 'percentage' ? `Шанс (d20+${totalBonus} vs ${targetDifficulty})` : `Бросок d20+${totalBonus} >= ${targetDifficulty}` },
    { label: rarityDetails.brewingTimeText, variant: "secondary" as const }
  ];

  const isIngredientCompatible = (ingredient: Ingredient, component: RecipeComponent): boolean => {
    if (component.requiredElements && component.requiredElements.length > 0) {
      if (!component.requiredElements.every(el => ingredient.elements?.includes(el))) return false;
    }
    if (component.categories && component.categories.length > 0) {
      if (!component.categories.includes(ingredient.category)) return false;
    }
    if (component.types && component.types.length > 0) {
      if (!component.types.includes(ingredient.type as any)) return false;
    }
    return true;
  };

  const finalCircles: any[] = [];

  const baseComponent = recipe.components.find(c => c.tags.includes('база'));
  if (baseComponent && baseComponent.types?.[0]) {
    const baseDetails = getPotionBaseDetails(baseComponent.types[0] as PotionBase);
    const isBaseAvailable = ingredients.some(ing => isIngredientCompatible(ing, baseComponent));
    finalCircles.push({
      label: baseDetails.shortCode,
      color: `${baseDetails.color} ${isBaseAvailable ? 'ring-2 ring-green-500' : 'ring-2 ring-red-500'}`,
      tooltip: `База: ${baseDetails.name}`
    });
  }

  const elementComponents = recipe.components.filter(c => !c.tags.includes('база'));
  const allRequiredElements = Array.from(new Set(elementComponents.flatMap(c => c.requiredElements)));

  allRequiredElements.forEach(element => {
    const details = getAlchemicalElementDetails(element);
    const isElementAvailable = elementComponents.some(component =>
      component.requiredElements.includes(element) && ingredients.some(ing => isIngredientCompatible(ing, component))
    );

    if (finalCircles.length > 0) {
        finalCircles.push({ label: "mini-separator", color: "bg-border w-2 h-px" });
    }

    finalCircles.push({
      label: details.shortCode,
      color: `${details.color} ${isElementAvailable ? 'ring-2 ring-green-500' : 'ring-2 ring-red-500'}`,
      tooltip: `${details.category}: ${details.name}`
    });
  });

  const allIngredientsAvailable = recipe.components.every(component =>
    ingredients.some(ing => isIngredientCompatible(ing, component))
  );

  const typeCirclesWithIndicator = [
    {
      label: allIngredientsAvailable ? "✓" : "!",
      color: allIngredientsAvailable ? "bg-green-500" : "bg-red-500",
      tooltip: allIngredientsAvailable ? "Есть подходящие ингредиенты для всех компонентов" : "Не хватает ингредиентов"
    },
    { label: "—", color: "bg-border w-6 h-px" },
    ...finalCircles
  ];

  const allComponentsSelectedAndValid = recipe.components?.every(component => {
    const selectedIngredientId = getSelectedIngredient?.(recipe.id, component.id);
    if (!selectedIngredientId) return false;
    const selectedIng = ingredients.find(ing => ing.id === selectedIngredientId);
    return selectedIng &&
      isIngredientCompatible(selectedIng, component) &&
      selectedIng.quantity >= component.quantity;
  }) || false;

  const selectedIngredientIds = recipe.components.map(c => getSelectedIngredient?.(recipe.id, c.id)).filter(Boolean) as string[];
  const selectedIngredients = ingredients.filter(ing => selectedIngredientIds.includes(ing.id));
  const impurities = selectedIngredients.map(ing => ing.impurity).filter(Boolean) as AlchemicalElement[];
  let dominantImpurity: AlchemicalElement | undefined;
  if (impurities.length > 0) {
      dominantImpurity = impurities.reduce((dominant, current) => {
          const dominantRank = ELEMENT_RANK[dominant] || 0;
          const currentRank = ELEMENT_RANK[current] || 0;
          return currentRank > dominantRank ? current : dominant;
      });
  }

  const impurityEffect = dominantImpurity ? getImpurityEffect(dominantImpurity, rarityDetails.rarityModifier) : null;
  const hasMagicalDustInInventory = hasMagicalDust ? hasMagicalDust() : false;
  const magicalDustIsActive = isMagicalDustActive?.(recipe.id) ?? false;

  const actions = (
    <div className="flex items-center gap-1 shrink-0">
      {isInLaboratory && canBrew && onBrew && (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onBrew(recipe.id);
          }}
          disabled={!allComponentsSelectedAndValid}
          size="sm"
          className={`h-7 text-xs px-2`}
          variant={allComponentsSelectedAndValid ? "default" : "secondary"}
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
        <div className="p-3 bg-muted/30 rounded-lg">
          <div className="text-xs text-muted-foreground mb-1">Эффект</div>
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

        {isInLaboratory && dominantImpurity && impurityEffect && (
            <div className="space-y-3 p-3 border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                <div className="flex items-center gap-2">
                    <Beaker className="h-4 w-4 text-purple-500" />
                    <h4 className="text-sm font-medium text-purple-700 dark:text-purple-300">Потенциальный эффект примеси</h4>
                </div>
                <p className={`text-xs text-muted-foreground transition-opacity ${magicalDustIsActive ? 'line-through opacity-50' : ''}`}>
                    {impurityEffect}
                </p>

                {hasMagicalDustInInventory && (
                    <div className="pt-2 border-t border-purple-200 dark:border-purple-800">
                        <div className="flex items-center space-x-2 mt-2">
                            <Checkbox
                                id={`dust-${recipe.id}`}
                                checked={magicalDustIsActive}
                                onCheckedChange={() => toggleMagicalDust?.(recipe.id)}
                                onClick={(e) => e.stopPropagation()}
                            />
                            <label
                                htmlFor={`dust-${recipe.id}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Использовать Магическую пыль (в наличии: {ingredients.find(ing => ing.id === 'magical_dust')?.quantity})
                            </label>
                        </div>
                    </div>
                )}
            </div>
        )}

        <div className="pt-2 border-t space-y-2">
          <Button
            onClick={() => onToggleLaboratory(recipe.id)}
            variant="outline"
            className="w-full"
            size="sm"
          >
            {isInLaboratory ? (
              <>Убрать из лаборатории</>
            ) : (
              <><FlaskConical className="h-4 w-4 mr-2" />Добавить в лабораторию</>
            )}
          </Button>
        </div>
      </div>
    </CompactCard>
  );
}