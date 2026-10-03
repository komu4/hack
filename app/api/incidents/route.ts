import { NextRequest, NextResponse } from 'next/server';
import { getAllIncidents, createIncident } from '@/lib/incidents';
import type { CreateIncidentPayload } from '@/types/incident';

export async function GET() {
  const incidents = getAllIncidents();
  return NextResponse.json({ success: true, incidents });
}

export async function POST(req: NextRequest) {
  try {
    const body: CreateIncidentPayload = await req.json();

    if (!body.type || !body.severity || !body.location || !body.description) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: type, severity, location, description' },
        { status: 400 },
      );
    }

    const incident = createIncident(body);

    return NextResponse.json(
      {
        success: true,
        incident: {
          id: incident.id,
          status: incident.status,
          recommendedResponders: incident.recommendedResponders,
          severity: incident.severity,
          type: incident.type,
        },
      },
      { status: 201 },
    );
  } catch (err) {
    console.error('[POST /api/incidents]', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
