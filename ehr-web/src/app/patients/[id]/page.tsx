'use client';

import React, { useState } from 'react';
import { User, Edit, Calendar, ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface PatientDetails {
  id: string;
  name: string;
  hasUnknownGestire: boolean;
  phone: string;
  email: string;
  address: string;
  avatar: string;
}

const mockPatientDetails: PatientDetails = {
  id: '1',
  name: 'Willie Jennie',
  hasUnknownGestire: true,
  phone: '(386) 316-4463',
  email: 'willie.jennie@email.com',
  address: '8309 Barley Hill',
  avatar: '/api/placeholder/64/64'
};

export default function PatientDetailPage() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState<'information' | 'appointments' | 'treatment' | 'medical'>('medical');
  const [patient] = useState(mockPatientDetails);

  const tabs = [
    { id: 'information', label: 'Patient information' },
    { id: 'appointments', label: 'Appointment History' },
    { id: 'treatment', label: 'Next Treatment' },
    { id: 'medical', label: 'Medical Record' }
  ];

  const services = [
    { id: 'medical', label: 'Medical', active: false },
    { id: 'cosmetic', label: 'Cosmetic', active: false }
  ];

  return (
    <div className="space-y-6">
      {/* Header with Breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/patients" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Link href="/patients" className="hover:text-gray-700">Patient list</Link>
            <span>•</span>
            <span className="text-gray-900 font-medium">Patient detail</span>
          </div>
        </div>

        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          Create Appointment
        </Button>
      </div>

      {/* Patient Info Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{patient.name}</h2>
              {patient.hasUnknownGestire && (
                <div className="flex items-center mt-1">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Have unknown gestire</span>
                </div>
              )}
            </div>
          </div>
          
          <Link href={`/patients/${patient.id}/edit`}>
            <Button variant="outline" className="flex items-center space-x-2">
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg border border-gray-200">
        {activeTab === 'information' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Patient Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">No</label>
                <div className="text-sm text-gray-900">Yes (tooth number 11.2)</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Yes</label>
                <div className="text-sm text-gray-900">No</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Appointment History</h3>
            <p className="text-gray-500">No appointment history available.</p>
          </div>
        )}

        {activeTab === 'treatment' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Next Treatment</h3>
            <p className="text-gray-500">No upcoming treatments scheduled.</p>
          </div>
        )}

        {activeTab === 'medical' && (
          <div className="p-6">
            {/* Service Tabs */}
            <div className="flex space-x-4 mb-6">
              <span className="text-sm font-medium text-gray-700">Service</span>
              {services.map((service) => (
                <button
                  key={service.id}
                  className={`
                    px-3 py-1 text-sm rounded-full
                    ${service.active
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                  `}
                >
                  {service.label}
                </button>
              ))}
            </div>

            {/* Odontogram Section */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold mb-4">Odontogram</h4>
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                {/* Simple tooth diagram representation */}
                <div className="grid grid-cols-8 gap-2 max-w-md mx-auto mb-4">
                  {Array.from({ length: 32 }, (_, i) => (
                    <div
                      key={i}
                      className={`
                        w-8 h-8 border-2 rounded flex items-center justify-center text-xs font-medium
                        ${i === 10 || i === 21 ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 bg-white text-gray-500'}
                      `}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-gray-600">
                  Interactive tooth diagram for treatment planning
                </div>
              </div>
            </div>

            {/* Treatment Details */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-gray-900">Maxillary Left Lateral Incisor</h4>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">03</span>
                  <span className="text-sm text-gray-600">Caries</span>
                  <span className="text-sm text-gray-600">Advanced Decay</span>
                  <span className="text-sm text-gray-600">Tooth filling</span>
                  <span className="text-sm text-gray-600">Drg Soap Mactavish</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
