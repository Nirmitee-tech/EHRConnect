# Orthopedic Specialty Architecture - Alignment with Existing OB/GYN Pattern

**Purpose**: Map orthopedic specialty implementation to proven OB/GYN patterns for consistency, code reuse, and faster delivery.

---

## 1. File Structure Alignment

### OB/GYN Pattern (Existing)
```
ehr-api/src/
├── services/obgyn.service.js          # Business logic
├── routes/obgyn.js                    # API endpoints
└── migrations/
    └── add-obgyn-tables.js            # Schema

ehr-web/src/
├── services/obgyn.service.ts          # Frontend API client
└── [TBD: Components for OB/GYN UI]
```

### Orthopedic Pattern (Proposed)
```
ehr-api/src/
├── services/
│   ├── orthopedic.service.js          # Core orthopedic logic
│   ├── orthopedic-implant.service.js  # Implant tracking
│   ├── orthopedic-rehab.service.js    # PT/OT coordination
│   └── orthopedic-assessment.service.js # Scoring calculators
├── routes/orthopedic.js               # API endpoints
└── migrations/
    ├── create-orthopedic-core.js      # Core tables (2.1-2.7)
    ├── create-orthopedic-imaging.js   # Imaging/complications (2.8-2.11)
    └── create-orthopedic-advanced.js  # Advanced tracking (2.12-2.16)

ehr-web/src/
├── services/orthopedic.service.ts     # API client
├── features/specialties/orthopedics/
│   ├── pages/
│   │   ├── PreOperativeAssessment.tsx
│   │   ├── IntraOperativeDocumentation.tsx
│   │   ├── PostOperativeCare.tsx
│   │   ├── RehabilitationTracking.tsx
│   │   └── LongTermFollowUp.tsx
│   ├── components/
│   │   ├── AssessmentCalculators/
│   │   │   ├── WOMACCalculator.tsx
│   │   │   ├── HarrisHipCalculator.tsx
│   │   │   ├── OxfordScoreCalculator.tsx
│   │   │   ├── DASHCalculator.tsx
│   │   │   ├── ODICalculator.tsx
│   │   │   ├── ConstantMurleyCalculator.tsx
│   │   │   └── LysholmCalculator.tsx
│   │   ├── ImplantTracking/
│   │   │   ├── ImplantSelector.tsx
│   │   │   └── UDIScanner.tsx
│   │   ├── RehabilitationPlans/
│   │   │   ├── ProtocolSelector.tsx (TKA, THA, ACL, etc.)
│   │   │   ├── ROMTracking.tsx
│   │   │   └── ProgressChart.tsx
│   │   └── Forms/
│   │       ├── PreOpForm.tsx
│   │       ├── PostOpOrdersForm.tsx
│   │       ├── RehabPlanForm.tsx
│   │       └── FollowUpForm.tsx
│   ├── types/orthopedic.ts
│   ├── store/orthopedic-store.ts      # Zustand store
│   └── constants/procedures.ts         # Procedure definitions
```

---

## 2. Service Layer Alignment

### OB/GYN Service Pattern
```javascript
// obgyn.service.js
class ObGynService {
  constructor(pool) { this.pool = pool; }

  saveEPDSAssessment(data) { /* insert, return */ }
  getEPDSAssessments(patientId) { /* query, format */ }

  saveLaborDeliveryRecord(data) { /* insert, return */ }
  getLaborDeliveryRecords(patientId) { /* query, format */ }

  _formatEPDSRecord(row) { /* transform row */ }
  _formatLaborRecord(row) { /* transform row */ }
}
```

