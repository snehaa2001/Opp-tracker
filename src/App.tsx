import { useState, useEffect, useMemo } from 'react';
import type { Application, FilterState, SortConfig, Preset } from './types/application';
import { ParameterPanel } from './components/ParameterPanel';
import { ResultsList } from './components/ResultsList';
import { Dashboard } from './components/Dashboard';
import { DetailsDrawer } from './components/DetailsDrawer';
import { MobileDrawer } from './components/MobileDrawer';
import { Toast } from './components/Toast';
import { DarkModeToggle } from './components/DarkModeToggle';
import { filterApplications, getInitialFilters } from './utils/filters.tsx';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useDarkMode } from './hooks/useDarkMode';
import { useDebounce } from './hooks/useDebounce';
import applicationsData from './data/applications.json';
import { parseISO } from 'date-fns';

function App() {
  const [darkMode, setDarkMode] = useDarkMode();
  const [applications, setApplications] = useState<Application[]>(applicationsData as Application[]);
  const [filters, setFilters] = useState<FilterState>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.toString()) {
      return {
        naics: params.get('naics') || '',
        setAside: params.get('setAside')?.split(',').filter(Boolean) || [],
        vehicle: params.get('vehicle') || '',
        agency: params.get('agency')?.split(',').filter(Boolean) || [],
        periodType: (params.get('periodType') as FilterState['periodType']) || 'custom',
        startDate: params.get('startDate') || '',
        endDate: params.get('endDate') || '',
        minCeiling: params.get('minCeiling') || '',
        maxCeiling: params.get('maxCeiling') || '',
        keywords: params.get('keywords')?.split(',').filter(Boolean) || [],
      };
    }
    return getInitialFilters();
  });

  const [appliedFilters, setAppliedFilters] = useState<FilterState>(filters);
  const [sortConfig, setSortConfig] = useLocalStorage<SortConfig>('sortConfig', {
    field: 'dueDate',
    direction: 'asc',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [preset, setPreset] = useLocalStorage<Preset | null>('filterPreset', null);
  const [quickFilters, setQuickFilters] = useState<{
    due30: boolean;
    gsaOnly: boolean;
    highFit: boolean;
  }>({ due30: false, gsaOnly: false, highFit: false });
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isMobileDashboardOpen, setIsMobileDashboardOpen] = useState(false);

  const debouncedFilters = useDebounce(appliedFilters, 300);

  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(appliedFilters).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        params.set(key, value.join(','));
      } else if (value && !Array.isArray(value)) {
        params.set(key, String(value));
      }
    });
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  }, [appliedFilters]);

  const filteredAndSorted = useMemo(() => {
    let result = filterApplications(applications, debouncedFilters);

    if (quickFilters.due30) {
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      result = result.filter(app => {
        const dueDate = parseISO(app.dueDate);
        return dueDate >= now && dueDate <= thirtyDaysFromNow;
      });
    }

    if (quickFilters.gsaOnly) {
      result = result.filter(app => app.agency === 'GSA');
    }

    if (quickFilters.highFit) {
      result = result.filter(app => app.fitScore >= 80);
    }

    return result.sort((a, b) => {
      let aValue: number | string = a[sortConfig.field];
      let bValue: number | string = b[sortConfig.field];

      if (sortConfig.field === 'dueDate') {
        aValue = parseISO(a.dueDate).getTime();
        bValue = parseISO(b.dueDate).getTime();
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [applications, debouncedFilters, sortConfig, quickFilters]);

  const handleApply = () => {
    setIsLoading(true);
    setAppliedFilters(filters);
    setTimeout(() => setIsLoading(false), 500);
  };

  const handleReset = () => {
    const initial = getInitialFilters();
    setFilters(initial);
    setAppliedFilters(initial);
    setQuickFilters({ due30: false, gsaOnly: false, highFit: false });
  };

  const handleSavePreset = () => {
    setPreset({
      name: 'My Preset',
      filters,
      timestamp: Date.now(),
    });
    setToast('Preset saved successfully');
  };

  const handleLoadPreset = () => {
    if (preset) {
      setFilters(preset.filters);
      setAppliedFilters(preset.filters);
      setToast('Preset loaded');
    }
  };

  const handleMarkSubmitted = (id: string) => {
    setApplications(apps =>
      apps.map(app =>
        app.id === id ? { ...app, status: 'Submitted', percentComplete: 100 } : app
      )
    );
    setSelectedApplication(null);
    setToast('Application marked as submitted');
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 100));

      const headers = ['ID', 'Title', 'Agency', 'NAICS', 'Set-Aside', 'Vehicle', 'Due Date', 'Status', '% Complete', 'Fit Score', 'Ceiling'];
      const rows = filteredAndSorted.map(app => [
        app.id,
        `"${app.title}"`,
        app.agency,
        app.naics,
        `"${app.setAside.join(', ')}"`,
        app.vehicle,
        app.dueDate,
        app.status,
        app.percentComplete,
        app.fitScore,
        app.ceiling,
      ]);

      const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gsa-applications-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setToast('CSV exported successfully');
    } catch (error) {
      setToast('Failed to export CSV');
      console.error('CSV export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 transition-colors flex flex-col overflow-hidden">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 z-30">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="xl:hidden p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Open filters"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">GSA Opportunity Tracker</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExportCSV}
                disabled={isExporting}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={isExporting ? 'Exporting CSV...' : 'Export CSV'}
              >
                {isExporting ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
                {isExporting ? 'Exporting...' : 'Export CSV'}
              </button>
              <DarkModeToggle darkMode={darkMode} onToggle={() => setDarkMode(!darkMode)} />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden max-w-[1800px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 xl:py-6">
        <div className="h-full flex gap-4 xl:gap-6">
          <section className="hidden xl:block xl:w-[360px] flex-shrink-0 overflow-hidden">
            <div className="h-full overflow-y-auto scrollbar-hide">
              <ParameterPanel
                filters={filters}
                onFilterChange={setFilters}
                onApply={handleApply}
                onReset={handleReset}
                onSavePreset={handleSavePreset}
                onLoadPreset={handleLoadPreset}
                hasPreset={!!preset}
              />
            </div>
          </section>

          <section className="flex-1 flex flex-col gap-4 overflow-hidden min-w-0">
            <div className="flex-shrink-0 flex flex-wrap items-center gap-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-2 shadow-sm">
              <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Quick Filters
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setQuickFilters(prev => ({ ...prev, due30: !prev.due30 }))}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                    quickFilters.due30
                      ? 'bg-primary-600 text-white shadow-sm shadow-primary-200/60'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Due in 30 days
                </button>
                <button
                  onClick={() => setQuickFilters(prev => ({ ...prev, gsaOnly: !prev.gsaOnly }))}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                    quickFilters.gsaOnly
                      ? 'bg-primary-600 text-white shadow-sm shadow-primary-200/60'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  GSA only
                </button>
                <button
                  onClick={() => setQuickFilters(prev => ({ ...prev, highFit: !prev.highFit }))}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                    quickFilters.highFit
                      ? 'bg-primary-600 text-white shadow-sm shadow-primary-200/60'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  ≥80 fit score
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden min-h-0">
              <ResultsList
                applications={filteredAndSorted}
                keywords={appliedFilters.keywords}
                sortConfig={sortConfig}
                onSortChange={setSortConfig}
                onApplicationClick={setSelectedApplication}
                isLoading={isLoading}
              />
            </div>
          </section>

          <section className="hidden xl:block xl:w-[380px] flex-shrink-0 overflow-hidden">
            <div className="h-full overflow-y-auto scrollbar-hide">
              <Dashboard applications={filteredAndSorted} />
            </div>
          </section>

          <div className="xl:hidden fixed right-0 top-1/2 -translate-y-1/2 z-40">
            <button
              onClick={() => setIsMobileDashboardOpen(true)}
              className="bg-primary-600 text-white p-3 rounded-l-lg shadow-lg hover:bg-primary-700 transition-colors"
              aria-label="Open dashboard"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
        </div>
      </main>

      <MobileDrawer
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        title="Filters"
      >
        <ParameterPanel
          filters={filters}
          onFilterChange={setFilters}
          onApply={() => {
            handleApply();
            setIsMobileFilterOpen(false);
          }}
          onReset={handleReset}
          onSavePreset={handleSavePreset}
          onLoadPreset={handleLoadPreset}
          hasPreset={!!preset}
        />
      </MobileDrawer>

      <MobileDrawer
        isOpen={isMobileDashboardOpen}
        onClose={() => setIsMobileDashboardOpen(false)}
        title="Dashboard"
      >
        <Dashboard applications={filteredAndSorted} />
      </MobileDrawer>

      <DetailsDrawer
        application={selectedApplication}
        onClose={() => setSelectedApplication(null)}
        onMarkSubmitted={handleMarkSubmitted}
      />

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

export default App;
