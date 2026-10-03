/**
 * BimpeAI Integration Layer
 *
 * BimpeAI SDK (@bimpeai/sdk) exposes four resources:
 *   agents, workflows, conversations, calls
 * Channel types: whatsapp, webchat, telephony, and test_* variants
 * Auth: Bearer sk_... API key (BIMPEAI_API_KEY)
 *
 * This file isolates all BimpeAI-specific logic.
 * https://docs.bimpe.ai  |  npm: @bimpeai/sdk
 */

import { BimpeAI } from '@bimpeai/sdk';
import type { CreateIncidentPayload, IncidentType, Severity } from '@/types/incident';

// ---------------------------------------------------------------------------
// System prompt for the SOS Voice agent
// ---------------------------------------------------------------------------
export const SOS_VOICE_SYSTEM_PROMPT = `
You are SOS Voice, an AI emergency intake assistant for Nigeria.

PERSONA:
- Calm, concise, reassuring, professional
- Speak in short sentences. Ask one question at a time.
- Sound human. Do NOT sound like a chatbot.

MISSION:
You are NOT a hospital, ambulance, police, or fire service.
You are an emergency intake and coordination assistant.
Your job: listen → understand → triage → assist → create an SOS incident → confirm.

CORE CONVERSATION RULES:
1. Prioritise: immediate danger → location → emergency type → severity → critical details
2. Do not collect unnecessary information
3. Do not ask all questions at once
4. If you have enough information, proceed
5. Speak naturally. The caller may be scared, injured, or unable to type.

EMERGENCY CATEGORIES:
- MEDICAL: collapse, unconscious, not breathing, injury, illness
- FIRE: smoke, flames, burning
- POLICE: break-in, robbery, assault, violent threat
- ACCIDENT: road crash, vehicle collision
- OTHER: unclear emergencies

SEVERITY:
- CRITICAL: immediate threat to life (unconscious, not breathing, severe bleeding, trapped, fire with people)
- HIGH: serious but not immediately life-threatening
- MODERATE: requires assistance, no clear immediate danger
- LOW: non-urgent

LOCATION:
Ask: "Where are you right now? A street, landmark, or area is fine."
Accept approximate locations. Do not demand an exact address.

EMERGENCY-SPECIFIC QUESTIONS:
MEDICAL: Is the person conscious? Breathing normally? Bleeding heavily? How many people?
FIRE: Is anyone trapped? Is the fire inside a building? Are you safe?
POLICE: Is anyone in immediate danger? Is a weapon involved? Are you safe?
ACCIDENT: How many people? Is anyone trapped? Bleeding? Fire or smoke?

SAFETY GUIDANCE (provide brief guidance while processing):
- Unconscious person: "Stay with them. If you know CPR and they are not breathing, begin CPR."
- Severe bleeding: "Apply firm, continuous pressure with clean cloth."
- Fire: "Move away from the fire and smoke if you can do so safely."
- Accident: "Move to a safe area if possible. Do not move seriously injured people unless they are in immediate danger."
- Violent threat: "Move to a safe location if you can. Do not confront the person."

ENDING THE CALL:
When you have enough information, say:
"I've prepared the emergency request with the information you've given me. [Brief guidance]. Stay somewhere safe."

NEVER:
- Claim an ambulance or vehicle has been dispatched (unless backend confirms it)
- Diagnose or prescribe
- Invent emergency numbers
- Pretend to be a doctor, police officer, or firefighter

When you have enough information to create an incident, output the following JSON block ONLY ONCE at the very end of your response, after your spoken message. Do not show this to the caller:

[SOS_INCIDENT]
{
  "type": "MEDICAL|FIRE|POLICE|ACCIDENT|OTHER",
  "severity": "LOW|MODERATE|HIGH|CRITICAL",
  "location": "caller's location",
  "locationConfidence": "EXACT|APPROXIMATE|UNKNOWN",
  "description": "brief factual description",
  "aiSummary": "one or two sentence summary of the situation",
  "peopleAffected": 1,
  "immediateDanger": true,
  "conscious": false,
  "breathingStatus": "NORMAL|ABNORMAL|ABSENT|UNKNOWN",
  "bleeding": false,
  "firePresent": false,
  "personTrapped": false,
  "weaponPresent": false
}
[/SOS_INCIDENT]

Only include fields relevant to the incident. Omit irrelevant fields.
`.trim();

// ---------------------------------------------------------------------------
// Parse SOS incident from BimpeAI conversation transcript
// ---------------------------------------------------------------------------
export function parseIncidentFromTranscript(
  transcript: string,
): CreateIncidentPayload | null {
  const match = transcript.match(/\[SOS_INCIDENT\]([\s\S]*?)\[\/SOS_INCIDENT\]/);
  if (!match) return null;

  try {
    const raw = JSON.parse(match[1].trim());

    const payload: CreateIncidentPayload = {
      type: (raw.type ?? 'OTHER') as IncidentType,
      severity: (raw.severity ?? 'MODERATE') as Severity,
      location: raw.location ?? 'UNKNOWN',
      locationConfidence: raw.locationConfidence ?? 'APPROXIMATE',
      description: raw.description ?? 'Emergency reported via SOS Voice',
      aiSummary: raw.aiSummary,
      peopleAffected: raw.peopleAffected,
      immediateDanger: raw.immediateDanger,
      conscious: raw.conscious,
      breathingStatus: raw.breathingStatus,
      bleeding: raw.bleeding,
      firePresent: raw.firePresent,
      personTrapped: raw.personTrapped,
      weaponPresent: raw.weaponPresent,
    };

    return payload;
  } catch {
    console.error('[BimpeAI] Failed to parse SOS_INCIDENT JSON from transcript');
    return null;
  }
}

