import type { Application } from '../types/application';
import { format, parseISO } from 'date-fns';
import { useEffect, useRef } from 'react';
import FocusLock from 'react-focus-lock';

interface DetailsDrawerProps {
  application: Application | null;
  onClose: () => void;
  onMarkSubmitted: (id: string) => void;
}

const STAGES = [
  { key: 'Draft' as const, label: 'Draft', icon: '📝' },
  { key: 'Ready' as const, label: 'Ready', icon: '✓' },
  { key: 'Submitted' as const, label: 'Submitted', icon: '📤' },
  { key: 'Awarded' as const, label: 'Awarded/Lost', icon: '🏆' },
];

export function DetailsDrawer({ application, onClose, onMarkSubmitted }: DetailsDrawerProps) {
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (application && document.activeElement instanceof HTMLElement) {
      triggerRef.current = document.activeElement;
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (application) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';

      if (triggerRef.current) {
        triggerRef.current.focus();
      }
    };
  }, [application, onClose]);

  if (!application) return null;

  const getCurrentStageIndex = () => {
    if (application.status === 'Awarded' || application.status === 'Lost') return 3;
    if (application.status === 'Submitted') return 2;
    if (application.status === 'Ready') return 1;
    return 0;
  };

  const currentStageIndex = getCurrentStageIndex();

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <FocusLock returnFocus>
        <div className="fixed inset-y-0 right-0 w-full sm:w-[500px] bg-white dark:bg-gray-800 shadow-xl z-50 overflow-y-auto animate-slide-in">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Application Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Close drawer"
          >
            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{application.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{application.id}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Agency</div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{application.agency}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">NAICS</div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{application.naics}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Vehicle</div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{application.vehicle}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Ceiling</div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                ${application.ceiling.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Due Date</div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {format(parseISO(application.dueDate), 'MMM dd, yyyy')}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Fit Score</div>
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{application.fitScore}</div>
            </div>
          </div>

          <div>
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Set-Aside</div>
            <div className="flex flex-wrap gap-2">
              {application.setAside.map(sa => (
                <span
                  key={sa}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300"
                >
                  {sa}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Keywords</div>
            <div className="flex flex-wrap gap-2">
              {application.keywords.map(kw => (
                <span
                  key={kw}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">Stage Timeline</div>
            <div className="space-y-4">
              {STAGES.map((stage, index) => {
                const isCompleted = index <= currentStageIndex;
                const isCurrent = index === currentStageIndex;
                const isLost = application.status === 'Lost' && stage.key === 'Awarded';

                return (
                  <div key={stage.key} className="flex items-start gap-3">
                    <div className="relative">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                          isCompleted
                            ? isLost
                              ? 'bg-red-100 dark:bg-red-900'
                              : 'bg-primary-100 dark:bg-primary-900'
                            : 'bg-gray-100 dark:bg-gray-700'
                        }`}
                      >
                        {isLost && stage.key === 'Awarded' ? '❌' : stage.icon}
                      </div>
                      {index < STAGES.length - 1 && (
                        <div
                          className={`absolute top-10 left-1/2 w-0.5 h-6 -ml-px ${
                            isCompleted ? 'bg-primary-300 dark:bg-primary-700' : 'bg-gray-200 dark:bg-gray-600'
                          }`}
                        />
                      )}
                    </div>
                    <div className="flex-1 pt-2">
                      <div className={`text-sm font-medium ${
                        isCompleted ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {isLost && stage.key === 'Awarded' ? 'Lost' : stage.label}
                      </div>
                      {isCurrent && (
                        <div className="text-xs text-primary-600 dark:text-primary-400 font-medium mt-0.5">
                          Current Stage
                        </div>
                      )}
                    </div>
                    {isCurrent && isCompleted && (
                      <div className="w-2 h-2 rounded-full bg-primary-600 dark:bg-primary-400 mt-4 animate-pulse" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium text-gray-700 dark:text-gray-300">Completion Progress</span>
              <span className="font-bold text-gray-900 dark:text-gray-100">{application.percentComplete}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-primary-600 dark:bg-primary-500 h-3 rounded-full transition-all"
                style={{ width: `${application.percentComplete}%` }}
              />
            </div>
          </div>

          {application.status === 'Ready' && (
            <button
              onClick={() => onMarkSubmitted(application.id)}
              className="w-full px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Mark as Submitted
            </button>
          )}
        </div>
        </div>
      </FocusLock>
    </>
  );
}
