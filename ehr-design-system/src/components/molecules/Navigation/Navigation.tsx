import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../lib/utils';
import { ChevronDown, Menu as MenuIcon, X, Bell, Search, User, Settings } from 'lucide-react';
import { Button } from '../../atoms/Button/Button';
import { Badge } from '../../atoms/Badge/Badge';

const navigationVariants = cva(
  'flex items-center justify-between w-full px-4 py-3 border-b',
  {
    variants: {
      variant: {
        default: 'bg-background border-border',
        primary: 'bg-primary text-primary-foreground border-primary/20',
        medical: 'bg-blue-50 border-blue-200 text-blue-900',
        clinical: 'bg-green-50 border-green-200 text-green-900',
        administrative: 'bg-purple-50 border-purple-200 text-purple-900',
        dark: 'bg-slate-900 border-slate-800 text-slate-100',
        transparent: 'bg-transparent border-transparent',
      },
      size: {
        sm: 'px-3 py-2 text-sm',
        md: 'px-4 py-3 text-sm',
        lg: 'px-6 py-4 text-base',
      },
      position: {
        static: 'static',
        fixed: 'fixed top-0 left-0 right-0 z-50',
        sticky: 'sticky top-0 z-40',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      position: 'static',
    },
  }
);

const navigationBrandVariants = cva(
  'flex items-center space-x-3 font-semibold',
  {
    variants: {
      variant: {
        default: 'text-foreground',
        primary: 'text-primary-foreground',
        medical: 'text-blue-800',
        clinical: 'text-green-800',
        administrative: 'text-purple-800',
        dark: 'text-slate-100',
        transparent: 'text-foreground',
      },
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

const navigationItemVariants = cva(
  'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
  {
    variants: {
      variant: {
        default: 'text-muted-foreground hover:text-foreground hover:bg-muted',
        primary: 'text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10',
        medical: 'text-blue-700 hover:text-blue-800 hover:bg-blue-100',
        clinical: 'text-green-700 hover:text-green-800 hover:bg-green-100',
        administrative: 'text-purple-700 hover:text-purple-800 hover:bg-purple-100',
        dark: 'text-slate-300 hover:text-slate-100 hover:bg-slate-800',
        transparent: 'text-muted-foreground hover:text-foreground hover:bg-muted',
      },
      active: {
        true: 'text-foreground bg-muted',
        false: '',
      },
      disabled: {
        true: 'opacity-50 cursor-not-allowed pointer-events-none',
        false: '',
      },
    },
    compoundVariants: [
      {
        variant: 'primary',
        active: true,
        class: 'text-primary-foreground bg-primary-foreground/20',
      },
      {
        variant: 'medical',
        active: true,
        class: 'text-blue-800 bg-blue-100',
      },
      {
        variant: 'clinical',
        active: true,
        class: 'text-green-800 bg-green-100',
      },
      {
        variant: 'administrative',
        active: true,
        class: 'text-purple-800 bg-purple-100',
      },
      {
        variant: 'dark',
        active: true,
        class: 'text-slate-100 bg-slate-800',
      },
    ],
    defaultVariants: {
      variant: 'default',
      active: false,
      disabled: false,
    },
  }
);

const navigationActionsVariants = cva(
  'flex items-center space-x-2',
  {
    variants: {
      size: {
        sm: 'space-x-1',
        md: 'space-x-2',
        lg: 'space-x-3',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface NavigationItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children?: NavigationItem[];
}

export interface NavigationAction {
  id: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  badge?: React.ReactNode;
  disabled?: boolean;
}

export interface NavigationProps extends VariantProps<typeof navigationVariants> {
  brand?: React.ReactNode;
  title?: string;
  logo?: React.ReactNode;
  items?: NavigationItem[];
  actions?: NavigationAction[];
  user?: {
    name: string;
    avatar?: React.ReactNode;
    role?: string;
    onClick?: () => void;
  };
  onMenuToggle?: () => void;
  showMenuToggle?: boolean;
  onItemClick?: (item: NavigationItem) => void;
  className?: string;
  brandClassName?: string;
  itemsClassName?: string;
  actionsClassName?: string;
  mobileMenuOpen?: boolean;
  onMobileMenuChange?: (open: boolean) => void;
}

const Navigation = React.forwardRef<HTMLElement, NavigationProps>(
  ({
    className,
    variant,
    size,
    position,
    brand,
    title,
    logo,
    items = [],
    actions = [],
    user,
    onMenuToggle,
    showMenuToggle = false,
    onItemClick,
    brandClassName,
    itemsClassName,
    actionsClassName,
    mobileMenuOpen = false,
    onMobileMenuChange,
    ...props
  }, ref) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(mobileMenuOpen);

    React.useEffect(() => {
      setIsMobileMenuOpen(mobileMenuOpen);
    }, [mobileMenuOpen]);

    const handleMobileMenuToggle = () => {
      const newState = !isMobileMenuOpen;
      setIsMobileMenuOpen(newState);
      onMobileMenuChange?.(newState);
      onMenuToggle?.();
    };

    const handleItemClick = (item: NavigationItem) => {
      if (item.disabled) return;
      onItemClick?.(item);
      item.onClick?.();
      
      // Close mobile menu on item click
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
        onMobileMenuChange?.(false);
      }
    };

    const renderNavigationItem = (item: NavigationItem) => (
      <button
        key={item.id}
        className={cn(
          navigationItemVariants({ 
            variant, 
            active: item.active, 
            disabled: item.disabled 
          }),
          'whitespace-nowrap'
        )}
        onClick={() => handleItemClick(item)}
        disabled={item.disabled}
        aria-current={item.active ? 'page' : undefined}
      >
        {item.icon && (
          <span className="mr-2 flex-shrink-0">
            {React.cloneElement(item.icon as React.ReactElement, {
              className: 'w-4 h-4'
            })}
          </span>
        )}
        <span>{item.label}</span>
        {item.badge && (
          <span className="ml-2 flex-shrink-0">
            {item.badge}
          </span>
        )}
        {item.children && item.children.length > 0 && (
          <ChevronDown className="ml-1 w-4 h-4" />
        )}
      </button>
    );

    const renderAction = (action: NavigationAction) => (
      <Button
        key={action.id}
        variant="ghost"
        size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'sm'}
        className={cn(
          'relative',
          variant === 'primary' && 'text-primary-foreground hover:bg-primary-foreground/10',
          variant === 'medical' && 'text-blue-700 hover:bg-blue-100',
          variant === 'clinical' && 'text-green-700 hover:bg-green-100',
          variant === 'administrative' && 'text-purple-700 hover:bg-purple-100',
          variant === 'dark' && 'text-slate-300 hover:bg-slate-800'
        )}
        onClick={action.onClick}
        disabled={action.disabled}
        aria-label={action.label}
      >
        {React.cloneElement(action.icon as React.ReactElement, {
          className: 'w-4 h-4'
        })}
        {action.badge && (
          <span className="absolute -top-1 -right-1">
            {action.badge}
          </span>
        )}
      </Button>
    );

    return (
      <nav
        ref={ref}
        className={cn(navigationVariants({ variant, size, position }), className)}
        {...props}
      >
        {/* Brand/Logo Section */}
        <div className={cn(navigationBrandVariants({ variant, size }), brandClassName)}>
          {showMenuToggle && (
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'md:hidden',
                variant === 'primary' && 'text-primary-foreground hover:bg-primary-foreground/10',
                variant === 'medical' && 'text-blue-700 hover:bg-blue-100',
                variant === 'clinical' && 'text-green-700 hover:bg-green-100',
                variant === 'administrative' && 'text-purple-700 hover:bg-purple-100',
                variant === 'dark' && 'text-slate-300 hover:bg-slate-800'
              )}
              onClick={handleMobileMenuToggle}
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <MenuIcon className="w-5 h-5" />
              )}
            </Button>
          )}
          
          {logo && (
            <div className="flex-shrink-0">
              {logo}
            </div>
          )}
          
          {(title || brand) && (
            <div className="flex items-center">
              {brand ? brand : <span className="truncate">{title}</span>}
            </div>
          )}
        </div>

        {/* Desktop Navigation Items */}
        <div className={cn(
          'hidden md:flex md:items-center md:space-x-1',
          itemsClassName
        )}>
          {items.map(renderNavigationItem)}
        </div>

        {/* Actions Section */}
        <div className={cn(navigationActionsVariants({ size }), actionsClassName)}>
          {actions.map(renderAction)}
          
          {user && (
            <Button
              variant="ghost"
              size={size === 'sm' ? 'sm' : 'sm'}
              className={cn(
                'flex items-center space-x-2',
                variant === 'primary' && 'text-primary-foreground hover:bg-primary-foreground/10',
                variant === 'medical' && 'text-blue-700 hover:bg-blue-100',
                variant === 'clinical' && 'text-green-700 hover:bg-green-100',
                variant === 'administrative' && 'text-purple-700 hover:bg-purple-100',
                variant === 'dark' && 'text-slate-300 hover:bg-slate-800'
              )}
              onClick={user.onClick}
            >
              {user.avatar || <User className="w-4 h-4" />}
              <div className="hidden sm:block text-left">
                <div className="text-xs font-medium">{user.name}</div>
                {user.role && (
                  <div className="text-xs opacity-75">{user.role}</div>
                )}
              </div>
            </Button>
          )}
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className={cn(
            'absolute top-full left-0 right-0 md:hidden',
            'border-b shadow-lg',
            variant === 'default' && 'bg-background border-border',
            variant === 'primary' && 'bg-primary border-primary/20',
            variant === 'medical' && 'bg-blue-50 border-blue-200',
            variant === 'clinical' && 'bg-green-50 border-green-200',
            variant === 'administrative' && 'bg-purple-50 border-purple-200',
            variant === 'dark' && 'bg-slate-900 border-slate-800',
            variant === 'transparent' && 'bg-background border-border'
          )}>
            <div className="px-4 py-3 space-y-2">
              {items.map(item => (
                <div key={item.id} className="block">
                  {renderNavigationItem(item)}
                </div>
              ))}
            </div>
          </div>
        )}
      </nav>
    );
  }
);

Navigation.displayName = 'Navigation';

export { Navigation, navigationVariants, navigationBrandVariants, navigationItemVariants };