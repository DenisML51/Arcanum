// components/CompactIngredientCard.tsx

import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Minus, Plus, MapPin, Coins } from "lucide-react";
import { CompactCard } from "./CompactCard";
import type { Ingredient, PotionBase } from "../hooks/useAlchemyStore";
import {
  getIngredientCategoryName,
  getIngredientCategoryColor,
  getAlchemicalElementName,
  getAlchemicalElementShortCode,
  getPotionBaseName,
  getPotionBaseRarity
} from "../hooks/useAlchemyStore";

interface CompactIngredientCardProps {
  ingredient: Ingredient;
  onQuantityChange: (id: string, quantity: number) => void;
}

const rarityColors = {
  common: "bg-gray-500",
  uncommon: "bg-green-500",
  rare: "bg-blue-500",
  "very rare": "bg-purple-500",
  legendary: "bg-orange-500"
};

// Удаляем старые типы, теперь используем функции из store

const rarityLabels = {
  common: 'Обычный',
  uncommon: 'Необычный',
  rare: 'Редкий',
  "very rare": 'Очень редкий',
  legendary: 'Легендарный'
};

export function CompactIngredientCard({ ingredient, onQuantityChange }: CompactIngredientCardProps) {
  // Отладка для проверки данных ингредиента
  if (!ingredient) {
    console.error('CompactIngredientCard: ingredient is undefined');
    return <div>Ошибка: ингредиент не найден</div>;
  }

  // Удаляем навязчивые предупреждения для пользовательских ингредиентов
  // if (!ingredient.category && !ingredient.isBase) {
  //   console.warn('CompactIngredientCard: ingredient missing category:', ingredient);
  // }

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 0) {
      onQuantityChange(ingredient.id, newQuantity);
    }
  };

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
      label: `×${ingredient.quantity || 0}`,
      variant: (ingredient.quantity || 0) > 0 ? "default" as const : "secondary" as const
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

  const quantityActions = (
    <div className="flex items-center gap-1 shrink-0">
      <Button
        variant="outline"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          handleQuantityChange(ingredient.quantity - 1);
        }}
        disabled={ingredient.quantity <= 0}
        className="h-7 w-7 p-0"
      >
        <Minus className="h-3 w-3" />
      </Button>

      <Input
        type="number"
        value={ingredient.quantity}
        onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 0)}
        onClick={(e) => e.stopPropagation()}
        className="h-7 w-14 text-center text-xs p-1"
        min="0"
      />

      <Button
        variant="outline"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          handleQuantityChange(ingredient.quantity + 1);
        }}
        className="h-7 w-7 p-0"
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );

  return (
    <CompactCard
      title={ingredient.name}
      badges={badges}
      typeCircles={typeCircles}
      actions={quantityActions}
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
}