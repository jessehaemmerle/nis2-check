import { describe, expect, it } from 'vitest';
import { QUESTIONS, AREAS } from '../src/data/questions';
import { SECTORS } from '../src/data/sectors';
import { buildPolicy, POLICY_META } from '../src/data/policies';
import { applicability, sizeClass, type Profile } from '../src/lib/profile';
import { buildTodos, maturityLevel, overallScore, type Answers } from '../src/lib/scoring';
import { policyToMarkdown, slug } from '../src/lib/export';
import { emptyState, parseState } from '../src/lib/storage';

const profile = (p: Partial<Profile> = {}): Profile => ({ ...emptyState().profile, ...p });
const all = (v: 0 | 1 | 2 | 3): Answers => Object.fromEntries(QUESTIONS.map((q) => [q.id, v]));

describe('Fragenkatalog', () => {
  it('jede Frage gehört zu einem Bereich und hat eine eindeutige ID', () => {
    const ids = new Set(QUESTIONS.map((q) => q.id));
    expect(ids.size).toBe(QUESTIONS.length);
    for (const q of QUESTIONS) expect(AREAS.some((a) => a.id === q.area)).toBe(true);
    for (const a of AREAS) expect(QUESTIONS.some((q) => q.area === a.id)).toBe(true);
  });
});

describe('Betroffenheit', () => {
  it('Größe richtet sich nach dem höheren Wert', () => {
    expect(sizeClass({ employees: '<10', revenue: '10-50' })).toBe('mittel');
    expect(sizeClass({ employees: '250+', revenue: '<2' })).toBe('gross');
  });
  it('mittlere Brauerei ist wichtige Einrichtung', () => {
    expect(applicability(profile({ sector: 'brauerei', employees: '50-249' }))).toBe('wichtig');
  });
  it('kleine Brauerei und große Gastro sind nicht direkt betroffen', () => {
    expect(applicability(profile({ sector: 'brauerei', employees: '10-49', revenue: '2-10' }))).toBe('nicht-direkt');
    expect(applicability(profile({ sector: 'gastro', employees: '250+' }))).toBe('nicht-direkt');
  });
  it('großer Energiebetrieb ist wesentlich, Anhang II bleibt wichtig', () => {
    expect(applicability(profile({ sector: 'energie', employees: '250+' }))).toBe('wesentlich');
    expect(applicability(profile({ sector: 'produktion', employees: '250+' }))).toBe('wichtig');
  });
});

describe('Scoring', () => {
  it('ohne Antworten gibt es keinen Score', () => {
    expect(overallScore({})).toBeNull();
  });
  it('Extremwerte ergeben 0 und 100', () => {
    expect(overallScore(all(0))).toBe(0);
    expect(overallScore(all(3))).toBe(100);
    expect(overallScore({ gov1: 'unknown' })).toBe(0);
  });
  it('Reifegrade decken 0–100 ab', () => {
    expect(maturityLevel(0).n).toBe(1);
    expect(maturityLevel(59).n).toBe(3);
    expect(maturityLevel(100).n).toBe(5);
  });
  it('To-dos sind absteigend priorisiert, erfüllte Fragen entfallen', () => {
    const todos = buildTodos(all(0), 'mittel');
    expect(todos).toHaveLength(QUESTIONS.length);
    for (let i = 1; i < todos.length; i++) expect(todos[i - 1].priority).toBeGreaterThanOrEqual(todos[i].priority);
    expect(todos[0].bucket).toBe('sofort');
    expect(buildTodos(all(3), 'mittel')).toHaveLength(0);
  });
  it('Kleinbetriebe reihen aufwendige Maßnahmen niedriger', () => {
    const big = buildTodos({ eff2: 0 }, 'gross')[0].priority;
    const small = buildTodos({ eff2: 0 }, 'kleinst')[0].priority;
    expect(small).toBeLessThan(big);
  });
});

describe('Richtlinien', () => {
  it('jede Vorlage für jede Branche und Größe enthält Firmenname und Unterschriftszeile', () => {
    for (const s of SECTORS)
      for (const employees of ['<10', '10-49', '50-249', '250+'] as const)
        for (const m of POLICY_META) {
          const doc = buildPolicy(m.id, profile({ sector: s.id, employees, company: 'Brauerei Test' }));
          const md = policyToMarkdown(doc, 'Brauerei Test');
          expect(md).toContain('Brauerei Test');
          expect(md).toContain('Unterschrift');
          expect(md).not.toContain('undefined');
        }
  });
  it('Meldefristen nur für betroffene Betriebe, sonst DSGVO-Hinweis', () => {
    const reg = policyToMarkdown(buildPolicy('incident', profile({ sector: 'brauerei', employees: '50-249' })), 'X');
    expect(reg).toContain('24 Stunden');
    const gastro = policyToMarkdown(buildPolicy('incident', profile({ sector: 'gastro' })), 'X');
    expect(gastro).not.toContain('Frühwarnung');
    expect(gastro).toContain('Datenschutzbehörde');
  });
  it('Branchenbeispiele erscheinen in der Vorlage', () => {
    const md = policyToMarkdown(buildPolicy('access', profile({ sector: 'brauerei' })), 'X');
    expect(md).toContain('Anlagenbauer');
    expect(md).toContain('Steuerungs- und Produktionsanlagen');
  });
});

describe('Hilfsfunktionen', () => {
  it('slug ersetzt Umlaute', () => {
    expect(slug('Brauerei Größl & Söhne')).toBe('brauerei-groessl-soehne');
    expect(slug('')).toBe('betrieb');
  });
  it('parseState lehnt fremde Dateien ab und ergänzt fehlende Felder', () => {
    expect(parseState({ foo: 1 })).toBeNull();
    const s = parseState({ version: 1, profile: { company: 'A' }, answers: {} });
    expect(s?.profile.sector).toBe('brauerei');
  });
});
