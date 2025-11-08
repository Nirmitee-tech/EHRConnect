import React from 'react';

interface FunctionalCognitiveData {
  functionalStatus: string;
  mobility: string;
  adlIndependence: string;
  cognitiveStatus: string;
  orientation: string;
  memory: string;
  attention: string;
  language: string;
  executiveFunction: string;
  behavioralObservations: string;
  notes: string;
}

/**
 * FunctionalCognitiveRenderer - Displays saved functional and cognitive assessment
 */
export function FunctionalCognitiveRenderer({ data }: { data: any }) {
  const funcData = data as FunctionalCognitiveData;

  return (
    <div className="space-y-3 text-sm">
      {funcData.functionalStatus && (
        <div>
          <span className="font-semibold text-gray-700">Functional Status:</span>
          <p className="text-gray-900 mt-1 capitalize">{funcData.functionalStatus.replace(/-/g, ' ')}</p>
        </div>
      )}

      {funcData.mobility && (
        <div>
          <span className="font-semibold text-gray-700">Mobility:</span>
          <p className="text-gray-900 mt-1 whitespace-pre-wrap">{funcData.mobility}</p>
        </div>
      )}

      {funcData.adlIndependence && (
        <div>
          <span className="font-semibold text-gray-700">ADL Independence:</span>
          <p className="text-gray-900 mt-1 whitespace-pre-wrap">{funcData.adlIndependence}</p>
        </div>
      )}

      {funcData.cognitiveStatus && (
        <div>
          <span className="font-semibold text-gray-700">Cognitive Status:</span>
          <p className="text-gray-900 mt-1 capitalize">{funcData.cognitiveStatus.replace(/-/g, ' ')}</p>
        </div>
      )}

      {funcData.orientation && (
        <div>
          <span className="font-semibold text-gray-700">Orientation:</span>
          <p className="text-gray-900 mt-1 whitespace-pre-wrap">{funcData.orientation}</p>
        </div>
      )}

      {funcData.memory && (
        <div>
          <span className="font-semibold text-gray-700">Memory:</span>
          <p className="text-gray-900 mt-1 whitespace-pre-wrap">{funcData.memory}</p>
        </div>
      )}

      {funcData.attention && (
        <div>
          <span className="font-semibold text-gray-700">Attention & Concentration:</span>
          <p className="text-gray-900 mt-1 whitespace-pre-wrap">{funcData.attention}</p>
        </div>
      )}

      {funcData.language && (
        <div>
          <span className="font-semibold text-gray-700">Language & Communication:</span>
          <p className="text-gray-900 mt-1 whitespace-pre-wrap">{funcData.language}</p>
        </div>
      )}

      {funcData.executiveFunction && (
        <div>
          <span className="font-semibold text-gray-700">Executive Function:</span>
          <p className="text-gray-900 mt-1 whitespace-pre-wrap">{funcData.executiveFunction}</p>
        </div>
      )}

      {funcData.behavioralObservations && (
        <div>
          <span className="font-semibold text-gray-700">Behavioral Observations:</span>
          <p className="text-gray-900 mt-1 whitespace-pre-wrap">{funcData.behavioralObservations}</p>
        </div>
      )}

      {funcData.notes && (
        <div>
          <span className="font-semibold text-gray-700">Additional Notes:</span>
          <p className="text-gray-900 mt-1 whitespace-pre-wrap">{funcData.notes}</p>
        </div>
      )}
    </div>
  );
}
