import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../lib/utils';
import { X, Plus } from 'lucide-react';

const tabsVariants = cva(
  'w-full',
  {
    variants: {
      variant: {
        default: '',
        underline: '',
        pills: '',
        cards: 'bg-muted/20 p-1 rounded-lg',
        medical: 'border-b border-blue-200',
        clinical: 'border-b border-green-200',
        administrative: 'border-b border-purple-200',
      },
      orientation: {
        horizontal: '',
        vertical: 'flex flex-row',
      },
    },
    defaultVariants: {
      variant: 'default',
      orientation: 'horizontal',
    },
  }
);

const tabsListVariants = cva(
  'inline-flex items-center justify-start',
  {
    variants: {
      variant: {
        default: 'h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground',
        underline: 'h-10 items-center justify-start rounded-none bg-transparent p-0 border-b border-border',
        pills: 'h-9 items-center justify-start rounded-full bg-muted p-1 text-muted-foreground',
        cards: 'h-auto items-start justify-start rounded-none bg-transparent p-0 gap-1',
        medical: 'h-10 items-center justify-start rounded-none bg-transparent p-0',
        clinical: 'h-10 items-center justify-start rounded-none bg-transparent p-0',
        administrative: 'h-10 items-center justify-start rounded-none bg-transparent p-0',
      },
      orientation: {
        horizontal: 'flex-row',
        vertical: 'flex-col w-48 mr-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      orientation: 'horizontal',
    },
  }
);

const tabsTriggerVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
        underline: 'border-b-2 border-transparent bg-transparent px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none rounded-none',
        pills: 'data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-full',
        cards: 'bg-background border-2 border-border data-[state=active]:border-primary data-[state=active]:bg-primary/5 p-3 rounded-lg shadow-sm min-h-[80px] flex-col justify-start items-start text-left',
        medical: 'border-b-2 border-transparent bg-transparent px-4 py-2 text-blue-600 data-[state=active]:border-blue-500 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 rounded-none',
        clinical: 'border-b-2 border-transparent bg-transparent px-4 py-2 text-green-600 data-[state=active]:border-green-500 data-[state=active]:bg-green-50 data-[state=active]:text-green-700 rounded-none',
        administrative: 'border-b-2 border-transparent bg-transparent px-4 py-2 text-purple-600 data-[state=active]:border-purple-500 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 rounded-none',
      },
      orientation: {
        horizontal: '',
        vertical: 'w-full justify-start',
      },
      size: {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-1.5 text-sm',
        lg: 'px-4 py-2 text-base',
      },
      closable: {
        true: 'pr-8 relative',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      orientation: 'horizontal',
      size: 'md',
      closable: false,
    },
  }
);

const tabsContentVariants = cva(
  'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'p-4',
        underline: 'p-4',
        pills: 'p-4',
        cards: 'p-6 bg-background border border-border rounded-lg shadow-sm',
        medical: 'p-4',
        clinical: 'p-4',
        administrative: 'p-4',
      },
      orientation: {
        horizontal: '',
        vertical: 'mt-0 flex-1',
      },
    },
    defaultVariants: {
      variant: 'default',
      orientation: 'horizontal',
    },
  }
);

export interface TabItem {
  value: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
  disabled?: boolean;
  closable?: boolean;
  badge?: React.ReactNode;
  content?: React.ReactNode;
}

export interface TabsProps extends VariantProps<typeof tabsVariants> {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  tabs: TabItem[];
  onTabClose?: (value: string) => void;
  onAddTab?: () => void;
  addTabLabel?: string;
  className?: string;
  listClassName?: string;
  triggerClassName?: string;
  contentClassName?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  TabsProps
>(({
  className,
  variant,
  orientation,
  tabs,
  defaultValue,
  value,
  onValueChange,
  onTabClose,
  onAddTab,
  addTabLabel = 'Add Tab',
  listClassName,
  triggerClassName,
  contentClassName,
  size,
  ...props
}, ref) => {
  const handleTabClose = (tabValue: string, event: React.MouseEvent) => {
    event.stopPropagation();
    onTabClose?.(tabValue);
  };

  return (
    <TabsPrimitive.Root
      ref={ref}
      className={cn(tabsVariants({ variant, orientation }), className)}
      defaultValue={defaultValue}
      value={value}
      onValueChange={onValueChange}
      orientation={orientation}
      {...props}
    >
      <TabsPrimitive.List
        className={cn(tabsListVariants({ variant, orientation }), listClassName)}
      >
        {tabs.map((tab) => (
          <TabsPrimitive.Trigger
            key={tab.value}
            value={tab.value}
            disabled={tab.disabled}
            className={cn(
              tabsTriggerVariants({ 
                variant, 
                orientation, 
                size, 
                closable: tab.closable 
              }),
              triggerClassName
            )}
          >
            {tab.icon && (
              <span className="mr-2 flex-shrink-0">
                {React.cloneElement(tab.icon as React.ReactElement, {
                  className: cn(
                    'w-4 h-4',
                    size === 'sm' && 'w-3 h-3',
                    size === 'lg' && 'w-5 h-5'
                  )
                })}
              </span>
            )}
            
            <div className={cn(
              'flex flex-col',
              variant !== 'cards' && 'flex-row items-center gap-2'
            )}>
              <span className="truncate">{tab.label}</span>
              {tab.description && variant === 'cards' && (
                <span className="text-xs text-muted-foreground mt-1 text-left">
                  {tab.description}
                </span>
              )}
            </div>
            
            {tab.badge && (
              <span className="ml-2 flex-shrink-0">
                {tab.badge}
              </span>
            )}
            
            {tab.closable && onTabClose && (
              <button
                onClick={(e) => handleTabClose(tab.value, e)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 hover:bg-muted-foreground/10 focus:outline-none focus:ring-1 focus:ring-ring"
                aria-label={`Close ${tab.label} tab`}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </TabsPrimitive.Trigger>
        ))}
        
        {onAddTab && (
          <button
            onClick={onAddTab}
            className={cn(
              'inline-flex items-center justify-center px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-sm',
              size === 'sm' && 'px-2 py-1 text-xs',
              size === 'lg' && 'px-4 py-2 text-base'
            )}
            aria-label={addTabLabel}
          >
            <Plus className="w-4 h-4 mr-1" />
            <span className="sr-only">{addTabLabel}</span>
          </button>
        )}
      </TabsPrimitive.List>
      
      {tabs.map((tab) => (
        <TabsPrimitive.Content
          key={tab.value}
          value={tab.value}
          className={cn(tabsContentVariants({ variant, orientation }), contentClassName)}
        >
          {tab.content || (
            <div className="text-center py-8 text-muted-foreground">
              No content available for {tab.label}
            </div>
          )}
        </TabsPrimitive.Content>
      ))}
    </TabsPrimitive.Root>
  );
});

Tabs.displayName = 'Tabs';

// Individual components for manual composition
const TabsList = TabsPrimitive.List;
const TabsTrigger = TabsPrimitive.Trigger;
const TabsContent = TabsPrimitive.Content;

export { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent,
  tabsVariants,
  tabsListVariants,
  tabsTriggerVariants,
  tabsContentVariants
};