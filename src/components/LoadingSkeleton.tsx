export function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/4"></div>
            </div>
            <div className="h-12 w-12 bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>
          <div className="flex gap-2 mb-3">
            <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded-full w-16"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded-full w-20"></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
