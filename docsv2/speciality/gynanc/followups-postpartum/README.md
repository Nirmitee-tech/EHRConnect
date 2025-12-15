# Gynac Workflow – Follow-Ups & Postpartum Care

## 1. Coverage
- Immediate postpartum inpatient course
- Outpatient follow-ups (2-week wound check, 6-week comprehensive, lactation, contraception)
- Post-loss counseling visits
- Long-term surveillance for high-risk conditions (e.g., gestational diabetes postpartum OGTT)

## 2. Visit Templates
| Visit | Timing | Key Components |
|-------|--------|----------------|
| PP-Day 1/2 | Inpatient | Fundal height, lochia, pain, vitals, breastfeeding initiation |
| Wound Check | 1–2 weeks | Incision/tear assessment, infection signs, contraception counseling |
| 6-Week Comprehensive | 6 weeks | EPDS, pelvic exam, contraception plan, chronic condition follow-up |
| Lactation Consult | As needed | Feeding assessment, infant weight, supply issues |
| Loss Debrief | 2 weeks post-loss | Mental health screening, pathology results review |
| GDM Postpartum OGTT | 6–12 weeks | 75g OGTT scheduling, results, referral to endocrinology |

## 3. Field-Level Requirements
- `deliveryEpisodeId` to link postpartum visits to delivery.
- `healingStatus` (perineal, incision) with WHO wound stages.
- `EPDSScore` (auto-calc) + severity flag.
- `lactationIssues[]` enumerations (mastitis, low supply, latch).
- `contraceptionPlan` with method, start date, education provided.
- `postLossSupportOffered` boolean + referral details.
- `postpartumComplications[]` (PPH, infection, depression, cardiomyopathy).
- `OGTTResults` with fasting/2h values; auto-route abnormal to PCP.

## 4. Workflow Changes
- Scheduler auto-creates postpartum plan from delivery record (Story C2).
- Case sheet for postpartum sits on top of pregnancy episode; closing postpartum triggers final summary.
- Conditional content: postpartum forms hidden for loss cases; bereavement-specific follow-up instead.
- Baby linkage: postpartum visits show infant data (feeding, weight) when baby record active.

## 5. Integration & Automation
- EPDS results push to behavioral health queue if above threshold.
- OGTT orders sent via lab integration; reminders via patient portal.
- Wound photos stored when complication flagged; integrate with wound care workflow if required.

## 6. Edge Cases
- **C-section wound dehiscence:** auto-create wound-care episode.
- **Postpartum hemorrhage readmission:** tie readmission to delivery episode, trigger quality reports.
- **Loss scenarios:** postpartum timeline replaced with mental health + family planning counseling.
- **NICU infants:** postpartum visits must display NICU status, room-in guidance.
