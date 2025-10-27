// Common health conditions from SNOMED CT and ICD-10
export interface ConditionMaster {
  code: string;
  display: string;
  category: string;
  system: string;
}

export const CONDITION_CATEGORIES = [
  'Cardiovascular',
  'Endocrine',
  'Respiratory',
  'Neurological',
  'Gastrointestinal',
  'Musculoskeletal',
  'Mental Health',
  'Cancer',
  'Genetic',
  'Other'
];

export const CONDITION_MASTERS: ConditionMaster[] = [
  // Cardiovascular
  { code: '38341003', display: 'Hypertension', category: 'Cardiovascular', system: 'http://snomed.info/sct' },
  { code: '22298006', display: 'Myocardial infarction', category: 'Cardiovascular', system: 'http://snomed.info/sct' },
  { code: '56265001', display: 'Heart disease', category: 'Cardiovascular', system: 'http://snomed.info/sct' },
  { code: '49601007', display: 'Coronary artery disease', category: 'Cardiovascular', system: 'http://snomed.info/sct' },
  { code: '48194001', display: 'Heart failure', category: 'Cardiovascular', system: 'http://snomed.info/sct' },
  { code: '49436004', display: 'Atrial fibrillation', category: 'Cardiovascular', system: 'http://snomed.info/sct' },

  // Endocrine
  { code: '73211009', display: 'Diabetes mellitus', category: 'Endocrine', system: 'http://snomed.info/sct' },
  { code: '44054006', display: 'Type 2 diabetes mellitus', category: 'Endocrine', system: 'http://snomed.info/sct' },
  { code: '46635009', display: 'Type 1 diabetes mellitus', category: 'Endocrine', system: 'http://snomed.info/sct' },
  { code: '40930008', display: 'Hypothyroidism', category: 'Endocrine', system: 'http://snomed.info/sct' },
  { code: '34486009', display: 'Hyperthyroidism', category: 'Endocrine', system: 'http://snomed.info/sct' },

  // Respiratory
  { code: '195967001', display: 'Asthma', category: 'Respiratory', system: 'http://snomed.info/sct' },
  { code: '13645005', display: 'Chronic obstructive pulmonary disease', category: 'Respiratory', system: 'http://snomed.info/sct' },
  { code: '233604007', display: 'Pneumonia', category: 'Respiratory', system: 'http://snomed.info/sct' },
  { code: '195951007', display: 'Chronic bronchitis', category: 'Respiratory', system: 'http://snomed.info/sct' },
  { code: '278516003', display: 'Emphysema', category: 'Respiratory', system: 'http://snomed.info/sct' },

  // Neurological
  { code: '230690007', display: 'Cerebrovascular accident (Stroke)', category: 'Neurological', system: 'http://snomed.info/sct' },
  { code: '371041009', display: 'Embolic stroke', category: 'Neurological', system: 'http://snomed.info/sct' },
  { code: '52448006', display: 'Dementia', category: 'Neurological', system: 'http://snomed.info/sct' },
  { code: '26929004', display: 'Alzheimer disease', category: 'Neurological', system: 'http://snomed.info/sct' },
  { code: '49049000', display: 'Parkinson disease', category: 'Neurological', system: 'http://snomed.info/sct' },
  { code: '84757009', display: 'Epilepsy', category: 'Neurological', system: 'http://snomed.info/sct' },
  { code: '37796009', display: 'Migraine', category: 'Neurological', system: 'http://snomed.info/sct' },

  // Cancer
  { code: '363346000', display: 'Malignant neoplasm', category: 'Cancer', system: 'http://snomed.info/sct' },
  { code: '254837009', display: 'Breast cancer', category: 'Cancer', system: 'http://snomed.info/sct' },
  { code: '363418001', display: 'Lung cancer', category: 'Cancer', system: 'http://snomed.info/sct' },
  { code: '363414004', display: 'Colon cancer', category: 'Cancer', system: 'http://snomed.info/sct' },
  { code: '399068003', display: 'Prostate cancer', category: 'Cancer', system: 'http://snomed.info/sct' },
  { code: '93870000', display: 'Ovarian cancer', category: 'Cancer', system: 'http://snomed.info/sct' },
  { code: '109838007', display: 'Leukemia', category: 'Cancer', system: 'http://snomed.info/sct' },
  { code: '118600007', display: 'Lymphoma', category: 'Cancer', system: 'http://snomed.info/sct' },

  // Gastrointestinal
  { code: '235595009', display: 'Gastroesophageal reflux disease', category: 'Gastrointestinal', system: 'http://snomed.info/sct' },
  { code: '397428000', display: 'Crohn disease', category: 'Gastrointestinal', system: 'http://snomed.info/sct' },
  { code: '64766004', display: 'Ulcerative colitis', category: 'Gastrointestinal', system: 'http://snomed.info/sct' },
  { code: '235494005', display: 'Chronic liver disease', category: 'Gastrointestinal', system: 'http://snomed.info/sct' },
  { code: '19829001', display: 'Cirrhosis of liver', category: 'Gastrointestinal', system: 'http://snomed.info/sct' },

  // Musculoskeletal
  { code: '69896004', display: 'Rheumatoid arthritis', category: 'Musculoskeletal', system: 'http://snomed.info/sct' },
  { code: '396275006', display: 'Osteoarthritis', category: 'Musculoskeletal', system: 'http://snomed.info/sct' },
  { code: '64859006', display: 'Osteoporosis', category: 'Musculoskeletal', system: 'http://snomed.info/sct' },
  { code: '203082005', display: 'Fibromyalgia', category: 'Musculoskeletal', system: 'http://snomed.info/sct' },

  // Kidney
  { code: '90708001', display: 'Kidney disease', category: 'Other', system: 'http://snomed.info/sct' },
  { code: '46177005', display: 'Chronic kidney disease', category: 'Other', system: 'http://snomed.info/sct' },
  { code: '709044004', display: 'Chronic kidney disease stage 5', category: 'Other', system: 'http://snomed.info/sct' },

  // Mental Health
  { code: '35489007', display: 'Depression', category: 'Mental Health', system: 'http://snomed.info/sct' },
  { code: '48694002', display: 'Anxiety disorder', category: 'Mental Health', system: 'http://snomed.info/sct' },
  { code: '191736004', display: 'Bipolar disorder', category: 'Mental Health', system: 'http://snomed.info/sct' },
  { code: '58214004', display: 'Schizophrenia', category: 'Mental Health', system: 'http://snomed.info/sct' },

  // Blood
  { code: '271737000', display: 'Anemia', category: 'Other', system: 'http://snomed.info/sct' },
  { code: '414022008', display: 'Sickle cell disease', category: 'Genetic', system: 'http://snomed.info/sct' },
  { code: '30989003', display: 'Hemophilia', category: 'Genetic', system: 'http://snomed.info/sct' },

  // Other
  { code: '399261000', display: 'History of myocardial infarction', category: 'Cardiovascular', system: 'http://snomed.info/sct' },
  { code: '161501007', display: 'Family history of stroke', category: 'Neurological', system: 'http://snomed.info/sct' },
  { code: '160303001', display: 'Family history of diabetes', category: 'Endocrine', system: 'http://snomed.info/sct' },
  { code: '275937001', display: 'Family history of heart disease', category: 'Cardiovascular', system: 'http://snomed.info/sct' },
];
