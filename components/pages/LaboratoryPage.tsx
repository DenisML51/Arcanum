// components/pages/LaboratoryPage.tsx

import { useState, useCallback, useMemo } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Alert, AlertDescription } from "../ui/alert";
import { CompactRecipeCard } from "../cards/CompactRecipeCard";
import { FilterDrawer, FilterGroup, FilterCheckbox } from "../common/FilterDrawer";
import { FlaskConical, AlertTriangle, CheckCircle, Search, Filter, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAlchemyStore } from "../../hooks/stores/useAlchemyStore";
import type { PotionRarity } from "../../hooks/types";

interface LaboratoryPageProps {
  store: ReturnType<typeof useAlchemyStore>;
}

export function LaboratoryPage({ store }: LaboratoryPageProps) {
  const [isBrewingMode, setIsBrewingMode] = useState(false);
  const [notifications, setNotifications] = useState<Array<{ id: string; message: string; type: 'success' | 'error' }>>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedRarities, setSelectedRarities] = useState<string[]>([]);
  const [selectedPotionTypes, setSelectedPotionTypes] = useState<string[]>([]);
  const [selectedPotionQualities, setSelectedPotionQualities] = useState<string[]>([]);

  const laboratoryRecipes = store.getLaboratoryRecipes();

  const activeEquipment = store.availableEquipment.find(eq => eq.id === store.character.activeEquipmentId);
  const equipmentBonus = activeEquipment ? activeEquipment.brewingBonus : 0;
  const proficiencyBonus = store.character.alchemyToolsProficiency ? 2 : 0;
  const totalCharacterBonus = equipmentBonus + proficiencyBonus;

  const addNotification = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  }, []);

  const handleBrew = (recipeId: string, brewingRarity?: PotionRarity) => {
    const recipe = store.recipes.find(r => r.id === recipeId);
    if (!recipe) return;
    const result = store.brewPotion(recipe, brewingRarity || recipe.rarity);
    if (result.success) {
      addNotification(result.message, 'success');
    } else {
      addNotification(result.message, 'error');
    }
  };

  const totalRecipes = laboratoryRecipes.length;

  // Опции для фильтров
  const rarityOptions = [
    { value: 'common', label: 'Обычная' },
    { value: 'uncommon', label: 'Необычная' },
    { value: 'rare', label: 'Редкая' },
    { value: 'very rare', label: 'Очень редкая' },
    { value: 'legendary', label: 'Легендарная' },
    { value: 'artifact', label: 'Артефакт' }
  ];

  const potionTypeOptions = [
    { value: 'potion', label: 'Зелье' },
    { value: 'elixir', label: 'Эликсир' },
    { value: 'oil', label: 'Масло' }
  ];

  const potionQualityOptions = [
    { value: 'low', label: 'Низкое' },
    { value: 'medium', label: 'Среднее' },
    { value: 'high', label: 'Высокое' }
  ];

  // Фильтрация рецептов
  const filteredRecipes = useMemo(() => {
    return laboratoryRecipes.filter(recipe => {
      // Поиск по названию, описанию и эффекту
      const matchesSearch = !searchTerm || 
        recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.effect.toLowerCase().includes(searchTerm.toLowerCase());

      // Фильтр по редкости
      const matchesRarity = selectedRarities.length === 0 || selectedRarities.includes(recipe.rarity);

      // Фильтр по типу зелья
      const matchesPotionType = selectedPotionTypes.length === 0 || selectedPotionTypes.includes(recipe.potionType);

      // Фильтр по качеству зелья
      const matchesPotionQuality = selectedPotionQualities.length === 0 || selectedPotionQualities.includes(recipe.potionQuality);

      return matchesSearch && matchesRarity && matchesPotionType && matchesPotionQuality;
    });
  }, [laboratoryRecipes, searchTerm, selectedRarities, selectedPotionTypes, selectedPotionQualities]);

  // Проверка наличия активных фильтров
  const hasActiveFilters = searchTerm !== "" || 
    selectedRarities.length > 0 || 
    selectedPotionTypes.length > 0 || 
    selectedPotionQualities.length > 0;

  // Очистка всех фильтров
  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedRarities([]);
    setSelectedPotionTypes([]);
    setSelectedPotionQualities([]);
  };

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div>
            <h1>Алхимическая лаборатория</h1>
            <p className="text-muted-foreground">
                Варите зелья из добавленных рецептов
            </p>
            </div>
            <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
                <FlaskConical className="h-3 w-3" />
                {filteredRecipes.length} из {totalRecipes} рецептов
            </Badge>
            </div>
        </div>

        {/* Поиск и фильтры */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по названию, описанию или эффекту..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setIsFilterOpen(true)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Фильтры
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                Активны
              </Badge>
            )}
          </Button>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="gap-1"
            >
              <X className="h-4 w-4" />
              Очистить
            </Button>
          )}
        </div>


      {totalRecipes === 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            В лаборатории нет рецептов. Добавьте рецепты из книги рецептов, чтобы начать варить зелья.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {laboratoryRecipes.length > 0 ? (
          <>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {hasActiveFilters 
                    ? `${filteredRecipes.length} из ${totalRecipes} рецептов соответствуют фильтрам`
                    : `${totalRecipes} рецептов в лаборатории`
                  }
                </p>
                {isBrewingMode && (
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                    ✓ Режим варки активен - выберите ингредиенты и изготовьте зелья
                  </p>
                )}
              </div>
              <Button
                variant={isBrewingMode ? "destructive" : "default"}
                onClick={() => setIsBrewingMode(!isBrewingMode)}
                size="sm"
                className={`transition-all duration-200 ${
                  isBrewingMode 
                    ? 'bg-red-600 hover:bg-red-700 shadow-lg' 
                    : 'bg-green-600 hover:bg-green-700 shadow-lg'
                }`}
              >
                <FlaskConical className="h-4 w-4 mr-2" />
                {isBrewingMode ? 'Завершить варку' : 'Начать варку'}
              </Button>
            </div>
            {filteredRecipes.length > 0 ? (
              <div className="card-grid-responsive">
                {filteredRecipes.map((recipe) => (
                <motion.div
                  key={recipe.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <CompactRecipeCard
                    recipe={recipe}
                    ingredients={store.ingredients}
                    allRecipes={store.recipes}
                    onToggleLaboratory={(recipeId) => store.removeRecipeFromLaboratory(recipeId)}
                    onBrew={(recipeId, brewingRarity) => handleBrew(recipeId, brewingRarity)}
                    canBrew={isBrewingMode}
                    characterBonus={totalCharacterBonus}
                    isInLaboratory={true}
                    brewingMode={store.character.brewingMode}
                    onSelectIngredient={store.selectIngredientForComponent}
                    getSelectedIngredient={store.getSelectedIngredient}
                    toggleMagicalDust={store.toggleMagicalDust}
                    isMagicalDustActive={store.isMagicalDustActive}
                    hasMagicalDust={store.hasMagicalDust}
                  />
                </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="space-y-2">
                  <Search className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Рецепты не найдены
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Попробуйте изменить поисковый запрос или фильтры
                  </p>
                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearAllFilters}
                      className="mt-4"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Очистить фильтры
                    </Button>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="space-y-2">
                <FlaskConical className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">
                    Лаборатория пуста
                </p>
                <p className="text-sm text-muted-foreground">
                    Добавьте рецепты из книги рецептов, чтобы начать варить зелья
                </p>
            </div>
          </div>
        )}
      </div>

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        hasActiveFilters={hasActiveFilters}
        clearAllFilters={clearAllFilters}
      >
        <FilterGroup 
          title="Редкость" 
          activeCount={selectedRarities.length}
        >
          {rarityOptions.map((option) => (
            <FilterCheckbox
              key={option.value}
              id={`rarity-${option.value}`}
              label={option.label}
              checked={selectedRarities.includes(option.value)}
              onCheckedChange={(checked) => {
                if (checked) {
                  setSelectedRarities(prev => [...prev, option.value]);
                } else {
                  setSelectedRarities(prev => prev.filter(r => r !== option.value));
                }
              }}
            />
          ))}
        </FilterGroup>

        <FilterGroup 
          title="Тип зелья" 
          activeCount={selectedPotionTypes.length}
        >
          {potionTypeOptions.map((option) => (
            <FilterCheckbox
              key={option.value}
              id={`potion-type-${option.value}`}
              label={option.label}
              checked={selectedPotionTypes.includes(option.value)}
              onCheckedChange={(checked) => {
                if (checked) {
                  setSelectedPotionTypes(prev => [...prev, option.value]);
                } else {
                  setSelectedPotionTypes(prev => prev.filter(t => t !== option.value));
                }
              }}
            />
          ))}
        </FilterGroup>

        <FilterGroup 
          title="Качество зелья" 
          activeCount={selectedPotionQualities.length}
        >
          {potionQualityOptions.map((option) => (
            <FilterCheckbox
              key={option.value}
              id={`potion-quality-${option.value}`}
              label={option.label}
              checked={selectedPotionQualities.includes(option.value)}
              onCheckedChange={(checked) => {
                if (checked) {
                  setSelectedPotionQualities(prev => [...prev, option.value]);
                } else {
                  setSelectedPotionQualities(prev => prev.filter(q => q !== option.value));
                }
              }}
            />
          ))}
        </FilterGroup>
      </FilterDrawer>

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