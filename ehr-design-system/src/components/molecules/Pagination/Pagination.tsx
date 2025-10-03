import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../lib/utils';
import { ChevronLeft, ChevronRight, MoreHorizontal, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '../../atoms/Button/Button';

const paginationVariants = cva(
  'flex items-center justify-center space-x-1',
  {
    variants: {
      variant: {
        default: '',
        outline: '',
        ghost: '',
        medical: 'text-blue-600',
        clinical: 'text-green-600',
        administrative: 'text-purple-600',
      },
      size: {
        sm: 'text-sm',
        md: 'text-sm',
        lg: 'text-base',
      },
      spacing: {
        sm: 'space-x-0.5',
        md: 'space-x-1',
        lg: 'space-x-2',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      spacing: 'md',
    },
  }
);

const paginationItemVariants = cva(
  'flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'hover:bg-muted hover:text-muted-foreground',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        medical: 'text-blue-600 hover:bg-blue-50 hover:text-blue-800',
        clinical: 'text-green-600 hover:bg-green-50 hover:text-green-800',
        administrative: 'text-purple-600 hover:bg-purple-50 hover:text-purple-800',
      },
      active: {
        true: 'bg-primary text-primary-foreground hover:bg-primary/90',
        false: '',
      },
      size: {
        sm: 'h-8 w-8 text-xs',
        md: 'h-9 w-9 text-sm',
        lg: 'h-10 w-10 text-base',
      },
      shape: {
        default: 'rounded-md',
        circle: 'rounded-full',
        square: 'rounded-none',
      },
    },
    compoundVariants: [
      {
        variant: 'medical',
        active: true,
        class: 'bg-blue-600 text-white hover:bg-blue-700',
      },
      {
        variant: 'clinical',
        active: true,
        class: 'bg-green-600 text-white hover:bg-green-700',
      },
      {
        variant: 'administrative',
        active: true,
        class: 'bg-purple-600 text-white hover:bg-purple-700',
      },
    ],
    defaultVariants: {
      variant: 'default',
      active: false,
      size: 'md',
      shape: 'default',
    },
  }
);

