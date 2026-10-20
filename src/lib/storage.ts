import type { Profile } from './profile';
import type { Answers } from './scoring';

export interface State {
  version: 1;
  step: 'start' | 'profil' | 'fragen' | 'ergebnis' | 'richtlinien';
  areaIndex: number;
  profile: Profile;
  answers: Answers;
}

const KEY = 'nis2-check:v1';

export function emptyState(): State {
  return {
    version: 1,
    step: 'start',
    areaIndex: 0,
    profile: { company: '', sector: 'brauerei', employees: '10-49', revenue: '2-10', owner: '', itProvider: '' },
    answers: {},
  };
}

export function parseState(raw: unknown): State | null {
  if (!raw || typeof raw !== 'object') return null;
  const s = raw as Partial<State>;
  if (s.version !== 1 || !s.profile || typeof s.answers !== 'object') return null;
  const base = emptyState();
  return { ...base, ...s, profile: { ...base.profile, ...s.profile } } as State;
}

export function load(): State | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? parseState(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function save(state: State) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* Speicher nicht verfügbar (z. B. privates Fenster) – App funktioniert trotzdem */
  }
}

export function clear() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignorieren */
  }
}
