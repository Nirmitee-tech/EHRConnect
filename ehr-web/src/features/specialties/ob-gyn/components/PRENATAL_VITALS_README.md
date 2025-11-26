# Prenatal Vitals - Complete Documentation

## 🎯 What is Prenatal Vitals?

**Prenatal Vitals** = Maternal and fetal physiological measurements tracked across antenatal (ANC) visits to monitor the health of both mother and fetus.

This component provides:
- **Real-time clinical rule checking** - automatic alerts for abnormal values
- **Comprehensive data capture** - maternal vitals, fetal vitals, urine parameters, lab results
- **Trend analysis** - visualize changes over time
- **FHIR-compatible** - structured data as FHIR Observation resources
- **Decision support** - evidence-based recommendations for abnormal findings

---

## 📊 What Vitals Are Tracked?

### Maternal Vitals
| Vital | Description | Normal Range | Data Type |
|-------|-------------|--------------|-----------|
| **Weight** | Maternal weight | +0.5–2 kg per month (after 1st trimester) | Quantity (kg/lbs) |
| **Blood Pressure** | BP (Systolic/Diastolic) | ≤120/80 mmHg | Quantity ×2 |
| **Pulse** | Heart rate | 70–100 bpm | Quantity |
| **Temperature** | Body temp | 36.5–37.5°C (97.7–99.5°F) | Quantity |
| **Respiratory Rate** | Breaths per minute | 12–20 | Quantity |

### Urine Parameters
| Parameter | Purpose | Normal | Data Type |
|-----------|---------|--------|-----------|
| **Protein** | Detect proteinuria (preeclampsia) | Negative | CodeableConcept |
| **Sugar** | Gestational diabetes indicator | Negative | CodeableConcept |
| **Ketone** | Nutritional deficit flag | Negative | CodeableConcept |

### Physical Exam
| Measurement | Purpose | Normal | Data Type |
|-------------|---------|--------|-----------|
| **Edema** | Fluid retention | Absent | CodeableConcept |
| **Fundal Height** | Fetal growth tracking | ≈ GA weeks ± 2 cm | Quantity (cm) |
| **Abdominal Girth** | Growth tracking | - | Quantity (cm) |

### Fetal Vitals
| Vital | Purpose | Normal | Data Type |
|-------|---------|--------|-----------|
| **Presentation** | Fetal lie/position | Vertex (head down) | CodeableConcept |
| **Fetal Movement** | Kick count | Present | CodeableConcept |
| **Fetal Heart Rate** | FHR via Doppler | 110–160 bpm | Quantity |
| **Contractions** | Preterm labor detection | Absent | CodeableConcept |

### Cervical Exam (when applicable)
| Measurement | Purpose | Units |
|-------------|---------|-------|
| **Dilation** | Cervical opening | cm (0-10) |
| **Effacement** | Cervical thinning | % (0-100) |
| **Station** | Fetal descent | -3 to +3 |
| **Consistency** | Cervical texture | Firm/Medium/Soft |

### Lab Results (when ordered)
| Lab | Purpose | Normal | Data Type |
|-----|---------|--------|-----------|
| **Hemoglobin** | Anemia screening | > 11 g/dL | Quantity |
| **Glucose** | GDM screening | Fasting < 95, 1hr < 140 mg/dL | Quantity |

---

## 🚨 Built-in Clinical Rules & Alerts

The system automatically checks for abnormal values and generates alerts with recommendations:

### Critical Alerts (RED) 🔴

| Rule | Trigger | Alert Message | Recommendation |
|------|---------|---------------|----------------|
| **Severe Hypertension** | BP ≥160/110 | "Severe hypertension: {BP} mmHg" | Immediate evaluation required. Check for preeclampsia. |
| **Hypertension** | BP ≥140/90 | "Hypertension: {BP} mmHg" | Recheck BP, order urine protein, LFT/RFT if sustained. |
| **Preeclampsia Risk** | Proteinuria + BP ≥140/90 | "Proteinuria + Hypertension detected" | Evaluate for preeclampsia: 24-hr urine, LFT, RFT, platelets. |
| **Fetal Bradycardia** | FHR < 110 bpm | "Fetal bradycardia: {FHR} bpm" | Immediate evaluation - consider NST or ultrasound. |
| **Fetal Tachycardia** | FHR > 160 bpm | "Fetal tachycardia: {FHR} bpm" | Rule out maternal fever, fetal distress, or infection. |
| **Absent Fetal Movement** | FM = Absent/Decreased | "Absent/Decreased fetal movement" | Urgent: Order NST or biophysical profile. |

