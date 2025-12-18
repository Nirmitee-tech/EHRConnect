import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next/initReactI18next';
import { getOptions } from './settings';
import { headers } from 'next/headers';
import { cookieName, fallbackLng, languages } from './settings';
import { resources } from './resources';

const initI18next = async (lng: string, ns: string) => {
    const i18nInstance = createInstance();
    await i18nInstance
        .use(initReactI18next)
        .init({ ...getOptions(lng, ns), resources });
    return i18nInstance;
};

function getLocaleFromCookieHeader(cookieHeader: string | null): string | undefined {
    if (!cookieHeader) return undefined;
    const matches = [...cookieHeader.matchAll(new RegExp(`(?:^|;\\s*)${cookieName}=([^;]*)`, 'g'))];
    if (matches.length === 0) return undefined;
    const raw = matches[matches.length - 1][1];
    const decoded = raw ? decodeURIComponent(raw) : '';
    const base = decoded.split('-')[0] || '';
    return base || undefined;
}

export async function useTranslation(ns: string, options: { keyPrefix?: string } = {}) {
    const headerList = await headers();
    const cookieLng = getLocaleFromCookieHeader(headerList.get('cookie'));
    const lng = cookieLng && languages.includes(cookieLng) ? cookieLng : fallbackLng;

    const i18nextInstance = await initI18next(lng, ns);
    return {
        t: i18nextInstance.getFixedT(lng, Array.isArray(ns) ? ns[0] : ns, options.keyPrefix),
        i18n: i18nextInstance,
    };
}
