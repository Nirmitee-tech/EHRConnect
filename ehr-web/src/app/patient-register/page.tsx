'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, Heart, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PublicLanguageSelector } from '@/components/common/public-language-selector'
import { useTranslation } from 'react-i18next'
import '@/i18n/client'

export default function PatientRegisterPage() {
  const router = useRouter()
  const { t } = useTranslation('common')

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    // Step 1: Personal Information
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',

    // Step 2: Contact Information
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',

    // Step 3: Account Setup
    password: '',
    confirmPassword: '',
    agreedToTerms: false,
    agreedToPrivacy: false,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value })
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData({ ...formData, [name]: checked })
  }

  const validateStep1 = () => {
    if (!formData.firstName || !formData.lastName || !formData.dateOfBirth || !formData.gender) {
      setError(t('patient_register.error_required'))
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (!formData.email || !formData.phone) {
      setError(t('patient_register.error_required'))
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError(t('patient_register.error_email'))
      return false
    }

    return true
  }

  const validateStep3 = () => {
    if (!formData.password || !formData.confirmPassword) {
      setError(t('patient_register.error_required'))
      return false
    }

    if (formData.password.length < 8) {
      setError(t('patient_register.error_password_length'))
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t('patient_register.error_password_match'))
      return false
    }

    if (!formData.agreedToTerms || !formData.agreedToPrivacy) {
      setError(t('patient_register.error_terms'))
      return false
    }

    return true
  }

  const handleNext = () => {
    setError('')

    if (step === 1 && validateStep1()) {
      setStep(2)
    } else if (step === 2 && validateStep2()) {
      setStep(3)
    }
  }

  const handleBack = () => {
    setError('')
    if (step > 1) {
      setStep((step - 1) as 1 | 2)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateStep3()) {
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/patient/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || t('patient_register.error_submit'))
      }

      // Redirect to verification page
      router.push('/patient-login/verify-email?email=' + encodeURIComponent(formData.email))
    } catch (err: any) {
      setError(err.message || t('patient_register.error_generic'))
      console.error('Registration error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4 md:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/patient-login" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">EHRConnect</span>
          </Link>
          <div className="flex items-center gap-3">
            <PublicLanguageSelector />
            <Link href="/patient-login">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('patient_register.back_to_login')}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-4">
              {[1, 2, 3].map((stepNum) => (
                <div key={stepNum} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                      step === stepNum
                        ? 'bg-blue-600 text-white scale-110'
                        : step > stepNum
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step > stepNum ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      stepNum
                    )}
                  </div>
                  {stepNum < 3 && (
                    <div
                      className={`w-16 h-1 mx-2 transition-all ${
                        step > stepNum ? 'bg-green-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 px-4">
              <span className="text-xs text-gray-600 font-medium">{t('patient_register.step_personal')}</span>
              <span className="text-xs text-gray-600 font-medium">{t('patient_register.step_contact')}</span>
              <span className="text-xs text-gray-600 font-medium">{t('patient_register.step_account')}</span>
            </div>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">
                {step === 1 && t('patient_register.step1_title')}
                {step === 2 && t('patient_register.step2_title')}
                {step === 3 && t('patient_register.step3_title')}
              </CardTitle>
              <CardDescription>
                {step === 1 && t('patient_register.step1_desc')}
                {step === 2 && t('patient_register.step2_desc')}
                {step === 3 && t('patient_register.step3_desc')}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Step 1: Personal Information */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">{t('patient_register.first_name')} *</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          placeholder="John"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">{t('patient_register.last_name')} *</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          placeholder="Doe"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                          className="h-11"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">{t('patient_register.dob')} *</Label>
                      <Input
                        id="dateOfBirth"
                        name="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        required
                        className="h-11"
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender">{t('patient_register.gender')} *</Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value) => handleSelectChange('gender', value)}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder={t('patient_register.select_gender')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">{t('patient_register.gender_male')}</SelectItem>
                          <SelectItem value="female">{t('patient_register.gender_female')}</SelectItem>
                          <SelectItem value="other">{t('patient_register.gender_other')}</SelectItem>
                          <SelectItem value="prefer-not-to-say">{t('patient_register.gender_na')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Step 2: Contact Information */}
                {step === 2 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">{t('auth.email')} *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder={t('patient_register.email_placeholder')}
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="h-11"
                      />
                      <p className="text-xs text-gray-500">
                        {t('patient_register.email_helper')}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">{t('patient_register.phone')} *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder={t('patient_register.phone_placeholder')}
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">{t('patient_register.address')}</Label>
                      <Input
                        id="address"
                        name="address"
                        placeholder={t('patient_register.address_placeholder')}
                        value={formData.address}
                        onChange={handleInputChange}
                        className="h-11"
                      />
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">{t('patient_register.city')}</Label>
                        <Input
                          id="city"
                          name="city"
                          placeholder={t('patient_register.city_placeholder')}
                          value={formData.city}
                          onChange={handleInputChange}
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">{t('patient_register.state')}</Label>
                        <Input
                          id="state"
                          name="state"
                          placeholder={t('patient_register.state_placeholder')}
                          value={formData.state}
                          onChange={handleInputChange}
                          className="h-11"
                          maxLength={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zipCode">{t('patient_register.zip')}</Label>
                        <Input
                          id="zipCode"
                          name="zipCode"
                          placeholder={t('patient_register.zip_placeholder')}
                          value={formData.zipCode}
                          onChange={handleInputChange}
                          className="h-11"
                          maxLength={5}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Account Setup */}
                {step === 3 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">{t('auth.password')} *</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder={t('patient_register.password_placeholder')}
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        className="h-11"
                      />
                      <p className="text-xs text-gray-500">
                        {t('patient_register.password_helper')}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">{t('patient_register.confirm_password')} *</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder={t('patient_register.confirm_password_placeholder')}
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-4 pt-4">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="agreedToTerms"
                          checked={formData.agreedToTerms}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange('agreedToTerms', checked as boolean)
                          }
                        />
                        <div className="space-y-1">
                          <label
                            htmlFor="agreedToTerms"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {t('patient_register.agree_terms')}{' '}
                            <Link href="/terms" className="text-blue-600 hover:underline">
                              {t('patient_register.terms_link')}
                            </Link>
                          </label>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="agreedToPrivacy"
                          checked={formData.agreedToPrivacy}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange('agreedToPrivacy', checked as boolean)
                          }
                        />
                        <div className="space-y-1">
                          <label
                            htmlFor="agreedToPrivacy"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {t('patient_register.agree_privacy')}{' '}
                            <Link href="/privacy" className="text-blue-600 hover:underline">
                              {t('patient_register.privacy_link')}
                            </Link>{' '}
                            {t('patient_register.privacy_consent')}
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </CardContent>

            <CardFooter className="flex justify-between gap-4">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {t('patient_register.back')}
                </Button>
              )}

              {step < 3 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className={`${step === 1 ? 'w-full' : 'flex-1'}`}
                >
                  {t('patient_register.next')}
                </Button>
              ) : (
                <Button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('patient_register.creating')}
                    </>
                  ) : (
                    t('patient_register.submit')
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>

          <p className="mt-6 text-center text-sm text-gray-600">
            {t('patient_register.have_account')}{' '}
            <Link href="/patient-login" className="text-blue-600 hover:text-blue-700 hover:underline font-medium">
              {t('patient_register.sign_in')}
            </Link>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 px-4 py-6 md:px-6">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} EHRConnect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
