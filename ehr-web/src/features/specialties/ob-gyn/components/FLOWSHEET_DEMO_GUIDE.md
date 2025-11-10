# Prenatal Flowsheet - Demo Guide

## 📋 Overview
The Prenatal Flowsheet is a comprehensive clinical tool for tracking prenatal care visits throughout pregnancy. It provides at-a-glance visualization of patient progress, automatically highlights concerning values, and helps clinicians identify trends.

---

## 🎯 Demo Talking Points

### 1. **What is a Prenatal Flowsheet?**
- A chronological record of all prenatal visits
- Shows key vitals, measurements, and clinical findings over time
- Standard tool in OB/GYN practices for monitoring pregnancy progression
- Replaces traditional paper flowsheets with intelligent, interactive digital version

### 2. **Key Features to Highlight**

#### **Intelligent Abnormal Value Detection** 🔴🟠🟡
The system automatically identifies and color-codes concerning values:
- **RED (Severe)**: Critical findings requiring immediate attention
  - Example: BP ≥140/90 (preeclampsia risk)
  - Example: Fetal heart rate <110 or >160 bpm
- **ORANGE (Moderate)**: Concerning findings to monitor closely
  - Example: BP 130-139/85-89 (stage 1 hypertension)
  - Example: Proteinuria (potential preeclampsia)
  - Example: Elevated glucose ≥140 mg/dL (GDM screening)
- **YELLOW (Mild)**: Borderline values to watch
  - Example: BP 120-129/80-84 (elevated)
  - Example: Trace edema

#### **Trend Analysis** 📈
Four trend cards at the bottom show:
- **Weight Trend**: Total gain/loss over last 3 visits
- **BP Trend**: Systolic change (flags if rising >5 mmHg)
- **FHR Trend**: Fetal heart rate stability
- **Visit Summary**: Total visits and next appointment

#### **Customizable Views** ⚙️
- Toggle 17+ different columns on/off via "Columns" button
- Filter visits by gestational age range
- Toggle abnormal highlighting on/off
- Organize by categories: Vital Signs, Physical Exam, Labs, Clinical Assessment

---

## 🎬 Demo Script

### **Opening (30 seconds)**
"Let me show you our Prenatal Flowsheet - think of it as a bird's-eye view of the entire pregnancy. This patient is G2P1, currently at 27 weeks with an EDD of August 15th. Notice the red banner? The system automatically flags high-risk pregnancies."

