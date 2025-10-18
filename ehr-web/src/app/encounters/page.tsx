'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  Calendar,
  User,
  Clock,
  FileText,
  ChevronRight,
  Stethoscope,
  Activity,
  CheckCircle,
  XCircle,
  Pause,
  AlertCircle,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  X
} from 'lucide-react';
import { Encounter, EncounterStatus } from '@/types/encounter';
import { EncounterService } from '@/services/encounter.service';
import { format } from 'date-fns';

const ITEMS_PER_PAGE = 15;

export default function EncountersPage() {
  const router = useRouter();
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<EncounterStatus | 'all'>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page on search
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadEncounters = useCallback(async () => {
    try {
      setLoading(true);

      // Build filters object for backend
      const filters: any = {};

      if (selectedStatus !== 'all') {
        filters.status = selectedStatus;
      }

      if (selectedClass !== 'all') {
        filters.class = selectedClass;
      }

      // Calculate date range based on filter
      if (dateFilter !== 'all') {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (dateFilter === 'today') {
          filters.startDate = today;
          filters.endDate = new Date(today.getTime() + 24 * 60 * 60 * 1000);
        } else if (dateFilter === 'week') {
          filters.startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        } else if (dateFilter === 'month') {
          filters.startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        }
      }

      console.log('🔍 Loading encounters with filters:', filters);
      const data = await EncounterService.getAll(filters);
      console.log('📊 Loaded encounters:', data.length);
      setEncounters(data);
      setCurrentPage(1); // Reset to first page when filters change
    } catch (error) {
      console.error('Error loading encounters:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, selectedClass, dateFilter]);

  // Reload encounters when filters change
  useEffect(() => {
    loadEncounters();
  }, [loadEncounters]);

  // Client-side filtering for search only (backend filtering applied for status, class, date)
  const filteredEncounters = useMemo(() => {
    let filtered = [...encounters];

    // Search filter (client-side for better UX)
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      filtered = filtered.filter(enc =>
        enc.patientName.toLowerCase().includes(query) ||
        enc.practitionerName.toLowerCase().includes(query) ||
        enc.chiefComplaint?.toLowerCase().includes(query) ||
        enc.reasonDisplay?.toLowerCase().includes(query) ||
        enc.id.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [encounters, debouncedSearch]);

  // Pagination
  const totalPages = Math.ceil(filteredEncounters.length / ITEMS_PER_PAGE);
  const paginatedEncounters = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredEncounters.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredEncounters, currentPage]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const getStatusBadge = (status: EncounterStatus) => {
    const statusConfig = {
      'planned': { color: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Planned' },
      'in-progress': { color: 'bg-green-50 text-green-700 border-green-200', label: 'Active' },
      'on-hold': { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', label: 'On Hold' },
      'completed': { color: 'bg-gray-50 text-gray-600 border-gray-200', label: 'Completed' },
      'cancelled': { color: 'bg-red-50 text-red-600 border-red-200', label: 'Cancelled' },
      'entered-in-error': { color: 'bg-red-50 text-red-600 border-red-200', label: 'Error' }
    };

    const config = statusConfig[status];

    return (
      <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold border ${config.color} uppercase tracking-wide`}>
        {config.label}
      </span>
    );
  };

  const getClassBadge = (encounterClass: string) => {
    const classConfig: Record<string, { color: string; label: string }> = {
      'ambulatory': { color: 'bg-purple-50 text-purple-700', label: 'Walk-in' },
      'emergency': { color: 'bg-red-50 text-red-700', label: 'Emergency' },
      'inpatient': { color: 'bg-blue-50 text-blue-700', label: 'Inpatient' },
      'outpatient': { color: 'bg-teal-50 text-teal-700', label: 'Outpatient' },
      'virtual': { color: 'bg-indigo-50 text-indigo-700', label: 'Virtual' }
    };
    const config = classConfig[encounterClass] || { color: 'bg-gray-50 text-gray-700', label: encounterClass };
    return (
      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDateTime = (date: Date | string) => {
    const d = new Date(date);
    return format(d, 'MMM dd, yyyy • h:mm a');
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return format(d, 'MMM dd, yyyy');
  };

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    return format(d, 'h:mm a');
  };

  const handleEncounterClick = (encounterId: string) => {
    router.push(`/encounters/${encounterId}`);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedStatus('all');
    setSelectedClass('all');
    setDateFilter('all');
    setCurrentPage(1);
  };

  // Stats calculation
  const stats = useMemo(() => ({
    total: encounters.length,
    inProgress: encounters.filter(e => e.status === 'in-progress').length,
    completed: encounters.filter(e => e.status === 'completed').length,
    planned: encounters.filter(e => e.status === 'planned').length
  }), [encounters]);

  const hasActiveFilters = selectedStatus !== 'all' || selectedClass !== 'all' || dateFilter !== 'all' || debouncedSearch;

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Compact Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">Encounters</h1>
              {hasActiveFilters && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-semibold rounded-full">
                  FILTERED
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {hasActiveFilters
                ? `Showing ${filteredEncounters.length} filtered encounter${filteredEncounters.length !== 1 ? 's' : ''}`
                : 'Manage and track all clinical encounters'}
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg">
              <div className="text-xl font-bold text-blue-700">{stats.total}</div>
              <div className="text-[10px] text-blue-600 uppercase font-semibold">Total</div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg">
              <Activity className="h-4 w-4 text-green-600" />
              <div className="text-xl font-bold text-green-700">{stats.inProgress}</div>
              <div className="text-[10px] text-green-600 uppercase font-semibold">Active</div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search encounters by patient, practitioner, or complaint..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg border transition-all ${
              showFilters || hasActiveFilters
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-4 w-4" />
            <span className="font-medium">Filters</span>
            {hasActiveFilters && !showFilters && (
              <span className="w-2 h-2 bg-white rounded-full"></span>
            )}
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Compact Filters Panel */}
      {showFilters && (
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex-shrink-0">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value as EncounterStatus | 'all');
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                <option value="all">All Statuses</option>
                <option value="planned">Planned</option>
                <option value="in-progress">In Progress</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Type</label>
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                <option value="all">All Types</option>
                <option value="ambulatory">Walk-in</option>
                <option value="emergency">Emergency</option>
                <option value="inpatient">Inpatient</option>
                <option value="outpatient">Outpatient</option>
                <option value="virtual">Virtual</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Date Range</label>
              <select
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Encounters List */}
      <div className="flex-1 overflow-auto relative">
        {loading && encounters.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-sm text-gray-600">Loading encounters...</p>
            </div>
          </div>
        ) : filteredEncounters.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <Stethoscope className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No encounters found</h3>
              <p className="text-sm text-gray-500 mb-4">
                {hasActiveFilters
                  ? 'Try adjusting your search or filters to find what you\'re looking for.'
                  : 'No encounters have been created yet. They will appear here once appointments are started.'}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-6 relative">
            {/* Loading Overlay */}
            {loading && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-50">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-xs text-gray-600 font-medium">Applying filters...</p>
                </div>
              </div>
            )}

            {/* Results Info */}
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs text-gray-600">
                Showing <span className="font-semibold">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> to{' '}
                <span className="font-semibold">{Math.min(currentPage * ITEMS_PER_PAGE, filteredEncounters.length)}</span> of{' '}
                <span className="font-semibold">{filteredEncounters.length}</span> encounters
              </p>
            </div>

            {/* Compact Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                      Practitioner
                    </th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                      Chief Complaint
                    </th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-2.5 text-right text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedEncounters.map((encounter) => (
                    <tr
                      key={encounter.id}
                      onClick={() => handleEncounterClick(encounter.id)}
                      className="hover:bg-blue-50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-gray-900 truncate">
                              {encounter.patientName}
                            </div>
                            <div className="text-[10px] text-gray-500 truncate">
                              ID: {encounter.patientId.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Stethoscope className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span className="text-sm text-gray-700 truncate">
                            {encounter.practitionerName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <div className="text-xs">
                            <div className="text-gray-900 font-medium">{formatDate(encounter.startTime)}</div>
                            <div className="text-gray-500">{formatTime(encounter.startTime)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <div className="text-sm text-gray-700 truncate">
                          {encounter.chiefComplaint || encounter.reasonDisplay || '—'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {getClassBadge(encounter.class)}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(encounter.status)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEncounterClick(encounter.id);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          View
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-xs text-gray-600">
                  Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="First page"
                  >
                    <ChevronsLeft className="h-4 w-4 text-gray-600" />
                  </button>

                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4 text-gray-600" />
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`min-w-[32px] px-2 py-1.5 text-sm font-medium rounded transition-colors ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Next page"
                  >
                    <ChevronRight className="h-4 w-4 text-gray-600" />
                  </button>

                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Last page"
                  >
                    <ChevronsRight className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
