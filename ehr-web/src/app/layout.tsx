import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthSessionProvider from "@/providers/session-provider";
import { FacilityProvider } from "@/contexts/facility-context";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        <AuthSessionProvider>
          <FacilityProvider>
            <AuthenticatedLayout>
              {children}
            </AuthenticatedLayout>
          </FacilityProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
