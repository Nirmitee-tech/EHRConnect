/**
 * PreviewToolbar Component - Phase 3: Responsive Preview System
 *
 * Toolbar with preview controls:
 * - Device selector
 * - Orientation toggle
 * - Zoom controls
 * - Test mode toggle
 * - Dimensions display
 */

'use client';

import { usePreviewStore } from '@/stores/preview-store';
import { DeviceSelector } from './DeviceSelector';
import {
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  TestTube,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export function PreviewToolbar() {
  const {
    dimensions,
    zoom,
    testMode,
    toggleOrientation,
    setZoom,
    toggleTestMode,
    resetTestData
  } = usePreviewStore();

  return (
    <div className="flex items-center justify-between p-3 border-b bg-background">
      <div className="flex items-center gap-3">
        <DeviceSelector />

        <Separator orientation="vertical" className="h-6" />

        {/* Orientation Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleOrientation}
          title="Toggle Orientation (Portrait/Landscape)"
          className="h-8 px-2"
        >
          <RotateCw className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(zoom - 10)}
            disabled={zoom <= 50}
            title="Zoom Out"
            className="h-8 w-8 p-0"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium w-14 text-center tabular-nums">
            {zoom}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(zoom + 10)}
            disabled={zoom >= 200}
            title="Zoom In"
            className="h-8 w-8 p-0"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Dimensions Display */}
        <span className="text-xs text-muted-foreground font-mono tabular-nums">
          {dimensions.width} × {dimensions.height}px
        </span>

        <Separator orientation="vertical" className="h-6" />

        {/* Test Mode Toggle */}
        <Button
          variant={testMode ? 'default' : 'outline'}
          size="sm"
          onClick={toggleTestMode}
          className="gap-2 h-8"
          title="Toggle Test Mode (Interactive Preview)"
        >
          <TestTube className="h-4 w-4" />
          <span className="text-xs">Test Mode</span>
        </Button>

        {/* Reset Test Data */}
        {testMode && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetTestData}
            title="Reset Test Data"
            className="h-8 w-8 p-0"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}

        {/* Full Screen (future enhancement) */}
        <Button
          variant="ghost"
          size="sm"
          title="Full Screen (Coming Soon)"
          className="h-8 w-8 p-0"
          disabled
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
