# Prenatal Flowsheet - Complete Documentation

## 🎯 Quick Start

### Accessing the Flowsheet
1. Navigate to a patient record
2. Click **"Prenatal Flowsheet"** in the left sidebar (under General section)
3. The flowsheet loads with all prenatal visits

### First-Time Demo
1. Click the **"Demo Guide"** button (purple, top-right)
2. Read the interactive guide to understand:
   - What each color means
   - How to interpret the data
   - What actions you can take
   - The demo scenario being shown

---

## 📊 Understanding the Flowsheet

### Layout Overview

```
┌─────────────────────────────────────────────────────────┐
│ HEADER: Patient Info (G/P, Current GA, EDD)            │
├─────────────────────────────────────────────────────────┤
│ HIGH RISK ALERT (if applicable)                         │
├─────────────────────────────────────────────────────────┤
│ TOOLBAR: [Demo Guide] [Columns] [Filter] [Highlight]   │
│          [Add Visit] [Print] [Download]                 │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐│
│ │  # │ Date │ GA │ Wt │ FH │ FPR │ FHR │ BP │ ...  ││
│ │────┼──────┼────┼────┼────┼─────┼─────┼────┼──────││
│ │  1 │ 1/15 │18w3│158 │ 18 │Vtx │ 142 │118/72│ ... ││
│ │  2 │ 2/12 │22w1│162 │ 20 │Vtx │ 148 │120/70│ ... ││
│ │  3 │ 3/05 │25w0│165 │ 24 │Vtx │ 152 │124/78│🟠  ││
│ │  4 │ 3/19 │27w0│168 │ 26 │Vtx │ 150 │132/84│🟠🟠││
│ └─────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────┤
│ TRENDS: [Weight] [BP] [FHR] [Total Visits]             │
└─────────────────────────────────────────────────────────┘
```

### Column Abbreviations

| Column | Full Name | Description | Normal Range |
|--------|-----------|-------------|--------------|
| GA | Gestational Age | Weeks + days (e.g., 28w 3d) | - |
| Wt | Weight | Maternal weight (lbs) | 1-2 lbs/week gain |
| FH | Fundal Height | Uterus measurement (cm) | ± 2 cm of GA weeks |
| FPR | Fetal Presentation | Baby's position | Vertex (head down) |
| FHR | Fetal Heart Rate | Baby's heartbeat (bpm) | 110-160 bpm |
| FM | Fetal Movement | Baby moving? | Present/Reduced/Absent |
| BP | Blood Pressure | Systolic/Diastolic | <120/80 |
| Urine | Urinalysis | Protein (P) & Glucose (G) | Both negative |
| Edema | Swelling | Fluid retention | None to trace |

### Color Coding System

The system automatically applies clinical intelligence to highlight abnormal values:

#### 🔴 RED = Severe (Immediate Attention)
- **Blood Pressure**: ≥140/90 mmHg (Stage 2 hypertension, preeclampsia risk)
- **Fetal Heart Rate**: <110 or >160 bpm (bradycardia/tachycardia)
- **Clinical Significance**: These findings require immediate clinical assessment

#### 🟠 ORANGE = Moderate (Close Monitoring)
- **Blood Pressure**: 130-139/85-89 mmHg (Stage 1 hypertension)
- **Proteinuria**: Any protein in urine (preeclampsia concern)
- **Glucose**: ≥140 mg/dL (GDM screening threshold)
- **Hemoglobin**: <11.0 g/dL (pregnancy anemia)
- **Edema**: +1 or greater (concerning fluid retention)
- **Clinical Significance**: Warrants closer monitoring, may need intervention

#### 🟡 YELLOW = Mild (Monitor)
- **Blood Pressure**: 120-129/80-84 mmHg (Elevated)
- **Edema**: Trace pedal (minimal swelling)
- **Clinical Significance**: Keep an eye on trends, may be normal variant

#### ⚪ WHITE = Normal
- All values within normal range for pregnancy

---

## 🎮 Interactive Features

