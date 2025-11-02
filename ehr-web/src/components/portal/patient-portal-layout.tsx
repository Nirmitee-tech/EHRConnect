'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Home,
  Calendar,
  FileText,
  MessageSquare,
  User,
  Bell,
  Settings,
  LogOut,
  ChevronDown,
  CreditCard,
  Users,
  Video,
  ClipboardList,
  FileCheck,
  Plus,
  HelpCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { ORLLogo, ORLLogoMini } from '@/components/branding/orl-logo'
import { SynapseAIChat, SynapseAIFAB } from '@/components/portal/synapse-ai-chat-v2'

// Mobile bottom navigation (4 main items)
const bottomNavItems = [
  { name: 'Home', href: '/portal/dashboard', icon: Home },
  { name: 'Appointments', href: '/portal/appointments', icon: Calendar },
  { name: 'Records', href: '/portal/health-records', icon: FileText },
  { name: 'Messages', href: '/portal/messages', icon: MessageSquare, badge: 3 },
]

// Desktop sidebar navigation (all items)
const desktopNavItems = [
  { name: 'Dashboard', href: '/portal/dashboard', icon: Home },
  { name: 'Appointments', href: '/portal/appointments', icon: Calendar },
  { name: 'Health Records', href: '/portal/health-records', icon: FileText },
  { name: 'Messages', href: '/portal/messages', icon: MessageSquare, badge: 3 },
  { name: 'Documents', href: '/portal/documents', icon: FileCheck },
  { name: 'Billing', href: '/portal/billing', icon: CreditCard },
  { name: 'Forms', href: '/portal/forms', icon: ClipboardList },
  { name: 'Family Access', href: '/portal/family', icon: Users },
  { name: 'Telehealth', href: '/portal/telehealth', icon: Video },
]

interface OrgBranding {
  name?: string
  logoUrl?: string
  primaryColor?: string
  displayName?: string
}

