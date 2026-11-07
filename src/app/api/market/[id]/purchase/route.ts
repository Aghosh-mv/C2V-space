import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/server/db';
import { apiError, rateLimit, readJson, withDb } from '@/lib/server/http';
import { firstZodMessage, purchaseInputSchema } from '@/lib/server/validate';

export const dynamic = 'force-dynamic';

// Record an entitlement server-side. The listing must exist on the server
// (official premade items are free and owned implicitly by everyone).

export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const limited = rateLimit(request, 'purchase-post', 30);
  if (limited) return limited;

  const { id } = await ctx.params;
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(id)) return apiError(400, 'Malformed listing id.');

  const body = await readJson<unknown>(request);
  if (!body.ok) return body.response;

  const parsed = purchaseInputSchema.safeParse(body.data);
  if (!parsed.success) return apiError(400, firstZodMessage(parsed.error));

  const result = await withDb(async () => {
    const listing = await db.marketListing.findUnique({ where: { id }, select: { price: true } });
    if (!listing) return null;
    return db.entitlement.upsert({
      where: { clientId_listingId: { clientId: parsed.data.clientId, listingId: id } },
      create: { clientId: parsed.data.clientId, listingId: id, pricePaid: listing.price },
      update: {},
    });
  });
  if (!result.ok) return result.response;
  if (result.data === null) return apiError(404, 'That listing does not exist on the server.');

  return NextResponse.json({ ok: true as const, listingId: id });
}
