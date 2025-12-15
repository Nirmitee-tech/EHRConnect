/**
 * DeviceSelector Component - Phase 3: Responsive Preview System
 *
 * Allows switching between device viewport presets:
 * - Mobile (375x667)
 * - Tablet (768x1024)
 * - Desktop (1920x1080)
 */

'use client';

import { usePreviewStore } from '@/stores/preview-store';
import { Monitor, Tablet, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function DeviceSelector() {
  const { device, setDevice } = usePreviewStore();

  const devices = [
    { id: 'mobile' as const, icon: Smartphone, label: 'Mobile', size: '375px' },
    { id: 'tablet' as const, icon: Tablet, label: 'Tablet', size: '768px' },
    { id: 'desktop' as const, icon: Monitor, label: 'Desktop', size: '1920px' }
  ];

  return (
    <div className="flex gap-1 border rounded-lg p-1 bg-background">
      {devices.map(({ id, icon: Icon, label, size }) => (
        <Button
          key={id}
          variant={device === id ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setDevice(id)}
          className={cn(
            'gap-2 h-8 px-3',
            device === id && 'shadow-sm'
          )}
          title={`${label} (${size})`}
        >
          <Icon className="h-4 w-4" />
          <span className="hidden sm:inline text-xs">{label}</span>
        </Button>
      ))}
    </div>
  );
}
