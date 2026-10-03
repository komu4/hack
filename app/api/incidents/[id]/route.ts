import { NextRequest, NextResponse } from 'next/server';
import { getIncidentById, getTimelineForIncident } from '@/lib/incidents';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const incident = getIncidentById(id);
  if (!incident) {
    return NextResponse.json({ success: false, error: 'Incident not found' }, { status: 404 });
  }

  const timeline = getTimelineForIncident(id);

  return NextResponse.json({ success: true, incident, timeline });
}
