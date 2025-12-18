/**
 * HOW TO ADD LANGUAGE SELECTOR TO AUTH PAGES
 *
 * Add this import at the top of your login/register page:
 *
 * ```tsx
 * import { PublicLanguageSelector } from '@/components/common/public-language-selector';
 * ```
 *
 * Then add the component in your page layout.
 *
 * OPTION 1: Top-right corner (recommended)
 *
 * ```tsx
 * <div className="flex items-center justify-between">
 *   <Logo />
 *   <PublicLanguageSelector />
 * </div>
 * ```
 *
 * OPTION 2: Above the form
 *
 * ```tsx
 * <div className="flex justify-end mb-4">
 *   <PublicLanguageSelector />
 * </div>
 * ```
 *
 * OPTION 3: In the footer
 *
 * ```tsx
 * <footer className="flex items-center justify-between">
 *   <span>© {new Date().getFullYear()} Acme</span>
 *   <PublicLanguageSelector />
 * </footer>
 * ```
 *
 * The language selector will:
 * - Show current language with native name (e.g., "Español", "हिंदी", "اردو")
 * - Open a dropdown with all available languages
 * - Save selection to cookies
 * - Reload page to apply the new language
 */

export {};
