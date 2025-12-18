import React, { useState } from 'react';
import { Info, TrendingUp, TrendingDown, AlertCircle, Activity, Edit2, Trash2, MoreVertical, ArrowLeftRight, Table as TableIcon } from 'lucide-react';
import { VITAL_RANGES } from '@/constants/clinical.constants';

interface VitalsTableProps {
  observations: any[];
  onEdit?: (observation: any) => void;
  onDelete?: (observationId: string) => void;
  readOnly?: boolean;
}

interface VitalValue {
  display: string;
  value: number | { sys: number; dia: number } | null;
  unit: string;
  isAbnormal: boolean;
  severity?: 'low' | 'high' | 'critical';
}

// Vital sign configurations with metadata
const VITAL_CONFIG = {
  bp: {
    label: 'Blood Pressure',
    unit: 'mmHg',
    normal: '90-140/60-90',
    tooltip: 'Measures the force of blood against artery walls. High BP (hypertension) can lead to heart disease.',
    loinc: '85354-9'
  },
  hr: {
    label: 'Heart Rate',
    unit: 'bpm',
    normal: '60-100 bpm',
    tooltip: 'Number of heartbeats per minute. Abnormal rates may indicate cardiac or metabolic issues.',
    loinc: '8867-4'
  },
  temp: {
    label: 'Temperature',
    unit: '°C',
    normal: '36-38°C',
    tooltip: 'Body temperature. Fever (>38°C) may indicate infection. Hypothermia (<36°C) is also concerning.',
    loinc: '8310-5'
  },
  rr: {
    label: 'Resp. Rate',
    unit: '/min',
    normal: '12-20/min',
    tooltip: 'Number of breaths per minute. Abnormal rates may indicate respiratory or metabolic problems.',
    loinc: '9279-1'
  },
  o2: {
    label: 'O2 Saturation',
    unit: '%',
    normal: '95-100%',
    tooltip: 'Percentage of oxygen in blood. Below 95% may indicate respiratory issues requiring attention.',
    loinc: '59408-5'
  },
  weight: {
    label: 'Weight',
    unit: 'kg',
    normal: 'Varies',
    tooltip: 'Body weight. Track changes over time. Rapid changes may indicate fluid retention or other issues.',
    loinc: '29463-7'
  },
  height: {
    label: 'Height',
    unit: 'cm',
    normal: 'Varies',
    tooltip: 'Height measurement. Used to calculate BMI and medication dosing.',
    loinc: '8302-2'
  },
  bmi: {
    label: 'BMI',
    unit: 'kg/m²',
    normal: '18.5-25',
    tooltip: 'Body Mass Index. <18.5: Underweight, 18.5-25: Normal, 25-30: Overweight, >30: Obese',
    loinc: '' // Calculated value, not a direct observation
  }
};

