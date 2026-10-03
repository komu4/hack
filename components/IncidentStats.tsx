'use client';

import type { Incident } from '@/types/incident';

export default function IncidentStats({ incidents }: { incidents: Incident[] }) {
  const active = incidents.filter((i) => i.status !== 'RESOLVED');
  const critical = incidents.filter((i) => i.severity === 'CRITICAL' && i.status !== 'RESOLVED');
  const high = incidents.filter((i) => i.severity === 'HIGH' && i.status !== 'RESOLVED');
  const inProgress = incidents.filter((i) =>
    ['IN_PROGRESS', 'CONTACTING_RESPONSE_CENTRE', 'DEMO_RESPONSE_INITIATED', 'RESPONSE_CENTRE_CONTACTED'].includes(i.status),
  );

  const stats = [
    { label: 'Active Incidents', value: active.length, color: 'text-gray-900 dark:text-gray-100' },
    { label: 'Critical', value: critical.length, color: 'text-red-600' },
    { label: 'High', value: high.length, color: 'text-orange-500' },
    { label: 'Responses in Progress', value: inProgress.length, color: 'text-blue-600' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4"
        >
          <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wide">
            {s.label}
          </p>
        </div>
      ))}
    </div>
  );
}
