'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Eye, Calendar, Plus, AlertTriangle, CheckCircle, Clock,
  FileText, Download, Printer, Edit2, Trash2, X, Save,
  ChevronDown, ChevronUp, Image, Activity, Baby, Ruler
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { getUltrasoundRecords, UltrasoundRecord as ServiceUltrasoundRecord } from '../../../../services/obgyn.service';
import { UltrasoundDialog } from './UltrasoundDialog';

/**
 * ULTRASOUND TRACKING PANEL
 * =========================
 * 
 * Manages prenatal ultrasound documentation and findings.
 * Supports standard prenatal ultrasound types per ACOG guidelines.
 * 
 * ULTRASOUND TYPES:
 * - Dating (8-13 weeks): Confirm viability, establish EDD
 * - NT Screening (11-14 weeks): Nuchal translucency, chromosome screening
 * - Anatomy (18-22 weeks): Detailed fetal survey
 * - Growth (28-36 weeks): Fetal growth assessment
 * - Biophysical Profile: Fetal well-being assessment
 * - Targeted: Specific follow-up for abnormalities
 */

// Use the service type or extend it if needed for UI specific things not in backend yet
// For now we will use the service record type but alias it for clarity in this file if needed
// or just use ServiceUltrasoundRecord.
type UltrasoundRecord = ServiceUltrasoundRecord;

interface UltrasoundTrackingPanelProps {
  patientId: string;
  episodeId?: string;
  currentGA?: string; // Current gestational age
  edd?: string;
  fetalCount?: number;
  onSave?: (record: UltrasoundRecord) => void;
}

