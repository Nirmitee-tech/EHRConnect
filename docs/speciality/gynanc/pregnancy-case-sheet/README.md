# Gynac Workflow – Antenatal Case Sheet

## 1. Goals
Centralize all pregnancy data (singleton or multifetal) from confirmation through delivery, including IVF-conceived pregnancies, high-risk conditions (TTTS, preeclampsia), and loss scenarios.

## 2. Structure
1. **Obstetric Summary**
   - GTPAL, conception type, EDD (method), placenta location.
   - Multifetal flags, chorionicity/amnionicity.
2. **First Trimester**
   - Initial labs, dating ultrasound, nuchal translucency results.
   - Genetic screening status (NIPT, CVS), counseling notes.
3. **Second Trimester**
   - Anomaly scan, cervical length, glucose challenge, dopplers.
   - TTTS surveillance schedule (for monochorionic twins), Quintero staging entries.
4. **Third Trimester**
   - Growth scans, NST/BPP entries, Group B Strep status, birth plan.
5. **Visit Tracker**
   - Timeline list with vitals, weight gain, fetal heart rate, fetal movements.
6. **Complications & Actions**
   - Preeclampsia management, gestational diabetes logs, bleeding episodes, hospitalization records.
7. **Delivery Planning**
   - Mode preference, VBAC eligibility, anesthesia consult, neonatal team requirements.

## 3. Field Inventory
| Category | Field | Notes |
|----------|-------|-------|
| Summary | `pregnancyEpisodeId`, `isIVF`, `fetalCount`, `chorionicity`, `amnionicity` | Derived from intake/ultrasound. |
| Risk Flags | `tttsStage`, `placentaPrevia`, `cervicalInsufficiency`, `isoimmunization` | Toggle follow-up tasks. |
| Labs | `hb`, `platelets`, `bloodSugarFasting`, `ogttResults`, `liverEnzymes` | Accept value + unit + status. |
| Ultrasound | `scanType`, `date`, `findings`, `estimatedFetalWeight`, `percentile` | Support multiple fetuses per scan. |
| Twins | `twinId`, `presentation`, `dopplerS/D`, `fluidPocket` | Mandatory when fetalCount > 1. |
| TTTS | `quinteroStage`, `laserTherapyDate`, `recipientDonorAssignment` | Stages drive referral alerts. |
| Loss Events | `lossType` (early miscarriage, missed AB, IUFD), `gestationalAge`, `management`, `productsSentToLab` | Hidden unless loss recorded; ensures counseling tasks created. |
| Delivery | `indication`, `mode`, `anesthesia`, `bloodLoss`, `complications` | Links to postpartum case sheet + baby record. |

## 4. Workflow Changes
- Encounter templates auto-populate from case sheet; clinicians update vitals, labs inline.
- Case sheet enforces trimester-specific requirements (e.g., Glucose challenge by 28 weeks).
- Twins/triplets: UI duplicates fetal section per baby; color-coded.
- Loss conversion: if miscarriage recorded, close pregnancy episode, open postpartum/loss support episode.

## 5. Integrations
- Pull labs via integration gateway; map to case sheet fields.
- Device data (fetal monitor) feeds NST entries.
- Publish summarized data to reporting (prenatal adherence, TTTS outcome).

## 6. Edge Scenarios
- **IVF with donor egg:** mark `geneticMotherId`, handle consent.
- **TTTS progression:** auto-create tasks for laser referral, increase visit cadence.
- **Placenta accreta suspicion:** flag for surgical planning + blood bank alerts.
- **Preterm labor admissions:** log to case sheet, tie to bed management.