### Orthopedic Service Pattern (Proposed)
```javascript
// orthopedic.service.js
class OrthopedicService {
  constructor(pool) { this.pool = pool; }

  // Procedure management
  createSurgicalProcedure(data) { /* insert */ }
  getSurgicalProcedures(patientId) { /* query */ }

  // Pre-op assessment
  savePreOpAssessment(data) { /* insert */ }
  getPreOpAssessment(procedureId) { /* query */ }
  calculateCapriniScore(patientData) { /* scoring */ }

  // Formatting helpers
  _formatProcedure(row) { /* transform */ }
  _formatPreOp(row) { /* transform */ }
}

// orthopedic-assessment.service.js (New)
class OrthopedicAssessmentService {
  calculateWOMACScore(responses) { /* scoring formula */ }
  calculateHarrisHipScore(responses) { /* scoring */ }
  calculateOxfordScore(responses) { /* scoring */ }
  calculateDASHScore(responses) { /* scoring */ }
  calculateODIScore(responses) { /* scoring */ }
  calculateConstantMurleyScore(responses) { /* scoring */ }
  calculateLysholmScore(responses) { /* scoring */ }
  calculateCapriniScore(patientData) { /* DVT risk */ }

  interpretWOMACScore(score) { /* return interpretation */ }
  // Similar interpretation methods for all scores
}

// orthopedic-implant.service.js (New)
class OrthopedicImplantService {
  trackImplant(data) { /* insert with UDI */ }
  getImplantHistory(patientId) { /* query */ }
  scanUDI(udiString) { /* parse GS1 format */ }
  checkRecalls(manufacturerId, modelId) { /* check registry */ }
  prepareAJRRExport(organizationId) { /* export Level 1/2/3 */ }
}

// orthopedic-rehab.service.js (New)
class OrthopedicRehabService {
  createRehabPlan(data) { /* insert */ }
  updateWeightBearingStatus(procedureId, newStatus) { /* update */ }
  getProtocolByProcedure(procedureType) { /* return template */ }
  trackROM(patientId, jointData) { /* insert ROM */ }
  trackStrength(patientId, muscleData) { /* insert strength */ }
  calculateFunctionalGain(assessmentId, priorAssessmentId) { /* comparison */ }
}
```

---

## 3. Frontend Service Layer

### OB/GYN Service Pattern
```typescript
// services/obgyn.service.ts
class ObGynService {
  async saveEPDS(patientId, data) { /* POST */ }
  async getEPDS(patientId) { /* GET */ }
  async saveLaborDelivery(patientId, data) { /* POST */ }
  async getLaborDelivery(patientId) { /* GET */ }
}
```

### Orthopedic Service Pattern (Proposed)
```typescript
// services/orthopedic.service.ts
class OrthopedicService {
  async createProcedure(patientId, data) { /* POST */ }
  async getProcedures(patientId) { /* GET */ }
  async updateProcedure(procedureId, data) { /* PUT */ }

  // Pre-op
  async savePreOpAssessment(procedureId, data) { /* POST */ }
  async getPreOpAssessment(procedureId) { /* GET */ }

  // Post-op
  async savePostOpOrders(procedureId, data) { /* POST */ }
  async getPostOpOrders(procedureId) { /* GET */ }

  // Rehabilitation
  async createRehabPlan(patientId, data) { /* POST */ }
  async updateRehabProgress(rehabPlanId, sessionData) { /* PUT */ }
  async getRehabProgress(rehabPlanId) { /* GET */ }

  // Assessment scores
  async saveFunctionalAssessment(patientId, data) { /* POST */ }
  async getFunctionalAssessments(patientId) { /* GET */ }

  // Implants
  async trackImplant(procedureId, data) { /* POST */ }
  async getImplantHistory(patientId) { /* GET */ }

  // Follow-up
  async saveLongTermFollowUp(procedureId, data) { /* POST */ }
  async getLongTermFollowUps(patientId) { /* GET */ }
}
```

---

## 4. Component Structure

### Assessment Calculators (Modular Approach)

```typescript
// components/AssessmentCalculators/WOMACCalculator.tsx
export function WOMACCalculator() {
  const [painItems, setPainItems] = useState<number[]>([]);
  const [stiffnessItems, setStiffnessItems] = useState<number[]>([]);
  const [functionItems, setFunctionItems] = useState<number[]>([]);

  const calculateScore = () => {
    const painScore = painItems.reduce((a, b) => a + b, 0);
    const stiffnessScore = stiffnessItems.reduce((a, b) => a + b, 0);
    const functionScore = functionItems.reduce((a, b) => a + b, 0);
    const totalScore = painScore + stiffnessScore + functionScore;
    return { painScore, stiffnessScore, functionScore, totalScore };
  };

  const getInterpretation = (score: number) => {
    if (score <= 20) return 'Severe OA';
    if (score <= 40) return 'Moderate-severe OA';
    if (score <= 60) return 'Moderate OA';
    if (score <= 80) return 'Mild OA';
    return 'Minimal OA';
  };

  return (
    <div className="womac-calculator">
      {/* Pain items form */}
      {/* Stiffness items form */}
      {/* Function items form */}
      {/* Display results & interpretation */}
    </div>
  );
}
```

### Protocol Templates

