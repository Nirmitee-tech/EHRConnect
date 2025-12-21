/**
 * Specialty Initialization
 * Registers all specialty modules with the registry
 *
 * Import this file in your root layout to initialize specialties
 */

import { specialtyRegistry, GeneralSpecialty, ObGynSpecialty, PediatricsSpecialty } from '@/features/specialties';

/**
 * Initialize all specialty modules
 * Call this once when the app starts
 */
export function initializeSpecialties() {
  console.log('🚀 Initializing specialty modules...');

  // Register General specialty (Primary Care)
  specialtyRegistry.register(GeneralSpecialty);

  // Register OB/GYN specialty
  specialtyRegistry.register(ObGynSpecialty);

  // Register Pediatrics specialty
  specialtyRegistry.register(PediatricsSpecialty);

  // Register future specialties here:
  // specialtyRegistry.register(OrthopedicsSpecialty);
  // specialtyRegistry.register(WoundCareSpecialty);

  // Log stats
  const stats = specialtyRegistry.getStats();
  console.log(`✅ Registered ${stats.totalModules} specialty module(s):`);
  stats.modules.forEach(m => {
    console.log(`   - ${m.name} (${m.slug}): ${m.components} components`);
  });
}

// Auto-initialize on import (can be disabled if manual control needed)
if (typeof window !== 'undefined') {
  initializeSpecialties();
}
