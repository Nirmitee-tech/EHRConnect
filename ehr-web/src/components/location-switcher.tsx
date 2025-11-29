'use client';

import React, { useState } from 'react';
import { MapPin, RefreshCw } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLocation } from '@/contexts/location-context';

export function LocationSwitcher() {
  const { locations, currentLocation, loading, setCurrentLocation, refreshLocations } = useLocation();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshLocations();
    setTimeout(() => setRefreshing(false), 500); // Small delay for better UX
  };

  if (loading && !refreshing) {
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Loading locations...</span>
      </div>
    );
  }

  if (!locations || locations.length === 0) {
    return (
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">No locations</span>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-1 hover:bg-accent rounded transition-colors disabled:opacity-50"
          title="Refresh locations"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-muted-foreground ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>
    );
  }

  if (locations.length === 1) {
    return (
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">{locations[0].name}</span>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-1 hover:bg-accent rounded transition-colors disabled:opacity-50"
          title="Refresh locations"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-muted-foreground ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-2 px-3 py-2">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
        <Select
          value={currentLocation?.id || ''}
          onValueChange={(value) => {
            const location = locations.find(loc => loc.id === value) || null;
            setCurrentLocation(location);
          }}
        >
          <SelectTrigger className="w-full border-none shadow-none h-8 px-2">
            <SelectValue placeholder="Select location">
              <span className="truncate">{currentLocation?.name}</span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {locations.map((location) => (
              <SelectItem key={location.id} value={location.id}>
                {location.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <button
        onClick={handleRefresh}
        disabled={refreshing}
        className="p-1 hover:bg-accent rounded transition-colors disabled:opacity-50 flex-shrink-0"
        title="Refresh locations"
      >
        <RefreshCw className={`h-3.5 w-3.5 text-muted-foreground ${refreshing ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
}
