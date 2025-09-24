// components/LaboratoryPage.tsx

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { Alert, AlertDescription } from "../ui/alert";
import { CompactRecipeCard } from "../cards/CompactRecipeCard";
import { FlaskConical, Package, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useAlchemyStore } from "../../hooks/stores/useAlchemyStore";

interface LaboratoryPageProps {
  store: ReturnType<typeof useAlchemyStore>;
}



export function LaboratoryPage({ store }: LaboratoryPageProps) {
  const [isBrewingMode, setIsBrewingMode] = useState(false);

  const laboratoryRecipes = store.getLaboratoryRecipes();

  // Рассчитываем бонус персонажа к варке
  const activeEquipment = store.availableEquipment.find(eq => eq.id === store.character.activeEquipmentId);
  const equipmentBonus = activeEquipment ? activeEquipment.brewingBonus : 0;
  const proficiencyBonus = store.character.alchemyToolsProficiency ? 2 : 0;
  const totalCharacterBonus = equipmentBonus + proficiencyBonus;


  const handleBrew = (recipeId: string) => {
    const recipe = store.recipes.find(r => r.id === recipeId);
    if (!recipe) return;
    const result = store.brewPotion(recipe);

    if (result.success) {
      toast.success(result.message, {
        icon: <CheckCircle className="h-4 w-4" />,
        duration: 3000
      });
    } else {
      toast.error(result.message, {
        icon: <AlertTriangle className="h-4 w-4" />,
        duration: 4000
      });
    }
  };

  const getLabStats = () => {
    const totalRecipes = laboratoryRecipes.length;
    const availableRecipes = laboratoryRecipes.filter(recipe => {
      const { canBrew } = store.canBrewRecipe(recipe);
      return canBrew;
    }).length;

    return { totalRecipes, availableRecipes };
  };

  const { totalRecipes, availableRecipes } = getLabStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Алхимическая лаборатория</h1>
          <p className="text-muted-foreground">
            Варите зелья из добавленных рецептов
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <FlaskConical className="h-3 w-3" />
            {totalRecipes} рецептов
          </Badge>
        </div>
      </div>

      {/* Статистика лаборатории */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FlaskConical className="h-4 w-4" />
              Готовые к варке
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl">{availableRecipes}</span>
                <span className="text-sm text-muted-foreground">из {totalRecipes}</span>
              </div>
              <Progress
                value={totalRecipes > 0 ? (availableRecipes / totalRecipes) * 100 : 0}
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4" />
              Рецептов в работе
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{totalRecipes}</div>
            <p className="text-sm text-muted-foreground">
              активных рецептов
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Предупреждения */}
      {totalRecipes === 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            В лаборатории нет рецептов. Добавьте рецепты из книги рецептов, чтобы начать варить зелья.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {laboratoryRecipes.length > 0 ? (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {availableRecipes} из {totalRecipes} рецептов готовы к варке
              </p>
              <Button
                variant={isBrewingMode ? "destructive" : "default"}
                onClick={() => setIsBrewingMode(!isBrewingMode)}
                size="sm"
              >
                {isBrewingMode ? 'Выйти из режима варки' : 'Режим варки'}
              </Button>
            </div>

            <div className="card-grid-responsive">
              {laboratoryRecipes.map((recipe) => (
                <motion.div
                  key={recipe.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <CompactRecipeCard
                    recipe={recipe}
                    ingredients={store.ingredients}
                    onToggleLaboratory={(recipeId) => store.removeRecipeFromLaboratory(recipeId)}
                    onSelectIngredient={store.selectIngredientForComponent}
                    getSelectedIngredient={store.getSelectedIngredient}
                    canBrew={isBrewingMode}
                    onBrew={handleBrew}
                    characterBonus={totalCharacterBonus}
                    isInLaboratory={true}
                  />
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="space-y-2">
              <FlaskConical className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">
                Лаборатория пуста
              </p>
              <p className="text-sm text-muted-foreground">
                Добавьте рецепты из книги рецептов, чтобы начать варить зелья
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}