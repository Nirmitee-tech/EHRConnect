'use client'

import { Suspense, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Heart, TrendingUp, Activity, Users, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import { PublicLanguageSelector } from '@/components/common/public-language-selector'
import { useTranslation } from 'react-i18next'
import '@/i18n/client'

function PatientLoginPageContent() {
  const { t } = useTranslation('common')
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get('callbackUrl') || '/portal/dashboard'

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('patient-credentials', {
        email: formData.email,
        password: formData.password,
        userType: 'patient',
        redirect: false,
        callbackUrl: callbackUrl,
      })

      if (result?.error) {
        setError(t('patient_auth.error_invalid'))
      } else if (result?.ok) {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (err) {
      setError(t('patient_auth.error_generic'))
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex flex-col bg-white">
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#0755D1] to-[#0540A3] rounded-xl flex items-center justify-center shadow-lg shadow-[#0755D1]/30">
                <Heart className="w-6 h-6 text-white" />
              </div>
            </div>
            <PublicLanguageSelector />
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-10 sm:py-12">
          <div className="w-full max-w-md space-y-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">{t('patient_auth.get_started')}</h1>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Alert variant="destructive" className="animate-fadeInUp">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">{t('auth.email')}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={t('patient_auth.email_placeholder')}
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  className="h-12 border-gray-300 focus:border-[#0755D1] focus:ring-[#0755D1]"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-gray-700 font-medium">{t('auth.password')}</Label>
                  <Link
                    href="/patient-login/forgot-password"
                    className="text-sm text-[#0755D1] hover:text-[#0540A3] transition-colors font-medium"
                  >
                    {t('auth.forgot_password')}
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t('patient_auth.password_placeholder')}
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                    className="h-12 border-gray-300 focus:border-[#667eea] focus:ring-[#667eea] pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#0755D1] focus:ring-[#0755D1]"
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  {t('patient_auth.accept_terms')} <Link href="/terms" className="text-[#0755D1] hover:underline font-medium">{t('patient_auth.terms_link_text')}</Link>
                </label>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-base font-semibold bg-[#0755D1] hover:bg-[#0540A3] text-white transition-all duration-300 shadow-lg shadow-[#0755D1]/30 hover:shadow-xl hover:shadow-[#0755D1]/40"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {t('auth.signing_in')}
                  </>
                ) : (
                  t('auth.sign_in')
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-gray-600">
              {t('patient_auth.need_account')}{' '}
              <Link href="/patient-register" className="text-[#0755D1] hover:text-[#0540A3] font-semibold">
                {t('patient_auth.create_account')}
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8">
          <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} Acme, All rights Reserved</p>
        </div>
      </div>

      {/* Right Side - Hero Section */}
      <div className="hidden lg:flex flex-col bg-gradient-to-br from-[#0755D1] via-[#0540A3] to-[#0755D1] text-white p-12 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center h-full max-w-2xl mx-auto">
          <div className="space-y-6 mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
              {t('patient_auth.hero_title')}
            </h2>
            <p className="text-lg text-white/90">
              {t('patient_auth.hero_subtitle')}
            </p>
          </div>

          {/* Dashboard Preview */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-2xl">
            <div className="bg-white rounded-xl overflow-hidden shadow-xl">
              {/* Dashboard Header */}
              <div className="bg-gradient-to-r from-gray-50 to-white p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <span className="text-xs text-gray-500">{t('patient_auth.sample_date_range')}</span>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-gradient-to-br from-blue-50 to-white p-3 rounded-lg border border-blue-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600 font-medium">{t('patient_auth.metric_patient_visit')}</span>
                      <TrendingUp className="w-3 h-3 text-[#0755D1]" />
                    </div>
                    <p className="text-xl font-bold text-gray-900">12.1K</p>
                    <p className="text-xs text-green-600">{t('patient_auth.change_positive', { value: '+12%' })}</p>
                  </div>

                  <div className="bg-gradient-to-br from-sky-50 to-white p-3 rounded-lg border border-sky-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600 font-medium">{t('patient_auth.metric_appointments')}</span>
                      <Activity className="w-3 h-3 text-[#0755D1]" />
                    </div>
                    <p className="text-xl font-bold text-gray-900">8.5K</p>
                    <p className="text-xs text-green-600">{t('patient_auth.change_positive', { value: '+8%' })}</p>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="bg-gradient-to-br from-blue-50/50 to-white p-3 rounded-lg border border-blue-100/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-[#0755D1]" />
                    <span className="text-xs text-gray-600 font-medium">{t('patient_auth.metric_add_member')}</span>
                  </div>
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#0755D1] to-[#0540A3] border-2 border-white"></div>
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#0640B8] to-[#0540A3] border-2 border-white"></div>
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#0855D8] to-[#0755D1] border-2 border-white"></div>
                    <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                      <span className="text-xs text-gray-600 font-semibold">+</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dashboard Table */}
              <div className="p-4">
                <h3 className="text-xs font-semibold text-gray-700 mb-3">{t('patient_auth.metric_recent_utilization')}</h3>
                <div className="space-y-2">
                  {[
                    { name: 'Dr. Sarah Smith', amount: '$8,254', status: 'high', percent: 92 },
                    { name: 'Dr. John Davis', amount: '$7,842', status: 'high', percent: 88 },
                    { name: 'Dr. Emma Wilson', amount: '$6,531', status: 'medium', percent: 76 },
                    { name: 'Dr. Michael Brown', amount: '$5,247', status: 'medium', percent: 64 },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 flex-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'high' ? 'bg-green-500' : 'bg-[#0755D1]'}`}></div>
                        <span className="text-gray-700">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-900 font-semibold">{item.amount}</span>
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full ${item.status === 'high' ? 'bg-green-500' : 'bg-[#0755D1]'}`} style={{ width: `${item.percent}%` }}></div>
                        </div>
                        <span className="text-gray-500 w-8 text-right">{item.percent}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-12 flex items-center justify-center gap-8 opacity-80">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">{t('patient_auth.trust_hipaa')}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">{t('patient_auth.trust_soc2')}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">{t('patient_auth.trust_iso')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PatientLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-[#0755D1]" />
        </div>
      }
    >
      <PatientLoginPageContent />
    </Suspense>
  )
}
