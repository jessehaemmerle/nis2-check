import '@fontsource/bricolage-grotesque/500.css';
import '@fontsource/bricolage-grotesque/700.css';
import '@fontsource/atkinson-hyperlegible/400.css';
import '@fontsource/atkinson-hyperlegible/700.css';
import './style.css';

import { AREAS, QUESTIONS, type PolicyId } from './data/questions';
import { SECTORS, getSector } from './data/sectors';
import { POLICY_META, buildPolicy, type PolicyDoc } from './data/policies';
import { APPLICABILITY_TEXT, SIZE_LABEL, applicability, sizeClass, type Profile } from './lib/profile';
import { ANSWER_LABELS, BUCKET_TEXT, areaScores, buildTodos, maturityLevel, overallScore, type Answer, type Bucket } from './lib/scoring';
import { clear, emptyState, load, parseState, save, type State } from './lib/storage';
import { download, policyToDocx, policyToMarkdown, slug } from './lib/export';

const app = document.getElementById('app')!;
let state: State = load() ?? emptyState();
let hasSaved = load() !== null && Object.keys(state.answers).length > 0;
let policyTab: PolicyId = 'infosec';

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

function set(patch: Partial<State>, focus = true) {
  state = { ...state, ...patch };
  save(state);
  render();
  if (focus) {
    window.scrollTo({ top: 0 });
    app.focus({ preventScroll: true });
  }
}

const answeredCount = () => QUESTIONS.filter((q) => state.answers[q.id] !== undefined).length;

// ---------- Screens ----------

function startView() {
  return `
  <section class="hero">
    <h1>Wie gut ist Ihr Betrieb gegen Cyberangriffe gerüstet?</h1>
    <p class="lead">Beantworten Sie ${QUESTIONS.length} kurze Fragen zu den Maßnahmen nach NIS-2 und NISG 2026. Sie erhalten einen Reifegrad, eine Liste mit den wichtigsten nächsten Schritten und fertige Richtlinien für Ihren Betrieb.</p>
    <ol class="steps">
      <li><strong>Betrieb beschreiben</strong><span>Branche und Größe – 1 Minute</span></li>
      <li><strong>Fragen beantworten</strong><span>11 Themen – etwa 15 Minuten</span></li>
      <li><strong>Ergebnis nutzen</strong><span>To-do-Liste und Richtlinien als Word, PDF oder Markdown</span></li>
    </ol>
    <div class="actions">
      ${hasSaved ? `<button class="btn primary" data-action="resume">Weitermachen (${answeredCount()} von ${QUESTIONS.length} beantwortet)</button>
                    <button class="btn" data-action="fresh">Neu beginnen</button>`
                 : `<button class="btn primary" data-action="go" data-step="profil">Analyse starten</button>`}
    </div>
    <p class="fine">Für Brauereien, Gastronomie, Handwerk und weitere Branchen. Ohne Anmeldung, Ihre Daten verlassen das Gerät nicht.</p>
  </section>`;
}

function options<T extends string>(items: [T, string][], current: T) {
  return items.map(([v, l]) => `<option value="${v}"${v === current ? ' selected' : ''}>${esc(l)}</option>`).join('');
}

