// components/ExplorationPage.tsx

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import {
  MapPin,
  Coins,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { CompactBiomeCard } from "../cards/CompactBiomeCard";
import { useAlchemyStore } from "../../hooks/stores/useAlchemyStore";

interface ExplorationPageProps {
  store: ReturnType<typeof useAlchemyStore>;
}





export function ExplorationPage({ store }: ExplorationPageProps) {
  const [isExploring, setIsExploring] = useState(false);

  // Проверяем наличие необходимых данных
  if (!store) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Ошибка загрузки данных магазина</p>
      </div>
    );
  }

  if (!Array.isArray(store.biomes)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Загрузка биомов...</p>
      </div>
    );
  }

  if (!Array.isArray(store.ingredients)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Загрузка ингредиентов...</p>
      </div>
    );
  }

  const handleExplore = async (biomeId: string) => {
    setIsExploring(true);

      // Показываем toast о начале исследования
      const explorationToast = toast("Исследование в процессе...", {
        icon: <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>,
        duration: 2000
      });

    try {
      // Небольшая задержка для эффекта загрузки
      setTimeout(() => {
        try {
          const result = store.exploreLocation(biomeId);

            // Закрываем toast загрузки
            toast.dismiss(explorationToast);

            if (result.success) {
              toast.success(result.message, {
                icon: <CheckCircle className="h-4 w-4" />
              });
            } else {
              toast.error(result.message, {
                icon: <XCircle className="h-4 w-4" />
              });
            }
        } catch (error) {
          console.error('Ошибка при исследовании:', error);
          toast.dismiss(explorationToast);
          toast.error('Произошла ошибка при исследовании', {
            icon: <XCircle className="h-4 w-4" />
          });
        } finally {
          setIsExploring(false);
        }
      }, 1500);
    } catch (error) {
      console.error('Ошибка в handleExplore:', error);
      toast.dismiss(explorationToast);
      setIsExploring(false);
      toast.error('Произошла ошибка', {
        icon: <XCircle className="h-4 w-4" />
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl mb-2">Исследование мира</h1>
          <p className="text-muted-foreground">
            Исследуйте различные локации в поисках редких ингредиентов
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-1 px-3 py-1">
            <MapPin className="h-4 w-4" />
            {store.biomes.length} локаций
          </Badge>
          <Badge variant="outline" className="gap-1 px-3 py-1">
            <Coins className="h-4 w-4" />
            {Math.floor(store.getTotalGold())} золота
          </Badge>
        </div>
      </div>

      <Separator />

      {/* Советы по исследованию */}
      <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Советы исследователю
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <TrendingUp className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
            <span>Сложные локации дают более редкие ингредиенты</span>
          </div>
          <div className="flex items-start gap-2">
            <TrendingDown className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
            <span>Легкие локации дешевле и безопаснее для новичков</span>
          </div>
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
            <span>Исследование стоит золота, даже если ничего не найдено</span>
          </div>
        </CardContent>
      </Card>

      {/* Список биомов */}
      <div>
        <h3 className="mb-4">Доступные локации</h3>
        {store.biomes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Нет доступных локаций для исследования</p>
          </div>
        ) : (
          <div className="card-grid-max-2">
            {store.biomes.map((biome) => {
              if (!biome || !biome.id) {
                console.warn('Некорректный биом:', biome);
                return null;
              }
              
              return (
                <motion.div
                  key={biome.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <CompactBiomeCard
                    biome={biome}
                    playerGold={Math.floor(store.getTotalGold())}
                    onExplore={handleExplore}
                    ingredients={store.allIngredients}
                  />
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}