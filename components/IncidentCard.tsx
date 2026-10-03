'use client';

import Link from 'next/link';
import type { Incident } from '@/types/incident';

const SEVERITY_STYLES: Record<string, string> = {
  CRITICAL: 'border-red-500 bg-red-50 dark:bg-red-950/20',
  HIGH: 'border-orange-500 bg-orange-50 dark:bg-orange-950/20',
  MODERATE: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20',
  LOW: 'border-green-500 bg-green-50 dark:bg-green-950/20',
};

const SEVERITY_BADGE: Record<string, string> = {
  CRITICAL: 'bg-red-600 text-white',
  HIGH: 'bg-orange-500 text-white',
  MODERATE: 'bg-yellow-500 text-white',
  LOW: 'bg-green-600 text-white',
};

const SEVERITY_DOT: Record<string, string> = {
  CRITICAL: 'bg-red-500',
  HIGH: 'bg-orange-500',
  MODERATE: 'bg-yellow-500',
  LOW: 'bg-green-500',
};

const TYPE_ICON: Record<string, string> = {
  MEDICAL: '🏥',
  FIRE: '🔥',
  POLICE: '🚔',
  ACCIDENT: '🚗',
  OTHER: '⚠️',
};

const STATUS_LABEL: Record<string, string> = {
  NEW: 'New',
  ASSESSING: 'Assessing',
  READY_FOR_RESPONSE: 'Ready',
  CONTACTING_RESPONSE_CENTRE: 'Contacting centre…',
  RESPONSE_CENTRE_CONTACTED: 'Centre contacted',
  IN_PROGRESS: 'In progress',
  DEMO_RESPONSE_INITIATED: 'DEMO: Response initiated',
  RESOLVED: 'Resolved',
};

function elapsed(createdAt: string) {
  const diff = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export default function IncidentCard({ incident }: { incident: Incident }) {
  const { severity, type, id, location, status, createdAt, recommendedResponders,
    peopleAffected, conscious, breathingStatus } = incident;

  const isDemo =
    status === 'DEMO_RESPONSE_INITIATED' || status === 'CONTACTING_RESPONSE_CENTRE';

  return (
    <Link href={`/dashboard/incidents/${id}`}>
      <div
        className={`rounded-xl border-l-4 border border-gray-200 dark:border-gray-700 p-4 cursor-pointer
          hover:shadow-md transition-shadow ${SEVERITY_STYLES[severity] ?? ''}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold uppercase ${SEVERITY_BADGE[severity]}`}
            >
              <span
                className={`inline-block w-1.5 h-1.5 rounded-full animate-pulse ${SEVERITY_DOT[severity]}`}
              />
              {severity}
            </span>
          </div>
          <span className="text-xs text-gray-400 shrink-0">{elapsed(createdAt)}</span>
        </div>

        {/* Type & ID */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{TYPE_ICON[type] ?? '⚠️'}</span>
          <div>
            <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
              {type} EMERGENCY
            </p>
            <p className="text-xs text-gray-400 font-mono">{id}</p>
          </div>
        </div>

        {/* Location */}
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
          <span className="mr-1">📍</span>{location}
        </p>

        {/* Key info */}
        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500 dark:text-gray-400 mb-3">
          {peopleAffected !== undefined && (
            <span>👤 {peopleAffected} affected</span>
          )}
          {conscious === false && <span>🧠 Unconscious</span>}
          {breathingStatus && breathingStatus !== 'UNKNOWN' && breathingStatus !== 'NORMAL' && (
            <span>🫁 Breathing: {breathingStatus}</span>
          )}
        </div>

        {/* Responders */}
        <div className="flex flex-wrap gap-1 mb-3">
          {recommendedResponders.map((r) => (
            <span
              key={r}
              className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 rounded text-xs font-medium"
            >
              {r}
            </span>
          ))}
        </div>

        {/* Status */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {STATUS_LABEL[status] ?? status}
          </span>
          {isDemo && (
            <span className="text-xs px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded font-mono">
              DEMO
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
