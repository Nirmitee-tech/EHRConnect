import React from 'react';

interface ImagingOrdersData {
  imagingType: string;
  procedureCode: string;
  bodySite: string;
  laterality: string;
  priority: string;
  indication: string;
  clinicalQuestion: string;
  contrast: string;
  scheduledDate: string;
  performingFacility: string;
  specialInstructions: string;
  notes: string;
}

/**
 * ImagingOrdersRenderer - Displays saved imaging order
 */
export function ImagingOrdersRenderer({ data }: { data: any }) {
  const imagingData = data as ImagingOrdersData;

  return (
    <div className="space-y-3 text-sm">
      <div className="grid grid-cols-2 gap-4">
        {imagingData.imagingType && (
          <div>
            <span className="font-semibold text-gray-700">Type:</span>
            <p className="text-gray-900 mt-1 uppercase">{imagingData.imagingType.replace(/-/g, ' ')}</p>
          </div>
        )}
        {imagingData.procedureCode && (
          <div>
            <span className="font-semibold text-gray-700">Code:</span>
            <p className="text-gray-900 mt-1 font-mono">{imagingData.procedureCode}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {imagingData.bodySite && (
          <div>
            <span className="font-semibold text-gray-700">Body Site:</span>
            <p className="text-gray-900 mt-1">{imagingData.bodySite}</p>
          </div>
        )}
        {imagingData.laterality && imagingData.laterality !== 'n/a' && (
          <div>
            <span className="font-semibold text-gray-700">Laterality:</span>
            <p className="text-gray-900 mt-1 capitalize">{imagingData.laterality}</p>
          </div>
        )}
        {imagingData.priority && (
          <div>
            <span className="font-semibold text-gray-700">Priority:</span>
            <p className="text-gray-900 mt-1 capitalize">{imagingData.priority}</p>
          </div>
        )}
      </div>

      {imagingData.indication && (
        <div>
          <span className="font-semibold text-gray-700">Clinical Indication:</span>
          <p className="text-gray-900 mt-1 whitespace-pre-wrap">{imagingData.indication}</p>
        </div>
      )}

      {imagingData.clinicalQuestion && (
        <div>
          <span className="font-semibold text-gray-700">Clinical Question:</span>
          <p className="text-gray-900 mt-1 whitespace-pre-wrap">{imagingData.clinicalQuestion}</p>
        </div>
      )}

      {imagingData.contrast && (
        <div>
          <span className="font-semibold text-gray-700">Contrast:</span>
          <p className="text-gray-900 mt-1 capitalize">{imagingData.contrast.replace(/-/g, ' ')}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {imagingData.scheduledDate && (
          <div>
            <span className="font-semibold text-gray-700">Scheduled:</span>
            <p className="text-gray-900 mt-1">
              {new Date(imagingData.scheduledDate).toLocaleDateString()}
            </p>
          </div>
        )}
        {imagingData.performingFacility && (
          <div>
            <span className="font-semibold text-gray-700">Facility:</span>
            <p className="text-gray-900 mt-1">{imagingData.performingFacility}</p>
          </div>
        )}
      </div>

      {imagingData.specialInstructions && (
        <div>
          <span className="font-semibold text-gray-700">Special Instructions:</span>
          <p className="text-gray-900 mt-1 whitespace-pre-wrap">{imagingData.specialInstructions}</p>
        </div>
      )}

      {imagingData.notes && (
        <div>
          <span className="font-semibold text-gray-700">Notes:</span>
          <p className="text-gray-900 mt-1 whitespace-pre-wrap">{imagingData.notes}</p>
        </div>
      )}
    </div>
  );
}
