// components/cards/CompactPotionCard.tsx

import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Minus, Plus, FlaskConical, Trash2, Heart, AlertTriangle, Star } from "lucide-react";
import { CompactCard } from "./CompactCard";
import type { Potion } from "../../hooks/types";
import { getRarityColor, getRarityName, getPotionTypeName, getPotionTypeColor, getPotionQualityName, getPotionQualityColor, getBrewedQualityName, getBrewedQualityColor } from "../../hooks/types";

interface CompactPotionCardProps {
  potion: Potion;
  onQuantityChange: (id: string, quantity: number) => void;
  onToggleFavorite?: (id: string) => void;
}

export function CompactPotionCard({ potion, onQuantityChange, onToggleFavorite }: CompactPotionCardProps) {
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 0) {
      onQuantityChange(potion.id, newQuantity);
    }
  };

  const badges = [
    {
      label: getRarityName(potion.rarity),
      className: `${getRarityColor(potion.rarity)} text-white border-none`,
      title: `Редкость зелья: ${getRarityName(potion.rarity)}`
    },
    {
      label: getPotionTypeName(potion.potionType),
      className: `${getPotionTypeColor(potion.potionType)} text-white border-none`,
      title: `Тип зелья: ${getPotionTypeName(potion.potionType)}`
    },
    {
      label: getPotionQualityName(potion.potionQuality),
      className: `${getPotionQualityColor(potion.potionQuality)} text-white border-none`,
      title: `Качество варева: ${getPotionQualityName(potion.potionQuality)}`
    },
    ...(potion.brewedQuality ? [{
      label: getBrewedQualityName(potion.brewedQuality),
      className: `${getBrewedQualityColor(potion.brewedQuality)} text-white border-none`,
      title: `Качество варки: ${getBrewedQualityName(potion.brewedQuality)}`
    }] : []),
    {
      label: `×${potion.quantity}`,
      variant: potion.quantity > 0 ? "default" as const : "secondary" as const,
      title: `Количество в инвентаре: ${potion.quantity}`
    }
  ];

  const quantityActions = (
    <div className="flex items-center gap-1 shrink-0">
      {onToggleFavorite && (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(potion.id);
          }}
          className={`h-7 w-7 p-0 ${potion.isFavorite ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground'}`}
          title={potion.isFavorite ? "Убрать из избранного" : "Добавить в избранное"}
        >
          <Heart className={`h-3 w-3 ${potion.isFavorite ? 'fill-current' : ''}`} />
        </Button>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          handleQuantityChange(potion.quantity - 1);
        }}
        disabled={potion.quantity <= 0}
        className="h-7 w-7 p-0"
      >
        <Minus className="h-3 w-3" />
      </Button>
      <Input
        type="number"
        value={potion.quantity}
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
          handleQuantityChange(potion.quantity + 1);
        }}
        className="h-7 w-7 p-0"
      >
        <Plus className="h-3 w-3" />
      </Button>
      {potion.quantity > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleQuantityChange(0);
          }}
          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
          title="Удалить все"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      )}
    </div>
  );

  return (
    <CompactCard
      title={potion.name}
      badges={badges}
      actions={quantityActions}
      className="transition-all hover:shadow-md"
    >
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {potion.description}
        </p>

        {/* НОВЫЙ БЛОК ДЛЯ ОТОБРАЖЕНИЯ ИЗЪЯНОВ */}
        {potion.flawEffect && (
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-sm">
              <AlertTriangle className="h-3 w-3 text-red-500" />
              <span className="font-medium">Изъян:</span>
            </div>
            <div className="p-2 rounded text-sm bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
              {potion.flawEffect}
            </div>
          </div>
        )}

        {/* НОВЫЙ БЛОК ДЛЯ ОТОБРАЖЕНИЯ ИСКЛЮЧИТЕЛЬНЫХ ЭФФЕКТОВ */}
        {potion.excellenceEffect && (
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-3 w-3 text-yellow-500" />
              <span className="font-medium">Изысканность:</span>
            </div>
            <div className="p-2 rounded text-sm bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
              {potion.excellenceEffect}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-1 text-sm">
            <FlaskConical className="h-3 w-3 text-primary" />
            <span>Эффект:</span>
          </div>
          <p className="text-sm bg-muted/50 p-2 rounded">
            {potion.effect}
          </p>
        </div>

        {potion.rollResults && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              История варки:
            </p>
            <div className="bg-muted/30 p-2 rounded text-xs space-y-1">
              <p>
                🎲 Основной бросок: {potion.rollResults.naturalRoll} + {potion.rollResults.bonus} = {potion.rollResults.mainRoll}
              </p>
              {potion.rollResults.fumbleRoll && (
                <p className="text-orange-600 dark:text-orange-400">
                  💥 Провал (к100): {potion.rollResults.fumbleRoll}
                </p>
              )}
              {potion.rollResults.excellenceRoll && (
                <p className="text-green-600 dark:text-green-400">
                  ⭐ Успех (к100): {potion.rollResults.excellenceRoll}
                </p>
              )}
            </div>
          </div>
        )}

        {potion.tags.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm">Теги:</p>
            <div className="flex flex-wrap gap-1">
              {potion.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2 border-t text-xs text-muted-foreground">
          💡 Измените количество зелий в вашем инвентаре
        </div>
      </div>
    </CompactCard>
  );
}