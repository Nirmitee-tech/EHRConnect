/**
 * Pregnancy Calculators & Utilities
 * Medical-grade calculations for obstetric care
 */

/**
 * Calculate EDD (Estimated Due Date) from LMP using Naegele's Rule
 * EDD = LMP + 280 days (40 weeks)
 */
export function calculateEDDFromLMP(lmp: Date): Date {
  const edd = new Date(lmp);
  edd.setDate(edd.getDate() + 280); // 40 weeks = 280 days
  return edd;
}

/**
 * Calculate EDD from conception date
 * EDD = Conception date + 266 days (38 weeks)
 */
export function calculateEDDFromConception(conceptionDate: Date): Date {
  const edd = new Date(conceptionDate);
  edd.setDate(edd.getDate() + 266);
  return edd;
}

/**
 * Calculate EDD from ultrasound measurements
 * Based on Crown-Rump Length (CRL) or Biparietal Diameter (BPD)
 */
export function calculateEDDFromUltrasound(
  ultrasoundDate: Date,
  gestationalAgeAtScan: number // in weeks
): Date {
  const daysFromConception = gestationalAgeAtScan * 7;
  const daysToAdd = 280 - daysFromConception;
  const edd = new Date(ultrasoundDate);
  edd.setDate(edd.getDate() + daysToAdd);
  return edd;
}

/**
 * Calculate current gestational age from LMP
 * Returns weeks and days
 */
export function calculateGestationalAge(lmp: Date, today: Date = new Date()): {
  weeks: number;
  days: number;
  totalDays: number;
  totalWeeks: number;
} {
  const diffTime = today.getTime() - lmp.getTime();
  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(totalDays / 7);
  const days = totalDays % 7;

  return {
    weeks,
    days,
    totalDays,
    totalWeeks: totalDays / 7,
  };
}

/**
 * Calculate conception date from LMP
 * Conception typically occurs ~14 days after LMP
 */
export function calculateConceptionDate(lmp: Date): Date {
  const conception = new Date(lmp);
  conception.setDate(conception.getDate() + 14);
  return conception;
}

/**
 * Determine current trimester
 */
export function calculateTrimester(gestationalWeeks: number): {
  trimester: 1 | 2 | 3;
  label: string;
} {
  if (gestationalWeeks < 14) {
    return { trimester: 1, label: 'First Trimester' };
  } else if (gestationalWeeks < 28) {
    return { trimester: 2, label: 'Second Trimester' };
  } else {
    return { trimester: 3, label: 'Third Trimester' };
  }
}

/**
 * Calculate days until delivery
 */
export function calculateDaysToDelivery(edd: Date, today: Date = new Date()): number {
  const diffTime = edd.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculate BMI
 */
export function calculateBMI(weightKg: number, heightCm: number): {
  bmi: number;
  category: string;
  color: string;
} {
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);

  let category: string;
  let color: string;

  if (bmi < 18.5) {
    category = 'Underweight';
    color = 'text-blue-600';
  } else if (bmi < 25) {
    category = 'Normal';
    color = 'text-green-600';
  } else if (bmi < 30) {
    category = 'Overweight';
    color = 'text-yellow-600';
  } else {
    category = 'Obese';
    color = 'text-red-600';
  }

  return {
    bmi: Math.round(bmi * 10) / 10,
    category,
    color,
  };
}

/**
 * Calculate recommended weight gain based on pre-pregnancy BMI
 * Based on IOM (Institute of Medicine) guidelines
 */
export function calculateRecommendedWeightGain(prePregnancyBMI: number): {
  min: number;
  max: number;
  category: string;
} {
  if (prePregnancyBMI < 18.5) {
    return { min: 12.5, max: 18, category: 'Underweight' };
  } else if (prePregnancyBMI < 25) {
    return { min: 11.5, max: 16, category: 'Normal weight' };
  } else if (prePregnancyBMI < 30) {
    return { min: 7, max: 11.5, category: 'Overweight' };
  } else {
    return { min: 5, max: 9, category: 'Obese' };
  }
}

/**
 * Calculate current weight gain and assess if within recommended range
 */
