# Gynac Workflow – Appointment Orchestration

## 1. Scope
Specialty-aware appointment flows for gynecology/obstetrics covering:
- Fertility/IVF consults and cycle procedures
- Routine antenatal visits (trimester checks, NST, anomaly scans)
- High-risk pregnancy slots (twins, TTTS surveillance, miscarriage follow-ups)
- Postpartum checks and lactation consults

## 2. Current vs Target
| Area | Current | Target Change |
|------|---------|---------------|
| Visit catalog | Generic visit types | Specialty taxonomy with IVF, prenatal, high-risk, postpartum codes |
| Routing | Provider-first | Rules considering provider specialty, location (OB clinic, IVF lab, L&D), required equipment |
| Recurrence | Manual | Protocol library (IVF monitoring series, weekly NST, postpartum check schedule) |
| Intake linkage | Separate step | Appointment carries required intake packet + consent bundle |

## 3. Field-Level Additions
| Field | Applies To | Description / Logic |
|-------|-----------|---------------------|
| `specialtyVisitType` | All | Enum: `ivf_consult`, `ivf_baseline`, `egg_retrieval`, `embryo_transfer`, `antenatal_trimester1`, `antenatal_trimester2`, `antenatal_trimester3`, `nuchal_translucency`, `level2_anatomy`, `nst`, `doppler`, `ttts_laser_eval`, `postpartum_6w`, `postpartum_depression_screen`, etc. Controls downstream templates. |
| `gestationalAgeAtVisit` | Pregnancy appointments | Auto-calculated from LMP/EDD, editable for IVF (uses embryo transfer date + luteal phase). |
| `multifetalFlag` | High-risk | Derived from intake; forces longer slot + MFM provider if `true`. |
| `resourceRequirements[]` | IVF procedures | Items such as lab room, anesthesia, embryologist, retrieval kit. |
| `bedNeeded` | L&D triage, TTTS | Boolean; when true scheduler requests maternity bed availability. |
| `linkedEpisodeId` | All | Ties appointment to OB/IVF episode for context. |
| `autoAttachForms[]` | All | Maps to specialty intake questionnaires, consents (IVF, VBAC, donor gametes). |

## 4. Workflow Logic
1. **Visit Type Selection First:** user selects specialty visit; UI filters providers + locations using org specialty catalog.
2. **Protocol Suggestions:** e.g., IVF stimulation automatically proposes baseline US (day 2), monitoring visits, trigger check, retrieval, transfer.
3. **Conflict Checks:** ensure egg retrieval not scheduled within 36h of last trigger for another patient using same OR; ensure NST slots align with fetal monitoring device availability.
4. **Conditional Fields:** show embryo transfer-specific questions only when visit type = `embryo_transfer`; hide L&D bed option for clinic visits.
5. **Recurring Rules:** postpartum visits prebuilt (2w wound check, 6w OB, 12w depression screen).

## 5. Required System Changes
- Extend existing scheduling service to accept `specialtyVisitType` and enforce routing rules.
- Update `visit_types` table as described in specialty blueprint with gynecology catalog.
- Modify patient portal booking to ask pregnancy status + IVF flag, then present relevant visit types.
- Hook into recurrence engine to support IVF monitoring bundles.
- API to fetch available slots grouped by specialty (reuse `provider/specialty-workload` scaffolding).

## 6. Edge Cases & Scenarios
- **Twins/Multiples:** auto-flag high-risk, require MFM provider, longer slot, ultrasound room with dual probes.
- **Twin-to-Twin Transfusion (TTTS):** schedule serial Dopplers + potential fetoscopic laser evaluation; requires OR block + neonatal team standby.
- **Miscarriage Management:** differentiate expectant vs D&C visit types; hide prenatal form, attach bereavement resources.
- **IVF Cycle Cancellation:** block scheduling beyond cancellation date; prompt for follow-up counseling slot.
- **Emergency Slotting:** allow override for L&D triage; log justification and notify charge nurse.

## 7. Dependencies
- Org specialty catalog (Epic A) so visit formatting respects enabled packs.
- Patient episode state machine to ensure correct linking.
- Inventory/resource service for IVF lab & L&D equipment availability.
