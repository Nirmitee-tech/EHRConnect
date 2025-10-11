'use client';

import React from 'react';
import { X, Phone, MapPin, MessageCircle, CreditCard, Clock, Edit3, UserX, UserCheck, XCircle, Copy } from 'lucide-react';
import { Appointment } from '@/types/appointment';

interface AppointmentDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onEdit: (appointment: Appointment) => void;
  onMissed: (appointment: Appointment) => void;
  onCheckIn: (appointment: Appointment) => void;
  onCancel: (appointment: Appointment) => void;
  onCopy: (appointment: Appointment) => void;
}

export function AppointmentDetailsDrawer({
  isOpen,
  onClose,
  appointment,
  onEdit,
  onMissed,
  onCheckIn,
  onCancel,
  onCopy
}: AppointmentDetailsDrawerProps) {
  if (!isOpen || !appointment) return null;

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const appointmentDate = new Date(d);
    appointmentDate.setHours(0, 0, 0, 0);

    if (appointmentDate.getTime() === today.getTime()) {
      return 'today';
    } else {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-50"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <Clock className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">{appointment.patientName}</h2>
              <span className="text-xs text-gray-500">#{appointment.id.substring(0, 8).toUpperCase()}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
          >
            <X className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        {/* Quick Status Change */}
        <div className="border-b border-gray-200 px-4 py-2 bg-white">
          <div className="text-xs text-gray-500 mb-2">Quick Status</div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                onCheckIn(appointment);
                onClose();
              }}
              className="flex-1 px-2 py-1.5 text-xs font-medium bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors"
            >
              Check-In
            </button>
            <button
              onClick={() => {
                onMissed(appointment);
                onClose();
              }}
              className="flex-1 px-2 py-1.5 text-xs font-medium bg-orange-50 text-orange-700 rounded hover:bg-orange-100 transition-colors"
            >
              No-Show
            </button>
            <button
              onClick={() => {
                onCancel(appointment);
                onClose();
              }}
              className="flex-1 px-2 py-1.5 text-xs font-medium bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Contact Quick Actions */}
          <div className="bg-white border border-gray-200 rounded p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-medium text-gray-700">Contact</div>
              <div className="text-xs text-gray-500">+91 9767377819</div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs font-medium">
                <Phone className="h-3 w-3" />
                Call
              </button>
              <button className="px-2 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
                <MapPin className="h-3 w-3" />
              </button>
              <button className="px-2 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
                <MessageCircle className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="bg-white border border-gray-200 rounded p-3 border-l-2 border-l-blue-600">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="text-sm font-semibold text-gray-900 mb-1">
                  {appointment.practitionerName}
                </div>
                <div className="text-xs text-gray-600">
                  {appointment.appointmentType || 'Consultation'}
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                appointment.status === 'scheduled' ? 'bg-gray-200 text-gray-700' :
                appointment.status === 'in-progress' ? 'bg-red-100 text-red-700' :
                appointment.status === 'completed' ? 'bg-green-100 text-green-700' :
                'bg-gray-100 text-gray-600'
              }`}>
                {appointment.status}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTime(appointment.startTime)} {formatDate(appointment.startTime)}
              </div>
              <span>•</span>
              <span>{appointment.duration} mins</span>
            </div>
          </div>

          {/* Payment Due */}
          <div className="bg-white border border-gray-200 rounded p-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-xs text-red-600 font-medium">Payment Due</div>
                <div className="text-xl font-bold text-gray-900 mt-1">₹ 0.00</div>
              </div>
              <CreditCard className="h-4 w-4 text-gray-400" />
            </div>
            <button className="w-full py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs font-medium">
              Bill & Collect
            </button>
          </div>

          {/* Notes Section */}
          <div className="bg-white border border-gray-200 rounded p-3">
            <div className="text-xs font-medium text-gray-700 mb-2">Notes</div>
            <textarea
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              placeholder="Add notes about this appointment..."
              defaultValue={appointment.notes}
            />
          </div>

          {/* More Actions */}
          <div className="bg-white border border-gray-200 rounded p-3">
            <div className="text-xs font-medium text-gray-700 mb-2">Actions</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onEdit(appointment);
                  onClose();
                }}
                className="flex items-center justify-center gap-1.5 px-2 py-1.5 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors text-blue-700 text-xs font-medium"
              >
                <Edit3 className="h-3 w-3" />
                Edit
              </button>
              <button
                onClick={() => {
                  onCopy(appointment);
                  onClose();
                }}
                className="flex items-center justify-center gap-1.5 px-2 py-1.5 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors text-blue-700 text-xs font-medium"
              >
                <Copy className="h-3 w-3" />
                Copy
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-gray-50 border border-gray-200 rounded p-3">
            <div className="text-xs font-medium text-gray-700 mb-2">Quick Links</div>
            <div className="space-y-1.5">
              <button className="w-full text-left px-2 py-1.5 text-xs text-blue-700 hover:bg-white rounded transition-colors">
                View Patient Record →
              </button>
              <button className="w-full text-left px-2 py-1.5 text-xs text-blue-700 hover:bg-white rounded transition-colors">
                View Medical History →
              </button>
              <button className="w-full text-left px-2 py-1.5 text-xs text-blue-700 hover:bg-white rounded transition-colors">
                Prescriptions →
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
