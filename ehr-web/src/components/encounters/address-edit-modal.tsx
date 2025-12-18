'use client';

import React, { useState } from 'react';
import { X, Copy } from 'lucide-react';

interface AddressData {
  addressLine1: string;
  addressLine2: string;
  locality: string;
  city: string;
  pincode: string;
  state: string;
  country: string;
  areaCode: string;
  landlineNumber: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  spouseName: string;
  spouseContactNumber: string;
  generalPractitioner: string;
}

interface AddressEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<AddressData>;
  onSave: (data: AddressData) => void;
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

export function AddressEditModal({
  isOpen,
  onClose,
  initialData = {},
  onSave
}: AddressEditModalProps) {
  const [formData, setFormData] = useState<AddressData>({
    addressLine1: initialData.addressLine1 || '',
    addressLine2: initialData.addressLine2 || '',
    locality: initialData.locality || '',
    city: initialData.city || '',
    pincode: initialData.pincode || '',
    state: initialData.state || '',
    country: initialData.country || 'India',
    areaCode: initialData.areaCode || '',
    landlineNumber: initialData.landlineNumber || '',
    emergencyContactName: initialData.emergencyContactName || '',
    emergencyContactNumber: initialData.emergencyContactNumber || '',
    spouseName: initialData.spouseName || '',
    spouseContactNumber: initialData.spouseContactNumber || '',
    generalPractitioner: initialData.generalPractitioner || ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof AddressData, string>>>({});

  const handleChange = (field: keyof AddressData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
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

  const handleSubmit = () => {
    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  const handlePasteFromCenter = async () => {
    try {
      const text = await navigator.clipboard.readText();
      // Try to parse pasted address (basic implementation)
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Edit Address & Contact Details</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
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

            {/* Address Section */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-4">Address</h3>

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
              <h3 className="text-base font-semibold text-gray-900 mb-4">Other Contacts</h3>

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
                <button className="mt-5 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors">
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors"
          >
            Save Address
          </button>
        </div>
      </div>
    </div>
  );
}
