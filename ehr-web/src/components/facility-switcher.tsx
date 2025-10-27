'use client';

import React from 'react';
import { Building2 } from 'lucide-react';
import { useFacility } from '@/contexts/facility-context';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function FacilitySwitcher() {
  const { currentFacility, facilities, loading, setCurrentFacility } = useFacility();

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <Building2 className="h-4 w-4" />
        <span className="text-sm text-muted-foreground">Loading facilities...</span>
      </div>
    );
  }

  if (facilities.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <Building2 className="h-4 w-4" />
        <span className="text-sm text-muted-foreground">No facilities available</span>
      </div>
    );
  }

  if (facilities.length === 1) {
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <Building2 className="h-4 w-4" />
        <span className="text-sm font-medium">{currentFacility?.name}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Building2 className="h-4 w-4" />
      <Select
        value={currentFacility?.id || ''}
        onValueChange={(value) => {
          const facility = facilities.find(f => f.id === value);
          setCurrentFacility(facility || null);
        }}
      >
        <SelectTrigger className="w-[200px] border-none shadow-none">
          <SelectValue placeholder="Select facility">
            {currentFacility?.name}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {facilities.map((facility) => (
            <SelectItem key={facility.id} value={facility.id}>
              <div className="flex flex-col">
                <span className="font-medium">{facility.name}</span>
                {facility.type && (
                  <span className="text-xs text-muted-foreground capitalize">
                    {facility.type}
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
