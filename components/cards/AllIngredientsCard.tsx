// components/cards/AllIngredientsCard.tsx

import { memo } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Plus, Minus, MapPin } from "lucide-react";
import { CompactCard } from "./CompactCard";
import type { Ingredient, PotionBase } from "../../hooks/types";
import {
  getIngredientCategoryName,
  getIngredientCategoryColor,
  getAlchemicalElementName,
  getAlchemicalElementShortCode,
  getPotionBaseName,
  getPotionBaseRarity
} from "../../hooks/types";

interface AllIngredientsCardProps {
  ingredient: Ingredient;
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
  isInInventory: boolean;
  inventoryQuantity?: number;
}

const rarityColors = {
  common: "bg-gray-500",
  uncommon: "bg-green-500",
  rare: "bg-blue-500",
  "very rare": "bg-purple-500",
  legendary: "bg-orange-500"
};

const rarityLabels = {
  common: 'Обычный',
  uncommon: 'Необычный',
  rare: 'Редкий',
  "very rare": 'Очень редкий',
  legendary: 'Легендарный'
};

export const AllIngredientsCard = memo(function AllIngredientsCard({ 
  ingredient, 
  onAdd, 
  onRemove, 
  isInInventory,
  inventoryQuantity = 0
}: AllIngredientsCardProps) {
  if (!ingredient) {
    console.error('AllIngredientsCard: ingredient is undefined');
    return <div>Ошибка: ингредиент не найден</div>;
  }

  const badges = [
    {
      label: rarityLabels[ingredient.rarity] || ingredient.rarity || 'Неизвестно',
      className: `${rarityColors[ingredient.rarity] || 'bg-gray-500'} text-white border-none`
    },
    {
      label: `${ingredient.cost || 0} зм`,
      variant: "outline" as const
    },
    {
      label: isInInventory ? `В наличии (${inventoryQuantity})` : "Отсутствует",
      variant: isInInventory ? "default" as const : "secondary" as const
    }
  ];

  const typeCircles = [
    {
      label: ingredient.isBase
        ? (ingredient.type ? getPotionBaseName(ingredient.type as PotionBase) : 'База')
        : ingredient.category ? getIngredientCategoryName(ingredient.category) : 'Неизвестно',
      color: ingredient.category ? getIngredientCategoryColor(ingredient.category) : 'bg-gray-500'
    }
  ];

  const actions = (
    <div className="flex items-center gap-2 shrink-0">
      <Button
        variant="outline"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(ingredient.id);
        }}
        className="h-8 px-3"
      >
        <Minus className="h-4 w-4 mr-1" />
        Убрать
      </Button>

      <Button
        variant="default"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onAdd(ingredient.id);
        }}
        className="h-8 px-3"
      >
        <Plus className="h-4 w-4 mr-1" />
        Добавить
      </Button>
    </div>
  );

  return (
    <CompactCard
      title={ingredient.name}
      badges={badges}
      typeCircles={typeCircles}
      actions={actions}
    >
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {ingredient.description}
        </p>

        {ingredient.locations && ingredient.locations.length > 0 && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>{ingredient.locations.join(', ')}</span>
          </div>
        )}

        {ingredient.tags && ingredient.tags.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm">Теги:</p>
            <div className="flex flex-wrap gap-1">
              {ingredient.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {ingredient.elements && ingredient.elements.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm">Алхимические элементы:</p>
            <div className="flex flex-wrap gap-1">
              {ingredient.elements.map((element) => (
                <Badge key={element} variant="secondary" className="text-xs">
                  {getAlchemicalElementShortCode(element)} - {getAlchemicalElementName(element)}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {ingredient.isBase && (
          <div className="space-y-2">
            <p className="text-sm">База для зелий:</p>
            <Badge variant="outline" className="text-xs">
              Влияет на редкость: {getPotionBaseRarity(ingredient.type as any)}
            </Badge>
          </div>
        )}
      </div>
    </CompactCard>
  );
});
