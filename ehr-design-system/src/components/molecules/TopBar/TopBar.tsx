import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../lib/utils';
import { 
  Bell, 
  Search, 
  User, 
  Settings, 
  Menu, 
  X, 
  ChevronDown,
  Sun,
  Moon,
  Globe,
  HelpCircle,
  LogOut,
  Shield,
  Zap
} from 'lucide-react';
import { Button } from '../../atoms/Button/Button';
import { Badge } from '../../atoms/Badge/Badge';

const topBarVariants = cva(
  'flex items-center justify-between w-full px-4 py-3 border-b',
  {
    variants: {
      variant: {
        default: 'bg-background border-border text-foreground',
        primary: 'bg-primary text-primary-foreground border-primary/20',
        medical: 'bg-blue-50 border-blue-200 text-blue-900',
        clinical: 'bg-green-50 border-green-200 text-green-900',
        administrative: 'bg-purple-50 border-purple-200 text-purple-900',
        dark: 'bg-slate-900 border-slate-800 text-slate-100',
        glass: 'bg-background/80 backdrop-blur-sm border-border/50',
        emergency: 'bg-red-50 border-red-200 text-red-900',
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
      shadow: {
        none: '',
        sm: 'shadow-sm',
        md: 'shadow-md',
        lg: 'shadow-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      position: 'static',
      shadow: 'sm',
    },
  }
);

const topBarSectionVariants = cva(
  'flex items-center',
  {
    variants: {
      spacing: {
        sm: 'space-x-2',
        md: 'space-x-3',
        lg: 'space-x-4',
      },
    },
    defaultVariants: {
      spacing: 'md',
    },
  }
);

const topBarBrandVariants = cva(
  'flex items-center font-semibold',
  {
    variants: {
      variant: {
        default: 'text-foreground',
        primary: 'text-primary-foreground',
        medical: 'text-blue-800',
        clinical: 'text-green-800',
        administrative: 'text-purple-800',
        dark: 'text-slate-100',
        glass: 'text-foreground',
        emergency: 'text-red-800',
      },
      size: {
        sm: 'text-sm space-x-2',
        md: 'text-base space-x-3',
        lg: 'text-lg space-x-3',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface TopBarAction {
  id: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  badge?: React.ReactNode;
  disabled?: boolean;
  tooltip?: string;
}

export interface TopBarUser {
  name: string;
  email?: string;
  role?: string;
  avatar?: React.ReactNode;
  status?: 'online' | 'away' | 'busy' | 'offline';
  onClick?: () => void;
  menu?: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    divider?: boolean;
  }>;
}

export interface TopBarBreadcrumb {
  id: string;
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface TopBarProps extends VariantProps<typeof topBarVariants> {
  logo?: React.ReactNode;
  title?: string;
  subtitle?: string;
  breadcrumbs?: TopBarBreadcrumb[];
  actions?: TopBarAction[];
  user?: TopBarUser;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  showSearch?: boolean;
  showMenuToggle?: boolean;
  onMenuToggle?: () => void;
  menuToggleOpen?: boolean;
  className?: string;
  brandClassName?: string;
  contentClassName?: string;
  actionsClassName?: string;
  emergency?: boolean;
  systemStatus?: 'operational' | 'maintenance' | 'incident';
}

const TopBar = React.forwardRef<HTMLElement, TopBarProps>(
  ({
    className,
    variant,
    size,
    position,
    shadow,
    logo,
    title,
    subtitle,
    breadcrumbs = [],
    actions = [],
    user,
    searchPlaceholder = 'Search...',
    onSearch,
    showSearch = false,
    showMenuToggle = false,
    onMenuToggle,
    menuToggleOpen = false,
    brandClassName,
    contentClassName,
    actionsClassName,
    emergency = false,
    systemStatus = 'operational',
    ...props
  }, ref) => {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [showUserMenu, setShowUserMenu] = React.useState(false);

    const effectiveVariant = emergency ? 'emergency' : variant;

    const handleSearchSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSearch?.(searchQuery);
    };

    const handleUserMenuToggle = () => {
      setShowUserMenu(!showUserMenu);
    };

    const handleUserMenuItemClick = (item: any) => {
      item.onClick?.();
      setShowUserMenu(false);
    };

    const getStatusIcon = () => {
      switch (systemStatus) {
        case 'maintenance':
          return <Settings className="w-4 h-4 text-yellow-600" />;
        case 'incident':
          return <Shield className="w-4 h-4 text-red-600" />;
        default:
          return <Zap className="w-4 h-4 text-green-600" />;
      }
    };

    const getStatusText = () => {
      switch (systemStatus) {
        case 'maintenance':
          return 'Maintenance Mode';
        case 'incident':
          return 'System Alert';
        default:
          return 'All Systems Operational';
      }
    };

    return (
      <header
        ref={ref}
        className={cn(topBarVariants({ variant: effectiveVariant, size, position, shadow }), className)}
        {...props}
      >
        {/* Left Section - Brand/Logo */}
        <div className={cn(topBarSectionVariants(), brandClassName)}>
          {showMenuToggle && (
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'lg:hidden',
                effectiveVariant === 'primary' && 'text-primary-foreground hover:bg-primary-foreground/10',
                effectiveVariant === 'medical' && 'text-blue-700 hover:bg-blue-100',
                effectiveVariant === 'clinical' && 'text-green-700 hover:bg-green-100',
                effectiveVariant === 'administrative' && 'text-purple-700 hover:bg-purple-100',
                effectiveVariant === 'dark' && 'text-slate-300 hover:bg-slate-800',
                effectiveVariant === 'emergency' && 'text-red-700 hover:bg-red-100'
              )}
              onClick={onMenuToggle}
              aria-label="Toggle menu"
            >
              {menuToggleOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          )}

          <div className={cn(topBarBrandVariants({ variant: effectiveVariant, size }))}>
            {logo && <div className="flex-shrink-0">{logo}</div>}
            <div className="flex flex-col min-w-0">
              {title && <span className="truncate">{title}</span>}
              {subtitle && (
                <span className={cn(
                  'text-xs opacity-75 truncate',
                  size === 'sm' && 'text-xs',
                  size === 'lg' && 'text-sm'
                )}>
                  {subtitle}
                </span>
              )}
            </div>
          </div>

          {breadcrumbs.length > 0 && (
            <div className="hidden md:flex items-center ml-4">
              <span className="text-muted-foreground">/</span>
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb.id}>
                  <button
                    className="ml-2 text-sm hover:text-foreground transition-colors truncate"
                    onClick={crumb.onClick}
                  >
                    {crumb.label}
                  </button>
                  {index < breadcrumbs.length - 1 && (
                    <span className="ml-2 text-muted-foreground">/</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        {/* Center Section - Search */}
        {showSearch && (
          <div className={cn('hidden md:block flex-1 max-w-md mx-4', contentClassName)}>
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    'w-full pl-10 pr-4 py-2 text-sm rounded-md border',
                    'bg-background border-input',
                    'focus:outline-none focus:ring-2 focus:ring-ring',
                    effectiveVariant === 'dark' && 'bg-slate-800 border-slate-700 text-slate-100'
                  )}
                />
              </div>
            </form>
          </div>
        )}

        {/* Right Section - Actions & User */}
        <div className={cn(topBarSectionVariants(), actionsClassName)}>
          {/* System Status Indicator */}
          {systemStatus !== 'operational' && (
            <div className="hidden sm:flex items-center space-x-2 px-2 py-1 rounded-md bg-opacity-20">
              {getStatusIcon()}
              <span className="text-xs font-medium">{getStatusText()}</span>
            </div>
          )}

          {/* Emergency Alert */}
          {emergency && (
            <Badge variant="destructive" size="sm" className="hidden sm:inline-flex">
              Emergency Mode Active
            </Badge>
          )}

          {/* Actions */}
          {actions.map((action) => (
            <Button
              key={action.id}
              variant="ghost"
              size="sm"
              className={cn(
                'relative',
                effectiveVariant === 'primary' && 'text-primary-foreground hover:bg-primary-foreground/10',
                effectiveVariant === 'medical' && 'text-blue-700 hover:bg-blue-100',
                effectiveVariant === 'clinical' && 'text-green-700 hover:bg-green-100',
                effectiveVariant === 'administrative' && 'text-purple-700 hover:bg-purple-100',
                effectiveVariant === 'dark' && 'text-slate-300 hover:bg-slate-800',
                effectiveVariant === 'emergency' && 'text-red-700 hover:bg-red-100'
              )}
              onClick={action.onClick}
              disabled={action.disabled}
              title={action.tooltip || action.label}
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
          ))}

          {/* Mobile Search */}
          {showSearch && (
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'md:hidden',
                effectiveVariant === 'primary' && 'text-primary-foreground hover:bg-primary-foreground/10',
                effectiveVariant === 'medical' && 'text-blue-700 hover:bg-blue-100',
                effectiveVariant === 'clinical' && 'text-green-700 hover:bg-green-100',
                effectiveVariant === 'administrative' && 'text-purple-700 hover:bg-purple-100',
                effectiveVariant === 'dark' && 'text-slate-300 hover:bg-slate-800',
                effectiveVariant === 'emergency' && 'text-red-700 hover:bg-red-100'
              )}
            >
              <Search className="w-4 h-4" />
            </Button>
          )}

          {/* User Menu */}
          {user && (
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'flex items-center space-x-2',
                  effectiveVariant === 'primary' && 'text-primary-foreground hover:bg-primary-foreground/10',
                  effectiveVariant === 'medical' && 'text-blue-700 hover:bg-blue-100',
                  effectiveVariant === 'clinical' && 'text-green-700 hover:bg-green-100',
                  effectiveVariant === 'administrative' && 'text-purple-700 hover:bg-purple-100',
                  effectiveVariant === 'dark' && 'text-slate-300 hover:bg-slate-800',
                  effectiveVariant === 'emergency' && 'text-red-700 hover:bg-red-100'
                )}
                onClick={user.onClick || handleUserMenuToggle}
              >
                <div className="relative">
                  {user.avatar || <User className="w-5 h-5" />}
                  {user.status && (
                    <span className={cn(
                      'absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border',
                      user.status === 'online' && 'bg-green-400',
                      user.status === 'away' && 'bg-yellow-400',
                      user.status === 'busy' && 'bg-red-400',
                      user.status === 'offline' && 'bg-gray-400'
                    )} />
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-medium">{user.name}</div>
                  {user.role && (
                    <div className="text-xs opacity-75">{user.role}</div>
                  )}
                </div>
                {user.menu && (
                  <ChevronDown className="w-3 h-3" />
                )}
              </Button>

              {/* User Dropdown Menu */}
              {showUserMenu && user.menu && (
                <div className={cn(
                  'absolute right-0 top-full mt-1 w-48 rounded-md shadow-lg border z-50',
                  'bg-popover text-popover-foreground',
                  effectiveVariant === 'dark' && 'bg-slate-800 border-slate-700'
                )}>
                  <div className="py-1">
                    {user.menu.map((item, index) => (
                      <React.Fragment key={item.id}>
                        {item.divider && <div className="border-t my-1" />}
                        <button
                          className={cn(
                            'w-full text-left px-4 py-2 text-sm hover:bg-muted flex items-center space-x-2',
                            item.disabled && 'opacity-50 cursor-not-allowed'
                          )}
                          onClick={() => handleUserMenuItemClick(item)}
                          disabled={item.disabled}
                        >
                          {item.icon && (
                            <span className="flex-shrink-0">
                              {React.cloneElement(item.icon as React.ReactElement, {
                                className: 'w-4 h-4'
                              })}
                            </span>
                          )}
                          <span>{item.label}</span>
                        </button>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </header>
    );
  }
);

TopBar.displayName = 'TopBar';

export { TopBar, topBarVariants, topBarSectionVariants, topBarBrandVariants };