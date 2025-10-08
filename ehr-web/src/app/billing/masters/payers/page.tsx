'use client';

import React, { useState, useEffect } from 'react';
import { Building2, Plus, Search, Edit, Trash2, Globe, Phone, Mail, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import billingService from '@/services/billing.service';

interface Payer {
  id: string;
  payer_id: string;
  name: string;
  payer_type: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  zip_code: string;
  website?: string;
  claim_submission_method: string;
  eligibility_check_enabled: boolean;
  prior_auth_required: boolean;
  created_at: string;
}

export default function PayersPage() {
  const [payers, setPayers] = useState<Payer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);
  const [editingPayer, setEditingPayer] = useState<Payer | null>(null);
  const [filterType, setFilterType] = useState('all');
  const [formData, setFormData] = useState({
    payer_id: '',
    name: '',
    payer_type: 'commercial',
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    zip_code: '',
    website: '',
    claim_submission_method: 'electronic',
    eligibility_check_enabled: true,
    prior_auth_required: false,
  });

  useEffect(() => {
    loadPayers();
  }, []);

  const loadPayers = async () => {
    try {
      setLoading(true);
      const data = await billingService.getPayers();
      setPayers(data);
    } catch (error) {
      console.error('Failed to load payers:', error);
      setPayers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPayer) {
        await billingService.updatePayer(editingPayer.id, formData);
      } else {
        await billingService.createPayer(formData);
      }
      setShowSidebar(false);
      resetForm();
      loadPayers();
    } catch (error) {
      console.error('Failed to save payer:', error);
      alert('Failed to save payer');
    }
  };

  const handleEdit = (payer: Payer) => {
    setEditingPayer(payer);
    setFormData({
      payer_id: payer.payer_id,
      name: payer.name,
      payer_type: payer.payer_type,
      contact_name: payer.contact_name,
      contact_phone: payer.contact_phone,
      contact_email: payer.contact_email,
      address_line1: payer.address_line1,
      address_line2: payer.address_line2 || '',
      city: payer.city,
      state: payer.state,
      zip_code: payer.zip_code,
      website: payer.website || '',
      claim_submission_method: payer.claim_submission_method,
      eligibility_check_enabled: payer.eligibility_check_enabled,
      prior_auth_required: payer.prior_auth_required,
    });
    setShowSidebar(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this payer?')) return;
    try {
      await billingService.deletePayer(id);
      loadPayers();
    } catch (error) {
      console.error('Failed to delete payer:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      payer_id: '',
      name: '',
      payer_type: 'commercial',
      contact_name: '',
      contact_phone: '',
      contact_email: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      zip_code: '',
      website: '',
      claim_submission_method: 'electronic',
      eligibility_check_enabled: true,
      prior_auth_required: false,
    });
    setEditingPayer(null);
  };

  const getPayerTypeBadge = (type: string) => {
    switch (type) {
      case 'commercial':
        return 'bg-blue-100 text-blue-800';
      case 'medicare':
        return 'bg-green-100 text-green-800';
      case 'medicaid':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPayers = payers.filter((payer) => {
    const matchesSearch = payer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payer.payer_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || payer.payer_type === filterType;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Insurance Payers</h1>
            <p className="text-gray-600 mt-2">
              Manage insurance companies and payer information
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowSidebar(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Add Payer
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterType === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({payers.length})
            </button>
            <button
              onClick={() => setFilterType('commercial')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterType === 'commercial'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Commercial ({payers.filter(p => p.payer_type === 'commercial').length})
            </button>
            <button
              onClick={() => setFilterType('medicare')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterType === 'medicare'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Medicare ({payers.filter(p => p.payer_type === 'medicare').length})
            </button>
            <button
              onClick={() => setFilterType('medicaid')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterType === 'medicaid'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Medicaid ({payers.filter(p => p.payer_type === 'medicaid').length})
            </button>
          </div>

          <input
            type="text"
            placeholder="Search payers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Payers List */}
      <div className="space-y-4">
        {filteredPayers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No payers found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterType !== 'all'
                ? 'Try adjusting your filters'
                : 'Get started by adding your first insurance payer'}
            </p>
            {!searchTerm && filterType === 'all' && (
              <button
                onClick={() => {
                  resetForm();
                  setShowSidebar(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                + Add Payer
              </button>
            )}
          </div>
        ) : (
          filteredPayers.map((payer) => (
            <div
              key={payer.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-300 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-semibold text-gray-900">{payer.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPayerTypeBadge(payer.payer_type)}`}>
                      {payer.payer_type.charAt(0).toUpperCase() + payer.payer_type.slice(1)}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-mono">
                      {payer.payer_id}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      {payer.contact_email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      {payer.contact_phone}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building2 className="h-4 w-4" />
                      {payer.city}, {payer.state}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {payer.eligibility_check_enabled && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Eligibility Check
                      </span>
                    )}
                    {payer.prior_auth_required && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Prior Auth Required
                      </span>
                    )}
                    {payer.website && (
                      <a
                        href={payer.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs flex items-center gap-1 hover:bg-blue-200"
                      >
                        <Globe className="h-3 w-3" />
                        Website
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(payer)}
                    className="px-3 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(payer.id)}
                    className="px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Sidebar Form */}
      {showSidebar && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => {
              setShowSidebar(false);
              resetForm();
            }}
          ></div>
          <div className="fixed right-0 top-0 h-full w-[500px] bg-white shadow-2xl z-50 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingPayer ? 'Edit Payer' : 'Add New Payer'}
                </h2>
                <button
                  onClick={() => {
                    setShowSidebar(false);
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                <div className="space-y-4">
                  <div>
                    <Label>Payer Name *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Blue Cross Blue Shield"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Payer ID *</Label>
                      <Input
                        value={formData.payer_id}
                        onChange={(e) => setFormData({ ...formData, payer_id: e.target.value })}
                        placeholder="e.g., 12345"
                        required
                      />
                    </div>
                    <div>
                      <Label>Payer Type *</Label>
                      <select
                        value={formData.payer_type}
                        onChange={(e) => setFormData({ ...formData, payer_type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="commercial">Commercial</option>
                        <option value="medicare">Medicare</option>
                        <option value="medicaid">Medicaid</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div>
                    <Label>Contact Name *</Label>
                    <Input
                      value={formData.contact_name}
                      onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        value={formData.contact_email}
                        onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label>Phone *</Label>
                      <Input
                        type="tel"
                        value={formData.contact_phone}
                        onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Website</Label>
                    <Input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://www.payerwebsite.com"
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>
                <div className="space-y-4">
                  <div>
                    <Label>Address Line 1 *</Label>
                    <Input
                      value={formData.address_line1}
                      onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Address Line 2</Label>
                    <Input
                      value={formData.address_line2}
                      onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>City *</Label>
                      <Input
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label>State *</Label>
                      <Input
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        maxLength={2}
                        placeholder="CA"
                        required
                      />
                    </div>
                    <div>
                      <Label>ZIP *</Label>
                      <Input
                        value={formData.zip_code}
                        onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Settings */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Settings</h3>
                <div className="space-y-4">
                  <div>
                    <Label>Claim Submission Method *</Label>
                    <select
                      value={formData.claim_submission_method}
                      onChange={(e) => setFormData({ ...formData, claim_submission_method: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="electronic">Electronic (EDI)</option>
                      <option value="paper">Paper</option>
                      <option value="portal">Portal</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.eligibility_check_enabled}
                        onChange={(e) => setFormData({ ...formData, eligibility_check_enabled: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">Eligibility Check Enabled</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.prior_auth_required}
                        onChange={(e) => setFormData({ ...formData, prior_auth_required: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">Prior Authorization Required</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowSidebar(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingPayer ? 'Update Payer' : 'Add Payer'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
