'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, Building } from 'lucide-react';
import Link from 'next/link';

interface Invitation {
  id: string;
  email: string;
  org_name: string;
  org_slug: string;
  invited_by_name: string;
  role_keys: string[];
  scope: string;
  expires_at: string;
}

export default function AcceptInvitationPage({ params }: { params: Promise<{ token: string }> }) {
  const router = useRouter();
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [token, setToken] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirm_password: '',
  });

  useEffect(() => {
    params.then((p) => {
      setToken(p.token);
      loadInvitation(p.token);
    });
  }, [params]);

  const loadInvitation = async (tokenValue: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/invitations/${tokenValue}`);
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      const data = await response.json();
      setInvitation(data.invitation);
      setFormData(prev => ({ ...prev, email: data.invitation.email }));
    } catch (err) {
      const error = err as Error;
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/invitations/${token}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      const result = await response.json();
      
      // Show success and redirect to login
      alert(`${result.message}\n\nYou can now sign in with your credentials.`);
      router.push('/dashboard');
    } catch (err) {
      const error = err as Error;
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !invitation) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">❌</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invitation</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <p className="text-sm text-gray-600 mb-6">
              This invitation may have expired or been revoked. Please contact your administrator for a new invitation.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-xl w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Accept Invitation</h1>
          <p className="text-gray-600">
            You&apos;ve been invited to join <strong className="text-blue-600">{invitation?.org_name}</strong>
          </p>
        </div>

        {/* Invitation Details */}
        <div className="bg-blue-50 border border-blue-200 p-5 rounded-lg">
          <div className="flex items-start space-x-3">
            <Building className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-gray-700">
                <strong>Invited by:</strong> {invitation?.invited_by_name}
              </p>
              <p className="text-sm text-gray-700 mt-1">
                <strong>Email:</strong> {invitation?.email}
              </p>
              <p className="text-sm text-gray-700 mt-1">
                <strong>Roles:</strong> {invitation?.role_keys.join(', ')}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Expires: {invitation?.expires_at ? new Date(invitation.expires_at).toLocaleString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Accept Form */}
        <form onSubmit={handleAccept} className="space-y-5">
          <div>
            <Label htmlFor="name" className="text-sm font-medium mb-1 block">
              Your Full Name *
            </Label>
            <Input
              id="name"
              type="text"
              required
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-sm font-medium mb-1 block">
              Create Password *
            </Label>
            <Input
              id="password"
              type="password"
              required
              minLength={8}
              placeholder="Minimum 8 characters"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Must be at least 8 characters long
            </p>
          </div>

          <div>
            <Label htmlFor="confirm_password" className="text-sm font-medium mb-1 block">
              Confirm Password *
            </Label>
            <Input
              id="confirm_password"
              type="password"
              required
              minLength={8}
              placeholder="Re-enter your password"
              value={formData.confirm_password}
              onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
              className="w-full"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold"
          >
            {loading ? 'Creating Your Account...' : 'Accept Invitation & Create Account'}
          </Button>

          <p className="text-xs text-center text-gray-500">
            By accepting this invitation, you agree to our Terms of Service and Privacy Policy
          </p>
        </form>
      </div>
    </div>
  );
}
