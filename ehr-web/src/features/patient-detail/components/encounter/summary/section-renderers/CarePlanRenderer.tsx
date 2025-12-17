import React from 'react';

interface CarePlanRendererProps {
  data: any; // Flexible type to handle both new and legacy care plan formats
}

/**
 * CarePlanRenderer - Renders care plan content
 */
export function CarePlanRenderer({ data }: CarePlanRendererProps) {
  return (
    <div className="space-y-4 text-sm">
      {/* Care Plan Metadata */}
      {(data.status || data.intent || data.title) && (
        <div className="grid grid-cols-3 gap-3 p-3 bg-primary/5 rounded border border-primary/20">
          {data.status && (
            <div>
              <span className="font-medium text-primary/80">Status:</span>{' '}
              <span className="text-primary capitalize">{data.status}</span>
            </div>
          )}
          {data.intent && (
            <div>
              <span className="font-medium text-primary/80">Intent:</span>{' '}
              <span className="text-primary capitalize">{data.intent}</span>
            </div>
          )}
          {data.title && (
            <div className="col-span-3">
              <span className="font-medium text-primary/80">Title:</span>{' '}
              <span className="text-primary">{data.title}</span>
            </div>
          )}
          {data.description && (
            <div className="col-span-3">
              <span className="font-medium text-primary/80">Description:</span>{' '}
              <span className="text-primary">{data.description}</span>
            </div>
          )}
        </div>
      )}

      {/* Activities */}
      {data.activities && data.activities.length > 0 && (
        <div>
          <p className="font-semibold text-gray-900 mb-2">Activities:</p>
          <div className="space-y-3">
            {data.activities.map((activity: any, i: number) => (
              <div key={i} className="p-3 bg-gray-50 rounded border border-gray-200">
                <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                  <div>
                    <span className="font-medium">Code:</span> {activity.code}
                  </div>
                  <div>
                    <span className="font-medium">Scheduled:</span> {activity.date}
                  </div>
                  <div>
                    <span className="font-medium">Type:</span> {activity.type}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>{' '}
                    <span className="capitalize">{activity.status?.replace(/-/g, ' ')}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium">Description:</span> {activity.description}
                  </div>
                </div>

                {/* Activity Reason */}
                {activity.reason && (
                  <div className="mt-2 pt-2 border-t border-gray-300">
                    <p className="text-xs font-medium text-gray-700 mb-1">Reason:</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="font-medium">Code:</span> {activity.reason.reasonCode}
                      </div>
                      <div>
                        <span className="font-medium">Status:</span>{' '}
                        <span className="capitalize">
                          {activity.reason.reasonStatus?.replace(/-/g, ' ')}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Start:</span>{' '}
                        {activity.reason.reasonRecordingDate}
                      </div>
                      {activity.reason.reasonEndDate && (
                        <div>
                          <span className="font-medium">End:</span>{' '}
                          {activity.reason.reasonEndDate}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legacy format support */}
      {data.goals && (
        <div>
          <p className="font-semibold text-gray-900">Goals:</p>
          <p className="text-gray-700 whitespace-pre-wrap">{data.goals}</p>
        </div>
      )}
      {data.interventions && (
        <div>
          <p className="font-semibold text-gray-900">Interventions:</p>
          <p className="text-gray-700 whitespace-pre-wrap">{data.interventions}</p>
        </div>
      )}
      {data.outcomes && (
        <div>
          <p className="font-semibold text-gray-900">Expected Outcomes:</p>
          <p className="text-gray-700 whitespace-pre-wrap">{data.outcomes}</p>
        </div>
      )}
    </div>
  );
}
