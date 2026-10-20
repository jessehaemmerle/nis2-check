# NIS2-Check

Gap-Analyse-Assistent und Richtlinien-Generator für kleine und mittlere Betriebe in Österreich – nach Art. 20, 21 und 23 der NIS-2-Richtlinie bzw. dem **NISG 2026** (in Kraft seit 1. Oktober 2026).

## Was die App macht

1. **Betrieb beschreiben** – Branche, Mitarbeitende, Umsatz. Sofortige Einschätzung: wesentliche / wichtige Einrichtung oder nicht direkt betroffen.
2. **36 Fragen in 11 Themen** – Governance, Risikomanagement, Vorfälle & Meldepflichten, Backup & Notbetrieb, Lieferkette, Updates, Wirksamkeit, Cyberhygiene, Verschlüsselung, Zugriffe, MFA. Antworten auf einer 4-stufigen Skala plus „Weiß nicht“, mit Erklärung in einfacher Sprache.
3. **Ergebnis** – Reifegrad (0–100 %, Stufe 1–5), Stand je Thema und priorisierte To-do-Liste (Sofort / Als Nächstes / Später, schnelle Erfolge markiert). Export als Markdown oder PDF.
4. **Richtlinien** – Informationssicherheits-, Backup-, Zugriffs- und Incident-Richtlinie, angepasst an Betriebsgröße und Branche (Brauerei, Lebensmittel, Gastronomie, Hotellerie, Handwerk, Herstellung, Logistik, Abfall, Energie, Gesundheit, IT-Dienstleister, Handel, Sonstige). Download als Word (.docx), Markdown oder Druck/PDF.

Alle Daten bleiben im Browser (localStorage). Über „Sichern“ / „Laden“ lässt sich eine Analyse als JSON-Datei speichern und fortsetzen. Schriften sind selbst gehostet – keine Verbindungen zu Drittanbietern.

## Entwicklung

```bash
npm install
npm run dev      # Entwicklungsserver
npm test         # Unit-Tests (Scoring, Betroffenheit, Richtlinien)
npm run build    # statischer Build nach dist/
```

Bei Push auf `main` wird die App per GitHub Actions auf GitHub Pages veröffentlicht (Pages-Quelle in den Repo-Einstellungen auf „GitHub Actions“ stellen).

## Struktur

- `src/data/questions.ts` – Themen und Fragen inkl. Gewichtung, Aufwand, To-do-Text
- `src/data/sectors.ts` – Branchen, NIS-2-Anhang und branchentypische Systeme/Daten/Dienstleister
- `src/data/policies.ts` – Richtlinien-Vorlagen
- `src/lib/` – Scoring, Betroffenheitsprüfung, Export, Speicherung

## Hinweis

Keine Rechtsberatung. Die Betroffenheitsprüfung ist vereinfacht (Bilanzsumme, Partnerunternehmen und Sonderfälle bleiben unberücksichtigt). Verbindlich sind das NISG 2026 und die Auskünfte des Bundesamts für Cybersicherheit.
