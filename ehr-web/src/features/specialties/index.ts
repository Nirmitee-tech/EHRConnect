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
export { ObGynSpecialty } from './ob-gyn';

// Future specialty modules:
// export { OrthopedicsSpecialty } from './orthopedics';
// export { WoundCareSpecialty } from './wound-care';
