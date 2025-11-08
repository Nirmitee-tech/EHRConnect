import React from 'react';

interface GenericRendererProps {
  data: any;
}

/**
 * GenericRenderer - Fallback renderer for unspecified section types
 */
export function GenericRenderer({ data }: GenericRendererProps) {
  const content =
    typeof data === 'string' ? data : JSON.stringify(data, null, 2);

  return (
    <div className="text-sm text-gray-700 whitespace-pre-wrap">
      {content}
    </div>
  );
}