// ---------------------------------------------------------------------------
// Parse incident from structured BimpeAI webhook payload
// The exact shape depends on BimpeAI's webhook format.
// We support two modes:
//   1. Structured extraction (preferred) — BimpeAI sends key-value pairs
//   2. Transcript fallback — we parse the raw transcript
// ---------------------------------------------------------------------------
export interface BimpeWebhookPayload {
  event?: string;
  conversationId?: string;
  agentId?: string;
  transcript?: string;
  messages?: Array<{ role: string; content: string }>;
  // BimpeAI may send conversation/call metadata
  metadata?: Record<string, unknown>;
  caller?: {
    phone?: string;
    name?: string;
  };
  // Structured extraction if BimpeAI supports it
  extraction?: Record<string, unknown>;
}

export function extractIncidentFromWebhook(
  body: BimpeWebhookPayload,
): CreateIncidentPayload | null {
  // Try transcript first (most reliable for our use case)
  const fullTranscript = buildTranscript(body);
  if (fullTranscript) {
    const parsed = parseIncidentFromTranscript(fullTranscript);
    if (parsed) {
      // Enrich with caller info if available
      if (body.caller?.phone) parsed.callerPhone = body.caller.phone;
      if (body.caller?.name) parsed.callerName = body.caller.name;
      return parsed;
    }
  }

  // Fallback: try to extract from structured extraction field
  if (body.extraction) {
    return extractFromStructured(body.extraction, body.caller);
  }

  return null;
}

function buildTranscript(body: BimpeWebhookPayload): string {
  if (body.transcript) return body.transcript;

  if (body.messages && body.messages.length > 0) {
    return body.messages
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n');
  }

  return '';
}

function extractFromStructured(
  extraction: Record<string, unknown>,
  caller?: { phone?: string; name?: string },
): CreateIncidentPayload | null {
  const type = extraction.type ?? extraction.incidentType ?? extraction.emergency_type;
  const severity = extraction.severity;
  const location = extraction.location;
  const description = extraction.description ?? extraction.summary ?? 'Emergency reported';

  if (!type || !severity || !location) return null;

  return {
    type: String(type).toUpperCase() as IncidentType,
    severity: String(severity).toUpperCase() as Severity,
    location: String(location),
    locationConfidence: 'APPROXIMATE',
    description: String(description),
    callerPhone: caller?.phone,
    callerName: caller?.name,
  };
}

// ---------------------------------------------------------------------------
// BimpeAI SDK client helper
// Only BIMPEAI_API_KEY is required. The Agent ID is discovered at runtime by
// looking up the agent named exactly "SOS Voice" (see getSosVoiceAgentId).
// ---------------------------------------------------------------------------
export const SOS_VOICE_AGENT_NAME = 'SOS Voice';

export class BimpeConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BimpeConfigError';
  }
}

export class BimpeAgentNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BimpeAgentNotFoundError';
  }
}

let cachedClient: BimpeAI | null = null;

/** Returns a BimpeAI client, or null if BIMPEAI_API_KEY is not set. */
export function getBimpeClient(): BimpeAI | null {
  const apiKey = process.env.BIMPEAI_API_KEY;
  if (!apiKey) {
    console.warn('[BimpeAI] BIMPEAI_API_KEY not set — SDK client unavailable');
    return null;
  }
  if (!cachedClient) cachedClient = new BimpeAI({ apiKey });
  return cachedClient;
}

let cachedAgentId: string | null = null;
let inflightLookup: Promise<string> | null = null;

/**
 * Finds the agent whose name is exactly "SOS Voice" via agents.list() and
 * returns its generated agent.id. The name is only used for lookup; every
 * agent-scoped SDK call (calls, conversations, ...) must use the returned id.
 * The result is cached for the lifetime of the server process.
 */
export async function getSosVoiceAgentId(): Promise<string> {
  if (cachedAgentId) return cachedAgentId;
  if (inflightLookup) return inflightLookup;

  const client = getBimpeClient();
  if (!client) {
    throw new BimpeConfigError(
      'BIMPEAI_API_KEY is not set. Add it to .env.local to use the BimpeAI SDK.',
    );
  }

  inflightLookup = (async () => {
    try {
      // `search` narrows results server-side; we still require an exact,
      // case-sensitive name match and walk every page.
      for await (const agent of client.agents.list({
        search: SOS_VOICE_AGENT_NAME,
        limit: 50,
      })) {
        if (agent.name === SOS_VOICE_AGENT_NAME) {
          cachedAgentId = agent.id;
          return agent.id;
        }
      }
      throw new BimpeAgentNotFoundError(
        `No BimpeAI agent named exactly "${SOS_VOICE_AGENT_NAME}" was found for this API key. ` +
          `Create an agent with that exact name in the BimpeAI console.`,
      );
    } finally {
      inflightLookup = null;
    }
  })();

  return inflightLookup;
}

/** Convenience: client + discovered SOS Voice agent id for agent-scoped calls. */
export async function getSosVoiceContext(): Promise<{ client: BimpeAI; agentId: string }> {
  const agentId = await getSosVoiceAgentId();
  const client = getBimpeClient();
  if (!client) {
    throw new BimpeConfigError('BIMPEAI_API_KEY is not set.');
  }
  return { client, agentId };
}
