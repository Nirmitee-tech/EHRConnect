import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthSessionProvider from "@/providers/session-provider";
import { FacilityProvider } from "@/contexts/facility-context";
import { HealthcareSidebar } from "@/components/layout/healthcare-sidebar";
import { HealthcareHeader } from "@/components/layout/healthcare-header";

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
            <div className="flex h-screen bg-gray-50">
              {/* Sidebar */}
              <HealthcareSidebar />
              
              {/* Main Content Area */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <HealthcareHeader />
                
                {/* Main Content */}
                <main className="flex-1 overflow-auto bg-gray-50 p-6">
                  {children}
                </main>
              </div>
            </div>
          </FacilityProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
