export function EmptyState() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
      <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No applications found</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-4">Try adjusting your filters to find more opportunities</p>
      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
        <p>• Remove some filters to broaden your search</p>
        <p>• Try different NAICS codes or agencies</p>
        <p>• Adjust the date range or ceiling limits</p>
      </div>
    </div>
  );
}
