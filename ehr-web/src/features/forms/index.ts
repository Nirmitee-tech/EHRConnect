/**
 * Forms Module - Public Exports
 * Main entry point for the forms feature
 */

// Components
export { CompactFormRenderer } from './components/form-renderer/compact-form-renderer';
export { PatientFormsList } from './components/form-responses/patient-forms-list';

// Types
export type {
  FHIRQuestionnaire,
  QuestionnaireItem,
  FHIRQuestionnaireResponse,
  FormTemplate,
  FormResponse,
  FormTheme,
  FormComponentDefinition,
} from '@/types/forms';

// Services
export { formsService } from '@/services/forms.service';

// Utils
export * from './utils/component-library';