### 1. Demo Guide Button (Purple)
**What it does**: Opens an interactive guide panel

**When to use it**:
- During demos to stakeholders
- Training new staff
- Refreshing your memory on what the colors mean

**What you'll see**:
- Visual explanation of color coding
- Description of the demo scenario
- List of actions to try
- Clinical interpretation tips

### 2. Columns Button
**What it does**: Show/hide different data columns

**How to use**:
1. Click "Columns"
2. Check/uncheck boxes to show/hide columns
3. Columns are organized by category:
   - **Vital Signs**: Weight, BP, FHR
   - **Physical Exam**: Fundal height, presentation, movement, edema
   - **Labs**: Glucose, hemoglobin, urine
   - **Assessment**: Provider, complaints, assessment, plan

**Pro tip**: Hide columns you don't need to reduce clutter and focus on key data

### 3. Filter Button
**What it does**: Filter visits by gestational age range

**How to use**:
1. Click "Filter"
2. Set "From" and "To" weeks (0-42)
3. Only visits in that range will show

**Use cases**:
- Focus on first trimester (0-13 weeks)
- Review second trimester (14-27 weeks)
- Analyze third trimester (28-40 weeks)

### 4. Highlight Button (Toggle)
**What it does**: Turn color coding on/off

**When to toggle OFF**:
- You want to see raw data without visual cues
- Exporting/printing without colors
- Presenting to audience who prefers plain data

**When to toggle ON** (default):
- Active clinical use
- Quick scanning for problems
- Training scenarios

### 5. Add Visit Button (Blue)
**What it does**: Opens a form to add a new prenatal visit

**Form fields**:
- **Required**: Date, Gestational Age
- **Vital Signs**: Weight, BP, FHR
- **Physical Exam**: Fundal height, presentation, movement, edema
- **Urine**: Protein, glucose
- **Clinical**: Complaints, assessment, plan, provider

**What happens after saving**:
- Visit is added to the table
- Automatically sorted chronologically
- Abnormal detection runs immediately
- Trends recalculate

### 6. Print Button
**What it does**: Opens browser print dialog

**Best practices**:
- Select landscape orientation for better fit
- Consider toggling highlight off for B&W printers
- Use "Print to PDF" to create digital records

### 7. Download Button
**What it does**: Exports flowsheet to CSV file

**File format**: `prenatal-flowsheet-{patientId}-{date}.csv`

**Use cases**:
- Import to Excel for analysis
- Share with specialists
- Backup data
- Quality metrics tracking
- Research data collection

### 8. Edit/View Icons (Each Row)
- **Edit icon** (pencil): Edit visit data (not yet implemented in demo)
- **View icon** (document): View detailed notes (not yet implemented in demo)

---

## 📈 Trend Analysis

At the bottom of the flowsheet, four cards show trends over the **last 3 visits**:

### 1. Weight Trend Card
- **Shows**: Total weight change (lbs)
- **Icon**: ↑ Green = Gaining (normal), ↓ Red = Losing (concern)
- **Normal**: 1-2 lbs/week in 2nd/3rd trimester
- **Flag**: >6 lbs over 3 visits may indicate fluid retention

### 2. BP Trend Card
- **Shows**: Systolic BP change (mmHg)
- **Icon**: ✓ Green = Stable (<5 change), ⚠️ Red = Rising (≥5 change)
- **Concern**: Upward trend suggests developing hypertension

### 3. FHR Trend Card
- **Shows**: Fetal heart rate change (bpm)
- **Icon**: ✓ Green = Stable (<20 change), ⚠️ Orange = Changing (≥20 change)
- **Normal**: Some variation is normal, but big swings warrant investigation

### 4. Total Visits Card
- **Shows**: Number of visits completed
- **Also shows**: Next scheduled visit date
- **Use**: Track prenatal care compliance

---

## 🎓 Demo Data Explanation

The flowsheet comes pre-loaded with 4 visits demonstrating a **high-risk progression**:

