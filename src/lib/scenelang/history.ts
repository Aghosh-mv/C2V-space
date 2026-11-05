// Code sessions — every version of your code gets an id you can pull back
// into the editor with:  inimportcode :<session-id>
// Browse ids in the History tab.

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
  return all;
}
