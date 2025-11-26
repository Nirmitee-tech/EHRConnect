import { Prescription } from '@/types/encounter';

export interface PrescriptionTemplate {
  id: string;
  name: string;
  category: string;
  description?: string;
  prescription: Omit<Prescription, 'id' | 'authoredOn'>;
}

export const prescriptionTemplates: PrescriptionTemplate[] = [
  // Common Pain Medications
  {
    id: 'ibuprofen-400',
    name: 'Ibuprofen 400mg',
    category: 'Pain Relief',
    description: 'For mild to moderate pain and inflammation',
    prescription: {
      resourceType: 'MedicationRequest',
      status: 'active',
      intent: 'order',
      medicationCodeableConcept: { text: 'Ibuprofen 400mg' },
      medication: 'Ibuprofen 400mg',
      dosage: '1 tablet',
      frequency: 'Three times daily',
      duration: '7 days',
      instructions: 'Take with food or milk to prevent stomach upset'
    }
  },
  {
    id: 'paracetamol-500',
    name: 'Paracetamol 500mg',
    category: 'Pain Relief',
    description: 'For fever and mild pain',
    prescription: {
      resourceType: 'MedicationRequest',
      status: 'active',
      intent: 'order',
      medicationCodeableConcept: { text: 'Paracetamol 500mg' },
      medication: 'Paracetamol 500mg',
      dosage: '1-2 tablets',
      frequency: 'Every 4-6 hours',
      duration: '5 days',
      instructions: 'Do not exceed 8 tablets in 24 hours'
    }
  },

  // Antibiotics
  {
    id: 'amoxicillin-500',
    name: 'Amoxicillin 500mg',
    category: 'Antibiotics',
    description: 'Broad-spectrum antibiotic',
    prescription: {
      resourceType: 'MedicationRequest',
      status: 'active',
      intent: 'order',
      medicationCodeableConcept: { text: 'Amoxicillin 500mg' },
      medication: 'Amoxicillin 500mg',
      dosage: '1 capsule',
      frequency: 'Three times daily',
      duration: '7 days',
      instructions: 'Complete the full course even if symptoms improve'
    }
  },
  {
    id: 'azithromycin-500',
    name: 'Azithromycin 500mg',
    category: 'Antibiotics',
    description: 'For bacterial infections',
    prescription: {
      resourceType: 'MedicationRequest',
      status: 'active',
      intent: 'order',
      medicationCodeableConcept: { text: 'Azithromycin 500mg' },
      medication: 'Azithromycin 500mg',
      dosage: '1 tablet',
      frequency: 'Once daily',
      duration: '3 days',
      instructions: 'Take on empty stomach, 1 hour before or 2 hours after meals'
    }
  },

  // Antihypertensives
  {
    id: 'amlodipine-5',
    name: 'Amlodipine 5mg',
    category: 'Cardiovascular',
    description: 'For high blood pressure',
    prescription: {
      resourceType: 'MedicationRequest',
      status: 'active',
      intent: 'order',
      medicationCodeableConcept: { text: 'Amlodipine 5mg' },
      medication: 'Amlodipine 5mg',
      dosage: '1 tablet',
      frequency: 'Once daily',
      duration: '1 month',
      instructions: 'Take at the same time each day'
    }
  },

  // Diabetes
  {
    id: 'metformin-500',
    name: 'Metformin 500mg',
    category: 'Diabetes',
    description: 'For type 2 diabetes',
    prescription: {
      resourceType: 'MedicationRequest',
      status: 'active',
      intent: 'order',
      medicationCodeableConcept: { text: 'Metformin 500mg' },
      medication: 'Metformin 500mg',
      dosage: '1 tablet',
      frequency: 'Twice daily',
      duration: '1 month',
      instructions: 'Take with meals to reduce side effects'
    }
  },

  // Respiratory
  {
    id: 'salbutamol-inhaler',
    name: 'Salbutamol Inhaler',
    category: 'Respiratory',
    description: 'For asthma relief',
    prescription: {
      resourceType: 'MedicationRequest',
      status: 'active',
      intent: 'order',
      medicationCodeableConcept: { text: 'Salbutamol Inhaler 100mcg' },
      medication: 'Salbutamol Inhaler 100mcg',
      dosage: '1-2 puffs',
      frequency: 'As needed',
      duration: '1 month',
      instructions: 'Use when experiencing breathing difficulty, wait 1 minute between puffs'
    }
  },

  // Gastrointestinal
  {
    id: 'omeprazole-20',
    name: 'Omeprazole 20mg',
    category: 'Gastrointestinal',
    description: 'For acid reflux and ulcers',
    prescription: {
      resourceType: 'MedicationRequest',
      status: 'active',
      intent: 'order',
      medicationCodeableConcept: { text: 'Omeprazole 20mg' },
      medication: 'Omeprazole 20mg',
      dosage: '1 capsule',
      frequency: 'Once daily',
      duration: '14 days',
      instructions: 'Take 30 minutes before breakfast'
    }
  },

  // Allergies
  {
    id: 'cetirizine-10',
    name: 'Cetirizine 10mg',
    category: 'Allergies',
    description: 'For allergic reactions',
    prescription: {
      resourceType: 'MedicationRequest',
      status: 'active',
      intent: 'order',
      medicationCodeableConcept: { text: 'Cetirizine 10mg' },
      medication: 'Cetirizine 10mg',
      dosage: '1 tablet',
      frequency: 'Once daily',
      duration: '7 days',
      instructions: 'May cause drowsiness, avoid driving if affected'
    }
  },

  // Vitamins & Supplements
  {
    id: 'vitamin-d3',
    name: 'Vitamin D3 1000 IU',
    category: 'Vitamins',
    description: 'For vitamin D deficiency',
    prescription: {
      resourceType: 'MedicationRequest',
      status: 'active',
      intent: 'order',
      medicationCodeableConcept: { text: 'Vitamin D3 1000 IU' },
      medication: 'Vitamin D3 1000 IU',
      dosage: '1 capsule',
      frequency: 'Once daily',
      duration: '3 months',
      instructions: 'Take with a meal containing fat for better absorption'
    }
  },
  {
    id: 'calcium-500',
    name: 'Calcium 500mg',
    category: 'Vitamins',
    description: 'For calcium supplementation',
    prescription: {
      resourceType: 'MedicationRequest',
      status: 'active',
      intent: 'order',
      medicationCodeableConcept: { text: 'Calcium Carbonate 500mg' },
      medication: 'Calcium Carbonate 500mg',
      dosage: '1 tablet',
      frequency: 'Twice daily',
      duration: '1 month',
      instructions: 'Take with meals for better absorption'
    }
  }
];

// Group templates by category
export const prescriptionTemplatesByCategory = prescriptionTemplates.reduce((acc, template) => {
  if (!acc[template.category]) {
    acc[template.category] = [];
  }
  acc[template.category].push(template);
  return acc;
}, {} as Record<string, PrescriptionTemplate[]>);

// Get all unique categories
export const prescriptionCategories = Array.from(
  new Set(prescriptionTemplates.map(t => t.category))
).sort();