function profileView() {
  const p = state.profile;
  const appl = applicability(p);
  const info = APPLICABILITY_TEXT[appl];
  const sector = getSector(p.sector);
  return `
  <section class="narrow">
    <p class="crumb">Schritt 1 von 3</p>
    <h1>Ihr Betrieb</h1>
    <p class="lead">Damit Fragen, Prioritäten und Richtlinien zu Ihrem Betrieb passen.</p>
    <form class="form" data-form="profile">
      <label>Name des Betriebs
        <input name="company" value="${esc(p.company)}" placeholder="z. B. Brauerei Hofstetten" autocomplete="organization" />
      </label>
      <label>Branche
        <select name="sector">${options(SECTORS.map((s) => [s.id, s.name] as [string, string]), p.sector)}</select>
      </label>
      <div class="two">
        <label>Mitarbeitende
          <select name="employees">${options([['<10', 'unter 10'], ['10-49', '10 bis 49'], ['50-249', '50 bis 249'], ['250+', '250 oder mehr']], p.employees)}</select>
        </label>
        <label>Jahresumsatz
          <select name="revenue">${options([['<2', 'bis 2 Mio. €'], ['2-10', '2 bis 10 Mio. €'], ['10-50', '10 bis 50 Mio. €'], ['>50', 'über 50 Mio. €']], p.revenue)}</select>
        </label>
      </div>
      <label>Wer kümmert sich um IT-Sicherheit? <span class="opt">optional</span>
        <input name="owner" value="${esc(p.owner)}" placeholder="z. B. Maria Huber, Betriebsleitung" />
      </label>
      <label>Externer IT-Betreuer <span class="opt">optional</span>
        <input name="itProvider" value="${esc(p.itProvider)}" placeholder="z. B. Firma IT-Service Muster" />
      </label>
    </form>
    <aside class="verdict v-${appl}" aria-live="polite">
      <h2>${info.title}</h2>
      <p class="size">${SIZE_LABEL[sizeClass(p)]} · ${esc(sector.name)}</p>
      <p>${esc(sector.scopeNote)}</p>
      <p>${info.text}</p>
      <p class="fine">Vereinfachte Einschätzung. Maßgeblich sind die genaue Tätigkeit, Bilanzsumme und Konzernverbindungen.</p>
    </aside>
    <div class="actions">
      <button class="btn" data-action="go" data-step="start">Zurück</button>
      <button class="btn primary" data-action="go" data-step="fragen">Weiter zu den Fragen</button>
    </div>
  </section>`;
}

function questionsView() {
  const i = Math.min(state.areaIndex, AREAS.length - 1);
  const area = AREAS[i];
  const qs = QUESTIONS.filter((q) => q.area === area.id);
  const done = answeredCount();
  const pct = Math.round((done / QUESTIONS.length) * 100);
  const last = i === AREAS.length - 1;
  return `
  <section class="narrow">
    <p class="crumb">Schritt 2 von 3 · Thema ${i + 1} von ${AREAS.length}</p>
    <div class="progress" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="Fortschritt">
      <span style="width:${pct}%"></span>
    </div>
    <nav class="area-nav" aria-label="Themen">
      ${AREAS.map((a, k) => {
        const n = QUESTIONS.filter((q) => q.area === a.id);
        const complete = n.every((q) => state.answers[q.id] !== undefined);
        return `<button class="dot${k === i ? ' current' : ''}${complete ? ' complete' : ''}" data-action="area" data-index="${k}" title="${esc(a.title)}" aria-label="${esc(a.title)}${complete ? ' (fertig)' : ''}"${k === i ? ' aria-current="step"' : ''}></button>`;
      }).join('')}
    </nav>
    <h1>${esc(area.title)}</h1>
    <p class="ref">${area.ref} NIS-2-Richtlinie</p>
    <p class="lead">${esc(area.intro)}</p>
    ${qs.map((q) => questionCard(q.id, q.text, q.help)).join('')}
    <div class="actions">
      <button class="btn" data-action="${i === 0 ? 'go' : 'area'}" data-step="profil" data-index="${i - 1}">Zurück</button>
      ${last
        ? `<button class="btn primary" data-action="go" data-step="ergebnis">Ergebnis anzeigen</button>`
        : `<button class="btn primary" data-action="area" data-index="${i + 1}">Weiter</button>`}
    </div>
    <p class="fine">${done} von ${QUESTIONS.length} Fragen beantwortet. Sie können Fragen überspringen und später zurückkommen.</p>
  </section>`;
}

function questionCard(id: string, text: string, help: string) {
  const current = state.answers[id];
  return `
  <fieldset class="q">
    <legend>${esc(text)}</legend>
    <details><summary>Was ist gemeint?</summary><p>${esc(help)}</p></details>
    <div class="scale">
      ${ANSWER_LABELS.map(({ value, label }) => `
        <label class="opt-${value}">
          <input type="radio" name="${id}" value="${value}"${current === value ? ' checked' : ''} />
          <span>${label}</span>
        </label>`).join('')}
    </div>
  </fieldset>`;
}

