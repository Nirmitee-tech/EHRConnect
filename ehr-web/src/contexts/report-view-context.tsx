'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type ViewMode = 'dashboard' | 'table';

interface ReportViewContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

const ReportViewContext = createContext<ReportViewContextType | undefined>(undefined);

export function ReportViewProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');

  return (
    <ReportViewContext.Provider value={{ viewMode, setViewMode }}>
      {children}
    </ReportViewContext.Provider>
  );
}

export function useReportView() {
  const context = useContext(ReportViewContext);
  if (context === undefined) {
    throw new Error('useReportView must be used within a ReportViewProvider');
  }
  return context;
}
