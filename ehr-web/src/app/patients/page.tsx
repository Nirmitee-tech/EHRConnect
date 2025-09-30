'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Plus, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye,
  Users,
  Calendar
} from 'lucide-react';
import { PatientSummary } from '@/types/fhir';
import { patientService } from '@/services/patient.service';
import { useFacility } from '@/contexts/facility-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function PatientsPage() {
  const router = useRouter();
  const { currentFacility } = useFacility();
  
  // State management
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [activeFilter, setActiveFilter] = useState<string>('active');
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Load patients
  const loadPatients = async (reset = false) => {
    if (!currentFacility) {
      setPatients([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const searchParams = {
        facilityId: currentFacility.id,
        name: searchTerm || undefined,
        gender: genderFilter === 'all' ? undefined : genderFilter,
        active: activeFilter === 'all' ? undefined : activeFilter === 'active',
        _count: 20,
        _offset: reset ? 0 : currentPage * 20,
      };

      const result = await patientService.searchPatients(searchParams);
      
      if (reset) {
        setPatients(result.patients);
        setCurrentPage(0);
      } else {
        setPatients(prev => [...prev, ...result.patients]);
      }
      
      setHasMore(result.hasMore);
    } catch (err) {
      setError('Failed to load patients');
      console.error('Error loading patients:', err);
    } finally {
      setLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    loadPatients(true);
  }, [currentFacility, searchTerm, genderFilter, activeFilter]);

  // Handlers
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(0);
  };

  const handleGenderFilter = (value: string) => {
    setGenderFilter(value);
    setCurrentPage(0);
  };

  const handleActiveFilter = (value: string) => {
    setActiveFilter(value);
    setCurrentPage(0);
  };

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
    loadPatients(false);
  };

  const handleCreatePatient = () => {
    router.push('/patients/new');
  };

  const handleViewPatient = (patientId: string) => {
    router.push(`/patients/${patientId}`);
  };

  const handleEditPatient = (patientId: string) => {
    router.push(`/patients/${patientId}/edit`);
  };

  const handleDeletePatient = async (patientId: string, patientName: string) => {
    if (!confirm(`Are you sure you want to delete patient "${patientName}"?`)) {
      return;
    }

    try {
      await patientService.softDeletePatient(patientId, 'current-user-id');
      await loadPatients(true);
    } catch (err) {
      alert('Failed to delete patient');
      console.error('Error deleting patient:', err);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  const getAgeFromBirthDate = (birthDate: string) => {
    if (!birthDate) return 'Unknown';
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }
    return age;
  };

  // Render loading state
  if (loading && patients.length === 0) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Patients</h1>
            <p className="text-muted-foreground">
              {currentFacility ? `Managing patients for ${currentFacility.name}` : 'Select a facility to view patients'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Loading patients...</span>
        </div>
      </div>
    );
  }

  // Render no facility state
  if (!currentFacility) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Patients</h1>
            <p className="text-muted-foreground">Select a facility to view patients</p>
          </div>
        </div>
        
        <Card className="p-12 text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Facility Selected</h3>
          <p className="text-muted-foreground">
            Please select a facility from the facility switcher to view and manage patients.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Patients</h1>
          <p className="text-muted-foreground">
            Managing patients for {currentFacility.name}
          </p>
        </div>
        <Button onClick={handleCreatePatient}>
          <Plus className="h-4 w-4 mr-2" />
          Add Patient
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients by name or MRN..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Gender Filter */}
          <Select value={genderFilter} onValueChange={handleGenderFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genders</SelectItem>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
              <SelectItem value="unknown">Unknown</SelectItem>
            </SelectContent>
          </Select>

          {/* Active Filter */}
          <Select value={activeFilter} onValueChange={handleActiveFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="inactive">Inactive Only</SelectItem>
              <SelectItem value="all">All Patients</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="p-4 mb-6 border-destructive">
          <div className="text-destructive">
            <p className="font-medium">Error loading patients</p>
            <p className="text-sm">{error}</p>
          </div>
        </Card>
      )}

      {/* Patients List */}
      {patients.length === 0 && !loading ? (
        <Card className="p-12 text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Patients Found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || genderFilter !== 'all' || activeFilter !== 'active'
              ? 'No patients match your current filters.'
              : 'Get started by adding your first patient.'}
          </p>
          <Button onClick={handleCreatePatient}>
            <Plus className="h-4 w-4 mr-2" />
            Add First Patient
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {patients.map((patient) => (
            <Card key={patient.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="text-lg font-semibold">{patient.name}</h3>
                    <div className="flex gap-2">
                      <Badge variant={patient.active ? 'default' : 'secondary'}>
                        {patient.active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {patient.gender}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {formatDate(patient.dateOfBirth)} 
                        {patient.dateOfBirth && ` (${getAgeFromBirthDate(patient.dateOfBirth)} years)`}
                      </span>
                    </div>
                    {patient.mrn && (
                      <div>
                        <span className="font-medium">MRN:</span> {patient.mrn}
                      </div>
                    )}
                    {patient.lastUpdated && (
                      <div>
                        <span className="font-medium">Last Updated:</span> {formatDate(patient.lastUpdated)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewPatient(patient.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditPatient(patient.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeletePatient(patient.id, patient.name)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {/* Load More */}
          {hasMore && (
            <div className="text-center py-6">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More Patients'}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
