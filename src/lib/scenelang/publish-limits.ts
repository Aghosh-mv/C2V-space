// Shared between the publish form (live counters) and the server
// (authoritative limits) so the two can never drift.

export const MAX_TITLE = 80;
export const MAX_AUTHOR = 40;
export const MAX_DESCRIPTION = 280;

/** localStorage key for the creator's display name. */
export const AUTHOR_KEY = 'c2v.author';

export function loadSavedAuthor(): string {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(AUTHOR_KEY) ?? '';
}

export function saveAuthor(name: string) {
  try {
    window.localStorage.setItem(AUTHOR_KEY, name);
  } catch {
    // storage unavailable — the name still works for this publish
  }
}