const paginationEllipsisVariants = cva(
  'flex items-center justify-center',
  {
    variants: {
      size: {
        sm: 'h-8 w-8 text-xs',
        md: 'h-9 w-9 text-sm',
        lg: 'h-10 w-10 text-base',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

const paginationInfoVariants = cva(
  'text-muted-foreground',
  {
    variants: {
      size: {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface PaginationProps extends VariantProps<typeof paginationVariants> {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  showInfo?: boolean;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  maxVisiblePages?: number;
  shape?: 'default' | 'circle' | 'square';
  disabled?: boolean;
  className?: string;
  itemClassName?: string;
  infoClassName?: string;
  prevLabel?: string;
  nextLabel?: string;
  firstLabel?: string;
  lastLabel?: string;
  infoTemplate?: (start: number, end: number, total: number) => string;
}

const Pagination = React.forwardRef<HTMLElement, PaginationProps>(
  ({
    className,
    variant,
    size,
    spacing,
    shape = 'default',
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
    itemsPerPage,
    showInfo = false,
    showFirstLast = false,
    showPrevNext = true,
    maxVisiblePages = 7,
    disabled = false,
    itemClassName,
    infoClassName,
    prevLabel = 'Previous',
    nextLabel = 'Next',
    firstLabel = 'First',
    lastLabel = 'Last',
    infoTemplate = (start, end, total) => `Showing ${start}-${end} of ${total} results`,
    ...props
  }, ref) => {
    const handlePageChange = (page: number) => {
      if (disabled || page === currentPage || page < 1 || page > totalPages) return;
      onPageChange(page);
    };

    const getVisiblePages = () => {
      if (totalPages <= maxVisiblePages) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
      }

      const half = Math.floor(maxVisiblePages / 2);
      let start = Math.max(currentPage - half, 1);
      let end = Math.min(start + maxVisiblePages - 1, totalPages);

      if (end - start + 1 < maxVisiblePages) {
        start = Math.max(end - maxVisiblePages + 1, 1);
      }

      return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    };

    const visiblePages = getVisiblePages();
    const showStartEllipsis = visiblePages[0] > 2;
    const showEndEllipsis = visiblePages[visiblePages.length - 1] < totalPages - 1;

    const getPaginationInfo = () => {
      if (!totalItems || !itemsPerPage) return null;
      
      const start = (currentPage - 1) * itemsPerPage + 1;
      const end = Math.min(currentPage * itemsPerPage, totalItems);
      
      return infoTemplate(start, end, totalItems);
    };

    const renderPageButton = (page: number, isActive: boolean = false) => (
      <button
        key={page}
        className={cn(
          paginationItemVariants({ variant, active: isActive, size, shape }),
          itemClassName
        )}
        onClick={() => handlePageChange(page)}
        disabled={disabled || isActive}
        aria-label={`Go to page ${page}`}
        aria-current={isActive ? 'page' : undefined}
      >
        {page}
      </button>
    );

    const renderEllipsis = (key: string) => (
      <span
        key={key}
        className={cn(paginationEllipsisVariants({ size }), itemClassName)}
        aria-hidden="true"
      >
        <MoreHorizontal className="w-4 h-4" />
      </span>
    );

    return (
      <nav
        ref={ref}
        className={cn(paginationVariants({ variant, size, spacing }), className)}
        role="navigation"
        aria-label="Pagination"
        {...props}
      >
        <div className="flex items-center space-x-1">
          {showFirstLast && (
            <Button
              variant="outline"
              size={size}
              className={cn(
                paginationItemVariants({ variant, size, shape }),
                itemClassName
              )}
              onClick={() => handlePageChange(1)}
              disabled={disabled || currentPage === 1}
              aria-label={firstLabel}
            >
              <ChevronsLeft className="w-4 h-4" />
              <span className="sr-only">{firstLabel}</span>
            </Button>
          )}

          {showPrevNext && (
            <Button
              variant="outline"
              size={size}
              className={cn(
                paginationItemVariants({ variant, size, shape }),
                itemClassName
              )}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={disabled || currentPage === 1}
              aria-label={prevLabel}
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="sr-only">{prevLabel}</span>
            </Button>
          )}

          {/* First page */}
          {showStartEllipsis && renderPageButton(1)}

          {/* Start ellipsis */}
          {showStartEllipsis && renderEllipsis('start-ellipsis')}

          {/* Visible page numbers */}
          {visiblePages.map(page => 
            renderPageButton(page, page === currentPage)
          )}

          {/* End ellipsis */}
          {showEndEllipsis && renderEllipsis('end-ellipsis')}

          {/* Last page */}
          {showEndEllipsis && renderPageButton(totalPages)}

          {showPrevNext && (
            <Button
              variant="outline"
              size={size}
              className={cn(
                paginationItemVariants({ variant, size, shape }),
                itemClassName
              )}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={disabled || currentPage === totalPages}
              aria-label={nextLabel}
            >
              <ChevronRight className="w-4 h-4" />
              <span className="sr-only">{nextLabel}</span>
            </Button>
          )}

          {showFirstLast && (
            <Button
              variant="outline"
              size={size}
              className={cn(
                paginationItemVariants({ variant, size, shape }),
                itemClassName
              )}
              onClick={() => handlePageChange(totalPages)}
              disabled={disabled || currentPage === totalPages}
              aria-label={lastLabel}
            >
              <ChevronsRight className="w-4 h-4" />
              <span className="sr-only">{lastLabel}</span>
            </Button>
          )}
        </div>

        {showInfo && getPaginationInfo() && (
          <div className={cn(paginationInfoVariants({ size }), 'ml-4', infoClassName)}>
            {getPaginationInfo()}
          </div>
        )}
      </nav>
    );
  }
);

Pagination.displayName = 'Pagination';

export { 
  Pagination, 
  paginationVariants, 
  paginationItemVariants, 
  paginationEllipsisVariants,
  paginationInfoVariants 
};