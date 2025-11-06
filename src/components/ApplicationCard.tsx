import type { Application } from '../types/application';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { highlightKeywords } from '../utils/filters.tsx';

interface ApplicationCardProps {
  application: Application;
  keywords: string[];
  onClick: () => void;
}

const STATUS_BADGES: Record<Application['status'], string> = {
  Draft: 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200 dark:bg-slate-800/60 dark:text-slate-200 dark:ring-slate-700',
  Ready: 'bg-blue-100 text-blue-700 ring-1 ring-inset ring-blue-200 dark:bg-blue-900/40 dark:text-blue-200 dark:ring-blue-800',
  Submitted: 'bg-purple-100 text-purple-700 ring-1 ring-inset ring-purple-200 dark:bg-purple-900/40 dark:text-purple-200 dark:ring-purple-800',
  Awarded: 'bg-emerald-100 text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-200 dark:ring-emerald-800',
  Lost: 'bg-rose-100 text-rose-700 ring-1 ring-inset ring-rose-200 dark:bg-rose-900/40 dark:text-rose-200 dark:ring-rose-800',
};

export function ApplicationCard({ application, keywords, onClick }: ApplicationCardProps) {
  const dueDate = parseISO(application.dueDate);
  const relativeDate = formatDistanceToNow(dueDate, { addSuffix: true });
  const exactDate = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(dueDate);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative w-full rounded-2xl border border-gray-200/80 bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-primary-200 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:border-gray-700/60 dark:bg-gray-900 sm:p-5"
      aria-label={`Open details for ${application.title}`}
    >
      <span className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-500/5 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-[0.25em] text-gray-400 dark:text-gray-500">
            <span>{application.agency}</span>
            <span aria-hidden="true">•</span>
            <span>{application.naics}</span>
          </div>
          <h3 className="text-lg font-semibold leading-snug text-gray-900 transition group-hover:text-primary-700 dark:text-gray-50 dark:group-hover:text-primary-300">
            {highlightKeywords(application.title, keywords)}
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_BADGES[application.status]}`}>
              {application.status}
            </span>
            {application.setAside.map(sa => (
              <span
                key={sa}
                className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-2.5 py-1 text-[11px] font-semibold text-primary-700 ring-1 ring-inset ring-primary-200/70 dark:bg-primary-900/40 dark:text-primary-200 dark:ring-primary-700/60"
              >
                {sa}
              </span>
            ))}
          </div>
        </div>
        <div className="flex w-full items-center justify-between gap-3 rounded-xl bg-gray-50/80 px-4 py-3 text-sm dark:bg-gray-800/70 sm:w-auto sm:flex-col sm:items-end sm:justify-start sm:gap-1 sm:rounded-none sm:bg-transparent sm:p-0 sm:text-right">
          <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">Fit</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-primary-600 dark:text-primary-300">{application.fitScore}</span>
            <span className="rounded-full bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">/100</span>
          </div>
        </div>
      </div>

      <div className="relative mt-5 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-100/80 bg-gray-50/60 p-3 text-sm dark:border-gray-700/60 dark:bg-gray-800/60">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Vehicle</p>
          <p className="mt-1 font-medium text-gray-900 dark:text-gray-100">{application.vehicle}</p>
        </div>
        <div className="rounded-xl border border-gray-100/80 bg-gray-50/60 p-3 text-sm dark:border-gray-700/60 dark:bg-gray-800/60">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Ceiling</p>
          <p className="mt-1 font-medium text-gray-900 dark:text-gray-100">${(application.ceiling / 1_000_000).toFixed(1)}M</p>
        </div>
        <div className="rounded-xl border border-gray-100/80 bg-gray-50/60 p-3 text-sm dark:border-gray-700/60 dark:bg-gray-800/60">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Due</p>
          <p className="mt-1 font-medium text-gray-900 dark:text-gray-100" title={application.dueDate}>
            {relativeDate}
            <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">({exactDate})</span>
          </p>
        </div>
        <div className="rounded-xl border border-gray-100/80 bg-gray-50/60 p-3 text-sm dark:border-gray-700/60 dark:bg-gray-800/60">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Progress</p>
          <p className="mt-1 font-medium text-gray-900 dark:text-gray-100">{application.percentComplete}%</p>
        </div>
      </div>

      <div className="relative mt-5 sm:mt-4">
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className="h-full w-0 rounded-full bg-gradient-to-r from-primary-500 via-primary-400 to-primary-600 transition-[width] duration-500 ease-out"
            style={{ width: `${application.percentComplete}%` }}
          />
        </div>
      </div>
    </button>
  );
}
