# SOS Voice

**AI Emergency Intake, Triage and Coordination System for Nigeria**

> One call can turn a crisis into a coordinated response.

---

## What is SOS Voice?

SOS Voice is a phone-based AI emergency intake and coordination system powered by **BimpeAI Voice AI**.

A person calls one phone number, explains what is happening naturally, and the AI turns the conversation into a structured emergency incident and routes it to the appropriate responders.

SOS Voice is NOT an ambulance company. It does NOT physically dispatch emergency vehicles. It is an **AI emergency intake and coordination layer**.

---

## How it works

```
CALLER
  ↓
BimpeAI Voice AI  (telephony channel — real phone call)
  ↓
SOS Voice Agent   (AI conversation: understand → triage → extract)
  ↓
POST /api/bimpe/webhook  (BimpeAI sends transcript when call ends)
  ↓
Incident Engine   (extract structured SOS incident)
  ↓
Responder Routing (deterministic rules: MEDICAL → AMBULANCE, etc.)
  ↓
Dashboard         (live updates via polling)
```

---

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd sos-voice
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values (see Environment Variables below).

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `BIMPEAI_API_KEY` | Yes (for SDK) | Your BimpeAI API key. Get it from [agent.bimpe.ai](https://agent.bimpe.ai). Keys start with `sk_`. |
| `NEXT_PUBLIC_APP_URL` | Yes | Your public URL. Use ngrok in development. |

---

## BimpeAI Setup

### 1. Sign up
Create an account at [agent.bimpe.ai](https://agent.bimpe.ai).

### 2. Create an agent
In the BimpeAI Console, create a new agent. Configure:
- **Name**: SOS Voice
- **System prompt**: Copy the prompt from `lib/bimpe.ts` → `SOS_VOICE_SYSTEM_PROMPT`

### 3. Configure telephony channel
In the BimpeAI Console, add a **telephony** channel to your agent.
This gives you a phone number callers can dial.

The BimpeAI SDK uses `channel: 'telephony'` for this channel type.

### 4. Configure webhook
Set your agent's webhook URL to:
```
https://your-domain.com/api/bimpe/webhook
```
In development, use ngrok:
```bash
npx ngrok http 3000
# Copy the https URL and set it in BimpeAI Console + .env.local
```

BimpeAI will POST to this endpoint when a call/conversation ends.

### 5. Test
Call the BimpeAI phone number. Speak an emergency scenario. The incident should appear on the dashboard.

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/incidents` | List all incidents |
| `POST` | `/api/incidents` | Create an incident manually |
| `GET` | `/api/incidents/:id` | Get incident + timeline |
| `POST` | `/api/bimpe/webhook` | BimpeAI webhook receiver |
| `GET` | `/api/responders` | List configured responder centres |

---

## Demo

### Primary demo scenario

Call the BimpeAI number and say:

> "Help! My friend just collapsed. He's not responding and his breathing is very weak. We're around Allen Avenue in Ikeja."

Expected system response:
- Type: MEDICAL
- Severity: CRITICAL
- Location: Allen Avenue, Ikeja
- Responder: AMBULANCE
- Incident appears on dashboard within seconds of call ending

### Simulate without a phone call

Use the **Demo Mode** panel on the dashboard to simulate incoming incidents directly.

---

## Demo Limitations

- External emergency-centre contact is **simulated**. No real emergency service is contacted.
- Incidents are stored **in memory** — they reset on server restart.
- Response times are not real — the system does not track actual ambulance positions.
- The system does not call real hospitals, police, or fire services.
- The BimpeAI voice interaction and incident extraction are real.
- Responder routing logic is real.

---

## Project Structure

```
sos-voice/
├── app/
│   ├── dashboard/
│   │   ├── page.tsx              # Main dashboard
│   │   └── incidents/[id]/       # Incident detail
│   ├── api/
│   │   ├── incidents/            # GET list, POST create
│   │   ├── incidents/[id]/       # GET single + timeline
│   │   ├── bimpe/webhook/        # BimpeAI webhook receiver
│   │   └── responders/           # Responder centres
│   ├── layout.tsx
│   ├── page.tsx                  # Landing page
│   └── globals.css
├── components/
│   ├── IncidentCard.tsx
│   ├── IncidentTimeline.tsx
│   ├── IncidentStats.tsx
│   └── DemoCreateIncident.tsx
├── lib/
│   ├── bimpe.ts                  # BimpeAI integration layer
│   ├── incidents.ts              # Incident store + helpers
│   └── routing.ts                # Responder routing engine
├── data/
│   └── responders.json           # Demo responder centres
├── types/
│   └── incident.ts               # TypeScript types
├── .env.example
├── README.md
├── PRD.md
├── ARCHITECTURE.md
└── HACKATHON_STATUS.md
```

> **Agent ID:** not configured manually. The app calls `agents.list()` and uses the `id` of the agent named exactly `SOS Voice`. If none exists, it throws a clear `BimpeAgentNotFoundError`.
