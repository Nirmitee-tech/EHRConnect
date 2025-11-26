'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Stethoscope,
  UserCheck,
  DollarSign,
  Shield,
  Users,
  Activity,
  Cpu,
  Settings,
  BarChart3,
  FileText,
  TestTube,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Heart,
  Brain,
  Pill,
  FileSpreadsheet,
  ClipboardList,
  MessageSquare,
  Globe,
  Database,
  Zap,
  Lock,
  Eye,
  LayoutGrid,
  Table2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ReportViewProvider, useReportView } from '@/contexts/report-view-context';

interface ReportCategory {
  id: string;
  title: string;
  icon: any;
  items: ReportItem[];
}

interface ReportItem {
  id: string;
  name: string;
  href: string;
  icon: any;
}

const REPORT_CATEGORIES: ReportCategory[] = [
  {
    id: 'clinical',
    title: 'Clinical Reports',
    icon: Stethoscope,
    items: [
      { id: 'patient-summary', name: 'Patient Summary Reports', href: '/reports/clinical/patient-summary', icon: FileText },
      { id: 'encounter', name: 'Encounter Reports', href: '/reports/clinical/encounter', icon: Calendar },
      { id: 'clinical-timeline', name: 'Clinical Timeline Reports', href: '/reports/clinical/timeline', icon: Activity },
      { id: 'referral', name: 'Referral Reports', href: '/reports/clinical/referral', icon: Users },
      { id: 'lab-radiology', name: 'Lab & Radiology Orders', href: '/reports/clinical/lab-radiology', icon: TestTube },
      { id: 'results', name: 'Results Dashboard', href: '/reports/clinical/results', icon: FileSpreadsheet },
      { id: 'medication-orders', name: 'Medication Orders', href: '/reports/clinical/medication-orders', icon: Pill },
      { id: 'care-pathway', name: 'Care Pathway Adherence', href: '/reports/clinical/care-pathway', icon: TrendingUp },
      { id: 'vitals', name: 'Vitals & Observations Trend', href: '/reports/clinical/vitals', icon: Activity },
      { id: 'chronic-disease', name: 'Chronic Disease Management', href: '/reports/clinical/chronic-disease', icon: Heart },
      { id: 'population-health', name: 'Population Health Reports', href: '/reports/clinical/population-health', icon: Users }
    ]
  },
  {
    id: 'provider',
    title: 'Provider & Operational',
    icon: UserCheck,
    items: [
      { id: 'provider-encounter', name: 'Provider Encounter Summary', href: '/reports/provider/encounter-summary', icon: UserCheck },
      { id: 'provider-productivity', name: 'Provider Productivity Report', href: '/reports/provider/productivity', icon: TrendingUp },
      { id: 'specialty-workload', name: 'Specialty Workload Report', href: '/reports/provider/specialty-workload', icon: BarChart3 },
      { id: 'appointment-utilization', name: 'Appointment Utilization', href: '/reports/provider/appointment-utilization', icon: Calendar },
      { id: 'wait-time', name: 'Wait Time Reports', href: '/reports/provider/wait-time', icon: Clock },
      { id: 'clinic-slot', name: 'Clinic Slot Utilization', href: '/reports/provider/clinic-slot', icon: Calendar },
      { id: 'bed-occupancy', name: 'Bed Occupancy Report', href: '/reports/provider/bed-occupancy', icon: Activity },
      { id: 'equipment', name: 'Equipment Utilization', href: '/reports/provider/equipment', icon: Cpu },
      { id: 'ot-schedule', name: 'Operation Theater Schedule', href: '/reports/provider/ot-schedule', icon: Calendar }
    ]
  },
  {
    id: 'financial',
    title: 'Financial & Billing',
    icon: DollarSign,
    items: [
      { id: 'claims-submission', name: 'Claims Submission Report', href: '/reports/financial/claims-submission', icon: FileText },
      { id: 'payment-posting', name: 'Payment Posting Report', href: '/reports/financial/payment-posting', icon: DollarSign },
      { id: 'denial-management', name: 'Denial Management Report', href: '/reports/financial/denial-management', icon: AlertTriangle },
      { id: 'ar-aging', name: 'A/R Aging Report', href: '/reports/financial/ar-aging', icon: TrendingUp },
      { id: 'charge-lag', name: 'Charge Lag Report', href: '/reports/financial/charge-lag', icon: Clock },
      { id: 'patient-balance', name: 'Patient Balance Report', href: '/reports/financial/patient-balance', icon: Users },
      { id: 'department-revenue', name: 'Department Revenue Report', href: '/reports/financial/department-revenue', icon: BarChart3 },
      { id: 'service-profitability', name: 'Service Line Profitability', href: '/reports/financial/service-profitability', icon: TrendingUp },
      { id: 'payer-mix', name: 'Payer Mix Analysis', href: '/reports/financial/payer-mix', icon: BarChart3 }
    ]
  },
  {
    id: 'regulatory',
    title: 'Regulatory & Compliance',
    icon: Shield,
    items: [
      { id: 'meaningful-use', name: 'Meaningful Use / MIPS Reports', href: '/reports/regulatory/meaningful-use', icon: Shield },
      { id: 'interface-logs', name: 'FHIR/HL7 Interface Logs', href: '/reports/regulatory/interface-logs', icon: Database },
      { id: 'immunization', name: 'Immunization & Public Health', href: '/reports/regulatory/immunization', icon: Activity },
      { id: 'user-access', name: 'User Access Audit Report', href: '/reports/regulatory/user-access', icon: Eye },
      { id: 'break-glass', name: 'Break-the-Glass Event Logs', href: '/reports/regulatory/break-glass', icon: AlertTriangle },
      { id: 'failed-login', name: 'Failed Login Attempts', href: '/reports/regulatory/failed-login', icon: Lock },
      { id: 'consent', name: 'Consent Form Report', href: '/reports/regulatory/consent', icon: FileText },
      { id: 'advance-directive', name: 'Advance Directive Report', href: '/reports/regulatory/advance-directive', icon: ClipboardList }
    ]
  },
  {
    id: 'patient-engagement',
    title: 'Patient Engagement',
    icon: MessageSquare,
    items: [
      { id: 'portal-usage', name: 'Patient Portal Usage', href: '/reports/patient-engagement/portal-usage', icon: Globe },
      { id: 'message-volume', name: 'Message Volume Report', href: '/reports/patient-engagement/message-volume', icon: MessageSquare },
      { id: 'telehealth', name: 'Telehealth Usage Report', href: '/reports/patient-engagement/telehealth', icon: Activity },
      { id: 'patient-feedback', name: 'Patient Feedback Report', href: '/reports/patient-engagement/feedback', icon: MessageSquare },
      { id: 'survey-results', name: 'Survey Results', href: '/reports/patient-engagement/survey-results', icon: ClipboardList },
      { id: 'response-time', name: 'Response Time Metrics', href: '/reports/patient-engagement/response-time', icon: Clock }
    ]
  },
  {
    id: 'analytics',
    title: 'Population Health & Analytics',
    icon: Activity,
    items: [
      { id: 'disease-registry', name: 'Disease Registry Reports', href: '/reports/analytics/disease-registry', icon: Database },
      { id: 'outbreak', name: 'Outbreak & Surveillance', href: '/reports/analytics/outbreak', icon: AlertTriangle },
      { id: 'risk-stratification', name: 'Risk Stratification Report', href: '/reports/analytics/risk-stratification', icon: TrendingUp },
      { id: 'readmission-risk', name: 'Readmission Risk Report', href: '/reports/analytics/readmission-risk', icon: Activity },
      { id: 'length-of-stay', name: 'Length of Stay Prediction', href: '/reports/analytics/length-of-stay', icon: Calendar },
      { id: 'high-risk', name: 'High-Risk Patient Cohorts', href: '/reports/analytics/high-risk', icon: AlertTriangle },
      { id: 'hedis', name: 'HEDIS/NCQA Quality Reports', href: '/reports/analytics/hedis', icon: Shield },
      { id: 'care-gap', name: 'Care Gap Analysis', href: '/reports/analytics/care-gap', icon: Brain },
      { id: 'benchmarking', name: 'Performance Benchmarking', href: '/reports/analytics/benchmarking', icon: BarChart3 }
    ]
  },
  {
    id: 'technical',
    title: 'Technical & Integration',
    icon: Cpu,
    items: [
      { id: 'fhir-api', name: 'FHIR API Transaction Logs', href: '/reports/technical/fhir-api', icon: Database },
      { id: 'adt-messages', name: 'ADT Message Logs', href: '/reports/technical/adt-messages', icon: FileText },
      { id: 'interface-uptime', name: 'External Interface Uptime', href: '/reports/technical/interface-uptime', icon: Zap },
      { id: 'data-validation', name: 'Data Validation Report', href: '/reports/technical/data-validation', icon: Shield },
      { id: 'sync-failure', name: 'Sync Failure Report', href: '/reports/technical/sync-failure', icon: AlertTriangle },
      { id: 'batch-jobs', name: 'Batch Job Execution Logs', href: '/reports/technical/batch-jobs', icon: Settings }
    ]
  },
  {
    id: 'administrative',
    title: 'Custom & Administrative',
    icon: Settings,
    items: [
      { id: 'user-roles', name: 'User & Role Reports', href: '/reports/administrative/user-roles', icon: Users },
      { id: 'access-usage', name: 'Department Access Usage', href: '/reports/administrative/access-usage', icon: Eye },
      { id: 'master-data', name: 'Master Data Consistency', href: '/reports/administrative/master-data', icon: Database },
      { id: 'insurance-master', name: 'Insurance Master Updates', href: '/reports/administrative/insurance-master', icon: Shield },
      { id: 'report-builder', name: 'Report Builder / Ad-hoc', href: '/reports/administrative/report-builder', icon: Settings }
    ]
  }
];

