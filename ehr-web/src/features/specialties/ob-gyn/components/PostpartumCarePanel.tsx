'use client';

import React, { useState } from 'react';
import {
  Heart, Baby, Calendar, CheckCircle, AlertTriangle, Clock,
  Activity, Pill, FileText, Brain, Droplet, Thermometer,
  Plus, ChevronDown, ChevronUp, Save, X
} from 'lucide-react';
import { format, differenceInDays, differenceInWeeks } from 'date-fns';
import { EPDSCalculator } from './EPDSCalculator';

/**
 * POSTPARTUM CARE PANEL
 * =====================
 * 
 * Comprehensive postpartum follow-up tracking dashboard.
 * Follows ACOG guidelines for postpartum care visits:
 * - First contact within 3 days
 * - Wound check at 1-2 weeks
 * - Comprehensive visit at 6 weeks
 * - Extended follow-up at 12 weeks if needed
 * 
 * KEY FEATURES:
 * - Timeline of postpartum milestones
 * - EPDS depression screening integration
 * - Wound/incision healing tracking
 * - Breastfeeding support
 * - Contraception planning
 * - Chronic condition follow-up (GDM, HTN)
 */

interface PostpartumVisit {
  id: string;
  date: string;
  type: 'phone_contact' | 'wound_check' | 'comprehensive' | 'lactation' | 'mental_health';
  daysPostpartum: number;
  provider: string;
  
  // Vitals
  vitals?: {
    bp?: { systolic: number; diastolic: number };
    pulse?: number;
    temperature?: number;
    weight?: number;
  };
  
  // Physical Exam
  exam?: {
    uterusInvolution?: 'Normal' | 'Subinvolution' | 'Tender';
    lochia?: 'Normal' | 'Heavy' | 'Foul-smelling' | 'None';
    incisionHealing?: 'Well-healed' | 'Healing' | 'Infected' | 'Dehiscence';
    breastExam?: 'Normal' | 'Engorgement' | 'Mastitis' | 'Abscess';
    perineum?: 'Intact' | 'Healing' | 'Infected' | 'Hematoma';
  };
  
  // Mental Health
  mentalHealth?: {
    epdsScore?: number;
    epdsRisk?: 'low' | 'moderate' | 'high' | 'critical';
    concerns?: string[];
    referral?: boolean;
  };
  
  // Breastfeeding
  breastfeeding?: {
    status: 'Exclusive' | 'Mixed' | 'Formula' | 'Not started';
    issues?: string[];
    lactationConsultNeeded?: boolean;
  };
  
  // Contraception
  contraception?: {
    discussed: boolean;
    method?: string;
    started?: boolean;
  };
  
  // Labs
  labs?: {
    hemoglobin?: number;
    ogtt?: { fasting?: number; twoHour?: number; result?: 'Normal' | 'Abnormal' };
    thyroid?: { tsh?: number; result?: 'Normal' | 'Abnormal' };
  };
  
  notes?: string;
  nextVisitDate?: string;
}

interface PostpartumCarePanelProps {
  patientId: string;
  episodeId?: string;
  deliveryDate: string;
  deliveryMode: 'SVD' | 'Cesarean' | 'Vacuum' | 'Forceps' | 'VBAC';
  hadGDM?: boolean;
  hadPreeclampsia?: boolean;
  onSave?: (visit: PostpartumVisit) => void;
}

