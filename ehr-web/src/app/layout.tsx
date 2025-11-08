import type { Metadata } from "next";
import "./globals.css";
import AuthSessionProvider from "@/providers/session-provider";
import { FacilityProvider } from "@/contexts/facility-context";
import { SpecialtyProvider } from "@/contexts/specialty-context";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { ToastProvider } from "@/hooks/useToast";

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
        <ToastProvider>
          <AuthSessionProvider>
            <SpecialtyProvider>
              <FacilityProvider>
                <AuthenticatedLayout>
                  {children}
                </AuthenticatedLayout>
              </FacilityProvider>
            </SpecialtyProvider>
          </AuthSessionProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
