// components/CustomItemForm.tsx

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { FormField, FormInput, FormTextarea, FormSelect } from "../ui/form-field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Plus, X, BookOpen, Leaf } from "lucide-react";
import { toast } from "sonner";
import type { IngredientType, PotionRarity, PotionType, PotionQuality } from "../../hooks/types";
import { useAlchemyStore } from "../../hooks/stores/useAlchemyStore";

interface CustomItemFormProps {
  store: ReturnType<typeof useAlchemyStore>;
}

export function CustomItemForm({ store }: CustomItemFormProps) {
  const [activeTab, setActiveTab] = useState<'ingredient' | 'recipe'>('ingredient');

  // Состояние для формы ингредиента
  const [ingredientForm, setIngredientForm] = useState({
    name: '',
    description: '',
    type: 'plant' as IngredientType,
    rarity: 'common' as 'common' | 'uncommon' | 'rare' | 'very rare' | 'legendary',
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
    rarity: 'common' as 'common' | 'uncommon' | 'rare' | 'very rare' | 'legendary',
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

  const ingredientTypes: IngredientType[] = ['plant', 'mineral', 'creature', 'other', 'spring_water', 'enchanted_ink', 'thick_magical_ink', 'dissolved_ether', 'irminsul_juice'];
  const rarities: Array<'common' | 'uncommon' | 'rare' | 'very rare' | 'legendary'> = ['common', 'uncommon', 'rare', 'very rare', 'legendary'];
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
      store.addIngredient({
        name: ingredientForm.name.trim(),
        description: ingredientForm.description.trim(),
        type: ingredientForm.type,
        category: ingredientForm.type as any, // Приводим к IngredientCategory
        elements: [], // Пустой массив элементов
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
        type: 'plant',
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

  // Сохранение рецепта (пока отключено)
  const saveRecipe = () => {
    toast.error("Добавление рецептов временно недоступно");
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
              <FormField label="Название" required>
                <FormInput
                  value={ingredientForm.name}
                  onChange={(e) => setIngredientForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Название ингредиента"
                />
              </FormField>

              <FormField label="Тип">
                <FormSelect 
                  value={ingredientForm.type} 
                  onChange={(e) => setIngredientForm(prev => ({ ...prev, type: e.target.value as IngredientType }))}
                >
                  {ingredientTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </FormSelect>
              </FormField>
            </div>

            <FormField label="Описание" required>
              <FormTextarea
                value={ingredientForm.description}
                onChange={(e) => setIngredientForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Описание ингредиента"
              />
            </FormField>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <FormField label="Редкость">
                <FormSelect 
                  value={ingredientForm.rarity} 
                  onChange={(e) => setIngredientForm(prev => ({ ...prev, rarity: e.target.value as 'common' | 'uncommon' | 'rare' | 'very rare' | 'legendary' }))}
                >
                  {rarities.map(rarity => (
                    <option key={rarity} value={rarity}>{rarity}</option>
                  ))}
                </FormSelect>
              </FormField>

              <FormField label="Количество">
                <FormInput
                  type="number"
                  min="0"
                  value={ingredientForm.quantity}
                  onChange={(e) => setIngredientForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                />
              </FormField>

              <FormField label="Стоимость (зм)">
                <FormInput
                  type="number"
                  min="0"
                  step="0.1"
                  value={ingredientForm.cost}
                  onChange={(e) => setIngredientForm(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
                />
              </FormField>

              <FormField label="Вес (фунт)">
                <FormInput
                  type="number"
                  min="0"
                  step="0.1"
                  value={ingredientForm.weight}
                  onChange={(e) => setIngredientForm(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                />
              </FormField>
            </div>

            {/* Теги */}
            <FormField label="Теги">
              <div className="flex gap-2 mb-2">
                <FormInput
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
            </FormField>

            {/* Локации */}
            <FormField label="Локации">
              <div className="flex gap-2 mb-2">
                <FormInput
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
            </FormField>

            <Button onClick={saveIngredient} className="w-full">
              Добавить ингредиент
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Форма рецепта */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Название" required>
                <FormInput
                  value={recipeForm.name}
                  onChange={(e) => setRecipeForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Название рецепта"
                />
              </FormField>

              <FormField label="Редкость">
                <FormSelect 
                  value={recipeForm.rarity} 
                  onChange={(e) => setRecipeForm(prev => ({ ...prev, rarity: e.target.value as 'common' | 'uncommon' | 'rare' | 'very rare' | 'legendary' }))}
                >
                  {rarities.map(rarity => (
                    <option key={rarity} value={rarity}>{rarity}</option>
                  ))}
                </FormSelect>
              </FormField>
            </div>

            <FormField label="Описание" required>
              <FormTextarea
                value={recipeForm.description}
                onChange={(e) => setRecipeForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Описание рецепта"
              />
            </FormField>

            <FormField label="Эффект" required>
              <FormTextarea
                value={recipeForm.effect}
                onChange={(e) => setRecipeForm(prev => ({ ...prev, effect: e.target.value }))}
                placeholder="Описание эффекта зелья"
              />
            </FormField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Тип зелья">
                <FormSelect 
                  value={recipeForm.potionType} 
                  onChange={(e) => setRecipeForm(prev => ({ ...prev, potionType: e.target.value as PotionType }))}
                >
                  {potionTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </FormSelect>
              </FormField>

              <FormField label="Качество варева">
                <FormSelect 
                  value={recipeForm.potionQuality} 
                  onChange={(e) => setRecipeForm(prev => ({ ...prev, potionQuality: e.target.value as PotionQuality }))}
                >
                  {potionQualities.map(quality => (
                    <option key={quality} value={quality}>{quality}</option>
                  ))}
                </FormSelect>
              </FormField>
            </div>

            {/* Теги рецепта */}
            <FormField label="Теги">
              <div className="flex gap-2 mb-2">
                <FormInput
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
            </FormField>

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
                          <FormInput
                            placeholder="Название компонента"
                            value={component.name}
                            onChange={(e) => {
                              const newComponents = [...recipeForm.components];
                              newComponents[index].name = e.target.value;
                              setRecipeForm(prev => ({ ...prev, components: newComponents }));
                            }}
                          />
                          <FormInput
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
                        <FormTextarea
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