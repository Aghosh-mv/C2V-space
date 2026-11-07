import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/server/db';
import { apiError, rateLimit, readJson, withDb } from '@/lib/server/http';
import { firstZodMessage, listingInputSchema, validateListingCode } from '@/lib/server/validate';

export const dynamic = 'force-dynamic';

// Community Marketplace listings. The official premade catalog ships with
// the app and never lives here — everything this route returns or accepts
// is creator content, validated server-side before it is accepted.

const LISTING_CAP = 500;

export async function GET() {
  const result = await withDb(() =>
    db.marketListing.findMany({
      orderBy: { createdAt: 'desc' },
      take: LISTING_CAP,
    }),
  );
  if (!result.ok) return result.response;

  return NextResponse.json(
    {
      listings: result.data.map((l) => ({
        id: l.id,
        kind: l.kind,
        title: l.title,
        author: l.author,
        description: l.description,
        price: l.price,
        code: l.code,
        createdAt: l.createdAt.getTime(),
      })),
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, 'market-post', 10);
  if (limited) return limited;

  const body = await readJson<unknown>(request);
  if (!body.ok) return body.response;

  const parsed = listingInputSchema.safeParse(body.data);
  if (!parsed.success) return apiError(400, firstZodMessage(parsed.error));

  const input = parsed.data;
  const codeProblem = validateListingCode(input.kind, input.code);
  if (codeProblem) return apiError(422, codeProblem);

  const created = await withDb(() =>
    db.marketListing.create({
      data: {
        kind: input.kind,
        title: input.title,
        author: input.author,
        description: input.description || 'A SceneLang creation.',
        price: input.price,
        code: input.code,
        clientId: input.clientId,
      },
    }),
  );
  if (!created.ok) return created.response;

  return NextResponse.json(
    {
      id: created.data.id,
      kind: created.data.kind,
      title: created.data.title,
      author: created.data.author,
      description: created.data.description,
      price: created.data.price,
      code: created.data.code,
      createdAt: created.data.createdAt.getTime(),
    },
    { status: 201 },
  );
}
