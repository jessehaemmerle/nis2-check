// Fragenkatalog entlang Art. 20, 21 und 23 der NIS-2-Richtlinie (umgesetzt im NISG 2026).
export type PolicyId = 'infosec' | 'backup' | 'access' | 'incident';
export type Effort = 'gering' | 'mittel' | 'hoch';

export interface Area {
  id: string;
  title: string;
  ref: string;
  intro: string;
}

export interface Question {
  id: string;
  area: string;
  text: string;
  help: string;
  /** 1 = wichtig, 2 = sehr wichtig, 3 = kritisch */
  weight: 1 | 2 | 3;
  effort: Effort;
  todo: string;
  policy?: PolicyId;
}

export const AREAS: Area[] = [
  { id: 'gov', title: 'Verantwortung der Geschäftsführung', ref: 'Art. 20', intro: 'Die Geschäftsleitung muss Cybersicherheit beschließen, überwachen und sich dazu schulen lassen. Sie haftet persönlich.' },
  { id: 'risk', title: 'Risikomanagement', ref: 'Art. 21 Abs. 2 lit. a', intro: 'Wissen, was im Betrieb schiefgehen kann und welche Systeme dafür wichtig sind.' },
  { id: 'incident', title: 'Umgang mit Sicherheitsvorfällen', ref: 'Art. 21 lit. b, Art. 23', intro: 'Wer tut was, wenn etwa ein Erpressungstrojaner zuschlägt – und wer meldet es fristgerecht?' },
  { id: 'bcm', title: 'Backup und Notbetrieb', ref: 'Art. 21 lit. c', intro: 'Daten sichern, Wiederherstellung üben und auch ohne IT weiterarbeiten können.' },
  { id: 'supply', title: 'Lieferkette', ref: 'Art. 21 lit. d', intro: 'Dienstleister mit Zugang zu Ihren Systemen sind ein häufiges Einfallstor.' },
  { id: 'dev', title: 'Beschaffung, Updates und Schwachstellen', ref: 'Art. 21 lit. e', intro: 'Sicher einkaufen, aktuell halten und Lücken rasch schließen.' },
  { id: 'eff', title: 'Wirksamkeit überprüfen', ref: 'Art. 21 lit. f', intro: 'Regelmäßig prüfen, ob die Maßnahmen auch wirklich funktionieren.' },
  { id: 'hygiene', title: 'Cyberhygiene und Schulung', ref: 'Art. 21 lit. g', intro: 'Die meisten Angriffe beginnen mit einer E-Mail. Geschulte Mitarbeitende sind der beste Schutz.' },
  { id: 'crypto', title: 'Verschlüsselung', ref: 'Art. 21 lit. h', intro: 'Daten auf Geräten und unterwegs so schützen, dass Diebe nichts damit anfangen können.' },
  { id: 'access', title: 'Personal, Zugriffe und Geräte', ref: 'Art. 21 lit. i', intro: 'Jede Person bekommt nur die Rechte, die sie braucht – und verliert sie beim Austritt sofort.' },
  { id: 'mfa', title: 'Mehr-Faktor-Anmeldung und sichere Kommunikation', ref: 'Art. 21 lit. j', intro: 'Ein Passwort allein reicht nicht mehr. Und im Notfall braucht es einen zweiten Kommunikationsweg.' },
];

