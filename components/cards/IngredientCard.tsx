// components/IngredientCard.tsx

import { Badge } from "../ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Minus, Plus, MapPin, Coins } from "lucide-react";
import type { Ingredient } from "../../hooks/types";

interface IngredientCardProps {
  ingredient: Ingredient;
  onQuantityChange: (id: string, quantity: number) => void;
}

const rarityColors = {
  common: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  uncommon: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  rare: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  "very rare": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  legendary: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
};

const typeColors = {
  herb: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  mineral: "bg-stone-50 text-stone-700 dark:bg-stone-950 dark:text-stone-300",
  creature: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
  essence: "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  oil: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  crystal: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300"
};

const typeLabels = {
  herb: 'Растение',
  mineral: 'Минерал',
  creature: 'Существо',
  essence: 'Эссенция',
  oil: 'Масло',
  crystal: 'Кристалл'
};

const rarityLabels = {
  common: 'Обычный',
  uncommon: 'Необычный',
  rare: 'Редкий',
  "very rare": 'Очень редкий',
  legendary: 'Легендарный'
};

export function IngredientCard({ ingredient, onQuantityChange }: IngredientCardProps) {
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 0) {
      onQuantityChange(ingredient.id, newQuantity);
    }
  };

  return (
    <Card className="h-full transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{ingredient.name}</CardTitle>
            <CardDescription className="text-sm">
              {ingredient.description}
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className={`${rarityColors[ingredient.rarity]} border-none shrink-0 ml-2`}
          >
            {rarityLabels[ingredient.rarity]}
          </Badge>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Badge
            variant="secondary"
            className={`${typeColors[ingredient.type]} border-none`}
          >
            {typeLabels[ingredient.type]}
          </Badge>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Coins className="h-3 w-3" />
            <span>{ingredient.cost} зм</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span>{ingredient.locations}</span>
        </div>

        {ingredient.tags.length > 0 && (
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

        <div className="pt-2 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm">Количество:</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuantityChange(ingredient.quantity - 1)}
                disabled={ingredient.quantity <= 0}
                className="h-8 w-8 p-0"
              >
                <Minus className="h-3 w-3" />
              </Button>

              <Input
                type="number"
                value={ingredient.quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 0)}
                className="h-8 w-16 text-center"
                min="0"
              />

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuantityChange(ingredient.quantity + 1)}
                className="h-8 w-8 p-0"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}