export function VitalsTable({ observations, onEdit, onDelete, readOnly = false }: VitalsTableProps) {
  const [isTransposed, setIsTransposed] = useState(false);
  const grouped: { [key: string]: any[] } = {};

  observations.forEach((obs: any) => {
    const dateTime = obs.effectiveDateTime
      ? new Date(obs.effectiveDateTime).toISOString()
      : 'unknown';

    if (!grouped[dateTime]) {
      grouped[dateTime] = [];
    }
    grouped[dateTime].push(obs);
  });

  const sortedDates = Object.keys(grouped).sort((a, b) =>
    new Date(b).getTime() - new Date(a).getTime()
  );

  // Helper to check if value is abnormal
  const checkAbnormal = (code: string, value: number, sys?: number, dia?: number): { isAbnormal: boolean; severity?: 'low' | 'high' | 'critical' } => {
    if (code === '85354-9' && sys && dia) {
      const isCritical = sys >= 180 || dia >= 120 || sys < 70 || dia < 40;
      const isHigh = sys > 140 || dia > 90;
      const isLow = sys < 90 || dia < 60;
      return {
        isAbnormal: isCritical || isHigh || isLow,
        severity: isCritical ? 'critical' : isHigh ? 'high' : isLow ? 'low' : undefined
      };
    } else if (code === '8867-4') { // Heart Rate
      return {
        isAbnormal: value > 100 || value < 60,
        severity: value > 120 || value < 50 ? 'critical' : value > 100 ? 'high' : 'low'
      };
    } else if (code === '8310-5') { // Temperature
      return {
        isAbnormal: value > 38 || value < 36,
        severity: value >= 39.5 || value < 35 ? 'critical' : value > 38 ? 'high' : 'low'
      };
    } else if (code === '9279-1') { // Respiratory Rate
      return {
        isAbnormal: value > 20 || value < 12,
        severity: value > 24 || value < 10 ? 'critical' : value > 20 ? 'high' : 'low'
      };
    } else if (code === '59408-5') { // O2 Sat
      return {
        isAbnormal: value < 95,
        severity: value < 90 ? 'critical' : 'low'
      };
    }
    return { isAbnormal: false };
  };

  // Calculate BMI
  const calculateBMI = (weight: number, height: number): number | null => {
    if (weight && height && height > 0) {
      const heightInMeters = height / 100;
      return Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10;
    }
    return null;
  };

  // Render vital cell with styling
  const VitalCell = ({ vital, config }: { vital: VitalValue; config: typeof VITAL_CONFIG.bp }) => {
    const getBgColor = () => {
      if (!vital.isAbnormal) return '';
      if (vital.severity === 'critical') return 'bg-red-100 border-l-4 border-red-500';
      if (vital.severity === 'high') return 'bg-orange-50 border-l-4 border-orange-400';
      if (vital.severity === 'low') return 'bg-yellow-50 border-l-4 border-yellow-400';
      return 'bg-red-50 border-l-4 border-red-400';
    };

    const getTextColor = () => {
      if (!vital.isAbnormal) return 'text-gray-900';
      if (vital.severity === 'critical') return 'text-red-700 font-semibold';
      return 'text-gray-900 font-medium';
    };

    return (
      <td className={`px-4 py-3 text-sm group/cell relative ${getBgColor()}`}>
        <div className="flex items-center gap-2">
          <span className={getTextColor()}>{vital.display}</span>
          {vital.isAbnormal && (
            <AlertCircle className={`h-3 w-3 ${vital.severity === 'critical' ? 'text-red-600' :
                vital.severity === 'high' ? 'text-orange-500' :
                  'text-yellow-600'
              }`} />
          )}
        </div>
        {/* Hover tooltip - Only for this specific cell */}
        <div className="invisible group-hover/cell:visible absolute z-20 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded shadow-xl w-56 pointer-events-none">
          <div className="font-semibold mb-1">{config.label}</div>
          <div className="text-gray-300 mb-2">{config.tooltip}</div>
          <div className="pt-2 border-t border-gray-700 space-y-1">
            <div><span className="text-green-300">Normal:</span> {config.normal}</div>
            {vital.display !== '-' && (
              <div><span className="text-blue-300">Current:</span> {vital.display} {vital.unit}</div>
            )}
          </div>
          {/* Arrow pointer */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
        </div>
      </td>
    );
  };

  // Render transposed table (vitals as rows, dates as columns)
  const renderTransposedTable = () => {
    const vitalKeys = Object.keys(VITAL_CONFIG);

    return (
      <table className="w-full border-collapse">
        <thead className="bg-gray-50 border-b sticky top-0 z-10">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 bg-gray-50 sticky left-0 z-20 border-r min-w-[180px]">
              Vital Sign
            </th>
            {sortedDates.slice(0, 10).map((dateTime) => {
              const date = dateTime !== 'unknown' ? new Date(dateTime) : null;
              return (
                <th key={dateTime} className="px-4 py-3 text-center text-xs font-semibold text-gray-700 whitespace-nowrap min-w-[120px]">
                  {date ? (
                    <div>
                      <div className="font-semibold">{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                      <div className="text-xs text-gray-500 font-normal">{date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  ) : (
                    'Unknown'
                  )}
                </th>
              );
            })}
            {sortedDates.length > 10 && (
              <th className="px-4 py-3 text-center text-xs text-gray-500">
                +{sortedDates.length - 10} more
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y">
          {vitalKeys.map((vitalKey) => {
            const config = VITAL_CONFIG[vitalKey as keyof typeof VITAL_CONFIG];

            return (
              <tr key={vitalKey} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-4 py-3 bg-white sticky left-0 z-10 border-r">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold text-gray-900">{config.label}</div>
                    <div className="group/info relative">
                      <Info className="h-3 w-3 text-gray-400 cursor-help" />
                      <div className="invisible group-hover/info:visible absolute z-20 left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-gray-900 text-white text-xs rounded shadow-xl w-64 pointer-events-none">
                        <div className="font-semibold mb-1">{config.label}</div>
                        <div className="text-gray-300 mb-2">{config.tooltip}</div>
                        <div className="pt-2 border-t border-gray-700">
                          <span className="text-green-300">Normal:</span> {config.normal}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">Normal: {config.normal}</div>
                </td>
                {sortedDates.slice(0, 10).map((dateTime) => {
                  const obsGroup = grouped[dateTime];
                  let vitalData: VitalValue = { display: '-', value: null, unit: config.unit, isAbnormal: false };

                  // Extract vital value for this date
                  obsGroup.forEach((obs: any) => {
                    const code = obs.code?.coding?.[0]?.code;

                    if (vitalKey === 'bp' && code === '85354-9' && obs.component) {
                      const sys = obs.component.find((c: any) => c.code?.coding?.some((code: any) => code.code === '8480-6'));
                      const dia = obs.component.find((c: any) => c.code?.coding?.some((code: any) => code.code === '8462-4'));
                      const sysVal = sys?.valueQuantity?.value;
                      const diaVal = dia?.valueQuantity?.value;
                      const abnormal = checkAbnormal(code, 0, sysVal, diaVal);
                      vitalData = {
                        display: `${sysVal || '-'}/${diaVal || '-'}`,
                        value: { sys: sysVal, dia: diaVal },
                        unit: 'mmHg',
                        isAbnormal: abnormal.isAbnormal,
                        severity: abnormal.severity
                      };
                    } else if (config.loinc && code === config.loinc) {
                      const val = obs.valueQuantity?.value;
                      const abnormal = checkAbnormal(code, val);
                      vitalData = {
                        display: val ? `${val}` : '-',
                        value: val,
                        unit: obs.valueQuantity?.unit || config.unit,
                        isAbnormal: abnormal.isAbnormal,
                        severity: abnormal.severity
                      };
                    } else if (vitalKey === 'bmi') {
                      // Calculate BMI if we have weight and height
                      const weightObs = obsGroup.find((o: any) => o.code?.coding?.[0]?.code === '29463-7');
                      const heightObs = obsGroup.find((o: any) => o.code?.coding?.[0]?.code === '8302-2');
                      if (weightObs && heightObs) {
                        const bmi = calculateBMI(weightObs.valueQuantity?.value, heightObs.valueQuantity?.value);
                        if (bmi) {
                          vitalData = {
                            display: `${bmi}`,
                            value: bmi,
                            unit: 'kg/m²',
                            isAbnormal: bmi < 18.5 || bmi > 25,
                            severity: bmi < 16 || bmi > 30 ? 'critical' : bmi < 18.5 || bmi > 25 ? 'high' : undefined
                          };
                        }
                      }
                    }
                  });

                  return <VitalCell key={dateTime} vital={vitalData} config={config} />;
                })}
                {sortedDates.length > 10 && (
                  <td className="px-4 py-3 text-center text-xs text-gray-400">
                    ...
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-4 border-b bg-gradient-to-r from-primary/5 to-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Complete Vitals History</h3>
            <p className="text-xs text-gray-500 mt-1">Hover over values for detailed information and normal ranges</p>
          </div>
          <div className="flex items-center gap-4">
            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1">
              <button
                onClick={() => setIsTransposed(false)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${!isTransposed
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
                title="Dates as rows, vitals as columns"
              >
                <TableIcon className="h-3.5 w-3.5" />
                Horizontal
              </button>
              <button
                onClick={() => setIsTransposed(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${isTransposed
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
                title="Vitals as rows, dates as columns (better for 300+ readings)"
              >
                <ArrowLeftRight className="h-3.5 w-3.5" />
                Vertical
              </button>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-100 border border-red-500 rounded"></div>
                <span className="text-gray-600">Critical</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-orange-50 border border-orange-400 rounded"></div>
                <span className="text-gray-600">High</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-50 border border-yellow-400 rounded"></div>
                <span className="text-gray-600">Low</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        {isTransposed ? (
          renderTransposedTable()
        ) : (
          <table className="w-full border-collapse">
            <thead className="bg-gray-50 border-b sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 bg-gray-50 sticky left-0 z-20 border-r">
                  <div className="flex items-center gap-1">
                    Date & Time
                    <Info className="h-3 w-3 text-gray-400" />
                  </div>
                </th>
                {Object.entries(VITAL_CONFIG).map(([key, config]) => (
                  <th key={key} className="px-4 py-3 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">
                    <div className="flex items-center gap-1 group relative">
                      {config.label}
                      <Info className="h-3 w-3 text-gray-400 cursor-help" />
                      {/* Header tooltip */}
                      <div className="invisible group-hover:visible absolute z-10 top-full left-0 mt-1 px-3 py-2 bg-gray-900 text-white text-xs rounded shadow-lg w-64">
                        <div className="font-semibold mb-1">{config.label}</div>
                        <div className="text-gray-300">{config.tooltip}</div>
                        <div className="mt-2 pt-2 border-t border-gray-700">
                          <span className="text-green-300">Normal Range:</span> {config.normal}
                        </div>
                      </div>
                    </div>
                  </th>
                ))}
                {!readOnly && (
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 sticky right-0 bg-gray-50 z-10">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y">
              {sortedDates.map((dateTime) => {
                const obsGroup = grouped[dateTime];
                const date = dateTime !== 'unknown' ? new Date(dateTime) : null;

                // Parse all vitals
                let bpData: VitalValue = { display: '-', value: null, unit: 'mmHg', isAbnormal: false };
                let hrData: VitalValue = { display: '-', value: null, unit: 'bpm', isAbnormal: false };
                let tempData: VitalValue = { display: '-', value: null, unit: '°C', isAbnormal: false };
                let rrData: VitalValue = { display: '-', value: null, unit: '/min', isAbnormal: false };
                let o2Data: VitalValue = { display: '-', value: null, unit: '%', isAbnormal: false };
                let weightData: VitalValue = { display: '-', value: null, unit: 'kg', isAbnormal: false };
                let heightData: VitalValue = { display: '-', value: null, unit: 'cm', isAbnormal: false };

                obsGroup.forEach((obs: any) => {
                  const code = obs.code?.coding?.[0]?.code;

                  if (code === '85354-9' && obs.component) {
                    const sys = obs.component.find((c: any) =>
                      c.code?.coding?.some((code: any) => code.code === '8480-6')
                    );
                    const dia = obs.component.find((c: any) =>
                      c.code?.coding?.some((code: any) => code.code === '8462-4')
                    );
                    const sysVal = sys?.valueQuantity?.value;
                    const diaVal = dia?.valueQuantity?.value;
                    const abnormal = checkAbnormal(code, 0, sysVal, diaVal);
                    bpData = {
                      display: `${sysVal || '-'}/${diaVal || '-'}`,
                      value: { sys: sysVal, dia: diaVal },
                      unit: 'mmHg',
                      isAbnormal: abnormal.isAbnormal,
                      severity: abnormal.severity
                    };
                  } else if (code === '8867-4') {
                    const val = obs.valueQuantity?.value;
                    const abnormal = checkAbnormal(code, val);
                    hrData = {
                      display: `${val || '-'}`,
                      value: val,
                      unit: obs.valueQuantity?.unit || 'bpm',
                      isAbnormal: abnormal.isAbnormal,
                      severity: abnormal.severity
                    };
                  } else if (code === '8310-5') {
                    const val = obs.valueQuantity?.value;
                    const abnormal = checkAbnormal(code, val);
                    tempData = {
                      display: `${val || '-'}`,
                      value: val,
                      unit: obs.valueQuantity?.unit || '°C',
                      isAbnormal: abnormal.isAbnormal,
                      severity: abnormal.severity
                    };
                  } else if (code === '9279-1') {
                    const val = obs.valueQuantity?.value;
                    const abnormal = checkAbnormal(code, val);
                    rrData = {
                      display: `${val || '-'}`,
                      value: val,
                      unit: obs.valueQuantity?.unit || '/min',
                      isAbnormal: abnormal.isAbnormal,
                      severity: abnormal.severity
                    };
                  } else if (code === '59408-5') {
                    const val = obs.valueQuantity?.value;
                    const abnormal = checkAbnormal(code, val);
                    o2Data = {
                      display: `${val || '-'}`,
                      value: val,
                      unit: obs.valueQuantity?.unit || '%',
                      isAbnormal: abnormal.isAbnormal,
                      severity: abnormal.severity
                    };
                  } else if (code === '29463-7') {
                    const val = obs.valueQuantity?.value;
                    weightData = {
                      display: `${val || '-'}`,
                      value: val,
                      unit: obs.valueQuantity?.unit || 'kg',
                      isAbnormal: false
                    };
                  } else if (code === '8302-2') {
                    const val = obs.valueQuantity?.value;
                    heightData = {
                      display: `${val || '-'}`,
                      value: val,
                      unit: obs.valueQuantity?.unit || 'cm',
                      isAbnormal: false
                    };
                  }
                });

                // Calculate BMI
                const bmi = weightData.value && heightData.value ? calculateBMI(weightData.value as number, heightData.value as number) : null;
                const bmiData: VitalValue = {
                  display: bmi ? `${bmi}` : '-',
                  value: bmi,
                  unit: 'kg/m²',
                  isAbnormal: bmi ? (bmi < 18.5 || bmi > 25) : false,
                  severity: bmi ? (bmi < 16 || bmi > 30 ? 'critical' : bmi < 18.5 || bmi > 25 ? 'high' : undefined) : undefined
                };

                return (
                  <tr key={dateTime} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-4 py-3 text-sm bg-white sticky left-0 z-10 border-r">
                      {date ? (
                        <div>
                          <div className="font-semibold text-gray-900">
                            {date.toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {date.toLocaleTimeString()}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-500">Unknown</span>
                      )}
                    </td>
                    <VitalCell vital={bpData} config={VITAL_CONFIG.bp} />
                    <VitalCell vital={hrData} config={VITAL_CONFIG.hr} />
                    <VitalCell vital={tempData} config={VITAL_CONFIG.temp} />
                    <VitalCell vital={rrData} config={VITAL_CONFIG.rr} />
                    <VitalCell vital={o2Data} config={VITAL_CONFIG.o2} />
                    <VitalCell vital={weightData} config={VITAL_CONFIG.weight} />
                    <VitalCell vital={heightData} config={VITAL_CONFIG.height} />
                    <VitalCell vital={bmiData} config={VITAL_CONFIG.bmi} />
                    {!readOnly && (
                      <td className="px-4 py-3 text-right bg-white sticky right-0 z-10">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {onEdit && (
                            <button
                              onClick={() => onEdit(obsGroup[0])}
                              className="p-1.5 hover:bg-primary/10 rounded text-primary transition-colors"
                              title="Edit vitals"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => {
                                if (confirm('Are you sure you want to delete these vital signs?')) {
                                  obsGroup.forEach(obs => onDelete(obs.id));
                                }
                              }}
                              className="p-1.5 hover:bg-red-100 rounded text-red-600 transition-colors"
                              title="Delete vitals"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {observations.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium">No vitals recorded yet</p>
            <p className="text-xs mt-1">Click "Record Vitals" to add measurements</p>
          </div>
        )}
      </div>
    </div>
  );
}
