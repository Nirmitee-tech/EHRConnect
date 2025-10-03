'use client';

import React, { useState, useEffect } from 'react';
import { User, Users, Filter, Grid, List, MoreVertical, Plus, Search, Phone, Mail, Calendar, MapPin, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFacility } from '@/contexts/facility-context';
import { PatientDrawer } from '@/components/patients/patient-drawer';
import { useTabNavigation } from '@/hooks/use-tab-navigation';

interface PatientData {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  registered: string;
  lastVisit: string;
  gender: string;
  birthDate: string;
  active: boolean;
  resourceType: string;
}

export default function PatientsPage() {
  const { currentFacility } = useFacility();
  const { openPatientTab } = useTabNavigation();
  const [activeTab, setActiveTab] = useState<'active' | 'inactive'>('active');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Load patients from FHIR API
  const loadPatients = async (search: string = '') => {
    setLoading(true);
    setError(null);
    
    try {
      let url = '/api/fhir/Patient?_count=50';
      if (search) {
        url += `&name=${encodeURIComponent(search)}`;
      }
      if (activeTab === 'active') {
        url += '&active=true';
      } else {
        url += '&active=false';
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch patients');
      }

      const bundle = await response.json();
      setTotalCount(bundle.total || 0);

      const patientData: PatientData[] = (bundle.entry || []).map((entry: any) => {
        const resource = entry.resource;
        const name = resource.name?.[0];
        const telecom = resource.telecom || [];
        const address = resource.address?.[0];
        
        return {
          id: resource.id,
          name: name ? `${(name.given || []).join(' ')} ${name.family || ''}`.trim() : 'Unknown',
          phone: telecom.find((t: any) => t.system === 'phone')?.value || '',
          email: telecom.find((t: any) => t.system === 'email')?.value || '',
          address: address ? `${address.line?.[0] || ''} ${address.city || ''} ${address.state || ''}`.trim() : '',
          registered: resource.meta?.lastUpdated ? new Date(resource.meta.lastUpdated).toLocaleDateString() : '',
          lastVisit: resource.meta?.lastUpdated ? new Date(resource.meta.lastUpdated).toLocaleDateString() : '',
          gender: resource.gender || 'unknown',
          birthDate: resource.birthDate || '',
          active: resource.active !== false,
          resourceType: resource.resourceType
        };
      });

      setPatients(patientData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load patients');
      setPatients([]);
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  // Search handler with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== '') {
        setSearching(true);
      }
      loadPatients(searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, activeTab]);

  // Initial load
  useEffect(() => {
    loadPatients();
  }, [activeTab]);

  const getAge = (birthDate: string) => {
    if (!birthDate) return '';
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }
    return age;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-sm text-gray-600 mt-0.5">
            {currentFacility?.name ? `Managing patients for ${currentFacility.name}` : 'Manage patient records and information'}
          </p>
        </div>
        <Button
          onClick={() => setIsDrawerOpen(true)}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Patient
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search patients by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-9"
              />
              {searching && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Tab Navigation */}
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setActiveTab('active')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeTab === 'active'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setActiveTab('inactive')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeTab === 'inactive'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Inactive
              </button>
            </div>

            {/* View Toggle */}
            <div className="flex border border-gray-200 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${
                  viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Grid className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors ${
                  viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>

            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5" />
              <span>Filters</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-bold text-gray-900">{totalCount}</div>
              <div className="text-xs text-gray-600">Total Patients</div>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-bold text-gray-900">
                {patients.filter(p => p.active).length}
              </div>
              <div className="text-xs text-gray-600">Active</div>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <User className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-bold text-gray-900">
                {patients.filter(p => !p.active).length}
              </div>
              <div className="text-xs text-gray-600">Inactive</div>
            </div>
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <User className="h-5 w-5 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-bold text-gray-900">
                {patients.filter(p => new Date(p.registered).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000).length}
              </div>
              <div className="text-xs text-gray-600">New This Month</div>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error loading patients</h3>
              <p className="text-xs text-red-600 mt-0.5">{error}</p>
            </div>
          </div>
          <Button 
            onClick={() => loadPatients(searchQuery)} 
            className="mt-3" 
            variant="outline"
            size="sm"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
            <span className="text-sm text-gray-600">Loading patients...</span>
          </div>
        </div>
      )}

      {/* Patient List/Grid */}
      {!loading && !error && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {patients.length === 0 ? (
            <div className="p-8 text-center">
              <User className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-900 mb-1">No patients found</h3>
              <p className="text-sm text-gray-600 mb-4">
                {searchQuery ? 'No patients match your search criteria.' : 'Get started by adding your first patient.'}
              </p>
              <Button onClick={() => setIsDrawerOpen(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add First Patient
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                      Demographics
                    </th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                      Registration
                    </th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                      Last Visit
                    </th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {patients.map((patient, index) => (
                    <tr 
                      key={patient.id} 
                      onClick={() => openPatientTab(patient.id, patient.name)}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      style={{
                        animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both`
                      }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-semibold">
                            {patient.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {patient.name}
                            </div>
                            <div className="text-[10px] text-gray-500">ID: {patient.id.substring(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-0.5">
                          {patient.phone && (
                            <div className="flex items-center space-x-1.5 text-xs text-gray-700">
                              <Phone className="h-3 w-3 text-gray-400" />
                              <span>{patient.phone}</span>
                            </div>
                          )}
                          {patient.email && (
                            <div className="flex items-center space-x-1.5 text-xs text-blue-600 hover:text-blue-800">
                              <Mail className="h-3 w-3 text-gray-400" />
                              <a href={`mailto:${patient.email}`}>{patient.email}</a>
                            </div>
                          )}
                          {patient.address && (
                            <div className="flex items-center space-x-1.5 text-xs text-gray-600">
                              <MapPin className="h-3 w-3 text-gray-400" />
                              <span className="truncate max-w-32">{patient.address}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center">
                            <span className={`inline-flex px-2 py-0.5 text-[10px] font-medium rounded-md capitalize ${
                              patient.gender === 'male' ? 'bg-[#E0EFFF] text-[#2563EB]' :
                              patient.gender === 'female' ? 'bg-pink-100 text-pink-800' :
                              'bg-[#F3F4F6] text-[#4B5563]'
                            }`}>
                              {patient.gender}
                            </span>
                          </div>
                          {patient.birthDate && (
                            <div className="text-xs text-gray-600">
                              Age: {getAge(patient.birthDate)} yrs
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-1.5 text-xs text-gray-700">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span>{formatDate(patient.registered)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-1.5 text-xs text-gray-700">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span>{formatDate(patient.lastVisit)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-md ${
                          patient.active 
                            ? 'bg-[#E8F5E8] text-[#047857]' 
                            : 'bg-[#F3F4F6] text-[#4B5563]'
                        }`}>
                          {patient.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            openPatientTab(patient.id, patient.name);
                          }}
                          variant="ghost"
                          size="sm"
                          className="hover:bg-gray-100 h-7 w-7 p-0"
                        >
                          <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Patient Drawer */}
      <PatientDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        onSuccess={() => {
          loadPatients(searchQuery);
        }}
      />
    </div>
  );
}
