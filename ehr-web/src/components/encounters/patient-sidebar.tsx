'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  Phone,
  Mail,
  Languages,
  Calendar,
  IdCard,
  Clock,
  FileText,
  Package,
  Maximize2,
  Printer,
  Copy,
  Link,
  Edit,
  Plus,
  ChevronUp,
  ChevronDown,
  Info
} from 'lucide-react';
import { MedicalInfoSidebar } from './medical-info-sidebar';
import { AddressDrawer } from './address-drawer';
import { StickyNotesSection } from './sticky-notes-section';
import { AddressData, NoteData } from '@/types/encounter';

interface PatientSidebarProps {
  patientName: string;
  patientId: string;
  patientGender?: string;
  patientPhone?: string;
  patientEmail?: string;
  patientLanguage?: string;
  relationshipDate?: string;
  groupName?: string;
  groupType?: string;
  membershipType?: string;
  patientHistory?: string;
  patientAllergies?: string;
  patientHabits?: string;
  addresses?: AddressData[];
  socialNotes?: NoteData[];
  internalNotes?: NoteData[];
  currentUserId?: string;
  currentUserName?: string;
  onBack: () => void;
  onUpdateMedicalInfo: (data: {
    patientHistory?: string;
    patientAllergies?: string;
    patientHabits?: string;
  }) => void;
  onUpdateAddresses: (addresses: AddressData[]) => Promise<void>;
  onUpdateSocialNotes: (notes: NoteData[]) => Promise<void>;
  onUpdateInternalNotes: (notes: NoteData[]) => Promise<void>;
}

