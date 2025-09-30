'use client';

import React, { useState, useEffect } from 'react';
import { User, Filter, MoreVertical, Plus, Search, Phone, Mail, Calendar, Clock, AlertCircle, Loader2, Stethoscope, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useFacility } from '@/contexts/facility-context';

interface StaffMember {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  email: string;
  qualification: string;
  active: boolean;
  resourceType: string;
}

export default function StaffPage() {
  const { currentFacility } = useFacility();
  const [activeTab, setActiveTab] = useState<'doctor' | 'general'>('doctor');
  const [staffData, setStaffData] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalCount, setTotalCount] = useState(0);

  // Load staff from FHIR API
  const loadStaff = async (search: string = '') => {
    setLoading(true);
    setError(null);
    
    try {
      let url = '/api/fhir/Practitioner?_count=50';
      if (search) {
        url += `&name=${encodeURIComponent(search)}`;
      }
      if (activeTab === 'doctor') {
        url += '&active=true';
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch practitioners');
      }

      const bundle = await response.json();
      setTotalCount(bundle.total || 0);

      const staffMembers: StaffMember[] = (bundle.entry || []).map((entry: any) => {
        const resource = entry.resource;
        const name = resource.name?.[0];
        const telecom = resource.telecom || [];
        const qualification = resource.qualification?.[0];
        
        return {
          id: resource.id,
          name: name ? `${(name.given || []).join(' ')} ${name.family || ''}`.trim() : 'Unknown',
          specialty: qualification?.code?.coding?.[0]?.display || 'General Practitioner',
          phone: telecom.find((t: any) => t.system === 'phone')?.value || '',
          email: telecom.find((t: any) => t.system === 'email')?.value || '',
          qualification: qualification?.code?.text || qualification?.code?.coding?.[0]?.display || 'Medical Doctor',
          active: resource.active !== false,
          resourceType: resource.resourceType
        };
      });

      setStaffData(staffMembers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load staff');
      setStaffData([]);
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
      loadStaff(searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, activeTab]);

  // Initial load
  useEffect(() => {
    loadStaff();
  }, [activeTab]);

  const getWorkingDays = () => ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  
  const WorkingDayCircle = ({ day, isActive }: { day: string; isActive: boolean }) => (
    <div
      className={`
        w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200
        ${isActive 
          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-sm' 
          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
        }
      `}
    >
      {day}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-600 mt-1">
            {currentFacility?.name ? `Managing staff for ${currentFacility.name}` : 'Manage healthcare staff and practitioners'}
          </p>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200">
          <Plus className="h-4 w-4 mr-2" />
          Add Staff Member
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search staff by name or specialty..."
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
                onClick={() => setActiveTab('doctor')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === 'doctor'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Doctor Staff
              </button>
              <button
                onClick={() => setActiveTab('general')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === 'general'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                General Staff
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
              <div className="text-sm text-gray-600">Total Staff</div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {staffData.filter(s => s.active).length}
              </div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Stethoscope className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {staffData.filter(s => s.specialty.toLowerCase().includes('doctor') || s.specialty.toLowerCase().includes('physician')).length}
              </div>
              <div className="text-sm text-gray-600">Doctors</div>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {staffData.filter(s => !s.specialty.toLowerCase().includes('doctor') && !s.specialty.toLowerCase().includes('physician')).length}
              </div>
              <div className="text-sm text-gray-600">Other Staff</div>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <User className="h-6 w-6 text-orange-600" />
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
              <h3 className="text-sm font-medium text-red-800">Error loading staff</h3>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
          <Button 
            onClick={() => loadStaff(searchQuery)} 
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
            <span className="text-gray-600">Loading staff members...</span>
          </div>
        </div>
      )}

      {/* Staff Table */}
      {!loading && !error && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {staffData.length === 0 ? (
            <div className="p-12 text-center">
              <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No staff members found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery ? 'No staff members match your search criteria.' : 'Get started by adding your first staff member.'}
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add First Staff Member
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Name & Specialty
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Contact Information
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Working Days
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Qualification
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
                  {staffData.map((staff, index) => (
                    <tr 
                      key={staff.id} 
                      className="hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-indigo-50/30 transition-all duration-200"
                      style={{
                        animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both`
                      }}
                    >
                      <td className="px-6 py-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold shadow-sm">
                            {staff.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{staff.name}</div>
                            <div className="text-sm text-blue-600 font-medium">{staff.specialty}</div>
                            <div className="text-xs text-gray-500 mt-1">ID: {staff.id.substring(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="space-y-2">
                          {staff.phone && (
                            <div className="flex items-center space-x-2 text-sm text-gray-700">
                              <Phone className="h-3 w-3 text-gray-400" />
                              <span>{staff.phone}</span>
                            </div>
                          )}
                          {staff.email && (
                            <div className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800">
                              <Mail className="h-3 w-3 text-gray-400" />
                              <a href={`mailto:${staff.email}`} className="hover:underline">{staff.email}</a>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex space-x-1">
                          {getWorkingDays().map((day, dayIndex) => (
                            <WorkingDayCircle
                              key={dayIndex}
                              day={day}
                              isActive={Math.random() > 0.2} // Simulate working days
                            />
                          ))}
                        </div>
                        <div className="text-xs text-gray-500 mt-2">Mon - Fri, 9 AM - 5 PM</div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center space-x-2">
                          <Award className="h-4 w-4 text-blue-500" />
                          <span className="text-sm text-gray-900 font-medium">{staff.qualification}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Licensed Practitioner</div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex flex-col space-y-2">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                            staff.active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {staff.active ? 'Active' : 'Inactive'}
                          </span>
                          <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            Full-Time
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" className="hover:bg-blue-50 hover:text-blue-600">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
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
