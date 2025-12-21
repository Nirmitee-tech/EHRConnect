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
  PediatricsSpecialty,
  OrthopedicsSpecialty,
  DermatologySpecialty,
  MentalHealthSpecialty,
  CardiologySpecialty,
  WoundCareSpecialty,
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

    // Register Orthopedics specialty
    specialtyRegistry.register(OrthopedicsSpecialty);

    // Register Dermatology specialty
    specialtyRegistry.register(DermatologySpecialty);

    // Register Mental Health specialty
    specialtyRegistry.register(MentalHealthSpecialty);

    // Register Cardiology specialty
    specialtyRegistry.register(CardiologySpecialty);

    // Register Wound Care specialty
    specialtyRegistry.register(WoundCareSpecialty);

    // Log stats
    const stats = specialtyRegistry.getStats();
    console.log(`✅ Registered ${stats.totalModules} specialty module(s):`);
    stats.modules.forEach(m => {
      console.log(`   - ${m.name} (${m.slug}): ${m.components} components`);
    });
  }, []);

  return null; // This component doesn't render anything
}
