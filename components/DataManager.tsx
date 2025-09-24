// components/DataManager.tsx

import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Separator } from "./ui/separator";
import { Download, Upload, RefreshCw, FileText, AlertTriangle, CheckCircle, Database } from "lucide-react";
import { toast } from "sonner";
import { exportData, importData, loadAllData, validateIngredient, validateRecipe, validateBiome, validateEquipment } from "../utils/dataLoader";
import { CustomItemForm } from "./CustomItemForm";
import type { useAlchemyStore } from "../hooks/useAlchemyStore";
import ingredientsData from "../data/ingredients.json";
import recipesData from "../data/recipes.json";
import biomesData from "../data/biomes.json";
import equipmentData from "../data/equipment.json";

interface DataManagerProps {
  store: ReturnType<typeof useAlchemyStore>;
}

export function DataManager({ store }: DataManagerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [importStats, setImportStats] = useState<{
    ingredients: number;
    recipes: number;
    biomes: number;
    equipment: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Экспорт данных
  const handleExport = () => {
    try {
      exportData({
        ingredients: store.ingredients,
        recipes: store.recipes,
        biomes: store.biomes,
        equipment: store.availableEquipment
      });
      toast.success("Данные успешно экспортированы", {
        icon: <Download className="h-4 w-4" />
      });
    } catch (error) {
      toast.error("Ошибка при экспорте данных", {
        icon: <AlertTriangle className="h-4 w-4" />
      });
    }
  };

  // Импорт данных из файла
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const data = await importData(file);
      let stats = { ingredients: 0, recipes: 0, biomes: 0, equipment: 0 };

      // Валидация и добавление ингредиентов
      if (data.ingredients) {
        const validIngredients = data.ingredients.filter(validateIngredient);
        stats.ingredients = validIngredients.length;
        validIngredients.forEach(ingredient => {
          const existingIndex = store.ingredients.findIndex(i => i.id === ingredient.id);
          if (existingIndex >= 0) {
            // Обновляем существующий ингредиент
            store.updateIngredientQuantity(ingredient.id, ingredient.quantity);
          } else {
            // Добавляем новый ингредиент, убираем id чтобы создался новый
            const { id, ...ingredientWithoutId } = ingredient;
            store.addCustomIngredient(ingredientWithoutId);
          }
        });
      }

      // Валидация и добавление рецептов
      if (data.recipes) {
        const validRecipes = data.recipes.filter(validateRecipe);
        stats.recipes = validRecipes.length;
        validRecipes.forEach(recipe => {
          const exists = store.recipes.some(r => r.id === recipe.id);
          if (!exists) {
            // Убираем id чтобы создался новый
            const { id, ...recipeWithoutId } = recipe;
            store.addCustomRecipe(recipeWithoutId);
          }
        });
      }

      // Валидация и добавление биомов и оборудования
      if (data.biomes) {
        const validBiomes = data.biomes.filter(validateBiome);
        stats.biomes = validBiomes.length;
      }

      if (data.equipment) {
        const validEquipment = data.equipment.filter(validateEquipment);
        stats.equipment = validEquipment.length;
      }

      // Загружаем биомы и оборудование через loadData
      await store.loadData({
        biomes: data.biomes?.filter(validateBiome),
        equipment: data.equipment?.filter(validateEquipment)
      });

      setImportStats(stats);
      toast.success("Данные успешно импортированы", {
        icon: <CheckCircle className="h-4 w-4" />
      });
    } catch (error) {
      toast.error("Ошибка при импорте данных", {
        icon: <AlertTriangle className="h-4 w-4" />
      });
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Загрузка данных по умолчанию из JSON файлов
  const handleLoadDefaults = async () => {
    setIsLoading(true);
    try {
      await store.initializeDefaultData();

      toast.success("Данные по умолчанию загружены", {
        icon: <RefreshCw className="h-4 w-4" />
      });
    } catch (error) {
      toast.error("Ошибка при загрузке данных по умолчанию", {
        icon: <AlertTriangle className="h-4 w-4" />
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Принудительное обновление данных из JSON файлов
  const handleForceUpdate = async () => {
    setIsLoading(true);
    try {
      await store.forceUpdateData();

      toast.success("Данные принудительно обновлены из JSON файлов", {
        icon: <RefreshCw className="h-4 w-4" />
      });
    } catch (error) {
      toast.error("Ошибка при принудительном обновлении данных", {
        icon: <AlertTriangle className="h-4 w-4" />
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Полный сброс к значениям по умолчанию
  const handleResetToDefaults = () => {
    if (confirm("Вы уверены, что хотите сбросить ВСЕ данные к значениям по умолчанию? Это удалит все ваши персонажи, зелья и настройки!")) {
      try {
        localStorage.removeItem('alchemy-store');
        window.location.reload();
      } catch (error) {
        toast.error("Ошибка при сбросе данных", {
          icon: <AlertTriangle className="h-4 w-4" />
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Форма добавления новых элементов */}
      <CustomItemForm store={store} />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <CardTitle>Управление данными</CardTitle>
          </div>
          <CardDescription>
            Импорт и экспорт ингредиентов, рецептов, биомов и оборудования
          </CardDescription>
        </CardHeader>
      <CardContent className="space-y-6">
        {/* Текущая статистика */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-primary">{Array.isArray(store.ingredients) ? store.ingredients.length : 0}</div>
            <div className="text-sm text-muted-foreground">Ингредиентов</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-primary">{Array.isArray(store.recipes) ? store.recipes.length : 0}</div>
            <div className="text-sm text-muted-foreground">Рецептов</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-primary">{Array.isArray(store.biomes) ? store.biomes.length : 0}</div>
            <div className="text-sm text-muted-foreground">Биомов</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-primary">{Array.isArray(store.availableEquipment) ? store.availableEquipment.length : 0}</div>
            <div className="text-sm text-muted-foreground">Оборудования</div>
          </div>
        </div>

        <Separator />

        {/* Экспорт */}
        <div className="space-y-3">
          <h4 className="text-lg font-medium">Экспорт данных</h4>
          <p className="text-sm text-muted-foreground">
            Экспортируйте все текущие данные в JSON файл для резервного копирования или обмена.
          </p>
          <Button onClick={handleExport} className="w-full" variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Экспортировать все данные
          </Button>
        </div>

        <Separator />

        {/* Импорт */}
        <div className="space-y-3">
          <h4 className="text-lg font-medium">Импорт данных</h4>
          <p className="text-sm text-muted-foreground">
            Импортируйте данные из JSON файла. Новые элементы будут добавлены к существующим.
          </p>
          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
              variant="outline"
              disabled={isLoading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {isLoading ? 'Импорт...' : 'Выбрать JSON файл'}
            </Button>
          </div>

          {importStats && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Импортировано: {importStats.ingredients} ингредиентов, {importStats.recipes} рецептов, {importStats.biomes} биомов, {importStats.equipment} оборудования
              </AlertDescription>
            </Alert>
          )}
        </div>

        <Separator />

        {/* Загрузка по умолчанию */}
        <div className="space-y-3">
          <h4 className="text-lg font-medium">Данные по умолчанию</h4>
          <p className="text-sm text-muted-foreground">
            Загрузите базовые данные из встроенных JSON файлов. Новые элементы будут добавлены к существующим.
          </p>
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              В базе содержится {ingredientsData.length} ингредиентов, {recipesData.length} рецептов, {biomesData.length} биомов и {equipmentData.length} единиц оборудования.
            </AlertDescription>
          </Alert>
          <Button
            onClick={handleLoadDefaults}
            className="w-full"
            variant="secondary"
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {isLoading ? 'Загрузка...' : 'Загрузить данные по умолчанию'}
          </Button>
        </div>

        <Separator />

        {/* Принудительное обновление */}
        <div className="space-y-3">
          <h4 className="text-lg font-medium">Принудительное обновление</h4>
          <p className="text-sm text-muted-foreground">
            Принудительно заменить текущие данные данными из JSON файлов. <strong>Внимание:</strong> это перезапишет текущие ингредиенты, рецепты, биомы и оборудование!
          </p>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Эта операция заменит все текущие данные новыми из JSON файлов. Рекомендуется сделать экспорт перед выполнением.
            </AlertDescription>
          </Alert>
          <Button
            onClick={handleForceUpdate}
            className="w-full"
            variant="destructive"
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {isLoading ? 'Обновление...' : 'Принудительно обновить данные'}
          </Button>
        </div>

        <Separator />

        {/* Полный сброс */}
        <div className="space-y-3">
          <h4 className="text-lg font-medium">Полный сброс</h4>
          <p className="text-sm text-muted-foreground">
            Полностью очистить все сохраненные данные и вернуться к изначальному состоянию приложения.
          </p>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>ОСТОРОЖНО!</strong> Эта операция удалит все ваши данные: персонажей, зелья, ингредиенты, настройки. Это действие необратимо!
            </AlertDescription>
          </Alert>
          <Button
            onClick={handleResetToDefaults}
            className="w-full"
            variant="destructive"
            disabled={isLoading}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Полный сброс к значениям по умолчанию
          </Button>
        </div>

        <Separator />

        {/* Документация */}
        <div className="space-y-3">
          <h4 className="text-lg font-medium">Формат данных</h4>
          <p className="text-sm text-muted-foreground">
            JSON файлы должны содержать массивы объектов со следующими полями:
          </p>
          <div className="grid gap-2">
            <Badge variant="outline" className="justify-start">
              <FileText className="h-3 w-3 mr-1" />
              ingredients: id, name, description, type, tags[], rarity, quantity, cost, weight, locations[]
            </Badge>
            <Badge variant="outline" className="justify-start">
              <FileText className="h-3 w-3 mr-1" />
              recipes: id, name, description, effect, rarity, potionType, potionQuality, tags[], components[], inLaboratory
            </Badge>
            <Badge variant="outline" className="justify-start">
              <FileText className="h-3 w-3 mr-1" />
              biomes: id, name, description, difficulty, cost, *Ingredients[]
            </Badge>
            <Badge variant="outline" className="justify-start">
              <FileText className="h-3 w-3 mr-1" />
              equipment: id, name, description, brewingBonus, cost, weight, rarity
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
    </div>
  );
}