/**
 * Code Splitting Configuration
 * 
 * This file provides utilities and examples for implementing code splitting
 * to reduce initial bundle size and improve page load performance.
 * 
 * Usage:
 *   import { lazyLoad } from '@/lib/code-splitting';
 *   
 *   const BillingModule = lazyLoad(() => import('@/features/billing'));
 *   const InventoryModule = lazyLoad(() => import('@/features/inventory'));
 */

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

/**
 * Loading component shown while lazy-loaded components are loading
 */
export const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center space-y-4">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="text-sm text-gray-600">Loading module...</p>
    </div>
  </div>
);

/**
 * Error component shown when lazy-loaded components fail to load
 */
export const ErrorFallback = ({ error, reset }: { error: Error; reset?: () => void }) => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center space-y-4 max-w-md">
      <div className="text-red-600">
        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900">Failed to load module</h3>
      <p className="text-sm text-gray-600">{error.message}</p>
      {reset && (
        <button
          onClick={reset}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Retry
        </button>
      )}
    </div>
  </div>
);

/**
 * Helper to lazy load components with custom loading states
 * 
 * @example
 * const HeavyComponent = lazyLoad(() => import('./HeavyComponent'));
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options?: {
    loading?: ComponentType;
    ssr?: boolean;
  }
) {
  return dynamic(importFunc, {
    loading: options?.loading || LoadingFallback,
    ssr: options?.ssr ?? false, // Disable SSR by default for lazy-loaded components
  });
}

/**
 * Code splitting presets for common large modules
 * 
 * Import these in your pages instead of direct imports to enable code splitting:
 * 
 * @example
 * // Instead of: import BillingPage from '@/features/billing/BillingPage';
 * // Use: import { BillingModule } from '@/lib/code-splitting';
 */

// Billing Module (typically large with charts and forms)
export const BillingModule = lazyLoad(
  () => import('@/app/billing/page'),
  { ssr: false }
);

// Inventory Module (includes complex tables)
export const InventoryModule = lazyLoad(
  () => import('@/app/inventory/page'),
  { ssr: false }
);

// Forms Builder (includes Monaco editor and complex UI)
export const FormsBuilder = lazyLoad(
  () => import('@/app/forms/builder/[[...id]]/page'),
  { ssr: false }
);

// Meeting Module (includes 100ms video SDK)
export const MeetingModule = lazyLoad(
  () => import('@/app/meeting/[code]/page'),
  { ssr: false }
);

// Charts and visualization components
export const ChartsModule = lazyLoad(
  () => import('@/components/charts'),
  { ssr: false }
);

/**
 * Route-based code splitting configuration
 * 
 * Use this in your app layout or routing configuration to split by route
 */
export const routeBasedSplitting = {
  '/billing': () => import('@/features/billing'),
  '/inventory': () => import('@/features/inventory'),
  '/forms/builder': () => import('@/features/forms/builder'),
  '/meeting': () => import('@/features/meeting'),
  '/reports': () => import('@/features/reports'),
  '/admin': () => import('@/features/admin'),
};

/**
 * Prefetch a module for faster subsequent loads
 * 
 * @example
 * // Prefetch when user hovers over a link
 * <Link 
 *   href="/billing" 
 *   onMouseEnter={() => prefetchModule(() => import('@/features/billing'))}
 * >
 *   Go to Billing
 * </Link>
 */
export function prefetchModule(importFunc: () => Promise<any>) {
  if (typeof window !== 'undefined') {
    // Use requestIdleCallback if available, otherwise setTimeout
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => importFunc());
    } else {
      setTimeout(() => importFunc(), 1);
    }
  }
}

/**
 * Example: Component-level code splitting with React.lazy
 * 
 * Use this pattern for heavy components that aren't always visible
 */
export const createLazyComponent = <P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>
) => {
  const LazyComponent = lazyLoad(importFunc);
  
  return (props: P) => (
    <LazyComponent {...props} />
  );
};

/**
 * Best practices for code splitting:
 * 
 * 1. Split by route - Each page should be its own chunk
 * 2. Split heavy features - Billing, reports, forms builder
 * 3. Split third-party libraries - Video SDK, chart libraries
 * 4. Split by user interaction - Load modals/dialogs only when opened
 * 5. Prefetch on hover/focus - Improve perceived performance
 * 
 * Measure impact:
 * - Use webpack-bundle-analyzer to visualize bundle size
 * - Monitor Lighthouse performance scores
 * - Track First Contentful Paint (FCP) and Time to Interactive (TTI)
 */

export default {
  lazyLoad,
  prefetchModule,
  createLazyComponent,
  LoadingFallback,
  ErrorFallback,
};
