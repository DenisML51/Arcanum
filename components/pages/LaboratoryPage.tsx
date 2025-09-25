// components/pages/LaboratoryPage.tsx

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { Alert, AlertDescription } from "../ui/alert";
import { CompactRecipeCard } from "../cards/CompactRecipeCard";
import { FlaskConical, Package, AlertTriangle, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAlchemyStore } from "../../hooks/stores/useAlchemyStore";

interface LaboratoryPageProps {
  store: ReturnType<typeof useAlchemyStore>;
}

export function LaboratoryPage({ store }: LaboratoryPageProps) {
  const [isBrewingMode, setIsBrewingMode] = useState(false);
  const [notifications, setNotifications] = useState<Array<{ id: string; message: string; type: 'success' | 'error' }>>([]);

  const laboratoryRecipes = store.getLaboratoryRecipes();

  const activeEquipment = store.availableEquipment.find(eq => eq.id === store.character.activeEquipmentId);
  const equipmentBonus = activeEquipment ? activeEquipment.brewingBonus : 0;
  const proficiencyBonus = store.character.alchemyToolsProficiency ? 2 : 0;
  const totalCharacterBonus = equipmentBonus + proficiencyBonus;

  const addNotification = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  }, []);

  const handleBrew = (recipeId: string) => {
    const recipe = store.recipes.find(r => r.id === recipeId);
    if (!recipe) return;
    const result = store.brewPotion(recipe);
    if (result.success) {
      addNotification(result.message, 'success');
    } else {
      addNotification(result.message, 'error');
    }
  };

  const getLabStats = () => {
    const totalRecipes = laboratoryRecipes.length;
    const availableRecipes = laboratoryRecipes.filter(recipe => {
        return recipe.components.every(component =>
            store.ingredients.some(ing => {
                if (component.requiredElements && component.requiredElements.length > 0) {
                    if (!component.requiredElements.every(el => ing.elements?.includes(el))) return false;
                }
                if (component.categories && component.categories.length > 0) {
                    if (!component.categories.includes(ing.category)) return false;
                }
                if (component.types && component.types.length > 0) {
                    if (!component.types.includes(ing.type as any)) return false;
                }
                return true;
            })
        )
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
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {availableRecipes} из {totalRecipes} рецептов готовы к варке
                </p>
                {isBrewingMode && (
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                    ✓ Режим варки активен - выберите ингредиенты и варите зелья
                  </p>
                )}
              </div>
              <Button
                variant={isBrewingMode ? "destructive" : "default"}
                onClick={() => setIsBrewingMode(!isBrewingMode)}
                size="sm"
                className={`transition-all duration-200 ${
                  isBrewingMode 
                    ? 'bg-red-600 hover:bg-red-700 shadow-lg' 
                    : 'bg-green-600 hover:bg-green-700 shadow-lg'
                }`}
              >
                <FlaskConical className="h-4 w-4 mr-2" />
                {isBrewingMode ? 'Завершить варку' : 'Начать варку'}
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
                    onBrew={handleBrew}
                    canBrew={isBrewingMode}
                    characterBonus={totalCharacterBonus}
                    isInLaboratory={true}
                    brewingMode={store.character.brewingMode}
                    onSelectIngredient={store.selectIngredientForComponent}
                    getSelectedIngredient={store.getSelectedIngredient}
                    toggleMagicalDust={store.toggleMagicalDust}
                    isMagicalDustActive={store.isMagicalDustActive}
                    hasMagicalDust={store.hasMagicalDust}
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

      <div className="fixed bottom-4 right-4 z-50 space-y-3">
        <AnimatePresence>
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 300, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.8 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`flex items-start gap-3 p-4 rounded-lg shadow-lg max-w-sm backdrop-blur-sm border ${
                notification.type === 'success' 
                  ? 'bg-green-500/80 text-white border-green-400/50' 
                  : 'bg-red-500/80 text-white border-red-400/50'
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {notification.type === 'success' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">
                  {notification.message}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}