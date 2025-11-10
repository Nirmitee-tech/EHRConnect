'use client';

import React from 'react';

interface FacesheetCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function FacesheetCard({ children, className = '', hover = false, onClick }: FacesheetCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white border border-gray-300 rounded shadow-sm p-2.5
        ${hover ? 'hover:shadow hover:border-gray-400 transition-all cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
