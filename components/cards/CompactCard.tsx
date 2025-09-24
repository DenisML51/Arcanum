// components/CompactCard.tsx

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { ChevronDown, ChevronUp } from "lucide-react";

interface CompactCardProps {
  title: string;
  subtitle?: string;
  badges: { label: string; variant?: "default" | "secondary" | "outline" | "destructive"; className?: string; title?: string }[];
  typeCircles?: { label: string; color: string; tooltip?: string }[];
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function CompactCard({
  title,
  subtitle,
  badges,
  typeCircles,
  children,
  actions,
  className
}: CompactCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    // Предотвращаем разворачивание, если клик был по интерактивным элементам
    const target = e.target as HTMLElement;
    const isInteractive = target.closest('button, input, select, textarea, [role="button"]');

    if (!isInteractive) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <Card
      className={`transition-all hover:shadow-md cursor-pointer ${className}`}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="space-y-3">
          {/* Заголовок и индикатор разворачивания */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="text-base truncate">{title}</h3>
              {subtitle && (
                <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
              )}
            </div>

            <div className="h-7 w-7 flex items-center justify-center shrink-0 text-muted-foreground">
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>
          </div>

          {/* Badges в отдельной строке */}
          {badges && badges.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap min-w-0">
              {badges.slice(0, 3).map((badge, index) => (
                <Badge
                  key={index}
                  variant={badge.variant || "outline"}
                  className={`text-xs shrink-0 ${badge.className || ""}`}
                  title={badge.title}
                >
                  {badge.label}
                </Badge>
              ))}
              {badges.length > 3 && (
                <Badge variant="outline" className="text-xs shrink-0">
                  +{badges.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Type circles в отдельной строке - всегда видимы */}
          {typeCircles && typeCircles.length > 0 && (
            <div className="flex items-center gap-1 min-w-0">
              {typeCircles.map((circle, index) => {
                // Специальная обработка для основного разделителя
                if (circle.label === "—") {
                  return (
                    <div
                      key={index}
                      className={`${circle.color} shrink-0`}
                      title="Разделитель"
                    />
                  );
                }

                // Специальная обработка для мини-разделителей между типами
                if (circle.label === "mini-separator") {
                  return (
                    <div
                      key={index}
                      className={`${circle.color} shrink-0`}
                    />
                  );
                }

                const circleElement = (
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs text-black dark:text-white shrink-0 ${circle.color}`}
                  >
                    {circle.label === "✓" || circle.label === "!" ? circle.label : (circle.label || "").slice(0, 1).toUpperCase()}
                  </div>
                );

                return circle.tooltip ? (
                  <Tooltip key={index}>
                    <TooltipTrigger asChild>
                      {circleElement}
                    </TooltipTrigger>
                    <TooltipContent className="text-white">
                      <div className="text-xs text-white">{circle.tooltip}</div>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <div key={index} title={circle.label}>
                    {circleElement}
                  </div>
                );
              })}
            </div>
          )}

          {/* Actions в отдельной строке, если карточка не развернута */}
          {!isExpanded && actions && (
            <div className="flex items-center justify-end gap-1 min-w-0">
              {actions}
            </div>
          )}
        </div>
      </CardHeader>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <CardContent className="pt-0">
              <div className="space-y-4">
                {children}



                {/* Actions в самом низу развернутой карточки */}
                {actions && (
                  <div className="flex items-center justify-end gap-1 pt-2 border-t">
                    {actions}
                  </div>
                )}
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}