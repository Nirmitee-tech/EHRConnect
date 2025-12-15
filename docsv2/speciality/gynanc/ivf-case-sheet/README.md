# Gynac Workflow – IVF & Fertility Case Sheet

## 1. Purpose
Provide a structured case sheet for fertility/IVF cycles that covers baseline evaluation through embryo transfer and cryostorage, while integrating with appointments, labs, and consents.

## 2. Case Sheet Sections
1. **Baseline Evaluation**
   - Day 2/3 ultrasound (antral follicle count per ovary).
   - Hormone labs (FSH, LH, Estradiol, AMH, TSH, Prolactin).
   - Semen analysis with morphology, motility, DNA fragmentation.
2. **Stimulation Protocol**
   - Protocol type (Antagonist, Long Lupron, Microdose flare, Mild).
   - Medications, dosage schedule, start/end dates.
   - Monitoring visits (US follicle measurements, estradiol levels).
3. **Trigger & Retrieval**
   - Trigger type/time (hCG, GnRH agonist, dual).
   - Retrieval OR details (anesthesia, complications, oocytes retrieved vs mature).
4. **Lab/Embryology**
   - Fertilization method (IVF/ICSI).
   - Embryo tracking table: day, cell number, grade, interventions (assisted hatching, genetic testing).
   - PGT results, mosaic classifications.
5. **Transfer/Cryopreservation**
   - Fresh transfer details (number embryos, stage, catheter type, complications).
   - Frozen embryo inventory (tank, straw, lot).
   - Embryo disposition consents.
6. **Luteal Support & Follow-Up**
   - Medication adherence, beta hCG dates/results.
   - Pregnancy outcome linkage (positive → create pregnancy episode; negative → counseling tasks).

## 3. Field-Level Additions
| Section | Field | Notes |
|---------|-------|-------|
| Baseline | `antralFollicleCountLeft/Right` | Numeric, auto-sum. |
| Protocol | `stimulationDay` | Derived; used to schedule visits. |
| Monitoring | `follicleMeasurements[]` | Each follicle diameter, supports >20 follicles. |
| Retrieval | `oocytesRetrieved`, `matureM2`, `complications[]` | Complications include bleeding, OHSS risk. |
| Embryology | `embryoId`, `day`, `grade`, `status`, `pgsResult` | Track individually; link to cryo inventory. |
| Transfer | `embryosTransferred`, `endometrialThickness`, `transferDifficulty` | Difficulty field guides future procedures. |
| Cryo | `storageLocation`, `consentVersion` | Hidden unless embryos frozen. |
| Follow-up | `betaHcg1/2`, `clinicalPregnancyConfirmed` | Auto-maps to pregnancy episode. |

## 4. Workflow Integration
- Appointment engine auto-generates monitoring visits from case sheet (C1).
- Encounter templates for ultrasound pull docket from case sheet to avoid re-entry.
- Case sheet status drives notifications (e.g., if estradiol > threshold, alert for OHSS).
- When pregnancy confirmed, automatically open antenatal episode and mark IVF origin for analytics.

## 5. System Changes
- Introduce `ivf_cycles` table referencing patient, partner, protocol, outcomes.
- Extend inventory service for embryo storage (tank ID, slot). Requires audit logging & temperature sensor integration hooks.
- Add file upload for lab consents (donor gametes, embryo disposition).
- Ensure specialties catalog marks IVF pack as prerequisite for embryo features.

## 6. Edge Cases
- **Dual stimulation / PGT cancellations:** allow multiple stimulation segments within one cycle.
- **Donor/Split cycles:** track donor ID, recipient linkage, ensure PHI boundaries respected.
- **Cycle cancellation:** capture reason (poor response, OHSS risk, fertilization failure) and auto-offer counseling/reschedule workflow.
- **FET (Frozen Embryo Transfer) cycles:** separate stimulation (natural vs medicated) with lining assessments.
