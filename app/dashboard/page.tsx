'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Incident } from '@/types/incident';
import IncidentCard from '@/components/IncidentCard';
import IncidentStats from '@/components/IncidentStats';
import DemoCreateIncident from '@/components/DemoCreateIncident';
import Link from 'next/link';

const POLL_INTERVAL_MS = 3000;

export default function DashboardPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'CRITICAL'>('ALL');

  const fetchIncidents = useCallback(async () => {
    try {
      const res = await fetch('/api/incidents', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setIncidents(data.incidents);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Failed to fetch incidents', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchIncidents]);

  const filtered = incidents.filter((i) => {
    if (filter === 'ACTIVE') return i.status !== 'RESOLVED';
    if (filter === 'CRITICAL') return i.severity === 'CRITICAL';
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SOS</span>
              </div>
              <span className="font-bold text-gray-900 dark:text-white">SOS Voice</span>
            </Link>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <span className="text-sm text-gray-500">Emergency Operations Dashboard</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Live indicator */}
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse inline-block" />
              <span className="text-xs text-gray-500">Live</span>
            </div>
            {lastUpdated && (
              <span className="text-xs text-gray-400 hidden sm:inline">
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Stats */}
        <IncidentStats incidents={incidents} />

        {/* Demo panel */}
        <DemoCreateIncident onCreated={fetchIncidents} />

        {/* BimpeAI integration info */}
        <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20 p-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <span className="font-semibold">BimpeAI Voice Integration:</span>{' '}
            Configure your BimpeAI telephony agent to send call transcripts to{' '}
            <code className="font-mono text-xs bg-blue-100 dark:bg-blue-900/50 px-1 py-0.5 rounded">
              POST /api/bimpe/webhook
            </code>{' '}
            — incidents will appear here automatically when a call ends.
          </p>
        </div>

        {/* Incident list */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Incidents{' '}
              <span className="text-gray-400 font-normal text-sm">({filtered.length})</span>
            </h2>

            <div className="flex gap-1">
              {(['ALL', 'ACTIVE', 'CRITICAL'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    filter === f
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 h-40 animate-pulse"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-12 text-center">
              <p className="text-4xl mb-3">📋</p>
              <p className="text-gray-500 dark:text-gray-400">No incidents to display.</p>
              <p className="text-sm text-gray-400 mt-1">
                Use the demo panel above or make a BimpeAI call.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((incident) => (
                <IncidentCard key={incident.id} incident={incident} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
