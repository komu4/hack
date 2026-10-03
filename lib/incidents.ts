import type {
  Incident,
  TimelineEvent,
  CreateIncidentPayload,
  IncidentStatus,
} from '@/types/incident';
import { determineResponders } from './routing';

// ---------------------------------------------------------------------------
// In-memory store (replace with a real DB in production)
// ---------------------------------------------------------------------------
let incidents: Incident[] = [];
let timeline: TimelineEvent[] = [];
let incidentCounter = 5; // start after seed data

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------
function seedIncidents() {
  const now = new Date();
  const ts = (offsetMinutes: number) =>
    new Date(now.getTime() - offsetMinutes * 60 * 1000).toISOString();

  incidents = [
    {
      id: 'SOS-2026-0001',
      type: 'MEDICAL',
      severity: 'CRITICAL',
      status: 'IN_PROGRESS',
      location: 'Allen Avenue, Ikeja',
      locationConfidence: 'APPROXIMATE',
      description: 'Person collapsed and is not responding with abnormal breathing.',
      aiSummary:
        'Caller reports friend collapsed on Allen Avenue, Ikeja. Person is unresponsive with abnormal breathing. Immediate medical attention required.',
      peopleAffected: 1,
      immediateDanger: true,
      conscious: false,
      breathingStatus: 'ABNORMAL',
      recommendedResponders: ['AMBULANCE'],
      assignedCentre: 'Demo Medical Response Centre',
      createdAt: ts(28),
      updatedAt: ts(25),
    },
    {
      id: 'SOS-2026-0002',
      type: 'FIRE',
      severity: 'HIGH',
      status: 'DEMO_RESPONSE_INITIATED',
      location: 'Yaba, Lagos',
      locationConfidence: 'APPROXIMATE',
      description: 'Smoke visible from kitchen, fire spreading.',
      aiSummary:
        'Caller reports kitchen fire in Yaba. Smoke visible and fire spreading. No injuries reported. Fire service dispatched.',
      peopleAffected: 0,
      immediateDanger: true,
      firePresent: true,
      recommendedResponders: ['FIRE_SERVICE'],
      assignedCentre: 'Demo Fire Response Centre',
      createdAt: ts(15),
      updatedAt: ts(12),
    },
    {
      id: 'SOS-2026-0003',
      type: 'ACCIDENT',
      severity: 'CRITICAL',
      status: 'CONTACTING_RESPONSE_CENTRE',
      location: 'Lekki-Epe Expressway, Lekki',
      locationConfidence: 'APPROXIMATE',
      description: 'Two-vehicle collision. One person trapped. Fire visible.',
      aiSummary:
        'Caller reports two-car crash on Lekki-Epe Expressway. One person is trapped in vehicle. Fire visible. Multiple responder types required.',
      peopleAffected: 2,
      immediateDanger: true,
      conscious: true,
      personTrapped: true,
      firePresent: true,
      recommendedResponders: ['POLICE', 'AMBULANCE', 'FIRE_SERVICE'],
      createdAt: ts(8),
      updatedAt: ts(5),
    },
    {
      id: 'SOS-2026-0004',
      type: 'MEDICAL',
      severity: 'MODERATE',
      status: 'RESOLVED',
      location: 'Surulere, Lagos',
      locationConfidence: 'APPROXIMATE',
      description: 'Elderly person fell and injured knee. Conscious and stable.',
      aiSummary:
        'Caller reports elderly person fell in Surulere. Patient is conscious and stable with knee injury. Medical assistance requested.',
      peopleAffected: 1,
      immediateDanger: false,
      conscious: true,
      bleeding: false,
      recommendedResponders: ['AMBULANCE'],
      assignedCentre: 'Demo Medical Response Centre',
      createdAt: ts(45),
      updatedAt: ts(20),
    },
  ];

  // Seed timeline for incident 0001
  timeline = [
    addEvent('SOS-2026-0001', 'CALL_RECEIVED', 'Call received', ts(28)),
    addEvent('SOS-2026-0001', 'EMERGENCY_IDENTIFIED', 'Emergency identified: MEDICAL', ts(27)),
    addEvent('SOS-2026-0001', 'SEVERITY_CLASSIFIED', 'Severity classified: CRITICAL', ts(27)),
    addEvent('SOS-2026-0001', 'LOCATION_CAPTURED', 'Location identified: Allen Avenue, Ikeja', ts(26)),
    addEvent('SOS-2026-0001', 'BREATHING_STATUS', 'Breathing status identified: ABNORMAL', ts(26)),
    addEvent('SOS-2026-0001', 'RESPONDER_IDENTIFIED', 'Recommended response: AMBULANCE', ts(26)),
    addEvent('SOS-2026-0001', 'INCIDENT_CREATED', 'SOS incident created: SOS-2026-0001', ts(25)),
    addEvent('SOS-2026-0001', 'CENTRE_CONTACTED', 'Emergency centre contact initiated (DEMO)', ts(25), true),
    addEvent('SOS-2026-0002', 'CALL_RECEIVED', 'Call received', ts(15)),
    addEvent('SOS-2026-0002', 'EMERGENCY_IDENTIFIED', 'Emergency identified: FIRE', ts(14)),
    addEvent('SOS-2026-0002', 'SEVERITY_CLASSIFIED', 'Severity classified: HIGH', ts(14)),
    addEvent('SOS-2026-0002', 'LOCATION_CAPTURED', 'Location identified: Yaba, Lagos', ts(13)),
    addEvent('SOS-2026-0002', 'RESPONDER_IDENTIFIED', 'Recommended response: FIRE_SERVICE', ts(13)),
    addEvent('SOS-2026-0002', 'INCIDENT_CREATED', 'SOS incident created: SOS-2026-0002', ts(12)),
    addEvent('SOS-2026-0002', 'CENTRE_CONTACTED', 'Demo fire response initiated', ts(12), true),
    addEvent('SOS-2026-0003', 'CALL_RECEIVED', 'Call received', ts(8)),
    addEvent('SOS-2026-0003', 'EMERGENCY_IDENTIFIED', 'Emergency identified: ACCIDENT', ts(7)),
    addEvent('SOS-2026-0003', 'SEVERITY_CLASSIFIED', 'Severity classified: CRITICAL', ts(7)),
    addEvent('SOS-2026-0003', 'LOCATION_CAPTURED', 'Location identified: Lekki-Epe Expressway', ts(6)),
    addEvent('SOS-2026-0003', 'TRAPPED_DETECTED', 'Person trapped detected — adding FIRE_SERVICE', ts(6)),
    addEvent('SOS-2026-0003', 'RESPONDER_IDENTIFIED', 'Multi-agency response: POLICE, AMBULANCE, FIRE_SERVICE', ts(5)),
    addEvent('SOS-2026-0003', 'INCIDENT_CREATED', 'SOS incident created: SOS-2026-0003', ts(5)),
  ];
}

