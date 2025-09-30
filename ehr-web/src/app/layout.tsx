import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthSessionProvider from "@/providers/session-provider";
import { FacilityProvider } from "@/contexts/facility-context";
import { FacilitySwitcher } from "@/components/facility-switcher";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EHR Connect - Patient Management System",
  description: "FHIR-compliant Electronic Health Records system with multi-facility support",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthSessionProvider>
          <FacilityProvider>
            <div className="min-h-screen bg-background">
              {/* Header */}
              <header className="border-b">
                <div className="container mx-auto px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <h1 className="text-xl font-semibold">EHR Connect</h1>
                      <nav className="flex space-x-4">
                        <a href="/dashboard" className="text-sm hover:text-primary">Dashboard</a>
                        <a href="/patients" className="text-sm hover:text-primary">Patients</a>
                        <a href="/admin/facilities" className="text-sm hover:text-primary">Facilities</a>
                        <a href="/admin" className="text-sm hover:text-primary">Admin</a>
                      </nav>
                    </div>
                    <FacilitySwitcher />
                  </div>
                </div>
              </header>
              
              {/* Main Content */}
              <main className="flex-1">
                {children}
              </main>
            </div>
          </FacilityProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
