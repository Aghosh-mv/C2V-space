import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/server/db';
import { apiError, rateLimit, readJson, withDb } from '@/lib/server/http';
import { firstZodMessage, syncInputSchema } from '@/lib/server/validate';

export const dynamic = 'force-dynamic';

// Cloud mirror of the two Studio editors, keyed by the browser's anonymous
// clientId. localStorage stays the instant local copy; this is the durable
// second copy that survives cleared storage and works across browsers.

export async function GET(request: NextRequest) {
  const clientId = request.nextUrl.searchParams.get('clientId') ?? '';
  const parsedId = syncInputSchema.shape.clientId.safeParse(clientId);
  if (!parsedId.success) return apiError(400, 'Missing or malformed clientId.');

  const result = await withDb(() =>
    db.syncState.findUnique({
      where: { clientId },
      select: { sceneCode: true, styleCode: true, sceneSavedAt: true, styleSavedAt: true },
    }),
  );
  if (!result.ok) return result.response;

  const state = result.data;
  return NextResponse.json(
    {
      sceneCode: state?.sceneCode ?? null,
      styleCode: state?.styleCode ?? null,
      sceneSavedAt: state?.sceneSavedAt?.getTime() ?? null,
      styleSavedAt: state?.styleSavedAt?.getTime() ?? null,
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}

export async function PUT(request: NextRequest) {
  const limited = rateLimit(request, 'sync-put', 60);
  if (limited) return limited;

  const body = await readJson<unknown>(request);
  if (!body.ok) return body.response;

  const parsed = syncInputSchema.safeParse(body.data);
  if (!parsed.success) return apiError(400, firstZodMessage(parsed.error));

  const { clientId, sceneCode, styleCode } = parsed.data;
  const existing = await withDb(() =>
    db.syncState.findUnique({ where: { clientId }, select: { sceneCode: true, styleCode: true } }),
  );
  if (!existing.ok) return existing.response;

  const sceneSavedAt = sceneCode !== (existing.data?.sceneCode ?? '') || !existing.data ? new Date() : undefined;
  const styleSavedAt = styleCode !== (existing.data?.styleCode ?? '') || !existing.data ? new Date() : undefined;

  const saved = await withDb(() =>
    db.syncState.upsert({
      where: { clientId },
      create: { clientId, sceneCode, styleCode, sceneSavedAt: new Date(), styleSavedAt: new Date() },
      update: { sceneCode, styleCode, ...(sceneSavedAt && { sceneSavedAt }), ...(styleSavedAt && { styleSavedAt }) },
    }),
  );
  if (!saved.ok) return saved.response;

  return NextResponse.json({ ok: true as const, updatedAt: saved.data.updatedAt.getTime() });
}
