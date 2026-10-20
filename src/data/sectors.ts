// Branchen inkl. Zuordnung zu den Anhängen der NIS-2-Richtlinie (EU 2022/2555),
// die das NISG 2026 übernimmt. "none" = grundsätzlich nicht erfasst.
export type Annex = 'I' | 'II' | 'none';

export interface Sector {
  id: string;
  name: string;
  annex: Annex;
  /** Kurzerklärung, warum (nicht) erfasst – in einfacher Sprache. */
  scopeNote: string;
  /** Typische IT/OT-Systeme, die in Richtlinien als Beispiele erscheinen. */
  systems: string[];
  /** Besonders kritische Daten. */
  data: string[];
  /** Typische Dienstleister/Lieferanten mit IT-Bezug. */
  suppliers: string[];
  /** Was bei einem Ausfall zuerst wieder laufen muss. */
  critical: string;
}

export const SECTORS: Sector[] = [
  {
    id: 'brauerei',
    name: 'Brauerei / Getränkeherstellung',
    annex: 'II',
    scopeNote:
      'Herstellung von Lebensmitteln und Getränken ist in Anhang II („Produktion, Verarbeitung und Vertrieb von Lebensmitteln“) genannt. Ab mittlerer Größe gilt Ihr Betrieb als „wichtige Einrichtung“.',
    systems: [
      'Sudhaus- und Gärkellersteuerung (SPS/Prozessleitsystem)',
      'Kühl- und Druckluftanlagen mit Fernwartung',
      'Abfüllanlage',
      'Warenwirtschaft und Biersteuer-Aufzeichnungen',
      'Webshop bzw. Gastro-Bestellportal',
    ],
    data: ['Rezepturen und Sudprotokolle', 'Kunden- und Gastronomie-Stammdaten', 'Biersteuer- und Buchhaltungsdaten'],
    suppliers: ['Anlagenbauer mit Fernwartungszugang', 'IT-Betreuer', 'Getränkelogistik', 'Webshop-Anbieter'],
    critical: 'Steuerung von Sudhaus, Gärung und Kühlung (Chargen dürfen nicht verderben)',
  },
  {
    id: 'lebensmittel',
    name: 'Bäckerei, Fleischerei, Lebensmittelproduktion',
    annex: 'II',
    scopeNote:
      'Industrielle Herstellung und Großhandel von Lebensmitteln fallen unter Anhang II. Ab mittlerer Größe: „wichtige Einrichtung“. Reiner Verkauf an Endkunden ist nicht erfasst.',
    systems: ['Backstraßen- bzw. Produktionssteuerung', 'Kühlhaus-Überwachung', 'Warenwirtschaft und Filial-Kassen', 'Rückverfolgbarkeit (HACCP-Dokumentation)'],
    data: ['Rezepturen', 'HACCP- und Chargendaten', 'Filial- und Lieferantendaten'],
    suppliers: ['Maschinenhersteller mit Fernwartung', 'Kassenanbieter', 'IT-Betreuer', 'Logistik'],
    critical: 'Produktion und Kühlkette für den nächsten Liefertag',
  },
  {
    id: 'gastro',
    name: 'Gastronomie',
    annex: 'none',
    scopeNote:
      'Gastronomie ist im NISG 2026 nicht direkt erfasst. Große Lieferanten oder Kunden können aber NIS-2-Anforderungen vertraglich an Sie weitergeben – und die Maßnahmen schützen Ihren Betrieb ohnehin.',
    systems: ['Registrierkasse (RKSV) und Kartenterminal', 'Online-Reservierung', 'Gäste-WLAN', 'Dienstplan- und Lohnsoftware'],
    data: ['Reservierungen und Gästedaten', 'Kassen- und DEP-Daten', 'Personaldaten'],
    suppliers: ['Kassenhändler', 'Reservierungsplattform', 'Zahlungsdienstleister', 'Steuerberater'],
    critical: 'Kassa und Kartenzahlung',
  },
  {
    id: 'hotel',
    name: 'Hotellerie / Beherbergung',
    annex: 'none',
    scopeNote:
      'Beherbergung ist im NISG 2026 nicht direkt erfasst. Buchungsplattformen und Konzernpartner verlangen aber zunehmend Sicherheitsnachweise.',
    systems: ['Hotelsoftware (PMS) und Channel-Manager', 'Schließ- und Zutrittssystem', 'Gäste-WLAN', 'Kassa und Kartenterminal'],
    data: ['Gästedaten inkl. Ausweis- und Zahlungsdaten', 'Buchungen', 'Personaldaten'],
    suppliers: ['PMS-Anbieter', 'Buchungsplattformen', 'Zahlungsdienstleister', 'IT-Betreuer'],
    critical: 'Hotelsoftware für Check-in, Zimmerschlüssel und Abrechnung',
  },
  {
    id: 'handwerk',
    name: 'Handwerk / Baugewerbe',
    annex: 'none',
    scopeNote:
      'Handwerksbetriebe sind meist nicht direkt erfasst. Arbeiten Sie aber für Energieversorger, Spitäler oder Gemeinden, werden NIS-2-Anforderungen oft über Verträge an Sie weitergegeben.',
    systems: ['Auftrags- und Rechnungssoftware', 'CAD/Planungssoftware', 'Smartphones und Tablets auf der Baustelle', 'Cloud-Speicher für Pläne und Fotos'],
    data: ['Angebote, Pläne und Kundendaten', 'Zugangscodes/Schlüssel von Kunden', 'Lohn- und Buchhaltungsdaten'],
    suppliers: ['Branchensoftware-Anbieter', 'IT-Betreuer', 'Steuerberater', 'Großhändler-Portale'],
    critical: 'Auftrags- und Rechnungssoftware',
  },
  {
    id: 'produktion',
    name: 'Herstellung (Maschinen, Elektro, Fahrzeuge)',
    annex: 'II',
    scopeNote:
      'Herstellung von Elektronik, elektrischen Ausrüstungen, Maschinen und Fahrzeugen ist in Anhang II genannt. Ab mittlerer Größe: „wichtige Einrichtung“.',
    systems: ['CNC- und Fertigungssteuerung', 'ERP/PPS', 'CAD/CAM', 'Fernwartungszugänge für Maschinen'],
    data: ['Konstruktionsdaten', 'Kundenaufträge', 'Qualitätsnachweise'],
    suppliers: ['Maschinenhersteller', 'ERP-Anbieter', 'IT-Betreuer', 'Logistik'],
    critical: 'Fertigungssteuerung und ERP',
  },
  {
    id: 'logistik',
    name: 'Transport / Logistik',
    annex: 'I',
    scopeNote:
      'Verkehr ist in Anhang I (Sektoren mit hoher Kritikalität) genannt. Große Betriebe sind „wesentliche“, mittlere „wichtige Einrichtungen“. Post- und Kurierdienste fallen unter Anhang II.',
    systems: ['Tourenplanung und Telematik', 'Lagerverwaltung (LVS)', 'Fahrzeug-Bordgeräte', 'Kundenportal/Sendungsverfolgung'],
    data: ['Sendungs- und Kundendaten', 'Fahrer- und Personaldaten', 'Tourendaten'],
    suppliers: ['Telematik-Anbieter', 'Subfrachtführer', 'IT-Betreuer', 'Cloud-Anbieter'],
    critical: 'Tourenplanung und Lagerverwaltung',
  },
  {
    id: 'abfall',
    name: 'Abfallwirtschaft',
    annex: 'II',
    scopeNote: 'Abfallbewirtschaftung ist in Anhang II genannt. Ab mittlerer Größe: „wichtige Einrichtung“.',
    systems: ['Wiege- und Annahmesoftware', 'Tourenplanung', 'Anlagensteuerung (Sortierung/Verbrennung)', 'eRAS/EDM-Meldungen'],
    data: ['Begleitscheine und Meldedaten', 'Kundendaten', 'Wiegedaten'],
    suppliers: ['Anlagenbauer', 'Softwareanbieter', 'IT-Betreuer'],
    critical: 'Annahme, Verwiegung und Anlagensteuerung',
  },
  {
    id: 'energie',
    name: 'Energie (z. B. Kleinwasserkraft, Nahwärme)',
    annex: 'I',
    scopeNote:
      'Energie ist in Anhang I genannt. Große Betriebe sind „wesentliche“, mittlere „wichtige Einrichtungen“.',
    systems: ['Leit- und Fernwirktechnik (SCADA)', 'Zählerdaten und Abrechnung', 'Fernwartungszugänge'],
    data: ['Netz- und Anlagendaten', 'Kunden- und Verbrauchsdaten'],
    suppliers: ['Leittechnik-Anbieter', 'Netzbetreiber', 'IT-Betreuer'],
    critical: 'Anlagensteuerung und Einspeisung',
  },
  {
    id: 'gesundheit',
    name: 'Gesundheit (Labor, Ordination, Pflege)',
    annex: 'I',
    scopeNote:
      'Gesundheitsdienstleister sind in Anhang I genannt. Große Betriebe sind „wesentliche“, mittlere „wichtige Einrichtungen“.',
    systems: ['Praxis-/Pflegesoftware', 'Medizingeräte im Netzwerk', 'e-card-System'],
    data: ['Gesundheitsdaten (besonders schutzwürdig)', 'Abrechnungsdaten'],
    suppliers: ['Softwarehersteller', 'Medizintechnik', 'IT-Betreuer'],
    critical: 'Patienten- bzw. Bewohnerdokumentation',
  },
  {
    id: 'it',
    name: 'IT-Dienstleister / Managed Services',
    annex: 'I',
    scopeNote:
      'Verwaltung von IKT-Diensten (Managed Service Provider) ist in Anhang I genannt. Große Betriebe sind „wesentliche“, mittlere „wichtige Einrichtungen“.',
    systems: ['Fernwartungs- und RMM-Werkzeuge', 'Kundenumgebungen', 'Ticketsystem', 'Cloud-Infrastruktur'],
    data: ['Zugangsdaten zu Kundensystemen', 'Kundendokumentation', 'Quellcode'],
    suppliers: ['Cloud-Anbieter', 'Software-Hersteller', 'Rechenzentrum'],
    critical: 'Fernwartungsplattform und Kundenzugänge',
  },
  {
    id: 'handel',
    name: 'Handel',
    annex: 'none',
    scopeNote:
      'Einzelhandel ist nicht direkt erfasst (Ausnahme: Lebensmittelgroßhandel, Anhang II). Lieferanten und Banken stellen aber oft Sicherheitsanforderungen.',
    systems: ['Kassen und Kartenterminals', 'Warenwirtschaft', 'Webshop'],
    data: ['Kunden- und Bestelldaten', 'Zahlungsdaten', 'Lieferantenkonditionen'],
    suppliers: ['Kassenanbieter', 'Webshop-Hosting', 'Zahlungsdienstleister', 'IT-Betreuer'],
    critical: 'Kassa und Webshop',
  },
  {
    id: 'sonstige',
    name: 'Sonstige Branche',
    annex: 'none',
    scopeNote:
      'Ob Ihre Branche erfasst ist, hängt von der genauen Tätigkeit ab. Prüfen Sie die Anhänge I und II des NISG 2026 oder fragen Sie Ihre Wirtschaftskammer.',
    systems: ['Büro-PCs und Laptops', 'E-Mail und Cloud-Dienste', 'Branchensoftware'],
    data: ['Kundendaten', 'Buchhaltungs- und Personaldaten'],
    suppliers: ['IT-Betreuer', 'Softwareanbieter', 'Steuerberater'],
    critical: 'E-Mail und Branchensoftware',
  },
];

export function getSector(id: string): Sector {
  return SECTORS.find((s) => s.id === id) ?? SECTORS[SECTORS.length - 1];
}
