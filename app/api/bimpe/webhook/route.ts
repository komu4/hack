/**
 * BimpeAI Webhook Endpoint
 *
 * POST /api/bimpe/webhook
 *
 * Receives events from BimpeAI when a conversation ends or is updated.
 * Extracts emergency information → creates an incident → routes to responders.
 *
 * BimpeAI sends events for: conversation.completed, conversation.updated, call.ended, etc.
 * The exact event names depend on your BimpeAI agent channel configuration.
 * Configure your BimpeAI agent webhook URL to point to:
 *   https://your-domain.com/api/bimpe/webhook
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractIncidentFromWebhook, type BimpeWebhookPayload } from '@/lib/bimpe';
import { createIncident } from '@/lib/incidents';

export async function POST(req: NextRequest) {
  try {
    const body: BimpeWebhookPayload = await req.json();

    console.log('[BimpeAI Webhook] Received event:', body.event ?? 'unknown', {
      conversationId: body.conversationId,
      agentId: body.agentId,
    });

    // We process events when a conversation/call ends and has a transcript
    const triggerEvents = [
      'conversation.completed',
      'conversation.ended',
      'call.ended',
      'call.completed',
      'message.created', // for real-time processing if needed
    ];

    const event = body.event ?? '';
    const hasTranscript = !!(body.transcript || (body.messages && body.messages.length > 0));

    if (!triggerEvents.includes(event) && !hasTranscript) {
      // Acknowledge non-actionable events
      return NextResponse.json({ success: true, action: 'acknowledged', event });
    }

    // Extract incident from the conversation
    const incidentPayload = extractIncidentFromWebhook(body);

    if (!incidentPayload) {
      console.warn('[BimpeAI Webhook] Could not extract incident from conversation', {
        conversationId: body.conversationId,
        event,
      });
      return NextResponse.json({
        success: true,
        action: 'no_incident_extracted',
        reason:
          'Conversation did not contain sufficient emergency information or SOS_INCIDENT block.',
      });
    }

    // Create the incident
    const incident = createIncident(incidentPayload);

    console.log('[BimpeAI Webhook] Incident created:', {
      id: incident.id,
      type: incident.type,
      severity: incident.severity,
      location: incident.location,
      responders: incident.recommendedResponders,
    });

    return NextResponse.json({
      success: true,
      action: 'incident_created',
      incident: {
        id: incident.id,
        type: incident.type,
        severity: incident.severity,
        status: incident.status,
        location: incident.location,
        recommendedResponders: incident.recommendedResponders,
      },
    });
  } catch (err) {
    console.error('[BimpeAI Webhook] Error:', err);
    return NextResponse.json(
      { success: false, error: 'Webhook processing failed' },
      { status: 500 },
    );
  }
}

// BimpeAI may send HEAD or OPTIONS for verification
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
