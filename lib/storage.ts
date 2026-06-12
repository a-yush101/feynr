import type { SessionState } from './types';

// Alias to match requested name
export type FeynrSession = SessionState;

export const SESSION_KEY = 'feynr_session_v1';

function storageAvailable(): boolean {
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  } catch {
    return false;
  }
}

export function isStorageAvailable(): boolean {
  return storageAvailable();
}

export function getSession(): FeynrSession | null {
  if (!storageAvailable()) return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as FeynrSession;
  } catch (err) {
    console.error('Failed to read session from localStorage', err);
    return null;
  }
}

export function setSession(session: FeynrSession): void {
  if (!storageAvailable()) return;
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (err) {
    console.error('Failed to write session to localStorage', err);
  }
}

export function clearSession(): void {
  if (!storageAvailable()) return;
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch (err) {
    console.error('Failed to clear session from localStorage', err);
  }
}

/**
 * Update a single field on the saved session without overwriting other fields.
 * If no session exists, returns null and does nothing.
 */
export function updateSessionField<K extends keyof FeynrSession>(
  key: K,
  value: FeynrSession[K],
): FeynrSession | null {
  if (!storageAvailable()) return null;
  try {
    const current = getSession();
    if (!current) return null;
    const updated: FeynrSession = { ...current, [key]: value } as FeynrSession;
    setSession(updated);
    return updated;
  } catch (err) {
    console.error('Failed to update session field', err);
    return null;
  }
}
