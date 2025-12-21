/**
 * Specialties Feature Exports
 * Main export point for the specialty system
 */

// Registry
export { specialtyRegistry, registerSpecialtyModules } from './registry';
export type { SpecialtyRegistry } from './registry';

// Shared functionality
export * from './shared';

// Individual specialty modules
export { GeneralSpecialty } from './general';
export { ObGynSpecialty } from './ob-gyn';
export { PediatricsSpecialty } from './pediatrics';
export { MentalHealthSpecialty } from './mental-health';
export { WoundCareSpecialty } from './wound-care';
export { DermatologySpecialty } from './dermatology';
export { OrthopedicsSpecialty } from './orthopedics';
export { CardiologySpecialty } from './cardiology';
