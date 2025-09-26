// components/CompactBiomeCard.tsx

import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import {
  Search,
  AlertTriangle,
  MapPin,
  Coins,
  Star,
} from "lucide-react";
import { CompactCard } from "./CompactCard";
import type { Biome } from "@/hooks/types.ts";
import { getBiomeDifficultyColor, getBiomeDifficultyLabel } from "@/utils/biomeGenerator";

interface CompactBiomeCardProps {
  biome: Biome;
  playerGold: number;
  onExplore: (biomeId: string) => void;
  ingredients: any[];
  isDisabled?: boolean;
}

// Цвета для типов биомов
const biomeTypeColors = {
  forest: "bg-emerald-500",
  enchanted_forest: "bg-green-600",
  fey_settlement: "bg-purple-500",
  mountains: "bg-stone-500",
  hills: "bg-amber-500",
  coastline: "bg-blue-500",
  underwater: "bg-cyan-500",
  water_source: "bg-blue-400",
  underdark: "bg-gray-700",
  ancient_ruins: "bg-yellow-600",
  cemetery: "bg-gray-600",
  magic_academy: "bg-indigo-500",
  archmage_tower: "bg-purple-600",
  alchemy_lab: "bg-orange-500",
  alchemist_shop: "bg-orange-400",
  merchant_shop: "bg-yellow-500",
  library: "bg-brown-500",
  witch_hut: "bg-red-600",
  shadow_plane: "bg-gray-800",
  upper_planes: "bg-white",
  planar_rift: "bg-violet-600",
  astral_observatory: "bg-sky-500",
  meadow: "bg-green-400",
  swamp: "bg-green-700",
  desert: "bg-yellow-700",
  arctic: "bg-cyan-600",
  orc_settlements: "bg-red-700",
  taverns: "bg-amber-600",
  kobold_territory: "bg-green-800",
  druid_settlements: "bg-emerald-600",
  common_areas: "bg-gray-500"
} as const;

export function CompactBiomeCard({
  biome,
  playerGold,
  onExplore,
  ingredients,
  isDisabled = false
}: CompactBiomeCardProps) {
  const canAfford = playerGold >= biome.cost;
  const difficultyInfo = {
    label: getBiomeDifficultyLabel(biome.difficulty),
    color: getBiomeDifficultyColor(biome.difficulty)
  };

  const allIngredients = [
    ...biome.commonIngredients,
    ...biome.uncommonIngredients,
    ...biome.rareIngredients,
    ...biome.legendaryIngredients
  ];
  
  // Рассчитываем общий шанс успеха
  const totalChance = Math.min(100, Math.round(allIngredients.reduce((sum, ing) => sum + ing.chance, 0) * 100));
  
  // Подсчитываем количество ингредиентов по редкости
  const rarityCounts = {
    common: biome.commonIngredients.length,
    uncommon: biome.uncommonIngredients.length,
    rare: biome.rareIngredients.length,
    legendary: biome.legendaryIngredients.length
  };

  const badges = [
    {
      label: difficultyInfo.label,
      className: `${difficultyInfo.color} text-white border-none`
    },
    {
      label: `${biome.cost} зм`,
      variant: "outline" as const
    },
    {
      label: `${totalChance}% успех`,
      variant: "secondary" as const
    }
  ];

  const typeCircles = [
    {
      label: biome.name.split(' ')[0], // Берем первое слово из названия
      color: biomeTypeColors[biome.id as keyof typeof biomeTypeColors] || "bg-gray-500"
    }
  ];

  const explorationAction = (
    <Button
      onClick={(e) => {
        e.stopPropagation();
        onExplore(biome.id);
      }}
      disabled={!canAfford || isDisabled}
      size="sm"
      variant={canAfford ? "default" : "secondary"}
      className="gap-1 shrink-0"
    >
      <Search className="h-3 w-3" />
      <span className="hidden sm:inline">
        {canAfford ? "Исследовать" : "Нет золота"}
      </span>
      <span className="sm:hidden">
        {canAfford ? "Идти" : "Нет зм"}
      </span>
    </Button>
  );

  return (
    <CompactCard
      title={biome.name}
      subtitle={`${biome.cost} зм`}
      badges={badges}
      typeCircles={typeCircles}
      actions={explorationAction}
      className="transition-all hover:shadow-md"
    >
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {biome.description}
        </p>

        {/* Статистика редкости */}
        <div className="grid grid-cols-2 gap-2 p-3 bg-muted/20 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
            <span className="text-xs text-muted-foreground">Обычные: {rarityCounts.common}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-muted-foreground">Необычные: {rarityCounts.uncommon}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-xs text-muted-foreground">Редкие: {rarityCounts.rare}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className="text-xs text-muted-foreground">Легендарные: {rarityCounts.legendary}</span>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Star className="h-4 w-4" />
            Возможные находки
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {allIngredients.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Нет доступных ингредиентов</p>
            ) : (
              allIngredients.map((available, index) => {
              const ingredient = ingredients.find(ing => ing.id === available.id);
              const rarityColors = {
                'common': 'text-gray-600 border-gray-300',
                'uncommon': 'text-green-600 border-green-300',
                'rare': 'text-blue-600 border-blue-300',
                'very rare': 'text-purple-600 border-purple-300',
                'legendary': 'text-orange-600 border-orange-300'
              };

              const minQuantity = available.quantity[0];
              const maxQuantity = available.quantity[1];
              const chancePercent = Math.round(available.chance * 100);

              return (
                <div key={index} className="flex items-center justify-between p-2 bg-card/50 rounded border gap-2 hover:bg-card/70 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-medium truncate">
                        {ingredient?.name || `Ингредиент #${available.id}`}
                      </span>
                      {ingredient?.rarity && (
                        <Badge
                          variant="outline"
                          className={`text-xs ${rarityColors[ingredient.rarity as keyof typeof rarityColors]}`}
                        >
                          {ingredient.rarity}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Количество: {minQuantity}-{maxQuantity}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-medium">{chancePercent}%</span>
                    <Progress value={chancePercent} className="w-16 h-2" />
                  </div>
                </div>
              );
            })
            )}
          </div>
        </div>

        <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-700 dark:text-blue-300">
              <div className="font-medium mb-1">Стоимость исследования: {biome.cost} зм</div>
              <div className="text-muted-foreground">Оплачивается независимо от результата</div>
            </div>
          </div>
        </div>
      </div>
    </CompactCard>
  );
}