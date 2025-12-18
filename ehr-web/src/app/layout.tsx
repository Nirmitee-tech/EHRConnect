import type { Metadata } from "next";
import "./globals.css";
import AuthSessionProvider from "@/providers/session-provider";
import { FacilityProvider } from "@/contexts/facility-context";
import { SpecialtyProvider } from "@/contexts/specialty-context";
import { CountryProvider } from "@/contexts/country-context";
import { ThemeProvider } from "@/contexts/theme-context";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { ToastProvider } from "@/hooks/useToast";
import { headers } from "next/headers";
import { cookieName, fallbackLng, languages } from "@/i18n/settings";
// Phase 2: Initialize specialty modules (client-side)
import { SpecialtyInitializer } from "./specialty-init-client";
import { LocationProvider } from "@/contexts/location-context";

export const metadata: Metadata = {
  title: "EHR Connect - Healthcare Management",
  description: "FHIR-compliant Electronic Health Records system for healthcare practices",
  other: {
    google: "notranslate",
  },
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerList = await headers();
  const cookieLang = getLocaleFromCookieHeader(headerList.get('cookie'));
  const lang = cookieLang && languages.includes(cookieLang) ? cookieLang : fallbackLng;
  const dir = lang === "ur" ? "rtl" : "ltr";

  return (
    <html lang={lang} dir={dir} translate="no" className="notranslate">
      <body className="antialiased bg-gray-50" suppressHydrationWarning>
        <SpecialtyInitializer />
        <ToastProvider>
          <AuthSessionProvider>
            <ThemeProvider>
              <SpecialtyProvider>
                <CountryProvider>
                  <LocationProvider>
                    <FacilityProvider>
                      <AuthenticatedLayout>
                        {children}
                      </AuthenticatedLayout>
                    </FacilityProvider>
                  </LocationProvider>
                </CountryProvider>
              </SpecialtyProvider>
            </ThemeProvider>
          </AuthSessionProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
