// App.tsx

import { useState } from "react";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { Separator } from "./components/ui/separator";
import { Toaster } from "./components/ui/sonner";
import { Package, BookOpen, FlaskConical, Sparkles, MapPin, ShoppingCart, Home, Database } from "lucide-react";
import { ThemeToggle } from "./components/common/ThemeToggle";
import { CurrencyPopover } from "./components/common/CurrencyPopover";
import { useAlchemyStore } from "./hooks/stores/useAlchemyStore";
import { HomePage } from "./components/pages/HomePage";
import { InventoryPage } from "./components/pages/InventoryPage";
import { RecipesPage } from "./components/pages/RecipesPage";
import { LaboratoryPage } from "./components/pages/LaboratoryPage";
import { ExplorationPage } from "./components/pages/ExplorationPage";
import { ShopPage } from "./components/pages/ShopPage";
import { PotionsPage } from "./components/pages/PotionsPage";
import { DataManager } from "./components/common/DataManager";

type ActivePage = 'home' | 'inventory' | 'recipes' | 'laboratory' | 'potions' | 'exploration' | 'shop' | 'data';

export default function App() {
  const [activePage, setActivePage] = useState<ActivePage>('home');
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const store = useAlchemyStore();

  // Показываем индикатор загрузки пока данные не загружены
  if (store.isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  // Функции для управления состоянием сайдбара с задержкой
  let hoverTimeout: any;

  const handleMouseEnter = () => {
    clearTimeout(hoverTimeout);
    setSidebarExpanded(true);
  };

  const handleMouseLeave = () => {
    hoverTimeout = setTimeout(() => {
      setSidebarExpanded(false);
    }, 300); // Увеличенная задержка для предотвращения случайного схлопывания
  };

  const totalIngredients = Array.isArray(store.ingredients) ? store.ingredients.reduce((sum, ing) => sum + ing.quantity, 0) : 0;
  const laboratoryRecipes = Array.isArray(store.recipes) ? store.recipes.filter(r => r.inLaboratory).length : 0;
  const totalPotions = Array.isArray(store.potions) ? store.potions.reduce((sum, potion) => sum + potion.quantity, 0) : 0;

  const navigation = [
    {
      id: 'home' as const,
      label: 'Главная',
      icon: Home,
      badge: store.character?.level || 1,
      description: 'Обзор и персонаж'
    },
    {
      id: 'inventory' as const,
      label: 'Ингредиенты',
      icon: Package,
      badge: totalIngredients,
      description: 'Управление ингредиентами'
    },
    {
      id: 'recipes' as const,
      label: 'Книга рецептов',
      icon: BookOpen,
      badge: Array.isArray(store.recipes) ? store.recipes.length : 0,
      description: 'Изучение рецептов'
    },
    {
      id: 'laboratory' as const,
      label: 'Лаборатория',
      icon: FlaskConical,
      badge: laboratoryRecipes,
      description: 'Варка зелий'
    },
    {
      id: 'potions' as const,
      label: 'Коллекция зелий',
      icon: Sparkles,
      badge: totalPotions,
      description: 'Созданные зелья'
    },

    {
      id: 'exploration' as const,
      label: 'Исследование',
      icon: MapPin,
      badge: Array.isArray(store.biomes) ? store.biomes.length : 0,
      description: 'Поиск ингредиентов'
    },
    {
      id: 'shop' as const,
      label: 'Торговая лавка',
      icon: ShoppingCart,
      badge: Math.floor(store.getTotalGold()),
      description: 'Покупка и продажа'
    },
    {
      id: 'data' as const,
      label: 'Управление данными',
      icon: Database,
      badge: (Array.isArray(store.ingredients) ? store.ingredients.length : 0) + (Array.isArray(store.recipes) ? store.recipes.length : 0),
      description: 'Импорт и экспорт'
    }
  ];

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <HomePage store={store} onNavigate={(page) => setActivePage(page as ActivePage)} />;
      case 'inventory':
        return <InventoryPage store={store} />;
      case 'recipes':
        return <RecipesPage store={store} />;
      case 'laboratory':
        return <LaboratoryPage store={store} />;
      case 'potions':
        return <PotionsPage store={store} />;
      case 'exploration':
        return <ExplorationPage store={store} />;
      case 'shop':
        return <ShopPage store={store} />;
      case 'data':
        return <DataManager store={store} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Хедер */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary shrink-0" />
                <h1 className="text-lg sm:text-xl text-primary truncate">Arcanum</h1>
              </div>
              <Badge variant="secondary" className="hidden sm:inline-flex">
                Алхимия (D&D 5e)
              </Badge>
            </div>

            <div className="flex items-center gap-1 sm:gap-3">
              <Badge variant="outline" className="gap-1 px-2 py-1 text-xs hidden sm:inline-flex">
                <Package className="h-3 w-3" />
                <span className="text-primary">{totalIngredients}</span> ингр.
              </Badge>

              <CurrencyPopover
                currency={store.currency}
                totalGold={store.getTotalGold()}
              />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex gap-4 lg:gap-8 py-4 lg:py-6">
          {/* Сайдбар навигации */}
          <aside
            className={`${sidebarExpanded ? 'w-64 lg:w-80' : 'w-16'} shrink-0 hidden md:block sidebar-nav`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="sticky top-24 space-y-2">

              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;

                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "default" : "ghost"}
                    onClick={() => setActivePage(item.id)}
                    className={`w-full h-16 p-4 relative nav-button overflow-hidden ${
                      sidebarExpanded ? 'justify-start' : 'justify-center'
                    } ${!sidebarExpanded && isActive ? 'nav-active' : ''} ${
                      isActive ? 'text-primary-foreground' : 'text-sidebar-foreground'
                    }`}
                    title={!sidebarExpanded ? item.label : ''}
                  >
                    <div className={`flex items-center w-full transition-all duration-350 ease-out ${
                      sidebarExpanded ? 'justify-start gap-3' : 'justify-center'
                    }`}>
                      <Icon className={`shrink-0 transition-all duration-350 ease-out ${
                        sidebarExpanded ? 'h-5 w-5' : 'h-10 w-10'
                      }`} />
                      <div
                        className={`text-left min-w-0 transition-all duration-350 ease-out ${
                          sidebarExpanded 
                            ? 'opacity-100 translate-x-0 w-auto' 
                            : 'opacity-0 -translate-x-4 w-0'
                        }`}
                      >
                        <div className="text-sm truncate whitespace-nowrap">{item.label}</div>
                        <div className="text-xs text-muted-foreground truncate whitespace-nowrap">
                          {item.description}
                        </div>
                      </div>

                      {sidebarExpanded && (
                        <Badge
                          variant={isActive ? "secondary" : "outline"}
                          className="shrink-0 ml-auto px-2 py-1 text-xs"
                        >
                          <span className="text-primary">{item.badge}</span>
                        </Badge>
                      )}
                    </div>
                  </Button>
                );
              })}
            </div>
          </aside>

          {/* Основной контент */}
          <main className="flex-1 min-w-0 md:pr-4 lg:pr-6">
            {/* Мобильная навигация */}
            <div className="md:hidden mb-4">
              <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = activePage === item.id;

                  return (
                    <Button
                      key={item.id}
                      variant={isActive ? "default" : "outline"}
                      onClick={() => setActivePage(item.id)}
                      className={`shrink-0 h-auto px-3 py-2 ${
                        isActive ? 'text-primary-foreground' : ''
                      }`}
                      size="sm"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span className="text-xs">{item.label}</span>
                        <Badge variant={isActive ? "secondary" : "outline"} className="text-xs">
                          <span className="text-primary">{item.badge}</span>
                        </Badge>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>

            {renderPage()}
          </main>
        </div>
      </div>

      <Toaster />
    </div>
  );
}