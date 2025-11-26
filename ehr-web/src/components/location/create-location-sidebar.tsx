'use client';

import { useState } from 'react';

import { X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface CreateLocationSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLocationCreated: (location: any) => void;
  orgId: string;
  userId?: string | null;
}

interface LocationFormData {
  name: string;
  code: string;
  locationType: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  timezone: string;
  contactEmail: string;
  contactPhone: string;
  contactPerson: string;
}
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';


export function CreateLocationSidebar({
  open,
  onOpenChange,
  onLocationCreated,
  orgId,
  userId,
}: CreateLocationSidebarProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<LocationFormData>({
    name: '',
    code: '',
    locationType: 'clinic',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
    timezone: 'America/Los_Angeles',
    contactEmail: '',
    contactPhone: '',
    contactPerson: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      locationType: 'clinic',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US',
      timezone: 'America/Los_Angeles',
      contactEmail: '',
      contactPhone: '',
      contactPerson: '',
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const addressLines = [formData.addressLine1];
      if (formData.addressLine2) {
        addressLines.push(formData.addressLine2);
      }

      const payload = {
        org_id: orgId,
        name: formData.name,
        code: formData.code,
        location_type: formData.locationType,
        address: {
          line: addressLines,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
        },
        timezone: formData.timezone,
        contact_email: formData.contactEmail || null,
        contact_phone: formData.contactPhone || null,
        contact_person: formData.contactPerson || null,
      };

      const response = await fetch(
        `${API_URL}/api/inventory/masters/locations`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-org-id': orgId,
            ...(userId && { 'x-user-id': userId }),
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create location');
      }

      const result = await response.json();
      const newLocation = result.data || result;

      // Notify parent component
      onLocationCreated(newLocation);

      // Reset form and close
      resetForm();
      onOpenChange(false);
    } catch (err: any) {
      console.error('Error creating location:', err);
      setError(err.message || 'Failed to create location');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Create New Location</SheetTitle>
          <SheetDescription>
            Add a new location/facility to your organization
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Basic Information</h3>

            <div className="grid gap-2">
              <Label htmlFor="name">Location Name *</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Main Hospital"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="code">Location Code *</Label>
                <Input
                  id="code"
                  required
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  placeholder="e.g., MAIN01"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="locationType">Type *</Label>
                <Select
                  value={formData.locationType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, locationType: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hospital">Hospital</SelectItem>
                    <SelectItem value="clinic">Clinic</SelectItem>
                    <SelectItem value="diagnostic_center">Diagnostic Center</SelectItem>
                    <SelectItem value="pharmacy">Pharmacy</SelectItem>
                    <SelectItem value="branch">Branch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Address</h3>

            <div className="grid gap-2">
              <Label htmlFor="addressLine1">Address Line 1 *</Label>
              <Input
                id="addressLine1"
                required
                value={formData.addressLine1}
                onChange={(e) =>
                  setFormData({ ...formData, addressLine1: e.target.value })
                }
                placeholder="Street address"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="addressLine2">Address Line 2</Label>
              <Input
                id="addressLine2"
                value={formData.addressLine2}
                onChange={(e) =>
                  setFormData({ ...formData, addressLine2: e.target.value })
                }
                placeholder="Building, suite, etc."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="City"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="State"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="postalCode">Postal Code *</Label>
                <Input
                  id="postalCode"
                  required
                  value={formData.postalCode}
                  onChange={(e) =>
                    setFormData({ ...formData, postalCode: e.target.value })
                  }
                  placeholder="ZIP/Postal code"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  required
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="Country code"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="timezone">Timezone *</Label>
              <Select
                value={formData.timezone}
                onValueChange={(value) => setFormData({ ...formData, timezone: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="America/Chicago">Central Time</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                  <SelectItem value="America/Phoenix">Arizona Time</SelectItem>
                  <SelectItem value="America/Anchorage">Alaska Time</SelectItem>
                  <SelectItem value="Pacific/Honolulu">Hawaii Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Contact Information</h3>

            <div className="grid gap-2">
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input
                id="contactPerson"
                value={formData.contactPerson}
                onChange={(e) =>
                  setFormData({ ...formData, contactPerson: e.target.value })
                }
                placeholder="Contact person name"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) =>
                  setFormData({ ...formData, contactEmail: e.target.value })
                }
                placeholder="contact@example.com"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                id="contactPhone"
                type="tel"
                value={formData.contactPhone}
                onChange={(e) =>
                  setFormData({ ...formData, contactPhone: e.target.value })
                }
                placeholder="+1-555-123-4567"
              />
            </div>
          </div>

          <SheetFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="text-white">
              {loading ? 'Creating...' : 'Create Location'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
