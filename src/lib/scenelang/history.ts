// Code sessions — every version of your code gets an id you can pull back
// into the editor with:  inimportcode :<session-id>
// Browse ids in the History tab.
// Snapshots are stored locally (fast, offline-safe) and mirrored to the
// server (durable — they survive a cleared browser). The server keeps the
// newest 200; locally the newest 60 are kept for instant loading.

import { apiFetch, getClientId } from '@/lib/client/api';

export interface CodeSession {
  id: string;
  kind: 'scene' | 'style';
  code: string;
  savedAt: number;
}

const KEY = 'scenelang.sessions';
const MAX_SESSIONS = 60;

function read(): CodeSession[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CodeSession[]) : [];
  } catch {
    return [];
  }
}

function write(all: CodeSession[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(all.slice(0, MAX_SESSIONS)));
  } catch {
    // storage full — keep going in memory
  }
}

function newId(): string {
  const alphabet = 'abcdefghjkmnpqrstuvwxyz23456789';
  let s = '';
  for (let i = 0; i < 6; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `s-${s}`;
}

/** Save a snapshot; returns null when identical to the newest one. */
export function saveSession(kind: CodeSession['kind'], code: string): CodeSession | null {
  const trimmed = code.trim();
  if (!trimmed) return null;
  const all = read();
  if (all.length > 0 && all[0].kind === kind && all[0].code.trim() === trimmed) return null;
  const session: CodeSession = { id: newId(), kind, code, savedAt: Date.now() };
  write([session, ...all]);

  // durable mirror — the server issues its own id; adopt it locally so the
  // two stores stay deduped when they merge
  void apiFetch<{ id: string; savedAt: number }>('/api/sessions', {
    method: 'POST',
    body: JSON.stringify({ clientId: getClientId(), kind, code }),
  }).then((result) => {
    if (!result.ok) return;
    const next = read().map((s) =>
      s.id === session.id ? { ...s, id: result.data.id, savedAt: result.data.savedAt } : s,
    );
    write(next);
  });

  return session;
}

export function listSessions(kind?: CodeSession['kind']): CodeSession[] {
  const all = read();
  return kind ? all.filter((s) => s.kind === kind) : all;
}

export function getSession(id: string): CodeSession | undefined {
  const lower = id.toLowerCase();
  return read().find((s) => s.id.toLowerCase() === lower);
}

export function deleteSession(id: string): CodeSession[] {
  const all = read().filter((s) => s.id !== id);
  write(all);
  // best-effort server delete; the pull below reconciles anyway
  void apiFetch(`/api/sessions?id=${encodeURIComponent(id)}&clientId=${encodeURIComponent(getClientId())}`, {
    method: 'DELETE',
  });
  return all;
}

/**
 * Pull the durable server copy and merge it into the local store.
 * Server wins on id conflicts (it is the canonical store); locally-only
 * snapshots are kept. Returns the merged list, or null when offline.
 */
export async function pullSessionsFromServer(): Promise<CodeSession[] | null> {
  const result = await apiFetch<{ sessions: CodeSession[] }>('/api/sessions?clientId=' + encodeURIComponent(getClientId()));
  if (!result.ok) return null;
  const server = result.data.sessions;
  const byId = new Map<string, CodeSession>();
  for (const s of read()) byId.set(s.id, s);
  for (const s of server) {
    const local = byId.get(s.id);
    if (!local || local.savedAt < s.savedAt) byId.set(s.id, s);
  }
  const merged = [...byId.values()].sort((a, b) => b.savedAt - a.savedAt);
  write(merged);
  return merged;
}
