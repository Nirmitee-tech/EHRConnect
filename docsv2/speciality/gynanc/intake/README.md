# Gynac Workflow – Specialty Intake & Registration

## 1. Overview
Capture all data-points required for IVF, pregnancy (singleton/multifetal), and postpartum episodes during onboarding and pre-visit flows. Intake must dynamically adapt to:
- Fertility status (IVF cycle, donor gametes, surrogacy)
- Pregnancy parameters (gravida/para, gestational age, complications, fetal count)
- Loss/postpartum contexts (miscarriage, stillbirth, postpartum depression risk)

## 2. Intake Packages
| Package | Trigger | Included Sections |
|---------|---------|-------------------|
| IVF Baseline | IVF consult or cycle start | Reproductive history, ovarian reserve labs, semen analysis, previous ART cycles, consents (embryo disposition, donor usage) |
| Antenatal Initial | Any pregnancy visit without existing episode | Obstetric history (GTPAL), LMP/EDD, prior complications, vaccination status, genetic screening consents |
| High-Risk Addendum | Multifetal, IVF >35, history of TTTS, miscarriages | MFM referral info, cervical length history, anticoagulation therapies |
| Post-Loss | Pregnancy loss/miscarriage visit | Type of loss, gestational age at loss, products of conception status, emotional support resources consent |
| Postpartum | Postpartum visit | Delivery details, mode, complications, infant feeding plan, Edinburgh Postnatal Depression Scale (EPDS) |

## 3. Field-Level Requirements
- **Reproductive History**
  - `gravida`, `paraTerm`, `paraPreterm`, `abortions`, `living`.
  - `priorLossDetails[]` capturing gestational age, cause (include TTTS).
  - `IVFHistory` (cycles, protocols, responses, complications like OHSS).
- **Current Pregnancy**
  - `conceptionType` (spontaneous, IVF-own gametes, IVF-donor, surrogacy).
  - `fetalCount` (auto from ultrasound reports, editable). When >1, require `chorionicity`, `amnionicity`.
  - `EDDMethod` (LMP, IVF transfer date, ultrasound).
  - `riskFlags[]` e.g., placenta previa, short cervix, TTTS stage.
- **Labs & Screening**
  - Pre-populate mandatory labs (blood group, Rh, HIV, Hep B, Rubella, HbA1c) with status (ordered/completed).
  - Genetic screening choices (NIPT, CVS, amnio) with consent documentation.
- **IVF Specific**
  - `ovarianReserve` (AMH, AFC).
  - `partnerSemenAnalysis`.
  - `embryoBankingPlans`.
- **Postpartum**
  - `deliveryMode`, `date`, `perinealTearGrade`, `bloodLoss`.
  - `infantStatus[]` linking newborn IDs, NICU admit flag.
  - EPDS score auto-calculated; hide postpartum depression workflow unless postpartum episode active.

## 4. UX/Logic
- Intake builder uses conditional sections: IVF questions hidden unless `conceptionType` includes ART.
- Multifetal toggle reveals TTTS surveillance questions, twin-specific consents.
- Loss scenarios display bereavement resources and restrict prenatal education content.
- Support save/resume and data import from prior pregnancies.

## 5. System Changes
- Extend no-code form builder schemas to include new field types (GTPAL, chorionicity pickers).
- Map new fields to FHIR resources: Gravida/Para → Observation, Labs → ServiceRequest/Observation, consents → Consent resource.
- Ensure session payload includes `org_specialties` to auto-assign correct intake package from appointment context.
- Add validation rules (e.g., EDD required unless miscarriage).

## 6. Edge Cases
- **Twins/Triplets:** enforce entry of chorionicity, plan for TTTS screening schedule.
- **Miscarriage/Stillbirth:** allow partial intake completion; mark episode as loss; trigger counseling referral.
- **Surrogacy/Donor:** capture legal guardian info, intended parents contact, consent attachments.
- **Maternal Comorbidities:** diabetes, hypertension toggle additional education modules and referral tasks.
