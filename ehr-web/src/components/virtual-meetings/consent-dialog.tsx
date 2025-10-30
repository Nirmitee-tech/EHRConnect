'use client';

import React, { useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle, FileText, Shield, Video, Activity } from 'lucide-react';

interface ConsentItem {
  id: string;
  type: 'recording' | 'vitals_capture' | 'screen_sharing' | 'data_storage' | 'general';
  title: string;
  description: string;
  icon: React.ReactNode;
  required: boolean;
  legalText: string;
}

interface ConsentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConsent: (consents: Record<string, boolean>) => Promise<void>;
  patientName?: string;
  meetingId: string;
  consentItems?: ConsentItem[];
}

const DEFAULT_CONSENT_ITEMS: ConsentItem[] = [
  {
    id: 'general',
    type: 'general',
    title: 'Telehealth Consultation Consent',
    description: 'I consent to participate in this telehealth video consultation',
    icon: <Video className="w-5 h-5" />,
    required: true,
    legalText: 'By checking this box, I acknowledge that I understand the nature of telehealth consultations and consent to receive healthcare services via secure video communication. I understand that this consultation will be conducted by a licensed healthcare provider and that standard medical practices and confidentiality will be maintained.'
  },
  {
    id: 'recording',
    type: 'recording',
    title: 'Session Recording',
    description: 'I consent to have this session recorded for medical records and quality assurance',
    icon: <Video className="w-5 h-5" />,
    required: false,
    legalText: 'I hereby consent to the recording of this telehealth consultation session. I understand that the recording will be used for medical documentation, quality assurance, and may be reviewed by healthcare providers involved in my care. The recording will be stored securely and handled in accordance with HIPAA regulations. I have the right to request a copy of this recording or to revoke this consent at any time.'
  },
  {
    id: 'vitals_capture',
    type: 'vitals_capture',
    title: 'Vitals Monitoring',
    description: 'I consent to have my vital signs captured and recorded during this consultation',
    icon: <Activity className="w-5 h-5" />,
    required: false,
    legalText: 'I consent to the capture and documentation of my vital signs (such as blood pressure, heart rate, temperature, oxygen saturation) during this telehealth consultation. I understand that these measurements may be self-reported or obtained through connected devices, and that the healthcare provider will use this information for clinical assessment and medical record documentation.'
  },
  {
    id: 'data_storage',
    type: 'data_storage',
    title: 'Data Storage & Privacy',
    description: 'I acknowledge the privacy policy and consent to secure data storage',
    icon: <Shield className="w-5 h-5" />,
    required: true,
    legalText: 'I acknowledge that I have read and understand the privacy policy governing the use and storage of my health information. I consent to the secure storage and processing of my medical data, including video recordings, vital signs, clinical notes, and other health information collected during this consultation. I understand that this data will be protected under HIPAA regulations and will only be accessible to authorized healthcare providers involved in my care.'
  }
];

export function ConsentDialog({
  isOpen,
  onClose,
  onConsent,
  patientName,
  meetingId,
  consentItems = DEFAULT_CONSENT_ITEMS
}: ConsentDialogProps) {
  const [consents, setConsents] = useState<Record<string, boolean>>(
    consentItems.reduce((acc, item) => ({ ...acc, [item.id]: item.required }), {})
  );
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signature, setSignature] = useState('');

  if (!isOpen) return null;

  const handleConsentChange = (itemId: string, value: boolean) => {
    setConsents(prev => ({ ...prev, [itemId]: value }));
    setError(null);
  };

  const handleSubmit = async () => {
    // Validate required consents
    const missingRequired = consentItems
      .filter(item => item.required && !consents[item.id])
      .map(item => item.title);

    if (missingRequired.length > 0) {
      setError(`Please provide consent for: ${missingRequired.join(', ')}`);
      return;
    }

    if (!signature.trim()) {
      setError('Please provide your signature to confirm consent');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onConsent(consents);
    } catch (err: any) {
      setError(err.message || 'Failed to submit consent. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const allRequiredConsented = consentItems
    .filter(item => item.required)
    .every(item => consents[item.id]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Informed Consent</h2>
              <p className="text-blue-100 text-sm mt-1">
                {patientName ? `For ${patientName}` : 'Telehealth Consultation'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Introduction */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Before we begin your telehealth consultation, we need your informed consent for various aspects of the session.
                  Please review each item carefully and check the boxes to provide your consent. Items marked with{' '}
                  <span className="text-red-500 font-semibold">*</span> are required to proceed.
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Consent Items */}
          <div className="space-y-4 mb-6">
            {consentItems.map((item) => (
              <div
                key={item.id}
                className={`border-2 rounded-xl transition-all ${
                  consents[item.id]
                    ? 'border-green-300 bg-green-50'
                    : item.required
                    ? 'border-red-200 bg-red-50/30'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                {/* Main Item */}
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={consents[item.id] || false}
                      onChange={(e) => handleConsentChange(item.id, e.target.checked)}
                      disabled={isSubmitting}
                      className="w-5 h-5 mt-1 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer disabled:opacity-50"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`p-1.5 rounded-lg ${
                          consents[item.id] ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {item.icon}
                        </div>
                        <h3 className="font-semibold text-gray-900">
                          {item.title}
                          {item.required && <span className="text-red-500 ml-1">*</span>}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {item.description}
                      </p>
                      <button
                        onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium underline"
                      >
                        {expandedItem === item.id ? 'Hide' : 'Read'} full legal text
                      </button>

                      {/* Expanded Legal Text */}
                      {expandedItem === item.id && (
                        <div className="mt-3 p-4 bg-white border border-gray-200 rounded-lg">
                          <p className="text-xs text-gray-700 leading-relaxed">
                            {item.legalText}
                          </p>
                        </div>
                      )}
                    </div>
                    {consents[item.id] && (
                      <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Signature Field */}
          <div className="mb-6 p-4 border-2 border-gray-200 rounded-xl bg-gray-50">
            <label className="block mb-2">
              <span className="text-sm font-semibold text-gray-900">
                Electronic Signature <span className="text-red-500">*</span>
              </span>
              <p className="text-xs text-gray-600 mt-1 mb-3">
                By typing your full name below, you acknowledge that you have read, understood, and agree to all the consents above.
                This electronic signature has the same legal effect as a handwritten signature.
              </p>
              <input
                type="text"
                value={signature}
                onChange={(e) => {
                  setSignature(e.target.value);
                  setError(null);
                }}
                placeholder="Type your full legal name"
                disabled={isSubmitting}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-50 disabled:bg-gray-100"
              />
            </label>
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
              <Shield className="w-4 h-4" />
              <span>Your signature and consent will be securely recorded and time-stamped</span>
            </div>
          </div>

          {/* Legal Disclaimer */}
          <div className="text-xs text-gray-500 p-4 bg-gray-100 rounded-lg">
            <p className="mb-2">
              <strong>Important Legal Information:</strong>
            </p>
            <p className="leading-relaxed">
              Your privacy and the security of your health information are our top priorities. All data collected during this
              telehealth session will be protected in accordance with HIPAA regulations and our privacy policy. You have the
              right to revoke any non-required consent at any time during or after the consultation. For questions or concerns,
              please contact our privacy officer or speak with your healthcare provider.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Meeting ID: {meetingId.substring(0, 8)}</span>
            <span>•</span>
            <span>{new Date().toLocaleString()}</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !allRequiredConsented || !signature.trim()}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  I Consent & Agree
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
