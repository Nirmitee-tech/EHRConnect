'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeft,
  Plus,
  X,
  Save,
  Send,
  FileText,
  AlertCircle,
  CheckCircle,
  Search,
  Calendar,
  User,
  Building,
  CreditCard,
  Stethoscope,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Link as LinkIcon,
  DollarSign
} from 'lucide-react';
import {
  Claim,
  ClaimFormData,
  DiagnosisCode,
  ProcedureCode,
  ClaimProvider,
  ClaimInsurance,
  PLACE_OF_SERVICE_CODES,
  EligibilityCheck,
  ClaimValidationError
} from '@/types/claim';
import { cn } from '@/lib/utils';
import billingService from '@/services/billing.service';

interface ClaimFormProps {
  // Patient Information
  patientId: string;
  patientName: string;
  patientDOB: string;
  patientGender?: string;
  patientAddress?: string;
  patientPhone?: string;

  // Appointment Context
  appointmentId?: string;
  appointmentDate?: string;
  appointmentProvider?: string;

  // Pre-filled data
  initialDiagnosisCodes?: DiagnosisCode[];
  initialProcedureCodes?: ProcedureCode[];

  // Available data
  availableProviders?: ClaimProvider[];
  availableInsurances?: ClaimInsurance[];
  eligibilityData?: EligibilityCheck;

  // Callbacks
  onBack?: () => void;
  onSaveDraft?: (data: ClaimFormData) => void;
  onSubmit?: (data: ClaimFormData) => void;
  onCheckEligibility?: () => void;
}

const DIAGNOSIS_POINTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

