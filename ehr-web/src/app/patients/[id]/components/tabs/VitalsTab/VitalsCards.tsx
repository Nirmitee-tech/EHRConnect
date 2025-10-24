import React from 'react';
import { Activity, Heart, Thermometer, Wind, TrendingUp, TrendingDown, Info, AlertCircle } from 'lucide-react';

interface VitalCardData {
  label: string;
  loinc: string;
  componentCodes?: string[];
  unit: string;
  borderColor: string;
  bgColor: string;
  iconColor: string;
  normal: string;
  tooltip: string;
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
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
    normal: '90-140/60-90',
    tooltip: 'Blood pressure measures the force of blood against artery walls. Systolic (top number) is pressure during heartbeat, diastolic (bottom) is pressure between beats.',
    icon: Activity
  },
  {
    label: 'Heart Rate',
    loinc: '8867-4',
    unit: 'bpm',
    borderColor: 'border-red-200',
    bgColor: 'bg-red-50',
    iconColor: 'text-red-600',
    normal: '60-100',
    tooltip: 'Heart rate is the number of heartbeats per minute. Normal resting heart rate varies by age and fitness level. Bradycardia (<60) or tachycardia (>100) may require attention.',
    icon: Heart
  },
  {
    label: 'Temperature',
    loinc: '8310-5',
    unit: '°C',
    borderColor: 'border-orange-200',
    bgColor: 'bg-orange-50',
    iconColor: 'text-orange-600',
    normal: '36-38',
    tooltip: 'Body temperature reflects metabolic state and infection. Fever (>38°C/100.4°F) may indicate infection. Hypothermia (<36°C) is also concerning.',
    icon: Thermometer
  },
  {
    label: 'O2 Saturation',
    loinc: '59408-5',
    unit: '%',
    borderColor: 'border-green-200',
    bgColor: 'bg-green-50',
    iconColor: 'text-green-600',
    normal: '95-100',
    tooltip: 'Oxygen saturation (SpO2) measures percentage of hemoglobin carrying oxygen. Below 95% may indicate respiratory issues. Below 90% requires urgent attention.',
    icon: Wind
  }
];

