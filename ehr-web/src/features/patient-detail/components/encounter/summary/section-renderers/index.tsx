import React from 'react';
import { SavedSection } from '@/app/patients/[id]/components/types';
import { SOAPRenderer } from './SOAPRenderer';
import { ReviewOfSystemsRenderer } from './ReviewOfSystemsRenderer';
import { VitalsRenderer } from './VitalsRenderer';
import { CarePlanRenderer } from './CarePlanRenderer';
import { ClinicalInstructionsRenderer } from './ClinicalInstructionsRenderer';
import { ClinicalNotesRenderer } from './ClinicalNotesRenderer';
import { GenericRenderer } from './GenericRenderer';
import { EyeExamRenderer } from './EyeExamRenderer';
import { FunctionalCognitiveRenderer } from './FunctionalCognitiveRenderer';
import { ObservationRenderer } from './ObservationRenderer';
import { SpeechDictationRenderer } from './SpeechDictationRenderer';
import { ProcedureOrderRenderer } from './ProcedureOrderRenderer';
import { LabResultsRenderer } from './LabResultsRenderer';
import { ImagingOrdersRenderer } from './ImagingOrdersRenderer';
import { QuestionnaireRenderer } from './QuestionnaireRenderer';
import { GenericAdministrativeRenderer } from './GenericAdministrativeRenderer';

/**
 * SectionRenderer - Factory component that renders the appropriate renderer
 * based on the section type
 */
export function SectionRenderer({ section }: { section: SavedSection }) {
  switch (section.type) {
    case 'soap':
      return <SOAPRenderer data={section.data} />;

    case 'review-of-systems':
      return <ReviewOfSystemsRenderer data={section.data} />;

    case 'vitals':
      return <VitalsRenderer data={section.data} />;

    case 'care-plan':
      return <CarePlanRenderer data={section.data} />;

    case 'clinical-instructions':
      return <ClinicalInstructionsRenderer data={section.data} />;

    case 'clinical-notes':
      return <ClinicalNotesRenderer data={section.data} />;

    case 'eye-exam':
      return <EyeExamRenderer data={section.data} />;

    case 'functional-and-cognitive-status':
      return <FunctionalCognitiveRenderer data={section.data} />;

    case 'observation':
      return <ObservationRenderer data={section.data} />;

    case 'speech-dictation':
      return <SpeechDictationRenderer data={section.data} />;

    case 'procedure-order':
      return <ProcedureOrderRenderer data={section.data} />;

    case 'lab-results':
      return <LabResultsRenderer data={section.data} />;

    case 'imaging-orders':
      return <ImagingOrdersRenderer data={section.data} />;

    case 'new-questionnaire':
    case 'questionnaire-responses':
      return <QuestionnaireRenderer data={section.data} />;

    // Administrative sections using generic renderer
    case 'forms':
    case 'track-anything':
    case 'patient-reminders':
    case 'clinical-reminders':
    case 'amendments':
    case 'letters':
    case 'review-of-systems-checks':
      return <GenericAdministrativeRenderer data={section.data} />;

    default:
      return <GenericRenderer data={section.data} />;
  }
}

// Export individual renderers for direct use
export {
  SOAPRenderer,
  ReviewOfSystemsRenderer,
  VitalsRenderer,
  CarePlanRenderer,
  ClinicalInstructionsRenderer,
  ClinicalNotesRenderer,
  GenericRenderer,
  EyeExamRenderer,
  FunctionalCognitiveRenderer,
  ObservationRenderer,
  SpeechDictationRenderer,
  ProcedureOrderRenderer,
  LabResultsRenderer,
  ImagingOrdersRenderer,
  QuestionnaireRenderer,
  GenericAdministrativeRenderer
};
