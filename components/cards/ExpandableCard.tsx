// components/ExpandableCard.tsx

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ExpandableCardProps {
  id: string;
  title: string;
  subtitle?: string;
  rarity?: string;
  icon?: React.ReactNode;
  badge?: string | number;
  children: React.ReactNode;
  className?: string;
  onAction?: () => void;
  actionLabel?: string;
  actionDisabled?: boolean;
}

const rarityColors = {
  'common': 'bg-gray-500',
  'uncommon': 'bg-green-500',
  'rare': 'bg-blue-500',
  'very rare': 'bg-purple-500',
  'legendary': 'bg-orange-500'
};

export function ExpandableCard({
  title,
  subtitle,
  rarity,
  icon,
  badge,
  children,
  className = "",
  onAction,
  actionLabel,
  actionDisabled = false
}: ExpandableCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedCardPosition, setExpandedCardPosition] = useState({ top: 0, left: 0, width: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isExpanded && cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setExpandedCardPosition({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, [isExpanded]);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      <Card
        ref={cardRef}
        className={`relative cursor-pointer transition-all duration-200 hover:shadow-lg ${className} ${
          isExpanded ? 'ring-2 ring-primary/50' : ''
        }`}
        onClick={handleToggle}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              {icon && <div className="shrink-0">{icon}</div>}
              <div className="min-w-0">
                <CardTitle className="text-base truncate">{title}</CardTitle>
                {subtitle && (
                  <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {rarity && (
                <Badge
                  className={`${rarityColors[rarity as keyof typeof rarityColors]} text-white text-xs`}
                  variant="secondary"
                >
                  {rarity}
                </Badge>
              )}
              {badge !== undefined && (
                <Badge variant="outline" className="text-xs">
                  {badge}
                </Badge>
              )}
              <div className="p-1">
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <AnimatePresence>
        {isExpanded && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setIsExpanded(false)}
            />

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
                x: expandedCardPosition.left,
                y: expandedCardPosition.top,
                width: expandedCardPosition.width
              }}
              animate={{
                opacity: 1,
                scale: 1,
                x: expandedCardPosition.left - 100,
                y: expandedCardPosition.top - 50,
                width: Math.min(500, expandedCardPosition.width + 200)
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                x: expandedCardPosition.left,
                y: expandedCardPosition.top,
                width: expandedCardPosition.width
              }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed z-50 max-h-[80vh] overflow-y-auto scrollbar-styled"
              style={{
                transformOrigin: "top left"
              }}
            >
              <Card className="shadow-2xl border-2 border-primary/20">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      {icon && <div className="shrink-0">{icon}</div>}
                      <div className="min-w-0">
                        <CardTitle className="text-lg">{title}</CardTitle>
                        {subtitle && (
                          <p className="text-sm text-muted-foreground">{subtitle}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {rarity && (
                        <Badge
                          className={`${rarityColors[rarity as keyof typeof rarityColors]} text-white`}
                          variant="secondary"
                        >
                          {rarity}
                        </Badge>
                      )}
                      {badge !== undefined && (
                        <Badge variant="outline">
                          {badge}
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsExpanded(false);
                        }}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {children}

                  {onAction && actionLabel && (
                    <div className="pt-4 border-t">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAction();
                        }}
                        disabled={actionDisabled}
                        className="w-full"
                      >
                        {actionLabel}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}