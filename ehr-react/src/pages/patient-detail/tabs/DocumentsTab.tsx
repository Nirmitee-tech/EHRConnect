import React from 'react';
import { FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DocumentsTab() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8">
      <div className="text-center">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Documents</h3>
        <p className="text-sm text-gray-600 mb-4">Document management coming soon</p>
        <Button size="sm" className="bg-primary">
          <Plus className="h-4 w-4 mr-1" />
          Upload Document
        </Button>
      </div>
    </div>
  );
}