export function PatientSidebar({
  patientName,
  patientId,
  patientGender = 'Male',
  patientPhone = '+91 9876377819',
  patientEmail = 'support@example.com',
  patientLanguage = 'English',
  relationshipDate = '10 Oct, 2025',
  groupName = 'None',
  groupType = 'Standard',
  membershipType = 'Family',
  patientHistory,
  patientAllergies,
  patientHabits,
  addresses = [],
  socialNotes = [],
  internalNotes = [],
  currentUserId = 'current-user-id',
  currentUserName = 'Current User',
  onBack,
  onUpdateMedicalInfo,
  onUpdateAddresses,
  onUpdateSocialNotes,
  onUpdateInternalNotes
}: PatientSidebarProps) {
  const [addressExpanded, setAddressExpanded] = useState(false);
  const [showAddressDrawer, setShowAddressDrawer] = useState(false);

  // Get primary address for quick display
  const primaryAddress = addresses.find(addr => addr.isPrimary && addr.isActive) || addresses.find(addr => addr.isActive);

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Back Button */}
      <div className="px-3 py-2 border-b border-gray-200 flex-shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* Patient Avatar & Basic Info */}
        <div className="p-3 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {patientName.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-gray-900 text-sm truncate">{patientName}</h2>
              <p className="text-xs text-gray-500">{patientGender} • #{patientId}</p>
            </div>
          </div>

          {/* Contact Info - More Compact */}
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-1.5 text-gray-700">
              <Phone className="h-3 w-3 text-gray-400 flex-shrink-0" />
              <span className="truncate">{patientPhone}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-700">
              <Mail className="h-3 w-3 text-gray-400 flex-shrink-0" />
              <span className="truncate">{patientEmail}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-700">
              <Languages className="h-3 w-3 text-gray-400 flex-shrink-0" />
              <span>{patientLanguage}</span>
            </div>
          </div>

          {/* Action Icons - More Compact */}
          <div className="mt-2 flex items-center gap-1 flex-wrap">
            <button className="p-1 hover:bg-gray-100 rounded transition-colors" title="Calendar">
              <Calendar className="h-3.5 w-3.5 text-gray-500" />
            </button>
            <button className="p-1 hover:bg-gray-100 rounded transition-colors" title="Documents">
              <IdCard className="h-3.5 w-3.5 text-gray-500" />
            </button>
            <button className="p-1 hover:bg-gray-100 rounded transition-colors" title="History">
              <Clock className="h-3.5 w-3.5 text-gray-500" />
            </button>
            <button className="p-1 hover:bg-gray-100 rounded transition-colors" title="Files">
              <FileText className="h-3.5 w-3.5 text-gray-500" />
            </button>
            <button className="p-1 hover:bg-gray-100 rounded transition-colors" title="Package">
              <Package className="h-3.5 w-3.5 text-gray-500" />
            </button>
            <button className="p-1 hover:bg-gray-100 rounded transition-colors" title="Expand">
              <Maximize2 className="h-3.5 w-3.5 text-gray-500" />
            </button>
            <button className="p-1 hover:bg-gray-100 rounded transition-colors" title="Print">
              <Printer className="h-3.5 w-3.5 text-gray-500" />
            </button>
            <button className="p-1 hover:bg-gray-100 rounded transition-colors" title="Copy">
              <Copy className="h-3.5 w-3.5 text-gray-500" />
            </button>
            <button className="p-1 hover:bg-gray-100 rounded transition-colors" title="Link">
              <Link className="h-3.5 w-3.5 text-gray-500" />
            </button>
            <button className="p-1 hover:bg-gray-100 rounded transition-colors" title="Edit">
              <Edit className="h-3.5 w-3.5 text-gray-500" />
            </button>
          </div>

          {/* Communication Buttons - Inline */}
          <div className="mt-2 flex items-center gap-1">
            <button className="flex-1 px-2 py-1 border border-blue-600 text-blue-600 rounded text-xs font-medium hover:bg-blue-50 transition-colors">
              SMS/WA
            </button>
            <button className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors">
              <Plus className="h-3 w-3" />
            </button>
            <button className="flex-1 px-2 py-1 border border-blue-600 text-blue-600 rounded text-xs font-medium hover:bg-blue-50 transition-colors">
              Email
            </button>
            <button className="flex-1 px-2 py-1 border border-blue-600 text-blue-600 rounded text-xs font-medium hover:bg-blue-50 transition-colors">
              Letter
            </button>
          </div>
        </div>

        {/* Relationship, Group, Membership Section - Compact */}
        <div className="p-3 border-b border-gray-200">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-blue-900">Relationship</span>
                  <Info className="h-3 w-3 text-gray-400" />
                </div>
                <p className="text-gray-600 mt-0.5">{relationshipDate}</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-blue-900">Group</span>
                <p className="text-gray-600">{groupName}</p>
              </div>
              <div className="text-right">
                <span className="font-semibold text-blue-900">Ratecard</span>
                <p className="text-gray-600">{groupType}</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-blue-900">Membership</span>
                <p className="text-gray-600">-</p>
              </div>
              <div className="text-right">
                <span className="font-semibold text-blue-900">{membershipType}</span>
                <p className="text-gray-600">-</p>
              </div>
            </div>

            {/* Reviews / Social Icons */}
            <div className="pt-1">
              <p className="text-xs text-gray-500 mb-1">Reviews</p>
              <div className="flex items-center gap-2">
                <button className="text-gray-700 hover:text-gray-900 transition-colors">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
                  </svg>
                </button>
                <button className="text-gray-700 hover:text-gray-900 transition-colors">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </button>
                <button className="text-gray-700 hover:text-gray-900 transition-colors">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Social Notes Section */}
        <StickyNotesSection
          title="Social Notes"
          type="social"
          notes={socialNotes}
          onUpdate={onUpdateSocialNotes}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
        />

        {/* Internal Notes Section */}
        <StickyNotesSection
          title="Internal Notes"
          type="internal"
          notes={internalNotes}
          onUpdate={onUpdateInternalNotes}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
        />

        {/* Address Section - Compact */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => setAddressExpanded(!addressExpanded)}
            className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <h3 className="text-xs font-semibold text-blue-900">Addresses ({addresses.length})</h3>
            {addressExpanded ? (
              <ChevronUp className="h-3.5 w-3.5 text-gray-600" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-gray-600" />
            )}
          </button>
          {addressExpanded && (
            <div className="px-3 pb-3">
              {addresses.length === 0 ? (
                <p className="text-xs text-gray-400 italic py-2">No addresses on record</p>
              ) : (
                <div className="space-y-2 mb-2">
                  {addresses.filter(addr => addr.isActive).map((addr) => (
                    <div
                      key={addr.id}
                      className={`p-2 rounded text-xs ${
                        addr.isPrimary ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${
                          addr.type === 'Home' ? 'bg-green-100 text-green-700' :
                          addr.type === 'Work' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {addr.type}
                        </span>
                        {addr.isPrimary && (
                          <span className="px-1.5 py-0.5 text-xs font-medium rounded bg-blue-600 text-white">
                            Primary
                          </span>
                        )}
                      </div>
                      <div className="text-gray-700">
                        <p>{addr.addressLine1}</p>
                        {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                        <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={() => setShowAddressDrawer(true)}
                className="mt-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                {addresses.length === 0 ? 'Add Address' : 'Manage Addresses'}
              </button>
            </div>
          )}
        </div>

        {/* Status - Compact */}
        <div className="px-3 py-2 border-b border-gray-200">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-green-600">Active</span>
            <button className="text-blue-600 hover:text-blue-700 font-medium">
              Change
            </button>
          </div>
        </div>

        {/* Medical Information */}
        <MedicalInfoSidebar
          patientHistory={patientHistory}
          patientAllergies={patientAllergies}
          patientHabits={patientHabits}
          onUpdate={onUpdateMedicalInfo}
        />
      </div>

      {/* Address Drawer */}
      <AddressDrawer
        isOpen={showAddressDrawer}
        onClose={() => setShowAddressDrawer(false)}
        patientId={patientId}
        addresses={addresses}
        onSave={onUpdateAddresses}
      />
    </div>
  );
}