function Clock({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <circle cx="12" cy="12" r="10" strokeWidth="2"/>
      <path strokeWidth="2" d="M12 6v6l4 2"/>
    </svg>
  );
}

function ReportsLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [expandedCategories, setExpandedCategories] = useState<string[]>([
    'clinical', 'provider', 'financial', 'regulatory', 'patient-engagement', 'analytics', 'technical', 'administrative'
  ]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { viewMode, setViewMode } = useReportView();

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const isActive = (href: string) => pathname === href;

  return (
    <div className="flex h-full bg-gray-50 relative">
      {/* Sidebar */}
      <aside
        className={cn(
          "bg-white border-r border-gray-200 flex flex-col transition-all duration-300 relative",
          isCollapsed ? "w-16 cursor-pointer hover:bg-gray-50" : "w-72"
        )}
        onClick={() => isCollapsed && setIsCollapsed(false)}
      >
        {/* Expand/Collapse Button - Always Visible on Edge */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsCollapsed(!isCollapsed);
          }}
          className="absolute -right-3 top-4 z-50 p-1.5 bg-white border-2 border-gray-200 rounded-full hover:bg-blue-50 hover:border-blue-400 transition-all shadow-sm"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          )}
        </button>

        {/* Header */}
        <div className={cn(
          "border-b border-gray-200 bg-white transition-all",
          isCollapsed ? "p-2" : "p-4"
        )}>
          {isCollapsed ? (
            <div className="flex justify-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Reports & Analytics</h2>
                <p className="text-xs text-gray-600">Comprehensive Insights</p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className={cn(
          "flex-1 overflow-y-auto transition-all",
          isCollapsed ? "p-2" : "p-3"
        )}>
          <div className={cn("space-y-1", isCollapsed && "flex flex-col items-center")}>
            {REPORT_CATEGORIES.map((category) => {
              const isExpanded = expandedCategories.includes(category.id);
              const Icon = category.icon;
              const hasActiveItem = category.items.some(item => isActive(item.href));

              if (isCollapsed) {
                // Collapsed view - show icon only with tooltip
                return (
                  <div key={category.id} className="relative group">
                    <div
                      className={cn(
                        'w-10 h-10 flex items-center justify-center rounded-lg transition-all pointer-events-none',
                        hasActiveItem
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-600'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    {/* Tooltip */}
                    <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg top-1/2 -translate-y-1/2 pointer-events-none">
                      <span className="font-medium">{category.title}</span>
                      <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1 border-4 border-transparent border-r-gray-900" />
                    </div>
                  </div>
                );
              }

              // Expanded view - show full category
              return (
                <div key={category.id}>
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-lg transition-all',
                      hasActiveItem
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    <div className={cn(
                      'p-1.5 rounded-md',
                      hasActiveItem ? 'bg-blue-100' : 'bg-gray-100'
                    )}>
                      <Icon className={cn(
                        'h-4 w-4',
                        hasActiveItem ? 'text-blue-600' : 'text-gray-600'
                      )} />
                    </div>
                    <span className="flex-1 text-left text-xs">{category.title}</span>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="ml-9 mt-1 space-y-0.5 border-l-2 border-gray-100 pl-3">
                      {category.items.map((item) => {
                        const ItemIcon = item.icon;
                        const active = isActive(item.href);

                        return (
                          <Link
                            key={item.id}
                            href={item.href}
                            className={cn(
                              'flex items-center gap-2 px-3 py-2 text-xs rounded-md transition-all',
                              active
                                ? 'bg-blue-600 text-white font-medium shadow-sm'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            )}
                          >
                            <ItemIcon className={cn(
                              'h-3.5 w-3.5',
                              active ? 'text-white' : 'text-gray-400'
                            )} />
                            <span>{item.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* Footer Stats */}
        {!isCollapsed && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="text-xs text-gray-500 mb-1">Total Reports</div>
                <div className="text-lg font-bold text-gray-900">61</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="text-xs text-gray-500 mb-1">Categories</div>
                <div className="text-lg font-bold text-gray-900">8</div>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ReportViewProvider>
      <ReportsLayoutContent>
        {children}
      </ReportsLayoutContent>
    </ReportViewProvider>
  );
}
