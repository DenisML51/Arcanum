// components/CompactShopCard.tsx

import { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import {
  Coins,
  ShoppingCart,
  Plus,
  Minus,
  Package,
  TrendingUp
} from "lucide-react";
import { CompactCard } from "./CompactCard";
import type { Ingredient } from "../hooks/useAlchemyStore";

interface CompactShopCardProps {
  ingredient: Ingredient;
  mode: 'buy' | 'sell';
  playerGold: number;
  onTransaction: (ingredientId: string, quantity: number) => void;
}

const rarityColors = {
  common: "bg-gray-500",
  uncommon: "bg-green-500",
  rare: "bg-blue-500",
  "very rare": "bg-purple-500",
  legendary: "bg-orange-500"
};

const typeColors = {
  herb: "bg-emerald-500",
  mineral: "bg-stone-500",
  creature: "bg-red-500",
  essence: "bg-violet-500",
  oil: "bg-amber-500",
  crystal: "bg-cyan-500"
};

const rarityLabels = {
  common: 'Обычный',
  uncommon: 'Необычный',
  rare: 'Редкий',
  "very rare": 'Очень редкий',
  legendary: 'Легендарный'
};

const typeLabels = {
  herb: 'Растение',
  mineral: 'Минерал',
  creature: 'Существо',
  essence: 'Эссенция',
  oil: 'Масло',
  crystal: 'Кристалл'
};

export function CompactShopCard({
  ingredient,
  mode,
  playerGold,
  onTransaction
}: CompactShopCardProps) {
  const [quantity, setQuantity] = useState(1);

  const price = mode === 'buy' ? ingredient.cost : Math.floor(ingredient.cost * 0.5);
  const totalPrice = price * quantity;
  const canAfford = mode === 'buy' ? playerGold >= totalPrice : ingredient.quantity >= quantity;
  const maxQuantity = mode === 'buy' ? Math.floor(playerGold / price) : ingredient.quantity;

  const handleTransaction = () => {
    if (canAfford && quantity > 0) {
      onTransaction(ingredient.id, quantity);
      setQuantity(1);
    }
  };

  const badges = [
    {
      label: rarityLabels[ingredient.rarity],
      className: `${rarityColors[ingredient.rarity]} text-white border-none`
    },
    {
      label: `${price} зм`,
      variant: "outline" as const
    },
    ...(mode === 'sell' ? [{
      label: `×${ingredient.quantity} имеется`,
      variant: "secondary" as const
    }] : [])
  ];

  const typeCircles = [
    {
      label: typeLabels[ingredient.type],
      color: typeColors[ingredient.type]
    }
  ];

  const transactionActions = (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          setQuantity(Math.max(1, quantity - 1));
        }}
        className="h-6 w-6 p-0"
      >
        <Minus className="h-3 w-3" />
      </Button>

      <Input
        type="number"
        value={quantity}
        onChange={(e) => {
          const val = parseInt(e.target.value) || 1;
          setQuantity(Math.max(1, Math.min(maxQuantity, val)));
        }}
        onClick={(e) => e.stopPropagation()}
        className="h-6 w-12 text-center text-xs p-1"
        min="1"
        max={maxQuantity}
      />

      <Button
        variant="outline"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          setQuantity(Math.min(maxQuantity, quantity + 1));
        }}
        className="h-6 w-6 p-0"
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );

  return (
    <CompactCard
      title={ingredient.name}
      subtitle={`${mode === 'buy' ? 'Покупка' : 'Продажа'}: ${price} зм`}
      badges={badges}
      typeCircles={typeCircles}
      actions={transactionActions}
      className="transition-all hover:shadow-md"
    >
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {ingredient.description}
        </p>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <p className="text-muted-foreground">Цена за штуку:</p>
            <Badge variant="outline" className="gap-1">
              <Coins className="h-3 w-3" />
              {price} зм
            </Badge>
          </div>

          {mode === 'sell' && (
            <div className="space-y-1">
              <p className="text-muted-foreground">В наличии:</p>
              <Badge variant="secondary" className="gap-1">
                <Package className="h-3 w-3" />
                ×{ingredient.quantity}
              </Badge>
            </div>
          )}
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Количество:</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setQuantity(Math.max(1, quantity - 1));
                }}
                className="h-7 w-7 p-0"
              >
                <Minus className="h-3 w-3" />
              </Button>

              <Input
                type="number"
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  setQuantity(Math.max(1, Math.min(maxQuantity, val)));
                }}
                onClick={(e) => e.stopPropagation()}
                className="h-7 w-16 text-center text-sm p-1"
                min="1"
                max={maxQuantity}
              />

              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setQuantity(Math.min(maxQuantity, quantity + 1));
                }}
                className="h-7 w-7 p-0"
              >
                <Plus className="h-3 w-3" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setQuantity(maxQuantity);
                }}
                className="text-xs h-7 px-2"
                disabled={maxQuantity === 0}
              >
                Макс
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span>Итого:</span>
            <Badge variant="secondary" className="gap-1">
              <Coins className="h-3 w-3" />
              {totalPrice} зм
            </Badge>
          </div>
        </div>

        <div className="pt-2 border-t">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleTransaction();
            }}
            disabled={!canAfford || quantity <= 0 || maxQuantity === 0}
            className="w-full"
            variant={canAfford ? "default" : "secondary"}
          >
            {mode === 'buy' ? <ShoppingCart className="h-4 w-4 mr-2" /> : <TrendingUp className="h-4 w-4 mr-2" />}
            {mode === 'buy' ? 'Купить' : 'Продать'}
            {!canAfford && maxQuantity > 0 && (
              <span className="ml-1">
                ({mode === 'buy' ? 'Недостаточно золота' : 'Недостаточно товара'})
              </span>
            )}
            {maxQuantity === 0 && mode === 'buy' && (
              <span className="ml-1">(Недостаточно золота)</span>
            )}
          </Button>
        </div>

        {mode === 'sell' && (
          <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
            💡 Цена продажи составляет 50% от стоимости покупки
          </div>
        )}
      </div>
    </CompactCard>
  );
}