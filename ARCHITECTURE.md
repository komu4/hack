# Architecture — SOS Voice

## Overview

SOS Voice is a lightweight Next.js 14 application with App Router. It uses BimpeAI as the voice AI layer and runs entirely within a single Next.js process for the hackathon MVP.

---

## System Architecture

```
┌─────────────────────────────────────────────────┐
│                  CALLER                         │
│         (Phone call via BimpeAI number)         │
└───────────────────┬─────────────────────────────┘
                    │
                    ↓
┌─────────────────────────────────────────────────┐
│              BimpeAI Voice AI                   │
│         Telephony channel (PSTN)                │
│   Agent configured with SOS Voice system prompt │
│   Channels: telephony / test_telephony          │
└───────────────────┬─────────────────────────────┘
                    │  POST /api/bimpe/webhook
                    │  (when call ends — transcript + metadata)
                    ↓
┌─────────────────────────────────────────────────┐
│               SOS Voice Backend                 │
│                 (Next.js API Routes)            │
│                                                 │
│  /api/bimpe/webhook  ← BimpeAI posts here       │
│  /api/incidents      ← CRUD                     │
│  /api/incidents/:id  ← detail + timeline        │
│  /api/responders     ← configured centres       │
└───────────┬────────────────────────┬────────────┘
            │                        │
            ↓                        ↓
┌───────────────────┐   ┌────────────────────────┐
│  Incident Engine  │   │   Responder Routing    │
│  lib/incidents.ts │   │   lib/routing.ts       │
│                   │   │                        │
│  - Parse webhook  │   │  determineResponders() │
│  - Create SOS     │   │  Deterministic rules   │
│  - Record events  │   │  MEDICAL → AMBULANCE   │
│  - Update status  │   │  FIRE → FIRE_SERVICE   │
│  - Seeded demo    │   │  ACCIDENT → multi      │
└───────────────────┘   └────────────────────────┘
            │
            ↓
┌─────────────────────────────────────────────────┐
│             In-Memory Store                     │
│   incidents[]  timeline[]  (resets on restart)  │
│   Replace with Postgres/SQLite for production   │
└───────────────────┬─────────────────────────────┘
                    │ Polling every 3s
                    ↓
┌─────────────────────────────────────────────────┐
│              Dashboard (Next.js)                │
│   /dashboard                ← Overview          │
│   /dashboard/incidents/:id  ← Detail + timeline │
└─────────────────────────────────────────────────┘
```

---

## BimpeAI Integration

### SDK
```
@bimpeai/sdk (npm)
```
- Auth: `Authorization: Bearer sk_...`
- Resources: `agents`, `workflows`, `conversations`, `calls`
- Channel types: `whatsapp`, `webchat`, `telephony`, `instagram`, `messenger`
  - For voice: use `telephony`
  - For testing: use `test_telephony`

### Agent Configuration
The SOS Voice agent is configured with the system prompt in `lib/bimpe.ts → SOS_VOICE_SYSTEM_PROMPT`.

The system prompt instructs the agent to:
1. Run the emergency intake conversation
2. Output a structured `[SOS_INCIDENT]...[/SOS_INCIDENT]` JSON block at the end

### Client initialization
```typescript
import BimpeAI from '@bimpeai/sdk';
const client = new BimpeAI({ apiKey: process.env.BIMPEAI_API_KEY });
```

---

## Voice Workflow

```
1. Caller dials BimpeAI phone number
2. BimpeAI answers and starts conversation with SOS Voice agent
3. AI follows system prompt:
   - Greet calmly
   - Ask what happened
   - Collect location
   - Ask critical questions (max 2–3)
   - Give brief safety guidance
   - Output [SOS_INCIDENT] block
   - Confirm to caller
4. Call ends
5. BimpeAI POSTs conversation to /api/bimpe/webhook
```

---

## Webhook Workflow

```
POST /api/bimpe/webhook
  ↓
Extract transcript from body
  ↓
Parse [SOS_INCIDENT] JSON block from transcript
  ↓
Validate required fields (type, severity, location, description)
  ↓
Call createIncident(payload)
  ↓
determineResponders(payload) → responder array
  ↓
Save incident + timeline events
  ↓
Schedule status updates (setTimeout: CONTACTING → DEMO_RESPONSE_INITIATED)
  ↓
Return { success: true, incident: { id, type, severity, ... } }
```

---

## Incident Extraction

The AI agent is prompted to emit a `[SOS_INCIDENT]...[/SOS_INCIDENT]` block at the end of its final message. This block contains the structured emergency data as JSON.

`lib/bimpe.ts → parseIncidentFromTranscript()` extracts and parses this block.

Fallback: if no block is found, `extractFromStructured()` tries BimpeAI's extraction field.

