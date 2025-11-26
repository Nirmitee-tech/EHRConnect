'use client';

import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { languages, cookieName } from '@/i18n/settings';
import Cookies from 'js-cookie';

interface LanguageOption {
    code: string;
    name: string;
    nativeName: string;
}

const languageOptions: LanguageOption[] = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
    { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
];

export function PublicLanguageSelector() {
    const [currentLang, setCurrentLang] = useState('en');
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Get current language from cookie
        const savedLang = Cookies.get(cookieName);
        if (savedLang && languages.includes(savedLang)) {
            setCurrentLang(savedLang);
        }
    }, []);

    const handleLanguageChange = (langCode: string) => {
        setCurrentLang(langCode);
        Cookies.set(cookieName, langCode, { expires: 365 });
        setIsOpen(false);

        // Reload page to apply language change
        window.location.reload();
    };

    const currentLanguage = languageOptions.find(lang => lang.code === currentLang) || languageOptions[0];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                aria-label="Select language"
            >
                <Globe className="w-4 h-4" />
                <span>{currentLanguage.nativeName}</span>
                <svg
                    className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown */}
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                        {languageOptions.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleLanguageChange(lang.code)}
                                className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors flex items-center justify-between ${currentLang === lang.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                                    }`}
                            >
                                <div>
                                    <div className="font-medium">{lang.nativeName}</div>
                                    <div className="text-xs text-gray-500">{lang.name}</div>
                                </div>
                                {currentLang === lang.code && (
                                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                )}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
