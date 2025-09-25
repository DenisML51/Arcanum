// components/InventoryPage.tsx

import { useState, useMemo, useEffect, useCallback } from "react";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Search, Filter, X, Package, Database } from "lucide-react";
import { CompactIngredientCard } from "../cards/CompactIngredientCard";
import { AllIngredientsCard } from "../cards/AllIngredientsCard";
import { motion, AnimatePresence } from "framer-motion";
import { useAlchemyStore } from "../../hooks/stores/useAlchemyStore";

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
  const [activeTab, setActiveTab] = useState("inventory");
  const [forceUpdate, setForceUpdate] = useState(0);
  const [notifications, setNotifications] = useState<Array<{ id: string; message: string; type: 'success' | 'error' }>>([]);

  // Отслеживаем изменения в store.ingredients
  useEffect(() => {
    setForceUpdate(prev => prev + 1);
  }, [store.ingredients]);

  // Функция для фильтрации ингредиентов
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
      
      // Фильтрация по рецептам - проверяем, используется ли ингредиент в выбранных рецептах
      if (filters.availableForRecipes.length > 0) {
        const isUsedInSelectedRecipes = filters.availableForRecipes.some(recipeId => {
          const recipe = store.recipes.find(r => r.id === recipeId);
          if (!recipe) return false;
          
          // Проверяем, используется ли этот ингредиент в компонентах рецепта
          return recipe.components.some(component => {
            // Проверяем совместимость по типу
            if (component.types && component.types.length > 0) {
              if (!component.types.includes(ingredient.type)) return false;
            }
            
            // Проверяем совместимость по категории
            if (component.categories && component.categories.length > 0) {
              if (!component.categories.includes(ingredient.category)) return false;
            }
            
            // Проверяем элементы - должны быть ВСЕ требуемые элементы
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

  // Фильтрация ингредиентов в наличии
  const filteredInventoryIngredients = useMemo(() => {
    return filterIngredients(store.ingredients);
  }, [store.ingredients, store.activeFilters, store.recipes]);

  // Фильтрация всех ингредиентов с правильным количеством из инвентаря
  const filteredAllIngredients = useMemo(() => {
    const allIngredients = store.allIngredients || [];
    const filtered = filterIngredients(allIngredients);
    
    // Удаляем дубликаты по ID на случай, если они все еще есть
    const uniqueIngredients = filtered.reduce((acc, ingredient) => {
      const existingIndex = acc.findIndex(existing => existing.id === ingredient.id);
      if (existingIndex === -1) {
        acc.push(ingredient);
      }
      return acc;
    }, [] as typeof filtered);
    
    // Для каждого ингредиента проверяем, есть ли он в инвентаре
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

  // Выбираем активный список ингредиентов в зависимости от вкладки
  const filteredIngredients = activeTab === "inventory" ? filteredInventoryIngredients : filteredAllIngredients;
  const recipesInLab = store.getLaboratoryRecipes();

  // Получаем все уникальные теги из активного списка ингредиентов
  const allTags = Array.from(new Set(
    Array.isArray(filteredIngredients) ? filteredIngredients.flatMap(ing => ing.tags || []) : []
  ));

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

  // Функция для добавления уведомления
  const addNotification = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message, type }]);
    
    // Автоматически удаляем уведомление через 3 секунды
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  }, []);

  // Функция для добавления ингредиента
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
      // Если ингредиент уже есть, увеличиваем количество
      store.updateIngredientQuantity(id, existingIngredient.quantity + 1);
      addNotification(`Добавлен ${allIngredient.name} (теперь: ${existingIngredient.quantity + 1})`);
    } else {
      // Если ингредиента нет, добавляем новый
      const newIngredient = { 
        ...allIngredient, 
        quantity: 1
      };
      store.addIngredient(newIngredient);
      addNotification(`Добавлен ${allIngredient.name} в инвентарь`);
    }

  }, [store.allIngredients, store.ingredients, store.addIngredient, store.updateIngredientQuantity, addNotification]);

  // Функция для удаления ингредиента
  const handleRemoveIngredient = useCallback((id: string) => {
    const existingIngredient = Array.isArray(store.ingredients) 
      ? store.ingredients.find(ing => ing.id === id)
      : null;

    if (!existingIngredient) {
      // Получаем название ингредиента из allIngredients для сообщения
      const allIngredient = store.allIngredients?.find(ing => ing.id === id);
      const ingredientName = allIngredient?.name || 'Ингредиент';
      addNotification(`${ingredientName} отсутствует в инвентаре`, 'error');
      return;
    }

    if (existingIngredient.quantity > 1) {
      // Если больше 1, уменьшаем количество
      store.updateIngredientQuantity(id, existingIngredient.quantity - 1);
      addNotification(`Убран ${existingIngredient.name} (осталось: ${existingIngredient.quantity - 1})`);
    } else {
      // Если 1 или меньше, удаляем полностью
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

      {/* Вкладки */}
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
            typeOptions={typeOptions}
            rarityOptions={rarityOptions}
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
            handleAddIngredient={handleAddIngredient}
            handleRemoveIngredient={handleRemoveIngredient}
            typeOptions={typeOptions}
            rarityOptions={rarityOptions}
          />
        </TabsContent>
      </Tabs>

      {/* Уведомления */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        <AnimatePresence>
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 300, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.8 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`p-3 rounded-lg shadow-lg max-w-sm ${
                notification.type === 'success' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-red-500 text-white'
              }`}
            >
              <p className="text-sm font-medium">{notification.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Компонент для отображения ингредиентов в наличии
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
  typeOptions, 
  rarityOptions 
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
  typeOptions: any[];
  rarityOptions: any[];
}) {
  return (
    <>
      {/* Поиск */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Поиск ингредиентов..."
          value={store.activeFilters.search}
          onChange={(e) => store.updateFilter('search', e.target.value)}
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

// Компонент для отображения всех ингредиентов
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
  handleAddIngredient,
  handleRemoveIngredient,
  typeOptions, 
  rarityOptions 
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
  handleAddIngredient: (id: string) => void;
  handleRemoveIngredient: (id: string) => void;
  typeOptions: any[];
  rarityOptions: any[];
}) {
  return (
    <>
      {/* Поиск */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Поиск ингредиентов..."
          value={store.activeFilters.search}
          onChange={(e) => store.updateFilter('search', e.target.value)}
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
        <AnimatePresence mode="popLayout">
          {filteredIngredients.map((ingredient) => {
            // Используем уже вычисленное значение isInInventory из filteredAllIngredients
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