import { useRef, useEffect, useState, memo, useCallback } from 'react';
import { List, type RowComponentProps } from 'react-window';
import type { Application, SortConfig } from '../types/application';
import { ApplicationCard } from './ApplicationCard';
import { EmptyState } from './EmptyState';
import { LoadingSkeleton } from './LoadingSkeleton';

interface ResultsListProps {
  applications: Application[];
  keywords: string[];
  sortConfig: SortConfig;
  onSortChange: (config: SortConfig) => void;
  onApplicationClick: (app: Application) => void;
  isLoading: boolean;
}

const SORT_OPTIONS = [
  { field: 'dueDate' as const, label: 'Due Date' },
  { field: 'percentComplete' as const, label: '% Complete' },
  { field: 'fitScore' as const, label: 'Fit Score' },
];

const MemoizedApplicationCard = memo(ApplicationCard);

function useResponsiveItemSize() {
  const [itemSize, setItemSize] = useState(() => {
    if (typeof window === 'undefined') return 320;
    const width = window.innerWidth;
    if (width < 640) return 420;
    if (width < 1024) return 340;
    return 320;
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) setItemSize(420);
      else if (width < 1024) setItemSize(340);
      else setItemSize(320);
    };

    let timeoutId: number;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(handleResize, 150);
    };

    window.addEventListener('resize', debouncedResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', debouncedResize);
    };
  }, []);

  return itemSize;
}

function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < breakpoint;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    handleResize();

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [breakpoint]);

  return isMobile;
}

export function ResultsList({
  applications,
  keywords,
  sortConfig,
  onSortChange,
  onApplicationClick,
  isLoading,
}: ResultsListProps) {
  const listRef = useRef<{ scrollToRow: (config: { index: number; align?: string; behavior?: string }) => void; get element(): HTMLDivElement | null } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [listHeight, setListHeight] = useState(600);
  const [announcement, setAnnouncement] = useState('');
  const itemSize = useResponsiveItemSize();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isLoading && applications.length > 0) {
      setAnnouncement(`${applications.length} opportunity${applications.length === 1 ? '' : 'ies'} match the current filters.`);
    } else if (!isLoading && applications.length === 0) {
      setAnnouncement('No opportunities match the current filters.');
    }
  }, [applications.length, isLoading]);

  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const containerHeight = containerRef.current.clientHeight;
        const sortHeader = containerRef.current.querySelector('div:first-child');
        const sortHeaderHeight = sortHeader ? sortHeader.clientHeight : 100;
        const gap = 16;
        const availableHeight = containerHeight - sortHeaderHeight - gap;
        setListHeight(Math.max(300, availableHeight));
      }
    };

    updateHeight();
    
    const resizeObserver = new ResizeObserver(() => {
      updateHeight();
    });
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollToRow({ index: 0 });
    }
  }, [applications.length]);

  const toggleSort = (field: SortConfig['field']) => {
    if (sortConfig.field === field) {
      onSortChange({
        field,
        direction: sortConfig.direction === 'asc' ? 'desc' : 'asc',
      });
    } else {
      onSortChange({ field, direction: 'desc' });
    }
  };

  const Row = useCallback(({ index, style }: RowComponentProps) => {
    const app = applications[index];
    return (
      <div style={style} className="px-1 sm:px-2">
        <div className="pb-6">
          <MemoizedApplicationCard
            application={app}
            keywords={keywords}
            onClick={() => onApplicationClick(app)}
          />
        </div>
      </div>
    );
  }, [applications, keywords, onApplicationClick]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div ref={containerRef} className="h-full flex flex-col overflow-hidden">
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>
      <div className="flex-shrink-0 flex flex-col gap-3 rounded-2xl border border-gray-200/80 bg-white px-4 py-3 shadow-sm dark:border-gray-700/60 dark:bg-gray-900">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Applications</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400" aria-hidden="true">{applications.length} opportunity{applications.length === 1 ? '' : 'ies'} match the current filters.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">Sort</span>
            {SORT_OPTIONS.map(option => (
              <button
                key={option.field}
                onClick={() => toggleSort(option.field)}
                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  sortConfig.field === option.field
                    ? 'border-primary-200 bg-primary-50 text-primary-700 shadow-sm shadow-primary-200/50 dark:border-primary-700 dark:bg-primary-900/40 dark:text-primary-200'
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
                aria-pressed={sortConfig.field === option.field}
                aria-sort={
                  sortConfig.field === option.field
                    ? sortConfig.direction === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : 'none'
                }
              >
                {option.label}
                {sortConfig.field === option.field && (
                  <svg
                    className={`h-3 w-3 transition-transform ${sortConfig.direction === 'asc' ? 'rotate-180' : ''}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <EmptyState />
        </div>
      ) : isMobile ? (
        <div
          role="list"
          aria-label="Applications list"
          aria-live="polite"
          className="flex-1 overflow-y-auto rounded-2xl border border-dashed border-gray-200/60 bg-gray-50/80 px-1 py-3 dark:border-gray-700/60 dark:bg-gray-900"
        >
          <div className="space-y-4">
            {applications.map(app => (
              <div key={app.id} role="listitem" className="px-1">
                <MemoizedApplicationCard
                  application={app}
                  keywords={keywords}
                  onClick={() => onApplicationClick(app)}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div
          role="list"
          aria-label="Applications list"
          aria-live="polite"
          className="flex-1 overflow-hidden rounded-2xl border border-dashed border-gray-200/60 bg-gray-50/80 dark:border-gray-700/60 dark:bg-gray-900 min-h-0"
        >
          <List
            listRef={listRef}
            rowCount={applications.length}
            rowHeight={itemSize}
            rowComponent={Row}
            rowProps={{}}
            style={{ height: listHeight, width: '100%' }}
            className="scrollbar-hide"
            overscanCount={3}
          />
        </div>
      )}
    </div>
  );
}
