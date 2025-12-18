'use client';

import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Search, Edit, Trash2, Phone, Mail, MapPin, Stethoscope, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import billingService from '@/services/billing.service';
import { useTranslation } from '@/i18n/client';
import '@/i18n/client';

interface Provider {
  id: string;
  npi: string;
  first_name: string;
  last_name: string;
  specialty: string;
  taxonomy_code: string;
  license_number: string;
  email: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  zip_code: string;
  created_at: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const US_STATES = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    npi: '',
    first_name: '',
    last_name: '',
    specialty: '',
    taxonomy_code: '',
    license_number: '',
    email: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    zip_code: '',
  });

  const loadProviders = async () => {
    try {
      setLoading(true);
      const response = await billingService.getProviders({
        search: searchTerm,
        specialty: specialtyFilter,
        state: stateFilter,
        page: currentPage,
        limit: 20,
      });
      setProviders(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to load providers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProviders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm, specialtyFilter, stateFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingProvider) {
        await billingService.updateProvider(editingProvider.id, formData);
      } else {
        await billingService.createProvider(formData);
      }
      setShowDrawer(false);
      resetForm();
      loadProviders();
    } catch (error: any) {
      console.error('Failed to save provider:', error);
      alert(error.response?.data?.message || 'Failed to save provider');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (provider: Provider) => {
    setEditingProvider(provider);
    setFormData({
      npi: provider.npi,
      first_name: provider.first_name,
      last_name: provider.last_name,
      specialty: provider.specialty,
      taxonomy_code: provider.taxonomy_code,
      license_number: provider.license_number,
      email: provider.email,
      phone: provider.phone,
      address_line1: provider.address_line1,
      address_line2: provider.address_line2 || '',
      city: provider.city,
      state: provider.state,
      zip_code: provider.zip_code,
    });
    setShowDrawer(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this provider?')) return;
    try {
      await billingService.deleteProvider(id);
      loadProviders();
    } catch (error: any) {
      console.error('Failed to delete provider:', error);
      alert(error.response?.data?.message || 'Failed to delete provider');
    }
  };

  const resetForm = () => {
    setFormData({
      npi: '',
      first_name: '',
      last_name: '',
      specialty: '',
      taxonomy_code: '',
      license_number: '',
      email: '',
      phone: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      zip_code: '',
    });
    setEditingProvider(null);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSpecialtyFilter('');
    setStateFilter('');
    setCurrentPage(1);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <UserCheck className="h-6 w-6 text-[#3342a5]" />
              Providers
            </h1>
            <p className="text-xs text-gray-600 mt-1">
              {pagination.total} provider{pagination.total !== 1 ? 's' : ''} total
            </p>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setShowDrawer(true);
            }}
            className="bg-[#3342a5] hover:bg-[#2a3686] text-white"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Provider
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10 pointer-events-none" />
              <Input
                placeholder="Search by name, NPI, or specialty..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 h-9 bg-white"
              />
            </div>
          </div>
          <Select value={specialtyFilter || 'all'} onValueChange={(value) => {
            setSpecialtyFilter(value === 'all' ? '' : value);
            setCurrentPage(1);
          }}>
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue placeholder="All Specialties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specialties</SelectItem>
              <SelectItem value="Internal Medicine">Internal Medicine</SelectItem>
              <SelectItem value="Cardiology">Cardiology</SelectItem>
              <SelectItem value="Pediatrics">Pediatrics</SelectItem>
              <SelectItem value="Orthopedic Surgery">Orthopedic Surgery</SelectItem>
              <SelectItem value="Dermatology">Dermatology</SelectItem>
              <SelectItem value="Family Medicine">Family Medicine</SelectItem>
            </SelectContent>
          </Select>
          <Select value={stateFilter || 'all'} onValueChange={(value) => {
            setStateFilter(value === 'all' ? '' : value);
            setCurrentPage(1);
          }}>
            <SelectTrigger className="w-[120px] h-9">
              <SelectValue placeholder="All States" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {US_STATES.map(state => (
                <SelectItem key={state} value={state}>{state}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(searchTerm || specialtyFilter || stateFilter) && (
            <Button variant="outline" size="sm" onClick={clearFilters} className="h-9">
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3342a5] mx-auto"></div>
            <p className="text-gray-600 mt-4 text-sm">Loading providers...</p>
          </div>
        ) : providers.length === 0 ? (
          <div className="text-center py-12">
            <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No Providers Found</p>
            <p className="text-xs text-gray-500 mt-2">
              {searchTerm || specialtyFilter || stateFilter ? 'Try adjusting your filters' : 'Add your first provider to get started'}
            </p>
            {!searchTerm && !specialtyFilter && !stateFilter && (
              <Button
                onClick={() => {
                  resetForm();
                  setShowDrawer(true);
                }}
                className="mt-4 bg-[#3342a5] hover:bg-[#2a3686] text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Provider
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Provider
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      NPI
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Specialty
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {providers.map((provider) => (
                    <tr key={provider.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-[#3342a5]/10 flex items-center justify-center">
                            <Stethoscope className="h-4 w-4 text-[#3342a5]" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              Dr. {provider.first_name} {provider.last_name}
                            </div>
                            <div className="text-xs text-gray-500 font-mono">
                              {provider.license_number}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-[#3342a5]/10 text-[#3342a5] font-mono">
                          {provider.npi}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">{provider.specialty}</div>
                        <div className="text-xs text-gray-500 font-mono">{provider.taxonomy_code}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <div className="flex items-center text-xs text-gray-600">
                            <Mail className="h-3 w-3 mr-1.5 text-gray-400" />
                            <span className="truncate max-w-[180px]">{provider.email}</span>
                          </div>
                          <div className="flex items-center text-xs text-gray-600">
                            <Phone className="h-3 w-3 mr-1.5 text-gray-400" />
                            {provider.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-3.5 w-3.5 mr-1 text-gray-400" />
                          <span>{provider.city}, {provider.state}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            onClick={() => handleEdit(provider)}
                            variant="outline"
                            size="sm"
                            className="h-7 w-7 p-0"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(provider.id)}
                            variant="outline"
                            size="sm"
                            className="h-7 w-7 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                  <span className="font-medium">{pagination.total}</span> providers
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="h-8"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={pagination.page === pageNum ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          className={pagination.page === pageNum ? 'h-8 w-8 p-0 bg-[#3342a5] hover:bg-[#2a3686] text-white' : 'h-8 w-8 p-0'}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.hasNextPage}
                    className="h-8"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Side Drawer */}
      <Sheet open={showDrawer} onOpenChange={setShowDrawer}>
        <SheetContent className="sm:max-w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editingProvider ? 'Edit Provider' : 'Add New Provider'}
            </SheetTitle>
            <SheetDescription>
              {editingProvider
                ? 'Update provider information for billing and claims'
                : 'Enter provider details to add them to your billing system'}
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            {/* Provider Information */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Provider Information</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">First Name *</Label>
                    <Input
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Last Name *</Label>
                    <Input
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">NPI Number *</Label>
                    <Input
                      value={formData.npi}
                      onChange={(e) => setFormData({ ...formData, npi: e.target.value })}
                      placeholder="10-digit NPI"
                      maxLength={10}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">License Number *</Label>
                    <Input
                      value={formData.license_number}
                      onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Specialty *</Label>
                    <Input
                      value={formData.specialty}
                      onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                      placeholder="e.g., Internal Medicine"
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Taxonomy Code *</Label>
                    <Input
                      value={formData.taxonomy_code}
                      onChange={(e) => setFormData({ ...formData, taxonomy_code: e.target.value })}
                      placeholder="e.g., 207R00000X"
                      required
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Contact Information</h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs">Email *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Phone *</Label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Address</h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs">Address Line 1 *</Label>
                  <Input
                    value={formData.address_line1}
                    onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Address Line 2</Label>
                  <Input
                    value={formData.address_line2}
                    onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1">
                    <Label className="text-xs">City *</Label>
                    <Input
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">State *</Label>
                    <Input
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                      maxLength={2}
                      placeholder="CA"
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">ZIP Code *</Label>
                    <Input
                      value={formData.zip_code}
                      onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowDrawer(false);
                  resetForm();
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="flex-1 bg-[#3342a5] hover:bg-[#2a3686] text-white">
                {saving ? 'Saving...' : editingProvider ? 'Update Provider' : 'Add Provider'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
