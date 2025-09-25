// components/CompactBiomeCard.tsx

import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import {
  Search,
  AlertTriangle,
} from "lucide-react";
import { CompactCard } from "./CompactCard";
import type { Biome } from "@/hooks/types.ts";

interface CompactBiomeCardProps {
  biome: Biome;
  playerGold: number;
  onExplore: (biomeId: string) => void;
  ingredients: any[];
  isDisabled?: boolean;
}

const difficultyColors = {
  easy: "bg-green-500",
  medium: "bg-yellow-500",
  hard: "bg-red-500"
};

const difficultyLabels = {
  easy: "Легкий",
  medium: "Средний",
  hard: "Сложный"
};


const biomeTypeColors = {
  forest: "bg-emerald-500",
  mountains: "bg-stone-500",
  meadows: "bg-green-500",
  dragon_lair: "bg-red-500",
  fairy_ring: "bg-purple-500"
} as const;

const biomeTypeLabels = {
  forest: "Лес",
  mountains: "Горы",
  meadows: "Луга",
  dragon_lair: "Логово дракона",
  fairy_ring: "Феийный круг"
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
    label: difficultyLabels[biome.difficulty],
    color: difficultyColors[biome.difficulty]
  };

  const allIngredients = [
    ...biome.commonIngredients,
    ...biome.uncommonIngredients,
    ...biome.rareIngredients,
    ...biome.legendaryIngredients
  ];
  const totalChance = Math.min(100, Math.round(allIngredients.reduce((sum, ing) => sum + ing.chance, 0) * 100));

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
      label: biomeTypeLabels[biome.id as keyof typeof biomeTypeLabels] || "Неизвестно",
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

        <div className="space-y-3">
          <h4 className="text-sm">Возможные находки</h4>
          <div className="space-y-3">
            {allIngredients.length === 0 ? (
              <p className="text-xs text-muted-foreground">Нет доступных ингредиентов</p>
            ) : (
              allIngredients.map((available, index) => {
              const ingredient = ingredients.find(ing => ing.id === available.id);
              const rarityColors = {
                'common': 'text-gray-600',
                'uncommon': 'text-green-600',
                'rare': 'text-blue-600',
                'very rare': 'text-purple-600',
                'legendary': 'text-orange-600'
              };

              // Получаем диапазон количества из массива quantity
              const minQuantity = available.quantity[0];
              const maxQuantity = available.quantity[1];
              const chancePercent = Math.round(available.chance * 100);

              return (
                <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm truncate">
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
                    <span className="text-sm">{chancePercent}%</span>
                    <Progress value={chancePercent} className="w-16 h-2" />
                  </div>
                </div>
              );
            })
            )}
          </div>
        </div>

        <div className="p-3 bg-blue-50/50 dark:bg-blue-950/50 rounded border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-700 dark:text-blue-300">
              Стоимость исследования: <strong>{biome.cost} зм</strong> (оплачивается независимо от результата)
            </div>
          </div>
        </div>
      </div>
    </CompactCard>
  );
}