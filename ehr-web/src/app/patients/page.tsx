'use client';

import React, { useState, useEffect } from 'react';
import { User, Users, Filter, Grid, List, Plus, Search, Calendar, AlertCircle, Loader2, Download, Edit2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useFacility } from '@/contexts/facility-context';
import { PatientDrawer } from '@/components/patients/patient-drawer';
import { useTabNavigation } from '@/hooks/use-tab-navigation';
import { useTranslation } from '@/i18n/client';
import '@/i18n/client';

interface PatientData {
  id: string;
  name: string;
  mrn?: string;
  phone: string;
  email: string;
  address: string;
  registered: string;
  lastVisit: string;
  gender: string;
  birthDate: string;
  active: boolean;
  resourceType: string;
  photo?: string;
  primaryCareProvider?: string;
}

export default function PatientsPage() {
  const { currentFacility } = useFacility();
  const { openPatientTab } = useTabNavigation();
  const { t } = useTranslation('common');
  const [activeTab, setActiveTab] = useState<'active' | 'inactive'>('active');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editingPatient, setEditingPatient] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [skipEncounterFlow, setSkipEncounterFlow] = useState(false);

  // Load patients from FHIR API
  const loadPatients = async (search: string = '', page: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      const offset = (page - 1) * pageSize;
      let url = `/api/fhir/Patient?_count=${pageSize}&_getpagesoffset=${offset}`;
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

        // Extract photo (either from url or data)
        const photo = resource.photo?.[0]?.url || resource.photo?.[0]?.data
          ? (resource.photo[0].data ? `data:${resource.photo[0].contentType || 'image/jpeg'};base64,${resource.photo[0].data}` : resource.photo[0].url)
          : undefined;

        // Extract MRN from identifiers
        const mrn = resource.identifier?.find((id: any) =>
          id.type?.coding?.some((c: any) => c.code === 'MR' || c.code === 'MRN') ||
          id.system?.includes('mrn') ||
          id.use === 'official'
        )?.value;

        // Extract Primary Care Provider
        const pcp = resource.generalPractitioner?.[0]?.display ||
                    resource.managingOrganization?.display;

        return {
          id: resource.id,
          name: name ? `${(name.given || []).join(' ')} ${name.family || ''}`.trim() : 'Unknown',
          mrn: mrn,
          phone: telecom.find((t: any) => t.system === 'phone')?.value || '',
          email: telecom.find((t: any) => t.system === 'email')?.value || '',
          address: address ? `${address.line?.[0] || ''} ${address.city || ''} ${address.state || ''}`.trim() : '',
          registered: resource.meta?.lastUpdated ? new Date(resource.meta.lastUpdated).toLocaleDateString() : '',
          lastVisit: resource.meta?.lastUpdated ? new Date(resource.meta.lastUpdated).toLocaleDateString() : '',
          gender: resource.gender || 'unknown',
          birthDate: resource.birthDate || '',
          active: resource.active !== false,
          resourceType: resource.resourceType,
          photo: photo,
          primaryCareProvider: pcp
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

  // Load patients on search or tab change
  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when search or tab changes
    const timeoutId = setTimeout(() => {
      if (searchQuery !== '') {
        setSearching(true);
      }
      loadPatients(searchQuery, 1);
    }, searchQuery ? 500 : 0);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, activeTab]);

  // Load patients when page changes
  useEffect(() => {
    loadPatients(searchQuery, currentPage);
  }, [currentPage]);

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
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return null;
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return null;
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    if (patients.length === 0) {
      alert(t('patients_page.no_patients_export'));
      return;
    }

    const headers = [t('patients_page.patient_name'), 'MRN', t('patients_page.date_of_birth'), t('patients_page.age'), 'Gender', t('patients_page.phone'), t('patients_page.email'), 'Address', t('patients_page.primary_care_provider'), t('patients_page.last_visit'), 'Status'];

    const csvData = patients.map(patient => [
      patient.name,
      patient.mrn || '',
      patient.birthDate || '',
      patient.birthDate ? getAge(patient.birthDate).toString() : '',
      patient.gender,
      patient.phone,
      patient.email,
      patient.address,
      patient.primaryCareProvider || '',
      formatDate(patient.lastVisit) || '',
      patient.active ? t('patients_page.active') : t('patients_page.inactive')
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `patients_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle edit patient
  const handleEditPatient = async (patient: PatientData) => {
    try {
      // Fetch full FHIR patient data
      const response = await fetch(`/api/fhir/Patient/${patient.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch patient details');
      }
      const fhirPatient = await response.json();
      setEditingPatient(fhirPatient);
      setIsEditing(true);
      setIsDrawerOpen(true);
    } catch (error) {
      console.error('Error fetching patient:', error);
      alert('Failed to load patient details for editing');
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(totalCount / pageSize);
  const startEntry = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endEntry = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('patients_page.title')}</h1>
          <p className="text-sm text-gray-600 mt-0.5">
            {currentFacility?.name ? `${t('patients_page.managing_for')} ${currentFacility.name}` : t('patients_page.manage_records')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
            <Checkbox
              id="skip-encounter"
              checked={skipEncounterFlow}
              onCheckedChange={(checked) => setSkipEncounterFlow(Boolean(checked))}
            />
            <div className="flex flex-col">
              <Label htmlFor="skip-encounter" className="text-xs font-medium text-gray-700">
                {t('patients_page.skip_encounter')}
              </Label>
              <span className="text-[11px] text-gray-500">
                {t('patients_page.skip_encounter_desc')}
              </span>
            </div>
          </div>
          <Button
            onClick={exportToCSV}
            variant="outline"
            className="flex items-center gap-2"
            disabled={patients.length === 0}
          >
            <Download className="h-4 w-4" />
            {t('patients_page.export_csv')}
          </Button>
          <Button
            onClick={() => setIsDrawerOpen(true)}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('patients_page.add_patient')}
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t('patients_page.search_placeholder')}
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
                {t('patients_page.active')}
              </button>
              <button
                onClick={() => setActiveTab('inactive')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeTab === 'inactive'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t('patients_page.inactive')}
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
              <span>{t('patients_page.filters')}</span>
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
              <div className="text-xs text-gray-600">{t('patients_page.total_patients')}</div>
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
              <div className="text-xs text-gray-600">{t('patients_page.active')}</div>
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
              <div className="text-xs text-gray-600">{t('patients_page.inactive')}</div>
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
              <div className="text-xs text-gray-600">{t('patients_page.new_this_month')}</div>
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
          ) : viewMode === 'grid' ? (
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {patients.map((patient, index) => (
                  <div
                    key={patient.id}
                    onClick={() => openPatientTab(patient.id, patient.name)}
                    className="relative bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-blue-300"
                    style={{
                      animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both`
                    }}
                  >
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          patient.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {patient.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    {/* Patient Photo and Name */}
                    <div className="flex flex-col items-center mb-4 pt-2">
                      {patient.photo ? (
                        <img
                          src={patient.photo}
                          alt={patient.name}
                          className="h-20 w-20 rounded-full object-cover border-2 border-gray-200 mb-3"
                        />
                      ) : (
                        <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center text-white text-xl font-semibold mb-3">
                          {patient.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <h3 className="text-sm font-semibold text-gray-900 text-center">
                        {patient.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {patient.mrn ? `#${patient.mrn}` : `#${patient.id.substring(0, 8)}`}
                      </p>
                    </div>

                    {/* Patient Info */}
                    <div className="space-y-2 border-t border-gray-100 pt-3">
                      {/* Age and Gender */}
                      {patient.birthDate && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Age:</span>
                          <span className="text-gray-900 font-medium">
                            {getAge(patient.birthDate)} years ({patient.gender})
                          </span>
                        </div>
                      )}

                      {/* Phone */}
                      {patient.phone && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Phone:</span>
                          <span className="text-gray-900 font-medium truncate ml-2">
                            {patient.phone}
                          </span>
                        </div>
                      )}

                      {/* Email */}
                      {patient.email && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Email:</span>
                          <a
                            href={`mailto:${patient.email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-blue-600 hover:text-blue-800 hover:underline truncate ml-2"
                          >
                            {patient.email}
                          </a>
                        </div>
                      )}

                      {/* Primary Care Provider */}
                      {patient.primaryCareProvider && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">PCP:</span>
                          <span className="text-gray-900 font-medium truncate ml-2">
                            {patient.primaryCareProvider}
                          </span>
                        </div>
                      )}

                      {/* Last Visit */}
                      {patient.lastVisit && formatDate(patient.lastVisit) && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Last Visit:</span>
                          <span className="text-gray-900 font-medium">
                            {formatDate(patient.lastVisit)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditPatient(patient);
                        }}
                        variant="outline"
                        size="sm"
                        className="w-full hover:bg-gray-50"
                      >
                        <Edit2 className="h-3 w-3 mr-2" />
                        Edit Patient
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date of Birth
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Primary Care Provider (PCP)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Visit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Active
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {patients.map((patient, index) => (
                    <tr
                      key={patient.id}
                      onClick={() => openPatientTab(patient.id, patient.name)}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      style={{
                        animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both`
                      }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {patient.photo ? (
                            <img
                              src={patient.photo}
                              alt={patient.name}
                              className="h-10 w-10 rounded-full object-cover border border-gray-200"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white text-sm font-semibold">
                              {patient.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {patient.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {patient.mrn ? `#${patient.mrn}` : `#${patient.id.substring(0, 8)}`}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {patient.birthDate && formatDate(patient.birthDate) ? (
                          <div>
                            <div className="text-sm text-gray-900">
                              {formatDate(patient.birthDate)}
                            </div>
                            <div className="text-xs text-gray-500">
                              ({getAge(patient.birthDate)} years)
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {patient.address && (
                            <div className="text-sm text-gray-900 max-w-xs truncate">
                              {patient.address}
                            </div>
                          )}
                          <div className="flex flex-col gap-0.5">
                            {patient.phone && (
                              <div className="text-xs text-gray-600">
                                {patient.phone}
                              </div>
                            )}
                            {patient.email && (
                              <a
                                href={`mailto:${patient.email}`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                {patient.email}
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {patient.primaryCareProvider || (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {patient.lastVisit && formatDate(patient.lastVisit) ? (
                            formatDate(patient.lastVisit)
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            patient.active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {patient.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditPatient(patient);
                          }}
                          variant="ghost"
                          size="sm"
                          className="hover:bg-gray-100"
                        >
                          <Edit2 className="h-4 w-4 text-gray-600" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && patients.length > 0 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <Button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                >
                  Previous
                </Button>
                <Button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                >
                  Next
                </Button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{startEntry}</span> to{' '}
                    <span className="font-medium">{endEntry}</span> of{' '}
                    <span className="font-medium">{totalCount}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <Button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      variant="outline"
                      size="sm"
                      className="rounded-l-md"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="ml-1">Previous</span>
                    </Button>

                    {/* Page numbers */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                        <Button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          variant={currentPage === pageNum ? 'default' : 'outline'}
                          size="sm"
                          className={currentPage === pageNum ? 'bg-primary text-white' : ''}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}

                    <Button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      variant="outline"
                      size="sm"
                      className="rounded-r-md"
                    >
                      <span className="mr-1">Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Patient Drawer */}
      <PatientDrawer
        open={isDrawerOpen}
        onOpenChange={(open) => {
          setIsDrawerOpen(open);
          if (!open) {
            setEditingPatient(null);
            setIsEditing(false);
          }
        }}
        patient={editingPatient}
        isEditing={isEditing}
        skipEncounter={skipEncounterFlow}
        onSuccess={() => {
          loadPatients(searchQuery, currentPage);
          setEditingPatient(null);
          setIsEditing(false);
        }}
      />
    </div>
  );
}