function badge(score: number) {
  const level = maturityLevel(score);
  const r = 88;
  const c = 2 * Math.PI * r;
  return `
  <figure class="plakette l${level.n}" aria-label="Reifegrad ${level.n} von 5, ${score} Prozent">
    <svg viewBox="0 0 220 220" aria-hidden="true">
      <circle cx="110" cy="110" r="104" class="rim" />
      <circle cx="110" cy="110" r="${r}" class="track" />
      <circle cx="110" cy="110" r="${r}" class="fill" stroke-dasharray="${(c * score) / 100} ${c}" transform="rotate(-90 110 110)" />
      ${Array.from({ length: 5 }, (_, k) => {
        const a = (-90 + k * 72) * (Math.PI / 180);
        return `<circle cx="${110 + 104 * Math.cos(a)}" cy="${110 + 104 * Math.sin(a)}" r="5" class="pip${k < level.n ? ' on' : ''}" />`;
      }).join('')}
    </svg>
    <div class="plakette-text">
      <span class="num">${score}<small>%</small></span>
      <span class="lvl">Stufe ${level.n} von 5</span>
    </div>
  </figure>`;
}

function resultView() {
  const score = overallScore(state.answers);
  if (score === null)
    return `<section class="narrow"><h1>Noch keine Antworten</h1><p class="lead">Beantworten Sie zuerst einige Fragen, dann sehen Sie hier Ihren Reifegrad.</p>
      <div class="actions"><button class="btn primary" data-action="go" data-step="fragen">Zu den Fragen</button></div></section>`;
  const level = maturityLevel(score);
  const size = sizeClass(state.profile);
  const todos = buildTodos(state.answers, size);
  const unknown = QUESTIONS.filter((q) => state.answers[q.id] === 'unknown');
  const open = QUESTIONS.length - answeredCount();
  const buckets: Bucket[] = ['sofort', 'bald', 'spaeter'];
  return `
  <section class="wide">
    <p class="crumb">Schritt 3 von 3</p>
    <div class="result-head">
      ${badge(score)}
      <div>
        <h1>${esc(level.name)}</h1>
        <p class="lead">${esc(level.text)}</p>
        <p>${esc(state.profile.company || 'Ihr Betrieb')} · ${APPLICABILITY_TEXT[applicability(state.profile)].title}</p>
        ${open ? `<p class="note">${open} Fragen sind noch offen und nicht in die Bewertung eingeflossen. <button class="link" data-action="go" data-step="fragen">Jetzt beantworten</button></p>` : ''}
      </div>
    </div>

    <h2>Stand je Thema</h2>
    <ul class="bars">
      ${areaScores(state.answers).map(({ area, score: s }, k) => `
        <li>
          <button class="link" data-action="area-edit" data-index="${k}">${esc(area.title)}</button>
          <span class="bar ${s === null ? 'na' : s < 40 ? 'low' : s < 70 ? 'mid' : 'high'}"><span style="width:${s ?? 0}%"></span></span>
          <span class="val">${s === null ? '–' : s + ' %'}</span>
        </li>`).join('')}
    </ul>

    <div class="todo-head">
      <h2>Ihre To-do-Liste</h2>
      <div class="inline-actions">
        <button class="btn small" data-action="todo-md">Als Markdown</button>
        <button class="btn small" data-action="print">Drucken / PDF</button>
      </div>
    </div>
    ${todos.length === 0 ? '<p>Keine offenen Maßnahmen – sehr gut. Wiederholen Sie die Analyse in einem Jahr.</p>' : ''}
    ${buckets.map((b) => {
      const items = todos.filter((t) => t.bucket === b);
      if (!items.length) return '';
      return `
      <div class="bucket b-${b}">
        <h3>${BUCKET_TEXT[b].title} <span>${BUCKET_TEXT[b].hint}</span></h3>
        <ul class="todos">
          ${items.map((t) => `
            <li>
              <input type="checkbox" id="t-${t.question.id}" />
              <label for="t-${t.question.id}">
                <strong>${esc(t.question.todo)}</strong>
                <span class="meta">${esc(AREAS.find((a) => a.id === t.question.area)!.title)} · Aufwand ${t.question.effort}${t.quickWin ? ' · <em>schneller Erfolg</em>' : ''}${t.answer === 'unknown' ? ' · erst klären' : ''}</span>
              </label>
              ${t.question.policy ? `<button class="link small" data-action="policy" data-policy="${t.question.policy}">Richtlinie</button>` : ''}
            </li>`).join('')}
        </ul>
      </div>`;
    }).join('')}
    ${unknown.length ? `<p class="note">Bei ${unknown.length} Fragen war die Antwort „Weiß nicht“. Klären Sie diese mit Ihrem IT-Betreuer – sie werden vorsichtshalber als Lücke gewertet.</p>` : ''}

    <div class="cta-policies">
      <h2>Richtlinien für Ihren Betrieb</h2>
      <p>Vier Vorlagen, angepasst an Ihre Branche (${esc(getSector(state.profile.sector).name)}) und Betriebsgröße (${SIZE_LABEL[size]}). Herunterladen, prüfen, unterschreiben.</p>
      <button class="btn primary" data-action="go" data-step="richtlinien">Richtlinien erstellen</button>
    </div>
  </section>`;
}

