// components/forms/CustomItemForm.tsx

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { Badge } from "../ui/badge";
import { Plus, X, Leaf } from "lucide-react";
import { toast } from "sonner";
import { useAlchemyStore } from "@/hooks/stores/useAlchemyStore.ts";
import {
  AlchemicalElement,
  IngredientCategory,
  PotionRarity,
  ALCHEMICAL_ELEMENT_DETAILS
} from "@/hooks/types.ts";

type IngredientRarity = 'common' | 'uncommon' | 'rare' | 'very rare' | 'legendary';

interface CustomItemFormProps {
  store: ReturnType<typeof useAlchemyStore>;
}

const elementGroups = Object.entries(ALCHEMICAL_ELEMENT_DETAILS).reduce((acc, [key, value]) => {
  const category = value.category;
  if (!acc[category]) {
    acc[category] = [];
  }
  acc[category].push({ id: key as AlchemicalElement, ...value });
  return acc;
}, {} as Record<string, Array<{id: AlchemicalElement} & typeof ALCHEMICAL_ELEMENT_DETAILS[AlchemicalElement]>>);


export function CustomItemForm({ store }: CustomItemFormProps) {
  const initialFormState = {
    name: '',
    description: '',
    category: 'other' as IngredientCategory,
    rarity: 'common' as IngredientRarity,
    cost: 1,
    weight: 0.1,
    elements: [] as AlchemicalElement[],
    impurity: '' as AlchemicalElement | '',
    tags: [] as string[],
    newTag: '',
  };
  const [ingredientForm, setIngredientForm] = useState(initialFormState);

  const rarities: IngredientRarity[] = ['common', 'uncommon', 'rare', 'very rare', 'legendary'];
  const categories: IngredientCategory[] = ['creature', 'mineral', 'plant', 'other'];

  const handleElementChange = (elementId: AlchemicalElement, isChecked: boolean) => {
    setIngredientForm(prev => ({
      ...prev,
      elements: isChecked
        ? [...prev.elements, elementId]
        : prev.elements.filter(e => e !== elementId)
    }));
  };

  const addTag = () => {
    if (ingredientForm.newTag.trim() && !ingredientForm.tags.includes(ingredientForm.newTag.trim())) {
      setIngredientForm(prev => ({
        ...prev,
        tags: [...prev.tags, prev.newTag.trim()],
        newTag: ''
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setIngredientForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };


  const saveIngredient = () => {
    if (!ingredientForm.name.trim() || !ingredientForm.description.trim()) {
      toast.error("Заполните обязательные поля: Название и Описание");
      return;
    }
    try {
      store.addCustomIngredient({
        name: ingredientForm.name.trim(),
        description: ingredientForm.description.trim(),
        category: ingredientForm.category,
        rarity: ingredientForm.rarity,
        cost: ingredientForm.cost,
        weight: ingredientForm.weight,
        tags: ingredientForm.tags,
        elements: ingredientForm.elements,
        impurity: ingredientForm.impurity === '' ? undefined : ingredientForm.impurity,
        id: `custom_${Date.now()}`,
        type: ingredientForm.category,
        quantity: 0,
        locations: ["Создано вручную"]
      });
      toast.success(`Ингредиент "${ingredientForm.name.trim()}" успешно добавлен!`);
      setIngredientForm(initialFormState);
    } catch (error) {
      console.error("Save ingredient error:", error);
      toast.error("Ошибка при добавлении ингредиента");
    }
  };

  return (
    <Card>
      <CardHeader>
          <div className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-primary" />
            <CardTitle>Добавить свой ингредиент</CardTitle>
          </div>
        <CardDescription>
          Создайте уникальный ингредиент, который будет добавлен в общую базу данных.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="ing-name" className="text-xs">Название*</Label>
            <Input id="ing-name" value={ingredientForm.name} onChange={e => setIngredientForm(p => ({...p, name: e.target.value}))} />
          </div>
          <div>
             <Label htmlFor="ing-category" className="text-xs">Категория</Label>
            <Select value={ingredientForm.category} onValueChange={(v: IngredientCategory) => setIngredientForm(p => ({...p, category: v}))}>
              <SelectTrigger id="ing-category"><SelectValue /></SelectTrigger>
              <SelectContent>
                {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="ing-desc" className="text-xs">Описание*</Label>
          <Textarea id="ing-desc" value={ingredientForm.description} onChange={e => setIngredientForm(p => ({...p, description: e.target.value}))} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="ing-rarity" className="text-xs">Редкость</Label>
            <Select value={ingredientForm.rarity} onValueChange={(v: IngredientRarity) => setIngredientForm(p => ({...p, rarity: v}))}>
              <SelectTrigger id="ing-rarity"><SelectValue /></SelectTrigger>
              <SelectContent>
                {rarities.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
           <div>
            <Label htmlFor="ing-cost" className="text-xs">Стоимость (зм)</Label>
            <Input id="ing-cost" type="number" min="0" value={ingredientForm.cost} onChange={e => setIngredientForm(p => ({...p, cost: Number(e.target.value)}))} />
          </div>
           <div>
            <Label htmlFor="ing-weight" className="text-xs">Вес (фунт)</Label>
            <Input id="ing-weight" type="number" min="0" step="0.1" value={ingredientForm.weight} onChange={e => setIngredientForm(p => ({...p, weight: Number(e.target.value)}))} />
          </div>
        </div>

        <div>
            <Label className="text-sm font-medium">Основные элементы</Label>
            <div className="p-3 border rounded-lg mt-2 space-y-3 max-h-60 overflow-y-auto">
                {Object.entries(elementGroups).map(([category, elements]) => (
                    <div key={category}>
                        <h5 className="text-xs font-bold mb-2">{category}</h5>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {elements.map(element => (
                            <div key={element.id} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`el-${element.id}`}
                                    checked={ingredientForm.elements.includes(element.id)}
                                    onCheckedChange={(checked) => handleElementChange(element.id, !!checked)}
                                />
                                <Label htmlFor={`el-${element.id}`} className="text-xs font-normal cursor-pointer">{element.name}</Label>
                            </div>
                        ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div>
          <Label htmlFor="ing-impurity" className="text-sm font-medium">Примесь (необязательно)</Label>
          <Select value={ingredientForm.impurity} onValueChange={(v: AlchemicalElement) => setIngredientForm(p => ({...p, impurity: v}))}>
              <SelectTrigger id="ing-impurity"><SelectValue placeholder="Без примеси" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">Без примеси</SelectItem>
                {Object.values(ALCHEMICAL_ELEMENT_DETAILS).map(el => (
                  <SelectItem key={el.shortCode} value={el.shortCode}>{el.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
        </div>

        <div>
          <Label className="text-sm font-medium">Теги</Label>
          <div className="flex items-center gap-2 mt-1">
              <Input value={ingredientForm.newTag} onChange={e => setIngredientForm(p => ({...p, newTag: e.target.value}))} onKeyPress={e => e.key === 'Enter' && addTag()} placeholder="Новый тег" />
              <Button onClick={addTag}><Plus className="h-4 w-4"/></Button>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
              {ingredientForm.tags.map(tag => (
                  <Badge key={tag} variant="secondary">
                      {tag}
                      <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => removeTag(tag)}/>
                  </Badge>
              ))}
          </div>
        </div>

        <Button onClick={saveIngredient} className="w-full">
          <Plus className="h-4 w-4 mr-2" /> Добавить ингредиент
        </Button>
      </CardContent>
    </Card>
  );
}