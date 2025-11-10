'use client';

import React from 'react';

interface CompactListItemProps {
  children: React.ReactNode;
  date?: string;
  badge?: {
    text: string;
    color: 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'gray';
  };
  onClick?: () => void;
}

export function CompactListItem({ children, date, badge, onClick }: CompactListItemProps) {
  const getBadgeStyles = (color: string) => {
    const styles = {
      red: 'bg-red-100 text-red-700 border-red-200',
      orange: 'bg-orange-100 text-orange-700 border-orange-200',
      yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      green: 'bg-green-100 text-green-700 border-green-200',
      blue: 'bg-blue-100 text-blue-700 border-blue-200',
      purple: 'bg-purple-100 text-purple-700 border-purple-200',
      gray: 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return styles[color as keyof typeof styles] || styles.gray;
  };

  return (
    <div
      onClick={onClick}
      className={`
        flex items-start gap-1.5 py-1 px-1 -mx-1 rounded text-xs
        border-l border-transparent hover:border-gray-400 hover:bg-gray-50
        ${onClick ? 'cursor-pointer' : ''}
        transition-all
      `}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="text-gray-800 flex-1 leading-tight">{children}</div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {badge && (
              <span className={`px-1.5 py-0.5 text-[9px] font-medium rounded border ${getBadgeStyles(badge.color)}`}>
                {badge.text}
              </span>
            )}
            {date && (
              <span className="text-[10px] text-gray-500 whitespace-nowrap">{date}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
