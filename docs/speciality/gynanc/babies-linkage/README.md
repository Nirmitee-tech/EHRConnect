# Gynac Workflow – Baby & Episode Linkage

## 1. Objectives
Ensure every delivery (singleton or multiples) automatically creates and links neonatal records, NICU admissions, and ongoing child health follow-ups to the maternal episode.

## 2. Lifecycle
1. **Delivery Event**
   - Maternal case sheet records delivery details.
   - System generates newborn patient record(s) using maternal demographics + delivery data.
2. **Baby Profile Creation**
   - Fields: birth weight, length, head circumference, sex, Apgar (1/5/10 min), resuscitation, cord blood results.
   - `maternalEpisodeId` stored for cross-reference.
3. **Multiple Birth Handling**
   - Each baby assigned `birthOrder` (A/B/C), `twinType` (monochorionic/diamniotic, etc.).
   - For TTTS cases, mark recipient vs donor twin, track laser therapy outcomes.
4. **NICU Admission**
   - If `nicuRequired=true`, auto-open NICU admission record referencing bed management tables.
   - Capture ventilator, surfactant, IVH screening schedule.
5. **Post-Discharge Linking**
   - Baby record flagged to appear in maternal portal until caregiver reassigns.
   - Immunization schedule inherited from pediatric module.

## 3. Required Fields/Structures
| Entity | Field | Notes |
|--------|-------|-------|
| Baby | `maternalPatientId`, `deliveryEncounterId`, `gestationalAgeAtBirth`, `birthWeight`, `apgarScores[]`, `nicuAdmissionId` | Relationship maintained for reporting. |
| NICU Admission | `wardId`, `bedId`, `ageRestriction=neonatal`, `specialty='nicu'`, `admissionReason`, `tttsStatus` | Reuses bed management schema. |
| Maternal Episode | `linkedBabyIds[]`, `perinatalOutcome` | Auto-populated. |

## 4. Workflow Changes
- Delivery documentation cannot be completed until newborn data captured (or reason provided for loss).
- Baby record inherits allergies (maternal), blood type (if known).
- Portal messaging allows mother to send updates referencing baby ID.
- Postpartum visits show baby vitals summary; NICU board pulls maternal contact info.

## 5. Special Scenarios
- **Stillbirth / Miscarriage:** allow documentation without baby record; mark perinatal outcome; triggers bereavement workflow.
- **Adoption/Surrogacy:** baby linked to intended parents; maternal record still stores delivery outcome but hides baby data from surrogate portal.
- **TTTS:** track both babies with TTTS stage pre/post intervention, share analytics on outcomes.
- **Triplets/Quads:** ensure UI scales for >2 babies; use table layout with scroll.

## 6. Integration Needs
- HL7/FHIR event emitted when baby created so pediatric EHR components can subscribe.
- Interface with immunization registries once baby assigned pediatric provider.
