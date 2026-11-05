import { NextResponse } from 'next/server';

// Health probe for uptime checks and the PWA.
export async function GET() {
  return NextResponse.json(
    { app: 'c2v-space', status: 'ok', version: '2.1' },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
