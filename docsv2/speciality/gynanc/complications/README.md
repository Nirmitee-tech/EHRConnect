# Gynac Workflow – Complications & Special Scenarios

## 1. Purpose
Define data capture, workflow branching, and automation for complex obstetric cases:
- Multifetal gestations (twins, triplets) including Twin-to-Twin Transfusion Syndrome (TTTS)
- Pregnancy loss (early miscarriage, missed abortion, IUFD, neonatal demise)
- High-risk maternal conditions (preeclampsia, placenta accreta, cervical insufficiency)
- IVF-specific risks (OHSS)

## 2. Scenario Catalog
| Scenario | Trigger | Required Actions |
|----------|--------|------------------|
| Twin/Triplet Pregnancy | `fetalCount > 1` | Force chorionicity entry, schedule TTTS surveillance, route to MFM. |
| TTTS Suspected | Ultrasound doppler imbalance, fluid discordance | Stage using Quintero, schedule laser therapy/amnio, alert NICU + anesthesia team. |
| Miscarriage (early/late) | Loss event recorded | Close antenatal episode, open loss support, update statistics, offer genetic testing. |
| Missed Abortion | No cardiac activity | Book D&C or medical management, consent, rhogam ordering if Rh negative. |
| Stillbirth/IUFD | >20 weeks with fetal demise | Notify bereavement team, autopsy consent, stillbirth certificate workflow. |
| OHSS Risk | Estradiol > threshold, large follicle count | Pause cycle, consider freeze-all, admit if severe. |
| Placenta Accreta/Previas | Imaging flag | Pre-op checklist, blood bank prep, multidisciplinary planning meeting. |
| Cervical Insufficiency | Cervical length < 25mm | Cerclage order set, progesterone therapy, increased monitoring. |

## 3. Field-Level Data
- `complicationType` enum with severity grade.
- `complicationDetectedAt` (gestational age or cycle day).
- `actionsTaken[]` referencing orders/appointments.
- `outcomeStatus` (resolved, ongoing, resultedInLoss).
- `supportServicesOffered[]` (bereavement, lactation, social work).

## 4. Workflow Adjustments
- Case sheets add complication panel, allowing chronological entries.
- When complication logged:
  - Auto-generate tasks (e.g., TTTS stage III -> laser referral within 24h).
  - Update scheduling protocol (increase visit frequency).
  - Notify staffing board to adjust coverage (e.g., assign senior OB).
- For losses, postpartum workflows shift to loss pathway; baby creation suppressed.

## 5. Reporting & Alerts
- Dashboards highlight number of high-risk cases, TTTS interventions, miscarriage rates.
- Telemetry events fired when complication severity escalates.
- Quality export includes maternal morbidity indicators (severe HTN, PPH).

## 6. Documentation/Consent
- Attach consent templates for procedures (D&C, laser therapy, cerclage).
- Ensure audit trail for counseling, supportive services.

## 7. Dependencies
- Requires specialty episode state machine to transition between normal and complication states.
- Appointment protocol engine must react to complication flags.
- Integration with notification service for escalation pages.
