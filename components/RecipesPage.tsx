// components/RecipePage.tsx

import { useState } from "react";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Search, BookOpen, FlaskConical } from "lucide-react";
import { CompactRecipeCard } from "./CompactRecipeCard";
import { Separator } from "./ui/separator";
import { motion } from "framer-motion";
import type { useAlchemyStore } from "../hooks/useAlchemyStore";

interface RecipesPageProps {
  store: ReturnType<typeof useAlchemyStore>;
}

export function RecipesPage({ store }: RecipesPageProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Рассчитываем бонус персонажа к варке
  const activeEquipment = store.character.equipment.find(eq => eq.id === store.character.activeEquipmentId);
  const equipmentBonus = activeEquipment ? activeEquipment.brewingBonus : 0;
  const proficiencyBonus = store.character.alchemyToolsProficiency ? store.character.proficiencyBonus : 0;
  const totalCharacterBonus = equipmentBonus + proficiencyBonus;

  const filteredRecipes = store.recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.effect.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availableRecipes = filteredRecipes.filter(recipe => !recipe.inLaboratory);
  const laboratoryRecipes = filteredRecipes.filter(recipe => recipe.inLaboratory);

  const handleToggleLaboratory = (recipeId: string) => {
    const recipe = store.recipes.find(r => r.id === recipeId);
    if (recipe?.inLaboratory) {
      store.removeRecipeFromLaboratory(recipeId);
    } else {
      store.addRecipeToLaboratory(recipeId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Книга рецептов</h1>
          <p className="text-muted-foreground">
            Изучайте и добавляйте рецепты в лабораторию
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-1 px-3 py-1">
            <BookOpen className="h-3 w-3" />
            {store.recipes.length} рецептов
          </Badge>
          <Badge variant="outline" className="gap-1 px-3 py-1">
            <FlaskConical className="h-3 w-3" />
            {laboratoryRecipes.length} в лаборатории
          </Badge>
        </div>
      </div>

      {/* Поиск */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Поиск рецептов..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <Separator />

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">
            Все рецепты ({filteredRecipes.length})
          </TabsTrigger>
          <TabsTrigger value="available">
            Доступные ({availableRecipes.length})
          </TabsTrigger>
          <TabsTrigger value="laboratory">
            В лаборатории ({laboratoryRecipes.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-6">
            {filteredRecipes.map((recipe) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <CompactRecipeCard
                  recipe={recipe}
                  ingredients={store.ingredients}
                  onToggleLaboratory={handleToggleLaboratory}
                  onSelectIngredient={store.selectIngredientForComponent}
                  characterBonus={totalCharacterBonus}
                />
              </motion.div>
            ))}
          </div>

          {filteredRecipes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Рецепты не найдены
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="available" className="space-y-4">
          <div className="card-grid-responsive">
            {availableRecipes.map((recipe) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <CompactRecipeCard
                  recipe={recipe}
                  ingredients={store.ingredients}
                  onToggleLaboratory={handleToggleLaboratory}
                  onSelectIngredient={store.selectIngredientForComponent}
                  characterBonus={totalCharacterBonus}
                />
              </motion.div>
            ))}
          </div>

          {availableRecipes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchTerm ? 'Доступные рецепты не найдены' : 'Все рецепты уже в лаборатории'}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="laboratory" className="space-y-4">
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
                  onToggleLaboratory={handleToggleLaboratory}
                  onSelectIngredient={store.selectIngredientForComponent}
                  characterBonus={totalCharacterBonus}
                />
              </motion.div>
            ))}
          </div>

          {laboratoryRecipes.length === 0 && (
            <div className="text-center py-12">
              <div className="space-y-2">
                <FlaskConical className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">
                  {searchTerm ? 'Рецепты в лаборатории не найдены' : 'Лаборатория пуста'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Добавьте рецепты из доступных, чтобы начать варить зелья
                </p>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}