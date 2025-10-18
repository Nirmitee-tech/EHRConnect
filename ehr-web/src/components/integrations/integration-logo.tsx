import React from 'react';

interface IntegrationLogoProps {
  name: string;
  logo?: string;
  category?: string;
  className?: string;
}

// Get initials from company name (max 2 characters)
function getInitials(name: string): string {
  const words = name.split(' ');
  if (words.length === 1) {
    return name.substring(0, 2).toUpperCase();
  }
  return (words[0][0] + words[1][0]).toUpperCase();
}

// Get color scheme based on category
function getCategoryColors(category?: string): { bg: string; text: string; border: string } {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    ehr: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    rcm: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    billing: { bg: 'bg-lime-50', text: 'text-lime-700', border: 'border-lime-200' },
    claims: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    eligibility: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
    payment: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    era: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
    'hl7-fhir': { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
    laboratory: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
    pharmacy: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
    imaging: { bg: 'bg-fuchsia-50', text: 'text-fuchsia-700', border: 'border-fuchsia-200' },
    inventory: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    erp: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
    crm: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
    telehealth: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
    ai: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    communication: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    analytics: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    custom: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' }
  };

  return colors[category || 'custom'] || colors.custom;
}

export function IntegrationLogo({ name, logo, category, className = '' }: IntegrationLogoProps) {
  const [imageError, setImageError] = React.useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const initials = getInitials(name);
  const colors = getCategoryColors(category);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error(`Failed to load logo for ${name}:`, logo, e);
    setImageError(true);
  };

  const handleImageLoad = () => {
    console.log(`Successfully loaded logo for ${name}:`, logo);
    setImageLoaded(true);
  };

  // If logo URL is provided and hasn't errored, show image
  if (logo && !imageError) {
    return (
      <div className={`relative flex items-center justify-center bg-white border border-gray-200 overflow-hidden ${className}`}>
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`text-xs font-semibold ${colors.text}`}>{initials}</div>
          </div>
        )}
        <img
          src={logo}
          alt={`${name} logo`}
          className={`w-full h-full object-contain p-1 transition-opacity duration-200 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onError={handleImageError}
          onLoad={handleImageLoad}
          loading="lazy"
          crossOrigin="anonymous"
        />
      </div>
    );
  }

  // Otherwise show initials with category-based colors
  return (
    <div
      className={`flex items-center justify-center font-semibold border ${colors.bg} ${colors.text} ${colors.border} ${className}`}
    >
      {initials}
    </div>
  );
}
