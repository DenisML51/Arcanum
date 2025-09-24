// components/HomePage.tsx

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Progress } from "../ui/progress";
import { Separator } from "../ui/separator";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Checkbox } from "../ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../ui/tooltip";
import {
  FlaskConical,
  Package,
  Coins,
  Target,
  User,
  Zap,
  Star,
  TrendingUp,
  Settings,
  Award,
  ShoppingBag,
  Shield,
  Heart,
  Brain,
  Activity
} from "lucide-react";
import type { Currency } from "../../hooks/types";
import { convertToGold } from "../../hooks/types";
import { motion } from "framer-motion";
import { CompactPotionCard } from "../cards/CompactPotionCard";
import { useAlchemyStore } from "../../hooks/stores/useAlchemyStore";

interface HomePageProps {
  store: ReturnType<typeof useAlchemyStore>;
  onNavigate?: (page: string) => void;
}

const rarityColors = {
  'common': 'bg-gray-500',
  'uncommon': 'bg-green-500',
  'rare': 'bg-blue-500',
  'very rare': 'bg-purple-500',
  'legendary': 'bg-orange-500',
  'artifact': 'bg-red-500'
};

export function HomePage({ store, onNavigate }: HomePageProps) {
  const [characterDialogOpen, setCharacterDialogOpen] = useState(false);
  const [equipmentDialogOpen, setEquipmentDialogOpen] = useState(false);
  const [tempCharacterName, setTempCharacterName] = useState(store.character.name);
  const [tempCharacterLevel, setTempCharacterLevel] = useState(store.character.level);
  const [tempAlchemyProficiency, setTempAlchemyProficiency] = useState(store.character.alchemyToolsProficiency);
  const [tempBaseStats, setTempBaseStats] = useState(store.character.baseStats || {
    strength: 10,
    dexterity: 12,
    constitution: 14,
    intelligence: 15,
    wisdom: 13,
    charisma: 10
  });
  const [tempCurrency, setTempCurrency] = useState(store.currency);

  const { stats, ingredients, recipes, potions, playerGold, character, availableEquipment, availableForPurchaseEquipment } = store;

  // Защита от отсутствующего персонажа
  if (!character) {
    return <div>Загрузка...</div>;
  }

  // Вычисляем метрики
  const successRate = stats.totalBrews > 0 ? (stats.successfulBrews / stats.totalBrews) * 100 : 0;
  const totalIngredients = ingredients.reduce((sum, ing) => sum + ing.quantity, 0);
  const totalPotions = potions.reduce((sum, potion) => sum + potion.quantity, 0);
  const laboratoryRecipes = recipes.filter(r => r.inLaboratory).length;
  const netGold = stats.goldEarned - stats.goldSpent;

  // Последние достижения
  const recentActivity = [
    stats.successfulBrews > 0 && `Сварено зелий: ${stats.successfulBrews}`,
    stats.ingredientsUsed > 0 && `Использовано ингредиентов: ${stats.ingredientsUsed}`,
    stats.goldEarned > 0 && `Заработано золота: ${stats.goldEarned}`,
    laboratoryRecipes > 0 && `Рецептов в лаборатории: ${laboratoryRecipes}`
  ].filter(Boolean).slice(0, 3);


  const handleSaveCharacter = () => {
    store.updateCharacterName(tempCharacterName);
    store.updateCharacterLevel(tempCharacterLevel);
    store.updateAlchemyToolsProficiency(tempAlchemyProficiency);
    store.updateCharacterStats(tempBaseStats);
    store.updateCurrency(tempCurrency);
    setCharacterDialogOpen(false);
  };

  const handleBuyEquipment = (equipmentId: string) => {
    const result = store.buyEquipment(equipmentId);
    if (result.success) {
      // Можно добавить уведомление
    }
  };

  const handleSetActiveEquipment = (equipmentId: string) => {
    store.setActiveEquipment(equipmentId);
  };

  // Текущее активное оборудование
  const activeEquipment = store.availableEquipment.find(eq => eq.id === character.activeEquipmentId);

  // Базовые характеристики (без бонуса уровня)
  const currentBaseStats = character.baseStats || tempBaseStats;
  const baseStats = {
    strength: currentBaseStats.strength,
    dexterity: currentBaseStats.dexterity,
    constitution: currentBaseStats.constitution,
    intelligence: currentBaseStats.intelligence,
    wisdom: currentBaseStats.wisdom,
    charisma: currentBaseStats.charisma
  };

  // Правильный расчет бонуса варки
  const equipmentBonus = activeEquipment ? activeEquipment.brewingBonus : 0;
  const proficiencyBonus = character.alchemyToolsProficiency ? 2 : 0;
  const totalBrewingBonus = equipmentBonus + proficiencyBonus;

  return (
    <div className="space-y-6">
      <div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl mb-2"
        >
          Добро пожаловать, {character.name}!
        </motion.h1>
        <p className="text-muted-foreground">
          Ваша алхимическая лаборатория готова к работе
        </p>
      </div>

      <Separator />

      {/* Карточка персонажа */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="character-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-4">
                <Avatar className="character-avatar h-16 w-16 self-center">
                  <AvatarFallback className="text-xl">
                    {character.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-xl mb-3">{character.name}</CardTitle>
                  <div className="flex items-center gap-3">
                    <Badge className="character-badge">Уровень <span className="text-primary">{character.level}</span></Badge>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge className="character-badge gap-1 cursor-help">
                          <Zap className="h-3 w-3" />
                          <span className="text-primary">{totalBrewingBonus > 0 ? '+' : ''}{totalBrewingBonus}</span>
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent className="text-white dark:text-black">
                        <div>
                          <div className="font-medium">Бонус варки</div>
                          <div className="text-xs">
                            {character.alchemyToolsProficiency ? `Мастерство: +${proficiencyBonus}` : 'Без мастерства: +0'}
                          </div>
                          {activeEquipment && (
                            <div className="text-xs">{activeEquipment.name}: {activeEquipment.brewingBonus > 0 ? '+' : ''}{activeEquipment.brewingBonus}</div>
                          )}
                          {!activeEquipment && <div className="text-xs">Без оборудования: +0</div>}
                        </div>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge className="character-badge gap-1 cursor-help">
                          <Star className="h-3 w-3" />
                          <span className="text-primary">{character.alchemyToolsProficiency ? 'Да' : 'Нет'}</span>
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent className="text-white dark:text-black">
                        <div>
                          <div className="font-medium">Мастерство инструментов алхимика</div>
                          <div className="text-xs">
                            {character.alchemyToolsProficiency
                              ? `Дает +${proficiencyBonus} к броскам варки`
                              : 'Не изучено - нет бонуса к броскам'
                            }
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Dialog open={characterDialogOpen} onOpenChange={(open) => {
                  setCharacterDialogOpen(open);
                  if (open) {
                    // Загружаем текущие данные при открытии диалога
                    setTempCharacterName(character.name);
                    setTempCharacterLevel(character.level);
                    setTempAlchemyProficiency(character.alchemyToolsProficiency);
                    setTempBaseStats(character.baseStats || {
                      strength: 10,
                      dexterity: 12,
                      constitution: 14,
                      intelligence: 15,
                      wisdom: 13,
                      charisma: 10
                    });
                    setTempCurrency(store.currency);
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button className="character-action-button" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Настройки
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto scrollbar-hide">
                    <DialogHeader>
                      <DialogTitle>Настройки персонажа</DialogTitle>
                      <DialogDescription>
                        Настройте характеристики, уровень и навыки своего персонажа
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm">Имя персонажа</label>
                          <Input
                            value={tempCharacterName}
                            onChange={(e) => setTempCharacterName(e.target.value)}
                            placeholder="Введите имя"
                          />
                        </div>
                        <div>
                          <label className="text-sm">Уровень (1-20)</label>
                          <Input
                            type="number"
                            min="1"
                            max="20"
                            value={tempCharacterLevel}
                            onChange={(e) => setTempCharacterLevel(Number(e.target.value))}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="alchemy-proficiency"
                          checked={tempAlchemyProficiency}
                          onCheckedChange={(checked) => setTempAlchemyProficiency(checked as boolean)}
                        />
                        <label htmlFor="alchemy-proficiency" className="text-sm">
                          Мастерство инструментов алхимика (+{proficiencyBonus} к броскам)
                        </label>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="mb-3">Базовые характеристики</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm">Сила</label>
                            <Input
                              type="number"
                              min="3"
                              max="20"
                              value={tempBaseStats.strength}
                              onChange={(e) => setTempBaseStats({...tempBaseStats, strength: Number(e.target.value)})}
                            />
                          </div>
                          <div>
                            <label className="text-sm">Ловкость</label>
                            <Input
                              type="number"
                              min="3"
                              max="20"
                              value={tempBaseStats.dexterity}
                              onChange={(e) => setTempBaseStats({...tempBaseStats, dexterity: Number(e.target.value)})}
                            />
                          </div>
                          <div>
                            <label className="text-sm">Выносливость</label>
                            <Input
                              type="number"
                              min="3"
                              max="20"
                              value={tempBaseStats.constitution}
                              onChange={(e) => setTempBaseStats({...tempBaseStats, constitution: Number(e.target.value)})}
                            />
                          </div>
                          <div>
                            <label className="text-sm">Интеллект</label>
                            <Input
                              type="number"
                              min="3"
                              max="20"
                              value={tempBaseStats.intelligence}
                              onChange={(e) => setTempBaseStats({...tempBaseStats, intelligence: Number(e.target.value)})}
                            />
                          </div>
                          <div>
                            <label className="text-sm">Мудрость</label>
                            <Input
                              type="number"
                              min="3"
                              max="20"
                              value={tempBaseStats.wisdom}
                              onChange={(e) => setTempBaseStats({...tempBaseStats, wisdom: Number(e.target.value)})}
                            />
                          </div>
                          <div>
                            <label className="text-sm">Харизма</label>
                            <Input
                              type="number"
                              min="3"
                              max="20"
                              value={tempBaseStats.charisma}
                              onChange={(e) => setTempBaseStats({...tempBaseStats, charisma: Number(e.target.value)})}
                            />
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Базовые характеристики персонажа в D&D (обычно от 8 до 15 на 1 уровне)
                        </p>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="mb-3">Валюта персонажа</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm">Платиновые монеты (пм)</label>
                            <Input
                              type="number"
                              min="0"
                              value={tempCurrency.platinum}
                              onChange={(e) => setTempCurrency({...tempCurrency, platinum: Math.max(0, Number(e.target.value))})}
                            />
                          </div>
                          <div>
                            <label className="text-sm">Золотые монеты (зм)</label>
                            <Input
                              type="number"
                              min="0"
                              value={tempCurrency.gold}
                              onChange={(e) => setTempCurrency({...tempCurrency, gold: Math.max(0, Number(e.target.value))})}
                            />
                          </div>
                          <div>
                            <label className="text-sm">Серебряные монеты (см)</label>
                            <Input
                              type="number"
                              min="0"
                              value={tempCurrency.silver}
                              onChange={(e) => setTempCurrency({...tempCurrency, silver: Math.max(0, Number(e.target.value))})}
                            />
                          </div>
                          <div>
                            <label className="text-sm">Медные монеты (мм)</label>
                            <Input
                              type="number"
                              min="0"
                              value={tempCurrency.copper}
                              onChange={(e) => setTempCurrency({...tempCurrency, copper: Math.max(0, Number(e.target.value))})}
                            />
                          </div>
                        </div>
                        <div className="mt-3 p-3 bg-muted/50 rounded">
                          <p className="text-sm">
                            Общая стоимость: <strong>{convertToGold(tempCurrency).toFixed(2)} зм</strong>
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Конвертация D&D: 1 пм = 10 зм, 1 зм = 10 см, 1 см = 10 мм
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => {
                          setCharacterDialogOpen(false);
                          setTempCharacterName(character.name);
                          setTempCharacterLevel(character.level);
                          setTempAlchemyProficiency(character.alchemyToolsProficiency);
                          setTempBaseStats(character.baseStats || tempBaseStats);
                          setTempCurrency(store.currency);
                        }}>
                          Отмена
                        </Button>
                        <Button onClick={handleSaveCharacter}>
                          Сохранить
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={equipmentDialogOpen} onOpenChange={setEquipmentDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="character-action-button" size="sm">
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Оборудование
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto scrollbar-hide">
                    <DialogHeader>
                      <DialogTitle>Алхимическое оборудование</DialogTitle>
                      <DialogDescription>
                        Улучшите свое оборудование для повышения шансов успешной варки
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <h4 className="mb-3">Имеющееся оборудование</h4>
                        <div className="space-y-2">
                          {availableEquipment.map((eq) => (
                            <div key={eq.id} className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                              eq.id === character.activeEquipmentId ? 'bg-primary/10 border-primary/30' : 'bg-muted/50'
                            }`}>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span>{eq.name}</span>
                                  <Badge
                                    className={`${rarityColors[eq.rarity]} text-white`}
                                    variant="secondary"
                                  >
                                    {eq.rarity}
                                  </Badge>
                                  {eq.id === character.activeEquipmentId && (
                                    <Badge variant="default" className="text-xs">
                                      Активно
                                    </Badge>
                                  )}
                                  <Badge variant="outline" className="text-xs bg-green-100 text-green-800">
                                    В наличии
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">{eq.description}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">
                                  {eq.brewingBonus > 0 ? '+' : ''}{eq.brewingBonus}
                                </Badge>
                                {eq.id !== character.activeEquipmentId && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSetActiveEquipment(eq.id);
                                    }}
                                  >
                                    Использовать
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {availableForPurchaseEquipment.length > 0 && (
                        <div>
                          <h4 className="mb-3">Доступное для покупки</h4>
                          <div className="space-y-2">
                            {availableForPurchaseEquipment.map((eq) => (
                              <div key={eq.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span>{eq.name}</span>
                                    <Badge
                                      className={`${rarityColors[eq.rarity]} text-white`}
                                      variant="secondary"
                                    >
                                      {eq.rarity}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground mb-2">{eq.description}</p>
                                  <div className="flex items-center gap-4 text-xs">
                                    <span>Бонус: {eq.brewingBonus > 0 ? '+' : ''}{eq.brewingBonus}</span>
                                    <span>Вес: {eq.weight} фт</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">{eq.cost} зм</Badge>
                                  <Button
                                    size="sm"
                                    onClick={() => handleBuyEquipment(eq.id)}
                                    disabled={playerGold < eq.cost}
                                  >
                                    Купить
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {availableForPurchaseEquipment.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Все оборудование уже куплено!</p>
                          <p className="text-sm">Вы владеете всеми доступными предметами.</p>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Статистика персонажа */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Характеристики персонажа
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {[
                { name: 'СИЛ', value: baseStats.strength, modifier: Math.floor((baseStats.strength - 10) / 2), icon: Shield },
                { name: 'ЛОВ', value: baseStats.dexterity, modifier: Math.floor((baseStats.dexterity - 10) / 2), icon: Zap },
                { name: 'ВЫН', value: baseStats.constitution, modifier: Math.floor((baseStats.constitution - 10) / 2), icon: Heart },
                { name: 'ИНТ', value: baseStats.intelligence, modifier: Math.floor((baseStats.intelligence - 10) / 2), icon: Brain },
                { name: 'МУД', value: baseStats.wisdom, modifier: Math.floor((baseStats.wisdom - 10) / 2), icon: Star },
                { name: 'ХАР', value: baseStats.charisma, modifier: Math.floor((baseStats.charisma - 10) / 2), icon: User }
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.name} className="stat-container">
                    <Icon className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                    <div className="text-xs text-muted-foreground">{stat.name}</div>
                    <div className="text-lg font-medium">{stat.value}</div>
                    <div className="text-xs text-primary">
                      {stat.modifier >= 0 ? '+' : ''}{stat.modifier}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-sm text-muted-foreground">Проф. бонус</div>
                  <div className="text-lg font-medium text-primary">+{proficiencyBonus}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Бонус варки</div>
                  <div className="text-lg font-medium text-primary">
                    {totalBrewingBonus > 0 ? '+' : ''}{totalBrewingBonus}
                    <div className="text-xs text-muted-foreground">
                      {character.alchemyToolsProficiency ? `Мастерство +${proficiencyBonus}` : 'Без мастерства'}
                      {activeEquipment && (
                        <div>{activeEquipment.name}: {activeEquipment.brewingBonus > 0 ? '+' : ''}{activeEquipment.brewingBonus}</div>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Активное оборудование</div>
                  <div className="text-lg font-medium">
                    {activeEquipment ? activeEquipment.name : <span className="text-primary">Нет</span>}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {activeEquipment ? activeEquipment.description : 'Выберите оборудование'}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Основная статистика */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Успешность варки",
            value: `${successRate.toFixed(1)}%`,
            description: `${stats.successfulBrews} из ${stats.totalBrews} попыток`,
            icon: Target,
            delay: 0.2
          },
          {
            title: "Ингредиенты",
            value: totalIngredients,
            description: `${ingredients.length} типов`,
            icon: Package,
            delay: 0.3
          },
          {
            title: "Зелья",
            value: totalPotions,
            description: `${potions.length} типов`,
            icon: FlaskConical,
            delay: 0.4
          },
          {
            title: "Золото",
            value: playerGold,
            description: netGold >= 0 ? `+${netGold} прибыль` : `${netGold} убыток`,
            icon: Coins,
            delay: 0.5
          }
        ].map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: item.delay }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">{item.title}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">{item.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Прогресс и активность */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Прогресс мастерства
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Начинающий алхимик</span>
                  <span>{Math.min(100, (stats.successfulBrews / 5) * 100).toFixed(0)}%</span>
                </div>
                <Progress value={Math.min(100, (stats.successfulBrews / 5) * 100)} />
                <p className="text-xs text-muted-foreground mt-1">
                  Сварите 5 зелий для получения звания
                </p>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Опытный варщик</span>
                  <span>{Math.min(100, (stats.successfulBrews / 25) * 100).toFixed(0)}%</span>
                </div>
                <Progress value={Math.min(100, (stats.successfulBrews / 25) * 100)} />
                <p className="text-xs text-muted-foreground mt-1">
                  Сварите 25 зелий для получения звания
                </p>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Мастер алхимии</span>
                  <span>{Math.min(100, (stats.successfulBrews / 100) * 100).toFixed(0)}%</span>
                </div>
                <Progress value={Math.min(100, (stats.successfulBrews / 100) * 100)} />
                <p className="text-xs text-muted-foreground mt-1">
                  Сварите 100 зелий для получения звания
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Последние достижения
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 bg-muted/50 rounded">
                    <div className="h-2 w-2 bg-primary rounded-full" />
                    <span className="text-sm">{activity}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Начните варить зелья, чтобы увидеть свой прогресс здесь!
                </p>
              )}

              {laboratoryRecipes > 0 && (
                <div className="mt-4 p-3 bg-primary/10 rounded border border-primary/20">
                  <p className="text-sm">
                    💡 У вас {laboratoryRecipes} рецептов готовы к варке в лаборатории!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Избранные зелья */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FlaskConical className="h-5 w-5" />
                Избранные зелья
              </CardTitle>
              <Badge variant="outline">
                {store.potions.filter(p => p.isFavorite && p.quantity > 0).length} избранных
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {store.potions.filter(p => p.isFavorite && p.quantity > 0).length === 0 ? (
              <div className="text-center py-8">
                <FlaskConical className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">
                  У вас нет избранных зелий
                </p>
                <p className="text-sm text-muted-foreground">
                  Добавьте зелья в избранное в коллекции зелий, чтобы видеть их здесь!
                </p>
              </div>
            ) : (
              <div className="card-grid-max-2">
                {store.potions
                  .filter(potion => potion.isFavorite && potion.quantity > 0)
                  .slice(0, 8)
                  .map((potion) => (
                    <CompactPotionCard
                      key={potion.id}
                      potion={potion}
                      onQuantityChange={store.updatePotionQuantity}
                      onToggleFavorite={store.togglePotionFavorite}
                    />
                  ))}
              </div>
            )}

            <div className="flex justify-center mt-4 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => onNavigate?.('potions')}
                className="gap-2"
              >
                <FlaskConical className="h-4 w-4" />
                Перейти к коллекции зелий
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}