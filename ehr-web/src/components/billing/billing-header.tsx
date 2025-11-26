'use client'

import { ReactNode } from 'react'
import { Calendar, Building2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface BillingHeaderProps {
  title: string
  subtitle?: string
  children?: ReactNode
  showFilters?: boolean
  dateRange?: string
  location?: string
  onDateRangeChange?: (value: string) => void
  onLocationChange?: (value: string) => void
}

export function BillingHeader({
  title,
  subtitle,
  children,
  showFilters = true,
  dateRange = '30d',
  location = 'all',
  onDateRangeChange,
  onLocationChange
}: BillingHeaderProps) {
  return (
    <div className="sticky top-0 z-50 bg-[#0F1E56] text-white shadow-lg">
      <div className="px-6 py-3">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-lg font-semibold">{title}</h1>
            {subtitle && (
              <p className="text-xs text-blue-200 mt-0.5">{subtitle}</p>
            )}
          </div>

          <div className="flex items-center gap-6">
            {showFilters && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-300" />
                  <Select value={dateRange} onValueChange={onDateRangeChange}>
                    <SelectTrigger className="w-[140px] h-8 bg-white/10 border-white/20 text-white text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Last 7 Days</SelectItem>
                      <SelectItem value="30d">Last 30 Days</SelectItem>
                      <SelectItem value="90d">Last 90 Days</SelectItem>
                      <SelectItem value="ytd">Year to Date</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-300" />
                  <Select value={location} onValueChange={onLocationChange}>
                    <SelectTrigger className="w-[140px] h-8 bg-white/10 border-white/20 text-white text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      <SelectItem value="main">Main Campus</SelectItem>
                      <SelectItem value="north">North Clinic</SelectItem>
                      <SelectItem value="south">South Clinic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {children}

            <div className="text-right border-l border-white/20 pl-6">
              <div className="text-xs text-blue-200 uppercase tracking-wider">System Status</div>
              <div className="flex items-center gap-1.5 text-white text-xs font-medium mt-0.5">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                All Systems Operational
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