```typescript
// constants/procedures.ts
export const PROCEDURE_PROTOCOLS = {
  TKA: {
    name: 'Total Knee Arthroplasty',
    preOpSteps: [...],
    postOpOrders: {
      weightBearing: 'TDWB',
      assistiveDevice: 'Crutches',
      initialROMLimit: { flexion: 90, extension: 0 },
      dvtProphylaxis: 'LMWH',
    },
    rehabPhases: [
      { phase: 1, weeks: '0-2', focusArea: 'ROM <90°', ptFrequency: '3x/week' },
      { phase: 2, weeks: '2-6', focusArea: 'ROM 90-110°', ptFrequency: '2x/week' },
      { phase: 3, weeks: '6-12', focusArea: 'Strength & function', ptFrequency: '1x/week' },
    ],
    romGoals: [
      { week: 2, flexion: 70, extension: 5 },
      { week: 6, flexion: 110, extension: 0 },
      { week: 12, flexion: 125, extension: 0 },
    ],
    returnToActivityTimeline: { drivingApproved: '6 weeks', golfApproved: '12 weeks', sports: '12-16 weeks' },
  },
  THA: {
    name: 'Total Hip Arthroplasty',
    preOpSteps: [...],
    postOpOrders: {
      weightBearing: 'TDWB',
      assistiveDevice: 'Crutches',
      hipPrecautions: true, // approach-dependent
      posteriorApproachPrecautions: {
        maxFlexion: 90,
        noCrossingMidline: true,
        noInternalRotation: true,
      },
    },
    rehabPhases: [...],
    romGoals: [
      { week: 2, flexion: 80, abduction: 30 },
      { week: 6, flexion: 100, abduction: 40 },
      { week: 12, flexion: 120, abduction: 45 },
    ],
    returnToActivityTimeline: { drivingApproved: '6 weeks', golfApproved: '8 weeks' },
  },
  ACL: {
    name: 'ACL Reconstruction',
    preOpSteps: [...],
    postOpOrders: {
      weightBearing: 'Immediate FWB',
      assistiveDevice: 'Crutches PRN',
      brace: { type: 'ACL-specific', durationWeeks: 6 },
    },
    rehabPhases: [
      { phase: 1, weeks: '0-6', focusArea: 'ROM 0-90°, swelling control', ptFrequency: '3x/week' },
      { phase: 2, weeks: '6-12', focusArea: 'Strength development', ptFrequency: '2x/week' },
      { phase: 3, weeks: '12-24', focusArea: 'Return to sport preparation', ptFrequency: '1x/week' },
    ],
    returnToActivityTimeline: { runningApproved: '4 months', cuttingApproved: '5 months', sportCleared: '6-9 months' },
  },
  // ... other procedures
};
```

### Forms Integration

```typescript
// components/Forms/PreOpForm.tsx
export function PreOpForm({ patientId, procedureId }: Props) {
  const orthopedicService = useOrthopedicService();
  const [formData, setFormData] = useState({
    chiefComplaint: '',
    painVAS: 0,
    medicalHistory: [],
    medications: [],
    allergies: [],
    imagingReviewed: [],
    capriniScore: 0,
    medicalClearance: 'Pending',
    ...
  });

  const calculateCaprini = () => {
    const score = orthopedicService.calculateCapriniScore(formData);
    setFormData(prev => ({ ...prev, capriniScore: score }));
  };

  const handleSave = async () => {
    await orthopedicService.savePreOpAssessment(procedureId, formData);
  };

  return (
    <form className="pre-op-form">
      {/* Chief complaint field */}
      {/* Pain VAS field */}
      {/* Medical history checkboxes */}
      {/* Imaging review section */}
      {/* Caprini score calculation button & display */}
      {/* Medical clearance status */}
      {/* Consent checkbox */}
      {/* Save button */}
    </form>
  );
}

// components/Forms/RehabPlanForm.tsx
export function RehabPlanForm({ patientId, procedureId }: Props) {
  const [procedure, setProcedure] = useState(null);
  const [selectedProtocol, setSelectedProtocol] = useState(null);

  useEffect(() => {
    // Load procedure details
    // Auto-select protocol based on procedure type
    const protocol = PROCEDURE_PROTOCOLS[procedure?.type];
    setSelectedProtocol(protocol);
  }, [procedure]);

  return (
    <form className="rehab-plan-form">
      {/* Procedure selector (read-only) */}
      {/* Protocol template (pre-populated) */}
      {/* ROM goals (from protocol) */}
      {/* PT/OT referral details */}
      {/* Weight-bearing progression visualization */}
      {/* Save button */}
    </form>
  );
}
```

---

## 5. Database Migration Alignment

### OB/GYN Migration Pattern
```javascript
// migrations/add-obgyn-tables.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create obgyn_epds_assessments
    // Create obgyn_labor_delivery_records
    // Create obgyn_ultrasound_records
    // Add indexes
  },
  down: async (queryInterface) => {
    // Drop all tables
  },
};
```

