# PRD — SOS Voice

## Product

**SOS Voice** — AI Emergency Intake, Triage and Coordination System for Nigeria

---

## Problem

During an emergency, people are scared, injured, confused, or driving. They cannot:
- Find and open an app
- Navigate menus
- Type their location accurately
- Fill out a form while panicking

Even when someone knows what to do, the cognitive load of a traditional digital interface is too high in a genuine emergency.

Current emergency services in many parts of Nigeria also lack:
- A consistent single intake number
- AI-powered triage and routing
- Real-time structured incident records
- A coordination dashboard

---

## Solution

A phone-based AI emergency intake and coordination system.

A person calls **one phone number**. They speak naturally. The AI:
1. Understands what happened
2. Identifies the emergency category
3. Assesses severity
4. Collects location
5. Asks only the most critical follow-up questions
6. Gives simple immediate safety guidance
7. Creates a structured SOS incident
8. Identifies the appropriate responder type
9. Routes the incident into a backend workflow
10. Updates a live coordination dashboard

---

## Target Users

**Callers (primary)**
- Individuals experiencing or witnessing an emergency
- Family members, bystanders, witnesses
- People who are scared, injured, confused, or unable to type

**Operators (secondary)**
- Emergency coordination staff using the dashboard
- Security teams at hotels, estates, events, schools
- Business continuity managers

**Future customers**
- Private ambulance providers
- Fire services
- Private security companies
- Hotels and hospitality groups
- Estates and gated communities
- Factories, offices, workplaces
- Schools and universities
- Event organizers
- Insurance companies

---

## Core User Journey

```
Call
  ↓
"Tell me what happened."
  ↓
AI understands emergency
  ↓
"Where are you right now?"
  ↓
AI captures location
  ↓
AI asks 1–2 critical questions
  ↓
AI gives immediate safety guidance
  ↓
SOS incident created
  ↓
Response routed to appropriate responder
  ↓
Incident tracked on dashboard
  ↓
"I've prepared the emergency request. Stay somewhere safe."
```

---

## MVP Scope

### Included

- BimpeAI telephony voice integration
- AI emergency conversation (understand, triage, extract)
- Structured SOS incident creation
- Emergency categories: MEDICAL, FIRE, POLICE, ACCIDENT, OTHER
- Severity classification: CRITICAL, HIGH, MODERATE, LOW
- Responder routing logic
- Demo responder centres
- Live dashboard (polling-based)
- Incident detail view with AI timeline
- Demo mode for hackathon presentation
- Landing page

### Excluded

- Real ambulance fleet management
- National emergency infrastructure
- Mobile application
- User accounts / authentication
- Payment systems
- Complex GIS / maps
- Advanced AI medical diagnosis
- Hospital management
- Real police integrations
- Real fire service APIs
- Multi-language support
- Push notifications

---

## Success Criteria

The judge should be able to:

1. ✅ Call the BimpeAI phone number
2. ✅ Explain an emergency naturally
3. ✅ See the AI understand it
4. ✅ See the structured incident appear on the dashboard
5. ✅ See responder routing
6. ✅ See the AI action timeline

---

## Key Product Principle

> **Listen → Understand → Triage → Assist → Create Incident → Route → Confirm**

The caller never needs to understand the technology.

The important part is not that someone filled out an emergency form. They simply called, spoke naturally, and the system turned that conversation into a structured response workflow.

---

## Emergency Categories

| Category | Examples |
|---|---|
| MEDICAL | Person collapsed, unconscious, breathing problem, injury |
| FIRE | Kitchen fire, building fire, smoke visible |
| POLICE | Break-in, robbery, assault, armed threat |
| ACCIDENT | Road collision, vehicle crash |
| OTHER | Unclear emergencies, unclassified events |

---

## Severity Levels

| Severity | Criteria |
|---|---|
| CRITICAL | Immediate threat to life — unconscious, not breathing, severe bleeding, trapped, active fire with people |
| HIGH | Serious situation, urgent attention needed, not clearly immediately life-threatening |
| MODERATE | Assistance required, no obvious immediate threat to life |
| LOW | Non-urgent request |

---

## Responder Routing Rules

| Emergency | Primary | Additional |
|---|---|---|
| MEDICAL | AMBULANCE | — |
| FIRE | FIRE_SERVICE | AMBULANCE (if injuries) |
| POLICE | POLICE | — |
| ACCIDENT | POLICE + AMBULANCE | FIRE_SERVICE (if trapped or fire) |
| OTHER | AMBULANCE (default) | Varies by signals |

---

## Long-Term Vision

SOS Voice could become a **voice-first emergency coordination layer** connecting people to the right response organization — hospitals, ambulance providers, fire services, police, private security, schools, hotels, estates, factories, event venues, and insurance companies — through one consistent, AI-powered phone interface.
