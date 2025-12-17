'use client';

import React from 'react';
import { useTheme } from '@/contexts/theme-context';
import { Button as DesignSystemButton, buttonVariants } from '@nirmitee.io/design-system';
import { cn } from '@/lib/utils';

interface ThemedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'default';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children: React.ReactNode;
}

export function ThemedButton({ 
  variant = 'default', 
  size = 'default',
  className,
  children,
  ...props 
}: ThemedButtonProps) {
  const { themeSettings } = useTheme();

  const getThemeColor = () => {
    switch (variant) {
      case 'primary':
        return themeSettings.primaryColor;
      case 'secondary':
        return themeSettings.secondaryColor;
      case 'accent':
        return themeSettings.accentColor;
      default:
        return undefined;
    }
  };

  const themeColor = getThemeColor();

  if (variant === 'default') {
    return (
      <DesignSystemButton size={size} className={className} {...props}>
        {children}
      </DesignSystemButton>
    );
  }

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        size === 'default' && 'h-10 px-4 py-2',
        size === 'sm' && 'h-9 px-3',
        size === 'lg' && 'h-11 px-8',
        size === 'icon' && 'h-10 w-10',
        'text-white hover:opacity-90',
        className
      )}
      style={{ 
        backgroundColor: themeColor,
        borderColor: themeColor
      }}
      {...props}
    >
      {children}
    </button>
  );
}

interface ThemedBadgeProps {
  variant?: 'primary' | 'secondary' | 'accent';
  children: React.ReactNode;
  className?: string;
}

export function ThemedBadge({ variant = 'primary', children, className }: ThemedBadgeProps) {
  const { themeSettings } = useTheme();

  const getThemeColor = () => {
    switch (variant) {
      case 'primary':
        return themeSettings.primaryColor;
      case 'secondary':
        return themeSettings.secondaryColor;
      case 'accent':
        return themeSettings.accentColor;
      default:
        return themeSettings.primaryColor;
    }
  };

  const backgroundColor = getThemeColor();
  
  // Convert hex to rgba with 0.12 opacity for background
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const lighterBg = hexToRgba(backgroundColor, 0.12);

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
        className
      )}
      style={{ 
        backgroundColor: lighterBg,
        color: backgroundColor
      }}
    >
      {children}
    </span>
  );
}
