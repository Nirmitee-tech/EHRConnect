import React from 'react';

interface ErrorMessageProps {
  error?: string;
}

export function ErrorMessage({ error }: ErrorMessageProps) {
  if (!error) return null;

  return (
    <p className="text-red-600 text-xs mt-0.5 flex items-center gap-1 font-medium">
      <span className="w-1 h-1 bg-red-600 rounded-full" />
      {error}
    </p>
  );
}
