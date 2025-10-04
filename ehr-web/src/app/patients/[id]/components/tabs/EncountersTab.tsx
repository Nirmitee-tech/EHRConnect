import React from 'react';
import { Calendar, Activity, Plus } from 'lucide-react';
import { Button, Badge } from '@ehrconnect/design-system';

interface EncountersTabProps {
  encounters: any[];
  observations: any[];
  onNewEncounter: () => void;
}

export function EncountersTab({ encounters, observations, onNewEncounter }: EncountersTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">Encounter Timeline</h2>
        <Button size="sm" className="bg-primary" onClick={onNewEncounter}>
          <Plus className="h-4 w-4 mr-1" />
          New Encounter
        </Button>
      </div>

      <div className="relative">
        {encounters.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
            No encounters recorded
          </div>
        ) : (
          <div className="space-y-4">
            {encounters.map((encounter: any, index: number) => {
              const encounterDate = encounter.period?.start ? new Date(encounter.period.start) : null;
              const encounterDateStr = encounterDate?.toISOString().split('T')[0];

              const encounterVitals = observations.filter((obs: any) => {
                if (!obs.effectiveDateTime) return false;
                const obsDate = new Date(obs.effectiveDateTime).toISOString().split('T')[0];
                return obsDate === encounterDateStr;
              });

              return (
                <div key={encounter.id} className="relative">
                  {index < encounters.length - 1 && (
                    <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-gray-200" style={{ height: 'calc(100% + 1rem)' }} />
                  )}

                  <div className="bg-white rounded-lg border border-gray-200 p-4 ml-0">
                    <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                        encounter.status === 'in-progress' ? 'bg-blue-100' :
                        encounter.status === 'finished' ? 'bg-green-100' :
                        'bg-gray-100'
                      }`}>
                        <Calendar className={`h-6 w-6 ${
                          encounter.status === 'in-progress' ? 'text-blue-600' :
                          encounter.status === 'finished' ? 'text-green-600' :
                          'text-gray-600'
                        }`} />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-sm font-bold text-gray-900">
                                {encounter.type?.[0]?.text || encounter.class?.display || 'Visit'}
                              </h3>
                              <Badge className={`text-xs ${
                                encounter.status === 'finished' ? 'bg-green-50 text-green-700 border-green-200' :
                                encounter.status === 'in-progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                'bg-gray-50 text-gray-700 border-gray-200'
                              }`}>
                                {encounter.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600">
                              {encounterDate ? (
                                <>
                                  {encounterDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                  {' at '}
                                  {encounterDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                </>
                              ) : 'Date unknown'}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-3 text-xs">
                          <div>
                            <span className="text-gray-500">Class</span>
                            <p className="font-medium text-gray-900">{encounter.class?.display || '-'}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Practitioner</span>
                            <p className="font-medium text-gray-900">
                              {encounter.participant?.[0]?.individual?.display || '-'}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Location</span>
                            <p className="font-medium text-gray-900">
                              {encounter.serviceProvider?.display || encounter.location?.[0]?.location?.display || '-'}
                            </p>
                          </div>
                        </div>

                        {encounterVitals.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-2 mb-2">
                              <Activity className="h-4 w-4 text-primary" />
                              <span className="text-xs font-semibold text-gray-700">
                                Vitals Captured ({encounterVitals.length})
                              </span>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                              {encounterVitals.map((vital: any) => {
                                const code = vital.code?.coding?.[0]?.code;
                                let label = '';
                                let value = '';

                                if (code === '85354-9' && vital.component) {
                                  label = 'BP';
                                  const sys = vital.component.find((c: any) =>
                                    c.code?.coding?.some((code: any) => code.code === '8480-6')
                                  );
                                  const dia = vital.component.find((c: any) =>
                                    c.code?.coding?.some((code: any) => code.code === '8462-4')
                                  );
                                  value = `${sys?.valueQuantity?.value || '-'}/${dia?.valueQuantity?.value || '-'}`;
                                } else if (code === '8867-4') {
                                  label = 'HR';
                                  value = `${vital.valueQuantity?.value} bpm`;
                                } else if (code === '8310-5') {
                                  label = 'Temp';
                                  value = `${vital.valueQuantity?.value}°C`;
                                } else if (code === '59408-5') {
                                  label = 'O2';
                                  value = `${vital.valueQuantity?.value}%`;
                                } else if (code === '9279-1') {
                                  label = 'RR';
                                  value = `${vital.valueQuantity?.value}/min`;
                                } else if (code === '29463-7') {
                                  label = 'Weight';
                                  value = `${vital.valueQuantity?.value} kg`;
                                } else if (code === '8302-2') {
                                  label = 'Height';
                                  value = `${vital.valueQuantity?.value} cm`;
                                }

                                return label ? (
                                  <div key={vital.id} className="bg-gray-50 rounded px-2 py-1.5">
                                    <p className="text-xs text-gray-600">{label}</p>
                                    <p className="text-xs font-semibold text-gray-900">{value}</p>
                                  </div>
                                ) : null;
                              })}
                            </div>
                          </div>
                        )}

                        {encounter.reasonCode?.[0] && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <span className="text-xs text-gray-500">Reason for visit</span>
                            <p className="text-xs font-medium text-gray-900 mt-1">
                              {encounter.reasonCode[0].text || encounter.reasonCode[0].coding?.[0]?.display || '-'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
