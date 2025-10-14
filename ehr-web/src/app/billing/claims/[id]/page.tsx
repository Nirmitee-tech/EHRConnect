'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Send,
  CheckCircle,
  AlertCircle,
  Plus,
  X,
  DollarSign,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  CalendarDays,
  User,
  Stethoscope,
  Loader2,
  ListChecks,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import billingService from '@/services/billing.service';
import { AppointmentService, AppointmentBillingContext } from '@/services/appointment.service';

type Tab = 'diagnosis' | 'procedures' | 'provider' | 'insurance' | 'summary';

interface ClaimLine {
  lineNumber: number;
  serviceDate: string;
  placeOfService: string;
  cptCode: string;
  modifiers: string[];
  icdCodes: string[];
  units: number;
  chargeAmount: number;
  renderingProviderNpi?: string;
}

type CoverageOption = NonNullable<AppointmentBillingContext['coverage']>;

export default function ClaimEditorPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const claimId = params.id as string;
  const isNew = claimId === 'new';
  const appointmentIdFromQuery = searchParams?.get('appointmentId');

  const defaultServiceDateRef = useRef(new Date().toISOString().split('T')[0]);

  const [activeTab, setActiveTab] = useState<Tab>('diagnosis');
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [prefillContext, setPrefillContext] = useState<AppointmentBillingContext | null>(null);
  const [prefillLoading, setPrefillLoading] = useState(false);
  const [prefillError, setPrefillError] = useState<string | null>(null);
  const [prefillHydrated, setPrefillHydrated] = useState(false);
  const [selectedCoverageId, setSelectedCoverageId] = useState<string | null>(null);
  const [prefillHydrationError, setPrefillHydrationError] = useState<string | null>(null);
  const [pendingCoverageMatch, setPendingCoverageMatch] = useState<{ payerName?: string | null; payerReference?: string | null } | null>(null);
  const [payerSuggestion, setPayerSuggestion] = useState<string | null>(null);
  const [eligibilitySnapshot, setEligibilitySnapshot] = useState<any | null>(null);
  const [eligibilityLoading, setEligibilityLoading] = useState(false);
  const [priorAuths, setPriorAuths] = useState<any[]>([]);
  const [priorAuthLoading, setPriorAuthLoading] = useState(false);
  const [feeScheduleCache, setFeeScheduleCache] = useState<Record<string, number | null>>({});

  const [formData, setFormData] = useState({
    patientId: '',
    encounterId: '',
    payerId: '',
    locationId: '',
    authId: '',
    authNumber: '',
    claimType: 'professional' as 'professional' | 'institutional',
    billingProviderNpi: '',
    renderingProviderNpi: '',
    serviceLocationNpi: '',
    subscriberMemberId: '',
    patientAccountNumber: '',
    serviceDateFrom: defaultServiceDateRef.current,
    serviceDateTo: defaultServiceDateRef.current,
    icdCodes: [] as string[],
    lines: [] as ClaimLine[],
  });

  const [claim, setClaim] = useState<any>(null);
  const [payers, setPayers] = useState<any[]>([]);
  const [icdInput, setIcdInput] = useState('');
  const [icdSuggestions, setIcdSuggestions] = useState<any[]>([]);

  const coverageOptions = useMemo<CoverageOption[]>(() => {
    if (!prefillContext) {
      return [];
    }

    const seen = new Set<string>();
    const deduped: CoverageOption[] = [];

    const pushOption = (option?: CoverageOption | null) => {
      if (!option?.id || seen.has(option.id)) {
        return;
      }

      seen.add(option.id);
      deduped.push(option);
    };

    pushOption(prefillContext.coverage as CoverageOption | undefined);
    (prefillContext.coverageOptions ?? []).forEach((option) => pushOption(option as CoverageOption));

    return deduped;
  }, [prefillContext]);

  const selectedCoverage = useMemo(() => {
    if (!prefillContext) {
      return null;
    }

    if (selectedCoverageId) {
      const fromOptions = coverageOptions.find((option) => option.id === selectedCoverageId);
      if (fromOptions) {
        return fromOptions;
      }

      if (prefillContext.coverage?.id === selectedCoverageId) {
        return prefillContext.coverage;
      }
    }

    return prefillContext.coverage ?? coverageOptions[0] ?? null;
  }, [prefillContext, coverageOptions, selectedCoverageId]);

  const matchPayer = useCallback(
    (payerName?: string | null, payerReference?: string | null) => {
      if (!payers || payers.length === 0) {
        return undefined;
      }

      const referenceId = payerReference?.split('/')?.[1]?.toLowerCase();
      if (referenceId) {
        const matchByReference = payers.find((payer: any) => {
          const candidateValues = [
            payer.id,
            payer.externalId,
            payer.external_id,
            payer.fhirOrganizationId,
            payer.fhir_organization_id,
          ]
            .filter(Boolean)
            .map((value: any) => value.toString().toLowerCase());
          return candidateValues.includes(referenceId);
        });

        if (matchByReference) {
          return matchByReference;
        }
      }

      if (!payerName) {
        return undefined;
      }

      const normalizedExact = payerName.toLowerCase().trim();
      const exactMatch = payers.find((payer: any) => (payer.name || '').toLowerCase().trim() === normalizedExact);
      if (exactMatch) {
        return exactMatch;
      }

      const sanitize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');
      const normalizedSanitized = sanitize(payerName);

      const sanitizedMatch = payers.find((payer: any) => sanitize(payer.name || '') === normalizedSanitized);
      if (sanitizedMatch) {
        return sanitizedMatch;
      }

      const partialMatch = payers.find((payer: any) => sanitize(payer.name || '').includes(normalizedSanitized));
      if (partialMatch) {
        return partialMatch;
      }

      return undefined;
    },
    [payers]
  );

  const applyPrefill = useCallback(
    (
      {
        force = false,
        coverageId,
        forceCoverageFields = false,
      }: { force?: boolean; coverageId?: string | null; forceCoverageFields?: boolean } = {}
    ) => {
      if (!prefillContext) {
        return;
      }

      const resolvedCoverage =
        (coverageId
          ? coverageOptions.find((option) => option.id === coverageId) ||
            (prefillContext.coverage?.id === coverageId ? (prefillContext.coverage as CoverageOption) : undefined)
          : undefined) ??
        selectedCoverage ??
        (prefillContext.coverage as CoverageOption | null) ??
        coverageOptions[0];

      if (coverageId && !resolvedCoverage) {
        setPrefillHydrationError('Selected coverage could not be resolved from the appointment context.');
        return;
      }

      setPrefillHydrationError(null);

      const matchedPayer = matchPayer(resolvedCoverage?.payerName, resolvedCoverage?.payerReference);
      if (!resolvedCoverage) {
        setPendingCoverageMatch(null);
        setPayerSuggestion(null);
      } else if (!matchedPayer && (resolvedCoverage.payerName || resolvedCoverage.payerReference)) {
        setPendingCoverageMatch((prev) => {
          const nextValue = {
            payerName: resolvedCoverage.payerName ?? null,
            payerReference: resolvedCoverage.payerReference ?? null,
          };

          if (prev?.payerName === nextValue.payerName && prev?.payerReference === nextValue.payerReference) {
            return prev;
          }

          return nextValue;
        });
        setPayerSuggestion(resolvedCoverage.payerName ?? null);
      } else {
        setPendingCoverageMatch(null);
        setPayerSuggestion(null);
      }

      const appointmentStart = prefillContext.appointment?.startTime
        ? new Date(prefillContext.appointment.startTime).toISOString().split('T')[0]
        : undefined;
      const appointmentEnd = prefillContext.appointment?.endTime
        ? new Date(prefillContext.appointment.endTime).toISOString().split('T')[0]
        : undefined;

      setFormData((prev) => {
        const next = { ...prev };
        let changed = false;
        const originalLines = prev.lines || [];
        const shouldForceCoverage = force || forceCoverageFields || typeof coverageId !== 'undefined';

        const updateField = <K extends keyof typeof prev>(
          key: K,
          value: typeof prev[K] | undefined,
          options?: {
            overrideIfDefault?: typeof prev[K];
            alwaysOverride?: boolean;
            treatEmptyAsValue?: boolean;
          }
        ) => {
          if (value === undefined || value === null || (value === '' && !options?.treatEmptyAsValue)) {
            return false;
          }

          const current = prev[key];

          const shouldOverride =
            options?.alwaysOverride ||
            force ||
            current === undefined ||
            current === null ||
            current === '' ||
            (options?.overrideIfDefault !== undefined && current === options.overrideIfDefault);

          if (!shouldOverride || current === value) {
            return false;
          }

          next[key] = value;
          changed = true;
          return true;
        };

        updateField('patientId', prefillContext.patient?.id);
        updateField('encounterId', prefillContext.encounterId);
        updateField('billingProviderNpi', prefillContext.provider?.npi);
        updateField('renderingProviderNpi', prefillContext.provider?.npi);
        const serviceDateFromChanged = updateField('serviceDateFrom', appointmentStart, {
          overrideIfDefault: defaultServiceDateRef.current,
        });
        updateField('serviceDateTo', appointmentEnd, { overrideIfDefault: defaultServiceDateRef.current });
        updateField('subscriberMemberId', resolvedCoverage?.subscriberId, {
          alwaysOverride: shouldForceCoverage,
        });
        updateField('patientAccountNumber', prefillContext.patient?.accountNumber);

        if (matchedPayer?.id) {
          updateField('payerId', matchedPayer.id as any, { alwaysOverride: true, treatEmptyAsValue: true });
        }

        if (!matchedPayer?.id && shouldForceCoverage && prev.payerId) {
          next.payerId = '';
          changed = true;
        }

        if (!resolvedCoverage?.subscriberId && shouldForceCoverage && prev.subscriberMemberId) {
          next.subscriberMemberId = '';
          changed = true;
        }

        if (serviceDateFromChanged && appointmentStart) {
          let linesChanged = false;
          const updatedLines = originalLines.map((line) => {
            if (
              !line.serviceDate ||
              line.serviceDate === prev.serviceDateFrom ||
              line.serviceDate === defaultServiceDateRef.current
            ) {
              if (line.serviceDate === appointmentStart) {
                return line;
              }

              linesChanged = true;
              return { ...line, serviceDate: appointmentStart };
            }

            return line;
          });

          if (linesChanged) {
            next.lines = updatedLines;
            changed = true;
          }
        }

        const linesForFollowUp = (next.lines || originalLines) as ClaimLine[];

        if (shouldForceCoverage && !resolvedCoverage && linesForFollowUp.length > 0) {
          let linesCleared = false;
          const updatedLines = linesForFollowUp.map((line) => {
            if (!line.serviceDate || line.serviceDate === prev.serviceDateFrom) {
              if (!line.serviceDate) {
                return line;
              }

              linesCleared = true;
              return { ...line, serviceDate: defaultServiceDateRef.current };
            }

            return line;
          });

          if (linesCleared) {
            next.lines = updatedLines;
            changed = true;
          }
        }

        return changed ? next : prev;
      });

      setPrefillHydrated(true);
    },
    [
      prefillContext,
      coverageOptions,
      selectedCoverage,
      matchPayer,
      defaultServiceDateRef,
      setFormData,
      setPrefillHydrated,
    ]
  );

  useEffect(() => {
    if (!prefillContext) {
      setSelectedCoverageId(null);
      return;
    }

    const fallbackId = prefillContext.coverage?.id ?? coverageOptions[0]?.id ?? null;

    if (!selectedCoverageId && fallbackId) {
      setSelectedCoverageId(fallbackId);
      return;
    }

    if (
      selectedCoverageId &&
      coverageOptions.length > 0 &&
      !coverageOptions.some((option) => option.id === selectedCoverageId)
    ) {
      if (fallbackId) {
        setSelectedCoverageId(fallbackId);
      } else {
        setSelectedCoverageId(null);
      }
    }
  }, [prefillContext, coverageOptions, selectedCoverageId]);

  useEffect(() => {
    if (!isNew || !prefillContext || prefillHydrated) {
      return;
    }

    applyPrefill();
  }, [isNew, prefillContext, prefillHydrated, applyPrefill]);

  const currentPayerId = formData.payerId;

  useEffect(() => {
    if (!pendingCoverageMatch || !payers.length || currentPayerId) {
      return;
    }

    const matched = matchPayer(pendingCoverageMatch.payerName, pendingCoverageMatch.payerReference);
    if (matched) {
      setFormData((prev) => ({ ...prev, payerId: matched.id }));
      setPayerSuggestion(null);
      setPendingCoverageMatch(null);
    }
  }, [pendingCoverageMatch, payers, currentPayerId, matchPayer]);

  useEffect(() => {
    loadPayers();
    if (!isNew) {
      loadClaim();
    }
  }, []);

  useEffect(() => {
    if (!isNew || !appointmentIdFromQuery) {
      return;
    }

    setPrefillLoading(true);
    setPrefillError(null);

    AppointmentService.getBillingContext(appointmentIdFromQuery)
      .then((context) => {
        setPrefillContext(context);
        setPrefillHydrated(false);
        setPrefillHydrationError(null);
        setSelectedCoverageId(null);
        setPendingCoverageMatch(null);
      })
      .catch((error) => {
        console.error('Failed to load appointment billing context:', error);
        setPrefillError('Unable to load appointment details for superbill prefill.');
      })
      .finally(() => {
        setPrefillLoading(false);
      });
  }, [isNew, appointmentIdFromQuery]);

  useEffect(() => {
    if (!prefillContext?.patient?.id) {
      setEligibilitySnapshot(null);
      setPriorAuths([]);
      return;
    }

    setEligibilityLoading(true);
    billingService
      .getEligibilityHistory(prefillContext.patient.id, 1)
      .then((history) => {
        setEligibilitySnapshot(history?.[0] || null);
      })
      .catch((error) => {
        console.error('Failed to fetch eligibility snapshot:', error);
        setEligibilitySnapshot(null);
      })
      .finally(() => setEligibilityLoading(false));

    setPriorAuthLoading(true);
    billingService
      .getPriorAuthorizations({ patientId: prefillContext.patient.id, limit: 3 })
      .then((data) => setPriorAuths(Array.isArray(data) ? data : []))
      .catch((error) => {
        console.error('Failed to fetch prior authorizations:', error);
        setPriorAuths([]);
      })
      .finally(() => setPriorAuthLoading(false));
  }, [prefillContext?.patient?.id]);

  

  useEffect(() => {
    if (icdInput.length >= 2) {
      searchICDCodes(icdInput);
    } else {
      setIcdSuggestions([]);
    }
  }, [icdInput]);

  useEffect(() => {
    if (!formData.payerId) {
      return;
    }

    formData.lines.forEach((line, index) => {
      if (line.cptCode && (!line.chargeAmount || line.chargeAmount <= 0)) {
        fetchFeeScheduleForLine(index, line.cptCode, formData.payerId);
      }
    });
  }, [formData.payerId]);

  const handleCoverageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextCoverageId = event.target.value || null;
    setSelectedCoverageId(nextCoverageId);
    applyPrefill({ coverageId: nextCoverageId, forceCoverageFields: true });
  };

  const handleReapplyPrefill = (force = false) => {
    applyPrefill({ force, coverageId: selectedCoverageId });
  };

  const loadPayers = async () => {
    try {
      const data = await billingService.getPayers();
      setPayers(data);
    } catch (error) {
      console.error('Failed to load payers:', error);
    }
  };

  const loadClaim = async () => {
    try {
      const data = await billingService.getClaimDetail(claimId);
      setClaim(data);

      // Populate form
      setFormData({
        patientId: data.patient_id || '',
        encounterId: data.encounter_id || '',
        payerId: data.payer_id || '',
        locationId: data.location_id || '',
        authId: data.auth_id || '',
        authNumber: data.auth_number || '',
        claimType: data.claim_type || 'professional',
        billingProviderNpi: data.billing_provider_npi || '',
        renderingProviderNpi: data.rendering_provider_npi || '',
        serviceLocationNpi: data.service_location_npi || '',
        subscriberMemberId: data.subscriber_member_id || '',
        patientAccountNumber: data.patient_account_number || '',
        serviceDateFrom: data.service_date_from || '',
        serviceDateTo: data.service_date_to || '',
        icdCodes: data.claim_payload?.icdCodes || [],
        lines: data.lines || [],
      });
    } catch (error) {
      console.error('Failed to load claim:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchICDCodes = async (search: string) => {
    try {
      const data = await billingService.getICDCodes(search, 10);
      setIcdSuggestions(data);
    } catch (error) {
      console.error('Failed to search ICD codes:', error);
    }
  };

  const addICDCode = (code: string) => {
    if (!code) return;

    setFormData((prev) => {
      if (prev.icdCodes.includes(code)) {
        return prev;
      }
      return { ...prev, icdCodes: [...prev.icdCodes, code] };
    });
    setIcdInput('');
    setIcdSuggestions([]);
  };

  const removeICDCode = (code: string) => {
    setFormData((prev) => ({
      ...prev,
      icdCodes: prev.icdCodes.filter((c) => c !== code),
    }));
  };

  const addLine = () => {
    setFormData((prev) => {
      const newLine: ClaimLine = {
        lineNumber: prev.lines.length + 1,
        serviceDate: prev.serviceDateFrom,
        placeOfService: '11',
        cptCode: '',
        modifiers: [],
        icdCodes: prev.icdCodes,
        units: 1,
        chargeAmount: 0,
      };
      return { ...prev, lines: [...prev.lines, newLine] };
    });
  };

  const updateLine = (index: number, updates: Partial<ClaimLine>) => {
    setFormData((prev) => {
      const newLines = [...prev.lines];
      newLines[index] = { ...newLines[index], ...updates };
      return { ...prev, lines: newLines };
    });
  };

  const removeLine = (index: number) => {
    setFormData((prev) => {
      const newLines = prev.lines
        .filter((_, i) => i !== index)
        .map((line, idx) => ({ ...line, lineNumber: idx + 1 }));
      return { ...prev, lines: newLines };
    });
  };

  const applyDefaultCharge = (lineIndex: number, amount: number) => {
    if (typeof amount !== 'number' || Number.isNaN(amount) || amount <= 0) {
      return;
    }

    setFormData((prev) => {
      const newLines = [...prev.lines];
      const targetLine = newLines[lineIndex];
      if (!targetLine) {
        return prev;
      }

      if (targetLine.chargeAmount && targetLine.chargeAmount > 0) {
        return prev;
      }

      newLines[lineIndex] = { ...targetLine, chargeAmount: Number(amount.toFixed(2)) };
      return { ...prev, lines: newLines };
    });
  };

  const fetchFeeScheduleForLine = async (lineIndex: number, cptCode: string, payerId: string) => {
    const normalizedCode = cptCode.trim().toUpperCase();
    if (!normalizedCode) {
      return;
    }

    const cacheKey = `${normalizedCode}|${payerId}`;
    if (cacheKey in feeScheduleCache) {
      const cachedAmount = feeScheduleCache[cacheKey];
      if (typeof cachedAmount === 'number' && cachedAmount > 0) {
        applyDefaultCharge(lineIndex, cachedAmount);
      }
      return;
    }

    try {
      const schedule = await billingService.getFeeSchedule(normalizedCode, payerId);
      const amount = schedule?.amount ? parseFloat(schedule.amount) : NaN;

      if (!Number.isNaN(amount)) {
        setFeeScheduleCache((prev) => ({ ...prev, [cacheKey]: amount }));
        applyDefaultCharge(lineIndex, amount);
      } else {
        setFeeScheduleCache((prev) => ({ ...prev, [cacheKey]: null }));
      }
    } catch (error) {
      console.error('Failed to fetch fee schedule for CPT:', error);
      setFeeScheduleCache((prev) => ({ ...prev, [cacheKey]: null }));
    }
  };

  const handleCptChange = (index: number, value: string) => {
    const sanitized = value.toUpperCase();
    updateLine(index, { cptCode: sanitized });

    const payerId = formData.payerId;
    if (!payerId || !sanitized) {
      return;
    }

    fetchFeeScheduleForLine(index, sanitized, payerId);
  };

  const calculateTotalCharge = () => {
    return formData.lines.reduce((sum, line) => sum + (line.chargeAmount * line.units), 0);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const claimData = {
        ...formData,
        totalCharge: calculateTotalCharge(),
      };

      if (isNew) {
        const result = await billingService.createClaim(claimData);
        alert('Claim saved as draft!');
        router.push(`/billing/claims/${result.id}`);
      } else {
        await billingService.updateClaim(claimId, claimData);
        alert('Claim updated!');
        loadClaim();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save claim');
    } finally {
      setSaving(false);
    }
  };

  const handleValidate = async () => {
    setValidating(true);
    setErrors([]);
    try {
      const result = await billingService.validateClaim(claimId);
      if (result.valid) {
        alert('Claim is valid and ready to submit!');
        loadClaim();
      } else {
        setErrors(result.errors);
        alert('Claim has validation errors. Please fix them before submitting.');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Validation failed');
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const result = await billingService.submitClaim(claimId);
      alert(`Claim submitted successfully! Control Number: ${result.data.controlNumber}`);
      router.push('/billing/claims');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to submit claim');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDateSafe = (value?: string | Date) => {
    if (!value) return 'Not set';
    const parsed = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(parsed.getTime())) return 'Not set';
    return parsed.toLocaleDateString();
  };

  const tabs = [
    { id: 'diagnosis' as Tab, label: 'Diagnosis', icon: '🩺' },
    { id: 'procedures' as Tab, label: 'Procedures', icon: '💉' },
    { id: 'provider' as Tab, label: 'Provider', icon: '👨‍⚕️' },
    { id: 'insurance' as Tab, label: 'Insurance', icon: '🏥' },
    { id: 'summary' as Tab, label: 'Summary', icon: '📋' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading claim...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button onClick={() => router.back()} variant="outline" size="sm" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Claims
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isNew ? 'Create New Claim' : `Edit Claim: ${claim?.claim_number}`}
            </h1>
            <p className="text-gray-600 mt-1">
              {isNew ? 'Create a new insurance claim' : 'Edit claim details and submit'}
            </p>
          </div>

          <div className="flex gap-2">
            {!isNew && claim?.status === 'draft' && (
              <Button onClick={handleValidate} variant="outline" disabled={validating}>
                {validating ? 'Validating...' : 'Validate'}
              </Button>
            )}
            <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Draft'}
            </Button>
            {!isNew && claim?.status === 'validated' && (
              <Button onClick={handleSubmit} disabled={submitting} className="bg-green-600 hover:bg-green-700">
                <Send className="h-4 w-4 mr-2" />
                {submitting ? 'Submitting...' : 'Submit Claim'}
              </Button>
            )}
          </div>
      </div>
    </div>

      {isNew && (prefillLoading || prefillContext || prefillError || payerSuggestion) && (
        <div className="mb-6 space-y-4">
          {prefillLoading && (
            <div className="bg-white border border-dashed border-green-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
              <Loader2 className="h-5 w-5 text-green-600 animate-spin" />
              <div>
                <p className="text-sm font-semibold text-green-700">Preparing superbill prefill</p>
                <p className="text-xs text-green-600">We are loading appointment details, coverage, and provider NPIs.</p>
              </div>
            </div>
          )}

          {prefillError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-800">Superbill prefill unavailable</p>
                <p className="text-xs text-red-700 mt-1">{prefillError}</p>
              </div>
            </div>
          )}

          {prefillContext && (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-green-700">Prefilled from appointment</p>
                    <p className="text-sm text-green-900 mt-1">
                      {prefillContext.patient?.name || 'Unknown patient'} with {prefillContext.provider?.name || 'provider'}
                    </p>
                    <div className="mt-3 space-y-1 text-xs text-green-800">
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3" />
                        <span>DOB: {prefillContext.patient?.dateOfBirth ? formatDateSafe(prefillContext.patient.dateOfBirth) : 'Not captured'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Stethoscope className="h-3 w-3" />
                        <span>NPI: {prefillContext.provider?.npi || 'Missing'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-3 w-3" />
                        <span>
                          {formatDateSafe(prefillContext.appointment.startTime)} - {formatDateSafe(prefillContext.appointment.endTime)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Info className="h-3 w-3" />
                        <span>
                          Account #: {prefillContext.patient?.accountNumber || 'Not assigned'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Coverage &amp; eligibility</p>
                        <p className="text-sm text-blue-900 mt-1">
                          {selectedCoverage
                            ? selectedCoverage.planName || selectedCoverage.payerName || 'Active coverage'
                            : 'No active coverage on file'}
                        </p>
                        {selectedCoverage?.subscriberId && (
                          <p className="text-xs text-blue-700 mt-1">Subscriber ID: {selectedCoverage.subscriberId}</p>
                        )}
                        {selectedCoverage?.policyNumber && (
                          <p className="text-xs text-blue-700">Policy #: {selectedCoverage.policyNumber}</p>
                        )}
                        {selectedCoverage?.relationship && (
                          <p className="text-xs text-blue-700">Relationship: {selectedCoverage.relationship}</p>
                        )}
                        {selectedCoverage?.order !== undefined && (
                          <p className="text-xs text-blue-700">Order: {selectedCoverage.order}</p>
                        )}
                      </div>
                      {coverageOptions.length > 1 && (
                        <div className="min-w-[180px]">
                          <Label htmlFor="coverageSelect" className="text-xs text-blue-800">
                            Choose coverage
                          </Label>
                          <select
                            id="coverageSelect"
                            className="mt-1 w-full rounded-md border border-blue-200 bg-white px-2 py-1 text-xs text-blue-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={selectedCoverageId ?? ''}
                            onChange={handleCoverageChange}
                          >
                            {(coverageOptions.length ? coverageOptions : []).map((coverage) => (
                              <option key={coverage.id} value={coverage.id}>
                                {coverage.planName || coverage.payerName || 'Coverage'}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {prefillHydrationError && (
                      <p className="text-[11px] text-red-700 mt-2">{prefillHydrationError}</p>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-blue-300 text-blue-700 hover:bg-blue-100"
                        onClick={() => handleReapplyPrefill(true)}
                        disabled={!selectedCoverage}
                      >
                        Apply coverage to claim
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-700 hover:text-blue-900"
                        onClick={() => handleReapplyPrefill(false)}
                      >
                        Reapply appointment context
                      </Button>
                      <span className="text-[11px] text-blue-700">
                        {prefillHydrated
                          ? 'Prefill applied. Reapply if you adjust coverage or masters.'
                          : 'Apply coverage to push subscriber and payer details into this claim.'}
                      </span>
                    </div>

                    <div className="mt-4 border-t border-blue-100 pt-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Eligibility snapshot</p>
                      {eligibilityLoading ? (
                        <p className="text-xs text-blue-600 mt-2">Checking last verification...</p>
                      ) : eligibilitySnapshot ? (
                        <div className="mt-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${
                              (eligibilitySnapshot.eligibility_status || eligibilitySnapshot.status || '').toLowerCase() === 'active'
                                ? 'bg-green-100 text-green-700 border-green-200'
                                : (eligibilitySnapshot.eligibility_status || eligibilitySnapshot.status || '').toLowerCase() === 'inactive'
                                ? 'bg-red-100 text-red-700 border-red-200'
                                : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                            }`}
                          >
                            {(eligibilitySnapshot.eligibility_status || eligibilitySnapshot.status || 'unknown')
                              .toString()
                              .replace(/\b\w/g, (letter: string) => letter.toUpperCase())}
                          </span>
                          <p className="text-xs text-blue-700 mt-2">
                            Checked on {eligibilitySnapshot.checked_at ? formatDateSafe(eligibilitySnapshot.checked_at) : 'N/A'}
                          </p>
                          {eligibilitySnapshot.payer_name && (
                            <p className="text-xs text-blue-700 mt-1">Payer: {eligibilitySnapshot.payer_name}</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-blue-700 mt-2">No prior eligibility checks recorded for this patient.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <ListChecks className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Prior authorization</p>
                    {priorAuthLoading ? (
                      <p className="text-xs text-amber-700 mt-2">Looking for recent approvals...</p>
                    ) : priorAuths.length > 0 ? (
                      <ul className="mt-2 space-y-2">
                        {priorAuths.slice(0, 2).map((auth) => (
                          <li key={auth.id} className="text-xs text-amber-800">
                            <span className="font-semibold">{auth.auth_number || 'Authorization'}</span>
                            <span className="ml-1">• {(auth.status || 'pending').toString().replace(/\b\w/g, (letter: string) => letter.toUpperCase())}</span>
                            {auth.valid_to && (
                              <span className="ml-1 text-amber-700">(valid thru {formatDateSafe(auth.valid_to)})</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-amber-700 mt-2">No prior authorizations linked to this patient.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {prefillContext?.advisories?.length ? (
            <div className="grid gap-3 md:grid-cols-2">
              {prefillContext.advisories.map((advisory, index) => {
                const isWarning = advisory.severity === 'warning';
                return (
                  <div
                    key={`${advisory.code}-${index}`}
                    className={`flex items-start gap-3 rounded-xl border p-4 ${
                      isWarning ? 'bg-red-50 border-red-200' : 'bg-sky-50 border-sky-200'
                    }`}
                  >
                    {isWarning ? (
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    ) : (
                      <Info className="h-5 w-5 text-sky-600 mt-0.5" />
                    )}
                    <div>
                      <p className={`text-sm font-semibold ${isWarning ? 'text-red-800' : 'text-sky-900'}`}>
                        {advisory.message}
                      </p>
                      {advisory.detail && (
                        <p className={`text-xs mt-1 ${isWarning ? 'text-red-700' : 'text-sky-800'}`}>
                          {advisory.detail}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}

          {payerSuggestion && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-yellow-900">Select the payer “{payerSuggestion}”</p>
                <p className="text-xs text-yellow-800 mt-1">
                  Match the patient's active coverage to a payer in your billing masters so fee schedules and eligibility checks can
                  run automatically.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Validation Errors:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                {errors.map((error, idx) => (
                  <li key={idx} className="text-sm text-red-700">{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-8">
          {/* Diagnosis Tab */}
          {activeTab === 'diagnosis' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Diagnosis Codes (ICD-10)</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Add diagnosis codes that support the medical necessity of the services provided.
                </p>

                <div className="relative mb-4">
                  <Label>Search ICD-10 Codes</Label>
                  <Input
                    placeholder="Search by code or description..."
                    value={icdInput}
                    onChange={(e) => setIcdInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (icdInput) addICDCode(icdInput);
                      }
                    }}
                  />
                  {icdSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {icdSuggestions.map((icd) => (
                        <button
                          key={icd.code}
                          type="button"
                          onClick={() => addICDCode(icd.code)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b last:border-b-0"
                        >
                          <span className="font-mono font-semibold text-purple-600">{icd.code}</span>
                          <span className="text-gray-600 text-sm ml-2">- {icd.description}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {formData.icdCodes.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {formData.icdCodes.map((code) => (
                      <span
                        key={code}
                        className="px-3 py-2 bg-purple-50 text-purple-700 rounded-lg flex items-center gap-2 border border-purple-200"
                      >
                        <span className="font-mono font-semibold">{code}</span>
                        <button
                          type="button"
                          onClick={() => removeICDCode(code)}
                          className="text-purple-500 hover:text-purple-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-gray-500">No diagnosis codes added yet</p>
                    <p className="text-sm text-gray-400 mt-1">Search and add ICD-10 codes above</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Procedures Tab */}
          {activeTab === 'procedures' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Procedure Line Items</h2>
                  <p className="text-sm text-gray-600 mt-1">Add services and procedures performed</p>
                </div>
                <Button onClick={addLine} className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Line Item
                </Button>
              </div>

              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs text-green-700">
                <Sparkles className="h-4 w-4" />
                <span>We&apos;ll pull default charges from your fee schedules when you choose a CPT code.</span>
              </div>

              {formData.lines.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">CPT</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">POS</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Units</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Charge</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.lines.map((line, idx) => (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          <td className="px-3 py-2 text-sm">{idx + 1}</td>
                          <td className="px-3 py-2">
                            <Input
                              type="date"
                              value={line.serviceDate}
                              onChange={(e) => updateLine(idx, { serviceDate: e.target.value })}
                              className="w-32"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              placeholder="CPT"
                              value={line.cptCode}
                              onChange={(e) => handleCptChange(idx, e.target.value)}
                              className="w-24 font-mono"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              placeholder="11"
                              value={line.placeOfService}
                              onChange={(e) => updateLine(idx, { placeOfService: e.target.value })}
                              className="w-16"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              type="number"
                              min="1"
                              value={line.units}
                              onChange={(e) => updateLine(idx, { units: parseInt(e.target.value) || 1 })}
                              className="w-16"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={line.chargeAmount}
                              onChange={(e) => updateLine(idx, { chargeAmount: parseFloat(e.target.value) || 0 })}
                              className="w-24"
                            />
                          </td>
                          <td className="px-3 py-2 font-semibold text-sm">
                            ${(line.chargeAmount * line.units).toFixed(2)}
                          </td>
                          <td className="px-3 py-2">
                            <Button
                              onClick={() => removeLine(idx)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50 font-bold">
                        <td colSpan={6} className="px-3 py-3 text-right">Total Charge:</td>
                        <td className="px-3 py-3 text-lg text-green-600">
                          ${calculateTotalCharge().toFixed(2)}
                        </td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                  <p className="text-gray-500 mb-2">No line items added yet</p>
                  <Button onClick={addLine} className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Line Item
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Provider Tab */}
          {activeTab === 'provider' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Provider Information</h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label>Billing Provider NPI *</Label>
                  <Input
                    required
                    placeholder="10-digit NPI"
                    maxLength={10}
                    value={formData.billingProviderNpi}
                    onChange={(e) => setFormData({ ...formData, billingProviderNpi: e.target.value.replace(/\D/g, '') })}
                  />
                  <p className="text-xs text-gray-500 mt-1">National Provider Identifier for billing</p>
                </div>

                <div>
                  <Label>Rendering Provider NPI</Label>
                  <Input
                    placeholder="10-digit NPI (optional)"
                    maxLength={10}
                    value={formData.renderingProviderNpi}
                    onChange={(e) => setFormData({ ...formData, renderingProviderNpi: e.target.value.replace(/\D/g, '') })}
                  />
                  <p className="text-xs text-gray-500 mt-1">Provider who performed the service</p>
                </div>

                <div>
                  <Label>Service Location NPI</Label>
                  <Input
                    placeholder="10-digit NPI (optional)"
                    maxLength={10}
                    value={formData.serviceLocationNpi}
                    onChange={(e) => setFormData({ ...formData, serviceLocationNpi: e.target.value.replace(/\D/g, '') })}
                  />
                  <p className="text-xs text-gray-500 mt-1">Where service was performed</p>
                </div>
              </div>
            </div>
          )}

          {/* Insurance Tab */}
          {activeTab === 'insurance' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Insurance & Patient Information</h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label>Patient ID *</Label>
                  <Input
                    required
                    placeholder="FHIR Patient ID"
                    value={formData.patientId}
                    onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Encounter ID</Label>
                  <Input
                    placeholder="FHIR Encounter ID (optional)"
                    value={formData.encounterId}
                    onChange={(e) => setFormData({ ...formData, encounterId: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Insurance Payer *</Label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.payerId}
                    onChange={(e) => setFormData({ ...formData, payerId: e.target.value })}
                  >
                    <option value="">Select payer...</option>
                    {payers.map((payer) => (
                      <option key={payer.id} value={payer.id}>
                        {payer.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>Subscriber Member ID *</Label>
                  <Input
                    required
                    placeholder="Insurance member ID"
                    value={formData.subscriberMemberId}
                    onChange={(e) => setFormData({ ...formData, subscriberMemberId: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Patient Account Number</Label>
                  <Input
                    placeholder="Internal account number"
                    value={formData.patientAccountNumber}
                    onChange={(e) => setFormData({ ...formData, patientAccountNumber: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Prior Authorization Number</Label>
                  <Input
                    placeholder="If applicable"
                    value={formData.authNumber}
                    onChange={(e) => setFormData({ ...formData, authNumber: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Service Date From *</Label>
                  <Input
                    type="date"
                    required
                    value={formData.serviceDateFrom}
                    onChange={(e) => setFormData({ ...formData, serviceDateFrom: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Service Date To *</Label>
                  <Input
                    type="date"
                    required
                    value={formData.serviceDateTo}
                    onChange={(e) => setFormData({ ...formData, serviceDateTo: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Summary Tab */}
          {activeTab === 'summary' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Claim Summary</h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase mb-1">Patient ID</p>
                    <p className="text-lg font-semibold text-gray-900">{formData.patientId || 'Not set'}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase mb-1">Payer</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {payers.find(p => p.id === formData.payerId)?.name || 'Not selected'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase mb-1">Service Period</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formData.serviceDateFrom && formData.serviceDateTo
                        ? `${new Date(formData.serviceDateFrom).toLocaleDateString()} - ${new Date(formData.serviceDateTo).toLocaleDateString()}`
                        : 'Not set'}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase mb-1">Diagnosis Codes</p>
                    <div className="flex flex-wrap gap-1">
                      {formData.icdCodes.length > 0 ? (
                        formData.icdCodes.map(code => (
                          <span key={code} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm font-mono">
                            {code}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500">None added</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase mb-1">Line Items</p>
                    <p className="text-lg font-semibold text-gray-900">{formData.lines.length} procedure(s)</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase mb-1">Total Charge</p>
                    <p className="text-3xl font-bold text-green-600">
                      ${calculateTotalCharge().toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">Ready to Submit?</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Review all information above. Click "Validate" to check for errors, then "Submit Claim" to send to the payer.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
