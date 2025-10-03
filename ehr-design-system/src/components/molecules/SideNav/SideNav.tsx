import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../lib/utils';
import { ChevronDown, ChevronRight, Home, User, Settings } from 'lucide-react';
import { Button } from '../../atoms/Button/Button';

const sideNavVariants = cva(
  'flex flex-col h-full bg-background border-r border-border',
  {
    variants: {
      variant: {
        default: 'bg-background',
        primary: 'bg-primary/5 border-primary/20',
        medical: 'bg-blue-50 border-blue-200',
        clinical: 'bg-green-50 border-green-200',
        administrative: 'bg-purple-50 border-purple-200',
        dark: 'bg-slate-900 border-slate-800 text-slate-100',
      },
      width: {
        sm: 'w-16',
        md: 'w-64',
        lg: 'w-80',
        xl: 'w-96',
      },
      collapsed: {
        true: 'w-16',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      width: 'md',
      collapsed: false,
    },
  }
);

const sideNavHeaderVariants = cva(
  'flex items-center justify-between p-4 border-b border-border',
  {
    variants: {
      variant: {
        default: 'border-border',
        primary: 'border-primary/20',
        medical: 'border-blue-200',
        clinical: 'border-green-200',
        administrative: 'border-purple-200',
        dark: 'border-slate-800',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const sideNavContentVariants = cva(
  'flex-1 overflow-y-auto p-2',
  {
    variants: {
      spacing: {
        sm: 'p-1',
        md: 'p-2',
        lg: 'p-4',
      },
    },
    defaultVariants: {
      spacing: 'md',
    },
  }
);

const sideNavItemVariants = cva(
  'flex items-center w-full text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md',
  {
    variants: {
      variant: {
        default: 'text-muted-foreground hover:text-foreground hover:bg-muted/80',
        primary: 'text-primary/80 hover:text-primary hover:bg-primary/10',
        medical: 'text-blue-700 hover:text-blue-800 hover:bg-blue-100',
        clinical: 'text-green-700 hover:text-green-800 hover:bg-green-100',
        administrative: 'text-purple-700 hover:text-purple-800 hover:bg-purple-100',
        dark: 'text-slate-300 hover:text-slate-100 hover:bg-slate-800',
      },
      active: {
        true: 'text-foreground bg-muted font-medium',
        false: '',
      },
      disabled: {
        true: 'opacity-50 cursor-not-allowed pointer-events-none',
        false: '',
      },
      size: {
        sm: 'px-2 py-1.5 text-sm',
        md: 'px-3 py-2 text-sm',
        lg: 'px-4 py-3 text-base',
      },
      collapsed: {
        true: 'justify-center px-2',
        false: 'justify-start',
      },
    },
    compoundVariants: [
      {
        variant: 'primary',
        active: true,
        class: 'bg-primary/15 text-primary border border-primary/20',
      },
      {
        variant: 'medical',
        active: true,
        class: 'bg-blue-100 text-blue-800 border border-blue-200',
      },
      {
        variant: 'clinical',
        active: true,
        class: 'bg-green-100 text-green-800 border border-green-200',
      },
      {
        variant: 'administrative',
        active: true,
        class: 'bg-purple-100 text-purple-800 border border-purple-200',
      },
      {
        variant: 'dark',
        active: true,
        class: 'bg-slate-800 text-slate-100 border border-slate-700',
      },
    ],
    defaultVariants: {
      variant: 'default',
      active: false,
      disabled: false,
      size: 'md',
      collapsed: false,
    },
  }
);

const sideNavGroupVariants = cva(
  'mb-4 last:mb-0',
  {
    variants: {
      spacing: {
        sm: 'mb-2',
        md: 'mb-4',
        lg: 'mb-6',
      },
    },
    defaultVariants: {
      spacing: 'md',
    },
  }
);

const sideNavGroupHeaderVariants = cva(
  'flex items-center justify-between px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2',
  {
    variants: {
      variant: {
        default: 'text-muted-foreground',
        primary: 'text-primary/70',
        medical: 'text-blue-600',
        clinical: 'text-green-600',
        administrative: 'text-purple-600',
        dark: 'text-slate-400',
      },
      collapsible: {
        true: 'cursor-pointer hover:text-foreground',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      collapsible: false,
    },
  }
);

export interface SideNavItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
  badge?: React.ReactNode;
  children?: SideNavItem[];
}

export interface SideNavGroup {
  id: string;
  label: string;
  items: SideNavItem[];
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  icon?: React.ReactNode;
}

export interface SideNavProps extends VariantProps<typeof sideNavVariants> {
  groups?: SideNavGroup[];
  items?: SideNavItem[];
  header?: React.ReactNode;
  footer?: React.ReactNode;
  logo?: React.ReactNode;
  title?: string;
  onItemClick?: (item: SideNavItem) => void;
  onToggleCollapse?: (collapsed: boolean) => void;
  collapsible?: boolean;
  showToggle?: boolean;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  itemClassName?: string;
  groupClassName?: string;
}

const SideNav = React.forwardRef<HTMLElement, SideNavProps>(
  ({
    className,
    variant,
    width,
    collapsed = false,
    groups = [],
    items = [],
    header,
    footer,
    logo,
    title,
    onItemClick,
    onToggleCollapse,
    collapsible = false,
    showToggle = false,
    headerClassName,
    contentClassName,
    itemClassName,
    groupClassName,
    ...props
  }, ref) => {
    const [isCollapsed, setIsCollapsed] = React.useState(collapsed);
    const [collapsedGroups, setCollapsedGroups] = React.useState<Record<string, boolean>>({});

    React.useEffect(() => {
      setIsCollapsed(collapsed);
    }, [collapsed]);

    const handleToggleCollapse = () => {
      const newCollapsed = !isCollapsed;
      setIsCollapsed(newCollapsed);
      onToggleCollapse?.(newCollapsed);
    };

    const handleItemClick = (item: SideNavItem) => {
      if (item.disabled) return;
      onItemClick?.(item);
      item.onClick?.();
    };

    const handleGroupToggle = (groupId: string) => {
      setCollapsedGroups(prev => ({
        ...prev,
        [groupId]: !prev[groupId]
      }));
    };

    const renderItem = (item: SideNavItem, level: number = 0) => (
      <div key={item.id} style={{ marginLeft: level * 16 }}>
        <button
          className={cn(
            sideNavItemVariants({ 
              variant, 
              active: item.active, 
              disabled: item.disabled,
              collapsed: isCollapsed 
            }),
            itemClassName
          )}
          onClick={() => handleItemClick(item)}
          disabled={item.disabled}
          title={isCollapsed ? item.label : undefined}
        >
          {item.icon && (
            <span className={cn(
              'flex-shrink-0',
              isCollapsed ? 'w-5 h-5' : 'w-4 h-4 mr-3'
            )}>
              {React.cloneElement(item.icon as React.ReactElement, {
                className: 'w-full h-full'
              })}
            </span>
          )}
          
          {!isCollapsed && (
            <>
              <span className="flex-1 truncate text-left">{item.label}</span>
              {item.badge && (
                <span className="ml-2 flex-shrink-0">
                  {item.badge}
                </span>
              )}
              {item.children && item.children.length > 0 && (
                <ChevronRight className="w-4 h-4 ml-2 flex-shrink-0" />
              )}
            </>
          )}
        </button>
        
        {!isCollapsed && item.children && item.children.map(child => 
          renderItem(child, level + 1)
        )}
      </div>
    );

    const renderGroup = (group: SideNavGroup) => {
      const isGroupCollapsed = collapsedGroups[group.id] ?? group.defaultCollapsed ?? false;
      
      return (
        <div key={group.id} className={cn(sideNavGroupVariants(), groupClassName)}>
          {!isCollapsed && (
            <div
              className={cn(
                sideNavGroupHeaderVariants({ 
                  variant, 
                  collapsible: group.collapsible 
                })
              )}
              onClick={group.collapsible ? () => handleGroupToggle(group.id) : undefined}
            >
              <div className="flex items-center">
                {group.icon && (
                  <span className="w-4 h-4 mr-2 flex-shrink-0">
                    {group.icon}
                  </span>
                )}
                <span>{group.label}</span>
              </div>
              {group.collapsible && (
                <ChevronDown className={cn(
                  'w-4 h-4 transition-transform duration-200',
                  isGroupCollapsed && '-rotate-90'
                )} />
              )}
            </div>
          )}
          
          {(!isGroupCollapsed || isCollapsed) && (
            <div className="space-y-1">
              {group.items.map(item => renderItem(item))}
            </div>
          )}
        </div>
      );
    };

    return (
      <nav
        ref={ref}
        className={cn(
          sideNavVariants({ variant, width, collapsed: isCollapsed }),
          className
        )}
        {...props}
      >
        {(header || logo || title || showToggle) && (
          <div className={cn(sideNavHeaderVariants({ variant }), headerClassName)}>
            <div className="flex items-center flex-1 min-w-0">
              {logo && (
                <div className="flex-shrink-0 mr-3">
                  {logo}
                </div>
              )}
              {!isCollapsed && title && (
                <h2 className="text-lg font-semibold truncate">{title}</h2>
              )}
              {!isCollapsed && header}
            </div>
            
            {(collapsible || showToggle) && (
              <Button
                variant="ghost"
                size="sm"
                className="flex-shrink-0 ml-2"
                onClick={handleToggleCollapse}
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <ChevronRight className={cn(
                  'w-4 h-4 transition-transform duration-200',
                  !isCollapsed && 'rotate-180'
                )} />
              </Button>
            )}
          </div>
        )}
        
        <div className={cn(sideNavContentVariants(), contentClassName)}>
          {groups.map(group => renderGroup(group))}
          
          {items.length > 0 && (
            <div className="space-y-1">
              {items.map(item => renderItem(item))}
            </div>
          )}
        </div>
        
        {footer && !isCollapsed && (
          <div className="p-4 border-t border-border mt-auto">
            {footer}
          </div>
        )}
      </nav>
    );
  }
);

SideNav.displayName = 'SideNav';

export { SideNav, sideNavVariants, sideNavItemVariants };