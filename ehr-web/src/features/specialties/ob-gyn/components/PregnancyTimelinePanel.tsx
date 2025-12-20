/**
 * PregnancyTimelinePanel - Visual Pregnancy Journey
 * 
 * Shows the complete pregnancy journey across all trimesters:
 * - Current gestational age and trimester
 * - Upcoming milestones and appointments
 * - Completed screenings and tests
 * - Key events and alerts
 * - Visual timeline with progress
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Baby,
  Heart,
  TestTube,
  Stethoscope,
  FileText,
  Eye,
  Activity,
  Target,
  Milestone,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PregnancyTimelinePanelProps {
  patientId: string;
  episodeId?: string;
  lmp?: string;
  edd?: string;
  isHighRisk?: boolean;
  fetalCount?: number;
  onNavigate?: (tab: string) => void;
}

interface Milestone {
  id: string;
  week: number;
  title: string;
  description: string;
  category: 'screening' | 'appointment' | 'development' | 'test' | 'delivery';
  icon: React.ElementType;
  status: 'completed' | 'current' | 'upcoming' | 'overdue';
  date?: string;
  navigateTo?: string;
  isRequired?: boolean;
}

const PREGNANCY_MILESTONES: Omit<Milestone, 'id' | 'status' | 'date'>[] = [
  // First Trimester (Weeks 1-12)
  { week: 8, title: 'First Prenatal Visit', description: 'Initial assessment, dating ultrasound, prenatal labs', category: 'appointment', icon: Stethoscope, navigateTo: 'prenatal-overview', isRequired: true },
  { week: 10, title: 'NIPT Available', description: 'Non-invasive prenatal testing for chromosomal conditions', category: 'screening', icon: TestTube, navigateTo: 'genetics' },
  { week: 11, title: 'NT Scan Window Opens', description: 'Nuchal translucency screening (11-14 weeks)', category: 'screening', icon: Eye, navigateTo: 'ultrasounds' },
  { week: 12, title: 'First Trimester Screening', description: 'Combined first trimester screening results', category: 'test', icon: FileText, navigateTo: 'genetics' },
  { week: 12, title: 'Baby has fingers & toes', description: 'All major organs are forming', category: 'development', icon: Baby },
  
  // Second Trimester (Weeks 13-27)
  { week: 14, title: 'NT Scan Window Closes', description: 'Last week for NT measurement', category: 'screening', icon: Eye },
  { week: 16, title: 'Second Trimester Visit', description: 'Check fetal heart tones, maternal weight', category: 'appointment', icon: Stethoscope, navigateTo: 'prenatal-flowsheet' },
  { week: 18, title: 'May Feel Movement', description: 'First fetal movements (quickening)', category: 'development', icon: Activity },
  { week: 20, title: 'Anatomy Scan', description: 'Detailed ultrasound examination', category: 'screening', icon: Eye, navigateTo: 'ultrasounds', isRequired: true },
  { week: 24, title: 'Glucose Screening', description: '1-hour glucose challenge test', category: 'test', icon: TestTube, navigateTo: 'labs', isRequired: true },
  { week: 24, title: 'Viability Milestone', description: 'Baby reaches viability milestone', category: 'development', icon: Heart },
  { week: 26, title: 'Rh Antibody Screen', description: 'If Rh negative, antibody screen', category: 'test', icon: TestTube, navigateTo: 'labs' },
  { week: 27, title: 'Tdap Vaccine', description: 'Whooping cough protection for baby', category: 'appointment', icon: Stethoscope },
  
  // Third Trimester (Weeks 28-40)
  { week: 28, title: 'Third Trimester Begins', description: 'Begin kick counts, more frequent visits', category: 'appointment', icon: Calendar, navigateTo: 'kick-counts' },
  { week: 28, title: 'RhoGAM if Rh-', description: 'Rh immunoglobulin injection', category: 'test', icon: TestTube },
  { week: 32, title: 'Growth Scan', description: 'Check fetal growth and position', category: 'screening', icon: Eye, navigateTo: 'ultrasounds' },
  { week: 34, title: 'Weekly Visits Begin', description: 'More frequent prenatal visits', category: 'appointment', icon: Stethoscope },
  { week: 35, title: 'GBS Culture', description: 'Group B Strep screening', category: 'test', icon: TestTube, navigateTo: 'labs', isRequired: true },
  { week: 36, title: 'Check Fetal Position', description: 'Assess for breech/vertex presentation', category: 'appointment', icon: Baby },
  { week: 37, title: 'Term Pregnancy', description: 'Baby is considered full term', category: 'development', icon: CheckCircle2 },
  { week: 38, title: 'Birth Plan Review', description: 'Finalize birth preferences', category: 'appointment', icon: FileText, navigateTo: 'birth-plan' },
  { week: 39, title: 'Weekly NST if indicated', description: 'Non-stress testing for high-risk', category: 'screening', icon: Activity },
  { week: 40, title: 'Due Date', description: 'Estimated due date arrives', category: 'delivery', icon: Target },
  { week: 41, title: 'Post-dates Discussion', description: 'Discuss induction options', category: 'appointment', icon: AlertTriangle },
];

export function PregnancyTimelinePanel({
  patientId,
  episodeId,
  lmp,
  edd,
  isHighRisk,
  fetalCount = 1,
  onNavigate,
}: PregnancyTimelinePanelProps) {
  const [expandedWeeks, setExpandedWeeks] = useState<number[]>([]);

  // Calculate current gestational age
  const gestationalInfo = useMemo(() => {
    if (!lmp) return null;

    const lmpDate = new Date(lmp);
    const today = new Date();
    const diffTime = today.getTime() - lmpDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diffDays / 7);
    const days = diffDays % 7;

    const eddDate = edd ? new Date(edd) : new Date(lmpDate.getTime() + 280 * 24 * 60 * 60 * 1000);
    const daysUntilEDD = Math.ceil((eddDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    let trimester: 1 | 2 | 3;
    if (weeks < 13) trimester = 1;
    else if (weeks < 28) trimester = 2;
    else trimester = 3;

    return {
      weeks,
      days,
      totalDays: diffDays,
      trimester,
      eddDate,
      daysUntilEDD,
      progressPercent: Math.min(100, (diffDays / 280) * 100),
    };
  }, [lmp, edd]);

  // Generate milestones with status
  const milestones = useMemo(() => {
    if (!gestationalInfo) return [];

    return PREGNANCY_MILESTONES.map((m, idx) => {
      let status: Milestone['status'];
      
      if (gestationalInfo.weeks > m.week + 2) {
        status = 'completed';
      } else if (gestationalInfo.weeks >= m.week - 1 && gestationalInfo.weeks <= m.week + 2) {
        status = 'current';
      } else if (gestationalInfo.weeks > m.week) {
        status = 'overdue';
      } else {
        status = 'upcoming';
      }

      // Calculate approximate date
      const lmpDate = new Date(lmp!);
      const milestoneDate = new Date(lmpDate.getTime() + (m.week * 7) * 24 * 60 * 60 * 1000);

      return {
        ...m,
        id: `milestone-${idx}`,
        status,
        date: milestoneDate.toISOString().split('T')[0],
      } as Milestone;
    });
  }, [gestationalInfo, lmp]);

  // Get upcoming milestones
  const upcomingMilestones = milestones
    .filter(m => m.status === 'upcoming' || m.status === 'current')
    .slice(0, 5);

  // Get overdue required items
  const overdueItems = milestones.filter(m => m.status === 'overdue' && m.isRequired);

  const getTrimesterLabel = (trimester: 1 | 2 | 3) => {
    switch (trimester) {
      case 1: return 'First Trimester';
      case 2: return 'Second Trimester';
      case 3: return 'Third Trimester';
    }
  };

  const getStatusColor = (status: Milestone['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'current':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getCategoryColor = (category: Milestone['category']) => {
    switch (category) {
      case 'screening':
        return 'border-blue-500';
      case 'appointment':
        return 'border-green-500';
      case 'development':
        return 'border-purple-500';
      case 'test':
        return 'border-yellow-500';
      case 'delivery':
        return 'border-pink-500';
      default:
        return 'border-gray-500';
    }
  };

  if (!gestationalInfo) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8 text-muted-foreground">
          <div className="text-center">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No LMP date set</p>
            <p className="text-xs">Set LMP to see pregnancy timeline</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current Status Card */}
      <Card className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950 dark:to-purple-950">
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-pink-600 dark:text-pink-400 mb-2">
              {gestationalInfo.weeks}
              <span className="text-2xl">w</span>
              {gestationalInfo.days}
              <span className="text-2xl">d</span>
            </div>
            <div className="text-lg text-muted-foreground">
              {getTrimesterLabel(gestationalInfo.trimester)}
            </div>
            {fetalCount > 1 && (
              <Badge className="mt-2 bg-purple-100 text-purple-800">
                <Baby className="h-3 w-3 mr-1" />
                {fetalCount === 2 ? 'Twins' : fetalCount === 3 ? 'Triplets' : `${fetalCount} babies`}
              </Badge>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span>LMP</span>
              <span className="font-medium">
                {gestationalInfo.daysUntilEDD > 0 
                  ? `${gestationalInfo.daysUntilEDD} days until EDD`
                  : `${Math.abs(gestationalInfo.daysUntilEDD)} days past EDD`
                }
              </span>
              <span>EDD</span>
            </div>
            <div className="relative">
              <Progress value={gestationalInfo.progressPercent} className="h-4" />
              <div className="absolute top-0 left-0 w-full h-4 flex">
                <div className="w-[32%] border-r border-white/50" title="T1" />
                <div className="w-[36%] border-r border-white/50" title="T2" />
                <div className="flex-1" title="T3" />
              </div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0w</span>
              <span>13w</span>
              <span>28w</span>
              <span>40w</span>
            </div>
          </div>

          {/* EDD Display */}
          <div className="text-center p-3 bg-white/50 dark:bg-black/20 rounded-lg">
            <div className="text-sm text-muted-foreground">Estimated Due Date</div>
            <div className="text-xl font-semibold">
              {gestationalInfo.eddDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {overdueItems.length > 0 && (
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-300 mb-3">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Overdue Items</span>
            </div>
            <div className="space-y-2">
              {overdueItems.map((item) => (
                <div 
                  key={item.id}
                  className={cn(
                    'flex items-center justify-between p-2 rounded-lg bg-red-50 dark:bg-red-900/20 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30',
                  )}
                  onClick={() => item.navigateTo && onNavigate?.(item.navigateTo)}
                >
                  <div className="flex items-center gap-2">
                    <item.icon className="h-4 w-4 text-red-500" />
                    <span className="font-medium">{item.title}</span>
                  </div>
                  <Badge className="bg-red-100 text-red-800">Week {item.week}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Milestones */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Milestone className="h-5 w-5 text-pink-500" />
            Upcoming Milestones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingMilestones.map((milestone) => (
              <div
                key={milestone.id}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg border-l-4 transition-colors',
                  getCategoryColor(milestone.category),
                  milestone.navigateTo && 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800',
                  milestone.status === 'current' && 'bg-pink-50 dark:bg-pink-900/20'
                )}
                onClick={() => milestone.navigateTo && onNavigate?.(milestone.navigateTo)}
              >
                <div className={cn(
                  'p-2 rounded-full',
                  milestone.status === 'current' 
                    ? 'bg-pink-100 text-pink-600' 
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800'
                )}>
                  <milestone.icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{milestone.title}</span>
                    <Badge className={getStatusColor(milestone.status)}>
                      Week {milestone.week}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {milestone.description}
                  </p>
                  {milestone.date && (
                    <p className="text-xs text-muted-foreground mt-1">
                      ~{new Date(milestone.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  )}
                </div>
                {milestone.isRequired && (
                  <Badge variant="outline" className="text-xs">Required</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Full Timeline by Trimester */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-pink-500" />
            Complete Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Trimester Tabs */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[1, 2, 3].map((t) => (
              <Button
                key={t}
                variant={gestationalInfo.trimester === t ? 'default' : 'outline'}
                size="sm"
                className={gestationalInfo.trimester === t ? 'bg-pink-500 hover:bg-pink-600' : ''}
                onClick={() => {
                  // Could scroll to trimester section
                }}
              >
                T{t}: Weeks {t === 1 ? '1-12' : t === 2 ? '13-27' : '28-40'}
              </Button>
            ))}
          </div>

          {/* Timeline Items */}
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

            <div className="space-y-4">
              {milestones.map((milestone, idx) => (
                <div key={milestone.id} className="relative flex items-start gap-4 pl-8">
                  {/* Timeline Dot */}
                  <div 
                    className={cn(
                      'absolute left-2 w-4 h-4 rounded-full border-2',
                      milestone.status === 'completed' 
                        ? 'bg-green-500 border-green-500' 
                        : milestone.status === 'current'
                          ? 'bg-pink-500 border-pink-500 animate-pulse'
                          : milestone.status === 'overdue'
                            ? 'bg-red-500 border-red-500'
                            : 'bg-white border-gray-300 dark:bg-gray-800'
                    )}
                  />

                  <div 
                    className={cn(
                      'flex-1 p-2 rounded-lg transition-colors',
                      milestone.status === 'current' && 'bg-pink-50 dark:bg-pink-900/20',
                      milestone.status === 'completed' && 'opacity-60'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <milestone.icon className={cn(
                        'h-4 w-4',
                        milestone.status === 'completed' ? 'text-green-500' :
                        milestone.status === 'current' ? 'text-pink-500' :
                        milestone.status === 'overdue' ? 'text-red-500' :
                        'text-gray-400'
                      )} />
                      <span className="font-medium text-sm">{milestone.title}</span>
                      <Badge variant="outline" className="text-xs ml-auto">
                        Week {milestone.week}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Baby Development Quick Facts */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Baby className="h-5 w-5 text-pink-500" />
            Baby This Week
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
              <div className="text-sm text-muted-foreground">Size</div>
              <div className="font-medium">
                {gestationalInfo.weeks < 12 ? 'Grape → Lime' :
                 gestationalInfo.weeks < 20 ? 'Lemon → Banana' :
                 gestationalInfo.weeks < 28 ? 'Papaya → Eggplant' :
                 gestationalInfo.weeks < 36 ? 'Butternut → Honeydew' :
                 'Watermelon'}
              </div>
            </div>
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-sm text-muted-foreground">Weight</div>
              <div className="font-medium">
                {gestationalInfo.weeks < 12 ? '< 1 oz' :
                 gestationalInfo.weeks < 20 ? '1-10 oz' :
                 gestationalInfo.weeks < 28 ? '10 oz - 2 lb' :
                 gestationalInfo.weeks < 36 ? '2 - 5 lb' :
                 '5.5 - 8 lb'}
              </div>
            </div>
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-sm text-muted-foreground">Length</div>
              <div className="font-medium">
                {gestationalInfo.weeks < 12 ? '< 2 in' :
                 gestationalInfo.weeks < 20 ? '2-6 in' :
                 gestationalInfo.weeks < 28 ? '6-14 in' :
                 gestationalInfo.weeks < 36 ? '14-18 in' :
                 '18-21 in'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
