'use client';

import { useState, useEffect } from 'react';
import { signIn, getProviders } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Activity, Eye, EyeOff, AlertCircle, Users, FileText } from 'lucide-react';

export default function SignInPage() {
  const searchParams = useSearchParams();
  const [authProvider, setAuthProvider] = useState<string>('loading');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const errorParam = searchParams.get('error');

  useEffect(() => {
    async function checkProvider() {
      try {
        const providers = await getProviders();
        if (providers?.credentials) {
          setAuthProvider('postgres');
        } else if (providers?.keycloak) {
          setAuthProvider('keycloak');
        } else {
          setAuthProvider('unknown');
        }
      } catch (err) {
        console.error('Failed to get providers:', err);
        setAuthProvider('unknown');
      }
    }
    checkProvider();
  }, []);

  useEffect(() => {
    if (errorParam) {
      const errorMessages: Record<string, string> = {
        CredentialsSignin: 'Invalid email or password',
        Configuration: 'Authentication configuration error',
        AccessDenied: 'Access denied',
        Verification: 'Verification failed',
        Default: 'An error occurred during sign in',
      };
      setError(errorMessages[errorParam] || errorMessages.Default);
    }
  }, [errorParam]);

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else if (result?.ok) {
        window.location.href = callbackUrl;
      }
    } catch (err) {
      setError('An error occurred during sign in');
      console.error('Sign in error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeycloakSignIn = () => {
    signIn('keycloak', { callbackUrl });
  };

  if (authProvider === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
          <p className="mt-3 text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (authProvider === 'unknown') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="bg-white rounded-lg border border-gray-200 p-8 max-w-md w-full shadow-xl">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Configuration Error</h2>
            <p className="text-sm text-gray-600">
              Authentication provider is not configured. Please contact your system administrator.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* Left Side - Blue Gradient with Graphics */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 items-center justify-center p-12 relative overflow-hidden">
        {/* Animated Background Patterns */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-indigo-400 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        </div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>

        <div className="relative z-10 max-w-md">
          {/* Icon Illustration with Connections */}
          <div className="mb-12 relative h-80">
            {/* Floating Icon Circles */}
            <div className="absolute left-0 top-8 animate-bounce" style={{ animationDuration: '3s', animationDelay: '0s' }}>
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl">
                <Activity className="w-10 h-10 text-blue-600" />
              </div>
            </div>

            <div className="absolute left-4 top-40 animate-bounce" style={{ animationDuration: '3s', animationDelay: '0.5s' }}>
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="absolute left-0 bottom-8 animate-bounce" style={{ animationDuration: '3s', animationDelay: '1s' }}>
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-2xl">
                <FileText className="w-7 h-7 text-blue-600" />
              </div>
            </div>

            {/* Dashboard Mockup Card */}
            <div className="absolute left-28 top-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-6 w-72 transform rotate-2 hover:rotate-0 transition-transform">
              {/* Window Controls */}
              <div className="flex items-center gap-2 mb-5">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              </div>

              {/* Dashboard Content */}
              <div className="space-y-4">
                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-blue-50 rounded-lg p-2">
                    <div className="text-xs text-gray-500 mb-1">Patients</div>
                    <div className="text-lg font-bold text-blue-600">1,234</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2">
                    <div className="text-xs text-gray-500 mb-1">Active</div>
                    <div className="text-lg font-bold text-green-600">856</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-2">
                    <div className="text-xs text-gray-500 mb-1">Today</div>
                    <div className="text-lg font-bold text-purple-600">42</div>
                  </div>
                </div>

                {/* List Items */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Activity className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <FileText className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>

                {/* Chart Preview */}
                <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg p-3 h-16 relative overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 200 50" preserveAspectRatio="none">
                    <path
                      d="M 0,25 L 40,15 L 80,30 L 120,10 L 160,20 L 200,5"
                      stroke="#3b82f6"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Connecting Lines SVG */}
            <svg className="absolute left-16 top-0 w-32 h-80" viewBox="0 0 100 300" style={{ zIndex: -1 }}>
              <path
                d="M 20 40 Q 50 80 30 150"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="2"
                fill="none"
                strokeDasharray="5,5"
              />
              <path
                d="M 30 150 Q 50 200 20 260"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="2"
                fill="none"
                strokeDasharray="5,5"
              />
            </svg>
          </div>

          {/* Text Content */}
          <div className="text-white">
            <h2 className="text-3xl font-bold mb-4">
              Welcome to EHR Connect
            </h2>

            <p className="text-lg text-blue-100 leading-relaxed mb-8">
              A modern, FHIR-compliant Electronic Health Records system designed
              for healthcare professionals to deliver better patient care.
            </p>

            {/* Feature List */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm text-blue-50">FHIR Compliant & HL7 Integration</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm text-blue-50">Secure, HIPAA & GDPR Compliant</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm text-blue-50">Real-time Sync Across Systems</p>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 pt-8 border-t border-white border-opacity-20">
            <p className="text-xs text-blue-200 mb-3">Trusted by healthcare organizations</p>
            <div className="flex items-center gap-6">
              <div className="text-xs font-semibold text-white opacity-80">HIPAA</div>
              <div className="text-xs font-semibold text-white opacity-80">HL7 FHIR</div>
              <div className="text-xs font-semibold text-white opacity-80">SOC 2</div>
              <div className="text-xs font-semibold text-white opacity-80">GDPR</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form with Floating Bubbles */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-white relative overflow-hidden">
        {/* Animated Floating Bubbles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Bubble 1 - Large Blue */}
          <div className="absolute top-[10%] left-[15%] w-32 h-32 bg-blue-100 rounded-full opacity-30 animate-float" style={{ animationDuration: '8s', animationDelay: '0s' }}></div>

          {/* Bubble 2 - Medium Indigo */}
          <div className="absolute top-[60%] right-[10%] w-24 h-24 bg-indigo-100 rounded-full opacity-40 animate-float" style={{ animationDuration: '10s', animationDelay: '1s' }}></div>

          {/* Bubble 3 - Small Purple */}
          <div className="absolute top-[30%] right-[25%] w-16 h-16 bg-purple-100 rounded-full opacity-35 animate-float" style={{ animationDuration: '12s', animationDelay: '2s' }}></div>

          {/* Bubble 4 - Medium Blue */}
          <div className="absolute bottom-[20%] left-[25%] w-20 h-20 bg-blue-50 rounded-full opacity-40 animate-float" style={{ animationDuration: '9s', animationDelay: '0.5s' }}></div>

          {/* Bubble 5 - Small Sky */}
          <div className="absolute top-[45%] left-[8%] w-14 h-14 bg-sky-100 rounded-full opacity-30 animate-float" style={{ animationDuration: '11s', animationDelay: '1.5s' }}></div>

          {/* Bubble 6 - Large Cyan */}
          <div className="absolute bottom-[10%] right-[20%] w-28 h-28 bg-cyan-50 rounded-full opacity-25 animate-float" style={{ animationDuration: '13s', animationDelay: '3s' }}></div>

          {/* Sparkle Dots */}
          <div className="absolute top-[25%] right-[15%] w-2 h-2 bg-blue-400 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
          <div className="absolute top-[70%] left-[20%] w-2 h-2 bg-indigo-400 rounded-full animate-ping" style={{ animationDuration: '4s', animationDelay: '1s' }}></div>
          <div className="absolute top-[50%] right-[30%] w-2 h-2 bg-purple-400 rounded-full animate-ping" style={{ animationDuration: '3.5s', animationDelay: '2s' }}></div>
        </div>

        <div className="mx-auto w-full max-w-sm relative z-10">
          {/* Logo */}
          <div className="mb-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center shadow-md">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-900">EHR Connect</span>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
              Log in to your account
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Welcome back! Please enter your details.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Postgres Auth Form */}
          {authProvider === 'postgres' && (
            <form onSubmit={handleCredentialsSignIn} className="space-y-5">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white shadow-sm"
                />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                  />
                  <span className="text-sm text-gray-700">Remember for 30 days</span>
                </label>
                <a
                  href="/auth/forgot-password"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Forgot password?
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-md hover:shadow-lg"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          )}

          {/* Keycloak Auth */}
          {authProvider === 'keycloak' && (
            <div className="space-y-4">
              <button
                onClick={handleKeycloakSignIn}
                className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium py-2.5 rounded-lg transition-all text-sm shadow-md hover:shadow-lg"
              >
                Sign in with Keycloak
              </button>
              <p className="text-center text-xs text-gray-500">
                You will be redirected to Keycloak for authentication
              </p>
            </div>
          )}

          {/* Divider */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-gray-500">OR</span>
              </div>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="mt-8">
            <button
              onClick={() => window.location.href = '/register'}
              className="w-full border border-gray-300 hover:bg-gray-50 active:bg-gray-100 text-gray-700 font-medium py-2.5 rounded-lg transition-all text-sm hover:shadow-sm"
            >
              Create an account
            </button>
          </div>

          {/* Footer Text */}
          <p className="mt-8 text-xs text-center text-gray-500">
            By continuing, you agree to our{' '}
            <a href="/terms" className="text-gray-700 hover:text-gray-900 underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-gray-700 hover:text-gray-900 underline">
              Privacy Policy
            </a>
            .
          </p>
        </div>

        {/* CSS Animation for floating bubbles */}
        <style jsx>{`
          @keyframes float {
            0%, 100% {
              transform: translateY(0) translateX(0);
            }
            25% {
              transform: translateY(-20px) translateX(10px);
            }
            50% {
              transform: translateY(-40px) translateX(-10px);
            }
            75% {
              transform: translateY(-20px) translateX(5px);
            }
          }
          .animate-float {
            animation: float linear infinite;
          }
        `}</style>
      </div>
    </div>
  );
}
