'use client';

/**
 * Client-Side Specialty Initialization
 * This component runs on the client to register specialty modules
 */

import { useEffect } from 'react';
import {
  specialtyRegistry,
  GeneralSpecialty,
  ObGynSpecialty,
  PediatricsSpecialty
} from '@/features/specialties';

export function SpecialtyInitializer() {
  useEffect(() => {
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
  }, []);

  return null; // This component doesn't render anything
}
