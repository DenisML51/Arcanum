// components/PotionsPage.tsx

import { useState } from "react";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";
import { Search, Filter, X, FlaskConical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CompactPotionCard } from "../cards/CompactPotionCard";
import { useAlchemyStore } from "../../hooks/stores/useAlchemyStore";
import { FilterDrawer, FilterGroup, FilterCheckbox } from "../common/FilterDrawer";

interface PotionsPageProps {
  store: ReturnType<typeof useAlchemyStore>;
}

const rarityColors = {
  'common': 'bg-gray-500',
  'uncommon': 'bg-green-500',
  'rare': 'bg-blue-500',
  'very rare': 'bg-purple-500',
  'legendary': 'bg-orange-500'
};

const rarityOptions = [
  { value: 'common', label: 'Обычные' },
  { value: 'uncommon', label: 'Необычные' },
  { value: 'rare', label: 'Редкие' },
  { value: 'very rare', label: 'Очень редкие' },
  { value: 'legendary', label: 'Легендарные' }
];

export function PotionsPage({ store }: PotionsPageProps) {
  const [showFilters, setShowFilters] = useState(false);

  const filteredPotions = store.potions.filter(potion => {
    const filters = store.activeFilters;
    
    if (filters.search && !potion.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    if (filters.rarities.length > 0 && !filters.rarities.includes(potion.rarity)) {
      return false;
    }
    
    if (filters.potionTypes.length > 0 && !filters.potionTypes.includes(potion.potionType)) {
      return false;
    }
    
    return true;
  });

  const allPotionTags = Array.from(new Set(store.potions.flatMap(potion => potion.tags)));

  const handleRarityFilter = (rarity: string, checked: boolean) => {
    const newRarities = checked
      ? [...store.activeFilters.rarities, rarity]
      : store.activeFilters.rarities.filter(r => r !== rarity);
    store.updateFilter('rarities', newRarities);
  };

  const handlePotionTypeFilter = (tag: string, checked: boolean) => {
    const newTypes = checked
      ? [...store.activeFilters.potionTypes, tag]
      : store.activeFilters.potionTypes.filter(t => t !== tag);
    store.updateFilter('potionTypes', newTypes);
  };

  const clearAllFilters = () => {
    store.updateFilter('rarities', []);
    store.updateFilter('potionTypes', []);
    store.updateFilter('search', '');
  };

  const hasActiveFilters =
    store.activeFilters.rarities.length > 0 ||
    store.activeFilters.potionTypes.length > 0 ||
    store.activeFilters.search.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Коллекция зелий</h1>
          <p className="text-muted-foreground">
            Ваши созданные алхимические зелья
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

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Поиск зелий..."
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

        {allPotionTags.length > 0 && (
          <FilterGroup 
            title="Теги зелий"
            activeCount={store.activeFilters.potionTypes.length}
          >
            <div className="flex flex-wrap gap-2">
              {allPotionTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={store.activeFilters.potionTypes.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer transition-all hover:scale-105"
                  onClick={() => handlePotionTypeFilter(tag, !store.activeFilters.potionTypes.includes(tag))}
                >
                  {tag}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Нажмите на теги, чтобы фильтровать зелья. Можно выбрать несколько.
            </p>
          </FilterGroup>
        )}
      </FilterDrawer>

      <Separator />

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Найдено: {filteredPotions.length} из {store.potions.length} зелий
        </p>

        {hasActiveFilters && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Активные фильтры:</span>
            <div className="flex gap-1 flex-wrap max-w-full">
              {store.activeFilters.rarities.map(rarity => (
                <Badge key={rarity} variant="secondary" className="text-xs">
                  {rarityOptions.find(r => r.value === rarity)?.label}
                </Badge>
              ))}
              {store.activeFilters.potionTypes.map(type => (
                <Badge key={type} variant="secondary" className="text-xs">
                  {type}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="card-grid-responsive">
        {filteredPotions.map((potion) => (
          <motion.div
            key={potion.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <CompactPotionCard
              potion={potion}
              onQuantityChange={store.updatePotionQuantity}
              onToggleFavorite={store.togglePotionFavorite}
            />
          </motion.div>
        ))}
      </div>

      {filteredPotions.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <FlaskConical className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-2">
            {store.potions.length === 0 ? 'У вас пока нет зелий' : 'Зелья не найдены'}
          </p>
          {hasActiveFilters && (
            <Button variant="outline" className="mt-2" onClick={clearAllFilters}>
              Очистить фильтры
            </Button>
          )}
          {store.potions.length === 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              Отправляйтесь в лабораторию, чтобы начать варить зелья!
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}