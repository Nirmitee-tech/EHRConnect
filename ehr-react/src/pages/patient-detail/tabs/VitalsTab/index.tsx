import React, { useState, useMemo } from 'react';
import { Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VitalsAlerts } from './VitalsAlerts';
import { VitalsCards } from './VitalsCards';
import { VitalsCharts } from './VitalsCharts';
import { VitalsTable } from './VitalsTable';

interface VitalsTabProps {
  observations: any[];
  onRecordVitals: () => void;
}

export function VitalsTab({ observations, onRecordVitals }: VitalsTabProps) {
  const [dateFilter, setDateFilter] = useState('all');

  const filteredObservations = useMemo(() => {
    if (dateFilter === 'all') return observations;

    const now = new Date();
    let cutoffDate = new Date();

    switch (dateFilter) {
      case '7days':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case '90days':
        cutoffDate.setDate(now.getDate() - 90);
        break;
      default:
        return observations;
    }

    return observations.filter((obs: any) => {
      if (!obs.effectiveDateTime) return false;
      return new Date(obs.effectiveDateTime) >= cutoffDate;
    });
  }, [observations, dateFilter]);

  const chartData = useMemo(() => {
    const dataMap: { [key: string]: any } = {};

    filteredObservations.forEach((obs: any) => {
      const date = obs.effectiveDateTime ? new Date(obs.effectiveDateTime).toLocaleDateString() : 'Unknown';

      if (!dataMap[date]) {
        dataMap[date] = { date };
      }

      const code = obs.code?.coding?.[0]?.code;

      if (code === '85354-9' && obs.component) {
        const sys = obs.component.find((c: any) =>
          c.code?.coding?.some((code: any) => code.code === '8480-6')
        );
        const dia = obs.component.find((c: any) =>
          c.code?.coding?.some((code: any) => code.code === '8462-4')
        );
        dataMap[date].systolic = sys?.valueQuantity?.value;
        dataMap[date].diastolic = dia?.valueQuantity?.value;
      } else if (code === '8867-4') {
        dataMap[date].heartRate = obs.valueQuantity?.value;
      } else if (code === '8310-5') {
        dataMap[date].temperature = obs.valueQuantity?.value;
      } else if (code === '59408-5') {
        dataMap[date].o2sat = obs.valueQuantity?.value;
      }
    });

    return Object.values(dataMap).reverse();
  }, [filteredObservations]);

  const vitalAlerts = useMemo(() => {
    const alerts: string[] = [];
    const latest: any = {};

    filteredObservations.forEach((obs: any) => {
      const code = obs.code?.coding?.[0]?.code;

      if (code === '85354-9' && obs.component && !latest.bp) {
        const sys = obs.component.find((c: any) =>
          c.code?.coding?.some((code: any) => code.code === '8480-6')
        );
        const dia = obs.component.find((c: any) =>
          c.code?.coding?.some((code: any) => code.code === '8462-4')
        );
        const sysValue = sys?.valueQuantity?.value;
        const diaValue = dia?.valueQuantity?.value;

        if (sysValue > 140 || diaValue > 90) {
          alerts.push('⚠️ High Blood Pressure detected - Consider medication review');
        } else if (sysValue < 90 || diaValue < 60) {
          alerts.push('⚠️ Low Blood Pressure detected - Monitor for symptoms');
        }
        latest.bp = true;
      } else if (code === '8867-4' && !latest.hr) {
        const hr = obs.valueQuantity?.value;
        if (hr > 100) {
          alerts.push('⚠️ Elevated Heart Rate - Check for fever or anxiety');
        } else if (hr < 60) {
          alerts.push('⚠️ Low Heart Rate - Verify patient is not an athlete');
        }
        latest.hr = true;
      } else if (code === '8310-5' && !latest.temp) {
        const temp = obs.valueQuantity?.value;
        if (temp > 38) {
          alerts.push('🔥 Fever detected - Consider infection workup');
        } else if (temp < 36) {
          alerts.push('❄️ Hypothermia risk - Check environmental factors');
        }
        latest.temp = true;
      } else if (code === '59408-5' && !latest.o2) {
        const o2 = obs.valueQuantity?.value;
        if (o2 < 95) {
          alerts.push('⚠️ Low Oxygen Saturation - Consider supplemental O2');
        }
        latest.o2 = true;
      }
    });

    return alerts;
  }, [filteredObservations]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">Vitals & Observations</h2>
        <div className="flex gap-2">
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" className="bg-primary" onClick={onRecordVitals}>
            <Plus className="h-4 w-4 mr-1" />
            Record Vitals
          </Button>
        </div>
      </div>

      <VitalsAlerts alerts={vitalAlerts} />
      <VitalsCards observations={filteredObservations} />
      <VitalsCharts chartData={chartData} />
      <VitalsTable observations={filteredObservations} />
    </div>
  );
}
