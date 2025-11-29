import type { Metadata } from "next";
import "./globals.css";
import AuthSessionProvider from "@/providers/session-provider";
import { FacilityProvider } from "@/contexts/facility-context";
import { SpecialtyProvider } from "@/contexts/specialty-context";
import { CountryProvider } from "@/contexts/country-context";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { ToastProvider } from "@/hooks/useToast";
import { cookies } from "next/headers";
import { cookieName, fallbackLng, languages } from "@/i18n/settings";
// Phase 2: Initialize specialty modules (client-side)
import { SpecialtyInitializer } from "./specialty-init-client";
import { LocationProvider } from "@/contexts/location-context";

export const metadata: Metadata = {
  title: "EHR Connect - Healthcare Management",
  description: "FHIR-compliant Electronic Health Records system for healthcare practices",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const cookieLang = cookieStore.get(cookieName)?.value;
  const lang = cookieLang && languages.includes(cookieLang) ? cookieLang : fallbackLng;
  const dir = lang === "ur" ? "rtl" : "ltr";

  return (
    <html lang={lang} dir={dir}>
      <body className="antialiased bg-gray-50" suppressHydrationWarning>
        <SpecialtyInitializer />
        <ToastProvider>
          <AuthSessionProvider>
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
          </AuthSessionProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
