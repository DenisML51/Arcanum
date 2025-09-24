// components/CompactPotionCard.tsx

import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Minus, Plus, FlaskConical, Sparkles, Trash2, Heart, Zap, AlertTriangle, Star, X } from "lucide-react";
import { CompactCard } from "./CompactCard";
import type { Potion } from "../hooks/useAlchemyStore";
import { getRarityColor, getRarityName, getPotionTypeName, getPotionTypeColor, getPotionQualityName, getPotionQualityColor, getBrewedQualityName, getBrewedQualityColor } from "../hooks/useAlchemyStore";

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

  // Определяем иконки качества варки
  const qualityIcons = [];
  if (potion.brewedQuality === 'excellent') {
    qualityIcons.push({
      icon: Star,
      className: "text-yellow-400",
      title: "Изысканное зелье - высшее качество варки"
    });
  }
  if (potion.brewedQuality === 'poor') {
    qualityIcons.push({
      icon: X,
      className: "text-red-500",
      title: "Зелье с изъянами - низкое качество варки"
    });
  }

  // Определяем иконки дополнительных эффектов
  const effectIcons = [];
  if (potion.additionalEffects?.positive?.length) {
    effectIcons.push({
      icon: Sparkles,
      className: "text-green-500",
      title: `Положительные эффекты: ${potion.additionalEffects.positive.join(', ')}`
    });
  }
  if (potion.additionalEffects?.negative?.length) {
    effectIcons.push({
      icon: AlertTriangle,
      className: "text-red-500",
      title: `Негативные эффекты: ${potion.additionalEffects.negative.join(', ')}`
    });
  }
  if (potion.additionalEffects?.brewingComplications?.length) {
    effectIcons.push({
      icon: Zap,
      className: "text-yellow-500",
      title: `Осложнения при варке: ${potion.additionalEffects.brewingComplications.join(', ')}`
    });
  }

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

        <div className="space-y-2">
          <div className="flex items-center gap-1 text-sm">
            <FlaskConical className="h-3 w-3 text-primary" />
            <span>Эффект:</span>
          </div>
          <p className="text-sm bg-muted/50 p-2 rounded">
            {potion.effect}
          </p>

          {potion.actualDuration && (
            <p className="text-xs text-muted-foreground">
              Длительность: {potion.actualDuration}
            </p>
          )}
        </div>

        {/* Иконки качества варки и дополнительных эффектов */}
        {(qualityIcons.length > 0 || effectIcons.length > 0) && (
          <div className="flex items-center gap-3 pt-2 border-t border-border/50">
            {qualityIcons.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">Качество:</span>
                <div className="flex items-center gap-1">
                  {qualityIcons.map((quality, index) => {
                    const IconComponent = quality.icon;
                    return (
                      <div key={index} title={quality.title} className="p-1 rounded-full bg-muted/50">
                        <IconComponent className={`h-3 w-3 ${quality.className}`} />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {effectIcons.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">Эффекты:</span>
                <div className="flex items-center gap-1">
                  {effectIcons.map((effect, index) => {
                    const IconComponent = effect.icon;
                    return (
                      <div key={index} title={effect.title} className="p-1 rounded-full bg-muted/50">
                        <IconComponent className={`h-3 w-3 ${effect.className}`} />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Подробная информация о дополнительных эффектах */}
        {potion.additionalEffects && (
          <div className="space-y-2">
            {potion.additionalEffects.positive && potion.additionalEffects.positive.length > 0 && (
              <div className="bg-green-50 dark:bg-green-950/20 p-2 rounded border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-1 text-sm text-green-700 dark:text-green-300 mb-1">
                  <Sparkles className="h-3 w-3" />
                  <span>Положительные эффекты:</span>
                </div>
                <ul className="text-xs text-green-600 dark:text-green-400 space-y-1">
                  {potion.additionalEffects.positive.map((effect, index) => (
                    <li key={index}>• {effect}</li>
                  ))}
                </ul>
              </div>
            )}

            {potion.additionalEffects.negative && potion.additionalEffects.negative.length > 0 && (
              <div className="bg-orange-50 dark:bg-orange-950/20 p-2 rounded border border-orange-200 dark:border-orange-800">
                <div className="flex items-center gap-1 text-sm text-orange-700 dark:text-orange-300 mb-1">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Негативные эффекты:</span>
                </div>
                <ul className="text-xs text-orange-600 dark:text-orange-400 space-y-1">
                  {potion.additionalEffects.negative.map((effect, index) => (
                    <li key={index}>• {effect}</li>
                  ))}
                </ul>
              </div>
            )}

            {potion.additionalEffects.brewingComplications && potion.additionalEffects.brewingComplications.length > 0 && (
              <div className="bg-red-50 dark:bg-red-950/20 p-2 rounded border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-1 text-sm text-red-700 dark:text-red-300 mb-1">
                  <Zap className="h-3 w-3" />
                  <span>Осложнения варки:</span>
                </div>
                <ul className="text-xs text-red-600 dark:text-red-400 space-y-1">
                  {potion.additionalEffects.brewingComplications.map((effect, index) => (
                    <li key={index}>• {effect}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Информация о результатах бросков */}
        {potion.rollResults && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              История варки:
            </p>
            <div className="bg-muted/30 p-2 rounded text-xs space-y-1">
              <p>
                🎲 Основной бросок: {potion.rollResults.naturalRoll} + {potion.rollResults.bonus} = {potion.rollResults.mainRoll + potion.rollResults.bonus}
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