### Visit 1 (18w 3d) - Baseline ✅
```
Date: Jan 15
GA: 18w 3d
Weight: 158 lbs
BP: 118/72 (NORMAL - white background)
FHR: 142 bpm (NORMAL)
Urine: Negative
Edema: None
Assessment: "Normal prenatal visit"
```
**Key Point**: Everything is normal, establishing baseline values

### Visit 2 (22w 1d) - Still Stable ✅
```
Date: Feb 12
GA: 22w 1d
Weight: 162 lbs (+4 lbs, normal gain)
BP: 120/70 (NORMAL, slight increase but OK)
FHR: 148 bpm (NORMAL)
Urine: Negative
Edema: None
Complaints: "Mild back pain" (common, not concerning)
Assessment: "Normal prenatal visit, anatomy scan normal"
```
**Key Point**: Normal progression, back pain is common in pregnancy

### Visit 3 (25w 0d) - Early Warning Signs ⚠️
```
Date: Mar 5
GA: 25w 0d
Weight: 165 lbs (+3 lbs, normal)
BP: 124/78 (YELLOW highlight - elevated)
FHR: 152 bpm (NORMAL)
Urine: Trace protein (ORANGE highlight ⚠️)
Edema: Trace pedal (YELLOW highlight)
Glucose: 145 mg/dL (ORANGE highlight - above 140 threshold ⚠️)
Complaints: "Increased swelling in feet"
Assessment: "Mild edema, elevated glucose - screen positive"
Plan: "3hr GTT ordered, monitor BP closely, return in 2 weeks"
```
**Key Point**: Multiple warning signs appearing:
- Trace proteinuria (preeclampsia concern)
- Elevated glucose (GDM screening positive)
- Beginning edema
- System highlights these to draw attention

### Visit 4 (27w 0d) - Multiple Concerns 🚨
```
Date: Mar 19
GA: 27w 0d
Weight: 168 lbs (+3 lbs, normal)
BP: 132/84 (ORANGE highlight - stage 1 hypertension ⚠️)
FHR: 150 bpm (NORMAL)
Urine: Trace protein (ORANGE highlight)
Edema: +1 bilateral (ORANGE highlight - worsening ⚠️)
Glucose: 156 mg/dL (ORANGE highlight - confirmed GDM ⚠️)
Hemoglobin: 11.6 g/dL (borderline anemia)
Complaints: "Headaches, increased swelling"
Assessment: "Gestational diabetes confirmed, borderline BP, mild preeclampsia signs"
Plan: "Start GDM diet, home BP monitoring, NST q week, recheck labs in 1 week"
Notes: "HIGH RISK - close monitoring required"
```
**Key Point**: Multiple orange flags = **high-risk patient**
- Rising BP trend (118 → 120 → 124 → 132)
- Confirmed gestational diabetes
- Worsening edema
- Headaches + proteinuria = possible preeclampsia
- Requires intensive monitoring

### Trend Analysis
Look at the bottom cards:
- **Weight**: +10 lbs total (normal progression)
- **BP**: +14 mmHg (RED flag - concerning trend ⚠️)
- **FHR**: +8 bpm (stable, GREEN ✓)

**Clinical Teaching Point**: This demo shows how the system helps catch concerning trends early. By Visit 3, you're already seeing warning signs. By Visit 4, multiple flags indicate this patient needs closer monitoring, possibly referral to maternal-fetal medicine.

---

## 💼 Demo Script for Stakeholders

### 30-Second Elevator Pitch
"The Prenatal Flowsheet transforms pregnancy monitoring from paper charts to an intelligent digital tool. It automatically highlights concerning values in red, orange, or yellow, so clinicians can instantly spot problems. Watch this - see how the system caught rising blood pressure, gestational diabetes, and preeclampsia signs across just 4 visits."

### 2-Minute Demo
1. **Orient** (15 sec): "This is a complete pregnancy timeline. Each row is a visit, columns show vitals and labs."

2. **Show Normal** (15 sec): "Visit 1 and 2 - all white, everything's normal."

