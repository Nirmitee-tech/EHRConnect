/**
 * Pediatric Overview Component
 * Main dashboard showing patient summary for pediatric care
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Baby, TrendingUp, Syringe, Brain, Activity } from 'lucide-react';

interface PediatricOverviewProps {
  patientId: string;
  episodeId?: string;
}

export function PediatricOverview({ patientId, episodeId }: PediatricOverviewProps) {
  // TODO: Fetch pediatric data
  const patientAge = { years: 5, months: 3, days: 12 };
  const developmentalStage = 'Preschool';

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pediatric Overview</h1>
          <p className="text-muted-foreground">
            Age: {patientAge.years}y {patientAge.months}m {patientAge.days}d | {developmentalStage}
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <Baby className="mr-2 h-5 w-5" />
          Pediatric Care
        </Badge>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Status</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">50th %ile</div>
            <p className="text-xs text-muted-foreground">Weight for age</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Immunizations</CardTitle>
            <Syringe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Up to Date</div>
            <p className="text-xs text-muted-foreground">Next due: 6 years</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Development</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">On Track</div>
            <p className="text-xs text-muted-foreground">Last screened: 4y visit</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Well Visits</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5 Year</div>
            <p className="text-xs text-muted-foreground">Next: 6 year visit</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Active Alerts</h2>
        <Alert>
          <AlertDescription>
            📅 <strong>Well-child visit due:</strong> 6-year check-up scheduled in 8 months
          </AlertDescription>
        </Alert>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">5 Year Well-Child Visit</p>
                <p className="text-sm text-muted-foreground">Completed • 3 months ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">DTaP, IPV, MMR, Varicella Vaccines</p>
                <p className="text-sm text-muted-foreground">Administered • 4 months ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Developmental Screening</p>
                <p className="text-sm text-muted-foreground">Normal • 4 months ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
