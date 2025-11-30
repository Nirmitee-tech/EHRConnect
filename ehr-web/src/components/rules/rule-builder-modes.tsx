'use client';

import { Wand2, List, MessageSquare } from 'lucide-react';

export type RuleBuilderMode = 'visual' | 'guided' | 'ai';

interface RuleBuilderModeSelectorProps {
  mode: RuleBuilderMode;
  onChange: (mode: RuleBuilderMode) => void;
}

export function RuleBuilderModeSelector({ mode, onChange }: RuleBuilderModeSelectorProps) {
  return (
    <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-md">
      <button
        onClick={() => onChange('visual')}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
          mode === 'visual'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <Wand2 className="h-3.5 w-3.5" />
        Visual
      </button>
      <button
        onClick={() => onChange('guided')}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
          mode === 'guided'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <List className="h-3.5 w-3.5" />
        Guided
      </button>
      <button
        onClick={() => onChange('ai')}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
          mode === 'ai'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <MessageSquare className="h-3.5 w-3.5" />
        AI Assistant
      </button>
    </div>
  );
}
