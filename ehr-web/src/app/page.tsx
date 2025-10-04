'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Activity, Users, FileText, Shield, ArrowRight } from 'lucide-react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (status === 'authenticated' && session) {
      // Redirect to existing dashboard
      router.push('/dashboard');
    }
  }, [status, session, router]);

  // Handle sign in with optional session cleanup
  const handleSignIn = async () => {
    // Only clear session if there's actually a session present
    if (session) {
      await signOut({ redirect: false });
      // Small delay to ensure cleanup completes before signing in
      setTimeout(() => {
        signIn('keycloak');
      }, 100);
    } else {
      // No session to clear, sign in directly
      signIn('keycloak');
    }
  };

  if (status === 'loading') {
    return null; // Let the AuthenticatedLayout handle loading state
  }

  if (status === 'authenticated') {
    return null; // Redirecting to dashboard
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4">
      <div className="max-w-4xl w-full text-center">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-2xl mb-6">
            <Activity className="h-10 w-10 text-white" />
          </div>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to EHR Connect
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A modern, FHIR-compliant Electronic Health Records system designed for healthcare professionals to deliver better patient care.
          </p>

          <div className="flex gap-4 justify-center">
            <a
              href="/register"
              className="inline-flex items-center px-8 py-4 bg-green-600 text-white text-lg font-semibold rounded-lg hover:bg-green-700 transition-all shadow-lg hover:shadow-xl"
            >
              Register Your Organization
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
            
            <button
              onClick={handleSignIn}
              className="inline-flex items-center px-8 py-4 bg-primary text-white text-lg font-semibold rounded-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl"
            >
              Sign In
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Patient Management
            </h3>
            <p className="text-sm text-gray-600">
              Comprehensive patient records and health history tracking
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              FHIR Compliant
            </h3>
            <p className="text-sm text-gray-600">
              Built on industry-standard FHIR specifications
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Secure Access
            </h3>
            <p className="text-sm text-gray-600">
              Role-based access control and encrypted data
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <Activity className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Real-time Updates
            </h3>
            <p className="text-sm text-gray-600">
              Live synchronization across all connected systems
            </p>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-16 p-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Healthcare Data Management Made Simple
          </h2>
          <p className="text-gray-700 max-w-2xl mx-auto">
            EHR Connect streamlines your healthcare workflows with modern tools for patient management, clinical documentation, and seamless FHIR integration. Sign in to access your personalized dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
