import React from 'react';

interface FormSectionProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}

export function FormSection({ title, icon: Icon, children }: FormSectionProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
        <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center">
          <Icon className="h-3.5 w-3.5 text-white" />
        </div>
        <h3 className="text-sm font-bold text-gray-900">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}
