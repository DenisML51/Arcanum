import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { X, Filter, ChevronDown, ChevronRight } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  hasActiveFilters: boolean;
  clearAllFilters: () => void;
  children: React.ReactNode;
}

export function FilterDrawer({ 
  isOpen, 
  onClose, 
  hasActiveFilters, 
  clearAllFilters, 
  children 
}: FilterDrawerProps) {
  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ 
              type: 'spring', 
              damping: 25, 
              stiffness: 200,
              opacity: { duration: 0.2 }
            }}
            className="fixed w-96 max-w-[90vw] bg-card border shadow-xl z-50 flex flex-col rounded-2xl overflow-hidden"
            style={{ 
              top: 'calc(4rem)', // Отступ от шапки (4rem) + дополнительный отступ (1rem)
              right: '1rem', // Отступ справа
              bottom: '1rem', // Отступ снизу
              maxHeight: 'calc(100vh - 6rem)' // Максимальная высота с учетом отступов
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b bg-card/50 backdrop-blur-sm rounded-t-2xl">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Фильтры</h2>
              </div>
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearAllFilters}
                    className="text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Очистить
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 min-h-0">
              <div className="space-y-6">
                {children}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Компонент для группировки фильтров
interface FilterGroupProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  activeCount?: number;
}

export function FilterGroup({ title, children, defaultExpanded = false, activeCount = 0 }: FilterGroupProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={`bg-muted/20 rounded-xl border ${activeCount > 0 ? 'border-primary' : ''}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors rounded-xl"
      >
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Компонент для чекбокса фильтра
interface FilterCheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function FilterCheckbox({ id, label, checked, onCheckedChange }: FilterCheckboxProps) {
  return (
    <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
      <label 
        htmlFor={id} 
        className="text-sm cursor-pointer select-none flex-1"
      >
        {label}
      </label>
    </div>
  );
}
