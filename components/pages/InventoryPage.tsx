// components/InventoryPage.tsx

import { useState, useMemo, useEffect, useCallback } from "react";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Search, Filter, X, Package, Database, CheckCircle, AlertTriangle } from "lucide-react";
import { CompactIngredientCard } from "../cards/CompactIngredientCard";
import { AllIngredientsCard } from "../cards/AllIngredientsCard";
import { motion, AnimatePresence } from "framer-motion";
import { useAlchemyStore } from "@/hooks/stores/useAlchemyStore.ts";
import { ALCHEMICAL_ELEMENT_DETAILS } from "@/hooks/types";
import { FilterDrawer, FilterGroup, FilterCheckbox } from "../common/FilterDrawer";

interface InventoryPageProps {
  store: ReturnType<typeof useAlchemyStore>;
}

const typeOptions = [
  { value: 'plant', label: 'Растения' },
  { value: 'mineral', label: 'Минералы' },
  { value: 'creature', label: 'Существа' },
  { value: 'other', label: 'Иное' },
  { value: 'spring_water', label: 'Родниковая вода' },
  { value: 'enchanted_ink', label: 'Волшебные чернила' },
  { value: 'thick_magical_ink', label: 'Густые волшебные чернила' },
  { value: 'dissolved_ether', label: 'Растворённый эфир' }
];

const rarityOptions = [
  { value: 'common', label: 'Обычные' },
  { value: 'uncommon', label: 'Необычные' },
  { value: 'rare', label: 'Редкие' },
  { value: 'very rare', label: 'Очень редкие' },
  { value: 'legendary', label: 'Легендарные' }
];

// Получаем все уникальные элементы из данных ингредиентов
const getElementOptions = (ingredients: any[]) => {
  const allElements = new Set<string>();
  ingredients.forEach(ingredient => {
    if (ingredient.elements && Array.isArray(ingredient.elements)) {
      ingredient.elements.forEach((element: string) => {
        if (element && element.trim()) { // Проверяем, что элемент не пустой
          allElements.add(element);
        }
      });
    }
  });
  
  
  return Array.from(allElements).sort().map(element => {
    // Используем детали элементов из types.ts
    const elementDetails = ALCHEMICAL_ELEMENT_DETAILS[element as any];
    return {
      value: element,
      label: elementDetails ? `${elementDetails.name} (${elementDetails.shortCode})` : element,
      category: elementDetails?.category || 'Неизвестно',
      color: elementDetails?.color || 'bg-gray-400'
    };
  });
};

const potionBaseOptions = [
  { value: 'spring_water', label: 'Родниковая вода' },
  { value: 'enchanted_ink', label: 'Волшебные чернила' },
  { value: 'thick_magical_ink', label: 'Густые волшебные чернила' },
  { value: 'dissolved_ether', label: 'Растворённый эфир' },
  { value: 'irminsul_juice', label: 'Сок Ирминсуля' }
];

