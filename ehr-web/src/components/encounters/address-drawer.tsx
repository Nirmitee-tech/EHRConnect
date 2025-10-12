'use client';

import React, { useState, useEffect } from 'react';
import { X, Copy, Plus, Edit, Trash2, Check } from 'lucide-react';
import { AddressData } from '@/types/encounter';

interface AddressDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  addresses: AddressData[];
  onSave: (addresses: AddressData[]) => Promise<void>;
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

const COUNTRIES = [
  'India', 'United States', 'United Kingdom', 'Canada', 'Australia',
  'Germany', 'France', 'Japan', 'China', 'Singapore', 'UAE', 'Others'
];

const ADDRESS_TYPES = ['Home', 'Work', 'Other'];

const emptyAddress = (): AddressData => ({
  id: `temp-${Date.now()}`,
  type: 'Home',
  addressLine1: '',
  addressLine2: '',
  locality: '',
  city: '',
  pincode: '',
  state: '',
  country: 'India',
  areaCode: '',
  landlineNumber: '',
  emergencyContactName: '',
  emergencyContactNumber: '',
  spouseName: '',
  spouseContactNumber: '',
  generalPractitioner: '',
  isActive: true,
  isPrimary: false
});

export function AddressDrawer({
  isOpen,
  onClose,
  patientId,
  addresses: initialAddresses,
  onSave
}: AddressDrawerProps) {
  const [addresses, setAddresses] = useState<AddressData[]>(initialAddresses);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<AddressData>(emptyAddress());
  const [errors, setErrors] = useState<Partial<Record<keyof AddressData, string>>>({});
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [showStatusConfirm, setShowStatusConfirm] = useState<{index: number, status: boolean} | null>(null);

  // Reset local state when drawer opens with fresh data from parent
  useEffect(() => {
    if (isOpen) {
      console.log('🔵 AddressDrawer - Drawer opened, loading addresses:', initialAddresses);
      setAddresses(initialAddresses);
      setEditingIndex(null);
      setFormData(emptyAddress());
    }
  }, [isOpen]);

  const handleChange = (field: keyof AddressData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const copyFromField = (sourceField: string, targetField: keyof AddressData) => {
    const value = formData[sourceField as keyof AddressData];
    if (value) {
      setFormData(prev => ({
        ...prev,
        [targetField]: value
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof AddressData, string>> = {};

    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = 'Address Line 1 is required';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pin code is required';
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Pin code must be 6 digits';
    }
    if (!formData.state) {
      newErrors.state = 'State is required';
    }
    if (!formData.country) {
      newErrors.country = 'Country is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddNew = () => {
    setFormData(emptyAddress());
    setEditingIndex(null);
    setErrors({});
  };

  const handleEdit = (index: number) => {
    setFormData(addresses[index]);
    setEditingIndex(index);
    setErrors({});
  };

  const handleSaveAddress = () => {
    if (!validateForm()) return;

    const updatedAddresses = [...addresses];

    // If setting as primary, unset other primary addresses
    if (formData.isPrimary) {
      updatedAddresses.forEach(addr => addr.isPrimary = false);
    }

    if (editingIndex !== null) {
      updatedAddresses[editingIndex] = formData;
    } else {
      updatedAddresses.push(formData);
    }

    console.log('🔵 handleSaveAddress - Form data:', formData);
    console.log('🔵 handleSaveAddress - Updated addresses:', updatedAddresses);
    setAddresses(updatedAddresses);
    setFormData(emptyAddress());
    setEditingIndex(null);
  };

  const handleDeleteAddress = (index: number) => {
    const updatedAddresses = addresses.filter((_, i) => i !== index);
    setAddresses(updatedAddresses);
    setShowDeleteConfirm(null);

    // Clear form if editing this address
    if (editingIndex === index) {
      setFormData(emptyAddress());
      setEditingIndex(null);
    }
  };

  const handleToggleStatus = (index: number, newStatus: boolean) => {
    const updatedAddresses = [...addresses];
    updatedAddresses[index].isActive = newStatus;
    setAddresses(updatedAddresses);
    setShowStatusConfirm(null);
  };

  const handleSaveAll = async () => {
    console.log('🟢 handleSaveAll - Current addresses state:', addresses);
    console.log('🟢 handleSaveAll - Number of addresses:', addresses.length);

    // Check if there's unsaved form data
    let finalAddresses = addresses;
    const hasFormData = formData.addressLine1.trim() || formData.city.trim() || formData.pincode.trim();

    if (hasFormData) {
      console.log('🟡 handleSaveAll - Detected unsaved form data, validating and adding...');

      // Validate the form
      if (!validateForm()) {
        console.log('⚠️ handleSaveAll - Form validation failed, cannot save');
        alert('Please complete the address form or clear it before saving.');
        return;
      }

      // Add the form data to addresses
      const updatedAddresses = [...addresses];

      // If setting as primary, unset other primary addresses
      if (formData.isPrimary) {
        updatedAddresses.forEach(addr => addr.isPrimary = false);
      }

      if (editingIndex !== null) {
        updatedAddresses[editingIndex] = formData;
      } else {
        updatedAddresses.push(formData);
      }

      finalAddresses = updatedAddresses;
      console.log('🟡 handleSaveAll - Added form data to addresses:', finalAddresses);
    }

    console.log('🟢 handleSaveAll - Final addresses to save:', finalAddresses);
    console.log('🟢 handleSaveAll - Number of addresses to save:', finalAddresses.length);

    try {
      setSaving(true);
      await onSave(finalAddresses);
      console.log('✅ handleSaveAll - Save completed successfully');
      onClose();
    } catch (error) {
      console.error('❌ handleSaveAll - Error saving addresses:', error);
      alert('Failed to save addresses. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasteFromCenter = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const lines = text.split('\n').filter(line => line.trim());
      if (lines.length > 0) {
        setFormData(prev => ({
          ...prev,
          addressLine1: lines[0] || prev.addressLine1,
          addressLine2: lines[1] || prev.addressLine2,
          locality: lines[2] || prev.locality,
        }));
      }
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Side Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-4xl bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">Address & Contact Management</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Address List */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900">Saved Addresses</h3>
                <button
                  onClick={handleAddNew}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Plus className="h-4 w-4" />
                  Add New Address
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No addresses added yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((address, index) => (
                    <div
                      key={address.id}
                      className={`p-4 border rounded-lg ${
                        address.isActive ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50'
                      } ${address.isPrimary ? 'ring-2 ring-blue-500' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                              address.type === 'Home' ? 'bg-green-100 text-green-700' :
                              address.type === 'Work' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {address.type}
                            </span>
                            {address.isPrimary && (
                              <span className="px-2 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-700">
                                Primary
                              </span>
                            )}
                            <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                              address.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {address.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-700">
                            <p>{address.addressLine1}</p>
                            {address.addressLine2 && <p>{address.addressLine2}</p>}
                            {address.locality && <p>{address.locality}</p>}
                            <p>
                              {address.city}, {address.state} - {address.pincode}
                            </p>
                            <p>{address.country}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => handleEdit(index)}
                            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => setShowStatusConfirm({index, status: !address.isActive})}
                            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                            title={address.isActive ? 'Deactivate' : 'Activate'}
                          >
                            <Check className={`h-4 w-4 ${address.isActive ? 'text-green-600' : 'text-gray-400'}`} />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(index)}
                            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Address Form */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                {editingIndex !== null ? 'Edit Address' : 'Add New Address'}
              </h3>

              <div className="space-y-6">
                {/* Paste from Center Button */}
                <div className="flex justify-start">
                  <button
                    onClick={handlePasteFromCenter}
                    className="flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition-colors text-sm"
                  >
                    <Copy className="h-4 w-4" />
                    Paste from center
                  </button>
                </div>

                {/* Address Type & Status */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Address Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => handleChange('type', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                    >
                      {ADDRESS_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isPrimary}
                        onChange={(e) => handleChange('isPrimary', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Set as Primary</span>
                    </label>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => handleChange('isActive', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Active</span>
                    </label>
                  </div>
                </div>

                {/* Address Section */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Address</h4>

                  {/* Address Line 1 & 2 */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <input
                        type="text"
                        value={formData.addressLine1}
                        onChange={(e) => handleChange('addressLine1', e.target.value)}
                        placeholder="Address line 1"
                        className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.addressLine1 ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.addressLine1 && (
                        <p className="text-xs text-red-500 mt-1">{errors.addressLine1}</p>
                      )}
                    </div>
                    <div>
                      <input
                        type="text"
                        value={formData.addressLine2}
                        onChange={(e) => handleChange('addressLine2', e.target.value)}
                        placeholder="Address line 2"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Locality, City, Pin code */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.locality}
                        onChange={(e) => handleChange('locality', e.target.value)}
                        placeholder="Locality"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => copyFromField('locality', 'city')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        title="Copy to City"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleChange('city', e.target.value)}
                        placeholder="City"
                        className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 ${
                          errors.city ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => copyFromField('city', 'locality')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        title="Copy to Locality"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      {errors.city && (
                        <p className="text-xs text-red-500 mt-1">{errors.city}</p>
                      )}
                    </div>
                    <div>
                      <input
                        type="text"
                        value={formData.pincode}
                        onChange={(e) => handleChange('pincode', e.target.value)}
                        placeholder="Pin code"
                        maxLength={6}
                        className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.pincode ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.pincode && (
                        <p className="text-xs text-red-500 mt-1">{errors.pincode}</p>
                      )}
                    </div>
                  </div>

                  {/* State & Country */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">State</label>
                      <select
                        value={formData.state}
                        onChange={(e) => handleChange('state', e.target.value)}
                        className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white ${
                          errors.state ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select State</option>
                        {INDIAN_STATES.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                      {errors.state && (
                        <p className="text-xs text-red-500 mt-1">{errors.state}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Country</label>
                      <select
                        value={formData.country}
                        onChange={(e) => handleChange('country', e.target.value)}
                        className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white ${
                          errors.country ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select Country</option>
                        {COUNTRIES.map(country => (
                          <option key={country} value={country}>{country}</option>
                        ))}
                      </select>
                      {errors.country && (
                        <p className="text-xs text-red-500 mt-1">{errors.country}</p>
                      )}
                    </div>
                  </div>

                  {/* Area Code & Landline */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <input
                        type="text"
                        value={formData.areaCode}
                        onChange={(e) => handleChange('areaCode', e.target.value)}
                        placeholder="Area Code"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="text"
                        value={formData.landlineNumber}
                        onChange={(e) => handleChange('landlineNumber', e.target.value)}
                        placeholder="Landline number"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Other Contacts Section */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Other Contacts</h4>

                  {/* Emergency Contact */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <input
                        type="text"
                        value={formData.emergencyContactName}
                        onChange={(e) => handleChange('emergencyContactName', e.target.value)}
                        placeholder="Emergency contact name"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={formData.emergencyContactNumber}
                        onChange={(e) => handleChange('emergencyContactNumber', e.target.value)}
                        placeholder="Emergency contact number"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Spouse Details */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <input
                        type="text"
                        value={formData.spouseName}
                        onChange={(e) => handleChange('spouseName', e.target.value)}
                        placeholder="Spouse Name"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={formData.spouseContactNumber}
                        onChange={(e) => handleChange('spouseContactNumber', e.target.value)}
                        placeholder="Spouse Contact Number"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* General Practitioner */}
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-600 mb-1">General Practitioner</label>
                      <select
                        value={formData.generalPractitioner}
                        onChange={(e) => handleChange('generalPractitioner', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                      >
                        <option value="">Select General Practitioner</option>
                        <option value="Dr. Smith">Dr. Smith</option>
                        <option value="Dr. Johnson">Dr. Johnson</option>
                        <option value="Dr. Williams">Dr. Williams</option>
                        <option value="Dr. Brown">Dr. Brown</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      className="mt-5 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Form Action Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSaveAddress}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    {editingIndex !== null ? 'Update Address' : 'Add Address'}
                  </button>
                  {editingIndex !== null && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(emptyAddress());
                        setEditingIndex(null);
                        setErrors({});
                      }}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Address</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete this address? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteAddress(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Confirmation Dialog */}
      {showStatusConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {showStatusConfirm.status ? 'Activate' : 'Deactivate'} Address
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to {showStatusConfirm.status ? 'activate' : 'deactivate'} this address?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowStatusConfirm(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleToggleStatus(showStatusConfirm.index, showStatusConfirm.status)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  showStatusConfirm.status
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {showStatusConfirm.status ? 'Activate' : 'Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
