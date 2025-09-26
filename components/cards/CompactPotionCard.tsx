// components/cards/CompactPotionCard.tsx

import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Minus, Plus, FlaskConical, Trash2, Heart, AlertTriangle, Star, Beaker } from "lucide-react";
import { CompactCard } from "./CompactCard";
import type { Potion } from "@/hooks/types.ts";
import { getRarityColor, getRarityName, getPotionTypeName, getPotionTypeColor, getPotionQualityName, getPotionQualityColor, getBrewedQualityName, getBrewedQualityColor, getRarityDetails } from "../../hooks/types";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

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
    { label: getRarityName(potion.rarity), className: `${getRarityColor(potion.rarity)} text-white border-none`, title: `Редкость зелья: ${getRarityName(potion.rarity)}` },
    { label: getPotionTypeName(potion.potionType), className: `${getPotionTypeColor(potion.potionType)} text-white border-none`, title: `Тип зелья: ${getPotionTypeName(potion.potionType)}` },
    { label: getPotionQualityName(potion.potionQuality), className: `${getPotionQualityColor(potion.potionQuality)} text-white border-none`, title: `Качество варева: ${getPotionQualityName(potion.potionQuality)}` },
    ...(potion.brewedQuality ? [{ label: getBrewedQualityName(potion.brewedQuality), className: `${getBrewedQualityColor(potion.brewedQuality)} text-white border-none`, title: `Качество варки: ${getBrewedQualityName(potion.brewedQuality)}` }] : []),
    { label: `×${potion.quantity}`, variant: potion.quantity > 0 ? "default" as const : "secondary" as const, title: `Количество в инвентаре: ${potion.quantity}` }
  ];

  const quantityActions = (
    <div className="flex items-center gap-1 shrink-0">
      {onToggleFavorite && (
        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onToggleFavorite(potion.id); }} className={`h-7 w-7 p-0 ${potion.isFavorite ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground'}`} title={potion.isFavorite ? "Убрать из избранного" : "Добавить в избранное"}>
          <Heart className={`h-3 w-3 ${potion.isFavorite ? 'fill-current' : ''}`} />
        </Button>
      )}
      <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleQuantityChange(potion.quantity - 1); }} disabled={potion.quantity <= 0} className="h-7 w-7 p-0">
        <Minus className="h-3 w-3" />
      </Button>
      <Input type="number" value={potion.quantity} onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 0)} onClick={(e) => e.stopPropagation()} className="h-7 w-14 text-center text-xs p-1" min="0" />
      <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleQuantityChange(potion.quantity + 1); }} className="h-7 w-7 p-0">
        <Plus className="h-3 w-3" />
      </Button>
      {potion.quantity > 0 && (
        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleQuantityChange(0); }} className="h-7 w-7 p-0 text-destructive hover:text-destructive" title="Удалить все">
          <Trash2 className="h-3 w-3" />
        </Button>
      )}
    </div>
  );

  let targetDifficulty = 0;
  if (potion.components && potion.rarity) {
    const rarityDetails = getRarityDetails(potion.rarity);
    targetDifficulty = 5 * rarityDetails.rarityModifier + 5 + potion.components.length;
  }

  return (
    <CompactCard
      title={potion.name}
      badges={badges}
      actions={quantityActions}
      className="transition-all hover:shadow-md"
    >
      <div className="space-y-4">
        <div className="relative p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20">
          <div className="absolute top-2 right-2">
            <div className="w-2 h-2 bg-primary rounded-full opacity-60"></div>
          </div>
          <div className="text-xs font-medium text-primary mb-2 uppercase tracking-wide">Эффект</div>
          <div className="text-sm font-medium text-foreground leading-relaxed">{potion.effect}</div>
        </div>

        {potion.flawEffect && (
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-sm">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <AlertTriangle className="h-3 w-3 text-red-500" />
                    </TooltipTrigger>
                    <TooltipContent className="text-white dark:text-black">
                        <div className="text-xs text-white dark:text-black">{potion.flawEffect}</div>
                    </TooltipContent>
                </Tooltip>
              <span className="font-medium">Изъян:</span>
            </div>
            <div className="p-3 rounded-xl text-sm bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
              {potion.flawEffect}
            </div>
          </div>
        )}

        {potion.excellenceEffect && (
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-sm">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Star className="h-3 w-3 text-yellow-500" />
                </TooltipTrigger>
                <TooltipContent className="text-white dark:text-black">
                  <div className="text-xs text-white dark:text-black">{potion.excellenceEffect}</div>
                </TooltipContent>
              </Tooltip>
              <span className="font-medium">Изысканность:</span>
            </div>
            <div className="p-3 rounded-xl text-sm bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
              {potion.excellenceEffect}
            </div>
          </div>
        )}

        {potion.impurityEffect && (
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-sm">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Beaker className="h-3 w-3 text-purple-500" />
                </TooltipTrigger>
                <TooltipContent className="text-white dark:text-black">
                  <div className="text-xs text-white dark:text-black">{potion.impurityEffect}</div>
                </TooltipContent>
              </Tooltip>
              <span className="font-medium">Эффект примеси:</span>
            </div>
            <div className="p-3 rounded-xl text-sm bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
              {potion.impurityEffect}
            </div>
          </div>
        )}



        {potion.tags && potion.tags.length > 0 && (
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

      </div>
    </CompactCard>
  );
}