### Orthopedic Migration Pattern (Proposed - Split by Phase)
```javascript
// migrations/create-orthopedic-core.js (Phase 1)
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create orthopedic_surgical_procedures
    // Create orthopedic_preoperative_assessment
    // Create orthopedic_postoperative_orders
    // Create orthopedic_implant_tracking (AJRR Level 1)
    // Create orthopedic_rehabilitation_plan
    // Create orthopedic_pt_ot_session
    // Create orthopedic_functional_assessment
    // Add foreign keys & indexes
  },
};

// migrations/create-orthopedic-imaging.js (Phase 2)
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create orthopedic_imaging_documentation
    // Create orthopedic_complication_tracking
    // Create orthopedic_infection_tracking
    // Create orthopedic_dvt_prophylaxis
    // Add foreign keys to Phase 1 tables
  },
};

// migrations/create-orthopedic-advanced.js (Phase 3)
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create orthopedic_long_term_followup
    // Create orthopedic_range_of_motion
    // Create orthopedic_strength_assessment
    // Create orthopedic_neurovascular_assessment
    // Create orthopedic_revision_tracking
  },
};
```

---

## 6. Type Definitions

### Alignment with OB/GYN Types
```typescript
// types/obgyn.ts (Existing)
export interface EPDSAssessment {
  id: string;
  patientId: string;
  totalScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  // ...
}

// types/orthopedic.ts (Proposed)
export interface SurgicalProcedure {
  id: string;
  patientId: string;
  procedureType: 'TKA' | 'THA' | 'TSA' | 'ACL' | 'RotatorCuff' | 'Spine' | 'Other';
  cptCode: string;
  laterality: 'Left' | 'Right' | 'Bilateral';
  scheduledDate: Date;
  actualDate?: Date;
  surgeonId: string;
  // ...
}

export interface PreOperativeAssessment {
  id: string;
  procedureId: string;
  chiefComplaint: string;
  painVAS: number;
  capriniScore: number;
  medicalClearance: 'Cleared' | 'Conditional' | 'NotCleared';
  // ...
}

export interface ImplantTracking {
  id: string;
  procedureId: string;
  componentType: string;
  manufacturer: string;
  modelNumber: string;
  uniqueDeviceIdentifier: string; // UDI
  lotNumber: string;
  serialNumber: string;
  placementDate: Date;
  // ...
}

export interface RehabilitationPlan {
  id: string;
  procedureId: string;
  therapyType: 'PT' | 'OT' | 'Both';
  startDate: Date;
  goals: RehabGoal[];
  protocolTemplate: string; // Reference to PROCEDURE_PROTOCOLS
  // ...
}

export interface FunctionalAssessment {
  id: string;
  patientId: string;
  assessmentType: 'WOMAC' | 'HarrisHip' | 'Oxford' | 'DASH' | 'ODI' | 'ConstantMurley' | 'Lysholm';
  score: number;
  interpretation: string;
  // ...
}
```

---

## 7. State Management (Zustand Store)

### OB/GYN Store Pattern
```typescript
// stores/obgyn-store.ts
create(set => ({
  epds: null,
  laborDeliveryRecord: null,
  setEPDS: (epds) => set({ epds }),
  setLaborDelivery: (record) => set({ laborDeliveryRecord: record }),
}))
```

### Orthopedic Store Pattern (Proposed)
```typescript
// stores/orthopedic-store.ts
create(set => ({
  // Procedure management
  currentProcedure: null,
  procedures: [],

  // Phase-specific data
  preOpAssessment: null,
  postOpOrders: null,
  rehabPlan: null,
  assessmentScores: [],
  implants: [],
  followUpData: null,

  // UI state
  activePhase: 'pre-op' | 'intra-op' | 'post-op' | 'rehab' | 'follow-up',
  formDirty: false,

  // Actions
  setCurrentProcedure: (proc) => set({ currentProcedure: proc }),
  setPreOpAssessment: (data) => set({ preOpAssessment: data }),
  setRehabPlan: (plan) => set({ rehabPlan: plan }),
  calculateCaprini: (data) => {
    // Calculate & return score
  },
}))
```

---

## 8. API Route Alignment

### OB/GYN Routes Pattern
```javascript
// routes/obgyn.js
router.post('/epds', authMiddleware, async (req, res) => {
  const result = await obgynService.saveEPDSAssessment(req.body);
  res.json(result);
});

router.get('/epds/:patientId', authMiddleware, async (req, res) => {
  const result = await obgynService.getEPDSAssessments(req.params.patientId);
  res.json(result);
});
```

