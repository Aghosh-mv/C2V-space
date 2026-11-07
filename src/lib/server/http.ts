import { NextResponse } from 'next/server';

// HTTP conventions for every C2V API route:
//  - success: the route's own JSON payload
//  - failure: { ok: false, error: string } with an honest status code
//  - every POST is rate-limited and size-capped at the door

export function apiError(status: number, error: string) {
  return NextResponse.json({ ok: false as const, error }, { status });
}

/** Wrap a handler so a dead database returns a clean 503, not a stack trace. */
export async function withDb<T>(fn: () => Promise<T>): Promise<
  { ok: true; data: T } | { ok: false; response: NextResponse }
> {
  try {
    return { ok: true, data: await fn() };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'database unavailable';
    if (message.includes('DATABASE_URL') || /Can't reach database|ECONNREFUSED|PrismaClientInitializationError/.test(message)) {
      console.error('[c2v-api] database unavailable:', message);
      return { ok: false, response: apiError(503, 'The database is unreachable — try again shortly.') };
    }
    console.error('[c2v-api] unexpected error:', message);
    return { ok: false, response: apiError(500, 'Something went wrong on our side — try again.') };
  }
}

/* ----------------------------- rate limiting ----------------------------- */
// In-memory fixed window, per IP, per bucket. Honest about being
// single-instance: enough to stop runaway clients on this deployment.

const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(request: Request, bucket: string, limit = 20, windowMs = 60_000): NextResponse | null {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'local';
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || entry.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }
  entry.count += 1;
  if (entry.count > limit) {
    return apiError(429, 'Too many requests — take a breath and try again in a minute.');
  }
  return null;
}

// keep the map from growing forever
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of buckets) if (entry.resetAt <= now) buckets.delete(key);
}, 120_000).unref?.();

/* ------------------------------ body limits ------------------------------ */

const MAX_BODY_BYTES = 1_500_000; // 1.5 MB — two editors of code plus metadata

/** Parse a JSON body with an explicit size cap and a clean error shape. */
export async function readJson<T>(request: Request): Promise<{ ok: true; data: T } | { ok: false; response: NextResponse }> {
  const declared = Number(request.headers.get('content-length') ?? '0');
  if (declared > MAX_BODY_BYTES) {
    return { ok: false, response: apiError(413, 'Payload too large — split your work into smaller pieces.') };
  }
  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return { ok: false, response: apiError(400, 'Could not read the request body.') };
  }
  if (raw.length > MAX_BODY_BYTES) {
    return { ok: false, response: apiError(413, 'Payload too large — split your work into smaller pieces.') };
  }
  try {
    return { ok: true, data: JSON.parse(raw) as T };
  } catch {
    return { ok: false, response: apiError(400, 'Body must be valid JSON.') };
  }
}
