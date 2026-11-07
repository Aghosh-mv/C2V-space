import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/server/db';
import { apiError, withDb } from '@/lib/server/http';
import { syncInputSchema } from '@/lib/server/validate';

export const dynamic = 'force-dynamic';

// Entitlements ("this listing is mine") recorded on the server, so a
// purchase survives cleared storage and follows the same creator across
// browsers on the same client id.

export async function GET(request: NextRequest) {
  const clientId = request.nextUrl.searchParams.get('clientId') ?? '';
  const parsedId = syncInputSchema.shape.clientId.safeParse(clientId);
  if (!parsedId.success) return apiError(400, 'Missing or malformed clientId.');

  const result = await withDb(() =>
    db.entitlement.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
      select: { listingId: true, pricePaid: true, createdAt: true },
    }),
  );
  if (!result.ok) return result.response;

  return NextResponse.json(
    { owned: result.data.map((e) => e.listingId) },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