### **Demonstrate Problem Detection (1 minute)**
1. Point to the **last visit row** (Visit #4):
   - "See the orange highlighting on the blood pressure? It's 132/84 - that's borderline hypertension"
   - "Look at the glucose: 156 mg/dL - also highlighted because it's above the 140 threshold"
   - "And here's trace protein in the urine - another orange flag"

2. Scroll up to **earlier visits**:
   - "Notice how the BP was normal here - 118/72, no highlighting"
   - "But watch the progression: 118 → 120 → 124 → 132"
   - "The system is helping us catch this trend before it becomes critical"

### **Show Trend Cards (30 seconds)**
Scroll to bottom:
- "The BP trend card shows +14 mmHg increase - flagged in red"
- "Weight gain is 10 pounds over 3 visits - within normal range"
- "FHR is stable - green checkmark indicates normal"

### **Demonstrate Interactivity (1 minute)**
1. **Click "Highlight" button**:
   - "I can toggle the color coding off if I just want to see raw data"
   - Click again: "Or turn it back on for clinical decision support"

2. **Click "Columns" button**:
   - "I can customize what data I see"
   - Check "Glucose" and "Hemoglobin": "Adding lab values"
   - Check "Provider" and "Assessment": "Or add clinical notes"
   - Uncheck them: "And hide what I don't need right now"

3. **Click "Filter" button**:
   - "Filter to just second trimester: weeks 13-27"
   - "Or focus on third trimester for recent visits"

### **Add New Visit (1 minute)**
1. Click **"Add Visit" button**:
   - "Adding a new visit is simple - comprehensive form with all fields"
   - Fill in a few fields:
     - Date: Today's date
     - GA: "29w 0d"
     - Weight: "171" (showing continued gain)
     - BP: "138/86" (showing worsening)
     - FHR: "148"
   - "Notice it pre-populates common values like 'Vertex' presentation"

2. Click **"Save Visit"**:
   - "And there it is - automatically sorted chronologically"
   - "The BP is highlighted orange because it's elevated"

### **Export Features (30 seconds)**
- Click **Download icon**: "Exports to CSV for data analysis or import to other systems"
- Click **Print icon**: "Or print a clean copy for paper charts or patient records"

---

## 🔍 Key Clinical Scenarios in Demo Data

### **Visit 1 (18w 3d)** - Baseline ✅
- Everything normal
- Establishing baseline values
- Good teaching example of "normal" visit

### **Visit 2 (22w 1d)** - Still Normal ✅
- Slight BP increase but still normal
- Appropriate weight gain
- Shows consistency

### **Visit 3 (25w 0d)** - Early Warning Signs ⚠️
- Trace protein in urine (orange highlight)
- Trace pedal edema (yellow highlight)
- Glucose 145 mg/dL (orange highlight - GDM screening threshold)
- **KEY POINT**: "This is where the system helps catch early preeclampsia/GDM signs"

### **Visit 4 (27w 0d)** - Multiple Concerns 🚨
- BP 132/84 (orange - borderline hypertension)
- Glucose 156 mg/dL (orange - confirmed GDM)
- +1 bilateral edema (orange - worsening)
- Hemoglobin 11.6 (slight anemia)
- **KEY POINT**: "Multiple orange flags = high-risk patient needing close monitoring"

---

## 💡 Value Propositions to Emphasize

### **For Clinicians:**
1. **Time Savings**: "Instant visual scan vs. flipping through paper notes"
2. **Safety**: "Never miss a concerning trend - system flags it automatically"
3. **Decision Support**: "Color coding guides clinical judgment"
4. **Customization**: "Show only the data you care about"

### **For Practice Managers:**
1. **Quality Metrics**: "Track prenatal care quality indicators"
2. **Risk Management**: "Early identification reduces liability"
3. **Efficiency**: "Faster chart review = more patients per day"
4. **Compliance**: "Complete documentation for billing/audits"

### **For IT/Technical Audience:**
1. **Configurable**: "17 customizable columns"
2. **Intelligent**: "Clinical rules engine for abnormal detection"
3. **Interoperable**: "CSV export, print-ready format"
4. **Scalable**: "React components, TypeScript for maintainability"

---

## 🎓 Understanding the Data

### **Abbreviations Explained:**
- **GA**: Gestational Age (weeks + days, e.g., "28w 3d" = 28 weeks, 3 days)
- **G/P**: Gravida/Para (G2/P1 = 2nd pregnancy, 1 previous birth)
- **EDD**: Estimated Due Date
- **FH**: Fundal Height (cm) - should match GA in weeks
- **FPR**: Fetal Presentation (Vertex = head down, normal)
- **FHR**: Fetal Heart Rate (bpm) - normal 110-160
- **FM**: Fetal Movement
- **BP**: Blood Pressure (Systolic/Diastolic)

### **Normal Ranges:**
- **BP**: <120/80 ideal, 120-129/80-84 elevated, 130-139/85-89 stage 1 HTN, ≥140/90 stage 2 HTN
- **FHR**: 110-160 bpm (average 120-160)
- **Weight Gain**: ~1-2 lbs/week in 2nd/3rd trimester
- **Fundal Height**: Within ±2 cm of GA in weeks (e.g., 28 cm at 28 weeks)
- **Glucose**: Fasting <95 mg/dL, 1-hour post-glucose challenge <140 mg/dL
- **Hemoglobin**: ≥11.0 g/dL (pregnancy cutoff for anemia)
- **Urine**: Negative protein and glucose
- **Edema**: None to trace is normal, +1 or more is concerning

### **Risk Factors Shown:**
1. **Gestational Diabetes** - Elevated glucose readings
2. **Borderline HTN** - Rising blood pressure trend
3. **Trace Proteinuria** - Protein in urine (preeclampsia concern)

---

## 🗣️ Answering Common Questions

### "Why is this better than our current paper flowsheet?"
**Answer**: "Three key advantages:
1. Automatic highlighting of abnormal values - you can't miss them
2. Instant trend analysis - see patterns over time at a glance
3. Customizable views and filtering - focus on what matters to you"

### "How does it know what values are abnormal?"
**Answer**: "We've built in clinical guidelines from ACOG (American College of Obstetricians and Gynecologists). For example, BP thresholds follow the latest hypertension guidelines, glucose cutoffs match GDM screening criteria. The system applies these rules in real-time."

### "Can I add custom fields for my specialty protocols?"
**Answer**: "Yes! The column system is extensible. We can add specialty-specific fields - like NST results, biophysical profile scores, or specialized labs - to match your clinical workflow."

### "What if I don't want all this color coding?"
**Answer**: "Click the 'Highlight' button to toggle it off. Some providers prefer raw data, others love the visual cues. It's your choice."

### "How do I export this for consultation or referral?"
**Answer**: "Click Download for CSV format - works with Excel, EMR systems, data analysis tools. Or click Print for a clean PDF suitable for faxing or sharing with specialists."

---

## 🎯 Key Takeaway
"The Prenatal Flowsheet transforms pregnancy monitoring from a manual, paper-based process into an intelligent, interactive tool that helps you provide safer, higher-quality prenatal care while saving time."

---

## 📝 Next Steps for Full Implementation
1. **API Integration**: Connect to backend for real-time data
2. **Additional Dialogs**: Order labs, view detailed notes, edit visits
3. **Advanced Features**: Growth charts, risk scoring, protocol recommendations
4. **Mobile Optimization**: Touch-friendly interface for tablets
5. **FHIR Integration**: Standards-based data exchange
