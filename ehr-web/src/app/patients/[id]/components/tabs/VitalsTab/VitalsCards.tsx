import React from 'react';
import { Activity, TrendingUp, TrendingDown } from 'lucide-react';

interface VitalCardData {
  label: string;
  loinc: string;
  componentCodes?: string[];
  unit: string;
  borderColor: string;
  normal: string;
  icon: any;
}

interface VitalsCardsProps {
  observations: any[];
}

const VITAL_SIGNS: VitalCardData[] = [
  {
    label: 'Blood Pressure',
    loinc: '85354-9',
    componentCodes: ['8480-6', '8462-4'],
    unit: 'mmHg',
    borderColor: 'border-blue-200',
    normal: '120/80',
    icon: Activity
  },
  {
    label: 'Heart Rate',
    loinc: '8867-4',
    unit: 'bpm',
    borderColor: 'border-red-200',
    normal: '60-100 bpm',
    icon: Activity
  },
  {
    label: 'Temperature',
    loinc: '8310-5',
    unit: '°C',
    borderColor: 'border-orange-200',
    normal: '36.5-37.5°C',
    icon: Activity
  },
  {
    label: 'O2 Saturation',
    loinc: '59408-5',
    unit: '%',
    borderColor: 'border-green-200',
    normal: '95-100%',
    icon: Activity
  }
];

export function VitalsCards({ observations }: VitalsCardsProps) {
  const getVitalData = (vital: VitalCardData) => {
    let latestValue = '-';
    let trend = null;
    let isAbnormal = false;

    if (vital.componentCodes) {
      const latestObs = observations.find((obs: any) =>
        obs.code?.coding?.some((c: any) => c.code === vital.loinc)
      );
      if (latestObs?.component) {
        const sys = latestObs.component.find((c: any) =>
          c.code?.coding?.some((code: any) => code.code === vital.componentCodes![0])
        );
        const dia = latestObs.component.find((c: any) =>
          c.code?.coding?.some((code: any) => code.code === vital.componentCodes![1])
        );
        latestValue = `${sys?.valueQuantity?.value || '-'}/${dia?.valueQuantity?.value || '-'}`;
        const sysVal = sys?.valueQuantity?.value;
        const diaVal = dia?.valueQuantity?.value;
        isAbnormal = (sysVal > 140 || sysVal < 90) || (diaVal > 90 || diaVal < 60);
      }
    } else {
      const relevantObs = observations.filter((obs: any) =>
        obs.code?.coding?.some((c: any) => c.code === vital.loinc)
      );
      if (relevantObs.length > 0) {
        const latest = relevantObs[0];
        const value = latest.valueQuantity?.value;
        latestValue = `${value} ${latest.valueQuantity?.unit || vital.unit}`;

        if (vital.loinc === '8867-4') {
          isAbnormal = value > 100 || value < 60;
        } else if (vital.loinc === '8310-5') {
          isAbnormal = value > 38 || value < 36;
        } else if (vital.loinc === '59408-5') {
          isAbnormal = value < 95;
        }

        if (relevantObs.length > 1) {
          const previous = relevantObs[1];
          const latestVal = latest.valueQuantity?.value;
          const prevVal = previous.valueQuantity?.value;
          if (latestVal && prevVal) {
            trend = latestVal > prevVal ? 'up' : latestVal < prevVal ? 'down' : null;
          }
        }
      }
    }

    return { latestValue, trend, isAbnormal };
  };

  return (
    <div className="grid grid-cols-4 gap-3">
      {VITAL_SIGNS.map((vital) => {
        const { latestValue, trend, isAbnormal } = getVitalData(vital);
        const Icon = vital.icon;

        return (
          <div key={vital.loinc} className={`bg-white rounded-lg border ${isAbnormal ? 'border-red-300 bg-red-50' : vital.borderColor} p-3`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-gray-600" />
                <span className="text-xs font-medium text-gray-700">{vital.label}</span>
              </div>
              {trend && (
                <div className="flex items-center gap-0.5">
                  {trend === 'up' ?
                    <TrendingUp className="h-3 w-3 text-red-500" /> :
                    <TrendingDown className="h-3 w-3 text-green-500" />
                  }
                </div>
              )}
            </div>
            <div className="flex items-baseline justify-between">
              <span className={`text-lg font-semibold ${isAbnormal ? 'text-red-600' : 'text-gray-900'}`}>{latestValue}</span>
              {isAbnormal && (
                <span className="text-xs font-medium text-red-600">High</span>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-1">Norm: {vital.normal}</div>
          </div>
        );
      })}
    </div>
  );
}
