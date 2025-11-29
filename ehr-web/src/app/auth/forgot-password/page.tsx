'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Activity, ArrowLeft, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { PublicLanguageSelector } from '@/components/common/public-language-selector';
import { useTranslation } from 'react-i18next';
import '@/i18n/client';

export default function ForgotPasswordPage() {
  const { t } = useTranslation('common');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [resetToken, setResetToken] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/password-reset/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        // Log the token for development
        if (data.token) {
          setResetToken(data.token);
          console.log('='.repeat(80));
          console.log('PASSWORD RESET TOKEN');
          console.log('='.repeat(80));
          console.log(`Email: ${email}`);
          console.log(`Token: ${data.token}`);
          console.log(`Reset Link: ${window.location.origin}/auth/reset-password?token=${data.token}`);
          console.log('='.repeat(80));
        }
      } else {
        setError(data.error || 'Failed to send reset email');
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
          {/* Large Mail Icon */}
          <div className="mb-8">
            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-2xl mx-auto">
              <Mail className="w-16 h-16 text-blue-600" />
            </div>
          </div>

          {/* Text Content */}
          <div className="text-white text-center">
            <h2 className="text-3xl font-bold mb-4">
              {t('auth.reset_password_title') || 'Reset Your Password'}
            </h2>

            <p className="text-lg text-blue-100 leading-relaxed mb-8">
              {t('auth.reset_password_desc') || 'Enter your email address and we\'ll send you instructions to reset your password.'}
            </p>

            {/* Security Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border-2 border-white/20">
              <CheckCircle className="w-5 h-5 text-white" />
              <span className="text-sm font-semibold text-white">{t('auth.secure_recovery') || 'Secure Password Recovery'}</span>
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

          {/* Back to Login Link */}
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('auth.back_to_login') || 'Back to login'}
          </Link>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-gray-900 tracking-tight mb-3">
              {t('auth.forgot_password') || 'Forgot Password?'}
            </h1>
            <p className="text-base text-gray-600">
              {t('auth.forgot_password_subtitle') || 'No worries, we\'ll send you reset instructions.'}
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg px-4 py-3.5 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-green-800 font-medium mb-1">
                  {t('auth.reset_email_sent') || 'Reset email sent!'}
                </p>
                <p className="text-sm text-green-700">
                  {t('auth.check_email_instructions') || 'Check your email for password reset instructions.'}
                </p>
                {process.env.NODE_ENV === 'development' && resetToken && (
                  <div className="mt-3 p-2 bg-white rounded border border-green-200">
                    <p className="text-xs text-gray-600 font-medium mb-1">Development Mode - Reset Link:</p>
                    <Link
                      href={`/auth/reset-password?token=${resetToken}`}
                      className="text-xs text-blue-600 hover:underline break-all"
                    >
                      {`${window.location.origin}/auth/reset-password?token=${resetToken}`}
                    </Link>
                  </div>
                )}
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
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-base font-medium text-gray-700 mb-2">
                {t('auth.email') || 'Email'}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.enter_email') || 'Enter your email'}
                required
                disabled={success}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white shadow-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-3.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base shadow-md hover:shadow-lg"
            >
              {loading ? (t('auth.sending') || 'Sending...') : (t('auth.send_reset_link') || 'Send Reset Link')}
            </button>
          </form>

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

          {/* Footer Text */}
          <p className="mt-8 text-sm text-center text-gray-500">
            {t('auth.need_help') || 'Need help?'}{' '}
            <a href="mailto:support@ehrconnect.com" className="text-gray-700 hover:text-gray-900 underline">
              {t('auth.contact_support') || 'Contact Support'}
            </a>
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