export function assessWeightGain(
  prePregnancyWeight: number,
  currentWeight: number,
  prePregnancyBMI: number
): {
  gain: number;
  recommended: { min: number; max: number };
  status: 'below' | 'normal' | 'above';
  statusColor: string;
} {
  const gain = currentWeight - prePregnancyWeight;
  const recommended = calculateRecommendedWeightGain(prePregnancyBMI);

  let status: 'below' | 'normal' | 'above';
  let statusColor: string;

  if (gain < recommended.min) {
    status = 'below';
    statusColor = 'text-blue-600';
  } else if (gain > recommended.max) {
    status = 'above';
    statusColor = 'text-red-600';
  } else {
    status = 'normal';
    statusColor = 'text-green-600';
  }

  return {
    gain: Math.round(gain * 10) / 10,
    recommended,
    status,
    statusColor,
  };
}

/**
 * Format gestational age as "XX weeks Y days"
 */
export function formatGestationalAge(weeks: number, days: number): string {
  return `${weeks}w ${days}d`;
}

/**
 * Format date as readable string
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Calculate percentage of pregnancy completed
 */
export function calculatePregnancyProgress(gestationalWeeks: number): number {
  return Math.min(100, Math.round((gestationalWeeks / 40) * 100));
}

/**
 * Determine if pregnancy is high-risk based on multiple factors
 */
export function assessHighRiskFactors(factors: {
  maternalAge?: number;
  bmi?: number;
  previousCesarean?: boolean;
  previousPreterm?: boolean;
  multipleGestation?: boolean;
  chronicConditions?: string[];
  previousLoss?: boolean;
}): {
  isHighRisk: boolean;
  riskFactors: string[];
  riskLevel: 'low' | 'moderate' | 'high';
} {
  const riskFactors: string[] = [];

  if (factors.maternalAge && factors.maternalAge >= 35) {
    riskFactors.push('Advanced maternal age (≥35 years)');
  }
  if (factors.maternalAge && factors.maternalAge < 18) {
    riskFactors.push('Young maternal age (<18 years)');
  }
  if (factors.bmi && factors.bmi < 18.5) {
    riskFactors.push('Underweight (BMI < 18.5)');
  }
  if (factors.bmi && factors.bmi >= 30) {
    riskFactors.push('Obesity (BMI ≥ 30)');
  }
  if (factors.previousCesarean) {
    riskFactors.push('Previous cesarean delivery');
  }
  if (factors.previousPreterm) {
    riskFactors.push('History of preterm birth');
  }
  if (factors.multipleGestation) {
    riskFactors.push('Multiple gestation (twins/triplets)');
  }
  if (factors.chronicConditions && factors.chronicConditions.length > 0) {
    riskFactors.push(`Chronic conditions: ${factors.chronicConditions.join(', ')}`);
  }
  if (factors.previousLoss) {
    riskFactors.push('History of pregnancy loss');
  }

  const isHighRisk = riskFactors.length > 0;
  let riskLevel: 'low' | 'moderate' | 'high';

  if (riskFactors.length === 0) {
    riskLevel = 'low';
  } else if (riskFactors.length <= 2) {
    riskLevel = 'moderate';
  } else {
    riskLevel = 'high';
  }

  return {
    isHighRisk,
    riskFactors,
    riskLevel,
  };
}

/**
 * Calculate fundal height expected range based on gestational age
 * Rule of thumb: Fundal height (cm) ≈ Gestational age (weeks) ± 2cm
 */
export function calculateExpectedFundalHeight(gestationalWeeks: number): {
  expected: number;
  min: number;
  max: number;
} {
  return {
    expected: gestationalWeeks,
    min: gestationalWeeks - 2,
    max: gestationalWeeks + 2,
  };
}

/**
 * Assess if fundal height measurement is within normal range
 */
export function assessFundalHeight(
  measuredHeight: number,
  gestationalWeeks: number
): {
  status: 'small' | 'normal' | 'large';
  statusColor: string;
  message: string;
} {
  const expected = calculateExpectedFundalHeight(gestationalWeeks);

  if (measuredHeight < expected.min) {
    return {
      status: 'small',
      statusColor: 'text-orange-600',
      message: 'Small for gestational age - consider ultrasound',
    };
  } else if (measuredHeight > expected.max) {
    return {
      status: 'large',
      statusColor: 'text-orange-600',
      message: 'Large for gestational age - rule out polyhydramnios/macrosomia',
    };
  } else {
    return {
      status: 'normal',
      statusColor: 'text-green-600',
      message: 'Within normal range',
    };
  }
}
