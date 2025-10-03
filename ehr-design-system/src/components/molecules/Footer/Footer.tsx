import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../lib/utils';
import { 
  Hospital,
  Shield,
  Phone,
  Mail,
  MapPin,
  Globe,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  ExternalLink,
  Heart,
  Lock,
  FileText,
  HelpCircle,
  Users,
  Clock,
  Zap
} from 'lucide-react';
import { Button } from '../../atoms/Button/Button';
import { Badge } from '../../atoms/Badge/Badge';

const footerVariants = cva(
  'w-full border-t',
  {
    variants: {
      variant: {
        default: 'bg-background border-border text-foreground',
        primary: 'bg-primary text-primary-foreground border-primary/20',
        medical: 'bg-blue-50 border-blue-200 text-blue-900',
        clinical: 'bg-green-50 border-green-200 text-green-900',
        administrative: 'bg-purple-50 border-purple-200 text-purple-900',
        dark: 'bg-slate-900 border-slate-800 text-slate-100',
        muted: 'bg-muted/30 border-border text-muted-foreground',
      },
      size: {
        sm: 'py-4',
        md: 'py-6',
        lg: 'py-8',
      },
      layout: {
        simple: '',
        expanded: '',
        comprehensive: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      layout: 'simple',
    },
  }
);

const footerSectionVariants = cva(
  'space-y-3',
  {
    variants: {
      variant: {
        default: '',
        primary: 'text-primary-foreground/90',
        medical: 'text-blue-800',
        clinical: 'text-green-800',
        administrative: 'text-purple-800',
        dark: 'text-slate-300',
        muted: 'text-muted-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const footerLinkVariants = cva(
  'text-sm hover:underline transition-colors inline-flex items-center',
  {
    variants: {
      variant: {
        default: 'text-muted-foreground hover:text-foreground',
        primary: 'text-primary-foreground/80 hover:text-primary-foreground',
        medical: 'text-blue-700 hover:text-blue-800',
        clinical: 'text-green-700 hover:text-green-800',
        administrative: 'text-purple-700 hover:text-purple-800',
        dark: 'text-slate-400 hover:text-slate-200',
        muted: 'text-muted-foreground hover:text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface FooterLink {
  id: string;
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  external?: boolean;
  badge?: React.ReactNode;
}

export interface FooterSection {
  id: string;
  title: string;
  links: FooterLink[];
}

export interface FooterSocialLink {
  id: string;
  platform: string;
  href: string;
  icon: React.ReactNode;
  label: string;
}

export interface FooterContact {
  type: 'phone' | 'email' | 'address' | 'website';
  label: string;
  value: string;
  href?: string;
  icon?: React.ReactNode;
}

export interface FooterProps extends VariantProps<typeof footerVariants> {
  logo?: React.ReactNode;
  brandName?: string;
  tagline?: string;
  description?: string;
  sections?: FooterSection[];
  socialLinks?: FooterSocialLink[];
  contacts?: FooterContact[];
  copyright?: string;
  complianceLinks?: FooterLink[];
  showSystemStatus?: boolean;
  systemStatus?: {
    status: 'operational' | 'maintenance' | 'incident';
    message?: string;
    lastUpdated?: string;
  };
  emergencyContact?: {
    phone: string;
    label: string;
  };
  className?: string;
  contentClassName?: string;
  bottomClassName?: string;
}

const Footer = React.forwardRef<HTMLElement, FooterProps>(
  ({
    className,
    variant,
    size,
    layout,
    logo,
    brandName,
    tagline,
    description,
    sections = [],
    socialLinks = [],
    contacts = [],
    copyright,
    complianceLinks = [],
    showSystemStatus = false,
    systemStatus,
    emergencyContact,
    contentClassName,
    bottomClassName,
    ...props
  }, ref) => {
    const currentYear = new Date().getFullYear();
    const defaultCopyright = copyright || `© ${currentYear} ${brandName || 'Healthcare System'}. All rights reserved.`;

    const getContactIcon = (type: string) => {
      switch (type) {
        case 'phone':
          return <Phone className="w-4 h-4" />;
        case 'email':
          return <Mail className="w-4 h-4" />;
        case 'address':
          return <MapPin className="w-4 h-4" />;
        case 'website':
          return <Globe className="w-4 h-4" />;
        default:
          return null;
      }
    };

    const getStatusIcon = () => {
      if (!systemStatus) return <Zap className="w-4 h-4 text-green-500" />;
      
      switch (systemStatus.status) {
        case 'maintenance':
          return <Clock className="w-4 h-4 text-yellow-500" />;
        case 'incident':
          return <Shield className="w-4 h-4 text-red-500" />;
        default:
          return <Zap className="w-4 h-4 text-green-500" />;
      }
    };

    const getStatusMessage = () => {
      if (!systemStatus) return 'All systems operational';
      
      switch (systemStatus.status) {
        case 'maintenance':
          return systemStatus.message || 'Scheduled maintenance';
        case 'incident':
          return systemStatus.message || 'Service disruption';
        default:
          return systemStatus.message || 'All systems operational';
      }
    };

    const renderSimpleFooter = () => (
      <div className={cn(footerVariants({ variant, size, layout }), className)} ref={ref} {...props}>
        <div className={cn('container mx-auto px-4', contentClassName)}>
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Brand Section */}
            <div className="flex items-center space-x-3">
              {logo}
              <div>
                {brandName && (
                  <div className="font-semibold">{brandName}</div>
                )}
                {tagline && (
                  <div className="text-sm opacity-75">{tagline}</div>
                )}
              </div>
            </div>

            {/* Emergency Contact */}
            {emergencyContact && (
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="w-4 h-4" />
                <span>Emergency: {emergencyContact.phone}</span>
              </div>
            )}

            {/* System Status */}
            {showSystemStatus && (
              <div className="flex items-center space-x-2 text-sm">
                {getStatusIcon()}
                <span>{getStatusMessage()}</span>
              </div>
            )}
          </div>

          {/* Bottom Section */}
          <div className={cn(
            'flex flex-col md:flex-row justify-between items-center mt-6 pt-4 border-t',
            'border-border/50 space-y-2 md:space-y-0 text-sm',
            bottomClassName
          )}>
            <div>{defaultCopyright}</div>
            {complianceLinks.length > 0 && (
              <div className="flex items-center space-x-4">
                {complianceLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.href}
                    onClick={link.onClick}
                    className={cn(footerLinkVariants({ variant }))}
                  >
                    {link.icon}
                    <span className={link.icon ? 'ml-1' : ''}>{link.label}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );

    const renderExpandedFooter = () => (
      <div className={cn(footerVariants({ variant, size, layout }), className)} ref={ref} {...props}>
        <div className={cn('container mx-auto px-4', contentClassName)}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className={cn(footerSectionVariants({ variant }), 'lg:col-span-2')}>
              <div className="flex items-center space-x-3 mb-4">
                {logo}
                {brandName && (
                  <div className="font-semibold text-lg">{brandName}</div>
                )}
              </div>
              {tagline && (
                <div className="text-sm font-medium mb-2">{tagline}</div>
              )}
              {description && (
                <p className="text-sm mb-4">{description}</p>
              )}
              
              {/* Contact Information */}
              {contacts.length > 0 && (
                <div className="space-y-2">
                  {contacts.map((contact) => (
                    <div key={contact.type} className="flex items-center space-x-2 text-sm">
                      {contact.icon || getContactIcon(contact.type)}
                      {contact.href ? (
                        <a href={contact.href} className={cn(footerLinkVariants({ variant }))}>
                          <span className="font-medium">{contact.label}:</span>
                          <span className="ml-1">{contact.value}</span>
                        </a>
                      ) : (
                        <span>
                          <span className="font-medium">{contact.label}:</span>
                          <span className="ml-1">{contact.value}</span>
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dynamic Sections */}
            {sections.map((section) => (
              <div key={section.id} className={cn(footerSectionVariants({ variant }))}>
                <h4 className="font-semibold mb-3">{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.id}>
                      <a
                        href={link.href}
                        onClick={link.onClick}
                        className={cn(footerLinkVariants({ variant }))}
                        target={link.external ? '_blank' : undefined}
                        rel={link.external ? 'noopener noreferrer' : undefined}
                      >
                        {link.icon && (
                          <span className="mr-1">{link.icon}</span>
                        )}
                        <span>{link.label}</span>
                        {link.external && (
                          <ExternalLink className="w-3 h-3 ml-1" />
                        )}
                        {link.badge && (
                          <span className="ml-2">{link.badge}</span>
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Section */}
          <div className={cn(
            'flex flex-col lg:flex-row justify-between items-center',
            'mt-8 pt-6 border-t border-border/50 space-y-4 lg:space-y-0',
            bottomClassName
          )}>
            <div className="text-sm">{defaultCopyright}</div>
            
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6">
              {/* System Status */}
              {showSystemStatus && (
                <div className="flex items-center space-x-2 text-sm">
                  {getStatusIcon()}
                  <span>{getStatusMessage()}</span>
                  {systemStatus?.lastUpdated && (
                    <span className="text-xs opacity-75">
                      Updated {systemStatus.lastUpdated}
                    </span>
                  )}
                </div>
              )}

              {/* Emergency Contact */}
              {emergencyContact && (
                <div className="flex items-center space-x-2 text-sm font-medium">
                  <Phone className="w-4 h-4" />
                  <span>{emergencyContact.label}: {emergencyContact.phone}</span>
                </div>
              )}

              {/* Social Links */}
              {socialLinks.length > 0 && (
                <div className="flex items-center space-x-3">
                  {socialLinks.map((social) => (
                    <a
                      key={social.id}
                      href={social.href}
                      aria-label={social.label}
                      className={cn(
                        'p-2 rounded-md transition-colors',
                        variant === 'primary' && 'hover:bg-primary-foreground/10',
                        variant === 'medical' && 'hover:bg-blue-100',
                        variant === 'clinical' && 'hover:bg-green-100',
                        variant === 'administrative' && 'hover:bg-purple-100',
                        variant === 'dark' && 'hover:bg-slate-800',
                        variant === 'default' && 'hover:bg-muted'
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              )}

              {/* Compliance Links */}
              {complianceLinks.length > 0 && (
                <div className="flex items-center space-x-4">
                  {complianceLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.href}
                      onClick={link.onClick}
                      className={cn(footerLinkVariants({ variant }), 'text-xs')}
                    >
                      {link.icon}
                      <span className={link.icon ? 'ml-1' : ''}>{link.label}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );

    // Return appropriate footer based on layout
    if (layout === 'simple') {
      return renderSimpleFooter();
    }

    return renderExpandedFooter();
  }
);

Footer.displayName = 'Footer';

export { Footer, footerVariants, footerSectionVariants, footerLinkVariants };