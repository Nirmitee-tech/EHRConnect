'use client';

import i18next from 'i18next';
import { initReactI18next, useTranslation as useTranslationOrg } from 'react-i18next';
import { fallbackLng, getOptions, languages, cookieName } from './settings';
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

function getInitialCookieLang(): string | undefined {
    if (typeof document === 'undefined') return undefined;
    const cookieHeader = document.cookie || '';
    const cookieMatches = [...cookieHeader.matchAll(new RegExp(`(?:^|;\\s*)${cookieName}=([^;]*)`, 'g'))];
    if (cookieMatches.length === 0) return undefined;
    const lastCookieValueRaw = cookieMatches[cookieMatches.length - 1][1];
    const lastCookieValue = lastCookieValueRaw ? decodeURIComponent(lastCookieValueRaw) : '';
    const base = lastCookieValue.split('-')[0] || '';
    return base || undefined;
}

function getInitialNavigatorLang(): string | undefined {
    if (typeof navigator === 'undefined') return undefined;
    const nav = navigator.language || '';
    const base = nav.split('-')[0] || '';
    return base || undefined;
}

normalizeLocaleCookie();
const initialHtmlLang = getInitialHtmlLang();
const initialCookieLang = getInitialCookieLang();
const initialNavigatorLang = getInitialNavigatorLang();
const initialLangCandidate = initialHtmlLang || initialCookieLang || initialNavigatorLang || fallbackLng;
const initialLang = languages.includes(initialLangCandidate) ? initialLangCandidate : fallbackLng;

// Initialize i18next for client side
i18next
    .use(initReactI18next)
    .init({
        ...getOptions(),
        // Keep client hydration consistent with SSR by preferring the <html lang> set by the server.
        lng: initialLang,
        resources,
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