### Warning Alerts (ORANGE) ⚠️

| Rule | Trigger | Alert Message | Recommendation |
|------|---------|---------------|----------------|
| **Elevated BP** | BP 130-139/85-89 | "Elevated BP: {BP} mmHg" | Monitor closely, recheck in 15 minutes. |
| **Fundal Height Discrepancy** | \|FH - GA\| > 3 cm | "FH {value} cm ≠ GA {weeks} weeks" | Consider growth ultrasound (IUGR or polyhydramnios). |
| **Elevated Glucose** | Fasting ≥95 or 1hr OGTT ≥140 | "Elevated glucose: {value} mg/dL" | Evaluate for GDM - order 3-hour OGTT. |
| **Anemia** | Hb < 10 g/dL | "Anemia: Hb {value} g/dL" | Start iron supplementation, recheck in 4 weeks. |
| **Rapid Weight Gain** | >1 kg/week | "Rapid weight gain: {change} kg in {weeks} weeks" | Evaluate for fluid retention, preeclampsia. |

---

## 🎨 User Interface Overview

### Layout

```
┌───────────────────────────────────────────────────────────┐
│ HEADER: Prenatal Vitals                                  │
│ [Filter] [Record Vitals] [Download]                      │
├───────────────────────────────────────────────────────────┤
│ ALERT BANNER (if abnormal values detected)               │
│ 🚨 2 Critical Alerts • 1 Warning                         │
│ • Hypertension: 142/90 mmHg → Recheck BP, order labs    │
│ • Proteinuria + HTN → Evaluate for preeclampsia         │
├───────────────────────────────────────────────────────────┤
│ TREND CARDS                                               │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│ │ BP Trend│ │ Weight  │ │FHR Trend│ │FH Growth│        │
│ │  +14 ⚠️ │ │ +2.5 kg │ │  +8 ✓  │ │ +6 cm ✓ │        │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘        │
├───────────────────────────────────────────────────────────┤
│ VITALS TABLE                                              │
│ Date/GA│Weight│ BP  │Pulse│Urine│Edema│FH│FHR│FM│Labs │ │
│────────┼──────┼─────┼─────┼─────┼─────┼──┼───┼──┼─────│ │
│1/15│18w│ 72kg │118/72│ 78 │ NNN │None │18│142│P │12.1/92│
│2/12│22w│73.5kg│120/70│ 82 │ NNN │None │20│148│P │-/88 │
│3/05│25w│ 75kg │124/78│ 84 │🟡TNN│Trace│24│152│P │11.8/145│
│3/19│27w│76.5kg│🟠132/84│88│🟠T--│🟡+1 │26│150│P │11.6/156│
└───────────────────────────────────────────────────────────┘
```

### Color Coding in Table

- **RED background** 🔴 = Critical abnormal (BP ≥140/90, FHR <110 or >160, Absent FM)
- **ORANGE background** 🟠 = Moderate abnormal (BP 130-139/85-89, Proteinuria, Glucose ≥140)
- **YELLOW background** 🟡 = Mild abnormal (BP 120-129/80-84, Trace edema)
- **WHITE background** = Normal values

---

## 🎮 How to Use

### 1. Access the Vitals Screen
- Navigate to patient chart
- Click **"Prenatal Vitals"** in left sidebar (General section)
- View chronological list of all vital sign readings

### 2. Review Current Status
- **Check Alert Banner** (top) - shows active critical/warning alerts
- **Check Trend Cards** - quick view of key trends over last 3 visits
- **Scan Table** - color-coded highlights draw attention to problems

### 3. Record New Vitals
- Click **"Record Vitals"** button (top right, pink)
- Entry form opens with fields for all measurements
- Real-time validation as you type
- System automatically checks clinical rules on save