export function UltrasoundTrackingPanel({
  patientId,
  episodeId,
  currentGA = '27w 0d',
  edd,
  fetalCount = 1
}: UltrasoundTrackingPanelProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [records, setRecords] = useState<UltrasoundRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getUltrasoundRecords(patientId, episodeId);
      setRecords(data);
    } catch (error) {
      console.error('Failed to fetch ultrasound records:', error);
    } finally {
      setLoading(false);
    }
  }, [patientId, episodeId]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Upcoming scans based on current GA and schedule
  const getScheduledScans = () => {
    const gaWeeks = parseInt(currentGA.split('w')[0]);
    const scheduled = [];

    // Check what's already done
    const hasDating = records.some(r => r.scanType === 'dating');
    const hasAnatomy = records.some(r => r.scanType === 'anatomy');
    const hasGrowth = records.some(r => r.scanType === 'growth' && parseInt(r.gestationalAge.split('w')[0]) >= 28);

    if (!hasGrowth && gaWeeks < 36) {
      scheduled.push({
        type: 'growth',
        label: '3rd Trimester Growth',
        targetGA: '32-36 weeks',
        status: gaWeeks >= 28 ? 'due' : 'upcoming'
      });
    }

    return scheduled;
  };

  const scheduledScans = getScheduledScans();

  // Get scan type display info
  const getScanTypeInfo = (type: string) => {
    switch (type) {
      case 'dating':
        return { label: 'Dating Scan', color: 'bg-blue-100 text-blue-700', icon: Calendar };
      case 'nt_screening':
        return { label: 'NT Screening', color: 'bg-purple-100 text-purple-700', icon: Activity };
      case 'anatomy':
        return { label: 'Anatomy Scan', color: 'bg-green-100 text-green-700', icon: Baby };
      case 'growth':
        return { label: 'Growth Scan', color: 'bg-orange-100 text-orange-700', icon: Ruler };
      case 'bpp':
        return { label: 'Biophysical Profile', color: 'bg-pink-100 text-pink-700', icon: Activity };
      case 'cervical_length':
        return { label: 'Cervical Length', color: 'bg-indigo-100 text-indigo-700', icon: Ruler };
      case 'targeted':
        return { label: 'Targeted Scan', color: 'bg-red-100 text-red-700', icon: Eye };
      default:
        return { label: 'Ultrasound', color: 'bg-gray-100 text-gray-700', icon: Eye };
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Eye className="h-5 w-5" />
            <div>
              <h2 className="text-base font-bold">Ultrasound Tracking</h2>
              <p className="text-[10px] text-indigo-100">
                {records.length} scans recorded • Current GA: {currentGA}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddDialog(true)}
            className="px-3 py-1.5 text-xs bg-white text-indigo-600 rounded hover:bg-indigo-50 font-semibold flex items-center gap-1"
          >
            <Plus className="h-3 w-3" />
            Add Scan
          </button>
        </div>
      </div>

      {/* Quick Summary */}
      <div className="grid grid-cols-4 gap-2 p-3 bg-gray-50 border-b border-gray-200">
        <div className="bg-white rounded p-2 border border-gray-200 text-center">
          <div className="text-2xl font-bold text-indigo-600">{records.length}</div>
          <div className="text-[9px] text-gray-500 uppercase">Total Scans</div>
        </div>
        <div className="bg-white rounded p-2 border border-gray-200 text-center">
          <div className="text-lg font-bold text-green-600">
            {records.filter(r => r.assessment === 'Normal').length}
          </div>
          <div className="text-[9px] text-gray-500 uppercase">Normal</div>
        </div>
        <div className="bg-white rounded p-2 border border-gray-200 text-center">
          <div className="text-lg font-bold text-orange-600">
            {scheduledScans.filter(s => s.status === 'due').length}
          </div>
          <div className="text-[9px] text-gray-500 uppercase">Due</div>
        </div>
        <div className="bg-white rounded p-2 border border-gray-200 text-center">
          <div className="text-lg font-bold text-blue-600">
            {scheduledScans.filter(s => s.status === 'upcoming').length}
          </div>
          <div className="text-[9px] text-gray-500 uppercase">Upcoming</div>
        </div>
      </div>

      {/* Scheduled Scans Alert */}
      {scheduledScans.filter(s => s.status === 'due').length > 0 && (
        <div className="mx-3 mt-3 bg-amber-50 border border-amber-200 rounded p-2 flex items-start gap-2">
          <Clock className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800">
            <strong>Scans Due:</strong>{' '}
            {scheduledScans.filter(s => s.status === 'due').map(s => s.label).join(', ')}
          </div>
        </div>
      )}

      {/* Scan Timeline */}
      <div className="p-3">
        <div className="text-xs font-semibold text-gray-700 mb-2 flex items-center justify-between">
          <span>Scan History</span>
          <div className="flex items-center gap-2">
            <button className="p-1 text-gray-500 hover:text-gray-700 border border-gray-300 rounded">
              <Printer className="h-3 w-3" />
            </button>
            <button className="p-1 text-gray-500 hover:text-gray-700 border border-gray-300 rounded">
              <Download className="h-3 w-3" />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {records.sort((a, b) => new Date(b.scanDate).getTime() - new Date(a.scanDate).getTime()).map((record) => {
            const typeInfo = getScanTypeInfo(record.scanType);
            const isExpanded = expandedId === record.id;

            return (
              <div
                key={record.id}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                {/* Scan Header */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : record.id || '')}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded ${typeInfo.color}`}>
                      <typeInfo.icon className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">{typeInfo.label}</span>
                        <span className={`px-1.5 py-0.5 text-[9px] rounded ${record.assessment === 'Normal'
                          ? 'bg-green-100 text-green-700'
                          : record.assessment === 'Abnormal'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                          }`}>
                          {record.assessment}
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-600">
                        {format(parseISO(record.scanDate), 'MMM d, yyyy')} • GA: {record.gestationalAge}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {record.imageCount && (
                      <span className="text-[10px] text-gray-500 flex items-center gap-1">
                        <Image className="h-3 w-3" />
                        {record.imageCount}
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    )}
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="p-3 bg-white border-t border-gray-200 space-y-3">
                    {/* Basic Info */}
                    <div className="grid grid-cols-4 gap-2 text-[10px]">
                      <div>
                        <span className="text-gray-500">Provider:</span>
                        <div className="font-semibold">{record.provider}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Facility:</span>
                        <div className="font-semibold">{record.facility || '—'}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Presentation:</span>
                        <div className="font-semibold">{record.presentation || '—'}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Placenta:</span>
                        <div className="font-semibold">{record.placentaLocation || '—'}</div>
                      </div>
                    </div>

                    {/* Biometry (if present) */}
                    {record.biometry && Object.keys(record.biometry).length > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded p-2">
                        <div className="text-[10px] font-semibold text-blue-800 mb-2">Biometry</div>
                        <div className="grid grid-cols-6 gap-2">
                          {record.biometry.crl && (
                            <div className="bg-white rounded p-1.5 text-center border border-blue-200">
                              <div className="text-[9px] text-gray-500">CRL</div>
                              <div className="text-xs font-bold">{record.biometry.crl} mm</div>
                            </div>
                          )}
                          {record.biometry.bpd && (
                            <div className="bg-white rounded p-1.5 text-center border border-blue-200">
                              <div className="text-[9px] text-gray-500">BPD</div>
                              <div className="text-xs font-bold">{record.biometry.bpd} mm</div>
                            </div>
                          )}
                          {record.biometry.hc && (
                            <div className="bg-white rounded p-1.5 text-center border border-blue-200">
                              <div className="text-[9px] text-gray-500">HC</div>
                              <div className="text-xs font-bold">{record.biometry.hc} mm</div>
                            </div>
                          )}
                          {record.biometry.ac && (
                            <div className="bg-white rounded p-1.5 text-center border border-blue-200">
                              <div className="text-[9px] text-gray-500">AC</div>
                              <div className="text-xs font-bold">{record.biometry.ac} mm</div>
                            </div>
                          )}
                          {record.biometry.fl && (
                            <div className="bg-white rounded p-1.5 text-center border border-blue-200">
                              <div className="text-[9px] text-gray-500">FL</div>
                              <div className="text-xs font-bold">{record.biometry.fl} mm</div>
                            </div>
                          )}
                          {record.biometry.efw && (
                            <div className="bg-white rounded p-1.5 text-center border border-blue-200">
                              <div className="text-[9px] text-gray-500">EFW</div>
                              <div className="text-xs font-bold">{record.biometry.efw} g</div>
                              {record.biometry.efwPercentile && (
                                <div className="text-[8px] text-gray-500">{record.biometry.efwPercentile}%ile</div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* AFI (if present) */}
                    {record.amnioticFluid && (
                      <div className={`flex items-center gap-2 text-xs p-2 rounded ${record.amnioticFluid.status === 'Normal'
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-orange-50 border border-orange-200'
                        }`}>
                        <span className="font-semibold">Amniotic Fluid:</span>
                        <span>{record.amnioticFluid.status}</span>
                        {record.amnioticFluid.afi && (
                          <span className="text-gray-600">(AFI: {record.amnioticFluid.afi} cm)</span>
                        )}
                      </div>
                    )}

                    {/* Findings */}
                    {record.findings.length > 0 && (
                      <div>
                        <div className="text-[10px] font-semibold text-gray-700 mb-1">Findings</div>
                        <div className="grid grid-cols-2 gap-1">
                          {record.findings.map((finding, idx) => (
                            <div
                              key={idx}
                              className={`flex items-center justify-between px-2 py-1 rounded text-[10px] ${finding.status === 'normal'
                                ? 'bg-gray-50'
                                : finding.status === 'abnormal'
                                  ? 'bg-red-50'
                                  : 'bg-yellow-50'
                                }`}
                            >
                              <span className="text-gray-700">{finding.parameter}</span>
                              <span className={`font-semibold ${finding.status === 'normal'
                                ? 'text-green-600'
                                : finding.status === 'abnormal'
                                  ? 'text-red-600'
                                  : 'text-yellow-600'
                                }`}>
                                {finding.value}{finding.unit && ` ${finding.unit}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommendations */}
                    {record.recommendations && record.recommendations.length > 0 && (
                      <div className="bg-amber-50 border border-amber-200 rounded p-2">
                        <div className="text-[10px] font-semibold text-amber-800 mb-1">Recommendations</div>
                        <ul className="text-[10px] text-amber-900 space-y-0.5">
                          {record.recommendations.map((rec, idx) => (
                            <li key={idx}>• {rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Notes */}
                    {record.notes && (
                      <div className="text-[10px] text-gray-600 bg-gray-50 rounded p-2 border border-gray-200">
                        <strong>Notes:</strong> {record.notes}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <div className="flex items-center gap-2">
                        <button className="px-2 py-1 text-[10px] text-gray-600 hover:text-gray-800 border border-gray-300 rounded flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          View Report
                        </button>
                        <button className="px-2 py-1 text-[10px] text-gray-600 hover:text-gray-800 border border-gray-300 rounded flex items-center gap-1">
                          <Image className="h-3 w-3" />
                          View Images
                        </button>
                      </div>
                      <div className="flex items-center gap-1">
                        <button className="p-1 text-gray-500 hover:text-gray-700">
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button className="p-1 text-red-500 hover:text-red-700">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {records.length === 0 && (
          <div className="text-center py-8">
            <Eye className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-600">No ultrasound records yet</p>
            <button
              onClick={() => setShowAddDialog(true)}
              className="mt-3 px-4 py-2 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Add First Ultrasound
            </button>
          </div>
        )}
      </div>

      {/* Schedule Reference */}
      <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
        <div className="text-[10px] text-gray-600">
          <strong>Standard Prenatal Ultrasound Schedule:</strong>{' '}
          Dating (8-13w) • NT Screening (11-14w) • Anatomy (18-22w) • Growth (32-36w)
        </div>
      </div>

      <UltrasoundDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        patientId={patientId}
        onSuccess={() => {
          fetchRecords();
        }}
      />
    </div>
  );
}
