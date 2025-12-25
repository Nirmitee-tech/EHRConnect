'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Plus, Search, MapPin, Building,
  Layers, Home, Bed, ChevronRight, Activity,
  Trash2, Edit3, MoreVertical, ShieldAlert
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/i18n/client';
import { cn } from '@/lib/utils';

interface LocationNode {
  id: string;
  name: string;
  type: 'Campus' | 'Building' | 'Ward' | 'Room' | 'Bed';
  status?: 'Occupied' | 'Available' | 'Maintenance';
  children?: LocationNode[];
}

export default function LocationsPage() {
  const { t } = useTranslation('common');
  const [searchQuery, setSearchQuery] = useState('');

  const [locations] = useState<LocationNode[]>([
    {
      id: 'c1',
      name: 'Main Campus',
      type: 'Campus',
      children: [
        {
          id: 'b1',
          name: 'Specialized Surgical Center',
          type: 'Building',
          children: [
            {
              id: 'w1',
              name: 'Intensive Care Unit (ICU)',
              type: 'Ward',
              children: [
                { id: 'r1', name: 'Room 101', type: 'Room' },
                { id: 'r2', name: 'Room 102', type: 'Room' }
              ]
            }
          ]
        }
      ]
    }
  ]);

  return (
    <div className="max-w-[1500px] mx-auto p-6 space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/settings"
            className="p-2.5 hover:bg-accent rounded-xl transition-all border border-transparent hover:border-border group"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:scale-110 transition-transform" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-3">
              {t('settings_registry.locations.title')}
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
            </h1>
            <p className="text-sm text-muted-foreground font-medium mt-1">{t('settings_registry.locations.subtitle')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 text-[10px] font-bold uppercase border-border h-10 px-6 tracking-widest">
            <Activity className="h-4 w-4" />
            {t('settings_registry.locations.bed_registry')}
          </Button>
          <Button className="gap-2 bg-primary hover:bg-primary/90 text-[10px] font-bold uppercase h-10 px-6 tracking-widest shadow-lg shadow-primary/20 transition-all hover:translate-y-[-1px]">
            <Plus className="h-4 w-4" />
            {t('settings_registry.locations.add_location')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Hierarchy Tree */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-card rounded-2xl border border-border shadow-xl overflow-hidden">
            <div className="p-5 bg-muted/30 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Hierarchy Explorer</h2>
              </div>
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Search location..."
                  className="pl-10 h-10 text-xs w-[280px] bg-background border-border focus:ring-2 focus:ring-primary/20 rounded-xl transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="p-6">
              {locations.map(node => (
                <LocationTreeItem key={node.id} node={node} level={0} />
              ))}
            </div>
          </div>

          <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex gap-5 shadow-lg relative overflow-hidden group/card shadow-amber-500/5 cursor-default">
            <div className="p-3 bg-amber-500/20 rounded-xl text-amber-600 dark:text-amber-400 shadow-inner h-fit">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div className="space-y-1 relative z-10">
              <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-[0.2em]">Maintenance Required</h4>
              <p className="text-[11px] text-amber-800/70 dark:text-amber-300/60 leading-relaxed font-medium">
                4 beds in Ward C-2 are currently marked for maintenance. Admissions to this area are restricted until sanitization is complete.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Quick Stats & Filters */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-card rounded-2xl border border-border shadow-xl p-6 space-y-6">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground font-mono flex items-center gap-2">
              <Activity className="h-3.5 w-3.5 text-primary" />
              Occupancy Dashboard
            </h2>

            <div className="space-y-6">
              <CapacityStat label="General Ward" occupied={42} total={50} color="green" />
              <CapacityStat label="ICU / CCU" occupied={8} total={10} color="red" />
              <CapacityStat label="Isolation Units" occupied={2} total={5} color="blue" />
            </div>
          </div>

          <div className="bg-indigo-950 rounded-2xl p-6 text-white shadow-2xl relative overflow-hidden group/link border border-indigo-400/20">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/link:scale-150 transition-transform duration-1000">
              <Home className="h-24 w-24 text-white" />
            </div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4 text-indigo-300">Quick Assignment</h4>
            <p className="text-[11px] text-indigo-100/60 mb-6 leading-relaxed">Assign admitted patients to available beds directly from the dashboard.</p>
            <Button className="w-full bg-white text-indigo-600 hover:bg-white/90 text-[10px] font-bold uppercase h-11 rounded-xl shadow-xl transition-all active:scale-95 tracking-widest">
              Assign Bed
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LocationTreeItem({ node, level }: { node: LocationNode, level: number }) {
  const [isOpen, setIsOpen] = useState(level < 2);

  const Icon = {
    Campus: MapPin,
    Building: Building,
    Ward: Layers,
    Room: Home,
    Bed: Bed
  }[node.type];

  return (
    <div className="space-y-1">
      <div
        className={cn(
          "flex items-center justify-between p-3 rounded-xl transition-all group cursor-pointer border border-transparent",
          level === 0 ? "bg-primary/5 hover:bg-primary/10 border-primary/10" : "hover:bg-muted/50"
        )}
        style={{ marginLeft: `${level * 24}px` }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
            level === 0 ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
          )}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <span className={cn(
              "text-sm tracking-tight",
              level === 0 ? "font-bold text-foreground" : "font-semibold text-muted-foreground group-hover:text-foreground"
            )}>{node.name}</span>
            <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">{node.type}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
            <Edit3 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          {node.children && (
            <ChevronRight className={cn("h-4 w-4 text-muted-foreground transition-transform ml-2", isOpen && "rotate-90")} />
          )}
        </div>
      </div>

      {isOpen && node.children && (
        <div className="space-y-1 animate-in fade-in slide-in-from-left-2 duration-300">
          {node.children.map(child => (
            <LocationTreeItem key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function CapacityStat({ label, occupied, total, color }: { label: string, occupied: number, total: number, color: 'green' | 'red' | 'blue' }) {
  const percentage = (occupied / total) * 100;
  const colors = {
    green: "bg-green-500",
    red: "bg-red-500",
    blue: "bg-blue-500"
  };

  return (
    <div className="space-y-2 group">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest group-hover:text-foreground transition-colors">{label}</span>
        <span className="text-[10px] font-mono font-bold">{occupied}/{total} Beds</span>
      </div>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden shadow-inner">
        <div
          className={cn("h-full transition-all duration-1000", colors[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
