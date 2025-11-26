import React from 'react';

interface ProcedureOrderData {
  procedureCode: string;
  procedureName: string;
  priority: string;
  status: string;
  reasonCode: string;
  reasonDescription: string;
  bodySite: string;
  performerType: string;
  scheduledDate: string;
  instructions: string;
  notes: string;
}

/**
 * ProcedureOrderRenderer - Displays saved procedure order
 */
export function ProcedureOrderRenderer({ data }: { data: any }) {
  const orderData = data as ProcedureOrderData;

  return (
    <div className="space-y-3 text-sm">
      <div className="grid grid-cols-2 gap-4">
        {orderData.procedureCode && (
          <div>
            <span className="font-semibold text-gray-700">Code:</span>
            <p className="text-gray-900 mt-1">{orderData.procedureCode}</p>
          </div>
        )}
        {orderData.procedureName && (
          <div>
            <span className="font-semibold text-gray-700">Procedure:</span>
            <p className="text-gray-900 mt-1">{orderData.procedureName}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {orderData.priority && (
          <div>
            <span className="font-semibold text-gray-700">Priority:</span>
            <p className="text-gray-900 mt-1 capitalize">{orderData.priority}</p>
          </div>
        )}
        {orderData.status && (
          <div>
            <span className="font-semibold text-gray-700">Status:</span>
            <p className="text-gray-900 mt-1 capitalize">{orderData.status.replace(/-/g, ' ')}</p>
          </div>
        )}
        {orderData.scheduledDate && (
          <div>
            <span className="font-semibold text-gray-700">Scheduled:</span>
            <p className="text-gray-900 mt-1">{new Date(orderData.scheduledDate).toLocaleDateString()}</p>
          </div>
        )}
      </div>

      {(orderData.reasonCode || orderData.reasonDescription) && (
        <div>
          <span className="font-semibold text-gray-700">Clinical Indication:</span>
          <p className="text-gray-900 mt-1">
            {orderData.reasonCode && <span className="font-mono">{orderData.reasonCode}</span>}
            {orderData.reasonCode && orderData.reasonDescription && ' - '}
            {orderData.reasonDescription}
          </p>
        </div>
      )}

      {orderData.bodySite && (
        <div>
          <span className="font-semibold text-gray-700">Body Site:</span>
          <p className="text-gray-900 mt-1">{orderData.bodySite}</p>
        </div>
      )}

      {orderData.performerType && (
        <div>
          <span className="font-semibold text-gray-700">Performer:</span>
          <p className="text-gray-900 mt-1 capitalize">{orderData.performerType}</p>
        </div>
      )}

      {orderData.instructions && (
        <div>
          <span className="font-semibold text-gray-700">Instructions:</span>
          <p className="text-gray-900 mt-1 whitespace-pre-wrap">{orderData.instructions}</p>
        </div>
      )}

      {orderData.notes && (
        <div>
          <span className="font-semibold text-gray-700">Notes:</span>
          <p className="text-gray-900 mt-1 whitespace-pre-wrap">{orderData.notes}</p>
        </div>
      )}
    </div>
  );
}
