import type { Metadata } from "next";
import "./globals.css";
import AuthSessionProvider from "@/providers/session-provider";
import { FacilityProvider } from "@/contexts/facility-context";
import { SpecialtyProvider } from "@/contexts/specialty-context";
import { CountryProvider } from "@/contexts/country-context";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { ToastProvider } from "@/hooks/useToast";
// Phase 2: Initialize specialty modules (client-side)
import { SpecialtyInitializer } from "./specialty-init-client";

export const metadata: Metadata = {
  title: "EHR Connect - Healthcare Management",
  description: "FHIR-compliant Electronic Health Records system for healthcare practices",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50" suppressHydrationWarning>
        <SpecialtyInitializer />
        <ToastProvider>
          <AuthSessionProvider>
            <SpecialtyProvider>
              <CountryProvider>
                <FacilityProvider>
                  <AuthenticatedLayout>
                    {children}
                  </AuthenticatedLayout>
                </FacilityProvider>
              </CountryProvider>
            </SpecialtyProvider>
          </AuthSessionProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
