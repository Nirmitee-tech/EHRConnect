import React from 'react';

interface GenericAdministrativeData {
  title: string;
  category: string;
  content: string;
  dueDate?: string;
  priority?: string;
  status?: string;
  assignedTo?: string;
  notes: string;
}

/**
 * GenericAdministrativeRenderer - Displays saved administrative data
 */
export function GenericAdministrativeRenderer({ data }: { data: any }) {
  const adminData = data as GenericAdministrativeData;

  return (
    <div className="space-y-3 text-sm">
      {adminData.title && (
        <div>
          <span className="font-semibold text-gray-700">Title:</span>
          <p className="text-gray-900 mt-1 font-medium">{adminData.title}</p>
        </div>
      )}

      {adminData.category && (
        <div>
          <span className="font-semibold text-gray-700">Category:</span>
          <p className="text-gray-900 mt-1 capitalize">{adminData.category.replace(/-/g, ' ')}</p>
        </div>
      )}

      {adminData.content && (
        <div>
          <span className="font-semibold text-gray-700">Content:</span>
          <p className="text-gray-900 mt-1 whitespace-pre-wrap">{adminData.content}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {adminData.dueDate && (
          <div>
            <span className="font-semibold text-gray-700">Due Date:</span>
            <p className="text-gray-900 mt-1">{new Date(adminData.dueDate).toLocaleDateString()}</p>
          </div>
        )}

        {adminData.priority && (
          <div>
            <span className="font-semibold text-gray-700">Priority:</span>
            <p className="text-gray-900 mt-1 capitalize">{adminData.priority}</p>
          </div>
        )}

        {adminData.status && (
          <div>
            <span className="font-semibold text-gray-700">Status:</span>
            <p className="text-gray-900 mt-1 capitalize">{adminData.status.replace(/-/g, ' ')}</p>
          </div>
        )}

        {adminData.assignedTo && (
          <div>
            <span className="font-semibold text-gray-700">Assigned To:</span>
            <p className="text-gray-900 mt-1">{adminData.assignedTo}</p>
          </div>
        )}
      </div>

      {adminData.notes && (
        <div>
          <span className="font-semibold text-gray-700">Notes:</span>
          <p className="text-gray-900 mt-1 whitespace-pre-wrap">{adminData.notes}</p>
        </div>
      )}
    </div>
  );
}
