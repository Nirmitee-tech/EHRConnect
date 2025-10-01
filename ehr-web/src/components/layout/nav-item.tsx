'use client';

import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItemProps {
  name: string;
  href: string;
  icon: LucideIcon;
  isActive: boolean;
  isCollapsed: boolean;
  count?: number;
  badge?: string;
}

export function NavItem({ 
  name, 
  href, 
  icon: Icon, 
  isActive, 
  isCollapsed, 
  count, 
  badge 
}: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center px-2.5 py-2 text-sm font-medium rounded-lg transition-all duration-200 group relative',
        isActive
          ? 'bg-primary text-white'
          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
      )}
      title={isCollapsed ? name : undefined}
    >
      
      <div className={cn(
        'relative flex items-center',
        isCollapsed ? 'justify-center w-full' : 'w-full'
      )}>
        <div className={cn(
          'flex items-center justify-center rounded-lg transition-all duration-200',
          isActive 
            ? 'bg-white/20 w-7 h-7' 
            : 'w-7 h-7',
          isCollapsed ? '' : 'mr-2'
        )}>
          <Icon 
            className={cn(
              'flex-shrink-0 transition-all duration-200',
              isCollapsed ? 'h-5 w-5' : 'h-5 w-5',
              isActive 
                ? 'text-white' 
                : 'text-gray-500 group-hover:text-primary group-hover:scale-110'
            )} 
          />
        </div>
        
        {!isCollapsed && (
          <>
            <span className="flex-1 relative z-10 font-semibold">{name}</span>
            {(count !== undefined && count > 0) && (
              <span className={cn(
                'text-xs px-2 py-0.5 rounded-full font-semibold transition-all duration-200 relative z-10',
                isActive 
                  ? 'bg-white/25 text-white' 
                  : 'bg-[#E0EFFF] text-[#2563EB]'
              )}>
                {count}
              </span>
            )}
            {badge && (
              <span className={cn(
                'text-xs px-2 py-0.5 rounded-full font-semibold transition-all duration-200 relative z-10',
                isActive 
                  ? 'bg-white/25 text-white' 
                  : 'bg-blue-100 text-blue-700'
              )}>
                {badge}
              </span>
            )}
          </>
        )}
      </div>
      
      {/* Tooltip for collapsed state */}
      {isCollapsed && (
        <div className="absolute left-full ml-3 px-4 py-2 bg-gray-900 text-white text-sm rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-2xl">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{name}</span>
            {count !== undefined && (
              <span className="px-2 py-0.5 bg-primary rounded-full text-xs font-bold">{count}</span>
            )}
          </div>
          <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1.5 border-[6px] border-transparent border-r-gray-900" />
        </div>
      )}
    </Link>
  );
}
