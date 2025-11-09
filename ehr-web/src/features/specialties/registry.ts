/**
 * Specialty Registry
 * Central registry for all specialty modules
 * Provides dynamic component loading and specialty management
 */

import { SpecialtyModule } from './shared/types';

/**
 * Specialty Registry Class
 * Manages specialty modules and provides lookup functionality
 */
class SpecialtyRegistry {
  private modules: Map<string, SpecialtyModule>;

  constructor() {
    this.modules = new Map();
  }

  /**
   * Register a specialty module
   */
  register(module: SpecialtyModule): void {
    if (this.modules.has(module.slug)) {
      console.warn(`Specialty module "${module.slug}" is already registered. Overwriting.`);
    }

    this.modules.set(module.slug, module);
    console.log(`✅ Registered specialty module: ${module.name} (${module.slug})`);
  }

  /**
   * Get a specialty module by slug
   */
  get(slug: string): SpecialtyModule | undefined {
    return this.modules.get(slug);
  }

  /**
   * Get all registered modules
   */
  getAll(): SpecialtyModule[] {
    return Array.from(this.modules.values());
  }

  /**
   * Check if a module is registered
   */
  has(slug: string): boolean {
    return this.modules.has(slug);
  }

  /**
   * Get a component from a specialty module
   */
  getComponent(slug: string, componentName: string): SpecialtyModule['components'] {
    const module = this.modules.get(slug);
    if (!module?.components) {
      return undefined;
    }

    return module.components[componentName];
  }

  /**
   * Get all component names for a specialty
   */
  getComponentNames(slug: string): string[] {
    const module = this.modules.get(slug);
    if (!module?.components) {
      return [];
    }

    return Object.keys(module.components);
  }

  /**
   * Unregister a module (useful for hot-reloading in development)
   */
  unregister(slug: string): boolean {
    return this.modules.delete(slug);
  }

  /**
   * Clear all modules
   */
  clear(): void {
    this.modules.clear();
  }

  /**
   * Get registry stats
   */
  getStats(): {
    totalModules: number;
    modules: Array<{ slug: string; name: string; components: number }>;
  } {
    const modules = Array.from(this.modules.values()).map(module => ({
      slug: module.slug,
      name: module.name,
      components: module.components ? Object.keys(module.components).length : 0,
    }));

    return {
      totalModules: this.modules.size,
      modules,
    };
  }
}

/**
 * Global specialty registry instance
 * Use this to register and access specialty modules throughout the app
 */
export const specialtyRegistry = new SpecialtyRegistry();

/**
 * Utility function to register multiple modules at once
 */
export function registerSpecialtyModules(modules: SpecialtyModule[]): void {
  for (const module of modules) {
    specialtyRegistry.register(module);
  }

  console.log(`✅ Registered ${modules.length} specialty module(s)`);
}

// Export the registry class for type definitions
export type { SpecialtyRegistry };
