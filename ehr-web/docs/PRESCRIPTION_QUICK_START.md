# Prescription System - Quick Start (2 minutes)

## ⚡ TL;DR

**2 components. Import and use. That's it.**

---

## 1️⃣ For Encounters

```tsx
import { PrescriptionsIntegrated } from '@/components/prescriptions/prescriptions-integrated';

<PrescriptionsIntegrated
  prescriptions={encounter.prescriptions || []}
  onUpdate={(prescriptions) => {
    setEncounter({ ...encounter, prescriptions });
  }}
/>
```

**You get:**
- 4 mode buttons: Inline | Cards | Quick | Detailed
- UI changes completely per mode
- 2-60 seconds per prescription

---

## 2️⃣ For Medications Tab

```tsx
import { MedicationsTabIntegrated } from '@/components/patients/medications-tab-integrated';

<MedicationsTabIntegrated
  patientId={patientId}
  medications={medications}
  onMedicationChange={() => fetchMedications()}
/>
```

**You get:**
- 3 add buttons: Quick | Template | Detailed
- Edit/delete/duplicate on each medication
- FHIR sync

---

## 🎬 Demo

Visit: `/demo/prescriptions`

---

## 📖 More Info

- `PRESCRIPTION_SIMPLE_GUIDE.md` - Overview
- `PRESCRIPTION_INTEGRATION_GUIDE.md` - How to use
- `PRESCRIPTION_FINAL_SUMMARY.md` - Complete details

---

## ✅ Done!

That's it. Use these 2 components and you have all 4 UIs with mode switching built-in.
