// components/CurrencyPopover.tsx

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Sparkles, Coins } from "lucide-react";
import type { Currency } from "../../hooks/types";

interface CurrencyPopoverProps {
  currency: Currency;
  totalGold: number;
}

export function CurrencyPopover({ currency, totalGold }: CurrencyPopoverProps) {
  const coinTypes = [
    {
      type: 'platinum',
      label: 'Платиновые',
      short: 'пм',
      amount: currency.platinum,
      color: 'bg-slate-600 text-white',
      icon: '🪙'
    },
    {
      type: 'gold',
      label: 'Золотые',
      short: 'зм',
      amount: currency.gold,
      color: 'bg-yellow-500 text-white',
      icon: '🪙'
    },
    {
      type: 'silver',
      label: 'Серебряные',
      short: 'см',
      amount: currency.silver,
      color: 'bg-gray-400 text-white',
      icon: '🪙'
    },
    {
      type: 'copper',
      label: 'Медные',
      short: 'мм',
      amount: currency.copper,
      color: 'bg-orange-600 text-white',
      icon: '🪙'
    }
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-1 px-2 py-1 text-xs h-auto border-border">
          <Sparkles className="h-3 w-3" />
          {Math.floor(totalGold)} зм
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 border-border bg-popover" align="end">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-primary" />
            <h3 className="text-sm">Кошелек персонажа</h3>
          </div>

          <div className="space-y-3">
            {coinTypes.map((coin) => (
              <div key={coin.type} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{coin.icon}</span>
                  <span className="text-sm">{coin.label}</span>
                </div>
                <Badge className={`${coin.color} border-none`}>
                  {coin.amount} {coin.short}
                </Badge>
              </div>
            ))}

            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm">Общая стоимость:</span>
                <Badge variant="outline" className="gap-1">
                  <Sparkles className="h-3 w-3" />
                  {totalGold.toFixed(2)} зм
                </Badge>
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            <p className="mb-1">Конвертация D&D 5e:</p>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <span>1 пм = 10 зм</span>
              <span>1 зм = 10 см</span>
              <span>1 см = 10 мм</span>
              <span>1 зм = 100 мм</span>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}