export function PostpartumCarePanel({
  patientId,
  episodeId,
  deliveryDate,
  deliveryMode,
  hadGDM = false,
  hadPreeclampsia = false,
  onSave
}: PostpartumCarePanelProps) {
  const [showEPDS, setShowEPDS] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('timeline');
  const [showAddVisit, setShowAddVisit] = useState(false);

  // Calculate days postpartum
  const daysPostpartum = differenceInDays(new Date(), new Date(deliveryDate));
  const weeksPostpartum = differenceInWeeks(new Date(), new Date(deliveryDate));

  // Mock visits data - in production, fetch from API
  const [visits] = useState<PostpartumVisit[]>([
    {
      id: '1',
      date: '2025-03-21',
      type: 'phone_contact',
      daysPostpartum: 2,
      provider: 'Nurse Johnson',
      mentalHealth: { concerns: [] },
      breastfeeding: { status: 'Exclusive', issues: ['Initial latch difficulty'] },
      notes: 'Mother and baby doing well. Advised on breastfeeding positioning.'
    },
    {
      id: '2',
      date: '2025-04-02',
      type: 'wound_check',
      daysPostpartum: 14,
      provider: 'Dr. Smith',
      vitals: { bp: { systolic: 118, diastolic: 72 }, pulse: 78, weight: 74 },
      exam: {
        uterusInvolution: 'Normal',
        lochia: 'Normal',
        incisionHealing: 'Healing',
        perineum: 'Healing'
      },
      mentalHealth: { epdsScore: 6, epdsRisk: 'low' },
      breastfeeding: { status: 'Exclusive', issues: [] },
      notes: 'Good progress. Continue routine care.'
    }
  ]);

  // Visit milestones
  const milestones = [
    { 
      id: 'contact_3d', 
      label: 'Initial Contact', 
      targetDays: 3, 
      description: 'Phone/telehealth check-in',
      completed: visits.some(v => v.type === 'phone_contact' && v.daysPostpartum <= 3)
    },
    { 
      id: 'wound_2w', 
      label: 'Wound Check', 
      targetDays: 14, 
      description: deliveryMode === 'Cesarean' ? 'Incision assessment' : 'Perineal healing',
      completed: visits.some(v => v.type === 'wound_check')
    },
    { 
      id: 'comprehensive_6w', 
      label: '6-Week Visit', 
      targetDays: 42, 
      description: 'Full postpartum assessment',
      completed: visits.some(v => v.type === 'comprehensive' && v.daysPostpartum >= 35)
    },
    { 
      id: 'epds_6w', 
      label: 'Depression Screen', 
      targetDays: 42, 
      description: 'EPDS assessment',
      completed: visits.some(v => v.mentalHealth?.epdsScore !== undefined && v.daysPostpartum >= 35)
    }
  ];

  // Add conditional milestones
  if (hadGDM) {
    milestones.push({
      id: 'gdm_ogtt',
      label: 'GDM Follow-up OGTT',
      targetDays: 84,
      description: '75g OGTT screening',
      completed: visits.some(v => v.labs?.ogtt?.result !== undefined)
    });
  }

  if (hadPreeclampsia) {
    milestones.push({
      id: 'bp_followup',
      label: 'HTN Follow-up',
      targetDays: 84,
      description: 'Blood pressure assessment',
      completed: visits.some(v => v.vitals?.bp && v.daysPostpartum >= 42)
    });
  }

  // Get latest EPDS score
  const latestEPDS = visits
    .filter(v => v.mentalHealth?.epdsScore !== undefined)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  // Section toggle
  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Render section header
  const SectionHeader = ({ 
    id, 
    icon: Icon, 
    title, 
    badge 
  }: { 
    id: string; 
    icon: any; 
    title: string; 
    badge?: React.ReactNode;
  }) => (
    <button
      onClick={() => toggleSection(id)}
      className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
    >
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-gray-600" />
        <span className="text-sm font-semibold text-gray-800">{title}</span>
        {badge}
      </div>
      {expandedSection === id ? (
        <ChevronUp className="h-4 w-4 text-gray-500" />
      ) : (
        <ChevronDown className="h-4 w-4 text-gray-500" />
      )}
    </button>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="h-5 w-5" />
            <div>
              <h2 className="text-base font-bold">Postpartum Care</h2>
              <p className="text-[10px] text-purple-100">
                {weeksPostpartum} weeks {daysPostpartum % 7} days postpartum • 
                Delivered {format(new Date(deliveryDate), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddVisit(true)}
            className="px-3 py-1.5 text-xs bg-white text-purple-600 rounded hover:bg-purple-50 font-semibold flex items-center gap-1"
          >
            <Plus className="h-3 w-3" />
            Add Visit
          </button>
        </div>
      </div>

      {/* Quick Status Cards */}
      <div className="grid grid-cols-4 gap-2 p-3 bg-gray-50 border-b border-gray-200">
        <div className="bg-white rounded p-2 border border-gray-200 text-center">
          <div className="text-2xl font-bold text-purple-600">{daysPostpartum}</div>
          <div className="text-[9px] text-gray-500 uppercase">Days PP</div>
        </div>
        <div className="bg-white rounded p-2 border border-gray-200 text-center">
          <div className="text-2xl font-bold text-blue-600">{visits.length}</div>
          <div className="text-[9px] text-gray-500 uppercase">Visits</div>
        </div>
        <div className="bg-white rounded p-2 border border-gray-200 text-center">
          <div className={`text-2xl font-bold ${
            latestEPDS?.mentalHealth?.epdsRisk === 'low' ? 'text-green-600' :
            latestEPDS?.mentalHealth?.epdsRisk === 'moderate' ? 'text-yellow-600' :
            latestEPDS?.mentalHealth?.epdsRisk === 'high' ? 'text-red-600' :
            'text-gray-400'
          }`}>
            {latestEPDS?.mentalHealth?.epdsScore ?? '—'}
          </div>
          <div className="text-[9px] text-gray-500 uppercase">EPDS</div>
        </div>
        <div className="bg-white rounded p-2 border border-gray-200 text-center">
          <div className="text-lg font-bold text-gray-700">
            {milestones.filter(m => m.completed).length}/{milestones.length}
          </div>
          <div className="text-[9px] text-gray-500 uppercase">Milestones</div>
        </div>
      </div>

      {/* Alerts Section */}
      {(daysPostpartum < 3 && !milestones[0].completed) && (
        <div className="mx-3 mt-3 bg-amber-50 border border-amber-200 rounded p-2 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800">
            <strong>Action Required:</strong> Initial postpartum contact should occur within 3 days of delivery.
          </div>
        </div>
      )}

      {(latestEPDS?.mentalHealth?.epdsRisk === 'high' || latestEPDS?.mentalHealth?.epdsRisk === 'critical') && (
        <div className="mx-3 mt-3 bg-red-50 border border-red-200 rounded p-2 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-red-800">
            <strong>Mental Health Alert:</strong> Elevated EPDS score requires clinical follow-up.
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-3 space-y-3">
        {/* Timeline Section */}
        <div>
          <SectionHeader 
            id="timeline" 
            icon={Calendar} 
            title="Care Timeline" 
            badge={
              <span className="px-2 py-0.5 text-[10px] bg-purple-100 text-purple-700 rounded-full">
                {milestones.filter(m => m.completed).length}/{milestones.length} complete
              </span>
            }
          />
          {expandedSection === 'timeline' && (
            <div className="mt-3 space-y-2">
              {milestones.map((milestone, idx) => {
                const isOverdue = daysPostpartum > milestone.targetDays && !milestone.completed;
                const isCurrent = daysPostpartum <= milestone.targetDays && 
                  daysPostpartum > (milestones[idx - 1]?.targetDays || 0);
                
                return (
                  <div
                    key={milestone.id}
                    className={`flex items-center gap-3 p-2 rounded border ${
                      milestone.completed 
                        ? 'bg-green-50 border-green-200' 
                        : isOverdue
                          ? 'bg-red-50 border-red-200'
                          : isCurrent
                            ? 'bg-blue-50 border-blue-200'
                            : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      milestone.completed 
                        ? 'bg-green-500 text-white' 
                        : isOverdue
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-300 text-gray-600'
                    }`}>
                      {milestone.completed ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : isOverdue ? (
                        <AlertTriangle className="h-3 w-3" />
                      ) : (
                        <Clock className="h-3 w-3" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-800">{milestone.label}</span>
                        <span className="text-[10px] text-gray-500">
                          Target: Day {milestone.targetDays}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-600">{milestone.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Mental Health Section */}
        <div>
          <SectionHeader 
            id="mental_health" 
            icon={Brain} 
            title="Mental Health" 
            badge={
              latestEPDS?.mentalHealth?.epdsScore !== undefined && (
                <span className={`px-2 py-0.5 text-[10px] rounded-full ${
                  latestEPDS.mentalHealth.epdsRisk === 'low' ? 'bg-green-100 text-green-700' :
                  latestEPDS.mentalHealth.epdsRisk === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  EPDS: {latestEPDS.mentalHealth.epdsScore}
                </span>
              )
            }
          />
          {expandedSection === 'mental_health' && (
            <div className="mt-3 space-y-3">
              <div className="bg-purple-50 border border-purple-200 rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-semibold text-purple-800">Edinburgh Postnatal Depression Scale</div>
                  <button
                    onClick={() => setShowEPDS(true)}
                    className="px-2 py-1 text-[10px] bg-purple-600 text-white rounded hover:bg-purple-700 font-semibold"
                  >
                    + New Assessment
                  </button>
                </div>
                
                {latestEPDS?.mentalHealth?.epdsScore !== undefined ? (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white rounded p-2 border border-purple-200">
                      <div className="text-[9px] text-gray-500 uppercase">Score</div>
                      <div className={`text-xl font-bold ${
                        latestEPDS.mentalHealth.epdsRisk === 'low' ? 'text-green-600' :
                        latestEPDS.mentalHealth.epdsRisk === 'moderate' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {latestEPDS.mentalHealth.epdsScore}/30
                      </div>
                    </div>
                    <div className="bg-white rounded p-2 border border-purple-200">
                      <div className="text-[9px] text-gray-500 uppercase">Risk Level</div>
                      <div className="text-sm font-semibold capitalize">{latestEPDS.mentalHealth.epdsRisk}</div>
                    </div>
                    <div className="bg-white rounded p-2 border border-purple-200">
                      <div className="text-[9px] text-gray-500 uppercase">Date</div>
                      <div className="text-sm font-semibold">
                        {format(new Date(latestEPDS.date), 'MM/dd')}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-gray-600 italic">
                    No EPDS assessment completed. Screen at 2-week and 6-week visits.
                  </div>
                )}
              </div>

              <div className="text-[10px] text-gray-600 bg-gray-50 rounded p-2">
                <strong>Screening Schedule:</strong> EPDS should be administered at 2-week, 6-week, 
                and 12-week postpartum visits. Score ≥10 requires follow-up.
              </div>
            </div>
          )}
        </div>

        {/* Physical Recovery Section */}
        <div>
          <SectionHeader 
            id="physical" 
            icon={Activity} 
            title="Physical Recovery" 
          />
          {expandedSection === 'physical' && (
            <div className="mt-3 space-y-3">
              {/* Latest exam findings */}
              {visits.filter(v => v.exam).length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Uterus', value: visits[visits.length - 1]?.exam?.uterusInvolution },
                    { label: 'Lochia', value: visits[visits.length - 1]?.exam?.lochia },
                    { 
                      label: deliveryMode === 'Cesarean' ? 'Incision' : 'Perineum', 
                      value: deliveryMode === 'Cesarean' 
                        ? visits[visits.length - 1]?.exam?.incisionHealing 
                        : visits[visits.length - 1]?.exam?.perineum 
                    },
                    { label: 'Breasts', value: visits[visits.length - 1]?.exam?.breastExam }
                  ].map(item => (
                    <div key={item.label} className="bg-gray-50 rounded p-2 border border-gray-200">
                      <div className="text-[9px] text-gray-500 uppercase">{item.label}</div>
                      <div className={`text-xs font-semibold ${
                        item.value === 'Normal' || item.value === 'Well-healed' || item.value === 'Intact' 
                          ? 'text-green-600' 
                          : item.value === 'Healing' 
                            ? 'text-blue-600'
                            : item.value 
                              ? 'text-orange-600' 
                              : 'text-gray-400'
                      }`}>
                        {item.value || '—'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-gray-600 italic bg-gray-50 rounded p-3">
                  No physical exam recorded yet. Schedule wound check at 1-2 weeks.
                </div>
              )}

              {/* Recovery tips based on delivery mode */}
              <div className="bg-blue-50 border border-blue-200 rounded p-2 text-[10px] text-blue-800">
                <strong>{deliveryMode === 'Cesarean' ? 'C-Section' : 'Vaginal Delivery'} Recovery Tips:</strong>
                <ul className="mt-1 space-y-0.5 list-disc list-inside">
                  {deliveryMode === 'Cesarean' ? (
                    <>
                      <li>Keep incision clean and dry</li>
                      <li>Avoid lifting &gt;10 lbs for 6 weeks</li>
                      <li>Watch for signs of infection (redness, drainage, fever)</li>
                    </>
                  ) : (
                    <>
                      <li>Use ice packs and sitz baths for comfort</li>
                      <li>Perform pelvic floor exercises when comfortable</li>
                      <li>Report heavy bleeding or foul-smelling discharge</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Breastfeeding Section */}
        <div>
          <SectionHeader 
            id="breastfeeding" 
            icon={Baby} 
            title="Breastfeeding" 
          />
          {expandedSection === 'breastfeeding' && (
            <div className="mt-3 space-y-3">
              {visits.filter(v => v.breastfeeding).length > 0 ? (
                <div className="bg-pink-50 border border-pink-200 rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-pink-800">Current Status</span>
                    <span className={`px-2 py-0.5 text-[10px] rounded-full ${
                      visits[visits.length - 1]?.breastfeeding?.status === 'Exclusive' 
                        ? 'bg-green-100 text-green-700'
                        : visits[visits.length - 1]?.breastfeeding?.status === 'Mixed'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                    }`}>
                      {visits[visits.length - 1]?.breastfeeding?.status}
                    </span>
                  </div>
                  {(visits[visits.length - 1]?.breastfeeding?.issues?.length ?? 0) > 0 && (
                    <div className="text-[10px] text-gray-700">
                      <strong>Issues:</strong> {visits[visits.length - 1]?.breastfeeding?.issues?.join(', ')}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-gray-600 italic bg-gray-50 rounded p-3">
                  No breastfeeding assessment recorded.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Contraception Section */}
        <div>
          <SectionHeader 
            id="contraception" 
            icon={Pill} 
            title="Contraception Planning" 
          />
          {expandedSection === 'contraception' && (
            <div className="mt-3 space-y-3">
              <div className="bg-indigo-50 border border-indigo-200 rounded p-3">
                <div className="text-xs font-semibold text-indigo-800 mb-2">Birth Control Counseling</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white rounded p-2 border border-indigo-200">
                    <div className="text-[9px] text-gray-500 uppercase">Discussed</div>
                    <div className="text-xs font-semibold">
                      {visits.some(v => v.contraception?.discussed) ? (
                        <span className="text-green-600 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> Yes
                        </span>
                      ) : (
                        <span className="text-gray-500">Pending</span>
                      )}
                    </div>
                  </div>
                  <div className="bg-white rounded p-2 border border-indigo-200">
                    <div className="text-[9px] text-gray-500 uppercase">Method Chosen</div>
                    <div className="text-xs font-semibold">
                      {visits.find(v => v.contraception?.method)?.contraception?.method || '—'}
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-[10px] text-gray-600 bg-gray-50 rounded p-2">
                <strong>Note:</strong> Discuss contraception options before hospital discharge and at 
                each postpartum visit. Fertility can return as early as 3 weeks postpartum.
              </div>
            </div>
          )}
        </div>

        {/* Special Follow-ups (GDM, Preeclampsia) */}
        {(hadGDM || hadPreeclampsia) && (
          <div>
            <SectionHeader 
              id="special" 
              icon={AlertTriangle} 
              title="Special Follow-ups" 
              badge={
                <span className="px-2 py-0.5 text-[10px] bg-orange-100 text-orange-700 rounded-full">
                  {[hadGDM && 'GDM', hadPreeclampsia && 'HTN'].filter(Boolean).join(', ')}
                </span>
              }
            />
            {expandedSection === 'special' && (
              <div className="mt-3 space-y-3">
                {hadGDM && (
                  <div className="bg-orange-50 border border-orange-200 rounded p-3">
                    <div className="text-xs font-semibold text-orange-800 mb-2">
                      Gestational Diabetes Follow-up
                    </div>
                    <div className="text-[10px] text-gray-700 space-y-1">
                      <p>• 75g OGTT recommended at 6-12 weeks postpartum</p>
                      <p>• Lifetime risk of Type 2 DM is 50% higher</p>
                      <p>• Annual HbA1c screening recommended</p>
                    </div>
                    <div className="mt-2 pt-2 border-t border-orange-200">
                      <span className="text-[10px] font-semibold text-orange-800">OGTT Status: </span>
                      <span className="text-[10px]">
                        {visits.find(v => v.labs?.ogtt)?.labs?.ogtt?.result || 'Not yet completed'}
                      </span>
                    </div>
                  </div>
                )}

                {hadPreeclampsia && (
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <div className="text-xs font-semibold text-red-800 mb-2">
                      Hypertensive Disorder Follow-up
                    </div>
                    <div className="text-[10px] text-gray-700 space-y-1">
                      <p>• BP monitoring for 6 weeks postpartum</p>
                      <p>• Increased cardiovascular risk long-term</p>
                      <p>• Annual BP and metabolic screening</p>
                    </div>
                    <div className="mt-2 pt-2 border-t border-red-200">
                      <span className="text-[10px] font-semibold text-red-800">Latest BP: </span>
                      <span className="text-[10px]">
                        {visits.find(v => v.vitals?.bp)?.vitals?.bp 
                          ? `${visits[visits.length - 1]?.vitals?.bp?.systolic}/${visits[visits.length - 1]?.vitals?.bp?.diastolic}`
                          : 'Not recorded'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Visit History Footer */}
      <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-600">
            <strong>Visit History:</strong> {visits.length} recorded
          </div>
          <button className="text-xs text-purple-600 hover:text-purple-700 font-semibold">
            View All Visits →
          </button>
        </div>
      </div>

      {/* EPDS Dialog */}
      {showEPDS && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <EPDSCalculator
              patientId={patientId}
              episodeId={episodeId}
              onSave={(result) => {
                console.log('EPDS Result saved:', result);
                setShowEPDS(false);
              }}
              onClose={() => setShowEPDS(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