function addEvent(
  incidentId: string,
  eventType: string,
  message: string,
  createdAt?: string,
  isDemo?: boolean,
): TimelineEvent {
  return {
    id: `evt-${Math.random().toString(36).slice(2, 9)}`,
    incidentId,
    eventType,
    message,
    isDemo: isDemo ?? false,
    createdAt: createdAt ?? new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Initialise
// ---------------------------------------------------------------------------
let seeded = false;
export function ensureSeeded() {
  if (!seeded) {
    seedIncidents();
    seeded = true;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
export function getAllIncidents(): Incident[] {
  ensureSeeded();
  return [...incidents].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function getIncidentById(id: string): Incident | undefined {
  ensureSeeded();
  return incidents.find((i) => i.id === id);
}

export function getTimelineForIncident(incidentId: string): TimelineEvent[] {
  ensureSeeded();
  return timeline
    .filter((e) => e.incidentId === incidentId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export function createIncident(payload: CreateIncidentPayload): Incident {
  ensureSeeded();

  const id = `SOS-2026-${String(incidentCounter++).padStart(4, '0')}`;
  const now = new Date().toISOString();

  const responders = determineResponders(payload);

  const incident: Incident = {
    id,
    type: payload.type,
    severity: payload.severity,
    status: 'NEW',
    location: payload.location,
    locationConfidence: payload.locationConfidence ?? 'APPROXIMATE',
    description: payload.description,
    aiSummary: payload.aiSummary,
    peopleAffected: payload.peopleAffected,
    immediateDanger: payload.immediateDanger,
    conscious: payload.conscious,
    breathingStatus: payload.breathingStatus,
    bleeding: payload.bleeding,
    firePresent: payload.firePresent,
    personTrapped: payload.personTrapped,
    weaponPresent: payload.weaponPresent,
    callerName: payload.callerName,
    callerPhone: payload.callerPhone,
    recommendedResponders: responders,
    createdAt: now,
    updatedAt: now,
  };

  incidents.unshift(incident);

  // Add initial timeline events
  recordEvent(id, 'CALL_RECEIVED', 'Call received via BimpeAI Voice');
  recordEvent(id, 'EMERGENCY_IDENTIFIED', `Emergency identified: ${payload.type}`);
  recordEvent(id, 'SEVERITY_CLASSIFIED', `Severity classified: ${payload.severity}`);
  recordEvent(id, 'LOCATION_CAPTURED', `Location identified: ${payload.location}`);
  if (payload.breathingStatus && payload.breathingStatus !== 'UNKNOWN') {
    recordEvent(id, 'BREATHING_STATUS', `Breathing status identified: ${payload.breathingStatus}`);
  }
  if (payload.personTrapped) {
    recordEvent(id, 'TRAPPED_DETECTED', 'Person trapped detected — adding FIRE_SERVICE');
  }
  recordEvent(
    id,
    'RESPONDER_IDENTIFIED',
    `Recommended response: ${responders.join(', ')}`,
  );
  recordEvent(id, 'INCIDENT_CREATED', `SOS incident created: ${id}`);

  // Simulate centre contact
  setTimeout(() => updateStatus(id, 'CONTACTING_RESPONSE_CENTRE'), 1500);
  setTimeout(() => {
    updateStatus(id, 'DEMO_RESPONSE_INITIATED');
    recordEvent(
      id,
      'CENTRE_CONTACTED',
      'Emergency centre contact initiated (DEMO MODE — no real service contacted)',
      true,
    );
  }, 3000);

  return incident;
}

export function updateStatus(id: string, status: IncidentStatus): Incident | undefined {
  ensureSeeded();
  const idx = incidents.findIndex((i) => i.id === id);
  if (idx === -1) return undefined;
  incidents[idx] = { ...incidents[idx], status, updatedAt: new Date().toISOString() };
  return incidents[idx];
}

export function recordEvent(
  incidentId: string,
  eventType: string,
  message: string,
  isDemo = false,
): TimelineEvent {
  const evt = addEvent(incidentId, eventType, message, undefined, isDemo);
  timeline.push(evt);
  return evt;
}
