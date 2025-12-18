'use client';

import React, { useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle, FileText, Shield, Video, Activity, ChevronRight, ChevronLeft } from 'lucide-react';

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
  const [currentStep, setCurrentStep] = useState(0);
  const [consents, setConsents] = useState<Record<string, boolean>>(
    consentItems.reduce((acc, item) => ({ ...acc, [item.id]: item.required }), {})
  );
  const [showLegalText, setShowLegalText] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signature, setSignature] = useState('');

  // Total steps = consent items + 1 signature step
  const totalSteps = consentItems.length + 1;
  const isSignatureStep = currentStep === consentItems.length;

  if (!isOpen) return null;

  const currentItem = !isSignatureStep ? consentItems[currentStep] : null;

  const handleConsentChange = (itemId: string, value: boolean) => {
    setConsents(prev => ({ ...prev, [itemId]: value }));
    setError(null);
  };

  const handleNext = () => {
    if (isSignatureStep) {
      handleSubmit();
    } else {
      const item = consentItems[currentStep];
      if (item.required && !consents[item.id]) {
        setError(`This consent is required to proceed`);
        return;
      }
      setCurrentStep(prev => Math.min(prev + 1, totalSteps - 1));
      setShowLegalText(false);
      setError(null);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
    setShowLegalText(false);
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
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage || 'Failed to submit consent. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = isSignatureStep 
    ? signature.trim() !== '' 
    : currentItem 
      ? !currentItem.required || consents[currentItem.id] 
      : true;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 md:p-4">
      <div className="bg-white rounded-xl md:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] md:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 md:px-6 py-4 md:py-5 text-white">
          <div className="flex items-center gap-2 md:gap-3 mb-3">
            <div className="p-1.5 md:p-2 bg-white/20 rounded-lg backdrop-blur-md flex-shrink-0">
              <FileText className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg md:text-2xl font-bold truncate">Informed Consent</h2>
              <p className="text-blue-100 text-xs md:text-sm mt-0.5 truncate">
                {patientName ? `For ${patientName}` : 'Telehealth Consultation'}
              </p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs md:text-sm">
              <span className="text-blue-100">
                Step {currentStep + 1} of {totalSteps}
              </span>
              <span className="text-blue-100">
                {Math.round(((currentStep + 1) / totalSteps) * 100)}%
              </span>
            </div>
            <div className="w-full bg-blue-400/30 rounded-full h-2">
              <div
                className="bg-white rounded-full h-2 transition-all duration-300 ease-out"
                style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* Introduction on first step */}
          {currentStep === 0 && (
            <div className="mb-4 md:mb-6 p-3 md:p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2 md:gap-3">
                <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
                    Before we begin your telehealth consultation, we need your informed consent. 
                    Please review each item carefully. Items marked with{' '}
                    <span className="text-red-500 font-semibold">*</span> are required.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 md:mb-6 p-3 md:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 md:gap-3">
              <XCircle className="w-4 h-4 md:w-5 md:h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs md:text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Consent Item Step */}
          {!isSignatureStep && currentItem && (
            <div className="space-y-4 md:space-y-6">
              {/* Item Card */}
              <div
                className={`border-2 rounded-lg md:rounded-xl transition-all p-4 md:p-6 ${
                  consents[currentItem.id]
                    ? 'border-green-300 bg-green-50'
                    : currentItem.required
                    ? 'border-red-200 bg-red-50/30'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3 md:gap-4 mb-4">
                  <div className={`p-2 md:p-3 rounded-lg flex-shrink-0 ${
                    consents[currentItem.id] ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {currentItem.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base md:text-lg text-gray-900 mb-1">
                      {currentItem.title}
                      {currentItem.required && <span className="text-red-500 ml-1">*</span>}
                    </h3>
                    {currentItem.required && (
                      <span className="inline-block px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded">
                        Required
                      </span>
                    )}
                  </div>
                  {consents[currentItem.id] && (
                    <CheckCircle2 className="w-6 h-6 md:w-7 md:h-7 text-green-600 flex-shrink-0" />
                  )}
                </div>

                <p className="text-sm md:text-base text-gray-700 mb-4 leading-relaxed">
                  {currentItem.description}
                </p>

                {/* Consent Checkbox */}
                <label className="flex items-start gap-3 p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consents[currentItem.id] || false}
                    onChange={(e) => handleConsentChange(currentItem.id, e.target.checked)}
                    disabled={isSubmitting}
                    className="w-5 h-5 mt-0.5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50 flex-shrink-0"
                  />
                  <span className="text-sm md:text-base text-gray-700 font-medium">
                    I consent to {currentItem.title.toLowerCase()}
                  </span>
                </label>
              </div>

              {/* Legal Text Section */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setShowLegalText(!showLegalText)}
                  className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                >
                  <span className="text-sm md:text-base font-medium text-gray-700">
                    {showLegalText ? 'Hide' : 'Show'} Full Legal Text
                  </span>
                  <ChevronRight
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      showLegalText ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                
                {showLegalText && (
                  <div className="p-4 md:p-5 bg-white border-t border-gray-200">
                    <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
                      {currentItem.legalText}
                    </p>
                  </div>
                )}
              </div>

              {/* Legal Disclaimer */}
              <div className="text-xs text-gray-500 p-3 md:p-4 bg-gray-100 rounded-lg">
                <p className="mb-2 font-semibold text-gray-700">
                  Important Legal Information:
                </p>
                <p className="leading-relaxed">
                  Your privacy and the security of your health information are our top priorities. 
                  All data will be protected under HIPAA regulations. You have the right to revoke 
                  any non-required consent at any time.
                </p>
              </div>
            </div>
          )}

          {/* Signature Step */}
          {isSignatureStep && (
            <div className="space-y-4 md:space-y-6">
              {/* Summary of Consents */}
              <div className="border border-gray-200 rounded-lg p-4 md:p-5 bg-gray-50">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">
                  Consent Summary
                </h3>
                <div className="space-y-2">
                  {consentItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 text-sm"
                    >
                      {consents[item.id] ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      )}
                      <span className={consents[item.id] ? 'text-gray-900' : 'text-gray-500'}>
                        {item.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Signature Section */}
              <div className="border-2 border-blue-200 rounded-lg p-4 md:p-6 bg-blue-50/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg flex-shrink-0">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base md:text-lg font-semibold text-gray-900">
                      Electronic Signature Required
                    </h3>
                    <p className="text-xs md:text-sm text-gray-600 mt-0.5">
                      By signing, you confirm your consent to all selected items
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label htmlFor="signature" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Legal Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="signature"
                      type="text"
                      value={signature}
                      onChange={(e) => {
                        setSignature(e.target.value);
                        setError(null);
                      }}
                      placeholder="Enter your complete legal name"
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 text-sm md:text-base border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:bg-gray-50 transition-colors"
                    />
                  </div>

                  <div className="flex items-start gap-2 p-3 bg-white rounded-lg border border-gray-200">
                    <Shield className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-gray-600 leading-relaxed">
                      <strong className="text-gray-900">Legal Notice:</strong> Your electronic signature 
                      has the same legal validity as a handwritten signature. This document will be 
                      securely recorded with a timestamp and stored in compliance with HIPAA regulations.
                    </div>
                  </div>
                </div>
              </div>

              {/* Meeting Info */}
              <div className="flex items-center gap-2 text-xs text-gray-600 p-3 bg-gray-100 rounded-lg">
                <span className="font-medium">Meeting ID:</span>
                <code className="px-2 py-1 bg-white rounded font-mono">{meetingId.substring(0, 8)}</code>
                <span className="text-gray-400">•</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="border-t border-gray-200 px-4 md:px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between gap-3">
            {/* Back Button */}
            <button
              onClick={currentStep === 0 ? onClose : handleBack}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{currentStep === 0 ? 'Cancel' : 'Back'}</span>
            </button>

            {/* Step Indicator (Mobile) */}
            <div className="flex gap-1.5">
              {Array.from({ length: totalSteps }).map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentStep
                      ? 'w-8 bg-blue-600'
                      : idx < currentStep
                      ? 'w-1.5 bg-green-500'
                      : 'w-1.5 bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {/* Next/Submit Button */}
            <button
              onClick={handleNext}
              disabled={!canProceed || isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm text-sm"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="hidden sm:inline">Processing...</span>
                </>
              ) : isSignatureStep ? (
                <>
                  <span>Submit Consent</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
