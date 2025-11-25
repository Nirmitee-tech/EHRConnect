/**
 * HOW TO ADD LANGUAGE SELECTOR TO AUTH PAGES
 * 
 * Add this import at the top of your login/register page:
 */

import { PublicLanguageSelector } from '@/components/common/public-language-selector';

/**
 * Then add the component in your page layout.
 * 
 * OPTION 1: Top-right corner (recommended)
 * Add this in the header/logo section:
 */

// In patient-login/page.tsx or register/page.tsx:
<div className="p-8" >
    <div className="flex items-center justify-between" >
        <div className="flex items-center gap-2" >
            {/* Your logo */ }
            < div className = "w-10 h-10 bg-gradient-to-br from-[#0755D1] to-[#0540A3] rounded-xl flex items-center justify-center shadow-lg shadow-[#0755D1]/30" >
                <Heart className="w-6 h-6 text-white" />
                    </div>
                    </div>

{/* Add language selector here */ }
<PublicLanguageSelector />
    </div>
    </div>

    /**
     * OPTION 2: Above the form
     * Add this before your form heading:
     */

    < div className = "flex justify-end mb-4" >
        <PublicLanguageSelector />
        </div>

        /**
         * OPTION 3: In the footer
         * Add this in the footer section:
         */

        < div className = "p-8 flex items-center justify-between" >
            <p className="text-sm text-gray-500" >© { new Date().getFullYear() } Acme, All rights Reserved </p>
                < PublicLanguageSelector />
                </div>

/**
 * The language selector will:
 * - Show current language with native name (e.g., "Español", "हिंदी", "اردو")
 * - Open a dropdown with all available languages
 * - Save selection to cookies
 * - Reload page to apply the new language
 * 
 * No additional configuration needed!
 */