export function VitalsCards({ observations }: VitalsCardsProps) {
  const getVitalData = (vital: VitalCardData) => {
    let latestValue = '-';
    let previousValue = null;
    let trend = null;
    let trendPercent = null;
    let isAbnormal = false;
    let severity: 'low' | 'high' | 'critical' | null = null;
    let statusMessage = '';
    let lastUpdated = null;

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
        const sysVal = sys?.valueQuantity?.value;
        const diaVal = dia?.valueQuantity?.value;
        latestValue = `${sysVal || '-'}/${diaVal || '-'}`;
        lastUpdated = latestObs.effectiveDateTime;

        // Check BP ranges
        const isCritical = sysVal >= 180 || diaVal >= 120 || sysVal < 70 || diaVal < 40;
        const isHigh = sysVal > 140 || diaVal > 90;
        const isLow = sysVal < 90 || diaVal < 60;
        isAbnormal = isCritical || isHigh || isLow;

        if (isCritical) {
          severity = 'critical';
          statusMessage = sysVal >= 180 || diaVal >= 120 ? 'Hypertensive Crisis' : 'Critically Low';
        } else if (isHigh) {
          severity = 'high';
          statusMessage = 'Elevated BP';
        } else if (isLow) {
          severity = 'low';
          statusMessage = 'Low BP';
        } else {
          statusMessage = 'Normal';
        }
      }
    } else {
      const relevantObs = observations.filter((obs: any) =>
        obs.code?.coding?.some((c: any) => c.code === vital.loinc)
      );
      if (relevantObs.length > 0) {
        const latest = relevantObs[0];
        const value = latest.valueQuantity?.value;
        latestValue = `${value}`;
        lastUpdated = latest.effectiveDateTime;

        // Check abnormal ranges
        if (vital.loinc === '8867-4') { // Heart Rate
          isAbnormal = value > 100 || value < 60;
          if (value > 120 || value < 50) {
            severity = 'critical';
            statusMessage = value > 120 ? 'Severe Tachycardia' : 'Severe Bradycardia';
          } else if (value > 100) {
            severity = 'high';
            statusMessage = 'Tachycardia';
          } else if (value < 60) {
            severity = 'low';
            statusMessage = 'Bradycardia';
          } else {
            statusMessage = 'Normal';
          }
        } else if (vital.loinc === '8310-5') { // Temperature
          isAbnormal = value > 38 || value < 36;
          if (value >= 39.5 || value < 35) {
            severity = 'critical';
            statusMessage = value >= 39.5 ? 'High Fever' : 'Hypothermia';
          } else if (value > 38) {
            severity = 'high';
            statusMessage = 'Fever';
          } else if (value < 36) {
            severity = 'low';
            statusMessage = 'Low Temperature';
          } else {
            statusMessage = 'Normal';
          }
        } else if (vital.loinc === '59408-5') { // O2 Sat
          isAbnormal = value < 95;
          if (value < 90) {
            severity = 'critical';
            statusMessage = 'Critical Hypoxemia';
          } else if (value < 95) {
            severity = 'low';
            statusMessage = 'Low O2';
          } else {
            statusMessage = 'Normal';
          }
        }

        // Calculate trend
        if (relevantObs.length > 1) {
          const previous = relevantObs[1];
          const latestVal = latest.valueQuantity?.value;
          const prevVal = previous.valueQuantity?.value;
          previousValue = prevVal;
          if (latestVal && prevVal) {
            trend = latestVal > prevVal ? 'up' : latestVal < prevVal ? 'down' : 'stable';
            const diff = latestVal - prevVal;
            trendPercent = Math.round((Math.abs(diff) / prevVal) * 100);
          }
        }
      }
    }

    return { latestValue, previousValue, trend, trendPercent, isAbnormal, severity, statusMessage, lastUpdated };
  };

  const getTimeSince = (dateTime: string | null) => {
    if (!dateTime) return 'No data';
    const diff = Date.now() - new Date(dateTime).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {VITAL_SIGNS.map((vital) => {
        const { latestValue, previousValue, trend, trendPercent, isAbnormal, severity, statusMessage, lastUpdated } = getVitalData(vital);
        const Icon = vital.icon;

        // Determine card styling based on severity
        const getCardStyle = () => {
          if (severity === 'critical') {
            return 'border-red-400 bg-red-50 shadow-md';
          } else if (severity === 'high') {
            return 'border-orange-300 bg-orange-50';
          } else if (severity === 'low') {
            return 'border-yellow-300 bg-yellow-50';
          } else if (isAbnormal) {
            return 'border-red-300 bg-red-50';
          }
          return vital.borderColor + ' ' + vital.bgColor;
        };

        return (
          <div
            key={vital.loinc}
            className={`relative group bg-white rounded-xl border-2 ${getCardStyle()} p-4 transition-all duration-200 hover:shadow-lg hover:scale-105`}
          >
            {/* Status badge */}
            {isAbnormal && (
              <div className="absolute top-2 right-2">
                <AlertCircle className={`h-4 w-4 ${
                  severity === 'critical' ? 'text-red-600 animate-pulse' :
                  severity === 'high' ? 'text-orange-500' :
                  'text-yellow-600'
                }`} />
              </div>
            )}

            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${vital.bgColor}`}>
                <Icon className={`h-5 w-5 ${vital.iconColor}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold text-gray-700">{vital.label}</span>
                  <div className="relative group/info">
                    <Info className="h-3 w-3 text-gray-400 cursor-help" />
                    {/* Tooltip */}
                    <div className="invisible group-hover/info:visible absolute z-20 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl w-64">
                      <div className="font-semibold mb-2">{vital.label}</div>
                      <p className="text-gray-300 leading-relaxed mb-2">{vital.tooltip}</p>
                      <div className="pt-2 border-t border-gray-700">
                        <span className="text-green-300 font-medium">Normal:</span> {vital.normal} {vital.unit}
                      </div>
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-500">{getTimeSince(lastUpdated)}</div>
              </div>
            </div>

            {/* Value display */}
            <div className="mb-2">
              <div className="flex items-baseline justify-between">
                <span className={`text-2xl font-bold ${
                  severity === 'critical' ? 'text-red-700' :
                  severity === 'high' ? 'text-orange-600' :
                  severity === 'low' ? 'text-yellow-600' :
                  'text-gray-900'
                }`}>
                  {latestValue}
                </span>
                <span className="text-xs text-gray-500 font-medium">{vital.unit}</span>
              </div>
            </div>

            {/* Status and trend */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className={`text-xs font-semibold ${
                  severity === 'critical' ? 'text-red-700' :
                  severity === 'high' ? 'text-orange-600' :
                  severity === 'low' ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {statusMessage}
                </span>
                <span className="text-xs text-gray-500">Normal: {vital.normal}</span>
              </div>

              {trend && trend !== 'stable' && (
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                  trend === 'up' ? 'bg-red-100' : 'bg-green-100'
                }`}>
                  {trend === 'up' ? (
                    <TrendingUp className="h-3 w-3 text-red-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-green-600" />
                  )}
                  {trendPercent !== null && (
                    <span className={`text-xs font-semibold ${
                      trend === 'up' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {trendPercent}%
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Previous value hint */}
            {previousValue && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                  Previous: <span className="font-medium text-gray-700">{previousValue}</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
