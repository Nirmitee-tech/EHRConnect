
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Building, MapPin, Users, Shield, Check,
  ChevronRight, ChevronLeft, Sparkles, LogOut
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: any;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome',
    description: 'Get started with your organization',
    icon: Sparkles,
  },
  {
    id: 'locations',
    title: 'Add Locations',
    description: 'Set up your facilities and branches',
    icon: MapPin,
  },
  {
    id: 'staff',
    title: 'Invite Staff',
    description: 'Add your team members',
    icon: Users,
  },
  {
    id: 'roles',
    title: 'Configure Roles',
    description: 'Customize permissions for your organization',
    icon: Shield,
  },
  {
    id: 'complete',
    title: 'Complete',
    description: 'Your organization is ready!',
    icon: Check,
  },
];

export default function OnboardingPage() {
  const { user, isAuthenticated, isLoading, token, logout } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<any>({
    locations: [],
    invitations: [],
    custom_roles: [],
  });

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      navigate("/");
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleNext = async () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding - mark as complete in backend
      try {
        await fetch(
          `${import.meta.env.VITE_API_URL}/api/orgs/${user?.org_id}/onboarding-complete`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );
      } catch (error) {
        console.error('Error marking onboarding complete:', error);
      }

      navigate("/dashboard");
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    navigate("/dashboard");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 relative">
            <Button
              onClick={() => logout()}
              variant="outline"
              className="absolute right-0 top-0"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome to EHRConnect! 🎉
            </h1>
            <p className="text-gray-600">
              Let&apos;s set up your organization in just a few steps
            </p>
          </div>

          {/* Progress Stepper */}
          <div className="mb-12">
            <div className="flex items-center justify-between max-w-3xl mx-auto">
              {ONBOARDING_STEPS.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;

                return (
                  <div key={step.id} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                          isCompleted
                            ? 'bg-green-500 text-white'
                            : isActive
                            ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="h-6 w-6" />
                        ) : (
                          <Icon className="h-6 w-6" />
                        )}
                      </div>
                      <p
                        className={`text-xs font-medium text-center ${
                          isActive ? 'text-blue-600' : 'text-gray-500'
                        }`}
                      >
                        {step.title}
                      </p>
                    </div>
                    {index < ONBOARDING_STEPS.length - 1 && (
                      <div
                        className={`h-0.5 flex-1 mx-2 ${
                          isCompleted ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Left Side - Preview/Info */}
            <div className="md:col-span-1">
              <div className="sticky top-8 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
                    {React.createElement(ONBOARDING_STEPS[currentStep].icon, {
                      className: 'h-8 w-8 text-white',
                    })}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {ONBOARDING_STEPS[currentStep].title}
                  </h3>
                  <p className="text-gray-600">
                    {ONBOARDING_STEPS[currentStep].description}
                  </p>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold text-gray-900 mb-3">Your Progress</h4>
                  <div className="space-y-2">
                    {formData.locations?.length > 0 && (
                      <div className="flex items-center text-sm text-green-600">
                        <Check className="h-4 w-4 mr-2" />
                        {formData.locations.length} location(s) added
                      </div>
                    )}
                    {formData.invitations?.length > 0 && (
                      <div className="flex items-center text-sm text-green-600">
                        <Check className="h-4 w-4 mr-2" />
                        {formData.invitations.length} staff invited
                      </div>
                    )}
                    {formData.custom_roles?.length > 0 && (
                      <div className="flex items-center text-sm text-green-600">
                        <Check className="h-4 w-4 mr-2" />
                        {formData.custom_roles.length} custom role(s) created
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <p className="text-xs text-gray-500">
                    💡 Tip: You can skip steps and complete them later from your dashboard
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side - Step Content */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                {currentStep === 0 && <WelcomeStep user={user} />}
                {currentStep === 1 && <LocationsStep formData={formData} setFormData={setFormData} user={user} token={token} />}
                {currentStep === 2 && <StaffStep formData={formData} setFormData={setFormData} user={user} token={token} />}
                {currentStep === 3 && <RolesStep formData={formData} setFormData={setFormData} />}
                {currentStep === 4 && <CompleteStep formData={formData} user={user} />}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t">
                  <div>
                    {currentStep > 0 && (
                      <Button
                        onClick={handleBack}
                        variant="outline"
                        className="flex items-center"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Back
                      </Button>
                    )}
                  </div>

                  <div className="flex gap-3">
                    {currentStep < ONBOARDING_STEPS.length - 1 && (
                      <Button
                        onClick={handleSkip}
                        variant="outline"
                      >
                        Skip for Now
                      </Button>
                    )}
                    <Button
                      onClick={handleNext}
                      className="flex items-center bg-blue-600 hover:bg-blue-700"
                    >
                      {currentStep === ONBOARDING_STEPS.length - 1 ? 'Go to Dashboard' : 'Continue'}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Step Components
function WelcomeStep({ user }: any) {
  return (
    <div className="text-center py-8">
      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <Sparkles className="h-10 w-10 text-white" />
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-4">
        Welcome, {user?.name?.split(' ')[0]}!
      </h2>
      <p className="text-lg text-gray-600 max-w-lg mx-auto mb-6">
        Your organization has been created successfully. Let&apos;s set up a few things to get you started.
      </p>
      <div className="bg-blue-50 rounded-xl p-6 max-w-lg mx-auto">
        <p className="text-sm text-gray-700">
          <strong>Organization ID:</strong> {user?.org_id || 'Not assigned'}
        </p>
        {user?.org_slug && (
          <p className="text-sm text-gray-700 mt-2">
            <strong>Organization Slug:</strong> {user.org_slug}
          </p>
        )}
        <p className="text-sm text-gray-700 mt-2">
          <strong>Your Role:</strong> {user?.realm_access?.roles?.includes('ORG_OWNER') ? 'Organization Owner' : 'User'}
        </p>
        <p className="text-sm text-gray-500 mt-3">
          💡 Complete the onboarding steps to set up your organization
        </p>
      </div>
    </div>
  );
}

function LocationsStep({ formData, setFormData, user, token }: any) {
  const [locationForm, setLocationForm] = useState({
    name: '',
    code: '',
    location_type: 'clinic',
  });

  const handleAddLocation = async () => {
    if (!locationForm.name) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/orgs/${user?.org_id}/locations`,
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...locationForm,
            address: {},
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        setFormData({
          ...formData,
          locations: [...formData.locations, result.location],
        });
        setLocationForm({ name: '', code: '', location_type: 'clinic' });
      } else {
        const error = await response.json();
        console.error('Error adding location:', error);
        alert(`Failed to add location: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding location:', error);
      alert('Failed to add location. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Add Your First Location</h2>
        <p className="text-gray-600">
          Add your hospital, clinic, or diagnostic center. You can add more later.
        </p>
      </div>

      <div className="grid gap-4">
        <div>
          <Label>Location Name *</Label>
          <Input
            placeholder="e.g., Main Clinic, Branch Office"
            value={locationForm.name}
            onChange={(e) => setLocationForm({ ...locationForm, name: e.target.value })}
          />
        </div>

        <div>
          <Label>Location Code (Optional)</Label>
          <Input
            placeholder="e.g., MC01, BO01"
            value={locationForm.code}
            onChange={(e) => setLocationForm({ ...locationForm, code: e.target.value })}
          />
        </div>

        <div>
          <Label>Type</Label>
          <select
            className="w-full px-3 py-2 border rounded-md"
            value={locationForm.location_type}
            onChange={(e) => setLocationForm({ ...locationForm, location_type: e.target.value })}
          >
            <option value="hospital">Hospital</option>
            <option value="clinic">Clinic</option>
            <option value="diagnostic_center">Diagnostic Center</option>
            <option value="pharmacy">Pharmacy</option>
            <option value="branch">Branch Office</option>
          </select>
        </div>

        <Button
          onClick={handleAddLocation}
          className="w-full bg-green-600 hover:bg-green-700"
          disabled={!locationForm.name}
        >
          <MapPin className="h-4 w-4 mr-2" />
          Add Location
        </Button>
      </div>

      {formData.locations.length > 0 && (
        <div className="mt-6 bg-green-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Added Locations:</h3>
          <div className="space-y-2">
            {formData.locations.map((loc: any, idx: number) => (
              <div key={idx} className="flex items-center text-sm">
                <Check className="h-4 w-4 text-green-600 mr-2" />
                <span>{loc.name} ({loc.location_type})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StaffStep({ formData, setFormData, user, token }: any) {
  const [inviteForm, setInviteForm] = useState({
    email: '',
    name: '',
    role: 'CLINICIAN',
  });

  const handleInviteStaff = async () => {
    if (!inviteForm.email) return;

    // For now, just add to local state
    // Full implementation would call the API
    setFormData({
      ...formData,
      invitations: [
        ...formData.invitations,
        { ...inviteForm, status: 'pending' },
      ],
    });
    setInviteForm({ email: '', name: '', role: 'CLINICIAN' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Invite Your Team</h2>
        <p className="text-gray-600">
          Send invitations to your staff members. They&apos;ll receive an email to set up their account.
        </p>
      </div>

      <div className="grid gap-4">
        <div>
          <Label>Email Address *</Label>
          <Input
            type="email"
            placeholder="doctor@example.com"
            value={inviteForm.email}
            onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
          />
        </div>

        <div>
          <Label>Role</Label>
          <select
            className="w-full px-3 py-2 border rounded-md"
            value={inviteForm.role}
            onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
          >
            <option value="CLINICIAN">Clinician</option>
            <option value="FRONT_DESK">Front Desk</option>
            <option value="ORG_ADMIN">Organization Admin</option>
            <option value="AUDITOR">Auditor</option>
          </select>
        </div>

        <Button
          onClick={handleInviteStaff}
          className="w-full bg-purple-600 hover:bg-purple-700"
          disabled={!inviteForm.email}
        >
          <Users className="h-4 w-4 mr-2" />
          Send Invitation
        </Button>
      </div>

      {formData.invitations.length > 0 && (
        <div className="mt-6 bg-purple-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Pending Invitations:</h3>
          <div className="space-y-2">
            {formData.invitations.map((inv: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span>{inv.email}</span>
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                  {inv.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RolesStep({ formData, setFormData }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Configure Custom Roles</h2>
        <p className="text-gray-600">
          Create custom roles specific to your organization&apos;s needs (optional).
        </p>
      </div>

      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-3">Default Roles Available:</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center">
            <Shield className="h-4 w-4 text-blue-600 mr-2" />
            <span><strong>Organization Owner:</strong> Full control</span>
          </div>
          <div className="flex items-center">
            <Shield className="h-4 w-4 text-blue-600 mr-2" />
            <span><strong>Organization Admin:</strong> Manage settings & staff</span>
          </div>
          <div className="flex items-center">
            <Shield className="h-4 w-4 text-blue-600 mr-2" />
            <span><strong>Clinician:</strong> Patient care workflows</span>
          </div>
          <div className="flex items-center">
            <Shield className="h-4 w-4 text-blue-600 mr-2" />
            <span><strong>Front Desk:</strong> Registration & appointments</span>
          </div>
          <div className="flex items-center">
            <Shield className="h-4 w-4 text-blue-600 mr-2" />
            <span><strong>Auditor:</strong> Read-only access to logs</span>
          </div>
        </div>
      </div>

      <div className="text-center py-6">
        <p className="text-gray-600 mb-4">
          You can create custom roles anytime from the dashboard under Settings → Roles
        </p>
      </div>
    </div>
  );
}

function CompleteStep({ formData, user }: any) {
  return (
    <div className="text-center py-8">
      <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <Check className="h-10 w-10 text-white" />
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-4">
        You&apos;re All Set!
      </h2>
      <p className="text-lg text-gray-600 max-w-lg mx-auto mb-8">
        Your organization is ready. You can now start managing patients, appointments, and more.
      </p>

      <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
        <div className="bg-blue-50 rounded-lg p-4">
          <MapPin className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-gray-900">
            {formData.locations?.length || 0}
          </p>
          <p className="text-xs text-gray-600">Locations</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-gray-900">
            {formData.invitations?.length || 0}
          </p>
          <p className="text-xs text-gray-600">Staff Invited</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-gray-900">
            {formData.custom_roles?.length || 0}
          </p>
          <p className="text-xs text-gray-600">Custom Roles</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 max-w-lg mx-auto">
        <p className="text-sm text-gray-700">
          <strong>Next steps:</strong> Explore your dashboard, add patients, configure settings, and invite more team members!
        </p>
      </div>
    </div>
  );
}
