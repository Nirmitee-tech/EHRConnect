'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { AppointmentType, DEFAULT_APPOINTMENT_TYPES, PROVIDER_COLORS } from '@/types/staff';
import { AppointmentTypesService } from '@/services/appointment-types.service';

export default function AppointmentTypesPage() {
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([]);
  const [editingType, setEditingType] = useState<AppointmentType | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load appointment types on mount
  useEffect(() => {
    loadAppointmentTypes();
  }, []);

  const loadAppointmentTypes = async () => {
    setLoading(true);
    try {
      const types = await AppointmentTypesService.getAppointmentTypes();
      // If no types exist, seed with defaults
      if (types.length === 0) {
        setAppointmentTypes(DEFAULT_APPOINTMENT_TYPES);
      } else {
        setAppointmentTypes(types);
      }
    } catch (error) {
      console.error('Error loading appointment types:', error);
      // Fall back to defaults on error
      setAppointmentTypes(DEFAULT_APPOINTMENT_TYPES);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    const newType: AppointmentType = {
      id: Date.now().toString(),
      name: '',
      duration: 30,
      color: PROVIDER_COLORS[0],
      category: 'consultation',
      description: ''
    };
    setEditingType(newType);
    setIsCreating(true);
  };

  const handleEdit = (type: AppointmentType) => {
    setEditingType({ ...type });
    setIsCreating(false);
  };

  const handleSave = async () => {
    if (!editingType) return;

    setSaving(true);
    try {
      if (isCreating) {
        const created = await AppointmentTypesService.createAppointmentType(editingType);
        setAppointmentTypes([...appointmentTypes, created]);
      } else {
        const updated = await AppointmentTypesService.updateAppointmentType(editingType.id, editingType);
        setAppointmentTypes(
          appointmentTypes.map(t => t.id === editingType.id ? updated : t)
        );
      }

      setEditingType(null);
      setIsCreating(false);
    } catch (error) {
      console.error('Error saving appointment type:', error);
      alert('Failed to save appointment type. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this appointment type?')) {
      return;
    }

    try {
      await AppointmentTypesService.deleteAppointmentType(id);
      setAppointmentTypes(appointmentTypes.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting appointment type:', error);
      alert('Failed to delete appointment type. Please try again.');
    }
  };

  const handleCancel = () => {
    setEditingType(null);
    setIsCreating(false);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/settings"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Appointment Types</h1>
            <p className="text-gray-600 mt-1">
              Configure appointment types, durations, and categories
            </p>
          </div>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Type
        </button>
      </div>

      {/* Edit/Create Form */}
      {editingType && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {isCreating ? 'Create New Appointment Type' : 'Edit Appointment Type'}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editingType.name}
                onChange={(e) => setEditingType({ ...editingType, name: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="e.g., General Consultation"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category<span className="text-red-500">*</span>
              </label>
              <select
                value={editingType.category}
                onChange={(e) => setEditingType({ ...editingType, category: e.target.value as any })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="consultation">Consultation</option>
                <option value="follow-up">Follow-up</option>
                <option value="emergency">Emergency</option>
                <option value="routine">Routine</option>
                <option value="surgery">Surgery</option>
                <option value="online">Online</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (minutes)<span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={editingType.duration}
                onChange={(e) => setEditingType({ ...editingType, duration: parseInt(e.target.value) || 0 })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                min="5"
                step="5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color<span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                {PROVIDER_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setEditingType({ ...editingType, color })}
                    className={`w-10 h-10 rounded-lg transition-all ${
                      editingType.color === color
                        ? 'ring-2 ring-offset-2 ring-blue-500 scale-110'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={editingType.description || ''}
                onChange={(e) => setEditingType({ ...editingType, description: e.target.value })}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Brief description of this appointment type..."
              />
            </div>
            <div className="col-span-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editingType.requiresPreparation || false}
                  onChange={(e) => setEditingType({ ...editingType, requiresPreparation: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Requires preparation</span>
              </label>
            </div>
            {editingType.requiresPreparation && (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preparation Instructions
                </label>
                <textarea
                  value={editingType.preparationInstructions || ''}
                  onChange={(e) => setEditingType({ ...editingType, preparationInstructions: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g., Fasting for 8 hours before appointment..."
                />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!editingType.name || saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Appointment Types List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Color
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {appointmentTypes.map((type) => (
              <tr key={type.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="text-sm font-semibold text-gray-900">{type.name}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-700 capitalize">
                    {type.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-700">{type.duration} min</div>
                </td>
                <td className="px-6 py-4">
                  <div
                    className="w-8 h-8 rounded-lg"
                    style={{ backgroundColor: type.color }}
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-600 max-w-xs truncate">
                    {type.description || '-'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleEdit(type)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(type.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
