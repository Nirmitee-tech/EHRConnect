'use client';

import i18next from 'i18next';
import { initReactI18next, useTranslation as useTranslationOrg } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { getOptions, languages, cookieName } from './settings';
import { resources } from './resources';

const runsOnServerSide = typeof window === 'undefined';

function normalizeLocaleCookie() {
    if (typeof document === 'undefined') return;

    const cookieHeader = document.cookie || '';
    const cookieMatches = [...cookieHeader.matchAll(new RegExp(`(?:^|;\\s*)${cookieName}=([^;]*)`, 'g'))];
    if (cookieMatches.length === 0) return;

    const lastCookieValueRaw = cookieMatches[cookieMatches.length - 1][1];
    const lastCookieValue = lastCookieValueRaw ? decodeURIComponent(lastCookieValueRaw) : undefined;
    if (!lastCookieValue) return;

    const maxAge = 60 * 60 * 24 * 365;
    document.cookie = `${cookieName}=${encodeURIComponent(lastCookieValue)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;

    try {
        const pathname = window.location?.pathname || '/';
        const defaultPath = pathname.substring(0, pathname.lastIndexOf('/')) || '/';
        if (defaultPath !== '/') {
            document.cookie = `${cookieName}=; Path=${defaultPath}; Max-Age=0; SameSite=Lax`;
        }
    } catch {
        // ignore
    }
}

function getInitialHtmlLang(): string | undefined {
    if (typeof document === 'undefined') return undefined;
    const lang = document.documentElement?.getAttribute('lang') || '';
    if (!lang) return undefined;
    return lang.split('-')[0] || undefined;
}

normalizeLocaleCookie();
const initialHtmlLang = getInitialHtmlLang();

// Initialize i18next for client side
i18next
    .use(initReactI18next)
    .use(LanguageDetector)
    .init({
        ...getOptions(),
        // Keep client hydration consistent with SSR by preferring the <html lang> set by the server.
        lng: initialHtmlLang,
        resources,
        detection: {
            order: ['htmlTag', 'cookie', 'localStorage', 'navigator'],
            lookupCookie: cookieName,
            caches: ['cookie', 'localStorage'],
            cookieOptions: { path: '/', sameSite: 'lax' },
            convertDetectedLanguage: (lng: string) => lng.split('-')[0],
        },
        preload: runsOnServerSide ? languages : [],
    });

if (typeof document !== 'undefined') {
    i18next.on('languageChanged', (lng) => {
        const baseLng = lng.split('-')[0] || lng;
        document.documentElement.lang = baseLng;
        document.documentElement.dir = baseLng === 'ur' ? 'rtl' : 'ltr';
        const maxAge = 60 * 60 * 24 * 365;
        document.cookie = `${cookieName}=${encodeURIComponent(baseLng)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
    });
}

export function useTranslation(ns: string, options?: Parameters<typeof useTranslationOrg>[1]) {
    return useTranslationOrg(ns, options);
}
