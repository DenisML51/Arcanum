// components/CustomItemForm.tsx

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Plus, X, BookOpen, Leaf } from "lucide-react";
import { toast } from "sonner";
import type { useAlchemyStore, IngredientType, PotionRarity, PotionType, PotionQuality } from "../hooks/useAlchemyStore";

interface CustomItemFormProps {
  store: ReturnType<typeof useAlchemyStore>;
}

export function CustomItemForm({ store }: CustomItemFormProps) {
  const [activeTab, setActiveTab] = useState<'ingredient' | 'recipe'>('ingredient');

  // Состояние для формы ингредиента
  const [ingredientForm, setIngredientForm] = useState({
    name: '',
    description: '',
    type: 'herb' as IngredientType,
    rarity: 'common' as PotionRarity,
    quantity: 1,
    cost: 1,
    weight: 0.1,
    tags: [] as string[],
    locations: [] as string[],
    newTag: '',
    newLocation: ''
  });

  // Состояние для формы рецепта
  const [recipeForm, setRecipeForm] = useState({
    name: '',
    description: '',
    effect: '',
    rarity: 'common' as PotionRarity,
    potionType: 'potion' as PotionType,
    potionQuality: 'low' as PotionQuality,
    tags: [] as string[],
    newTag: '',
    components: [] as Array<{
      name: string;
      description: string;
      quantity: number;
      types: string[];
      tags: string[];
    }>
  });

  const ingredientTypes: IngredientType[] = ['herb', 'mineral', 'creature', 'essence', 'oil', 'crystal', 'poison'];
  const rarities: PotionRarity[] = ['common', 'uncommon', 'rare', 'very rare', 'legendary'];
  const potionTypes: PotionType[] = ['potion', 'elixir', 'oil'];
  const potionQualities: PotionQuality[] = ['low', 'common', 'high'];

  // Добавление тегов и локаций для ингредиента
  const addIngredientTag = () => {
    if (ingredientForm.newTag.trim() && !ingredientForm.tags.includes(ingredientForm.newTag.trim())) {
      setIngredientForm(prev => ({
        ...prev,
        tags: [...prev.tags, prev.newTag.trim()],
        newTag: ''
      }));
    }
  };

  const removeIngredientTag = (tag: string) => {
    setIngredientForm(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const addLocation = () => {
    if (ingredientForm.newLocation.trim() && !ingredientForm.locations.includes(ingredientForm.newLocation.trim())) {
      setIngredientForm(prev => ({
        ...prev,
        locations: [...prev.locations, prev.newLocation.trim()],
        newLocation: ''
      }));
    }
  };

  const removeLocation = (location: string) => {
    setIngredientForm(prev => ({
      ...prev,
      locations: prev.locations.filter(l => l !== location)
    }));
  };

  // Добавление тегов для рецепта
  const addRecipeTag = () => {
    if (recipeForm.newTag.trim() && !recipeForm.tags.includes(recipeForm.newTag.trim())) {
      setRecipeForm(prev => ({
        ...prev,
        tags: [...prev.tags, prev.newTag.trim()],
        newTag: ''
      }));
    }
  };

  const removeRecipeTag = (tag: string) => {
    setRecipeForm(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  // Добавление компонента для рецепта
  const addComponent = () => {
    setRecipeForm(prev => ({
      ...prev,
      components: [...prev.components, {
        name: '',
        description: '',
        quantity: 1,
        types: [],
        tags: []
      }]
    }));
  };

  const removeComponent = (index: number) => {
    setRecipeForm(prev => ({
      ...prev,
      components: prev.components.filter((_, i) => i !== index)
    }));
  };

  // Сохранение ингредиента
  const saveIngredient = () => {
    if (!ingredientForm.name.trim() || !ingredientForm.description.trim()) {
      toast.error("Заполните обязательные поля");
      return;
    }

    try {
      store.addCustomIngredient({
        name: ingredientForm.name.trim(),
        description: ingredientForm.description.trim(),
        type: ingredientForm.type,
        rarity: ingredientForm.rarity,
        quantity: ingredientForm.quantity,
        cost: ingredientForm.cost,
        weight: ingredientForm.weight,
        tags: ingredientForm.tags,
        locations: ingredientForm.locations
      });

      toast.success("Ингредиент добавлен!");

      // Сброс формы
      setIngredientForm({
        name: '',
        description: '',
        type: 'herb',
        rarity: 'common',
        quantity: 1,
        cost: 1,
        weight: 0.1,
        tags: [],
        locations: [],
        newTag: '',
        newLocation: ''
      });
    } catch (error) {
      toast.error("Ошибка при добавлении ингредиента");
    }
  };

  // Сохранение рецепта
  const saveRecipe = () => {
    if (!recipeForm.name.trim() || !recipeForm.description.trim() || !recipeForm.effect.trim()) {
      toast.error("Заполните обязательные поля");
      return;
    }

    if (recipeForm.components.length === 0) {
      toast.error("Добавьте хотя бы один компонент");
      return;
    }

    try {
      store.addCustomRecipe({
        name: recipeForm.name.trim(),
        description: recipeForm.description.trim(),
        effect: recipeForm.effect.trim(),
        rarity: recipeForm.rarity,
        potionType: recipeForm.potionType,
        potionQuality: recipeForm.potionQuality,
        tags: recipeForm.tags,
        inLaboratory: false,
        components: recipeForm.components.map((comp, index) => ({
          id: `comp_${Date.now()}_${index}`,
          ...comp,
          selectedIngredientId: undefined
        })),
        savingThrowType: 'constitution'
      });

      toast.success("Рецепт добавлен!");

      // Сброс формы
      setRecipeForm({
        name: '',
        description: '',
        effect: '',
        rarity: 'common',
        potionType: 'potion',
        potionQuality: 'low',
        tags: [],
        newTag: '',
        components: []
      });
    } catch (error) {
      toast.error("Ошибка при добавлении рецепта");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Добавить новые элементы</CardTitle>
        <CardDescription>
          Создайте собственные ингредиенты и рецепты для расширения коллекции
        </CardDescription>

        {/* Переключатель вкладок */}
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'ingredient' ? 'default' : 'outline'}
            onClick={() => setActiveTab('ingredient')}
            className="flex items-center gap-2"
          >
            <Leaf className="h-4 w-4" />
            Ингредиент
          </Button>
          <Button
            variant={activeTab === 'recipe' ? 'default' : 'outline'}
            onClick={() => setActiveTab('recipe')}
            className="flex items-center gap-2"
          >
            <BookOpen className="h-4 w-4" />
            Рецепт
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {activeTab === 'ingredient' ? (
          <div className="space-y-4">
            {/* Форма ингредиента */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ing-name">Название *</Label>
                <Input
                  id="ing-name"
                  value={ingredientForm.name}
                  onChange={(e) => setIngredientForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Название ингредиента"
                />
              </div>

              <div>
                <Label htmlFor="ing-type">Тип</Label>
                <Select value={ingredientForm.type} onValueChange={(value: IngredientType) =>
                  setIngredientForm(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ingredientTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="ing-desc">Описание *</Label>
              <Textarea
                id="ing-desc"
                value={ingredientForm.description}
                onChange={(e) => setIngredientForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Описание ингредиента"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="ing-rarity">Редкость</Label>
                <Select value={ingredientForm.rarity} onValueChange={(value: PotionRarity) =>
                  setIngredientForm(prev => ({ ...prev, rarity: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {rarities.map(rarity => (
                      <SelectItem key={rarity} value={rarity}>{rarity}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="ing-quantity">Количество</Label>
                <Input
                  id="ing-quantity"
                  type="number"
                  min="0"
                  value={ingredientForm.quantity}
                  onChange={(e) => setIngredientForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                />
              </div>

              <div>
                <Label htmlFor="ing-cost">Стоимость (зм)</Label>
                <Input
                  id="ing-cost"
                  type="number"
                  min="0"
                  step="0.1"
                  value={ingredientForm.cost}
                  onChange={(e) => setIngredientForm(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
                />
              </div>

              <div>
                <Label htmlFor="ing-weight">Вес (фунт)</Label>
                <Input
                  id="ing-weight"
                  type="number"
                  min="0"
                  step="0.1"
                  value={ingredientForm.weight}
                  onChange={(e) => setIngredientForm(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>

            {/* Теги */}
            <div>
              <Label>Теги</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={ingredientForm.newTag}
                  onChange={(e) => setIngredientForm(prev => ({ ...prev, newTag: e.target.value }))}
                  placeholder="Добавить тег"
                  onKeyPress={(e) => e.key === 'Enter' && addIngredientTag()}
                />
                <Button type="button" onClick={addIngredientTag} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {ingredientForm.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeIngredientTag(tag)} />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Локации */}
            <div>
              <Label>Локации</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={ingredientForm.newLocation}
                  onChange={(e) => setIngredientForm(prev => ({ ...prev, newLocation: e.target.value }))}
                  placeholder="Добавить локацию"
                  onKeyPress={(e) => e.key === 'Enter' && addLocation()}
                />
                <Button type="button" onClick={addLocation} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {ingredientForm.locations.map(location => (
                  <Badge key={location} variant="outline" className="gap-1">
                    {location}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeLocation(location)} />
                  </Badge>
                ))}
              </div>
            </div>

            <Button onClick={saveIngredient} className="w-full">
              Добавить ингредиент
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Форма рецепта */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rec-name">Название *</Label>
                <Input
                  id="rec-name"
                  value={recipeForm.name}
                  onChange={(e) => setRecipeForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Название рецепта"
                />
              </div>

              <div>
                <Label htmlFor="rec-rarity">Редкость</Label>
                <Select value={recipeForm.rarity} onValueChange={(value: PotionRarity) =>
                  setRecipeForm(prev => ({ ...prev, rarity: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {rarities.map(rarity => (
                      <SelectItem key={rarity} value={rarity}>{rarity}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="rec-desc">Описание *</Label>
              <Textarea
                id="rec-desc"
                value={recipeForm.description}
                onChange={(e) => setRecipeForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Описание рецепта"
              />
            </div>

            <div>
              <Label htmlFor="rec-effect">Эффект *</Label>
              <Textarea
                id="rec-effect"
                value={recipeForm.effect}
                onChange={(e) => setRecipeForm(prev => ({ ...prev, effect: e.target.value }))}
                placeholder="Описание эффекта зелья"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rec-type">Тип зелья</Label>
                <Select value={recipeForm.potionType} onValueChange={(value: PotionType) =>
                  setRecipeForm(prev => ({ ...prev, potionType: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {potionTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="rec-quality">Качество варева</Label>
                <Select value={recipeForm.potionQuality} onValueChange={(value: PotionQuality) =>
                  setRecipeForm(prev => ({ ...prev, potionQuality: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {potionQualities.map(quality => (
                      <SelectItem key={quality} value={quality}>{quality}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Теги рецепта */}
            <div>
              <Label>Теги</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={recipeForm.newTag}
                  onChange={(e) => setRecipeForm(prev => ({ ...prev, newTag: e.target.value }))}
                  placeholder="Добавить тег"
                  onKeyPress={(e) => e.key === 'Enter' && addRecipeTag()}
                />
                <Button type="button" onClick={addRecipeTag} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {recipeForm.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeRecipeTag(tag)} />
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* Компоненты рецепта */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label>Компоненты рецепта</Label>
                <Button type="button" onClick={addComponent} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить компонент
                </Button>
              </div>

              {recipeForm.components.map((component, index) => (
                <Card key={index} className="mb-4">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-2 mb-3">
                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Input
                            placeholder="Название компонента"
                            value={component.name}
                            onChange={(e) => {
                              const newComponents = [...recipeForm.components];
                              newComponents[index].name = e.target.value;
                              setRecipeForm(prev => ({ ...prev, components: newComponents }));
                            }}
                          />
                          <Input
                            type="number"
                            placeholder="Количество"
                            min="1"
                            value={component.quantity}
                            onChange={(e) => {
                              const newComponents = [...recipeForm.components];
                              newComponents[index].quantity = parseInt(e.target.value) || 1;
                              setRecipeForm(prev => ({ ...prev, components: newComponents }));
                            }}
                          />
                        </div>
                        <Textarea
                          placeholder="Описание компонента"
                          value={component.description}
                          onChange={(e) => {
                            const newComponents = [...recipeForm.components];
                            newComponents[index].description = e.target.value;
                            setRecipeForm(prev => ({ ...prev, components: newComponents }));
                          }}
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeComponent(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button onClick={saveRecipe} className="w-full">
              Добавить рецепт
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}