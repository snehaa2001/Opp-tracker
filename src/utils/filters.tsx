import React from 'react';
import type { Application, FilterState } from '../types/application';
import { addDays, isWithinInterval, parseISO } from 'date-fns';

export function filterApplications(applications: Application[], filters: FilterState): Application[] {
  return applications.filter(app => {
    if (filters.naics && app.naics !== filters.naics) {
      return false;
    }

    if (filters.setAside.length > 0) {
      const hasMatch = filters.setAside.some(sa => app.setAside.includes(sa));
      if (!hasMatch) return false;
    }

    if (filters.vehicle && app.vehicle !== filters.vehicle) {
      return false;
    }

    if (filters.agency.length > 0 && !filters.agency.includes(app.agency)) {
      return false;
    }

    if (filters.periodType !== 'custom') {
      const days = parseInt(filters.periodType);
      const today = new Date();
      const endDate = addDays(today, days);
      const dueDate = parseISO(app.dueDate);
      if (!isWithinInterval(dueDate, { start: today, end: endDate })) {
        return false;
      }
    } else if (filters.startDate && filters.endDate) {
      const dueDate = parseISO(app.dueDate);
      const start = parseISO(filters.startDate);
      const end = parseISO(filters.endDate);
      if (!isWithinInterval(dueDate, { start, end })) {
        return false;
      }
    }

    if (filters.minCeiling && app.ceiling < parseFloat(filters.minCeiling)) {
      return false;
    }

    if (filters.maxCeiling && app.ceiling > parseFloat(filters.maxCeiling)) {
      return false;
    }

    if (filters.keywords.length > 0) {
      const searchText = `${app.title} ${app.keywords.join(' ')}`.toLowerCase();
      const hasMatch = filters.keywords.some(kw =>
        searchText.includes(kw.toLowerCase())
      );
      if (!hasMatch) return false;
    }

    return true;
  });
}

export function highlightKeywords(text: string, keywords: string[]): React.ReactNode {
  if (keywords.length === 0) return text;

  const regex = new RegExp(`(${keywords.join('|')})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (keywords.some(kw => kw.toLowerCase() === part.toLowerCase())) {
      return <mark key={index} className="bg-yellow-200 dark:bg-yellow-900 px-0.5">{part}</mark>;
    }
    return part;
  });
}

export function getInitialFilters(): FilterState {
  return {
    naics: '',
    setAside: [],
    vehicle: '',
    agency: [],
    periodType: 'custom',
    startDate: '',
    endDate: '',
    minCeiling: '',
    maxCeiling: '',
    keywords: [],
  };
}