function renderDoc(doc: PolicyDoc) {
  return `
  <article class="doc" id="doc">
    <h1>${esc(doc.title)}</h1>
    <p class="doc-meta">${esc(state.profile.company || '[Firmenname]')} · Stand: ${new Date().toLocaleDateString('de-AT')}</p>
    ${doc.sections.map((s) => `
      <h2>${esc(s.heading)}</h2>
      ${(s.paragraphs ?? []).map((p) => `<p>${esc(p)}</p>`).join('')}
      ${s.bullets?.length ? `<ul>${s.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}`).join('')}
  </article>`;
}

function policiesView() {
  const doc = buildPolicy(policyTab, state.profile);
  const missing = !state.profile.company || !state.profile.owner;
  return `
  <section class="wide">
    <p class="crumb"><button class="link" data-action="go" data-step="ergebnis">Zurück zum Ergebnis</button></p>
    <h1>Richtlinien</h1>
    <p class="lead">Die Vorlagen enthalten Ihre Angaben und branchentypische Beispiele. Lesen Sie sie durch, ergänzen Sie die Platzhalter (______) und lassen Sie sie von der Geschäftsführung unterschreiben.</p>
    ${missing ? `<p class="note">Tipp: Tragen Sie unter <button class="link" data-action="go" data-step="profil">Ihr Betrieb</button> Firmenname und verantwortliche Person ein, dann erscheinen sie in den Richtlinien.</p>` : ''}
    <div class="tabs" role="tablist">
      ${POLICY_META.map((m) => `
        <button role="tab" aria-selected="${m.id === policyTab}" data-action="tab" data-policy="${m.id}">
          <strong>${m.title}</strong><span>${m.text}</span>
        </button>`).join('')}
    </div>
    <div class="doc-actions">
      <button class="btn primary" data-action="docx">Word herunterladen</button>
      <button class="btn" data-action="print">Drucken / PDF</button>
      <button class="btn" data-action="md">Markdown</button>
    </div>
    ${renderDoc(doc)}
  </section>`;
}

function render() {
  document.body.dataset.step = state.step;
  const views = { start: startView, profil: profileView, fragen: questionsView, ergebnis: resultView, richtlinien: policiesView };
  app.innerHTML = views[state.step]();
}

// ---------- Events ----------

app.addEventListener('input', (e) => {
  const el = e.target as HTMLInputElement | HTMLSelectElement;
  if (el.closest('[data-form="profile"]')) {
    state.profile = { ...state.profile, [el.name]: el.value } as Profile;
    save(state);
    if (el.tagName === 'SELECT') {
      // Nur die Einschätzung neu zeichnen, damit der Fokus im Formular bleibt.
      const fresh = document.createElement('div');
      fresh.innerHTML = profileView();
      app.querySelector('.verdict')!.replaceWith(fresh.querySelector('.verdict')!);
    }
  }
});

app.addEventListener('change', (e) => {
  const el = e.target as HTMLInputElement;
  if (el.type === 'radio' && el.closest('.q')) {
    const value: Answer = el.value === 'unknown' ? 'unknown' : (Number(el.value) as Answer);
    state.answers = { ...state.answers, [el.name]: value };
    save(state);
    const done = answeredCount();
    const pct = Math.round((done / QUESTIONS.length) * 100);
    const bar = app.querySelector<HTMLElement>('.progress span');
    if (bar) bar.style.width = pct + '%';
    app.querySelector('.progress')?.setAttribute('aria-valuenow', String(pct));
    const fine = app.querySelector('.narrow > .fine');
    if (fine) fine.textContent = `${done} von ${QUESTIONS.length} Fragen beantwortet. Sie können Fragen überspringen und später zurückkommen.`;
  }
});

document.addEventListener('click', async (e) => {
  const el = (e.target as HTMLElement).closest<HTMLElement>('[data-action]');
  if (!el || el.tagName === 'INPUT') return;
  const { action, step, index, policy } = el.dataset;
  switch (action) {
    case 'home':
      e.preventDefault();
      hasSaved = Object.keys(state.answers).length > 0;
      return set({ step: 'start' });
    case 'go':
      return set({ step: step as State['step'] });
    case 'resume':
      return set({ step: answeredCount() === QUESTIONS.length ? 'ergebnis' : 'fragen' });
    case 'fresh':
    case 'reset':
      if (Object.keys(state.answers).length && !confirm('Alle Antworten löschen und neu beginnen? Tipp: Vorher „Sichern“ wählen.')) return;
      clear();
      hasSaved = false;
      state = emptyState();
      return set({ step: action === 'fresh' ? 'profil' : 'start' });
    case 'area':
      return set({ step: 'fragen', areaIndex: Number(index) });
    case 'area-edit':
      return set({ step: 'fragen', areaIndex: Number(index) });
    case 'policy':
      policyTab = policy as PolicyId;
      return set({ step: 'richtlinien' });
    case 'tab':
      policyTab = policy as PolicyId;
      render();
      app.querySelector<HTMLElement>(`[data-policy="${policyTab}"]`)?.focus();
      return;
    case 'print':
      return window.print();
    case 'docx': {
      const doc = buildPolicy(policyTab, state.profile);
      const blob = await policyToDocx(doc, state.profile.company || 'Betrieb');
      return download(`${slug(doc.title)}-${slug(state.profile.company)}.docx`, blob);
    }
    case 'md': {
      const doc = buildPolicy(policyTab, state.profile);
      return download(`${slug(doc.title)}-${slug(state.profile.company)}.md`, policyToMarkdown(doc, state.profile.company || 'Betrieb'), 'text/markdown');
    }
    case 'todo-md':
      return download(`nis2-massnahmen-${slug(state.profile.company)}.md`, todoMarkdown(), 'text/markdown');
    case 'export-json':
      return download(`nis2-check-${slug(state.profile.company)}.json`, JSON.stringify(state, null, 2), 'application/json');
  }
});

document.addEventListener('change', async (e) => {
  const el = e.target as HTMLInputElement;
  if (el.dataset.action !== 'import-json' || !el.files?.[0]) return;
  try {
    const parsed = parseState(JSON.parse(await el.files[0].text()));
    if (!parsed) throw new Error();
    state = parsed;
    save(state);
    set({ step: answeredCount() ? 'ergebnis' : 'profil' });
  } catch {
    alert('Diese Datei konnte nicht geladen werden. Bitte eine mit „Sichern“ erstellte .json-Datei wählen.');
  }
  el.value = '';
});

function todoMarkdown() {
  const score = overallScore(state.answers) ?? 0;
  const todos = buildTodos(state.answers, sizeClass(state.profile));
  const lines = [
    `# NIS-2 Maßnahmenliste – ${state.profile.company || 'Betrieb'}`,
    '',
    `Reifegrad: ${score} % (Stufe ${maturityLevel(score).n} von 5, ${maturityLevel(score).name}) · Stand ${new Date().toLocaleDateString('de-AT')}`,
    '',
  ];
  for (const b of ['sofort', 'bald', 'spaeter'] as Bucket[]) {
    const items = todos.filter((t) => t.bucket === b);
    if (!items.length) continue;
    lines.push(`## ${BUCKET_TEXT[b].title} (${BUCKET_TEXT[b].hint})`, '');
    for (const t of items) lines.push(`- [ ] ${t.question.todo} — Aufwand ${t.question.effort}`);
    lines.push('');
  }
  return lines.join('\n');
}

render();