---

## Routing Engine

`lib/routing.ts → determineResponders(payload)` is deterministic:

```
MEDICAL                 → [AMBULANCE]
FIRE                    → [FIRE_SERVICE]
FIRE + injuries         → [FIRE_SERVICE, AMBULANCE]
POLICE                  → [POLICE]
ACCIDENT                → [POLICE, AMBULANCE]
ACCIDENT + trapped/fire → [POLICE, AMBULANCE, FIRE_SERVICE]
OTHER + bleeding        → [AMBULANCE]
OTHER + fire            → [FIRE_SERVICE]
OTHER + weapon          → [POLICE]
```

Cross-category signals (firePresent, weaponPresent) add responders regardless of primary type.

---

## Responder Model

Configured in `data/responders.json`. For the MVP, all responders are in DEMO mode.

```json
{
  "id": "centre-001",
  "name": "Demo Medical Response Centre",
  "type": "AMBULANCE",
  "location": "Ikeja",
  "status": "AVAILABLE",
  "contactMode": "DEMO"
}
```

A real integration would call a responder's API or webhook to create a dispatch request.

---

## Dashboard

- Built with Next.js App Router, React, Tailwind CSS
- Polling: `setInterval(fetchIncidents, 3000)` — simple and reliable for demo
- No WebSocket or SSE needed for hackathon
- Components: `IncidentCard`, `IncidentTimeline`, `IncidentStats`, `DemoCreateIncident`

---

## Demo Mode

Demo mode is always active for this MVP. It is clearly labelled throughout the UI.

```
Demo actions:
- "Emergency centre contact initiated (DEMO)"
- Status: DEMO_RESPONSE_INITIATED
- UI shows: "DEMO RESPONSE — No real emergency service has been contacted."
```

The demo panel (`DemoCreateIncident.tsx`) allows creating incidents via the API directly, simulating what BimpeAI would send.

---

## Data Model

### Incident
```
id                   string    SOS-2026-NNNN
type                 enum      MEDICAL | FIRE | POLICE | ACCIDENT | OTHER
severity             enum      LOW | MODERATE | HIGH | CRITICAL
status               enum      NEW → ASSESSING → READY_FOR_RESPONSE → ...
location             string    Human-readable location
locationConfidence   enum      EXACT | APPROXIMATE | UNKNOWN
description          string    Factual description
aiSummary            string    AI-generated summary
peopleAffected       number
immediateDanger      boolean
conscious            boolean
breathingStatus      enum      NORMAL | ABNORMAL | ABSENT | UNKNOWN
bleeding             boolean
firePresent          boolean
personTrapped        boolean
weaponPresent        boolean
callerName           string
callerPhone          string
recommendedResponders  ResponderType[]
assignedCentre       string
createdAt            ISO string
updatedAt            ISO string
```

### TimelineEvent
```
id           string
incidentId   string
eventType    string   CALL_RECEIVED | EMERGENCY_IDENTIFIED | etc.
message      string   Human-readable description
isDemo       boolean
createdAt    ISO string
```

---

## API Endpoints

| Method | Path | Body | Response |
|---|---|---|---|
| GET | /api/incidents | — | { incidents[] } |
| POST | /api/incidents | CreateIncidentPayload | { incident: { id, status, ... } } |
| GET | /api/incidents/:id | — | { incident, timeline[] } |
| POST | /api/bimpe/webhook | BimpeWebhookPayload | { action, incident? } |
| GET | /api/responders | — | { responders[] } |

---

## Security Considerations (Production)

For production deployment, add:
- Webhook signature verification (BimpeAI sends a signature header)
- API key authentication on internal endpoints
- Rate limiting on the webhook endpoint
- Input validation and sanitisation
- HTTPS enforcement
- Persistent database (Postgres/SQLite) instead of in-memory store

---

## Failure Handling

| Failure | Behaviour |
|---|---|
| No SOS_INCIDENT block in transcript | Returns `action: no_incident_extracted` — does not crash |
| BimpeAI SDK unavailable | `getBimpeClient()` returns null — app still runs |
| Missing env vars | Warning logged — demo mode continues |
| Invalid webhook payload | 500 with error message |
| Incident not found | 404 |

---

## Future Integrations

| Provider | Integration Point |
|---|---|
| LASAMBUS (Lagos) | POST to their dispatch API |
| Private ambulance companies | Webhook or SMS |
| Lagos State Fire Service | API or SMS alert |
| Nigeria Police Force | Future API integration |
| Private security companies (e.g. Traccs) | Webhook |
| Hospitals | HL7/FHIR referral message |
| Google Maps | Location geocoding |
| WhatsApp | BimpeAI WhatsApp channel (already supported) |
