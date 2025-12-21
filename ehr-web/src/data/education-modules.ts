
interface EducationModule {
  id: string;
  title: string;
  description: string;
  category: 'nutrition' | 'exercise' | 'warning_signs' | 'medications' | 'labor_prep' | 'breastfeeding' | 'newborn_care' | 'mental_health';
  trimester: 1 | 2 | 3 | 'all' | 'postpartum';
  contentType: 'video' | 'article' | 'checklist' | 'interactive';
  duration: string;
  required: boolean;
  url?: string;
}

export let modules: EducationModule[] = [
    { id: 'nutr-1', title: 'Healthy Eating During Pregnancy', description: 'Essential nutrients, foods to avoid, meal planning', category: 'nutrition', trimester: 'all', contentType: 'video', duration: '12 min', required: true, url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    { id: 'nutr-2', title: 'Prenatal Vitamins & Supplements', description: 'Folic acid, iron, DHA importance and dosing', category: 'nutrition', trimester: 1, contentType: 'article', duration: '5 min', required: true, url: 'https://www.google.com/search?q=prenatal+vitamins' },
    { id: 'nutr-3', title: 'Weight Gain Guidelines', description: 'IOM recommendations by BMI category', category: 'nutrition', trimester: 1, contentType: 'checklist', duration: '3 min', required: false },
    { id: 'nutr-4', title: 'Managing Nausea & Food Aversions', description: 'Tips for first trimester nausea', category: 'nutrition', trimester: 1, contentType: 'article', duration: '4 min', required: false },
    { id: 'nutr-5', title: 'Gestational Diabetes Diet', description: 'Carb counting, blood sugar management', category: 'nutrition', trimester: 2, contentType: 'interactive', duration: '15 min', required: false },
];