export const QUESTIONS: Question[] = [
  // Governance
  { id: 'gov1', area: 'gov', weight: 3, effort: 'gering', policy: 'infosec', text: 'Hat die Geschäftsführung Ziele und Verantwortliche für Informationssicherheit schriftlich festgelegt?', help: 'Zum Beispiel in einer unterschriebenen Informationssicherheits-Richtlinie, die eine verantwortliche Person benennt.', todo: 'Informationssicherheits-Richtlinie beschließen und eine verantwortliche Person benennen' },
  { id: 'gov2', area: 'gov', weight: 2, effort: 'gering', text: 'Hat die Geschäftsführung in den letzten 12 Monaten eine Cybersicherheits-Schulung besucht?', help: 'Das NISG 2026 verlangt Schulungen für die Leitung. Angebote gibt es z. B. über WKO, WIFI oder KSÖ.', todo: 'Cybersicherheits-Schulung für die Geschäftsführung buchen (z. B. WIFI, KSÖ)' },
  { id: 'gov3', area: 'gov', weight: 1, effort: 'gering', text: 'Wird die Geschäftsführung mindestens einmal im Jahr über den Stand der IT-Sicherheit informiert?', help: 'Ein kurzer Bericht von IT-Betreuer oder verantwortlicher Person genügt: Was ist passiert, was ist offen?', todo: 'Jährlichen Sicherheitsbericht an die Geschäftsführung einführen' },
  // Risiko
  { id: 'risk1', area: 'risk', weight: 3, effort: 'mittel', text: 'Gibt es eine aktuelle Liste aller wichtigen Geräte, Programme und Cloud-Dienste?', help: 'PCs, Laptops, Handys, Server, Kassen, Steuerungen, Software und Online-Dienste – mit verantwortlicher Person.', todo: 'Inventarliste aller Geräte, Programme und Cloud-Dienste erstellen' },
  { id: 'risk2', area: 'risk', weight: 3, effort: 'mittel', policy: 'infosec', text: 'Haben Sie bewertet, welche Ausfälle oder Angriffe Ihren Betrieb am stärksten treffen würden?', help: 'Eine einfache Tabelle reicht: Was kann passieren, wie wahrscheinlich, wie schlimm, was tun wir dagegen?', todo: 'Einfache Risikoanalyse durchführen (Tabelle: Gefahr, Wahrscheinlichkeit, Schaden, Maßnahme)' },
  { id: 'risk3', area: 'risk', weight: 1, effort: 'gering', text: 'Wird die Risikobewertung mindestens jährlich oder nach größeren Änderungen überarbeitet?', help: 'Neue Software, neuer Standort oder ein Vorfall sind Anlässe zur Überprüfung.', todo: 'Termin für die jährliche Überprüfung der Risikoanalyse festlegen' },
  // Incident
  { id: 'inc1', area: 'incident', weight: 3, effort: 'gering', policy: 'incident', text: 'Gibt es einen schriftlichen Ablauf, was bei einem IT-Sicherheitsvorfall zu tun ist?', help: 'Wer wird angerufen, welche Geräte werden vom Netz getrennt, wer entscheidet?', todo: 'Notfallablauf für IT-Sicherheitsvorfälle festlegen und aushängen' },
  { id: 'inc2', area: 'incident', weight: 3, effort: 'gering', policy: 'incident', text: 'Wissen Sie, wie und in welchen Fristen erhebliche Vorfälle gemeldet werden müssen?', help: 'Frühwarnung binnen 24 Stunden, Meldung binnen 72 Stunden, Abschlussbericht nach einem Monat – an das zuständige CSIRT.', todo: 'Meldewege und Fristen (24 h / 72 h / 1 Monat) dokumentieren, Kontaktdaten CSIRT hinterlegen' },
  { id: 'inc3', area: 'incident', weight: 2, effort: 'gering', text: 'Wissen alle Mitarbeitenden, wem sie einen Verdacht (z. B. eine verdächtige E-Mail) sofort melden?', help: 'Eine Telefonnummer am Aushang oder im Intranet genügt.', todo: 'Meldestelle für Verdachtsfälle allen Mitarbeitenden bekanntgeben' },
  { id: 'inc4', area: 'incident', weight: 1, effort: 'mittel', text: 'Werden Vorfälle und Beinahe-Vorfälle dokumentiert und ausgewertet?', help: 'Ein einfaches Vorfallsprotokoll hilft, aus Fehlern zu lernen und Meldungen nachzuweisen.', todo: 'Vorfallsprotokoll einführen' },
  // BCM
  { id: 'bcm1', area: 'bcm', weight: 3, effort: 'mittel', policy: 'backup', text: 'Werden alle wichtigen Daten automatisch und regelmäßig gesichert?', help: 'Mindestens täglich für Geschäftsdaten. Auch Cloud-Dienste und Steuerungsprogramme nicht vergessen.', todo: 'Automatische tägliche Datensicherung aller wichtigen Daten einrichten' },
  { id: 'bcm2', area: 'bcm', weight: 3, effort: 'mittel', policy: 'backup', text: 'Liegt mindestens eine Sicherung getrennt vom Netzwerk oder unveränderbar (offline/immutable)?', help: 'Erpressungstrojaner verschlüsseln auch angeschlossene Sicherungen. Faustregel 3-2-1: 3 Kopien, 2 Medien, 1 außer Haus.', todo: 'Offline- bzw. unveränderbare Sicherungskopie außer Haus einrichten (3-2-1-Regel)' },
  { id: 'bcm3', area: 'bcm', weight: 3, effort: 'gering', policy: 'backup', text: 'Wurde in den letzten 12 Monaten getestet, ob sich Daten aus der Sicherung tatsächlich wiederherstellen lassen?', help: 'Eine Sicherung, die nie getestet wurde, ist nur eine Hoffnung.', todo: 'Wiederherstellungstest durchführen und protokollieren' },
  { id: 'bcm4', area: 'bcm', weight: 2, effort: 'mittel', text: 'Gibt es einen Plan, wie der Betrieb bei IT-Ausfall einige Tage weiterarbeiten kann?', help: 'Zum Beispiel Papierformulare, Notfall-Kassa, ausgedruckte Kontaktlisten und klare Prioritäten.', todo: 'Notbetriebsplan für mehrtägigen IT-Ausfall erstellen' },
  // Supply
  { id: 'sup1', area: 'supply', weight: 2, effort: 'gering', text: 'Wissen Sie, welche Dienstleister Zugriff auf Ihre Systeme oder Daten haben?', help: 'IT-Betreuer, Fernwartung von Maschinen, Kassenhändler, Cloud-Anbieter, Steuerberater.', todo: 'Liste aller Dienstleister mit Zugriff auf Systeme oder Daten erstellen' },
  { id: 'sup2', area: 'supply', weight: 2, effort: 'mittel', text: 'Sind mit diesen Dienstleistern Sicherheitsanforderungen vertraglich vereinbart?', help: 'Etwa: Meldung von Vorfällen, MFA für Fernzugriffe, Datenverarbeitungsvertrag nach DSGVO.', todo: 'Sicherheitsklauseln in Verträge mit Dienstleistern aufnehmen' },
  { id: 'sup3', area: 'supply', weight: 3, effort: 'gering', policy: 'access', text: 'Sind Fernwartungszugänge nur bei Bedarf freigeschaltet und abgesichert?', help: 'Dauerhaft offene Fernwartung (z. B. TeamViewer mit festem Passwort) ist ein häufiger Einbruchsweg.', todo: 'Fernwartung nur auf Anfrage freischalten, mit MFA absichern und protokollieren' },
  // Dev
  { id: 'dev1', area: 'dev', weight: 3, effort: 'gering', text: 'Werden Updates für Betriebssysteme, Programme und Router zeitnah eingespielt?', help: 'Automatische Updates aktivieren; kritische Lücken binnen weniger Tage schließen.', todo: 'Automatische Updates aktivieren und monatliche Update-Kontrolle einführen' },
  { id: 'dev2', area: 'dev', weight: 2, effort: 'hoch', text: 'Werden Geräte ohne Hersteller-Support (z. B. alte Windows-Versionen) ersetzt oder abgeschottet?', help: 'Alte Steuerungs-PCs sind oft unvermeidbar – dann gehören sie in ein eigenes Netz ohne Internet.', todo: 'Veraltete Systeme ersetzen oder in getrenntes Netz verschieben' },
  { id: 'dev3', area: 'dev', weight: 1, effort: 'gering', text: 'Wird bei der Anschaffung neuer IT auf Sicherheit geachtet?', help: 'Fragen Sie z. B.: Wie lange gibt es Updates? Gibt es MFA? Wo liegen die Daten?', todo: 'Sicherheits-Checkliste für IT-Anschaffungen verwenden' },
  // Eff
  { id: 'eff1', area: 'eff', weight: 2, effort: 'mittel', text: 'Werden die Sicherheitsmaßnahmen regelmäßig überprüft (z. B. jährlicher Check durch IT-Betreuer)?', help: 'Diese Gap-Analyse jährlich zu wiederholen ist ein guter Anfang.', todo: 'Jährlichen Sicherheits-Check einplanen (z. B. diese Analyse wiederholen)' },
  { id: 'eff2', area: 'eff', weight: 1, effort: 'hoch', text: 'Wurde Ihre IT schon einmal von außen auf Schwachstellen geprüft?', help: 'Z. B. ein Schwachstellen-Scan oder Penetrationstest durch einen externen Anbieter.', todo: 'Externen Schwachstellen-Scan beauftragen' },
  // Hygiene
  { id: 'hyg1', area: 'hygiene', weight: 3, effort: 'gering', text: 'Werden alle Mitarbeitenden mindestens jährlich zu Phishing und sicherem Verhalten geschult?', help: 'Kurze Schulungen von 30 Minuten wirken. Auch Aushilfen und Saisonkräfte einbeziehen.', todo: 'Jährliche Kurzschulung zu Phishing und sicherem Verhalten für alle einführen' },
  { id: 'hyg2', area: 'hygiene', weight: 2, effort: 'gering', policy: 'access', text: 'Gibt es Regeln für sichere Passwörter und wird ein Passwort-Manager verwendet?', help: 'Lange Passphrasen, kein Mehrfachgebrauch, keine Zettel am Bildschirm.', todo: 'Passwortregeln festlegen und Passwort-Manager einführen' },
  { id: 'hyg3', area: 'hygiene', weight: 2, effort: 'gering', text: 'Sind Virenschutz und Firewall auf allen Geräten aktiv?', help: 'Auch auf Kassen-PCs und Laptops von Außendienst und Baustelle.', todo: 'Virenschutz und Firewall auf allen Geräten aktivieren und kontrollieren' },
  { id: 'hyg4', area: 'hygiene', weight: 2, effort: 'mittel', text: 'Ist das Gäste- bzw. Besucher-WLAN vom Betriebsnetz getrennt?', help: 'Gäste, private Handys und Steuerungen gehören in getrennte Netze.', todo: 'Gäste-WLAN und Betriebsnetz trennen' },
  // Crypto
  { id: 'cry1', area: 'crypto', weight: 2, effort: 'gering', text: 'Sind Laptops, Handys und USB-Sticks verschlüsselt?', help: 'BitLocker (Windows), FileVault (Mac) und Geräteverschlüsselung bei Smartphones sind meist schon eingebaut.', todo: 'Festplattenverschlüsselung auf Laptops und mobilen Geräten aktivieren' },
  { id: 'cry2', area: 'crypto', weight: 2, effort: 'gering', text: 'Erfolgen Fernzugriffe und Datenübertragungen verschlüsselt (VPN, HTTPS)?', help: 'Webshop und Portale nur mit HTTPS, Fernzugriff nur per VPN.', todo: 'Fernzugriffe nur über VPN, Webdienste nur über HTTPS erlauben' },
  { id: 'cry3', area: 'crypto', weight: 1, effort: 'mittel', policy: 'backup', text: 'Werden Sicherungen, die außer Haus liegen, verschlüsselt?', help: 'Ein verlorenes Backup-Laufwerk darf keine lesbaren Kundendaten enthalten.', todo: 'Sicherungen außer Haus verschlüsseln' },
  // Access
  { id: 'acc1', area: 'access', weight: 3, effort: 'gering', policy: 'access', text: 'Hat jede Person ein eigenes Benutzerkonto (keine geteilten Zugänge)?', help: 'Geteilte Konten wie „kassa“ oder „buero“ machen Missbrauch unsichtbar.', todo: 'Geteilte Konten abschaffen, persönliche Benutzerkonten anlegen' },
  { id: 'acc2', area: 'access', weight: 3, effort: 'gering', policy: 'access', text: 'Werden Zugänge beim Austritt von Mitarbeitenden sofort gesperrt?', help: 'Eine Austritts-Checkliste hilft: Konten, Schlüssel, Handy, Cloud-Zugänge.', todo: 'Austritts-Checkliste einführen (Konten sperren, Geräte zurück)' },
  { id: 'acc3', area: 'access', weight: 2, effort: 'gering', policy: 'access', text: 'Arbeiten Mitarbeitende im Alltag ohne Administratorrechte?', help: 'Administratorrechte nur für die IT und nur bei Bedarf.', todo: 'Administratorrechte im Alltag entziehen' },
  { id: 'acc4', area: 'access', weight: 1, effort: 'gering', policy: 'access', text: 'Werden Berechtigungen mindestens jährlich überprüft?', help: 'Wer hat noch Zugriff auf die Buchhaltung, das Kassensystem, den Server?', todo: 'Jährliche Überprüfung der Berechtigungen einführen' },
  // MFA
  { id: 'mfa1', area: 'mfa', weight: 3, effort: 'gering', policy: 'access', text: 'Ist für E-Mail, Cloud-Dienste und Fernzugriffe eine Mehr-Faktor-Anmeldung (MFA) aktiv?', help: 'Zusätzlich zum Passwort ein Code per App oder Sicherheitsschlüssel. Verhindert die meisten Kontoübernahmen.', todo: 'Mehr-Faktor-Anmeldung für E-Mail, Cloud und Fernzugriff aktivieren' },
  { id: 'mfa2', area: 'mfa', weight: 2, effort: 'gering', policy: 'incident', text: 'Gibt es einen Notfall-Kommunikationsweg, falls E-Mail und Telefonanlage ausfallen?', help: 'Ausgedruckte Telefonliste, private Handynummern, eine Messenger-Gruppe.', todo: 'Notfall-Kontaktliste auf Papier und alternativen Kommunikationsweg festlegen' },
  { id: 'mfa3', area: 'mfa', weight: 1, effort: 'gering', text: 'Werden Zahlungs- oder Kontoänderungen per E-Mail immer telefonisch rückbestätigt?', help: 'Schutz vor „CEO-Betrug“ und gefälschten Rechnungen mit geänderter IBAN.', todo: 'Rückruf-Regel für Zahlungs- und Kontoänderungen einführen' },
];
