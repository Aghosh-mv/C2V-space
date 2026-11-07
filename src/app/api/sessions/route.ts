import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/server/db';
import { apiError, rateLimit, readJson, withDb } from '@/lib/server/http';
import { firstZodMessage, sessionInputSchema, syncInputSchema } from '@/lib/server/validate';

export const dynamic = 'force-dynamic';

// Server-side half of the History tab: versioned snapshots of your code
// with an id that `inimportcode :<id>` can pull back into the editor.
// localStorage keeps the fast local copy; this makes snapshots survive a
// cleared browser. The server keeps the newest 200 per client.

const SERVER_CAP = 200;
const SESSION_ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789';

function newId(): string {
  let s = '';
  for (let i = 0; i < 7; i++) s += SESSION_ALPHABET[Math.floor(Math.random() * SESSION_ALPHABET.length)];
  return `s-${s}`;
}

export async function GET(request: NextRequest) {
  const clientId = request.nextUrl.searchParams.get('clientId') ?? '';
  const parsedId = syncInputSchema.shape.clientId.safeParse(clientId);
  if (!parsedId.success) return apiError(400, 'Missing or malformed clientId.');

  const result = await withDb(() =>
    db.codeSession.findMany({
      where: { clientId },
      orderBy: { savedAt: 'desc' },
      take: SERVER_CAP,
    }),
  );
  if (!result.ok) return result.response;

  return NextResponse.json(
    {
      sessions: result.data.map((s) => ({
        id: s.id,
        kind: s.kind,
        code: s.code,
        savedAt: s.savedAt.getTime(),
      })),
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id') ?? '';
  const clientId = request.nextUrl.searchParams.get('clientId') ?? '';
  if (!/^s-[a-z0-9]{4,16}$/i.test(id)) return apiError(400, 'Malformed session id.');
  const parsedId = syncInputSchema.shape.clientId.safeParse(clientId);
  if (!parsedId.success) return apiError(400, 'Missing or malformed clientId.');

  // only the owning client may delete its own snapshot
  const result = await withDb(() =>
    db.codeSession.deleteMany({ where: { id, clientId } }),
  );
  if (!result.ok) return result.response;
  return NextResponse.json({ ok: true as const });
}

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, 'sessions-post', 60);
  if (limited) return limited;

  const body = await readJson<unknown>(request);
  if (!body.ok) return body.response;

  const parsed = sessionInputSchema.safeParse(body.data);
  if (!parsed.success) return apiError(400, firstZodMessage(parsed.error));

  const { clientId, kind, code } = parsed.data;

  const created = await withDb(async () => {
    const session = await db.codeSession.create({
      data: { id: newId(), clientId, kind, code },
    });
    // enforce the cap: keep only the newest SERVER_CAP rows for this client
    const overflow = await db.codeSession.findMany({
      where: { clientId },
      orderBy: { savedAt: 'desc' },
      skip: SERVER_CAP,
      select: { id: true },
    });
    if (overflow.length > 0) {
      await db.codeSession.deleteMany({ where: { id: { in: overflow.map((o) => o.id) } } });
    }
    return session;
  });
  if (!created.ok) return created.response;

  return NextResponse.json(
    { id: created.data.id, kind: created.data.kind, code: created.data.code, savedAt: created.data.savedAt.getTime() },
    { status: 201 },
  );
}
