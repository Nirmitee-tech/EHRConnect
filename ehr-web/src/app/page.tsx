'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Activity, Users, FileText, Shield, ArrowRight, Check,
  Building2, Sparkles, Heart, Calendar, Lock, Zap,
  BarChart3, Clock, Globe, Star, TrendingUp, MessageSquare,
  Stethoscope, Brain, Bed, ChevronRight, Play, CheckCircle,
  Workflow, UserPlus, ClipboardList, Pill, TestTube, DollarSign,
  Bell, Search, Filter, Plus, LayoutDashboard, Smartphone,
  CheckCircle2, Award, Headphones, Rocket
} from 'lucide-react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  const handleSignIn = async () => {
    if (session) {
      await signOut({ redirect: false });
      setTimeout(() => {
        signIn();
      }, 100);
    } else {
      signIn();
    }
  };

  if (status === 'loading' || !mounted) {
    return null;
  }

  if (status === 'authenticated') {
    return null;
  }

  return (
    <div className="relative overflow-hidden bg-white">
      {/* Hero Section - Clean & Professional */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50/30 to-white pt-20 pb-24">
        {/* Impressive grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f620_1px,transparent_1px),linear-gradient(to_bottom,#3b82f620_1px,transparent_1px)] bg-[size:3rem_3rem]"></div>

        {/* Diagonal lines pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,#dbeafe_1px,transparent_1px),linear-gradient(-45deg,#dbeafe_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-40"></div>

        {/* Large decorative circles */}
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-gradient-to-tr from-purple-200 to-blue-200 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-br from-indigo-100 to-transparent rounded-full blur-3xl opacity-10"></div>

        {/* Decorative dots pattern */}
        <div className="absolute top-40 right-20 w-2 h-2 bg-blue-400 rounded-full"></div>
        <div className="absolute top-60 right-40 w-2 h-2 bg-indigo-400 rounded-full"></div>
        <div className="absolute top-80 right-60 w-2 h-2 bg-purple-400 rounded-full"></div>
        <div className="absolute bottom-40 left-20 w-2 h-2 bg-blue-400 rounded-full"></div>
        <div className="absolute bottom-60 left-40 w-2 h-2 bg-indigo-400 rounded-full"></div>

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            {/* Enhanced Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-2.5 shadow-lg shadow-blue-200/50 backdrop-blur-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <Workflow className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-bold text-blue-900">
                FHIR-Native • Easy to Use • Built for Integration
              </span>
              <Globe className="w-4 h-4 text-indigo-600" />
            </div>

            {/* Enhanced Headline */}
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
              Modern EHR Built on<br />
              <span className="relative inline-block">
                <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 blur-lg opacity-20"></span>
                <span className="relative bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  FHIR Standards
                </span>
              </span>
            </h1>

            {/* Clear Subheading */}
            <p className="mb-10 text-lg leading-relaxed text-gray-600 sm:text-xl max-w-3xl mx-auto">
              FHIR-native EHR platform designed for seamless integration and ease of use.
              Connect with any system, access data anywhere, deploy in minutes—not months.
            </p>

            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <a
                href="/register"
                className="group relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-10 py-4 text-base font-bold text-white shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-600/40 hover:scale-105 transition-all"
              >
                <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                <span className="relative">Start Free Trial</span>
                <ArrowRight className="relative w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>

              <button
                onClick={handleSignIn}
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gray-300 bg-white px-10 py-4 text-base font-bold text-gray-900 shadow-lg hover:border-blue-300 hover:bg-blue-50 hover:scale-105 transition-all"
              >
                Sign In
              </button>
            </div>

            {/* Enhanced Trust Badges */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border-2 border-blue-200 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-bold text-blue-900">FHIR R4 Native</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full border-2 border-purple-200 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-bold text-purple-900">API-First Design</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full border-2 border-green-200 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-sm font-bold text-green-900">Deploy in Minutes</span>
              </div>
            </div>
          </div>

          {/* Clean Dashboard Preview */}
          <div className="mt-16">
            <div className="relative mx-auto max-w-6xl">
              {/* Simple Browser Chrome */}
              <div className="overflow-hidden rounded-t-lg border border-gray-200 bg-gray-100 px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-gray-300"></div>
                    <div className="h-3 w-3 rounded-full bg-gray-300"></div>
                    <div className="h-3 w-3 rounded-full bg-gray-300"></div>
                  </div>
                  <div className="ml-4 flex-1 rounded bg-white px-3 py-1.5 text-sm text-gray-600">
                    ehrconnect.app/dashboard
                  </div>
                </div>
              </div>

              {/* Clean Dashboard Content */}
              <div className="overflow-hidden rounded-b-lg border-x-2 border-b-2 border-gray-200 bg-white shadow-xl">
                <div className="aspect-[16/9] bg-gradient-to-br from-gray-50 to-blue-50/30 p-8">
                  <div className="grid h-full grid-cols-4 gap-4">
                    {/* Clean Stat Cards */}
                    <div className="rounded-xl border-2 border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                      <Users className="mb-3 h-8 w-8 text-blue-600" />
                      <div className="text-3xl font-bold text-gray-900 mb-1">2,847</div>
                      <div className="text-sm text-gray-600">Total Patients</div>
                    </div>

                    <div className="rounded-xl border-2 border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                      <Calendar className="mb-3 h-8 w-8 text-purple-600" />
                      <div className="text-3xl font-bold text-gray-900 mb-1">124</div>
                      <div className="text-sm text-gray-600">Appointments Today</div>
                    </div>

                    <div className="rounded-xl border-2 border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                      <Bed className="mb-3 h-8 w-8 text-green-600" />
                      <div className="text-3xl font-bold text-gray-900 mb-1">18/50</div>
                      <div className="text-sm text-gray-600">Beds Occupied</div>
                    </div>

                    <div className="rounded-xl border-2 border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                      <DollarSign className="mb-3 h-8 w-8 text-orange-600" />
                      <div className="text-3xl font-bold text-gray-900 mb-1">$48.5K</div>
                      <div className="text-sm text-gray-600">Revenue MTD</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Clean */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 py-16">
        {/* Impressive pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:2.5rem_2.5rem]"></div>

        {/* Hexagon-like pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#ffffff05_1px,transparent_1px)] bg-[size:2rem_2rem]"></div>

        {/* Decorative shapes */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl"></div>

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">500+</div>
              <div className="text-sm text-blue-100">Healthcare Facilities</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">50,000+</div>
              <div className="text-sm text-blue-100">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">1M+</div>
              <div className="text-sm text-blue-100">Patient Records</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">99.9%</div>
              <div className="text-sm text-blue-100">Uptime SLA</div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features - Clean Cards */}
      <section className="relative py-20 bg-gradient-to-b from-white via-gray-50 to-white">
        {/* Impressive geometric pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f3f4f610_1px,transparent_1px),linear-gradient(to_bottom,#f3f4f610_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

        {/* Diagonal stripes */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_2rem,#dbeafe_2rem,#dbeafe_2.1rem)]"></div>
        </div>

        {/* Large decorative shapes */}
        <div className="absolute top-20 -right-20 w-[400px] h-[400px] bg-gradient-to-bl from-blue-100 to-transparent rounded-full blur-3xl opacity-40"></div>
        <div className="absolute bottom-20 -left-20 w-[500px] h-[500px] bg-gradient-to-tr from-purple-100 to-transparent rounded-full blur-3xl opacity-40"></div>
        <div className="absolute top-1/2 right-1/4 w-[300px] h-[300px] bg-gradient-to-br from-indigo-100 to-transparent rounded-full blur-3xl opacity-30"></div>

        {/* Decorative circles */}
        <div className="absolute top-60 left-20 w-3 h-3 bg-blue-400 rounded-full"></div>
        <div className="absolute top-80 left-40 w-2 h-2 bg-purple-400 rounded-full"></div>
        <div className="absolute bottom-60 right-20 w-3 h-3 bg-indigo-400 rounded-full"></div>
        <div className="absolute bottom-80 right-40 w-2 h-2 bg-blue-400 rounded-full"></div>

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Built on FHIR for Seamless Integration
            </h2>
            <p className="text-lg text-gray-600">
              Every resource, API, and integration follows FHIR R4 standards. Connect with any system effortlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Clean Feature Cards */}
            <div className="group rounded-xl border-2 border-gray-200 bg-white p-8 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Workflow className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">FHIR-Native Core</h3>
              <p className="text-gray-600 leading-relaxed">
                Every resource is native FHIR R4. No mapping layers or transformations—pure FHIR from the ground up.
              </p>
            </div>

            <div className="group rounded-xl border-2 border-gray-200 bg-white p-8 shadow-sm hover:shadow-lg hover:border-purple-300 transition-all">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Globe className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">RESTful FHIR API</h3>
              <p className="text-gray-600 leading-relaxed">
                Complete FHIR R4 REST API with standard endpoints. Integrate with labs, hospitals, and HIEs seamlessly.
              </p>
            </div>

            <div className="group rounded-xl border-2 border-gray-200 bg-white p-8 shadow-sm hover:shadow-lg hover:border-green-300 transition-all">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Simple Setup</h3>
              <p className="text-gray-600 leading-relaxed">
                Deploy in minutes with Docker. Pre-configured workflows and automated onboarding included.
              </p>
            </div>

            <div className="group rounded-xl border-2 border-gray-200 bg-white p-8 shadow-sm hover:shadow-lg hover:border-orange-300 transition-all">
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Intuitive Interface</h3>
              <p className="text-gray-600 leading-relaxed">
                Clean UI designed for clinicians. Zero training required with keyboard shortcuts and smart search.
              </p>
            </div>

            <div className="group rounded-xl border-2 border-gray-200 bg-white p-8 shadow-sm hover:shadow-lg hover:border-indigo-300 transition-all">
              <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Security & Compliance</h3>
              <p className="text-gray-600 leading-relaxed">
                HIPAA-compliant with encryption, role-based access control, and comprehensive audit logs.
              </p>
            </div>

            <div className="group rounded-xl border-2 border-gray-200 bg-white p-8 shadow-sm hover:shadow-lg hover:border-gray-400 transition-all">
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6 text-gray-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Analytics & Reporting</h3>
              <p className="text-gray-600 leading-relaxed">
                Comprehensive dashboards with patient metrics, financial reports, and customizable analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases - Clean */}
      <section className="relative py-20 bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50/20">
        {/* Complex grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f615_1px,transparent_1px),linear-gradient(to_bottom,#3b82f615_1px,transparent_1px)] bg-[size:3rem_3rem]"></div>

        {/* Dot pattern overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle,#6366f110_1px,transparent_1px)] bg-[size:1.5rem_1.5rem]"></div>

        {/* Wavy pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <pattern id="wave" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M0 50 Q 25 25, 50 50 T 100 50" stroke="#3b82f6" fill="none" strokeWidth="0.5"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#wave)"/>
          </svg>
        </div>

        {/* Large gradient orbs */}
        <div className="absolute -top-40 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-blue-200 via-indigo-200 to-transparent rounded-full blur-3xl opacity-30"></div>
        <div className="absolute -bottom-40 left-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-purple-200 via-indigo-200 to-transparent rounded-full blur-3xl opacity-30"></div>

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              For Every Healthcare Organization
            </h2>
            <p className="text-lg text-gray-600">
              From small clinics to large hospital networks, EHR Connect adapts to your workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Building2, title: 'Hospitals', desc: 'Complete inpatient management with bed tracking, ward management, and surgical scheduling.' },
              { icon: Stethoscope, title: 'Clinics & Private Practices', desc: 'Streamlined outpatient care with appointment scheduling and patient engagement tools.' },
              { icon: Activity, title: 'Diagnostic Centers', desc: 'Imaging and laboratory services with PACS integration and automated reporting.' },
              { icon: Heart, title: 'Pharmacies', desc: 'Prescription management, e-prescribing integration, and inventory control.' },
              { icon: Users, title: 'Nursing Homes', desc: 'Long-term care management with medication records and care planning.' },
              { icon: Brain, title: 'Medical Laboratories', desc: 'Lab information system with specimen tracking and quality control.' },
            ].map((item, index) => (
              <div
                key={index}
                className="group rounded-xl border-2 border-gray-200 bg-white p-6 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <item.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section - Clean */}
      <section className="relative py-20 bg-gradient-to-br from-white via-gray-50 to-green-50/20">
        {/* Security-themed pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98120_1px,transparent_1px),linear-gradient(to_bottom,#10b98120_1px,transparent_1px)] bg-[size:3rem_3rem]"></div>

        {/* Lock pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <pattern id="locks" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1" fill="#10b981"/>
              <circle cx="50" cy="50" r="1" fill="#10b981"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#locks)"/>
          </svg>
        </div>

        {/* Gradient orbs */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-green-100 to-transparent rounded-full blur-3xl opacity-40"></div>
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-tl from-emerald-100 to-transparent rounded-full blur-3xl opacity-40"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-gradient-to-br from-teal-100 to-transparent rounded-full blur-3xl opacity-30"></div>

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Enterprise-Grade Security & Compliance
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Patient data security is our highest priority. EHR Connect meets healthcare compliance requirements with enterprise-grade security.
              </p>
              <div className="space-y-4">
                {[
                  { title: 'HIPAA Compliance', desc: 'Full compliance with HIPAA Privacy and Security Rules, including BAA coverage.' },
                  { title: 'End-to-End Encryption', desc: '256-bit AES encryption for data at rest and TLS 1.3 for data in transit.' },
                  { title: 'Role-Based Access Control', desc: 'Granular permissions with audit trails for every patient record access.' },
                  { title: 'SOC 2 Type II Certified', desc: 'Third-party audited security controls and annual penetration testing.' }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="group rounded-xl border-2 border-gray-200 bg-white p-6 text-center hover:border-blue-300 hover:shadow-md transition-all">
                <Shield className="w-10 h-10 text-blue-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <div className="text-2xl font-bold text-gray-900 mb-1">256-bit</div>
                <div className="text-sm text-gray-600">AES Encryption</div>
              </div>
              <div className="group rounded-xl border-2 border-gray-200 bg-white p-6 text-center hover:border-blue-300 hover:shadow-md transition-all">
                <Lock className="w-10 h-10 text-blue-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <div className="text-2xl font-bold text-gray-900 mb-1">SOC 2</div>
                <div className="text-sm text-gray-600">Type II Certified</div>
              </div>
              <div className="group rounded-xl border-2 border-gray-200 bg-white p-6 text-center hover:border-blue-300 hover:shadow-md transition-all">
                <CheckCircle2 className="w-10 h-10 text-blue-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <div className="text-2xl font-bold text-gray-900 mb-1">HIPAA</div>
                <div className="text-sm text-gray-600">Fully Compliant</div>
              </div>
              <div className="group rounded-xl border-2 border-gray-200 bg-white p-6 text-center hover:border-blue-300 hover:shadow-md transition-all">
                <Activity className="w-10 h-10 text-blue-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <div className="text-2xl font-bold text-gray-900 mb-1">24/7</div>
                <div className="text-sm text-gray-600">Security Monitoring</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose - Clean Blue Background */}
      <section className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 py-20">
        {/* Impressive grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:3rem_3rem]"></div>

        {/* Diagonal pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,#ffffff08_1px,transparent_1px),linear-gradient(-45deg,#ffffff08_1px,transparent_1px)] bg-[size:2rem_2rem]"></div>

        {/* Circuit board style pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <pattern id="circuit" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <line x1="0" y1="50" x2="50" y2="50" stroke="white" strokeWidth="1"/>
              <line x1="50" y1="0" x2="50" y2="100" stroke="white" strokeWidth="1"/>
              <circle cx="50" cy="50" r="3" fill="white"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#circuit)"/>
          </svg>
        </div>

        {/* Large gradient orbs */}
        <div className="absolute -top-40 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-blue-400/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 left-0 w-[700px] h-[700px] bg-gradient-to-tr from-indigo-400/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-purple-400/15 to-transparent rounded-full blur-3xl"></div>

        {/* Floating decorative elements */}
        <div className="absolute top-20 left-40 w-2 h-2 bg-white/40 rounded-full"></div>
        <div className="absolute top-40 right-60 w-3 h-3 bg-white/30 rounded-full"></div>
        <div className="absolute bottom-40 left-60 w-2 h-2 bg-white/40 rounded-full"></div>
        <div className="absolute bottom-20 right-40 w-3 h-3 bg-white/30 rounded-full"></div>

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Integration-First, FHIR-Native Approach
            </h2>
            <p className="text-lg text-blue-100">
              Built on open standards with interoperability at the core. Connect with any system, deploy anywhere.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Workflow, title: 'FHIR R4 Native', desc: 'Every resource and API is built on FHIR R4 standards from the ground up. No proprietary formats, no vendor lock-in.' },
              { icon: Globe, title: 'API-First Architecture', desc: 'Complete RESTful FHIR API with OAuth 2.0, SMART on FHIR, and bulk data operations for seamless integration.' },
              { icon: Zap, title: 'Fast Deployment', desc: 'Deploy in minutes with pre-configured Docker containers and automated setup. Start seeing patients today.' }
            ].map((item, i) => (
              <div key={i} className="group rounded-xl bg-white/10 backdrop-blur-sm p-8 border-2 border-white/20 hover:bg-white/20 hover:border-white/40 transition-all">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <item.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-blue-100 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Clean */}
      <section className="relative py-20 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Multi-layered patterns */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f618_1px,transparent_1px),linear-gradient(to_bottom,#3b82f618_1px,transparent_1px)] bg-[size:3rem_3rem]"></div>

        {/* Radial dots */}
        <div className="absolute inset-0 bg-[radial-gradient(circle,#6366f115_1px,transparent_1px)] bg-[size:2rem_2rem]"></div>

        {/* Starburst pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="starburst">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
              </radialGradient>
            </defs>
            <circle cx="50%" cy="50%" r="40%" fill="url(#starburst)"/>
          </svg>
        </div>

        {/* Large gradient orbs */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-200 to-transparent rounded-full blur-3xl opacity-40"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-tl from-indigo-200 to-transparent rounded-full blur-3xl opacity-40"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-br from-purple-100 to-transparent rounded-full blur-3xl opacity-30"></div>

        {/* Decorative elements */}
        <div className="absolute top-20 right-40 w-3 h-3 bg-blue-400 rounded-full"></div>
        <div className="absolute top-40 left-40 w-2 h-2 bg-indigo-400 rounded-full"></div>
        <div className="absolute bottom-20 right-60 w-3 h-3 bg-purple-400 rounded-full"></div>
        <div className="absolute bottom-40 left-60 w-2 h-2 bg-blue-400 rounded-full"></div>

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Ready to Deploy a FHIR-Native EHR?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join healthcare organizations using open standards and true interoperability.
            Deploy in minutes, integrate with any system.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
              className="group relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-10 py-4 text-base font-bold text-white shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-600/40 hover:scale-105 transition-all"
            >
              <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity"></span>
              <span className="relative">Start Free Trial</span>
              <ArrowRight className="relative w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <button
              onClick={handleSignIn}
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gray-300 bg-white px-10 py-4 text-base font-bold text-gray-900 shadow-lg hover:border-blue-300 hover:bg-blue-50 hover:scale-105 transition-all"
            >
              Sign In
            </button>
          </div>
          <p className="mt-6 text-sm text-gray-500">
            30-day free trial • No credit card required • Cancel anytime
          </p>
        </div>
      </section>

      {/* Add animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.5; }
        }

        @keyframes rotate-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes scale-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>

      {/* Footer - Clean */}
      <footer className="bg-gray-900 border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">EHR Connect</div>
                <div className="text-sm text-gray-400">FHIR-Native • Open Standards</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Documentation</a>
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>

            <div className="text-sm text-gray-500">
              © 2025 EHR Connect
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
