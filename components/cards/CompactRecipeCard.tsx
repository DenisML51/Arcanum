// components/cards/CompactRecipeCard.tsx
import { useState, useMemo } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { FlaskConical, Beaker, Zap } from "lucide-react";
import { CompactCard } from "./CompactCard";
import type { Recipe, Ingredient, RecipeComponent, AlchemicalElement, IngredientType, PotionBase, PotionRarity } from "../../hooks/types";
import {
    getRarityColor,
    getRarityName,
    getRarityDetails,
    getPotionTypeName,
    getPotionTypeColor,
    getPotionQualityName,
    getPotionQualityColor,
    getAlchemicalElementDetails,
    getPotionBaseDetails,
    getAlchemicalElementName,
    getPotionBaseRarity,
    POTION_BASE_RARITIES
} from "../../hooks/types";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Checkbox } from "../ui/checkbox";
import { ELEMENT_RANK, getImpurityEffect } from "../../hooks/stores/useAlchemyStore";

interface CompactRecipeCardProps {
    recipe: Recipe;
    allRecipes: Recipe[];
    ingredients: Ingredient[];
    onToggleLaboratory: (recipeId: string) => void;
    onSelectIngredient?: (recipeId: string, componentId: string, ingredientId: string | undefined) => void;
    canBrew?: boolean;
    onBrew?: (recipeId: string, rarity: PotionRarity) => void;
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
    selectedIngredientId,
    isUniversal,
    selectedRarity
}: {
    component: RecipeComponent;
    ingredients: Ingredient[];
    recipeId: string;
    onSelectIngredient?: (recipeId: string, componentId: string, ingredientId: string | undefined) => void;
    selectedIngredientId?: string;
    isUniversal: boolean;
    selectedRarity: PotionRarity;
}) {
    const isIngredientCompatible = (ingredient: Ingredient, component: RecipeComponent): boolean => {
        // Для компонентов-баз проверяем специальные условия
        if (component.tags.includes('база')) {
            // Проверяем, что ингредиент является базой
            if (!ingredient.isBase) return false;
            
            // Для универсальных рецептов проверяем соответствие редкости
            if (isUniversal) {
                const requiredRarity = getPotionBaseRarity(ingredient.type as PotionBase);
                return requiredRarity === selectedRarity;
            }
            
            // Для обычных рецептов проверяем соответствие типу
            if (component.types && component.types.length > 0) {
                return component.types.includes(ingredient.type as any);
            }
            
            return true;
        }
        
        // Для обычных компонентов проверяем стандартные условия
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
                        <SelectValue placeholder="Выберите ингредиент" />
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
    allRecipes,
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
    const [selectedRarity, setSelectedRarity] = useState<PotionRarity>(recipe.rarity);
    const isUniversal = recipe.recipeType === 'universal';

    const currentRarity = isUniversal ? selectedRarity : recipe.rarity;
    const rarityDetails = getRarityDetails(currentRarity);
    const rarityColor = getRarityColor(currentRarity);
    const rarityName = getRarityName(currentRarity);
    
    const targetDifficulty = 5 * rarityDetails.rarityModifier + 5 + recipe.components.length;
    const totalBonus = characterBonus;
    const successPercentage = Math.max(5, Math.min(95, ((21 - (targetDifficulty - totalBonus)) / 20) * 100));

    const isIngredientCompatible = (ingredient: Ingredient, component: RecipeComponent): boolean => {
        // Для компонентов-баз проверяем специальные условия
        if (component.tags.includes('база')) {
            // Проверяем, что ингредиент является базой
            if (!ingredient.isBase) return false;
            
            // Для универсальных рецептов проверяем соответствие редкости
            if (isUniversal) {
                const requiredRarity = getPotionBaseRarity(ingredient.type as PotionBase);
                return requiredRarity === currentRarity;
            }
            
            // Для обычных рецептов проверяем соответствие типу
            if (component.types && component.types.length > 0) {
                return component.types.includes(ingredient.type as any);
            }
            
            return true;
        }
        
        // Для обычных компонентов проверяем стандартные условия
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
    
    const allComponentsSelectedAndValid = recipe.components?.every(component => {
        const selectedIngredientId = getSelectedIngredient?.(recipe.id, component.id);
        if (!selectedIngredientId) return false;
        const selectedIng = ingredients.find(ing => ing.id === selectedIngredientId);
        return selectedIng &&
            isIngredientCompatible(selectedIng, component) &&
            selectedIng.quantity >= component.quantity;
    }) || false;

    const badges = [
        { label: rarityName, className: `${rarityColor} text-white border-none`, title: `Редкость: ${rarityName}` },
        { label: getPotionTypeName(recipe.potionType), className: `${getPotionTypeColor(recipe.potionType)} text-white border-none`, title: `Тип: ${getPotionTypeName(recipe.potionType)}` },
        { label: getPotionQualityName(recipe.potionQuality), className: `${getPotionQualityColor(recipe.potionQuality)} text-white border-none`, title: `Качество: ${getPotionQualityName(recipe.potionQuality)}` },
        { label: brewingMode === 'percentage' ? `${Math.round(successPercentage)}%` : `СЛ: ${targetDifficulty}`, variant: "outline" as const, title: brewingMode === 'percentage' ?
        `Шанс (d20+${totalBonus} vs ${targetDifficulty})` : `Бросок d20+${totalBonus} >= ${targetDifficulty}` },
        { label: rarityDetails.brewingTimeText, variant: "secondary" as const },
        ...(isInLaboratory ? [
        {
            label: allComponentsSelectedAndValid ? 'Готово к варке' : 'Выберите ингредиенты',
            className: allComponentsSelectedAndValid
            ? 'bg-green-600 text-white border-none animate-pulse'
            : 'bg-orange-500 text-white border-none',
            title: allComponentsSelectedAndValid
            ? 'Все ингредиенты выбраны, можно варить!'
            : 'Необходимо выбрать ингредиенты для всех компонентов'
        }
        ] : [])
    ];
    
    const finalCircles: any[] = [];
    const baseComponent = recipe.components.find(c => c.tags.includes('база'));
    
    if (baseComponent && baseComponent.types?.[0]) {
        const baseType = isUniversal 
            ? (Object.entries(POTION_BASE_RARITIES).find(([, rarity]) => rarity === currentRarity) || [])[0] as PotionBase
            : baseComponent.types[0] as PotionBase;

        if (baseType) {
            const baseDetails = getPotionBaseDetails(baseType);
            const isBaseAvailable = ingredients.some(ing => isIngredientCompatible(ing, baseComponent));
            finalCircles.push({
                label: baseDetails.shortCode,
                color: `${baseDetails.color} ${isBaseAvailable ? 'ring-2 ring-green-500' : 'ring-2 ring-red-500'}`,
                tooltip: `База: ${baseDetails.name}`
            });
        }
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
            label: allIngredientsAvailable ? " ✓ " : "!",
            color: allIngredientsAvailable ? "bg-green-500" : "bg-red-500",
            tooltip: allIngredientsAvailable ? "Есть подходящие ингредиенты для всех компонентов" : "Не хватает ингредиентов"
        },
        { label: "—", color: "bg-border w-6 h-px" },
        ...finalCircles
    ];
    
    const evolutionPeers = useMemo(() => {
        if (recipe.recipeType !== 'evolution' || !recipe.evolutionId) return [];
        return allRecipes
            .filter(r => r.evolutionId === recipe.evolutionId)
            .sort((a, b) => getRarityDetails(a.rarity).rarityModifier - getRarityDetails(b.rarity).rarityModifier);
    }, [recipe, allRecipes]);

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
        <div className="flex items-center gap-2 shrink-0">
            {isInLaboratory && canBrew && onBrew && (
                <div className="flex flex-col items-end gap-1">
                    <Button
                        onClick={(e) => {
                            e.stopPropagation();
                            onBrew(recipe.id, currentRarity);
                        }}
                        disabled={!allComponentsSelectedAndValid}
                        size="sm"
                        className={`h-8 text-sm px-4 font-medium transition-all duration-200 ${
                        allComponentsSelectedAndValid
                        ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                        : 'bg-gray-400 hover:bg-gray-500 text-white cursor-not-allowed'
                        }`}
                        variant="default"
                        >
                        <FlaskConical className="h-4 w-4 mr-2" />
                        {allComponentsSelectedAndValid ? 'Сварить зелье' : 'Выберите ингредиенты'}
                    </Button>
                    {!allComponentsSelectedAndValid && (
                        <span className="text-xs text-red-500 font-medium">
                        {recipe.components?.filter(component => {
                            const selectedIngredientId = getSelectedIngredient?.(recipe.id, component.id);
                            return !selectedIngredientId;
                        }).length || 0} компонентов не выбрано
                        </span>
                    )}
                </div>
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
                {isUniversal && isInLaboratory && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Редкость варки</label>
                        <Select
                            value={selectedRarity}
                            onValueChange={(value: PotionRarity) => setSelectedRarity(value)}
                        >
                            <SelectTrigger onClick={(e) => e.stopPropagation()}>
                                <SelectValue placeholder="Выберите редкость" />
                            </SelectTrigger>
                            <SelectContent>
                                {recipe.availableRarities?.map(rarityValue => (
                                    <SelectItem key={rarityValue} value={rarityValue}>
                                        {getRarityName(rarityValue)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Эффект</div>
                    <div className="text-sm font-medium text-left">{recipe.effect}</div>
                </div>
                
                {recipe.recipeType === 'evolution' && evolutionPeers.length > 1 && (
                    <div className="space-y-3 p-3 border rounded-lg">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                            <Zap className="h-4 w-4 text-primary" />
                            Цепочка эволюции
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {evolutionPeers.map(peer => (
                                <Badge
                                    key={peer.id}
                                    variant={peer.id === recipe.id ? "default" : "outline"}
                                    className={`text-xs ${peer.id === recipe.id ? '' : 'cursor-help'}`}
                                    title={`Редкость: ${getRarityName(peer.rarity)}`}
                                >
                                    {peer.name}
                                </Badge>
                            ))}
                        </div>
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
                                isUniversal={isUniversal}
                                selectedRarity={currentRarity}
                            />
                        )) || (
                            <p className="text-sm text-muted-foreground">Нет компонентов</p>
                        )}
                    </div>
                )}
                
                <div className="pt-2 border-t space-y-2">
                    <Button
                        onClick={() => onToggleLaboratory(recipe.id)}
                        variant="outline"
                        className={`w-full text-xs ${
                        isInLaboratory
                        ? 'text-muted-foreground hover:text-destructive hover:border-destructive'
                        : 'text-primary hover:text-primary-foreground'
                        }`}
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