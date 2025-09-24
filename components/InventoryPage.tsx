// components/InventoryPage.tsx

import { useState } from "react";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Separator } from "./ui/separator";
import { Search, Filter, X } from "lucide-react";
import { CompactIngredientCard } from "./CompactIngredientCard";
import { motion, AnimatePresence } from "framer-motion";
import type { useAlchemyStore } from "../hooks/useAlchemyStore";

interface InventoryPageProps {
  store: ReturnType<typeof useAlchemyStore>;
}

const typeOptions = [
  { value: 'herb', label: 'Растения' },
  { value: 'mineral', label: 'Минералы' },
  { value: 'creature', label: 'Существа' },
  { value: 'essence', label: 'Эссенции' },
  { value: 'oil', label: 'Масла' },
  { value: 'crystal', label: 'Кристаллы' }
];

const rarityOptions = [
  { value: 'common', label: 'Обычные' },
  { value: 'uncommon', label: 'Необычные' },
  { value: 'rare', label: 'Редкие' },
  { value: 'very rare', label: 'Очень редкие' },
  { value: 'legendary', label: 'Легендарные' }
];

export function InventoryPage({ store }: InventoryPageProps) {
  const [showFilters, setShowFilters] = useState(false);

  const filteredIngredients = store.getFilteredIngredients();
  const recipesInLab = Array.isArray(store.recipes) ? store.recipes.filter(r => r.inLaboratory) : [];

  // Получаем все уникальные теги
  const allTags = Array.from(new Set(
    Array.isArray(store.ingredients) ? store.ingredients.flatMap(ing => ing.tags || []) : []
  ));

  const handleTypeFilter = (type: string, checked: boolean) => {
    const newTypes = checked
      ? [...store.activeFilters.ingredientTypes, type]
      : store.activeFilters.ingredientTypes.filter(t => t !== type);
    store.updateFilters({ ingredientTypes: newTypes });
  };

  const handleRarityFilter = (rarity: string, checked: boolean) => {
    const newRarities = checked
      ? [...store.activeFilters.rarities, rarity]
      : store.activeFilters.rarities.filter(r => r !== rarity);
    store.updateFilters({ rarities: newRarities });
  };

  const handleTagFilter = (tag: string, checked: boolean) => {
    const newTags = checked
      ? [...store.activeFilters.tags, tag]
      : store.activeFilters.tags.filter(t => t !== tag);
    store.updateFilters({ tags: newTags });
  };

  const handleRecipeFilter = (recipeId: string) => {
    const newRecipes = store.activeFilters.availableForRecipes.includes(recipeId)
      ? store.activeFilters.availableForRecipes.filter(id => id !== recipeId)
      : [...store.activeFilters.availableForRecipes, recipeId];
    store.updateFilters({ availableForRecipes: newRecipes });
  };

  const clearAllFilters = () => {
    store.updateFilters({
      ingredientTypes: [],
      rarities: [],
      tags: [],
      search: '',
      availableForRecipes: []
    });
  };

  const hasActiveFilters =
    store.activeFilters.ingredientTypes.length > 0 ||
    store.activeFilters.rarities.length > 0 ||
    store.activeFilters.tags.length > 0 ||
    store.activeFilters.search.length > 0 ||
    store.activeFilters.availableForRecipes.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Инвентарь ингредиентов</h1>
          <p className="text-muted-foreground">
            Управляйте своими алхимическими ингредиентами
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="ml-auto"
        >
          <Filter className="h-4 w-4 mr-2" />
          Фильтры
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2">
              Активны
            </Badge>
          )}
        </Button>
      </div>

      {/* Поиск */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Поиск ингредиентов..."
          value={store.activeFilters.search}
          onChange={(e) => store.updateFilters({ search: e.target.value })}
          className="pl-10"
        />
      </div>

      {/* Панель фильтров */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="bg-muted/30 p-4 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <h3>Фильтры</h3>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Очистить все
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {/* Тип ингредиентов */}
                <div className="space-y-2">
                  <h4 className="text-sm">Тип</h4>
                  <div className="space-y-2">
                    {typeOptions.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`type-${option.value}`}
                          checked={store.activeFilters.ingredientTypes.includes(option.value)}
                          onCheckedChange={(checked) => handleTypeFilter(option.value, checked as boolean)}
                        />
                        <label htmlFor={`type-${option.value}`} className="text-sm">
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Редкость */}
                <div className="space-y-2">
                  <h4 className="text-sm">Редкость</h4>
                  <div className="space-y-2">
                    {rarityOptions.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`rarity-${option.value}`}
                          checked={store.activeFilters.rarities.includes(option.value)}
                          onCheckedChange={(checked) => handleRarityFilter(option.value, checked as boolean)}
                        />
                        <label htmlFor={`rarity-${option.value}`} className="text-sm">
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Теги */}
                <div className="space-y-2">
                  <h4 className="text-sm">Теги</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-hide">
                    {allTags.map((tag) => (
                      <div key={tag} className="flex items-center space-x-2">
                        <Checkbox
                          id={`tag-${tag}`}
                          checked={store.activeFilters.tags.includes(tag)}
                          onCheckedChange={(checked) => handleTagFilter(tag, checked as boolean)}
                        />
                        <label htmlFor={`tag-${tag}`} className="text-sm">
                          {tag}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Нужны для рецептов */}
                {recipesInLab.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm">Нужны для рецептов</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-hide">
                      {recipesInLab.map((recipe) => (
                        <div key={recipe.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`recipe-${recipe.id}`}
                            checked={store.activeFilters.availableForRecipes.includes(recipe.id)}
                            onCheckedChange={() => handleRecipeFilter(recipe.id)}
                          />
                          <label htmlFor={`recipe-${recipe.id}`} className="text-sm">
                            {recipe.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Separator />

      {/* Результаты */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Найдено: {filteredIngredients.length} из {store.ingredients.length} ингредиентов
        </p>

        {hasActiveFilters && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Активные фильтры:</span>
            <div className="flex gap-1 flex-wrap max-w-full">
              {store.activeFilters.ingredientTypes.slice(0, 3).map(type => (
                <Badge key={type} variant="secondary" className="text-xs">
                  {typeOptions.find(t => t.value === type)?.label}
                </Badge>
              ))}
              {store.activeFilters.ingredientTypes.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{store.activeFilters.ingredientTypes.length - 3} типов
                </Badge>
              )}
              {store.activeFilters.rarities.slice(0, 2).map(rarity => (
                <Badge key={rarity} variant="secondary" className="text-xs">
                  {rarityOptions.find(r => r.value === rarity)?.label}
                </Badge>
              ))}
              {store.activeFilters.rarities.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{store.activeFilters.rarities.length - 2} редкостей
                </Badge>
              )}
              {store.activeFilters.tags.slice(0, 2).map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {store.activeFilters.tags.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{store.activeFilters.tags.length - 2} тегов
                </Badge>
              )}
              {store.activeFilters.availableForRecipes.slice(0, 1).map(recipeId => {
                const recipe = Array.isArray(store.recipes) ? store.recipes.find(r => r.id === recipeId) : undefined;
                return (
                  <Badge key={recipeId} variant="secondary" className="text-xs">
                    {recipe?.name || 'Неизвестный рецепт'}
                  </Badge>
                );
              })}
              {store.activeFilters.availableForRecipes.length > 1 && (
                <Badge variant="secondary" className="text-xs">
                  +{store.activeFilters.availableForRecipes.length - 1} рецептов
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Сетка ингредиентов */}
      <div className="card-grid-responsive">
        {filteredIngredients.map((ingredient) => (
          <motion.div
            key={ingredient.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <CompactIngredientCard
              ingredient={ingredient}
              onQuantityChange={store.updateIngredientQuantity}
            />
          </motion.div>
        ))}
      </div>

      {filteredIngredients.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-muted-foreground">
            Ингредиенты не найдены
          </p>
          {hasActiveFilters && (
            <Button variant="outline" className="mt-2" onClick={clearAllFilters}>
              Очистить фильтры
            </Button>
          )}
        </motion.div>
      )}
    </div>
  );
}