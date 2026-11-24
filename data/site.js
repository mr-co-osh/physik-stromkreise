/* Inhalte der Hauptseite: Reihe Stromkreise (Physik 9/10)
   Die Seite wächst mit dem Unterricht: Es steht nur, was bis zur aktuellen Doppelstunde dran war.
   Typen: zuordnen · rechnen · quiz · schaetzen · sim · extern
   n: 'basis' | 'stern' | 'beide';  ein: true = auch im Modus „Einstieg“;  href leer = in Arbeit */
window.SITE = {
  prefix: 'phy-edy',
  fach: 'Physik 9/10', rahmen: 'Rahmenthema 1', titel: 'Stromkreise',
  /* Fachbegriffe, die in Übungen fett hervorgehoben werden (aus dem Glossar) */
  begriffe: ['Stromkreis', 'Spannungsquelle', 'Schaltplan', 'Schaltzeichen', 'Schalter', 'Reihenschaltung', 'Parallelschaltung',
    'unverzweigt', 'verzweigt', 'Verzweigungspunkt', 'Kurzschluss'],
  leitfrage: 'Warum fliegt die Sicherung raus, wenn Wasserkocher, Föhn und Heizlüfter an derselben Mehrfachsteckdose hängen?',
  phasen: [
    { n: 1, name: 'Schaltungen und Stromstärke', ds: 'DS 1–3', anzahl: 3 },
    { n: 2, name: 'Spannung', ds: 'DS 4–5', anzahl: 2 },
    { n: 3, name: 'Widerstand', ds: 'DS 6–7', anzahl: 2 },
    { n: 4, name: 'Leistung und Sicherheit', ds: 'DS 8–10', anzahl: 3 }
  ],
  werkzeuge: [
    { id: 'glossar', titel: 'Glossar', text: 'Alle Fachwörter mit Erklärung und Beispielsatz', href: 'glossar.html' },
    { id: 'fachwort', titel: 'Fachwort-Trainer', text: 'Vokabelkasten mit fünf Fächern', href: 'fachwort-trainer.html' },
    { id: 'checkliste', titel: 'Checkliste', text: 'Bin ich fit für die Lernkontrolle?', href: 'checkliste.html' }
  ],
  bereiche: [
    { id: 'schaltungen', phase: 1, ds: 'DS 1', titel: 'Reihe & parallel',
      text: 'Stromkreise nach Schaltplan bauen, Reihenschaltung und Parallelschaltung unterscheiden, Schaltpläne lesen',
      items: [] }
  ]
};
