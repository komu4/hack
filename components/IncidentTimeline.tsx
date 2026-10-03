'use client';

import type { TimelineEvent } from '@/types/incident';

const EVENT_ICON: Record<string, string> = {
  CALL_RECEIVED: '📞',
  EMERGENCY_IDENTIFIED: '🔍',
  SEVERITY_CLASSIFIED: '⚡',
  LOCATION_CAPTURED: '📍',
  BREATHING_STATUS: '🫁',
  TRAPPED_DETECTED: '🚨',
  RESPONDER_IDENTIFIED: '🚑',
  INCIDENT_CREATED: '📋',
  CENTRE_CONTACTED: '📡',
  STATUS_UPDATED: '🔄',
  DEFAULT: '✓',
};

function formatTime(ts: string) {
  return new Date(ts).toLocaleTimeString('en-NG', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export default function IncidentTimeline({ events }: { events: TimelineEvent[] }) {
  if (!events.length) {
    return (
      <p className="text-sm text-gray-400 italic">No timeline events yet.</p>
    );
  }

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-[18px] top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />

      <ul className="space-y-3">
        {events.map((evt) => (
          <li key={evt.id} className="flex items-start gap-3">
            {/* Icon bubble */}
            <div className="relative z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-base shrink-0">
              {EVENT_ICON[evt.eventType] ?? EVENT_ICON.DEFAULT}
            </div>

            <div className="pt-1.5 min-w-0">
              <p className="text-sm text-gray-800 dark:text-gray-200 leading-tight">
                {evt.message}
                {evt.isDemo && (
                  <span className="ml-2 text-xs text-gray-400 font-mono">[DEMO]</span>
                )}
              </p>
              <p className="text-xs text-gray-400 mt-0.5 font-mono">{formatTime(evt.createdAt)}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