3. **Show Problems** (30 sec): "Visit 3 - see the orange highlighting? Trace protein in urine, elevated glucose. The system caught early warning signs."

4. **Show Escalation** (30 sec): "Visit 4 - multiple orange flags. Blood pressure jumped to 132/84, glucose confirmed high at 156, edema worsening. Red banner says high-risk pregnancy."

5. **Show Trends** (30 sec): "Bottom cards show trends. BP up 14 points - red alert. This patient needs close monitoring, maybe referral to high-risk OB."

### Key Value Props to Emphasize
- **Safety**: "Never miss a concerning trend"
- **Efficiency**: "Instant visual scan vs. reading through notes"
- **Intelligence**: "Clinical guidelines built-in - automatic detection"
- **Customization**: "Show only what you need - toggle columns on/off"

---

## 🔧 Technical Notes

### Technology Stack
- **Frontend**: React 18 with TypeScript
- **State**: React hooks (useState, useMemo)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Date**: date-fns library

### Performance Optimizations
- `useMemo` for filtered visits (avoids re-filtering on every render)
- `useMemo` for trend calculations (only recalculates when visits change)
- Column visibility state (hide expensive renders)

### Abnormal Detection Logic
See code comments in `PrenatalFlowsheet.tsx` for detailed thresholds:
- `isAbnormalBP()`: Checks BP against hypertension guidelines
- `getBPSeverity()`: Returns 'normal', 'mild', 'moderate', or 'severe'
- `isAbnormalFHR()`: Checks fetal heart rate range
- `isAbnormalWeight()`: Flags excessive weight gain rate
- `isAbnormalFH()`: Checks fundal height vs gestational age
- `isAbnormalGlucose()`: Uses GDM screening threshold
- `isAbnormalHemoglobin()`: Uses pregnancy anemia cutoff

### Export Format
CSV columns match visible columns at time of export:
```csv
Visit Date,GA Weeks,Wt (lbs),FH (cm),FPR,FHR (bpm),BP (S/D),Urine,Edema
01/15/2025,18w 3d,158,18,Vertex,142,118/72,P:Neg G:Neg,None
02/12/2025,22w 1d,162,20,Vertex,148,120/70,P:Neg G:Neg,None
...
```

### Future Enhancements
- [ ] Backend API integration
- [ ] Real edit/delete visit functionality
- [ ] Advanced charts (growth curves, BP graph)
- [ ] Risk scoring algorithm
- [ ] Protocol recommendations
- [ ] Mobile-optimized touch interface
- [ ] FHIR Observation resources integration
- [ ] Lab order integration
- [ ] Ultrasound results display
- [ ] Multiple pregnancy support (twins/triplets)

---

## 🐛 Troubleshooting

### "I don't see any highlighting"
- Check if "Highlight" button is ON (amber background)
- Ensure you're looking at Visit 3 or 4 (Visits 1-2 are normal)

### "Columns button doesn't do anything"
- It opens a panel below the toolbar - scroll down if needed
- Panel disappears when you click the button again (toggle)

### "Download button doesn't work"
- Check browser pop-up blocker
- Ensure JavaScript is enabled
- File downloads to your default Downloads folder

### "Add Visit dialog won't save"
- Date and Gestational Age are required fields
- Check console for error messages

---

## 📚 Additional Resources

- **Full Demo Guide**: See `FLOWSHEET_DEMO_GUIDE.md` for presentation script
- **Code Comments**: Open `PrenatalFlowsheet.tsx` for inline documentation
- **Add Visit Dialog**: See `AddVisitDialog.tsx` for form implementation

---

## 🤝 Contributing

To add new features:
1. Add column definition to `columns` state array
2. Add render logic in `renderCell()` switch statement
3. Add abnormal detection function if needed
4. Update export logic in `handleExport()`
5. Update documentation

---

**Last Updated**: November 10, 2025
**Version**: 1.0.0
**Maintainer**: EHRConnect Development Team