export function InventoryPage({ store }: InventoryPageProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState("inventory");
  const [forceUpdate, setForceUpdate] = useState(0);
  const [notifications, setNotifications] = useState<Array<{ id: string; message: string; type: 'success' | 'error' }>>([]);

  useEffect(() => {
    setForceUpdate(prev => prev + 1);
  }, [store.ingredients]);

  const filterIngredients = (ingredients: typeof store.ingredients) => {
    return ingredients.filter(ingredient => {
      const filters = store.activeFilters;
      
      if (filters.search && !ingredient.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      
      if (filters.ingredientTypes.length > 0 && !filters.ingredientTypes.includes(ingredient.type)) {
        return false;
      }
      
      if (filters.rarities.length > 0 && !filters.rarities.includes(ingredient.rarity)) {
        return false;
      }
      
      if (filters.tags.length > 0 && !filters.tags.some(tag => ingredient.tags.includes(tag))) {
        return false;
      }
      
      // Фильтрация по элементам
      if (filters.elements && filters.elements.length > 0) {
        const hasAnyElement = filters.elements.some(element => 
          ingredient.elements && ingredient.elements.includes(element as any)
        );
        if (!hasAnyElement) {
          return false;
        }
      }
      
      // Фильтрация по базам зелий
      if (filters.potionBases && filters.potionBases.length > 0) {
        const isPotionBase = ingredient.isBase && filters.potionBases.includes(ingredient.type);
        if (!isPotionBase) {
          return false;
        }
      }
      
      if (filters.availableForRecipes.length > 0) {
        const isUsedInSelectedRecipes = filters.availableForRecipes.some(recipeId => {
          const recipe = store.recipes.find(r => r.id === recipeId);
          if (!recipe) return false;
          
          return recipe.components.some(component => {
            if (component.types && component.types.length > 0) {
              if (!component.types.includes(ingredient.type)) return false;
            }
            
            if (component.categories && component.categories.length > 0) {
              if (!component.categories.includes(ingredient.category)) return false;
            }
            
            if (component.requiredElements && component.requiredElements.length > 0) {
              const hasAllRequiredElements = component.requiredElements.every(requiredElement =>
                ingredient.elements && ingredient.elements.includes(requiredElement)
              );
              if (!hasAllRequiredElements) return false;
            }
            
            return true;
          });
        });
        
        if (!isUsedInSelectedRecipes) {
          return false;
        }
      }
      
      return true;
    });
  };

  const filteredInventoryIngredients = useMemo(() => {
    return filterIngredients(store.ingredients);
  }, [store.ingredients, store.activeFilters, store.recipes]);

  const filteredAllIngredients = useMemo(() => {
    const allIngredients = store.allIngredients || [];
    const filtered = filterIngredients(allIngredients);
    
    const uniqueIngredients = filtered.reduce((acc, ingredient) => {
      const existingIndex = acc.findIndex(existing => existing.id === ingredient.id);
      if (existingIndex === -1) {
        acc.push(ingredient);
      }
      return acc;
    }, [] as typeof filtered);
    
    const result = uniqueIngredients.map(ingredient => {
      const inventoryIngredient = Array.isArray(store.ingredients)
        ? store.ingredients.find(inv => inv.id === ingredient.id)
        : null;
      const quantity = inventoryIngredient ? inventoryIngredient.quantity : 0;
      const isInInventory = !!inventoryIngredient;

      return {
        ...ingredient,
        quantity,
        isInInventory
      };
    });

    return result;
  }, [store.allIngredients, store.ingredients, store.activeFilters, store.recipes, forceUpdate]);

  const filteredIngredients = activeTab === "inventory" ? filteredInventoryIngredients : filteredAllIngredients;
  const recipesInLab = store.getLaboratoryRecipes();

  const allTags = Array.from(new Set(
    Array.isArray(filteredIngredients) ? filteredIngredients.flatMap(ing => ing.tags || []) : []
  ));

  // Получаем опции элементов из всех ингредиентов
  const elementOptions = useMemo(() => {
    const allIngredients = store.allIngredients || [];
    return getElementOptions(allIngredients);
  }, [store.allIngredients]);

  const handleTypeFilter = (type: string, checked: boolean) => {
    const newTypes = checked
      ? [...store.activeFilters.ingredientTypes, type]
      : store.activeFilters.ingredientTypes.filter(t => t !== type);
    store.updateFilter('ingredientTypes', newTypes);
  };

  const handleRarityFilter = (rarity: string, checked: boolean) => {
    const newRarities = checked
      ? [...store.activeFilters.rarities, rarity]
      : store.activeFilters.rarities.filter(r => r !== rarity);
    store.updateFilter('rarities', newRarities);
  };

  const handleTagFilter = (tag: string, checked: boolean) => {
    const newTags = checked
      ? [...store.activeFilters.tags, tag]
      : store.activeFilters.tags.filter(t => t !== tag);
    store.updateFilter('tags', newTags);
  };

  const handleRecipeFilter = (recipeId: string) => {
    const newRecipes = store.activeFilters.availableForRecipes.includes(recipeId)
      ? store.activeFilters.availableForRecipes.filter(id => id !== recipeId)
      : [...store.activeFilters.availableForRecipes, recipeId];
    store.updateFilter('availableForRecipes', newRecipes);
  };

  const handleElementFilter = (element: string, checked: boolean) => {
    const newElements = checked
      ? [...store.activeFilters.elements, element]
      : store.activeFilters.elements.filter(e => e !== element);
    store.updateFilter('elements', newElements);
  };

  const handlePotionBaseFilter = (base: string, checked: boolean) => {
    const newBases = checked
      ? [...store.activeFilters.potionBases, base]
      : store.activeFilters.potionBases.filter(b => b !== base);
    store.updateFilter('potionBases', newBases);
  };

  const addNotification = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  }, []);

  const handleAddIngredient = useCallback((id: string) => {
    const allIngredient = store.allIngredients?.find(ing => ing.id === id);
    if (!allIngredient) {
      addNotification('Ингредиент не найден', 'error');
      return;
    }

    const existingIngredient = Array.isArray(store.ingredients) 
      ? store.ingredients.find(ing => ing.id === id)
      : null;

    if (existingIngredient) {
      store.updateIngredientQuantity(id, existingIngredient.quantity + 1);
      addNotification(`Добавлен ${allIngredient.name} (теперь: ${existingIngredient.quantity + 1})`);
    } else {
      const newIngredient = {
        ...allIngredient, 
        quantity: 1
      };
      store.addIngredient(newIngredient);
      addNotification(`Добавлен ${allIngredient.name} в инвентарь`);
    }

  }, [store.allIngredients, store.ingredients, store.addIngredient, store.updateIngredientQuantity, addNotification]);

  const handleRemoveIngredient = useCallback((id: string) => {
    const existingIngredient = Array.isArray(store.ingredients) 
      ? store.ingredients.find(ing => ing.id === id)
      : null;

    if (!existingIngredient) {
      const allIngredient = store.allIngredients?.find(ing => ing.id === id);
      const ingredientName = allIngredient?.name || 'Ингредиент';
      addNotification(`${ingredientName} отсутствует в инвентаре`, 'error');
      return;
    }

    if (existingIngredient.quantity > 1) {
      store.updateIngredientQuantity(id, existingIngredient.quantity - 1);
      addNotification(`Убран ${existingIngredient.name} (осталось: ${existingIngredient.quantity - 1})`);
    } else {
      store.removeIngredient(id);
      addNotification(`Удален ${existingIngredient.name} из инвентаря`);
    }

  }, [store.ingredients, store.allIngredients, store.updateIngredientQuantity, store.removeIngredient, addNotification]);

  const clearAllFilters = () => {
    store.updateFilter('ingredientTypes', []);
    store.updateFilter('rarities', []);
    store.updateFilter('tags', []);
    store.updateFilter('search', '');
    store.updateFilter('availableForRecipes', []);
    store.updateFilter('elements', []);
    store.updateFilter('potionBases', []);
  };

  const hasActiveFilters =
    store.activeFilters.ingredientTypes.length > 0 ||
    store.activeFilters.rarities.length > 0 ||
    store.activeFilters.tags.length > 0 ||
    store.activeFilters.search.length > 0 ||
    store.activeFilters.availableForRecipes.length > 0 ||
    store.activeFilters.elements.length > 0 ||
    store.activeFilters.potionBases.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Инвентарь ингредиентов</h1>
          <p className="text-muted-foreground">
            Управляйте своими алхимическими ингредиентами
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => store.cleanDuplicates()}
            size="sm"
          >
            <X className="h-4 w-4 mr-2" />
            Очистить дубликаты
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
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
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            В наличии ({store.ingredients.length})
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Все ингредиенты ({store.allIngredients?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-6">
          <InventoryContent 
            filteredIngredients={filteredInventoryIngredients}
            store={store}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            hasActiveFilters={hasActiveFilters}
            clearAllFilters={clearAllFilters}
            allTags={allTags}
            recipesInLab={recipesInLab}
            handleTypeFilter={handleTypeFilter}
            handleRarityFilter={handleRarityFilter}
            handleTagFilter={handleTagFilter}
            handleRecipeFilter={handleRecipeFilter}
            handleElementFilter={handleElementFilter}
            handlePotionBaseFilter={handlePotionBaseFilter}
            typeOptions={typeOptions}
            rarityOptions={rarityOptions}
            elementOptions={elementOptions}
            potionBaseOptions={potionBaseOptions}
          />
        </TabsContent>

        <TabsContent value="all" className="space-y-6">
          <AllIngredientsContent 
            filteredIngredients={filteredAllIngredients}
            store={store}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            hasActiveFilters={hasActiveFilters}
            clearAllFilters={clearAllFilters}
            allTags={allTags}
            recipesInLab={recipesInLab}
            handleTypeFilter={handleTypeFilter}
            handleRarityFilter={handleRarityFilter}
            handleTagFilter={handleTagFilter}
            handleRecipeFilter={handleRecipeFilter}
            handleElementFilter={handleElementFilter}
            handlePotionBaseFilter={handlePotionBaseFilter}
            handleAddIngredient={handleAddIngredient}
            handleRemoveIngredient={handleRemoveIngredient}
            typeOptions={typeOptions}
            rarityOptions={rarityOptions}
            elementOptions={elementOptions}
            potionBaseOptions={potionBaseOptions}
          />
        </TabsContent>
      </Tabs>

      <div className="fixed bottom-4 right-4 z-50 space-y-3">
        <AnimatePresence>
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 300, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.8 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`flex items-start gap-3 p-4 rounded-lg shadow-lg max-w-sm backdrop-blur-sm border ${
                notification.type === 'success' 
                  ? 'bg-green-500/80 text-white border-green-400/50' 
                  : 'bg-red-500/80 text-white border-red-400/50'
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {notification.type === 'success' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">
                  {notification.message}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function InventoryContent({
  filteredIngredients, 
  store, 
  showFilters, 
  setShowFilters, 
  hasActiveFilters, 
  clearAllFilters, 
  allTags, 
  recipesInLab, 
  handleTypeFilter, 
  handleRarityFilter, 
  handleTagFilter, 
  handleRecipeFilter,
  handleElementFilter,
  handlePotionBaseFilter,
  typeOptions, 
  rarityOptions,
  elementOptions,
  potionBaseOptions
}: {
  filteredIngredients: any[];
  store: any;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  hasActiveFilters: boolean;
  clearAllFilters: () => void;
  allTags: string[];
  recipesInLab: any[];
  handleTypeFilter: (type: string, checked: boolean) => void;
  handleRarityFilter: (rarity: string, checked: boolean) => void;
  handleTagFilter: (tag: string, checked: boolean) => void;
  handleRecipeFilter: (recipeId: string) => void;
  handleElementFilter: (element: string, checked: boolean) => void;
  handlePotionBaseFilter: (base: string, checked: boolean) => void;
  typeOptions: any[];
  rarityOptions: any[];
  elementOptions: any[];
  potionBaseOptions: any[];
}) {
  return (
    <>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Поиск ингредиентов..."
          value={store.activeFilters.search}
          onChange={(e) => store.updateFilter('search', e.target.value)}
          className="pl-10"
        />
      </div>

      <FilterDrawer
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        hasActiveFilters={hasActiveFilters}
        clearAllFilters={clearAllFilters}
      >
        <FilterGroup 
          title="Тип" 
          activeCount={store.activeFilters.ingredientTypes.length}
        >
          {typeOptions.map((option) => (
            <FilterCheckbox
              key={option.value}
              id={`type-${option.value}`}
              label={option.label}
              checked={store.activeFilters.ingredientTypes.includes(option.value)}
              onCheckedChange={(checked) => handleTypeFilter(option.value, checked)}
            />
          ))}
        </FilterGroup>

        <FilterGroup 
          title="Редкость" 
          activeCount={store.activeFilters.rarities.length}
        >
          {rarityOptions.map((option) => (
            <FilterCheckbox
              key={option.value}
              id={`rarity-${option.value}`}
              label={option.label}
              checked={store.activeFilters.rarities.includes(option.value)}
              onCheckedChange={(checked) => handleRarityFilter(option.value, checked)}
            />
          ))}
        </FilterGroup>

        <FilterGroup 
          title="Теги"
          activeCount={store.activeFilters.tags.length}
        >
          <div className="max-h-40 overflow-y-auto scrollbar-hide">
            {allTags.map((tag) => (
              <FilterCheckbox
                key={tag}
                id={`tag-${tag}`}
                label={tag}
                checked={store.activeFilters.tags.includes(tag)}
                onCheckedChange={(checked) => handleTagFilter(tag, checked)}
              />
            ))}
          </div>
        </FilterGroup>

        <FilterGroup 
          title={`Элементы (${elementOptions.length})`}
          activeCount={store.activeFilters.elements.length}
        >
          <div className="max-h-40 overflow-y-auto scrollbar-hide">
            {elementOptions.length === 0 && (
              <p className="text-xs text-muted-foreground">Элементы не найдены</p>
            )}
            {elementOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`element-${option.value}`}
                  checked={store.activeFilters.elements.includes(option.value)}
                  onCheckedChange={(checked) => handleElementFilter(option.value, checked as boolean)}
                />
                <label htmlFor={`element-${option.value}`} className="text-sm flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${option.color}`}></span>
                  <span>{option.label}</span>
                  <span className="text-xs text-muted-foreground">({option.category})</span>
                </label>
              </div>
            ))}
          </div>
        </FilterGroup>

        <FilterGroup 
          title="Базы зелий"
          activeCount={store.activeFilters.potionBases.length}
        >
          {potionBaseOptions.map((option) => (
            <FilterCheckbox
              key={option.value}
              id={`potion-base-${option.value}`}
              label={option.label}
              checked={store.activeFilters.potionBases.includes(option.value)}
              onCheckedChange={(checked) => handlePotionBaseFilter(option.value, checked)}
            />
          ))}
        </FilterGroup>

        {recipesInLab.length > 0 && (
          <FilterGroup 
            title="Нужны для рецептов"
            activeCount={store.activeFilters.availableForRecipes.length}
          >
            <div className="max-h-40 overflow-y-auto scrollbar-hide">
              {recipesInLab.map((recipe) => (
                <FilterCheckbox
                  key={recipe.id}
                  id={`recipe-${recipe.id}`}
                  label={recipe.name}
                  checked={store.activeFilters.availableForRecipes.includes(recipe.id)}
                  onCheckedChange={() => handleRecipeFilter(recipe.id)}
                />
              ))}
            </div>
          </FilterGroup>
        )}
      </FilterDrawer>

      <Separator />

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
              {store.activeFilters.elements.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {store.activeFilters.elements.length} элементов
                </Badge>
              )}
              {store.activeFilters.potionBases.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {store.activeFilters.potionBases.length} баз
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

      <div className="card-grid-responsive">
        <AnimatePresence mode="popLayout">
          {filteredIngredients.map((ingredient) => (
            <motion.div
              key={`${ingredient.id}-${ingredient.quantity}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              layout
            >
              <CompactIngredientCard
                ingredient={ingredient}
                onQuantityChange={store.updateIngredientQuantity}
              />
            </motion.div>
          ))}
        </AnimatePresence>
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
    </>
  );
}

function AllIngredientsContent({
  filteredIngredients, 
  store, 
  showFilters, 
  setShowFilters, 
  hasActiveFilters, 
  clearAllFilters, 
  allTags, 
  recipesInLab, 
  handleTypeFilter, 
  handleRarityFilter, 
  handleTagFilter, 
  handleRecipeFilter,
  handleElementFilter,
  handlePotionBaseFilter,
  handleAddIngredient,
  handleRemoveIngredient,
  typeOptions, 
  rarityOptions,
  elementOptions,
  potionBaseOptions
}: {
  filteredIngredients: any[];
  store: any;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  hasActiveFilters: boolean;
  clearAllFilters: () => void;
  allTags: string[];
  recipesInLab: any[];
  handleTypeFilter: (type: string, checked: boolean) => void;
  handleRarityFilter: (rarity: string, checked: boolean) => void;
  handleTagFilter: (tag: string, checked: boolean) => void;
  handleRecipeFilter: (recipeId: string) => void;
  handleElementFilter: (element: string, checked: boolean) => void;
  handlePotionBaseFilter: (base: string, checked: boolean) => void;
  handleAddIngredient: (id: string) => void;
  handleRemoveIngredient: (id: string) => void;
  typeOptions: any[];
  rarityOptions: any[];
  elementOptions: any[];
  potionBaseOptions: any[];
}) {
  return (
    <>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Поиск ингредиентов..."
          value={store.activeFilters.search}
          onChange={(e) => store.updateFilter('search', e.target.value)}
          className="pl-10"
        />
      </div>

      <FilterDrawer
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        hasActiveFilters={hasActiveFilters}
        clearAllFilters={clearAllFilters}
      >
        <FilterGroup 
          title="Тип" 
          activeCount={store.activeFilters.ingredientTypes.length}
        >
          {typeOptions.map((option) => (
            <FilterCheckbox
              key={option.value}
              id={`type-${option.value}`}
              label={option.label}
              checked={store.activeFilters.ingredientTypes.includes(option.value)}
              onCheckedChange={(checked) => handleTypeFilter(option.value, checked)}
            />
          ))}
        </FilterGroup>

        <FilterGroup 
          title="Редкость" 
          activeCount={store.activeFilters.rarities.length}
        >
          {rarityOptions.map((option) => (
            <FilterCheckbox
              key={option.value}
              id={`rarity-${option.value}`}
              label={option.label}
              checked={store.activeFilters.rarities.includes(option.value)}
              onCheckedChange={(checked) => handleRarityFilter(option.value, checked)}
            />
          ))}
        </FilterGroup>

        <FilterGroup 
          title="Теги"
          activeCount={store.activeFilters.tags.length}
        >
          <div className="max-h-40 overflow-y-auto scrollbar-hide">
            {allTags.map((tag) => (
              <FilterCheckbox
                key={tag}
                id={`tag-${tag}`}
                label={tag}
                checked={store.activeFilters.tags.includes(tag)}
                onCheckedChange={(checked) => handleTagFilter(tag, checked)}
              />
            ))}
          </div>
        </FilterGroup>

        <FilterGroup 
          title={`Элементы (${elementOptions.length})`}
          activeCount={store.activeFilters.elements.length}
        >
          <div className="max-h-40 overflow-y-auto scrollbar-hide">
            {elementOptions.length === 0 && (
              <p className="text-xs text-muted-foreground">Элементы не найдены</p>
            )}
            {elementOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`element-${option.value}`}
                  checked={store.activeFilters.elements.includes(option.value)}
                  onCheckedChange={(checked) => handleElementFilter(option.value, checked as boolean)}
                />
                <label htmlFor={`element-${option.value}`} className="text-sm flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${option.color}`}></span>
                  <span>{option.label}</span>
                  <span className="text-xs text-muted-foreground">({option.category})</span>
                </label>
              </div>
            ))}
          </div>
        </FilterGroup>

        <FilterGroup 
          title="Базы зелий"
          activeCount={store.activeFilters.potionBases.length}
        >
          {potionBaseOptions.map((option) => (
            <FilterCheckbox
              key={option.value}
              id={`base-${option.value}`}
              label={option.label}
              checked={store.activeFilters.potionBases.includes(option.value)}
              onCheckedChange={(checked) => handlePotionBaseFilter(option.value, checked)}
            />
          ))}
        </FilterGroup>

        {recipesInLab.length > 0 && (
          <FilterGroup 
            title="Нужны для рецептов"
            activeCount={store.activeFilters.availableForRecipes.length}
          >
            <div className="max-h-40 overflow-y-auto scrollbar-hide">
              {recipesInLab.map((recipe) => (
                <FilterCheckbox
                  key={recipe.id}
                  id={`recipe-${recipe.id}`}
                  label={recipe.name}
                  checked={store.activeFilters.availableForRecipes.includes(recipe.id)}
                  onCheckedChange={() => handleRecipeFilter(recipe.id)}
                />
              ))}
            </div>
          </FilterGroup>
        )}
      </FilterDrawer>

      <Separator />

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Найдено: {filteredIngredients.length} из {store.allIngredients?.length || 0} ингредиентов
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
              {store.activeFilters.elements.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {store.activeFilters.elements.length} элементов
                </Badge>
              )}
              {store.activeFilters.potionBases.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {store.activeFilters.potionBases.length} баз
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

      <div className="card-grid-responsive">
        <AnimatePresence mode="popLayout">
          {filteredIngredients.map((ingredient) => {
            const isInInventory = ingredient.isInInventory || false;
            
            return (
              <motion.div
                key={`${ingredient.id}-all`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                layout
              >
                <AllIngredientsCard
                  ingredient={ingredient}
                  onAdd={handleAddIngredient}
                  onRemove={handleRemoveIngredient}
                  isInInventory={isInInventory}
                  inventoryQuantity={ingredient.quantity}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
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
    </>
  );
}