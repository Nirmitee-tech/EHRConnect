'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    org_name: '',
    owner_email: '',
    owner_name: '',
    owner_password: '',
    confirm_password: '',
    legal_name: '',
    contact_phone: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'India',
    },
    timezone: 'Asia/Kolkata',
    terms_accepted: false,
    baa_accepted: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords match
    if (formData.owner_password !== formData.confirm_password) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/orgs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          org_name: formData.org_name,
          owner_email: formData.owner_email,
          owner_name: formData.owner_name,
          owner_password: formData.owner_password,
          legal_name: formData.legal_name || formData.org_name,
          contact_phone: formData.contact_phone,
          address: formData.address,
          timezone: formData.timezone,
          terms_accepted: formData.terms_accepted,
          baa_accepted: formData.baa_accepted,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Registration failed');
      }

      const result = await response.json();
      
      // Show success message
      alert(`${result.message}\n\nOrganization Slug: ${result.organization.slug}\n\nYou can now sign in with your credentials.`);
      
      // Redirect to onboarding - user will need to sign in first, and NextAuth will handle that
      // Use window.location.href for full page reload to avoid router prefetch issues
      window.location.href = '/onboarding';
    } catch (err) {
      const error = err as Error;
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Register Your Healthcare Organization
          </h1>
          <p className="text-gray-600">
            Join the EHRConnect platform - Modern, secure, and compliant
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <strong>Error:</strong> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Organization Details */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Organization Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="org_name" className="text-sm font-medium mb-1 block">
                  Organization Name *
                </Label>
                <Input
                  id="org_name"
                  type="text"
                  required
                  placeholder="e.g., Sushruth Care Hospital"
                  value={formData.org_name}
                  onChange={(e) => setFormData({ ...formData, org_name: e.target.value })}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  A unique URL slug will be generated (e.g., sushruth-care)
                </p>
              </div>

              <div className="col-span-2">
                <Label htmlFor="legal_name" className="text-sm font-medium mb-1 block">
                  Legal Name (Optional)
                </Label>
                <Input
                  id="legal_name"
                  type="text"
                  placeholder="Official registered name"
                  value={formData.legal_name}
                  onChange={(e) => setFormData({ ...formData, legal_name: e.target.value })}
                  className="w-full"
                />
              </div>

              <div>
                <Label htmlFor="contact_phone" className="text-sm font-medium mb-1 block">
                  Contact Phone
                </Label>
                <Input
                  id="contact_phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  className="w-full"
                />
              </div>

              <div>
                <Label htmlFor="timezone" className="text-sm font-medium mb-1 block">
                  Timezone
                </Label>
                <select
                  id="timezone"
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Owner Details */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Your Details (Owner Account)</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="owner_name" className="text-sm font-medium mb-1 block">
                  Your Full Name *
                </Label>
                <Input
                  id="owner_name"
                  type="text"
                  required
                  placeholder="Dr. John Doe"
                  value={formData.owner_name}
                  onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                  className="w-full"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="owner_email" className="text-sm font-medium mb-1 block">
                  Email Address *
                </Label>
                <Input
                  id="owner_email"
                  type="email"
                  required
                  placeholder="admin@hospital.com"
                  value={formData.owner_email}
                  onChange={(e) => setFormData({ ...formData, owner_email: e.target.value })}
                  className="w-full"
                />
              </div>

              <div>
                <Label htmlFor="owner_password" className="text-sm font-medium mb-1 block">
                  Password *
                </Label>
                <Input
                  id="owner_password"
                  type="password"
                  required
                  minLength={8}
                  placeholder="Minimum 8 characters"
                  value={formData.owner_password}
                  onChange={(e) => setFormData({ ...formData, owner_password: e.target.value })}
                  className="w-full"
                />
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
                  placeholder="Re-enter password"
                  value={formData.confirm_password}
                  onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Address (Optional)</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="line1" className="text-sm font-medium mb-1 block">
                  Address Line 1
                </Label>
                <Input
                  id="line1"
                  type="text"
                  placeholder="Street address"
                  value={formData.address.line1}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    address: { ...formData.address, line1: e.target.value }
                  })}
                  className="w-full"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="line2" className="text-sm font-medium mb-1 block">
                  Address Line 2
                </Label>
                <Input
                  id="line2"
                  type="text"
                  placeholder="Apartment, suite, etc."
                  value={formData.address.line2}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    address: { ...formData.address, line2: e.target.value }
                  })}
                  className="w-full"
                />
              </div>

              <div>
                <Label htmlFor="city" className="text-sm font-medium mb-1 block">
                  City
                </Label>
                <Input
                  id="city"
                  type="text"
                  placeholder="City"
                  value={formData.address.city}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    address: { ...formData.address, city: e.target.value }
                  })}
                  className="w-full"
                />
              </div>

              <div>
                <Label htmlFor="state" className="text-sm font-medium mb-1 block">
                  State/Province
                </Label>
                <Input
                  id="state"
                  type="text"
                  placeholder="State"
                  value={formData.address.state}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    address: { ...formData.address, state: e.target.value }
                  })}
                  className="w-full"
                />
              </div>

              <div>
                <Label htmlFor="postal_code" className="text-sm font-medium mb-1 block">
                  Postal Code
                </Label>
                <Input
                  id="postal_code"
                  type="text"
                  placeholder="PIN/ZIP"
                  value={formData.address.postal_code}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    address: { ...formData.address, postal_code: e.target.value }
                  })}
                  className="w-full"
                />
              </div>

              <div>
                <Label htmlFor="country" className="text-sm font-medium mb-1 block">
                  Country
                </Label>
                <Input
                  id="country"
                  type="text"
                  value={formData.address.country}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    address: { ...formData.address, country: e.target.value }
                  })}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Legal Agreements */}
          <div className="bg-yellow-50 p-4 rounded-lg space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">Legal Agreements</h2>
            
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={formData.terms_accepted}
                onChange={(e) => setFormData({ ...formData, terms_accepted: e.target.checked })}
                className="mt-1"
              />
              <span className="text-sm text-gray-700">
                I accept the <a href="/terms" target="_blank" className="text-blue-600 hover:underline">Terms & Conditions</a> *
              </span>
            </label>

            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={formData.baa_accepted}
                onChange={(e) => setFormData({ ...formData, baa_accepted: e.target.checked })}
                className="mt-1"
              />
              <span className="text-sm text-gray-700">
                I accept the <a href="/baa" target="_blank" className="text-blue-600 hover:underline">Business Associate Agreement</a> (HIPAA) *
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
          >
            {loading ? 'Creating Your Organization...' : 'Register Organization'}
          </Button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/api/auth/signin" className="text-blue-600 hover:underline font-semibold">
              Sign in here
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