export default function PatientPortalLayoutV2({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [notificationsCount] = useState(5)
  const [synapseOpen, setSynapseOpen] = useState(false)
  const [orgBranding, setOrgBranding] = useState<OrgBranding | undefined>(undefined)

  // Fetch organization branding
  useEffect(() => {
    const fetchOrgBranding = async () => {
      try {
        const response = await fetch('/api/patient/organization/branding')
        if (response.ok) {
          const data = await response.json()
          setOrgBranding(data.branding)
        }
      } catch (error) {
        console.error('Error fetching org branding:', error)
        // Use default branding on error
      }
    }

    fetchOrgBranding()
  }, [])

  const getInitials = (name?: string | null) => {
    if (!name) return 'P'
    const parts = name.split(' ')
    return parts.length > 1
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : parts[0][0].toUpperCase()
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/patient-login' })
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation Bar - Professional Navy Theme #1B2156 */}
      <header className="sticky top-0 z-40 shadow-lg" style={{ backgroundColor: '#1B2156', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="px-4 lg:px-6">
          <div className="flex h-14 items-center justify-between">
            {/* Organization Logo */}
            <Link href="/portal/dashboard" className="flex items-center gap-2.5">
              {orgBranding?.logoUrl ? (
                <>
                  <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center overflow-hidden">
                    <img
                      src={orgBranding.logoUrl}
                      alt={`${orgBranding.displayName || orgBranding.name || 'Organization'} Logo`}
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                  <div className="hidden sm:block">
                    <h1 className="text-base font-bold text-white">{orgBranding.displayName || orgBranding.name || 'Patient Portal'}</h1>
                    <p className="text-[9px] text-white/80 leading-tight">Patient Portal</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none">
                      <path d="M12 4C11.4477 4 11 4.44772 11 5V11H5C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13H11V19C11 19.5523 11.4477 20 12 20C12.5523 20 13 19.5523 13 19V13H19C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11H13V5C13 4.44772 12.5523 4 12 4Z" fill="currentColor"/>
                    </svg>
                  </div>
                  <div className="hidden sm:block">
                    <h1 className="text-base font-bold text-white">{orgBranding?.displayName || orgBranding?.name || 'Patient Portal'}</h1>
                    <p className="text-[9px] text-white/80 leading-tight">Patient Portal</p>
                  </div>
                </>
              )}
            </Link>

            {/* Right Side - Notifications and Profile */}
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative rounded-full hover:bg-white/10 transition-colors"
                  >
                    <Bell className="h-5 w-5 text-white" />
                    {notificationsCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 animate-pulse"
                      >
                        {notificationsCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="p-2 space-y-2 max-h-96 overflow-y-auto">
                    <div className="p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer border border-blue-200">
                      <p className="text-sm font-semibold text-gray-900">Upcoming Appointment</p>
                      <p className="text-xs text-gray-600 mt-1">
                        Dr. Smith - Tomorrow at 10:00 AM
                      </p>
                      <p className="text-xs text-blue-700 mt-2 font-medium">2 hours ago</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200">
                      <p className="text-sm font-semibold text-gray-900">New Message</p>
                      <p className="text-xs text-gray-600 mt-1">
                        You have a new message from your care team
                      </p>
                      <p className="text-xs text-slate-600 mt-2 font-medium">5 hours ago</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/portal/notifications" className="w-full cursor-pointer">
                      View all notifications
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Profile Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 px-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <Avatar className="h-9 w-9 ring-2 ring-white/30">
                      <AvatarImage src={session?.user?.image || undefined} />
                      <AvatarFallback className="bg-white text-blue-900 font-bold text-sm">
                        {getInitials(session?.user?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="h-4 w-4 text-white hidden sm:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div>
                      <p className="font-semibold">{session?.user?.name || 'Patient'}</p>
                      <p className="text-xs text-gray-500 font-normal">{session?.user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/portal/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/portal/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Preferences
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout with Sidebar */}
      <div className="flex">
        {/* Desktop Sidebar - Hidden on mobile */}
        <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:border-r lg:border-gray-200 lg:bg-white lg:min-h-[calc(100vh-3.5rem)] lg:sticky lg:top-14">
          {/* Quick Book Button */}
          <div className="p-3">
            <Button
              className="w-full text-white shadow-md h-10 font-semibold text-sm"
              style={{ backgroundColor: '#1B2156' }}
              size="sm"
              asChild
            >
              <Link href="/portal/appointments/book">
                <Plus className="mr-1.5 h-4 w-4" />
                Book Appointment
              </Link>
            </Button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-2 py-1 space-y-0.5">
            {desktopNavItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                    isActive
                      ? 'text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  style={isActive ? { backgroundColor: '#1B2156' } : {}}
                >
                  <div className="flex items-center gap-2.5">
                    <item.icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <Badge variant="default" className="bg-red-500 hover:bg-red-600 h-5 text-[10px] px-1.5 font-semibold">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Help Section */}
          <div className="p-3 m-2 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#1B2156' }}>
                <HelpCircle className="w-3.5 h-3.5 text-white" />
              </div>
              <h3 className="font-bold text-xs text-gray-900">Need Help?</h3>
            </div>
            <p className="text-[11px] text-gray-600 mb-2">
              Contact support or use Synapse AI
            </p>
            <Button variant="outline" size="sm" className="w-full text-xs h-7 border-gray-300 hover:bg-gray-100 font-semibold" asChild>
              <Link href="/portal/support">Get Support</Link>
            </Button>
          </div>
        </aside>

        {/* Main Content with bottom padding for mobile nav */}
        <main className="flex-1 pb-20 lg:pb-4 overflow-y-auto">
          <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Bottom Navigation - Mobile Only - Modern App Style */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white border-t border-gray-200 shadow-lg">
        <div className="grid grid-cols-4 h-16">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex flex-col items-center justify-center relative transition-all"
              >
                {/* Active indicator - Top bar */}
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full" style={{ backgroundColor: '#1B2156' }} />
                )}

                <div className={`relative p-2 rounded-xl transition-all ${
                  isActive ? 'shadow-md' : ''
                }`}
                style={isActive ? { backgroundColor: '#1B2156' } : {}}>
                  <item.icon
                    className={`h-5 w-5 transition-all ${
                      isActive ? 'text-white' : 'text-gray-500'
                    }`}
                  />
                  {item.badge && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-[8px] bg-red-500 font-bold border-2 border-white"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </div>
                <span
                  className={`text-[10px] mt-0.5 font-medium transition-colors ${
                    isActive ? 'font-bold' : 'text-gray-600'
                  }`}
                  style={isActive ? { color: '#1B2156' } : {}}
                >
                  {item.name}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Synapse AI FAB */}
      <SynapseAIFAB onClick={() => setSynapseOpen(true)} />

      {/* Synapse AI Chat Panel */}
      <SynapseAIChat isOpen={synapseOpen} onClose={() => setSynapseOpen(false)} />
    </div>
  )
}
