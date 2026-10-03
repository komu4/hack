import { NextResponse } from 'next/server';
import respondersData from '@/data/responders.json';

export async function GET() {
  return NextResponse.json({ success: true, responders: respondersData });
}
