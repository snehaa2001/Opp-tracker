import type { Application, ApplicationStatus } from '../types/application';

interface DashboardProps {
  applications: Application[];
}

const STATUS_COLORS = {
  Draft: { bg: 'bg-gray-500', label: 'Draft' },
  Ready: { bg: 'bg-blue-500', label: 'Ready' },
  Submitted: { bg: 'bg-purple-500', label: 'Submitted' },
  Awarded: { bg: 'bg-green-500', label: 'Awarded' },
  Lost: { bg: 'bg-red-500', label: 'Lost' },
};

export function Dashboard({ applications }: DashboardProps) {
  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<ApplicationStatus, number>);

  const totalApps = applications.length;
  const avgComplete = totalApps > 0
    ? Math.round(applications.reduce((sum, app) => sum + app.percentComplete, 0) / totalApps)
    : 0;

  const statuses: ApplicationStatus[] = ['Draft', 'Ready', 'Submitted', 'Awarded', 'Lost'];
  const donutData = statuses.map(status => ({
    status,
    count: statusCounts[status] || 0,
    percentage: totalApps > 0 ? ((statusCounts[status] || 0) / totalApps) * 100 : 0,
  }));

  let cumulativePercentage = 0;
  const donutSegments = donutData.map(item => {
    const startPercentage = cumulativePercentage;
    cumulativePercentage += item.percentage;
    return {
      ...item,
      startPercentage,
      endPercentage: cumulativePercentage,
    };
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Progress Dashboard</h2>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {statuses.map(status => (
          <div key={status} className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {statusCounts[status] || 0}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">{status}</div>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-center mb-4">
          <svg className="w-40 h-40" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="currentColor"
              strokeWidth="10"
              className="text-gray-200 dark:text-gray-700"
            />
            {donutSegments.map((segment, index) => {
              if (segment.count === 0) return null;
              const startAngle = (segment.startPercentage / 100) * 360 - 90;
              const endAngle = (segment.endPercentage / 100) * 360 - 90;
              const largeArc = segment.percentage > 50 ? 1 : 0;

              const startX = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
              const startY = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
              const endX = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
              const endY = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);

              const pathData = `M 50 50 L ${startX} ${startY} A 40 40 0 ${largeArc} 1 ${endX} ${endY} Z`;

              return (
                <path
                  key={index}
                  d={pathData}
                  fill="currentColor"
                  className={STATUS_COLORS[segment.status].bg.replace('bg-', 'text-')}
                  opacity="0.9"
                />
              );
            })}
            <circle cx="50" cy="50" r="25" fill="currentColor" className="text-white dark:text-gray-800" />
            <text
              x="50"
              y="48"
              textAnchor="middle"
              className="text-xl font-bold fill-current text-gray-900 dark:text-gray-100"
            >
              {totalApps}
            </text>
            <text
              x="50"
              y="58"
              textAnchor="middle"
              className="text-xs fill-current text-gray-600 dark:text-gray-400"
            >
              Total
            </text>
          </svg>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {donutData.filter(d => d.count > 0).map(item => (
            <div key={item.status} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-full ${STATUS_COLORS[item.status].bg}`} />
              <span className="text-xs text-gray-700 dark:text-gray-300">
                {item.status} ({item.count})
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="font-medium text-gray-700 dark:text-gray-300">Average Completion</span>
          <span className="font-bold text-gray-900 dark:text-gray-100">{avgComplete}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all"
            style={{ width: `${avgComplete}%` }}
          />
        </div>
      </div>
    </div>
  );
}