### 4. Interpret Alerts
Each alert shows:
- **Severity** (Critical/Warning)
- **Category** (e.g., Blood Pressure, Glucose)
- **Message** (e.g., "Hypertension: 142/90 mmHg")
- **Recommendation** (e.g., "Recheck BP, order urine protein")

### 5. Export Data
- Click **Download icon** (top right)
- Exports to CSV for analysis or referrals

---

## 📈 Trend Analysis

### Four Trend Cards (bottom of screen)

#### 1. BP Trend
- **Shows**: Systolic BP change over last 3 visits
- **Icon**: ✓ Green = Stable (<5 mmHg change), ⚠️ Red = Rising (≥5 mmHg)
- **Clinical Significance**: Rising trend suggests developing hypertension

#### 2. Weight Trend
- **Shows**: Total weight change over last 3 visits
- **Icon**: Always ↑ (weight typically increases)
- **Clinical Significance**: Rapid gain (>1 kg/week) may indicate fluid retention

#### 3. FHR Trend
- **Shows**: Fetal heart rate change over last 3 visits
- **Icon**: ✓ Green = Stable (<20 bpm change), ⚠️ Orange = Variable (≥20 bpm)
- **Clinical Significance**: Stability is reassuring, big swings warrant investigation

#### 4. FH Growth
- **Shows**: Fundal height increase over last 3 visits
- **Icon**: ✓ Green (growth is expected)
- **Clinical Significance**: Should increase ~1 cm/week, plateaus or drops = concern

---

## 🧬 FHIR Mapping

The component is designed for FHIR Observation resource compatibility:

### Example: Blood Pressure Observation

```json
{
  "resourceType": "Observation",
  "id": "bp-reading-1",
  "status": "final",
  "category": [{
    "coding": [{
      "system": "http://terminology.hl7.org/CodeSystem/observation-category",
      "code": "vital-signs"
    }]
  }],
  "code": {
    "coding": [{
      "system": "http://loinc.org",
      "code": "85354-9",
      "display": "Blood pressure panel"
    }]
  },
  "subject": { "reference": "Patient/123" },
  "encounter": { "reference": "Encounter/789" },
  "effectiveDateTime": "2025-03-19T10:30:00Z",
  "component": [
    {
      "code": {
        "coding": [{ "system": "http://loinc.org", "code": "8480-6" }],
        "text": "Systolic BP"
      },
      "valueQuantity": { "value": 132, "unit": "mmHg" }
    },
    {
      "code": {
        "coding": [{ "system": "http://loinc.org", "code": "8462-4" }],
        "text": "Diastolic BP"
      },
      "valueQuantity": { "value": 84, "unit": "mmHg" }
    }
  ]
}
```

### Resource Mapping Summary

| Vital Type | FHIR Resource | Value Type |
|------------|---------------|------------|
| Weight, Pulse, Temp, FH, FHR | Observation | valueQuantity |
| BP (Systolic/Diastolic) | Observation | component[x].valueQuantity |
| Urine P/S/K, Edema, FM, Presentation | Observation | valueCodeableConcept |
| Cervical Exam | Observation | component[x] array |
| Pregnancy Episode Link | EpisodeOfCare / Encounter | diagnosis.condition |

---

## 🎓 Demo Data Explanation

### The Story in 4 Visits:

**Visit 1 (18w 3d)** - Baseline ✅
- Everything normal: BP 118/72, FHR 142, no edema, no proteinuria
- Establishing healthy baseline values

**Visit 2 (22w 1d)** - Still Normal ✅
- Appropriate weight gain (+1.5 kg)
- BP 120/70 (slight increase but normal)
- All parameters within range

**Visit 3 (25w 0d)** - Early Warning Signs ⚠️
- **Trace proteinuria** (🟡 yellow highlight) - first sign of concern
- **Trace pedal edema** (🟡 yellow highlight)
- **Glucose 145** (🟠 orange) - above 140 screening threshold
- BP 124/78 - rising but still borderline
- **System flags**: GDM screening positive, watch for preeclampsia

