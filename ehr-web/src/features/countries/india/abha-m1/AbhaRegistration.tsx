'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, Loader2, Phone, CreditCard } from 'lucide-react';
import type { CountryModuleComponentProps } from '@/types/country';

interface AbhaRegistrationData {
  abhaNumber: string;
  abhaAddress: string;
  name: string;
  gender: 'M' | 'F' | 'O';
  dateOfBirth: string;
  mobile?: string;
  email?: string;
}

/**
 * ABHA M1: Health ID Creation Component
 * Allows patients to create ABHA (Ayushman Bharat Health Account) numbers
 * using Aadhaar or Mobile OTP verification
 */
export default function AbhaRegistration({
  orgId,
  patientId,
  config,
  onSuccess,
  onError
}: CountryModuleComponentProps) {
  const [step, setStep] = useState<'method' | 'verify' | 'details' | 'success'>('method');
  const [method, setMethod] = useState<'aadhaar' | 'mobile'>('aadhaar');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [txnId, setTxnId] = useState<string | null>(null);
  const [abhaData, setAbhaData] = useState<AbhaRegistrationData | null>(null);

  const handleInitiateAadhaarOtp = async () => {
    if (!aadhaarNumber || aadhaarNumber.length !== 12) {
      setError('Please enter a valid 12-digit Aadhaar number');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // TODO: Call your backend API that interfaces with ABDM
      // This is a placeholder implementation
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/abha/m1/generate-aadhaar-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-org-id': orgId,
        },
        body: JSON.stringify({
          aadhaar: aadhaarNumber,
          patientId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate OTP');
      }

      const data = await response.json();
      setTxnId(data.txnId);
      setStep('verify');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate OTP';
      setError(errorMessage);
      onError?.(new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  const handleInitiateMobileOtp = async () => {
    if (!mobileNumber || mobileNumber.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // TODO: Call your backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/abha/m1/generate-mobile-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-org-id': orgId,
        },
        body: JSON.stringify({
          mobile: mobileNumber,
          patientId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate OTP');
      }

      const data = await response.json();
      setTxnId(data.txnId);
      setStep('verify');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate OTP';
      setError(errorMessage);
      onError?.(new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    if (!txnId) {
      setError('Transaction ID not found. Please try again.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // TODO: Call your backend API to verify OTP and create ABHA
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/abha/m1/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-org-id': orgId,
        },
        body: JSON.stringify({
          otp,
          txnId,
          method,
          patientId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to verify OTP');
      }

      const data = await response.json();
      setAbhaData(data.abha);
      setStep('success');
      onSuccess?.(data.abha);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to verify OTP';
      setError(errorMessage);
      onError?.(new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  const renderMethodSelection = () => (
    <Card>
      <CardHeader>
        <CardTitle>Create ABHA Number</CardTitle>
        <CardDescription>
          Select a method to create your Ayushman Bharat Health Account (ABHA) number
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={method} onValueChange={(v) => setMethod(v as 'aadhaar' | 'mobile')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="aadhaar">
              <CreditCard className="mr-2 h-4 w-4" />
              Aadhaar
            </TabsTrigger>
            <TabsTrigger value="mobile">
              <Phone className="mr-2 h-4 w-4" />
              Mobile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="aadhaar" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="aadhaar">Aadhaar Number</Label>
              <Input
                id="aadhaar"
                type="text"
                placeholder="Enter 12-digit Aadhaar number"
                maxLength={12}
                value={aadhaarNumber}
                onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ''))}
              />
              <p className="text-sm text-muted-foreground">
                We'll send an OTP to your Aadhaar-linked mobile number
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleInitiateAadhaarOtp}
              disabled={loading || aadhaarNumber.length !== 12}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                'Send OTP'
              )}
            </Button>
          </TabsContent>

          <TabsContent value="mobile" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number</Label>
              <Input
                id="mobile"
                type="tel"
                placeholder="Enter 10-digit mobile number"
                maxLength={10}
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
              />
              <p className="text-sm text-muted-foreground">
                We'll send an OTP to this mobile number
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleInitiateMobileOtp}
              disabled={loading || mobileNumber.length !== 10}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                'Send OTP'
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );

  const renderOtpVerification = () => (
    <Card>
      <CardHeader>
        <CardTitle>Verify OTP</CardTitle>
        <CardDescription>
          Enter the 6-digit OTP sent to your {method === 'aadhaar' ? 'Aadhaar-linked' : ''} mobile number
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="otp">One-Time Password</Label>
          <Input
            id="otp"
            type="text"
            placeholder="Enter 6-digit OTP"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            autoFocus
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setStep('method');
              setOtp('');
              setError(null);
            }}
            className="flex-1"
          >
            Back
          </Button>
          <Button
            onClick={handleVerifyOtp}
            disabled={loading || otp.length !== 6}
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify OTP'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderSuccess = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-600">
          <CheckCircle2 className="h-5 w-5" />
          ABHA Number Created Successfully
        </CardTitle>
        <CardDescription>
          Your Ayushman Bharat Health Account has been created
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {abhaData && (
          <div className="space-y-3 rounded-lg border bg-muted/50 p-4">
            <div>
              <Label className="text-xs text-muted-foreground">ABHA Number</Label>
              <p className="text-lg font-semibold">{abhaData.abhaNumber}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">ABHA Address</Label>
              <p className="font-medium">{abhaData.abhaAddress}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Name</Label>
                <p className="font-medium">{abhaData.name}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Date of Birth</Label>
                <p className="font-medium">{new Date(abhaData.dateOfBirth).toLocaleDateString()}</p>
              </div>
            </div>
            {abhaData.mobile && (
              <div>
                <Label className="text-xs text-muted-foreground">Mobile</Label>
                <p className="font-medium">{abhaData.mobile}</p>
              </div>
            )}
          </div>
        )}

        <Alert>
          <AlertDescription>
            Your ABHA number has been linked to your patient record. You can now use it to access
            health services and share your health records across healthcare providers.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-6">
        <Badge variant="secondary" className="mb-2">
          ABDM M1 Module
        </Badge>
        <h2 className="text-2xl font-bold">ABHA Number Registration</h2>
        <p className="text-muted-foreground">
          Create your digital health identity with Ayushman Bharat Health Account
        </p>
      </div>

      {step === 'method' && renderMethodSelection()}
      {step === 'verify' && renderOtpVerification()}
      {step === 'success' && renderSuccess()}

      {config.mode === 'sandbox' && (
        <Alert className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Running in sandbox mode. Use test Aadhaar numbers provided by ABDM for testing.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
