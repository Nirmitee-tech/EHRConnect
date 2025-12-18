'use client';

import React from 'react';
import { FileText, Printer, Download, Share2, Plus } from 'lucide-react';

interface QuickActionBarProps {
  onAddNote?: () => void;
  onOrderTest?: () => void;
  onPrint?: () => void;
  onExport?: () => void;
  onShare?: () => void;
}

export function QuickActionBar({
  onAddNote,
  onOrderTest,
  onPrint,
  onExport,
  onShare
}: QuickActionBarProps) {
  const ActionButton = ({
    icon: Icon,
    label,
    onClick,
    color = 'blue'
  }: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    onClick?: () => void;
    color?: 'blue' | 'green' | 'gray';
  }) => {
    const colorStyles = {
      blue: 'bg-primary hover:opacity-90 text-primary-foreground',
      green: 'bg-theme-accent hover:opacity-90 text-white',
      gray: 'bg-gray-100 hover:bg-gray-200 text-gray-700'
    };

    return (
      <button
        onClick={onClick}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
          transition-all shadow-sm hover:shadow
          ${colorStyles[color]}
        `}
      >
        <Icon className="h-4 w-4" />
        {label}
      </button>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-700">Quick Actions:</span>
          {onAddNote && <ActionButton icon={Plus} label="Add Note" onClick={onAddNote} color="green" />}
          {onOrderTest && <ActionButton icon={FileText} label="Order Test" onClick={onOrderTest} color="blue" />}
        </div>
        <div className="flex items-center gap-2">
          {onPrint && <ActionButton icon={Printer} label="Print" onClick={onPrint} color="gray" />}
          {onExport && <ActionButton icon={Download} label="Export" onClick={onExport} color="gray" />}
          {onShare && <ActionButton icon={Share2} label="Share" onClick={onShare} color="gray" />}
        </div>
      </div>
    </div>
  );
}
