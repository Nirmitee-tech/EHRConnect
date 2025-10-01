'use client';

import { Stethoscope, User, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useState, useEffect } from 'react';
import { fhirService } from '@/lib/medplum';

interface EncounterData {
  practitioner: string;
  location: string;
  encounterClass: string;
}

interface EncounterFormProps {
  patient: {
    id: string;
    name: string;
    age?: number;
    gender?: string;
    mrn?: string;
    phone?: string;
    email?: string;
  };
  onBack: () => void;
  onStartVisit: (encounterData: EncounterData) => Promise<void>;
}

export function EncounterForm({ patient, onBack, onStartVisit }: EncounterFormProps) {
  const [formData, setFormData] = useState({
    practitioner: '',
    location: '',
    encounterClass: ''
  });
  const [loading, setLoading] = useState(false);
  const [practitioners, setPractitioners] = useState<Array<{ id: string; name: string }>>([]);
  const [locations, setLocations] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingResources, setLoadingResources] = useState(true);
  const [showPractitionerForm, setShowPractitionerForm] = useState(false);
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [newPractitioner, setNewPractitioner] = useState({ firstName: '', lastName: '', prefix: 'Dr' });
  const [newLocation, setNewLocation] = useState({ name: '' });
  const [saving, setSaving] = useState(false);

  // Load FHIR Practitioners and Locations
  useEffect(() => {
    const loadResources = async () => {
      try {
        setLoadingResources(true);
        
        // Load Practitioners
        const practitionerResponse = await fhirService.search('Practitioner', {
          _count: 50,
          active: true
        });
        
        const practitionerList = practitionerResponse.entry?.map((entry) => {
          const practitioner = entry.resource as any;
          const name = practitioner.name?.[0];
          const fullName = `${name?.prefix?.join(' ') || ''} ${name?.given?.join(' ') || ''} ${name?.family || ''}`.trim();
          return {
            id: practitioner.id,
            name: fullName || 'Unknown Practitioner'
          };
        }) || [];
        
        setPractitioners(practitionerList);

        // Load Locations - use Organization as proxy since Location might not be defined
        const locationResponse = await fhirService.search('Organization', {
          _count: 50,
          active: true,
          type: 'dept'
        });
        
        const locationList = locationResponse.entry?.map((entry) => {
          const location = entry.resource as any;
          return {
            id: location.id,
            name: location.name || 'Unknown Location'
          };
        }) || [];
        
        setLocations(locationList);
      } catch (error) {
        console.error('Error loading resources:', error);
      } finally {
        setLoadingResources(false);
      }
    };

    loadResources();
  }, []);

  const handleAddPractitioner = async () => {
    if (!newPractitioner.firstName || !newPractitioner.lastName) return;
    
    setSaving(true);
    try {
      const practitionerResource = {
        resourceType: 'Practitioner',
        active: true,
        name: [{
          use: 'official',
          family: newPractitioner.lastName,
          given: [newPractitioner.firstName],
          prefix: [newPractitioner.prefix]
        }]
      };
      
      const created = await fhirService.create(practitionerResource) as any;
      const fullName = `${newPractitioner.prefix} ${newPractitioner.firstName} ${newPractitioner.lastName}`.trim();
      
      // Add to list
      setPractitioners([...practitioners, { id: created.id, name: fullName }]);
      setFormData({ ...formData, practitioner: created.id });
      
      // Reset and close
      setNewPractitioner({ firstName: '', lastName: '', prefix: 'Dr' });
      setShowPractitionerForm(false);
    } catch (error) {
      console.error('Error creating practitioner:', error);
      alert('Failed to create practitioner');
    } finally {
      setSaving(false);
    }
  };

  const handleAddLocation = async () => {
    if (!newLocation.name) return;
    
    setSaving(true);
    try {
      const locationResource = {
        resourceType: 'Organization',
        active: true,
        name: newLocation.name,
        type: [{
          coding: [{
            code: 'dept',
            display: 'Hospital Department'
          }]
        }]
      };
      
      const created = await fhirService.create(locationResource) as any;
      
      // Add to list
      setLocations([...locations, { id: created.id, name: newLocation.name }]);
      setFormData({ ...formData, location: created.id });
      
      // Reset and close
      setNewLocation({ name: '' });
      setShowLocationForm(false);
    } catch (error) {
      console.error('Error creating location:', error);
      alert('Failed to create location');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onStartVisit(formData);
    } catch (error) {
      console.error('Error starting visit:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
        <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center">
          <Stethoscope className="h-3.5 w-3.5 text-white" />
        </div>
        <h3 className="text-sm font-bold text-gray-900">
          Encounter details
        </h3>
      </div>

      {/* Patient Summary */}
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
          <User className="h-5 w-5 text-gray-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-gray-900">{patient.name}</h4>
            <span className="text-xs text-gray-500">
              {patient.age ? `${patient.age}y, ` : ''}{patient.gender || 'Unknown'}
            </span>
          </div>
          <div className="flex items-center gap-4 mt-1">
            <div className="text-xs">
              <span className="text-gray-500">MRN</span>
              <span className="ml-2 font-medium">{patient.mrn || '-'}</span>
            </div>
            <div className="text-xs">
              <span className="text-gray-500">Phone number</span>
              <span className="ml-2 font-medium">{patient.phone || '-'}</span>
            </div>
            <div className="text-xs">
              <span className="text-gray-500">Email</span>
              <span className="ml-2 font-medium">{patient.email || '-'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Encounter Form */}
      <form onSubmit={handleSubmit} className="space-y-3 pb-20">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="practitioner" className="text-sm font-medium text-gray-700">
              Practitioner
            </Label>
            <Select 
              value={formData.practitioner} 
              onValueChange={(value) => setFormData({ ...formData, practitioner: value })}
              disabled={loadingResources}
            >
              <SelectTrigger className="h-9 text-sm rounded-lg border border-gray-200 focus:border-primary">
                <SelectValue placeholder={loadingResources ? "Loading..." : "Select practitioner"} />
              </SelectTrigger>
              <SelectContent>
                {practitioners.map((prac) => (
                  <SelectItem key={prac.id} value={prac.id}>
                    {prac.name}
                  </SelectItem>
                ))}
                <div className="border-t border-gray-200 mt-1 pt-1">
                  <button
                    type="button"
                    className="w-full px-2 py-1.5 text-left text-sm text-primary hover:bg-gray-50 rounded flex items-center gap-2"
                    onClick={() => setShowPractitionerForm(true)}
                  >
                    <span className="text-lg">+</span>
                    Add new practitioner
                  </button>
                </div>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="location" className="text-sm font-medium text-gray-700">
              Location
            </Label>
            <Select 
              value={formData.location} 
              onValueChange={(value) => setFormData({ ...formData, location: value })}
              disabled={loadingResources}
            >
              <SelectTrigger className="h-9 text-sm rounded-lg border border-gray-200 focus:border-primary">
                <SelectValue placeholder={loadingResources ? "Loading..." : "Select location"} />
              </SelectTrigger>
              <SelectContent>
                {locations.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>
                    {loc.name}
                  </SelectItem>
                ))}
                <div className="border-t border-gray-200 mt-1 pt-1">
                  <button
                    type="button"
                    className="w-full px-2 py-1.5 text-left text-sm text-primary hover:bg-gray-50 rounded flex items-center gap-2"
                    onClick={() => setShowLocationForm(true)}
                  >
                    <span className="text-lg">+</span>
                    Add new location
                  </button>
                </div>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="encounterClass" className="text-sm font-medium text-gray-700">
            Encounter class
          </Label>
          <Select 
            value={formData.encounterClass} 
            onValueChange={(value) => setFormData({ ...formData, encounterClass: value })}
          >
            <SelectTrigger className="h-9 text-sm rounded-lg border border-gray-200 focus:border-primary">
              <SelectValue placeholder="Select encounter class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ambulatory">Ambulatory - Outpatient visit</SelectItem>
              <SelectItem value="emergency">Emergency - Emergency visit</SelectItem>
              <SelectItem value="inpatient">Inpatient - Hospital admission</SelectItem>
              <SelectItem value="home">Home - Home health visit</SelectItem>
              <SelectItem value="virtual">Virtual - Telemedicine</SelectItem>
            </SelectContent>
          </Select>
        </div>

      </form>

      {/* Sticky Footer Buttons */}
      <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 mt-4">
        <div className="flex items-center gap-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onBack}
            disabled={loading}
            className="flex-1 h-10 rounded-lg hover:bg-gray-50 text-sm font-medium"
          >
            Back
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={loading || !formData.practitioner || !formData.location || !formData.encounterClass || loadingResources}
            className="flex-1 h-10 rounded-lg bg-gray-900 hover:bg-gray-800 text-white transition-all duration-200 text-sm font-medium"
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {loading ? 'Starting...' : 'Start visit'}
          </Button>
        </div>
      </div>

      {/* Add Practitioner Drawer */}
      <Sheet open={showPractitionerForm} onOpenChange={setShowPractitionerForm}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="text-base font-bold">Add New Practitioner</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-3">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Prefix</Label>
              <Select value={newPractitioner.prefix} onValueChange={(value) => setNewPractitioner({ ...newPractitioner, prefix: value })}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dr">Dr</SelectItem>
                  <SelectItem value="Mr">Mr</SelectItem>
                  <SelectItem value="Mrs">Mrs</SelectItem>
                  <SelectItem value="Ms">Ms</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-medium">First Name <span className="text-red-500">*</span></Label>
              <Input
                value={newPractitioner.firstName}
                onChange={(e) => setNewPractitioner({ ...newPractitioner, firstName: e.target.value })}
                placeholder="Enter first name"
                className="h-9"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-medium">Last Name <span className="text-red-500">*</span></Label>
              <Input
                value={newPractitioner.lastName}
                onChange={(e) => setNewPractitioner({ ...newPractitioner, lastName: e.target.value })}
                placeholder="Enter last name"
                className="h-9"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPractitionerForm(false)}
                className="flex-1"
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleAddPractitioner}
                className="flex-1 bg-gray-900"
                disabled={saving || !newPractitioner.firstName || !newPractitioner.lastName}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Add Location Drawer */}
      <Sheet open={showLocationForm} onOpenChange={setShowLocationForm}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="text-base font-bold">Add New Location</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-3">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Location Name <span className="text-red-500">*</span></Label>
              <Input
                value={newLocation.name}
                onChange={(e) => setNewLocation({ name: e.target.value })}
                placeholder="Enter location name"
                className="h-9"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowLocationForm(false)}
                className="flex-1"
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleAddLocation}
                className="flex-1 bg-gray-900"
                disabled={saving || !newLocation.name}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
