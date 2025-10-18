'use client';

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LucideIcon, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTabs } from '@/contexts/tab-context';

interface NavItemChild {
  name: string;
  href: string;
  icon: LucideIcon;
}

interface NavItemProps {
  name: string;
  href: string;
  icon: LucideIcon;
  isActive: boolean;
  isCollapsed: boolean;
  count?: number;
  badge?: string;
  children?: NavItemChild[];
}

export function NavItem({
  name,
  href,
  icon: Icon,
  isActive,
  isCollapsed,
  count,
  badge,
  children
}: NavItemProps) {
  const { addTab } = useTabs();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClick = () => {
    if (children && children.length > 0) {
      // Toggle expand/collapse if has children
      setIsExpanded(!isExpanded);
    } else {
      addTab({
        title: name,
        path: href,
        icon: <Icon className="h-4 w-4" />,
      });
    }
  };

  const handleChildClick = (child: NavItemChild) => {
    addTab({
      title: child.name,
      path: child.href,
      icon: <child.icon className="h-4 w-4" />,
    });
  };

  // If has children, render as expandable button
  if (children && children.length > 0 && !isCollapsed) {
    return (
      <div>
        <button
          onClick={handleClick}
          className={cn(
            'flex items-center pl-3 pr-3 py-2.5 text-sm rounded-lg transition-all duration-200 group relative w-full',
            isActive
              ? 'text-white font-semibold bg-[#3342A5]'
              : 'text-[#B0B7D0] font-medium hover:text-white hover:bg-[#1E2A70]'
          )}
        >
          <div className="relative flex items-center gap-3 w-full">
            <Icon
              className={cn(
                'flex-shrink-0 transition-all duration-200 h-5 w-5',
                isActive
                  ? 'text-white'
                  : 'text-[#B0B7D0] group-hover:text-white'
              )}
            />
            <span className="flex-1 transition-colors duration-200">
              {name}
            </span>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 transition-transform" />
            ) : (
              <ChevronRight className="h-4 w-4 transition-transform" />
            )}
          </div>
        </button>

        {/* Children */}
        {isExpanded && (
          <div className="ml-8 mt-1 space-y-0.5">
            {children.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                onClick={() => handleChildClick(child)}
                className={cn(
                  'flex items-center pl-3 pr-3 py-2 text-xs rounded-lg transition-all duration-200 group relative w-full',
                  'text-[#B0B7D0] font-medium hover:text-white hover:bg-[#1E2A70]'
                )}
              >
                <child.icon className="h-4 w-4 mr-2 text-[#B0B7D0] group-hover:text-white" />
                <span className="transition-colors duration-200">{child.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Regular nav item without children
  return (
    <Link
      href={href}
      onClick={handleClick}
      className={cn(
        'flex items-center pl-3 pr-3 py-2.5 text-sm rounded-lg transition-all duration-200 group relative w-full',
        isActive
          ? 'text-white font-semibold bg-[#3342A5]'
          : 'text-[#B0B7D0] font-medium hover:text-white hover:bg-[#1E2A70]'
      )}
      title={isCollapsed ? name : undefined}
    >

      <div className={cn(
        'relative flex items-center gap-3',
        isCollapsed ? 'justify-center w-full' : 'w-full'
      )}>
        <Icon
          className={cn(
            'flex-shrink-0 transition-all duration-200 h-5 w-5',
            isActive
              ? 'text-white'
              : 'text-[#B0B7D0] group-hover:text-white'
          )}
        />

        {!isCollapsed && (
          <>
            <span className="flex-1 transition-colors duration-200">
              {name}
            </span>
            {(count !== undefined && count > 0) && (
              <span className={cn(
                'text-xs px-2 py-0.5 rounded-full font-medium',
                isActive
                  ? 'bg-white/20 text-white'
                  : 'bg-[#1E2A70] text-[#B0B7D0]'
              )}>
                {count}
              </span>
            )}
            {badge && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-[#FF6B6B] text-white">
                {badge}
              </span>
            )}
          </>
        )}
      </div>

      {/* Tooltip for collapsed state */}
      {isCollapsed && (
        <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
          <span className="font-medium">{name}</span>
          {count !== undefined && count > 0 && (
            <span className="ml-2 px-1.5 py-0.5 bg-gray-800 rounded text-xs">{count}</span>
          )}
          <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1 border-4 border-transparent border-r-gray-900" />
        </div>
      )}
    </Link>
  );
}
