import type { FilterState } from '../types/application';
import { Select } from './Select';
import { MultiSelect } from './MultiSelect';
import { Typeahead } from './Typeahead';
import { KeywordInput } from './KeywordInput';

interface ParameterPanelProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onApply: () => void;
  onReset: () => void;
  onSavePreset: () => void;
  onLoadPreset: () => void;
  hasPreset: boolean;
}

const NAICS_OPTIONS = [
  { value: '', label: 'All' },
  { value: '541511', label: '541511 - Custom Computer Programming' },
  { value: '541512', label: '541512 - Computer Systems Design' },
  { value: '541513', label: '541513 - Computer Facilities Management' },
  { value: '541519', label: '541519 - Other Computer Related Services' },
  { value: '517311', label: '517311 - Wired Telecom Carriers' },
];

const SET_ASIDE_OPTIONS = [
  { value: '8(a)', label: '8(a) Business Development' },
  { value: 'WOSB', label: 'Women-Owned Small Business' },
  { value: 'SB', label: 'Small Business' },
  { value: 'SDVOSB', label: 'Service-Disabled Veteran-Owned' },
  { value: 'HUBZone', label: 'HUBZone' },
  { value: 'VOSB', label: 'Veteran-Owned Small Business' },
];

const VEHICLE_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'GSA MAS', label: 'GSA MAS' },
  { value: 'Alliant 2', label: 'Alliant 2' },
  { value: 'CIO-SP3', label: 'CIO-SP3' },
];

const AGENCY_OPTIONS = [
  { value: 'GSA', label: 'General Services Administration (GSA)' },
  { value: 'USDA', label: 'Department of Agriculture (USDA)' },
  { value: 'DOE', label: 'Department of Energy (DOE)' },
  { value: 'HHS', label: 'Health & Human Services (HHS)' },
  { value: 'VA', label: 'Department of Veterans Affairs (VA)' },
  { value: 'DHS', label: 'Department of Homeland Security (DHS)' },
  { value: 'DOC', label: 'Department of Commerce (DOC)' },
  { value: 'DOD', label: 'Department of Defense (DOD)' },
  { value: 'NOAA', label: 'National Oceanic & Atmospheric Admin (NOAA)' },
  { value: 'SSA', label: 'Social Security Administration (SSA)' },
];

const PERIOD_CHIPS = [
  { value: '30' as const, label: 'Next 30 days' },
  { value: '60' as const, label: 'Next 60 days' },
  { value: '90' as const, label: 'Next 90 days' },
];

export function ParameterPanel({
  filters,
  onFilterChange,
  onApply,
  onReset,
  onSavePreset,
  onLoadPreset,
  hasPreset,
}: ParameterPanelProps) {
  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const isCustomPeriod = filters.periodType === 'custom';
  const isCeilingValid = !filters.minCeiling || !filters.maxCeiling || parseFloat(filters.minCeiling) <= parseFloat(filters.maxCeiling);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200/80 dark:border-gray-700/70 bg-white dark:bg-gray-800 shadow-sm">
      <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-br from-primary-50 via-transparent to-transparent dark:from-primary-900/30" aria-hidden="true" />
      <div className="relative flex flex-col gap-6 p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-600 dark:text-primary-300">Search</p>
            <h2 className="mt-1 text-xl font-semibold text-gray-900 dark:text-gray-100">Opportunity Criteria</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Tune the filters to zero in on the opportunities that matter.</p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 text-right">
            {hasPreset && (
              <button
                type="button"
                onClick={onLoadPreset}
                className="text-xs font-semibold text-primary-600 dark:text-primary-300 hover:underline"
              >
                Load preset
              </button>
            )}
            <button
              type="button"
              onClick={onSavePreset}
              className="text-xs font-medium text-gray-600 dark:text-gray-300 hover:underline"
            >
              Save current
            </button>
          </div>
        </div>

        <div className="space-y-8">
          <section className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Eligibility</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Refine by the basics first.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                id="naics"
                label="NAICS Code"
                value={filters.naics}
                onChange={(value) => updateFilter('naics', value)}
                options={NAICS_OPTIONS}
                placeholder="Select NAICS code"
              />

              <Select
                id="vehicle"
                label="Vehicle"
                value={filters.vehicle}
                onChange={(value) => updateFilter('vehicle', value)}
                options={VEHICLE_OPTIONS}
                placeholder="Select vehicle"
              />

              <MultiSelect
                id="setAside"
                label="Set-Aside"
                value={filters.setAside}
                onChange={(value) => updateFilter('setAside', value)}
                options={SET_ASIDE_OPTIONS}
                placeholder="Select set-asides"
                className="sm:col-span-2"
              />

              <Typeahead
                id="agency"
                label="Agency"
                value={filters.agency}
                onChange={(value) => updateFilter('agency', value)}
                options={AGENCY_OPTIONS}
                placeholder="Search agencies"
                className="sm:col-span-2"
              />
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Timeline</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pick a quick chip or dial in a custom period.</p>
            </div>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {PERIOD_CHIPS.map(chip => (
                  <button
                    key={chip.value}
                    type="button"
                    onClick={() => updateFilter('periodType', chip.value)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                      filters.periodType === chip.value
                        ? 'bg-primary-600 text-white shadow-sm shadow-primary-500/40'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => updateFilter('periodType', 'custom')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                    isCustomPeriod
                      ? 'bg-primary-600 text-white shadow-sm shadow-primary-500/40'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  aria-pressed={isCustomPeriod}
                >
                  Custom range
                </button>
              </div>
              {isCustomPeriod && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label htmlFor="startDate" className="block text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                      Start date
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      value={filters.startDate}
                      onChange={(e) => updateFilter('startDate', e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="endDate" className="block text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                      End date
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      value={filters.endDate}
                      onChange={(e) => updateFilter('endDate', e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                    />
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Budget</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Filter by ceiling range to match your capacity.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="minCeiling" className="block text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                  Min ($)
                </label>
                <input
                  type="number"
                  id="minCeiling"
                  value={filters.minCeiling}
                  onChange={(e) => updateFilter('minCeiling', e.target.value)}
                  placeholder="0"
                  min="0"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="maxCeiling" className="block text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                  Max ($)
                </label>
                <input
                  type="number"
                  id="maxCeiling"
                  value={filters.maxCeiling}
                  onChange={(e) => updateFilter('maxCeiling', e.target.value)}
                  placeholder="∞"
                  min="0"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
            </div>
            {!isCeilingValid && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-900/30 dark:text-red-300">Min must be less than or equal to max</p>
            )}
          </section>

          <section className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Keywords</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Drop in search terms and we’ll highlight matches instantly.</p>
            </div>
            <KeywordInput
              id="keywords"
              label="Keywords"
              keywords={filters.keywords}
              onChange={(value) => updateFilter('keywords', value)}
            />
          </section>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onApply}
            disabled={!isCeilingValid}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/40 transition hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:shadow-none"
          >
            Apply filters
          </button>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
          >
            Reset all
          </button>
        </div>
      </div>
    </div>
  );
}
