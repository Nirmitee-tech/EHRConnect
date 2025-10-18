'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Download,
  Sparkles,
  CheckCircle,
  ArrowRight,
  Palette,
  User,
  Shield,
  Zap,
  Globe,
  Star,
  ExternalLink
} from 'lucide-react';

interface OnboardingSuccessProps {
  organizationData: {
    name: string;
    email: string;
    phone: string;
    location: string;
    slug: string;
  };
  onContinue?: () => void;
}

export default function OnboardingSuccess({ organizationData, onContinue }: OnboardingSuccessProps) {
  const [showConfetti, setShowConfetti] = useState(true);
  const [brandColor, setBrandColor] = useState('#8b5cf6'); // Default violet
  const [formData, setFormData] = useState({
    mobile: '',
    website: '',
    tagline: '',
  });

  useEffect(() => {
    // Hide confetti after 5 seconds
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleDownloadCard = () => {
    // In production, this would generate a PDF or image
    alert('Downloading your organization card...');
  };

  const handleSave = () => {
    // In production, save to API
    console.log('Saving personalization:', { brandColor, ...formData });
    alert('Settings saved successfully!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-indigo-50/40 relative overflow-hidden">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  ['bg-violet-500', 'bg-purple-500', 'bg-emerald-500', 'bg-blue-500', 'bg-pink-500'][
                    Math.floor(Math.random() * 5)
                  ]
                }`}
              />
            </div>
          ))}
        </div>
      )}

      {/* Top Navigation */}
      <nav className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900">EHRConnect</span>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="border-2 border-slate-200 hover:border-violet-300 font-semibold"
            onClick={() => onContinue?.() || (window.location.href = '/dashboard')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Explore Dashboard
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="min-h-screen flex items-center justify-center p-6 pt-24">
        <div className="max-w-7xl w-full">
          {/* 2-Column Grid: Form Left, Card Right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

            {/* LEFT: Celebration Message + Personalization Form */}
            <div className="space-y-6 animate-in fade-in slide-in-from-left duration-700">
              {/* Celebration Message */}
              <div className="text-center lg:text-left space-y-4">
                <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-bold">
                  <CheckCircle className="w-4 h-4" />
                  Setup Complete
                </div>
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-violet-600 to-purple-600 rounded-3xl blur-2xl opacity-20 animate-pulse"></div>
                  <h1 className="relative text-5xl lg:text-6xl font-bold text-slate-900 mb-2">
                    You're All Set! 🎉
                  </h1>
                </div>
                <p className="text-xl text-slate-600 max-w-lg">
                  Your organization is now live on EHRConnect. Customize your business card below!
                </p>
              </div>

              {/* Personalization Form */}
              <Card className="border-2 border-slate-200 shadow-xl bg-white">
                <CardContent className="p-8 space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-1">
                      <Palette className="w-5 h-5 text-violet-600" />
                      Personalize Your Card
                    </h3>
                    <p className="text-sm text-slate-500">
                      Customize your business card to match your brand
                    </p>
                  </div>

                  {/* Color Picker */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      <Palette className="w-4 h-4 text-violet-500" />
                      Brand Color
                    </Label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={brandColor}
                        onChange={(e) => setBrandColor(e.target.value)}
                        className="w-16 h-12 rounded-lg border-2 border-slate-200 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={brandColor}
                        onChange={(e) => setBrandColor(e.target.value)}
                        className="flex-1 text-sm border-2 border-slate-200 focus:border-violet-400 font-mono"
                        placeholder="#8b5cf6"
                      />
                    </div>
                    <div className="flex gap-2">
                      {['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'].map(
                        (color) => (
                          <button
                            key={color}
                            onClick={() => setBrandColor(color)}
                            className="w-8 h-8 rounded-lg border-2 border-white shadow-md hover:scale-110 transition-transform"
                            style={{ backgroundColor: color }}
                          />
                        )
                      )}
                    </div>
                  </div>

                  {/* Mobile Number */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-violet-500" />
                      Mobile Number (Optional)
                    </Label>
                    <Input
                      type="tel"
                      value={formData.mobile}
                      onChange={(e) =>
                        setFormData({ ...formData, mobile: e.target.value })
                      }
                      className="text-sm border-2 border-slate-200 focus:border-violet-400"
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  {/* Website */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-violet-500" />
                      Website (Optional)
                    </Label>
                    <Input
                      type="url"
                      value={formData.website}
                      onChange={(e) =>
                        setFormData({ ...formData, website: e.target.value })
                      }
                      className="text-sm border-2 border-slate-200 focus:border-violet-400"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>

                  {/* Tagline */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      <Star className="w-4 h-4 text-violet-500" />
                      Tagline (Optional)
                    </Label>
                    <Input
                      type="text"
                      value={formData.tagline}
                      onChange={(e) =>
                        setFormData({ ...formData, tagline: e.target.value })
                      }
                      className="text-sm border-2 border-slate-200 focus:border-violet-400"
                      placeholder="Healthcare Excellence, Delivered"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 space-y-3">
                    <Button
                      onClick={handleSave}
                      className="w-full bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white font-bold shadow-lg shadow-violet-300"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Save Personalization
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => onContinue?.() || (window.location.href = '/dashboard')}
                      className="w-full border-2 font-bold"
                    >
                      Continue to Dashboard
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Next Steps */}
              <Card className="border-2 border-slate-200 shadow-xl bg-white">
                <CardContent className="p-6">
                  <h4 className="text-sm font-bold text-slate-900 mb-3">
                    What's Next?
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>Invite team members to join your organization</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>Connect your EHR systems and data sources</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>Configure patient data workflows</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>Explore analytics and insights dashboard</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* RIGHT: Business Card + Stats */}
            <div className="space-y-6 animate-in fade-in slide-in-from-right duration-700 delay-200 lg:sticky lg:top-24">
              {/* Success Badge */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-300 mb-3">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Congratulations! 🎊
                </h2>
                <p className="text-sm text-slate-600">
                  Connected to the EHR network
                </p>
              </div>

              {/* Business Card Preview */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition duration-300"></div>
                <Card className="relative border-2 border-slate-200 shadow-2xl bg-white overflow-hidden">
                  {/* Card Header */}
                  <div
                    className="h-32 relative overflow-hidden transition-colors duration-300"
                    style={{
                      background: `linear-gradient(135deg, ${brandColor}, ${brandColor}dd)`,
                    }}
                  >
                    <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:20px_20px]"></div>
                    <div className="absolute top-4 right-4 flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                      <Shield className="w-3.5 h-3.5 text-white" />
                      <span className="text-xs font-semibold text-white">HIPAA Compliant</span>
                    </div>
                  </div>

                  {/* Logo Badge - Overlapping */}
                  <CardContent className="px-6 -mt-12 pb-6">
                    <div
                      className="w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-bold shadow-xl border-4 border-white transition-colors duration-300"
                      style={{ background: brandColor, color: 'white' }}
                    >
                      {organizationData.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </div>

                    {/* Organization Info */}
                    <div className="mt-4 space-y-4">
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900">
                          {organizationData.name}
                        </h3>
                        {formData.tagline && (
                          <p className="text-sm text-slate-600 font-medium mt-1">
                            {formData.tagline}
                          </p>
                        )}
                      </div>

                      {/* Contact Grid */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                            <Mail className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-slate-500 font-medium">Email</p>
                            <p className="text-sm font-semibold text-slate-900 truncate">
                              {organizationData.email}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-100">
                          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                            <Phone className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-slate-500 font-medium">Phone</p>
                            <p className="text-sm font-semibold text-slate-900 truncate">
                              {formData.mobile || organizationData.phone}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-slate-500 font-medium">Location</p>
                            <p className="text-sm font-semibold text-slate-900 truncate">
                              {organizationData.location}
                            </p>
                          </div>
                        </div>

                        {formData.website && (
                          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                              <Globe className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-slate-500 font-medium">Website</p>
                              <p className="text-sm font-semibold text-slate-900 truncate">
                                {formData.website}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Download Button */}
                      <div className="pt-4 border-t border-slate-100">
                        <Button
                          onClick={handleDownloadCard}
                          className="w-full bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white font-bold shadow-lg shadow-violet-300"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download Business Card
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                      <User className="w-4 h-4 text-violet-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">1</p>
                  <p className="text-xs text-slate-500 font-medium">Admin User</p>
                </div>

                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-emerald-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">Ready</p>
                  <p className="text-xs text-slate-500 font-medium">Platform Status</p>
                </div>

                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Shield className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">Active</p>
                  <p className="text-xs text-slate-500 font-medium">Compliance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confetti Animation Styles */}
      <style jsx global>{`
        @keyframes confetti {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti 5s linear forwards;
        }
      `}</style>
    </div>
  );
}
