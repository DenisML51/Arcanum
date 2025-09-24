// components/RecipeCard.tsx

import { Badge } from "../ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Clock, Target, FlaskConical } from "lucide-react";
import type { Recipe, Ingredient } from "../../hooks/types";

interface RecipeCardProps {
  recipe: Recipe;
  ingredients: Ingredient[];
  onToggleLaboratory: (recipeId: string) => void;
  canBrew?: boolean;
  onBrew?: (recipeId: string) => void;
}

const difficultyColors = {
  easy: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  hard: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
};

function getDifficultyLabel(difficulty: number) {
  if (difficulty <= 3) return { label: 'Легкий', color: difficultyColors.easy };
  if (difficulty <= 6) return { label: 'Средний', color: difficultyColors.medium };
  return { label: 'Сложный', color: difficultyColors.hard };
}

export function RecipeCard({ recipe, ingredients, onToggleLaboratory, canBrew, onBrew }: RecipeCardProps) {
  const difficultyInfo = getDifficultyLabel(recipe.difficulty);

  const getIngredientInfo = (ingredientId: string, requiredQuantity: number) => {
    const ingredient = ingredients.find(ing => ing.id === ingredientId);
    const available = ingredient?.quantity || 0;
    const hasEnough = available >= requiredQuantity;

    return {
      ingredient,
      available,
      hasEnough,
      requiredQuantity
    };
  };

  const allIngredientsAvailable = recipe.ingredients.every(reqIng => {
    const info = getIngredientInfo(reqIng.ingredientId, reqIng.quantity);
    return info.hasEnough;
  });

  return (
    <Card className="h-full transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{recipe.name}</CardTitle>
            <CardDescription className="text-sm">
              {recipe.description}
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className={`${difficultyInfo.color} border-none shrink-0 ml-2`}
          >
            {difficultyInfo.label}
          </Badge>
        </div>

        <div className="flex items-center gap-4 pt-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{recipe.brewingTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <Target className="h-3 w-3" />
            <span>{recipe.baseSuccessChance}%</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-sm">
            <span className="text-sm">Эффект:</span> {recipe.effect}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm">Ингредиенты:</p>
          <div className="space-y-2">
            {recipe.ingredients.map((reqIngredient) => {
              const info = getIngredientInfo(reqIngredient.ingredientId, reqIngredient.quantity);

              return (
                <div
                  key={reqIngredient.ingredientId}
                  className={`flex items-center justify-between p-2 rounded-md border ${
                    info.hasEnough ? 'bg-green-50 border-green-200 dark:bg-green-950/50 dark:border-green-800' : 
                    'bg-red-50 border-red-200 dark:bg-red-950/50 dark:border-red-800'
                  }`}
                >
                  <span className="text-sm">
                    {info.ingredient?.name || 'Неизвестный ингредиент'}
                  </span>
                  <span className={`text-sm ${info.hasEnough ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                    {info.available}/{reqIngredient.quantity}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-2 border-t space-y-2">
          {!recipe.inLaboratory ? (
            <Button
              onClick={() => onToggleLaboratory(recipe.id)}
              variant="outline"
              className="w-full"
            >
              <FlaskConical className="h-4 w-4 mr-2" />
              Добавить в лабораторию
            </Button>
          ) : (
            <div className="space-y-2">
              <Button
                onClick={() => onToggleLaboratory(recipe.id)}
                variant="outline"
                className="w-full"
              >
                Убрать из лаборатории
              </Button>

              {canBrew && onBrew && (
                <Button
                  onClick={() => onBrew(recipe.id)}
                  disabled={!allIngredientsAvailable}
                  className="w-full"
                  variant={allIngredientsAvailable ? "default" : "secondary"}
                >
                  <FlaskConical className="h-4 w-4 mr-2" />
                  {allIngredientsAvailable ? 'Сварить зелье' : 'Недостаточно ингредиентов'}
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}