### Orthopedic Routes Pattern (Proposed)
```javascript
// routes/orthopedic.js
// Procedures
router.post('/procedures', authMiddleware, async (req, res) => {
  const result = await orthopedicService.createSurgicalProcedure(req.body);
  res.json(result);
});

router.get('/procedures/:patientId', authMiddleware, async (req, res) => {
  const result = await orthopedicService.getSurgicalProcedures(req.params.patientId);
  res.json(result);
});

// Pre-operative assessment
router.post('/pre-op', authMiddleware, async (req, res) => {
  const caprini = await orthopedicService.calculateCapriniScore(req.body);
  const result = await orthopedicService.savePreOpAssessment({ ...req.body, capriniScore: caprini });
  res.json(result);
});

router.get('/pre-op/:procedureId', authMiddleware, async (req, res) => {
  const result = await orthopedicService.getPreOpAssessment(req.params.procedureId);
  res.json(result);
});

// Rehabilitation
router.post('/rehab-plan', authMiddleware, async (req, res) => {
  const result = await orthopedicRehabService.createRehabPlan(req.body);
  res.json(result);
});

router.put('/rehab-plan/:rehabPlanId/session', authMiddleware, async (req, res) => {
  const result = await orthopedicRehabService.updateRehabProgress(req.params.rehabPlanId, req.body);
  res.json(result);
});

// Assessment scores
router.post('/assessment', authMiddleware, async (req, res) => {
  const result = await orthopedicService.saveFunctionalAssessment(req.body);
  res.json(result);
});

// Implants (AJRR)
router.post('/implant', authMiddleware, async (req, res) => {
  const result = await orthopedicImplantService.trackImplant(req.body);
  res.json(result);
});

router.get('/implant/:patientId', authMiddleware, async (req, res) => {
  const result = await orthopedicImplantService.getImplantHistory(req.params.patientId);
  res.json(result);
});

// Long-term follow-up
router.post('/follow-up', authMiddleware, async (req, res) => {
  const result = await orthopedicService.saveLongTermFollowUp(req.body);
  res.json(result);
});

router.get('/follow-up/:patientId', authMiddleware, async (req, res) => {
  const result = await orthopedicService.getLongTermFollowUps(req.params.patientId);
  res.json(result);
});
```

---

## 9. Code Reuse Opportunities

### Existing OB/GYN Components/Utilities to Leverage

1. **Patient Episode Tracking**: Already defined in `patient_specialty_episodes` - extend for orthopedic episodes
2. **Assessment Pattern**: EPDS scoring logic can be refactored to generic assessment calculator
3. **Image Tracking**: Ultrasound tracking in OB/GYN can be reused for X-ray/MRI/CT tracking
4. **Care Plan Structure**: OB/GYN care plans can be adapted for rehabilitation plans
5. **Goal Tracking**: Existing goal structures can be extended for functional goals
6. **Patient Education**: Prenatal education materials can inspire HEP video delivery

### New Orthopedic-Specific Services

1. **Implant Tracking Service**: No OB/GYN equivalent - new development
2. **Assessment Calculators**: OB/GYN only has EPDS - expand to 7 orthopedic scores
3. **AJRR Registry Interface**: No OB/GYN registry - new development
4. **Protocol Templates**: Procedure-specific protocols (TKA, THA, ACL) - new
5. **Rule Engine Expansion**: Extend with orthopedic-specific rules (Caprini, ROM tracking)

---

## 10. Implementation Timeline

| Phase | Focus | Duration | Alignment |
|-------|-------|----------|-----------|
| Phase 1 | Core tables, forms, basic calculators | Weeks 1-3 | OB/GYN pattern |
| Phase 2 | Imaging, complications, DVT tracking | Weeks 4-6 | Extend beyond OB/GYN |
| Phase 3 | Assessment details, neurovascular, revision | Weeks 7-9 | Orthopedic-specific |
| Phase 4 | AJRR export, recalls, PT integration | Weeks 10+ | Integration layer |

---

## Conclusion

Orthopedic specialty implementation leverages OB/GYN patterns for:
- Service layer architecture (create, get, format)
- API route structure
- Frontend service pattern
- Database migration approach
- Type definitions structure
- Component organization

While introducing orthopedic-specific features:
- 7 clinical scoring systems (WOMAC, Harris Hip, Oxford, DASH, ODI, Constant-Murley, Lysholm)
- Implant tracking with UDI compliance
- AJRR registry integration
- Procedure-specific protocols (TKA, THA, TSA, ACL, rotator cuff, spine)
- Advanced complication & adverse event tracking
- DVT prophylaxis rules (Caprini score)
- Long-term implant surveillance

**Estimated effort**: 25-30% increase over OB/GYN due to orthopedic-specific complexity and regulatory compliance (AJRR).

