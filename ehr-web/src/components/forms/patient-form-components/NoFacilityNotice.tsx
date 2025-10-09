import React from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@nirmitee.io/design-system';

export function NoFacilityNotice() {
  return (
    <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-start gap-2">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-blue-900 text-xs font-bold mb-1">No facilities available</p>
          <p className="text-blue-700 text-xs mb-2">
            Before you can create patients, you need to set up at least one healthcare facility.
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              onClick={() => window.open('/admin/facilities/new', '_blank')}
              className="bg-primary hover:bg-primary/90"
            >
              Create First Facility
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => window.open('/admin/facilities', '_blank')}
              className="border-blue-200 hover:bg-blue-50"
            >
              Manage Facilities
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
