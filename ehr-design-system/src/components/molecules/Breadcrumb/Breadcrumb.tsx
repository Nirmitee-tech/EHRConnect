import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../lib/utils';
import { ChevronRight, Home, MoreHorizontal } from 'lucide-react';
import { Button } from '../../atoms/Button/Button';

const breadcrumbVariants = cva(
  'flex items-center space-x-1 text-sm',
  {
    variants: {
      variant: {
        default: 'text-muted-foreground',
        primary: 'text-primary',
        medical: 'text-blue-600',
        clinical: 'text-green-600',
        administrative: 'text-purple-600',
      },
      size: {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

const breadcrumbItemVariants = cva(
  'flex items-center transition-colors hover:text-foreground',
  {
    variants: {
      active: {
        true: 'text-foreground font-medium pointer-events-none',
        false: 'text-muted-foreground hover:text-foreground cursor-pointer',
      },
      clickable: {
        true: 'cursor-pointer',
        false: 'cursor-default',
      },
    },
    defaultVariants: {
      active: false,
      clickable: true,
    },
  }
);

const breadcrumbSeparatorVariants = cva(
  'flex items-center text-muted-foreground mx-2',
  {
    variants: {
      variant: {
        chevron: '',
        slash: '',
        dot: '',
        arrow: '',
      },
    },
    defaultVariants: {
      variant: 'chevron',
    },
  }
);

export interface BreadcrumbItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export interface BreadcrumbProps extends VariantProps<typeof breadcrumbVariants> {
  items: BreadcrumbItem[];
  separator?: 'chevron' | 'slash' | 'dot' | 'arrow';
  maxItems?: number;
  showHome?: boolean;
  homeIcon?: React.ReactNode;
  onHomeClick?: () => void;
  className?: string;
  itemClassName?: string;
  separatorClassName?: string;
  collapseFrom?: 'start' | 'middle';
}

const getBreadcrumbSeparator = (variant: string) => {
  switch (variant) {
    case 'slash':
      return <span className="text-muted-foreground">/</span>;
    case 'dot':
      return <span className="text-muted-foreground">•</span>;
    case 'arrow':
      return <span className="text-muted-foreground">→</span>;
    default:
      return <ChevronRight className="w-4 h-4 text-muted-foreground" />;
  }
};

const Breadcrumb = React.forwardRef<HTMLNavElement, BreadcrumbProps>(
  ({
    className,
    variant,
    size,
    items,
    separator = 'chevron',
    maxItems,
    showHome = false,
    homeIcon,
    onHomeClick,
    itemClassName,
    separatorClassName,
    collapseFrom = 'middle',
    ...props
  }, ref) => {
    const [showCollapsed, setShowCollapsed] = React.useState(false);
    
    // Handle item collapsing
    const getDisplayItems = () => {
      if (!maxItems || items.length <= maxItems) {
        return items;
      }

      const collapsedItems = [...items];
      
      if (collapseFrom === 'start') {
        const keepLast = Math.max(1, maxItems - 1);
        return [
          { id: 'collapsed', label: '...', disabled: true },
          ...collapsedItems.slice(-keepLast)
        ];
      } else {
        // Collapse from middle
        const keepFirst = Math.floor((maxItems - 1) / 2);
        const keepLast = Math.ceil((maxItems - 1) / 2);
        
        return [
          ...collapsedItems.slice(0, keepFirst),
          { id: 'collapsed', label: '...', disabled: true },
          ...collapsedItems.slice(-keepLast)
        ];
      }
    };

    const displayItems = showCollapsed ? items : getDisplayItems();

    const handleItemClick = (item: BreadcrumbItem, index: number) => {
      if (item.disabled) {
        if (item.id === 'collapsed') {
          setShowCollapsed(true);
        }
        return;
      }

      if (item.onClick) {
        item.onClick();
      }
    };

    const isLastItem = (index: number) => index === displayItems.length - 1;

    return (
      <nav
        ref={ref}
        className={cn(breadcrumbVariants({ variant, size }), className)}
        aria-label="Breadcrumb"
        {...props}
      >
        <ol className="flex items-center space-x-1">
          {showHome && (
            <>
              <li>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-1 hover:bg-muted"
                  onClick={onHomeClick}
                  aria-label="Home"
                >
                  {homeIcon || <Home className="w-4 h-4" />}
                </Button>
              </li>
              {displayItems.length > 0 && (
                <li className={cn(breadcrumbSeparatorVariants({ variant: separator }), separatorClassName)}>
                  {getBreadcrumbSeparator(separator)}
                </li>
              )}
            </>
          )}
          
          {displayItems.map((item, index) => (
            <React.Fragment key={item.id}>
              <li>
                <div
                  className={cn(
                    breadcrumbItemVariants({ 
                      active: isLastItem(index), 
                      clickable: !item.disabled && !isLastItem(index) 
                    }),
                    itemClassName,
                    item.disabled && item.id === 'collapsed' && 'cursor-pointer'
                  )}
                  onClick={() => handleItemClick(item, index)}
                  role={!isLastItem(index) && !item.disabled ? 'button' : undefined}
                  tabIndex={!isLastItem(index) && !item.disabled ? 0 : undefined}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && !isLastItem(index) && !item.disabled) {
                      e.preventDefault();
                      handleItemClick(item, index);
                    }
                  }}
                >
                  {item.icon && (
                    <span className="mr-1 flex-shrink-0">
                      {React.cloneElement(item.icon as React.ReactElement, {
                        className: 'w-4 h-4'
                      })}
                    </span>
                  )}
                  {item.id === 'collapsed' ? (
                    <MoreHorizontal className="w-4 h-4" />
                  ) : (
                    <span className="truncate">{item.label}</span>
                  )}
                </div>
              </li>
              
              {!isLastItem(index) && (
                <li className={cn(breadcrumbSeparatorVariants({ variant: separator }), separatorClassName)}>
                  {getBreadcrumbSeparator(separator)}
                </li>
              )}
            </React.Fragment>
          ))}
        </ol>
      </nav>
    );
  }
);

Breadcrumb.displayName = 'Breadcrumb';

export { Breadcrumb, breadcrumbVariants };