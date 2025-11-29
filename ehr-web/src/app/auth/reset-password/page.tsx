'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Activity, Lock, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { PublicLanguageSelector } from '@/components/common/public-language-selector';
import { useTranslation } from 'react-i18next';
import '@/i18n/client';

function ResetPasswordContent() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, [token]);

  const validatePassword = (pass: string) => {
    if (pass.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/(?=.*[a-z])/.test(pass)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/(?=.*[A-Z])/.test(pass)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/(?=.*\d)/.test(pass)) {
      return 'Password must contain at least one number';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      setLoading(false);
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/password-reset/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/auth/signin');
        }, 3000);
      } else {
        setError(data.error || 'Failed to reset password');
      }
    } catch (err) {
      console.error('Password reset error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex overflow-hidden">
      {/* Left Side - Blue Gradient with Graphics */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 items-center justify-center p-12 relative overflow-hidden">
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

        <div className="relative z-10 max-w-sm">
          {/* Large Lock Icon */}
          <div className="mb-8">
            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-2xl mx-auto">
              <Lock className="w-16 h-16 text-blue-600" />
            </div>
          </div>

          {/* Text Content */}
          <div className="text-white text-center">
            <h2 className="text-3xl font-bold mb-4">
              {t('auth.create_new_password') || 'Create New Password'}
            </h2>

            <p className="text-lg text-blue-100 leading-relaxed mb-8">
              {t('auth.new_password_desc') || 'Your new password must be different from previously used passwords.'}
            </p>

            {/* Password Requirements */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 text-left">
              <p className="text-sm font-semibold text-white mb-3">{t('auth.password_requirements') || 'Password Requirements:'}</p>
              <ul className="space-y-2 text-sm text-blue-100">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{t('auth.req_8_chars') || 'At least 8 characters'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{t('auth.req_uppercase') || 'One uppercase letter'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{t('auth.req_lowercase') || 'One lowercase letter'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{t('auth.req_number') || 'One number'}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 lg:w-3/5 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-white relative overflow-hidden">
        {/* Animated Floating Bubbles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] left-[15%] w-32 h-32 bg-blue-100 rounded-full opacity-30 animate-float" style={{ animationDuration: '8s', animationDelay: '0s' }}></div>
          <div className="absolute top-[60%] right-[10%] w-24 h-24 bg-indigo-100 rounded-full opacity-40 animate-float" style={{ animationDuration: '10s', animationDelay: '1s' }}></div>
          <div className="absolute top-[30%] right-[25%] w-16 h-16 bg-purple-100 rounded-full opacity-35 animate-float" style={{ animationDuration: '12s', animationDelay: '2s' }}></div>
          <div className="absolute bottom-[20%] left-[25%] w-20 h-20 bg-blue-50 rounded-full opacity-40 animate-float" style={{ animationDuration: '9s', animationDelay: '0.5s' }}></div>
        </div>

        <div className="mx-auto w-full max-w-md relative z-10">
          {/* Language Selector - Top Right */}
          <div className="absolute -top-8 right-0">
            <PublicLanguageSelector />
          </div>

          {/* Logo */}
          <div className="mb-10">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-semibold text-gray-900">EHR Connect</span>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-gray-900 tracking-tight mb-3">
              {t('auth.reset_password') || 'Reset Password'}
            </h1>
            <p className="text-base text-gray-600">
              {t('auth.enter_new_password') || 'Enter your new password below.'}
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg px-4 py-3.5 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-green-800 font-medium mb-1">
                  {t('auth.password_reset_success') || 'Password reset successful!'}
                </p>
                <p className="text-sm text-green-700">
                  {t('auth.redirecting_to_login') || 'Redirecting to login page...'}
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg px-4 py-3.5 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Form */}
          {!success && token && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password Field */}
              <div>
                <label htmlFor="password" className="block text-base font-medium text-gray-700 mb-2">
                  {t('auth.new_password') || 'New Password'}
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('auth.enter_new_password') || 'Enter new password'}
                    required
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-base font-medium text-gray-700 mb-2">
                  {t('auth.confirm_password') || 'Confirm Password'}
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t('auth.confirm_new_password') || 'Confirm new password'}
                    required
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-3.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base shadow-md hover:shadow-lg"
              >
                {loading ? (t('auth.resetting') || 'Resetting...') : (t('auth.reset_password_btn') || 'Reset Password')}
              </button>
            </form>
          )}

          {!token && (
            <div className="text-center">
              <Link
                href="/auth/forgot-password"
                className="inline-flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 font-medium hover:underline"
              >
                {t('auth.request_new_link') || 'Request a new reset link'}
              </Link>
            </div>
          )}

          {/* Additional Help */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              {t('auth.remember_password') || 'Remember your password?'}{' '}
              <Link
                href="/auth/signin"
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
              >
                {t('auth.sign_in') || 'Sign in'}
              </Link>
            </p>
          </div>
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
