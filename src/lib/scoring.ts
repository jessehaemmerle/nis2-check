import { AREAS, QUESTIONS, type Effort, type Question } from '../data/questions';
import type { SizeClass } from './profile';

/** 0 = nicht vorhanden … 3 = vollständig umgesetzt, 'unknown' = weiß nicht */
export type Answer = 0 | 1 | 2 | 3 | 'unknown';
export type Answers = Record<string, Answer>;

export const ANSWER_LABELS: { value: Answer; label: string }[] = [
  { value: 0, label: 'Nein' },
  { value: 1, label: 'Ansatzweise' },
  { value: 2, label: 'Größtenteils' },
  { value: 3, label: 'Ja, vollständig' },
  { value: 'unknown', label: 'Weiß nicht' },
];

const points = (a: Answer) => (a === 'unknown' ? 0 : a);

/** Prozentwert 0–100 über die beantworteten Fragen, gewichtet. null, wenn nichts beantwortet. */
export function scoreOf(questions: Question[], answers: Answers): number | null {
  let got = 0;
  let max = 0;
  for (const q of questions) {
    const a = answers[q.id];
    if (a === undefined) continue;
    got += q.weight * points(a);
    max += q.weight * 3;
  }
  return max === 0 ? null : Math.round((got / max) * 100);
}

export function overallScore(answers: Answers): number | null {
  return scoreOf(QUESTIONS, answers);
}

export function areaScores(answers: Answers) {
  return AREAS.map((area) => ({
    area,
    score: scoreOf(QUESTIONS.filter((q) => q.area === area.id), answers),
  }));
}

export interface Level {
  n: 1 | 2 | 3 | 4 | 5;
  name: string;
  text: string;
}

export function maturityLevel(score: number): Level {
  if (score < 20) return { n: 1, name: 'Startpunkt', text: 'Es gibt kaum Schutzmaßnahmen. Mit wenigen Schritten erreichen Sie schnell viel.' };
  if (score < 40) return { n: 2, name: 'Erste Grundlagen', text: 'Einzelne Maßnahmen sind da, wichtige Lücken bleiben. Beginnen Sie mit den Sofort-Maßnahmen.' };
  if (score < 60) return { n: 3, name: 'Im Aufbau', text: 'Die Basis steht. Jetzt geht es um Dokumentation und Regelmäßigkeit.' };
  if (score < 80) return { n: 4, name: 'Gut unterwegs', text: 'Die meisten Anforderungen sind erfüllt. Schließen Sie die verbleibenden Lücken gezielt.' };
  return { n: 5, name: 'Gut aufgestellt', text: 'Ihr Betrieb erfüllt die Anforderungen weitgehend. Halten Sie das Niveau durch regelmäßige Prüfungen.' };
}

export type Bucket = 'sofort' | 'bald' | 'spaeter';

export interface Todo {
  question: Question;
  answer: Answer;
  priority: number;
  bucket: Bucket;
  quickWin: boolean;
}

const EFFORT_FACTOR: Record<Effort, number> = { gering: 1.25, mittel: 1, hoch: 0.75 };

/**
 * Priorität = Gewicht × Lücke × Aufwandsfaktor. Kleine Betriebe gewichten aufwendige
 * Maßnahmen schwächer, damit zuerst das Machbare oben steht.
 */
export function buildTodos(answers: Answers, size: SizeClass): Todo[] {
  const small = size === 'kleinst' || size === 'klein';
  const todos: Todo[] = [];
  for (const q of QUESTIONS) {
    const answer = answers[q.id];
    if (answer === undefined || answer === 3) continue;
    const gap = 3 - points(answer);
    let factor = EFFORT_FACTOR[q.effort];
    if (small && q.effort === 'hoch') factor *= 0.7;
    const priority = Math.round(q.weight * gap * factor * 10) / 10;
    const bucket: Bucket = priority >= 6 ? 'sofort' : priority >= 3 ? 'bald' : 'spaeter';
    todos.push({ question: q, answer, priority, bucket, quickWin: q.effort === 'gering' && q.weight >= 2 });
  }
  return todos.sort((a, b) => b.priority - a.priority);
}

export const BUCKET_TEXT: Record<Bucket, { title: string; hint: string }> = {
  sofort: { title: 'Sofort angehen', hint: 'In den nächsten 4 Wochen' },
  bald: { title: 'Als Nächstes', hint: 'In den nächsten 3 Monaten' },
  spaeter: { title: 'Später', hint: 'Innerhalb eines Jahres' },
};