export function ClaimForm({
  patientId,
  patientName,
  patientDOB,
  patientGender,
  patientAddress,
  patientPhone,
  appointmentId,
  appointmentDate,
  appointmentProvider,
  initialDiagnosisCodes = [],
  initialProcedureCodes = [],
  availableProviders = [],
  availableInsurances = [],
  eligibilityData,
  onBack,
  onSaveDraft,
  onSubmit,
  onCheckEligibility
}: ClaimFormProps) {
  // Payment Method State
  const [paymentMethod, setPaymentMethod] = useState<'insurance' | 'self-pay' | 'workers-comp' | 'other'>('insurance');

  // Form State
  const [claimType, setClaimType] = useState<'professional' | 'institutional'>('professional');
  const [claimFrequency, setClaimFrequency] = useState<'original' | 'replacement'>('original');

  // Providers - Auto-select first provider if sample data loaded
  const [billingProviderId, setBillingProviderId] = useState(
    availableProviders.length > 0 && initialDiagnosisCodes.length > 0 ? availableProviders[0].id : ''
  );
  const [renderingProviderId, setRenderingProviderId] = useState('');
  const [referringProviderId, setReferringProviderId] = useState('');
  const [facilityProviderId, setFacilityProviderId] = useState('');

  // Insurance - Auto-select first insurance if sample data loaded
  const [primaryInsuranceId, setPrimaryInsuranceId] = useState(
    availableInsurances.length > 0 && initialDiagnosisCodes.length > 0
      ? availableInsurances.find(i => i.insuranceType === 'primary')?.payerId || ''
      : ''
  );
  const [secondaryInsuranceId, setSecondaryInsuranceId] = useState('');

  // Place of Service
  const [placeOfService, setPlaceOfService] = useState('11'); // Default: Office

  // Diagnosis Codes
  const [diagnosisCodes, setDiagnosisCodes] = useState<DiagnosisCode[]>(
    initialDiagnosisCodes.length > 0
      ? initialDiagnosisCodes
      : []
  );
  const [icd10SearchTerm, setIcd10SearchTerm] = useState('');
  const [icd10SearchResults, setIcd10SearchResults] = useState<Array<{code: string, description: string}>>([]);
  const [searchingICD, setSearchingICD] = useState(false);

  // Procedure Codes
  const [procedureCodes, setProcedureCodes] = useState<ProcedureCode[]>(
    initialProcedureCodes.length > 0
      ? initialProcedureCodes
      : []
  );
  const [cptSearchTerm, setCptSearchTerm] = useState('');
  const [cptSearchResults, setCptSearchResults] = useState<Array<{code: string, description: string, category?: string}>>([]);
  const [searchingCPT, setSearchingCPT] = useState(false);

  // UI State - Accordion sections
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['diagnosis']));
  const [expandedProcedures, setExpandedProcedures] = useState<Set<string>>(new Set());

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  // Section completion indicators
  const isSectionComplete = (section: string) => {
    switch(section) {
      case 'diagnosis': return diagnosisCodes.length > 0;
      case 'procedures': return procedureCodes.length > 0 && procedureCodes.every(p => p.code && p.chargeAmount > 0);
      case 'provider': return !!billingProviderId;
      case 'insurance': return paymentMethod === 'insurance' ? !!primaryInsuranceId : true; // Only required for insurance
      case 'payment': return !!paymentMethod;
      default: return false;
    }
  };

  // Billing Notes
  const [billingNotes, setBillingNotes] = useState('');
  const [claimNotes, setClaimNotes] = useState('');

  // ICD-10 Search Effect
  useEffect(() => {
    const searchICD = async () => {
      if (icd10SearchTerm.length < 2) {
        setIcd10SearchResults([]);
        return;
      }

      setSearchingICD(true);
      try {
        const results = await billingService.getICDCodes(icd10SearchTerm, 50);
        const codes = results.data || results || [];
        setIcd10SearchResults(codes.map((item: any) => ({
          code: item.code || item.icdCode,
          description: item.description || item.longDescription || item.shortDescription
        })));
      } catch (error) {
        console.error('Error searching ICD codes:', error);
        setIcd10SearchResults([]);
      } finally {
        setSearchingICD(false);
      }
    };

    const debounce = setTimeout(searchICD, 300);
    return () => clearTimeout(debounce);
  }, [icd10SearchTerm]);

  // CPT Search Effect
  useEffect(() => {
    const searchCPT = async () => {
      if (cptSearchTerm.length < 2) {
        setCptSearchResults([]);
        return;
      }

      setSearchingCPT(true);
      try {
        const results = await billingService.getCPTCodes(cptSearchTerm, 50);
        const codes = results.data || results || [];
        setCptSearchResults(codes.map((item: any) => ({
          code: item.code || item.cptCode,
          description: item.description || item.longDescription || item.shortDescription,
          category: item.category
        })));
      } catch (error) {
        console.error('Error searching CPT codes:', error);
        setCptSearchResults([]);
      } finally {
        setSearchingCPT(false);
      }
    };

    const debounce = setTimeout(searchCPT, 300);
    return () => clearTimeout(debounce);
  }, [cptSearchTerm]);

  // Calculate totals
  const totalCharges = useMemo(() => {
    return procedureCodes.reduce((sum, proc) => sum + (proc.chargeAmount * proc.units), 0);
  }, [procedureCodes]);

  const expectedReimbursement = useMemo(() => {
    return procedureCodes.reduce((sum, proc) => {
      return sum + (proc.expectedReimbursement || proc.chargeAmount * proc.units * 0.8);
    }, 0);
  }, [procedureCodes]);

  const patientResponsibility = useMemo(() => {
    const copay = eligibilityData?.copay || 0;
    const coinsurance = totalCharges * (eligibilityData?.coinsurance || 0) / 100;
    return copay + coinsurance;
  }, [totalCharges, eligibilityData]);

  // Add Diagnosis Code
  const addDiagnosisCode = (code: string, description: string) => {
    const nextPointer = DIAGNOSIS_POINTERS[diagnosisCodes.length];
    if (!nextPointer || diagnosisCodes.length >= 12) {
      alert('Maximum 12 diagnosis codes allowed');
      return;
    }

    const newDiagnosis: DiagnosisCode = {
      id: Date.now().toString(),
      code,
      description,
      pointer: nextPointer,
      isPrimary: diagnosisCodes.length === 0
    };

    setDiagnosisCodes([...diagnosisCodes, newDiagnosis]);
    setIcd10SearchTerm('');
  };

  const removeDiagnosisCode = (id: string) => {
    const updated = diagnosisCodes.filter(d => d.id !== id);
    // Reassign pointers
    const reassigned = updated.map((d, index) => ({
      ...d,
      pointer: DIAGNOSIS_POINTERS[index],
      isPrimary: index === 0
    }));
    setDiagnosisCodes(reassigned);
  };

  // Add Procedure Code
  const addProcedureCode = () => {
    const newProcedure: ProcedureCode = {
      id: Date.now().toString(),
      code: '',
      description: '',
      modifiers: [],
      diagnosisPointers: diagnosisCodes.length > 0 ? ['A'] : [],
      dateOfService: appointmentDate || new Date().toISOString().split('T')[0],
      placeOfService: placeOfService,
      units: 1,
      chargeAmount: 0
    };
    setProcedureCodes([...procedureCodes, newProcedure]);
  };

  const removeProcedureCode = (id: string) => {
    setProcedureCodes(procedureCodes.filter(p => p.id !== id));
  };

  const updateProcedureCode = (id: string, field: keyof ProcedureCode, value: any) => {
    setProcedureCodes(procedureCodes.map(proc => {
      if (proc.id === id) {
        return { ...proc, [field]: value };
      }
      return proc;
    }));
  };

  const toggleDiagnosisPointer = (procId: string, pointer: string) => {
    setProcedureCodes(procedureCodes.map(proc => {
      if (proc.id === procId) {
        const pointers = proc.diagnosisPointers.includes(pointer)
          ? proc.diagnosisPointers.filter(p => p !== pointer)
          : [...proc.diagnosisPointers, pointer].sort();
        return { ...proc, diagnosisPointers: pointers };
      }
      return proc;
    }));
  };

  const toggleProcedureExpanded = (id: string) => {
    setExpandedProcedures(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Validation
  const validationErrors: ClaimValidationError[] = useMemo(() => {
    const errors: ClaimValidationError[] = [];

    if (!billingProviderId) {
      errors.push({ field: 'billingProvider', message: 'Billing provider is required', severity: 'error' });
    }

    if (diagnosisCodes.length === 0) {
      errors.push({ field: 'diagnosis', message: 'At least one diagnosis code is required', severity: 'error' });
    }

    if (procedureCodes.length === 0) {
      errors.push({ field: 'procedures', message: 'At least one procedure code is required', severity: 'error' });
    }

    procedureCodes.forEach((proc, index) => {
      if (!proc.code) {
        errors.push({ field: `procedure${index}`, message: `Procedure #${index + 1}: Code is required`, severity: 'error' });
      }
      if (proc.chargeAmount <= 0) {
        errors.push({ field: `procedure${index}`, message: `Procedure #${index + 1}: Charge amount must be greater than 0`, severity: 'error' });
      }
      if (proc.diagnosisPointers.length === 0) {
        errors.push({ field: `procedure${index}`, message: `Procedure #${index + 1}: Must link to at least one diagnosis`, severity: 'warning' });
      }
    });

    // Insurance is only required for insurance payment method
    if (paymentMethod === 'insurance' && !primaryInsuranceId) {
      errors.push({ field: 'insurance', message: 'Primary insurance is required for insurance billing', severity: 'error' });
    }

    return errors;
  }, [billingProviderId, diagnosisCodes, procedureCodes, primaryInsuranceId, paymentMethod]);

  const isValid = validationErrors.filter(e => e.severity === 'error').length === 0;

  const handleSubmit = () => {
    if (!isValid) {
      alert('Please fix all errors before submitting');
      return;
    }

    const formData: ClaimFormData = {
      claimType,
      claimFrequency,
      paymentMethod,
      patientId,
      appointmentId,
      diagnosisCodes,
      procedureCodes,
      billingProviderId,
      renderingProviderId,
      referringProviderId,
      facilityProviderId,
      primaryInsuranceId,
      secondaryInsuranceId,
      placeOfService,
      billingNotes,
      claimNotes
    };

    onSubmit?.(formData);
  };

  const handleSaveDraft = () => {
    const formData: ClaimFormData = {
      claimType,
      claimFrequency,
      paymentMethod,
      patientId,
      appointmentId,
      diagnosisCodes,
      procedureCodes,
      billingProviderId,
      renderingProviderId,
      referringProviderId,
      facilityProviderId,
      primaryInsuranceId,
      secondaryInsuranceId,
      placeOfService,
      billingNotes,
      claimNotes
    };

    onSaveDraft?.(formData);
  };

  return (
    <div className="flex h-full bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4 space-y-3">{/* Sample Data Info */}
          {initialDiagnosisCodes.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
              <p className="text-xs text-blue-900">
                <CheckCircle className="h-3 w-3 inline mr-1" />
                Pre-filled with sample data for demonstration
              </p>
            </div>
          )}

          {/* Header */}
          <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {onBack && (
                  <button
                    onClick={onBack}
                    className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4 text-gray-600" />
                  </button>
                )}
                <div>
                  <h1 className="text-base font-bold text-gray-900">Create Superbill</h1>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {patientName} <span className="text-gray-400">•</span> {patientId}
                    {appointmentDate && (
                      <span>
                        {' '}<span className="text-gray-400">•</span> DOS: {new Date(appointmentDate).toLocaleDateString()}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveDraft}
                  className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-xs font-medium flex items-center gap-1.5"
                >
                  <Save className="h-3.5 w-3.5" />
                  Save Draft
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!isValid}
                  className={cn(
                    "px-4 py-1.5 rounded-md transition-colors text-xs font-medium flex items-center gap-1.5",
                    isValid
                      ? "bg-primary text-primary-foreground hover:opacity-90"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  )}
                >
                  <Send className="h-3.5 w-3.5" />
                  {paymentMethod === 'insurance' || paymentMethod === 'workers-comp'
                    ? 'Finalize Superbill'
                    : 'Finalize & Save'}
                </button>
              </div>
            </div>

            {/* Validation Status */}
            {validationErrors.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-900">
                      {validationErrors.filter(e => e.severity === 'error').length} Error(s), {validationErrors.filter(e => e.severity === 'warning').length} Warning(s)
                    </p>
                    <div className="mt-1 space-y-0.5">
                      {validationErrors.slice(0, 3).map((error, index) => (
                        <p key={index} className={cn(
                          "text-[10px]",
                          error.severity === 'error' ? 'text-red-600' : 'text-orange-600'
                        )}>
                          • {error.message}
                        </p>
                      ))}
                      {validationErrors.length > 3 && (
                        <p className="text-[10px] text-gray-500">
                          + {validationErrors.length - 3} more...
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Payment Method Selection */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-3">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Payment Method</h3>
                <p className="text-xs text-gray-500">How will this visit be paid?</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <button
                onClick={() => setPaymentMethod('insurance')}
                className={cn(
                  "flex flex-col items-center p-3 border-2 rounded-lg transition-all",
                  paymentMethod === 'insurance'
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                )}
              >
                <CreditCard className={cn(
                  "h-6 w-6 mb-2",
                  paymentMethod === 'insurance' ? "text-blue-600" : "text-gray-400"
                )} />
                <span className={cn(
                  "text-xs font-medium",
                  paymentMethod === 'insurance' ? "text-blue-900" : "text-gray-600"
                )}>Insurance</span>
                <span className="text-[10px] text-gray-500 mt-0.5">Bill to payer</span>
              </button>

              <button
                onClick={() => setPaymentMethod('self-pay')}
                className={cn(
                  "flex flex-col items-center p-3 border-2 rounded-lg transition-all",
                  paymentMethod === 'self-pay'
                    ? "border-green-600 bg-green-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                )}
              >
                <DollarSign className={cn(
                  "h-6 w-6 mb-2",
                  paymentMethod === 'self-pay' ? "text-green-600" : "text-gray-400"
                )} />
                <span className={cn(
                  "text-xs font-medium",
                  paymentMethod === 'self-pay' ? "text-green-900" : "text-gray-600"
                )}>Self-Pay</span>
                <span className="text-[10px] text-gray-500 mt-0.5">Patient pays</span>
              </button>

              <button
                onClick={() => setPaymentMethod('workers-comp')}
                className={cn(
                  "flex flex-col items-center p-3 border-2 rounded-lg transition-all",
                  paymentMethod === 'workers-comp'
                    ? "border-orange-600 bg-orange-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                )}
              >
                <Building className={cn(
                  "h-6 w-6 mb-2",
                  paymentMethod === 'workers-comp' ? "text-orange-600" : "text-gray-400"
                )} />
                <span className={cn(
                  "text-xs font-medium",
                  paymentMethod === 'workers-comp' ? "text-orange-900" : "text-gray-600"
                )}>Worker's Comp</span>
                <span className="text-[10px] text-gray-500 mt-0.5">Work injury</span>
              </button>

              <button
                onClick={() => setPaymentMethod('other')}
                className={cn(
                  "flex flex-col items-center p-3 border-2 rounded-lg transition-all",
                  paymentMethod === 'other'
                    ? "border-purple-600 bg-purple-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                )}
              >
                <FileText className={cn(
                  "h-6 w-6 mb-2",
                  paymentMethod === 'other' ? "text-purple-600" : "text-gray-400"
                )} />
                <span className={cn(
                  "text-xs font-medium",
                  paymentMethod === 'other' ? "text-purple-900" : "text-gray-600"
                )}>Other</span>
                <span className="text-[10px] text-gray-500 mt-0.5">Custom billing</span>
              </button>
            </div>

            {/* Payment Method Specific Info */}
            {paymentMethod === 'self-pay' && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs text-green-800">
                  <CheckCircle className="h-3 w-3 inline mr-1" />
                  Patient will be billed directly. Insurance section is optional.
                </p>
              </div>
            )}
            {paymentMethod === 'workers-comp' && (
              <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-xs text-orange-800">
                  <AlertCircle className="h-3 w-3 inline mr-1" />
                  Worker's Compensation claim. Add employer and injury details below.
                </p>
              </div>
            )}
            {paymentMethod === 'other' && (
              <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-xs text-purple-800">
                  <AlertCircle className="h-3 w-3 inline mr-1" />
                  Custom payment arrangement. Document in notes section.
                </p>
              </div>
            )}
          </div>

          {/* Claim Type & Settings */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="block text-[10px] font-medium text-gray-600 mb-1">
                  Claim Type
                </label>
                <select
                  value={claimType}
                  onChange={(e) => setClaimType(e.target.value as any)}
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option value="professional">Professional (CMS-1500)</option>
                  <option value="institutional">Institutional (UB-04)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-medium text-gray-600 mb-1">
                  Claim Frequency
                </label>
                <select
                  value={claimFrequency}
                  onChange={(e) => setClaimFrequency(e.target.value as any)}
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option value="original">Original</option>
                  <option value="replacement">Replacement</option>
                  <option value="void">Void</option>
                  <option value="corrected">Corrected</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-medium text-gray-600 mb-1">
                  Place of Service
                </label>
                <select
                  value={placeOfService}
                  onChange={(e) => setPlaceOfService(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  {PLACE_OF_SERVICE_CODES.map(pos => (
                    <option key={pos.code} value={pos.code}>
                      {pos.code} - {pos.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-medium text-gray-600 mb-1">
                  Date of Service
                </label>
                <input
                  type="date"
                  defaultValue={appointmentDate || new Date().toISOString().split('T')[0]}
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Accordion Sections */}
          <div className="space-y-3">
            {/* 1. Diagnosis Section */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Accordion Header */}
              <button
                onClick={() => toggleSection('diagnosis')}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold",
                    isSectionComplete('diagnosis')
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  )}>
                    {isSectionComplete('diagnosis') ? <CheckCircle className="h-4 w-4" /> : '1'}
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-semibold text-gray-900">Diagnosis Codes</h3>
                    <p className="text-xs text-gray-500">
                      {diagnosisCodes.length === 0 ? 'Add ICD-10 diagnosis codes' : `${diagnosisCodes.length} code(s) added`}
                    </p>
                  </div>
                </div>
                <ChevronDown className={cn(
                  "h-5 w-5 text-gray-400 transition-transform",
                  expandedSections.has('diagnosis') && "transform rotate-180"
                )} />
              </button>

              {/* Accordion Content */}
              {expandedSections.has('diagnosis') && (
                <div className="px-4 py-4 border-t border-gray-200 space-y-3">
                  <p className="text-xs text-gray-600">
                    Search and add ICD-10 diagnosis codes that justify the medical necessity of services. Each diagnosis gets a letter pointer (A, B, C...) for linking to procedures. The first diagnosis is marked as PRIMARY.
                  </p>

                    {/* Search */}
                    <div className="relative mb-3">
                      <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-gray-400" />
                      <input
                        type="text"
                        value={icd10SearchTerm}
                        onChange={(e) => setIcd10SearchTerm(e.target.value)}
                        placeholder="Search ICD-10 codes..."
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    {/* Selected Diagnosis Codes */}
                    {diagnosisCodes.length > 0 && (
                      <div className="space-y-1.5 mb-3">
                        {diagnosisCodes.map((diagnosis, index) => (
                          <div
                            key={diagnosis.id}
                            className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-md px-3 py-2"
                          >
                            <div className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded text-[10px] font-bold">
                              {diagnosis.pointer}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-blue-900">{diagnosis.code}</span>
                                {diagnosis.isPrimary && (
                                  <span className="px-1.5 py-0.5 bg-primary text-primary-foreground text-[9px] font-bold rounded">
                                    PRIMARY
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-blue-700 mt-0.5">{diagnosis.description}</p>
                            </div>
                            <button
                              onClick={() => removeDiagnosisCode(diagnosis.id)}
                              className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Available Codes */}
                    {icd10SearchTerm && icd10SearchResults.length > 0 && (
                      <div className="border border-gray-200 rounded-md max-h-48 overflow-y-auto">
                        {icd10SearchResults.map((code, index) => (
                          <button
                            key={index}
                            onClick={() => addDiagnosisCode(code.code, code.description)}
                            className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-gray-900">{code.code}</span>
                              <span className="text-[10px] text-gray-600">{code.description}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {searchingICD && (
                      <div className="text-center py-4 text-xs text-gray-500">
                        Searching ICD-10 codes...
                      </div>
                    )}

                    {diagnosisCodes.length === 0 && !icd10SearchTerm && (
                      <div className="text-center py-8 text-xs text-gray-500">
                        Search and add ICD-10 diagnosis codes
                      </div>
                    )}
                </div>
              )}
            </div>

            {/* 2. Procedures Section */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Accordion Header */}
              <button
                onClick={() => toggleSection('procedures')}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold",
                    isSectionComplete('procedures')
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  )}>
                    {isSectionComplete('procedures') ? <CheckCircle className="h-4 w-4" /> : '2'}
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-semibold text-gray-900">Procedure Codes</h3>
                    <p className="text-xs text-gray-500">
                      {procedureCodes.length === 0 ? 'Add CPT/HCPCS procedure codes' : `${procedureCodes.length} procedure(s) added`}
                    </p>
                  </div>
                </div>
                <ChevronDown className={cn(
                  "h-5 w-5 text-gray-400 transition-transform",
                  expandedSections.has('procedures') && "transform rotate-180"
                )} />
              </button>

              {/* Accordion Content */}
              {expandedSections.has('procedures') && (
                <div className="px-4 py-4 border-t border-gray-200 space-y-3">
                  <p className="text-xs text-gray-600">
                    Add CPT/HCPCS procedure codes for services provided. Click the Dx button to link each procedure to diagnosis codes (A, B, C...) that justify medical necessity.
                  </p>

                    {/* Procedure Rows */}
                    <div className="space-y-2">
                      {procedureCodes.map((proc, index) => {
                        const isExpanded = expandedProcedures.has(proc.id);
                        return (
                          <div key={proc.id} className="border border-gray-200 rounded-md overflow-hidden">
                            {/* Procedure Row */}
                            <div className="bg-gray-50 px-2 py-2">
                              <div className="flex items-center gap-2">
                                <div className="flex items-center justify-center w-6 h-6 bg-gray-700 text-white rounded text-[10px] font-bold flex-shrink-0">
                                  {index + 1}
                                </div>

                                <div className="flex-1 grid grid-cols-12 gap-2 items-end">
                                  {/* CPT Code */}
                                  <div className="col-span-2">
                                    <label className="block text-[9px] font-medium text-gray-600 mb-0.5">
                                      CPT/HCPCS
                                    </label>
                                    <input
                                      type="text"
                                      value={proc.code}
                                      onChange={(e) => updateProcedureCode(proc.id, 'code', e.target.value)}
                                      placeholder="99213"
                                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                  </div>

                                  {/* Description */}
                                  <div className="col-span-3">
                                    <label className="block text-[9px] font-medium text-gray-600 mb-0.5">
                                      Description
                                    </label>
                                    <input
                                      type="text"
                                      value={proc.description}
                                      onChange={(e) => updateProcedureCode(proc.id, 'description', e.target.value)}
                                      placeholder="Office visit"
                                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                  </div>

                                  {/* Units */}
                                  <div className="col-span-1">
                                    <label className="block text-[9px] font-medium text-gray-600 mb-0.5">
                                      Units
                                    </label>
                                    <input
                                      type="number"
                                      value={proc.units}
                                      onChange={(e) => updateProcedureCode(proc.id, 'units', parseInt(e.target.value) || 1)}
                                      min="1"
                                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                  </div>

                                  {/* Charge */}
                                  <div className="col-span-2">
                                    <label className="block text-[9px] font-medium text-gray-600 mb-0.5">
                                      Charge ($)
                                    </label>
                                    <input
                                      type="number"
                                      value={proc.chargeAmount || ''}
                                      onChange={(e) => updateProcedureCode(proc.id, 'chargeAmount', parseFloat(e.target.value) || 0)}
                                      placeholder="0.00"
                                      step="0.01"
                                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                  </div>

                                  {/* Line Total */}
                                  <div className="col-span-2">
                                    <label className="block text-[9px] font-medium text-gray-600 mb-0.5">
                                      Line Total
                                    </label>
                                    <div className="px-2 py-1 text-xs bg-gray-100 border border-gray-300 rounded text-gray-900 font-semibold">
                                      ${(proc.chargeAmount * proc.units).toFixed(2)}
                                    </div>
                                  </div>

                                  {/* Dx Pointers Button */}
                                  <div className="col-span-1">
                                    <label className="block text-[9px] font-medium text-gray-600 mb-0.5">
                                      Dx
                                    </label>
                                    <button
                                      onClick={() => toggleProcedureExpanded(proc.id)}
                                      disabled={diagnosisCodes.length === 0}
                                      className={cn(
                                        "w-full px-2 py-1 text-xs font-medium rounded flex items-center justify-center gap-1",
                                        diagnosisCodes.length === 0
                                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                          : "text-gray-700 bg-gray-100 border border-gray-300 hover:bg-gray-200"
                                      )}
                                    >
                                      {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                                      {proc.diagnosisPointers.join(',')}
                                    </button>
                                  </div>

                                  {/* Delete */}
                                  <div className="col-span-1 flex items-end">
                                    <button
                                      onClick={() => removeProcedureCode(proc.id)}
                                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Diagnosis Pointer Linking */}
                            {isExpanded && diagnosisCodes.length > 0 && (
                              <div className="bg-white px-2 py-2 border-t border-gray-200">
                                <p className="text-[10px] text-gray-600 mb-2">
                                  Click diagnosis codes to link to this procedure:
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {diagnosisCodes.map(diagnosis => (
                                    <button
                                      key={diagnosis.id}
                                      onClick={() => toggleDiagnosisPointer(proc.id, diagnosis.pointer)}
                                      className={cn(
                                        "flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-medium transition-all",
                                        proc.diagnosisPointers.includes(diagnosis.pointer)
                                          ? "bg-primary text-primary-foreground shadow-sm"
                                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                      )}
                                    >
                                      <span className="font-bold">{diagnosis.pointer}</span>
                                      <span className="max-w-[200px] truncate">{diagnosis.code}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Add Procedure Button */}
                      <button
                        onClick={addProcedureCode}
                        className="w-full py-2 border-2 border-dashed border-gray-300 rounded-md text-xs font-medium text-gray-600 hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add Procedure
                      </button>
                    </div>

                    {diagnosisCodes.length === 0 && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-xs text-yellow-800">
                          <AlertCircle className="h-3.5 w-3.5 inline mr-1" />
                          Add diagnosis codes first to link procedures
                        </p>
                      </div>
                    )}
                </div>
              )}
            </div>

            {/* 3. Provider Section */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Accordion Header */}
              <button
                onClick={() => toggleSection('provider')}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold",
                    isSectionComplete('provider')
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  )}>
                    {isSectionComplete('provider') ? <CheckCircle className="h-4 w-4" /> : '3'}
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-semibold text-gray-900">Provider Information</h3>
                    <p className="text-xs text-gray-500">
                      {!billingProviderId ? 'Select billing provider' : 'Provider selected'}
                    </p>
                  </div>
                </div>
                <ChevronDown className={cn(
                  "h-5 w-5 text-gray-400 transition-transform",
                  expandedSections.has('provider') && "transform rotate-180"
                )} />
              </button>

              {/* Accordion Content */}
              {expandedSections.has('provider') && (
                <div className="px-4 py-4 border-t border-gray-200 space-y-3">
                  <p className="text-xs text-gray-600">
                    Billing Provider (required) receives payment. Rendering Provider performed the service. Referring Provider sent the patient. Facility is where service occurred. Each provider identified by NPI.
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Billing Provider */}
                    <div>
                      <label className="block text-[10px] font-medium text-gray-700 mb-1.5">
                        Billing Provider <span className="text-red-600">*</span>
                      </label>
                      <select
                        value={billingProviderId}
                        onChange={(e) => setBillingProviderId(e.target.value)}
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                      >
                        <option value="">Select Provider</option>
                        {availableProviders.map(provider => (
                          <option key={provider.id} value={provider.id}>
                            {provider.name}
                          </option>
                        ))}
                      </select>
                      {billingProviderId && (
                        <p className="mt-1 text-[10px] text-gray-500">
                          NPI: {availableProviders.find(p => p.id === billingProviderId)?.npi}
                        </p>
                      )}
                    </div>

                    {/* Rendering Provider */}
                    <div>
                      <label className="block text-[10px] font-medium text-gray-700 mb-1.5">
                        Rendering Provider
                      </label>
                      <select
                        value={renderingProviderId}
                        onChange={(e) => setRenderingProviderId(e.target.value)}
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                      >
                        <option value="">Select Provider</option>
                        {availableProviders.map(provider => (
                          <option key={provider.id} value={provider.id}>
                            {provider.name}
                          </option>
                        ))}
                      </select>
                      {renderingProviderId && (
                        <p className="mt-1 text-[10px] text-gray-500">
                          NPI: {availableProviders.find(p => p.id === renderingProviderId)?.npi}
                        </p>
                      )}
                    </div>

                    {/* Referring Provider */}
                    <div>
                      <label className="block text-[10px] font-medium text-gray-700 mb-1.5">
                        Referring Provider
                      </label>
                      <select
                        value={referringProviderId}
                        onChange={(e) => setReferringProviderId(e.target.value)}
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                      >
                        <option value="">Select Provider</option>
                        {availableProviders.map(provider => (
                          <option key={provider.id} value={provider.id}>
                            {provider.name}
                          </option>
                        ))}
                      </select>
                      {referringProviderId && (
                        <p className="mt-1 text-[10px] text-gray-500">
                          NPI: {availableProviders.find(p => p.id === referringProviderId)?.npi}
                        </p>
                      )}
                    </div>

                    {/* Facility Provider */}
                    <div>
                      <label className="block text-[10px] font-medium text-gray-700 mb-1.5">
                        Facility Provider
                      </label>
                      <select
                        value={facilityProviderId}
                        onChange={(e) => setFacilityProviderId(e.target.value)}
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                      >
                        <option value="">Select Facility</option>
                        {availableProviders.map(provider => (
                          <option key={provider.id} value={provider.id}>
                            {provider.name}
                          </option>
                        ))}
                      </select>
                      {facilityProviderId && (
                        <p className="mt-1 text-[10px] text-gray-500">
                          NPI: {availableProviders.find(p => p.id === facilityProviderId)?.npi}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Insurance Section - Conditional based on payment method */}
            {(paymentMethod === 'insurance' || paymentMethod === 'workers-comp') && (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* Accordion Header */}
                <button
                  onClick={() => toggleSection('insurance')}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold",
                      isSectionComplete('insurance')
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    )}>
                      {isSectionComplete('insurance') ? <CheckCircle className="h-4 w-4" /> : '4'}
                    </div>
                    <div className="text-left">
                      <h3 className="text-sm font-semibold text-gray-900">
                        Insurance Information
                        {paymentMethod === 'workers-comp' && (
                          <span className="ml-2 text-orange-600 text-[10px]">(Worker's Comp)</span>
                        )}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {!primaryInsuranceId ? 'Select primary insurance' : 'Insurance selected'}
                      </p>
                    </div>
                  </div>
                  <ChevronDown className={cn(
                    "h-5 w-5 text-gray-400 transition-transform",
                    expandedSections.has('insurance') && "transform rotate-180"
                  )} />
                </button>

                {/* Accordion Content */}
                {expandedSections.has('insurance') && (
                  <div className="px-4 py-4 border-t border-gray-200 space-y-3">
                    <p className="text-xs text-gray-600">
                      {paymentMethod === 'insurance'
                        ? 'Select primary insurance (required - billed first). Add secondary insurance if applicable (billed after primary). Check eligibility to verify active coverage.'
                        : 'Select worker\'s compensation insurance or employer information.'}
                    </p>

                  {/* Primary Insurance */}
                  <div className="border border-blue-200 rounded-lg p-3 bg-blue-50">
                    <h4 className="text-xs font-semibold text-blue-900 mb-2">Primary Insurance <span className="text-red-600">*</span></h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-medium text-blue-800 mb-1">
                          Insurance Plan
                        </label>
                        <select
                          value={primaryInsuranceId}
                          onChange={(e) => setPrimaryInsuranceId(e.target.value)}
                          className="w-full px-2 py-1.5 text-xs border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                        >
                          <option value="">Select Insurance</option>
                          {availableInsurances.filter(i => i.insuranceType === 'primary').map(insurance => (
                            <option key={insurance.payerId} value={insurance.payerId}>
                              {insurance.payerName} - {insurance.memberIdNumber}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-blue-800 mb-1">
                          Member ID
                        </label>
                        <input
                          type="text"
                          value={availableInsurances.find(i => i.payerId === primaryInsuranceId)?.memberIdNumber || ''}
                          readOnly
                          className="w-full px-2 py-1.5 text-xs border border-blue-300 rounded bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Secondary Insurance */}
                  <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <h4 className="text-xs font-semibold text-gray-900 mb-2">Secondary Insurance (Optional)</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-medium text-gray-700 mb-1">
                          Insurance Plan
                        </label>
                        <select
                          value={secondaryInsuranceId}
                          onChange={(e) => setSecondaryInsuranceId(e.target.value)}
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                        >
                          <option value="">Select Insurance</option>
                          {availableInsurances.filter(i => i.insuranceType === 'secondary').map(insurance => (
                            <option key={insurance.payerId} value={insurance.payerId}>
                              {insurance.payerName} - {insurance.memberIdNumber}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-gray-700 mb-1">
                          Member ID
                        </label>
                        <input
                          type="text"
                          value={availableInsurances.find(i => i.payerId === secondaryInsuranceId)?.memberIdNumber || ''}
                          readOnly
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Eligibility Check Button */}
                  {onCheckEligibility && paymentMethod === 'insurance' && (
                    <button
                      onClick={onCheckEligibility}
                      className="w-full py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-xs font-medium flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      Check Eligibility
                    </button>
                  )}
                </div>
              )}
              </div>
            )}

            {/* Self-Pay / Other Payment Info */}
            {(paymentMethod === 'self-pay' || paymentMethod === 'other') && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      {paymentMethod === 'self-pay' ? 'Self-Pay Information' : 'Payment Information'}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {paymentMethod === 'self-pay'
                        ? 'Patient will be billed directly for services'
                        : 'Document custom payment arrangement'}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-xs text-green-800 mb-2">
                      <CheckCircle className="h-3 w-3 inline mr-1" />
                      {paymentMethod === 'self-pay'
                        ? 'No insurance will be billed. Patient is responsible for full payment.'
                        : 'This superbill will require manual processing for payment.'}
                    </p>
                    <div className="text-[10px] text-green-700 space-y-1">
                      <div>• Total charges will be calculated from procedures</div>
                      <div>• Payment can be collected at time of service</div>
                      <div>• Receipt will be provided to patient</div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Payment Notes
                    </label>
                    <textarea
                      value={billingNotes}
                      onChange={(e) => setBillingNotes(e.target.value)}
                      placeholder="Add notes about payment arrangement, discounts, or special instructions..."
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 5. Summary Section */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Accordion Header */}
              <button
                onClick={() => toggleSection('summary')}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold",
                    isValid
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  )}>
                    {isValid ? <CheckCircle className="h-4 w-4" /> : '5'}
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-semibold text-gray-900">Review & Submit</h3>
                    <p className="text-xs text-gray-500">
                      {isValid ? 'Ready to submit' : 'Review claim details'}
                    </p>
                  </div>
                </div>
                <ChevronDown className={cn(
                  "h-5 w-5 text-gray-400 transition-transform",
                  expandedSections.has('summary') && "transform rotate-180"
                )} />
              </button>

              {/* Accordion Content */}
              {expandedSections.has('summary') && (
                <div className="px-4 py-4 border-t border-gray-200 space-y-3">
                  <p className="text-xs text-gray-600">
                    Review all claim details before submission. Verify diagnosis-procedure links, provider information, and financial totals. Use "Save Draft" to return later or "Submit Claim" when ready.
                  </p>

                  {/* Validation Status */}
                  <div className={cn(
                    "rounded-lg p-3 border",
                    isValid
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  )}>
                    <div className="flex items-center gap-2 mb-2">
                      {isValid ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      <h4 className="text-xs font-semibold">
                        {isValid ? 'Ready to Submit' : 'Validation Issues'}
                      </h4>
                    </div>
                    {!isValid && (
                      <div className="space-y-0.5">
                        {validationErrors.filter(e => e.severity === 'error').map((error, index) => (
                          <p key={index} className="text-[10px] text-red-600">• {error.message}</p>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Financial Summary */}
                  <div className="border border-gray-200 rounded-lg p-3">
                    <h4 className="text-xs font-semibold text-gray-900 mb-2">Financial Summary</h4>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Charges:</span>
                        <span className="font-semibold text-gray-900">${totalCharges.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Expected Reimbursement:</span>
                        <span className="font-semibold text-green-600">${expectedReimbursement.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between pt-1.5 border-t border-gray-200">
                        <span className="text-gray-600">Patient Responsibility:</span>
                        <span className="font-bold text-purple-600">${patientResponsibility.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Diagnosis Summary */}
                  <div className="border border-gray-200 rounded-lg p-3">
                    <h4 className="text-xs font-semibold text-gray-900 mb-2">
                      Diagnosis Codes ({diagnosisCodes.length})
                    </h4>
                    <div className="space-y-1">
                      {diagnosisCodes.map(diagnosis => (
                        <div key={diagnosis.id} className="flex items-center gap-2 text-[10px]">
                          <span className="w-4 h-4 bg-primary text-primary-foreground rounded flex items-center justify-center font-bold">
                            {diagnosis.pointer}
                          </span>
                          <span className="font-bold">{diagnosis.code}</span>
                          <span className="text-gray-600">{diagnosis.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Procedures Summary */}
                  <div className="border border-gray-200 rounded-lg p-3">
                    <h4 className="text-xs font-semibold text-gray-900 mb-2">
                      Procedures ({procedureCodes.length})
                    </h4>
                    <div className="space-y-1">
                      {procedureCodes.map((proc, index) => (
                        <div key={proc.id} className="text-[10px] flex justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{index + 1}.</span>
                            <span className="font-bold">{proc.code}</span>
                            <span className="text-gray-600">{proc.description}</span>
                            <span className="text-purple-600">({proc.diagnosisPointers.join(', ')})</span>
                          </div>
                          <span className="font-semibold">${(proc.chargeAmount * proc.units).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-900 mb-1.5">
                      Claim Notes (Internal)
                    </label>
                    <textarea
                      value={claimNotes}
                      onChange={(e) => setClaimNotes(e.target.value)}
                      placeholder="Add any internal notes about this claim..."
                      rows={3}
                      className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Patient Context */}
      <div className="w-80 border-l border-gray-200 bg-white overflow-y-auto">
        <div className="p-3 space-y-3">
          {/* Patient Context */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1 bg-blue-600 rounded">
                <User className="h-3.5 w-3.5 text-white" />
              </div>
              <h3 className="text-xs font-bold text-blue-900">Patient Information</h3>
            </div>
            <div className="space-y-1.5 text-[10px]">
              <div className="flex justify-between">
                <span className="text-blue-700">ID</span>
                <span className="font-semibold text-blue-900">{patientId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Name</span>
                <span className="font-semibold text-blue-900">{patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">DOB</span>
                <span className="font-semibold text-blue-900">{patientDOB}</span>
              </div>
              {patientGender && (
                <div className="flex justify-between">
                  <span className="text-blue-700">Gender</span>
                  <span className="font-semibold text-blue-900">{patientGender}</span>
                </div>
              )}
              {patientPhone && (
                <div className="flex justify-between">
                  <span className="text-blue-700">Phone</span>
                  <span className="font-semibold text-blue-900">{patientPhone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Eligibility Status */}
          {eligibilityData && (
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1 bg-green-600 rounded">
                  <CheckCircle className="h-3.5 w-3.5 text-white" />
                </div>
                <h3 className="text-xs font-bold text-green-900">Eligibility Check</h3>
              </div>
              <div className="space-y-1.5 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-green-700">Status</span>
                  <span className="font-semibold text-green-900">{eligibilityData.status}</span>
                </div>
                {eligibilityData.copay && (
                  <div className="flex justify-between">
                    <span className="text-green-700">Copay</span>
                    <span className="font-semibold text-green-900">${eligibilityData.copay.toFixed(2)}</span>
                  </div>
                )}
                {eligibilityData.deductible && (
                  <div className="flex justify-between">
                    <span className="text-green-700">Deductible</span>
                    <span className="font-semibold text-green-900">${eligibilityData.deductible.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Financial Summary */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1 bg-purple-600 rounded">
                <DollarSign className="h-3.5 w-3.5 text-white" />
              </div>
              <h3 className="text-xs font-bold text-purple-900">Financial Summary</h3>
            </div>
            <div className="space-y-1.5 text-[10px]">
              <div className="flex justify-between">
                <span className="text-purple-700">Total Charges</span>
                <span className="font-semibold text-purple-900">${totalCharges.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-700">Expected Reimbursement</span>
                <span className="font-semibold text-purple-900">${expectedReimbursement.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-purple-300">
                <span className="text-purple-700">Patient Responsibility</span>
                <span className="font-bold text-purple-900">${patientResponsibility.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
