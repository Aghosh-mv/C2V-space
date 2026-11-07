'use client';

// Client half of the C2V backend: an anonymous, persistent clientId plus a
// fetch wrapper that never hangs, never throws and tells the user — once —
// when the network is down. Every creator is anonymous by default: no
// account, no email, just an id this browser keeps.

import { toast } from 'sonner';

const CLIENT_KEY = 'c2v.clientId';

export function getClientId(): string {
  if (typeof window === 'undefined') return 'server-render-placeholder';
  let id = window.localStorage.getItem(CLIENT_KEY);
  if (!id || !/^[A-Za-z0-9_-]{8,64}$/.test(id)) {
    id = (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`).replace(/[^A-Za-z0-9_-]/g, '').slice(0, 32);
    window.localStorage.setItem(CLIENT_KEY, id);
  }
  return id;
}

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };

let offlineToastShown = false;

function noteOffline() {
  if (offlineToastShown) return;
  offlineToastShown = true;
  toast.info('You are offline — your work keeps saving on this device and will sync when the connection returns.');
}

function noteBackOnline() {
  if (!offlineToastShown) return;
  offlineToastShown = false;
  toast.success('Back online — your library and history are syncing again.');
}

/** JSON fetch with a timeout and a stable error shape. Never throws. */
export async function apiFetch<T>(path: string, init?: RequestInit, timeoutMs = 8000): Promise<ApiResult<T>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(path, {
      ...init,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    });
    const payload = (await response.json().catch(() => null)) as unknown;
    if (!response.ok) {
      const error =
        payload && typeof payload === 'object' && 'error' in payload && typeof (payload as { error: unknown }).error === 'string'
          ? (payload as { error: string }).error
          : `Request failed (${response.status})`;
      return { ok: false, error };
    }
    return { ok: true, data: payload as T };
  } catch (err) {
    const aborted = err instanceof DOMException && err.name === 'AbortError';
    noteOffline();
    return { ok: false, error: aborted ? 'The server took too long to respond.' : 'The server is unreachable.' };
  } finally {
    clearTimeout(timer);
    // probe once on the next call after a failure so "back online" is noticed
    if (offlineToastShown) scheduleOnlineProbe();
  }
}

let probing = false;
function scheduleOnlineProbe() {
  if (probing) return;
  probing = true;
  setTimeout(async () => {
    try {
      const response = await fetch('/api', { cache: 'no-store' });
      if (response.ok) noteBackOnline();
    } catch {
      // still offline — the next failed call will schedule another probe
    } finally {
      probing = false;
    }
  }, 15_000);
}
