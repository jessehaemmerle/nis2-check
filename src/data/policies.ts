// Richtlinien-Vorlagen. Jede Vorlage wird aus Betriebsprofil und Branche zusammengesetzt.
import type { PolicyId } from './questions';
import { getSector } from './sectors';
import { applicability, sizeClass, SIZE_LABEL, type Profile, type SizeClass } from '../lib/profile';

export interface Section {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface PolicyDoc {
  id: PolicyId;
  title: string;
  sections: Section[];
}

export const POLICY_META: { id: PolicyId; title: string; text: string }[] = [
  { id: 'infosec', title: 'Informationssicherheits-Richtlinie', text: 'Die Grundsatzerklärung: Ziele, Verantwortung und Regeln für alle.' },
  { id: 'backup', title: 'Backup-Richtlinie', text: 'Was, wie oft und wo gesichert wird – und wie die Wiederherstellung getestet wird.' },
  { id: 'access', title: 'Zugriffs-Richtlinie', text: 'Benutzerkonten, Passwörter, MFA, Fernwartung, Ein- und Austritt.' },
  { id: 'incident', title: 'Incident-Richtlinie', text: 'Ablauf und Meldepflichten bei Sicherheitsvorfällen.' },
];

interface Ctx {
  p: Profile;
  size: SizeClass;
  small: boolean;
  firm: string;
  owner: string;
  it: string;
  sector: ReturnType<typeof getSector>;
  regulated: boolean;
}

function ctx(p: Profile): Ctx {
  const size = sizeClass(p);
  return {
    p,
    size,
    small: size === 'kleinst' || size === 'klein',
    firm: p.company.trim() || '[Firmenname]',
    owner: p.owner.trim() || '[verantwortliche Person]',
    it: p.itProvider.trim() || '[IT-Betreuer]',
    sector: getSector(p.sector),
    regulated: applicability(p) !== 'nicht-direkt',
  };
}

const list = (items: string[]) => items.join(', ');

function roles(c: Ctx): string[] {
  if (c.size === 'kleinst')
    return [
      `Die Inhaberin bzw. der Inhaber trägt die Gesamtverantwortung und ist zugleich Ansprechperson für Informationssicherheit (${c.owner}).`,
      `Technische Umsetzung: ${c.it}.`,
      'Alle Mitarbeitenden halten sich an diese Richtlinie und melden Auffälligkeiten sofort.',
    ];
  if (c.size === 'klein')
    return [
      'Die Geschäftsführung trägt die Gesamtverantwortung, beschließt diese Richtlinie und stellt die nötigen Mittel bereit.',
      `Verantwortlich für Informationssicherheit: ${c.owner}. Diese Person koordiniert Maßnahmen und berichtet jährlich an die Geschäftsführung.`,
      `Technische Umsetzung: ${c.it}.`,
      'Abteilungs- bzw. Schichtleitungen sorgen dafür, dass ihre Teams die Regeln kennen.',
    ];
  return [
    'Die Geschäftsführung trägt die Gesamtverantwortung gemäß NISG 2026, beschließt diese Richtlinie, überwacht die Umsetzung und nimmt regelmäßig an Schulungen teil.',
    `Informationssicherheitsbeauftragte/r (ISB): ${c.owner}. Berichtet mindestens halbjährlich direkt an die Geschäftsführung.`,
    'Ein Sicherheitsteam aus ISB, IT, Produktion/Betrieb und Datenschutz trifft sich mindestens quartalsweise.',
    `IT-Betrieb: ${c.it}.`,
    'Führungskräfte sind für die Einhaltung in ihrem Bereich verantwortlich.',
  ];
}

function header(c: Ctx, purpose: string): Section {
  return {
    heading: 'Geltungsbereich und Zweck',
    paragraphs: [
      `Diese Richtlinie gilt für ${c.firm} (${SIZE_LABEL[c.size]}, Branche: ${c.sector.name}), alle Mitarbeitenden einschließlich Aushilfen und Lehrlinge sowie für Dienstleister mit Zugang zu unseren Systemen.`,
      purpose,
      c.regulated
        ? 'Sie setzt die Risikomanagement-Maßnahmen nach dem NISG 2026 (Art. 21 der NIS-2-Richtlinie) um.'
        : 'Sie orientiert sich an den Maßnahmen des NISG 2026 (Art. 21 der NIS-2-Richtlinie), auch wenn der Betrieb nicht direkt unter das Gesetz fällt.',
    ],
  };
}

function footer(c: Ctx): Section {
  return {
    heading: 'Inkrafttreten und Überprüfung',
    paragraphs: [
      `Diese Richtlinie tritt mit Unterschrift der Geschäftsführung in Kraft. Sie wird mindestens ${c.small ? 'jährlich' : 'jährlich sowie nach jedem erheblichen Vorfall'} von ${c.owner} überprüft.`,
      'Ort, Datum: ______________________    Unterschrift Geschäftsführung: ______________________',
    ],
  };
}

function infosec(c: Ctx): PolicyDoc {
  return {
    id: 'infosec',
    title: 'Informationssicherheits-Richtlinie',
    sections: [
      header(c, 'Sie legt fest, warum und wie wir unsere Informationen, Systeme und Anlagen schützen.'),
      {
        heading: 'Unsere Ziele',
        bullets: [
          `Der Betrieb läuft auch bei Störungen weiter. Vorrang hat: ${c.sector.critical}.`,
          `Vertrauliche Informationen bleiben geschützt, insbesondere ${list(c.sector.data)}.`,
          'Daten sind korrekt und nicht unbemerkt veränderbar.',
          'Gesetzliche und vertragliche Pflichten (NISG 2026, DSGVO, Kundenverträge) werden eingehalten.',
        ],
      },
      { heading: 'Rollen und Verantwortung', bullets: roles(c) },
      {
        heading: 'Wichtige Systeme',
        paragraphs: ['Folgende Systeme sind für uns besonders wichtig und werden in der Inventarliste mit verantwortlicher Person geführt:'],
        bullets: c.sector.systems,
      },
      {
        heading: 'Risikomanagement',
        paragraphs: [
          c.small
            ? 'Einmal im Jahr bewerten wir in einer einfachen Tabelle, welche Gefahren (z. B. Erpressungstrojaner, Ausfall, Datendiebstahl, Fehler von Dienstleistern) wie wahrscheinlich sind und wie schwer sie uns treffen würden, und legen Maßnahmen fest.'
            : 'Mindestens jährlich und bei wesentlichen Änderungen führen wir eine Risikoanalyse durch. Risiken werden mit Eigentümer, Bewertung, Maßnahme und Frist in einem Risikoregister geführt und von der Geschäftsführung freigegeben.',
        ],
      },
      {
        heading: 'Grundregeln für alle',
        bullets: [
          'Verdächtige E-Mails, Anrufe oder Störungen sofort melden – lieber einmal zu viel.',
          'Keine Links oder Anhänge aus unerwarteten Nachrichten öffnen.',
          'Bildschirm sperren beim Verlassen des Arbeitsplatzes.',
          'Nur freigegebene Programme und Geräte verwenden; private USB-Sticks nicht anschließen.',
          'Zahlungs- oder Kontoänderungen immer telefonisch über eine bekannte Nummer rückbestätigen.',
          'Firmendaten nur in den freigegebenen Speicherorten ablegen.',
        ],
      },
      {
        heading: 'Technische Mindestmaßnahmen',
        bullets: [
          'Automatische Updates für Betriebssysteme, Programme, Router und Firewall.',
          'Virenschutz und Firewall auf allen Geräten.',
          'Mehr-Faktor-Anmeldung für E-Mail, Cloud-Dienste und Fernzugriffe.',
          'Verschlüsselung von Laptops, Smartphones und Sicherungen außer Haus.',
          'Getrennte Netze für Gäste, Büro und Produktions- bzw. Steuerungstechnik.',
          'Regelmäßige, getestete Datensicherung (siehe Backup-Richtlinie).',
        ],
      },
      {
        heading: 'Lieferkette',
        paragraphs: [
          `Dienstleister mit Zugang zu Systemen oder Daten (z. B. ${list(c.sector.suppliers)}) werden in einer Liste geführt. Mit ihnen vereinbaren wir schriftlich: Meldung von Sicherheitsvorfällen binnen 24 Stunden, Mehr-Faktor-Anmeldung für Fernzugriffe, Datenschutzvereinbarung und Rückgabe bzw. Löschung von Daten bei Vertragsende.`,
        ],
      },
      {
        heading: 'Schulung',
        paragraphs: [
          `Alle Mitarbeitenden erhalten beim Eintritt und danach mindestens jährlich eine kurze Schulung zu Phishing und sicherem Verhalten. Die Geschäftsführung bildet sich ${c.regulated ? 'gemäß NISG 2026 ' : ''}regelmäßig zu Cybersicherheit fort.`,
        ],
      },
      {
        heading: 'Verstöße',
        paragraphs: ['Verstöße gegen diese Richtlinie werden besprochen und können arbeitsrechtliche Folgen haben. Ziel ist Lernen, nicht Bestrafen – wer einen eigenen Fehler sofort meldet, hilft dem Betrieb.'],
      },
      footer(c),
    ],
  };
}

function backup(c: Ctx): PolicyDoc {
  const freq = c.small ? 'täglich (automatisch, nach Betriebsschluss)' : 'täglich, für Datenbanken zusätzlich stündlich';
  return {
    id: 'backup',
    title: 'Backup-Richtlinie',
    sections: [
      header(c, 'Sie stellt sicher, dass wir nach Ausfall, Fehlbedienung oder Angriff alle wichtigen Daten wiederherstellen können.'),
      {
        heading: 'Was wird gesichert',
        bullets: [
          ...c.sector.data,
          'Konfigurationen und Programme der wichtigen Systeme: ' + list(c.sector.systems),
          'E-Mail-Postfächer und Cloud-Speicher (auch Microsoft 365 / Google Workspace werden nicht automatisch gesichert)',
          'Buchhaltungs-, Lohn- und Personaldaten',
        ],
      },
      {
        heading: '3-2-1-Regel',
        bullets: [
          'Mindestens 3 Kopien der Daten (Original plus 2 Sicherungen).',
          'Auf mindestens 2 verschiedenen Medien (z. B. NAS und Cloud oder Wechselfestplatte).',
          'Mindestens 1 Kopie außer Haus und getrennt vom Netzwerk oder unveränderbar (Schutz vor Erpressungstrojanern).',
        ],
      },
      {
        heading: 'Häufigkeit und Aufbewahrung',
        bullets: [
          `Sicherung: ${freq}.`,
          'Aufbewahrung: 14 Tagessicherungen, 8 Wochensicherungen, 12 Monatssicherungen.',
          'Steuerlich relevante Daten zusätzlich 7 Jahre gemäß BAO.',
          'Sicherungen außer Haus werden verschlüsselt; der Schlüssel liegt versiegelt beim Geschäftsführer bzw. im Tresor.',
        ],
      },
      {
        heading: 'Zuständigkeit',
        bullets: [
          `Einrichtung und Überwachung: ${c.it}.`,
          `Kontrolle der Sicherungsprotokolle: ${c.owner}, ${c.small ? 'wöchentlich' : 'täglich'}.`,
          c.small ? 'Wechseln der außer Haus gelagerten Festplatte: wöchentlich, durch eine benannte Person.' : 'Fehlgeschlagene Sicherungen erzeugen automatisch eine Meldung an IT und ISB.',
        ],
      },
      {
        heading: 'Wiederherstellungstest',
        paragraphs: [
          `Mindestens ${c.small ? 'einmal jährlich' : 'vierteljährlich'} wird eine Wiederherstellung getestet und protokolliert (Datum, was wurde wiederhergestellt, Dauer, Ergebnis). Einmal jährlich wird die vollständige Wiederherstellung von „${c.sector.critical}“ geprobt.`,
        ],
      },
      {
        heading: 'Wiederanlaufziele',
        bullets: [
          `${c.sector.critical}: wieder verfügbar binnen ${c.small ? '24' : '8'} Stunden, maximaler Datenverlust ${c.small ? '1 Arbeitstag' : '1 Stunde'}.`,
          'Übrige Systeme: binnen 3 Arbeitstagen, maximaler Datenverlust 1 Arbeitstag.',
        ],
      },
      footer(c),
    ],
  };
}

function access(c: Ctx): PolicyDoc {
  return {
    id: 'access',
    title: 'Zugriffs-Richtlinie',
    sections: [
      header(c, 'Sie regelt, wer worauf zugreifen darf und wie Zugänge geschützt werden.'),
      {
        heading: 'Grundsätze',
        bullets: [
          'Jede Person hat ein eigenes, persönliches Benutzerkonto. Geteilte Konten sind nicht erlaubt; wo technisch unvermeidbar (z. B. Kassa), wird eine persönliche Anmeldung bzw. ein Bediener-PIN verwendet.',
          'Jede Person erhält nur die Rechte, die sie für ihre Arbeit braucht.',
          'Administratorrechte werden nicht im Alltag verwendet, sondern nur über getrennte Administrationskonten.',
        ],
      },
      {
        heading: 'Passwörter',
        bullets: [
          'Mindestens 12 Zeichen, besser eine Passphrase aus mehreren Wörtern.',
          'Jedes Passwort nur für einen Dienst; ein freigegebener Passwort-Manager wird verwendet.',
          'Passwörter werden nicht aufgeschrieben, weitergegeben oder per E-Mail versendet.',
          'Standardpasswörter von Geräten (Router, Kameras, Steuerungen) werden bei Inbetriebnahme geändert.',
        ],
      },
      {
        heading: 'Mehr-Faktor-Anmeldung (MFA)',
        paragraphs: ['MFA ist verpflichtend für:'],
        bullets: [
          'E-Mail und Cloud-Dienste',
          'Fernzugriffe (VPN, Fernwartung)',
          'Online-Banking und Zahlungsportale',
          'Administrationskonten',
          ...(c.small ? [] : ['alle Anwendungen mit personenbezogenen oder geschäftskritischen Daten']),
        ],
      },
      {
        heading: 'Fernwartung durch Dienstleister',
        bullets: [
          `Betrifft insbesondere: ${list(c.sector.suppliers)}.`,
          'Fernwartungszugänge sind standardmäßig deaktiviert und werden nur auf Anfrage für die Dauer des Einsatzes freigeschaltet.',
          'Jeder Zugang ist personalisiert, mit MFA geschützt und wird protokolliert.',
          ...(c.sector.systems.some((s) => /SPS|Steuerung|SCADA|CNC/.test(s))
            ? ['Steuerungs- und Produktionsanlagen sind vom Büronetz getrennt; Fernwartung erfolgt nur über einen gesicherten Zugangspunkt.']
            : []),
        ],
      },
      {
        heading: 'Eintritt, Wechsel, Austritt',
        bullets: [
          'Eintritt: Konto und Rechte werden nach schriftlicher Freigabe durch die Vorgesetzte bzw. den Vorgesetzten eingerichtet; Unterweisung zu dieser Richtlinie.',
          'Wechsel: nicht mehr benötigte Rechte werden entzogen.',
          'Austritt: am letzten Arbeitstag werden alle Konten gesperrt, Geräte, Schlüssel und Karten eingesammelt und geteilte Zugangsdaten geändert (Austritts-Checkliste).',
          'Saisonkräfte und Aushilfen erhalten befristete Konten, die automatisch ablaufen.',
        ],
      },
      {
        heading: 'Überprüfung',
        paragraphs: [`${c.owner} prüft ${c.small ? 'jährlich' : 'halbjährlich'} gemeinsam mit ${c.it}, wer welche Zugänge hat, und entfernt nicht mehr benötigte Konten und Rechte.`],
      },
      {
        heading: 'Geräte',
        bullets: [
          'Laptops und Smartphones sind verschlüsselt und mit PIN oder Biometrie gesperrt.',
          'Verlust oder Diebstahl wird sofort gemeldet, damit das Gerät gesperrt werden kann.',
          'Private Geräte dürfen nur mit Freigabe und nur für E-Mail bzw. freigegebene Apps genutzt werden.',
        ],
      },
      footer(c),
    ],
  };
}

function incident(c: Ctx): PolicyDoc {
  const reporting: Section = c.regulated
    ? {
        heading: 'Meldepflichten nach NISG 2026',
        paragraphs: [
          'Ein Vorfall ist erheblich, wenn er den Betrieb schwer stört, hohen finanziellen Schaden verursacht oder andere Personen erheblich schädigt. Erhebliche Vorfälle meldet die Geschäftsführung bzw. eine beauftragte Person an das zuständige CSIRT:',
        ],
        bullets: [
          'Frühwarnung: binnen 24 Stunden ab Kenntnis (Verdacht auf Angriff? Auswirkungen über die Grenze?).',
          'Vorfallsmeldung: binnen 72 Stunden mit erster Bewertung, Schweregrad und Kompromittierungsindikatoren.',
          'Zwischenbericht: auf Anfrage der Behörde.',
          'Abschlussbericht: spätestens einen Monat nach der Vorfallsmeldung.',
          'Kontaktdaten des zuständigen CSIRT und des Bundesamts für Cybersicherheit: ______________________',
          'Bei personenbezogenen Daten zusätzlich: Meldung an die Datenschutzbehörde binnen 72 Stunden (DSGVO).',
        ],
      }
    : {
        heading: 'Meldungen',
        bullets: [
          'Bei Verlust oder Diebstahl personenbezogener Daten: Meldung an die Datenschutzbehörde binnen 72 Stunden (DSGVO).',
          'Bei Straftaten (Erpressung, Betrug): Anzeige bei der Polizei; Unterstützung bietet die Cybercrime-Hotline der WKO.',
          'Freiwillige Meldungen an CERT.at sind möglich und helfen anderen Betrieben.',
          'Vertragliche Meldepflichten gegenüber Kunden und Partnern beachten.',
        ],
      };

  return {
    id: 'incident',
    title: 'Incident-Richtlinie',
    sections: [
      header(c, 'Sie legt fest, wie wir Sicherheitsvorfälle erkennen, eindämmen, beheben und melden.'),
      {
        heading: 'Was ist ein Sicherheitsvorfall?',
        bullets: [
          'Erpressungstrojaner, verschlüsselte oder verschwundene Dateien',
          'Verdächtige E-Mails, auf die bereits reagiert wurde (Link geklickt, Daten eingegeben)',
          'Ungewöhnliches Verhalten von Systemen, z. B. von ' + c.sector.systems[0],
          'Verlust oder Diebstahl von Geräten oder Datenträgern',
          'Unbefugter Zugriff auf Konten, gefälschte Zahlungsaufforderungen',
        ],
      },
      {
        heading: 'Erste Schritte (für alle Mitarbeitenden)',
        bullets: [
          'Ruhe bewahren, nichts löschen, nicht selbst „reparieren“.',
          'Betroffenes Gerät vom Netzwerk trennen (Kabel ziehen, WLAN aus) – aber eingeschaltet lassen.',
          `Sofort melden an ${c.owner}, Telefon: ______________________`,
          'Notieren: Was ist passiert, wann, welches Gerät?',
        ],
      },
      {
        heading: 'Ablauf',
        bullets: [
          `1. Bewerten: ${c.owner} und ${c.it} beurteilen Ausmaß und Dringlichkeit.`,
          '2. Eindämmen: betroffene Systeme isolieren, Passwörter ändern, Fernzugänge sperren.',
          `3. Notbetrieb: Vorrang hat ${c.sector.critical}; Notbetriebsplan aktivieren.`,
          '4. Melden: Meldepflichten prüfen (siehe unten) und Fristen einhalten.',
          '5. Beheben: aus sauberer Sicherung wiederherstellen, Ursache beseitigen.',
          '6. Lernen: Vorfall im Vorfallsprotokoll dokumentieren und Maßnahmen ableiten.',
        ],
      },
      reporting,
      {
        heading: 'Notfallkontakte',
        paragraphs: ['Diese Liste liegt zusätzlich ausgedruckt im Büro und bei der Geschäftsführung zu Hause, falls Telefon und E-Mail ausfallen.'],
        bullets: [
          `Verantwortliche Person: ${c.owner} – Tel. ______________________`,
          `IT-Betreuer: ${c.it} – Tel. ______________________`,
          'Geschäftsführung: ______________________',
          'Cyberversicherung (falls vorhanden), Polizzennummer: ______________________',
          'CERT.at: team@cert.at, +43 1 5056416 78',
          'WKO Cyber-Security-Hotline: 0800 888 133',
          'Polizei: 133',
        ],
      },
      {
        heading: 'Kommunikation',
        paragraphs: ['Nach außen (Kunden, Presse) informiert ausschließlich die Geschäftsführung. Lösegeld wird nicht ohne Rücksprache mit Polizei, Versicherung und Rechtsberatung gezahlt.'],
      },
      {
        heading: 'Übung',
        paragraphs: [`Der Ablauf wird ${c.small ? 'jährlich' : 'halbjährlich'} anhand eines Beispiels (z. B. „Erpressungstrojaner am Montagmorgen“) durchgesprochen.`],
      },
      footer(c),
    ],
  };
}

const BUILDERS: Record<PolicyId, (c: Ctx) => PolicyDoc> = { infosec, backup, access, incident };

export function buildPolicy(id: PolicyId, profile: Profile): PolicyDoc {
  return BUILDERS[id](ctx(profile));
}
