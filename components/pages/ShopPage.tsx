// components/ShopPage.tsx

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Coins,
  ShoppingCart,
  TrendingUp,
  Package,
  CheckCircle,
  XCircle
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { CompactShopCard } from "../cards/CompactShopCard";
import { useAlchemyStore } from "@/hooks/stores/useAlchemyStore.ts";

interface ShopPageProps {
  store: ReturnType<typeof useAlchemyStore>;
}



export function ShopPage({ store }: ShopPageProps) {
  const handleBuy = (ingredientId: string, quantity: number) => {
    const result = store.buyIngredient(ingredientId, quantity);

    if (result.success) {
      toast.success(result.message, {
        icon: <CheckCircle className="h-4 w-4" />
      });
    } else {
      toast.error(result.message, {
        icon: <XCircle className="h-4 w-4" />
      });
    }
  };

  const handleSell = (ingredientId: string, quantity: number) => {
    const result = store.sellIngredient(ingredientId, quantity);

    if (result.success) {
      toast.success(result.message, {
        icon: <CheckCircle className="h-4 w-4" />
      });
    } else {
      toast.error(result.message, {
        icon: <XCircle className="h-4 w-4" />
      });
    }
  };

  const availableIngredients = store.ingredients.filter(ing => ing.quantity > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl mb-2">Торговая лавка</h1>
          <p className="text-muted-foreground">
            Покупайте и продавайте алхимические ингредиенты
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Coins className="h-4 w-4" />
            {store.playerGold} золота
          </Badge>
        </div>
      </div>

      <Separator />

      <Tabs defaultValue="buy" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="buy" className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            Покупка
          </TabsTrigger>
          <TabsTrigger value="sell" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Продажа
          </TabsTrigger>
        </TabsList>

        <TabsContent value="buy" className="space-y-6">
          <div className="card-grid-max-2">
            {store.ingredients.map((ingredient) => (
              <motion.div
                key={ingredient.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <CompactShopCard
                  ingredient={ingredient}
                  mode="buy"
                  playerGold={store.playerGold}
                  onTransaction={handleBuy}
                />
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sell" className="space-y-6">
          {availableIngredients.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  У вас нет ингредиентов для продажи
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="card-grid-max-2">
              {availableIngredients.map((ingredient) => (
                <motion.div
                  key={ingredient.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <CompactShopCard
                    ingredient={ingredient}
                    mode="sell"
                    playerGold={store.playerGold}
                    onTransaction={handleSell}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}