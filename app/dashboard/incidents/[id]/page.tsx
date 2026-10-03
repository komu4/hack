'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { Incident, TimelineEvent } from '@/types/incident';
import IncidentTimeline from '@/components/IncidentTimeline';

const SEVERITY_COLOR: Record<string, string> = {
  CRITICAL: 'text-red-600',
  HIGH: 'text-orange-500',
  MODERATE: 'text-yellow-600',
  LOW: 'text-green-600',
};

const SEVERITY_BG: Record<string, string> = {
  CRITICAL: 'bg-red-600',
  HIGH: 'bg-orange-500',
  MODERATE: 'bg-yellow-500',
  LOW: 'bg-green-600',
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
  READY_FOR_RESPONSE: 'Ready for response',
  CONTACTING_RESPONSE_CENTRE: 'Contacting response centre…',
  RESPONSE_CENTRE_CONTACTED: 'Response centre contacted',
  IN_PROGRESS: 'In progress',
  DEMO_RESPONSE_INITIATED: 'DEMO: Response initiated',
  RESOLVED: 'Resolved',
};

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === undefined || value === null) return null;
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">{value}</p>
    </div>
  );
}

export default function IncidentDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [incident, setIncident] = useState<Incident | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDetail = useCallback(async () => {
    try {
      const res = await fetch(`/api/incidents/${id}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setIncident(data.incident);
        setTimeline(data.timeline);
      }
    } catch (err) {
      console.error('Failed to fetch incident', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
    const interval = setInterval(fetchDetail, 3000);
    return () => clearInterval(interval);
  }, [fetchDetail]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center text-gray-500">
        Incident not found.{' '}
        <Link href="/dashboard" className="underline ml-2 text-blue-500">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const isDemo =
    incident.status === 'DEMO_RESPONSE_INITIATED' ||
    incident.status === 'CONTACTING_RESPONSE_CENTRE';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 text-sm">
            ← Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold text-white ${SEVERITY_BG[incident.severity]}`}
            >
              {incident.severity}
            </span>
            <span className="font-mono text-sm text-gray-500">{incident.id}</span>
            {isDemo && (
              <span className="text-xs px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded font-mono">
                DEMO MODE
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Incident Details */}
          <div className="lg:col-span-2 space-y-4">
            {/* Type header */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{TYPE_ICON[incident.type]}</span>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    {incident.type} EMERGENCY
                  </h1>
                  <p className={`text-sm font-semibold ${SEVERITY_COLOR[incident.severity]}`}>
                    {incident.severity} SEVERITY
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Location" value={`📍 ${incident.location}`} />
                <Field
                  label="Location Confidence"
                  value={incident.locationConfidence}
                />
                <Field
                  label="People Affected"
                  value={incident.peopleAffected !== undefined ? String(incident.peopleAffected) : undefined}
                />
                <Field
                  label="Immediate Danger"
                  value={
                    incident.immediateDanger !== undefined
                      ? incident.immediateDanger
                        ? '⚠️ YES'
                        : 'No'
                      : undefined
                  }
                />
                <Field
                  label="Conscious"
                  value={
                    incident.conscious !== undefined
                      ? incident.conscious
                        ? 'Yes'
                        : '❌ No'
                      : undefined
                  }
                />
                <Field
                  label="Breathing"
                  value={
                    incident.breathingStatus && incident.breathingStatus !== 'UNKNOWN'
                      ? incident.breathingStatus === 'NORMAL'
                        ? '✅ Normal'
                        : `⚠️ ${incident.breathingStatus}`
                      : undefined
                  }
                />
                {incident.firePresent && <Field label="Fire" value="🔥 Present" />}
                {incident.personTrapped && <Field label="Person Trapped" value="🚨 YES" />}
                {incident.weaponPresent && <Field label="Weapon" value="⚠️ Reported" />}
                {incident.bleeding && <Field label="Bleeding" value="⚠️ Reported" />}
              </div>
            </div>

            {/* Description & AI Summary */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Description</p>
                <p className="text-sm text-gray-800 dark:text-gray-200">{incident.description}</p>
              </div>
              {incident.aiSummary && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">AI Summary</p>
                  <p className="text-sm text-gray-800 dark:text-gray-200 italic">
                    {incident.aiSummary}
                  </p>
                </div>
              )}
            </div>

            {/* Recommended Response */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-3">
                Recommended Response
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {incident.recommendedResponders.map((r) => (
                  <span
                    key={r}
                    className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 rounded-lg text-sm font-semibold"
                  >
                    {r}
                  </span>
                ))}
              </div>

              <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Status</p>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {STATUS_LABEL[incident.status] ?? incident.status}
              </p>

              {isDemo && (
                <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                    DEMO RESPONSE — No real emergency service has been contacted.
                  </p>
                </div>
              )}

              {incident.assignedCentre && (
                <div className="mt-2">
                  <p className="text-xs uppercase tracking-wide text-gray-400 mb-0.5">
                    Assigned Centre
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {incident.assignedCentre}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right: AI Timeline */}
          <div className="space-y-4">
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
                AI Action Timeline
              </h2>
              <IncidentTimeline events={timeline} />
            </div>

            {/* Caller info */}
            {(incident.callerName || incident.callerPhone) && (
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Caller</h2>
                {incident.callerName && <Field label="Name" value={incident.callerName} />}
                {incident.callerPhone && <Field label="Phone" value={incident.callerPhone} />}
              </div>
            )}

            {/* Meta */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
              <p className="text-xs text-gray-400">
                Created: {new Date(incident.createdAt).toLocaleString('en-NG')}
              </p>
              <p className="text-xs text-gray-400">
                Updated: {new Date(incident.updatedAt).toLocaleString('en-NG')}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
