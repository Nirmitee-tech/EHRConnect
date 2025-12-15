/**
 * Preview Service - Phase 3: Responsive Preview System
 *
 * Utility functions for preview functionality:
 * - Schema transformation
 * - Validation helpers
 * - Preview data management
 */

interface QuestionnaireItem {
  linkId: string;
  text?: string;
  type: string;
  required?: boolean;
  item?: QuestionnaireItem[];
  [key: string]: any;
}

/**
 * Flatten nested questionnaire items
 */
export function flattenQuestions(items: QuestionnaireItem[]): QuestionnaireItem[] {
  const result: QuestionnaireItem[] = [];

  const flatten = (questions: QuestionnaireItem[]) => {
    questions.forEach(item => {
      // Skip display-only elements
      if (item.type !== 'display') {
        result.push(item);
      }
      if (item.item) {
        flatten(item.item);
      }
    });
  };

  flatten(items);
  return result;
}

/**
 * Get all required field linkIds
 */
export function getRequiredFields(items: QuestionnaireItem[]): string[] {
  return flattenQuestions(items)
    .filter(item => item.required && item.type !== 'group')
    .map(item => item.linkId);
}

/**
 * Validate test data against questionnaire
 */
export function validateTestData(
  items: QuestionnaireItem[],
  testData: Record<string, any>
): {
  isValid: boolean;
  missingFields: string[];
  completedFields: string[];
} {
  const requiredFields = getRequiredFields(items);
  const missingFields: string[] = [];
  const completedFields: string[] = [];

  requiredFields.forEach(linkId => {
    const value = testData[linkId];
    const isEmpty = value === undefined || value === null || value === '';

    if (isEmpty) {
      missingFields.push(linkId);
    } else {
      completedFields.push(linkId);
    }
  });

  return {
    isValid: missingFields.length === 0,
    missingFields,
    completedFields
  };
}

/**
 * Convert builder questions to FHIR Questionnaire
 */
export function toFHIRQuestionnaire(
  title: string,
  description: string | undefined,
  items: QuestionnaireItem[]
): any {
  return {
    resourceType: 'Questionnaire',
    status: 'draft',
    title,
    description,
    item: items
  };
}

/**
 * Generate empty QuestionnaireResponse
 */
export function generateEmptyResponse(): any {
  return {
    resourceType: 'QuestionnaireResponse',
    status: 'in-progress',
    authored: new Date().toISOString(),
    item: []
  };
}

/**
 * Check if item is a display element (heading, separator, description)
 */
export function isDisplayElement(item: QuestionnaireItem): boolean {
  if (item.type !== 'display') return false;

  const displayCategory = item.extension?.find((ext: any) =>
    ext.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-displayCategory'
  )?.valueCode;

  return !!displayCategory;
}

/**
 * Get display category for display elements
 */
export function getDisplayCategory(item: QuestionnaireItem): string | null {
  if (item.type !== 'display') return null;

  return item.extension?.find((ext: any) =>
    ext.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-displayCategory'
  )?.valueCode || null;
}

/**
 * Check if item is a columns layout
 */
export function isColumnsLayout(item: QuestionnaireItem): boolean {
  return item.type === 'group' && item.extension?.some((ext: any) =>
    ext.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl' &&
    ext.valueCode === 'columns'
  ) || false;
}

/**
 * Get column count for columns layout
 */
export function getColumnCount(item: QuestionnaireItem): number {
  if (!isColumnsLayout(item)) return 1;

  return item.extension?.find((ext: any) =>
    ext.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-columns'
  )?.valueInteger || 2;
}
