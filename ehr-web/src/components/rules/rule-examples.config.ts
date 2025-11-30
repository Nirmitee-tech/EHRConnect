/**
 * Rule Templates & Examples
 * From Basic to Advanced Healthcare Scenarios
 */

export interface RuleExample {
  id: string;
  name: string;
  description: string;
  level: 'basic' | 'intermediate' | 'advanced' | 'expert';
  category: string;
  rule: {
    combinator: 'and' | 'or';
    rules: Array<{ field: string; operator: string; value: any }>;
  };
  actions: {
    type: string;
    config: any;
  };
  useCase: string;
  clinicalRationale?: string;
}

export const RULE_EXAMPLES: RuleExample[] = [
  // ==================== BASIC EXAMPLES ====================
  {
    id: 'basic-age-check',
    name: 'Senior Patient Flag',
    description: 'Flag patients over 65 years old',
    level: 'basic',
    category: 'Demographics',
    rule: {
      combinator: 'and',
      rules: [{ field: 'patient.age', operator: '>=', value: 65 }],
    },
    actions: {
      type: 'alert',
      config: {
        title: 'Senior Patient',
        message: 'Patient is 65 or older - consider geriatric assessments',
      },
    },
    useCase: 'Identify elderly patients for special care protocols',
  },
  {
    id: 'basic-high-bp',
    name: 'High Blood Pressure Alert',
    description: 'Alert when BP exceeds 140/90',
    level: 'basic',
    category: 'Vital Signs',
    rule: {
      combinator: 'or',
      rules: [
        { field: 'observation.bp_systolic', operator: '>', value: 140 },
        { field: 'observation.bp_diastolic', operator: '>', value: 90 },
      ],
    },
    actions: {
      type: 'alert',
      config: {
        title: 'Elevated Blood Pressure',
        severity: 'high',
      },
    },
    useCase: 'Real-time vital sign monitoring',
    clinicalRationale: 'Stage 2 hypertension threshold per AHA guidelines',
  },
  {
    id: 'basic-medication-check',
    name: 'Active Medication Check',
    description: 'Check if patient has active medications',
    level: 'basic',
    category: 'Medications',
    rule: {
      combinator: 'and',
      rules: [{ field: 'medication.status', operator: '=', value: 'active' }],
    },
    actions: {
      type: 'task_assignment',
      config: {
        description: 'Review patient medications',
        priority: 'routine',
      },
    },
    useCase: 'Medication reconciliation workflow',
  },

  // ==================== INTERMEDIATE EXAMPLES ====================
  {
    id: 'intermediate-diabetes-screening',
    name: 'Diabetes Screening Required',
    description: 'Screen patients at risk for diabetes',
    level: 'intermediate',
    category: 'Preventive Care',
    rule: {
      combinator: 'and',
      rules: [
        { field: 'patient.age', operator: '>=', value: 45 },
        { field: 'observation.bmi', operator: '>=', value: 25 },
        { field: 'var.days_since_last_visit', operator: '>', value: 365 },
      ],
    },
    actions: {
      type: 'task_assignment',
      config: {
        description: 'Order HbA1c screening for diabetes risk',
        priority: 'routine',
        due_in_hours: 720, // 30 days
      },
    },
    useCase: 'Population health management - diabetes prevention',
    clinicalRationale: 'USPSTF recommends screening adults 35-70 with overweight/obesity',
  },
  {
    id: 'intermediate-hypertension-control',
    name: 'Uncontrolled Hypertension Follow-up',
    description: 'Schedule follow-up for uncontrolled hypertension',
    level: 'intermediate',
    category: 'Chronic Disease Management',
    rule: {
      combinator: 'and',
      rules: [
        { field: 'condition.code', operator: '=', value: 'I10' }, // Essential hypertension
        { field: 'var.bp_systolic_avg_24h', operator: '>', value: 140 },
        { field: 'medication.status', operator: '=', value: 'active' },
      ],
    },
    actions: {
      type: 'task_assignment',
      config: {
        description: 'Review BP control and adjust medications',
        priority: 'urgent',
        assignTo: 'primary_care_provider',
      },
    },
    useCase: 'Chronic disease management - HTN control',
    clinicalRationale: 'Patients on treatment with BP >140 systolic need medication adjustment',
  },
  {
    id: 'intermediate-fall-risk',
    name: 'Fall Risk Assessment',
    description: 'Assess fall risk in elderly patients',
    level: 'intermediate',
    category: 'Patient Safety',
    rule: {
      combinator: 'and',
      rules: [
        { field: 'patient.age', operator: '>=', value: 65 },
        { field: 'var.fall_risk_score', operator: '>=', value: 45 },
        { field: 'encounter.type', operator: '=', value: 'AMB' },
      ],
    },
    actions: {
      type: 'alert',
      config: {
        title: 'High Fall Risk',
        message: 'Consider PT referral and home safety assessment',
        severity: 'high',
      },
    },
    useCase: 'Geriatric safety protocols',
  },

  // ==================== ADVANCED EXAMPLES ====================
  {
    id: 'advanced-ckd-monitoring',
    name: 'Chronic Kidney Disease Monitoring',
    description: 'Monitor CKD patients for deterioration',
    level: 'advanced',
    category: 'Complex Chronic Disease',
    rule: {
      combinator: 'and',
      rules: [
        { field: 'condition.code', operator: 'contains', value: 'N18' }, // CKD codes
        { field: 'observation.lab_egfr', operator: '<', value: 60 },
        { field: 'observation.lab_creatinine', operator: '>', value: 1.5 },
        { field: 'medication.code', operator: '!=', value: 'ace_inhibitor' },
      ],
    },
    actions: {
      type: 'cds_hook',
      config: {
        hookType: 'order-select',
        suggestion: 'Consider ACE inhibitor/ARB for renal protection',
        evidence: {
          strength: 'STRONG',
          quality: 'HIGH',
          source: 'KDIGO 2024 Guidelines',
        },
      },
    },
    useCase: 'Clinical decision support for CKD management',
    clinicalRationale: 'ACE-I/ARB recommended for CKD patients with proteinuria',
  },
  {
    id: 'advanced-sepsis-screening',
    name: 'Early Sepsis Detection',
    description: 'Detect potential sepsis using qSOFA criteria',
    level: 'advanced',
    category: 'Critical Care',
    rule: {
      combinator: 'and',
      rules: [
        { field: 'observation.respiratory_rate', operator: '>=', value: 22 },
        { field: 'observation.bp_systolic', operator: '<=', value: 100 },
        { field: 'observation.temperature', operator: '>=', value: 100.4 },
        { field: 'encounter.class', operator: '=', value: 'EMER' },
      ],
    },
    actions: {
      type: 'alert',
      config: {
        title: 'POSSIBLE SEPSIS - Urgent Assessment Required',
        message: 'qSOFA ≥2: Initiate sepsis protocol immediately',
        severity: 'critical',
        page: ['attending_physician', 'rapid_response_team'],
      },
    },
    useCase: 'Early warning system for sepsis',
    clinicalRationale: 'qSOFA ≥2 indicates high risk of mortality',
  },
  {
    id: 'advanced-polypharmacy',
    name: 'Polypharmacy Risk Management',
    description: 'Flag elderly patients with polypharmacy',
    level: 'advanced',
    category: 'Medication Safety',
    rule: {
      combinator: 'and',
      rules: [
        { field: 'patient.age', operator: '>=', value: 65 },
        { field: 'var.active_medication_count', operator: '>=', value: 10 },
        { field: 'observation.lab_creatinine', operator: '>', value: 1.2 },
      ],
    },
    actions: {
      type: 'workflow_automation',
      config: {
        workflow: 'comprehensive_medication_review',
        assignTo: 'clinical_pharmacist',
        priority: 'urgent',
        includeData: ['medications', 'labs', 'conditions'],
      },
    },
    useCase: 'Geriatric medication management',
    clinicalRationale: 'Polypharmacy in elderly with renal impairment increases ADR risk',
  },

  // ==================== EXPERT EXAMPLES ====================
  {
    id: 'expert-heart-failure-optimization',
    name: 'Heart Failure GDMT Optimization',
    description: 'Guideline-directed medical therapy optimization for HFrEF',
    level: 'expert',
    category: 'Complex Clinical Pathways',
    rule: {
      combinator: 'and',
      rules: [
        { field: 'condition.code', operator: 'contains', value: 'I50' }, // Heart failure
        { field: 'observation.ejection_fraction', operator: '<', value: 40 }, // HFrEF
        { field: 'medication.class_ace_arb', operator: '=', value: false },
        { field: 'medication.class_beta_blocker', operator: '=', value: false },
        { field: 'observation.bp_systolic', operator: '>=', value: 100 },
        { field: 'observation.heart_rate', operator: '>=', value: 70 },
      ],
    },
    actions: {
      type: 'cds_hook',
      config: {
        hookType: 'order-sign',
        suggestions: [
          {
            action: 'add_medication',
            medication: 'Sacubitril/Valsartan',
            rationale: 'Reduces mortality in HFrEF (PARADIGM-HF)',
          },
          {
            action: 'add_medication',
            medication: 'Carvedilol or Metoprolol',
            rationale: 'Evidence-based beta blocker for HFrEF',
          },
          {
            action: 'order_lab',
            lab: 'BMP, renal function',
            rationale: 'Baseline before ARNI initiation',
          },
        ],
        evidence: {
          guidelines: ['ACC/AHA 2022', 'ESC 2021'],
          trials: ['PARADIGM-HF', 'EMPHASIS-HF'],
        },
      },
    },
    useCase: 'Precision cardiology - HF optimization',
    clinicalRationale: 'Four-pillar GDMT for HFrEF reduces hospitalizations and mortality',
  },
  {
    id: 'expert-stroke-prevention-afib',
    name: 'Stroke Prevention in Atrial Fibrillation',
    description: 'CHA2DS2-VASc-based anticoagulation decision support',
    level: 'expert',
    category: 'Complex Clinical Pathways',
    rule: {
      combinator: 'and',
      rules: [
        { field: 'condition.code', operator: '=', value: 'I48' }, // Atrial fibrillation
        { field: 'var.cha2ds2_vasc_score', operator: '>=', value: 2 },
        { field: 'medication.class_anticoagulant', operator: '=', value: false },
        { field: 'condition.code', operator: '!=', value: 'active_bleeding' },
        { field: 'observation.platelet_count', operator: '>', value: 100000 },
      ],
    },
    actions: {
      type: 'cds_hook',
      config: {
        hookType: 'patient-view',
        card: {
          summary: 'Anticoagulation Recommended for Stroke Prevention',
          indicator: 'warning',
          suggestions: [
            {
              label: 'Apixaban 5mg BID',
              action: 'create',
              resource: 'MedicationRequest',
            },
            {
              label: 'Rivaroxaban 20mg daily',
              action: 'create',
              resource: 'MedicationRequest',
            },
          ],
          links: [
            {
              label: 'CHA2DS2-VASc Calculator',
              url: '/tools/cha2ds2-vasc',
            },
          ],
        },
      },
    },
    useCase: 'Stroke prevention - AFib management',
    clinicalRationale: 'CHA2DS2-VASc ≥2: Strong recommendation for anticoagulation (AHA/ACC)',
  },
  {
    id: 'expert-cancer-survivorship',
    name: 'Cancer Survivorship Care Plan',
    description: 'Trigger survivorship care plan at treatment completion',
    level: 'expert',
    category: 'Oncology Care Coordination',
    rule: {
      combinator: 'and',
      rules: [
        { field: 'condition.category', operator: '=', value: 'oncology' },
        { field: 'procedure.code', operator: 'contains', value: 'chemo' },
        { field: 'procedure.status', operator: '=', value: 'completed' },
        { field: 'var.days_since_treatment_end', operator: '=', value: 30 },
        { field: 'document.survivorship_plan', operator: '=', value: false },
      ],
    },
    actions: {
      type: 'workflow_automation',
      config: {
        workflow: 'create_survivorship_care_plan',
        tasks: [
          {
            task: 'Generate survivorship plan document',
            assignTo: 'oncology_nurse',
          },
          {
            task: 'Schedule PCP follow-up',
            assignTo: 'care_coordinator',
          },
          {
            task: 'Order surveillance imaging',
            assignTo: 'attending_oncologist',
          },
          {
            task: 'Refer to survivorship clinic',
            assignTo: 'social_worker',
          },
        ],
        template: 'ASCO_survivorship_template',
      },
    },
    useCase: 'Comprehensive cancer survivorship care',
    clinicalRationale: 'ASCO/ACS guidelines recommend survivorship care plans for all cancer survivors',
  },
  {
    id: 'expert-maternal-early-warning',
    name: 'Maternal Early Warning System',
    description: 'Detect maternal deterioration using MEWS criteria',
    level: 'expert',
    category: 'Obstetric Critical Care',
    rule: {
      combinator: 'or',
      rules: [
        { field: 'observation.bp_systolic', operator: '>', value: 160 },
        { field: 'observation.bp_systolic', operator: '<', value: 90 },
        { field: 'observation.heart_rate', operator: '>', value: 120 },
        { field: 'observation.respiratory_rate', operator: '>', value: 30 },
        { field: 'observation.oxygen_saturation', operator: '<', value: 95 },
        { field: 'observation.temperature', operator: '>', value: 100.4 },
      ],
    },
    actions: {
      type: 'alert',
      config: {
        title: 'MATERNAL EARLY WARNING - Urgent Evaluation Required',
        message: 'MEWS criteria met - Activate rapid response team',
        severity: 'critical',
        escalation: {
          immediate: ['ob_attending', 'rapid_response_team'],
          notify: ['charge_nurse', 'house_supervisor'],
          document: true,
        },
      },
    },
    useCase: 'Obstetric patient safety system',
    clinicalRationale: 'Early identification of maternal deterioration reduces morbidity/mortality',
  },
  {
    id: 'expert-pediatric-sepsis-bundle',
    name: 'Pediatric Sepsis Bundle Compliance',
    description: 'Track and ensure pediatric sepsis bundle completion',
    level: 'expert',
    category: 'Pediatric Emergency Medicine',
    rule: {
      combinator: 'and',
      rules: [
        { field: 'patient.age', operator: '<', value: 18 },
        { field: 'condition.code', operator: 'contains', value: 'sepsis' },
        { field: 'encounter.class', operator: '=', value: 'EMER' },
        { field: 'var.time_since_recognition_min', operator: '>=', value: 60 },
        { field: 'var.bundle_completed', operator: '=', value: false },
      ],
    },
    actions: {
      type: 'workflow_automation',
      config: {
        workflow: 'pediatric_sepsis_bundle_checklist',
        checklist: [
          { item: 'Blood culture obtained', time_limit: 30 },
          { item: 'Broad-spectrum antibiotics given', time_limit: 60 },
          { item: 'Fluid bolus 20mL/kg initiated', time_limit: 30 },
          { item: 'Lactate measured', time_limit: 60 },
          { item: 'PICU notified', time_limit: 60 },
        ],
        escalate_if_incomplete: true,
        track_metrics: true,
      },
    },
    useCase: 'Sepsis quality metrics and bundle compliance',
    clinicalRationale: 'Surviving Sepsis Campaign pediatric guidelines - early bundle completion improves outcomes',
  },
];

/**
 * Get examples by level
 */
export function getExamplesByLevel(level: 'basic' | 'intermediate' | 'advanced' | 'expert') {
  return RULE_EXAMPLES.filter((ex) => ex.level === level);
}

/**
 * Get example by ID
 */
export function getExampleById(id: string) {
  return RULE_EXAMPLES.find((ex) => ex.id === id);
}

/**
 * Get all categories
 */
export function getExampleCategories() {
  const categories = new Set(RULE_EXAMPLES.map((ex) => ex.category));
  return Array.from(categories);
}
