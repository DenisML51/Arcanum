// components/AnalyticsPage.tsx

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Separator } from "../ui/separator";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  FlaskConical,
  Package,
  Coins,
  Target,
  CheckCircle,
  XCircle,
  Award
} from "lucide-react";
import { useAlchemyStore } from "../../hooks/stores/useAlchemyStore";

interface AnalyticsPageProps {
  store: ReturnType<typeof useAlchemyStore>;
}

const RARITY_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

export function AnalyticsPage({ store }: AnalyticsPageProps) {
  const { stats, ingredients, recipes, potions, playerGold } = store;

  // Вычисляем различные метрики
  const successRate = stats.totalBrews > 0 ? (stats.successfulBrews / stats.totalBrews) * 100 : 0;
  const totalIngredients = ingredients.reduce((sum, ing) => sum + ing.quantity, 0);
  const totalPotions = potions.reduce((sum, potion) => sum + potion.quantity, 0);
  const netGold = stats.goldEarned - stats.goldSpent;
  const avgIngredientsPerBrew = stats.totalBrews > 0 ? stats.ingredientsUsed / stats.totalBrews : 0;

  // Данные для диаграммы варки по рецептам
  const brewingData = recipes.map(recipe => {
    const potionCount = potions.filter(p => p.recipeId === recipe.id).length;
    return {
      name: recipe.name.length > 15 ? recipe.name.substring(0, 15) + '...' : recipe.name,
      potions: potionCount,
      difficulty: recipe.difficulty
    };
  });

  // Данные для диаграммы ингредиентов по редкости
  const rarityData = Object.entries(
    ingredients.reduce((acc, ing) => {
      acc[ing.rarity] = (acc[ing.rarity] || 0) + ing.quantity;
      return acc;
    }, {} as Record<string, number>)
  ).map(([rarity, count], index) => ({
    name: rarity,
    value: count,
    color: RARITY_COLORS[index % RARITY_COLORS.length]
  }));

  // Данные для диаграммы типов ингредиентов
  const typeData = Object.entries(
    ingredients.reduce((acc, ing) => {
      acc[ing.type] = (acc[ing.type] || 0) + ing.quantity;
      return acc;
    }, {} as Record<string, number>)
  ).map(([type, count]) => ({
    name: type,
    count
  }));

  // Статистика достижений
  const achievements = [
    {
      name: "Начинающий алхимик",
      description: "Сварите первое зелье",
      achieved: stats.successfulBrews >= 1,
      progress: Math.min(100, (stats.successfulBrews / 1) * 100)
    },
    {
      name: "Опытный варщик",
      description: "Сварите 10 зелий",
      achieved: stats.successfulBrews >= 10,
      progress: Math.min(100, (stats.successfulBrews / 10) * 100)
    },
    {
      name: "Мастер алхимии",
      description: "Сварите 50 зелий",
      achieved: stats.successfulBrews >= 50,
      progress: Math.min(100, (stats.successfulBrews / 50) * 100)
    },
    {
      name: "Коллекционер",
      description: "Соберите 100 ингредиентов",
      achieved: stats.ingredientsUsed >= 100,
      progress: Math.min(100, (stats.ingredientsUsed / 100) * 100)
    },
    {
      name: "Торговец",
      description: "Заработайте 1000 золота",
      achieved: stats.goldEarned >= 1000,
      progress: Math.min(100, (stats.goldEarned / 1000) * 100)
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl mb-2">Аналитика и статистика</h1>
        <p className="text-muted-foreground">
          Отслеживайте свой прогресс в алхимии
        </p>
      </div>

      <Separator />

      {/* Основная статистика */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Успешность варки</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{successRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.successfulBrews} из {stats.totalBrews} попыток
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Всего ингредиентов</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{totalIngredients}</div>
            <p className="text-xs text-muted-foreground">
              {ingredients.length} типов
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Создано зелий</CardTitle>
            <FlaskConical className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{totalPotions}</div>
            <p className="text-xs text-muted-foreground">
              {potions.length} типов
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Баланс золота</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{playerGold}</div>
            <p className={`text-xs flex items-center gap-1 ${netGold >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {netGold >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {netGold >= 0 ? '+' : ''}{netGold} чистая прибыль
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Диаграммы */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Создание зелий по рецептам</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={brewingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="potions" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ингредиенты по редкости</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={rarityData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {rarityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Детальная статистика */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Детальная статистика</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Всего попыток варки:</span>
                <Badge variant="outline">{stats.totalBrews}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Успешных варок:</span>
                <Badge variant="default" className="bg-green-500">{stats.successfulBrews}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Неудачных варок:</span>
                <Badge variant="default" className="bg-red-500">{stats.failedBrews}</Badge>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Потрачено ингредиентов:</span>
                <Badge variant="outline">{stats.ingredientsUsed}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Среднее за варку:</span>
                <Badge variant="secondary">{avgIngredientsPerBrew.toFixed(1)}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Создано зелий:</span>
                <Badge variant="default" className="bg-blue-500">{stats.potionsCreated}</Badge>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Потрачено золота:</span>
                <Badge variant="outline" className="text-red-600">{stats.goldSpent}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Заработано золота:</span>
                <Badge variant="outline" className="text-green-600">{stats.goldEarned}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Текущий баланс:</span>
                <Badge variant="default">{playerGold}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Достижения */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="h-5 w-5" />
            Достижения
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {achievements.map((achievement, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {achievement.achieved ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-gray-400" />
                  )}
                  <span className={achievement.achieved ? "text-green-600 dark:text-green-400" : ""}>
                    {achievement.name}
                  </span>
                </div>
                <Badge variant={achievement.achieved ? "default" : "secondary"}>
                  {achievement.progress.toFixed(0)}%
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                {achievement.description}
              </p>
              <Progress value={achievement.progress} className="ml-6 h-2" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}