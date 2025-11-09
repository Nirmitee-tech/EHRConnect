/**
 * Form Component Library
 * Definitions for all draggable form components in the Form Builder
 */

import type { FormComponentDefinition, QuestionnaireItem } from '@/types/forms';

export const COMPONENT_LIBRARY: FormComponentDefinition[] = [
  // ============================================================================
  // Input Fields
  // ============================================================================
  {
    id: 'text-input',
    category: 'input-fields',
    type: 'string',
    label: 'Text Input',
    description: 'Single-line text field',
    icon: 'Type',
    defaultProps: {
      linkId: '',
      text: 'Text field label',
      type: 'string',
      required: false,
    },
  },
  {
    id: 'textarea',
    category: 'input-fields',
    type: 'text',
    label: 'Text Area',
    description: 'Multi-line text field',
    icon: 'AlignLeft',
    defaultProps: {
      linkId: '',
      text: 'Text area label',
      type: 'text',
      required: false,
    },
  },
  {
    id: 'number',
    category: 'input-fields',
    type: 'integer',
    label: 'Number',
    description: 'Integer input',
    icon: 'Hash',
    defaultProps: {
      linkId: '',
      text: 'Number field label',
      type: 'integer',
      required: false,
    },
  },
  {
    id: 'decimal',
    category: 'input-fields',
    type: 'decimal',
    label: 'Decimal',
    description: 'Decimal number input',
    icon: 'CircleDot',
    defaultProps: {
      linkId: '',
      text: 'Decimal field label',
      type: 'decimal',
      required: false,
    },
  },
  {
    id: 'date',
    category: 'input-fields',
    type: 'date',
    label: 'Date',
    description: 'Date picker',
    icon: 'Calendar',
    defaultProps: {
      linkId: '',
      text: 'Date field label',
      type: 'date',
      required: false,
    },
  },
  {
    id: 'time',
    category: 'input-fields',
    type: 'time',
    label: 'Time',
    description: 'Time picker',
    icon: 'Clock',
    defaultProps: {
      linkId: '',
      text: 'Time field label',
      type: 'time',
      required: false,
    },
  },
  {
    id: 'datetime',
    category: 'input-fields',
    type: 'dateTime',
    label: 'Date & Time',
    description: 'Date and time picker',
    icon: 'CalendarClock',
    defaultProps: {
      linkId: '',
      text: 'Date/Time field label',
      type: 'dateTime',
      required: false,
    },
  },
  {
    id: 'url',
    category: 'input-fields',
    type: 'url',
    label: 'URL',
    description: 'URL/Link input',
    icon: 'Link',
    defaultProps: {
      linkId: '',
      text: 'URL field label',
      type: 'url',
      required: false,
    },
  },

  // ============================================================================
  // Selection Controls
  // ============================================================================
  {
    id: 'choice-dropdown',
    category: 'selection',
    type: 'choice',
    label: 'Dropdown',
    description: 'Single selection dropdown',
    icon: 'ChevronDown',
    defaultProps: {
      linkId: '',
      text: 'Select an option',
      type: 'choice',
      required: false,
      answerOption: [
        { valueString: 'Option 1' },
        { valueString: 'Option 2' },
        { valueString: 'Option 3' },
      ],
    },
  },
  {
    id: 'radio',
    category: 'selection',
    type: 'choice',
    label: 'Radio Buttons',
    description: 'Single selection radio group',
    icon: 'Circle',
    defaultProps: {
      linkId: '',
      text: 'Choose one option',
      type: 'choice',
      required: false,
      answerOption: [
        { valueString: 'Option 1' },
        { valueString: 'Option 2' },
        { valueString: 'Option 3' },
      ],
    },
  },
  {
    id: 'checkbox',
    category: 'selection',
    type: 'boolean',
    label: 'Checkbox',
    description: 'Boolean checkbox',
    icon: 'CheckSquare',
    defaultProps: {
      linkId: '',
      text: 'Checkbox label',
      type: 'boolean',
      required: false,
    },
  },
  {
    id: 'open-choice',
    category: 'selection',
    type: 'open-choice',
    label: 'Open Choice',
    description: 'Dropdown with custom option',
    icon: 'ListFilter',
    defaultProps: {
      linkId: '',
      text: 'Select or enter option',
      type: 'open-choice',
      required: false,
      answerOption: [
        { valueString: 'Option 1' },
        { valueString: 'Option 2' },
        { valueString: 'Other' },
      ],
    },
  },

  // ============================================================================
  // Structural Elements
  // ============================================================================
  {
    id: 'group',
    category: 'structural',
    type: 'group',
    label: 'Group',
    description: 'Section/group container',
    icon: 'Folder',
    defaultProps: {
      linkId: '',
      text: 'Section Title',
      type: 'group',
      item: [],
    },
  },
  {
    id: 'display',
    category: 'text-display',
    type: 'display',
    label: 'Display Text',
    description: 'Informational text block',
    icon: 'FileText',
    defaultProps: {
      linkId: '',
      text: 'Display text or instructions here',
      type: 'display',
    },
  },

  // ============================================================================
  // Media & Attachments
  // ============================================================================
  {
    id: 'attachment',
    category: 'media',
    type: 'attachment',
    label: 'File Upload',
    description: 'File/document attachment',
    icon: 'Paperclip',
    defaultProps: {
      linkId: '',
      text: 'Upload file',
      type: 'attachment',
      required: false,
    },
  },

  // ============================================================================
  // FHIR-Specific
  // ============================================================================
  {
    id: 'quantity',
    category: 'fhir-specific',
    type: 'quantity',
    label: 'Quantity',
    description: 'Quantity with unit',
    icon: 'Ruler',
    defaultProps: {
      linkId: '',
      text: 'Quantity field label',
      type: 'quantity',
      required: false,
    },
  },
  {
    id: 'reference',
    category: 'fhir-specific',
    type: 'reference',
    label: 'FHIR Reference',
    description: 'Reference to FHIR resource',
    icon: 'Database',
    defaultProps: {
      linkId: '',
      text: 'Select resource',
      type: 'reference',
      required: false,
    },
  },
];

/**
 * Get components by category
 */
export function getComponentsByCategory(category: FormComponentDefinition['category']) {
  return COMPONENT_LIBRARY.filter((comp) => comp.category === category);
}

/**
 * Get component definition by ID
 */
export function getComponentById(id: string) {
  return COMPONENT_LIBRARY.find((comp) => comp.id === id);
}

/**
 * Get component definition by type
 */
export function getComponentByType(type: QuestionnaireItem['type']) {
  return COMPONENT_LIBRARY.find((comp) => comp.type === type);
}

/**
 * Category labels for UI
 */
export const CATEGORY_LABELS: Record<FormComponentDefinition['category'], string> = {
  'input-fields': 'Input Fields',
  selection: 'Selection Controls',
  complex: 'Complex Layouts',
  'text-display': 'Text & Display',
  media: 'Media & Attachments',
  advanced: 'Advanced',
  structural: 'Structure',
  'fhir-specific': 'FHIR Specific',
};

/**
 * Generate unique linkId
 */
export function generateLinkId(prefix: string = 'item'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
