export type ApplicationStatus = 'Draft' | 'Ready' | 'Submitted' | 'Awarded' | 'Lost';

export interface Application {
  id: string;
  title: string;
  agency: string;
  naics: string;
  setAside: string[];
  vehicle: string;
  dueDate: string;
  status: ApplicationStatus;
  percentComplete: number;
  fitScore: number;
  ceiling: number;
  keywords: string[];
}

export interface FilterState {
  naics: string;
  setAside: string[];
  vehicle: string;
  agency: string[];
  periodType: 'custom' | '30' | '60' | '90';
  startDate: string;
  endDate: string;
  minCeiling: string;
  maxCeiling: string;
  keywords: string[];
}

export interface SortConfig {
  field: 'dueDate' | 'percentComplete' | 'fitScore';
  direction: 'asc' | 'desc';
}

export interface Preset {
  name: string;
  filters: FilterState;
  timestamp: number;
}
