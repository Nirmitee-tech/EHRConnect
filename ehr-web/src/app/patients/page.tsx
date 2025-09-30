'use client';

import React, { useState, useEffect } from 'react';
import { User, Users, Filter, Grid, List, MoreVertical, Plus, Search, Phone, Mail, Calendar, MapPin, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useFacility } from '@/contexts/facility-context';

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
  const [activeTab, setActiveTab] = useState<'active' | 'inactive'>('active');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalCount, setTotalCount] = useState(0);

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-600 mt-1">
            {currentFacility?.name ? `Managing patients for ${currentFacility.name}` : 'Manage patient records and information'}
          </p>
        </div>
        <Link href="/patients/new">
          <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200">
            <Plus className="h-4 w-4 mr-2" />
            Add Patient
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search patients by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
              />
              {searching && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Tab Navigation */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('active')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === 'active'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Active Treatment
              </button>
              <button
                onClick={() => setActiveTab('inactive')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === 'inactive'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Inactive Treatment
              </button>
            </div>

            {/* View Toggle */}
            <div className="flex border border-gray-200 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 transition-colors ${
                  viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 transition-colors ${
                  viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            <Button variant="outline" className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalCount}</div>
              <div className="text-sm text-gray-600">Total Patients</div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {patients.filter(p => p.active).length}
              </div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <User className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {patients.filter(p => !p.active).length}
              </div>
              <div className="text-sm text-gray-600">Inactive</div>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <User className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {patients.filter(p => new Date(p.registered).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000).length}
              </div>
              <div className="text-sm text-gray-600">New This Month</div>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error loading patients</h3>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
          <Button 
            onClick={() => loadPatients(searchQuery)} 
            className="mt-4" 
            variant="outline"
            size="sm"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <div className="flex items-center justify-center space-x-3">
            <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
            <span className="text-gray-600">Loading patients...</span>
          </div>
        </div>
      )}

      {/* Patient List/Grid */}
      {!loading && !error && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {patients.length === 0 ? (
            <div className="p-12 text-center">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No patients found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery ? 'No patients match your search criteria.' : 'Get started by adding your first patient.'}
              </p>
              <Link href="/patients/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Patient
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Demographics
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Registration
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Last Visit
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {patients.map((patient, index) => (
                    <tr 
                      key={patient.id} 
                      className="hover:bg-gray-50 transition-colors duration-150"
                      style={{
                        animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both`
                      }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {patient.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <Link 
                              href={`/patients/${patient.id}`}
                              className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                            >
                              {patient.name}
                            </Link>
                            <div className="text-xs text-gray-500">ID: {patient.id.substring(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {patient.phone && (
                            <div className="flex items-center space-x-2 text-sm text-gray-700">
                              <Phone className="h-3 w-3 text-gray-400" />
                              <span>{patient.phone}</span>
                            </div>
                          )}
                          {patient.email && (
                            <div className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800">
                              <Mail className="h-3 w-3 text-gray-400" />
                              <a href={`mailto:${patient.email}`}>{patient.email}</a>
                            </div>
                          )}
                          {patient.address && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <MapPin className="h-3 w-3 text-gray-400" />
                              <span className="truncate max-w-32">{patient.address}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${
                              patient.gender === 'male' ? 'bg-blue-100 text-blue-800' :
                              patient.gender === 'female' ? 'bg-pink-100 text-pink-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {patient.gender}
                            </span>
                          </div>
                          {patient.birthDate && (
                            <div className="text-sm text-gray-600">
                              Age: {getAge(patient.birthDate)} years
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-700">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span>{formatDate(patient.registered)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-700">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span>{formatDate(patient.lastVisit)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          patient.active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {patient.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link href={`/patients/${patient.id}`}>
                          <Button variant="ghost" size="sm" className="hover:bg-gray-100">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
