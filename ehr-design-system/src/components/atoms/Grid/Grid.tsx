import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../lib/utils';

// Container Component
const containerVariants = cva(
  'mx-auto px-4 sm:px-6 lg:px-8',
  {
    variants: {
      size: {
        xs: 'max-w-screen-xs',
        sm: 'max-w-screen-sm',
        md: 'max-w-screen-md',
        lg: 'max-w-screen-lg',
        xl: 'max-w-screen-xl',
        '2xl': 'max-w-screen-2xl',
        full: 'max-w-full',
        none: 'max-w-none',
      },
      centered: {
        true: 'mx-auto',
        false: '',
      },
    },
    defaultVariants: {
      size: 'full',
      centered: true,
    },
  }
);

export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size, centered, ...props }, ref) => {
    return (
      <div
        className={cn(containerVariants({ size, centered, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Container.displayName = 'Container';

// Grid Component
const gridVariants = cva('grid', {
  variants: {
    cols: {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
      5: 'grid-cols-5',
      6: 'grid-cols-6',
      7: 'grid-cols-7',
      8: 'grid-cols-8',
      9: 'grid-cols-9',
      10: 'grid-cols-10',
      11: 'grid-cols-11',
      12: 'grid-cols-12',
      none: 'grid-cols-none',
    },
    gap: {
      0: 'gap-0',
      1: 'gap-1',
      2: 'gap-2',
      3: 'gap-3',
      4: 'gap-4',
      5: 'gap-5',
      6: 'gap-6',
      8: 'gap-8',
      10: 'gap-10',
      12: 'gap-12',
      16: 'gap-16',
      20: 'gap-20',
      24: 'gap-24',
    },
    gapX: {
      0: 'gap-x-0',
      1: 'gap-x-1',
      2: 'gap-x-2',
      3: 'gap-x-3',
      4: 'gap-x-4',
      5: 'gap-x-5',
      6: 'gap-x-6',
      8: 'gap-x-8',
      10: 'gap-x-10',
      12: 'gap-x-12',
      16: 'gap-x-16',
      20: 'gap-x-20',
      24: 'gap-x-24',
    },
    gapY: {
      0: 'gap-y-0',
      1: 'gap-y-1',
      2: 'gap-y-2',
      3: 'gap-y-3',
      4: 'gap-y-4',
      5: 'gap-y-5',
      6: 'gap-y-6',
      8: 'gap-y-8',
      10: 'gap-y-10',
      12: 'gap-y-12',
      16: 'gap-y-16',
      20: 'gap-y-20',
      24: 'gap-y-24',
    },
    autoFit: {
      true: 'grid-cols-[repeat(auto-fit,minmax(250px,1fr))]',
      false: '',
    },
    autoFill: {
      true: 'grid-cols-[repeat(auto-fill,minmax(250px,1fr))]',
      false: '',
    },
  },
  defaultVariants: {
    cols: 1,
    gap: 4,
    autoFit: false,
    autoFill: false,
  },
});

export interface GridProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gridVariants> {
  responsive?: {
    sm?: VariantProps<typeof gridVariants>['cols'];
    md?: VariantProps<typeof gridVariants>['cols'];
    lg?: VariantProps<typeof gridVariants>['cols'];
    xl?: VariantProps<typeof gridVariants>['cols'];
    '2xl'?: VariantProps<typeof gridVariants>['cols'];
  };
}

const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ className, cols, gap, gapX, gapY, autoFit, autoFill, responsive, ...props }, ref) => {
    const responsiveClasses = responsive
      ? [
          responsive.sm && `sm:grid-cols-${responsive.sm}`,
          responsive.md && `md:grid-cols-${responsive.md}`,
          responsive.lg && `lg:grid-cols-${responsive.lg}`,
          responsive.xl && `xl:grid-cols-${responsive.xl}`,
          responsive['2xl'] && `2xl:grid-cols-${responsive['2xl']}`,
        ].filter(Boolean).join(' ')
      : '';

    return (
      <div
        className={cn(
          gridVariants({ cols, gap, gapX, gapY, autoFit, autoFill }),
          responsiveClasses,
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Grid.displayName = 'Grid';

// Grid Item Component
const gridItemVariants = cva('', {
  variants: {
    colSpan: {
      1: 'col-span-1',
      2: 'col-span-2',
      3: 'col-span-3',
      4: 'col-span-4',
      5: 'col-span-5',
      6: 'col-span-6',
      7: 'col-span-7',
      8: 'col-span-8',
      9: 'col-span-9',
      10: 'col-span-10',
      11: 'col-span-11',
      12: 'col-span-12',
      full: 'col-span-full',
    },
    rowSpan: {
      1: 'row-span-1',
      2: 'row-span-2',
      3: 'row-span-3',
      4: 'row-span-4',
      5: 'row-span-5',
      6: 'row-span-6',
      full: 'row-span-full',
    },
    colStart: {
      1: 'col-start-1',
      2: 'col-start-2',
      3: 'col-start-3',
      4: 'col-start-4',
      5: 'col-start-5',
      6: 'col-start-6',
      7: 'col-start-7',
      8: 'col-start-8',
      9: 'col-start-9',
      10: 'col-start-10',
      11: 'col-start-11',
      12: 'col-start-12',
      13: 'col-start-13',
    },
    colEnd: {
      1: 'col-end-1',
      2: 'col-end-2',
      3: 'col-end-3',
      4: 'col-end-4',
      5: 'col-end-5',
      6: 'col-end-6',
      7: 'col-end-7',
      8: 'col-end-8',
      9: 'col-end-9',
      10: 'col-end-10',
      11: 'col-end-11',
      12: 'col-end-12',
      13: 'col-end-13',
    },
  },
  defaultVariants: {
    colSpan: 1,
  },
});

export interface GridItemProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gridItemVariants> {
  responsive?: {
    sm?: VariantProps<typeof gridItemVariants>['colSpan'];
    md?: VariantProps<typeof gridItemVariants>['colSpan'];
    lg?: VariantProps<typeof gridItemVariants>['colSpan'];
    xl?: VariantProps<typeof gridItemVariants>['colSpan'];
    '2xl'?: VariantProps<typeof gridItemVariants>['colSpan'];
  };
}

const GridItem = React.forwardRef<HTMLDivElement, GridItemProps>(
  ({ className, colSpan, rowSpan, colStart, colEnd, responsive, ...props }, ref) => {
    const responsiveClasses = responsive
      ? [
          responsive.sm && `sm:col-span-${responsive.sm}`,
          responsive.md && `md:col-span-${responsive.md}`,
          responsive.lg && `lg:col-span-${responsive.lg}`,
          responsive.xl && `xl:col-span-${responsive.xl}`,
          responsive['2xl'] && `2xl:col-span-${responsive['2xl']}`,
        ].filter(Boolean).join(' ')
      : '';

    return (
      <div
        className={cn(
          gridItemVariants({ colSpan, rowSpan, colStart, colEnd }),
          responsiveClasses,
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

GridItem.displayName = 'GridItem';

// Flex Component for Layout
const flexVariants = cva('flex', {
  variants: {
    direction: {
      row: 'flex-row',
      'row-reverse': 'flex-row-reverse',
      col: 'flex-col',
      'col-reverse': 'flex-col-reverse',
    },
    wrap: {
      nowrap: 'flex-nowrap',
      wrap: 'flex-wrap',
      'wrap-reverse': 'flex-wrap-reverse',
    },
    justify: {
      start: 'justify-start',
      end: 'justify-end',
      center: 'justify-center',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    },
    align: {
      start: 'items-start',
      end: 'items-end',
      center: 'items-center',
      baseline: 'items-baseline',
      stretch: 'items-stretch',
    },
    gap: {
      0: 'gap-0',
      1: 'gap-1',
      2: 'gap-2',
      3: 'gap-3',
      4: 'gap-4',
      5: 'gap-5',
      6: 'gap-6',
      8: 'gap-8',
      10: 'gap-10',
      12: 'gap-12',
      16: 'gap-16',
      20: 'gap-20',
      24: 'gap-24',
    },
  },
  defaultVariants: {
    direction: 'row',
    wrap: 'nowrap',
    justify: 'start',
    align: 'start',
    gap: 0,
  },
});

export interface FlexProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof flexVariants> {}

const Flex = React.forwardRef<HTMLDivElement, FlexProps>(
  ({ className, direction, wrap, justify, align, gap, ...props }, ref) => {
    return (
      <div
        className={cn(flexVariants({ direction, wrap, justify, align, gap, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Flex.displayName = 'Flex';

export { Container, Grid, GridItem, Flex, containerVariants, gridVariants, gridItemVariants, flexVariants };