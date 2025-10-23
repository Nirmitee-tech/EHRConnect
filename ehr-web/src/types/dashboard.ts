export type DashboardDataMode = 'actual' | 'demo';

export interface DashboardChart {
  type: 'line' | 'bar' | 'pie' | 'area' | 'doughnut';
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor?: string | string[];
      backgroundColor?: string | string[];
      [key: string]: any;
    }[];
  };
  options?: any;
}

export interface DashboardSummaryMetric {
  id: string;
  title: string;
  value?: number;
  displayValue?: string;
  unit?: string;
  change?: number;
  changeDisplay?: string;
  changeLabel?: string;
  changeDirection?: 'up' | 'down' | 'flat';
  status?: 'on_track' | 'trending_up' | 'needs_attention' | 'positive' | 'warning' | 'neutral';
  target?: number;
  trend?: number[];
}

export interface DashboardTableColumn {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
}

export interface DashboardTableRow {
  status?: 'positive' | 'warning' | 'neutral';
  [key: string]: string | number | null | undefined;
}

export interface DashboardTable {
  columns: DashboardTableColumn[];
  rows: DashboardTableRow[];
}

export interface DashboardAction {
  label: string;
  href?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export interface DashboardWorklistItem {
  title: string;
  due?: string;
  impact?: string;
  owner?: string;
  href?: string;
}

export interface DashboardSection {
  id: string;
  title: string;
  description?: string;
  type: 'table' | 'worklist' | 'actions' | 'metrics';
  table?: DashboardTable;
  items?: DashboardWorklistItem[];
  actions?: DashboardAction[];
  metrics?: DashboardSummaryMetric[];
}

export interface DashboardInsight {
  id: string;
  title: string;
  body: string;
  severity?: 'positive' | 'warning' | 'neutral';
  recommendedAction?: string;
}

export interface DashboardFilters {
  availableLocations?: { id: string; name: string }[];
  supportedRanges?: string[];
  [key: string]: unknown;
}

export interface DashboardSnapshotPayload {
  meta: {
    title?: string;
    description?: string;
    defaultActions?: DashboardAction[];
    recommendedFilters?: string[];
    owner?: string;
    roleLevel: string;
    dataMode: DashboardDataMode;
    orgId?: string | null;
    locationIds?: string[] | null;
    period?: {
      start?: string;
      end?: string;
    };
    generatedAt?: string;
    fallbackUsed?: boolean;
    fallbackReasons?: string[];
  };
  summary: DashboardSummaryMetric[];
  sections: DashboardSection[];
  insights: DashboardInsight[];
  filters?: DashboardFilters;
}
