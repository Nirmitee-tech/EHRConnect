import React from 'react'
import Image from 'next/image'

interface OrgBranding {
  name?: string
  logoUrl?: string
  primaryColor?: string
  displayName?: string
}

interface ORLLogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
  orgBranding?: OrgBranding
}

export function ORLLogo({ size = 'md', showText = true, className = '', orgBranding }: ORLLogoProps) {
  const sizeClasses = {
    sm: { container: 'w-8 h-8', icon: 'w-5 h-5', text: 'text-sm', logo: 'w-7 h-7' },
    md: { container: 'w-12 h-12', icon: 'w-7 h-7', text: 'text-lg', logo: 'w-10 h-10' },
    lg: { container: 'w-16 h-16', icon: 'w-10 h-10', text: 'text-2xl', logo: 'w-14 h-14' },
  }

  const currentSize = sizeClasses[size]
  const primaryColor = orgBranding?.primaryColor || 'bg-blue-800'
  const orgName = orgBranding?.displayName || orgBranding?.name || 'ORL'

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Organization Logo */}
      <div
        className={`${currentSize.container} rounded-xl ${primaryColor} flex items-center justify-center shadow-md relative overflow-hidden`}
      >
        {orgBranding?.logoUrl ? (
          <Image
            src={orgBranding.logoUrl}
            alt={`${orgName} Logo`}
            width={100}
            height={100}
            className={`${currentSize.logo} object-contain`}
          />
        ) : (
          /* Default Medical plus icon */
          <svg
            className={`${currentSize.icon} text-white relative z-10`}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 4C11.4477 4 11 4.44772 11 5V11H5C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13H11V19C11 19.5523 11.4477 20 12 20C12.5523 20 13 19.5523 13 19V13H19C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11H13V5C13 4.44772 12.5523 4 12 4Z"
              fill="currentColor"
            />
          </svg>
        )}
      </div>

      {showText && (
        <div>
          <h1 className={`font-bold ${currentSize.text} text-blue-900 leading-tight tracking-tight`}>
            {orgName}
          </h1>
          <p className="text-[10px] text-gray-500 leading-tight font-medium">Patient Portal</p>
        </div>
      )}
    </div>
  )
}

export function ORLLogoMini({ className = '', orgBranding }: { className?: string, orgBranding?: OrgBranding }) {
  const primaryColor = orgBranding?.primaryColor || 'bg-blue-800'
  const orgName = orgBranding?.displayName || orgBranding?.name || 'ORL'

  return (
    <div
      className={`w-9 h-9 rounded-lg ${primaryColor} flex items-center justify-center shadow-md overflow-hidden ${className}`}
    >
      {orgBranding?.logoUrl ? (
        <Image
          src={orgBranding.logoUrl}
          alt={`${orgName} Logo`}
          width={36}
          height={36}
          className="w-8 h-8 object-contain"
        />
      ) : (
        <svg
          className="w-5 h-5 text-white"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 4C11.4477 4 11 4.44772 11 5V11H5C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13H11V19C11 19.5523 11.4477 20 12 20C12.5523 20 13 19.5523 13 19V13H19C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11H13V5C13 4.44772 12.5523 4 12 4Z"
            fill="currentColor"
          />
        </svg>
      )}
    </div>
  )
}
