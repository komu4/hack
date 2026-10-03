'use client';

import { useState } from 'react';
import type { CreateIncidentPayload } from '@/types/incident';

const DEMO_SCENARIOS: { label: string; payload: CreateIncidentPayload }[] = [
  {
    label: '🏥 Collapsed Person — Allen Ave, Ikeja',
    payload: {
      type: 'MEDICAL',
      severity: 'CRITICAL',
      location: 'Allen Avenue, near the Roundabout, Ikeja',
      locationConfidence: 'APPROXIMATE',
      description: 'Person collapsed and is not responding with abnormal breathing.',
      aiSummary:
        'Caller reports friend collapsed on Allen Avenue, Ikeja. Person is unresponsive with abnormal breathing. Immediate medical attention required.',
      peopleAffected: 1,
      immediateDanger: true,
      conscious: false,
      breathingStatus: 'ABNORMAL',
    },
  },
  {
    label: '🔥 Kitchen Fire — Yaba',
    payload: {
      type: 'FIRE',
      severity: 'HIGH',
      location: 'Yaba, Lagos',
      locationConfidence: 'APPROXIMATE',
      description: 'Smoke coming from kitchen, fire spreading. No one trapped.',
      aiSummary: 'Caller reports kitchen fire in Yaba. Fire spreading, caller evacuated.',
      peopleAffected: 0,
      immediateDanger: true,
      firePresent: true,
    },
  },
  {
    label: '🚗 Road Accident — Lekki (Person Trapped)',
    payload: {
      type: 'ACCIDENT',
      severity: 'CRITICAL',
      location: 'Lekki-Epe Expressway, Lekki',
      locationConfidence: 'APPROXIMATE',
      description: 'Two-car collision. One person trapped in vehicle. Fire visible.',
      aiSummary:
        'Multi-vehicle accident on Lekki-Epe Expressway. Person trapped in vehicle. Fire visible. Multi-agency response required.',
      peopleAffected: 2,
      immediateDanger: true,
      conscious: true,
      personTrapped: true,
      firePresent: true,
    },
  },
];

export default function DemoCreateIncident({ onCreated }: { onCreated?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function createDemo(payload: CreateIncidentPayload) {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setResult(`✅ Incident ${data.incident.id} created — ${data.incident.severity} ${data.incident.type}`);
        onCreated?.();
      } else {
        setResult(`❌ Error: ${data.error}`);
      }
    } catch {
      setResult('❌ Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-dashed border-amber-400 bg-amber-50 dark:bg-amber-950/20 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="px-2 py-0.5 bg-amber-400 text-amber-900 rounded text-xs font-bold uppercase tracking-wide">
          DEMO MODE
        </span>
        <p className="text-sm text-amber-800 dark:text-amber-200">
          Simulate an incoming emergency call
        </p>
      </div>

      <p className="text-xs text-amber-700 dark:text-amber-300 mb-3">
        In a real deployment, incidents are created by BimpeAI when a phone call ends.
        Click a scenario below to simulate what the backend receives:
      </p>

      <div className="flex flex-wrap gap-2">
        {DEMO_SCENARIOS.map((s) => (
          <button
            key={s.label}
            disabled={loading}
            onClick={() => createDemo(s.payload)}
            className="text-xs px-3 py-2 rounded-lg border border-amber-300 bg-white dark:bg-gray-900
              hover:bg-amber-100 dark:hover:bg-amber-900/30 text-gray-800 dark:text-gray-200
              disabled:opacity-50 transition-colors font-medium"
          >
            {s.label}
          </button>
        ))}
      </div>

      {result && (
        <p className="mt-3 text-xs font-mono text-amber-900 dark:text-amber-200">{result}</p>
      )}

      <p className="mt-3 text-xs text-gray-400">
        No real emergency service is contacted. This is a demonstration only.
      </p>
    </div>
  );
}
