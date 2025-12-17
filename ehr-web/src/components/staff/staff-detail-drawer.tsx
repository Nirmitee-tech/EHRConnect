'use client';

import React, { useState } from 'react';
import { X, Clock, Calendar, Palette, Plus, Trash2, Save } from 'lucide-react';
import { StaffMember, OfficeHours, VacationSchedule, DEFAULT_OFFICE_HOURS, PROVIDER_COLORS } from '@/types/staff';

interface StaffDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  staff: StaffMember | null;
  onSave: (staff: StaffMember) => void;
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function StaffDetailDrawer({ isOpen, onClose, staff, onSave }: StaffDetailDrawerProps) {
  const [editedStaff, setEditedStaff] = useState<StaffMember | null>(staff);
  const [activeSection, setActiveSection] = useState<'details' | 'hours' | 'vacation' | 'settings'>('details');

  // Update editedStaff when staff prop changes
  React.useEffect(() => {
    if (staff) {
      setEditedStaff(staff);
    }
  }, [staff]);

  if (!isOpen || !editedStaff) return null;

  const isNewStaff = !editedStaff.id;

  const handleSave = () => {
    if (editedStaff) {
      onSave(editedStaff);
      onClose();
    }
  };

  const updateOfficeHours = (dayIndex: number, updates: Partial<OfficeHours>) => {
    const officeHours = editedStaff.officeHours || DEFAULT_OFFICE_HOURS;
    const newHours = [...officeHours];
    newHours[dayIndex] = { ...newHours[dayIndex], ...updates };
    setEditedStaff({ ...editedStaff, officeHours: newHours });
  };

  const addVacation = () => {
    const newVacation: VacationSchedule = {
      id: Date.now().toString(),
      startDate: new Date(),
      endDate: new Date(),
      type: 'vacation'
    };
    setEditedStaff({
      ...editedStaff,
      vacationSchedules: [...(editedStaff.vacationSchedules || []), newVacation]
    });
  };

  const removeVacation = (id: string) => {
    setEditedStaff({
      ...editedStaff,
      vacationSchedules: (editedStaff.vacationSchedules || []).filter(v => v.id !== id)
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-3xl bg-white shadow-2xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {isNewStaff ? 'Add New Staff Member' : editedStaff.name}
                </h2>
                <p className="text-sm text-gray-600">
                  {isNewStaff ? 'Fill in the details below' : editedStaff.specialty}
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Section Tabs */}
            <div className="mt-4 flex space-x-1 border-b">
              {[
                { id: 'details', label: 'Details', icon: null },
                { id: 'hours', label: 'Office Hours', icon: Clock },
                { id: 'vacation', label: 'Vacation/Blocks', icon: Calendar },
                { id: 'settings', label: 'Settings', icon: Palette }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveSection(id as any)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeSection === id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {activeSection === 'details' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={editedStaff.name}
                      onChange={(e) => setEditedStaff({ ...editedStaff, name: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Specialty
                    </label>
                    <input
                      type="text"
                      value={editedStaff.specialty}
                      onChange={(e) => setEditedStaff({ ...editedStaff, specialty: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={editedStaff.phone}
                      onChange={(e) => setEditedStaff({ ...editedStaff, phone: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editedStaff.email}
                      onChange={(e) => setEditedStaff({ ...editedStaff, email: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Employment Type
                    </label>
                    <select
                      value={editedStaff.employmentType || 'full-time'}
                      onChange={(e) => setEditedStaff({ ...editedStaff, employmentType: e.target.value as any })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                      <option value="per-diem">Per Diem</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={editedStaff.active ? 'active' : 'inactive'}
                      onChange={(e) => setEditedStaff({ ...editedStaff, active: e.target.value === 'active' })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'hours' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Office Hours</h3>
                  <p className="text-sm text-gray-600">Set working hours for each day</p>
                </div>

                {(editedStaff.officeHours || DEFAULT_OFFICE_HOURS).map((hours, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="w-24">
                      <span className="text-sm font-medium text-gray-900">
                        {DAYS_OF_WEEK[hours.dayOfWeek]}
                      </span>
                    </div>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={hours.isWorking}
                        onChange={(e) => updateOfficeHours(index, { isWorking: e.target.checked })}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="ml-2 text-sm text-gray-700">Working</span>
                    </label>

                    {hours.isWorking && (
                      <>
                        <input
                          type="time"
                          value={hours.startTime}
                          onChange={(e) => updateOfficeHours(index, { startTime: e.target.value })}
                          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <span className="text-gray-500">to</span>
                        <input
                          type="time"
                          value={hours.endTime}
                          onChange={(e) => updateOfficeHours(index, { endTime: e.target.value })}
                          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeSection === 'vacation' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Vacation & Blocked Time</h3>
                  <button
                    onClick={addVacation}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Add Block
                  </button>
                </div>

                {(editedStaff.vacationSchedules || []).length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p>No blocked time scheduled</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(editedStaff.vacationSchedules || []).map((vacation) => (
                      <div
                        key={vacation.id}
                        className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex-1 grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Type
                            </label>
                            <select
                              value={vacation.type}
                              onChange={(e) => {
                                const updated = editedStaff.vacationSchedules?.map(v =>
                                  v.id === vacation.id ? { ...v, type: e.target.value as any } : v
                                );
                                setEditedStaff({ ...editedStaff, vacationSchedules: updated });
                              }}
                              className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                            >
                              <option value="vacation">Vacation</option>
                              <option value="sick">Sick Leave</option>
                              <option value="personal">Personal</option>
                              <option value="conference">Conference</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Start Date
                            </label>
                            <input
                              type="date"
                              value={new Date(vacation.startDate).toISOString().split('T')[0]}
                              onChange={(e) => {
                                const updated = editedStaff.vacationSchedules?.map(v =>
                                  v.id === vacation.id ? { ...v, startDate: new Date(e.target.value) } : v
                                );
                                setEditedStaff({ ...editedStaff, vacationSchedules: updated });
                              }}
                              className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              End Date
                            </label>
                            <input
                              type="date"
                              value={new Date(vacation.endDate).toISOString().split('T')[0]}
                              onChange={(e) => {
                                const updated = editedStaff.vacationSchedules?.map(v =>
                                  v.id === vacation.id ? { ...v, endDate: new Date(e.target.value) } : v
                                );
                                setEditedStaff({ ...editedStaff, vacationSchedules: updated });
                              }}
                              className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => removeVacation(vacation.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeSection === 'settings' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Calendar Color
                  </label>
                  <div className="grid grid-cols-5 gap-3">
                    {PROVIDER_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setEditedStaff({ ...editedStaff, color })}
                        className={`h-12 rounded-lg transition-all ${editedStaff.color === color
                            ? 'ring-4 ring-offset-2 ring-primary/50'
                            : 'hover:scale-105'
                          }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Qualification
                  </label>
                  <input
                    type="text"
                    value={editedStaff.qualification}
                    onChange={(e) => setEditedStaff({ ...editedStaff, qualification: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors"
            >
              <Save className="h-4 w-4" />
              {isNewStaff ? 'Create Staff Member' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
