import { getSector } from '../data/sectors';

export type SizeClass = 'kleinst' | 'klein' | 'mittel' | 'gross';
export type EmployeeBand = '<10' | '10-49' | '50-249' | '250+';
export type RevenueBand = '<2' | '2-10' | '10-50' | '>50';

export interface Profile {
  company: string;
  sector: string;
  employees: EmployeeBand;
  revenue: RevenueBand;
  /** Verantwortliche Person für Informationssicherheit */
  owner: string;
  /** Externer IT-Betreuer, falls vorhanden */
  itProvider: string;
}

export const SIZE_LABEL: Record<SizeClass, string> = {
  kleinst: 'Kleinstbetrieb',
  klein: 'Kleinbetrieb',
  mittel: 'Mittlerer Betrieb',
  gross: 'Großbetrieb',
};

const ORDER: SizeClass[] = ['kleinst', 'klein', 'mittel', 'gross'];
const BY_EMPLOYEES: Record<EmployeeBand, SizeClass> = { '<10': 'kleinst', '10-49': 'klein', '50-249': 'mittel', '250+': 'gross' };
const BY_REVENUE: Record<RevenueBand, SizeClass> = { '<2': 'kleinst', '2-10': 'klein', '10-50': 'mittel', '>50': 'gross' };

/**
 * Vereinfachte KMU-Einstufung (Empfehlung 2003/361/EG): Der größere der beiden Werte zählt.
 * Die genaue Prüfung berücksichtigt zusätzlich Bilanzsumme und Partnerunternehmen.
 */
export function sizeClass(p: Pick<Profile, 'employees' | 'revenue'>): SizeClass {
  const a = ORDER.indexOf(BY_EMPLOYEES[p.employees]);
  const b = ORDER.indexOf(BY_REVENUE[p.revenue]);
  return ORDER[Math.max(a, b)];
}

export type Applicability = 'wesentlich' | 'wichtig' | 'nicht-direkt';

export function applicability(p: Pick<Profile, 'sector' | 'employees' | 'revenue'>): Applicability {
  const { annex } = getSector(p.sector);
  const size = sizeClass(p);
  if (annex === 'none' || size === 'kleinst' || size === 'klein') return 'nicht-direkt';
  if (annex === 'I' && size === 'gross') return 'wesentlich';
  return 'wichtig';
}

export const APPLICABILITY_TEXT: Record<Applicability, { title: string; text: string }> = {
  wesentlich: {
    title: 'Voraussichtlich „wesentliche Einrichtung“',
    text: 'Ihr Betrieb fällt voraussichtlich unter das NISG 2026 mit den strengsten Pflichten: Registrierung beim Bundesamt für Cybersicherheit bis 31.12.2026, Risikomanagement-Maßnahmen, Meldepflichten und anlasslose Aufsicht.',
  },
  wichtig: {
    title: 'Voraussichtlich „wichtige Einrichtung“',
    text: 'Ihr Betrieb fällt voraussichtlich unter das NISG 2026: Registrierung beim Bundesamt für Cybersicherheit bis 31.12.2026, Risikomanagement-Maßnahmen und Meldepflichten. Kontrollen erfolgen vor allem anlassbezogen.',
  },
  'nicht-direkt': {
    title: 'Voraussichtlich nicht direkt betroffen',
    text: 'Ihr Betrieb fällt voraussichtlich nicht direkt unter das NISG 2026. Die Analyse lohnt sich trotzdem: Kunden und Partner fordern die Maßnahmen zunehmend ein, und sie schützen vor den häufigsten Angriffen.',
  },
};
