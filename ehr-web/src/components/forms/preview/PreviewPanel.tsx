/**
 * PreviewPanel Component - Phase 3: Responsive Preview System
 *
 * Main container for preview system:
 * - Collapsible side panel
 * - Integrates toolbar, viewport, and test panel
 * - Isolated preview context
 * - 50% width with 400px minimum
 */

'use client';

import { useState } from 'react';
import { PreviewToolbar } from './PreviewToolbar';
import { PreviewViewport } from './PreviewViewport';
import { TestModePanel } from './TestModePanel';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuestionnaireItem {
  linkId: string;
  text?: string;
  type: string;
  required?: boolean;
  item?: QuestionnaireItem[];
  [key: string]: any;
}

interface PreviewPanelProps {
  title: string;
  description?: string;
  questions: QuestionnaireItem[];
}

export function PreviewPanel({ title, description, questions }: PreviewPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Collapsed view (vertical tab)
  if (isCollapsed) {
    return (
      <div className="border-l bg-background flex flex-col">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(false)}
          className="h-full px-2 py-4 rounded-none hover:bg-muted"
          title="Show Preview"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div
          className="flex-1 flex items-center justify-center text-xs font-medium text-muted-foreground"
          style={{ writingMode: 'vertical-rl' }}
        >
          Preview
        </div>
      </div>
    );
  }

  // Expanded view
  return (
    <div
      className="flex flex-col border-l bg-background"
      style={{
        width: '50%',
        minWidth: '400px',
        maxWidth: '800px'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-background">
        <h2 className="font-semibold text-sm">Live Preview</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(true)}
          title="Hide Preview"
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Toolbar */}
      <PreviewToolbar />

      {/* Viewport */}
      <PreviewViewport
        title={title}
        description={description}
        questions={questions}
      />

      {/* Test Mode Panel */}
      <TestModePanel questions={questions} />
    </div>
  );
}
