'use client';

import React, { useState } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { InsuranceData } from '@/types/encounter';

interface InsuranceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  insurance?: InsuranceData | null;
  onSave: (insurance: InsuranceData) => Promise<void>;
}

export function InsuranceDrawer({ isOpen, onClose, insurance, onSave }: InsuranceDrawerProps) {
  const [formData, setFormData] = useState<Partial<InsuranceData>>(
    insurance || {
      id: Date.now().toString(),
      type: 'primary',
      insuranceName: '',
      planType: '',
      memberId: '',
      groupId: '',
      groupName: '',
      planName: '',
      relationship: 'self',
      isPrimary: true,
      isActive: true,
      verificationStatus: 'not-verified'
    }
  );

  const [frontImagePreview, setFrontImagePreview] = useState<string | null>(
    insurance?.cardFrontImage || null
  );
  const [backImagePreview, setBackImagePreview] = useState<string | null>(
    insurance?.cardBackImage || null
  );

  const handleFileUpload = (file: File, side: 'front' | 'back') => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (side === 'front') {
        setFrontImagePreview(base64String);
        setFormData({ ...formData, cardFrontImage: base64String });
      } else {
        setBackImagePreview(base64String);
        setFormData({ ...formData, cardBackImage: base64String });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.insuranceName || !formData.memberId) {
      alert('Please fill in required fields: Insurance Name and Member ID');
      return;
    }

    try {
      await onSave(formData as InsuranceData);
      onClose();
    } catch (error) {
      console.error('Failed to save insurance:', error);
      alert('Failed to save insurance information');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-end bg-black bg-opacity-50">
      <div className="bg-white h-full w-full max-w-2xl flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">
            {insurance ? 'Edit Insurance' : 'Add Insurance'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form Content - Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-6 py-6 space-y-6">
            {/* Insurance Type and Insurance Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Insurance Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select</option>
                  <option value="primary">Primary</option>
                  <option value="secondary">Secondary</option>
                  <option value="tertiary">Tertiary</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Insurance Name <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.insuranceName}
                  onChange={(e) => setFormData({ ...formData, insuranceName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select</option>
                  <option value="Blue Cross Blue Shield">Blue Cross Blue Shield</option>
                  <option value="UnitedHealthcare">UnitedHealthcare</option>
                  <option value="Aetna">Aetna</option>
                  <option value="Cigna">Cigna</option>
                  <option value="Humana">Humana</option>
                  <option value="Kaiser Permanente">Kaiser Permanente</option>
                  <option value="Anthem">Anthem</option>
                  <option value="Medicare">Medicare</option>
                  <option value="Medicaid">Medicaid</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Member ID and Plan Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Member ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.memberId}
                  onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                  placeholder="Enter Member ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plan Name
                </label>
                <input
                  type="text"
                  value={formData.planName || ''}
                  onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
                  placeholder="Enter Plan Name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Plan Type and Group Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plan Type
                </label>
                <input
                  type="text"
                  value={formData.planType}
                  onChange={(e) => setFormData({ ...formData, planType: e.target.value })}
                  placeholder="Enter Plan Type"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group Name
                </label>
                <input
                  type="text"
                  value={formData.groupName || ''}
                  onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                  placeholder="Enter Group Name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Group ID and Effective Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group ID
                </label>
                <input
                  type="text"
                  value={formData.groupId || ''}
                  onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                  placeholder="Enter Group ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Effective Start Date & End Date
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={formData.effectiveStartDate ? new Date(formData.effectiveStartDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => setFormData({ ...formData, effectiveStartDate: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="date"
                    value={formData.effectiveEndDate ? new Date(formData.effectiveEndDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => setFormData({ ...formData, effectiveEndDate: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Patient Relationship To Insured */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patient Relationship To Insured
              </label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="relationship"
                    value="self"
                    checked={formData.relationship === 'self'}
                    onChange={(e) => setFormData({ ...formData, relationship: e.target.value as any })}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Self</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="relationship"
                    value="spouse"
                    checked={formData.relationship === 'spouse'}
                    onChange={(e) => setFormData({ ...formData, relationship: e.target.value as any })}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Spouse</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="relationship"
                    value="child"
                    checked={formData.relationship === 'child'}
                    onChange={(e) => setFormData({ ...formData, relationship: e.target.value as any })}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Child</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="relationship"
                    value="other"
                    checked={formData.relationship === 'other'}
                    onChange={(e) => setFormData({ ...formData, relationship: e.target.value as any })}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Other</span>
                </label>
              </div>
            </div>

            {/* Upload Insurance Card */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Insurance Card
              </label>
              <div className="grid grid-cols-2 gap-4">
                {/* Front Side */}
                <div>
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
                    onClick={() => document.getElementById('front-upload')?.click()}
                  >
                    {frontImagePreview ? (
                      <div className="relative">
                        <img
                          src={frontImagePreview}
                          alt="Front of card"
                          className="max-h-40 mx-auto rounded"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFrontImagePreview(null);
                            setFormData({ ...formData, cardFrontImage: undefined });
                          }}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-10 w-10 text-blue-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 font-medium">Click here to upload Front Side</p>
                        <p className="text-xs text-gray-400 mt-1">Drag & drop your files or <span className="text-blue-600">Browse</span></p>
                      </>
                    )}
                  </div>
                  <input
                    id="front-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'front');
                    }}
                    className="hidden"
                  />
                </div>

                {/* Back Side */}
                <div>
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
                    onClick={() => document.getElementById('back-upload')?.click()}
                  >
                    {backImagePreview ? (
                      <div className="relative">
                        <img
                          src={backImagePreview}
                          alt="Back of card"
                          className="max-h-40 mx-auto rounded"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setBackImagePreview(null);
                            setFormData({ ...formData, cardBackImage: undefined });
                          }}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-10 w-10 text-blue-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 font-medium">Click here to upload Back Image</p>
                        <p className="text-xs text-gray-400 mt-1">Drag & drop your files or <span className="text-blue-600">Browse</span></p>
                      </>
                    )}
                  </div>
                  <input
                    id="back-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'back');
                    }}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Save Insurance
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
