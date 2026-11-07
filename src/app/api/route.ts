import { NextResponse } from 'next/server';
import { APP_NAME, APP_VERSION } from '@/lib/version';

// Health probe for uptime checks and monitoring.
export async function GET() {
  return NextResponse.json(
    { app: APP_NAME, status: 'ok', version: APP_VERSION, time: new Date().toISOString() },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