**Visit 4 (27w 0d)** - Multiple Concerns 🚨
- **BP 132/84** (🟠 orange) - stage 1 hypertension
- **Proteinuria persists** (🟠 orange)
- **+1 bilateral edema** (🟠 orange) - worsening
- **Glucose 156** (🟠 orange) - confirmed GDM
- **Hb 11.6** - borderline anemia
- **Alert Banner Shows**: 2 critical alerts (preeclampsia risk, hypertension)
- **Recommendations**: Order 24-hr urine, LFT, RFT, close monitoring

### Clinical Teaching Points:

1. **Progressive Deterioration**: Watch how normal → trace → +1 edema progresses
2. **Multiple Risk Factors**: Proteinuria + HTN + GDM = high-risk pregnancy
3. **Early Detection**: System caught problems at Visit 3 before becoming critical
4. **Trend Analysis**: BP rising from 118 → 120 → 124 → 132 over 9 weeks
5. **Clinical Action**: This patient needs:
   - Weekly BP monitoring
   - GDM diet + glucose monitoring
   - Labs (24-hr urine protein, LFT, RFT, platelets)
   - NST (non-stress test) weekly
   - Possible referral to maternal-fetal medicine

---

## 💡 Key Features for Demo

### 1. Real-Time Clinical Intelligence
"As soon as you enter BP 142/90, the system immediately flags it and tells you exactly what to do: recheck BP, order urine protein, check LFT/RFT."

### 2. Comprehensive Data Capture
"Everything clinicians need in one view: maternal vitals, fetal vitals, urine dip, physical exam, labs. No flipping through multiple tabs."

### 3. Pattern Recognition
"The trend cards help you see patterns. Rising BP over 3 visits? System alerts you. That's how you catch preeclampsia early."

### 4. Evidence-Based Alerts
"Every alert is based on ACOG guidelines and clinical evidence. BP thresholds, glucose cutoffs, FHR ranges - all standard of care."

### 5. FHIR Compatible
"Data is structured as FHIR Observation resources. Interoperable with other systems, ready for HIE (Health Information Exchange)."

---

## 🔍 Understanding the Table

### Column Abbreviations:
- **Date/GA** = Visit date and gestational age
- **BP** = Blood Pressure (Systolic/Diastolic in mmHg)
- **Urine P/S/K** = Protein/Sugar/Ketone (N=Negative, T=Trace, +1/+2/+3/+4)
- **Edema** = Fluid retention (Absent, Trace, +1, +2, +3)
- **FH** = Fundal Height (cm)
- **FHR** = Fetal Heart Rate (bpm)
- **FM** = Fetal Movement (P=Present, D=Decreased, A=Absent)
- **Hb / Gluc** = Hemoglobin (g/dL) / Glucose (mg/dL)

### Color Coding Key:
- 🔴 RED = Critical (immediate action)
- 🟠 ORANGE = Moderate concern (close monitoring)
- 🟡 YELLOW = Mild abnormal (watch)
- ⚪ WHITE = Normal

---

## 🚀 Next Steps / Future Enhancements

### Planned Features:
- [ ] Full vitals entry form (currently placeholder)
- [ ] Visual charts (line graphs for BP, weight, FHR trends)
- [ ] Risk scoring algorithm (composite risk score)
- [ ] Protocol recommendations (ACOG guideline-based)
- [ ] NST integration (non-stress test results)
- [ ] Ultrasound biometrics display
- [ ] Multiple pregnancy support (twins/triplets - separate fetal vitals)
- [ ] Mobile-optimized touch interface
- [ ] Voice input for hands-free data entry
- [ ] Integration with wearable devices (BP cuffs, smart scales)

---

## 📞 Support & Resources

- **Technical Documentation**: See inline code comments in `PrenatalVitals.tsx`
- **FHIR Mapping**: See FHIR Observation examples above
- **Clinical Guidelines**: Based on ACOG Practice Bulletins
- **Related Components**:
  - `PrenatalFlowsheet.tsx` - Complete visit flowsheet
  - `PrenatalFacesheetTab.tsx` - Summary facesheet

---

**Last Updated**: November 10, 2025
**Version**: 1.0.0
**Maintainer**: EHRConnect Development Team
