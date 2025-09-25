// components/common/DataManager.tsx

import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Alert, AlertDescription } from "../ui/alert";
import { Separator } from "../ui/separator";
import { Download, Upload, RefreshCw, FileText, AlertTriangle, CheckCircle, Database } from "lucide-react";
import { Badge } from "../ui/badge"
import { toast } from "sonner";
import { useAlchemyStore } from "@/hooks/stores/useAlchemyStore.ts";

interface DataManagerProps {
  store: ReturnType<typeof useAlchemyStore>;
}

export function DataManager({ store }: DataManagerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      store.exportAllData();
      toast.success("Данные успешно экспортированы", {
        icon: <Download className="h-4 w-4" />
      });
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Ошибка при экспорте данных", {
        icon: <AlertTriangle className="h-4 w-4" />
      });
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const result = await store.importAllData(file);
      if (result.success) {
        toast.success(result.message, {
          icon: <CheckCircle className="h-4 w-4" />
        });
      } else {
        toast.error(result.message, {
          icon: <AlertTriangle className="h-4 w-4" />
        });
      }
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Не удалось прочитать или обработать файл.", {
        icon: <AlertTriangle className="h-4 w-4" />
      });
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleResetToDefaults = () => {
    if (confirm("Вы уверены, что хотите сбросить ВСЕ данные к значениям по умолчанию? Это действие необратимо и удалит всех персонажей, инвентарь и настройки!")) {
      try {
        store.resetAllData();
      } catch (error) {
        toast.error("Ошибка при сбросе данных", {
          icon: <AlertTriangle className="h-4 w-4" />
        });
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          <CardTitle>Управление данными</CardTitle>
        </div>
        <CardDescription>
          Полный экспорт и импорт всего состояния приложения.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <h4 className="text-lg font-medium">Экспорт данных</h4>
          <p className="text-sm text-muted-foreground">
            Сохраните всё состояние вашего алхимика в один JSON файл: персонажа, инвентарь, зелья, лабораторию и настройки.
          </p>
          <Button onClick={handleExport} className="w-full" variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Экспортировать все данные
          </Button>
        </div>
        <Separator />

        <div className="space-y-3">
          <h4 className="text-lg font-medium">Импорт данных</h4>
          <p className="text-sm text-muted-foreground">
            Загрузите ранее сохраненный JSON файл. <strong>Внимание:</strong> это полностью перезапишет все текущие данные!
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
              {isLoading ? 'Импорт...' : 'Выбрать JSON файл для импорта'}
            </Button>
          </div>
        </div>
        <Separator />

        <div className="space-y-3">
          <h4 className="text-lg font-medium">Полный сброс</h4>
           <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>ОСТОРОЖНО!</strong> Эта операция необратимо удалит все ваши данные и вернет приложение к состоянию по умолчанию. Рекомендуется сначала сделать экспорт.
            </AlertDescription>
          </Alert>
          <Button
            onClick={handleResetToDefaults}
            className="w-full"
            variant="destructive"
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Полный сброс к значениям по умолчанию
          </Button>
        </div>
        <Separator />

        <div className="space-y-3">
          <h4 className="text-lg font-medium">Формат данных</h4>
          <p className="text-sm text-muted-foreground">
            Экспортируемый JSON файл содержит следующие основные ключи:
          </p>
          <div className="grid gap-2 text-xs">
            <Badge variant="outline" className="justify-start font-mono">
              <FileText className="h-3 w-3 mr-2" />
              character: {'{{...}}'}
            </Badge>
             <Badge variant="outline" className="justify-start font-mono">
              <FileText className="h-3 w-3 mr-2" />
              currency: {'{{...}}'}
            </Badge>
             <Badge variant="outline" className="justify-start font-mono">
              <FileText className="h-3 w-3 mr-2" />
              stats: {'{{...}}'}
            </Badge>
             <Badge variant="outline" className="justify-start font-mono">
              <FileText className="h-3 w-3 mr-2" />
              ownedEquipment: {'[...]'}
            </Badge>
            <Badge variant="outline" className="justify-start font-mono">
              <FileText className="h-3 w-3 mr-2" />
              inventory: {'[...]'}
            </Badge>
             <Badge variant="outline" className="justify-start font-mono">
              <FileText className="h-3 w-3 mr-2" />
              potions: {'[...]'}
            </Badge>
             <Badge variant="outline" className="justify-start font-mono">
              <FileText className="h-3 w-3 mr-2" />
              laboratoryRecipes: {'[...]'}
            </Badge>
             <Badge variant="outline" className="justify-start font-mono">
              <FileText className="h-3 w-3 mr-2" />
              selectedIngredients: {'[...]'}
            </Badge>
             <Badge variant="outline" className="justify-start font-mono">
              <FileText className="h-3 w-3 mr-2" />
              useMagicalDust: {'[...]'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}